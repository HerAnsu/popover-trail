import { useState, memo, useRef, useEffect } from "react";
import FocusLock from "react-focus-lock";
import clsx from "clsx";
import { DndContext, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import {
  PopoverProvider,
  usePopoverTrail,
  usePopoverFloating,
  usePopoverStoreApi,
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
  hoverEnabled: boolean;
  allowDragWhenUnpinned: boolean;
}

const PopoverCard = memo(
  ({ entry, index, isPinned, hoverEnabled, allowDragWhenUnpinned }: PopoverCardProps) => {
    const [branchInput, setBranchInput] = useState("");
    const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (openTimerRef.current) {
          clearTimeout(openTimerRef.current);
        }
      };
    }, []);

    const {
      ref,
      style,
      isTop,
      actions,
      dragHandleProps,
      handlePinToggle,
      onMouseEnter,
      onMouseLeave,
      onKeyDown,
    } = usePopoverCard({
      entry,
      index,
      isPinned,
      placement: "bottom",
    });

    const handleLeftMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hoverEnabled || !entry.data?.leftExpr) return;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      openTimerRef.current = setTimeout(() => {
        void actions.openNestedWithResolver(entry.data!.leftExpr!, entry.key, {
          triggerRect: rect,
          hover: { enabled: true, openDelay: 200, closeDelay: 300 },
          allowDragWhenUnpinned,
          ariaDescribedby: `Evaluation details for left operand: ${entry.data!.leftExpr}`,
        });
      }, 200);
    };

    const handleLeftMouseLeave = () => {
      if (!hoverEnabled || !entry.data?.leftExpr) return;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      actions.hoverLeave(entry.data.leftExpr, 300);
    };

    const handleRightMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hoverEnabled || !entry.data?.rightExpr) return;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      openTimerRef.current = setTimeout(() => {
        void actions.openNestedWithResolver(entry.data!.rightExpr!, entry.key, {
          triggerRect: rect,
          hover: { enabled: true, openDelay: 200, closeDelay: 300 },
          allowDragWhenUnpinned,
          ariaDescribedby: `Evaluation details for right operand: ${entry.data!.rightExpr}`,
        });
      }, 200);
    };

    const handleRightMouseLeave = () => {
      if (!hoverEnabled || !entry.data?.rightExpr) return;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      actions.hoverLeave(entry.data.rightExpr, 300);
    };

    const handleCustomMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hoverEnabled || !branchInput.trim()) return;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      openTimerRef.current = setTimeout(() => {
        void actions.openNestedWithResolver(branchInput.trim(), entry.key, {
          triggerRect: rect,
          hover: { enabled: true, openDelay: 200, closeDelay: 300 },
          allowDragWhenUnpinned,
          ariaDescribedby: `Evaluation details for custom expression: ${branchInput.trim()}`,
        });
      }, 200);
    };

    const handleCustomMouseLeave = () => {
      if (!hoverEnabled || !branchInput.trim()) return;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      actions.hoverLeave(branchInput.trim(), 300);
    };

    return (
      <div
        ref={ref}
        style={style}
        role="dialog"
        aria-labelledby={`title-${entry.key}`}
        aria-describedby={entry.ariaDescribedby ? `desc-${entry.key}` : undefined}
        className={clsx("popover-card", isTop && "topmost", isPinned && "pinned")}
        onMouseDown={() => actions.bringToFront(entry.key)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={onKeyDown}
      >
        <FocusLock disabled={!isTop || isPinned} returnFocus>
          {entry.ariaDescribedby && (
            <div id={`desc-${entry.key}`} className="sr-only">
              {entry.ariaDescribedby}
            </div>
          )}
          <div className="popover-header" {...dragHandleProps}>
            <span id={`title-${entry.key}`} className="popover-title">
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
              <div
                style={{
                  color: "#ef4444",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <strong>Error:</strong> {entry.error.message}
                </div>
                <button
                  type="button"
                  className="btn-retry"
                  onClick={() => actions.retryPopover(entry.key)}
                  style={{
                    alignSelf: "flex-start",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.8rem",
                    borderRadius: "4px",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid #ef4444",
                    color: "#f87171",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
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
                          if (hoverEnabled) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          void actions.openNestedWithResolver(entry.data!.leftExpr!, entry.key, {
                            triggerRect: rect,
                          });
                        }}
                        onMouseEnter={handleLeftMouseEnter}
                        onMouseLeave={handleLeftMouseLeave}
                      >
                        👈 Left: {entry.data.leftExpr}
                      </button>
                    )}
                    {entry.data.rightExpr && (
                      <button
                        type="button"
                        className="btn-link"
                        onClick={(e) => {
                          if (hoverEnabled) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          void actions.openNestedWithResolver(entry.data!.rightExpr!, entry.key, {
                            triggerRect: rect,
                          });
                        }}
                        onMouseEnter={handleRightMouseEnter}
                        onMouseLeave={handleRightMouseLeave}
                      >
                        👉 Right: {entry.data.rightExpr}
                      </button>
                    )}
                  </div>
                )}

                <div
                  className="custom-branch-zone"
                  style={{
                    marginTop: "1rem",
                    paddingTop: "0.8rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "0.3rem",
                    }}
                  >
                    Extend with custom formula:
                  </span>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <input
                      type="text"
                      placeholder="e.g. 5 * (2 + 1)"
                      value={branchInput}
                      onChange={(e) => setBranchInput(e.target.value)}
                      style={{
                        flex: 1,
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "4px",
                        color: "#fff",
                        padding: "0.3rem 0.5rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <button
                      type="button"
                      disabled={!branchInput.trim()}
                      style={{
                        background: "rgba(99, 102, 241, 0.2)",
                        border: "1px solid rgba(99, 102, 241, 0.4)",
                        borderRadius: "4px",
                        color: "#fff",
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.75rem",
                        cursor: branchInput.trim() ? "pointer" : "not-allowed",
                        fontWeight: 600,
                      }}
                      onClick={(e) => {
                        if (hoverEnabled) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        void actions.openNestedWithResolver(branchInput.trim(), entry.key, {
                          triggerRect: rect,
                        });
                        setBranchInput("");
                      }}
                      onMouseEnter={handleCustomMouseEnter}
                      onMouseLeave={handleCustomMouseLeave}
                    >
                      Branch
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FocusLock>
      </div>
    );
  },
);

