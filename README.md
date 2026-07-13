# Popover Trail 🪄

**Popover Trail** — это универсальная headless-библиотека для создания всплывающих окон (поповеров) в React с поддержкой бесконечной вложенности (цепочек окон), ленивой асинхронной загрузки связей, свободного перетаскивания и физики наклона.

## Особенности 🌟

- 🔗 **Цепочки окон (Trail)**: Каждое вложенное окно связывается с родительским. Закрытие родителя автоматически очищает всю дочернюю ветку.
- 📌 **Прикрепление (Pinning)**: Окна можно откреплять от цепочки (кнопкой пина) и превращать в независимые свободно перетаскиваемые плавающие карточки (`floating`).
- 🎯 **Точечное позиционирование**: Позиционирование окон с учетом коллизий (умный сдвиг, перенос границ) на базе `@floating-ui/react`.
- 🕹️ **Интерактивная физика**: Поддержка DND с реактивной физикой (плавный наклон при перетаскивании и мягкое затухание/инерция при остановке).
- 🛡️ **Защита от Race Conditions**: Контроль очередей загрузки данных — стор отбрасывает устаревшие сетевые ответы, если пользователь быстро кликнул по нескольким ссылкам.
- 🛡️ **Умный портал**: Компонент `<PopoverPortal>` монтирует окна на уровне `body`, избавляя интерфейс от обрезания границами родительских `overflow: hidden` контейнеров.
- 🔁 **Повторные попытки (Retry)**: Возможность перезагрузить данные для карточки прямо внутри поповера с помощью экшена `retryPopover`.
- ⌨️ **Keyboard & Mouse Events**: Закрытие верхнего активного окна кнопкой `Escape`, фокус-локи внутри активного окна и закрытие по клику вовне (`clickOutside`).

---

## Установка 📦

Установите пакет и его peer-зависимости:

```bash
npm install popover-trail
```

Убедитесь, что в вашем проекте установлены необходимые `peerDependencies`:
`react`, `react-dom`, `@dnd-kit/core`, `@floating-ui/react`, `zustand`.

---

## Быстрый старт 🚀

### 1. Подключение провайдера (`PopoverProvider`)

Оберните ваше приложение или рабочую область в `PopoverProvider`, передав функцию-резолвер для ленивой подгрузки данных:

```tsx
import { PopoverProvider } from 'popover-trail';

// Асинхронный резолвер данных (например, запрос к API)
const apiResolver = async (key: string, parentData?: any) => {
  const response = await fetch(`/api/details/${key}`);
  if (!response.ok) throw new Error('Ошибка сети');
  return response.json();
};

export default function App() {
  return (
    <PopoverProvider 
      resolveData={apiResolver}
      clickOutside={{ enabled: true, ignoreClass: 'btn-trigger' }}
    >
      <MyGameClient />
    </PopoverProvider>
  );
}
```

### 2. Привязка кнопок открытия (`usePopoverTrigger`)

Используйте хук `usePopoverTrigger` для простой и быстрой привязки кнопок, открывающих корневой поповер:

```tsx
import { usePopoverTrigger } from 'popover-trail';

export function SkillPanel() {
  const teleportProps = usePopoverTrigger('skill-teleport');

  return (
    <button className="btn-trigger" {...teleportProps}>
      🪄 Телепортация
    </button>
  );
}
```

### 3. Рендеринг холста окон (`PopoverPortal` + `usePopoverCard`)

Создайте холст отрисовки всплывающих окон. Для безопасности верстки используйте `<PopoverPortal>`:

```tsx
import { 
  usePopoverTrail, 
  usePopoverFloating, 
  usePopoverActions,
  PopoverPortal,
  usePopoverCard 
} from 'popover-trail';
import FocusLock from 'react-focus-lock';

export function PopoverCanvas() {
  const trail = usePopoverTrail();
  const floating = usePopoverFloating();

  return (
    <PopoverPortal>
      {/* Отрисовка прикрепленных и свободных поповеров */}
      {[...floating, ...trail].map((entry, idx) => (
        <PopoverCard key={entry.key} entry={entry} index={idx} />
      ))}
    </PopoverPortal>
  );
}

function PopoverCard({ entry, index }) {
  const { clear, retryPopover } = usePopoverActions();
  const isPinned = entry.parentKey === undefined; // или берем из состояния стора

  // Получаем стили позиционирования, драга и физики наклона
  const { 
    ref, 
    style, 
    dragHandleProps, 
    isTopMost, 
    togglePin, 
    close, 
    openNested 
  } = usePopoverCard({
    entry,
    index,
    isPinned,
    placement: 'bottom',       // Базовое размещение
    enableDrag: true,          // Разрешить перетаскивание при откреплении
    enableTilt: true,          // Включить физику наклона
    maxTiltAngle: 8,           // Максимальный градус наклона
    tiltSensitivity: 10,       // Чувствительность наклона к скорости мыши
  });

  return (
    <div ref={ref} style={style} className="popover-card">
      <FocusLock returnFocus disabled={!isTopMost}>
        {/* Шапка, за которую можно перетаскивать карточку */}
        <div className="popover-header" {...dragHandleProps}>
          <span>{entry.key}</span>
          <button onClick={() => togglePin()}>📌</button>
          <button onClick={close}>❌</button>
        </div>

        {/* Тело карточки */}
        <div className="popover-body">
          {entry.isLoading && <div className="loader">Загрузка...</div>}
          
          {entry.error && (
            <div className="error-zone">
              <p>Не удалось загрузить данные</p>
              <button onClick={() => retryPopover(entry.key)}>Повторить</button>
            </div>
          )}

          {entry.data && (
            <div>
              <h3>{entry.data.title}</h3>
              <p>{entry.data.description}</p>
              
              {/* Ссылка для открытия вложенного уровня */}
              <button onClick={(e) => openNested('sub-item-key', e)}>
                Открыть вложенный элемент
              </button>
            </div>
          )}
        </div>
      </FocusLock>
    </div>
  );
}
```

---

## Стилизация (Vanilla CSS, SCSS, Tailwind) 🎨

Headless-подход предоставляет вам полную свободу в дизайне. Вы можете использовать любые CSS-решения.

### Пример с TailwindCSS:

Благодаря интеграции с библиотекой `clsx`, вы можете динамически управлять стилями Tailwind:

```tsx
import clsx from 'clsx';

function PopoverCard({ entry, index }) {
  const { ref, style, isTopMost } = usePopoverCard({ entry, index, isPinned: false });

  return (
    <div 
      ref={ref} 
      style={style} 
      className={clsx(
        "absolute rounded-xl shadow-2xl p-4 bg-slate-900 border text-white transition-shadow duration-300",
        isTopMost ? "border-indigo-500 shadow-indigo-500/20" : "border-slate-800"
      )}
    >
      {/* Содержимое */}
    </div>
  );
}
```

---

## Конфигурация API хука `usePopoverCard` ⚙️

| Свойство | Тип | По умолчанию | Описание |
| :--- | :--- | :--- | :--- |
| `entry` | `TrailEntry` | *Обязательно* | Объект поповера из стора. |
| `index` | `number` | *Обязательно* | Z-Index / порядковый индекс карточки. |
| `isPinned` | `boolean` | *Обязательно* | Находится ли карточка в прикрепленном (`floating`) состоянии. |
| `placement` | `PopoverPlacement` | `'bottom'` | Базовое размещение относительно родителя (`top`, `bottom`, `left`, `right` + вариации `start`/`end`). |
| `enableDrag` | `boolean` | `true` | Включает перетаскивание мышкой для открепленных окон. |
| `enableTilt` | `boolean` | `true` | Включает физический наклон (покачивание) карточки при драге. |
| `maxTiltAngle`| `number` | `5` | Максимальный угол наклона в градусах. |
| `tiltSensitivity`| `number` | `8` | Множитель чувствительности физики наклона. |

---

## Лицензия 📄

MIT License. Сделано с любовью для отзывчивых и интерактивных интерфейсов.
