import {
  PopoverProvider,
  PopoverTrigger,
  PopoverPortal,
  usePopoverCard,
  usePopoverActions,
  usePopoverNestedTrigger,
  isResolvedEntry,
  SimplePopoverCache,
  type TrailEntry,
} from './lib/popover';

// Data payload type for dev playground
interface NodeData {
  title: string;
  description: string;
  childrenKeys: string[];
}

// In-memory cache for library dev testing
const cache = new SimplePopoverCache<NodeData>(60000, 20);

// Mock resolver function
const resolveData = async (key: string, _parentData?: unknown, _context?: unknown, signal?: AbortSignal) => {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 200);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Request aborted', 'AbortError'));
      });
    }
  });

  return {
    title: `Node ${key.toUpperCase()}`,
    description: `Payload data loaded for popover key: ${key}`,
    childrenKeys: [`${key}-child-1`, `${key}-child-2`],
  };
};

function PopoverCard({ entry, index, isPinned }: { entry: TrailEntry<NodeData>; index: number; isPinned: boolean }) {
  const { closeByKey } = usePopoverActions();
  const { ref, style, dragHandleProps, handlePinToggle, isDragging } = usePopoverCard({
    entry,
    index,
    isPinned,
    placement: 'bottom-start',
  });

  return (
    <div
      ref={ref}
      style={style}
      className={`popover-card ${isPinned ? 'is-pinned' : ''} ${isDragging ? 'is-dragging' : ''}`}
    >
      <header className="drag-handle" {...dragHandleProps}>
        <span className="card-key">{entry.key}</span>
        <div className="card-controls">
          <button onClick={handlePinToggle} className="btn-small">
            {isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button onClick={() => closeByKey(entry.key)} className="btn-small btn-close">
            ✕
          </button>
        </div>
      </header>

      <div className="card-body">
        {entry.isLoading && <div className="loading-spinner">Loading node data...</div>}

        {entry.error && (
          <div className="error-box">
            <p>Error: {entry.error.message}</p>
          </div>
        )}

        {isResolvedEntry(entry) && (
          <>
            <h4>{entry.data.title}</h4>
            <p>{entry.data.description}</p>

            <div className="nested-triggers">
              <p className="section-title">Child Popovers:</p>
              {entry.data.childrenKeys.map((childKey) => (
                <NestedTriggerButton key={childKey} childKey={childKey} parentKey={entry.key} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NestedTriggerButton({ childKey, parentKey }: { childKey: string; parentKey: string }) {
  const triggerProps = usePopoverNestedTrigger(childKey, parentKey, {
    placement: 'right-start',
  });

  return (
    <button {...triggerProps} className="btn-nested">
      Open {childKey} →
    </button>
  );
}

function ControlsBar() {
  const { closeAll } = usePopoverActions();

  return (
    <div className="controls-bar">
      <button onClick={closeAll} className="btn-danger">
        Close All Popovers
      </button>
    </div>
  );
}

export function App() {
  return (
    <PopoverProvider resolveData={resolveData} cache={cache}>
      <div className="dev-workspace">
        <header className="workspace-header">
          <h1>Popover Trail Dev Playground</h1>
          <p>Development workspace for testing and verifying library features.</p>
          <ControlsBar />
        </header>

        <main className="workspace-content">
          <div className="triggers-panel">
            <h3>Root Triggers</h3>
            <div className="button-group">
              <PopoverTrigger popoverKey="root-alpha" placement="bottom-start">
                <button className="btn-trigger">Inspect Root Alpha</button>
              </PopoverTrigger>

              <PopoverTrigger popoverKey="root-beta" placement="bottom-start">
                <button className="btn-trigger">Inspect Root Beta</button>
              </PopoverTrigger>

              <PopoverTrigger popoverKey="root-gamma" placement="right-start">
                <button className="btn-trigger">Inspect Root Gamma</button>
              </PopoverTrigger>
            </div>
          </div>
        </main>

        <PopoverPortal>
          {(entries) =>
            entries.map((entry, index) => (
              <PopoverCard
                key={entry.key}
                entry={entry as TrailEntry<NodeData>}
                index={index}
                isPinned={entry.isPinned}
              />
            ))
          }
        </PopoverPortal>
      </div>
    </PopoverProvider>
  );
}

export default App;