PopoverCard.displayName = "PopoverCard";

function PopoverCanvas({
  hoverEnabled,
  allowDragWhenUnpinned,
}: {
  hoverEnabled: boolean;
  allowDragWhenUnpinned: boolean;
}) {
  const trail = usePopoverTrail<MathData>();
  const floating = usePopoverFloating<MathData>();
  const store = usePopoverStoreApi<MathData>();
  const { updateOffset, bringToFront } = usePopoverActions<MathData>();

  const handleDragStart = (event: DragStartEvent) => {
    bringToFront(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const key = active.id as string;
    const currentOffset = store.getState().offsets[key] || { x: 0, y: 0 };
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
              hoverEnabled={hoverEnabled}
              allowDragWhenUnpinned={allowDragWhenUnpinned}
            />
          </div>
        ))}
      </div>
    </DndContext>
  );
}

interface MainContentProps {
  hoverEnabled: boolean;
  setHoverEnabled: (val: boolean) => void;
  arrowNavEnabled: boolean;
  setArrowNavEnabled: (val: boolean) => void;
  debugEnabled: boolean;
  setDebugEnabled: (val: boolean) => void;
  allowDragWhenUnpinned: boolean;
  setAllowDragWhenUnpinned: (val: boolean) => void;
  cascadeOffsetStep: number;
  setCascadeOffsetStep: (val: number) => void;
}

