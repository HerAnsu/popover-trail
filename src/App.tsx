import { useRef } from 'react'
import FocusLock from 'react-focus-lock'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
} from '@dnd-kit/core'
import {
  PopoverProvider,
  usePopoverTrail,
  usePopoverFloating,
  usePopoverOffsets,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverOffset,
  usePopoverActions,
  usePopoverGeometry,
  usePopoverDragAndDrop,
  type PopoverResolver,
  type TrailEntry,
} from './lib/popover'

// Define the shape of our resolved data
interface DummyData {
  title: string
  description: string
  nextItems: string[]
}

// 1. Simulating asynchronous network resolution of popover data
const dummyResolver: PopoverResolver<DummyData, string> = async (keyOrName) => {
  await new Promise((resolve) => setTimeout(resolve, 800)) // delay for realistic loading spinner

  const database: Record<string, DummyData> = {
    'skill-teleport': {
      title: 'Телепортация',
      description: 'Мгновенно перемещает персонажа в указанную точку в пределах прямой видимости. Расходует 15 маны.',
      nextItems: ['modifier-range', 'modifier-speed'],
    },
    'modifier-range': {
      title: 'Увеличение дальности',
      description: 'Увеличивает максимальную дистанцию телепортации на 25%. Требует 2-й уровень магии.',
      nextItems: ['synergy-blink'],
    },
    'modifier-speed': {
      title: 'Быстрый каст',
      description: 'Сокращает время подготовки телепортации на 0.2 секунды. Позволяет уклоняться от летящих снарядов.',
      nextItems: [],
    },
    'synergy-blink': {
      title: 'Синергия: Блинк',
      description: 'После телепортации оставляет на старом месте иллюзию, отвлекающую врагов на 1.5 секунды.',
      nextItems: [],
    },
    'item-sword': {
      title: 'Меч бесконечности',
      description: 'Легендарное оружие, выкованное в пламени древней звезды. Увеличивает физический урон на 80.',
      nextItems: ['stat-crit', 'stat-lifesteal'],
    },
    'stat-crit': {
      title: 'Шанс крита +15%',
      description: 'Критические удары наносят 200% урона и накладывают кратковременное кровотечение.',
      nextItems: [],
    },
    'stat-lifesteal': {
      title: 'Вампиризм +8%',
      description: 'Восстанавливает здоровье в размере процента от нанесенного урона.',
      nextItems: [],
    },
  }

  return (
    database[keyOrName] || {
      title: `Элемент: ${keyOrName}`,
      description: 'Сведения об этом объекте отсутствуют в базе данных.',
      nextItems: [],
    }
  )
}

// 2. Individual Popover component wrapping geometry and DND hooks
interface PopoverCardProps {
  entry: TrailEntry<DummyData>
  index: number
  isPinned: boolean
}

