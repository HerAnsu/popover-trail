# План здоровья кодовой базы: модульность и чистота кода (`src/lib/popover/store`)

Документ фиксирует следующий цикл улучшений после выполненного рефакторинга 2026-08-24
(см. раздел 6 в [STORE_ARCHITECTURE_AND_IMPROVEMENTS.md](./STORE_ARCHITECTURE_AND_IMPROVEMENTS.md)).
План **не требует немедленной реализации** — пункты берутся в работу постепенно, каждый
самостоятельным PR с зелёными `typecheck + oxlint + vitest`.

Формат каждого пункта: **Теория** (почему это дефект и по каким принципам) →
**Изменения** (файлы, сигнатуры) → **Тест**.

---

## Содержание

1. [Диагностика текущего состояния](#1-диагностика-текущего-состояния)
2. [Почему архитектура деградирует и что с этим делать](#2-почему-архитектура-деградирует)
3. [Фаза A: Мёртвый код и хвосты](#фаза-a--мёртвый-код-и-хвосты-риск--0)
4. [Фаза B: Модульность](#фаза-b--модульность-риск-низкий)
5. [Фаза C: Надёжность резолвера](#фаза-c--надёжность-резолвера)
6. [Фаза D: Архитектурные гарантии](#фаза-d--архитектурные-гарантии)
7. [Фаза E: Чистота кода](#фаза-e--чистота-кода)
8. [Фаза F: Внедрение FSM — теневая регистратура](#фаза-f--внедрение-fsm--теневая-регистратура)
9. [Фаза G: Снижение когнитивной нагрузки](#фаза-g--снижение-когнитивной-нагрузки)
10. [Фаза H: Отказоустойчивость и контракты платформы](#фаза-h--отказоустойчивость-и-контракты-платформы)
11. [Фаза I: Высокопроизводительные селекторы и вычисления](#фаза-i--высокопроизводительные-селекторы-и-вычисления)
12. [Фаза J: Ограничение памяти и жизненный цикл кэша](#фаза-j--ограничение-памяти-и-жизненный-цикл-кэша)
13. [Фаза K: Доступность (A11y) и управление фокусом в сторе](#фаза-k--доступность-a11y-и-управление-фокусом-в-сторе)
14. [Фаза L: Оптимизация размера бандла и модульный экспорт](#фаза-l--оптимизация-размера-бандла-и-модульный-экспорт)
15. [Порядок работ, метрики, границы](#порядок-работ)

---

## 1. Диагностика текущего состояния

Оценка: **~8/10** для библиотечного кода. Ядро продакшн-готово; основные риски — не баги,
а сложность поверхности и отсутствие автоматических ограничителей эрозии.

**Сильное:**

- 581 тест (~19 с), колокация тестов с модулями; CI: typecheck → lint → test → build.
- Жёсткий TypeScript: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`; ноль `any`.
- Зрелая модель: композиционный корень с DI-слайсами (`SliceContext`), чистые редюсеры,
  селекторы над минимальными срезами состояния, Result-монада, FSM, DAG каскадов,
  микротасковый батчинг подписок.
- Документация: API.md ~1400 строк, архитектурный анализ, гайды.
- После рефакторинга 2026-08-24: единые источники истины (`safeKeys`, константы,
  реестр имён из кода), дедупликация логики, осознанная deprecation-политика.

**Слабости (закрываются настоящим планом):**

| # | Слабость | Пункт плана |
|---|---|---|
| 1 | Три пересекающихся типа состояния (`StoreState` / `PopoverStateData` / `PopoverStore`) | E3 |
| 2 | FSM-движок не используется самим движком стора (только публичная утилита) | **F** |
| 3 | Нет измерения покрытия; knip-правила выключены; нет type-level тестов и лимита бандла | D5, D6, D7, D8 |
| 4 | Эвристика резолверов привязана к англоязычным сообщениям V8 | C1 |
| 5 | Логирование с 5 разными префиксами, непоследовательный dev-гейтинг | E1 |
| 6 | Мёртвый экспорт `batchUpdatesScope`; булев флаг в `buildCleanupPatch` | A1, A2 |
| 7 | Grab-bag остаток: sliceConfig смешивает сеттеры и интеракции | B2 |
| 8 | Асимметрия dispose у CQRS-шин; жёсткое зеркалирование в глобальную шину | B3, B4 |
| 9 | Фантомные генерики и мёртвая защита в history.ts; двойное именование EMPTY_* | E4, E5 |
| 10 | Пользовательское исключение в подписчике может оборвать уведомительный цикл и сломать батчинг | H1 |
| 11 | Неверсионированный localStorage/sessionStorage грозит рассинхроном при смене схемы | H2 |
| 12 | Отсутствие явного SSR-контракта (`getServerSnapshot`) для `useSyncExternalStore` / RSC | H3 |
| 13 | Риск накопления слушателей `AbortSignal` при частых отменах резолверов | H4 |
| 14 | Составные селекторы без мемоизации провоцируют лишние рендеры в React 19 | I1 |
| 15 | Отсутствие санитарной проверки drag-координат на `NaN` и `Infinity` | I2 |
| 16 | Встроенный кэш резолвера не имеет политики вытеснения (unbounded memory growth) | J1 |
| 17 | Частые перемещения карточек раздувают память снимков истории (`history.ts`) | J2 |
| 18 | Управление фокусом доступности (A11y focus restore) оторвано от закрытия в сторе | K1 |
| 19 | Отсутствие subpath-экспорта `popover-trail/store` заставляет headless-пользователей тащить UI | L1 |
| 20 | Подробные строки ошибок и `Object.freeze` не вырезаются в production-бандле | L2 |
| 21 | Тяжёлая зависимость `react-focus-lock` (~4.5 KB gzipped) ради базового таб-лока | L3 |
| 22 | Устаревший target компиляции генерирует лишний полифилл-бойлерплейт | L4 |

## 2. Почему архитектура деградирует

Деградация — не разовое событие, а процесс с конкретными механизмами, все они уже
проявлялись в этом репозитории:

1. **Энтропия изменений.** Каждая задача решается локально-оптимальным путём
   («скопирую проверенный кусок рядом» — так появились 7 копий unsafe-key гвардов
   и 5 копий обновления entry). Копии постепенно расходятся и становятся разными поведениями.
2. **Правила существуют только в головах.** Пока граница «reducers не знают о side-effects»
   не проверяется автоматически, её защищает только память разработчика. Пример:
   React-импорт «прирос» внутрь чистых persistenceHelpers — его никто не закладывал.
3. **Знание выветривается быстрее кода.** Решение без записанной причины выглядит
   случайностью и удаляется при следующем рефакторинге (см. ADR, D4).
4. **Broken windows.** Один оправданный обходной путь снижает порог для следующего.
5. **Асимметрия давления сроков:** стоимость нарушения границы отложена и невидима,
   выигрыш — немедленный.

**Вывод:** договорённости нужно конвертировать в *исполняемые проверки* (fitness functions):
dependency-cruiser для слоёв, knip для мёртвых экспортов, parity-тесты для фасадов.
Тогда деградация ломает CI, а не чью-то внимательность.

---

## Фаза A — Мёртвый код и хвосты (риск ≈ 0)

### A1. Удаление `batchUpdatesScope`

**Теория.** YAGNI / dead code. Экспорт из `store/storeBatching.ts:75` не входит в публичный
`index.ts` и не имеет потребителей в src. Мёртвый экспорт несёт постоянную стоимость
(тесты, grep-шум, ложные связи) без выгоды; knip его не видит, т.к. правило `exports` выключено.

**Изменения:**
1. Удалить функцию из `store/storeBatching.ts`.
2. Удалить 2 теста из storeBatching.test.ts («runs callback cleanly within batchUpdatesScope…»
   и «guarantees endBatch cleanup even if callback throws…») — инвариант finally-при-исключении
   уже покрывают транзакции sliceTransactions.
3. Перед удалением grep `batchUpdatesScope` по `src/ .gemini/ docs/`; если найдётся использование —
   вместо удаления осознанный экспорт в index.ts.

**Тест:** полный suite зелёный; после D5 knip не ругается.

### A2. Булев флаг `filterUnmountingOnly` → два именованных патча

**Теория.** Boolean Flag Parameter (Fowler, Refactoring): булев аргумент означает, что функция
делает две вещи; call-site теряет самодокументацию («что значит true?»), растёт риск
перепутать порядок аргументов (connascence of position). Лекарство — Introduce Named Function:
разделить вариацию (предикат keep) и инвариант (механику фильтрации + cleanup).

**Изменения в `store/slices/sliceTrail.ts`:**
```ts
const buildCleanupPatchWith =
  (keep: (e: TrailEntry<TData, TPopoverKey>) => boolean) =>
  (state: PopoverStore<TData, TContext, TPopoverKey>) => { /* тело без изменений */ };

/** Immediate removal: все ключи уходят из состояния разом. */
const buildImmediateRemovalPatch = (keys: ReadonlySet<TPopoverKey>) =>
  buildCleanupPatchWith((e) => !keys.has(e.key));

/** Post-animation sweep: уходят только записи, завершившие 'unmounting'-выход. */
const buildPostAnimationCleanupPatch = (keys: ReadonlySet<TPopoverKey>) =>
  buildCleanupPatchWith((e) =>
    !keys.has(e.key) || e.transitionStatus !== TRANSITION_STATUS_UNMOUNTING);
```
Call-sites: `applyImmediateClose` → `buildImmediateRemovalPatch`; таймер `scheduleExitCleanup` →
`buildPostAnimationCleanupPatch`.

**Тест:** существующие slices-тесты + sliceTrailParity.test.ts (паритет closeFrom/clearTrail).

### A3. Слияние дубля формы в `isSnapshotMessageEvent`

**Теория.** Дублирование ветвей: обе ветки выполняют идентичный структурный гвард;
различие только в способе доступа к `data`. Приём «extract the variance, share the invariant».

**Изменения в `store/snapshotManager.ts`:**
```ts
function hasSnapshotShape<TData>(d: unknown): d is PopoverSnapshotData<TData> {
  return (
    typeof d === 'object' && d !== null &&
    'trailKeys' in d && Array.isArray(d.trailKeys) &&
    'pinnedKeys' in d && Array.isArray(d.pinnedKeys)
  );
}
function isSnapshotMessageEvent<TData>(event: Event): event is MessageEvent<PopoverSnapshotData<TData>> {
  if (typeof MessageEvent !== 'undefined' && event instanceof MessageEvent) {
    return hasSnapshotShape(event.data);
  }
  return 'data' in event && hasSnapshotShape((event as { data?: unknown }).data);
}
```

**Тест:** snapshotManager.test.ts (BroadcastChannel-кейсы уже есть).

---

## Фаза B — Модульность (риск низкий)

### B1. `getCleanupStatePatch`: data clump → объект `CleanupSourceLists`

**Теория.** Long Parameter List / Data Clump (Fowler): шесть параметров всегда передаются вместе
из одного среза состояния — скрытый параметр-объект. Явный объект делает call-site
самодокументируемым и позволяет расширять вход без ломки всех вызовов (эволюция сигнатуры по OCP).
Имя публично реэкспортируется (`storeReducers` facade → `utils/storeHelpers`), поэтому применяется
параллельная эволюция (Strangler Fig), а не смена сигнатуры.

**Изменения:**
1. `store/reducers/stackReducers.ts`:
```ts
export interface CleanupSourceLists<TData, TPopoverKey extends string = string> {
  floating: readonly TrailEntry<TData, TPopoverKey>[];
  trail: readonly TrailEntry<TData, TPopoverKey>[];
  offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  zIndexOrder: readonly TPopoverKey[];
  pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  nestedHydrationRequestCounters: Readonly<Partial<Record<TPopoverKey, number>>>;
}
export function buildCleanupStatePatch<TData, TContext, TPopoverKey extends string = string>(
  lists: CleanupSourceLists<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>; // тело = прежний getCleanupStatePatch
```
2. Прежний `getCleanupStatePatch(...6)` становится делегатором c
   `@deprecated Use buildCleanupStatePatch({ floating, trail, ... })`.
3. Внутренние потребители переводятся на новый: `pinReducers.togglePinState`,
   `closeReducers.closeFromState`, `sliceTrail.buildCleanupPatchWith`.
4. `utils/storeHelpers.ts`: реэкспорт дополнить `buildCleanupStatePatch` и `type CleanupSourceLists`.

**Тест:** тест эквивалентности в stackReducers.test.ts — старая и новая форма deep-equal
на трёх фикстурах (пустое состояние, частичный pinned, полный стек).

### B2. Разделение `sliceConfig` → `sliceConfig` + `sliceInteraction`

**Теория.** SRP / Common-Closure Principle: файл смешивает (a) реактивные сеттеры настроек —
«данные», расширяются добавлением опций, и (b) интеракционную логику — hover-тайминги через
transitionScheduler (temporal coupling), FSM-валидация переходов статусов, кнопочные контролы.
У групп разные axes of change ⇒ разные модули. Плюс честность имён: coupling hover↔scheduler
не должен прятаться в модуле под названием «Config». Это тот же шаблон, что применён
при разделе grab-bag slicePersistence.

**Изменения:**
1. Новый `store/slices/sliceInteraction.ts` → `createInteractionSlice(ctx)`:
   перенос `hoverEnter`, `hoverLeave`, `setTransitionStatus`, `setButtonControls`,
   `toggleButtonControl`, приватного `patchEntryButtonControls`. Импорты: `patchEntryInLists`,
   `isValidTransitionStatusChange`, `DEFAULT_HOVER_CLOSE_DELAY_MS`, `isPinnedEntry`,
   `findEntryByKey`/`transitionScheduler` из deps.
2. `sliceConfig.ts` остаётся сеттерами (~180 строк): setIfChanged-семейство, setContext,
   setResolveData, setCollisionConfig, анимации, focus-lock, slots, responsive, zIndexBaseMap.
3. Реестр `createStoreActions`: `...createConfigSlice(ctx), ...createInteractionSlice(ctx), ...`
   — состав `PopoverActions` неизменен, публичный API не меняется.
4. Тесты: кейсы hover/transitionStatus/button-controls из sliceConfig.test.ts переносятся
   в новый sliceInteraction.test.ts (харнесс createMockSliceContext тот же).

**Метрика успеха:** оба файла ≤200 строк.

### B3. Симметрия dispose у CQRS-шин

**Теория.** Principle of Least Astonishment + контракт владения ресурсом: объекты одной фабрики
должны иметь симметричный жизненный цикл либо явно управляемую асимметрию. Сейчас
`queryBus.dispose()` пуст, а `commandBus.dispose()` вызывает `actions.destroy()` —
«безобидный» dispose разрушает весь стор.

**Изменения в `store/cqrs.ts`:**
```ts
export interface CQRSBusesOptions {
  /** true (default, back-compat): commandBus.dispose() разрушает стор. */
  readonly destroyOnDispose?: boolean;
}
// createCQRSBuses(storeOrApi, options?: CQRSBusesOptions)
```
- `PopoverCommandBus` хранит флаг; при `false` dispose/[DISPOSE_SYMBOL] — no-op.
- JSDoc queryBus.dispose(): «Query side owns no resources; no-op kept for structural symmetry».
- JSDoc фабрики: пример сценария «шины как view над чужим стором» с `{ destroyOnDispose: false }`.

**Тест:** cqrs.test.ts — default-поведение не изменилось; с флагом false стор жив после dispose.

### B4. Зеркалирование в глобальную шину → опция владельца

**Теория.** Singleton tangle / скрытый побочный канал: `dispatchStoreEvent` (eventBus.ts:341,351)
всегда пишет в `globalPopoverEventBus` — каждый экземпляр стора невидимо вещает в процессный канал;
потребители двух шин получают двойную доставку; изоляция в multi-instance/micro-frontend
недостижима. Решение о канале доставки должен принимать владелец шины (Dependency Inversion
источника решения), а не свободная функция.

**Изменения в `store/eventBus.ts`:**
```ts
export interface PopoverEventBusOptions {
  readonly mirrorToGlobalBus?: boolean; // default true (back-compat)
}
class PopoverEventBus {
  constructor(options: PopoverEventBusOptions = {});
  public get mirrorsGlobal(): boolean;
}
```
Оба блока `globalPopoverEventBus.emit(...)` (canonical + alias) — под условием:
```ts
if (!localEventBus || localEventBus.mirrorsGlobal) { ... }
```
(нет локальной шины → глобальная эмиссия сохраняется — текущее поведение вызовов без bus).
Экспорт типа `PopoverEventBusOptions` в index.ts. Совместимость: `new PopoverEventBus()` работает.

**Тест:** eventBus.test.ts — mirror off → глобальная шина молчит; default → зеркалит;
alias-проекции подчиняются тому же флагу.

---

## Фаза C — Надёжность резолвера

### C1. Стратегия распознавания сигнатуры резолвера

**Теория.** Fragile heuristic / environment coupling: `isDestructuringSignatureMismatch`
(pipelineExecution) распознаёт деструктурирующий резолвер по англоязычным текстам V8 TypeError
(`'cannot read properties of undefined'`). Другой движок/локаль → fallback на object-call
не сработает → пользовательский резолвер падает. Полностью устранить эвристику нельзя
(JS не раскрывает форму параметров), но можно локализовать заменяемость (Strategy, LSP):
единая точка принятия решения + контракт переопределения.

**Изменения:**
1. Новый `store/resolver/signatureDetection.ts`: перенос эвристики, экспорт для тестов,
   JSDoc с документированным ограничением (engines/locales).
2. `resolverTypes.ts`:
```ts
export interface ResolverSignatureProbe {
  looksLikeDestructuringMismatch(err: unknown): boolean;
}
// поле в ResolverPipelineDependencies (опционально, дефолт — встроенная эвристика):
signatureProbe?: ResolverSignatureProbe;
```
3. `invokeResolverSafely` использует probe вместо прямого вызова (одна ветка).

**Слои надёжности (от детерминированного к эвристическому):**

| Слой | Механизм | Надёжность |
|---|---|---|
| 1 | **Явное объявление**: опция `resolverStyle?: 'auto' \| 'positional' \| 'object'` в опциях схемы/открытия. Заявлен стиль → зондирование не выполняется вовсе | детерминировано |
| 2 | **Арность как быстрый путь**: `resolver.length === 4` ⇒ гарантированно позиционный (деструктуризация считается одним параметром); `length <= 1` — неоднозначно | сильная, но неполная |
| 3 | **Текстовый зонд — последнее средство**: текущая эвристика + паттерны SpiderMonkey/JSC («is not an object») за интерфейсом Probe | эвристика с известными границами |

Опция слоя 1 аддитивна и обратно совместима (`'auto'` — дефолт, текущее поведение).

**Тест:** signatureDetection.test.ts — V8-позитивы; негативы (не-TypeError, иной текст);
документирующие кейсы SpiderMonkey/JSC и «немецкой локали»; юнит-тесты слоёв 1–2
(resolverStyle обходит зонд; length===4 не вызывает зонд).

---

## Фаза D — Архитектурные гарантии

### D1. Слой-правила через dependency-cruiser

**Теория.** Архитектура без принуждения эродирует (architectural erosion). Слои store уже
правильные: `reducers(pure) ← slices ← registry ← composition root`; `utils` независимы.
Но правила существуют только в головах — их нужно превратить в исполняемые fitness functions.

**Изменения:** `npm i -D dependency-cruiser`; конфиг `.dependency-cruiser.cjs`:
1. `store-reducers-pure`: reducers/** не импортирует slices/, registry, eventBus,
   transitionScheduler, zustand (запрет side-effects);
2. `utils-independent`: utils/** не импортирует store/**, components/**, context/**, react*;
3. `slices-only-via-context`: slices/** не импортирует zustand напрямую (set/get только через SliceContext);
4. `no-circular`: циклы запрещены глобально.

Скрипт `"lint:arch": "depcruise src --config"`; включить в CI после typecheck.
**Эффект:** PR, возвращающий React в persistenceHelpers или zustand в редюсер, падает в CI автоматически.

### D2. Property-based тесты чистых редюсеров

**Теория.** Чистые детерминированные функции — идеальная цель property-based testing:
проверка инвариантов на сотнях сгенерированных входов вместо ручных примеров.

**Изменения:** `npm i -D fast-check`; новые свойства (~200 итераций каждое):
- `filterRecord`: результат содержит только allowedKeys; ключи результата ⊆ исходных; идемпотентность f(f(x)) = f(x);
- `patchEntryInLists`: ссылка нетронутого списка сохраняется (structural sharing); промах по ключу → `{}`;
- `resolveAllRemovedKeys`: закрытые ⊆ запрошенные ∪ потомки(DAG); pinned-исключения уважаются при closePinnedDescendants=false;
- `getNextZIndexOrder`: последний элемент всегда newKey; относительный порядок выживших сохранён.

### D3. Parity-тест фасадов (защита публичной поверхности)

**Теория.** Facade drift: back-compat фасад (`storeReducers.ts`, `storeTypes.ts`) может
расхиться с источниками — новый экспорт забудут продублировать. Контракт фиксируется тестом рефлексии.

**Изменения:** `store/storeFacadeParity.test.ts` — сравнение наборов экспортов:
storeReducers ≡ union reducers/*; storeTypes ≡ types/storeTypes (+алиасы).
Дополнительно: в index.test.ts — снапшот списка deprecated-имён (после мажора обязан опустеть).

### D4. Architecture Decision Records

**Теория.** Решение без записанной причины выглядит случайностью и удаляется при рефакторинге
(механизм №3 деградации). ADR сохраняют «почему».

**Изменения:** каталог `docs/adr/`, стартовые записи:
- 0001 — слайс-композиция через SliceContext (DI без контейнера);
- 0002 — две системы персистентности: роли snapshotManager vs persist/rehydrate, общее ядро, запрет слияния форматов;
- 0003 — batching monkey-patch как осознанный адаптер (иначе useSyncExternalStore не коалесцировать);
- 0004 — deprecation-политика до мажора 2.0.

### D5. knip ratchet

`knip.json`: правила exports/types → `"warn"` → прогон → реальные мёртвые удалить
(кандидаты уровня A1), легитимные публичные в ignore → перевести в `"error"`.
Скрипт `knip` добавить в CI рядом с oxlint.

### D6. Покрытие и версионная гигиена

- `npm i -D @vitest/coverage-v8`; скрипт `"test:coverage": "vitest run --coverage"`;
  первый этап без порогов (базовая линия ratchet-метрики), пороги для store/** отдельным шагом.
- Версии: git-коммит `chore(release): 1.2.1` против package.json 1.2.0 — сверить теги/dist-tags;
  далее релизы строго через `changeset version`.

### D7. Type-level тестирование (предотвращение регрессий типов)

**Теория.** Type Regression: в библиотеках со сложными дженериками (`TData`, `TContext`, `TPopoverKey`)
рантайм-тесты не ловят деградацию типов (случайное ослабление до `any`/`unknown`, потерю автодополнения
ключей или ложные компиляционные ошибки у потребителей). Поведение компилятора должно тестироваться
наравне с рантаймом.

**Изменения:**
1. Использование встроенного в Vitest `expectTypeOf` / `assertType` (или `tsd`):
   создание файлов `src/lib/popover/store/**/*.test-d.ts`.
2. Тестовые сценарии:
   - Проверка вывода типов селекторов (`selectFloatingEntries`, `selectTopmostEntry`);
   - Запрет неверных ключей и несоответствующих типов данных в экшенах (`openRoot`, `setButtonControls`);
   - Сохранение брендированных типов и readonly-модификаторов в снимках состояния.
3. Скрипт `"test:types": "vitest typecheck"` в CI.

### D8. Контроль размера бандла (Bundle Size Budget)

**Теория.** Silent Bloat: случайное добавление не-tree-shakeable импорта или тяжелой зависимости
в `store` увеличивает вес библиотеки для всех потребителей без предупреждения.

**Изменения:**
1. `npm i -D size-limit @size-limit/preset-small-lib`.
2. Конфигурация `.size-limit.json`:
   - Лимит на ядро стора (`src/lib/popover/store/index.ts`): `<= 10 KB` (brotli/gzip);
   - Лимит на полный пакет (`src/index.ts`): `<= 25 KB`.
3. Добавить шаг `"size": "size-limit"` в pull request CI.

---

## Фаза E — Чистота кода

### E1. Единый scoped-логгер

**Теория.** Consistency/observability: 15 console-вызовов с 5 разными префиксами
(`[popover-trail]`, `[SnapshotManager]`, `[popover-trail FSM]`, `[PopoverStore]`, `[BroadcastSync]`)
и непоследовательным dev-гейтингом. Логирование — сквозная concern (cross-cutting concern),
ей положен единый модуль форматирования и фильтрации.

**Изменения:** `utils/logger.ts`:
```ts
export function logError(scope: string, message: string, ...details: unknown[]): void;
export function logWarn(scope: string, message: string, ...details: unknown[]): void;
// формат: `[popover-trail:${scope}] ${message}`; scope ∈ 'Store'|'FSM'|'Snapshot'|...
```
Замена всех сайтов с сохранением точных текстов, которые фиксируют тесты
(OCP-warning, exception-строки); dev-only класс предупреждений — через isDevEnv.

**Тест:** существующие ассерты текстов зелёные; юнит-тест форматтера префикса.

### E2. Централизованная эмиссия событий в SliceContext

**Теория.** DRY + единственная точка перехвата: каждый слайс повторяет
`const emitEvent = (e) => dispatchStoreEvent(eventListeners, e, deps.eventBus)` (5 копий),
pipelineExecution зовёт dispatch напрямую. Канал в контексте даёт одно место
для будущей инструментации (логирование, порядок, фильтры событий).

**Изменения:** `SliceContext` дополняется `emit: (event: PopoverStoreEvent<TData>) => void`;
фабрика строится один раз в createStoreActions. Слайсы и pipelineExecution переходят на ctx.emit;
dispatchStoreEvent остаётся внутренней реализацией.

**Тест:** существующие event-ассерты всех слайсов зелёные.

### E3. Таксономия типов состояния

**Теория.** Conceptual overload: три пересекающихся типа — `StoreState`
(types/storeTypes.ts:87), `PopoverStateData` (:329), `PopoverStore` — читатель не понимает
границ применения. Имена должны отражать роль: data-slice vs full-store-view vs action-bearing store.

**Изменения (без ломки):** шапка-таблица в types/storeTypes.ts («тип → роль → где применять»);
JSDoc @remarks на каждом; новые внутренние сигнатуры ориентируются на минимальные структурные
интерфейсы (как в селекторах). Полное переименование/склейка — кандидат в мажор 2.0 (ADR 0005).

### E4. history.ts: фантомные генерики и мёртвая защита

**Теория.** Phantom generics: per-call `<TContext>` у pushSnapshot/undo/redo избыточен —
окружающий deps-контракт уже фиксирует тип; лишние параметры усложняют чтение сигнатур.
Dead defensive branch в toArray недостижим по инварианту кольцевого буфера.

**Изменения:** убрать per-call генерики там, где deps-типы уже типизируют вход (проверить
публичных потребителей createHistoryManager компиляцией); удалить недостижимую ветку toArray.

**Тест:** history.test.ts + полный suite.

### E5. Канонизация `EMPTY_*`

**Теория.** Two Names, One Thing: branded экспортирует `EMPTY_READONLY_*`,
storeDefaults ре-алиасит как `EMPTY_ARRAY`/`EMPTY_OBJECT` — два имени одной константы
размывают поиск и добавляют когнитивную нагрузку.

**Изменения:** зафиксировать канонические короткие имена в пределах store/
(алиас в storeDefaults остаётся мостом), привести импорты store-модулей к одному варианту;
в branded оставить оба имени с JSDoc-перекрёстными ссылками.

**Тест:** typecheck + suite.

### E6. cqrs snapshot-getter переиспользует HistorySnapshot

**Теория.** Structural duplication в типах: геттер вручную переобъявляет форму,
идентичную HistorySnapshot, — рассинхрон при расширении снимка.

**Изменения:** возвращаемый тип `Readonly<HistorySnapshot<TData, TPopoverKey>>`.

**Тест:** cqrs.test.ts.

---

## Фаза F — Внедрение FSM: теневая регистратура

**Диагноз (почему FSM «не работает»).** Машина полностью построена и протестирована
(22 экспорта в fsm.ts), но движок стора никогда её не запускал. Причина — расхождение моделей:
записи стора живут в плоских полях `status` ('loading'|'success'|'error') и
`transitionStatus` ('mounting'|'mounted'|'unmounting'), тогда как FSM описывает иерархический
цикл карточки (Idle/Hydrating/Resolved.Trailing/Resolved.Pinned/Error/Unmounting).
Из модуля используется только `isValidTransitionStatusChange`. FSM не сломан — он не подключён.

**Выбор архитектуры.** Три варианта:

| Вариант | Суть | Вердикт |
|---|---|---|
| A. Теневая регистратура (observer) | машины живут рядом со стором и питаются уже существующим потоком событий; состояние стора остаётся единственным источником истины | **принят**: нулевые изменения горячих путей |
| B. FSM как источник истины | состояние стора выводится из контекста машин | отклонён: переписывание модели ради дублирования гарантий, которые дают hydration-счётчики + isValidTransitionStatusChange |
| C. Guard-only | только валидация статусов | уже сделано, недостаточно |

**Ключевое наблюдение:** движок уже эмитит все события, необходимые машине:

| Событие стора | Событие FSM | Примечание |
|---|---|---|
| `open_root` {key} | `OPEN_ROOT` | |
| `push_nested` {key} | `PUSH_NESTED` | |
| `resolve_start` {key} | `RETRY` | если текущее состояние Resolved/Error; иначе no-op (уже Hydrating) |
| `resolve_success` {key, data} | `RESOLVE_SUCCESS` | |
| `resolve_error` {key, error} | `RESOLVE_FAILURE` | |
| `close` {keys[]} | `CLOSE` | по каждому ключу |
| `pin` / `unpin` {key} | `TOGGLE_PIN` | rect в payload нет → pinnedPos опционален |
| `transition_end` {keys} *(новый)* | `TRANSITION_END` | закрывает единственный пробел модели |

**Изменения:**
1. Новый `store/fsmRegistry.ts`:
```ts
export function createPopoverFSMRegistry(deps: {
  subscribeEvent: (fn: (e: PopoverStoreEvent) => void) => () => void;
  /** dev-only детектор нарушения инвариантов */
  onIllegalTransition?: (key: string, from: PopoverStateValue, event: string) => void;
}): {
  getFSM(key: string): PopoverFSMInterpreter | undefined;
  isActive(key: string): boolean;
  getStatusBit(key: string): number | undefined;
  destroyAll(): void;
  dispose(): void;
};
```
   Ленивое создание машины по первому событию ключа; чистка — машина достигла Idle
   и ключ отсутствует в состоянии; синтетические ключи не попадают (exit-batch уже
   вынесен из пространства ключей через scheduleBatch); `destroyAll()` очищает все активные инстансы.
2. Аддитивное событие `transition_end`: payload `{ keys: readonly TPopoverKey[] }`, эмитится один раз из колбэка
   `scheduleBatch` в sliceTrail после успешного cleanup-патча. Тип добавляется
   в `PopoverStoreEvent` как строгий discriminated union вариант; обратная совместимость полная.
3. Композиционный корень (`store.ts`): создать регистратуру после attachSubscriber,
   передать подписку через существующий `subscribeEvent`, вызывать `destroyAll()` при `actions.destroy()`, добавить dispose.
4. Экспорт фабрики и типов из index.ts.

**Ценность:**
- **Dev-режим:** `onIllegalTransition` превращает FSM в рантайм-детектор инвариантов —
  нелегальная последовательность (например, resolve_success после close) логируется.
  Машина начинает «работать» страховкой, не меняя поведение.
- **Prod:** O(1)-запросы статусов (`getStatusBit`) для тулинга/devtools через публичный API.

**Тест:** новый fsmRegistry.test.ts — сценарии open→resolve→close→transition_end→Idle;
незаконная последовательность → onIllegalTransition; чистка памяти (машина удалена после Idle);
destroyAll и dispose снимают подписку и очищают реестр. Существующие fsm.test.ts остаются зелёными.

---

## Фаза G — Снижение когнитивной нагрузки

**Теория.** Когнитивная нагрузка = число уникальных решений, которые читатель обязан
удерживать. Каждый пункт ниже либо устраняет дубль-концепт, либо документирует причину
существования оставшегося.

| Источник нагрузки | Приём | Пункт / когда |
|---|---|---|
| Три типа состояния: `StoreState` / `PopoverStateData` / `PopoverStore` | таблица-таксономия «тип → роль → где применять» в шапке types/storeTypes.ts; новые сигнатуры — на минимальных структурных интерфейсах (как в селекторах), чтобы потребитель реже встречал трио | E3, сразу; склейка — 2.0 |
| Синонимы действий: clear/closeAll/clearTrail, openNested/pushNested, scheduleExit | deprecation проставлен; удаление консолидирует словарь до одного имени на операцию | 2.0 |
| Две системы персистентности | роли разделены + общее ядро; зафиксировать «почему» в ADR 0002, иначе кто-то их «упростит» слиянием форматов | D4 |
| Разбросанные мелочи: 5 префиксов логов, двойное именование EMPTY_*, фантомные генерики history | фаза E целиком | низкий риск |

Дополнительный принцип для код-ревью: **«одно понятие — одно имя, одно имя — одно понятие»**.
Новый экспорт допускается, только если для его роли ещё нет имени (проверяется parity/knip-инструментами фазы D).

---

## Фаза H — Отказоустойчивость и контракты платформы

### H1. Изоляция подписчиков от пользовательских исключений (Subscriber Resilience)

**Теория.** Fault Isolation: если пользовательский колбэк в `store.subscribe(fn)` или `eventBus.subscribe(fn)`
выбрасывает исключение, синхронный цикл оповещения в `notifySubscribers` прерывается:
1. Оставшиеся подписчики не получают уведомление об изменении состояния.
2. Ломается счётчик глубины батчинга (`batchDepth`), блокируя последующие обновления.
Сбой пользовательского кода не должен разрушать инварианты библиотеки.

**Изменения:**
1. `utils/safeCallback.ts`:
```ts
export function invokeSubscriberSafely<T>(fn: (arg: T) => void, arg: T): void {
  try {
    fn(arg);
  } catch (err) {
    if (typeof reportError === 'function') {
      reportError(err);
    } else {
      logError('Subscriber', 'Uncaught subscriber callback exception', err);
    }
  }
}
```
2. Использовать `invokeSubscriberSafely` во всех циклах `notifySubscribers` (`sliceSubscriptions.ts`, `eventBus.ts`).

**Тест:** `sliceSubscriptions.test.ts` и `eventBus.test.ts` — подписчик A выбрасывает ошибку; подписчик B успешно вызывается; батч-счётчик возвращается в 0.

### H2. Схемная миграция и версионирование персистентности (Storage Schema Versioning)

**Теория.** Backward Compatibility of Persisted State: сериализованные данные в `localStorage`/`sessionStorage`
могут сохраняться месяцами. При изменении формы `PopoverSnapshotData` или `StorePersistedState` чтение устаревшей
структуры приведет к TypeError или битому состоянию. Необходим версионированный конверт с graceful fallback.

**Изменения:**
1. `store/persistence/persistenceCore.ts`:
```ts
export interface PersistedEnvelope<T> {
  readonly schemaVersion: number;
  readonly payload: T;
}
export const CURRENT_PERSISTENCE_SCHEMA_VERSION = 1;

export function wrapPersistedEnvelope<T>(payload: T): PersistedEnvelope<T>;
export function unwrapPersistedEnvelope<T>(
  rawJson: string,
  migrate?: (oldPayload: unknown, oldVersion: number) => T | null,
): T | null;
```
2. При несовпадении версий и отсутствии мигратора — безопасная очистка ключа и возврат `null` (дефолтное состояние) вместо падения.

**Тест:** `persistenceCore.test.ts` — парсинг неверсионированного legacy JSON (v0), валидного v1 и поврежденных данных.

### H3. Гарантии SSR и `useSyncExternalStore` (Isomorphic Snapshot Safety)

**Теория.** Isomorphic State & Hydration Consistency: при использовании `useSyncExternalStore` в SSR/RSC (Next.js/Remix)
требуется иммутабельный `getServerSnapshot`, гарантирующий отсутствие рассинхрона гидратации (hydration mismatch)
и безопасное выполнение в бессерверном окружении без `window`/`document`.

**Изменения:**
1. В интерфейс `PopoverStoreApi` и фабрику `createPopoverStore` добавить `getServerSnapshot`:
```ts
export interface PopoverStoreApi<TData, TContext, TPopoverKey extends string = string> {
  // ...
  getServerSnapshot: () => StoreState<TData, TContext, TPopoverKey>;
}
```
2. Возвращать статически замороженный пустой снимок из `storeDefaults.ts`.

**Тест:** `storeSSR.test.ts` — выполнение всех селекторов и геттеров при `window === undefined` не вызывает исключений.

### H4. Очистка слушателей `AbortSignal` и предотвращение утечек памяти

**Теория.** Resource Lifecycle & Listener Leaks: в `pipelineExecution.ts` создаются `AbortController` и навешиваются
слушатели `signal.addEventListener('abort', ...)`. При высокой частоте открытия/закрытия поповеров висячие ссылки
на родительские сигналы могут приводить к утечкам памяти в долгоживущих SPA.

**Изменения:**
В `pipelineExecution.ts` гарантировать снятие слушателей (`signal.removeEventListener`) в `finally`-блоках завершения резолвера (settled/cancelled).

**Тест:** `pipelineExecution.test.ts` — 500 быстрых отмен резолвера завершаются с 0 зарегистрированных слушателей на сигнале.

---

## Фаза I — Высокопроизводительные селекторы и вычисления

### I1. Чистая мемоизация составных селекторов (`createSelector` / `shallowEqual`)

**Теория.** Selector Inefficiency & Re-render Cascade: составные селекторы (`selectTopmostEntry`, `selectActiveTrail`, `selectPinnedKeys`)
вызываются хуками React (`usePopoverTrail`, `usePopover`) через `useSyncExternalStore`. Возврат новых ссылок на массивы/объекты
без мемоизации провоцирует каскадные ре-рендеры дерева компонентов, даже если смысловые данные не изменились.

**Изменения:**
1. В `store/storeSelectors.ts`:
```ts
export function shallowEqual<T>(a: T, b: T): boolean;

export function createCachedSelector<TState, TResult>(
  selector: (state: TState) => TResult,
  equalityFn: (a: TResult, b: TResult) => boolean = shallowEqual,
): (state: TState) => TResult;
```
2. Обернуть производные селекторы `selectPinnedKeys`, `selectActiveTrailKeys`, `selectZIndexOrder` в кэширующие селекторы с сохранением стабильности ссылок (structural equality memoization).

**Тест:** `storeSelectors.test.ts` — повторный вызов селектора на неизменённом срезе состояния возвращает ту же ссылку (`toBe`).

### I2. Санитарная валидация координат и смещений (Coordinate Clamping & NaN-Guard)

**Теория.** Defensive State Sanitization: при перетаскивании карточек (`slicePinning.ts`, `offsets`) некорректные
pointer-события или деление на ноль могут занести `NaN` или `Infinity` в `DragOffset`. Это ломает CSS `transform: translate3d(...)`,
приводит к визуальному исчезновению поповеров и коррумпирует снимки персистентности.

**Изменения:**
`store/reducers/pinReducers.ts` и `utils/storeHelpers.ts`:
```ts
export function sanitizeDragOffset(offset: Readonly<DragOffset>): Readonly<DragOffset> {
  const x = Number.isFinite(offset.x) ? offset.x : 0;
  const y = Number.isFinite(offset.y) ? offset.y : 0;
  return x === offset.x && y === offset.y ? offset : { x, y };
}
```
Интеграция санитайзера в редюсеры `setOffset` и `togglePinState`.

**Тест:** `pinReducers.test.ts` — передача `{ x: NaN, y: Infinity }` приводит к безопасному сбросу в `{ x: 0, y: 0 }`.

---

## Фаза J — Ограничение памяти и жизненный цикл кэша

### J1. Ограничение роста кэша данных по умолчанию (LRU Eviction Policy)

**Теория.** Unbounded Memory Growth: встроенный L1-кэш данных резолвера (`storeCache`) по умолчанию накапливает данные без ограничений.
При открытии сотен поповеров в долгоживущей SPA-сессии это ведет к утечке памяти.

**Изменения:**
1. Новый модуль `store/resolver/lruCache.ts`:
```ts
export interface LRUCacheOptions {
  readonly maxSize?: number; // default: 50
  readonly ttlMs?: number;   // default: undefined (no ttl)
}
export function createLRUCache<TData>(options?: LRUCacheOptions): PopoverCache<TData>;
```
Реализация на базе встроенного `Map` со временем доступа O(1) и автоматическим вытеснением наименее используемых ключей.
2. В `createStoreResolver` использовать `createLRUCache` по умолчанию вместо бесконечного `Map`.

**Тест:** `pipelineCache.test.ts` — при `maxSize: 3` запись 4-го элемента вытесняет наименее используемый (LRU).

### J2. Защита кольцевого буфера истории от раздувания памяти (History Snapshot Payload Budget)

**Теория.** Heavy Snapshot Accumulation: при частом перетаскивании карточек или больших объектах `data` каждый `pushSnapshot`
в `history.ts` копирует состояние целиком. Без коалесценции частые промежуточные события drag раздувают heap и забивают стек undo/redo.

**Изменения:**
1. Ограничение размера истории по умолчанию `maxHistorySize = 30` (настраивается через `HistoryOptions`).
2. Коалесценция смещений (`coalesceRecentOffset`): последовательные мелкие сдвиги в пределах 150 мс обновляют последний снимок вместо создания нового.

**Тест:** `history.test.ts` — 50 быстрых событий drag генерируют ровно 1 точку в истории undo/redo.

---

## Фаза K — Доступность (A11y) и управление фокусом в сторе

### K1. Реестр триггеров и стек возврата фокуса (A11y Focus Restoration Registry)

**Теория.** WCAG 2.1 Focus Order & Orphan Focus: при закрытии поповера фокус обязан возвращаться на элемент,
вызвавший его открытие (триггер). Если закрытие происходит программно через стор (`closeByKey`, `closeAll`),
связь триггер ↔ поповер теряется, и фокус сбрасывается в `<body>`.

**Изменения:**
1. В `TrailEntry` добавить опциональное поле `triggerKey?: string`.
2. В события стора добавить событие восстановления фокуса:
```ts
export type FocusRestorationEvent<TPopoverKey extends string = string> = {
  type: 'restore_focus';
  closedKey: TPopoverKey;
  triggerKey?: string;
};
```
3. В `sliceTrail.ts` при удалении верхней карточки эмитить событие `restore_focus` для централизованной обработки React-слоем.

**Тест:** `sliceTrail.test.ts` — при закрытии карточки с заданным `triggerKey` эмитится событие восстановления фокуса.

---

## Фаза L — Оптимизация размера бандла и модульный экспорт

### L1. Выделение изолированного субмодуля `popover-trail/store` (Headless Subpath Export)

**Теория.** Granular Packaging & Bundle Minimization: разработчикам, создающим кастомный UI или использующим другие
рендер-движки, требуется только ядро стора (`Zustand + Reducers + DAG + FSM + Events`). Текущая схема сборки заставляет
их импортировать React-компоненты, `@floating-ui/react` и `react-focus-lock`.

**Изменения:**
1. `package.json` — добавить субпуть `./store`:
```json
"exports": {
  ".": {
    "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
  },
  "./store": {
    "import": { "types": "./dist/store.d.ts", "default": "./dist/store.js" },
    "require": { "types": "./dist/store.d.cts", "default": "./dist/store.cjs" }
  },
  "./dnd": {
    "import": { "types": "./dist/dnd.d.ts", "default": "./dist/dnd.js" },
    "require": { "types": "./dist/dnd.d.cts", "default": "./dist/dnd.cjs" }
  }
}
```
2. `tsup.config.ts`: добавить точку входа `'src/lib/popover/store/index.ts'` в `entry`.
3. `package.json` scripts: дополнить генерацию `.d.ts` / `.d.cts` для `./store`.

**Тест:** `npx publint` проходит без ошибок; размер бандла `dist/store.js` составляет `<= 7 KB` min+gzip без единого импорта React DOM.

### L2. Dead Code Elimination & Error Codes для Production-сборок

**Теория.** Dead Code Elimination (DCE): подробные многословные сообщения об ошибках, длинные префиксы логов
и `Object.freeze` нужны только при разработке. В production-бандле они неоправданно увеличивают размер пакета
и снижают скорость V8.

**Изменения:**
1. Гейтинг логгера и предупреждений:
```ts
if (process.env.NODE_ENV !== 'production') {
  logWarn('Store', `[popover-trail] Detailed warning: ${msg}`);
}
```
2. Использовать `Object.freeze` только при `process.env.NODE_ENV !== 'production'`.
3. Замена длинных текстовых исключений на компактные коды `PopoverErrorCode` (например, `ERR_INVALID_KEY`),
   с сохранением подробной расшифровки в markdown-документации ошибок.

**Тест:** сборка с `NODE_ENV=production` не содержит строк `[popover-trail FSM]` и отладочных сообщений в выходном `.js`.

### L3. Замена `react-focus-lock` на легковесный встроенный Focus Trap

**Теория.** Heavy Peer Dependency Elimination: `react-focus-lock` весит ~4.5 KB gzipped. Современные браузеры
поддерживают атрибут `inert` и нативный `showPopover()`. Для удержания фокуса в модальном поповере достаточно
легковесного хука `useFocusTrap` (~40 строк кода без зависимостей).

**Изменения:**
1. Написать чистый хук `hooks/useFocusTrap.ts` (перехват Tab/Shift+Tab по первому/последнему фокусному элементу).
2. Заменить `react-focus-lock` в `components/PopoverContent.tsx`.
3. Перевести `react-focus-lock` в статус опционального `peerDependency` (с планом полного удаления в 2.0).

**Тест:** `components/PopoverContent.test.tsx` — фокус циклически удерживается внутри открытого поповера по клавише Tab.

### L4. Настройки таргета компиляции и минификатора (`es2022` + Terser)

**Теория.** Modern JS Output & Zero Polyfill Bloat: сборка под старый стандарт генерирует полифилл-бойлерплейт
для optional chaining (`?.`), nullish coalescing (`??`) и async-генераторов. Современный стандарт `es2022` дает чистый компактный код.

**Изменения:**
В `tsup.config.ts`:
```ts
export default defineConfig({
  target: 'es2022',
  treeshake: { moduleSideEffects: false },
  minify: 'terser',
  terserOptions: {
    compress: {
      pure_funcs: ['console.debug'],
      passes: 2,
    },
  },
});
```

**Тест:** `npm run build:lib` собирает чистые ES2022 модули с экономией ~1.5 KB на бандл.

---

## Порядок работ

| Шаг | Содержание | Риск |
|---|---|---|
| 1 | A1–A3 (мёртвый код, флаги, дубль-гвард) | ≈0 |
| 2 | E1 логгер, E5 EMPTY, E6 snapshot | низкий |
| 3 | L4 таргет `es2022` + terser, L2 DCE для dev-логов | низкий |
| 4 | H1 безопасный запуск подписчиков, H4 очистка AbortSignal | низкий |
| 5 | I2 валидация координат (`clampOffset`), J2 коалесценция истории | низкий |
| 6 | B1 CleanupSourceLists, B2 sliceInteraction | низкий |
| 7 | E2 emit-канал в SliceContext, K1 событие `restore_focus` | низкий |
| 8 | L1 subpath-экспорт `popover-trail/store` | низкий |
| 9 | I1 мемоизация селекторов (`createCachedSelector`), J1 LRU-кэш | низкий |
| 10 | H2 версионирование персистентности, H3 getServerSnapshot | низкий |
| 11 | B3+B4 опции CQRS/bus, C1 probe | низкий |
| 12 | E3 таксономия типов, E4 history | низкий |
| 13 | L3 замена `react-focus-lock` на хук `useFocusTrap` | средний |
| 14 | C1 слои 1–2: resolverStyle + арность | низкий |
| 15 | F: transition_end событие, fsmRegistry (с destroyAll), dev-детектор | средний |
| 16 | G: закрепление принципов ревью, ADR-связки | ≈0 |
| 17 | D1–D8 (depcruise, fast-check, parity, ADR, knip, coverage, typecheck-тесты, size-limit) | инфраструктура |

Каждый шаг — отдельный PR + changeset (patch), полный suite зелёный.

## Метрики успеха

- 0 нарушений слоёв dependency-cruiser; knip в error-режиме; 0 регрессий в `vitest typecheck`.
- Размер бандла ядра стора (`popover-trail/store`): `<= 7 KB` min+gzip.
- Размер полного пакета (`popover-trail`): `<= 18 KB` min+gzip (экономия ~30% веса).
- Файлы store/ ≤400 строк, слайсы ≤200; LCOM4 слайсов = 1.
- Один префикс логов; ноль копий emit-boilerplate; 100% изоляция пользовательских ошибок в подписчиках.
- O(1) ограничение памяти кэша (LRU) и дедупликация снимков истории.
- WCAG 2.1 совместимый возврат фокуса при закрытии через стор.
- Suite 581+ тестов зелёный на каждом шаге; ноль ломающих изменений API.

## Граница: сознательно не входит до мажора 2.0

- Удаление @deprecated-алиасов; смена дефолтов destroyOnDispose/mirrorToGlobalBus.
- Переименование состояний FSM; склейка StoreState/PopoverStore/PopoverStateData.
- Удаление фантомных генериков публичного HistoryManager (ломает явные type-args).
- Полное удаление `react-focus-lock` из peerDependencies (до 2.0 поддерживается обратная совместимость).
- Perf-спецификации §4 STORE_ARCHITECTURE_AND_IMPROVEMENTS.md (zero-allocation dispatcher,
  structural-sharing fast paths) — там уже специфицированы.

---
*Документ дополняет STORE_ARCHITECTURE_AND_IMPROVEMENTS.md и фиксирует план следующего цикла улучшений.*