function MainContent({
  hoverEnabled,
  setHoverEnabled,
  arrowNavEnabled,
  setArrowNavEnabled,
  debugEnabled,
  setDebugEnabled,
  allowDragWhenUnpinned,
  setAllowDragWhenUnpinned,
  cascadeOffsetStep,
  setCascadeOffsetStep,
}: MainContentProps) {
  const [customRoot, setCustomRoot] = useState("((1 + 2) * 3) / (4 - (5 ^ 2))");
  const { clear, openRootWithResolver } = usePopoverActions<MathData>();
  const trail = usePopoverTrail<MathData>();
  const floating = usePopoverFloating<MathData>();

  const hoverConfig = { enabled: hoverEnabled, openDelay: 200, closeDelay: 300 };

  const trig1 = usePopoverTrigger("2 * (3 + (15 / 5))", {
    hover: hoverConfig,
    allowDragWhenUnpinned,
    ariaDescribedby: "Mathematical evaluation details for 2 * (3 + (15 / 5))",
  });
  const trig2 = usePopoverTrigger("(4 ^ 2) - (2 * (5 + 1))", {
    hover: hoverConfig,
    allowDragWhenUnpinned,
    ariaDescribedby: "Mathematical evaluation details for (4 ^ 2) - (2 * (5 + 1))",
  });
  const trig3 = usePopoverTrigger("100 / (2 * (3 + (4 - 2)))", {
    hover: hoverConfig,
    allowDragWhenUnpinned,
    ariaDescribedby: "Mathematical evaluation details for 100 / (2 * (3 + (4 - 2)))",
  });

  const handleOpenCustomRoot = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!customRoot.trim()) return;
    void openRootWithResolver(
      customRoot.trim(),
      {
        currentTarget: e.currentTarget,
        stopPropagation: () => {},
      },
      {
        hover: hoverConfig,
        allowDragWhenUnpinned,
        ariaDescribedby: `Mathematical evaluation details for custom expression: ${customRoot.trim()}`,
      },
    );
  };

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
        className="config-panel"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "1rem",
          width: "100%",
          maxWidth: "480px",
          marginBottom: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          pointerEvents: "auto",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)" }}>
          ⚙️ Settings Panel
        </h3>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          <input
            type="checkbox"
            checked={hoverEnabled}
            onChange={(e) => setHoverEnabled(e.target.checked)}
          />
          Enable Hover Triggers (with 200ms open/300ms close buffer)
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          <input
            type="checkbox"
            checked={arrowNavEnabled}
            onChange={(e) => setArrowNavEnabled(e.target.checked)}
          />
          Enable Keyboard Arrow Navigation (WAI-ARIA)
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          <input
            type="checkbox"
            checked={debugEnabled}
            onChange={(e) => setDebugEnabled(e.target.checked)}
          />
          Enable Console Debug Logger (see browser developer tools)
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          <input
            type="checkbox"
            checked={allowDragWhenUnpinned}
            onChange={(e) => setAllowDragWhenUnpinned(e.target.checked)}
          />
          Allow Dragging Unpinned/Trailing Cards
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          Cascade Offset Step:
          <select
            value={cascadeOffsetStep}
            onChange={(e) => setCascadeOffsetStep(Number(e.target.value))}
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "0.8rem",
              padding: "2px 4px",
              pointerEvents: "auto",
            }}
          >
            <option value={0}>0px (Stacked)</option>
            <option value={8}>8px (Default)</option>
            <option value={15}>15px (Wide)</option>
            <option value={30}>30px (Extra Wide)</option>
          </select>
        </label>
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

        <div
          className="custom-root-zone"
          style={{
            display: "flex",
            gap: "0.5rem",
            width: "100%",
            marginTop: "0.4rem",
          }}
        >
          <input
            type="text"
            value={customRoot}
            onChange={(e) => setCustomRoot(e.target.value)}
            placeholder="Type custom math formula..."
            style={{
              flex: 1,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              color: "#fff",
              padding: "0.6rem 0.8rem",
              fontSize: "0.9rem",
            }}
          />
          <button
            type="button"
            onClick={handleOpenCustomRoot}
            disabled={!customRoot.trim()}
            style={{
              background: "indigo",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              padding: "0.6rem 1.2rem",
              fontSize: "0.9rem",
              cursor: customRoot.trim() ? "pointer" : "not-allowed",
              fontWeight: 600,
            }}
          >
            Compute
          </button>
        </div>
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
        <PopoverCanvas hoverEnabled={hoverEnabled} allowDragWhenUnpinned={allowDragWhenUnpinned} />
      </PopoverPortal>
    </div>
  );
}

export default function App() {
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [arrowNavEnabled, setArrowNavEnabled] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(true);
  const [allowDragWhenUnpinned, setAllowDragWhenUnpinned] = useState(false);
  const [cascadeOffsetStep, setCascadeOffsetStep] = useState(8);

  return (
    <PopoverProvider
      resolveData={mathResolver}
      initialContext="math-client"
      clickOutside={{ enabled: true, ignoreClass: "btn-trigger" }}
      enableArrowNavigation={arrowNavEnabled}
      debug={debugEnabled}
      cascadeOffsetStep={cascadeOffsetStep}
    >
      <MainContent
        hoverEnabled={hoverEnabled}
        setHoverEnabled={setHoverEnabled}
        arrowNavEnabled={arrowNavEnabled}
        setArrowNavEnabled={setArrowNavEnabled}
        debugEnabled={debugEnabled}
        setDebugEnabled={setDebugEnabled}
        allowDragWhenUnpinned={allowDragWhenUnpinned}
        setAllowDragWhenUnpinned={setAllowDragWhenUnpinned}
        cascadeOffsetStep={cascadeOffsetStep}
        setCascadeOffsetStep={setCascadeOffsetStep}
      />
    </PopoverProvider>
  );
}
