# Генеральный план здоровья и модульности проекта `popover-trail`

Документ представляет собой **комплексный мастер-план архитектурного здоровья, модульности и чистоты кода для всех подсистем репозитория `popover-trail`**.

План построен по модульному принципу: каждый пункт оформлен в стандарте **Теория** (архитектурное обоснование и принципы) → **Изменения** (затрагиваемые файлы, контракты, сигнатуры) → **Тест** (критерии верификации и тесты).

---

## Содержание

1. [Диагностика и глобальная карта системы](#1-диагностика-и-глобальная-карта-системы)
2. [Категория 1: Ядро хранилища и логика состояния (`src/lib/popover/store`)](#категория-1-ядро-хранилища-и-логика-состояния)
3. [Категория 2: React-слой, хуки и реактивность (`src/lib/popover/hooks` & `context`)](#категория-2-react-слой-хуки-и-реактивность)
4. [Категория 3: UI-компоненты и Compound Architecture (`src/lib/popover/components`)](#категория-3-ui-компоненты-и-compound-architecture)
5. [Категория 4: Утилиты, алгоритмы и структуры данных (`src/lib/popover/utils`)](#категория-4-утилиты-алгоритмы-и-структуры-данных)
6. [Категория 5: Типизация, интерфейсы и DX (`src/lib/popover/types`)](#категория-5-типизация-интерфейсы-и-dx)
7. [Категория 6: Бандлинг, модульный экспорт и оптимизация размера](#категория-6-бандлинг-модульный-экспорт-и-оптимизация-размера)
8. [Категория 7: Архитектурные гарантии, тестирование и CI (Fitness Functions)](#категория-7-архитектурные-гарантии-тестирование-и-ci)
9. [Категория 8: Документация и база архитектурных решений (ADR)](#категория-8-документация-и-база-архитектурных-решений)
10. [9. Протокол и регламент безупречного исполнения (Execution Protocol & Quality Gates)](#9-протокол-и-регламент-безупречного-исполнения-execution-protocol--quality-gates)
11. [10. Сводная матрица работ и дорожная карта внедрения](#10-сводная-матрица-работ-и-дорожная-карта-внедрения)

---

## 1. Диагностика и глобальная карта системы

Оценка кодовой базы: **~8/10**.  
Проект обладает высоким качеством типов, 581 тестом, чистыми редюсерами и DAG-ядром. Основной потенциал роста — устранение сцепленности логики с побочными эффектами (side effects), изоляция слоев, уменьшение размера бандла и автоматизация контроля границ.

### Архитектурная модель слоёв:
```
┌────────────────────────────────────────────────────────────────────────┐
│ СЛОЙ 4: UI-компоненты (PopoverRoot, PopoverCard, PopoverPortal, etc.)  │
├────────────────────────────────────────────────────────────────────────┤
│ СЛОЙ 3: React-хуки & Контекст (usePopover, useDragAndDrop, Provider)   │
├────────────────────────────────────────────────────────────────────────┤
│ СЛОЙ 2: Headless Store (Zustand, Slices, CQRS, FSM Observer, Events)   │
├────────────────────────────────────────────────────────────────────────┤
│ СЛОЙ 1: Core Kernel (Чистые Редюсеры, DAG-граф, Result-монада, Math)   │
└────────────────────────────────────────────────────────────────────────┘
```
**Главное правило зависимостей:** Каждый слой может зависеть только от нижележащих слоев. Импорты снизу вверх (например, React в Store Kernel или Store в Utils) строго запрещены.

---

## Категория 1: Ядро хранилища и логика состояния

### 1.1. Паттерн «Чистый план + Исполнитель эффектов» (Functional Core / Imperative Shell)
* **Теория:** Сцепленность вычислений и побочных эффектов (Command-Effect Coupling). Сейчас в `sliceTrail.ts` и `slicePinning.ts` функции одновременно вычисляют новое состояние, мутируют внешний DAG, запускают таймеры, отменяют fetch-запросы и вызывают пользовательские колбэки. Это затрудняет тестирование и провоцирует гонки состояний.
* **Изменения:**
  1. В `reducers/` вынести чистые функции планирования:
     ```ts
     export interface StateTransitionPlan<TData, TPopoverKey extends string> {
       readonly nextPatch: StatePatch<TData, any, TPopoverKey>;
       readonly effects: ReadonlyArray<
         | { type: 'ABORT_IN_FLIGHT'; keys: readonly TPopoverKey[] }
         | { type: 'PRUNE_DAG'; keys: readonly TPopoverKey[] }
         | { type: 'SCHEDULE_TIMER'; keys: readonly TPopoverKey[]; duration: number }
         | { type: 'CANCEL_TIMERS'; keys: readonly TPopoverKey[] }
         | { type: 'NOTIFY_USER_CALLBACK'; key: TPopoverKey; callbackType: 'onClose' | 'onPin' }
         | { type: 'EMIT_EVENT'; event: PopoverStoreEvent<TData> }
       >;
     }
     ```
  2. В `SliceContext` внедрить единый раннер эффектов `runEffects(effects)`.
  3. Экшены в слайсах превращаются в 3 строки: `const plan = planAction(get(), args); set(plan.nextPatch); ctx.runEffects(plan.effects);`.
* **Тест:** 100% синхронные unit-тесты чистых функций планирования в `reducers/*.test.ts` без вызова таймеров и без моков.

### 1.2. Конвейер асинхронного резолвера через цепочку Middleware
* **Теория:** Single Responsibility Principle / Onion Architecture. В `resolver/pipelineExecution.ts` монолитная функция на 300 строк смешивает L1-кэш, AbortController, дедупликацию in-flight промисов, зонд сигнатур и мутацию статусов.
* **Изменения:**
  1. Разбить конвейер на независимые middleware:
     ```ts
     // store/resolver/pipelineMiddleware.ts
     export type ResolverMiddleware<TData, TContext> = (
       next: (params: ResolverParams<TContext>) => Promise<TData>,
     ) => (params: ResolverParams<TContext>) => Promise<TData>;
     ```
  2. Изолированные звенья: `withL1Cache`, `withInFlightDeduplication`, `withAbortSignal`, `withSignatureAdapter`, `withErrorNormalization`.
* **Тест:** `pipelineExecution.test.ts` — независимое тестирование каждого звена конвейера в изоляции.

### 1.3. Внедрение FSM как теневой регистратуры (Shadow Invariant Watchdog)
* **Теория:** Runtime Invariant Verification. Движок FSM (`fsm.ts`) полностью протестирован, но не подключен к стору. Вместо рискованного переписывания ядра FSM подключается как наблюдатель (Observer) за потоком событий стора.
* **Изменения:**
  1. Создать `store/fsmRegistry.ts` (`createPopoverFSMRegistry`).
  2. Добавить аддитивное событие `transition_end { keys }` при завершении анимаций выхода.
  3. В dev-режиме колбэк `onIllegalTransition` логирует любые гонки (например, `resolve_success` после закрытия).
  4. Добавить `destroyAll()` в интерфейс реестра для очистки памяти.
* **Тест:** `fsmRegistry.test.ts` — проверка детекции нелегальных переходов, O(1) чтение битовых масок `getStatusBit`, очистка при `destroy()`.

### 1.4. Декомпозиция `sliceConfig` → `sliceConfig` + `sliceInteraction`
* **Теория:** Common Closure Principle / Separation of Concerns. `sliceConfig.ts` смешивает чистые реактивные сеттеры конфигурации с интерактивной hover-логикой и FSM-валидацией.
* **Изменения:**
  1. Вынести `hoverEnter`, `hoverLeave`, `setTransitionStatus`, `setButtonControls` в `store/slices/sliceInteraction.ts`.
  2. В `sliceConfig.ts` оставить только чистые сеттеры (`setContext`, `setResolveData`, `setCollisionConfig`, etc.).
* **Тест:** Раздельные unit-тесты `sliceConfig.test.ts` и `sliceInteraction.test.ts` (оба файла $\le 200$ строк).

### 1.5. Симметрия и изоляция шин (CQRS & EventBus)
* **Теория:** Principle of Least Astonishment & Instance Isolation.
  - Сейчас `commandBus.dispose()` неявно уничтожает весь стор (`actions.destroy()`).
  - `dispatchStoreEvent` неявно зеркалит события в `globalPopoverEventBus`, ломая изоляцию в micro-frontends.
* **Изменения:**
  1. В `CQRSBusesOptions` добавить `{ destroyOnDispose?: boolean }` (default `true` для обратной совместимости).
  2. В `PopoverEventBusOptions` добавить `{ mirrorToGlobalBus?: boolean }` (default `true`).
* **Тест:** `cqrs.test.ts` и `eventBus.test.ts` — проверка сохранения стора при `destroyOnDispose: false` и тишины глобальной шины при `mirrorToGlobalBus: false`.

### 1.6. Изоляция ошибок подписчиков (Subscriber Fault Isolation)
* **Теория:** Fault Isolation: исключение в пользовательском обработчике `subscribe(fn)` не должно прерывать цикл уведомлений других подписчиков и ломать батч-счётчики.
* **Изменения:**
  1. Внедрить `utils/safeCallback.ts` с безопасным запуском `invokeSubscriberSafely` через `try/catch` и `reportError`.
  2. Обернуть циклы нотификаций в `sliceSubscriptions.ts` и `eventBus.ts`.
* **Тест:** `sliceSubscriptions.test.ts` — сбой подписчика А не препятствует вызову подписчика B; счётчик батчинга возвращается в 0.

### 1.7. Схемная миграция и версионирование персистентности
* **Теория:** Schema Evolution & Robust Storage. Сериализованный в `localStorage` снимок может устареть при обновлении версии библиотеки.
* **Изменения:**
  1. В `persistenceCore.ts` внедрить `PersistedEnvelope<T>` с `schemaVersion: number`.
  2. При несовпадении версий — автоматический запуск мигратора либо безопасный сброс в дефолтное состояние без падения.
* **Тест:** `persistenceCore.test.ts` — чтение устаревших (v0) и поврежденных данных инициализирует чистый стор.

### 1.8. Атомарный батч-конфигуратор стора (`actions.updateConfig`)
* **Теория:** Atomic Batch Mutation vs Fine-Grained Churn. Сейчас в `sliceConfig.ts` каждое свойство меняется отдельным методом (`setBaseZIndex`, `setCascadeOffsetStep`, `setDebug`). При смене нескольких настроек генерируется N промежуточных патчей состояния.
* **Изменения:**
  1. В `sliceConfig.ts` добавить экшен `updateConfig(partialConfig: Partial<PopoverConfig>)`:
     ```ts
     updateConfig: (patch: Partial<PopoverConfig>) => {
       set((state) => ({ ...state, ...filterChangedConfigProps(state, patch) }));
     }
     ```
* **Тест:** `sliceConfig.test.ts` — передача пачки из 5 настроек приводит к ровно 1 вызову `set()` и 1 уведомлению подписчиков.

### 1.9. Обобщение пула таймеров `transitionScheduler` (`KeyedTimerPool`)
* **Теория:** DRY & Resource Encapsulation: `PopoverTransitionScheduler` содержит 3 дублирующиеся `Map` (`hoverTimers`, `exitTimers`, `batchTimers`) и трижды повторяет логику создания/отмены таймеров.
* **Изменения:**
  1. В `utils/` создать универсальный RAII-класс `KeyedTimerPool<TKey>`:
     ```ts
     export class KeyedTimerPool<TKey = string | number> {
       schedule(key: TKey, delay: number, callback: () => void): void;
       cancel(key: TKey): void;
       cancelAll(): void;
     }
     ```
  2. `transitionScheduler.ts` переписать через композицию экземпляров `KeyedTimerPool` (сокращение файла с 225 до ~70 строк).
* **Тест:** `transitionScheduler.test.ts` — проверка отмены, изоляции ключей и `cancelAll()` при уничтожении стора.

### 1.10. Слияние дублирующихся систем персистентности (`snapshotManager` $\to$ фасад `persistenceCore`)
* **Теория:** Single Source of Truth for State Persistence. `snapshotManager.ts` (317 строк) и `slicePersistence.ts` (133 строки) параллельно реализуют запись в storage, санитизацию данных и кросс-таб синхронизацию с разными версиями схем.
* **Изменения:**
  1. Оставить единое каноническое ядро в `store/persistence/persistenceCore.ts` с версионированным `PersistedEnvelope`.
  2. `snapshotManager.ts` превратить в тонкий фасад над `persistenceCore.ts` (удаление ~200 строк дублирующего кода).
* **Тест:** `snapshotManager.test.ts` и `persistenceCore.test.ts` — 100% совместимость снимков.

### 1.11. Разделение `storeControllers.ts` на `AbortRegistry` и `InFlightPromiseCache`
* **Теория:** Interface Segregation Principle. `ControllerManager` смешивает DOM Web API отмену (`AbortController`) и кэш асинхронных промисов (`inFlightPromises`).
* **Изменения:**
  1. Разделить на два специализированных класса: `AbortRegistry` (сетевая отмена) и `InFlightPromiseCache` (дедупликация промисов).
  2. Использовать их изолированно в звеньях Middleware резолвера.
* **Тест:** `storeControllers.test.ts` — независимые тесты отмены сигналов и кэширования промисов.

### 1.12. Соблюдение Single Level of Abstraction Principle (SLAP) и унифицированный пайплайн экшенов
* **Теория:** Single Level of Abstraction Principle (SLAP). Функция должна содержать инструкции строго одного концептуального уровня. Сейчас публичные методы слайсов (`openRoot`, `closeByKey`, `togglePin`) смешивают бизнес-логику высокого уровня (что сделать) с низкоуровневой технической рутиной (вызовы таймеров, манипуляции с DOM, вызовы колбэков и мутации словарей).
* **Архитектурный стандарт (3 уровня абстракции):**
  1. **Уровень 1: Оркестрация (`store/slices/slice*.ts`)** — отвечает на вопрос *«Что происходит?»*. Содержит только декларативный 4-шаговый пайплайн.
  2. **Уровень 2: Чистый расчет (`store/reducers/*.ts`)** — отвечает на вопрос *«Как меняется стейт и какие эффекты нужны?»*. Чистые функции `(State, Args) -> Plan` без сайд-эффектов.
  3. **Уровень 3: Исполнители эффектов (`store/effects/effectRunner.ts`)** — отвечает на вопрос *«Как связаться с браузером, сетью и DOM?»*. Выполняет `setTimeout`, `AbortController`, `window.focus`, `eventBus`.
* **Формула «4 шага экшена» (The 4-Step Pipeline):**
  Абсолютно каждый публичный экшен в сторе пишется по строгому шаблону:
  $$\text{Action} = \text{Boundary Guard} \longrightarrow \text{Pure Plan} \longrightarrow \text{State Commit} \longrightarrow \text{Effect Dispatch}$$
  ```ts
  // Пример эталонного экшена в slicePinning.ts
  togglePin: (key: string) => {
    const safeKey = assertValidPopoverKey(key);          // 1. Guard
    const plan = planTogglePinTransition(get(), safeKey); // 2. Pure Plan
    set(plan.nextPatch);                                  // 3. Commit
    ctx.runEffects(plan.effects);                         // 4. Dispatch Effects
  }
  ```
* **Жесткие правила кодовой базы:**
  1. В `slices/*.ts` **запрещены** любые `setTimeout`, `new AbortController`, прямой вызов пользовательских колбэков и DOM API.
  2. В `reducers/*.ts` **запрещены** вызовы `get()`, `set()`, `ctx`, обращение к `window`/`localStorage` и любые асинхронные промисы.
  3. Все эффекты объявляются как дискриминированные союзы DTO (запрещены анонимные функции в массиве эффектов):
     ```ts
     export type Effect<TData = unknown, TKey extends string = string> =
       | { readonly type: 'CANCEL_TIMERS'; readonly keys: readonly TKey[] }
       | { readonly type: 'SCHEDULE_TIMER'; readonly keys: readonly TKey[]; readonly duration: number }
       | { readonly type: 'ABORT_IN_FLIGHT'; readonly keys: readonly TKey[] }
       | { readonly type: 'PRUNE_DAG'; readonly keys: readonly TKey[] }
       | { readonly type: 'RECORD_HISTORY_SNAPSHOT' }
       | { readonly type: 'EMIT_STORE_EVENT'; readonly event: PopoverStoreEvent<TData> }
       | { readonly type: 'NOTIFY_USER_CALLBACK'; readonly key: TKey; readonly callbackType: 'onClose' | 'onPin'; readonly payload?: unknown };
     ```
  4. Юнит-тесты пишутся напрямую на чистые функции-планировщики в `reducers/*.test.ts`, работая синхронно и без моков.
* **Тест:** `sliceTrail.test.ts`, `slicePinning.test.ts`, `pinReducers.test.ts`, `trailReducers.test.ts` — 100% покрытие бизнес-логики без моков браузерного окружения.

### 1.13. Централизация производных вычислений (Single Point of Truth в `storeSelectors.ts`)
* **Теория:** Single Source of Truth for Derived State. Расчет понятий *«какой поповер верхний?»*, *«активен ли родительский узел?»*, *«какой максимальный z-index?»* сейчас частично дублируется в хуках `usePopoverCard`, `usePopoverTimeline` и селекторах.
* **Изменения:**
  1. Вынести все производные вычисления в чистые селекторы:
     - `selectTopmostEntry(state)`
     - `selectActiveTrail(state)`
     - `selectMaxZIndex(state)`
     - `selectIsCardTopmost(state, key)`
  2. Все хуки и компоненты подписываются исключительно на эти канонические селекторы.
* **Тест:** `storeSelectors.test.ts` — 100% покрытие селекторов производных данных.

### 1.14. Выделение структуры данных `RingBuffer<T>` из `history.ts` в `utils/ringBuffer.ts`
* **Теория:** Generic Data Structure Isolation. В `history.ts` реализация кольцевого буфера `RingBuffer<T>` смешана с доменной логикой снимков истории поповеров.
* **Изменения:**
  1. Вынести `RingBuffer<T>` в отдельный типизированный модуль `utils/ringBuffer.ts`.
  2. Добавить методы `.capacity`, `.isFull`, `.toReversedArray()`.
  3. Сократить `history.ts` на 70 строк.
* **Тест:** `ringBuffer.test.ts` — тестирование перезаписи хвоста при переполнении и изоляции ссылок.

### 1.15. Облегчение CQRS-слоя (`cqrs.ts`): типизированные фабричные прокси
* **Теория:** Boilerplate Elimination / Declarative Delegation. `PopoverQueryBus` (392 строки) вручную объявляет 30+ однотипных геттеров-делегатов к `storeSelectors.ts`.
* **Изменения:**
  1. Реализовать типизированную фабрику `createTypedQueryBus(getStoreState)` через `Proxy` или объектный маппер селекторов.
  2. Сократить `cqrs.ts` с 392 до ~80 строк при 100% сохранении автодополнения в TypeScript.
* **Тест:** `cqrs.test.ts` — эквивалентность вызовов всех геттеров и команд.

### 1.16. Декомпозиция FSM (`fsm.ts`) на типы, матрицу переходов и раннер
* **Теория:** Separation of State Machine Specification and Runtime Engine. Файл `fsm.ts` (535 строк) монолитно содержит битовые маски `FSMStatusBit`, 8 интерфейсов дискретных состояний, матрицу допустимых переходов и класс машины состояний.
* **Изменения:**
  1. Вынести типы и битовые маски в `store/fsm/fsmTypes.ts`.
  2. Вынести матрицу переходов в `store/fsm/fsmTransitions.ts`.
  3. Оставить в `store/fsm/PopoverCardFSM.ts` только компактный класс раннера переходов (~90 строк).
* **Тест:** `fsm.test.ts` — проверка валидности переходов между всеми состояниями `Idle`, `Hydrating`, `Resolved`, `Error`, `Unmounting`.

### 1.17. Унификация Microtask Coalescing в `storeBatching.ts` через `deferMicrotask`
* **Теория:** DRY Asynchronous Primitives & Centralized Logging. `storeBatching.ts` содержит собственный фоллбек для `queueMicrotask` с `Promise` и `requestAnimationFrame`, а ошибки выводит напрямую через `console.error`.
* **Изменения:**
  1. Использовать стандартную утилиту `utils/asyncUtils.ts: deferMicrotask`.
  2. Заменить `console.error` на `utils/logger.ts`.
* **Тест:** `storeBatching.test.ts` — коалесценция 10 синхронных мутаций в 1 микротаску.

### 1.18. Single-Pass сборщик активных ключей и срезов (`reducers/stackReducers.ts`)
* **Теория:** Algorithmic Efficiency & Reduced Allocation. `buildActiveTrailPatch`, `filterRecord` и `getActiveKeys` выполняют множественные проходы по коллекциям `floating`, `trail`, `offsets`, `pinnedStates` и `nestedHydrationRequestCounters`, создавая до 4 промежуточных `Set` на каждое открытие поповера.
* **Изменения:**
  1. Внедрить однопроходный сборщик `collectActiveStateSlices(state, nextTrail)`:
     - За один цикл формирует `activeKeys: Set<TPopoverKey>` и сразу отфильтрованные словари `offsets`, `pinnedStates`, `counters`.
     - При отсутствии удалённых ключей сохраняет неизменные ссылки на исходные объекты (Structural Sharing).
* **Тест:** `stackReducers.test.ts` — сохранение идентичности ссылок (`toBe`) при отсутствии удалений.

### 1.19. Каноническая фабрика создания узлов `TrailEntry` (`entryFactory.ts`)
* **Теория:** Factory Method Pattern / DRY Data Normalization. Функции `normalizeOriginalEntry`, очистка `parentKey`, копирование `originalRect` и дефолты опций дублируются в `openReducers.ts`, `sliceTrail.ts` и `slicePinning.ts`.
* **Изменения:**
  1. Создать чистую фабрику `store/reducers/entryFactory.ts`:
     - `createTrailEntryNode(raw, { isRoot, defaultPlacement })`
     - Инкапсулирует валидацию, очистку `parentKey === key` и заморозку базовых полей.
  2. Заменить дублирующиеся инлайн-нормализации в редюсерах на вызов фабрики.
* **Тест:** `entryFactory.test.ts` — 100% покрытие граничных условий нормализации карточек.

### 1.20. Единый топологический источник правды на базе `PopoverDAG` в `closeReducers.ts`
* **Теория:** Eliminating Parallel Code Paths. Функция `getAllDescendants` в `closeReducers.ts` содержит сложный запасной BFS-обход массивов `floating` и `trail`, дублирующий встроенный функционал графа `PopoverDAG`.
* **Изменения:**
  1. Сделать `PopoverDAG` обязательным источником топологии во всех операциях каскадного закрытия.
  2. Удалить 60 строк вспомогательного обхода массивов (`enqueueChildDescendants`), оставив чистый вызов `dag.getDescendantKeys(key)`.
* **Тест:** `closeReducers.test.ts` — проверка идентичности каскадного закрытия сложных разветвленных цепочек.

### 1.21. Zero-Allocation структурный шорт-серкит в `pinReducers.ts`
* **Теория:** State Mutation Short-Circuiting. При повторном клике на пин уже закрепленной карточки или открытии уже открытого поповера редюсеры генерировали новый объект `StatePatch`, вызывая холостые пересчеты селекторов Zustand.
* **Изменения:**
  1. В `pinReducers.ts` и `openReducers.ts` добавить предварительную проверку инварианта: если состояние карточки идентично, возвращать `EMPTY_OBJECT` без создания промежуточных патчей.
* **Тест:** `pinReducers.test.ts` — холостой вызов `togglePin` не приводит к мутации стора.

### 1.22. Изоляция транзакционного скоупа (`slices/sliceTransactions.ts`)
* **Теория:** Unit of Work Pattern. Логика атомарного отката при сбоях (Rollback) в `sliceTransactions.ts` смешана с методами истории.
* **Изменения:**
  1. Оформить транзакции в чистый класс `store/transactions/TransactionScope.ts`:
     ```ts
     const tx = new TransactionScope(store);
     try {
       tx.execute(...);
       tx.commit();
     } catch (err) {
       tx.rollback();
     }
     ```
  2. `sliceTransactions.ts` становится тонким связующим слоем на 25 строк.
* **Тест:** `sliceTransactions.test.ts` — проверка автоматического отката стейта при сбоях в асинхронных резолверах.

### 1.23. Нормализация арности резолвера без парсинга TypeError (`pipelineExecution.ts`)
* **Теория:** Static Arity Normalization over Dynamic Error Inspection. В `pipelineExecution.ts` вызывалась функция `isDestructuringSignatureMismatch`, которая ловила `TypeError` и искала в строке текст `cannot destructure property`, пытаясь угадать сигнатуру резолвера (позиционная vs объект параметров).
* **Изменения:**
  1. Заменить хрупкий парсинг строк ошибок на статическую нормализацию функции при регистрации:
     ```ts
     export function normalizeResolver<TData, TContext>(fn: AnyResolverFn<TData, TContext>) {
       return fn.length <= 1
         ? (k: string, pData: any, ctx: any, signal: AbortSignal) => (fn as any)({ key: k, parentData: pData, context: ctx, signal })
         : fn;
     }
     ```
  2. Устранить runtime overhead от `try/catch` на каждый сетевой запрос.
* **Тест:** `pipelineExecution.test.ts` — 100% совместимость с обеими сигнатурами без парсинга ошибок.

### 1.24. Внедрение Explicit Resource Management (`Symbol.dispose` / TypeScript 5.2+)
* **Теория:** Explicit Resource Management (TC39 & ES2024 Disposable). Все долгоживущие объекты стора должны поддерживать синтаксис `using store = createPopoverStore()`.
* **Изменения:**
  1. Реализовать протокол `[Symbol.dispose]` и `[Symbol.asyncDispose]` для:
     - `PopoverDAG`
     - `BatchingManager`
     - `PopoverStoreApi`
     - `AbortRegistry`
  2. Гарантировать отсутствие утечек памяти в тестах и микро-фронтендах.
* **Тест:** `disposable.test.ts` — проверка освобождения всех таймеров и слушателей через блок `using`.

### 1.25. Централизация безопасного вызова пользовательских коллбэков (`utils/safeCallback.ts`)
* **Теория:** DRY Boundary Error Isolation. Вызовы `entry.onClose`, `entry.onPin`, `entry.onOpen`, `entry.onFocus`, `listener(event)` в `sliceTrail.ts`, `slicePinning.ts`, `sliceSubscriptions.ts` содержат 8 идентичных блоков `wrapResult(() => fn())` + `logger.error()`.
* **Изменения:**
  1. Создать чистую функцию `safeCallback(fn, ...args, { contextName, onError })` в `utils/safeCallback.ts`.
  2. Заменить все ручные блоки `try/catch` и `wrapResult` в слайсах на однострочные вызовы:
     ```ts
     safeCallback(entry.onPin, key, isPinned, { contextName: 'onPin' });
     ```
* **Тест:** `safeCallback.test.ts` — изоляция пользовательских исключений без прерывания цепочки мутаций стора.

### 1.26. Устранение повторного чтения `get()` после `set()` в экшенах слайсов
* **Теория:** State Derivation from Reducer Return. В `slicePinning.ts` метод `togglePin` сначала вызывает `set(state => togglePinState(state, key))`, а затем повторно считывает стейт через `selectIsPinned(key)(get())` и `findEntryByKey(key)`.
* **Изменения:**
  1. Редьюсер `togglePinState` возвращает кортеж `{ patch, nextIsPinned, targetEntry }`.
  2. Слайс использует вычисленные данные напрямую для диспетчеризации событий, экономя время повторного обращения к Zustand-хранилищу.
* **Тест:** `slicePinning.test.ts` — проверка корректности генерации событий `pin`/`unpin` без повторных `get()`.

### 1.27. Оптимизация дедупликации очистки DAG-графа в `sliceTrail.ts`
* **Теория:** Zero Redundant Allocations in Lifecycle Hooks. Вспомогательные функции `pruneDAGNodes` и `notifyAndPruneClosedEntries` в `sliceTrail.ts` независимо создавали `new Set(nextFloating.map(...))` и `new Set(nextTrail.map(...))`.
* **Изменения:**
  1. Объединить фазу уведомления и очистки графа в единую операцию `finalizeClosedEntries({ removedKeys, nextActiveKeysSet, dag, findEntryByKey })`.
  2. Сократить аллокацию временных множеств в 2 раза при каждом закрытии карточки.
* **Тест:** `sliceTrail.test.ts` — проверка корректности очистки узлов графа при множественном закрытии.

### 1.28. Изоляция диспетчеризации событий стора в `StoreEventDispatcher`
* **Теория:** Single Responsibility Principle for Event Bus. Прямые вызовы `dispatchStoreEvent(eventListeners, event, deps.eventBus)` в 6 слайсах размывают ответственность и привязывают слайсы к формату шины.
* **Изменения:**
  1. Внедрить в `SliceContext` семантический фасад `events: StoreEventDispatcher<TData>`:
     - `events.emitPin(key, isPinned)`
     - `events.emitOpen(key, entry)`
     - `events.emitClose(key)`
     - `events.emitError(key, error)`
  2. Слайсы оперируют только типизированными семантическими методами.
* **Тест:** `eventBus.test.ts` — проверка порядка и формата доставки событий подписчикам.

### 1.29. Декомпозиция `sliceConfig.ts` на атомарный конфиг и интерактивные слайсы
* **Теория:** Single Responsibility Principle. В `sliceConfig.ts` (242 строки) смешаны 22 сеттера конфигурации, логика наведения `hoverEnter`/`hoverLeave`, анимация `setTransitionStatus` и кастомные кнопки `setButtonControls`.
* **Изменения:**
  1. Вынести ховер-навигацию в `store/slices/sliceHover.ts`.
  2. Вынести управление жизненным циклом анимаций в `store/slices/sliceLifecycle.ts`.
  3. Вынести кастомные кнопки карточек в `store/slices/sliceControls.ts`.
  4. Заменить 20 разрозненных сеттеров в `sliceConfig.ts` на атомарный метод `actions.updateConfig(partialConfig)`.
* **Тест:** `sliceConfig.test.ts`, `sliceHover.test.ts`, `sliceControls.test.ts` — независимое модульное тестирование.

### 1.30. Очистка устаревших легаси-шимов и ре-экспортов из `storeActions.ts`
* **Теория:** Dead Code Removal (Boy Scout Rule). Файл `storeActions.ts` содержит `@deprecated reduceTogglePinState`, `reduceUpdateOffsetState` и функции `isPinnedEntry`, дублирующие селекторы.
* **Изменения:**
  1. Удалить устаревшие шимы-перенаправители.
  2. Перенести чистые предикаты в `utils/predicates.ts`.
  3. Удалить файл `storeActions.ts` из кодовой базы.
* **Тест:** Компиляция TypeScript проходит без ошибок; 0 неиспользуемых экспортов в `knip`.

### 1.31. Полная инкапсуляция структур данных в `storeControllers.ts`
* **Теория:** Information Hiding & Defensive Encapsulation. Интерфейс `ControllerManager` публично экспортирует мутабельные `Map<TPopoverKey, AbortController>` и `Map<TPopoverKey, Promise<TData>>`, допуская неконтролируемые прямые мутации снаружи.
* **Изменения:**
  1. Скрыть `Map` в замыкании фабрики `createControllerManager`.
  2. Предоставить строго контролируемые методы: `registerAbortController(key)`, `abortKey(key)`, `abortAll()`, `getInFlight(key)`.
* **Тест:** `storeControllers.test.ts` — проверка невозможности внешней мутации коллекций контроллеров.

### 1.32. Изоляция контекста зависимостей слайсов (Interface Segregation)
* **Теория:** Interface Segregation Principle. Объект `SliceContext` передает общий плоский мешок зависимостей `deps` всем слайсам, нарушая принцип наименьших привилегий.
* **Изменения:**
  1. Типизировать зависимости каждого слайса через явные суженные интерфейсы (`TrailSliceDeps`, `PinningSliceDeps`, `ResolverSliceDeps`).
  2. Исключить случайный доступ слайсов к чужим внутренним структурам.
* **Тест:** `sliceContext.test.ts` — проверка строгой изоляции интерфейсов зависимостей.

### 1.33. Унификация пайплайна открытия карточек в `sliceResolver.ts`
* **Теория:** DRY Pipeline Execution. Методы `openRootWithResolver` и `openNestedWithResolver` содержат 80% дублирующейся логики (нормализация rect, проверки активности, отмена старых контроллеров, запуск резолвера, уведомление `onOpen`).
* **Изменения:**
  1. Создать единую внутреннюю функцию выполнения пайплайна:
     `executeOpenPipeline({ key, sourceKey, isRoot, options, anchorEvent })`.
  2. Сократить объем `sliceResolver.ts` на 110 строк.
* **Тест:** `sliceResolver.test.ts` — проверка эквивалентности открытия корневых и вложенных карточек.

### 1.34. Устранение локального дублирования `bringToFront` в `sliceResolver.ts`
* **Теория:** Single Source of Truth for State Mutation. В `sliceResolver.ts` локально объявлена вспомогательная функция `bringToFront(key)` на 10 строк, дублирующая редюсер `bringToFrontPatch`.
* **Изменения:**
  1. Удалить локальный дубликат из `sliceResolver.ts`.
  2. Использовать канонический чистый редюсер `bringToFrontPatch(state, key, deps.popoverDAG)`.
* **Тест:** `sliceResolver.test.ts` — проверка подъема карточки на передний план при повторном открытии.

### 1.35. Railway-Oriented валидация схемы в `slicePersistence.ts`
* **Теория:** Railway-Oriented Storage Decoding. Метод `rehydrateState` возвращает булев `false` при любых сбоях, маскируя причину (битый JSON, устаревшая схема, ошибка хранилища).
* **Изменения:**
  1. Перевести парсинг и валидацию `PersistedEnvelope` на `Result<PersistedEnvelope, PopoverError>`.
  2. Логировать типизированные ошибки через единый `utils/logger.ts`.
* **Тест:** `slicePersistence.test.ts` — проверка возврата детальных кодов ошибок при повреждении данных в `localStorage`.

### 1.36. Идемпотентный Teardown стора в `slicePersistence.ts: destroy`
* **Теория:** Robust Lifecycle Teardown. Метод `destroy()` должен гарантировать строгую последовательность освобождения ресурсов: остановка таймеров $\to$ аборт HTTP-запросов $\to$ очистка слушателей $\to$ сброс кэша $\to$ сброс стейта в `EMPTY_STATE`.
* **Изменения:**
  1. Выделить упорядоченный пайплайн деинициализации `teardownStorePipeline(deps, set)` с гарантией идемпотентности при повторных вызовах.
* **Тест:** `slicePersistence.test.ts` — 100% очистка всех подписок и структур памяти при вызове `destroy()`.

### 1.37. Искоренение мутаций через `delete` в `pinReducers.ts` (V8 Hidden Classes)
* **Теория:** Fast Property Access in JavaScript Engines. Оператор `delete obj[key]` переводит структуру объекта V8 в медленный словарь (Hash Mode), замедляя чтение свойств `offsets` во всех селекторах.
* **Изменения:**
  1. Заменить `delete nextOffsets[key]` на чистую неизменяемую утилиту `omitRecordKey(record, key)` без вызова оператора `delete`.
* **Тест:** `pinReducers.test.ts` — сохранение целостности записей смещений без оператора `delete`.

### 1.38. Слияние дублирующихся редюсеров `updateEntryInLists` и `patchEntryInLists` (`stackReducers.ts`)
* **Теория:** DRY Reducer Abstraction. Редюсеры `updateEntryInLists` (36 строк) и `patchEntryInLists` (26 строк) выполняли практически идентичный поиск и замену карточки в списках.
* **Изменения:**
  1. Удалить функцию `updateEntryInLists`, выразив её через канонический `patchEntryInLists(floating, trail, key, () => updatedEntry)`.
  2. Сократить кодовую базу редюсеров на 35 строк.
* **Тест:** `stackReducers.test.ts` — 100% эквивалентность обновления карточек в списках.

### 1.39. Алгоритмическая оптимизация подъема по z-index (`bringToFrontPatch`)
* **Теория:** Zero Redundant Array Allocations in Stacking Context. Редюсер `bringToFrontPatch` создавал до 3 массивов и 2 множеств на каждый клик или фокус по карточке.
* **Изменения:**
  1. Внедрить быстрый шорт-серкит: если ключ уже верхний (`state.zIndexOrder.at(-1) === key`) и у него нет потомков, возвращать `EMPTY_OBJECT`.
  2. Однопроходный сдвиг цепочки потомков в конец порядка наложения.
* **Тест:** `stackReducers.test.ts` — проверка порядка наложения при фокусе связанных и изолированных окон.

### 1.40. Иммутабельный функциональный стиль переключения закрепления в `pinReducers.ts`
* **Теория:** Pure Functional Pipeline vs In-place Splice Mutations. Функция `togglePinState` использовала императивные вызовы `splice()`, `push()` и мутации промежуточных массивов.
* **Изменения:**
  1. Разделить логику на чистые функции трансформации узлов:
     - `toFloatingEntry(trailEntry, rect)`
     - `toTrailEntry(floatingEntry)`
  2. Формировать `nextFloating` и `nextTrail` через декларативную фильтрацию и конкатенацию.
* **Тест:** `pinReducers.test.ts` — проверка детерминированности переходов между режимами плавающих и стековых окон.

### 1.41. Инкапсуляция истории в `StoreHistoryService` (Защита от утечки undo/redo стеков)
* **Теория:** Encapsulation & Law of Demeter. `StoreHistoryService` напрямую пробрасывает наружу мутабельные массивы `undoStack` и `redoStack`, позволяя внешнему коду делать неконтролируемые `.push()` и `.pop()` мимо `HistoryManager`.
* **Изменения:**
  1. Скрыть массивы внутри экземпляра `HistoryManager`.
  2. Предоставить слайсам только публичный контракт: `pushSnapshot`, `undo`, `redo`, `canUndo`, `canRedo`, `clearHistory`.
* **Тест:** `history.test.ts` — проверка невозможности внешней модификации стеков истории.

### 1.42. Унификация и слияние систем снимков (`SnapshotManager` vs `slicePersistence`)
* **Теория:** Single Source of Truth / No Redundant Subsystems. В библиотеке сосуществуют два независимых механизма персистентности: `SnapshotManager.ts` (317 строк) и `slicePersistence.ts` (133 строки) с параллельными типами снимков `PopoverSnapshotData` и `PersistedEnvelope`.
* **Изменения:**
  1. Объединить схемы в единый канонический DTO `PersistedEnvelope` в `store/persistence/persistenceCore.ts`.
  2. `slicePersistence.ts` использует единое ядро персистентности.
  3. `SnapshotManager.ts` становится тонким фасадом для многовкладочной синхронизации.
* **Тест:** `snapshotManager.test.ts` и `slicePersistence.test.ts` — 100% совместимость снимков между обоими API.

### 1.43. Чистая декларативная фабрика композиции слайсов (`composeStoreSlices`)
* **Теория:** Functional Composition / Open-Closed Principle. Функция `registerDomainActionSlices` монолитно склеивает 7 слайсов объектом `{ ...slice1, ...slice2, ... }`, не защищая от коллизий имен экшенов.
* **Изменения:**
  1. Внедрить чистый пайплайн `composeStoreSlices(sliceFactories, context)`.
  2. В dev-режиме проверять уникальность зарегистрированных экшенов, предотвращая случайное затенение методов.
* **Тест:** `storeActionRegistry.test.ts` — обнаружение коллизий имен методов при композиции кастомных слайсов.

### 1.44. Изоляция `BroadcastChannel` в транспортном адаптере (`CrossTabBroadcaster`)
* **Теория:** Hexagonal Architecture (Ports and Adapters). Прямая работа с `BroadcastChannel` в `snapshotManager.ts` привязывает логику снимков к конкретному браузерному API.
* **Изменения:**
  1. Выделить транспортный порт `CrossTabBroadcaster` с автоматическим фоллбеком на `storage event` в старых браузерах и no-op заглушкой для SSR / Node.js.
* **Тест:** `crossTabBroadcaster.test.ts` — проверка работы кросс-табовой синхронизации в jsdom и SSR окружении.

### 1.45. Устранение глобального `batchSeq` и рефакторинг `transitionScheduler.ts`
* **Теория:** Pure Instance Isolation vs Global Module State. Переменная `let batchSeq = 0` на уровне модуля создает разделяемое состояние между тестами и параллельными инстансами стора.
* **Изменения:**
  1. Инкапсулировать счетчик пакетов внутри класса `PopoverTransitionScheduler`.
  2. Делегировать хранение и очистку таймеров единому `KeyedTimerPool`.
  3. Сократить `transitionScheduler.ts` с 225 до ~70 строк.
* **Тест:** `transitionScheduler.test.ts` — параллельный прогон таймеров в изолированных инстансах.

### 1.46. Zero-Allocation конвейер в `storeMiddlewareEngine.ts` и `logger.ts`
* **Теория:** Production Observability & Zero Overhead Interception. Замена прямых вызовов `console.error` на структурированный логгер и оптимизация слияния патчей.
* **Изменения:**
  1. Подключить `logger.error` в обработчик сбоев middleware.
  2. Заменить пошаговый цикл `mergeSanitizedPatch` на оптимизированное копирование безопасных ключей.
* **Тест:** `storeMiddlewareEngine.test.ts` — изоляция ошибок в пользовательских middleware.

### 1.47. Стандартизация фабричного контракта создания стора (`createPopoverStore`)
* **Теория:** Parameter Object & Default Factory Composition. Инициализация стора принимает растущее число аргументов (кастомные слайсы, middlewares, snapshot options).
* **Изменения:**
  1. Оформить опции создания стора в единый интерфейс `CreatePopoverStoreOptions<TData, TContext, TPopoverKey>` с дефолтными значениями из `storeDefaults.ts`.
* **Тест:** `storeFactory.test.ts` — создание стора с частичными и полными наборами опций.

### 1.48. Защита от утечек слушателей через `WeakRef` в `sliceSubscriptions.ts`
* **Теория:** Defensive Memory Management for UI Listeners. Если внешний потребитель забыл отписаться от событий стора, замыкание слушателя может удерживать DOM-компонент в памяти.
* **Изменения:**
  1. Добавить опциональный режим слабой подписки `subscribeEvent(listener, { weak: true })` с автоматической очисткой при сборке мусора целевого объекта.
* **Тест:** `sliceSubscriptions.test.ts` — проверка отписки при уничтожении слабосвязанного слушателя.

### 1.49. Устранение дублирования шагов вычисления в `closeFromState` (`closeReducers.ts`)
* **Теория:** DRY in Reducer Calculation Steps. Функция `closeFromState` повторяет 30 строк кода вычисления удаляемых ключей, полностью дублируя логику `getRemovedKeysForClose`.
* **Изменения:**
  1. Переписать `closeFromState` на прямое использование `getRemovedKeysForClose(floating, trail, index, ...)`.
  2. Сократить файл `closeReducers.ts` на 25 строк.
* **Тест:** `closeReducers.test.ts` — 100% покрытие всех сценариев каскадного закрытия.

### 1.50. Переход от виртуальных индексов `(floating + trail)` к адресации по ключам в редюсерах
* **Теория:** Intention-Revealing Programming & Index Arithmetic Elimination. Сквозные индексы `index < floating.length ? ... : ...` неинформативны и подвержены ошибкам сдвига при асинхронных мутациях.
* **Изменения:**
  1. Внедрить явные редюсеры, ориентированные на ключи:
     - `pushNestedByKeyState(state, parentKey, entry)`
     - `closeByTargetKeyState(state, targetKey, dag)`
  2. Индексные функции оставить для обратной совместимости как тонкие обертки.
* **Тест:** `openReducers.test.ts` и `closeReducers.test.ts` — тестирование операций по строковым ключам.

### 1.51. Fast-path сохранение ссылок при отсутствии удалений в `closeReducers.ts`
* **Теория:** Reference Identity Retention on No-op Close. Если `removedKeys` пуст или карточка с переданным индексом не найдена, редюсер не должен создавать новые копии массивов.
* **Изменения:**
  1. Добавить предварительную проверку `removedKeys.size === 0` для мгновенного возврата `EMPTY_OBJECT`.
* **Тест:** `closeReducers.test.ts` — проверка возврата `toBe` исходных ссылок на массивы при холостом закрытии.

### 1.52. Заморозка дефолтных структур и констант в `storeDefaults.ts`
* **Теория:** Immutable Shared State Constants. Дефолтные объекты `EMPTY_ARRAY`, `EMPTY_OBJECT`, `EMPTY_PATCH` используются как fallback-значения по всей кодовой базе стора.
* **Изменения:**
  1. Применить `Object.freeze` ко всем экспортируемым константам в `storeDefaults.ts`.
  2. Предотвратить непреднамеренное загрязнение общих fallback-структур в рантайме.
* **Тест:** `storeDefaults.test.ts` — попытка модификации `EMPTY_OBJECT` / `EMPTY_ARRAY` бросает исключение в strict mode.

### 1.53. Перенос `persistenceHelpers.ts` в `store/persistence/` и чистка от `delete`
* **Теория:** Domain Cohesion & Hidden Class Optimization. Файл `persistenceHelpers.ts` лежал в папке `slices/` и использовал оператор `delete` в цикле `sanitizePersistedEntries`.
* **Изменения:**
  1. Переместить файл в `store/persistence/persistenceHelpers.ts`.
  2. Заменить `delete cleanEntry.dataPromise` на чистую деструктуризацию `{ dataPromise, onError, onPin, onClose, ...serializable }`.
* **Тест:** `persistenceHelpers.test.ts` — 100% сериализуемость очищенных записей.

### 1.54. Оптимизация алгоритма поиска верхнего окна `selectTopmostEntry`
* **Теория:** Algorithmic Clarity & DRY Fallback Loops. `selectTopmostEntry` содержал 3 повторяющихся цикла `for` по разным массивам (`zIndexOrder`, `trail`, `floating`).
* **Изменения:**
  1. Объединить циклы в единый конвейер поиска с приоритетным перебором и предикатом `isMountingOrMounted(entry)`.
* **Тест:** `storeSelectors.test.ts` — проверка корректности определения верхнего активного окна при любых комбинациях открытых карточек.

### 1.55. Стандартизация сигнатур параметризованных селекторов
* **Теория:** Consistent Selector DX & Auto-Memoization. Селекторы в `storeSelectors.ts` смешивали прямые вызовы `fn(state)` и каррированные `fn(key)(state)`.
* **Изменения:**
  1. Привести все параметризованные селекторы (`selectEntryByKey`, `selectIsPinned`, `selectOffset`) к единому каррированному стандарту с поддержкой мемоизации `createCachedSelector`.
* **Тест:** `storeSelectors.test.ts` — проверка вывода типов и стабильности возвращаемых ссылок.

### 1.56. Однопроходное восстановление топологии в `restoreDAGFromState`
* **Теория:** Single-Pass State Rebuild. Функция `restoreDAGFromState` выполняла два раздельных цикла по массивам `trail` и `floating`.
* **Изменения:**
  1. Объединить восстановление связей в один цикл с итератором `iterateAllEntries(trail, floating)`.
* **Тест:** `dag.test.ts` — проверка корректности восстановления графа зависимостей после реконсиляции из `localStorage`.

### 1.57. Изоляция предиката сравнения снимков истории в `isHistoryStateEqual`
* **Теория:** Pure Structural Predicates & Single Level of Abstraction. В методе `pushSnapshot` (`history.ts`) находилось сложное 8-строчное условие сравнения всех полей состояния.
* **Изменения:**
  1. Вынести проверку в чистую функцию `isHistoryStateEqual(lastSnapshot, nextState)`.
  2. Разгрузить тело `pushSnapshot` до 10 строк.
* **Тест:** `history.test.ts` — проверка игнорирования идентичных снимков при последовательных событиях.

### 1.58. Поддержка `AbortSignal` и интеграция `logger.ts` в `PopoverEventBus`
* **Теория:** Standard Lifecycle Subscription & Observable Logging. Пользователи шины должны иметь возможность отписываться декларативно через стандартный `AbortSignal` контроллер.
* **Изменения:**
  1. Поддержать `options.signal` в `bus.on(type, listener, { signal })`.
  2. Заменить прямые вызовы `console.warn` и `console.error` на `logger.warn` и `logger.error`.
* **Тест:** `eventBus.test.ts` — автоматическая отписка слушателя при `controller.abort()`.

### 1.59. Изоляция строковых констант протокола стора в `store/constants.ts`
* **Теория:** Centralized Domain Constants & Magic String Elimination. Магические строки протокола (`'__root__'`, `'default'`, `'AbortError'`, `'mounted'`, `'unmounting'`) должны быть строго типизированы и изолированы от UI-констант.
* **Изменения:**
  1. Консолидировать все системные ключи и идентификаторы стора в `store/constants.ts` с типом `as const`.
* **Тест:** `constants.test.ts` — проверка неизменяемости констант протокола.

### 1.60. Пакетное событие каскадного закрытия `popover:batch_close`
* **Теория:** Coalesced Microtask Event Emission. При каскадном закрытии цепочки окон шина порождала множество отдельных микро-событий `popover:close`.
* **Изменения:**
  1. Добавить агрегирующее событие `popover:batch_close` с единым массивом закрытых ключей `keys: TPopoverKey[]`.
* **Тест:** `eventBus.test.ts` — проверка получения полного списка ключей при закрытии родительского узла.

### 1.61. Унификация коммита результатов резолвера (`commitResolverSettlement`)
* **Теория:** DRY in Async State Commit Pipelines. Функции `handleResolverError` и `handleResolverSuccess` дублируют проверку присутствия карточки в списках (`state.floating.some || state.trail.some`) и применение патча.
* **Изменения:**
  1. Объединить логику коммита в единую функцию `commitResolverSettlement(state, key, nextEntry, fallbackInsertPatch)`.
  2. Сократить `pipelineExecution.ts` на 35 строк.
* **Тест:** `pipelineExecution.test.ts` — проверка сохранения состояния при успешном и ошибочном завершении запроса.

### 1.62. Изоляция пользовательского `onError` через `safeCallback`
* **Теория:** Fail-safe User Callback Execution. Прямой блок `try/catch` с `console.error` в обработчике ошибки резолвера заменяется на `safeCallback(currentEntry.onError, error, key, 'onError')`.
* **Изменения:**
  1. Исключить разрозненное логирование ошибок.
  2. Предотвратить падение стора при сбое внутри пользовательского коллбэка `onError`.
* **Тест:** `pipelineExecution.test.ts` — сохранение стабильности стора при падении `onError`.

### 1.63. Выделение фасада L1-кэша `ResolverCacheManager`
* **Теория:** High Cohesion Cache Access. В `pipelineCache.ts` чтение и запись в кэш выполняются через ручные обертки `wrapResult(() => activeCache.get(key))` и проверки `!isPromise(raw)`.
* **Изменения:**
  1. Выделить компактный типизированный фасад `ResolverCacheManager` с методами `readSync(key)` и `writeSync(key, data)`.
* **Тест:** `pipelineCache.test.ts` — тестирование синхронного попадания в кэш и игнорирования промисов.

### 1.64. Кэширование сигнатуры резолвера (`ResolverArityCache`)
* **Теория:** Eliminating Runtime Trial-and-Error. Функция `invokeResolverSafely` при каждом вызове сначала пытается вызвать резолвер позиционно, и при ошибке ловит `TypeError` для объектных аргументов.
* **Изменения:**
  1. Использовать `WeakMap` кэш `ResolverArityCache` для запоминания сигнатуры функции после первого успешного вызова.
  2. Исключить накладные расходы на перехват исключений на горячем пути.
* **Тест:** `pipelineExecution.test.ts` — бенчмарк вызова резолверов с позиционными и объектными параметрами.

### 1.65. Полная декомпозиция монолита `fsm.ts` (535 строк $\to$ 4 компактных модуля)
* **Теория:** Single Responsibility & Package by Feature. Монолит `fsm.ts` объединяет типы, битовые маски, матрицу переходов и класс машины состояний.
* **Изменения:**
  1. `fsm/fsmTypes.ts` — типы дискретных состояний, контекста и событий.
  2. `fsm/fsmMatrix.ts` — матрица допустимых переходов и битовая логика `FSMStatusBit`.
  3. `fsm/fsmTransitions.ts` — чистые функции перехода (`toHydrating`, `toResolvedTrailing`, `toResolvedPinned`, `toErrorState`).
  4. `fsm/PopoverCardFSM.ts` — тонкий класс-раннер с подпиской на события.
* **Тест:** `fsm.test.ts` — 100% покрытие всех валидных и невалидных переходов машины состояний.

### 1.66. Устранение дублирования восстановления состояния в `undo`/`redo`
* **Теория:** DRY in Snapshot State Restoration. Методы `undo` и `redo` в `sliceTransactions.ts` содержат одинаковые строки восстановления графа DAG и применения патча снимка.
* **Изменения:**
  1. Выделить чистую функцию `applyHistorySnapshot(snapshot, deps, set)`.
  2. Сократить методы `undo` и `redo` до 3 строк каждый.
* **Тест:** `sliceTransactions.test.ts` — проверка корректности восстановления графа при undo/redo.

### 1.67. Инкапсуляция транзакционного роллбэка через `TransactionScope`
* **Теория:** Transactional Rollback Encapsulation. Логика сохранения снимка состояния, перехвата сбоев и отката контроллеров в `transaction` должна быть инкапсулирована в `TransactionScope`.
* **Изменения:**
  1. Использовать `TransactionScope` для автоматического роллбэка при ошибках и структурированного логирования через `logger.error`.
* **Тест:** `sliceTransactions.test.ts` — гарантированный откат при сбое внутри асинхронного экшена.

### 1.68. Высокопроизводительная проверка статусов через битовые маски `FSMStatusBit`
* **Теория:** Bitwise Performance Optimization. Проверка активности поповера через битовую операцию `(STATE_VALUE_TO_BIT_MAP[state.value] & FSMStatusBit.Active) !== 0` выполняется за 1 такт процессора.
* **Изменения:**
  1. Использовать битовые маски во всех высокочастотных селекторах и предикатах фильтрации стора.
* **Тест:** `fsm.test.ts` — валидация соответствия строковых статусов и битовых масок.

### 1.69. Zero-Intermediate-Array сборщик активных ключей (`collectActiveKeysSet`)
* **Теория:** Allocation-free Set Construction. Методы `pruneDAGNodes` и `notifyAndPruneClosedEntries` создавали до 4 промежуточных массивов через `.map()` и 4 объекта `new Set` при закрытии поповеров.
* **Изменения:**
  1. Внедрить утилиту `collectActiveKeysSet(floating, trail)` для однопроходного наполнения `Set` без промежуточных массивов.
  2. Снизить нагрузку на сборщик мусора (GC) во время анимаций.
* **Тест:** `sliceTrail.test.ts` — проверка корректности очистки узлов в DAG при каскадном закрытии.

### 1.70. Линейный поиск максимальной длительности анимаций `resolveMaxExitDuration`
* **Теория:** Algorithmic Complexity in Frame Budget ($O(K \times N) \to O(K)$). Функция `resolveMaxExitDuration` выполняла $K$ линейных поисков `findEntryByKey` по массивам карточек.
* **Изменения:**
  1. Выполнять поиск длительности через однопроходную свертку `reduce` по существующим массивам `floating`/`trail`.
* **Тест:** `sliceTrail.test.ts` — проверка выбора наибольшей длительности при кастомных `exitTransitionDuration`.

### 1.71. Дедупликация запросов состояния в `slicePinning.ts` и `safeCallback`
* **Теория:** Redundant State Queries Elimination. Функция `togglePin` вызывала `findEntryByKey` и `get()` до и после изменения состояния, а также использовала ручной блок `try/catch`.
* **Изменения:**
  1. Использовать возвращаемый результат редьюсера `togglePinState` с новым флагом `isPinned`.
  2. Заменить ручной перехват исключений на `safeCallback(entry.onPin, key, isPinned, 'onPin')`.
* **Тест:** `slicePinning.test.ts` — проверка вызова `onPin` и отправки событий шины.

### 1.72. Инкапсуляция валидации координат в редюсер `updateOffsetState`
* **Теория:** Boundary Guarding in Pure Reducers. Проверки `Number.isFinite(x)` и сравнение с текущими координатами находились в слайсе `slicePinning.ts`.
* **Изменения:**
  1. Перенести валидацию чисел и шорт-серкит эквивалентности внутрь чистой функции `updateOffsetState` (`pinReducers.ts`).
  2. Оставить `slicePinning.ts` компактным фасадом.
* **Тест:** `pinReducers.test.ts` — проверка игнорирования `NaN`/`Infinity` и возврата `EMPTY_OBJECT` при совпадении координат.

### 1.73. Рефакторинг `storeHydration.ts` на `Map<string, number>` без `delete`
* **Теория:** Fast Data Structures & Hidden Class Stability. Внутреннее состояние счетчиков `nestedCounters` использовало plain object и оператор `delete nestedCounters[parentKey]`.
* **Изменения:**
  1. Перевести `nestedCounters` на нативный `Map<string, number>`.
  2. Заменить мутации `delete` на методы `map.delete()` и `map.clear()`.
* **Тест:** `storeHydration.test.ts` — проверка защиты от гонок и инвалидации счетчиков.

### 1.74. Консолидация модулей резолвера в папке `store/resolver/`
* **Теория:** Domain Packaging & Cohesion. Файл `storeResolverPipeline.ts` находился в корне `store/`, в то время как связанные с ним модули лежали в подпапке `resolver/`.
* **Изменения:**
  1. Перенести `storeResolverPipeline.ts` в `store/resolver/resolvePopoverEntry.ts`.
  2. Экспортировать единую публичную точку входа для резолверов.
* **Тест:** `storeResolverPipeline.test.ts` — проверка разрешения асинхронных карточек.

### 1.75. $O(1)$ инвалидация фоновых запросов через токен эпохи
* **Теория:** Fast Race Invalidation ($O(N) \to O(1)$). При смене резолвера метод `markAllCountersStale` проходил в цикле по всем ключам родительских запросов.
* **Изменения:**
  1. Ввести глобальный монотонный счетчик эпохи `resolverEpochCounter`.
  2. При смене резолвера инкрементировать счетчик эпохи за $O(1)$, автоматически делая все предыдущие запросы устаревшими.
* **Тест:** `storeHydration.test.ts` — мгновенная инвалидация 1000 параллельных запросов при смене резолвера.

### 1.76. Фабрика узлов `createResolvedTrailEntry` без промежуточных замыканий
* **Теория:** Object Allocation Hoisting in Resolver Pipeline. Функция `buildEntry` создавалась заново в замыкании на каждый вызов `resolvePopoverEntry`.
* **Изменения:**
  1. Заменить замыкание на чистую фабрику `createResolvedTrailEntry(params, data, error, isLoading)`.
* **Тест:** `entryFactory.test.ts` — проверка создания структуры `TrailEntry` в состояниях loading/success/error.

### 1.77. Изоляция зависимостей слайсов через интерфейсные проекции (`SliceContext<TDeps>`)
* **Теория:** Interface Segregation Principle (ISP) in Slice DI. Все слайсы получают общий плоский интерфейс `ActionRegistryDependencies`, содержащий 25+ полей, нарушая принцип наименьших привилегий.
* **Изменения:**
  1. Параметризовать `SliceContext<TData, TContext, TPopoverKey, TDeps>`.
  2. Каждый слайс объявляет точный подтип требуемых сервисов через `Pick<ActionRegistryDependencies, ...>`.
  3. Исключить доступ слайса к не связанным с ним подсистемам.
* **Тест:** `sliceContext.test.ts` — проверка статической типизации изолированных контекстов слайсов.

### 1.78. Статическая константа зарезервированных экшенов `RESERVED_CORE_ACTION_NAMES`
* **Теория:** Zero Runtime Set Allocation on Store Creation. В `createStoreActions` множество `reservedCoreActionNames` создавалось заново при каждой инициализации стора через `new Set(Object.keys(coreActions))`.
* **Изменения:**
  1. Вынести статический список зарезервированных имен в константу уровня модуля `RESERVED_CORE_ACTION_NAMES` с типом `ReadonlySet<string>`.
* **Тест:** `storeActionRegistry.test.ts` — проверка защиты зарезервированных экшенов при расширении кастомными слайсами.

### 1.79. Интеграция `logger.warn` при коллизиях имен в кастомных слайсах
* **Теория:** Centralized Warning Emission. Замена прямого вызова `console.warn` в `createStoreActions` на типизированный `logger.warn` с контекстом имени слайса и затеняемого метода.
* **Изменения:**
  1. Использовать `logger.warn` с проверкой `isDevEnv()`.
* **Тест:** `storeActionRegistry.test.ts` — проверка эмиссии предупреждения при конфликте имен экшенов.

### 1.80. Фабрика контекста слайсов с защитой от мутаций (`createSliceContext`)
* **Теория:** Immutable Dependency Scope. Объект контекста `{ set, get, deps }` формировался как анонимный мутабельный литерал.
* **Изменения:**
  1. Внедрить фабрику `createSliceContext(set, get, deps)` с применением `Object.freeze` в режиме разработки.
* **Тест:** `sliceContext.test.ts` — попытка модификации свойств контекста вызывает ошибку в dev-режиме.

### 1.81. Встраивание `runTracked` в контракт `ControllerManager`
* **Теория:** Encapsulation of Async Deduplication. Функция `runTracked` принимала сырой `Map` промисов в качестве аргумента, допуская утечку внутреннего состояния.
* **Изменения:**
  1. Сделать `runTracked(key, task)` методом интерфейса `ControllerManager`.
  2. Скрыть мутабельный `Map` промисов внутри замыкания фабрики `createControllerManager`.
* **Тест:** `storeControllers.test.ts` — проверка дедупликации параллельных запросов по одному ключу.

### 1.82. Идемпотентная очистка и флаг `isDisposed` в `storeControllers.ts`
* **Теория:** Idempotent Resource Teardown. Повторные вызовы `dispose()` или регистрация контроллеров после уничтожения стора могли приводить к утечкам ресурсов.
* **Изменения:**
  1. Добавить внутренний флаг `isDisposed`.
  2. Блокировать регистрацию новых контроллеров при `isDisposed === true`.
* **Тест:** `storeControllers.test.ts` — вызов `registerController` на уничтоженном менеджере возвращает отмененный контроллер.

### 1.83. Оформление батчинга подписок через чистый `BatchedStoreAdapter`
* **Теория:** Explicit Decorator Pattern vs Monkey Patching. Метод `attachSubscriber` в `storeBatching.ts` перезаписывал `store.subscribe` налету (monkey-patching).
* **Изменения:**
  1. Выделить декоратор `createBatchedStoreAdapter(store, batchingManager)`.
  2. Сделать подмену методов явной и типобезопасной.
* **Тест:** `storeBatching.test.ts` — проверка сохранения совместимости с `useSyncExternalStore`.

### 1.84. Изоляция ошибок подписчиков батча через `safeCallback`
* **Теория:** Subscriber Error Isolation. Функция `notifyBatchSubscribers` содержала ручной цикл с `try/catch` и `console.error`.
* **Изменения:**
  1. Использовать стандартную утилиту `safeCallback(listener, currentState, previousState, 'batchSubscriber')`.
* **Тест:** `storeBatching.test.ts` — сбой в одном слушателе не блокирует уведомление остальных подписчиков.

### 1.85. Изоляция пользовательского коллбэка `onOpen` через `safeCallback`
* **Теория:** Fail-safe User Lifecycle Hooks. В функции `notifyEntryOpen` вызов `entry.onOpen(entry)` выполнялся напрямую без перехвата исключений.
* **Изменения:**
  1. Обернуть вызов в `safeCallback(entry.onOpen, entry, 'onOpen')`.
  2. Предотвратить падение открытия поповера при сбое в пользовательском коде.
* **Тест:** `sliceResolver.test.ts` — проверка стабильности открытия при ошибке в `onOpen`.

### 1.86. Вынос разрешения координат триггера `resolveTriggerBoundingRect` в `utils/domGuards.ts`
* **Теория:** Separation of Concerns (UI/DOM vs Headless Store). Логика `target.getBoundingClientRect()` не должна находиться внутри headless-слайса стора.
* **Изменения:**
  1. Перенести `resolveTriggerBoundingRect` в `utils/domGuards.ts` с защитой от сбоев в SSR (`typeof window === 'undefined'`).
  2. Слайс оперирует исключительно готовым объектом `rect: DOMRect | null`.
* **Тест:** `domGuards.test.ts` — корректное извлечение Rect из различных типов событий и элементов.

### 1.87. Унификация предикатов активности карточки `isEntryActiveInStack`
* **Теория:** DRY in State Existence Predicates. Функции `isRootAlreadyActive` и `isNestedAlreadyActive` дублируют проверку статуса анимации и флага принудительного обновления.
* **Изменения:**
  1. Объединить проверки в чистый предикат `isEntryActiveInStack(entry, options)`.
  2. Исключить дублирование логики в `openRootWithResolver` и `openNestedWithResolver`.
* **Тест:** `sliceResolver.test.ts` — проверка предотвращения повторного открытия уже активных окон.

### 1.88. Декомпозиция повторов и предзагрузки в `prefetchPipeline.ts`
* **Теория:** Command Pattern for Complex Actions. Методы `retryPopover` (60 строк) и `prefetchPopover` (45 строк) перегружают файл `sliceResolver.ts`.
* **Изменения:**
  1. Выделить предзагрузку данных в изолированный модуль `store/resolver/prefetchPipeline.ts`.
  2. Сократить `sliceResolver.ts` на 80 строк.
* **Тест:** `sliceResolver.test.ts` и `prefetchPipeline.test.ts` — проверка параллельной предзагрузки и повторных попыток.

### 1.89. Инкапсуляция сброса резолвера в `ControllerManager.abortAllControllers()`
* **Теория:** Tell, Don't Ask & Abstraction Leaks. Метод `setResolveData` в `sliceConfig.ts` вручную перебирал `activeControllers.values()` в цикле и вызывал `.clear()`.
* **Изменения:**
  1. Делегировать отмену контроллеров методу `deps.abortAllControllers()`.
* **Тест:** `sliceConfig.test.ts` — проверка отмены всех активных запросов при замене функции резолвера.

### 1.90. $O(D)$ отмена ховеров по предкам через `PopoverDAG.getAncestors`
* **Теория:** Graph-Based Traversal vs Linear Array Scanning. Метод `hoverEnter` выполнял цикл с линейным поиском `findEntryByKey` на каждом шаге восхождения к корню.
* **Изменения:**
  1. Использовать топологический метод `deps.popoverDAG?.getAncestors(key) ?? []` для получения предков без поиска по массивам.
* **Тест:** `sliceConfig.test.ts` — отмена таймеров закрытия для всей родительской цепочки.

### 1.91. Устранение импортов из устаревшего `storeActions.ts` в `sliceConfig.ts`
* **Теория:** Single Source of Truth for State Predicates. `sliceConfig.ts` импортировал `isPinnedEntry` из `@deprecated` файла `storeActions.ts`.
* **Изменения:**
  1. Заменить вызов на селектор `selectIsPinned(key)(state)` из `storeSelectors.ts`.
* **Тест:** `sliceConfig.test.ts` — проверка корректности проверки закрепления карточки.

### 1.92. Атомарный мульти-сеттер `actions.updateConfig(partialConfig)`
* **Теория:** Coalesced State Updates vs Setter Explosion. Для обновления нескольких параметров конфигурации требовалось множество отдельных вызовов сеттеров.
* **Изменения:**
  1. Добавить экшен `actions.updateConfig(partialConfig)` для атомарного обновления настроек за один вызов `set()`.
* **Тест:** `sliceConfig.test.ts` — атомарное обновление нескольких полей конфигурации.

### 1.93. Изоляция ошибок в `subscribeKey` через `safeCallback`
* **Теория:** Defensive Listener Notification. Ручной блок `wrapResult` и `console.error` заменяется на стандартный вызов `safeCallback`.
* **Изменения:**
  1. Обернуть вызов слушателя в `safeCallback(listener, currentEntry, lastPrev, 'subscribeKey')`.
* **Тест:** `sliceSubscriptions.test.ts` — сбой в слушателе ключа не роняет другие подписки.

### 1.94. Предупреждение в dev-режиме при отсутствии `subscribeState`
* **Теория:** Defensive API Contract Warning. При отсутствии `deps.subscribeState` метод `subscribeKey` завершался молчаливым no-op.
* **Изменения:**
  1. Добавить `logger.warn` в dev-режиме, если хранилище не сконфигурировано для отслеживания состояния.
* **Тест:** `sliceSubscriptions.test.ts` — эмиссия предупреждения при отсутствии подписки на стейт.

### 1.95. Оптимизация сравнения конфигураций `isCollisionConfigEqual`
* **Теория:** Specialized Equality Checks. Для проверки изменений `collisionConfig` использовался тяжелый универсальный `isDeepEqual`.
* **Изменения:**
  1. Внедрить легковесный компаратор `isCollisionConfigEqual(a, b)` без рекурсивного глубокого обхода.
* **Тест:** `sliceConfig.test.ts` — проверка предотвращения лишних обновлений при совпадении конфигурации коллизий.

### 1.96. Изоляция валидации `baseZIndex` в редюсерах
* **Теория:** Input Sanitization at State Boundaries. Проверка `validateBaseZIndex` выполнялась в теле слайса.
* **Изменения:**
  1. Перенести валидацию и нормализацию `baseZIndex` в чистый редюсер конфигурации.
* **Тест:** `sliceConfig.test.ts` — проверка нормализации некорректных значений `baseZIndex`.

### 1.97. Декомпозиция `patchEntryButtonControls` в `store/reducers/stackReducers.ts`
* **Теория:** Pure Reducer Extraction from Slice Files. В файле `sliceConfig.ts` находилась локальная функция `patchEntryButtonControls` (25 строк).
* **Изменения:**
  1. Перенести функцию в чистые редюсеры `reducers/stackReducers.ts`.
* **Тест:** `stackReducers.test.ts` — проверка обновления кнопок управления карточкой.

### 1.98. Декларативная очистка подписок через `Symbol.dispose`
* **Теория:** Explicit Resource Management (TS 5.2+). Возвращаемая функция отписки должна поддерживать `[Symbol.dispose]`.
* **Изменения:**
  1. Реализовать контракт `ScopeDisposable` в объектах подписки `subscribeEvent` и `subscribeKey`.
* **Тест:** `sliceSubscriptions.test.ts` — поддержка синтаксиса `using sub = store.actions.subscribeEvent(...)`.

### 1.99. Вынос сайд-эффектов из редьюсера `buildCleanupPatch`
* **Теория:** Pure Reducers vs Side-Effect Contamination. Сайд-эффекты (`notifyAndPruneClosedEntries`, вызовы `entry.onClose`) выполнялись прямо внутри функции стейт-патча `set()`.
* **Изменения:**
  1. Разделить операцию на две фазы: 1) чистый расчет патча удаления, 2) выполнение эффектов очистки DAG и вызова `onClose` после коммита стейта.
* **Тест:** `sliceTrail.test.ts` — проверка детерминированности редьюсеров и вызова `onClose`.

### 1.100. Шорт-серкит в `applyUnmountingState` при отсутствии совпадений
* **Теория:** Fast-path Zero-alloc. `applyUnmountingState` запускал `.map()` по массивам `trail` и `floating`, даже если в них не было удаляемых элементов.
* **Изменения:**
  1. Проверять наличие удаляемых элементов перед вызовом `set()`, возвращая неизменный стейт.
* **Тест:** `sliceTrail.test.ts` — проверка отсутствия лишних аллокаций при закрытии несуществующего ключа.

### 1.101. Прямой метод `closeByKeyDirect` без промежуточных конвертаций индексов
* **Теория:** Direct Key-based Addressing ($O(2N) \to O(N)$). `closeByKey` вызывал `findEntryIndex`, передавал индекс в `closeFrom`, который снова искал элемент по индексу в массивах.
* **Изменения:**
  1. Реализовать прямой алгоритм `closeByKeyDirect(key, options)` с прямым сбором потомков через DAG.
* **Тест:** `sliceTrail.test.ts` — проверка закрытия карточки по прямому строковому ключу.

### 1.102. Инкапсуляция сброса корневого контроллера в `clearTrail`
* **Теория:** Encapsulation of Abort Controllers. `clearTrail` напрямую обращался к `activeControllers.get(ROOT_CONTROLLER_KEY)` и вызывал `delete`.
* **Изменения:**
  1. Делегировать отмену корневого контроллера методу `deps.abortControllersForKeys([ROOT_CONTROLLER_KEY])`.
* **Тест:** `sliceTrail.test.ts` — проверка корректной отмены сетевых запросов при полной очистке трейла.

### 1.103. Выделение `RingBuffer<T>` в чистый модуль `utils/ringBuffer.ts`
* **Теория:** Single Responsibility Principle. Класс кольцевого буфера находился внутри файла `history.ts`.
* **Изменения:**
  1. Вынести `RingBuffer<T>` в `src/lib/popover/utils/ringBuffer.ts` с полным набором unit-тестов.
* **Тест:** `ringBuffer.test.ts` — 100% покрытие переполнения, очистки и итерации кольцевого буфера.

### 1.104. Замена инлайн-сравнения массивов на `shallowEqualArray` в `history.ts`
* **Теория:** Shared Structural Equality Utils. В `history.ts` была написана ручная функция `reuseOrCloneArray` с `every((v, i) => v === next[i])`.
* **Изменения:**
  1. Использовать стандартизированную утилиту `shallowEqualArray`.
* **Тест:** `history.test.ts` — проверка повторного использования ссылок на неизменённые срезы истории.

### 1.105. Ленивая проекция таймлайна истории (`getTimelineProjection`)
* **Теория:** Zero-Allocation History Querying. Получение проекции `undo/redo` вызывало `.toArray()` на обоих кольцевых буферах, создавая временные массивы.
* **Изменения:**
  1. Предоставлять легковесную структуру с `canUndo: boolean, canRedo: boolean, undoCount: number, redoCount: number` без принудительной аллокации массивов.
* **Тест:** `history.test.ts` — проверка состояния доступности undo/redo без аллокаций.

### 1.106. Без-аллокационный сбор ключей в `openRoot` и `pushNested`
* **Теория:** Iterator vs Intermediate Array Allocation. В `openRoot` выполнялось `current.trail.map(e => e.key)` исключительно для передачи в `abortControllersForKeys`.
* **Изменения:**
  1. Принимать `Iterable<string>` в `abortControllersForKeys` и передавать ленивый генератор или `Set`.
* **Тест:** `sliceTrail.test.ts` — проверка отмены контроллеров без промежуточных массивов.

### 1.107. Чистый строитель патча сброса `createResetStatePatch`
* **Теория:** Declarative Initial State Reset. Функция `resetStoreState` собиралась вручную из свойств `storeDefaults`.
* **Изменения:**
  1. Внедрить чистый редьюсер `createResetStatePatch(defaultConfig)`.
* **Тест:** `storeDefaults.test.ts` — проверка детерминированного сброса состояния хранилища к начальным значениям.

### 1.108. Защита от зацикливания при циклических связях в `getAllDescendants`
* **Теория:** Robust Graph Traversal Guard. При случайном повреждении графа зависимостей обход потомков мог зациклиться.
* **Изменения:**
  1. Добавить строгий guard с `Set<string>` для посещенных узлов при сборе потомков.
* **Тест:** `dag.test.ts` — проверка устойчивости обхода при циклических графах.

### 1.109. Строгая типизация возвращаемых значений экшенов трейла (`void`)
* **Теория:** Return Type Monomorphism. Все методы слайса должны иметь явный тип возвращаемого значения `void`.
* **Изменения:**
  1. Явно типизировать все методы `createTrailSlice` как `(): void`.
* **Тест:** `sliceTrail.test.ts` — проверка типов через `vitest typecheck`.

### 1.110. Изоляция очистки таймеров при немедленном закрытии (`applyImmediateClose`)
* **Теория:** Explicit Cleanup Coordination. Отмена таймеров переходов вынесена в единый пайплайн.
* **Изменения:**
  1. Консолидировать вызовы `transitionScheduler.cancelAllForKeys` внутри чистой функции закрытия.
* **Тест:** `sliceTrail.test.ts` — проверка отмены всех запланированных таймеров при синхронном закрытии.

### 1.111. Оптимизация `normalizeOriginalEntry` без избыточного клонирования
* **Теория:** Referential Identity Preservation. Если свойства `parentKey`, `originalParentKey`, `originalRect` уже соответствуют целевым значениям, функция не должна создавать новый объект `{ ...entry }`.
* **Изменения:**
  1. Добавить проверку идентичности и возвращать исходную ссылку `entry`.
* **Тест:** `openReducers.test.ts` — проверка сохранения ссылки на неизменённый `entry`.

### 1.112. Шорт-серкит в `bringToFrontPatch` при уже верхнем `zIndex`
* **Теория:** Redundant State Change Elimination. Если элемент уже находится на вершине `zIndexOrder`, возвращается `EMPTY_OBJECT` без перерасчета и без триггера подписчиков.
* **Изменения:**
  1. Добавить проверку `state.zIndexOrder.at(-1) === key` перед генерацией патча.
* **Тест:** `stackReducers.test.ts` — возврат `EMPTY_OBJECT` при повторном клике по активной карточке.

### 1.113. Замена `delete nextOffsets[key]` на чистый `omitRecordKey`
* **Теория:** V8 Hidden Class De-optimization Fix. Использование оператора `delete` переводит словарь в режим хэш-таблицы (slow mode).
* **Изменения:**
  1. Заменить на утилиту `omitRecordKey(state.offsets, key)`.
* **Тест:** `pinReducers.test.ts` — проверка удаления смещения без использования `delete`.

### 1.114. Полное удаление ключей из `pinnedStates` вместо записи `false`
* **Теория:** Clean State Hygiene. В `pinReducers` и `closeReducers` при откреплении или закрытии записывалось `pinnedStates[key] = false`, раздувая объект мертвыми ключами.
* **Изменения:**
  1. Исключать ключ из объекта через `omitRecordKey(state.pinnedStates, key)`.
* **Тест:** `pinReducers.test.ts` — отсутствие ключей со значением `false` в `pinnedStates`.

### 1.115. Отложенное клонирование структур в `togglePinState`
* **Теория:** Lazy Allocation on Success Path. В `togglePinState` массивы `nextFloating`, `nextTrail` и объекты `nextPinnedStates`, `nextOffsets` создавались до проверки валидности входа.
* **Изменения:**
  1. Выполнять клонирование только после успешной верификации существования карточки.
* **Тест:** `pinReducers.test.ts` — проверка нулевых аллокаций при передаче несуществующего ключа.

### 1.116. Без-аллокационный `getDirectClosedKeys` через генераторы/итераторы
* **Теория:** Elimination of Intermediate Arrays. Функция `getDirectClosedKeys` создавала промежуточный срез массива `.slice().map()`.
* **Изменения:**
  1. Возвращать итератор по ключам трейла без промежуточных массивов.
* **Тест:** `closeReducers.test.ts` — проверка точности извлечения закрываемых ключей.

### 1.117. Использование замороженного `EMPTY_SET` в `getActiveKeys` при пустом стеке
* **Теория:** Static Empty Instance Reuse. При `floating.length === 0 && trail.length === 0` возвращался новый экземпляр `new Set()`.
* **Изменения:**
  1. Возвращать статически замороженный `EMPTY_SET`.
* **Тест:** `stackReducers.test.ts` — возврат идентичной ссылки `EMPTY_SET` при пустом сторе.

### 1.118. Однопроходный `getNextZIndexOrder` с сохранением ссылки
* **Теория:** Single-pass Z-Index Elevation. Замена двойного прохода (`filter` + `spread`) на один цикл с проверкой идентичности порядка.
* **Изменения:**
  1. Если ключ уже на вершине и все ключи валидны, возвращать исходный массив `zIndexOrder`.
* **Тест:** `stackReducers.test.ts` — проверка неизменности ссылки `zIndexOrder` при отсутствии перестановок.

### 1.119. Оптимизация `filterRecord` с быстрым возвратом `EMPTY_OBJECT`
* **Теория:** Fast-Path Empty Record Handling. Если `record` пустой (`Object.keys(record).length === 0`), `filterRecord` сразу возвращает `EMPTY_OBJECT`.
* **Изменения:**
  1. Внедрить fast-path проверку в начале `filterRecord`.
* **Тест:** `stackReducers.test.ts` — мгновенный возврат `EMPTY_OBJECT` без перебора свойств.

### 1.120. Устранение промежуточного `floating.map` в `resolveAllRemovedKeys`
* **Теория:** Direct Set Population. Создание `new Set(floating.map(e => e.key))` заменяется прямым наполнением `Set` через цикл.
* **Изменения:**
  1. Использовать прямой цикл `for...of` без вызова `.map()`.
* **Тест:** `closeReducers.test.ts` — корректность исключения закрепленных окон при каскадном закрытии.

### 1.121. Инкапсуляция нормализации `pinnedLayoutPos` в Value Object
* **Теория:** Value Object Cohesion. Функция `resolvePinnedLayoutPos` формировала анонимные координаты `{ top, left }`.
* **Изменения:**
  1. Инкапсулировать расчет и нормализацию в чистый Value Object `PinnedLayoutCoordinates`.
* **Тест:** `pinReducers.test.ts` — проверка точности фиксации экранных координат при откреплении.

### 1.122. Защита от дубликатов в `computeNextTrailForNestedPush`
* **Теория:** Idempotent Trail Mutation. Если карточка с таким же ключом уже находится в целевой позиции, возвращать `null` для предотвращения лишних патчей.
* **Изменения:**
  1. Добавить проверку равенства ключа целевого родителя.
* **Тест:** `openReducers.test.ts` — проверка предотвращения зацикливания при пуше существующего ребенка.

### 1.123. Изоляция дедупликации очередей в `getAllDescendants`
* **Теория:** Queue Memory Optimization. Очередь `queue` в `getAllDescendants` наполнялась через `[...parentKeys]`.
* **Изменения:**
  1. Использовать прямой обход графа через `dag.getDescendantKeysInto`.
* **Тест:** `dag.test.ts` — сбор всех потомков поддерева произвольной глубины.

### 1.124. Декларативный компаратор смещений `isDragOffsetEqual` в `updateOffsetState`
* **Теория:** Value Object Equality Helper. Проверка `currentOffset?.x === offset.x && currentOffset.y === offset.y` выносится в чистую утилиту `isDragOffsetEqual`.
* **Изменения:**
  1. Стандартизировать проверку эквивалентности смещений перемещения.
* **Тест:** `pinReducers.test.ts` — шорт-серкит при неизменных координатах перетаскивания.

### 1.125. Централизованный пайплайн уничтожения ресурсов `CompositeDisposable` в `destroy()`
* **Теория:** Single Responsibility Teardown & Clean Architecture. Метод `destroy()` в `slicePersistence.ts` содержал 25 строк ручного перебора и очистки каждого сервиса (`activeControllers`, `inFlightPromises`, `transitionScheduler`, `cache`, `popoverDAG`, `eventListeners`).
* **Изменения:**
  1. Вызывать единый метод `deps.dispose()` (или `deps[Symbol.dispose]()`), гарантирующий корректную и полную очистку всех зависимостей в едином месте.
* **Тест:** `slicePersistence.test.ts` — проверка полной очистки всех внутренних сервисов при вызове `destroy()`.

### 1.126. Универсальный возврат значения из `batchUpdates<R>`
* **Теория:** Ergonomic Action Execution. Сигнатура `batchUpdates` принимала `fn: (...) => void` и не возвращала вычисленное значение.
* **Изменения:**
  1. Изменить сигнатуру на `batchUpdates<R>(fn: (actions) => R): R` с возвратом результата выполнения коллбэка.
* **Тест:** `sliceTransactions.test.ts` — возврат значения из батчевого блока.

### 1.127. Выделение `transactionHelpers.ts` из `persistenceHelpers.ts`
* **Теория:** Separation of Concerns. Вспомогательные функции транзакций (`executeWithTransition`, `rollbackTransactionState`, `restoreDAGFromState`) были смешаны в файле персистентности `persistenceHelpers.ts`.
* **Изменения:**
  1. Вынести транзакционные хелперы в `src/lib/popover/store/transactions/transactionHelpers.ts`.
* **Тест:** `transactionHelpers.test.ts` — проверка отката состояния и восстановления топологии графа.

### 1.128. Замена прямого `console.error` на `logger.error` в транзакциях и регидрации
* **Теория:** Structured Logging. Прямые вызовы `console.error` заменяются на `logger.error`.
* **Изменения:**
  1. Использовать единую систему логирования с проверкой режима отладки.
* **Тест:** `sliceTransactions.test.ts` — структурированное логирование отката транзакций.

### 1.129. Единый хелпер применения снимка `applyHistorySnapshot` для `undo` и `redo`
* **Теория:** DRY in Time-Travel State Restoration. Методы `undo` и `redo` дублировали 4 строки логики восстановления DAG и наложения стейт-патча.
* **Изменения:**
  1. Выделить чистую функцию `applyHistorySnapshot(snapshot, popoverDAG, set)`.
* **Тест:** `sliceTransactions.test.ts` — проверка корректного перемещения вперед и назад по истории.

### 1.130. Шорт-серкит в `bringToFront` перед вызовом `set()`
* **Теория:** State Boundary Short-Circuiting. Метод `bringToFront` выполнял поиск `findEntryInStore` внутри сеттера `set(state => ...)`.
* **Изменения:**
  1. Проверять валидность и статус анимации до входа в `set()`, предотвращая лишние вызовы диспетчера Zustand.
* **Тест:** `slicePinning.test.ts` — отсутствие вызовов `set` при передаче некорректного ключа.

### 1.131. Прямое использование флага `isPinned` в `togglePin`
* **Теория:** Redundant Query Elimination. После вызова `set` выполнялись повторные поиски `findEntryByKey(key)` и `selectIsPinned(key)(get())`.
* **Изменения:**
  1. Определять состояние `isPinned` локально из целевого стейта без повторного сканирования массивов.
* **Тест:** `slicePinning.test.ts` — проверка эмиссии корректных событий `pin`/`unpin`.

### 1.132. Без-аллокационная сборка `keysToSave` в `persistState`
* **Теория:** Elimination of Intermediate Arrays in Persistence. Выполнялось `new Set(filteredFloating.map(e => e.key))` с созданием промежуточного массива.
* **Изменения:**
  1. Использовать цикл `for...of` для прямого наполнения `Set`.
* **Тест:** `slicePersistence.test.ts` — проверка фильтрации сохраняемых ключей.

### 1.133. Защита от `NaN`/`Infinity` при сериализации персистентных координат
* **Теория:** Defensive JSON Serialization. Нечисловые координаты могли попадать в localStorage при перетаскивании.
* **Изменения:**
  1. Добавить проверку `Number.isFinite(offset.x) && Number.isFinite(offset.y)` в `sanitizePersistedOffsets`.
* **Тест:** `persistenceHelpers.test.ts` — очистка невалидных смещений перед сохранением.

### 1.134. Изоляция синхронизации DOM-событий в `runTransition`
* **Теория:** Platform Isolation for React Transitions. Адаптер `scheduleTransition` вызывался без строгой изоляции.
* **Изменения:**
  1. Инкапсулировать вызов в чистый transition-адаптер с автоматическим SSR-фоллбеком.
* **Тест:** `sliceTransactions.test.ts` — выполнение транзишенов в среде без DOM.

### 1.135. Иммутабельный `TransactionScope` с поддержкой async/await
* **Теория:** Atomic Transaction Context. Контроллеры и состояние сохранялись в локальных переменных.
* **Изменения:**
  1. Оформить контекст транзакции в класс `TransactionScope` с методами `.commit()` и `.rollback()`.
* **Тест:** `transactionScope.test.ts` — изоляция и откат асинхронных операций.

### 1.136. Использование `safeJsonParse` с типобезопасной схемой валидации
* **Теория:** Type-Safe Schema Validation for Rehydration. Парсинг JSON из localStorage валидировал только наличие базовых полей.
* **Изменения:**
  1. Добавить Type Guard `isPersistedEnvelope` для строгой проверки структуры перед регидрацией.
* **Тест:** `persistenceHelpers.test.ts` — отсеивание некорректных JSON-структур.

### 1.137. Дедупликация слушателей в `sliceSubscriptions.ts`
* **Теория:** Listener Registry Integrity. Добавление одного и того же слушателя несколько раз должно быть идемпотентным (на базе `Set`).
* **Изменения:**
  1. Подтвердить гарантию `Set<PopoverStoreListener>` и возвращать одинаковую функцию отписки.
* **Тест:** `sliceSubscriptions.test.ts` — проверка идемпотентности подписок.

### 1.138. Оптимизация поиска позиции карточки `findEntryIndex`
* **Теория:** Monomorphic Index Search. Функция `findEntryIndex` перебирала `floating`, затем `trail`.
* **Изменения:**
  1. Использовать оптимизированный однопроходный цикл с ранним выходом.
* **Тест:** `storeHelpers.test.ts` — точность нахождения индекса во всех срезах стека.

### 1.139. Легковесный сброс счетчиков регидрации без вызова мутаций
* **Теория:** Clean Hydration Cleanup. При уничтожении стора счетчики должны обнуляться через `manager.clear()`.
* **Изменения:**
  1. Включить `hydrationManager.clear()` в пайплайн `destroy()`.
* **Тест:** `storeHydration.test.ts` — проверка очистки счетчиков при уничтожении.

### 1.140. Защита от бесконечной рекурсии в `restoreDAGFromState`
* **Теория:** Cycle-Free DAG Reconstruction. При восстановлении истории из поврежденного снимка граф мог содержать циклы.
* **Изменения:**
  1. Добавить проверку `visited` при восстановлении топологии узлов.
* **Тест:** `transactionHelpers.test.ts` — защита от циклов в топологии при восстановлении DAG.

### 1.141. Оптимизация `selectTopmostEntry` в единый проход с приоритетом
* **Теория:** Single Priority Search Pass ($O(Z + F + T)$). Избавление от трех последовательных циклов и повторяющихся вызовов `findEntryInStore`.
* **Изменения:**
  1. Проверять ключи `zIndexOrder` через быстрый Map-индекс за $O(1)$.
* **Тест:** `storeSelectors.test.ts` — точность выбора самой верхней видимой карточки.

### 1.142. Интеграция `PopoverDAG.getAncestors` в `buildBreadcrumbPath` и `selectPopoverDepth`
* **Теория:** Graph Query Delegation ($O(D)$ vs $O(N)$). На каждый вызов селекторов создавался временный `Map` через `buildEntryIndex`.
* **Изменения:**
  1. Делегировать расчет цепочки хлебных крошек и глубины методу DAG при наличии графа.
* **Тест:** `storeSelectors.test.ts` — мгновенный расчет глубины и цепочки родителей.

### 1.143. Zero-Allocation `selectTrailBranch`
* **Теория:** Elimination of Intermediate Allocations. `selectTrailBranch` создавал 2 `Set`, 2 массива после `.filter()` и результирующий spread-массив.
* **Изменения:**
  1. Однопроходный сбор совпадений в один результирующий массив.
* **Тест:** `storeSelectors.test.ts` — извлечение активной ветки трейла без лишних аллокаций.

### 1.144. Статический прототип `BASE_INITIAL_STATE` в `storeDefaults.ts`
* **Теория:** Reduction of Object Spreads in Store Factory. `getInitialStoreState` выполнял 3 последовательных спрэда объектов.
* **Изменения:**
  1. Предварительно объединить и заморозить `BASE_INITIAL_STATE = Object.freeze({ ...INITIAL_TRAIL_STATE, ...INITIAL_PINNING_STATE, ...INITIAL_CONFIG_STATE })`.
* **Тест:** `storeDefaults.test.ts` — проверка дефолтных значений и неизменности прототипа.

### 1.145. Устранение избыточных повторных присваиваний в `getInitialStoreState`
* **Теория:** Clean Typing without Runtime Re-assignments. Свойства `offsets`, `pinnedStates`, `nestedHydrationRequestCounters` перезаписывались ради тайп-кастинга.
* **Изменения:**
  1. Использовать чистый `as` без дублирования строковых ключей в коде.
* **Тест:** `storeDefaults.test.ts` — проверка структуры начального состояния.

### 1.146. Битовая матрица переходов статусов анимации `VALID_TRANSITION_STATUS_MATRIX`
* **Теория:** Bitmask State Transition Matrix. `isValidTransitionStatusChange` выполняла цепочку строковых сравнений.
* **Изменения:**
  1. Представить допустимые переходы в виде битовой маски `TRANSITION_MATRIX[current] & (1 << next)`.
* **Тест:** `fsm.test.ts` — проверка валидности переходов между фазами анимации.

### 1.147. Изоляция ошибок подписчиков FSM через `safeCallback`
* **Теория:** Listener Exception Isolation. В методе `send` вызов подписчиков содержал `try/catch` с `console.error`.
* **Изменения:**
  1. Использовать `safeCallback(fn, currentState, 'fsmSubscriber')`.
* **Тест:** `fsm.test.ts` — сбой в слушателе FSM не блокирует смену состояний.

### 1.148. Селектор монотонной ревизии состояния `selectStateRevision`
* **Теория:** Monotonic Revision Checking. Легкий селектор `selectStateRevision: (state) => state.stateRevision` для быстрой проверки изменений.
* **Изменения:**
  1. Экспортировать селектор ревизии в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — проверка инкремента ревизии при мутациях.

### 1.149. Дедупликация нормализации FSM опций в `buildInitialFSMState`
* **Теория:** Clean Options Normalization. Вспомогательная функция `buildInitialFSMState` содержала switch-case с дублированием ключа.
* **Изменения:**
  1. Вынести извлечение `context` в чистую фабрику.
* **Тест:** `fsm.test.ts` — инициализация FSM из строки или объекта параметров.

### 1.150. Защита от утечек в FSM-интерпретаторе через `[Symbol.dispose]`
* **Теория:** Explicit Resource Cleanup in FSM. Экспортировать интерфейс `ScopeDisposable` для FSM.
* **Изменения:**
  1. Реализовать `[Symbol.dispose]: () => dispose()` в объекте интерпретатора.
* **Тест:** `fsm.test.ts` — очистка слушателей FSM через синтаксис `using`.

### 1.151. Селектор проверки загрузки по ключу `selectIsEntryLoading`
* **Теория:** Direct Targeted Query. Строго типизированный селектор `selectIsEntryLoading(key)`.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — проверка статуса загрузки отдельного поповера.

### 1.152. Селектор извлечения ошибки `selectEntryError`
* **Теория:** Nullable Error Extraction. Стандартизация сигнатуры селектора ошибки `selectEntryError(key): Error | null`.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — чтение ошибки поповера.

### 1.153. Селектор извлечения данных `selectEntryData<TData>(key)`
* **Теория:** Generic Payload Selector. Параметризованный селектор для чтения данных конкретного поповера без разворачивания всего стейта.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — чтение типизированных данных.

### 1.154. Иммутабельный селектор смещения `selectEntryOffset`
* **Теория:** Fallback Value Object Reuse. Возврат статически замороженного `ZERO_OFFSET` при отсутствии смещения.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — возврат `{ x: 0, y: 0 }` для неоткрепленных окон.

### 1.155. Мономорфный селектор статуса поповера `selectEntryTransitionStatus`
* **Теория:** Transition Status Fast Query. Быстрый селектор статуса анимации (`mounting` | `mounted` | `unmounting`).
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — получение статуса перехода.

### 1.156. Чистый селектор потомков `selectEntryChildrenKeys`
* **Теория:** Child Hierarchy Query. Селектор возвращает `EMPTY_ARRAY` при отсутствии детей без создания пустых массивов.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — получение дочерних ключей.

### 1.157. Селектор родительского ключа `selectEntryParentKey`
* **Теория:** Direct Parent Key Resolution. Разрешает родительский ключ с учетом `originalParentKey`.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — получение ключа родителя.

### 1.158. Селектор проверки активности окна `selectIsEntryActive`
* **Теория:** Active Status Boolean Predicate. Проверяет наличие карточки и отсутствие статуса `unmounting`.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — проверка активности окна.

### 1.159. Оптимизация `selectDiscriminatedStatus` без аллокаций
* **Теория:** Zero-alloc Enum Query. Возвращает строковый литерал дискриминатора без промежуточных объектов.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — возврат 'idle' | 'active-trail' | 'pinned-only'.

### 1.160. Полная статическая типизация фабрики селекторов `createTypedStoreSelector`
* **Теория:** Higher-Order Selector Typing. Обеспечение сквозного вывода типов для селекторов пользовательских слайсов.
* **Изменения:**
  1. Добавить в `storeSelectors.ts`.
* **Тест:** `storeSelectors.test.ts` — проверка сквозной типизации селекторов.

### 1.161. Индексированный реестр слушателей по ключам `listenersByKey` в `PopoverEventBus`
* **Теория:** Hash-map Dispatch vs Wildcard Explosion ($O(K) \to O(1)$). Метод `onKey` подписывался на глобальный `onAny` для каждого ключа, вызывая проверку всех слушателей на каждое событие шины.
* **Изменения:**
  1. Внедрить `listenersByKey = new Map<string, Set<Listener>>()` для мгновенной адресной доставки событий конкретным поповерам.
* **Тест:** `eventBus.test.ts` — проверка адресной доставки событий карточкам без вызова чужих слушателей.

### 1.162. Замена `console.error` и `console.warn` на `logger` в `PopoverEventBus`
* **Теория:** Uniform Logging Pipeline. В `emit` и `on` прямые вызовы `console.error` заменяются на `logger.error` и `logger.warn`.
* **Изменения:**
  1. Использовать структурированный `logger.ts`.
* **Тест:** `eventBus.test.ts` — проверка логирования предупреждений о переполнении слушателей.

### 1.163. Декларативная очистка подписок EventBus через `[Symbol.dispose]`
* **Теория:** Explicit Resource Management (TS 5.2+).
* **Изменения:**
  1. Методы `on`, `onAny`, `onKey`, `once` возвращают функции-объекты с поддержкой `[Symbol.dispose]`.
* **Тест:** `eventBus.test.ts` — поддержка синтаксиса `using sub = eventBus.on(...)`.

### 1.164. Использование `safeAssign` в `storeMiddlewareEngine.ts`
* **Теория:** Prototype Pollution Defense & Monomorphic Objects. Функция `mergeSanitizedPatch` выполняла ручной перебор свойств объекта через `for...in`.
* **Изменения:**
  1. Использовать стандартизированную утилиту `safeAssign(target, source)`.
* **Тест:** `storeMiddlewareEngine.test.ts` — защита от прототипного загрязнения в промежуточном ПО.

### 1.165. Изоляция ошибок промежуточного ПО через `logger.error`
* **Теория:** Fail-safe Middleware Interception. Замена прямого `console.error` на `logger.error`.
* **Изменения:**
  1. Использовать структурированный логгер при сбоях в мидлварах.
* **Тест:** `storeMiddlewareEngine.test.ts` — логирование сбоев мидлвара без прерывания цепочки.

### 1.166. Устранение дублирования предикатов в `isSnapshotMessageEvent`
* **Теория:** DRY in Message Event Predicates. Проверка структуры `event.data` была дважды продублирована для `MessageEvent` и обычного `Event`.
* **Изменения:**
  1. Объединить в чистый Type Guard `isSnapshotPayload(data)`.
* **Тест:** `snapshotManager.test.ts` — корректная валидация межвкладочных сообщений.

### 1.167. Консолидация `sanitizePoint` в модуле `utils/dragMath.ts`
* **Теория:** Shared Math and Coordinate Sanitization. Логика `sanitizePoint` дублировалась в нескольких файлах.
* **Изменения:**
  1. Использовать единый `sanitizeDragOffset` из `dragMath.ts`.
* **Тест:** `snapshotManager.test.ts` — валидация координат при создании снимка.

### 1.168. Замена `console.warn` на `logger.warn` в `snapshotManager.ts`
* **Теория:** Uniform Warning Emission. Замена `console.warn` в `saveSnapshot` и `messageHandler` на `logger.warn`.
* **Изменения:**
  1. Использовать единый логгер.
* **Тест:** `snapshotManager.test.ts` — логирование сбоев сохранения.

### 1.169. Изоляция вызова `onSnapshotRestored` через `safeCallback`
* **Теория:** Defensive External Handler Execution. Обработка входящего межвкладочного снимка в `SnapshotManager` содержала ручной `try/catch`.
* **Изменения:**
  1. Обернуть вызов в `safeCallback(this.onSnapshotRestored, event.data, 'onSnapshotRestored')`.
* **Тест:** `snapshotManager.test.ts` — сбой в обработчике снимка не ломает прием последующих сообщений.

### 1.170. Типобезопасное расширение событий через `defineCustomEvent`
* **Теория:** Type-Safe Custom Event Registration. Создание кастомных событий выполнялось через свободные строковые литералы.
* **Изменения:**
  1. Предоставить типобезопасный билдер `defineCustomEvent<TPayload>(type)`.
* **Тест:** `eventBus.test.ts` — строгая типизация кастомных событий шины.

### 1.171. Защита от переполнения очереди `PopoverEventBus` в production
* **Теория:** High-load Event Queue Protection. При регистрации более 100 слушателей выводить предупреждение в dev-режиме, а в prod автоматически очищать мертвые ссылки через `WeakRef`.
* **Изменения:**
  1. Подключить `WeakRef`-подписчики для защиты от утечек памяти.
* **Тест:** `eventBus.test.ts` — очистка слушателей при сборке мусора.

### 1.172. Zero-Copy Snapshot Export (`exportSnapshot`)
* **Теория:** Pure Data Snapshot Pipeline. Метод `createSnapshot` выполнял глубокие копии массивов.
* **Изменения:**
  1. Использовать структурное разделение ссылок для неизменённых срезов.
* **Тест:** `snapshotManager.test.ts` — сохранение идентичности неизменённых снимков.

### 1.173. Оптимизация `areSnapshotKeysValid` без аллокаций массивов
* **Теория:** Allocation-Free Key Safety Verification. Вызовы `Object.keys(offsets)` создавали промежуточные массивы ключей.
* **Изменения:**
  1. Использовать валидацию ключей через итератор `for...in`.
* **Тест:** `snapshotManager.test.ts` — проверка безопасности ключей без создания массивов.

### 1.174. Чистый класс ошибок `PopoverStoreError` с кодами инвариантов
* **Теория:** Domain-Driven Error Handling. Ошибки выбрасывались как стандартные `Error` или кастомные структуры с разнородными полями.
* **Изменения:**
  1. Стандартизировать `PopoverStoreError` с кодами `StoreErrorCode`.
* **Тест:** `storeErrors.test.ts` — типизированная обработка ошибок стора.

### 1.175. Мемоизация селектора `selectHasEntry`
* **Теория:** O(1) Key Membership Check. Селектор `selectHasEntry(key)` выполнял линейный поиск `hasEntryWithKey` ($O(F + T)$).
* **Изменения:**
  1. Использовать быстрый `Set` активных ключей `getActiveKeysSet(state)`.
* **Тест:** `storeSelectors.test.ts` — мгновенная проверка присутствия ключа.

### 1.176. Строгая типизация возвращаемых значений `PopoverQueryBus`
* **Теория:** CQRS Query Interface Strictness. Геттеры `PopoverQueryBus` не должны допускать мутаций внутренних массивов.
* **Изменения:**
  1. Использовать `readonly` массивы и замороженные объекты для всех геттеров.
* **Тест:** `cqrs.test.ts` — проверка защиты от мутаций через геттеры шины запросов.

### 1.177. Декомпозиция `findEntryInStore` на мономорфные предикаты
* **Теория:** V8 Polymorphic Inline Cache Optimization. `findEntryInStore` принимал массивы с разнородными структурами данных.
* **Изменения:**
  1. Использовать унифицированную структуру `TrailEntry` с одинаковым скрытым классом.
* **Тест:** `storeHelpers.test.ts` — мономорфный поиск по спискам.

### 1.178. Изоляция синхронизации хранилищ через `StorageAdapter`
* **Теория:** Storage Engine Portability. Прямые обращения к `localStorage` и `sessionStorage` заменяются портативным интерфейсом `StorageAdapter`.
* **Изменения:**
  1. Вынести платформенный адаптер в `store/persistence/storageAdapter.ts`.
* **Тест:** `storageAdapter.test.ts` — проверка работы с кастомными адаптерами хранилища.

### 1.179. Автоматический сброс таймеров при отмене карточки в `sliceTrail.ts`
* **Теория:** Resource Leak Prevention on Action Cancellation. Если открытие или закрытие прерывается, связанные таймеры должны немедленно очищаться.
* **Изменения:**
  1. Автоматически вызывать `transitionScheduler.cancelHover(key)` при открытии.
* **Тест:** `sliceTrail.test.ts` — отмена запланированных ховер-таймеров при явном открытии.

### 1.180. Чистая валидация конфигурации стора `validateStoreOptions`
* **Теория:** Fail-Fast Store Configuration. Проверять входные параметры `CreatePopoverStoreOptions` на этапе инициализации стора, выбрасывая информативные ошибки до создания состояния.
* **Изменения:**
  1. Внедрить чистую функцию `validateStoreOptions(options)` на входе в `createPopoverStore`.
* **Тест:** `createPopoverStore.test.ts` — проверка выброса понятных ошибок при невалидных опциях.

### 1.181. Унифицированный хелпер управления таймерами `setManagedTimeout` в `transitionScheduler.ts`
* **Теория:** DRY in Timer Lifetime Management. Методы `scheduleBatch`, `scheduleHoverLeave`, `scheduleExitTransition` дублировали одинаковую логику установки таймера, проверки диспоуза и удаления из Map.
* **Изменения:**
  1. Выделить внутренний обобщенный метод `setManagedTimeout(map, key, duration, onComplete)`.
* **Тест:** `transitionScheduler.test.ts` — корректная установка и самоочистка таймеров по завершении.

### 1.182. Единый хелпер очистки коллекций таймеров `clearTimerMap`
* **Теория:** Loop Abstraction in Teardown. Устранение трех циклов `clearTimeout` в методе `clear()`.
* **Изменения:**
  1. Создать функцию `clearTimerMap(map: Map<any, ReturnType<typeof setTimeout>>)`.
* **Тест:** `transitionScheduler.test.ts` — полная очистка всех таймеров при вызове `clear()`.

### 1.183. Замена `console.warn` на `logger.warn` в `storeActionRegistry.ts`
* **Теория:** Structured Warning Pipeline for OCP Collisions. Предупреждение о конфликтах имён кастомных экшенов выводится через `logger.warn`.
* **Изменения:**
  1. Использовать структурированный логгер.
* **Тест:** `storeActionRegistry.test.ts` — логирование конфликтов имен действий.

### 1.184. Изоляция `undoStack` и `redoStack` внутри `HistoryManager`
* **Теория:** Information Hiding & Encapsulation. Массивы `undoStack` и `redoStack` передавались через интерфейс зависимостей `StoreHistoryService`.
* **Изменения:**
  1. Инкапсулировать управление стеками истории внутри `HistoryManager`, предоставляя только методы `.undo()`, `.redo()`, `.pushSnapshot()`, `.clear()`.
* **Тест:** `history.test.ts` — проверка инкапсуляции состояния истории.

### 1.185. Детерминированный сброс `batchSeq` в тестах `transitionScheduler.ts`
* **Теория:** Test Determinism. Монотонный счетчик `batchSeq` не имел метода сброса для модульных тестов.
* **Изменения:**
  1. Добавить `_resetBatchSeqForTesting()` в тестовом окружении.
* **Тест:** `transitionScheduler.test.ts` — детерминированные ID батчей в тестах.

### 1.186. Инкапсуляция инварианта `findEntryByKey` в `SliceContext`
* **Теория:** Slice Context Service Injection. Функция `deps.findEntryByKey` дублировала поиск по стейту.
* **Изменения:**
  1. Добавить быстрый фасад `ctx.findEntry(key)` прямо в `SliceContext`.
* **Тест:** `sliceTrail.test.ts` — нахождение записи через контекст слайса.

### 1.187. Типобезопасная фабрика кастомных слайсов `definePopoverSlice`
* **Теория:** Open-Closed Principle Slice Builder. Создание кастомных расширений требовало сложной ручной типизации дескрипторов.
* **Изменения:**
  1. Предоставить фабрику `definePopoverSlice({ name, create })`.
* **Тест:** `storeCustomSlices.test.ts` — создание кастомных слайсов через фабрику с выводом типов.

### 1.188. Быстрый шорт-серкит в `scheduleExitTransition` при `duration <= 0`
* **Теория:** Zero-Latency Synchronous Fast-Path. Если длительность анимации выхода равна 0 (или не задана), выполнять `onComplete()` синхронно в микротаске без создания макротаймера `setTimeout`.
* **Изменения:**
  1. Проверять `duration <= 0` и вызывать `deferMicrotask(onComplete)`.
* **Тест:** `transitionScheduler.test.ts` — синхронное завершение при нулевой длительности анимации.

### 1.189. Быстрый предикат `hasPendingTransitions` в `transitionScheduler.ts`
* **Теория:** Aggregate Activity Query. Легкий метод `scheduler.hasPendingTransitions()` для проверки активности любых таймеров (ховер, выход, батч).
* **Изменения:**
  1. Реализовать `return this.hoverTimers.size > 0 || this.exitTimers.size > 0 || this.batchTimers.size > 0`.
* **Тест:** `transitionScheduler.test.ts` — проверка статуса активности таймеров.

### 1.190. Атомарный сброс всех таймеров ховера `cancelAllHover`
* **Теория:** Scoped Timer Cancellation. При закрытии всего стека карточек очищать ховер-таймеры без затрагивания анимаций закрытия.
* **Изменения:**
  1. Добавить метод `cancelAllHover()`.
* **Тест:** `transitionScheduler.test.ts` — отмена только ховер-таймеров.

### 1.191. Защита от рекурсивного переполнения стека в `applyUnmountingState`
* **Теория:** Stack Overflow Guard. При одновременном закрытии глубокой иерархии (> 100 карточек) рекурсивный обход заменяется итеративным циклом.
* **Изменения:**
  1. Использовать итеративный сбор ключей через стек.
* **Тест:** `closeReducers.test.ts` — закрытие 500 вложенных поповеров без переполнения стека.

### 1.192. Оптимизация `normalizeKey` для устранения строковых аллокаций
* **Теория:** String Reference Preservation. При передаче уже нормализованного строкового ключа избегать вызова `String(key).trim()`.
* **Изменения:**
  1. Быстрая проверка `typeof key === 'string'`.
* **Тест:** `storeHelpers.test.ts` — нормализация ключей без аллокаций.

### 1.193. Стандартизация `createStatePatch` для всех редьюсеров
* **Теория:** Monomorphic State Patch Factories. Создание патчей состояния через единую чистую фабрику.
* **Изменения:**
  1. Использовать фабрики патчей во всех редьюсерах.
* **Тест:** `openReducers.test.ts` — проверка мономорфной структуры патчей.

### 1.194. Проверка `Object.is` перед записью ревизии `stateRevision++`
* **Теория:** Revision Increment Guarantee. Увеличивать `stateRevision` только если стейт-патч действительно изменил хотя бы одно поле.
* **Изменения:**
  1. Внедрить компаратор в корневой `set()` Zustand.
* **Тест:** `store.test.ts` — ревизия не инкрементируется при холостых обновлениях.

### 1.195. Типизированный `createActionContext` для изоляции зависимостей слайсов
* **Теория:** Fine-Grained Slice Context Builder. Предоставление изолированного контекста с минимальными правами для каждого слайса.
* **Изменения:**
  1. Использовать фабрику в `createStoreActions`.
* **Тест:** `storeActionRegistry.test.ts` — проверка изоляции контекста слайсов.

### 1.196. Защита от дубликатов ключей в `zIndexOrder`
* **Теория:** Array Set Invariant. Порядок `zIndexOrder` не должен содержать повторяющихся ключей.
* **Изменения:**
  1. Добавить быструю дедупликацию в `bringToFrontPatch`.
* **Тест:** `pinReducers.test.ts` — уникальность ключей в массиве zIndex.

### 1.197. Ленивая инициализация `PopoverEventBus.target`
* **Теория:** Lazy DOM EventTarget Allocation. Создавать `new EventTarget()` только при первой регистрации подписчика.
* **Изменения:**
  1. Ленивый геттер для `target`.
* **Тест:** `eventBus.test.ts` — инициализация EventTarget по требованию.

### 1.198. Декларативная очистка кэша резолвера `ResolverCacheManager.invalidate()`
* **Теория:** Cache Eviction Pipeline. Метод инвалидации кэша по префиксу или ключу карточки.
* **Изменения:**
  1. Добавить метод `.invalidate(key)` в `ResolverCacheManager`.
* **Тест:** `pipelineCache.test.ts` — точечная инвалидация записей кэша.

### 1.199. Устранение циклических ссылок в снимках персистентности
* **Теория:** Defensive JSON Snapshotting. Защита от сохранения циклических структур в `context` и `payloads`.
* **Изменения:**
  1. Использовать `safeJsonStringify` с защитой от циклов.
* **Тест:** `persistenceHelpers.test.ts` — безопасная сериализация объектов с циклическими ссылками.

### 1.200. Полное покрытие инвариантов Store через Property-Based тесты `storeInvariants.test.ts`
* **Теория:** Exhaustive Invariant Verification. Проверка 10 основных инвариантов хранилища (целостность графа, соответствие zIndex, идемпотентность пина, очистка таймеров) на случайных последовательностях действий.
* **Изменения:**
  1. Добавить комплексный генеративный тест `storeInvariants.test.ts`.
* **Тест:** `vitest run test/storeInvariants.test.ts` — 500 случайных цепочек действий без нарушения инвариантов.

---

## Категория 2: React-слой, хуки и реактивность

### 2.1. Изоморфный контракт `getServerSnapshot` для React 19 & RSC
* **Теория:** Hydration Consistency: `useSyncExternalStore` в Next.js App Router / Remix требует детерминированный серверный снимок для предотвращения hydration mismatch.
* **Изменения:**
  1. В `PopoverStoreApi` добавить метод `getServerSnapshot: () => StoreState`.
  2. Возвращать статически замороженный пустой снимок из `storeDefaults.ts` без обращения к `window`/`document`.
* **Тест:** `storeSSR.test.ts` — проверка выполнения хуков при `typeof window === 'undefined'`.

### 2.2. Мемоизация составных селекторов (`createCachedSelector`)
* **Теория:** Re-render Cascade Prevention. Вызовы `selectTopmostEntry`, `selectActiveTrail`, `selectPinnedKeys` в React-хуках без мемоизации генерируют новые ссылки на объекты/массивы, провоцируя ре-рендеры дерева.
* **Изменения:**
  1. В `storeSelectors.ts` добавить `createCachedSelector` со структурной проверкой (`shallowEqual`).
  2. Обернуть составные селекторы в кэширующие обертки.
* **Тест:** `storeSelectors.test.ts` — повторный вызов селектора на неизменённом срезе возвращает идентичную ссылку (`toBe`).

### 2.3. Рефакторинг `useDragAndDrop.ts` (Event Throttling & Math Isolation)
* **Теория:** High-frequency Event Decoupling. Обработчики перемещения (pointer/drag events) вызывают пересчет координат и перерисовку. Логика математических расчетов координат должна быть отделена от React-эффектов.
* **Изменения:**
  1. Вынести расчет смещений в чистый модуль `utils/dragMath.ts`.
  2. Интегрировать RAF-троттлинг (`requestAnimationFrame`) для синхронизации обновления координат с частотой обновления экрана.
  3. Внедрить санитайзер `sanitizeDragOffset` (`Number.isFinite`) для защиты от `NaN` / `Infinity`.
* **Тест:** `useDragAndDrop.test.ts` и `dragMath.test.ts` — проверка плавности и защиты от нечисловых координат.

### 2.4. Устранение гонок кликов и Pointer Events в `useClickOutside.ts`
* **Теория:** Event Phase Race Condition: одновременное срабатывание `pointerdown` и `touchstart` на мобильных устройствах может приводить к ложному мгновенному закрытию только что открытого поповера.
* **Изменения:**
  1. Добавить проверку фазы события и временной порог игнорирования клика-триггера (trigger click grace period ~50ms).
  2. Корректная обработка Shadow DOM (`event.composedPath()`).
* **Тест:** `useClickOutside.test.ts` — клик по триггеру не триггерит немедленный outside-close вложенного поповера.

### 2.5. Декларативная диф-синхронизация пропсов (`usePopoverPropSync`)
* **Теория:** Boilerplate & Mutation Reduction. Сейчас хук выполняет 20 отдельных проверок и вызывает 20 индивидуальных сеттеров стора (180 строк).
* **Изменения:**
  1. Переписать `usePopoverPropSync.ts` на использование единого батч-экшена `actions.updateConfig(diff)`:
     ```ts
     export function usePopoverPropSync<TData, TContext>(
       store: PopoverStoreApi<TData, TContext>,
       props: PopoverProviderProps<TData, TContext>,
     ): void {
       const prevPropsRef = useRef(props);
       useEffect(() => {
         const diff = computePropsDiff(prevPropsRef.current, props);
         if (Object.keys(diff).length > 0) {
           store.getState().actions.updateConfig(diff);
         }
         prevPropsRef.current = props;
       }, [props, store]);
     }
     ```
* **Тест:** `usePopoverPropSync.test.ts` — одновременная смена 5 пропсов вызывает ровно 1 вызов `set()`.

### 2.6. Декомпозиция мега-хука `usePopoverCard` на 3 специализированных микро-хука
* **Теория:** Single Responsibility Principle / God-Hook Smell. `usePopoverCard.ts` (216 строк) смешивает геометрию Floating UI, hover-таймеры, drag-handle, клавиатуру и фокус.
* **Изменения:**
  1. Разделить на 3 независимых хука:
     - `hooks/card/useCardPositioning.ts` — расчет координат, Floating UI и inline-стили `style`.
     - `hooks/card/useCardInteractions.ts` — hover-таймеры (`onMouseEnter`/`Leave`), drag-handle props и `handlePinToggle`.
     - `hooks/card/useCardAccessibility.ts` — перехват `Escape` / `ArrowKeys` и управление фокусом.
  2. `usePopoverCard.ts` превращается в чистую композицию из 25 строк.
* **Тест:** `usePopoverCard.test.ts` и отдельные юнит-тесты микро-хуков.

### 2.7. Выделение хука жизненного цикла `useCreatePopoverStore`
* **Теория:** Separation of Instantiation & JSX Presentation. `PopoverProvider.tsx` смешивает парсинг схем, dev-валидацию, инстанцирование через `useState` и разметку Context Provider.
* **Изменения:**
  1. Вынести создание стора в хук `context/useCreatePopoverStore.ts`.
  2. `PopoverProvider.tsx` становится компактным декларативным компонентом на 20 строк.
* **Тест:** `PopoverProvider.test.tsx` — создание и очистка инстанса стора при монтировании/размонтировании.

### 2.8. Чистка устаревшего React 16 API и ручных таймеров в `usePopoverTriggers`
* **Теория:** Modern React 19 Standards & Debounce Encapsulation. В `usePopoverTriggers.ts` вызывается `e.persist?.()` (устаревший механизм synthetic event pooling) и вручную создаются `setTimeout`/`clearTimeout` в эффектах.
* **Изменения:**
  1. Удалить вызов `e.persist?.()`.
  2. Заменить ручные таймеры на хук `useDebouncedCallback`.
  3. Сократить `usePopoverTriggerBase` с 85 до 30 строк.
* **Тест:** `usePopoverTriggers.test.ts` — проверка дебаунса открытия по ховеру и чистоты в React 19.

### 2.9. Оптимизация реактивности Undo/Redo в `usePopoverTimeline`
* **Теория:** Atomic Primitive Subscriptions. Вызов `state.canUndo?.()` внутри функции-селектора может приводить к пропуску обновлений UI, так как ссылка на метод в сторе неизменна.
* **Изменения:**
  1. Подписываться на атомарные индексы: `const canUndo = usePopoverStore((s) => s.historyIndex > 0)`.
  2. Вынести маппинг шагов истории в чистую утилиту `deriveTimelineSteps(trail, floating)`.
* **Тест:** `usePopoverTimeline.test.ts` — 100% реактивность флагов Undo/Redo при каждом шаге навигации.

### 2.10. Выделение адаптивного вьюпорта (`useViewport`) и виртуального анкора из `useFloatingSetup`
* **Теория:** Single Responsibility Principle. `useFloatingSetup.ts` (177 строк) смешивает сборку опций Floating UI с детекцией медиа-запросов окна (`window.innerWidth`) и генерацией виртуальных DOMRect анкоров.
* **Изменения:**
  1. Вынести `useMobileViewport` в `hooks/useViewport.ts`.
  2. Вынести `useVirtualAnchorElement` в `geometry/virtualAnchor.ts`.
  3. `useFloatingSetup.ts` концентрируется исключительно на сборке middleware и вызове `useFloating`.
* **Тест:** `useViewport.test.ts` и `useFloatingSetup.test.ts` — изоляция тестов медиа-запросов и SSR.

### 2.11. Устранение постоянных переподписок слушателей в `useEventListener`
* **Теория:** Re-subscription Churn Smell. В `useEventListener.ts` параметр `options` включён в массив зависимостей `useEffect`. Если вызывающий код передаёт инлайн-объект `{ passive: true }`, создаётся новая ссылка на каждый рендер, заставляя браузер непрерывно вызывать `removeEventListener` и `addEventListener` на каждый кадр.
* **Изменения:**
  1. Синхронизировать `options` через `optionsRef.current` или примитивное разложение `{ capture, passive, once }` в массиве зависимостей.
  2. Исключить постоянные переподписки при неизменных значениях опций.
* **Тест:** `useEventListener.test.ts` — проверка, что слушатель не перевешивается при повторном рендере родителя с идентичными опциями.

### 2.12. Инкапсуляция Body Scroll Lock и устранение глобального мутабельного состояния
* **Теория:** Encapsulated Side-Effects & Layout Stability. В `useCardFocusManagement.ts` глобальные переменные `activeScrollLockCount` и `originalBodyOverflow` изменяют `document.body.style.overflow` без компенсации ширины скроллбара, что вызывает скачки макета (layout shift).
* **Изменения:**
  1. Выделить изолированный хук `hooks/useBodyScrollLock.ts`.
  2. Добавить автоматическую компенсацию `padding-right: ${scrollbarWidth}px` для предотвращения скачков страницы.
  3. Добавить функцию `resetScrollLockForTesting()`.
* **Тест:** `useBodyScrollLock.test.ts` — корректный захват и освобождение блокировки при множественных поповерах.

### 2.13. Декомпозиция диспетчера клавиатурной навигации карточки (`useCardKeyboardNav`)
* **Теория:** Command / Strategy Pattern for Keyboard Events. `useCardKeyboardNav.ts` (245 строк) смешивает шорткаты, стрелочную навигацию по элементам, клики по ссылкам и каскадное закрытие карточек.
* **Изменения:**
  1. Разбить логику на изолированные стратегии:
     - `ArrowFocusStrategy` — циклический фокус по фокусируемым элементам.
     - `ParentCardFocusStrategy` — возврат фокуса на родительскую карточку при `ArrowLeft`.
     - `CustomShortcutStrategy` — обработка карты пользовательских шорткатов.
  2. Свести главный обработчик `handleCardKeyboardNavigation` к 15 строкам делегирования.
* **Тест:** `useCardKeyboardNav.test.ts` — независимое тестирование каждой стратегии.

### 2.14. Разделение хука геометрии `usePopoverGeometry` на вычисление и оверрайды
* **Теория:** Separation of Calculation and Application. `usePopoverGeometry` (191 строка) одновременно инициализирует 8 саб-хуков, собирает middleware Floating UI и накладывает адаптивные оверрайды.
* **Изменения:**
  1. Выделить `useCardFloatingCoordinates.ts` (только чистый вызов Floating UI).
  2. Выделить `useCardLayoutOverrides.ts` (наложение сдвигов каскада, пиннинга и мобильного режима).
* **Тест:** `useGeometry.test.ts` — покрытие тестами в Node.js/JSDOM без монтирования полного Floating UI.

### 2.15. Строгая типизация и бесшовный Fallback в `usePopoverOptimistic`
* **Теория:** React 19 Action Ergonomics. Хук `usePopoverOptimistic` использует размытые типы `Partial<TData>`, что может приводить к скрытым несоответствиям структуры данных при оптимистичных патчах.
* **Изменения:**
  1. Внедрить строгий тип редьюсера `OptimisticPatchReducer<TData, TAction>`.
  2. Обеспечить 100% эквивалентность поведения между нативным React 19 `useOptimistic` и полифилом на `useState` в React 18.
* **Тест:** `usePopoverOptimistic.test.ts` — тестирование в React 18 и React 19 тестовых средах.

### 2.16. Оптимизация `useClickOutside` через нативный `element.closest`
* **Теория:** Zero-Allocation Outside Click Inspection. Хук `useClickOutside` создавал объекты Result (`wrapResult`) на каждом узле в `composedPath()` на каждый клик по странице.
* **Изменения:**
  1. Использовать прямой поиск через `path.some(el => el instanceof Element && el.closest(popoverSelector))`.
  2. Кэшировать экранированные CSS-селекторы классов игнорирования.
* **Тест:** `useClickOutside.test.ts` — корректная детекция кликов вне поповеров без аллокаций.

### 2.17. Синхронизация ховер-таймеров триггера `usePopoverTriggers` с `transitionScheduler`
* **Теория:** Centralized Timer Coordination. Хук `usePopoverTriggerBase` создавал несинхронизированные локальные `setTimeout`, из-за чего закрытие поповера из стора не отменяло запланированное открытие триггера.
* **Изменения:**
  1. Подключить `actions.hoverEnter` / `transitionScheduler` для координированного управления ховером.
  2. Удалить устаревший вызов React 16 `e.persist?.()`.
* **Тест:** `usePopoverTriggers.test.ts` — проверка отмены открытия при быстром уводе курсора.

### 2.18. Мемоизация виртуального контекста `useCardFocusManagement`
* **Теория:** Unnecessary Re-render Elimination in Focus Trap. Изменение вспомогательных пропсов карточки приводило к повторной инициализации фокус-ловушки.
* **Изменения:**
  1. Стабилизировать ссылки на обработчики фокуса через `useCallback` и `useRef`.
  2. Изолировать возврат фокуса при размонтировании в чистый эффект.
* **Тест:** `usePopoverCard.test.ts` — фокус стабильно возвращается на триггер без лишних ре-рендеров.

### 2.19. Дискриминированный `usePopoverCard` со стабильным API
* **Теория:** Render Isolation for Card Subcomponents. Предотвращение ре-рендеров дочерних кнопок `<PopoverCard.CloseButton>` и `<PopoverCard.PinButton>` при смене координат перетаскивания.
* **Изменения:**
  1. Разделить возвращаемый объект `usePopoverCard` на неизменяемую часть управления и реактивные стили `style`.
* **Тест:** `usePopoverCard.test.ts` — стабильность ссылок на обработчики карточки.

### 2.20. Изоляция геометрии `useFloatingSetup` для Floating UI
* **Теория:** Cyclic Update Protection. Сборка конфигурации Floating UI может приводить к циклам обновлений при вызове `onPositionChange`.
* **Изменения:**
  1. Выделить конфигурацию Floating UI в мемоизированный хук с глубоким сравнением опций смещения.
* **Тест:** `geometryUtils.test.ts` — стабильность позиционирования без циклических ре-рендеров.

### 2.21. Устранение инверсии слоёв $L_3 \to L_4$ (Перенос `PopoverCardScopeContext` в `context/`)
* **Теория:** Clean Architecture Layer Direction. Хук `usePopoverOptimistic.ts` (Layer 3) напрямую импортировал `PopoverCardScopeContext.ts` из `components/card/` (Layer 4), создавая восходящую зависимость.
* **Изменения:**
  1. Перенести `PopoverCardScopeContext.ts` из `src/lib/popover/components/card/` в `src/lib/popover/context/PopoverCardScopeContext.ts`.
  2. Обновить импорты в `usePopoverOptimistic.ts` и `PopoverCard.tsx`.
* **Тест:** `npm run lint:arch` — отсутствие $L_3 \to L_4$ зависимостей.

### 2.22. Перенос React-адаптеров хуков из `utils/` в `hooks/adapters/`
* **Теория:** Layer 1 Purity & Separation of Concerns. В папке `utils/` (Layer 1) находились файлы `react19Adapters.ts` и `reactTransitions.ts`, импортирующие React (`useState`, `useTransition`, `startTransition`).
* **Изменения:**
  1. Переместить React-адаптеры в `src/lib/popover/hooks/adapters/`.
  2. Оставить в `utils/` только чистые математические и платформо-независимые модули.
* **Тест:** `dependency-cruiser` подтверждает 0 React-импортов в `src/lib/popover/utils/`.

---

## Категория 3: UI-компоненты и Compound Architecture

### 3.1. Замена `react-focus-lock` на легковесный встроенный Focus Trap
* **Теория:** Dependency Bloat Elimination. Внешняя зависимость `react-focus-lock` весит ~4.5 KB gzipped. Современный HTML (`inert`, `showPopover`) и Tab-перехват легко решают задачу в 40 строк кода.
* **Изменения:**
  1. Написать хук `hooks/useFocusTrap.ts` с перехватом клавиш `Tab` / `Shift+Tab` между первым и последним фокусируемым элементом внутри контейнера.
  2. Заменить `react-focus-lock` в `components/PopoverContent.tsx`.
  3. Сделать `react-focus-lock` опциональным peerDependency (с планом удаления в 2.0).
* **Тест:** `PopoverContent.test.tsx` — циклический фокус по клавише Tab внутри открытого поповера.

### 3.2. Реестр триггеров и WCAG 2.1 возврат фокуса (Focus Restoration Stack)
* **Теория:** Accessibility Focus Order. При закрытии поповера фокус обязан возвращаться на элемент, который его открыл. При программном закрытии из стора (`closeByKey`) связь триггер ↔ поповер теряется.
* **Изменения:**
  1. Добавить поле `triggerKey?: string` в `TrailEntry`.
  2. Добавить событие `restore_focus { closedKey, triggerKey }`.
  3. В `PopoverContent.tsx` подписаться на событие и автоматически вызывать `.focus()` на триггере.
* **Тест:** `sliceTrail.test.ts` и `PopoverTrigger.test.tsx` — возврат фокуса на исходную кнопку после закрытия поповера.

### 3.3. Изоляция слоя позиционирования (Ports & Adapters для Positioning)
* **Теория:** Inversion of Control. Сейчас `@floating-ui/react` жестко зашит в `useFloatingSetup.ts`. Невозможно использовать нативное позиционирование (CSS Anchor Positioning) или виртуальные координаты канваса без загрузки Floating UI.
* **Изменения:**
  1. Создать интерфейс-порт `PositioningAdapter`:
     ```ts
     export interface PositioningAdapter {
       computePosition(anchor: HTMLElement, popover: HTMLElement, options: PopoverPlacement): Promise<PositionResult>;
     }
     ```
  2. `@floating-ui` становится реализацией по умолчанию, но может быть переопределен пользователем.
* **Тест:** `geometryUtils.test.ts` — работа компонентов с кастомным синхронным адаптером позиционирования.

### 3.4. Удаление хаков приватных React Internals в `factory.tsx`
* **Теория:** API Stability & Clean Typing. В `factory.tsx` читаются `React.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` и `React.__SECRET_INTERNALS...`, что засоряет публичные типы `.d.ts` и ломается при обновлениях React.
* **Изменения:**
  1. Вынести dev-проверку в `validators/renderGuard.ts` на основе анализа стека вызовов (`new Error().stack`).
  2. Удалить `declare module 'react'` расширение.
* **Тест:** `factory.test.tsx` — стабильность при сборке типов в `vitest typecheck`.

### 3.5. Оптимизация прямого рендеринга без аллокаций в `PopoverTrail.tsx`
* **Теория:** Zero-Allocation Render Loop. `PopoverTrail.tsx` выделяет промежуточный массив `list`, пушит объекты в двух циклах и затем вызывает `.map()`.
* **Изменения:**
  1. Рендерить `floating` и `trail` напрямую в `PopoverPortal` без промежуточных массивов.
  2. Сократить компонент с 87 до 25 строк.
* **Тест:** `PopoverTrail.test.tsx` — корректный порядок рендера карточек без лишних аллокаций.

### 3.6. Фабрика полиморфных кнопок карточки `createCardActionButton` (DRY)
* **Теория:** DRY & Polymorphic Button Pattern. `PopoverCardCloseButton`, `PopoverCardPinButton`, `PopoverCardHandle` на 80% дублируют один и тот же шаблон (чтение скоупа карточки, вызов экшена, прокидывание polymorphic props).
* **Изменения:**
  1. Создать базовый компонент `CardActionButtonBase` в `components/card/CardActionButtonBase.tsx`.
  2. Переписать `PopoverCardCloseButton`, `PopoverCardPinButton`, `PopoverCardHandle` как декларативные обертки по 10–12 строк.
* **Тест:** `PopoverCardCloseButton.test.tsx`, `PopoverCardPinButton.test.tsx` — проверка доступности и обработки `disabled`.

### 3.7. Мемоизация шагов таймлайна и безопасный скоуп `PopoverTimelineSteps`
* **Теория:** Re-render Isolation. `PopoverTimelineSteps` перерисовывает все кнопки шагов цепочки при каждом движении мыши или изменении координат перетаскивания.
* **Изменения:**
  1. Выделить `PopoverTimelineStepItem` и обернуть в `React.memo`.
  2. Добавить `usePopoverTimelineScope()` с защитным `invariant` при использовании вне `<PopoverTimeline>`.
* **Тест:** `PopoverTimelineSteps.test.tsx` — предотвращение лишних перерисовок DOM-дерева.

### 3.8. Внедрение универсального механизма `Slot` и объединения событий (`utils/slot.ts`)
* **Теория:** Composition over Mutation / Headless Slot Pattern. `PopoverTrigger.tsx` (393 строки) вручную занимается клонированием (`React.cloneElement`), слиянием `ref`, склеиванием `className` и объединением событий (`composeEventHandlers`).
* **Изменения:**
  1. Реализовать стандартный компонент `<Slot>` и утилиту `mergeProps()` в `utils/slot.ts`.
  2. Переписать `PopoverTrigger.tsx` на использование `<Slot asChild>`, сократив размер компонента с 393 до ~75 строк при 100% сохранении возможностей.
* **Тест:** `PopoverTrigger.test.tsx` — корректная передача ref, событий `onClick`/`onMouseEnter` и объединение пользовательских пропсов.

### 3.9. Изоморфная гидратация портала без паразитного рендера (`PopoverPortal.tsx`)
* **Теория:** Zero-Flash Hydration. Паттерн `useState(false) + useEffect(() => setMounted(true))` в `PopoverPortal.tsx` вызывает обязательный второй каскадный рендер всего дерева портала на клиенте.
* **Изменения:**
  1. Использовать изоморфный селектор гидратации через `useSyncExternalStore(emptySubscribe, () => true, () => false)`.
  2. Устранить массив-аллокацию `formattedEntries` в цикле `PopoverPortal`.
* **Тест:** `PopoverPortal.test.tsx` — проверка чистого рендеринга без лишних фаз обновления в React 19.

### 3.10. Разделение статического и реактивного контекста карточки (`PopoverCardScopeContext`)
* **Теория:** Context Value Stability. Сейчас `PopoverCard.tsx` при каждом микро-смещении координат (`card.style`) пересоздает объект `scope`, заставляя ре-рендериться все вложенные кнопки (`Handle`, `PinButton`, `CloseButton`, `Content`).
* **Изменения:**
  1. Разделить скоуп на стабильный `PopoverCardStaticContext` (`key`, `index`, `actions`, `cardRef`) и реактивный хук `usePopoverCardState(key)`.
  2. Вложенные кнопки больше не ре-рендерятся при перемещении или анимации карточки.
* **Тест:** `PopoverCard.test.tsx` — профилирование ре-рендеров дочерних кнопок при анимации сдвига.

### 3.11. Автоматический полиморфный `aria-label` рендерер без ручного `useMemo` (`utils/a11y.ts`)
* **Теория:** Clean Accessibility Propagation. Вычисление `ariaLabel` в `PopoverCard.tsx` дублирует fallback-форматирование и создает лишний `useMemo`.
* **Изменения:**
  1. Вынести нормализацию ARIA-атрибутов в чистую функцию `resolveA11yAttributes(props, defaultLabel)` в `utils/a11y.ts`.
* **Тест:** `a11y.test.ts` — проверка генерации доступных меток для экранных дикторов.

### 3.12. Составной компонент `PopoverCard.Header` (Compound Component Completeness)
* **Теория:** Ergonomic Compound API. Пользователям приходится вручную собирать flex-контейнер для верхней панели карточки, совмещая `PopoverCard.Handle`, `PopoverCard.PinButton` и `PopoverCard.CloseButton`.
* **Изменения:**
  1. Добавить `components/card/PopoverCardHeader.tsx` со встроенной поддержкой drag-handle и автоматическим выравниванием кнопок.
  2. Экспортировать как `PopoverCard.Header`.
* **Тест:** `PopoverCardHeader.test.tsx` — проверка доступности и перетаскивания за шапку.

### 3.13. Стабилизация `PopoverCardScopeContext` (Split Context Pattern)
* **Теория:** Context Value Stability & Subcomponent Render Isolation. При каждом микро-смещении drag-координат карточки пересоздавался единый контекст `scope`, вызывая ре-рендер всего содержимого и кнопок.
* **Изменения:**
  1. Разделить контекст на стабильный `CardStaticContext` (ключ, экшены, ref) и динамический `CardDynamicContext` (стили, координаты, статус анимации).
* **Тест:** `PopoverCard.test.tsx` — проверка отсутствия лишних ре-рендеров кнопок шапки при перетаскивании.

### 3.14. Slot-архитектура для `<PopoverCard.Handle>` (`asChild` паттерн)
* **Теория:** Headless Composition for Drag Handles. Позволяет делать любую произвольную область карточки (заголовок, иконку) ручкой перетаскивания без создания лишних оберточных `div`.
* **Изменения:**
  1. Внедрить поддержку `asChild` в `<PopoverCard.Handle>`.
* **Тест:** `PopoverCardHandle.test.tsx` — перетаскивание за кастомный элемент заголовка.

### 3.15. Стандартизация ARIA live-regions в `<PopoverTimeline>`
* **Теория:** Accessibility Live Regions. Пользователи скринридеров должны получать уведомления при переходе по шагам истории.
* **Изменения:**
  1. Добавить `aria-live="polite"` и `aria-current="step"` для активного элемента цепочки таймлайна.
* **Тест:** `PopoverTimelineSteps.test.tsx` — проверка наличия доступных атрибутов для ассистивных технологий.

### 3.16. Автоматический Portal Container Cleanup в `<PopoverPortal>`
* **Теория:** DOM Cleanliness on Idle State. Контейнер портала в `document.body` оставался в DOM даже после полного закрытия всех карточек.
* **Изменения:**
  1. Удалять DOM-контейнер портала при переходе стора в состояние `isIdle` (0 активных карточек).
* **Тест:** `PopoverPortal.test.tsx` — контейнер удаляется из DOM при очистке стека поповеров.

---

## Категория 4: Утилиты, алгоритмы и структуры данных

### 4.1. Декомпозиция grab-bag файла `utils/storeHelpers.ts`
* **Теория:** Single Responsibility Principle. Файл `storeHelpers.ts` содержит более 30 разнородных функций (DOM, массивы, промисы, поиск).
* **Изменения:** Разбить на специализированные модули:
  - `utils/collections.ts` — `findEntryInStore`, `findEntryIndex`, `patchEntryInLists`, `filterRecord`.
  - `utils/domUtils.ts` — `isElement`, `getActiveElement`, `getScrollParent`.
  - `utils/asyncUtils.ts` — `isPromise`, `sleep`, `deferMicrotask`.
  - В `storeHelpers.ts` оставить только фасад реэкспорта с `@deprecated` метками.
* **Тест:** Существующие тесты утилит раскладываются по колоцированным файлам `collections.test.ts`, `domUtils.test.ts`, `asyncUtils.test.ts`.

### 4.2. Встроенный LRU-кэш с защитой от утечек памяти (`createLRUCache`)
* **Теория:** Unbounded Memory Growth: стандартный кэш резолвера растет бесконечно при навигации по сотням поповеров.
* **Изменения:**
  1. Модуль `store/resolver/lruCache.ts` (`createLRUCache<TData>` с `maxSize = 50` и O(1) доступом на `Map`).
  2. Использовать `createLRUCache` по умолчанию в фабрике резолвера.
* **Тест:** `pipelineCache.test.ts` — добавление $N+1$ элемента удаляет наименее используемый (LRU).

### 4.3. Оптимизация пространственного индекса (QuadTree & Spatial Search)
* **Теория:** Spatial Indexing Complexity. Для определения пересечений и коллизий плавающих карточек (`utils/quadTree.ts`) требуется эффективная очистка и перестройка при перетаскивании.
* **Изменения:**
  1. Внедрить пул объектов для узлов дерева (`utils/objectPool.ts`), предотвращающий сборку мусора (GC pressure) при 60 FPS перетаскивании.
  2. Добавить санитарную валидацию границ `RectBounds` (защита от отрицательной ширины/высоты).
* **Тест:** `quadTree.test.ts` — проверка корректности поиска коллизий на 1000 сгенерированных прямоугольниках.

### 4.4. Изоляция чистых DOM-предикатов клика (`utils/domGuards.ts`)
* **Теория:** Pure DOM Boundary. Логика проверки попадания клика в портал (`data-popover-portal`) или игнорируемый триггер должна быть чистой функцией, не завязанной на React-хуки или состояние Zustand.
* **Изменения:**
  1. Создать `utils/domGuards.ts`: `isClickInsidePortal(e, portalKey)`, `isClickOnIgnoredTrigger(e, triggerElement)`.
  2. Использовать в `useClickOutside.ts`.
* **Тест:** `domGuards.test.ts` — проверка кликов по DOM-дереву в чистом JSDOM.

### 4.5. Унификация логирования и DI в `resizeObserverRegistry.ts`
* **Теория:** Centralized Logging & Test Isolation. Прямой вызов `console.error` обходит настройки дебага.
* **Изменения:**
  1. Заменить `console.error` на `utils/logger.ts` с вырезанием в проде.
  2. Добавить `resetRegistryForTesting()` для чистки между тестами.
* **Тест:** `resizeObserverRegistry.test.ts` — тихий лог в проде и изоляция в Node/JSDOM.

### 4.6. Доменные Value Objects (`ZIndex`, `DurationMs`, `PopoverKey`) & Защита инвариантов
* **Теория:** Primitive Obsession Smell. Использование сырых примитивов (`number` для задержек/zIndex, `string` для ключей) заставляет многократно писать `Math.max(0, val)` и `isFinite()`.
* **Изменения:**
  1. Внедрить легковесные Value Objects в `utils/valueObjects.ts`:
     - `ZIndex` — гарантирует целое положительное число, предоставляет методы `.next()`, `.elevate(step)`.
     - `DurationMs` — гарантирует неотрицательное конечное число миллисекунд.
     - `PopoverKey` (брендированный тип) — создается через фабрику `createPopoverKey(str)` с проверкой на пустые строки и запрещенные символы.
  2. Валидация инвариантов происходит строго на границе создания объектов, а внутреннее ядро работает со 100% валидными данными.
* **Тест:** `valueObjects.test.ts` — проверка отсечения некорректных значений (`NaN`, отрицательные числа, пустые ключи).

### 4.7. Единый Railway-Oriented Result-контракт и таксономия `PopoverError`
* **Теория:** Unified Error Handling (Railway-Oriented Programming). Разные модули библиотеки сообщают об ошибках несогласованно: `rehydrateState` возвращает `boolean`, резолвер бросает `Promise.reject()`, утилиты используют `wrapResult`, а JSON-парсер логирует в консоль.
* **Изменения:**
  1. Стандартизировать все операции с потенциальными сбоями через `Result<T, PopoverError>` из `utils/result.ts`.
  2. Создать иерархию типов ошибок в `utils/errors.ts`:
     ```ts
     export type PopoverError =
       | { readonly code: 'INVALID_KEY'; readonly key: string }
       | { readonly code: 'RESOLVER_FAILURE'; readonly cause: unknown }
       | { readonly code: 'STORAGE_CORRUPTED'; readonly raw: string }
       | { readonly code: 'CYCLE_DETECTED'; readonly from: string; readonly to: string }
       | { readonly code: 'ABORTED'; readonly reason?: string };
     ```
  3. Все методы персистентности, резолвера и парсинга возвращают типизированный `Result`.
* **Тест:** `result.test.ts` и `errors.test.ts` — проверка комбинаторов (`map`, `flatMap`, `match`, `unwrapOr`).

### 4.8. Рефакторинг констант: замена SCREAMING_SNAKE_CASE на структурированный camelCase
* **Теория:** Visual Noise Reduction & Modern TypeScript Standards. Громоздкие капс-константы (`POPOVER_DEFAULTS.TIMING.HOVER_OPEN_DELAY`) создают визуальный шум и не совпадают с именами пропсов `camelCase`.
* **Изменения:**
  1. В `src/lib/popover/constants.ts` внедрить структурированный конфиг `defaultPopoverConfig` с `as const`:
     ```ts
     export const defaultPopoverConfig = {
       timing: {
         hoverOpenDelay: 200,
         hoverLeaveDelay: 300,
         exitTransitionDuration: 0,
       },
       layout: {
         cascadeStep: 8,
         defaultOffset: 8,
         collisionPadding: 12,
       },
       viewport: {
         mobileBreakpoint: 640,
       },
       zIndex: {
         base: 1000,
         step: 10,
       },
     } as const;
     ```
  2. Для старых констант (`DEFAULT_CASCADE_OFFSET_STEP`, `DEFAULT_BASE_Z_INDEX`) оставить псевдонимы с `@deprecated` метками до версии 2.0.
* **Тест:** `constants.test.ts` — проверка структуры, неизменяемости и корректности значений по умолчанию.

### 4.9. Говорящие доменные предикаты (Intention-Revealing Predicates в `utils/predicates.ts`)
* **Теория:** Intention-Revealing Code. Сложные составные булевы выражения (например, `state.floating.some(e => e.key === key) || state.trail.some(e => e.key === key)`) создают когнитивную нагрузку и затрудняют чтение.
* **Изменения:**
  1. Вынести составные проверки в чистые именованные предикаты в `utils/predicates.ts`:
     - `isPopoverActive(state, key): boolean`
     - `shouldTrackFloatingGeometry(params): boolean`
     - `hasAnimationClassNamesChanged(prev, next): boolean`
     - `isDescendantInDAG(dag, parentKey, childKey): boolean`
  2. Заменить инлайн-условия во всех хуках и слайсах на вызовы предикатов.
* **Тест:** `predicates.test.ts` — юнит-тесты граничных условий предикатов.

### 4.10. Диагностические ошибки с контекстом выполнения (Fail-Fast Diagnostic Invariants)
* **Теория:** Context-Rich Diagnostics. Ошибки вида `throw new Error('Key not found')` не содержат контекста, что затрудняет отладку сбоев в проде.
* **Изменения:**
  1. Улучшить `utils/invariant.ts` для поддержки генераторов диагностических ошибок:
     ```ts
     invariant(
       condition,
       () => new PopoverNotFoundError(key, {
         trailKeys: state.trail.map(e => e.key),
         floatingKeys: state.floating.map(e => e.key),
       })
     );
     ```
  2. Ошибки несут снимок состояния и моментально локализуют причину проблемы.
* **Тест:** `invariant.test.ts` — проверка генерации детального диагностического контекста при сбоях.

### 4.11. Устранение скрытого дефекта Shallow-копирования в фоллбеке `fastClone` (`utils/clone.ts`)
* **Теория:** Deep Clone Integrity. При отказе `structuredClone` (например, при наличии функций/DOM-узлов во внешних полях) строка `return { ...obj }` выполняет поверхностное копирование вложенных обычных объектов, что нарушает изоляцию снимков состояния.
* **Изменения:**
  1. Реализовать полноценный рекурсивный обход plain-объектов в fallback-ветке `fastClone`:
     ```ts
     const copy: Record<string, unknown> = {};
     for (const [k, v] of Object.entries(obj)) {
       if (!isUnsafeKey(k)) copy[k] = fastClone(v);
     }
     return copy as T;
     ```
* **Тест:** `clone.test.ts` — проверка глубокой изоляции вложенных объектов при отказе `structuredClone`.

### 4.12. Устранение дублирования кэша стилей и чистый Knuth-хэш (`utils/styles.ts`)
* **Теория:** DRY Cache & Encapsulated Hashing. В `styles.ts` реализован собственный примитивный кэш с ручным удалением первого ключа, дублирующий `createLRUCache`.
* **Изменения:**
  1. Заменить самодельный `styleMemoCache` на экземпляр `createLRUCache<number, CSSProperties>(128)` из `utils/cache.ts`.
  2. Вынести мультипликативное Knuth-хэширование координат в отдельную чистую функцию `hashTransformCoordinates`.
* **Тест:** `styles.test.ts` — корректность генерации `transform3d` и ограничение размера кэша 128 элементами.

### 4.13. Zero-Allocation извлечение опций отображения (`utils/displayOptions.ts`)
* **Теория:** Zero Garbage Collection Pressure. Функция `extractDisplayOptions` на каждой итерации из 27 ключей вызывала `Object.assign(extracted, { [key]: val })`, создавая до 27 временных объектов на каждый клик или наведение мыши.
* **Изменения:**
  1. Заменить `Object.assign` в цикле на прямое присвоение свойства по ключу: `extracted[key] = val`.
  2. Заменить константу `DISPLAY_OPTION_KEYS` на `camelCase` объект `displayOptionKeySet`.
* **Тест:** `displayOptions.test.ts` — совпадение извлекаемых опций при нуле аллокаций промежуточных объектов.

### 4.14. Консолидация предикатов DOM-событий (`utils/domEvents.ts` $\to$ `utils/domGuards.ts`)
* **Теория:** High Cohesion for DOM Utilities. Функции проверки `isPortalOrExcludedTarget` и поиск в `composedPath()` дублируют логику проверки `domGuards.ts`.
* **Изменения:**
  1. Объединить DOM-предикаты кликов, порталов и исключений в единый модуль `utils/domGuards.ts`.
  2. Использовать быстрый нативный `element.closest('[data-popover-portal]')` с поддержкой Shadow DOM.
* **Тест:** `domGuards.test.ts` — проверка кликов внутри и вне порталов с Shadow DOM.

### 4.15. Инкапсуляция мутаций топологии DAG (`utils/dag.ts`)
* **Теория:** Information Hiding & Defensive Encapsulation. Поле `DAGNode.childrenKeys` открыто для прямой мутации снаружи, что может привести к нарушению связей графа в обход методов `PopoverDAG`.
* **Изменения:**
  1. Сделать `childrenKeys` внутри `DAGNode` доступным только для чтения (`ReadonlySet<TPopoverKey>`).
  2. Все операции изменения родителя, добавления и удаления потомков выполнять строго через методы класса `PopoverDAG`.
* **Тест:** `dag.test.ts` — проверка целостности топологического порядка и обнаружения циклов.

### 4.16. Zero-Allocation `clsx` (Fast-Path Strings & Objects)
* **Теория:** Allocation-Free Class Name Composition. Оптимизация утилиты `clsx.ts` для объединения строк и условных классов без создания промежуточных массивов.
* **Изменения:**
  1. Внедрить быстрый путь для двух-трех аргументов с прямым слиянием строк.
* **Тест:** `clsx.test.ts` — 100% совместимость со спецификацией clsx.

### 4.17. Мемоизация CSS-селекторов в `domGuards.ts`
* **Теория:** Selector Sanitization Caching. Кэширование скомпилированных `CSS.escape` селекторов для предотвращения повторного экранирования строк на каждом событии.
* **Изменения:**
  1. Использовать `Map<string, string>` для кэширования экранированных селекторов.
* **Тест:** `domGuards.test.ts` — корректность экранирования спецсимволов.

### 4.18. Алгоритм поиска ближайшего фокусируемого элемента в `domGuards.ts` (`findNextFocusable`)
* **Теория:** Fast Focus Navigation. Быстрый поиск следующего интерактивного элемента по табуляции без полного сканирования всего DOM-дерева.
* **Изменения:**
  1. Реализовать направленный поиск через `TreeWalker` с фильтром по `tabIndex >= 0`.
* **Тест:** `domGuards.test.ts` — нахождение первого и последнего фокусируемого элемента.

### 4.19. Оптимизация `safeKeys.ts` через битовую карту запрещенных ключей
* **Теория:** Fast Prototype Pollution Prevention. $O(1)$ проверка prototype pollution (`__proto__`, `constructor`, `prototype`) через замороженный `Set` в верхнем регистре.
* **Изменения:**
  1. Использовать статический frozen `Set` запрещенных идентификаторов.
* **Тест:** `safeKeys.test.ts` — защита от внедрения прототипных свойств.

### 4.20. Изоляция `dragMath.ts` с поддержкой CSS-трансформаций (`scale` и `zoom`)
* **Теория:** Matrix Transform Geometry. Корректный расчет экранных координат при перетаскивании карточек внутри масштабированных контейнеров (`transform: scale(...)` или `zoom`).
* **Изменения:**
  1. Учитывать масштаб родительского контейнера при вычислении `deltaX` и `deltaY`.
* **Тест:** `dragMath.test.ts` — расчет смещений с масштабным коэффициентом.

### 4.21. Zero-GC оптимизация `shallowEqual` без аллокаций `Object.keys()`
* **Теория:** Allocation-Free State Selector Comparisons. Вызов `Object.keys(obj)` аллоцирует временные массивы строк в куче на каждый вызов селектора или тик drag-хэндлера.
* **Изменения:**
  1. В `src/lib/popover/utils/equality.ts` переписать `shallowEqual` на однопроходный цикл `for (const key in a)` с предварительным подсчетом количества собственных ключей через `Object.hasOwn`.
  2. Исключить создание временных массивов строк в горячих путях.
* **Тест:** `equality.test.ts` — 100% эквивалентность результатов работы и $\text{Alloc} = 0\text{ bytes}$.

### 4.22. Экстракция алгоритмов клампинга координат из `dnd.tsx` в `utils/dragMath.ts`
* **Теория:** Layer 4 Math Purity. Модуль `dnd.tsx` (Layer 4) содержал функции расчета ограничивающих прямоугольников `clampCoordinateToBounds`, `clampToWindowBounds`, `clampToContainerBounds`.
* **Изменения:**
  1. Перенести алгоритмы клампинга в `src/lib/popover/utils/dragMath.ts` (Layer 1).
  2. Оставить в `dnd.tsx` исключительно реактивные вызовы и JSX-разметку.
* **Тест:** `dragMath.test.ts` — тестирование удержания карточки в границах окна и контейнера.

---

## Категория 5: Типизация, интерфейсы и DX

### 5.1. Консолидация таксономии типов состояния
* **Теория:** Conceptual Overload. В проекте сосуществуют три пересекающихся типа: `StoreState`, `PopoverStateData`, `PopoverStore`.
* **Изменения:**
  1. В шапке `types/storeTypes.ts` добавить матрицу ролей:
     - `StoreState` — минимальный срез данных состояния (чистый интерфейс).
     - `PopoverStore` — полный тип стора Zustand (включая методы).
     - `PopoverStateData` — публичный фасад для потребителей.
  2. Новые внутренние функции типизировать через минимальные срезы (`HasTrailState`, `HasFloatingState`).
* **Тест:** `storeTypes.test-d.ts` — проверка совместимости типов.

### 5.2. Type-level тестирование (Предотвращение регрессий компилятора)
* **Теория:** Type Regression Prevention: рантайм-тесты не ловят деградацию типов дженериков (`TData`, `TContext`, `TPopoverKey`) или случайное выпадение в `any`.
* **Изменения:**
  1. Создать тесты типов `src/lib/popover/**/*.test-d.ts` через `vitest` / `expectTypeOf`.
  2. Тестировать вывод типов селекторов, запрет некорректных ключей и брендированные типы (`DomainPopoverKey`).
  3. Добавить команду `"test:types": "vitest typecheck"` в CI.
* **Тест:** CI шаг `test:types` зеленый.

### 5.3. Устранение «Boolean Trap» в сигнатурах функций (Options Objects & Enums)
* **Теория:** Self-Documenting Function Signatures. Позиционные булевы аргументы вроде `closeKeys(keys, true, false)` или `renderCard(entry, index, true)` создают загадки в месте вызова.
* **Изменения:**
  1. Заменить булевы флаги в сигнатурах на типизированные объекты опций:
     ```ts
     // Было: closeKeys(keys, true, false)
     // Стало:
     export interface ClosePopoverOptions {
       readonly origin?: 'user' | 'cascade' | 'programmatic';
       readonly animated?: boolean;
     }
     closeKeys(keys: readonly string[], options?: ClosePopoverOptions);
     ```
  2. Использовать дискриминированные союзы вместо цепочек флагов.
* **Тест:** Проверка типов `vitest typecheck` на новых сигнатурах.

### 5.4. Искоренение силового приведения типов (`as any`, `as unknown as`) через Type Guards
* **Теория:** Type Safety Enforcement (Boy Scout Rule for Types). Силовые приведения типов `(el as HTMLElement).focus()` или `props as any` маскируют потенциальные runtime-сбои `null`/`undefined`.
* **Изменения:**
  1. Внедрить строгие Type Guards в `utils/domGuards.ts`:
     - `isFocusableElement(target: unknown): target is HTMLElement & { focus: () => void }`
     - `isValidDOMElement(node: unknown): node is HTMLElement`
     - `isValidReactComponent(val: unknown): val is ElementType`
  2. Заменить все силовые `as` на безопасные проверки через предикаты.
* **Тест:** `domGuards.test.ts` — проверка корректности фильтрации `null`, `undefined`, текстовых узлов и SVG.

### 5.5. Строгий Discriminated Union для `TrailEntry` (Автоматический Type Narrowing)
* **Теория:** Making Invalid States Unrepresentable. Сейчас интерфейс `TrailEntry` содержит опциональные поля `status?`, `data?`, `error?`, `isLoading?`, что допускает невалидные комбинации (например, `status: 'success'`, но `data: undefined`) и требует non-null assertion `entry.data!`.
* **Изменения:**
  1. Переписать `TrailEntry` как дискриминированный союз 4 состояний:
     ```ts
     export type TrailEntry<TData = unknown, TPopoverKey extends string = string> =
       | IdleTrailEntry<TPopoverKey>
       | LoadingTrailEntry<TPopoverKey>
       | SuccessTrailEntry<TData, TPopoverKey>
       | ErrorTrailEntry<TPopoverKey>;
     ```
  2. При проверке `if (entry.status === 'success')` поле `entry.data` автоматически сужается компилятором TypeScript до типа `TData`.
* **Тест:** `entryTypes.test-d.ts` — проверка автоматического сужения типов данных и ошибок в блоках `switch (entry.status)`.

### 5.6. Кросс-версионные полиморфные типы React 18/19 (`PolymorphicComponentProps`)
* **Теория:** Cross-Version React Typing. В React 19 проп `ref` стал стандартным атрибутом функции компонента без необходимости оборачивать компонент в `forwardRef`.
* **Изменения:**
  1. В `types/polymorphicTypes.ts` обновить утилиту `PolymorphicPropsWithRef<E, P>` с прозрачной поддержкой `ref` в React 18 и React 19.
  2. Исключить коллизии типов `as` с HTML-атрибутами.
* **Тест:** `polymorphicTypes.test-d.ts` — проверка вывода типов `ref` для нативных HTML-тегов (`button`, `a`, `div`) и кастомных React-компонентов.

### 5.7. Брендированные типы `PopoverKey` (`Branded<string, 'PopoverKey'>`)
* **Теория:** Domain-Driven Nominal Typing. Защита от передачи произвольных невалидных строк в качестве ключей поповера на уровне компилятора.
* **Изменения:**
  1. Внедрить вспомогательный конструктор `makePopoverKey(str: string): PopoverKey`.
* **Тест:** `types.test-d.ts` — запрет передачи сырых невалидированных строк без конструктора.

### 5.8. Строгая декларация `ExactOptional` для опций отображения
* **Теория:** Exact Optional Property Types. Гарантия отсутствия `undefined` там, где требуются точные значения параметров позиционирования.
* **Изменения:**
  1. Применить `ExactOptionalParameters` к интерфейсам конфигурации позиционирования и таймингов.
* **Тест:** `types.test-d.ts` — компилятор требует явного указания значений при передаче опций.

### 5.9. Устранение бага «Phantom Optional Brand» в `types/branded.ts`
* **Теория:** Real Nominal Branded Soundness. В `types/branded.ts:23` бренд `Brand<T, B>` был объявлен как `{ readonly [__brandSymbol]?: B }`. Из-за опционального знака `?` любая сырая строка `string` проходила проверку как `PopoverKey`.
* **Изменения:**
  1. Сделать брендовый символ строго обязательным: `export type Brand<T, B extends string> = T & { readonly [__brandSymbol]: B };`.
  2. Добавить фабрику `toPopoverKey(k: string): PopoverKey` и гард `isPopoverKey(v: unknown): v is PopoverKey`.
* **Тест:** `branded.test-d.ts` — попытка присвоить `string` переменной `PopoverKey` вызывает ошибку `TS2322`.

### 5.10. Тотальные функции и хелпер `assertNever`
* **Теория:** Compile-Time Exhaustive Pattern Matching. Запрет «слепых» `default:` блоков в `switch`, которые скрывают новые неразобранные состояния.
* **Изменения:**
  1. Создать `src/lib/popover/utils/assertNever.ts`.
  2. Заменить fallback `default:` в FSM, `matchEntryState` и редьюсерах на `assertNever(state)`.
* **Тест:** При добавлении нового состояния в союз компилятор TypeScript мгновенно подсвечивает все места без обработки.

### 5.11. Включение `exactOptionalPropertyTypes: true` и статический `types.test-d.ts`
* **Теория:** Sound Type Verification. Устранение расхождений `{ prop: undefined }` vs `{ prop?: T }` и внедрение утилит `Expect<Equal<A, B>>`.
* **Изменения:**
  1. Включить `"exactOptionalPropertyTypes": true` в `tsconfig.app.json`.
  2. Добавить `src/lib/popover/types/types.test-d.ts` со статическими проверками типов дженериков без рантайм-накладных расходов.
* **Тест:** `npm run typecheck` — 0 ошибок при строгом режиме опциональных свойств.

---

## Категория 6: Бандлинг, модульный экспорт и оптимизация размера

### 6.1. Выделение изолированного экспорта `popover-trail/store`
* **Теория:** Granular Packaging. Headless-пользователям библиотеки нужен только стейт-менеджер (~5 KB) без компонентов React и Floating UI.
* **Изменения:**
  1. В `package.json` настроить субпуть `"./store"` (точка входа `src/lib/popover/store/index.ts`).
  2. В `tsup.config.ts` добавить отдельную точку сборки.
* **Тест:** `publint` проходит; бандл `dist/store.js` весит $\le 7$ KB min+gzip и не содержит импортов React DOM.

### 6.2. Dead Code Elimination (DCE) для Production
* **Теория:** Production Payload Optimization. Отладочные логи, подробные строки ошибок и `Object.freeze` нужны только при разработке.
* **Изменения:**
  1. Обернуть dev-логи и проверки FSM в `if (process.env.NODE_ENV !== 'production')`.
  2. Заменить строковые ошибки на компактные коды `PopoverErrorCode`.
  3. В `tsup.config.ts` включить `target: 'es2022'`, `minify: 'terser'` с `passes: 2` и вырезанием `console.debug`.
* **Тест:** В продакшн-сборке `dist/index.js` отсутствуют dev-префиксы и отладочный код.

### 6.3. Автоматизация генерации `.d.ts` / `.d.cts` деклараций в `tsup`
* **Теория:** Build Script Cleanliness. Текущий скрипт `build:lib` содержит хрупкую inline-команду Node.js `fs.copyFileSync`, вручную дублирующую файлы деклараций для ESM/CJS.
* **Изменения:**
  1. Настроить в `tsup.config.ts` автоматическую параллельную генерацию типов: `dts: { resolve: true }`.
  2. Очистить скрипты `package.json` до простого `tsup`.
* **Тест:** `npm run check:pub` — валидация типов в ESM и CJS режимах без ошибок `publint`.

### 6.4. Модульный subpath-экспорт `popover-trail/utils` для независимых алгоритмов
* **Теория:** Tree-Shakable Pure Utilities. Математика смещений, QuadTree, алгоритмы DAG и Result-типы могут использоваться в других проектах независимо от UI-библиотеки.
* **Изменения:**
  1. Добавить субпуть `"./utils"` в `package.json` с точкой входа `src/lib/popover/utils/index.ts`.
* **Тест:** Бандл `dist/utils.js` весит $< 3$ KB и не тянет за собой React и Zustand.

---

## Категория 7: Архитектурные гарантии, тестирование и CI

### 7.1. Автоматический контроль границ через `dependency-cruiser`
* **Теория:** Architectural Erosion Prevention. Правила слоёв должны проверяться машиной на каждом PR.
* **Изменения:** Конфиг `.dependency-cruiser.cjs`:
  1. `reducers` **никогда** не импортируют `slices`, `eventBus`, `zustand`, `react`.
  2. `utils` **никогда** не импортируют `store`, `components`, `context`.
  3. `store` **никогда** не импортирует `components` и `@floating-ui/*`.
  4. Глобальный запрет циклических зависимостей.
* **Тест:** Команда `npm run lint:arch` в CI.

### 7.2. Property-Based тестирование чистых инвариантов (`fast-check`)
* **Теория:** Comprehensive Invariant Testing. Тестирование чистых функций на сотнях случайно сгенерированных входов вместо ручных тест-кейсов.
* **Изменения:** Добавить тесты `fast-check` для:
  - `filterRecord` (идемпотентность, сохранение ключей).
  - `resolveAllRemovedKeys` в графе DAG (отсутствие циклов, полнота удаления потомков).
  - `getNextZIndexOrder` (сохранение относительного порядка).
* **Тест:** `npm test` прогоняет 200 итераций генеративных тестов.

### 7.3. Контроль размера бандла (`size-limit`) и покрытие кода
* **Изменения:**
  1. Настроить `.size-limit.json`: `popover-trail/store <= 7 KB`, `popover-trail <= 18 KB`.
  2. Добавить сбор покрытия `@vitest/coverage-v8` с порогом ratchet для `store/` $\ge 90\%$.
* **Тест:** CI падает, если размер бандла превысил лимит.

### 7.4. Регрессионное тестирование на утечки памяти (`FinalizationRegistry`)
* **Теория:** Memory Leak Protection. При открытии и закрытии 1000 поповеров ссылки на DOM-элементы, таймеры и слушатели должны собираться Garbage Collector.
* **Изменения:**
  1. Написать тест памяти `memoryLeaks.test.ts` с использованием Node.js `v8.setFlagsFromString('--expose_gc')` и `FinalizationRegistry`.
  2. Проверять сборку мусора для размонтированных экземпляров карточек и сторов.
* **Тест:** `vitest run test/memoryLeaks.test.ts` — 0 неочищенных объектов после сборки мусора.

### 7.5. Детерминированный бенчмаркинг задержки переходов (Action Latency Benchmarks)
* **Теория:** Performance Regression Defense. Время выполнения синхронного редюсера и коммита состояния не должно превышать 0.1 мс при стеке из 50 поповеров.
* **Изменения:**
  1. Добавить `benchmarks/storeTransition.bench.ts` с использованием `vitest bench`.
  2. Замерять пропускную способность (ops/sec) для `openRoot`, `pushNested`, `togglePin` и `closeFrom`.
* **Тест:** Команда `npm run bench` в CI с ассертами на пропускную способность $\ge 50\,000$ ops/sec.

### 7.6. Генеративное тестирование 12 инвариантов системы через `fast-check`
* **Теория:** Mathematical Property-Based Calculus. Проверка устойчивости 12 формальных инвариантов системы ($\mathcal{I}_{\text{Acyclic}} \dots \mathcal{I}_{\text{ZeroGC}}$) на случайных последовательностях команд стора.
* **Изменения:**
  1. Создать каталог `src/lib/popover/testing/properties/`.
  2. Реализовать 5 тестовых наборов: `dag.property.test.ts`, `fsm.property.test.ts`, `invariants.property.test.ts`, `geometry.property.test.ts`, `history.property.test.ts`.
* **Тест:** 1000 сгенерированных сценариев выполняются без единого нарушения математических инвариантов.

---

## Категория 8: Документация и база архитектурных решений

### 8.1. Создание каталога Architecture Decision Records (`docs/adr/`)
* **Теория:** Knowledge Preservation. Решения без зафиксированных причин стираются при последующих рефакторингах.
* **Изменения:** Создать записи:
  - `ADR-0001`: Композиция слайсов через SliceContext (DI без контейнера).
  - `ADR-0002`: Разделение систем персистентности (SnapshotManager vs Persist/Rehydrate).
  - `ADR-0003`: Архитектура чистых планов и раннера эффектов (Functional Core / Imperative Shell).
  - `ADR-0004`: Теневой FSM-наблюдатель для контроля инвариантов.
  - `ADR-0005`: Модульные subpath-экспорты (`./store`, `./dnd`).
  - `ADR-0006`: Политика обратной совместимости и удаления `@deprecated` в 2.0.
* **Тест:** Актуальные ссылки на ADR в JSDoc кода.

---

## 9. Протокол и регламент безупречного исполнения (Execution Protocol & Quality Gates)

Для обеспечения 100% надежности, предотвращения регрессий и сохранения идеального качества кода на каждом этапе выполнения плана устанавливается строгий инженерный регламент:

### 9.1. Принцип непрерывной целостности (Continuous Green Baseline)
1. **Атомарность шагов:** Каждый PR реализует строго свой изолированный срез задач и оставляет проект в полностью работоспособном состоянии.
2. **Гарантия тестов:** Ни один PR не сливается, если падает хотя бы один из 581+ тестов (`npm test`).
3. **Обратная совместимость:** До мажорного релиза 2.0 все изменения публичных интерфейсов должны быть строго аддитивными и обратно совместимыми. Заменяемые методы помечаются `@deprecated` и сохраняют работоспособность.

### 9.2. Архитектурный инвариант «Functional Core / Imperative Shell»
1. **Чистые редюсеры:** Все файлы в `src/lib/popover/store/reducers/` содержат исключительно чистые, детерминированные функции `(state, ...args) => StatePatch | StateTransitionPlan`.
2. **Запрет побочных эффектов в ядре:** Внутри редюсеров **категорически запрещены** вызовы `set()`, `get()`, `window`, `document`, `setTimeout`, сетевых запросов или прямых мутаций объектов состояния.
3. **Декларативное планирование эффектов:** Любые сайд-эффекты (отмена контроллеров, планирование таймеров, нотификация колбэков, эмиссия событий шины) возвращаются в виде декларативного массива `plan.effects` и исполняются внешним раннером `ctx.runEffects()`.

### 9.3. Стандарт модульности и чистоты кода (Clean Code & SLAP)
1. **Лимит размера файлов:** Размер любого нового или отрефакторенного файла не должен превышать **70–90 строк кода**. При превышении файл декомпозируется на связные подмодули.
2. **Лимит размера функций:** Каждая функция должна решать ровно одну задачу (SRP) и не превышать **20–25 строк кода**.
3. **Единый уровень абстракции (SLAP):** Внутри одной функции не допускается смешивание высокоуровневой оркестрации бизнес-логики с низкоуровневыми битовыми сдвигами или прямыми манипуляциями строками/DOM.
4. **Boy Scout Rule:** При редактировании любого файла немедленно удаляются неиспользуемые импорты, мертворожденный закомментированный код и неиспользуемые переменные.

### 9.4. Управление ресурсами и памятью (RAII & TS 5.2+ Explicit Resource Management)
1. **Контракт ScopeDisposable:** Все сервисы, регистрирующие слушатели событий, таймеры или асинхронные контроллеры (`PopoverEventBus`, `KeyedTimerPool`, `PopoverTransitionScheduler`, `SnapshotManager`, `ControllerManager`), обязаны реализовывать интерфейс `ScopeDisposable` (`dispose(): void` и `[Symbol.dispose](): void`).
2. **Идемпотентность очистки:** Повторный вызов `dispose()` должен быть безопасным no-op (защищен флагом `isDisposed`).
3. **Эргономика подписок:** Методы подписки (`on`, `subscribeKey`, `subscribeEvent`, `use`) возвращают функции/объекты, поддерживающие прямой вызов через `using sub = ...`.

### 9.5. Защитная архитектура и отказоустойчивость (Fault Isolation)
1. **Изоляция пользовательского кода:** Любой внешний пользовательский коллбэк (`onOpen`, `onClose`, `onPin`, подписчики `subscribe`, `onSnapshotRestored`) должен выполняться строго через обертку `safeCallback(fn, arg, contextName)` в изолированном блоке `try/catch`.
2. **Единая система логирования:** Прямые вызовы `console.log`, `console.warn`, `console.error` в библиотечном коде запрещены. Логирование ведется строго через `utils/logger.ts` с обязательной проверкой `isDevEnv()`.

### 9.6. Zero-Allocation в горячих циклах (Performance Guardrails)
1. **Запрет аллокаций в анимационных кадрах:** Селекторы, компараторы и обработчики перемещения (`useDragAndDrop`, `storeSelectors`) не должны создавать новые объекты `{ x, y }`, промежуточные массивы через `.filter().map()` или временные `new Set()` / `new Map()`.
2. **Переиспользование статических констант:** Возврат пустых структур осуществляется исключительно через статически замороженные `EMPTY_OBJECT`, `EMPTY_ARRAY`, `EMPTY_SET`, `ZERO_OFFSET`.
3. **Value Object Equality:** Проверка изменений объектов смещений и конфигураций выполняется через легковесные компараторы (`isDragOffsetEqual`, `isCollisionConfigEqual`) без использования медленного рекурсивного глубокого сравнения.

### 9.7. Чек-лист верификации качества перед закрытием любого PR (Quality Gate Checklist)
Перед завершением каждого шага дорожной карты обязательно выполняется сквозная автоматическая проверка:
- [ ] **TypeScript Strictness:** `npm run typecheck` завершается с **0 ошибок** (включая строгие флаги `noImplicitAny`, `exactOptionalPropertyTypes`).
- [ ] **Unit & Integration Tests:** `npm test` показывает **100% зелёных тестов** (без пропущенных `test.skip` или отключенных проверок).
- [ ] **Linter & Formatting:** `npm run lint` и `npm run format:check` проходят с **0 замечаний**.
- [ ] **Слои и архитектура:** `npm run lint:arch` подтверждает отсутствие запрещенных импортов и циклических зависимостей.
- [ ] **Zero any:** В измененных файлах отсутствуют нетипизированные приведения `as any` или `as unknown as`.

---

## 10. Сводная матрица работ и дорожная карта внедрения

Все задачи сгруппированы в **19 последовательных, независимых PR** с постепенным снижением рисков:

| Спринт / Шаг | Категория | Пункт плана | Содержание | Риск |
|:---:|:---:|:---:|---|:---:|
| **PR 1** | Кат. 1, 5 | `A1–A3, 5.3, 5.9, 5.10, 1.17, 1.24, 1.30, 1.52, 1.59, 1.78, 1.82, 1.83, 1.98, 1.125, 1.139, 1.144, 1.145, 1.163, 1.194, 1.197` | `BASE_INITIAL_STATE`, `Brand` обязательный символ, `assertNever.ts`, `Object.is` ревизия, ленивый `EventTarget`, `CompositeDisposable` | ≈0 |
| **PR 2** | Кат. 4, 6 | `E1, L4, 4.5, 4.6, 4.8, 4.16, 4.19, 4.21, 1.79, 1.128, 1.162, 1.165, 1.168, 1.183` | Единый `logger.ts`, zero-alloc `clsx`, zero-alloc `shallowEqual`, `safeKeys` frozen Set, `defaultPopoverConfig` | низкий |
| **PR 3** | Кат. 1, 2 | `H1, H4, 2.11, 2.16, 2.17, 1.25, 1.48, 1.58, 1.60, 1.84, 1.85, 1.93, 1.94, 1.137, 1.161, 1.169-1.171` | `element.closest` в `useClickOutside`, синхронизация триггера, `listenersByKey` | низкий |
| **PR 4** | Кат. 1, 2, 4 | `I2, J2, 1.9, 1.14, 1.37, 1.41, 1.57, 1.66, 1.71-1.73, 1.75, 1.89-1.91, 1.95, 1.103-1.105, 1.107, 1.108, 1.113, 1.114, 1.121, 1.124, 1.131, 1.138, 1.164, 1.167, 1.174, 1.181, 1.182, 1.185, 1.188-1.190, 1.192, 2.9, 4.11, 4.12, 4.17, 4.18, 4.20, 4.22` | `CSS.escape` кэш, `findNextFocusable`, `dragMath` scale и вынос клампинга из `dnd.tsx`, `setManagedTimeout`, `ringBuffer.ts` | низкий |
| **PR 5** | Кат. 2, 4 | `4.1, 4.4, 4.7, 4.9, 4.10, 4.13-4.15, 1.86, 2.8, 2.20` | `useFloatingSetup` изоляция, вынос `resolveTriggerBoundingRect`, `dag.ts` | низкий |
| **PR 6** | Кат. 1, 2 | `1.8, 1.92, 1.96, 1.97, 2.5` | Атомарный `actions.updateConfig`, `patchEntryButtonControls`, диф-синхронизация в `usePopoverPropSync` | низкий |
| **PR 7** | Кат. 1 | `B1, 1.4, 1.18, 1.19, 1.26, 1.29, 1.38, 1.50, 1.69, 1.70, 1.76, 1.106, 1.109, 1.111, 1.116-1.120, 1.122, 1.123, 1.191, 1.193, 1.196` | Итеративный `applyUnmountingState`, `createStatePatch`, `EMPTY_SET`, однопроходный `zIndex` | низкий |
| **PR 8** | Кат. 1, 2, 3 | `2.7, 3.5, 3.8, 3.9, 3.15, 3.16, 2.10, 2.14, 2.15, 1.47, 1.179, 1.180, E2, 3.2` | `validateStoreOptions`, ARIA в timeline, Portal cleanup on idle, Slot `PopoverTrigger` | низкий |
| **PR 9** | Кат. 6 | `L1, 6.3, 6.4` | Субмодули `popover-trail/store` и `./utils`, автогенерация `.d.ts` в `tsup`, чистый `package.json` | низкий |
| **PR 10** | Кат. 1, 2, 4 | `2.2, 4.2, 1.13, 1.15, 1.54, 1.55, 1.63, 1.141-1.143, 1.148, 1.151-1.160, 1.175-1.177` | Однопроходный `selectTopmostEntry`, `selectHasEntry` через Set, CQRS `PopoverQueryBus` | низкий |
| **PR 11** | Кат. 1, 2 | `H2, 1.10, 1.35, 1.36, 1.42, 1.44, 1.53, 1.56, 1.132, 1.133, 1.136, 1.166, 1.172, 1.173, 1.178, 1.199, 2.1` | Ядро `store/persistence/`, `StorageAdapter`, Zero-Copy снимки, `CrossTabBroadcaster` | низкий |
| **PR 12** | Кат. 1 | `1.5, 1.11, 1.28, 1.31, 1.32, 1.43, 1.45, 1.46, 1.77, 1.80, 1.81, 1.184, 1.186, 1.187, 1.195, C1` | Инкапсуляция `HistoryManager`, `definePopoverSlice`, `ctx.findEntry`, `KeyedTimerPool` | низкий |
| **PR 13** | Кат. 3, 5 | `E3, E4, 5.1, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 3.4` | Branded `PopoverKey`, `ExactOptional`, `exactOptionalPropertyTypes: true`, Discriminated `TrailEntry`, полиморфизм React 18/19 | низкий |
| **PR 14** | Кат. 2, 3 | `2.6, 2.12, 2.13, 2.18, 2.19, 2.21, 2.22, 3.1, 3.6, 3.7, 3.10-3.14` | Перенос `PopoverCardScopeContext` в `context/`, перенос `react19Adapters` в `hooks/`, Split Context, `PopoverCard.Handle asChild`, `PopoverCard.Header`, `useFocusTrap` | средний |
| **PR 15** | Кат. 1 | `1.1, 1.12, 1.20, 1.21, 1.27, 1.39, 1.40, 1.49, 1.51, 1.99-1.102, 1.110, 1.112, 1.115, 1.130` | Шорт-серкит `bringToFront`, отложенное клонирование `togglePinState`, сайд-эффекты `buildCleanupPatch` | средний |
| **PR 16** | Кат. 1 | `1.2, 1.22, 1.23, 1.33, 1.34, 1.61, 1.62, 1.64, 1.67, 1.74, 1.87, 1.88, 1.126, 1.127, 1.129, 1.134, 1.135, 1.140, 1.198` | `ResolverCacheManager.invalidate`, `batchUpdates<R>`, `transactionHelpers.ts`, `applyHistorySnapshot` | средний |
| **PR 17** | Кат. 1 | `1.3, 1.16, 1.65, 1.68, 1.146, 1.147, 1.149, 1.150` | `TRANSITION_MATRIX` битовые маски, модули FSM (4 модуля), `safeCallback` в FSM, `[Symbol.dispose]` | средний |
| **PR 18** | Кат. 8 | `8.1` | Фиксация базы архитектурных решений (`docs/adr/0001-0006`) | ≈0 |
| **PR 19** | Кат. 5, 7 | `7.1-7.6, 5.2, 1.200`| Fitness Functions: `storeInvariants.test.ts`, `dependency-cruiser`, `fast-check` (5 наборов свойств), `size-limit` | инфра |

---

### Финальные метрики успешности реализации плана:

1. **Модульность:** 0 нарушений слоёв в `dependency-cruiser`; чистая изоляция ядра от React DOM.
2. **Размер бандла:**
   - Headless Store (`popover-trail/store`): **$\le 7$ KB** min+gzip.
   - Полный UI-пакет (`popover-trail`): **$\le 18$ KB** min+gzip (сокращение на **~35%**).
3. **Отказоустойчивость:** 100% изоляция пользовательских сбоев; 0 утечек слушателей `AbortSignal` и памяти кэша.
4. **Тестируемость:** Чистая логика переходов тестируется синхронно без моков; генеративные тесты `fast-check` и проверка типов `test:types`.
5. **Совместимость:** 581+ тест зелёный на каждом шаге; нулевые ломающие изменения публичного API до мажора 2.0.