function PopoverCard({ entry, index, isPinned }: PopoverCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.key,
    disabled: !isPinned, // Dragging is allowed only when the popover is floating/pinned
  })

  const ref = useRef<HTMLDivElement | null>(null)

  // Use physics-based DND rotation swing
  const { rotation, dragX, dragY } = usePopoverDragAndDrop({
    isDragging,
    transform,
  })

  // Hook up boundary containment geometry
  const { finalLayoutPos } = usePopoverGeometry({
    id: entry.key,
    anchorRect: entry.rect,
    direction: 'down',
    zIndex: index,
    ref,
    isDragging,
    isPinned,
    entry,
  })

  const offset = usePopoverOffset(entry.key)
  const zIndex = usePopoverZIndex(entry.key)
  const isTop = useIsPopoverTopMost(entry.key)
  const { togglePin, closeFrom, openNestedWithResolver } = usePopoverActions<DummyData>()

  const handlePinToggle = () => {
    if (ref.current) {
      const currentRect = ref.current.getBoundingClientRect()
      togglePin(entry.key, currentRect)
    }
  }

  // Calculate rendering transform style
  const style = {
    position: 'absolute' as const,
    top: finalLayoutPos.top,
    left: finalLayoutPos.left,
    transform: `translate(${dragX + offset.x}px, ${dragY + offset.y}px) rotate(${rotation}deg)`,
    zIndex: zIndex + 1000,
  }

  const setCombinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    ref.current = node
  }

  return (
    <div
      ref={setCombinedRef}
      style={style}
      className={`popover-card ${isTop ? 'topmost' : ''}`}
    >
      <FocusLock disabled={!isTop} returnFocus>
        <div className="popover-header" {...attributes} {...listeners}>
          <span className="popover-title">{entry.isLoading ? 'Загрузка...' : entry.data?.title}</span>
          <div className="popover-actions">
            <button
              type="button"
              onClick={handlePinToggle}
              className="btn-action"
              title={isPinned ? 'Открепить поповер' : 'Приколоть поповер'}
            >
              {isPinned ? '📌' : '📍'}
            </button>
            <button
              type="button"
              onClick={() => closeFrom(index)}
              className="btn-action"
              title="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="popover-body">
          {entry.isLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <span>Получение данных...</span>
            </div>
          ) : entry.error ? (
            <div style={{ color: '#ef4444' }}>
              <strong>Ошибка:</strong> {entry.error.message}
            </div>
          ) : (
            <div>
              <p>{entry.data?.description}</p>
              {entry.data?.nextItems && entry.data.nextItems.length > 0 && (
                <div className="popover-links">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Вложенные связи:
                  </span>
                  {entry.data.nextItems.map((nextKey) => (
                    <button
                      key={nextKey}
                      type="button"
                      className="btn-link"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        void openNestedWithResolver(nextKey, entry.key, rect)
                      }}
                    >
                      🔗 {nextKey.replace('modifier-', '').replace('stat-', '')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </FocusLock>
    </div>
  )
}

// 3. Canvas rendering portals for active popovers (floating + trail)
function PopoverCanvas() {
  const trail = usePopoverTrail<DummyData>()
  const floating = usePopoverFloating<DummyData>()
  const offsets = usePopoverOffsets()
  const { updateOffset, bringToFront } = usePopoverActions<DummyData>()

  const handleDragStart = (event: DragStartEvent) => {
    bringToFront(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    const key = active.id as string
    const currentOffset = offsets[key] || { x: 0, y: 0 }
    updateOffset(key, currentOffset.x + delta.x, currentOffset.y + delta.y)
  }

  // Combine floating and trail lists for the canvas mapping
  const activeEntries = [
    ...floating.map((entry: TrailEntry<DummyData>) => ({ entry, isPinned: true })),
    ...trail.map((entry: TrailEntry<DummyData>) => ({ entry, isPinned: false })),
  ]

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {activeEntries.map(({ entry, isPinned }, idx) => (
          <div key={entry.key} style={{ pointerEvents: 'auto' }}>
            <PopoverCard
              entry={entry}
              index={isPinned ? idx : floating.length + trail.indexOf(entry)}
              isPinned={isPinned}
            />
          </div>
        ))}
      </div>
    </DndContext>
  )
}

// 4. Main App layout
function MainContent() {
  const { openRootWithResolver, clear } = usePopoverActions<DummyData>()
  const trail = usePopoverTrail()
  const floating = usePopoverFloating()

  const handleTrigger = (key: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const event = {
      currentTarget: e.currentTarget,
      stopPropagation: () => e.stopPropagation(),
    }
    void openRootWithResolver(key, event)
  }

  const totalActive = trail.length + floating.length

  return (
    <div className="playground-container">
      <div className="header">
        <h1>Popover Trail</h1>
        <p>
          Универсальная headless-библиотека поповеров. Поддерживает бесконечную вложенность, ленивую подгрузку связей, прикрепление и свободное перетаскивание с физикой наклона.
        </p>
      </div>

      <div className="trigger-zone">
        <button
          type="button"
          className="btn-trigger"
          onClick={(e) => handleTrigger('skill-teleport', e)}
        >
          🪄 Скилл: Телепортация
        </button>
        <button
          type="button"
          className="btn-trigger"
          onClick={(e) => handleTrigger('item-sword', e)}
        >
          ⚔️ Предмет: Меч бесконечности
        </button>
      </div>

      {totalActive > 0 && (
        <button
          type="button"
          onClick={clear}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
            e.currentTarget.style.color = '#ef4444'
          }}
        >
          Сбросить все окна
        </button>
      )}

      {/* Render popovers canvas */}
      <PopoverCanvas />
    </div>
  )
}

export default function App() {
  return (
    <PopoverProvider resolveData={dummyResolver} initialContext="game-client">
      <MainContent />
    </PopoverProvider>
  )
}
