import FocusLock from "react-focus-lock";
import clsx from "clsx";
import { DndContext, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import {
  PopoverProvider,
  usePopoverTrail,
  usePopoverFloating,
  usePopoverOffsets,
  usePopoverActions,
  usePopoverCard,
  PopoverPortal,
  usePopoverTrigger,
  type PopoverResolver,
  type TrailEntry,
} from "./lib/popover";

// Math Expression tree data shape
interface MathData {
  title: string;
  expression: string;
  value: number;
  operator: string | null; // e.g. "+", "-", "*", "/", "^", or null for leaf numbers
  leftExpr?: string;
  rightExpr?: string;
}

// Helper parser to recursively dissect math expressions
function parseExpression(expr: string): MathData {
  expr = expr.trim();

  // Strip wrapping parentheses if they wrap the entire expression (e.g. "(3 + 5)" -> "3 + 5")
  let cleaned = expr;
  while (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    let depth = 0;
    let balanceMatch = true;
    for (let i = 0; i < cleaned.length - 1; i++) {
      if (cleaned[i] === "(") depth++;
      if (cleaned[i] === ")") depth--;
      if (depth === 0) {
        balanceMatch = false;
        break;
      }
    }
    if (balanceMatch) {
      cleaned = cleaned.slice(1, -1).trim();
    } else {
      break;
    }
  }

  // Find lowest precedence operator (+ and - first, then * and /, then ^) outside of parens
  let opIndex = -1;
  let opType: string | null = null;
  let depth = 0;

  // Scan backwards for + and -
  for (let i = cleaned.length - 1; i >= 0; i--) {
    const char = cleaned[i];
    if (char === ")") depth++;
    if (char === "(") depth--;
    if (depth === 0) {
      if (char === "+" || char === "-") {
        opIndex = i;
        opType = char;
        break;
      }
    }
  }

  // Scan backwards for * and /
  if (opIndex === -1) {
    depth = 0;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      const char = cleaned[i];
      if (char === ")") depth++;
      if (char === "(") depth--;
      if (depth === 0) {
        if (char === "*" || char === "/") {
          opIndex = i;
          opType = char;
          break;
        }
      }
    }
  }

  // Scan backwards for ^
  if (opIndex === -1) {
    depth = 0;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      const char = cleaned[i];
      if (char === ")") depth++;
      if (char === "(") depth--;
      if (depth === 0) {
        if (char === "^") {
          opIndex = i;
          opType = char;
          break;
        }
      }
    }
  }

  if (opIndex !== -1 && opType) {
    const leftStr = cleaned.slice(0, opIndex).trim();
    const rightStr = cleaned.slice(opIndex + 1).trim();

    const leftParsed = parseExpression(leftStr);
    const rightParsed = parseExpression(rightStr);

    let value = 0;
    let opName = "";
    if (opType === "+") {
      value = leftParsed.value + rightParsed.value;
      opName = "Addition (+)";
    } else if (opType === "-") {
      value = leftParsed.value - rightParsed.value;
      opName = "Subtraction (-)";
    } else if (opType === "*") {
      value = leftParsed.value * rightParsed.value;
      opName = "Multiplication (*)";
    } else if (opType === "/") {
      value = rightParsed.value !== 0 ? leftParsed.value / rightParsed.value : 0;
      opName = "Division (/)";
    } else if (opType === "^") {
      value = leftParsed.value ** rightParsed.value;
      opName = "Exponentiation (^)";
    }

    return {
      title: opName,
      expression: expr,
      value,
      operator: opType,
      leftExpr: leftStr,
      rightExpr: rightStr,
    };
  }

  // Leaf node
  const num = parseFloat(cleaned) || 0;
  return {
    title: `Value: ${num}`,
    expression: expr,
    value: num,
    operator: null,
  };
}

// Simulating network loading delay for expression resolution
const mathResolver: PopoverResolver<MathData, string> = async (keyOrName) => {
  await new Promise((resolve) => setTimeout(resolve, 600)); // 600ms latency simulation
  return parseExpression(keyOrName);
};

interface PopoverCardProps {
  entry: TrailEntry<MathData>;
  index: number;
  isPinned: boolean;
}

function PopoverCard({ entry, index, isPinned }: PopoverCardProps) {
  const { ref, style, isTop, actions, dragHandleProps, handlePinToggle } = usePopoverCard({
    entry,
    index,
    isPinned,
    placement: "bottom",
  });

  return (
    <div
      ref={ref}
      style={style}
      role="dialog"
      className={clsx("popover-card", isTop && "topmost", isPinned && "pinned")}
      onMouseDown={() => actions.bringToFront(entry.key)}
    >
      <FocusLock disabled={!isTop} returnFocus>
        <div className="popover-header" {...dragHandleProps}>
          <span className="popover-title">
            {entry.isLoading ? "Evaluating..." : entry.data?.title}
          </span>
          <div className="popover-actions">
            <button
              type="button"
              onClick={handlePinToggle}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="btn-action"
              title={isPinned ? "Unpin popover" : "Pin popover"}
            >
              {isPinned ? "📌" : "📍"}
            </button>
            <button
              type="button"
              onClick={() => actions.closeFrom(index)}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="btn-action"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="popover-body">
          {entry.isLoading ? (
            <div className="spinner-container">
              <div className="spinner" />
              <span>Parsing expression...</span>
            </div>
          ) : entry.error ? (
            <div style={{ color: "#ef4444" }}>
              <strong>Error:</strong> {entry.error.message}
            </div>
          ) : (
            <div>
              <div className="math-expression-display" style={{ marginBottom: "0.8rem" }}>
                <span className="math-label">Expression:</span>
                <code className="math-code">{entry.data?.expression}</code>
                <div className="math-result" style={{ marginTop: "0.4rem", fontWeight: 700 }}>
                  Result = <span className="math-value">{entry.data?.value}</span>
                </div>
              </div>

              {entry.data?.operator && (
                <div
                  className="popover-links"
                  style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
                >
                  <span
                    style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}
                  >
                    Drill down operands:
                  </span>
                  {entry.data.leftExpr && (
                    <button
                      type="button"
                      className="btn-link"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        void actions.openNestedWithResolver(entry.data!.leftExpr!, entry.key, {
                          triggerRect: rect,
                        });
                      }}
                    >
                      👈 Left: {entry.data.leftExpr}
                    </button>
                  )}
                  {entry.data.rightExpr && (
                    <button
                      type="button"
                      className="btn-link"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        void actions.openNestedWithResolver(entry.data!.rightExpr!, entry.key, {
                          triggerRect: rect,
                        });
                      }}
                    >
                      👉 Right: {entry.data.rightExpr}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </FocusLock>
    </div>
  );
}

function PopoverCanvas() {
  const trail = usePopoverTrail<MathData>();
  const floating = usePopoverFloating<MathData>();
  const offsets = usePopoverOffsets();
  const { updateOffset, bringToFront } = usePopoverActions<MathData>();

  const handleDragStart = (event: DragStartEvent) => {
    bringToFront(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const key = active.id as string;
    const currentOffset = offsets[key] || { x: 0, y: 0 };
    updateOffset(key, currentOffset.x + delta.x, currentOffset.y + delta.y);
  };

  const activeEntries = [
    ...floating.map((entry: TrailEntry<MathData>) => ({ entry, isPinned: true })),
    ...trail.map((entry: TrailEntry<MathData>) => ({ entry, isPinned: false })),
  ];

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        {activeEntries.map(({ entry, isPinned }, idx) => (
          <div key={entry.key} style={{ pointerEvents: "auto" }}>
            <PopoverCard
              entry={entry}
              index={isPinned ? idx : floating.length + trail.indexOf(entry)}
              isPinned={isPinned}
            />
          </div>
        ))}
      </div>
    </DndContext>
  );
}

function MainContent() {
  const { clear } = usePopoverActions<MathData>();
  const trail = usePopoverTrail();
  const floating = usePopoverFloating();

  const trig1 = usePopoverTrigger("2 * (3 + (15 / 5))");
  const trig2 = usePopoverTrigger("(4 ^ 2) - (2 * (5 + 1))");
  const trig3 = usePopoverTrigger("100 / (2 * (3 + (4 - 2)))");

  const totalActive = trail.length + floating.length;

  return (
    <div className="playground-container">
      <div className="header">
        <h1>Popover Math Trail</h1>
        <p>
          Headless React Popover Trail engine. Inspect nested mathematical operations. Drill down
          into left/right operands recursively, pin nodes, and drag them around.
        </p>
      </div>

      <div
        className="trigger-zone"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <button type="button" className="btn-trigger" {...trig1} style={{ textAlign: "left" }}>
          🧮 Compute: 2 * (3 + (15 / 5))
        </button>
        <button type="button" className="btn-trigger" {...trig2} style={{ textAlign: "left" }}>
          🧮 Compute: (4 ^ 2) - (2 * (5 + 1))
        </button>
        <button type="button" className="btn-trigger" {...trig3} style={{ textAlign: "left" }}>
          🧮 Compute: 100 / (2 * (3 + (4 - 2)))
        </button>
      </div>

      {totalActive > 0 && (
        <button
          type="button"
          onClick={clear}
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
            marginTop: "1rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.color = "#ef4444";
          }}
        >
          Reset All Popovers
        </button>
      )}

      <PopoverPortal>
        <PopoverCanvas />
      </PopoverPortal>
    </div>
  );
}

export default function App() {
  return (
    <PopoverProvider
      resolveData={mathResolver}
      initialContext="math-client"
      clickOutside={{ enabled: true, ignoreClass: "btn-trigger" }}
    >
      <MainContent />
    </PopoverProvider>
  );
}
