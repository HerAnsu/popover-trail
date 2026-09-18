# 📚 Справочник функций проекта


## 📁 `components/card/CardActionButtonBase.tsx`

### `CardActionButtonBase`

```typescript
export function CardActionButtonBase<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  onAction,
  ariaLabel,
  disabled,
  ...restProps
}: CardActionButtonBaseProps<E>)
```

*JSDoc отсутствует*

---


## 📁 `components/card/PopoverCardBase.tsx`

### `resolveCardAriaLabel`

```typescript
function resolveCardAriaLabel(userLabel: unknown, entryKey: string): string
```

*JSDoc отсутствует*

---


## 📁 `components/card/PopoverCardCloseButton.tsx`

### `PopoverCardCloseButton`

```typescript
export function PopoverCardCloseButton<E extends ElementType = 'button'>(
  props: PopoverCardCloseButtonProps<E>,
)
```

*JSDoc отсутствует*

---


## 📁 `components/card/PopoverCardContent.tsx`

### `PopoverCardContent`

```typescript
export function PopoverCardContent<E extends ElementType = 'div'>({
  as,
  children,
  ...restProps
}: PopoverCardContentProps<E>)
```

/**
* Sub-component for the main content body container of a `<PopoverCard>`.
*
* @remarks
* Renders as a polymorphic container (`as="div"` by default, configurable to `as="section"`, `as="main"`, etc.).
*
* @template E - Underlying HTML element or component type.
* @param props - Polymorphic container props and children.
* @returns Content body wrapper element.
*/

---


## 📁 `components/card/PopoverCardHandle.tsx`

### `PopoverCardHandle`

```typescript
export function PopoverCardHandle<E extends ElementType = 'header'>({
  as,
  asChild,
  children,
  className,
  style: userStyle,
  ...restProps
}: PopoverCardHandleProps<E>)
```

/**
* Drag handle wrapper that binds DnD pointer listeners from the enclosing popover card scope.
* Allows users to drag and reposition pinned/floating cards across the viewport canvas.
*/

---


## 📁 `components/card/PopoverCardHeader.tsx`

### `PopoverCardHeader`

```typescript
export function PopoverCardHeader({
  title,
  maxTitleLength,
  showPin = true,
  showClose = true,
  children,
  className,
  style,
}: PopoverCardHeaderProps)
```

*JSDoc отсутствует*

---


## 📁 `components/card/PopoverCardPinButton.tsx`

### `PopoverCardPinButton`

```typescript
export function PopoverCardPinButton<E extends ElementType = 'button'>(
  props: PopoverCardPinButtonProps<E>,
)
```

*JSDoc отсутствует*

---


## 📁 `components/FocusTrap.test.tsx`

### `runEffects`

```typescript
const runEffects = (): Array<() => void> =>
```

*JSDoc отсутствует*

---


## 📁 `components/FocusTrap.tsx`

### `FocusTrap`

```typescript
export function FocusTrap({
  children,
  disabled = false,
  returnFocus = true,
  autoFocus = true,
  style,
  className,
}: FocusTrapProps)
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverCard.test.tsx`

### `cardElement`

```typescript
const cardElement = (
      <PopoverCard entry={mockEntry} index={0} isPinned={false} className="custom-card">
        <PopoverCard.Handle className="card-handle">
          <span>Test Title</span>
          <PopoverCard.PinButton>Pin</PopoverCard.PinButton>
          <PopoverCard.CloseButton>Close</PopoverCard.CloseButton>
        </PopoverCard.Handle>
        <PopoverCard.Content className="card-body">
          <p>Body Content</p>
        </PopoverCard.Content>
      </PopoverCard>
    )
```

*JSDoc отсутствует*

---

### `cardElement`

```typescript
const cardElement = (
      <PopoverCard as="section" entry={mockEntry} index={0} isPinned={true}>
        <PopoverCard.Handle as="div">
          <PopoverCard.Content as="main">
            <p>Polymorphic content</p>
          </PopoverCard.Content>
        </PopoverCard.Handle>
      </PopoverCard>
    )
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverPortal.test.tsx`

### `containerFn`

```typescript
const containerFn = () => target
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverPortal.tsx`

### `PopoverPortal`

```typescript
export function PopoverPortal({ children, container }: PopoverPortalProps)
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverTimeline.test.tsx`

### `timelineElement`

```typescript
const timelineElement = (
      <PopoverTimeline className="custom-timeline">
        <PopoverTimeline.UndoButton className="undo-btn">Undo</PopoverTimeline.UndoButton>
        <PopoverTimeline.StepList className="step-list">
          <PopoverTimeline.Step index={0} stepKey="card-1" label="Step 1" />
          <PopoverTimeline.Step index={1} stepKey="card-2" label="Step 2" />
        </PopoverTimeline.StepList>
        <PopoverTimeline.RedoButton className="redo-btn">Redo</PopoverTimeline.RedoButton>
      </PopoverTimeline>
    )
```

*JSDoc отсутствует*

---

### `element`

```typescript
const element = (
      <PopoverTimeline>
        <PopoverTimeline.StepList>
          {({ history }: { history: readonly { primaryKey: string; stepIndex: number }[] }) =>
            history.map((item: { primaryKey: string; stepIndex: number }) => (
              <PopoverTimeline.Step key={item.primaryKey} stepIndex={item.stepIndex}>
                {item.primaryKey}
              </PopoverTimeline.Step>
            ))
          }
        </PopoverTimeline.StepList>
      </PopoverTimeline>
    )
```

*JSDoc отсутствует*

---

### `element`

```typescript
const element = (
      <PopoverTimeline as="div">
        <PopoverTimeline.StepList as="ul">
          <PopoverTimeline.Step as="a" index={0} stepKey="card-1" />
        </PopoverTimeline.StepList>
      </PopoverTimeline>
    )
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverTimeline.tsx`

### `PopoverTimeline`

```typescript
export function PopoverTimeline<E extends ElementType = 'nav'>({
  as,
  children,
  className,
  ...restProps
}: PopoverTimelineProps<E>)
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverTrail.test.tsx`

### `el`

```typescript
const el = (
      <PopoverTrail
        renderCard={(entry, index, isPinned) => (
          <div key={entry.key}>
            Card {index} (pinned: {String(isPinned)})
          </div>
        )}
      />
    )
```

*JSDoc отсутствует*

---

### `filterFn`

```typescript
const filterFn = (entry: TrailEntry<unknown>, _index?: number) => entry.key !== 'card-1'
```

*JSDoc отсутствует*

---

### `getFiltered`

```typescript
const getFiltered = (filter: typeof currentFilter) =>
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverTrail.tsx`

### `PopoverTrail`

```typescript
export function PopoverTrail<TData = unknown>({
  renderCard,
  filter,
  container,
}: PopoverTrailProps<TData>)
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverTrigger.test.tsx`

### `el`

```typescript
const el = (
      <PopoverTrigger popoverKey="card-1">
        <button>Open Card 1</button>
      </PopoverTrigger>
    )
```

*JSDoc отсутствует*

---

### `el`

```typescript
const el = (
      <PopoverTrigger popoverKey="child-1" parentKey="root-1">
        <button>Open Child</button>
      </PopoverTrigger>
    )
```

*JSDoc отсутствует*

---

### `renderProp`

```typescript
const renderProp = (props: Record<string, unknown>) => (
      <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>Open</button>
    )
```

*JSDoc отсутствует*

---


## 📁 `components/PopoverTrigger.tsx`

### `PopoverTrigger`

```typescript
export function PopoverTrigger<TPopoverKey extends string = string>({
  popoverKey,
  placement,
  offset,
  options,
  activeClassName,
  asChild,
  children,
}: PopoverTriggerProps<TPopoverKey>)
```

*JSDoc отсутствует*

---


## 📁 `components/timeline/PopoverTimelineButtonsState.test.tsx`

### `createMockTimeline`

```typescript
function createMockTimeline(canUndo: boolean, canRedo: boolean): UsePopoverTimelineResult<unknown>
```

*JSDoc отсутствует*

---


## 📁 `components/timeline/PopoverTimelineRedoButton.tsx`

### `PopoverTimelineRedoButton`

```typescript
export function PopoverTimelineRedoButton<E extends ElementType = 'button'>({
  as,
  children,
  className,
  onClick,
  disabled,
  ...restProps
}: PopoverTimelineRedoButtonProps<E>)
```

*JSDoc отсутствует*

---

### `handleClick`

```typescript
const handleClick = (e: React.MouseEvent<HTMLElement>) =>
```

*JSDoc отсутствует*

---


## 📁 `components/timeline/PopoverTimelineScopeContext.ts`

### `assertTimelineScope`

```typescript
function assertTimelineScope<TData>(ctx: unknown): asserts ctx is PopoverTimelineScope<TData>
```

*JSDoc отсутствует*

---

### `usePopoverTimelineScope`

```typescript
export function usePopoverTimelineScope<TData = unknown>(): PopoverTimelineScope<TData>
```

*JSDoc отсутствует*

---


## 📁 `components/timeline/PopoverTimelineStep.test.tsx`

### `renderStep`

```typescript
function renderStep<E extends React.ElementType = 'button'>(
  props: PopoverTimelineStepProps<E>,
): React.ReactElement<RenderedStepProps>
```

*JSDoc отсутствует*

---


## 📁 `components/timeline/PopoverTimelineStep.tsx`

### `PopoverTimelineStepInner`

```typescript
function PopoverTimelineStepInner<E extends ElementType = 'button'>({
  as,
  index,
  stepIndex,
  stepKey,
  active,
  label,
  maxLabelLength,
  children,
  className,
  onClick,
  onKeyDown,
  ...restProps
}: PopoverTimelineStepProps<E>)
```

*JSDoc отсутствует*

---

### `handleClick`

```typescript
const handleClick = (e: React.MouseEvent<HTMLElement>) =>
```

*JSDoc отсутствует*

---

### `handleKeyDown`

```typescript
const handleKeyDown = (e: KeyboardEvent<HTMLElement>) =>
```

*JSDoc отсутствует*

---

### `PopoverTimelineStep`

```typescript
export function PopoverTimelineStep<E extends ElementType = 'button'>(
  props: PopoverTimelineStepProps<E>,
)
```

*JSDoc отсутствует*

---


## 📁 `components/timeline/PopoverTimelineStepList.test.tsx`

### `createMockTimeline`

```typescript
function createMockTimeline(
  history: PopoverTimelineItem<TestData>[] = [],
  currentIndex = 0,
): UsePopoverTimelineResult<TestData>
```

*JSDoc отсутствует*

---

### `renderWithTimeline`

```typescript
function renderWithTimeline<TData>(
  timeline: UsePopoverTimelineResult<TData>,
  node: React.ReactNode,
): string
```

*JSDoc отсутствует*

---


## 📁 `components/timeline/PopoverTimelineStepList.tsx`

### `isContextRenderProp`

```typescript
function isContextRenderProp<TData>(
  fn: PopoverTimelineStepListRenderProp<TData>,
): fn is (context: PopoverTimelineStepListContext<TData>) => ReactNode
```

*JSDoc отсутствует*

---

### `renderTimelineStepListChildren`

```typescript
function renderTimelineStepListChildren<TData>(
  children: PopoverTimelineStepListChildren<TData>,
  timeline: UsePopoverTimelineResult<TData>,
): ReactNode
```

*JSDoc отсутствует*

---

### `PopoverTimelineStepList`

```typescript
export function PopoverTimelineStepList<E extends ElementType = 'ol', TData = unknown>({
  as,
  children,
  className,
  ...restProps
}: PopoverTimelineStepListProps<E, TData>)
```

*JSDoc отсутствует*

---


## 📁 `components/timeline/PopoverTimelineUndoButton.tsx`

### `PopoverTimelineUndoButton`

```typescript
export function PopoverTimelineUndoButton<E extends ElementType = 'button'>({
  as,
  children,
  className,
  onClick,
  disabled,
  ...restProps
}: PopoverTimelineUndoButtonProps<E>)
```

*JSDoc отсутствует*

---

### `handleClick`

```typescript
const handleClick = (e: React.MouseEvent<HTMLElement>) =>
```

*JSDoc отсутствует*

---


## 📁 `components/trigger/TriggerInners.tsx`

### `RootTriggerInner`

```typescript
export function RootTriggerInner({
  popoverKey,
  mergedOptions,
  isOpen,
  activeClassName,
  asChild,
  children,
}: {
  popoverKey: string;
  mergedOptions: OpenRootOptions;
  isOpen: boolean;
  activeClassName?: string;
  asChild?: boolean;
  children: React.ReactElement | ((props: PopoverTriggerChildProps) => React.ReactNode);
})
```

/**
* Internal component for root-level triggers. Calls `usePopoverTrigger`
* unconditionally to comply with the Rules of Hooks.
*/

---

### `NestedTriggerInner`

```typescript
export function NestedTriggerInner({
  popoverKey,
  parentKey,
  mergedOptions,
  isOpen,
  activeClassName,
  asChild,
  children,
}: {
  popoverKey: string;
  parentKey: string;
  mergedOptions: OpenNestedOptions;
  isOpen: boolean;
  activeClassName?: string;
  asChild?: boolean;
  children: React.ReactElement | ((props: PopoverTriggerChildProps) => React.ReactNode);
})
```

/**
* Internal component for nested triggers inside an active popover card.
* Calls `usePopoverNestedTrigger` unconditionally to comply with the Rules of Hooks.
*/

---


## 📁 `components/trigger/TriggerRenderer.test.tsx`

### `mockedRef`

```typescript
const mockedRef = <T,>(_init: T) => nodeRefHolder as unknown as
```

*JSDoc отсутствует*

---

### `mockedEff`

```typescript
const mockedEff = (fn: EffectCallback) =>
```

*JSDoc отсутствует*

---

### `runEffects`

```typescript
const runEffects = (): Array<() => void> =>
```

*JSDoc отсутствует*

---

### `renderProp`

```typescript
const renderProp = (props: PopoverTriggerChildProps) =>
```

*JSDoc отсутствует*

---

### `child`

```typescript
const child = (
      <button className="base-class" onClick={childClick}>
        Child Button
      </button>
    )
```

*JSDoc отсутствует*

---


## 📁 `components/trigger/TriggerRenderer.tsx`

### `TriggerRenderer`

```typescript
export function TriggerRenderer({
  popoverKey,
  triggerProps,
  isOpen,
  activeClassName,
  children,
}: TriggerRendererProps)
```

/**
* Shared rendering logic for trigger components. Clones the child element
* or delegates to a render prop with merged trigger props, className, and event handlers.
*/

---


## 📁 `components/trigger/triggerRendering.tsx`

### `composeEventHandlers`

```typescript
export function composeEventHandlers<E extends React.SyntheticEvent>(
  handlerA?: (e: E) => void,
  handlerB?: (e: E) => void,
): (e: E) => void
```

*JSDoc отсутствует*

---

### `invokeEventHandlers`

```typescript
export function invokeEventHandlers<E extends React.SyntheticEvent>(
  e: E,
  handlerA?: (e: E) => void,
  handlerB?: (e: E) => void,
): void
```

*JSDoc отсутствует*

---

### `useComposedTriggerHandlers`

```typescript
export function useComposedTriggerHandlers(
  triggerProps: React.DOMAttributes<HTMLElement>,
  childProps?: React.DOMAttributes<HTMLElement>,
)
```

*JSDoc отсутствует*

---

### `extractChildProps`

```typescript
export function extractChildProps(child: React.ReactElement | null): Record<string, unknown>
```

*JSDoc отсутствует*

---

### `renderFunctionChild`

```typescript
export function renderFunctionChild(
  children: (props: PopoverTriggerChildProps) => React.ReactNode,
  triggerProps: Record<string, unknown>,
  isOpen: boolean,
  activeClassName?: string,
  mergedRef?: React.Ref<HTMLElement>,
)
```

*JSDoc отсутствует*

---

### `renderElementChild`

```typescript
export function renderElementChild(
  validChild: React.ReactElement,
  triggerProps: Record<string, unknown>,
  isOpen: boolean,
  activeClassName?: string,
  handlers?: Record<string, unknown>,
  mergedRef?: React.Ref<HTMLElement>,
)
```

*JSDoc отсутствует*

---


## 📁 `context/cardScopeGuards.ts`

### `isCardDynamicScope`

```typescript
export function isCardDynamicScope(val: unknown): val is CardDynamicScope
```

/** Validates whether an unknown value conforms to CardDynamicScope. */

---


## 📁 `context/definePopoverContext.test.tsx`

### `element`

```typescript
const element = (
      <Provider initialContext={{ theme: 'dark' }}>
        <div>Child</div>
      </Provider>
    )
```

*JSDoc отсутствует*

---


## 📁 `context/PopoverCardScopeContext.ts`

### `assertCardScope`

```typescript
function assertCardScope<TData, TContext = unknown, TPopoverKey extends string = string>(
  ctx: unknown,
): asserts ctx is PopoverCardScope<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---


## 📁 `context/PopoverProvider.tsx`

### `isSchemaWithResolver`

```typescript
function isSchemaWithResolver<TData, TContext>(
  val: unknown,
): val is
```

*JSDoc отсутствует*

---


## 📁 `context/usePopoverKeyboard.test.ts`

### `createMockStore`

```typescript
const createMockStore = (overrides?: Partial<PopoverStore>): StoreApi<PopoverStore> =>
    ({
      getState: () =>
        ({
          trail: [],
          floating: [],
          closeTopmost,
          ...overrides,
        }) as unknown as PopoverStore,
    }) as unknown as StoreApi<PopoverStore>
```

*JSDoc отсутствует*

---

### `createKeyboardEvent`

```typescript
const createKeyboardEvent = (key: string, defaultPrevented = false): KeyboardEvent =>
    ({
      key,
      defaultPrevented,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    }) as unknown as KeyboardEvent
```

*JSDoc отсутствует*

---


## 📁 `context/usePopoverKeyboard.ts`

### `usePopoverKeyboardShortcuts`

```typescript
export function usePopoverKeyboardShortcuts<TData, TContext>(
  store: StoreApi<PopoverStore<TData, TContext>>,
  enableKeyboardClose: boolean,
): void
```

/**
* Internal hook managing global keyboard shortcuts (Escape key dismissal) for the popover provider.
*
* @template TData - Resolved data payload type.
* @template TContext - Global shared context type.
* @param store - Root Zustand store API instance.
* @param enableKeyboardClose - Whether Escape key dismissal is enabled.
*/

---


## 📁 `context/usePopoverPropSync.test.ts`

### `createMockStore`

```typescript
const createMockStore = (): StoreApi<PopoverStore> =>
    ({
      getState: () =>
        ({
          actions: { updateConfig },
        }) as unknown as PopoverStore,
    }) as unknown as StoreApi<PopoverStore>
```

*JSDoc отсутствует*

---


## 📁 `context/usePopoverStore.ts`

### `assertStoreApi`

```typescript
function assertStoreApi<TData, TContext, TPopoverKey extends string>(
  store: unknown,
): asserts store is StoreApi<PopoverStore<TData, TContext, TPopoverKey>>
```

*JSDoc отсутствует*

---


## 📁 `context.test.tsx`

### `el`

```typescript
const el = (
      <PopoverProvider resolveData={async () => ({})}>
        <div>Content</div>
      </PopoverProvider>
    )
```

*JSDoc отсутствует*

---


## 📁 `dnd/dndCanvasModifiers.ts`

### `useCanvasModifiers`

```typescript
export function useCanvasModifiers({
  modifiers,
  restrictToWindow,
  restrictToContainer,
  enableSnapping,
  snapThreshold,
  containerRef,
  activeEntries,
}: UseCanvasModifiersOptions): Modifier[]
```

/**
* Composes dnd-kit modifiers for boundary clamping, container restrictions, and magnetic snapping.
* Memoizes modifier pipelines to prevent re-instantiation on intermediate animation frames.
*
* @param options - Modifier configuration options.
* @returns Array of active dnd-kit `Modifier` functions.
*
* @example
* ```tsx
* const modifiers = useCanvasModifiers({
*   restrictToWindow: true,
*   enableSnapping: true,
*   snapThreshold: 12,
*   containerRef,
*   activeEntries,
* });
* ```
*/

---


## 📁 `dnd/dndCardConfig.ts`

### `resolveDragTransform`

```typescript
export function resolveDragTransform(
  isDragAllowed: boolean,
  offset: { x: number; y: number },
  physics: { rotation: number; rotationX: number; rotationY: number; dragX: number; dragY: number },
)
```

/**
* Resolves active drag transform and 3D physics tilt properties.
*
* When dragging is disallowed, returns zero offset and reset rotation angles.
*
* @param isDragAllowed - Whether dragging is permitted for the card.
* @param offset - 2D translation offset { x, y }.
* @param physics - 3D rotation and momentum state.
* @returns Combined transform object with offset, drag coordinates, and Euler rotations.
*
* @example
* ```ts
* const transform = resolveDragTransform(true, { x: 10, y: 20 }, physics);
* // returns { offset: { x: 10, y: 20 }, dragX: ..., rotation: ... }
* ```
*/

---

### `isDragPermitted`

```typescript
export function isDragPermitted(
  entry: TrailEntry,
  enableDrag: boolean,
  isButtonDragEnabled: boolean,
  isPinned: boolean,
): boolean
```

/**
* Evaluates whether pointer dragging is permitted for a card.
*
* Checks card feature toggles, header drag handle settings, and entry pinning constraints.
*
* @param entry - Trail entry representing the popover.
* @param enableDrag - Global or component-level drag toggle.
* @param isButtonDragEnabled - Header button controls toggle.
* @param isPinned - Whether the card is currently pinned.
* @returns True if the user is allowed to drag the card.
*
* @example
* ```ts
* const allowed = isDragPermitted(entry, true, true, false);
* ```
*/

---

### `resolveTiltConfig`

```typescript
export function resolveTiltConfig(
  entry: TrailEntry,
  enableTilt: boolean,
  maxTiltAngle: number,
  tiltSensitivity: number,
)
```

/**
* Resolves 3D tilt physics configuration for a draggable card.
*
* Merges entry-level overrides with parent component defaults.
*
* @param entry - Trail entry with optional custom tilt parameters.
* @param enableTilt - Default tilt enabled flag.
* @param maxTiltAngle - Maximum rotational tilt angle in degrees.
* @param tiltSensitivity - Sensitivity scalar for pointer velocity.
* @returns Merged tilt physics configuration object.
*
* @example
* ```ts
* const config = resolveTiltConfig(entry, true, 15, 0.1);
* ```
*/

---

### `resolveFeatureFlag`

```typescript
export function resolveFeatureFlag(featureVal?: boolean, propVal?: boolean): boolean
```

/**
* Resolves a boolean feature flag from a primary feature object and fallback prop.
*
* @param featureVal - Value from nested features configuration object.
* @param propVal - Direct boolean prop value.
* @returns Effective boolean flag (defaults to `true` if both undefined).
*
* @example
* ```ts
* const enabled = resolveFeatureFlag(features?.drag, props.enableDrag);
* ```
*/

---

### `resolveCardFeatures`

```typescript
export function resolveCardFeatures<TData>(props: PopoverCardProps<TData>)
```

/**
* Extracts and normalizes feature toggles (drag, tilt, focusLock) for PopoverCard.
*
* @template TData - Data type associated with the popover.
* @param props - Popover card component props.
* @returns Normalized object with `dragEnabled`, `tiltEnabled`, and `focusLockEnabled`.
*
* @example
* ```ts
* const features = resolveCardFeatures(props);
* ```
*/

---


## 📁 `dnd/dndGuards.ts`

### `isTransform2D`

```typescript
export function isTransform2D(val: unknown): val is Transform2D
```

/** Validates whether an unknown value conforms to Transform2D with finite numbers. */

---

### `isNodeRect`

```typescript
export function isNodeRect(val: unknown): val is NodeRect
```

/** Validates whether an unknown value conforms to NodeRect with non-negative dimensions. */

---

### `isBoundsRect`

```typescript
export function isBoundsRect(val: unknown): val is BoundsRect
```

/** Validates whether an unknown value conforms to BoundsRect with right >= left and bottom >= top. */

---

### `isPopoverCardFeatures`

```typescript
export function isPopoverCardFeatures(val: unknown): val is PopoverCardFeatures
```

/** Validates whether an unknown value conforms to PopoverCardFeatures. */

---


## 📁 `dnd/dndSnap.ts`

### `createMagneticSnapModifier`

```typescript
export function createMagneticSnapModifier(
  getObstacles: () => readonly SnapTargetRect[],
  threshold = 12,
): Modifier
```

/**
* Creates a `@dnd-kit/core` modifier function that snaps draggable cards to the boundaries
* of nearby obstacle cards or boundaries when within a configurable threshold.
* Uses pooled bounding boxes (`sharedBoxPool`) to guarantee zero heap allocations during pointer move.
*
* @param getObstacles - Function returning active obstacle rectangles to snap against.
* @param threshold - Distance in pixels within which magnetic snapping activates (default: 12).
* @returns A dnd-kit `Modifier` function.
*
* @example
* ```ts
* const snapModifier = createMagneticSnapModifier(() => activeObstacles, 16);
* ```
*/

---


## 📁 `dnd/PopoverCanvas.tsx`

### `PopoverCanvas`

```typescript
export function PopoverCanvas<TData = unknown>({
  children,
  modifiers,
  restrictToWindow = false,
  restrictToContainer = false,
  enableSnapping = false,
  snapThreshold = 12,
}: Readonly<PopoverCanvasProps<TData>>)
```

*JSDoc отсутствует*

---


## 📁 `dnd/PopoverCard.tsx`

### `PopoverCardInner`

```typescript
function PopoverCardInner<TData = unknown>(props: Readonly<PopoverCardProps<TData>>)
```

*JSDoc отсутствует*

---


## 📁 `dnd/usePopoverDraggableCard.ts`

### `usePopoverDraggableCard`

```typescript
export function usePopoverDraggableCard(
  options: UsePopoverDraggableCardOptions,
): UsePopoverDraggableCardResult
```

/**
* Integrates dnd-kit draggable semantics, interactive tilt physics, and popover positioning for card components.
* Automatically respects pin states, entry-level drag disabled toggles, and attaches draggable listeners.
*
* @param options - Draggable card options including entry, index, pin state, and tilt parameters.
* @returns Result object containing `ref`, `style`, `isDragging`, `isDragAllowed`, `dragHandleProps`, and card actions.
*
* @example
* ```tsx
* function MyDraggableCard({ entry, index, isPinned }: Props) {
*   const { ref, style, dragHandleProps } = usePopoverDraggableCard({
*     entry,
*     index,
*     isPinned,
*     enableDrag: true,
*     enableTilt: true,
*   });
*
*   return (
*     <div ref={ref} style={style}>
*       <div {...dragHandleProps}>Drag Me</div>
*       <div>Content</div>
*     </div>
*   );
* }
* ```
*/

---


## 📁 `factory.tsx`

### `resolveSchemaInstance`

```typescript
function resolveSchemaInstance(val: object): PopoverSchemaInstance<PopoverSchemaDefinition> | null
```

*JSDoc отсутствует*

---

### `createPopoverTrail`

```typescript
export function createPopoverTrail<TSchema extends PopoverSchemaDefinition>(
  schema: PopoverSchemaInstance<TSchema> | TSchema,
): FactorySchemaSuite<TSchema>
```

*JSDoc отсутствует*

---

### `createPopoverTrail`

```typescript
export function createPopoverTrail(schema?: unknown): object
```

*JSDoc отсутствует*

---


## 📁 `hooks/adapters/react19Adapters.ts`

### `useCrossVersionActionState`

```typescript
export function useCrossVersionActionState<TData, TInput = void>(
  action: PopoverServerAction<TData, TInput>,
  initialState: PopoverActionState<TData>,
): readonly [PopoverActionState<TData>, (input: TInput) => void, boolean]
```

*JSDoc отсутствует*

---

### `useCrossVersionOptimistic`

```typescript
export function useCrossVersionOptimistic<TData, TUpdate>(
  currentData: TData,
  updateFn: (currentState: TData, update: TUpdate) => TData,
): readonly [TData, (update: TUpdate) => void]
```

*JSDoc отсутствует*

---


## 📁 `hooks/card/cardKeyboardFocus.ts`

### `getFocusableCardElements`

```typescript
export function getFocusableCardElements(cardEl: HTMLElement | null): HTMLElement[]
```

/**
* Queries all visible, interactive, focusable DOM elements inside a card container.
* Filters out hidden elements (zero dimensions and empty client rects).
*
* @param cardEl - Root container element of the card.
* @returns Array of focusable HTMLElements in document order.
*
* @example
* ```ts
* const elements = getFocusableCardElements(cardElement);
* elements[0]?.focus();
* ```
*/

---

### `focusParentCard`

```typescript
export function focusParentCard(parentKey: string): boolean
```

/**
* Traverses DOM to locate and shift focus back to the parent card of a nested popover.
* Queries by `#popover-card-${escapedKey}`, `[data-key]`, or `[aria-labelledby]`.
* Focuses the first focusable child element inside the parent card, or the card element itself.
*
* @param parentKey - Unique key string of the parent card.
* @returns `true` if parent card was found and focused; `false` otherwise.
*
* @example
* ```ts
* const focused = focusParentCard('menu-root');
* ```
*/

---


## 📁 `hooks/card/cardKeyboardStrategies.ts`

### `handleCustomShortcuts`

```typescript
export function handleCustomShortcuts<TData = unknown, TPopoverKey extends string = string>(
  e: KeyboardNavEvent,
  cardEntry: TrailEntry<TData, TPopoverKey>,
): boolean
```

/**
* Checks and fires custom keyboard shortcuts registered on the popover entry.
* Supports modifier key prefixes like `Mod+s` (Command on Mac, Control on Windows).
*
* @template TData - Stored entry data type.
* @template TPopoverKey - Branded key type.
* @param e - Keyboard event.
* @param cardEntry - Active popover entry.
* @returns `true` if a custom shortcut matched and was dispatched; `false` otherwise.
*
* @example
* ```ts
* const handled = handleCustomShortcuts(event, entry);
* ```
*/

---

### `handleVerticalArrows`

```typescript
export function handleVerticalArrows(
  e: KeyboardNavEvent,
  cardEl: HTMLElement | null,
): void
```

/**
* Handles vertical ArrowUp and ArrowDown cycling through focusable elements inside a card.
* Does not intercept keys when typing inside input or textarea elements.
*
* @param e - Keyboard event.
* @param cardEl - Root container element of the card.
*
* @example
* ```typescript
* handleVerticalArrows(event, cardElement);
* ```
*/

---


## 📁 `hooks/card/cardResolvers.ts`

### `resolveTransitionClass`

```typescript
export function resolveTransitionClass(
  status: string | undefined,
  entryClasses: { mounting?: string; unmounting?: string; mounted?: string },
  globalClasses: { mounting?: string; unmounting?: string; mounted?: string },
): string
```

/**
* Computes the CSS class name for a card's current lifecycle transition status.
*
* Checks entry-specific class overrides first, then falls back to global theme classes.
*
* @param status - Active transition status ('mounting' | 'unmounting' | 'mounted' | undefined).
* @param entryClasses - Entry-specific class overrides.
* @param globalClasses - Global default class names.
* @returns Resolved CSS class string.
*
* @example
* ```ts
* const cls = resolveTransitionClass('mounting', { mounting: 'fade-in' }, { mounting: 'enter' });
* // returns 'fade-in'
* ```
*/

---

### `useCardMountingTransition`

```typescript
export function useCardMountingTransition<TPopoverKey extends string = string>(
  key: TPopoverKey,
  status: string | undefined,
  actions: CardMountingTransitionActions<TPopoverKey>,
): void
```

/**
* Schedules a two-frame rAF cycle when mounting to ensure the browser has painted
* before transitioning the status from 'mounting' to 'mounted'.
*
* @template TPopoverKey - Branded key type.
* @param key - Popover card key.
* @param status - Current transition status.
* @param actions - Object containing `setTransitionStatus`.
*
* @example
* ```tsx
* useCardMountingTransition(entry.key, entry.transitionStatus, {
*   setTransitionStatus: actions.setTransitionStatus,
* });
* ```
*/

---

### `step`

```typescript
const step = () =>
```

*JSDoc отсутствует*

---

### `resolveBaseZIndex`

```typescript
export function resolveBaseZIndex<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  zIndexBaseMap?: Record<string, number> | null,
  baseZIndex?: number,
): number
```

/**
* Determines the effective base z-index for an entry considering entry overrides,
* stackGroup mappings, and global defaults.
*
* @template TData - Stored data type.
* @template TPopoverKey - Branded key type.
* @param entry - The popover trail entry.
* @param zIndexBaseMap - Optional mapping of stack groups to base z-indices.
* @param baseZIndex - Global base z-index fallback.
* @returns The resolved numeric base z-index.
*
* @example
* ```ts
* const baseZ = resolveBaseZIndex(entry, { modal: 2000 }, 1000);
* ```
*/

---

### `resolveButtonControls`

```typescript
export function resolveButtonControls<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  cardFeatures?: { enablePin?: boolean; enableClose?: boolean; enableDrag?: boolean },
)
```

/**
* Resolves button visibility and custom buttons for a card header or footer.
*
* @template TData - Stored data type.
* @template TPopoverKey - Branded key type.
* @param entry - The trail entry.
* @param cardFeatures - Optional consumer feature toggles.
* @returns An object with booleans `enablePin`, `enableClose`, `enableDrag`, and `customButtons`.
*
* @example
* ```ts
* const controls = resolveButtonControls(entry, { enablePin: false });
* ```
*/

---

### `groupByStackGroup`

```typescript
export function groupByStackGroup<TData = unknown, TPopoverKey extends string = string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
): Record<string, readonly TrailEntry<TData, TPopoverKey>[]>
```

/**
* Groups active popover entries by their stackGroup identifier for layered z-index assignment.
*
* @template TData - Stored data type.
* @template TPopoverKey - Branded key type.
* @param entries - Array of active trail entries.
* @returns A dictionary grouping entries by stackGroup (or 'default').
*
* @example
* ```ts
* const grouped = groupByStackGroup(activeEntries);
* const modalEntries = grouped['modal'] ?? [];
* ```
*/

---


## 📁 `hooks/card/useCardFocusManagement.test.ts`

### `runEffects`

```typescript
const runEffects = (): Array<() => void> =>
```

*JSDoc отсутствует*

---


## 📁 `hooks/card/useCardFocusManagement.ts`

### `restoreCardFocus`

```typescript
function restoreCardFocus(
  cardElement: HTMLElement | null,
  previouslyFocused: HTMLElement | null,
  parentKey?: string,
): void
```

*JSDoc отсутствует*

---

### `useCardFocusManagement`

```typescript
export function useCardFocusManagement(
  entry: TrailEntry,
  cardRef: React.RefObject<HTMLElement | null>,
): void
```

/**
* Manages the focus lifecycle of a popover card.
*
* Responsibilities:
* 1. Preserves the previously focused DOM element prior to mounting.
* 2. Optionally focuses a specified initial element (`autoFocusElement`).
* 3. Restores focus upon card unmount to either the previously focused element or the parent card.
* 4. Coordinates background body scroll locking when enabled.
*
* @param entry - Active popover trail entry with focus lock configuration.
* @param cardRef - Ref to the card's root DOM element.
*
* @example
* ```tsx
* function PopoverCardView({ entry }: { entry: TrailEntry }) {
*   const cardRef = useRef<HTMLDivElement>(null);
*   useCardFocusManagement(entry, cardRef);
*   return <div ref={cardRef}>...</div>;
* }
* ```
*/

---


## 📁 `hooks/card/useCardInteractions.test.ts`

### `createActions`

```typescript
const createActions = (): PopoverActions =>
    ({
      togglePin: vi.fn(),
      hoverEnter: vi.fn(),
      hoverLeave: vi.fn(),
      closeFrom: vi.fn(),
    }) as unknown as PopoverActions
```

*JSDoc отсутствует*

---


## 📁 `hooks/card/useCardKeyboardNav.ts`

### `isCardKeyboardNavOptions`

```typescript
function isCardKeyboardNavOptions<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is CardKeyboardNavOptions<TData, TPopoverKey>
```

*JSDoc отсутствует*

---

### `resolveNavParams`

```typescript
function resolveNavParams<TData = unknown, TPopoverKey extends string = string>(
  eventOrOptions: KeyboardNavEvent | CardKeyboardNavOptions<TData, TPopoverKey>,
  cardElement?: HTMLElement | null,
  entry?: TrailEntry<TData, TPopoverKey>,
  enableArrowNavigation?: boolean,
  isPinned?: boolean,
  trail?: readonly TrailEntry<TData, TPopoverKey>[],
  actions?: {
    closeFrom: (index: number, options?: { transition?: boolean }) => void;
    closeByKey?: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  },
)
```

*JSDoc отсутствует*

---

### `handleCardKeyboard`

```typescript
export function handleCardKeyboard<TData = unknown, TPopoverKey extends string = string>(
  eventOrOptions: KeyboardNavEvent | CardKeyboardNavOptions<TData, TPopoverKey>,
  cardElement?: HTMLElement | null,
  entry?: TrailEntry<TData, TPopoverKey>,
  enableArrowNavigation?: boolean,
  isPinned?: boolean,
  trail?: readonly TrailEntry<TData, TPopoverKey>[],
  _floatingCount?: number,
  actions?: {
    closeFrom: (index: number, options?: { transition?: boolean }) => void;
    closeByKey?: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  },
): void
```

/**
* Dispatches keyboard navigation events for popover cards.
* Evaluates custom shortcuts first, followed by vertical and horizontal arrow navigation.
*
* @template TData - Stored entry data type.
* @template TPopoverKey - Branded key type.
* @param eventOrOptions - Either a full `CardKeyboardNavOptions` bundle or an individual `KeyboardNavEvent`.
* @param cardElement - Card root HTMLElement when using positional parameters.
* @param entry - Trail entry when using positional parameters.
* @param enableArrowNavigation - Boolean toggle for arrow navigation.
* @param isPinned - Pinned state boolean.
* @param trail - List of active trail entries.
* @param _floatingCount - Count of floating entries.
* @param actions - Object with `closeFrom` and `closeByKey` dispatchers.
*
* @example
* ```typescript
* handleCardKeyboard({
*   event: e,
*   cardElement,
*   entry,
*   enableArrowNavigation: true,
*   isPinned: false,
*   trail,
*   floatingCount: 1,
*   actions,
* });
* ```
*/

---


## 📁 `hooks/card/useCardPositioning.ts`

### `useCardPositioning`

```typescript
export function useCardPositioning({
  entry,
  index,
  isPinned,
  placement = 'bottom',
  offset,
  zIndex,
  baseZIndex,
}: UseCardPositioningOptions)
```

/**
* Computes floating coordinates, layout offsets, and inline CSS positioning styles for a popover card.
*
* @param options - Positioning options.
* @returns Object containing DOM `ref`, combined ref callback `setCombinedRef`, and `style` CSSProperties.
*
* @example
* ```tsx
* const { ref, setCombinedRef, style } = useCardPositioning({
*   entry,
*   index,
*   isPinned,
*   offset,
*   zIndex,
*   baseZIndex,
* });
* return <div ref={setCombinedRef} style={style}>...</div>;
* ```
*/

---


## 📁 `hooks/card/useCardStoreSlice.test.ts`

### `createMockStore`

```typescript
const createMockStore = (overrides?: Partial<PopoverStore>): PopoverStore =>
    ({
      offsets: {},
      zIndexOrder: [],
      enableArrowNavigation: true,
      trail: [],
      floating: [],
      baseZIndex: 1000,
      mountingClassName: 'm-in',
      unmountingClassName: 'm-out',
      mountedClassName: 'm-done',
      zIndexBaseMap: { modal: 2000 },
      ...overrides,
    }) as unknown as PopoverStore
```

*JSDoc отсутствует*

---


## 📁 `hooks/card/useCardStoreSlice.ts`

### `useCardStoreSlice`

```typescript
export function useCardStoreSlice<TData = unknown, TPopoverKey extends string = string>(
  entryKey: TPopoverKey,
): CardStoreSliceData<TData, TPopoverKey>
```

/**
* Subscribes a popover card to its specific slice of store state using shallow equality comparison.
* Minimizes unnecessary re-renders when unrelated store entries mutate.
*
* @template TData - Stored data type.
* @template TPopoverKey - Branded key type.
* @param entryKey - Key of the card to subscribe.
* @returns Card-specific state slice (`CardStoreSliceData`).
*
* @example
* ```tsx
* const slice = useCardStoreSlice(entry.key);
* const { offset, zIndex, isTop } = slice;
* ```
*/

---


## 📁 `hooks/clickOutsideHelpers.ts`

### `isInsidePopover`

```typescript
export function isInsidePopover(el: Element, selector: string, ignoreClass?: string): boolean
```

/**
* Checks whether an element is located inside a popover card, dialog, or ignored element.
*
* @param el - DOM element to check.
* @param selector - Custom CSS selector representing popovers.
* @param ignoreClass - Optional class name indicating an element should be ignored from outside clicks.
* @returns True if `el` or any ancestor matches the popover or ignore criteria.
*
* @example
* ```typescript
* if (isInsidePopover(eventTarget, '.popover-card', 'ignore-dismiss')) {
*   // Event originated inside the popover or an explicit ignore zone
* }
* ```
*/

---

### `shouldIgnoreEvent`

```typescript
export function shouldIgnoreEvent(
  e: Event,
  ignoreFn?: (e: PointerEvent | MouseEvent) => boolean,
): boolean
```

/**
* Determines if a pointer or mouse event should be ignored from triggering click-outside teardowns.
*
* Checks if the event target is inside a portal container, an excluded boundary,
* or matched by an optional user-defined filter function.
*
* @param e - Triggering DOM event.
* @param ignoreFn - Optional consumer callback to suppress outside-click handling.
* @returns True if the event should be ignored.
*
* @example
* ```typescript
* if (shouldIgnoreEvent(event, (e) => (e.target as Element)?.classList.contains('do-not-close'))) {
*   return;
* }
* ```
*/

---

### `isInsidePopoverOrAnchor`

```typescript
export function isInsidePopoverOrAnchor(
  e: Event,
  selector: string,
  ignoreClass: string | undefined,
  ownerId: string | null | undefined,
  anchorElement: Element | null | undefined,
): boolean
```

/**
* Checks if an event occurred inside any active popover card, its trigger anchor, or an ignored element.
*
* Traverses the event propagation path to ensure clicks on nested triggers,
* custom portals, or anchor buttons are not mistakenly treated as outside clicks.
*
* @param e - Triggering DOM event.
* @param selector - Popover CSS selector.
* @param ignoreClass - Optional CSS class to ignore.
* @param ownerId - Popover key identifier to look up registered trigger elements.
* @param anchorElement - Explicit trigger anchor DOM element fallback.
* @returns True if the click is inside a popover or its associated trigger anchor.
*
* @example
* ```typescript
* if (isInsidePopoverOrAnchor(event, '.popover-card', undefined, 'card-1', anchorEl)) {
*   // Click was inside the popover or its anchor
*   return;
* }
* ```
*/

---


## 📁 `hooks/geometry/cascadePosition.test.ts`

### `createMockStoreApi`

```typescript
const createMockStoreApi = (overrides?: Partial<PopoverStore>): StoreApi<PopoverStore> =>
    ({
      getState: () =>
        ({
          floating: [],
          offsets: {},
          ...overrides,
        }) as unknown as PopoverStore,
    }) as unknown as StoreApi<PopoverStore>
```

*JSDoc отсутствует*

---


## 📁 `hooks/geometry/cascadePosition.ts`

### `baseCascadeOffset`

```typescript
export function baseCascadeOffset(
  zIndex: number,
  step: number,
  direction: 'left' | 'right' | 'top' | 'bottom',
  y: number,
  x: number,
):
```

/**
* Computes the directional cascade coordinate offset based on an entry's z-index and step size.
*
* @param zIndex - Relative stack index (0 for root, 1 for first child, etc.).
* @param step - Pixel offset distance per stack level.
* @param direction - Direction to cascade ('left' | 'right' | 'top' | 'bottom').
* @param y - Base anchor Y coordinate.
* @param x - Base anchor X coordinate.
* @returns An object containing `{ baseTop, baseLeft }`.
*
* @example
* ```typescript
* const pos = baseCascadeOffset(2, 24, 'right', 100, 200);
* // returns { baseTop: 100, baseLeft: 248 }
* ```
*/

---

### `computeCascadePosition`

```typescript
export function computeCascadePosition({
  zIndex,
  step,
  direction,
  y,
  x,
  enableSpatialCollision,
  storeApi,
  id,
  winWidth,
  winHeight,
}: {
  zIndex: number;
  step: number;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  y: number;
  x: number;
  enableSpatialCollision?: boolean;
  storeApi: StoreApi<PopoverStore<unknown, unknown>>;
  id: string;
  winWidth: number;
  winHeight: number;
}):
```

/**
* Calculates final floating coordinates for a cascading popover card, optionally nudging
* to avoid spatial collisions with siblings when `enableSpatialCollision` is true.
*
* @param options - Configuration object containing positioning coordinates and store reference.
* @returns Final layout coordinates `{ top, left }`.
*
* @example
* ```ts
* const pos = computeCascadePosition({
*   zIndex: 1,
*   step: 24,
*   direction: 'right',
*   y: 150,
*   x: 300,
*   enableSpatialCollision: true,
*   storeApi,
*   id: 'card-2',
*   winWidth: 1920,
*   winHeight: 1080,
* });
* ```
*/

---

### `resolveUnpinnedPosition`

```typescript
export function resolveUnpinnedPosition(
  id: string,
  entry: TrailEntry | undefined,
  cascadeOffsetStep: number,
  resolvedPlacement: string | undefined,
  zIndex: number,
  y: number | null,
  x: number | null,
  enableSpatialCollision: boolean | undefined,
  storeApi: StoreApi<PopoverStore<unknown, unknown>>,
  winWidth: number,
  winHeight: number,
):
```

/**
* Resolves the unpinned layout position for a popover card.
* Prioritizes persisted `pinnedLayoutPos` if present; otherwise derives cascade placement from Floating UI placement.
*
* @param id - Card key identifier.
* @param entry - Trail entry.
* @param cascadeOffsetStep - Stepping offset distance in pixels.
* @param resolvedPlacement - Placement string from floating UI (e.g. 'bottom-start', 'right').
* @param zIndex - Stack level index.
* @param y - Floating UI computed top coordinate.
* @param x - Floating UI computed left coordinate.
* @param enableSpatialCollision - Whether to run lowest-energy collision avoidance.
* @param storeApi - Zustand store handle.
* @param winWidth - Viewport inner width.
* @param winHeight - Viewport inner height.
* @returns Final layout coordinates `{ top, left }`.
*
* @example
* ```typescript
* const pos = resolveUnpinnedPosition(
*   'card-1',
*   entry,
*   24,
*   'right-start',
*   0,
*   100,
*   200,
*   false,
*   storeApi,
*   1024,
*   768,
* );
* ```
*/

---


## 📁 `hooks/geometry/collisionGeometry.ts`

### `applySpatialCollisionNudge`

```typescript
export function applySpatialCollisionNudge(
  id: string,
  top: number,
  left: number,
  winWidth: number,
  winHeight: number,
  activeFloating: readonly TrailEntry<unknown>[],
  activeOffsets: Readonly<Partial<Record<string, Readonly<DragOffset>>>>,
):
```

/**
* Checks for spatial collisions with active sibling cards and selects the lowest-energy non-overlapping position.
* Populates a spatial QuadTree with active floating siblings, evaluates candidate nudge offsets,
* and returns the optimal placement minimizing visual overlap and displacement distance.
*
* @param id - Key of the card being placed.
* @param top - Initial computed top position.
* @param left - Initial computed left position.
* @param winWidth - Viewport inner width.
* @param winHeight - Viewport inner height.
* @param activeFloating - Active floating trail entries.
* @param activeOffsets - Map of active card drag offsets.
* @returns Nudged coordinates `{ top, left }`.
*
* @example
* ```ts
* const pos = applySpatialCollisionNudge('card-2', 100, 200, 1920, 1080, siblings, offsets);
* ```
*/

---


## 📁 `hooks/geometry/floatingMiddleware.ts`

### `buildFloatingMiddleware`

```typescript
export function buildFloatingMiddleware(
  offsetDistance: number,
  flipOption: unknown,
  shiftOption: unknown,
  sizeOption: unknown,
  boundaryOption: Boundary | undefined,
  padding: number | { top?: number; right?: number; bottom?: number; left?: number } | undefined,
)
```

/**
* Builds the array of Floating UI middlewares (offset, flip, shift, size) based on configuration options.
*
* @param offsetDistance - Distance in pixels from the anchor element.
* @param flipOption - Flip behavior toggle or extra configuration options.
* @param shiftOption - Shift behavior toggle or extra configuration options.
* @param sizeOption - Size clamping options or boolean.
* @param boundaryOption - Boundary DOM element or clipping rect.
* @param padding - Viewport padding boundaries.
* @returns Array of configured Floating UI middleware.
*
* @example
* ```typescript
* const middleware = buildFloatingMiddleware(8, true, true, false, undefined, 12);
* ```
*/

---

### `useMergedCollisionConfig`

```typescript
export function useMergedCollisionConfig(
  localCollision?: CollisionConfig | null,
  globalCollision?: CollisionConfig | null,
)
```

/**
* Merges entry-level collision configuration with global provider defaults.
*
* Resolves boundary references (DOM element, selector, or viewport).
*
* @param localCollision - Card-specific collision configuration overrides.
* @param globalCollision - Provider-wide default collision configuration.
* @returns Consolidated collision options object.
*
* @example
* ```tsx
* const { padding, flipOption, shiftOption, boundaryOption } = useMergedCollisionConfig(
*   entry?.collision,
*   globalCollision,
* );
* ```
*/

---


## 📁 `hooks/geometry/floatingObserver.ts`

### `useVirtualAnchorElement`

```typescript
export function useVirtualAnchorElement(anchorRect: DOMRect | PopoverRect | null | undefined)
```

/**
* Creates a virtual positioning anchor compatible with Floating UI from an arbitrary bounding rectangle.
*
* @param anchorRect - DOMRect or PopoverRect coordinates of the anchor.
* @returns Virtual element object with `getBoundingClientRect()`, or `null`.
*
* @example
* ```tsx
* const virtualAnchor = useVirtualAnchorElement(anchorRect);
* refs.setReference(virtualAnchor);
* ```
*/

---

### `useFloatingResizeObserver`

```typescript
export function useFloatingResizeObserver(
  floatingEl: HTMLElement | null,
  isPinned: boolean | undefined,
  isDragging: boolean | undefined,
  update: () => void,
)
```

/**
* Observes dimension changes on the floating card DOM element to recompute layout coordinates.
*
* Automatically suppresses updates when the card is pinned or actively being dragged.
*
* @param floatingEl - Card DOM element.
* @param isPinned - Whether the card is pinned.
* @param isDragging - Whether the card is being dragged.
* @param update - Callback to recalculate floating coordinates.
*
* @example
* ```tsx
* useFloatingResizeObserver(cardNode, isPinned, isDragging, updatePosition);
* ```
*/

---

### `useMobileViewport`

```typescript
export function useMobileViewport(mobileBreakpoint: number): boolean
```

/**
* Detects whether the current window viewport is smaller than the mobile breakpoint width.
*
* @param mobileBreakpoint - Breakpoint width in pixels (e.g. 640).
* @returns Boolean `true` if mobile viewport width is active.
*
* @example
* ```tsx
* const isMobile = useMobileViewport(640);
* ```
*/

---

### `check`

```typescript
const check = () =>
```

*JSDoc отсутствует*

---

### `useFloatingUpdater`

```typescript
export function useFloatingUpdater(
  isPinned: boolean | undefined,
  isDragging: boolean | undefined,
  update: () => void,
  deps: DependencyList,
)
```

/**
* Triggers a layout update when dependencies change, skipping updates during drag or pin state.
*
* @param isPinned - Whether card is pinned.
* @param isDragging - Whether card is dragging.
* @param update - Layout update callback.
* @param deps - Dependency list.
*
* @example
* ```tsx
* useFloatingUpdater(isPinned, isDragging, update, [anchorRect, zIndex]);
* ```
*/

---


## 📁 `hooks/geometry/useFloatingSetup.ts`

### `useGeometryStoreConfig`

```typescript
export function useGeometryStoreConfig()
```

/**
* Reads geometry configuration options from the popover store slice with shallow equality.
*
* @returns Object with `cascadeOffsetStep`, `defaultOffset`, `responsiveMode`, and `mobileBreakpoint`.
*
* @example
* ```tsx
* const { cascadeOffsetStep, defaultOffset } = useGeometryStoreConfig();
* ```
*/

---

### `usePopoverFloatingSetup`

```typescript
export function usePopoverFloatingSetup(
  placement: Placement | 'auto' | undefined,
  anchorRect: DOMRect | PopoverRect | null | undefined,
  isPinned: boolean | undefined,
  middleware: Array<
    | ReturnType<typeof offset>
    | ReturnType<typeof flip>
    | ReturnType<typeof shift>
    | ReturnType<typeof size>
  >,
)
```

/**
* Initializes and coordinates Floating UI hooks with auto-placement heuristics and auto-updating.
*
* @param placement - Preferred placement or 'auto'.
* @param anchorRect - Virtual or DOM anchor rectangle.
* @param isPinned - Whether card is pinned (disables autoUpdate).
* @param middleware - Array of configured Floating UI middleware.
* @returns Floating UI hook result augmented with `resolvedAutoPlacement`.
*
* @example
* ```tsx
* const { refs, x, y, update, placement } = usePopoverFloatingSetup(
*   'auto',
*   anchorRect,
*   false,
*   middlewareList,
* );
* ```
*/

---


## 📁 `hooks/geometry/useResolvedBoundary.ts`

### `useResolvedBoundary`

```typescript
export function useResolvedBoundary(
  boundary?: Boundary | (() => Boundary | null | undefined),
): Boundary | undefined
```

*JSDoc отсутствует*

---


## 📁 `hooks/geometry/viewportGeometry.ts`

### `getViewportBounds`

```typescript
export function getViewportBounds():
```

/**
* Safely measures current viewport dimensions across SSR and browser environments.
* Returns standard desktop fallback dimensions (1024x768) when evaluated in non-DOM environments.
*
* @returns An object with `{ width, height }` in pixels.
*
* @example
* ```ts
* const { width, height } = getViewportBounds();
* ```
*/

---

### `resolveMiddlewareProps`

```typescript
export function resolveMiddlewareProps(option: unknown): Record<string, unknown>
```

/**
* Extracts middleware extra properties into a safe record object.
*
* @param option - Raw configuration option or boolean toggle.
* @returns Shallow copy record if option is an object, or empty record.
*
* @example
* ```typescript
* const extraProps = resolveMiddlewareProps({ padding: 16 });
* // returns { padding: 16 }
* ```
*/

---

### `resolveAutoPlacement`

```typescript
export function resolveAutoPlacement(
  placement: Placement | 'auto' | undefined,
  anchorRect: DOMRect | PopoverRect | null | undefined,
): Placement | undefined
```

/**
* Heuristic auto-placement resolver:
* Automatically picks `'left'` or `'right'` based on whether the anchor trigger is positioned
* on the right half or left half of the viewport, ensuring popovers naturally open towards center.
*
* @param placement - Requested placement, or `'auto'`.
* @param anchorRect - Bounding rectangle of the anchor trigger.
* @returns Resolved placement or undefined.
*
* @example
* ```typescript
* const placement = resolveAutoPlacement('auto', buttonRect);
* // returns 'left' if button is on the right half of the screen
* ```
*/

---

### `resolveResponsivePosition`

```typescript
export function resolveResponsivePosition(
  effectiveResponsiveMode: string | undefined,
  isMobileViewport: boolean,
  layoutStrategy: string | undefined,
  winWidth: number,
  winHeight: number,
):
```

/**
* Calculates absolute layout coordinates for responsive display modes:
* - `bottom-sheet`: Docked to bottom edge of mobile viewport.
* - `modal`: Centered in the middle of viewport with safety margins.
* - `docked-top`: Anchored to top edge navigation bar.
*
* @param effectiveResponsiveMode - Active responsive layout mode string.
* @param isMobileViewport - Whether current viewport matches mobile breakpoint.
* @param layoutStrategy - Layout strategy identifier.
* @param winWidth - Viewport inner width.
* @param winHeight - Viewport inner height.
* @returns Computed `{ top, left }` position or `null` if standard floating placement applies.
*
* @example
* ```typescript
* const pos = resolveResponsivePosition('bottom-sheet', true, undefined, 375, 812);
* ```
*/

---


## 📁 `hooks/selectors/entrySelectors.ts`

### `usePopoverOffsets`

```typescript
export function usePopoverOffsets()
```

/**
* Retrieves a dictionary mapping all active popover keys to their current 2D drag offsets `{ x, y }`.
*
* Employs shallow equality to prevent re-renders when offsets have not changed.
*
* @returns Record of popover keys mapped to coordinate offsets.
*
* @example
* ```tsx
* function DebugOffsetPanel() {
*   const offsets = usePopoverOffsets();
*   return <pre>{JSON.stringify(offsets, null, 2)}</pre>;
* }
* ```
*/

---

### `usePopoverOffset`

```typescript
export function usePopoverOffset<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey)
```

/**
* Retrieves the current 2D drag offset coordinates `{ x, y }` for a specific popover.
*
* Employs shallow equality so the component only re-renders when this card's coordinates change.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key whose offset to track.
* @returns Coordinate offset `{ x, y }`.
*
* @example
* ```tsx
* function OffsetBadge({ cardKey }: { cardKey: string }) {
*   const offset = usePopoverOffset(cardKey);
*   return <span>Moved: {offset.x}px, {offset.y}px</span>;
* }
* ```
*/

---

### `usePopoverIsLoading`

```typescript
export const usePopoverIsLoading = <TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean => usePopoverStore(selectIsLoading(key))
```

/**
* Returns `true` while the data resolver for the given popover is actively pending.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key to inspect.
* @returns True if currently loading.
*
* @example
* ```tsx
* const isLoading = usePopoverIsLoading('card-details');
* ```
*/

---

### `usePopoverError`

```typescript
export const usePopoverError = <TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): Error | null => usePopoverStore(selectError(key))
```

/**
* Retrieves the Error object if the data resolver for the popover threw an exception, or `null`.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key to inspect.
* @returns Error object or null.
*
* @example
* ```tsx
* const error = usePopoverError('card-details');
* if (error) {
*   return <Alert variant="error">{error.message}</Alert>;
* }
* ```
*/

---


## 📁 `hooks/selectors/statusSelectors.ts`

### `usePopoverIsPinned`

```typescript
export function usePopoverIsPinned<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey)
```

/**
* Evaluates whether a specific popover is pinned to the screen as a detached floating card.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key to inspect.
* @returns True if pinned, false otherwise.
*
* @example
* ```tsx
* function PinIndicator({ cardKey }: { cardKey: string }) {
*   const isPinned = usePopoverIsPinned(cardKey);
*   return <span>{isPinned ? 'Pinned' : 'Floating'}</span>;
* }
* ```
*/

---

### `usePopoverZIndex`

```typescript
export function usePopoverZIndex<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey)
```

/**
* Retrieves the 0-based visual stacking order index for a given popover.
*
* Returns -1 if the popover is not currently active in the z-index stack.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key to look up.
* @returns 0-based stacking index, or -1 if unmounted.
*
* @example
* ```tsx
* const stackIndex = usePopoverZIndex('card-details');
* ```
*/

---

### `usePopoverIsTopMost`

```typescript
export function usePopoverIsTopMost<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey)
```

/**
* Evaluates whether a specific popover is currently the topmost element in the visual stacking order.
*
* Useful for highlighting active borders, elevation styling, or delegating keyboard shortcuts.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key to check.
* @returns True if the popover is on top of the visual stack.
*
* @example
* ```tsx
* function CardContainer({ cardKey }: { cardKey: string }) {
*   const isTopMost = usePopoverIsTopMost(cardKey);
*   return <div className={isTopMost ? 'card active' : 'card'} />;
* }
* ```
*/

---

### `usePopoverContext`

```typescript
export function usePopoverContext<TContext = unknown>()
```

/**
* Accesses the global shared context object passed into the root `<PopoverProvider>`.
*
* @template TContext - Expected shape of the context object.
* @returns The ambient context object, or undefined.
*
* @example
* ```tsx
* interface AppContext {
*   userId: string;
*   theme: 'light' | 'dark';
* }
* const ctx = usePopoverContext<AppContext>();
* ```
*/

---

### `usePopoverCollisionConfig`

```typescript
export function usePopoverCollisionConfig()
```

/**
* Retrieves the active collision avoidance and spatial layout configuration from the store.
*
* @returns The collision configuration object, or null/undefined if unconfigured.
*
* @example
* ```tsx
* const collisionConfig = usePopoverCollisionConfig();
* ```
*/

---

### `usePopoverIsOpen`

```typescript
export function usePopoverIsOpen<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean
```

/**
* Evaluates whether a popover with the given key is currently open in either the trail or floating pool.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key to check.
* @returns True if the popover is currently open.
*
* @example
* ```tsx
* function TriggerButton({ cardKey }: { cardKey: string }) {
*   const isOpen = usePopoverIsOpen(cardKey);
*   return <button>{isOpen ? 'Close' : 'Open'}</button>;
* }
* ```
*/

---


## 📁 `hooks/selectors/trailSelectors.ts`

### `usePopoverActiveCount`

```typescript
export function usePopoverActiveCount(): number
```

/**
* Returns the total count of active popovers across both the cascading trail and floating pool.
*
* @returns Total active popover count.
*
* @example
* ```tsx
* function ActiveBadge() {
*   const count = usePopoverActiveCount();
*   return <span className="badge">{count}</span>;
* }
* ```
*/

---

### `usePopoverIsIdle`

```typescript
export function usePopoverIsIdle(): boolean
```

/**
* Evaluates whether all popovers are closed (idle state).
*
* Returns `true` if both active trail and floating entries are completely empty.
*
* @returns True if idle, false otherwise.
*
* @example
* ```tsx
* function IdleBackdrop() {
*   const isIdle = usePopoverIsIdle();
*   if (isIdle) return null;
*   return <div className="backdrop" />;
* }
* ```
*/

---

### `usePopoverParentKey`

```typescript
export function usePopoverParentKey<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): TPopoverKey | undefined
```

/**
* Retrieves the parent key of a given popover within the directed acyclic graph.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key whose parent to look up.
* @returns The parent popover key, or undefined if root/unparented.
*
* @example
* ```tsx
* const parentKey = usePopoverParentKey('card-sub-menu');
* ```
*/

---

### `usePopoverChildrenKeys`

```typescript
export function usePopoverChildrenKeys<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): readonly TPopoverKey[]
```

/**
* Retrieves the direct child popover keys of a given popover.
*
* Uses shallow equality memoization to avoid re-renders when children have not changed.
*
* @template TPopoverKey - Branded key type.
* @param key - The popover key whose children to query.
* @returns Readonly array of immediate child keys.
*
* @example
* ```tsx
* const childKeys = usePopoverChildrenKeys('card-parent');
* ```
*/

---

### `usePopoverBreadcrumbs`

```typescript
export function usePopoverBreadcrumbs<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): readonly TPopoverKey[]
```

/**
* Retrieves the geodesic path of popover keys from the root down to the specified key.
*
* Useful for rendering breadcrumbs, back-navigation trails, or hierarchic trees.
*
* @template TPopoverKey - Branded key type.
* @param key - Target popover key.
* @returns Array of keys representing the path from root to the target popover.
*
* @example
* ```tsx
* const path = usePopoverBreadcrumbs('card-item-details');
* // ['card-main', 'card-list', 'card-item-details']
* ```
*/

---

### `usePopoverDepth`

```typescript
export function usePopoverDepth<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): number
```

/**
* Retrieves the 0-based hierarchy depth of a popover within the active cascade.
*
* Root is depth 0, immediate child is depth 1, etc. Returns -1 if the popover is not in the trail.
*
* @template TPopoverKey - Branded key type.
* @param key - Popover key to evaluate.
* @returns 0-based depth integer, or -1 if not active.
*
* @example
* ```tsx
* const depth = usePopoverDepth('card-child');
* ```
*/

---


## 📁 `hooks/useBodyScrollLock.ts`

### `acquireScrollLock`

```typescript
export function acquireScrollLock(): void
```

/**
* Acquires a reference-counted lock on body scrolling.
*
* Hides document body overflow and compensates for layout shifts by adding
* right-padding matching the scrollbar width. Safe to call multiple times.
*
* @example
* ```typescript
* acquireScrollLock();
* // later in teardown:
* releaseScrollLock();
* ```
*/

---

### `releaseScrollLock`

```typescript
export function releaseScrollLock(): void
```

/**
* Decrements the body scroll lock reference counter and restores body overflow/padding when reaching zero.
*
* @example
* ```typescript
* releaseScrollLock();
* ```
*/

---

### `useBodyScrollLock`

```typescript
export function useBodyScrollLock(shouldLock?: boolean): void
```

/**
* Locks background document body scrolling when a modal or popover is open.
*
* Uses reference counting so nested popovers can each request a lock safely.
* Restores original body overflow and padding styles when unmounted or disabled.
*
* @param shouldLock - Boolean indicating whether scrolling should currently be locked.
*
* @example
* ```tsx
* function ModalOverlay({ isOpen }: { isOpen: boolean }) {
*   useBodyScrollLock(isOpen);
*
*   if (!isOpen) return null;
*   return <div className="modal-backdrop">...</div>;
* }
* ```
*/

---


## 📁 `hooks/useClickOutside.ts`

### `useClickOutside`

```typescript
export function useClickOutside<TData = unknown, TContext = unknown>({
  store,
  clickOutside,
}: UseClickOutsideOptions<TData, TContext>): void
```

/**
* Capture-phase click-outside listener hook for PopoverProvider.
* Automatically clears active non-pinned cards when user clicks outside the popover hierarchy.
*
* @param options - Configuration including store instance and clickOutside options.
*
* @example
* ```tsx
* useClickOutside({
*   store,
*   clickOutside: {
*     enabled: true,
*     ignoreClass: 'ignore-popover-dismiss',
*   },
* });
* ```
*/

---

### `handleClickOutside`

```typescript
const handleClickOutside = (e: Event) =>
```

*JSDoc отсутствует*

---


## 📁 `hooks/useDisposable.ts`

### `useCompositeDisposable`

```typescript
export function useCompositeDisposable(): CompositeDisposable
```

*JSDoc отсутствует*

---

### `useDisposable`

```typescript
export function useDisposable(factory: () => CleanupItem, deps: DependencyList = []): void
```

*JSDoc отсутствует*

---


## 📁 `hooks/useDragAndDrop.ts`

### `hasLegacyMediaQueryListener`

```typescript
function hasLegacyMediaQueryListener(mq: MediaQueryList): mq is LegacyMediaQueryList
```

*JSDoc отсутствует*

---

### `listener`

```typescript
const listener = (e: MediaQueryListEvent) =>
```

*JSDoc отсутствует*

---

### `decayRotationInPlace`

```typescript
function decayRotationInPlace(c: { x: number; y: number; z: number }, decay: number): boolean
```

*JSDoc отсутствует*

---

### `applyElementTiltStyles`

```typescript
function applyElementTiltStyles(
  el: HTMLElement | null,
  rot: { x: number; y: number; z: number },
  done: boolean,
): void
```

*JSDoc отсутствует*

---

### `usePopoverDragAndDrop`

```typescript
export function usePopoverDragAndDrop({
  isDragging,
  transform,
  enableTilt = true,
  maxTiltAngle = 5,
  tiltSensitivity = 8,
  dragAxis = 'both',
  tiltFriction = 0.95,
  tiltDecay = 0.82,
  cardRef,
}: UsePopoverDragAndDropOptions): UsePopoverDragAndDropResult
```

/**
* Custom hook tracking coordinate offsets and calculating pointer drag velocity
* to apply dynamic 3D physics spring rotation (tilt/swing) styles during drag interactions.
*
* @remarks
* Uses Euler angle kinematics:
* 1. Velocity sampling calculates pointer movement speed across animation frames.
* 2. Exponential friction dampening smoothly caps rotation angles without jarring stops.
* 3. Inertia decay smoothly returns tilt back to neutral zero degrees once pointer is released.
* 4. Automatically disables all rotation when user enables `prefers-reduced-motion`.
*
* @param options - Drag state and physics configuration parameters.
* @returns Calculated rotation angles (`rotation`, `rotationX`, `rotationY`) and pixel offsets.
*/

---

### `updateRotation`

```typescript
const updateRotation = () =>
```

*JSDoc отсутствует*

---

### `velocityX`

```typescript
const velocityX = (currentDragX - lastDragX.current) / dt
```

*JSDoc отсутствует*

---

### `velocityY`

```typescript
const velocityY = (currentDragY - lastDragY.current) / dt
```

*JSDoc отсутствует*

---

### `returnToZero`

```typescript
const returnToZero = () =>
```

*JSDoc отсутствует*

---


## 📁 `hooks/useEventListener.ts`

### `useEventListener`

```typescript
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null,
  options?: boolean | AddEventListenerOptions,
): void
```

/**
* Attaches a strongly typed event listener to the `window` object.
*
* @example
* ```tsx
* useEventListener('resize', () => {
*   console.log('Window resized:', window.innerWidth);
* });
* ```
*/

---

### `useEventListener`

```typescript
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document | null,
  options?: boolean | AddEventListenerOptions,
): void
```

/**
* Attaches a strongly typed event listener to the `document` object.
*
* @example
* ```tsx
* useEventListener('keydown', (e) => {
*   if (e.key === 'Escape') handleDismiss();
* }, document);
* ```
*/

---

### `useEventListener`

```typescript
export function useEventListener<E extends Event = Event>(
  eventName: string,
  handler: (event: E) => void,
  element?: EventTarget | null,
  options?: boolean | AddEventListenerOptions,
): void
```

/**
* Attaches an event listener to any custom EventTarget.
*/

---

### `useEventListener`

```typescript
export function useEventListener<E extends Event = Event>(
  eventName: string,
  handler: (event: E) => void,
  element: EventTarget | null = isBrowser() ? window : null,
  options?: boolean | AddEventListenerOptions,
): void
```

/**
* Attaches a memory-safe DOM event listener with automatic unmount cleanup and latest-ref callback stability.
*
* Prevents re-attaching listeners when handler identity changes on re-render.
*
* @param eventName - Name of the DOM event to listen for.
* @param handler - Callback function invoked on event trigger.
* @param element - Target DOM node or window/document (defaults to `window`).
* @param options - Standard AddEventListenerOptions or boolean for capture.
*/

---

### `listener`

```typescript
const listener = (event: Event) =>
```

*JSDoc отсутствует*

---


## 📁 `hooks/useFocusTrap.ts`

### `useFocusTrap`

```typescript
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions = {},
): void
```

/**
* Traps keyboard Tab / Shift+Tab focus navigation within a container element.
*
* Implements accessible modal/dialog focus containment (WAI-ARIA Dialog):
* - Cycles forward to the first focusable element when tabbing past the last.
* - Cycles backward to the last focusable element when shift-tabbing past the first.
* - Restores focus to the trigger element when unmounted.
*
* @param containerRef - React ref pointing to the DOM container element.
* @param options - Focus trap configuration options.
*
* @example
* ```tsx
* function ModalDialog({ isOpen, onClose }: ModalProps) {
*   const dialogRef = useRef<HTMLDivElement>(null);
*   useFocusTrap(dialogRef, { enabled: isOpen, autoFocus: true, returnFocus: true });
*
*   return (
*     <div ref={dialogRef} role="dialog" aria-modal="true">
*       <button onClick={onClose}>Close</button>
*       <input placeholder="Name" />
*     </div>
*   );
* }
* ```
*/

---

### `handleKeyDown`

```typescript
const handleKeyDown = (e: KeyboardEvent) =>
```

*JSDoc отсутствует*

---


## 📁 `hooks/useGeometry.ts`

### `usePopoverGeometry`

```typescript
export function usePopoverGeometry({
  id,
  anchorRect,
  placement,
  zIndex,
  isDragging,
  isPinned,
  entry,
  enableSpatialCollision = false,
}: UsePopoverGeometryOptions): UsePopoverGeometryResult
```

/**
* Composite hook calculating absolute positioning coordinates for popover cards.
*
* Coordinates multiple positioning layers:
* 1. Pinned layout override: Returns custom pinned screen coordinates when detached.
* 2. Responsive mode overrides: Modals, bottom sheets, docked navigation bars on small screens.
* 3. Cascade offset computation: Shifts child cards along the cascade vector based on z-index depth.
* 4. Spatial collision avoidance: Nudges overlapping cards via QuadTree 2D spatial partitioning.
*
* @param options - Geometry calculation parameters.
* @returns Final layout coordinates (`top`, `left`) and floating element ref callback.
*
* @example
* ```tsx
* function CardContent({ id, anchorRect, zIndex, isPinned, isDragging }: CardProps) {
*   const { finalLayoutPos, setFloating } = usePopoverGeometry({
*     id,
*     anchorRect,
*     placement: 'right-start',
*     zIndex,
*     isDragging,
*     isPinned,
*   });
*
*   return (
*     <div
*       ref={setFloating}
*       style={{ position: 'fixed', top: finalLayoutPos.top, left: finalLayoutPos.left }}
*     >
*       Popover Body
*     </div>
*   );
* }
* ```
*/

---


## 📁 `hooks/useHookUtils.ts`

### `setRef`

```typescript
export function setRef<T>(ref: Ref<T> | undefined | null, value: T | null): void
```

/**
* Safely assigns a value to a React ref (either mutable RefObject or RefCallback).
*
* @template T - Node element type.
* @param ref - React ref to assign.
* @param value - DOM node or value to pass to the ref.
*
* @example
* ```typescript
* setRef(forwardedRef, node);
* ```
*/

---

### `mergeRefs`

```typescript
export function mergeRefs<T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T>
```

/**
* Composes multiple React refs into a single RefCallback.
*
* @template T - Node element type.
* @param refs - Sequence of refs to merge.
* @returns Composed callback ref.
*
* @example
* ```typescript
* const combinedRef = mergeRefs(localRef, forwardedRef);
* ```
*/

---

### `useMergedRef`

```typescript
export function useMergedRef<T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T>
```

/**
* Merges multiple React refs into a single referentially stable callback ref.
* Eliminates layout thrashing by avoiding DOM node detach/reattach cycles.
*
* @param refs - List of refs to merge.
* @returns Stable merged callback ref.
*
* @example
* ```tsx
* function Card({ forwardedRef }: CardProps) {
*   const localRef = useRef<HTMLDivElement>(null);
*   const ref = useMergedRef(localRef, forwardedRef);
*   return <div ref={ref}>Card Content</div>;
* }
* ```
*/

---

### `useLatestRef`

```typescript
export function useLatestRef<T>(value: T): RefObject<T>
```

/**
* Returns a ref object that synchronously updates to always hold the latest value.
*
* @template T - Value type.
* @param value - Value to keep track of.
* @returns Ref containing the latest value.
*
* @example
* ```tsx
* function EventTrigger({ onClick }: { onClick: () => void }) {
*   const onClickRef = useLatestRef(onClick);
*   useEffect(() => {
*     const timer = setTimeout(() => onClickRef.current(), 1000);
*     return () => clearTimeout(timer);
*   }, [onClickRef]);
* }
* ```
*/

---

### `useIsMounted`

```typescript
export function useIsMounted(): () => boolean
```

/**
* Returns a predicate function indicating whether the component is currently mounted.
* Useful in asynchronous flows to prevent state updates on unmounted components.
*
* @returns Stable predicate function returning true if mounted.
*
* @example
* ```tsx
* function AsyncCard({ loadData }: AsyncCardProps) {
*   const isMounted = useIsMounted();
*   const [data, setData] = useState(null);
*
*   useEffect(() => {
*     loadData().then(result => {
*       if (isMounted()) setData(result);
*     });
*   }, [loadData, isMounted]);
* }
* ```
*/

---

### `usePrevious`

```typescript
export function usePrevious<T>(value: T): T | undefined
```

/**
* Returns the value from the previous render cycle.
*
* @template T - Value type.
* @param value - Current value to track.
* @returns Previous value or undefined on the first render cycle.
*
* @example
* ```tsx
* function Counter({ count }: { count: number }) {
*   const prevCount = usePrevious(count);
*   const hasIncreased = prevCount !== undefined && count > prevCount;
*   return <div>{count} {hasIncreased ? '↑' : ''}</div>;
* }
* ```
*/

---


## 📁 `hooks/usePopoverAction.ts`

### `usePopoverAction`

```typescript
export function usePopoverAction<TData, TInput = void, TPopoverKey extends string = string>(
  cardKey: TPopoverKey,
  action: PopoverServerAction<TData, TInput>,
  options: Omit<UsePopoverActionOptions<TData, TInput>, 'action'> = {},
): UsePopoverActionResult<TData, TInput>
```

/**
* Executes a React 19 Server Action or async mutation with automatic popover store synchronization.
*
* @remarks
* 1. Optimistic updates are applied immediately to avoid UI stutter.
* 2. On server action resolution, the card data in the store is updated.
* 3. On server action rejection, the state is rolled back and an error event is dispatched.
*
* @template TData - Popover card payload type.
* @template TInput - Input argument type passed into the server action.
*
* @param cardKey - Unique identifier of the popover card receiving the action results.
* @param action - Async function taking previous state and input parameters.
* @param options - Configuration options for initial data, optimistic values, and callbacks.
* @returns Tuple of current action state, dispatch function, and isPending boolean.
*
* @example
* ```tsx
* function EditCard({ cardKey }: { cardKey: string }) {
*   const [state, updateName, isPending] = usePopoverAction(
*     cardKey,
*     async (prev, newName: string) => {
*       const updated = await saveNameToServer(newName);
*       return { status: 'success', data: updated };
*     },
*     { optimisticData: (prev, newName) => ({ name: newName }) }
*   );
*
*   return (
*     <div>
*       <span>{state.data?.name}</span>
*       <button disabled={isPending} onClick={() => updateName('Alice')}>Save</button>
*     </div>
*   );
* }
* ```
*/

---


## 📁 `hooks/usePopoverCache.ts`

### `isUpdaterFn`

```typescript
function isUpdaterFn<TData>(
  val: TData | ((prev: TData | undefined) => TData),
): val is (prev: TData | undefined) => TData
```

*JSDoc отсутствует*

---

### `isStoreWithGetState`

```typescript
function isStoreWithGetState<TData>(
  val: unknown,
): val is
```

*JSDoc отсутствует*

---

### `resolveActiveCache`

```typescript
function resolveActiveCache<TData>(
  customCache?: PopoverCache<TData>,
  storeCtx?: unknown,
): PopoverCache<TData> | undefined
```

*JSDoc отсутствует*

---

### `usePopoverCache`

```typescript
export function usePopoverCache<TData = unknown>(
  customCache?: PopoverCache<TData>,
): UsePopoverCacheResult<TData>
```

/**
* Hook providing direct reactive access to the popover data cache.
*
* Exposes methods to retrieve, insert, mutate, invalidate by key/prefix/tag,
* and monitor cache telemetry metrics.
*
* @template TData - Stored cache data payload type.
* @param customCache - Optional external cache implementation overriding the store cache.
* @returns Cache control methods and accessor API.
*
* @example
* ```tsx
* function CacheManager() {
*   const { get, set, invalidate, getStats } = usePopoverCache<UserProfile>();
*   const cachedUser = get('user-123');
*
*   return (
*     <div>
*       <button onClick={() => invalidate('user-123')}>Clear Cache</button>
*       <span>Hits: {getStats()?.hits ?? 0}</span>
*     </div>
*   );
* }
* ```
*/

---


## 📁 `hooks/usePopoverCacheQuery.ts`

### `usePopoverCacheQuery`

```typescript
export function usePopoverCacheQuery<TData = unknown>(
  key: string,
  fetcher?: () => Promise<TData>,
  opts?: UsePopoverCacheQueryOptions<TData>,
): UsePopoverCacheQueryResult<TData>
```

/**
* Reactive data query hook with SWR caching, automatic revalidation, and discriminated state transitions.
*
* Automatically tracks 'idle' | 'loading' | 'success' | 'error' lifecycle statuses.
*
* @template TData - Resolved data payload type.
* @param key - Cache identifier string.
* @param fetcher - Optional async fetch function to populate the cache.
* @param opts - SWR query options including TTL, deduping, and revalidation triggers.
* @returns Query state discriminated union along with mutate and revalidate functions.
*
* @example
* ```tsx
* function UserQueryView({ userId }: { userId: string }) {
*   const { status, data, isLoading } = usePopoverCacheQuery(
*     `user-${userId}`,
*     () => fetchUser(userId),
*     { ttlMs: 60_000 }
*   );
*
*   if (isLoading) return <Spinner />;
*   if (status === 'error') return <div>Error loading user</div>;
*   return <div>User: {data?.name}</div>;
* }
* ```
*/

---


## 📁 `hooks/usePopoverCacheQueryTypes.ts`

### `computeInitialQueryState`

```typescript
export function computeInitialQueryState<TData>(
  key: string,
  cache: import('../types').PopoverCache<TData> | undefined,
  isEnabled: boolean,
  initialData?: TData,
): PopoverCacheQueryState<TData>
```

*JSDoc отсутствует*

---


## 📁 `hooks/usePopoverCacheTypes.ts`

### `isSWRCompatibleCache`

```typescript
export function isSWRCompatibleCache<TData>(
  cache: unknown,
): cache is PopoverCache<TData> & SWRCompatibleCache<TData>
```

*JSDoc отсутствует*

---

### `asSWRCompatibleCache`

```typescript
export function asSWRCompatibleCache<TData>(
  cache?: PopoverCache<TData>,
): (PopoverCache<TData> & SWRCompatibleCache<TData>) | undefined
```

*JSDoc отсутствует*

---

### `isExtendedCache`

```typescript
export function isExtendedCache<TData>(cache: unknown): cache is ExtendedCache<TData>
```

*JSDoc отсутствует*

---


## 📁 `hooks/usePopoverCacheValue.ts`

### `usePopoverCacheValue`

```typescript
export function usePopoverCacheValue<TData = unknown>(
  key: string,
  fetcher?: () => Promise<TData>,
  opts?: UsePopoverCacheValueOptions<TData>,
): UsePopoverCacheValueResult<TData>
```

/**
* Reactive hook subscribing to a single cache key with SWR resolution and background updates.
*
* @template TData - Resolved data payload type.
* @param key - Cache identifier string.
* @param fetcher - Optional async fetch function to resolve the value.
* @param opts - Cache options (initialData, TTL, deduplication, revalidation triggers).
* @returns Result object with data, isLoading flag, error, and revalidate method.
*
* @example
* ```tsx
* function UserGreeting({ userId }: { userId: string }) {
*   const { data: user, isLoading } = usePopoverCacheValue(
*     `user-${userId}`,
*     () => fetchUser(userId),
*   );
*   if (isLoading) return <span>Loading...</span>;
*   return <span>Hello, {user?.name}!</span>;
* }
* ```
*/

---


## 📁 `hooks/usePopoverCard.test.ts`

### `createMockKeyEvent`

```typescript
function createMockKeyEvent(
    key: string,
  ): Pick<React.KeyboardEvent<HTMLElement>, 'key' | 'preventDefault'>
```

*JSDoc отсутствует*

---


## 📁 `hooks/usePopoverTimeline.ts`

### `usePopoverTimeline`

```typescript
export function usePopoverTimeline<TData = unknown>(): UsePopoverTimelineResult<TData>
```

/**
* Hook to access and control the visual breadcrumb timeline and undo/redo history navigation.
*
* @remarks
* Dynamically constructs timeline step items from active cascade trail cards and floating windows,
* and binds directly to the store's undo/redo history manager.
*
* @template TData - The type of resolved data payload.
* @returns Timeline step items, active step index, undo/redo triggers, and jumpToStep callback.
*
* @example
* ```tsx
* function MyTimeline() {
*   const { history, currentIndex, canUndo, canRedo, undo, redo, jumpToStep } = usePopoverTimeline();
*
*   return (
*     <div className="timeline-nav">
*       <button disabled={!canUndo} onClick={undo}>Undo</button>
*       <button disabled={!canRedo} onClick={redo}>Redo</button>
*       {history.map((step) => (
*         <button key={step.stepIndex} onClick={() => jumpToStep(step.stepIndex)}>
*           Step {step.stepIndex + 1}: {step.primaryKey}
*         </button>
*       ))}
*     </div>
*   );
* }
* ```
*/

---


## 📁 `hooks/usePopoverTriggers.ts`

### `usePopoverTriggerBase`

```typescript
function usePopoverTriggerBase<TOptions extends PopoverDisplayOptions>(
  key: string,
  options: TOptions | undefined,
  onOpenHandler: (e: React.MouseEvent<HTMLElement>, currentTarget: HTMLElement) => void,
  explicitIsOpen?: boolean,
)
```

*JSDoc отсутствует*

---

### `usePopoverTrigger`

```typescript
export function usePopoverTrigger(
  key: string,
  options?: OpenRootOptions,
  explicitIsOpen?: boolean,
)
```

/**
* Hook to bind an HTML trigger element to open a root popover.
*
* @remarks
* Injects necessary accessibility attributes (`aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`)
* and handles click or hover interaction with configurable open/close debounce delays.
*
* @example
* ```tsx
* import { usePopoverTrigger } from 'popover-trail';
*
* function TriggerButton() {
*   const triggerProps = usePopoverTrigger('userProfile', { placement: 'bottom-start' });
*   return <button {...triggerProps}>Open Profile</button>;
* }
* ```
*
* @param key - The unique identifier key for the root popover.
* @param options - Custom configuration options (placement, hover delays, etc.).
* @param explicitIsOpen - Optional pre-resolved isOpen boolean flag.
* @returns Event handler and accessibility props object (e.g. `{ onClick, 'aria-expanded': boolean, ... }`).
*/

---

### `usePopoverNestedTrigger`

```typescript
export function usePopoverNestedTrigger(
  key: string,
  sourceKey: string,
  options?: OpenNestedOptions,
  explicitIsOpen?: boolean,
)
```

/**
* Hook to bind an HTML trigger element to open a nested child popover in the cascade trail.
*
* @remarks
* Automatically registers the parent-child relationship in the DAG store and computes trigger bounding box
* coordinates for child positioning.
*
* @example
* ```tsx
* import { usePopoverNestedTrigger } from 'popover-trail';
*
* function NestedLink({ sourceKey }: { sourceKey: string }) {
*   const triggerProps = usePopoverNestedTrigger('userPermissions', sourceKey);
*   return <button {...triggerProps}>View Permissions</button>;
* }
* ```
*
* @param key - The unique identifier key for the child nested popover.
* @param sourceKey - The unique key of the parent popover spawning this child.
* @param options - Custom configuration options.
* @param explicitIsOpen - Optional pre-resolved isOpen boolean flag.
* @returns Event handler and accessibility props object (e.g. `{ onClick, 'aria-expanded': boolean, ... }`).
*/

---


## 📁 `hooks/useSafeCorridor.ts`

### `useSafeCorridor`

```typescript
export function useSafeCorridor({
  triggerRef,
  childCardId,
  enabled = true,
  onLeave,
}: UseSafeCorridorOptions):
```

/**
* Hook providing pointer-safe corridor tracking between a menu trigger and its open child card.
*
* @remarks
* Prevents submenus from accidentally closing when the user moves the pointer diagonally
* across neighboring menu items towards the submenu (Amazon / macOS style menu navigation).
*
* @example
* ```tsx
* const { isInsideCorridor } = useSafeCorridor({
*   triggerRef,
*   childCardId: 'nested-menu',
*   onLeave: () => closeSubmenu(),
* });
* ```
*
* @param options - Hook configuration options.
* @returns Object with boolean `isInsideCorridor` flag.
*/

---

### `handleMouseMove`

```typescript
const handleMouseMove = (e: MouseEvent) =>
```

*JSDoc отсутствует*

---


## 📁 `positioning/positioningGuards.ts`

### `isPositionCoordinates`

```typescript
export function isPositionCoordinates(val: unknown): val is PositionCoordinates
```

/**
* Validates whether an unknown value conforms to `PositionCoordinates` with finite numbers
* and a valid floating-ui placement.
*
* @param val - Candidate value to evaluate.
* @returns `true` if `val` is a valid `PositionCoordinates` object; `false` otherwise.
*
* @example
* ```typescript
* if (isPositionCoordinates(result)) {
*   card.style.transform = `translate3d(${result.x}px, ${result.y}px, 0)`;
* }
* ```
*/

---

### `isPositionComputeOptions`

```typescript
export function isPositionComputeOptions(val: unknown): val is PositionComputeOptions
```

/**
* Validates whether an unknown value conforms to `PositionComputeOptions`.
*
* @param val - Candidate value to evaluate.
* @returns `true` if `val` is a valid `PositionComputeOptions` configuration object; `false` otherwise.
*
* @example
* ```typescript
* if (isPositionComputeOptions(options)) {
*   const coords = await computePosition(anchor, card, options);
* }
* ```
*/

---


## 📁 `schema/schemaBuilder.ts`

### `createResolver`

```typescript
const createResolver = <TC = TContext>(): PopoverResolver<
    SchemaData<TSchema, SchemaKeys<TSchema>>,
    TC
  > =>
```

*JSDoc отсутствует*

---


## 📁 `schema/schemaContext.ts`

### `resolveSchemaContext`

```typescript
export function resolveSchemaContext<TContext>(
  context: TContext | undefined,
  defaultContext: TContext,
): TContext
```

/**
* Resolves schema context with a default fallback if undefined.
*
* @param context - Optional runtime context value.
* @param defaultContext - Fallback context value.
* @returns Resolved non-undefined context.
*
* @example
* ```ts
* const ctx = resolveSchemaContext(userContext, { theme: 'dark' });
* ```
*/

---

### `hasSchemaContext`

```typescript
export function hasSchemaContext<TContext>(
  context: TContext | undefined | null,
): context is TContext
```

/**
* Type guard checking whether a schema context is defined and non-null.
*
* @param context - Candidate context value.
* @returns `true` if context is defined and not null.
*
* @example
* ```ts
* if (hasSchemaContext(ctx)) {
*   console.log('Valid context:', ctx);
* }
* ```
*/

---

### `createDefaultContextResolver`

```typescript
export function createDefaultContextResolver<TContext>(
  defaultContext: TContext,
): (context?: TContext) => TContext
```

/**
* Creates a context resolver function with an initial default fallback.
*
* @param defaultContext - Default context supplied when runtime context is omitted.
* @returns Resolver function taking optional context.
*
* @example
* ```ts
* const getContext = createDefaultContextResolver({ locale: 'en' });
* const activeContext = getContext(); // { locale: 'en' }
* ```
*/

---


## 📁 `schema/schemaGuards.test.ts`

### `dummyResolver`

```typescript
const dummyResolver = () => ({})
```

*JSDoc отсутствует*

---


## 📁 `schema/schemaGuards.ts`

### `isSchemaNode`

```typescript
export function isSchemaNode<TData = unknown, TParentData = unknown, TContext = unknown>(
  val: unknown,
): val is PopoverSchemaNode<TData, TParentData, TContext>
```

/** Validates whether an unknown candidate conforms to PopoverSchemaNode. */

---

### `isSchemaDefinition`

```typescript
export function isSchemaDefinition(val: unknown): val is PopoverSchemaDefinition
```

/** Validates whether an unknown candidate conforms to PopoverSchemaDefinition dictionary. */

---

### `isValidSchemaChildKey`

```typescript
export function isValidSchemaChildKey(
  definition: PopoverSchemaDefinition,
  childKey: unknown,
): childKey is string
```

/** Validates whether a child key is present in the schema definition. */

---

### `isValidSchemaKey`

```typescript
export function isValidSchemaKey<TSchema extends PopoverSchemaDefinition>(
  definition: TSchema,
  key: unknown,
): key is SchemaKeys<TSchema>
```

/**
* Validates whether a key belongs to a specific PopoverSchemaDefinition.
*
* @param definition - The schema definition dictionary.
* @param key - Candidate key to validate.
* @returns True if key exists as an own property in definition.
*/

---

### `hasSchemaResolver`

```typescript
export function hasSchemaResolver(node: unknown): node is PopoverSchemaNode
```

/**
* Validates whether a node contains an active, callable resolver function.
*
* @param node - Candidate schema node to inspect.
* @returns True if node is a schema node with a function resolver.
*/

---


## 📁 `schema/schemaNode.ts`

### `defineSchemaNode`

```typescript
export function defineSchemaNode<TData, TParentData = unknown, TContext = unknown>(
  node: PopoverSchemaNode<TData, TParentData, TContext>,
): PopoverSchemaNode<TData, TParentData, TContext>
```

/**
* Identity factory enforcing typed schema node configuration with metadata.
*
* @example
* ```ts
* const userNode = defineSchemaNode({
*   children: ['profile', 'settings'],
*   resolver: async (key, parentData) => fetchUser(key),
* });
* ```
*
* @param node - Popover schema node configuration.
* @returns Strongly typed schema node.
*/

---

### `getAllowedChildren`

```typescript
export function getAllowedChildren<TData, TParent, TContext>(
  node: PopoverSchemaNode<TData, TParent, TContext>,
): readonly string[]
```

/**
* Extracts declared allowed child keys from a schema node.
*
* @param node - Popover schema node.
* @returns Readonly array of child key identifiers.
*
* @example
* ```ts
* const children = getAllowedChildren(userNode); // ['profile', 'settings']
* ```
*/

---

### `hasAllowedChild`

```typescript
export function hasAllowedChild<TData, TParent, TContext>(
  node: PopoverSchemaNode<TData, TParent, TContext>,
  childKey: string,
): boolean
```

/**
* Checks if a schema node contains a specific child key.
*
* @param node - Popover schema node.
* @param childKey - Child key to check.
* @returns `true` if childKey is present in node children; `false` otherwise.
*
* @example
* ```ts
* if (hasAllowedChild(userNode, 'profile')) { ... }
* ```
*/

---


## 📁 `schema/schemaParams.ts`

### `isParsedKeyParams`

```typescript
export function isParsedKeyParams<TC>(val: unknown): val is ParsedKeyParams<TC>
```

*JSDoc отсутствует*

---

### `parseResolverInvocationParams`

```typescript
export function parseResolverInvocationParams<TC>(
  rawKey: string | object,
  parentData?: unknown,
  context?: TC,
  signal?: AbortSignal,
):
```

*JSDoc отсутствует*

---

### `mergeSchemaNodeOptions`

```typescript
export function mergeSchemaNodeOptions(
  node?: PopoverSchemaNode,
  options?: OpenRootOptions | OpenNestedOptions,
): (OpenRootOptions & OpenNestedOptions) | undefined
```

*JSDoc отсутствует*

---


## 📁 `schema/schemaTrigger.tsx`

### `createSchemaTrigger`

```typescript
export function createSchemaTrigger<TSchema extends PopoverSchemaDefinition>(
  definition: TSchema,
): ComponentType<Omit<PopoverTriggerProps, 'popoverKey'> &
```

*JSDoc отсутствует*

---


## 📁 `schema/schemaValidation.ts`

### `validateSchemaIntegrity`

```typescript
export function validateSchemaIntegrity(definition: PopoverSchemaDefinition): void
```

/**
* Validates the graph integrity of a schema definition:
* 1. Checks that no node declares itself as its own immediate child (self-loop prevention).
* 2. Checks that every declared child key exists in the schema definition.
*
* @param definition - Popover schema definition to validate.
*
* @example
* ```ts
* validateSchemaIntegrity(mySchemaDefinition);
* ```
*/

---


## 📁 `schema.test.tsx`

### `triggerElement`

```typescript
const triggerElement = (
      <appSchema.Trigger popoverKey="userProfile">
        <button>Open User Profile</button>
      </appSchema.Trigger>
    )
```

*JSDoc отсутствует*

---


## 📁 `store/actions/storeActions.ts`

### `isPinnedEntry`

```typescript
export function isPinnedEntry(
  pinnedStates: Readonly<Partial<Record<string, boolean>>>,
  key: string,
): boolean
```

*JSDoc отсутствует*

---

### `isKeyInZIndexOrder`

```typescript
export function isKeyInZIndexOrder(zIndexOrder: readonly string[], key: string): boolean
```

*JSDoc отсутствует*

---

### `reduceTogglePinState`

```typescript
export function reduceTogglePinState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect | PopoverRect,
): StatePatch<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---

### `reduceUpdateOffsetState`

```typescript
export function reduceUpdateOffsetState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  offset: { x: number; y: number },
): StatePatch<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---


## 📁 `store/batching/BatchingCoordinator.ts`

### `flush`

```typescript
public flush(getState?: BatchStateGetter<TState>): void
```

/**
* Flushes pending state changes to all registered batch subscribers.
*
* If an explicit batch is still in progress (`batchDepth > 0`) or if the coordinator is disposed,
* this call is a no-op. When flushed, subscribers receive both the new state and the pre-batch state.
*
* @param getState - Optional state retrieval function overriding the active store getter.
*
* @example
* ```typescript
* coordinator.flush(() => store.getState());
* ```
*/

---

### `dispose`

```typescript
public dispose(): void
```

/**
* Disposes the coordinator, unsubscribing from the underlying store and clearing all listeners.
* Once disposed, subsequent flush calls are ignored.
*
* @example
* ```typescript
* coordinator.dispose();
* ```
*/

---


## 📁 `store/batching/batchRollback.test.ts`

### `applyPatch`

```typescript
const applyPatch = (patch: StatePatch<string, unknown, string>) =>
```

*JSDoc отсутствует*

---


## 📁 `store/batching/storeBatching.ts`

### `createBatchingManager`

```typescript
export function createBatchingManager(autoBatchMicrotasks = true): BatchingManager
```

/**
* Creates an isolated BatchingManager instance to control transaction boundaries,
* coalesce high-frequency microtasks, and suppress duplicate notifications.
*
* @param autoBatchMicrotasks - Whether updates outside explicit batches are coalesced via microtasks. Defaults to true.
* @returns An initialized BatchingManager instance implementing ScopeDisposable.
*
* @example
* ```typescript
* const batchManager = createBatchingManager();
*
* batchManager.startBatch();
* store.setState({ activeId: 'card-1' });
* store.setState({ isPinned: true });
* batchManager.endBatch();
* ```
*/

---

### `startBatch`

```typescript
const startBatch = (): void =>
```

/**
* Begins an explicit batch transaction. Increments nesting depth.
*/

---

### `endBatch`

```typescript
const endBatch = (getState?: BatchStateGetter): void =>
```

/**
* Closes an explicit batch transaction. Flushes if nesting depth reaches 0.
*/

---

### `flushSync`

```typescript
const flushSync = (getState?: BatchStateGetter): void =>
```

/**
* Forces an immediate synchronous flush of any pending batched dispatches.
*/

---

### `dispose`

```typescript
const dispose = (): void =>
```

/**
* Terminates coordinator state, cleaning up master subscription and listeners.
*/

---


## 📁 `store/batching/storeBatchingScheduler.ts`

### `scheduleMicrotask`

```typescript
export function scheduleMicrotask(fn: () => void): void
```

/**
* Schedules a callback to execute in the microtask queue.
* Falls back to an immediately-resolved async task in environments where `queueMicrotask` is absent.
*
* @param fn - Callback to execute in the microtask queue.
*
* @example
* ```typescript
* scheduleMicrotask(() => {
*   coordinator.flush();
* });
* ```
*/

---

### `notifyBatchSubscribers`

```typescript
export function notifyBatchSubscribers<TState>(
  listeners: ReadonlySet<BatchListener<TState>>,
  currentState: TState,
  prevState: TState,
): void
```

/**
* Dispatches committed state transitions to registered batch listeners.
* Wraps each listener call in a try/catch block so an exception in one consumer
* callback does not prevent other listeners from receiving the update.
*
* @template TState - Shape of the store state.
* @param listeners - Set of registered subscriber callbacks.
* @param currentState - The newly committed state snapshot.
* @param prevState - The state snapshot prior to the batch transaction.
*
* @example
* ```typescript
* notifyBatchSubscribers(coordinator.batchListeners, currentState, prevState);
* ```
*/

---

### `batchUpdatesScope`

```typescript
export function batchUpdatesScope<R, TState = unknown>(
  manager: BatchingManager,
  fn: BatchCallback<R>,
  getState?: BatchStateGetter<TState>,
): R
```

/**
* Executes a function within an explicit batch transaction.
* Automatically starts the batch before executing `fn` and guarantees `endBatch`
* is called in a `finally` block, ensuring notifications flush even if `fn` throws.
*
* @template R - Return type of the batched execution callback.
* @template TState - State type retrieved when committing the batch.
* @param manager - Active BatchingManager instance controlling transactional state.
* @param fn - Function to execute within the batch.
* @param getState - Optional state retrieval getter to pass during endBatch flush.
* @returns Result returned by `fn`.
*
* @example
* ```typescript
* const result = batchUpdatesScope(batchManager, () => {
*   store.setState({ x: 10 });
*   store.setState({ y: 20 });
*   return true;
* });
* // Listeners are notified once with the combined update
* ```
*/

---


## 📁 `store/batching/storeBatchingSubscriber.ts`

### `attachStoreSubscriber`

```typescript
export function attachStoreSubscriber<TState = unknown>(
  store: StoreApi<TState>,
  coord: BatchingCoordinator<TState>,
): void
```

/**
* Wraps a Zustand store's subscribe method with batched change notifications.
*
* Intercepts master store state updates, defers non-immediate dispatches
* when autoBatchMicrotasks is enabled or when an explicit batch is open,
* and passes through selector-based subscriptions directly to the underlying engine.
*
* @template TState - Store state shape.
* @param store - Vanilla Zustand store API to wrap.
* @param coord - Batching coordinator tracking batch depth and active subscribers.
*/

---


## 📁 `store/controllers/AbortRegistry.ts`

### `createAbortedController`

```typescript
function createAbortedController(): AbortController
```

/**
* AbortRegistry for network and async cancellation management.
* Provides encapsulated AbortController tracking with [Symbol.dispose].
*/

---

### `register`

```typescript
public register(key: TPopoverKey): AbortController
```

/**
* Registers a new `AbortController` for the given key, aborting any prior controller for that key.
* If the registry is already disposed, returns an immediately aborted controller.
*
* @param key - Popover or resource key to register.
* @returns Fresh `AbortController` (or pre-aborted controller if disposed).
*
* @example
* ```typescript
* const controller = registry.register('item-123');
* ```
*/

---

### `remove`

```typescript
public remove(key: TPopoverKey, controller?: AbortController): void
```

/**
* Removes a controller from tracking without aborting it (e.g. upon normal completion).
*
* @param key - Registered key.
* @param controller - Optional controller reference to ensure removal only if it matches.
*/

---

### `abortKey`

```typescript
public abortKey(key: TPopoverKey): void
```

/**
* Aborts the controller associated with the specified key and removes it from tracking.
*
* @param key - Key to abort.
*
* @example
* ```typescript
* registry.abortKey('item-123');
* ```
*/

---

### `abortKeys`

```typescript
public abortKeys(keys?: Iterable<TPopoverKey> | null): void
```

/**
* Aborts all controllers associated with the provided sequence of keys.
*
* @param keys - Iterable collection of keys to abort.
*
* @example
* ```typescript
* registry.abortKeys(['card-1', 'card-2']);
* ```
*/

---

### `abortAll`

```typescript
public abortAll(): void
```

/**
* Aborts all currently tracked controllers and clears the registry.
*
* @example
* ```typescript
* registry.abortAll();
* ```
*/

---

### `dispose`

```typescript
public dispose(): void
```

/**
* Disposes the registry and aborts all active controllers.
*/

---


## 📁 `store/controllers/InFlightPromiseCache.ts`

### `has`

```typescript
public has(key: TPopoverKey): boolean
```

/**
* Checks if an operation with the given key is currently in-flight.
*
* @param key - Operation key.
* @returns True if currently running, false otherwise.
*/

---

### `get`

```typescript
public get(key: TPopoverKey): Promise<TData> | undefined
```

/**
* Retrieves the running promise for the given key, if one is active.
*
* @param key - Operation key.
* @returns Active promise or `undefined`.
*/

---

### `set`

```typescript
public set(key: TPopoverKey, promise: Promise<TData>): void
```

/**
* Tracks an in-flight promise under the specified key, evicting the oldest key if capacity is exceeded.
*
* @param key - Operation key.
* @param promise - Active Promise to track.
*/

---

### `remove`

```typescript
public remove(key: TPopoverKey, promise?: Promise<TData>): void
```

/**
* Removes an operation from tracking.
*
* @param key - Operation key.
* @param promise - Optional promise reference to only remove if matching.
*/

---

### `clear`

```typescript
public clear(): void
```

/**
* Clears all in-flight promise references.
*/

---

### `runTracked`

```typescript
public async runTracked(key: TPopoverKey, task: () => Promise<TData>): Promise<TData>
```

/**
* Executes an async task or joins an already existing in-flight task under the given key.
* Automatically cleans up the key from the cache once the promise settles.
*
* @param key - Deduplication key.
* @param task - Factory returning the Promise to execute if not already running.
* @returns Shared Promise resolving to task output.
*
* @example
* ```typescript
* const data = await cache.runTracked('fetch-details', () => api.getDetails());
* ```
*/

---


## 📁 `store/controllers/storeControllers.ts`

### `abortControllersForKeys`

```typescript
const abortControllersForKeys = (keys: Iterable<TPopoverKey | string>): void =>
```

*JSDoc отсутствует*

---

### `abortAllControllers`

```typescript
const abortAllControllers = (): void =>
```

*JSDoc отсутствует*

---

### `runTracked`

```typescript
export function runTracked<TData>(
  inFlightPromises: Map<string, Promise<TData>>,
  key: string,
  task: () => Promise<TData>,
): Promise<TData>
```

/**
* Executes an async task while tracking it in an in-flight promises Map.
* Automatically cleans up the promise from the Map upon completion.
*
* @template TData - Output type of task.
* @param inFlightPromises - Target map to record running promise.
* @param key - Operation key.
* @param task - Async task factory function.
* @returns Promise resolving to the task result.
*
* @example
* ```typescript
* const result = await runTracked(inFlightMap, 'task-key', async () => {
*   return await api.call();
* });
* ```
*/

---

### `promise`

```typescript
const promise = (async () => {
    try {
      return await task();
    } finally {
      if (tracked.promise && inFlightPromises.get(key) === tracked.promise)
        inFlightPromises.delete(key);
    }
  })()
```

*JSDoc отсутствует*

---


## 📁 `store/core/storeDependencies.ts`

### `dispatchEffects`

```typescript
const dispatchEffects = (effects: readonly Effect<TData, TPopoverKey, TContext>[]) =>
```

*JSDoc отсутствует*

---


## 📁 `store/core/storeExtensions.ts`

### `dispose`

```typescript
const dispose = () =>
    runStoreDisposal({ store, customSlices, dependencies: disposalDeps, ...mgrs })
```

*JSDoc отсутствует*

---


## 📁 `store/core/storeManagers.ts`

### `initStoreManagers`

```typescript
export function initStoreManagers<TData, TContext, TPopoverKey extends string>(
  customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[],
): StoreManagers<TData, TContext, TPopoverKey>
```

/**
* Instantiates and wires all headless store managers and registry infrastructure.
*
* @param customSlices - Optional list of user-provided custom slices with middleware hooks.
* @returns Fully initialized StoreManagers bundle.
*/

---


## 📁 `store/core/storeReset.ts`

### `executeStoreReset`

```typescript
export function executeStoreReset<TData, TContext = unknown, TPopoverKey extends string = string>(
  subsystems: ResetStoreSubsystems<TData, TContext, TPopoverKey>,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/core/storeStateInitializer.ts`

### `findEntryByKey`

```typescript
const findEntryByKey = (k: string) => findEntryInStore(get().floating, get().trail, k)
```

*JSDoc отсутствует*

---

### `resetStoreState`

```typescript
const resetStoreState = () => executeStoreReset({ ...cfg.mgrs, safeSet })
```

*JSDoc отсутствует*

---


## 📁 `store/cqrs/cqrs.ts`

### `dispose`

```typescript
const dispose = (): void =>
```

*JSDoc отсутствует*

---


## 📁 `store/cqrs/cqrsBuses.test.ts`

### `createMockCommandActions`

```typescript
function createMockCommandActions(): PopoverActions<unknown, unknown, string>
```

*JSDoc отсутствует*

---


## 📁 `store/cqrs/cqrsCommandBus.ts`

### `openRootWithResolver`

```typescript
async openRootWithResolver(
    key: TPopoverKey,
    anchor?: AnchorEventLike,
    options?: OpenRootOptions,
  ): Promise<void>
```

/** Opens root popover card resolving payload asynchronously via registered data resolver. */

---

### `openNestedWithResolver`

```typescript
async openNestedWithResolver(
    parentKey: TPopoverKey,
    key: TPopoverKey,
    options?: OpenNestedOptions,
  ): Promise<void>
```

/** Opens child popover resolving payload asynchronously. */

---

### `retry`

```typescript
async retry(key: TPopoverKey, options?: Readonly<{ forceRefresh?: boolean }>): Promise<void>
```

/** Re-executes the async resolver for a failed popover entry. */

---

### `prefetch`

```typescript
async prefetch(key: TPopoverKey, parentData?: TData): Promise<TData | undefined>
```

/** Warm-up prefetch for a popover key ahead of user hover/interaction. */

---


## 📁 `store/cqrs/cqrsCommandTarget.ts`

### `resolveCommandActions`

```typescript
export function resolveCommandActions<TData, TContext, TPopoverKey extends string>(
  target: CommandBusTarget<TData, TContext, TPopoverKey>,
): PopoverActions<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---


## 📁 `store/cqrs/cqrsQueryBus.ts`

### `getEntry`

```typescript
public getEntry<K extends TPopoverKey>(
    key: K,
  ): TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, K> | undefined
```

/**
* Retrieves the trail entry for a given key, with strongly-typed payload resolution.
*
* @param key - Registered popover key.
* @returns TrailEntry if found, otherwise `undefined`.
*/

---

### `getEntryResult`

```typescript
public getEntryResult<K extends TPopoverKey>(
    key: K,
  ): Result<TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, K>, PopoverNotFoundError<K>>
```

/**
* Retrieves the trail entry for a given key returning a `Result`.
*
* @remarks
* Eliminates the need for null-checks or throw-catch blocks by returning an explicit `Ok(entry)`
* or `Err(PopoverNotFoundError)` structure.
*
* @example
* ```ts
* const entryResult = queryBus.getEntryResult('userProfile');
* if (isOk(entryResult)) {
*   console.log('User data:', entryResult.value.data);
* }
* ```
*
* @param key - Target popover key.
* @returns `Ok(TrailEntry)` or `Err(PopoverNotFoundError)`.
*/

---

### `getData`

```typescript
public getData<K extends TPopoverKey>(
    key: K,
  ): ResolveDataFromMap<TDataMap, K, TData> | null | undefined
```

/**
* Retrieves the resolved data payload for a given popover key.
*/

---

### `getDataResult`

```typescript
public getDataResult<K extends TPopoverKey>(
    key: K,
  ): Result<ResolveDataFromMap<TDataMap, K, TData> | null, PopoverNotFoundError<K>>
```

/**
* Retrieves the resolved data payload for a given popover key returning a `Result`.
*
* @param key - Target popover key.
* @returns `Ok(data)` or `Err(PopoverNotFoundError)`.
*/

---

### `getOffset`

```typescript
public getOffset(key: TPopoverKey): DragOffset
```

/**
* Retrieves the current drag/docking coordinate offset for the given popover key.
*
* @param key - Registered popover key.
* @returns Drag offset { x, y } in pixels, or { x: 0, y: 0 } if unset.
*/

---

### `isOpen`

```typescript
public isOpen(key: TPopoverKey): boolean
```

/**
* Checks whether a popover is currently open (in active trail or floating stack).
*
* @param key - Registered popover key.
* @returns `true` if active, `false` otherwise.
*/

---

### `isPinned`

```typescript
public isPinned(key: TPopoverKey): boolean
```

/**
* Checks whether a popover is pinned into floating mode.
*
* @param key - Registered popover key.
* @returns `true` if pinned, `false` otherwise.
*/

---

### `isTopmost`

```typescript
public isTopmost(key: TPopoverKey): boolean
```

/**
* Checks whether the popover is the topmost entry in stacking and focus order.
*
* @param key - Registered popover key.
* @returns `true` if on top, `false` otherwise.
*/

---

### `isLoading`

```typescript
public isLoading(key: TPopoverKey): boolean
```

/**
* Checks whether an async data resolver is currently loading for the given popover.
*
* @param key - Registered popover key.
* @returns `true` if loading, `false` otherwise.
*/

---

### `getError`

```typescript
public getError(key: TPopoverKey): Error | null
```

/**
* Retrieves the error object if the popover's async resolver failed.
*
* @param key - Registered popover key.
* @returns Error instance if failed, or `null` otherwise.
*/

---

### `getParent`

```typescript
public getParent(key: TPopoverKey): TPopoverKey | undefined
```

/**
* Retrieves the parent popover key in the active cascade hierarchy.
*
* @param key - Target popover key.
* @returns Parent key or `undefined` if root or not found.
*/

---

### `getChildren`

```typescript
public getChildren(key: TPopoverKey): readonly TPopoverKey[]
```

/**
* Retrieves keys of all child popovers opened directly by the specified popover.
*
* @param key - Parent popover key.
* @returns Readonly array of child keys.
*/

---

### `getBreadcrumbs`

```typescript
public getBreadcrumbs(key: TPopoverKey): readonly TPopoverKey[]
```

/**
* Retrieves the breadcrumb trail keys leading from root down to the specified popover.
*
* @param key - Target popover key.
* @returns Array of keys in root-to-target order.
*/

---

### `getDepth`

```typescript
public getDepth(key: TPopoverKey): number
```

/**
* Retrieves the zero-indexed cascade nesting depth of the specified popover (0 = root).
*
* @param key - Target popover key.
* @returns Integer depth tier, or -1 if popover is not in the active trail.
*/

---

### `getBranch`

```typescript
public getBranch(key: TPopoverKey): readonly TrailEntry<TData, TPopoverKey>[]
```

/**
* Retrieves the cascade trail branch entries leading from root down to the specified popover.
*
* @param key - Target popover key.
* @returns Array of TrailEntry objects along the branch.
*/

---

### `dispose`

```typescript
public dispose(): void
```

*JSDoc отсутствует*

---


## 📁 `store/cqrs.test.ts`

### `createMockActions`

```typescript
const createMockActions = () =>
```

*JSDoc отсутствует*

---

### `createMockState`

```typescript
const createMockState = () =>
    createMockStoreState<unknown,
```

*JSDoc отсутствует*

---


## 📁 `store/effects/effectCallbacks.ts`

### `notifyUserCallback`

```typescript
export function notifyUserCallback<TData, TPopoverKey extends string>(
  entry: TrailEntry<TData, TPopoverKey>,
  type: UserCallbackType,
  key: TPopoverKey,
  payload?: unknown,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/effects/effectRunner.ts`

### `runSingleEffect`

```typescript
function runSingleEffect<TData, TPopoverKey extends string, TContext>(
  effect: Effect<TData, TPopoverKey, TContext>,
  deps: EffectRunnerDependencies<TData, TPopoverKey, TContext>,
): void
```

*JSDoc отсутствует*

---

### `runEffects`

```typescript
export function runEffects<TData, TPopoverKey extends string = string, TContext = unknown>(
  effects: readonly Effect<TData, TPopoverKey, TContext>[],
  deps: EffectRunnerDependencies<TData, TPopoverKey, TContext>,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/effects/effectRunnerTypes.ts`

### `handleHistorySnapshot`

```typescript
export function handleHistorySnapshot<TData, TPopoverKey extends string, TContext>(
  effect: Extract<Effect<TData, TPopoverKey, TContext>, { type: 'RECORD_HISTORY_SNAPSHOT' }>,
  deps: EffectRunnerDependencies<TData, TPopoverKey, TContext>,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/eventBus/eventBusCapacity.ts`

### `warnIfOverCapacity`

```typescript
export function warnIfOverCapacity(size: number, maxListeners: number): void
```

*JSDoc отсутствует*

---


## 📁 `store/eventBus/eventBusCore.ts`

### `checkCapacity`

```typescript
private checkCapacity(): void
```

*JSDoc отсутствует*

---

### `emit`

```typescript
public emit<K extends PopoverEventType>(
    type: K,
    payload: PopoverEventPayloadMap<TData, TPopoverKey>[K],
  ): boolean
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(): void
```

*JSDoc отсутствует*

---

### `dispose`

```typescript
public dispose(): void
```

*JSDoc отсутствует*

---


## 📁 `store/eventBus/eventBusDispatch.ts`

### `emitStoreEventToBus`

```typescript
export function emitStoreEventToBus<TData, TPopoverKey extends string = string>(
  eventBus: PopoverEventBus<TData, TPopoverKey>,
  event: PopoverStoreEvent<TData, TPopoverKey>,
): void
```

*JSDoc отсутствует*

---

### `dispatchStoreEvent`

```typescript
export function dispatchStoreEvent<TData, TPopoverKey extends string = string>(
  eventListeners: Iterable<(event: PopoverStoreEvent<TData, TPopoverKey>) => void> | undefined,
  event: PopoverStoreEvent<TData, TPopoverKey>,
  eventBus?: PopoverEventBus<TData, TPopoverKey>,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/eventBus/eventBusRouter.ts`

### `isDetailWithKey`

```typescript
function isDetailWithKey<TPopoverKey>(val: unknown): val is EventDetailWithKey<TPopoverKey>
```

*JSDoc отсутствует*

---

### `subscribeAny`

```typescript
public subscribeAny(
    listener: PopoverWildcardListener<TData, TPopoverKey>,
  ): PopoverSubscriptionToken
```

*JSDoc отсутствует*

---

### `subscribeKey`

```typescript
public subscribeKey(
    targetKey: TPopoverKey,
    listener: PopoverWildcardListener<TData, TPopoverKey>,
  ): PopoverSubscriptionToken
```

*JSDoc отсутствует*

---

### `dispatchWildcards`

```typescript
public dispatchWildcards(event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>): void
```

*JSDoc отсутствует*

---

### `dispatchKeys`

```typescript
public dispatchKeys(
    event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>,
    payload: unknown,
  ): void
```

*JSDoc отсутствует*

---

### `dispatchSingleKey`

```typescript
private dispatchSingleKey(
    key: TPopoverKey,
    event: PopoverCustomEvent<PopoverEventType, TData, TPopoverKey>,
  ): void
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(): void
```

*JSDoc отсутствует*

---


## 📁 `store/eventBus/eventBusSubscriptionManager.ts`

### `subscribe`

```typescript
public subscribe<K extends PopoverEventType>(
    target: EventTarget,
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    options?: AddEventListenerOptions,
  ): PopoverSubscriptionToken
```

*JSDoc отсутствует*

---

### `unsubscribe`

```typescript
public unsubscribe<K extends PopoverEventType>(
    target: EventTarget,
    type: K,
    listener: PopoverEventListener<K, TData, TPopoverKey>,
    options?: EventListenerOptions,
  ): void
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(target: EventTarget): void
```

*JSDoc отсутствует*

---


## 📁 `store/eventBus/eventBusTypes.ts`

### `createSubscriptionToken`

```typescript
export function createSubscriptionToken(unsubscribe: () => void): PopoverSubscriptionToken
```

*JSDoc отсутствует*

---

### `token`

```typescript
const token = () => unsubscribe()
```

*JSDoc отсутствует*

---


## 📁 `store/fsm/fsmGuards.ts`

### `isFSMState`

```typescript
export function isFSMState<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is PopoverFSMState<TData, TPopoverKey>
```

/** Validates whether an unknown value conforms to a PopoverFSMState structure. */

---

### `isIdleFSM`

```typescript
export function isIdleFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is IdleFSMState<TData, K>
```

/** Checks if the machine is currently in the Idle initial state. */

---

### `isHydratingFSM`

```typescript
export function isHydratingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is HydratingFSMState<TData, K>
```

/** Checks if the machine is actively hydrating or fetching data. */

---

### `isResolvedFSM`

```typescript
export function isResolvedFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedTrailingFSMState<TData, K> | ResolvedPinnedFSMState<TData, K>
```

/** Checks if the machine is resolved (either trailing in cascade or pinned). */

---

### `isTrailingFSM`

```typescript
export function isTrailingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedTrailingFSMState<TData, K>
```

/** Checks if the machine is in the active trailing cascade state. */

---

### `isPinnedFSM`

```typescript
export function isPinnedFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ResolvedPinnedFSMState<TData, K>
```

/** Checks if the machine is currently pinned in floating mode. */

---

### `isErrorFSM`

```typescript
export function isErrorFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is ErrorFSMState<TData, K>
```

/** Checks if the machine entered the Error failure state. */

---

### `isUnmountingFSM`

```typescript
export function isUnmountingFSM<TData = unknown, K extends string = string>(
  state: PopoverFSMState<TData, K>,
): state is UnmountingFSMState<TData, K>
```

/** Checks if the machine is unmounting during exit transitions. */

---


## 📁 `store/fsm/fsmInitializer.ts`

### `createInitialFSMState`

```typescript
export function createInitialFSMState<TData = unknown, TPopoverKey extends string = string>(
  keyOrOptions: TPopoverKey | PopoverFSMOptions<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey>
```

---


## 📁 `store/fsm/fsmMatrix.ts`

### `isValidTransition`

```typescript
export function isValidTransition(from: PopoverStateValue, to: PopoverStateValue): boolean
```

/**
* Evaluates whether transitioning between two popover lifecycle states is valid.
*
* Popover lifecycles follow a strict sequence (e.g. `Idle` -> `Hydrating` -> `Resolved.Trailing`
* -> `Unmounting` -> `Idle`). This function checks against the state manifest in O(1) time
* to prevent illegal state jumps, such as opening an unhydrated card directly into pinned mode.
*
* @param from - Current source state.
* @param to - Proposed destination state.
* @returns `true` if the transition is allowed; otherwise `false`.
*
* @example
* ```typescript
* isValidTransition('Idle', 'Hydrating'); // true
* isValidTransition('Hydrating', 'Resolved.Trailing'); // true
* isValidTransition('Idle', 'Resolved.Pinned'); // false (must hydrate first)
* ```
*/

---

### `canTransition`

```typescript
export function canTransition<From extends PopoverStateValue, To extends PopoverStateValue>(
  from: From,
  to: To,
): to is To & ValidNextFSMState<From>
```

/**
* Type guard verifying whether a transition from `from` to `to` is allowed.
*
* Validates the transition at runtime and narrows the type of `to` to only the valid
* next states (`ValidNextFSMState<From>`) for compile-time type safety.
*
* @template From - Current state type.
* @template To - Target state type.
* @param from - Current state.
* @param to - Next proposed state.
* @returns True if the transition is allowed.
*
* @example
* ```typescript
* if (canTransition(currentState, nextState)) {
*   // nextState is narrowed to ValidNextFSMState<typeof currentState>
*   transitionTo(nextState);
* }
* ```
*/

---

### `isValidTransitionStatusChange`

```typescript
export function isValidTransitionStatusChange(
  from?: PopoverTransitionStatus,
  to?: PopoverTransitionStatus,
): boolean
```

/**
* Validates transitions between DOM mounting status flags (`mounting`, `mounted`, `unmounting`).
*
* Uses bitwise checks for fast evaluation during high-frequency animation and render cycles.
* Prevents illegal skips, such as jumping directly from `unmounting` to `mounted` without
* passing through `mounting`.
*
* @param from - Current transition status.
* @param to - Proposed next transition status.
* @returns `true` if the status change is valid, or if either status is undefined.
*
* @example
* ```typescript
* isValidTransitionStatusChange('mounting', 'mounted'); // true
* isValidTransitionStatusChange('mounted', 'unmounting'); // true
* isValidTransitionStatusChange('unmounting', 'mounted'); // false (must mount first)
* ```
*/

---


## 📁 `store/fsm/fsmObserver.ts`

### `bindFSMRegistryToEventBus`

```typescript
export function bindFSMRegistryToEventBus<TData = unknown, TPopoverKey extends string = string>(
  fsmRegistry: PopoverFSMRegistry<TData, TPopoverKey>,
  eventBus: PopoverEventBus<TData, TPopoverKey>,
): () => void
```

/**
* Binds an FSM Registry as a shadow invariant watchdog to the store event bus.
*/

---

### `isEvent`

```typescript
function isEvent<K extends PopoverEventType>(
    event: Event,
    type: K,
  ): event is PopoverCustomEvent<K, TData, TPopoverKey>
```

*JSDoc отсутствует*

---


## 📁 `store/fsm/fsmRegistry.ts`

### `getOrCreate`

```typescript
public getOrCreate(key: TPopoverKey): PopoverCardFSM<TData, TPopoverKey>
```

*JSDoc отсутствует*

---

### `get`

```typescript
public get(key: TPopoverKey): PopoverCardFSM<TData, TPopoverKey> | undefined
```

*JSDoc отсутствует*

---

### `send`

```typescript
public send(key: TPopoverKey, event: PopoverFSMEvent<TData, TPopoverKey>): void
```

*JSDoc отсутствует*

---

### `getStatusBit`

```typescript
public getStatusBit(key: TPopoverKey): number
```

*JSDoc отсутствует*

---

### `destroy`

```typescript
public destroy(key: TPopoverKey): void
```

*JSDoc отсутствует*

---

### `destroyAll`

```typescript
public destroyAll(): void
```

*JSDoc отсутствует*

---

### `notifyIllegalTransition`

```typescript
private notifyIllegalTransition(
    key: TPopoverKey,
    from: PopoverStateValue,
    event: PopoverFSMEvent<TData, TPopoverKey>,
  ): void
```

*JSDoc отсутствует*

---

### `createPopoverFSMRegistry`

```typescript
export function createPopoverFSMRegistry<TData = unknown, TPopoverKey extends string = string>(
  options?: FSMRegistryOptions<TData, TPopoverKey>,
): PopoverFSMRegistry<TData, TPopoverKey>
```

*JSDoc отсутствует*

---


## 📁 `store/fsm/fsmTransitions.ts`

### `transitionFSMState`

```typescript
export function transitionFSMState<TData = unknown, TPopoverKey extends string = string>(
  state: PopoverFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey>
```

/**
* Pure state transition reducer for a popover card finite state machine.
*
* Evaluates incoming events (`OPEN_ROOT`, `PUSH_NESTED`, `RESOLVE_SUCCESS`, `RESOLVE_FAILURE`,
* `TOGGLE_PIN`, `CLOSE`, `TRANSITION_END`, `RETRY`) against `isValidTransition`.
* If the transition is permitted, returns a new immutable state object with updated context;
* otherwise returns the existing state reference unchanged.
*
* @template TData - Type of data payload associated with the popover.
* @template TPopoverKey - String identifier type for the popover key.
* @param state - Current FSM state and context.
* @param event - Lifecycle event being processed.
* @returns Next FSM state (or identical state reference if transition was rejected).
*
* @example
* ```typescript
* const next = transitionFSMState(currentState, {
*   type: 'RESOLVE_SUCCESS',
*   data: { title: 'Product Details' },
* });
* console.log(next.value); // 'Resolved.Trailing'
* ```
*/

---


## 📁 `store/fsm/PopoverCardFSM.ts`

### `getState`

```typescript
public getState(): PopoverFSMState<TData, TPopoverKey>
```

/**
* Returns the current state snapshot and context of the popover card.
*/

---

### `getStatusBit`

```typescript
public getStatusBit(): number
```

/**
* Returns the numeric bitmask flag corresponding to the current state.
*/

---

### `matches`

```typescript
public matches(value: PopoverStateValue): boolean
```

/**
* Checks whether the current FSM state matches the specified state value.
*
* @param value - State value to test against (e.g. `'Resolved.Trailing'`).
* @returns `true` if current state value matches.
*/

---

### `isActive`

```typescript
public isActive(): boolean
```

/**
* Checks whether the popover is currently active (`Hydrating`, `Resolved.Trailing`, or `Resolved.Pinned`).
*
* @returns `true` if active in the UI.
*/

---

### `isResolved`

```typescript
public isResolved(): boolean
```

/**
* Checks whether the popover has resolved successfully and is ready to display content.
*
* @returns `true` if resolved.
*/

---

### `send`

```typescript
public send(event: PopoverFSMEvent<TData, TPopoverKey>): PopoverFSMState<TData, TPopoverKey>
```

/**
* Dispatches a lifecycle event to trigger a state transition.
*
* If the proposed transition is admitted by the transition matrix, the new state is saved
* and all subscribers are notified. If invalid, the event is ignored and current state returned.
*
* @param event - Lifecycle event (e.g. `OPEN_ROOT`, `RESOLVE_SUCCESS`, `TOGGLE_PIN`, `CLOSE`).
* @returns The updated (or unchanged) state snapshot.
*
* @example
* ```typescript
* fsm.send({ type: 'CLOSE' });
* ```
*/

---

### `subscribe`

```typescript
public subscribe(listener: FSMSubscriber<TData, TPopoverKey>): () => void
```

/**
* Subscribes a listener callback to state transitions.
*
* @param listener - Callback invoked with the new state whenever a transition occurs.
* @returns An unsubscribe cleanup function.
*
* @example
* ```typescript
* const unsubscribe = fsm.subscribe((state) => {
*   console.log('New state:', state.value);
* });
* ```
*/

---

### `dispose`

```typescript
public dispose(): void
```

/**
* Disposes the state machine and terminates all active subscriptions.
*/

---

### `notifySubscribers`

```typescript
private notifySubscribers(): void
```

*JSDoc отсутствует*

---

### `createPopoverFSM`

```typescript
export function createPopoverFSM<TData = unknown, TPopoverKey extends string = string>(
  keyOrOptions: TPopoverKey | PopoverFSMOptions<TData, TPopoverKey>,
): PopoverCardFSM<TData, TPopoverKey>
```

/**
* Creates an isolated finite state machine interpreter for a single popover card.
*
* @template TData - Type of data payload associated with the popover.
* @template TPopoverKey - String identifier type for the popover key.
* @param keyOrOptions - Popover key string or configuration object.
* @returns Initialized `PopoverCardFSM` instance.
*
* @example
* ```typescript
* const cardFsm = createPopoverFSM('user-settings');
* cardFsm.send({ type: 'OPEN_ROOT', key: 'user-settings' });
* ```
*/

---


## 📁 `store/guards/actionGuards.ts`

### `isStoreActionPayload`

```typescript
export function isStoreActionPayload(val: unknown): val is StoreActionPayload
```

/** Validates that an unknown candidate is a well-formed StoreActionPayload. */

---

### `matchesStoreAction`

```typescript
function matchesStoreAction<T extends StoreActionType>(
  action: unknown,
  type: T,
): action is Extract<StoreActionPayload,
```

/** Internal predicate matching a StoreActionPayload against an action type. */

---

### `isOpenRootAction`

```typescript
export function isOpenRootAction(
  action: unknown,
): action is Extract<StoreActionPayload,
```

/** Type guard for OPEN_ROOT action. */

---

### `isPushNestedAction`

```typescript
export function isPushNestedAction(
  action: unknown,
): action is Extract<StoreActionPayload,
```

/** Type guard for PUSH_NESTED action. */

---

### `isCloseAction`

```typescript
export function isCloseAction(
  action: unknown,
): action is Extract<
  StoreActionPayload,
```

/** Type guard for any closing/clearing action variant. */

---

### `isTogglePinAction`

```typescript
export function isTogglePinAction(
  action: unknown,
): action is Extract<StoreActionPayload,
```

/** Type guard for TOGGLE_PIN action. */

---

### `isUpdateOffsetAction`

```typescript
export function isUpdateOffsetAction(
  action: unknown,
): action is Extract<StoreActionPayload,
```

/** Type guard for UPDATE_OFFSET action. */

---

### `isResolveAction`

```typescript
export function isResolveAction(
  action: unknown,
): action is Extract<
  StoreActionPayload,
```

/** Type guard for any resolution lifecycle action. */

---


## 📁 `store/guards/sliceGuards.ts`

### `hasTrailState`

```typescript
export function hasTrailState(val: unknown): val is HasTrailState
```

/** Validates whether an unknown candidate satisfies the HasTrailState slice. */

---

### `hasFloatingState`

```typescript
export function hasFloatingState(val: unknown): val is HasFloatingState
```

/** Validates whether an unknown candidate satisfies the HasFloatingState slice. */

---

### `hasPinnedState`

```typescript
export function hasPinnedState(val: unknown): val is HasPinnedState
```

/** Validates whether an unknown candidate satisfies the HasPinnedState slice. */

---

### `hasZIndexState`

```typescript
export function hasZIndexState(val: unknown): val is HasZIndexState
```

/** Validates whether an unknown candidate satisfies the HasZIndexState slice. */

---

### `hasLifecycleState`

```typescript
export function hasLifecycleState(val: unknown): val is HasLifecycleState
```

/** Validates whether an unknown candidate satisfies the HasLifecycleState slice. */

---

### `hasAnchorState`

```typescript
export function hasAnchorState(val: unknown): val is HasAnchorState
```

/** Validates whether an unknown candidate satisfies the HasAnchorState slice. */

---


## 📁 `store/guards/storeGuards.ts`

### `isStoreApi`

```typescript
export function isStoreApi<T = unknown>(val: unknown): val is StoreApi<T>
```

/**
* Validates whether an unknown value is a valid Zustand StoreApi instance.
* Ensures getState, setState, and subscribe methods are present.
*/

---

### `isSchemaInstance`

```typescript
export function isSchemaInstance<TSchema extends PopoverSchemaDefinition = PopoverSchemaDefinition>(
  val: unknown,
): val is PopoverSchemaInstance<TSchema>
```

/**
* Validates whether an unknown object is an instantiated PopoverSchemaInstance.
* Confirms both schema definition structure and createResolver factory presence.
*/

---

### `isSchemaKey`

```typescript
export function isSchemaKey<TSchema extends PopoverSchemaDefinition>(
  schema: PopoverSchemaInstance<TSchema> | TSchema,
  key: unknown,
): key is StrictPopoverKey<TSchema>
```

/**
* Runtime type guard checking whether an unknown key is a valid key defined in the schema.
* Supports both standalone schema definitions and instantiated schema wrappers.
*/

---

### `isHistorySnapshot`

```typescript
export function isHistorySnapshot(val: unknown): val is HistorySnapshot
```

/**
* Validates whether an unknown value conforms to a HistorySnapshot structure.
* Verifies presence of trail, floating, zIndexOrder arrays and offset dictionaries.
*/

---


## 📁 `store/history/history.ts`

### `pushSnapshot`

```typescript
const pushSnapshot = (state: HistorySnapshotState<TData, TPopoverKey>): void =>
```

*JSDoc отсутствует*

---

### `undo`

```typescript
const undo = (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ): HistorySnapshot<TData, TPopoverKey> | null =>
```

*JSDoc отсутствует*

---

### `redo`

```typescript
const redo = (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ): HistorySnapshot<TData, TPopoverKey> | null =>
```

*JSDoc отсутствует*

---

### `undoResult`

```typescript
const undoResult = (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ): Result<HistorySnapshot<TData, TPopoverKey>, HistoryError> =>
```

/**
* Restores the previous state snapshot returning a Result.
* Returns `Err(HistoryError)` if the undo pool is empty.
*/

---

### `redoResult`

```typescript
const redoResult = (
    state: HistorySnapshotState<TData, TPopoverKey>,
  ): Result<HistorySnapshot<TData, TPopoverKey>, HistoryError> =>
```

/**
* Re-applies the next state snapshot returning a Result.
* Returns `Err(HistoryError)` if the redo pool is empty.
*/

---

### `clearHistory`

```typescript
const clearHistory = (): void =>
```

*JSDoc отсутствует*

---

### `getTimeline`

```typescript
const getTimeline = (
    current: HistorySnapshotState<TData, TPopoverKey>,
  ): HistoryTimelineProjection<TData, TPopoverKey> => ({
    past: undoPool.toArray(),
    present: createHistorySnapshot(current),
    future: redoPool.toReversedArray(),
    canUndo: !undoPool.isEmpty,
    canRedo: !redoPool.isEmpty,
  })
```

*JSDoc отсутствует*

---


## 📁 `store/history/historyApply.ts`

### `applyHistorySnapshot`

```typescript
export function applyHistorySnapshot<TData = unknown, TPopoverKey extends string = string>(
  store: { setState?: (patch: unknown) => void } | ((patch: unknown) => void),
  snapshot: HistorySnapshot<TData, TPopoverKey>,
): void
```

/**
* Applies a serialized history state snapshot to a Zustand store or state dispatcher.
*
* @remarks
* Dispatches an atomic patch containing trail hierarchy, floating popovers, drag offsets,
* pinned states, z-index stacking order, and owner identifier.
*
* @template TData - Type of data payload associated with popover entries.
* @template TPopoverKey - Branded or string type of popover key identifiers.
* @param store - Target Zustand store instance with `setState`, or standalone state dispatcher.
* @param snapshot - History snapshot to restore.
*
* @example
* ```typescript
* applyHistorySnapshot(store, previousSnapshot);
* ```
*/

---


## 📁 `store/history/historyHomomorphism.test.ts`

### `applyAction`

```typescript
function applyAction(
    store: ReturnType<typeof createPopoverStore>,
    action: ReversibleAction,
  ): boolean
```

*JSDoc отсутствует*

---

### `assertSnapshotsBitForBitEqual`

```typescript
function assertSnapshotsBitForBitEqual(actual: HistorySnapshot, expected: HistorySnapshot): void
```

*JSDoc отсутствует*

---


## 📁 `store/history/historySnapshotHelpers.ts`

### `cloneNonEmptyRecord`

```typescript
export function cloneNonEmptyRecord<K extends string = string, V = unknown>(
  record?: Readonly<Partial<Record<K, V>>>,
): Readonly<Partial<Record<K, V>>>
```

/**
* Clones a record if non-empty, reusing a frozen empty record singleton otherwise.
*
* @template K - String record key type.
* @template V - Value type.
* @param record - Optional source record to clone.
* @returns Shallow copy or static frozen empty record singleton.
*
* @example
* ```typescript
* const clean = cloneNonEmptyRecord(state.offsets);
* ```
*/

---

### `cloneNonEmptyArray`

```typescript
export function cloneNonEmptyArray<T>(arr?: readonly T[]): readonly T[]
```

/**
* Clones an array if non-empty, reusing a frozen empty array singleton otherwise.
*
* @template T - Element type.
* @param arr - Optional source array to clone.
* @returns Shallow copy or static frozen empty array singleton.
*
* @example
* ```typescript
* const clean = cloneNonEmptyArray(state.zIndexOrder);
* ```
*/

---

### `areKeysEqual`

```typescript
export function areKeysEqual<T>(a: readonly T[], b: readonly T[]): boolean
```

/**
* Compares two arrays of keys for element-wise shallow equality.
*
* @template T - Key type.
* @param a - First key array.
* @param b - Second key array.
* @returns `true` if arrays contain identical items in the same order.
*
* @example
* ```typescript
* const sameOrder = areKeysEqual(['k1', 'k2'], ['k1', 'k2']); // true
* ```
*/

---

### `areOffsetsEqual`

```typescript
export function areOffsetsEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean
```

/**
* Compares two dictionaries of 2D drag offset coordinates for value equality.
*
* @param a - First offset dictionary.
* @param b - Second offset dictionary.
* @returns `true` if all coordinates are identical across both records.
*
* @example
* ```typescript
* const sameOffsets = areOffsetsEqual(snapA.offsets, snapB.offsets);
* ```
*/

---

### `arePinnedStatesEqual`

```typescript
export function arePinnedStatesEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean
```

/**
* Compares two dictionaries of pinned boolean flags for shallow equality.
*
* @param a - First pinned states dictionary.
* @param b - Second pinned states dictionary.
* @returns `true` if both dictionaries have identical pinned keys and boolean values.
*
* @example
* ```typescript
* const samePins = arePinnedStatesEqual(snapA.pinnedStates, snapB.pinnedStates);
* ```
*/

---

### `areEntriesKeyEqual`

```typescript
function areEntriesKeyEqual(
  aList: readonly { readonly key: string }[],
  bList: readonly { readonly key: string }[],
): boolean
```

*JSDoc отсутствует*

---

### `areSnapshotsEqual`

```typescript
export function areSnapshotsEqual<TData, TPopoverKey extends string>(
  a: HistorySnapshot<TData, TPopoverKey>,
  b: HistorySnapshot<TData, TPopoverKey>,
): boolean
```

/**
* Evaluates whether two history state snapshots represent identical UI configurations.
*
* @remarks
* Performs short-circuiting equality checks across:
* 1. Owner ID
* 2. Trail entry key order
* 3. Floating entry key order
* 4. Z-index stacking order
* 5. Spatial drag coordinates
* 6. Pin toggle states
*
* @template TData - Type of data payload associated with popover entries.
* @template TPopoverKey - Branded or string type of popover key identifiers.
* @param a - First snapshot.
* @param b - Second snapshot.
* @returns `true` if snapshots are functionally equivalent; `false` otherwise.
*
* @example
* ```typescript
* if (!areSnapshotsEqual(currentSnapshot, previousSnapshot)) {
*   history.push(currentSnapshot);
* }
* ```
*/

---


## 📁 `store/history/historySnapshotPool.ts`

### `createHistorySnapshot`

```typescript
export function createHistorySnapshot<TData = unknown, TPopoverKey extends string = string>(
  state: HistorySnapshotState<TData, TPopoverKey>,
): HistorySnapshot<TData, TPopoverKey>
```

/**
* Constructs an immutable, normalized history snapshot from raw store slice properties.
*
* @template TData - Type of data payload associated with popover entries.
* @template TPopoverKey - Branded or string type of popover key identifiers.
* @param state - Raw store state slice properties.
* @returns Immutable `HistorySnapshot` structure with frozen defaults.
*
* @example
* ```typescript
* const snap = createHistorySnapshot(getStoreState());
* ```
*/

---


## 📁 `store/hydration/storeHydration.ts`

### `createHydrationManager`

```typescript
export function createHydrationManager()
```

*JSDoc отсутствует*

---

### `getEpoch`

```typescript
const getEpoch = (): number => epoch
```

*JSDoc отсутствует*

---

### `incrementEpoch`

```typescript
const incrementEpoch = (): number =>
```

*JSDoc отсутствует*

---

### `isEpochStale`

```typescript
const isEpochStale = (startedEpoch: number): boolean => startedEpoch !== epoch
```

*JSDoc отсутствует*

---

### `incrementRootCounter`

```typescript
const incrementRootCounter = (): number =>
```

*JSDoc отсутствует*

---

### `isRootStale`

```typescript
const isRootStale = (startedCounter: number): boolean => startedCounter !== rootCounter
```

*JSDoc отсутствует*

---

### `incrementNestedCounter`

```typescript
const incrementNestedCounter = (parentKey: string): number =>
```

*JSDoc отсутствует*

---

### `next`

```typescript
const next = (nestedCounters[parentKey] ?? 0) + 1
```

*JSDoc отсутствует*

---

### `isNestedStale`

```typescript
const isNestedStale = (parentKey: string, startedCounter: number): boolean =>
    (nestedCounters[parentKey] ?? 0) !== startedCounter
```

*JSDoc отсутствует*

---

### `deleteNestedCounter`

```typescript
const deleteNestedCounter = (parentKey: string): void =>
```

*JSDoc отсутствует*

---

### `deleteNestedCounters`

```typescript
const deleteNestedCounters = (parentKeys: readonly string[] | ReadonlySet<string>): void =>
```

*JSDoc отсутствует*

---

### `markAllCountersStale`

```typescript
const markAllCountersStale = (): void =>
```

*JSDoc отсутствует*

---

### `resetHydrationCounters`

```typescript
const resetHydrationCounters = (): void =>
```

*JSDoc отсутствует*

---


## 📁 `store/middleware/storeMiddlewareEngine.ts`

### `isStorePatchObject`

```typescript
function isStorePatchObject<TData, TContext, TPopoverKey extends string>(
  val: unknown,
): val is Partial<PopoverStore<TData, TContext, TPopoverKey>>
```

*JSDoc отсутствует*

---

### `use`

```typescript
public use(middleware: PopoverMiddleware<TData, TContext, TPopoverKey>): () => void
```

/**
* Registers a middleware callback in the execution pipeline.
*
* @param middleware - Pure or patch-returning middleware function.
* @returns Cleanup unsubscriber function.
*/

---

### `clear`

```typescript
public clear(): void
```

/** Clears all registered middleware. */

---

### `dispose`

```typescript
public dispose(): void
```

/** Releases engine resources. */

---

### `apply`

```typescript
public apply(
    initialPatch: Partial<PopoverStore<TData, TContext, TPopoverKey>>,
    currentState: PopoverStore<TData, TContext, TPopoverKey>,
  ): Partial<PopoverStore<TData, TContext, TPopoverKey>> | false
```

/**
* Applies the middleware pipeline to an incoming store state patch.
*
* @remarks
* If any middleware returns `false`, execution halts immediately and the patch is vetoed.
* If a middleware returns a patch object, it is merged into the working patch using Copy-On-Write.
*
* @param initialPatch - Proposed state changes.
* @param currentState - Current immutable store snapshot.
* @returns Sanitized combined patch, or `false` if rejected.
*/

---


## 📁 `store/persistence/broadcastChannelEngine.ts`

### `createBroadcastChannelDriver`

```typescript
export function createBroadcastChannelDriver(
  channelName: string,
  listeners: Set<(message: unknown) => void>,
): CrossTabBroadcaster
```

/**
* Creates a cross-tab broadcaster using the modern BroadcastChannel API.
*/

---

### `messageHandler`

```typescript
const messageHandler = (event: MessageEvent) =>
```

*JSDoc отсутствует*

---

### `dispose`

```typescript
const dispose = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/persistence/crossTabBroadcaster.ts`

### `createCrossTabBroadcaster`

```typescript
export function createCrossTabBroadcaster(channelName = 'popover_trail_sync'): CrossTabBroadcaster
```

/**
* Creates a CrossTabBroadcaster instance using BroadcastChannel or StorageEvent fallback.
*/

---


## 📁 `store/persistence/dagRestoration.ts`

### `insertEntriesIntoDAG`

```typescript
function insertEntriesIntoDAG<TData, TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey> | DAGRestorationTarget<TPopoverKey>,
  entries: readonly TrailEntry<TData, TPopoverKey>[],
  visited: Set<TPopoverKey>,
): void
```

*JSDoc отсутствует*

---

### `restoreDAGFromState`

```typescript
export function restoreDAGFromState<TData, TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey> | DAGRestorationTarget<TPopoverKey> | undefined,
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  floating: readonly TrailEntry<TData, TPopoverKey>[] = [],
): void
```

/**
* Restores Directed Acyclic Graph relationships from persisted trail and floating entries.
*/

---

### `executeWithTransition`

```typescript
export function executeWithTransition(
  action: () => void,
  scheduler?: (callback: () => void) => void,
): void
```

/**
* Executes a state mutation optionally wrapped in a transition scheduler.
*/

---


## 📁 `store/persistence/envelopeCodec.ts`

### `encodePersistedEnvelope`

```typescript
export function encodePersistedEnvelope<TData = unknown, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, unknown, TPopoverKey>,
): PersistedEnvelope<TData, TPopoverKey>
```

/**
* Encodes current popover state into a serializable PersistedEnvelope.
*/

---

### `decodePersistedEnvelope`

```typescript
export function decodePersistedEnvelope<TData = unknown, TPopoverKey extends string = string>(
  raw: unknown,
): Result<PersistedEnvelope<TData, TPopoverKey>, PopoverError>
```

/**
* Safely decodes a raw JSON string into a validated PersistedEnvelope.
*/

---


## 📁 `store/persistence/envelopeGuards.ts`

### `isSafeKey`

```typescript
export function isSafeKey<K extends string = string>(key: unknown): key is K
```

/**
* Validates whether a key string is non-empty and safe against prototype pollution.
*/

---

### `isPersistedEnvelope`

```typescript
export function isPersistedEnvelope(val: unknown): val is PersistedEnvelope
```

/**
* Type guard verifying if value conforms to PersistedEnvelope shape.
*/

---


## 📁 `store/persistence/envelopeParsers.ts`

### `isEntryCandidate`

```typescript
function isEntryCandidate<TData, TPopoverKey extends string>(
  item: unknown,
): item is TrailEntry<TData, TPopoverKey>
```

*JSDoc отсутствует*

---

### `parseEntryList`

```typescript
export function parseEntryList<TData, TPopoverKey extends string>(
  raw: unknown,
): TrailEntry<TData, TPopoverKey>[]
```

/**
* Parses raw trail or floating entry arrays safely discarding prototype-polluted keys.
*/

---

### `parsePinnedStates`

```typescript
export function parsePinnedStates<TPopoverKey extends string>(
  raw: unknown,
): Partial<Record<TPopoverKey, boolean>>
```

/**
* Parses raw pinned states safely skipping prototype-polluted properties.
*/

---

### `parseZIndexOrder`

```typescript
export function parseZIndexOrder<TPopoverKey extends string>(raw: unknown): TPopoverKey[]
```

/**
* Parses raw zIndexOrder arrays safely discarding unsafe strings.
*/

---


## 📁 `store/persistence/safeJson.test.ts`

### `isUserPayload`

```typescript
function isUserPayload(val: unknown): val is UserPayload
```

*JSDoc отсутствует*

---


## 📁 `store/persistence/safeJson.ts`

### `safeJsonStringify`

```typescript
export function safeJsonStringify(value: unknown): string
```

/**
* Serializes arbitrary values into a JSON string, safely guarding against circular references.
*
* @remarks
* Uses a `WeakSet` to track visited objects and omit cycles, preventing `TypeError: Converting circular structure to JSON`.
* Returns `'null'` on unhandled serialization errors or `undefined` inputs.
*
* @example
* ```ts
* const json = safeJsonStringify({ a: 1, nested: { b: 2 } });
* ```
*
* @param value - Value to serialize.
* @returns Safe JSON string representation or `'null'`.
*/

---

### `safeJsonParse`

```typescript
export function safeJsonParse<T = unknown>(
  raw: unknown,
  guard?: (val: unknown) => val is T,
): T | null
```

/**
* Safely parses a JSON string into a typed data structure without throwing exceptions.
*
* @remarks
* Returns `null` on syntax errors, non-string inputs, or empty strings.
* If an optional `guard` predicate is provided, validates that the parsed value conforms to type `T`.
*
* @example
* ```ts
* const user = safeJsonParse(rawString, isUser);
* if (user) {
*   console.log(user.name);
* }
* ```
*
* @template T - Expected output type.
* @param raw - Input string to parse.
* @param guard - Optional runtime type guard validating the parsed output.
* @returns Parsed value of type `T`, or `null` on syntax or validation failure.
*/

---


## 📁 `store/persistence/sanitization.ts`

### `cleanEntry`

```typescript
function cleanEntry<TData, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>
```

*JSDoc отсутствует*

---

### `sanitizePersistedEntries`

```typescript
export function sanitizePersistedEntries<TData, TPopoverKey extends string = string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
): TrailEntry<TData, TPopoverKey>[]
```

/**
* Sanitizes trail entries removing ephemeral callbacks and un-serializable promises.
*/

---

### `sanitizePersistedOffsets`

```typescript
export function sanitizePersistedOffsets<TPopoverKey extends string = string>(
  offsets: unknown,
  allowedKeys?: ReadonlySet<string>,
): Partial<Record<TPopoverKey, DragOffset>>
```

/**
* Sanitizes persisted offsets ensuring finite coordinates and key safety.
*/

---


## 📁 `store/persistence/storageAdapter.ts`

### `createMemoryStorageAdapter`

```typescript
export function createMemoryStorageAdapter(): StorageAdapter
```

/**
* Creates an in-memory Map-backed StorageAdapter for non-browser or testing environments.
*/

---

### `createWebStorageAdapter`

```typescript
function createWebStorageAdapter(storage: Storage | undefined): StorageAdapter
```

*JSDoc отсутствует*

---

### `createLocalStorageAdapter`

```typescript
export function createLocalStorageAdapter(): StorageAdapter
```

/**
* Creates a browser localStorage-backed StorageAdapter with memory fallback.
*/

---

### `createSessionStorageAdapter`

```typescript
export function createSessionStorageAdapter(): StorageAdapter
```

/**
* Creates a browser sessionStorage-backed StorageAdapter with memory fallback.
*/

---


## 📁 `store/persistence/storageFallbackBroadcaster.ts`

### `createStorageFallbackDriver`

```typescript
export function createStorageFallbackDriver(
  channelName: string,
  listeners: Set<(message: unknown) => void>,
): CrossTabBroadcaster
```

/**
* Creates a cross-tab broadcaster fallback using window storage events.
*/

---

### `storageHandler`

```typescript
const storageHandler = (e: StorageEvent) =>
```

*JSDoc отсутствует*

---

### `dispose`

```typescript
const dispose = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/persistence/storageOperations.test.ts`

### `createMockStorage`

```typescript
function createMockStorage(overrides?: Partial<Storage>): Storage
```

*JSDoc отсутствует*

---


## 📁 `store/persistence/storageOperations.ts`

### `resolvePlatformStorage`

```typescript
export function resolvePlatformStorage(type: PlatformStorageType): Storage | null
```

/**
* Resolves window platform storage instance safely returning null if unavailable.
*/

---

### `readStorageItem`

```typescript
export function readStorageItem(
  storage: Storage,
  key: StorageKey | Unbrand<StorageKey>,
): string | null
```

/**
* Reads an item from storage safely. Accepts both branded StorageKey and unbranded raw key string.
*/

---

### `writeStorageItem`

```typescript
export function writeStorageItem(
  storage: Storage,
  key: StorageKey | Unbrand<StorageKey>,
  raw: string,
): boolean
```

/**
* Writes an item to storage safely. Accepts both branded StorageKey and unbranded raw key string.
*/

---

### `removeStorageItem`

```typescript
export function removeStorageItem(storage: Storage, key: StorageKey | Unbrand<StorageKey>): void
```

/**
* Removes an item from storage safely. Accepts both branded StorageKey and unbranded raw key string.
*/

---


## 📁 `store/reducers/close/closeCalculation.ts`

### `getRemovedKeysForClose`

```typescript
export function getRemovedKeysForClose<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  dag?: PopoverDAG<TPopoverKey>,
): RemovedKeysCloseResult<TPopoverKey> | null
```

/**
* Computes the set of popover keys to remove when closing from a target index.
*/

---


## 📁 `store/reducers/close/closeFilter.ts`

### `filterRetainedEntries`

```typescript
export function filterRetainedEntries<TData, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  removedKeys: ReadonlySet<TPopoverKey>,
): readonly TrailEntry<TData, TPopoverKey>[]
```

/**
* Filters out removed keys preserving array reference when no entries are affected.
*/

---

### `omitRemovedRecordKeys`

```typescript
export function omitRemovedRecordKeys<V, K extends string = string>(
  record: Readonly<Partial<Record<K, V>>> | undefined,
  removedKeys: ReadonlySet<K>,
): Readonly<Partial<Record<K, V>>>
```

/**
* Omits removed keys from state records during teardown and close operations.
*/

---


## 📁 `store/reducers/close/closeHierarchy.ts`

### `getDirectClosedKeys`

```typescript
export function getDirectClosedKeys<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  isFloating: boolean,
): TPopoverKey[]
```

/**
* Collects direct keys to close from target index without intermediate array overhead.
*/

---

### `shouldIncludeDescendant`

```typescript
export function shouldIncludeDescendant<TPopoverKey extends string = string>(
  key: TPopoverKey,
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  floatingSet?: ReadonlySet<TPopoverKey>,
): boolean
```

/**
* Evaluates whether a descendant card should be closed according to pinning configuration.
*/

---


## 📁 `store/reducers/close/closeKeys.ts`

### `resolveAllRemovedKeys`

```typescript
export function resolveAllRemovedKeys<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  directClosedKeys: readonly TPopoverKey[],
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  dag?: PopoverDAG<TPopoverKey>,
): Set<TPopoverKey>
```

/**
* Resolves all direct and transitive descendant keys to remove for a close operation.
*/

---


## 📁 `store/reducers/close/closeReducers.ts`

### `closeFromState`

```typescript
export function closeFromState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  index: number,
  dag?: PopoverDAG<TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Computes the state patch when closing popover cards from a specific depth index.
*
* @remarks
* Recursively calculates all keys to remove (including DAG reachable descendants),
* filters retained floating and trail entries, and cleans up associated offsets,
* pinned states, hydration counters, and z-index ordering.
*
* @param state - Current store state snapshot.
* @param index - Unified index of the card to close.
* @param dag - Optional DAG instance to identify hierarchical descendants.
* @returns State patch with pruned entries and cleaned-up metadata.
*/

---

### `closeByTargetKeyState`

```typescript
export function closeByTargetKeyState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  targetKey: TPopoverKey,
  dag?: PopoverDAG<TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Computes the state patch for closing a popover card identified by key.
*
* @remarks
* Finds the unified index of `targetKey` across floating and trail entries,
* then delegates to {@link closeFromState} to remove the card and its cascade descendants.
*
* @param state - Current store state snapshot.
* @param targetKey - Identifier of the popover card to close.
* @param dag - Optional DAG instance to identify hierarchical descendants.
* @returns State patch for the closure, or empty object if key was not found.
*/

---


## 📁 `store/reducers/entry/entryBase.ts`

### `createTrailEntry`

```typescript
export function createTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
  data?: TData | null,
  error: Error | null = null,
  isLoading = false,
): TrailEntry<TData, TPopoverKey>
```

/**
* Constructs a fully initialized TrailEntry object with default properties and geometry.
*/

---


## 📁 `store/reducers/entry/entryGeometry.ts`

### `cloneDOMRect`

```typescript
function cloneDOMRect(rect: DOMRect | PopoverRect): DOMRect
```

*JSDoc отсутствует*

---

### `resolveEntryGeometryMetadata`

```typescript
export function resolveEntryGeometryMetadata<TData = unknown, TPopoverKey extends string = string>(
  rect?: DOMRect | PopoverRect | null,
  parentKey?: TPopoverKey,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): EntryGeometryMetadata<TPopoverKey>
```

/**
* Resolves geometry metadata ensuring pure cloned DOMRect and original parent persistence.
*/

---


## 📁 `store/reducers/entry/entryLifecycle.ts`

### `createInitialTrailEntry`

```typescript
export function createInitialTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  options?: Partial<OpenRootOptions & OpenNestedOptions> & { isLoading?: boolean; rect?: DOMRect },
  _ownerId?: string | null,
  parentKey?: TPopoverKey,
): TrailEntry<TData, TPopoverKey>
```

/**
* Constructs an initial TrailEntry node for newly registered triggers.
*/

---

### `createResolvedTrailEntry`

```typescript
export function createResolvedTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  baseEntry: TrailEntry<TData, TPopoverKey>,
  data?: TData | null,
  error?: Error | null,
  isLoading = false,
): TrailEntry<TData, TPopoverKey>
```

/**
* Transitions an existing TrailEntry to resolved payload or error state.
*/

---


## 📁 `store/reducers/entry/entryNode.ts`

### `createTrailEntryNode`

```typescript
export function createTrailEntryNode<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  options?: EntryFactoryOptions,
): TrailEntry<TData, TPopoverKey>
```

/**
* Normalizes TrailEntry nodes guaranteeing structural sharing and immutability.
*/

---


## 📁 `store/reducers/entry/entryStatus.ts`

### `resolveEntryStatus`

```typescript
export function resolveEntryStatus<TData = unknown, TPopoverKey extends string = string>(
  data?: TData,
  error?: Error | null,
  isLoading = false,
  fallbackStatus: TrailEntry<TData, TPopoverKey>['status'] = 'loading',
): TrailEntry<TData, TPopoverKey>['status']
```

/**
* Resolves entry status based on data, error, and loading flags.
*
* @template TData - Popover payload data type.
* @template TPopoverKey - Union of valid popover keys.
* @param data - Optional resolved data payload.
* @param error - Optional error object or null.
* @param isLoading - Whether the entry is currently loading.
* @param fallbackStatus - Fallback status if flags do not match.
* @returns Resolved TrailEntry status.
*/

---

### `resolveInitialTransitionStatus`

```typescript
export function resolveInitialTransitionStatus(
  existing?: PopoverTransitionStatus,
): PopoverTransitionStatus
```

/**
* Resolves initial transition status, preserving existing unless unmounting.
*
* @param existing - Existing transition status if present.
* @returns Initial transition status ('mounting' or preserved existing).
*/

---


## 📁 `store/reducers/entry/entryVariants.ts`

### `createSuccessEntry`

```typescript
export function createSuccessEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
  data?: TData | null,
): TrailEntry<TData, TPopoverKey>
```

/**
* Constructs a TrailEntry initialized in a successfully resolved data state.
*/

---

### `createLoadingEntry`

```typescript
export function createLoadingEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>
```

/**
* Constructs a TrailEntry initialized in a pending loading state.
*/

---

### `createErrorEntry`

```typescript
export function createErrorEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  error?: Error | null,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>
```

/**
* Constructs a TrailEntry initialized in a failed state with an attached Error.
*/

---

### `createIdleEntry`

```typescript
export function createIdleEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>
```

/**
* Constructs a TrailEntry initialized in an idle state without data or errors.
*/

---


## 📁 `store/reducers/open/nestedPush.ts`

### `computeFloatingNestedPush`

```typescript
function computeFloatingNestedPush<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  finalEntry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>[] | null
```

*JSDoc отсутствует*

---

### `computeTrailNestedPush`

```typescript
function computeTrailNestedPush<TData, TPopoverKey extends string = string>(
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  trailIndex: number,
  finalEntry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>[] | null
```

*JSDoc отсутствует*

---


## 📁 `store/reducers/open/openElevation.ts`

### `findFloatingElevationPatch`

```typescript
export function findFloatingElevationPatch<TData, TContext, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): StatePatch<TData, TContext, TPopoverKey> | null
```

/**
* Checks if target entry is currently floating and returns elevation patch if so.
*/

---


## 📁 `store/reducers/open/openReducers.ts`

### `openRootState`

```typescript
export function openRootState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  ownerId: string,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Computes the state patch for opening a root popover card.
*
* @remarks
* If the card is already pinned in floating mode, elevates it to the front instead of creating a duplicate.
* If opened by the same owner, appends to or replaces in the active trail.
* If opened by a new owner, begins a new active trail branch anchored by this entry.
*
* @param state - Current store state snapshot.
* @param ownerId - Identifier of the trail owner / root trigger.
* @param entry - TrailEntry describing the popover to open.
* @returns State patch containing updated trail, active status, and z-index order.
*/

---

### `pushNestedState`

```typescript
export function pushNestedState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  index: number,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Computes the state patch for pushing a nested child popover card at a cascade depth index.
*
* @remarks
* If the card is already pinned in floating mode, elevates it to the front.
* Truncates any deeper sibling entries beyond `index` and appends the new child entry.
*
* @param state - Current store state snapshot.
* @param index - Unified cascade depth index of the parent card.
* @param entry - TrailEntry describing the child popover to push.
* @returns State patch with updated trail branch, or empty object if invalid index.
*/

---

### `pushNestedByKeyState`

```typescript
export function pushNestedByKeyState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  parentKey: TPopoverKey,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Computes the state patch for pushing a nested child popover under a specific parent key.
*
* @remarks
* Looks up the parent key across both floating and trail cards. If found, pushes the child
* under that parent; otherwise falls back to opening as a root card.
*
* @param state - Current store state snapshot.
* @param parentKey - Identifier of the parent popover.
* @param entry - TrailEntry describing the child popover.
* @returns State patch for the opened popover.
*/

---


## 📁 `store/reducers/pinning/pinCoordinates.ts`

### `resolvePinnedLayoutPos`

```typescript
export function resolvePinnedLayoutPos(
  rect?: DOMRect | PopoverRect | null,
  entry?: {
    readonly pinnedLayoutPos?: PinnedLayoutCoordinates;
    readonly rect?: DOMRect | PopoverRect | null;
  },
): PinnedLayoutCoordinates | undefined
```

/**
* Resolves pinned layout coordinates ensuring finite float numbers.
*/

---


## 📁 `store/reducers/pinning/pinGeometry.ts`

### `toFloatingEntry`

```typescript
export function toFloatingEntry<TData, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  rect?: DOMRect | PopoverRect | null,
): TrailEntry<TData, TPopoverKey>
```

/**
* Transforms an entry into modeless floating card format.
*/

---

### `toTrailEntry`

```typescript
export function toTrailEntry<TData, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>
```

/**
* Reverts a floating entry back to hierarchical cascade trail format.
*/

---


## 📁 `store/reducers/pinning/pinOperations.ts`

### `pinTrailEntry`

```typescript
export function pinTrailEntry<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  trailIndex: number,
  rect?: DOMRect | PopoverRect | null,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Transforms a cascading trail card into a modeless floating pinned card.
*/

---

### `unpinFloatingEntry`

```typescript
export function unpinFloatingEntry<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  floatingIndex: number,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Reverts a floating pinned card back into a cascading trail card.
*/

---


## 📁 `store/reducers/pinning/pinReducers.ts`

### `updateOffsetState`

```typescript
export function updateOffsetState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  offset: DragOffset,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Computes the state patch when updating the drag or docking offset for a popover card.
*
* @remarks
* Validates finite float coordinates to prevent NaN or Infinite coordinate corruptions.
* Checks for value equality (`isDragOffsetEqual`) to return `EMPTY_OBJECT` if unchanged,
* preventing unnecessary store revisions or re-renders.
*
* @param state - Current store state snapshot.
* @param key - Identifier of the dragged popover.
* @param offset - New 2D drag offset coordinates `{ x, y }`.
* @returns State patch with updated `offsets`, or empty object if coordinates are identical/invalid.
*/

---

### `togglePinState`

```typescript
export function togglePinState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Computes the state patch when toggling a popover between floating (pinned) and cascade (trail) modes.
*
* @remarks
* - If the card is currently floating/pinned, transitions it back into the active trail.
* - If the card is currently in the active trail, detaches it into the pinned floating stack.
*
* @param state - Current store state snapshot.
* @param key - Identifier of the popover to toggle.
* @param rect - Optional bounding rectangle captured at the moment of pinning to preserve exact coordinates.
* @returns State patch transitioning the card between floating and trail collections.
*/

---


## 📁 `store/reducers/stack/dagDescendants.ts`

### `enqueueDagChildren`

```typescript
export function enqueueDagChildren<TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey>,
  current: TPopoverKey,
  visited: ReadonlySet<TPopoverKey>,
  queue: { push(item: TPopoverKey): unknown },
): void
```

/**
* Enqueues unvisited child keys from the DAG node into the traversal queue.
*/

---


## 📁 `store/reducers/stack/descendants.ts`

### `getAllDescendants`

```typescript
export function getAllDescendants<TData = unknown, TPopoverKey extends string = string>(
  directClosedKeys: readonly TPopoverKey[],
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  closePinnedDescendants: boolean,
  dag?: PopoverDAG<TPopoverKey>,
): Set<TPopoverKey>
```

/**
* Traverses all reachable descendants for a set of target root keys using BFS.
*/

---


## 📁 `store/reducers/stack/entryEquality.ts`

### `isEntryKey`

```typescript
function isEntryKey<TData, TPopoverKey extends string = string>(
  obj: Partial<TrailEntry<TData, TPopoverKey>>,
  key: string,
): key is keyof TrailEntry<TData, TPopoverKey>
```

*JSDoc отсутствует*

---

### `areEntriesShallowEqual`

```typescript
export function areEntriesShallowEqual<TData, TPopoverKey extends string = string>(
  existing: TrailEntry<TData, TPopoverKey>,
  patch: Partial<TrailEntry<TData, TPopoverKey>>,
): boolean
```

/**
* Checks shallow property equality between an existing entry and partial updates.
*/

---


## 📁 `store/reducers/stack/entryMutation.ts`

### `replaceEntryInList`

```typescript
export function replaceEntryInList<TData, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  nextEntry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>[]
```

/**
* Returns a new array with the element at index replaced by nextEntry.
*/

---


## 📁 `store/reducers/stack/listDescendants.ts`

### `collectChildrenFromList`

```typescript
function collectChildrenFromList<TData, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  current: TPopoverKey,
  closePinnedDescendants: boolean,
  visited: ReadonlySet<TPopoverKey>,
  queue: { push(item: TPopoverKey): unknown },
): void
```

*JSDoc отсутствует*

---

### `enqueueListChildren`

```typescript
export function enqueueListChildren<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  current: TPopoverKey,
  closePinned: boolean,
  visited: ReadonlySet<TPopoverKey>,
  queue: { push(item: TPopoverKey): unknown },
): void
```

/**
* Enqueues unvisited child keys from floating and trail lists into the queue.
*/

---


## 📁 `store/reducers/stack/recordFilter.ts`

### `shouldPreserveRecord`

```typescript
function shouldPreserveRecord<V, K extends string>(
  record: Readonly<Partial<Record<K, V>>>,
  allowedKeys: ReadonlySet<string>,
): boolean
```

*JSDoc отсутствует*

---

### `filterByAllowedKeys`

```typescript
export function filterByAllowedKeys<V, K extends string = string>(
  record: Readonly<Partial<Record<K, V>>> | undefined,
  allowedKeys: ReadonlySet<K>,
): Readonly<Partial<Record<K, V>>>
```

/**
* Pure Record filtering keeping only allowed keys without allocating intermediate objects when possible.
*/

---

### `getActiveKeys`

```typescript
export function getActiveKeys<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
): Set<TPopoverKey>
```

/**
* Extracts set of active popover keys from floating and trail lists without extra arrays.
*/

---


## 📁 `store/reducers/stack/stackActiveState.ts`

### `filterZIndexOrder`

```typescript
function filterZIndexOrder<TPopoverKey extends string = string>(
  order: readonly TPopoverKey[],
  activeKeys: ReadonlySet<TPopoverKey>,
): readonly TPopoverKey[]
```

*JSDoc отсутствует*

---

### `isActive`

```typescript
const isActive = (key: TPopoverKey) => activeKeys.has(key)
```

*JSDoc отсутствует*

---


## 📁 `store/reducers/stack/stackElevation.ts`

### `bringToFrontPatch`

```typescript
export function bringToFrontPatch<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  dag?: PopoverDAG<TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Pure state reducer elevating target popover key and its subtree to front of stacking order.
*/

---


## 📁 `store/reducers/stack/stackLookup.ts`

### `findEntryIndex`

```typescript
export function findEntryIndex<TData = unknown, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
): number
```

/**
* Finds index of a specific popover key in entry list using fast loop.
*
* @example
* ```ts
* const idx = findEntryIndex(trail, 'profileCard');
* ```
*
* @param list - Array of TrailEntry objects.
* @param key - Popover key to search for.
* @returns Index if found, or -1.
*/

---

### `findUnifiedEntryIndex`

```typescript
export function findUnifiedEntryIndex<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
): number
```

/**
* Finds unified continuous index of a key across floating and trail collections.
* Returns -1 if key is not present in either collection.
*
* @example
* ```ts
* const uIdx = findUnifiedEntryIndex(floating, trail, 'nestedCard');
* ```
*
* @param floating - Readonly array of floating pinned entries.
* @param trail - Readonly array of cascading trail entries.
* @param key - Popover key to locate.
* @returns Unified continuous index or -1 if not found.
*/

---

### `filterOutEntry`

```typescript
export function filterOutEntry<TData = unknown, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
): TrailEntry<TData, TPopoverKey>[]
```

/**
* Filters out an entry matching target key without closure allocations.
*
* @example
* ```ts
* const remaining = filterOutEntry(trail, 'closedKey');
* ```
*
* @param list - Source TrailEntry array.
* @param key - Key of the entry to omit.
* @returns New array without target entry, or original list if key was not found.
*/

---

### `elevateKeyInOrder`

```typescript
export function elevateKeyInOrder<TPopoverKey extends string = string>(
  order: readonly TPopoverKey[],
  key: TPopoverKey,
): readonly TPopoverKey[]
```

/**
* Elevates target key to top of z-index ordering without duplicate allocation.
*
* @example
* ```ts
* const order = elevateKeyInOrder(['a', 'b', 'c'], 'a');
* // => ['b', 'c', 'a']
* ```
*
* @param order - Readonly array of popover keys in stacking order.
* @param key - Popover key to elevate to top.
* @returns New array with key positioned last, or original array if already last.
*/

---


## 📁 `store/reducers/stack/stackReducers.ts`

### `updateEntryInLists`

```typescript
export function updateEntryInLists<TData, TContext = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
  updatedEntry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Updates a single entry in floating or trail lists using an updated entry object.
*/

---

### `patchEntryInLists`

```typescript
export function patchEntryInLists<TData, TContext = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
  update: (entry: TrailEntry<TData, TPopoverKey>) => TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Builds a minimal structural-sharing patch transforming the entry identified by key through updater.
*/

---


## 📁 `store/reducers/stack/stackZIndex.ts`

### `getNextZIndexOrder`

```typescript
export function getNextZIndexOrder<TPopoverKey extends string = string>(
  currentOrder: readonly TPopoverKey[],
  activeKeys: ReadonlySet<TPopoverKey>,
  activeKey: TPopoverKey,
): readonly TPopoverKey[]
```

/**
* Computes next z-index ordering placing the active key at the top.
*/

---


## 📁 `store/resolver/executionDedupe.test.ts`

### `makeDeps`

```typescript
const makeDeps = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/executionErrors.test.ts`

### `makeEntry`

```typescript
const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: true, error: null }) as TrailEntry<unknown, string>
```

*JSDoc отсутствует*

---

### `makeDeps`

```typescript
const makeDeps = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/executionSuccess.test.ts`

### `makeEntry`

```typescript
const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: false, error: null }) as TrailEntry<unknown, string>
```

*JSDoc отсутствует*

---

### `makeDeps`

```typescript
const makeDeps = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/inFlightLauncher.ts`

### `handleLaunchError`

```typescript
function handleLaunchError<TData, TContext, TPopoverKey extends string>(
  error: unknown,
  key: TPopoverKey,
  controllerKey: string,
  controller: AbortController,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
): ResolverLaunchResult<TData>
```

*JSDoc отсутствует*

---

### `cleanup`

```typescript
const cleanup = () => removeController(controllerKey, controller)
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/inFlightResolution.test.ts`

### `makeEntry`

```typescript
const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: true, error: null }) as TrailEntry<unknown, string>
```

*JSDoc отсутствует*

---

### `makeDeps`

```typescript
const makeDeps = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/inFlightRunner.ts`

### `trackInFlight`

```typescript
export function trackInFlight<TData, TPopoverKey extends string = string>(
  inFlightPromises: Map<TPopoverKey | string, Promise<TData>>,
  key: TPopoverKey | string,
  task: () => Promise<TData>,
): Promise<TData>
```

/**
* Runs an async task while maintaining in-flight map registration with identity-guarded removal.
* Prevents late-settling asynchronous operations from evicting newly initiated in-flight promises.
*
* @template TData - Resolved data type returned by the promise.
* @template TPopoverKey - Key identifying the asynchronous operation.
* @param inFlightPromises - Map storing active in-flight promises.
* @param key - Popover key under execution.
* @param task - Async task factory function.
* @returns Tracked Promise resolving to task output.
*
* @example
* ```typescript
* const promise = trackInFlight(inFlightMap, 'card-1', async () => {
*   return await fetchData();
* });
* ```
*/

---


## 📁 `store/resolver/pipelineCache.test.ts`

### `makeEntry`

```typescript
const makeEntry = (key: string, data?: unknown): TrailEntry<unknown, string> =>
    ({
      key,
      isLoading: false,
      error: null,
      ...(data !== undefined ? { data, status: 'success' as const } : {}),
    }) as TrailEntry<unknown, string>
```

*JSDoc отсутствует*

---

### `makeCache`

```typescript
const makeCache = (data?: unknown): PopoverCache<unknown> => ({
    get: vi.fn(() => data),
    set: vi.fn(),
    has: vi.fn(() => data !== undefined),
    delete: vi.fn(),
    clear: vi.fn(),
  })
```

*JSDoc отсутствует*

---

### `makeArgs`

```typescript
const makeArgs = (overrides: Record<string, unknown> = {}) =>
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/pipelineCache.ts`

### `readSyncCache`

```typescript
export function readSyncCache<TData>(
  activeCache: PopoverCache<TData> | undefined,
  key: string,
): TData | undefined
```

/**
* Reads synchronous cached data, ignoring promises or retrieval errors.
*
* @template TData - Cached data payload type.
* @param activeCache - Cache instance (safely handles undefined).
* @param key - Popover key to look up.
* @returns Cached data value or `undefined` if missing or pending Promise.
*
* @example
* ```typescript
* const data = readSyncCache(cache, 'card-1');
* ```
*/

---

### `commitSuccessPayload`

```typescript
function commitSuccessPayload<TData, TContext, TPopoverKey extends string>(
  data: TData,
  args: CacheResolutionAttemptArgs<TData, TContext, TPopoverKey>,
  startTime?: number,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/pipelineMiddleware.ts`

### `assertNotAborted`

```typescript
function assertNotAborted(signal: AbortSignal, message: string, cause?: unknown): void
```

*JSDoc отсутствует*

---

### `withL1Cache`

```typescript
export function withL1Cache<TData, TContext = unknown, TPopoverKey extends string = string>(
  cacheManager: ResolverCacheManager<TData, TPopoverKey>,
): ResolverMiddleware<TData, TContext, TPopoverKey>
```

/**
* Middleware: L1 Synchronous Cache lookup and write-through interceptor.
*
* Checks `cacheManager.readSync(key)` before invoking `next()`. If cached, returns immediately without running `next()`.
* Upon successful `next()` completion, commits the data to cache via `cacheManager.writeSync(key, data)`.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param cacheManager - Cache manager to read from and write to.
* @returns Resolver middleware function.
*
* @example
* ```typescript
* const middleware = withL1Cache(cacheManager);
* ```
*/

---

### `withAbortSignal`

```typescript
export function withAbortSignal<TData, TContext = unknown, TPopoverKey extends string = string>(
  errorCause?: unknown,
): ResolverMiddleware<TData, TContext, TPopoverKey>
```

/**
* Middleware: AbortSignal validation before and after resolution dispatch.
*
* Throws an `AbortError` if `params.signal` is already aborted before execution or becomes aborted during resolution.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param errorCause - Optional error cause to attach to the AbortError.
* @returns Resolver middleware function.
*
* @example
* ```typescript
* const middleware = withAbortSignal();
* ```
*/

---


## 📁 `store/resolver/prefetchPipeline.test.ts`

### `createMockStore`

```typescript
const createMockStore = (stateOverrides: Partial<StoreState<unknown, unknown, string>> = {}) =>
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/prefetchPipeline.ts`

### `getPrefetchContext`

```typescript
function getPrefetchContext<TData, TContext>(
  options: PrefetchOptions<TData, TContext> | undefined,
  storeContext: TContext | null | undefined,
)
```

*JSDoc отсутствует*

---

### `prefetchData`

```typescript
export async function prefetchData<TData, TContext, TPopoverKey extends string = string>(
  store: StoreApi<StoreState<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  options?: PrefetchOptions<TData, TContext>,
): Promise<TData | undefined>
```

/**
* Prefetches data for a popover key in the background without modifying the active trail or stack.
*
* Executes the resolver with an isolated `AbortController` signal and silently returns the fetched data
* or `undefined` on error.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param store - Target Zustand store instance.
* @param key - Popover key to prefetch.
* @param options - Context and parentData parameters for resolution.
* @returns Promise resolving to prefetched data or `undefined`.
*
* @example
* ```typescript
* const data = await prefetchData(store, 'preview-card', {
*   parentData: rootItem,
* });
* ```
*/

---

### `retryResolution`

```typescript
export async function retryResolution<TData, TContext, TPopoverKey extends string = string>(
  store: StoreApi<StoreState<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  _entry?: TrailEntry<TData, TPopoverKey>,
): Promise<void>
```

/**
* Retries failed data resolution for a popover entry in the store.
*
* Invokes the store's `retryPopover` action to restart the resolution lifecycle.
*
* @template TData - Resolved data type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param store - Popover Zustand store instance.
* @param key - Popover key to retry.
* @param _entry - Optional reference to the current entry.
*
* @example
* ```typescript
* await retryResolution(store, 'failed-card');
* ```
*/

---


## 📁 `store/resolver/resolvePopoverHelpers.ts`

### `insertLoadingEntry`

```typescript
export function insertLoadingEntry<TData, TContext, TPopoverKey extends string>(
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  safeSet: ResolverPipelineDependencies<TData, TContext, TPopoverKey>['safeSet'],
  existing?: TrailEntry<TData, TPopoverKey>,
): void
```

/**
* Inserts an initial loading placeholder entry into the store.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param params - Popover resolution parameters.
* @param safeSet - Store state mutation dispatcher.
* @param existing - Optional existing entry if refreshing.
*
* @example
* ```typescript
* insertLoadingEntry(params, safeSet, existingEntry);
* ```
*/

---

### `getExecutionEnvironment`

```typescript
export function getExecutionEnvironment<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
):
```

/**
* Extracts the effective active resolver and context from store state and dependencies.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param state - Current store state.
* @param deps - Pipeline dependencies.
* @returns Tuple containing active resolver function and current context.
*/

---

### `createEntryBuilder`

```typescript
export function createEntryBuilder<TData, TContext, TPopoverKey extends string>(
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  existing?: TrailEntry<TData, TPopoverKey>,
)
```

/**
* Creates a memoized entry builder for the given resolution parameters.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param params - Popover resolution parameters.
* @param existing - Optional existing entry for property preservation.
* @returns Factory function producing fresh `TrailEntry` instances.
*
* @example
* ```typescript
* const buildEntry = createEntryBuilder(params, existing);
* const resolved = buildEntry(data, null, false);
* ```
*/

---

### `tryResolveCacheOrSync`

```typescript
export function tryResolveCacheOrSync<TData, TContext, TPopoverKey extends string>(
  ctx: ResolutionExecutionContext<TData, TContext, TPopoverKey>,
): boolean
```

/**
* Attempts to resolve popover data synchronously from L1 cache, pre-existing state, or sync resolver.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param ctx - Complete execution context object.
* @returns True if resolution completed synchronously, false if deferred to asynchronous resolution.
*
* @example
* ```typescript
* const resolvedSync = tryResolveCacheOrSync(executionContext);
* ```
*/

---


## 📁 `store/resolver/resolverArity.ts`

### `assertResolverFunction`

```typescript
function assertResolverFunction(resolver: unknown): asserts resolver is Function
```

*JSDoc отсутствует*

---

### `isDestructuringMismatch`

```typescript
function isDestructuringMismatch(err: unknown): boolean
```

*JSDoc отсутствует*

---

### `isObjectResolver`

```typescript
function isObjectResolver<TData, TContext>(
  _resolver: AnyResolverFn<TData, TContext>,
  style: 'positional' | 'object',
): _resolver is ObjectResolver<TData, TContext>
```

*JSDoc отсутствует*

---

### `invokeByConvention`

```typescript
function invokeByConvention<TData, TContext>(
  resolver: AnyResolverFn<TData, TContext>,
  key: string,
  parentData: Maybe<TData>,
  context: TContext | undefined,
  signal: AbortSignal,
  style: 'positional' | 'object',
): MaybePromise<TData>
```

*JSDoc отсутствует*

---

### `invokeResolver`

```typescript
export function invokeResolver<TData, TContext>(
  resolver: AnyResolverFn<TData, TContext>,
  key: string,
  parentData: Maybe<TData>,
  context: TContext | undefined,
  signal: AbortSignal,
): MaybePromise<TData>
```

/**
* Safely invokes a resolver callback with automatic arity and signature convention detection.
*
* Supports both traditional positional parameter signatures `(key, parentData, context, signal)`
* and modern object destructuring signatures `({ key, parentData, context, signal })`.
* Dynamically detects the preferred calling convention on first run and caches it in a `WeakMap` for subsequent calls.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @param resolver - Resolver callback function to invoke.
* @param key - Popover key identifier.
* @param parentData - Optional data payload of the parent popover.
* @param context - Ambient application or store context.
* @param signal - AbortSignal for network or lifecycle cancellation.
* @returns Resolved data or Promise of data.
*
* @example
* ```typescript
* const data = await invokeResolver(
*   resolver,
*   'user-1',
*   null,
*   ctx,
*   abortController.signal,
* );
* ```
*/

---

### `invoke`

```typescript
const invoke = (s: 'positional' | 'object') =>
    invokeByConvention(resolver, key, parentData, context, signal, s)
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/ResolverCacheManager.test.ts`

### `getDescendants`

```typescript
const getDescendants = (key: string) => (key === 'root' ? ['child1', 'child2'] : [])
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/ResolverCacheManager.ts`

### `invokeCacheMethod`

```typescript
function invokeCacheMethod(cache: unknown, method: string, arg: unknown): void
```

*JSDoc отсутствует*

---

### `readSync`

```typescript
public readSync(key: TPopoverKey): TData | undefined
```

/**
* Reads data synchronously from the L1 cache if present and non-promise.
*
* @param key - Popover key to look up.
* @returns Cached value or `undefined`.
*
* @example
* ```typescript
* const item = cacheManager.readSync('profile');
* ```
*/

---

### `writeSync`

```typescript
public writeSync(key: TPopoverKey, data: TData): void
```

/**
* Writes data synchronously into the L1 cache.
* Silently ignores Promise values to preserve synchronous cache invariants.
*
* @param key - Popover key.
* @param data - Resolved data value.
*
* @example
* ```typescript
* cacheManager.writeSync('profile', profileData);
* ```
*/

---

### `invalidate`

```typescript
public invalidate(key?: TPopoverKey): void
```

/**
* Invalidates a single entry by key, or clears the entire cache if no key is provided.
*
* @param key - Optional key to invalidate.
*
* @example
* ```typescript
* cacheManager.invalidate('user-profile');
* cacheManager.invalidate(); // clears all
* ```
*/

---

### `invalidatePrefix`

```typescript
public invalidatePrefix(prefix: string): void
```

/**
* Invalidates all cache entries whose keys begin with the specified prefix.
*
* @param prefix - Key prefix to invalidate.
*
* @example
* ```typescript
* cacheManager.invalidatePrefix('user-');
* ```
*/

---

### `invalidatePattern`

```typescript
public invalidatePattern(regex: RegExp): void
```

/**
* Invalidates all cache entries matching the specified regular expression.
*
* @param regex - Pattern to test keys against.
*
* @example
* ```typescript
* cacheManager.invalidatePattern(/^order-\d+$/);
* ```
*/

---

### `invalidateTags`

```typescript
public invalidateTags(tags: string | readonly string[]): void
```

/**
* Invalidates all cache entries associated with one or more tags.
*
* @param tags - Single tag or array of tags.
*
* @example
* ```typescript
* cacheManager.invalidateTags(['user', 'billing']);
* ```
*/

---

### `invalidateBranch`

```typescript
public invalidateBranch(
    parentKey: TPopoverKey,
    getDescendants?: (key: TPopoverKey) => Iterable<TPopoverKey>,
  ): void
```

/**
* Invalidates a parent entry and all of its topological descendants in the trail DAG.
*
* @param parentKey - Root key of the branch to invalidate.
* @param getDescendants - Function returning an iterable of descendant keys.
*
* @example
* ```typescript
* cacheManager.invalidateBranch('menu', (key) => dag.getDescendants(key));
* ```
*/

---

### `clear`

```typescript
public clear(): void
```

/**
* Clears the entire cache.
*/

---


## 📁 `store/resolver/resolverErrorHandling.test.ts`

### `makeEntry`

```typescript
const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: true, error: null }) as TrailEntry<unknown, string>
```

*JSDoc отсутствует*

---

### `makeDeps`

```typescript
const makeDeps = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/resolverResultHandler.ts`

### `saveToCache`

```typescript
const saveToCache = <TData>(
  cache: PopoverCache<TData> | null | undefined,
  key: string,
  data: TData,
): void =>
```

*JSDoc отсутствует*

---

### `resolveErrorEntry`

```typescript
const resolveErrorEntry = <TData, TPopoverKey extends string>(
  key: TPopoverKey,
  current: TrailEntry<TData, TPopoverKey> | undefined,
  error: Error,
  explicitEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> =>
  explicitEntry ??
  (current
    ? createResolvedTrailEntry(current, undefined, error, false)
    : createErrorEntry(key, undefined, null, undefined, error))
```

*JSDoc отсутствует*

---

### `handleResolverSuccess`

```typescript
export function handleResolverSuccess<TData, TContext, TPopoverKey extends string>(
  data: TData,
  key: TPopoverKey,
  successEntry: TrailEntry<TData, TPopoverKey>,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  storeCache?: PopoverCache<TData> | null,
  startTime?: number,
  source: 'sync' | 'async' | 'deduped' = 'async',
): void
```

/**
* Handles successful data resolution, updates caches, dispatches lifecycle events, records telemetry, and commits state.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param data - Resolved data value.
* @param key - Popover key identifier.
* @param successEntry - Popover entry configured with resolved data.
* @param params - Resolution parameters.
* @param deps - Pipeline dependencies.
* @param storeCache - Optional store-level cache instance.
* @param startTime - Optional timestamp in ms when resolution began.
* @param source - Resolution source ('sync' | 'async' | 'deduped').
*
* @example
* ```typescript
* handleResolverSuccess(data, 'card-1', entry, params, deps, storeCache, startTime, 'async');
* ```
*/

---

### `handleResolverError`

```typescript
export function handleResolverError<TData, TContext, TPopoverKey extends string>(
  objErr: unknown,
  key: TPopoverKey,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  errorEntry?: TrailEntry<TData, TPopoverKey>,
  startTime?: number,
): void
```

/**
* Handles resolution errors, invokes custom onError callbacks, dispatches error telemetry, and commits error state.
* Silently ignores `AbortError` instances caused by cancellation.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param objErr - Caught error or exception.
* @param key - Popover key identifier.
* @param deps - Pipeline dependencies.
* @param params - Optional resolution parameters.
* @param errorEntry - Optional pre-constructed error entry.
* @param startTime - Optional timestamp when resolution began.
*
* @example
* ```typescript
* handleResolverError(err, 'card-1', deps, params);
* ```
*/

---


## 📁 `store/resolver/resolverSettlement.ts`

### `hasEntryInLists`

```typescript
function hasEntryInLists<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): boolean
```

*JSDoc отсутствует*

---

### `resolveSettledEntry`

```typescript
function resolveSettledEntry<TData, TPopoverKey extends string>(
  existing: TrailEntry<TData, TPopoverKey>,
  target: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>
```

*JSDoc отсутствует*

---

### `resolveStatePatch`

```typescript
function resolveStatePatch<TData, TContext, TPopoverKey extends string>(
  patch: StatePatchUpdater<TData, TContext, TPopoverKey>,
  state: StoreState<TData, TContext, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---

### `commitResolverSettlement`

```typescript
export function commitResolverSettlement<TData, TContext, TPopoverKey extends string>(
  state: StoreState<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  targetEntry: TrailEntry<TData, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey>
```

/**
* Commits a settled popover entry (resolved data or error) into active floating/trail lists or root state patch.
*
* Checks whether the key already exists in active popover lists. If active, updates the existing entry in place
* while preserving layout and pin states. Otherwise, generates a state patch via `params.insertStatePatch`.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @template TPopoverKey - Popover key identifier type.
* @param state - Current store state snapshot.
* @param key - Popover key identifier.
* @param targetEntry - Settled TrailEntry instance with resolved data or error.
* @param params - Optional resolution parameters containing insertion patch factory.
* @returns StatePatch updating the store.
*
* @example
* ```typescript
* const patch = commitResolverSettlement(state, 'card-1', resolvedEntry, params);
* ```
*/

---


## 📁 `store/resolver/resolverTelemetry.ts`

### `getPerformanceTimestamp`

```typescript
export function getPerformanceTimestamp(): number
```

/**
* Returns a high-resolution timestamp in milliseconds.
* Falls back to `Date.now()` if `performance.now()` is unavailable.
*
* @returns Timestamp in milliseconds.
*
* @example
* ```typescript
* const start = getPerformanceTimestamp();
* // ... do work ...
* const elapsed = getPerformanceTimestamp() - start;
* ```
*/

---


## 📁 `store/resolver/resolverTelemetryLog.test.ts`

### `createMetric`

```typescript
const createMetric = (key: string, durationMs: number, success = true): ResolutionMetric => ({
    key,
    source: 'async',
    durationMs,
    timestamp: Date.now(),
    success,
  })
```

*JSDoc отсутствует*

---


## 📁 `store/resolver/syncResolution.test.ts`

### `makeEntry`

```typescript
const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: true, error: null }) as TrailEntry<unknown, string>
```

*JSDoc отсутствует*

---

### `makeDeps`

```typescript
const makeDeps = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/scheduler/transitionSchedulerHelpers.ts`

### `cancelKeyTransitions`

```typescript
export function cancelKeyTransitions(
  hover: KeyedTimerPool<string>,
  exit: KeyedTimerPool<string>,
  key: string,
): void
```

*JSDoc отсутствует*

---

### `cancelMultipleKeyTransitions`

```typescript
export function cancelMultipleKeyTransitions(
  hover: KeyedTimerPool<string>,
  exit: KeyedTimerPool<string>,
  keys: Iterable<string>,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/selectors/storeEntrySelectors.ts`

### `selectRootEntry`

```typescript
export function selectRootEntry<TData = unknown, TPopoverKey extends string = string>(state: {
  trail: readonly TrailEntry<TData, TPopoverKey>[];
}): TrailEntry<TData, TPopoverKey> | undefined
```

*JSDoc отсутствует*

---

### `selectParentKey`

```typescript
export function selectParentKey<TPopoverKey extends string = string>(key: string)
```

*JSDoc отсутствует*

---

### `selectOffset`

```typescript
export function selectOffset<TPopoverKey extends string = string>(key: TPopoverKey)
```

*JSDoc отсутствует*

---

### `selectIsPinned`

```typescript
export function selectIsPinned<TPopoverKey extends string = string>(key: TPopoverKey)
```

*JSDoc отсутствует*

---

### `selectZIndexOrder`

```typescript
export function selectZIndexOrder<TPopoverKey extends string = string>(
  state: HasZIndexState<TPopoverKey>,
): readonly TPopoverKey[]
```

*JSDoc отсутствует*

---

### `selectTopmostEntry`

```typescript
export function selectTopmostEntry<TData = unknown, TPopoverKey extends string = string>(
  state: HasActiveEntriesState<TData, TPopoverKey> & HasZIndexState<TPopoverKey>,
): TrailEntry<TData, TPopoverKey> | undefined
```

*JSDoc отсутствует*

---

### `selectDiscriminatedStatus`

```typescript
export function selectDiscriminatedStatus<TData = unknown, TPopoverKey extends string = string>(
  state: HasStatusState<TData, TPopoverKey>,
): 'idle' | 'active-trail' | 'pinned-only'
```

*JSDoc отсутствует*

---


## 📁 `store/selectors/storeHierarchySelectors.ts`

### `collectChildrenKeys`

```typescript
export function collectChildrenKeys<TPopoverKey extends string = string, TData = unknown>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): readonly TPopoverKey[]
```

/**
* Traverses floating and trail popovers to collect all child keys directly opened by `key`.
*
* @param floating - Readonly array of floating/pinned entries.
* @param trail - Readonly array of active cascading trail entries.
* @param key - Identifier of the parent popover.
* @returns Readonly array of direct child popover keys, or an empty frozen array.
*/

---

### `isChild`

```typescript
const isChild = (e: TrailEntry<TData, TPopoverKey>): boolean =>
    e.parentKey === key || e.originalParentKey === key
```

*JSDoc отсутствует*

---

### `buildEntryIndex`

```typescript
export function buildEntryIndex<TData, TPopoverKey extends string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
): Map<string, TrailEntry<TData, TPopoverKey>>
```

/**
* Builds a fast Map index pairing keys with their corresponding `TrailEntry`.
*
* @param floating - Readonly array of floating/pinned entries.
* @param trail - Readonly array of active cascading trail entries.
* @returns Map index for O(1) entry lookup.
*/

---

### `buildBreadcrumbPath`

```typescript
export function buildBreadcrumbPath<TPopoverKey extends string = string, TData = unknown>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): readonly TPopoverKey[]
```

/**
* Backtracks via parent pointers to construct the breadcrumb trail path from root to the target popover.
*
* @param floating - Readonly array of floating/pinned entries.
* @param trail - Readonly array of active cascading trail entries.
* @param key - Target popover key.
* @returns Array of keys in root-to-target order.
*/

---

### `selectPopoverDepth`

```typescript
export function selectPopoverDepth<TPopoverKey extends string = string, TData = unknown>(
  key: string,
)
```

/**
* Higher-order selector calculating the integer nesting depth of a popover (0 = root).
*
* @param key - Target popover key.
* @returns Selector mapping state to integer depth.
*/

---

### `collectBranchMatches`

```typescript
function collectBranchMatches<TPopoverKey extends string = string, TData = unknown>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  keys: ReadonlySet<string>,
): readonly TrailEntry<TData, TPopoverKey>[]
```

*JSDoc отсутствует*

---

### `selectTrailBranch`

```typescript
export function selectTrailBranch<TPopoverKey extends string = string, TData = unknown>(
  key: string,
)
```

/**
* Higher-order selector returning all active entries along the branch (ancestor path + direct children).
*
* @param key - Focus popover key.
* @returns Selector mapping state to array of TrailEntry items.
*/

---


## 📁 `store/selectors/storeSelectors.ts`

### `selectActiveTrail`

```typescript
export const selectActiveTrail = <TData = unknown, TPopoverKey extends string = string>(state: {
  trail: readonly TrailEntry<TData, TPopoverKey>[];
}): readonly TrailEntry<TData, TPopoverKey>[] => state.trail
```

*JSDoc отсутствует*

---

### `selectTotalActiveCount`

```typescript
export const selectTotalActiveCount = (state: {
  trail: readonly unknown[];
  floating: readonly unknown[];
}): number => state.trail.length + state.floating.length
```

*JSDoc отсутствует*

---

### `selectIsIdle`

```typescript
export const selectIsIdle = (state: {
  trail: readonly unknown[];
  floating: readonly unknown[];
}): boolean => state.trail.length === 0 && state.floating.length === 0
```

*JSDoc отсутствует*

---

### `selectAllOffsets`

```typescript
export const selectAllOffsets = (state: {
  offsets: Record<string, DragOffset>;
}): Record<string, DragOffset> => state.offsets
```

*JSDoc отсутствует*

---


## 📁 `store/slices/config/config.test.ts`

### `createHarness`

```typescript
const createHarness = () =>
    createSliceTestHarness(createConfigSlice, {
      ownerId: 'initial-owner',
      baseZIndex: 1000,
      exitTransitionDuration: 200,
      mobileBreakpoint: 768,
      responsiveMode: 'auto',
      closePinnedDescendants: true,
      enableArrowNavigation: true,
    })
```

*JSDoc отсутствует*

---


## 📁 `store/slices/config/controls.test.ts`

### `createHarness`

```typescript
const createHarness = () =>
    createSliceTestHarness<
      ControlsSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(createControlsSlice, {
      floating: [],
      trail: [
        {
          key: 'c1',
          isLoading: false,
          error: null,
          buttonControls: { enableClose: true, enablePin: true },
        },
      ],
    })
```

*JSDoc отсутствует*

---


## 📁 `store/slices/config/controls.ts`

### `patchControls`

```typescript
const patchControls = (
    key: TPopoverKey,
    updater: (prev?: ButtonControlConfig) => ButtonControlConfig,
  ) =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/config/hover.test.ts`

### `createHarness`

```typescript
const createHarness = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/config/hover.ts`

### `performClose`

```typescript
const performClose = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/config/lifecycle.test.ts`

### `createHarness`

```typescript
const createHarness = () =>
    createSliceTestHarness<TestActions, unknown, unknown, string>(createLifecycleSlice, {
      floating: [],
      trail: [{ key: 'card-1', isLoading: false, error: null, transitionStatus: 'mounted' }],
    })
```

*JSDoc отсутствует*

---


## 📁 `store/slices/persistence/createPersistenceSlice.ts`

### `createPersistenceSlice`

```typescript
export function createPersistenceSlice<TData, TContext, TPopoverKey extends string = string>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
): Pick<
  PopoverActions<TData, TContext, TPopoverKey>,
  'persistState' | 'rehydrateState' | 'destroy'
>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/persistence/destroy.ts`

### `clearStoreCaches`

```typescript
function clearStoreCaches<TData>(
  depsCache?: PopoverCache<TData> | null,
  storeCache?: PopoverCache<TData> | null,
): void
```

*JSDoc отсутствует*

---

### `abortActiveControllers`

```typescript
function abortActiveControllers(activeControllers: Map<string, AbortController>): void
```

*JSDoc отсутствует*

---

### `destroyStoreResources`

```typescript
export function destroyStoreResources<TData, TContext, TPopoverKey extends string>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
): void
```

/**
* Tears down all store resources, controllers, caches, and listeners.
*/

---


## 📁 `store/slices/persistence/persistence.test.ts`

### `createMockStorage`

```typescript
const createMockStorage = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/persistence/persistenceProperties.test.ts`

### `createMockStorage`

```typescript
const createMockStorage = (initial?: string): StateStorageEngine =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/persistence/persistPayload.ts`

### `buildCleanPinned`

```typescript
function buildCleanPinned<TPopoverKey extends string>(
  keys: ReadonlySet<TPopoverKey>,
  pinnedStates: Partial<Record<TPopoverKey, boolean>>,
): Partial<Record<TPopoverKey, boolean>>
```

*JSDoc отсутствует*

---

### `buildPersistPayload`

```typescript
export function buildPersistPayload<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  tabId: string,
  config?: PopoverPersistConfig,
): PersistedSnapshotPayload<TData, TPopoverKey>
```

/**
* Builds a sanitized, filtered snapshot payload for persistence.
*/

---


## 📁 `store/slices/persistence/rehydration.test.ts`

### `createMockStorage`

```typescript
const createMockStorage = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/persistence/rehydrationApplier.ts`

### `buildCleanOffsets`

```typescript
function buildCleanOffsets<TPopoverKey extends string>(
  rawOffsets: unknown,
  activeKeys: ReadonlySet<TPopoverKey>,
): Partial<Record<TPopoverKey, DragOffset>>
```

*JSDoc отсутствует*

---

### `buildCleanPinnedStates`

```typescript
function buildCleanPinnedStates<TPopoverKey extends string>(
  rawPinned: unknown,
  activeKeys: ReadonlySet<TPopoverKey>,
): Partial<Record<TPopoverKey, boolean>>
```

*JSDoc отсутствует*

---

### `buildCleanZIndexOrder`

```typescript
function buildCleanZIndexOrder<TPopoverKey extends string>(
  rawOrder: unknown,
  activeKeys: ReadonlySet<TPopoverKey>,
): TPopoverKey[]
```

*JSDoc отсутствует*

---

### `applyRehydratedState`

```typescript
export function applyRehydratedState<TData, TContext, TPopoverKey extends string>(
  parsed: Record<string, unknown>,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
  dag?: { clear: () => void; addNode: (key: TPopoverKey, parentKey?: TPopoverKey) => void },
): boolean
```

/**
* Applies parsed state payload to store and restores topological DAG relationships.
*/

---


## 📁 `store/slices/persistence/rehydrationParser.ts`

### `isRehydratableFloatingItem`

```typescript
export function isRehydratableFloatingItem<TPopoverKey extends string = string>(
  item: unknown,
): item is SerializedFloatingItem<TPopoverKey>
```

/**
* Validates whether an unknown item is a safe, rehydratable dictionary with a non-empty key.
*
* @param item - Candidate value from persistent storage payload.
* @returns True if candidate is safe object with non-empty, non-polluting key.
*/

---

### `toMountedFloatingEntry`

```typescript
export function toMountedFloatingEntry<TData, TPopoverKey extends string>(
  item: SerializedFloatingItem<TPopoverKey>,
): TrailEntry<TData, TPopoverKey>
```

/**
* Converts a sanitized persistent storage record into an active mounted TrailEntry.
* Strips volatile closures and promises while restoring canonical default state.
*
* @param item - Sanitized storage entry record.
* @returns Fully populated TrailEntry initialized in mounted success state.
*/

---

### `parseFloating`

```typescript
export function parseFloating<TData, TPopoverKey extends string>(
  raw: unknown,
): readonly TrailEntry<TData, TPopoverKey>[]
```

/**
* Parses, sanitizes, and reconstitutes floating entries from raw JSON object payload.
* Applies prototype pollution protection and strips obsolete runtime handles.
*
* @param raw - Candidate serialized entries array from persistent storage.
* @returns Array of valid, mounted TrailEntry objects or EMPTY_ARRAY singleton.
*/

---


## 📁 `store/slices/persistence/storageEngineResolver.ts`

### `resolveStorageEngine`

```typescript
export function resolveStorageEngine(config?: PopoverPersistConfig): ResolvedStorageEngine
```

/**
* Resolves storage key and target storage engine from configuration.
*/

---


## 📁 `store/slices/pinning/pinning.test.ts`

### `createHarness`

```typescript
const createHarness = () =>
    createSliceTestHarness(createPinningSlice, {
      floating: [],
      trail: [
        { key: 'p1', isLoading: false, error: null },
        { key: 'p2', isLoading: false, error: null },
      ],
      offsets: {},
      pinnedStates: { p2: true },
      zIndexOrder: ['p1', 'p2'],
    })
```

*JSDoc отсутствует*

---


## 📁 `store/slices/resolver/createResolverSlice.ts`

### `bringToFront`

```typescript
const bringToFront = (key: TPopoverKey) =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/resolver/helpers.ts`

### `resolveTriggerBoundingRect`

```typescript
export function resolveTriggerBoundingRect(
  anchorEvent?: AnchorEventLike,
  optionsRect?: DOMRect | PopoverRect | null,
): DOMRect | PopoverRect | null
```

/**
* Extracts DOM bounding rectangle from anchor event or options override.
*/

---

### `notifyEntryOpen`

```typescript
export function notifyEntryOpen<TData, TPopoverKey extends string>(
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined,
  key: TPopoverKey,
): void
```

/**
* Fires the `onOpen` lifecycle callback for a target popover entry safely.
*/

---

### `invokeResolver`

```typescript
export async function invokeResolver<TData, TContext>(
  resolver: PopoverResolver<TData, TContext> | undefined,
  key: string,
  parentData: TData | undefined,
  context: TContext | undefined,
  signal: AbortSignal,
): Promise<TData>
```

/**
* Invokes the configured data resolver callback with cancellation signal and error guards.
*
* @template TData - Resolved data payload type.
* @template TContext - Ambient context type.
* @param resolver - Target resolver function.
* @param key - Popover key to resolve.
* @param parentData - Optional parent node data payload.
* @param context - Shared context value.
* @param signal - AbortSignal for request cancellation.
* @returns Promise resolving to the retrieved data.
*
* @example
* ```typescript
* const data = await invokeResolver(resolver, 'card-1', parentData, context, signal);
* ```
*/

---

### `cancelStaleActiveKeys`

```typescript
export function cancelStaleActiveKeys<TPopoverKey extends string = string>(
  activeKeys: readonly TPopoverKey[],
  deps: Readonly<{
    abortControllersForKeys: (keys: Iterable<TPopoverKey>) => void;
    transitionScheduler: { cancelAllForKeys: (keys: Iterable<TPopoverKey>) => void };
  }>,
): void
```

/**
* Cancels active controllers and timers for stale active popover keys.
*/

---


## 📁 `store/slices/resolver/predicates.ts`

### `isRootAlreadyActive`

```typescript
export function isRootAlreadyActive<TData, TPopoverKey extends string>(
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  currentOwnerId: string | null | undefined,
  finalOwnerId: string,
  key: TPopoverKey,
  forceRefresh?: boolean,
): boolean
```

/**
* Determines whether the requested root popover is already mounted and active in the trail.
*
* @template TData - Resolved popover data payload type.
* @template TPopoverKey - Union of valid popover keys.
* @param trail - Active trailing popovers stack.
* @param currentOwnerId - Current owner ID of the active root hierarchy.
* @param finalOwnerId - Target owner ID requested by the caller.
* @param key - Unique popover identifier.
* @param forceRefresh - Whether to bypass cache and active status checks.
* @returns `true` if the root popover is currently active under the same owner.
*/

---

### `isNestedAlreadyActive`

```typescript
export function isNestedAlreadyActive<TData, TPopoverKey extends string>(
  existingEntry: TrailEntry<TData, TPopoverKey> | undefined,
  sourceKey: TPopoverKey,
  forceRefresh?: boolean,
): boolean
```

/**
* Determines whether a nested child popover is already mounted under the source parent.
*
* @template TData - Resolved popover data payload type.
* @template TPopoverKey - Union of valid popover keys.
* @param existingEntry - Active popover entry instance if present.
* @param sourceKey - Unique identifier of the initiating parent card.
* @param forceRefresh - Whether to bypass cache and active status checks.
* @returns `true` if the child popover is currently active under the specified parent.
*/

---

### `isFloatingActive`

```typescript
export function isFloatingActive<TData, TPopoverKey extends string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
  forceRefresh?: boolean,
): boolean
```

/**
* Determines whether a popover is already mounted and active in the floating collection.
*
* @template TData - Resolved popover data payload type.
* @template TPopoverKey - Union of valid popover keys.
* @param floating - Active modeless floating entries list.
* @param key - Unique popover identifier.
* @param forceRefresh - Whether to bypass cache and active status checks.
* @returns `true` if the popover is active and not unmounting in the floating list.
*/

---


## 📁 `store/slices/resolver/prefetch.ts`

### `awaitSafeAbort`

```typescript
const awaitSafeAbort = async <T>(promise: Promise<T>): Promise<T | undefined> =>
```

*JSDoc отсутствует*

---

### `fetchPromise`

```typescript
const fetchPromise = (async (): Promise<TData> => {
      try {
        const { cache: storeCache, resolveData, context } = get();
        const activeLocalCache = storeCache ?? cache;
        const parentKey = findEntryByKey(key)?.parentKey;
        const effectiveParentData =
          parentData ?? (parentKey ? findEntryByKey(parentKey)?.data : undefined) ?? undefined;
        const res = await invokeResolver<TData, TContext>(
          resolveData,
          key,
          effectiveParentData,
          context ?? undefined,
          controller.signal,
        );
        activeLocalCache?.set(key, res);
        return res;
      } finally {
        if (ownsController && activeControllers.get(key) === controller) {
          activeControllers.delete(key);
        }
        inFlightPromises.delete(key);
      }
    })()
```

*JSDoc отсутствует*

---


## 📁 `store/slices/resolver/resolver.test.ts`

### `createHarness`

```typescript
const createHarness = (customCache?: Record<string, unknown>) =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/resolver/retry.ts`

### `buildRetryPipelineParams`

```typescript
function buildRetryPipelineParams<TData, TContext, TPopoverKey extends string = string>(
  key: TPopoverKey,
  entry: TrailEntry<TData, TPopoverKey>,
  effectiveParentKey: TPopoverKey | undefined,
  parentData: TData | null | undefined,
  forceRefresh: boolean,
  deps: SliceContext<TData, TContext, TPopoverKey>['deps'],
): ResolvePopoverEntryParams<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/close.ts`

### `isForceImmediate`

```typescript
const isForceImmediate = (o?: CloseTransitionOptions): boolean =>
  o === false || (typeof o === 'object' && o !== null && o.transition === false)
```

*JSDoc отсутствует*

---

### `closeFromIndex`

```typescript
const closeFromIndex = (index: number, options?: CloseTransitionOptions): void =>
```

*JSDoc отсутствует*

---

### `closeFromKey`

```typescript
const closeFromKey = (key: TPopoverKey, options?: CloseTransitionOptions): void =>
```

*JSDoc отсутствует*

---

### `closeTopmostEntry`

```typescript
const closeTopmostEntry = (options?: CloseTransitionOptions): void =>
```

*JSDoc отсутствует*

---

### `closeAllEntries`

```typescript
const closeAllEntries = (options?: CloseTransitionOptions): void =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/dagActions.ts`

### `updateEntryParents`

```typescript
function updateEntryParents<TData, TPopoverKey extends string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
  targetKey: TPopoverKey,
  parents: ReadonlySet<TPopoverKey>,
): readonly TrailEntry<TData, TPopoverKey>[]
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/dagHelpers.ts`

### `pruneDAGNodes`

```typescript
export function pruneDAGNodes<TData, TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey> | undefined,
  entriesToPrune: readonly TrailEntry<TData, TPopoverKey>[],
  remainingFloating: readonly TrailEntry<TData, TPopoverKey>[],
  remainingTrail: readonly TrailEntry<TData, TPopoverKey>[] = EMPTY_ARRAY,
): void
```

/**
* Zero-GC helper to prune DAG nodes directly from entry lists without intermediate array allocations.
*/

---

### `pruneTruncatedTrailNodes`

```typescript
export function pruneTruncatedTrailNodes<TData, TPopoverKey extends string>(
  dag: PopoverDAG<TPopoverKey> | undefined,
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  trailIdx: number,
): void
```

/**
* Prunes nodes beyond the target trail index in the cascade DAG without intermediate array allocations.
*/

---


## 📁 `store/slices/trail/open.ts`

### `pushNested`

```typescript
const pushNested = (index: number, entry: TrailEntry<TData, TPopoverKey>) =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/parity.test.ts`

### `createHarness`

```typescript
const createHarness = () =>
```

*JSDoc отсутствует*

---

### `projectState`

```typescript
const projectState = (harness: ReturnType<typeof createHarness>) =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/teardown.ts`

### `scheduleTeardown`

```typescript
const scheduleTeardown = (
    removedKeys: ReadonlySet<TPopoverKey>,
    forceImmediate = false,
  ): void =>
```

*JSDoc отсутствует*

---

### `runTeardown`

```typescript
const runTeardown = () => executeTeardown(removedKeys)
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/teardownExecution.ts`

### `mapToUnmounting`

```typescript
const mapToUnmounting = <TData, TPopoverKey extends string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  removedKeys: ReadonlySet<TPopoverKey>,
) =>
```

*JSDoc отсутствует*

---

### `applyUnmountingState`

```typescript
const applyUnmountingState = (removedKeys: ReadonlySet<TPopoverKey>): void =>
```

*JSDoc отсутствует*

---

### `executeTeardown`

```typescript
const executeTeardown = (removedKeys: ReadonlySet<TPopoverKey>): void =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/teardownHelpers.ts`

### `resolveMaxExitDuration`

```typescript
export function resolveMaxExitDuration<TData, TPopoverKey extends string = string>(
  removedKeys: ReadonlySet<TPopoverKey>,
  globalDuration: number,
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined,
): number
```

/**
* Resolves the longest exit transition duration among the removed entries.
*
* @template TData - Resolved popover data payload type.
* @template TPopoverKey - Union of valid popover keys.
* @param removedKeys - Readonly set of popover keys scheduled for unmounting.
* @param globalDuration - Default global exit transition duration in milliseconds.
* @param findEntryByKey - Entry lookup function by key.
* @returns Longest transition delay in milliseconds.
*/

---


## 📁 `store/slices/trail/trail.test.ts`

### `setupHarness`

```typescript
const setupHarness = (
    depOverrides?: Partial<ActionRegistryDependencies<unknown, unknown, string>>,
  ) =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/trailProperties.test.ts`

### `entryOf`

```typescript
const entryOf = (k: string) => ({ key: k, isLoading: false, error: null })
```

*JSDoc отсутствует*

---


## 📁 `store/slices/trail/updates.test.ts`

### `createHarness`

```typescript
const createHarness = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/slices/transactions/createTransactionsSlice.ts`

### `executeWithTransition`

```typescript
const executeWithTransition = (action: () => void, schedule?: (cb: () => void) => void) =>
  schedule ? schedule(action) : action()
```

*JSDoc отсутствует*

---

### `handleHistoryTransition`

```typescript
const handleHistoryTransition = (
    targetSnapshot: Parameters<typeof applyHistorySnapshot<TData, TContext, TPopoverKey>>[0],
  ) =>
```

*JSDoc отсутствует*

---


## 📁 `store/snapshot/snapshotChannel.ts`

### `initSnapshotChannel`

```typescript
export function initSnapshotChannel<TData>(
  key: string,
  tabId: string,
  onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void,
): SnapshotChannelHandle
```

*JSDoc отсутствует*

---

### `closeSnapshotChannel`

```typescript
export function closeSnapshotChannel(channel: BroadcastChannel | null): void
```

*JSDoc отсутствует*

---


## 📁 `store/snapshot/snapshotGuards.ts`

### `isSnapshotRestoreMessage`

```typescript
export function isSnapshotRestoreMessage<TData = unknown>(
  val: unknown,
): val is SnapshotRestoreMessage<TData>
```

/** Validates whether an unknown payload is a POP_RESTORE_SNAPSHOT broadcast message. */

---


## 📁 `store/snapshot/snapshotManager.ts`

### `createSnapshot`

```typescript
public createSnapshot(
    trailKeys: string[],
    pinnedKeys: string[],
    offsets: Record<string, { x: number; y: number }>,
    payloads?: Record<string, TData>,
  ): PopoverSnapshotData<TData>
```

*JSDoc отсутствует*

---

### `saveSnapshot`

```typescript
public saveSnapshot(snapshot: PopoverSnapshotData<TData>): void
```

*JSDoc отсутствует*

---

### `loadSnapshot`

```typescript
public loadSnapshot(): PopoverSnapshotData<TData> | null
```

*JSDoc отсутствует*

---

### `clearSnapshot`

```typescript
public clearSnapshot(): void
```

*JSDoc отсутствует*

---

### `destroy`

```typescript
public destroy(): void
```

*JSDoc отсутствует*

---

### `dispose`

```typescript
public dispose(): void
```

*JSDoc отсутствует*

---


## 📁 `store/snapshot/snapshotSanitizers.ts`

### `sanitizeOffsets`

```typescript
export function sanitizeOffsets(
  offsets: Record<string, { x: number; y: number }>,
): Record<string,
```

*JSDoc отсутствует*

---

### `sanitizePayloads`

```typescript
export function sanitizePayloads<TData>(
  payloads?: Record<string, TData>,
): Record<string, TData> | undefined
```

*JSDoc отсутствует*

---

### `isValidSnapshot`

```typescript
export function isValidSnapshot<TData>(val: unknown): val is PopoverSnapshotData<TData>
```

*JSDoc отсутствует*

---


## 📁 `store/snapshot/snapshotStorageAdapter.ts`

### `getStorage`

```typescript
function getStorage(type: 'localStorage' | 'sessionStorage' | 'none'): Storage | null
```

*JSDoc отсутствует*

---

### `saveSnapshotToPlatform`

```typescript
export function saveSnapshotToPlatform<TData>(
  storageType: 'localStorage' | 'sessionStorage' | 'none',
  storageKey: string,
  snapshot: PopoverSnapshotData<TData>,
  broadcastChannel: BroadcastChannel | null,
  serializer?: (data: PopoverSnapshotData<TData>) => string,
): void
```

*JSDoc отсутствует*

---

### `loadSnapshotFromPlatform`

```typescript
export function loadSnapshotFromPlatform<TData>(
  storageType: 'localStorage' | 'sessionStorage' | 'none',
  storageKey: string,
  deserializer?: (raw: string) => PopoverSnapshotData<TData>,
): PopoverSnapshotData<TData> | null
```

*JSDoc отсутствует*

---

### `removeSnapshotFromPlatform`

```typescript
export function removeSnapshotFromPlatform(
  storageType: 'localStorage' | 'sessionStorage' | 'none',
  storageKey: string,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/storeActionRegistry.test.ts`

### `customMethod`

```typescript
const customMethod = () => 'custom'
```

*JSDoc отсутствует*

---

### `fakeOpenRoot`

```typescript
const fakeOpenRoot = () => 'overridden'
```

*JSDoc отсутствует*

---


## 📁 `store/storeBatching.test.ts`

### `selectorListener`

```typescript
const selectorListener = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/storeCustomSlices.test.ts`

### `createAnalyticsSlice`

```typescript
const createAnalyticsSlice = () =>
```

*JSDoc отсутствует*

---


## 📁 `store/storeInvariants.test.ts`

### `dummyResolver`

```typescript
const dummyResolver = async (key: string) => ({ id: key, name: `Data for ${key}` })
```

*JSDoc отсутствует*

---


## 📁 `store/storeResolverPipeline.test.ts`

### `resolver`

```typescript
const resolver = (key: string) => ({ id: key })
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = async (key: string) => `data-$
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = (args: unknown) =>
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = (_key: string, _pd?: unknown, _ctx?: unknown, signal?: AbortSignal) =>
```

*JSDoc отсутствует*

---


## 📁 `store/transactions/transactionHelpers.ts`

### `applyHistorySnapshot`

```typescript
export function applyHistorySnapshot<TData, TContext, TPopoverKey extends string = string>(
  snapshot: HistorySnapshot<TData, TPopoverKey>,
  popoverDAG: PopoverDAG<TPopoverKey> | undefined,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
): void
```

*JSDoc отсутствует*

---

### `rollbackControllers`

```typescript
export function rollbackControllers(
  activeControllers: Map<string, AbortController>,
  snapshotControllers: ReadonlySet<string> | null,
): void
```

*JSDoc отсутствует*

---

### `rollbackTransactionState`

```typescript
export function rollbackTransactionState<TData, TContext, TPopoverKey extends string = string>(
  snapshot: PopoverStateData<TData, TContext, TPopoverKey>,
  popoverDAG: PopoverDAG<TPopoverKey> | undefined,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
): void
```

*JSDoc отсутствует*

---


## 📁 `store/transactions/TransactionScope.test.ts`

### `createMockStore`

```typescript
const createMockStore = () =>
```

*JSDoc отсутствует*

---

### `getState`

```typescript
const getState = () => state
```

*JSDoc отсутствует*

---


## 📁 `store/transactions/TransactionScope.ts`

### `commit`

```typescript
public commit(): void
```

*JSDoc отсутствует*

---

### `rollback`

```typescript
public rollback(): void
```

*JSDoc отсутствует*

---

### `execute`

```typescript
public async execute<R>(action: () => Promise<R> | R): Promise<R>
```

*JSDoc отсутствует*

---

### `executeResult`

```typescript
public async executeResult<R>(action: () => MaybePromise<R>): Promise<Result<R, PopoverError>>
```

*JSDoc отсутствует*

---


## 📁 `store.test.ts`

### `fromRect`

```typescript
static fromRect(other?: { x?: number; y?: number; width?: number; height?: number })
```

*JSDoc отсутствует*

---

### `createMockAnchor`

```typescript
const createMockAnchor = (x = 10, y = 20, width = 100, height = 200): AnchorEventLike => ({
  currentTarget: {
    getBoundingClientRect: () => new DOMRect(x, y, width, height),
  } as HTMLElement,
  stopPropagation: () => {},
})
```

*JSDoc отсутствует*

---

### `createMockStorage`

```typescript
function createMockStorage(initialData?: Record<string, string>): Storage
```

*JSDoc отсутствует*

---

### `delayResolver`

```typescript
const delayResolver = async (_key: string) =>
```

*JSDoc отсутствует*

---

### `delayResolver`

```typescript
const delayResolver = async (_key: string) =>
```

*JSDoc отсутствует*

---

### `flakyResolver`

```typescript
const flakyResolver = async (_key: string) =>
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = async (
      _key: string,
      _parentData?: unknown,
      _context?: unknown,
      signal?: AbortSignal,
    ) =>
```

*JSDoc отсутствует*

---

### `syncResolver`

```typescript
const syncResolver = (key: string) =>
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = (key: string) =>
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = async () =>
```

*JSDoc отсутствует*

---

### `syncResolver`

```typescript
const syncResolver = (key: string) => ({ name: `Data for ${key}` })
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = async (key: string, parentData?: unknown) =>
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = async (key: string) =>
```

*JSDoc отсутствует*

---

### `slowResolver`

```typescript
const slowResolver = async (_key: string) =>
```

*JSDoc отсутствует*

---

### `findEntry`

```typescript
const findEntry = (k: string) =>
        state.trail.find((e) => e.key === k) || state.floating.find((e) => e.key === k)
```

*JSDoc отсутствует*

---

### `slowResolver`

```typescript
const slowResolver = async (
        key: string,
        _pData?: unknown,
        _ctx?: unknown,
        signal?: AbortSignal,
      ) =>
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = async (key: string) =>
```

*JSDoc отсутствует*

---

### `variableResolver`

```typescript
const variableResolver = async (key: string) =>
```

*JSDoc отсутствует*

---

### `timingResolver`

```typescript
const timingResolver = async (key: string) =>
```

*JSDoc отсутствует*

---

### `schemaResolver`

```typescript
const schemaResolver = async (
        key: string,
        _pData?: unknown,
        _ctx?: unknown,
        signal?: AbortSignal,
      ) =>
```

*JSDoc отсутствует*

---

### `flakyResolver`

```typescript
const flakyResolver = async (key: string) =>
```

*JSDoc отсутствует*

---

### `customResolver`

```typescript
const customResolver = async (key: string) =>
```

*JSDoc отсутствует*

---

### `prefetchResolver`

```typescript
const prefetchResolver = async (key: string) =>
```

*JSDoc отсутствует*

---

### `failingResolver`

```typescript
const failingResolver = async () =>
```

*JSDoc отсутствует*

---

### `cancellableResolver`

```typescript
const cancellableResolver = async (
        key: string,
        _pData?: unknown,
        _ctx?: unknown,
        signal?: AbortSignal,
      ) =>
```

*JSDoc отсутствует*

---

### `oldResolver`

```typescript
const oldResolver = (_key: string) => deferOld.promise
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = async () =>
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = (_key: string) => defer.promise
```

*JSDoc отсутствует*

---

### `resolver`

```typescript
const resolver = (
        _key: string,
        _parentData: unknown,
        _ctx: unknown,
        signal?: AbortSignal,
      ) =>
```

*JSDoc отсутствует*

---

### `syncFailingResolver`

```typescript
const syncFailingResolver = (_key: string) =>
```

*JSDoc отсутствует*

---


## 📁 `types/branded.ts`

### `createBrand`

```typescript
export function createBrand<T, B extends string>(value: T): Brand<T, B>
```

/**
* Generic brand constructor eliminating double type assertions across domain modules.
*/

---

### `unbrand`

```typescript
export function unbrand<T>(value: T): Unbrand<T>
```

/**
* Strips nominal brand tag at runtime and compile-time, returning the underlying primitive value.
*
* @template T - Branded or primitive value type.
* @param value - Value to unbrand.
* @returns The unbranded primitive value.
*
* @example
* ```typescript
* const rawKey = unbrand(toPopoverKey('card-1')); // 'card-1' (string)
* const rawMs = unbrand(toDurationMs(300)); // 300 (number)
* ```
*/

---

### `emptyRecord`

```typescript
export function emptyRecord<K extends string = string, V = unknown>(): Readonly<
  Partial<Record<K, V>>
>
```

/**
* Type-safe accessor for the frozen empty record singleton.
* Eliminates repetitive verbose type assertions across store slices, reducers, and initial states.
*/

---

### `emptySet`

```typescript
export function emptySet<T = never>(): ReadonlySet<T>
```

/**
* Type-safe accessor for the frozen empty Set singleton.
* Eliminates duplicate empty set instantiations across DAG and query methods.
*/

---


## 📁 `types/entry/entryGuards.ts`

### `isSuccessEntry`

```typescript
export function isSuccessEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is SuccessTrailEntry<TData, TPopoverKey>
```

*JSDoc отсутствует*

---

### `isIdleEntry`

```typescript
export function isIdleEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is IdleTrailEntry<TData, TPopoverKey>
```

*JSDoc отсутствует*

---


## 📁 `types/state/discriminatedStoreState.ts`

### `isStoreIdle`

```typescript
export function isStoreIdle<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is IdleStoreState<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---

### `isStoreActive`

```typescript
export function isStoreActive<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is ActiveTrailStoreState<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---

### `isStorePinnedOnly`

```typescript
export function isStorePinnedOnly<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is PinnedOnlyStoreState<TData, TContext, TPopoverKey>
```

*JSDoc отсутствует*

---

### `selectDiscriminatedStatus`

```typescript
export function selectDiscriminatedStatus<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): 'idle' | 'active-trail' | 'pinned-only'
```

*JSDoc отсутствует*

---


## 📁 `types/types.test-d.ts`

### `testNarrowing`

```typescript
const testNarrowing = (res: UsePopoverResult<string>) =>
```

*JSDoc отсутствует*

---

### `testWorkerNarrowing`

```typescript
const testWorkerNarrowing = (msg: WorkerTaskMessage) =>
```

*JSDoc отсутствует*

---


## 📁 `utils/a11y.ts`

### `resolveActionLabel`

```typescript
export function resolveActionLabel(action: string, entity = 'popover'): string
```

/**
* Resolves an action label for accessibility with a capitalized verb.
*
* @param action - Action verb (e.g. 'close', 'pin', 'expand').
* @param entity - Target entity noun (default: 'popover').
* @returns Human-readable ARIA label string.
*
* @example
* ```typescript
* resolveActionLabel('close'); // "Close popover"
* resolveActionLabel('pin', 'card'); // "Pin card"
* ```
*/

---

### `resolvePopoverAria`

```typescript
export function resolvePopoverAria(
  entry: Pick<TrailEntry, 'key' | 'ariaDescribedby'>,
  isPinned: boolean,
  userAriaLabel?: string,
):
```

/**
* Computes standard WCAG-compliant ARIA dialog attributes for an active popover card.
*
* @param entry - Popover entry containing key and optional ariaDescribedby.
* @param isPinned - If true, `aria-modal` is set to false to allow interaction with background elements.
* @param userAriaLabel - Optional custom aria-label provided by the consumer.
* @returns Object with role, aria-modal, aria-label, and aria-describedby.
*
* @example
* ```typescript
* const aria = resolvePopoverAria(entry, false, 'User Settings');
* // { role: 'dialog', 'aria-modal': true, 'aria-label': 'User Settings', ... }
* ```
*/

---

### `resolveTriggerAria`

```typescript
export function resolveTriggerAria(
  popoverKey: string,
  isOpen: boolean,
):
```

/**
* Computes standard ARIA attributes for a trigger element controlling a popover card.
*
* @param popoverKey - Controlled popover key.
* @param isOpen - Whether the popover is currently active/open.
* @returns Object with aria-haspopup, aria-expanded, and aria-controls.
*
* @example
* ```typescript
* const triggerAria = resolveTriggerAria('profile-1', true);
* // { 'aria-haspopup': 'dialog', 'aria-expanded': true, 'aria-controls': 'popover-card-profile-1' }
* ```
*/

---


## 📁 `utils/arrayUtils.ts`

### `first`

```typescript
export function first<T>(items: readonly T[]): T | undefined
```

/** Returns the first element of an array, or undefined if empty. */

---

### `last`

```typescript
export function last<T>(items: readonly T[]): T | undefined
```

/** Returns the last element of an array, or undefined if empty. */

---

### `take`

```typescript
export function take<T>(items: readonly T[], count: number): readonly T[]
```

/**
* Returns a slice containing the first `count` elements.
* Returns `EMPTY_ARRAY` if `count <= 0`, or the source array unchanged if `count >= items.length`.
*
* @example
* ```ts
* take(['a', 'b', 'c'], 2); // => ['a', 'b']
* take(['a', 'b'], 5);       // => ['a', 'b'] (same reference)
* take(['a', 'b'], 0);       // => EMPTY_ARRAY
* ```
*
* @template T - Element type.
* @param items - Source array.
* @param count - Number of elements to take.
* @returns Sliced array preserving reference identity when possible.
*/

---

### `drop`

```typescript
export function drop<T>(items: readonly T[], count: number): readonly T[]
```

/**
* Returns a slice omitting the first `count` elements.
* Returns the source array unchanged if `count <= 0`, or `EMPTY_ARRAY` if `count >= items.length`.
*
* @example
* ```ts
* drop(['a', 'b', 'c'], 1); // => ['b', 'c']
* drop(['a', 'b'], 0);       // => ['a', 'b'] (same reference)
* drop(['a', 'b'], 3);       // => EMPTY_ARRAY
* ```
*
* @template T - Element type.
* @param items - Source array.
* @param count - Number of elements to drop.
* @returns Sliced array preserving reference identity when possible.
*/

---

### `concatImmutable`

```typescript
export function concatImmutable<T>(...arrays: readonly (readonly T[])[]): readonly T[]
```

/**
* Concatenates multiple arrays with zero-allocation fast-paths for empty inputs.
* If all arrays are empty, returns EMPTY_ARRAY.
* If exactly one array is non-empty, returns it directly without heap allocation.
*
* @example
* ```ts
* concatImmutable(['a'], ['b', 'c']); // => ['a', 'b', 'c']
* concatImmutable([], []);             // => EMPTY_ARRAY (no allocation)
* concatImmutable(['a', 'b'], []);     // => ['a', 'b'] (reused reference)
* ```
*
* @template T - Element type.
* @param arrays - Readonly sequence of arrays to concatenate.
* @returns Consolidated frozen array.
*/

---


## 📁 `utils/assertions.ts`

### `assertNonNullable`

```typescript
export function assertNonNullable<T>(value: T, name = 'value'): asserts value is NonNullable<T>
```

/**
* Asserts that a value is non-nullable (neither null nor undefined).
* Throws a PopoverError if the assertion fails.
*
* @template T - Input value type.
* @param value - Value to assert.
* @param name - Property or argument variable name for diagnostic messages.
*
* @example
* ```typescript
* assertNonNullable(entry.triggerRect, 'triggerRect');
* console.log(entry.triggerRect.width); // narrowed to NonNullable
* ```
*/

---

### `assertValidPopoverKey`

```typescript
export function assertValidPopoverKey(key: unknown): asserts key is PopoverKey
```

/**
* Asserts that a key string is a valid, non-empty PopoverKey.
*
* @param key - Identifier value to validate.
*
* @example
* ```typescript
* assertValidPopoverKey(props.key);
* ```
*/

---

### `assertValidOwnerId`

```typescript
export function assertValidOwnerId(ownerId: unknown): asserts ownerId is OwnerId
```

/**
* Asserts that a value is a valid, non-empty OwnerId string.
*
* @param ownerId - Owner identifier value to validate.
*
* @example
* ```typescript
* assertValidOwnerId(options.ownerId);
* ```
*/

---

### `assertValidRect`

```typescript
export function assertValidRect(rect: unknown): asserts rect is DOMRect
```

/**
* Asserts that a DOMRect or bounding rectangle contains valid, finite numeric coordinates.
*
* @param rect - Rect object to validate.
*
* @example
* ```typescript
* assertValidRect(element.getBoundingClientRect());
* ```
*/

---


## 📁 `utils/assertNever.test.ts`

### `testFn`

```typescript
const testFn = (s: State): string =>
```

*JSDoc отсутствует*

---


## 📁 `utils/assertNever.ts`

### `assertNever`

```typescript
export function assertNever(value: never, message?: string): never
```

/**
* Asserts that a value is of type `never`.
* Used as the default branch in exhaustive switch / pattern matches to guarantee compile-time exhaustiveness.
*
* @param value - The value expected to be never.
* @param message - Optional contextual error message.
* @returns never
* @throws {TypeError} At runtime if this branch is executed.
*
* @example
* ```typescript
* switch (action.type) {
*   case 'OPEN': return handleOpen(action);
*   case 'CLOSE': return handleClose(action);
*   default: return assertNever(action);
* }
* ```
*/

---


## 📁 `utils/asyncUtils.ts`

### `isPromise`

```typescript
export function isPromise<T>(value: unknown): value is Promise<T>
```

/**
* Type guard verifying whether an unknown value is a Promise or Thenable object.
*
* @template T - Promise resolved value type.
* @param value - Value to inspect.
* @returns True if `value` conforms to the standard PromiseLike interface.
*
* @example
* ```typescript
* if (isPromise(result)) {
*   const data = await result;
* }
* ```
*/

---

### `sleep`

```typescript
export function sleep(ms: number): Promise<void>
```

/**
* Returns a Promise that resolves after the specified duration in milliseconds.
*
* @param ms - Delay in milliseconds (sanitized to non-negative finite range).
* @returns Promise resolving after the timeout.
*
* @example
* ```typescript
* await sleep(150);
* ```
*/

---

### `deferMicrotask`

```typescript
export function deferMicrotask(fn: () => void): void
```

/**
* Defers execution of a synchronous task to the next microtask cycle.
* Falls back to `Promise.resolve().then(...)` when `queueMicrotask` is unavailable.
*
* @param fn - Void callback to schedule.
*
* @example
* ```typescript
* deferMicrotask(() => {
*   store.notifySubscribers();
* });
* ```
*/

---

### `deferred`

```typescript
export function deferred<T>(): Deferred<T>
```

/**
* Creates an uncoupled Deferred promise container allowing external resolution and rejection.
*
* @template T - Resolution value type.
* @returns Deferred object containing promise and resolution controllers.
*
* @example
* ```typescript
* const signal = deferred<string>();
* signal.promise.then(console.log);
* signal.resolve('ready');
* ```
*/

---

### `withTimeout`

```typescript
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  customError?: Error | string,
): Promise<T>
```

/**
* Enforces a maximum timeout on an asynchronous Promise, rejecting if not settled within duration.
* Automatically clears internal timer on early promise settlement to prevent memory leaks.
*
* @template T - Promise return type.
* @param promise - Target promise to monitor.
* @param timeoutMs - Maximum allowable duration in milliseconds.
* @param customError - Optional custom error instance or message string on timeout.
* @returns Settled promise value, or rejects with timeout error.
*
* @example
* ```typescript
* const data = await withTimeout(fetchPopoverData(id), 5000, 'Data resolution timed out');
* ```
*/

---

### `debounce`

```typescript
export function debounce<Args extends readonly unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): DebouncedFunction<Args>
```

/**
* Creates a debounced version of a procedure delaying execution until waitMs elapses after last call.
* Augmented with `.cancel()`, `.flush()`, and `.isPending()` control handles.
*
* @template Args - Parameter types tuple.
* @param fn - Procedure to debounce.
* @param waitMs - Debounce cooldown in milliseconds.
* @returns Debounced procedure with cancellation and flush handles.
*
* @example
* ```typescript
* const debouncedSearch = debounce((query: string) => {
*   filterTrail(query);
* }, 200);
* debouncedSearch('settings');
* debouncedSearch.cancel();
* ```
*/

---

### `debounced`

```typescript
const debounced = (...args: Args) =>
```

*JSDoc отсутствует*

---

### `throttle`

```typescript
export function throttle<Args extends readonly unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): ThrottledFunction<Args>
```

/**
* Creates a throttled version of a procedure executing at most once per waitMs window.
* Trailing executions are scheduled automatically if called during cooldown.
*
* @template Args - Parameter types tuple.
* @param fn - Procedure to throttle.
* @param waitMs - Throttle cooldown in milliseconds.
* @returns Throttled procedure with cancellation handle.
*
* @example
* ```typescript
* const throttledScroll = throttle((ev: Event) => {
*   updateScrollCoordinates();
* }, 50);
* window.addEventListener('scroll', throttledScroll);
* ```
*/

---

### `throttled`

```typescript
const throttled = (...args: Args) =>
```

*JSDoc отсутствует*

---

### `retryAsync`

```typescript
export async function retryAsync<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>
```

/**
* Retries an asynchronous operation with exponential backoff.
*
* @template T - Return type.
* @param fn - Asynchronous function to execute.
* @param options - Configuration options for retries, delays, and backoff.
* @returns Result of the resolved asynchronous operation.
*
* @example
* ```typescript
* const data = await retryAsync(() => fetchUserData(userId), {
*   retries: 3,
*   delayMs: 200,
*   backoffMultiplier: 2,
* });
* ```
*/

---

### `attempt`

```typescript
const attempt = async (remainingRetries: number, currentDelay: number): Promise<T> =>
```

*JSDoc отсутствует*

---

### `createAsyncMutex`

```typescript
export function createAsyncMutex(): AsyncMutex
```

/**
* Creates an asynchronous mutex lock guaranteeing sequential FIFO execution without race conditions.
*
* @returns An AsyncMutex instance.
*
* @example
* ```typescript
* const mutex = createAsyncMutex();
* await mutex.runExclusive(async () => {
*   await savePopoverTransaction();
* });
* ```
*/

---

### `runExclusive`

```typescript
async runExclusive<T>(fn: () => Promise<T>): Promise<T>
```

*JSDoc отсутствует*

---


## 📁 `utils/brandedNumbers.ts`

### `toDurationMs`

```typescript
export function toDurationMs(ms: DurationMs | Unbrand<DurationMs>): DurationMs
```

/**
* Smart constructor for `DurationMs`.
* Validates that the duration is a finite, non-negative number. Accepts branded and unbranded numbers.
*
* @param ms - Raw or branded duration in milliseconds.
* @returns Validated DurationMs brand.
*
* @example
* ```typescript
* const duration = toDurationMs(200); // => 200 as DurationMs
* const fallback = toDurationMs(-10); // => 0 as DurationMs
* ```
*/

---

### `toTimestampMs`

```typescript
export function toTimestampMs(ts?: TimestampMs | Unbrand<TimestampMs>): TimestampMs
```

/**
* Smart constructor for `TimestampMs`.
* Validates that the timestamp is a finite number (defaults to Date.now()). Accepts branded and unbranded timestamps.
*
* @param ts - Optional raw or branded timestamp in milliseconds.
* @returns Validated TimestampMs brand.
*
* @example
* ```typescript
* const now = toTimestampMs();
* const past = toTimestampMs(1600000000000);
* ```
*/

---

### `toZIndexDepth`

```typescript
export function toZIndexDepth(depth: ZIndexDepth | Unbrand<ZIndexDepth>): ZIndexDepth
```

/**
* Smart constructor for `ZIndexDepth`.
* Validates that the z-index depth is a non-negative integer. Accepts branded and unbranded depths.
*
* @param depth - Raw or branded depth number.
* @returns Validated ZIndexDepth brand.
*
* @example
* ```typescript
* const zIndex = toZIndexDepth(1005);
* const clamped = toZIndexDepth(-5); // => 0
* ```
*/

---

### `toViewportX`

```typescript
export function toViewportX(x: ViewportX | Unbrand<ViewportX>): ViewportX
```

/**
* Smart constructor for `ViewportX`.
* Validates that the x-coordinate is a finite number, sanitizing non-finite values to 0.
*
* @param x - Raw or branded horizontal viewport coordinate.
* @returns Validated ViewportX brand.
*
* @example
* ```typescript
* const posX = toViewportX(120.5);
* ```
*/

---

### `toViewportY`

```typescript
export function toViewportY(y: ViewportY | Unbrand<ViewportY>): ViewportY
```

/**
* Smart constructor for `ViewportY`.
* Validates that the y-coordinate is a finite number, sanitizing non-finite values to 0.
*
* @param y - Raw or branded vertical viewport coordinate.
* @returns Validated ViewportY brand.
*
* @example
* ```typescript
* const posY = toViewportY(340);
* ```
*/

---

### `toWorkerTaskId`

```typescript
export function toWorkerTaskId(id: WorkerTaskId | Unbrand<WorkerTaskId>): WorkerTaskId
```

/**
* Smart constructor for `WorkerTaskId`.
* Validates that the task id is a positive safe integer. Accepts branded and unbranded IDs.
*
* @param id - Raw or branded numeric task identifier.
* @returns Validated WorkerTaskId brand (defaults to 1 if non-positive or non-integer).
*
* @example
* ```typescript
* const taskId = toWorkerTaskId(101);
* ```
*/

---

### `isWorkerTaskId`

```typescript
export function isWorkerTaskId(value: unknown): value is WorkerTaskId
```

/**
* Type guard checking if a value is a valid WorkerTaskId.
*
* @param value - Unknown input to check.
* @returns True if value is a positive safe integer.
*
* @example
* ```typescript
* if (isWorkerTaskId(payload.taskId)) {
*   console.log('Valid task ID');
* }
* ```
*/

---

### `toCausalSequence`

```typescript
export function toCausalSequence(seq: CausalSequence | Unbrand<CausalSequence>): CausalSequence
```

/**
* Smart constructor for `CausalSequence`.
* Validates that the logical sequence counter is a non-negative safe integer. Accepts branded and unbranded counters.
*
* @param seq - Raw or branded numeric sequence counter.
* @returns Validated CausalSequence brand (defaults to 0 if negative or non-integer).
*
* @example
* ```typescript
* const seq = toCausalSequence(42);
* ```
*/

---

### `isCausalSequence`

```typescript
export function isCausalSequence(value: unknown): value is CausalSequence
```

/**
* Type guard checking if a value is a valid CausalSequence.
*
* @param value - Unknown input to check.
* @returns True if value is a non-negative safe integer.
*
* @example
* ```typescript
* if (isCausalSequence(envelope.seq)) {
*   processEnvelope(envelope);
* }
* ```
*/

---

### `toHistoryCapacity`

```typescript
export function toHistoryCapacity(
  capacity: HistoryCapacity | Unbrand<HistoryCapacity>,
): HistoryCapacity
```

/**
* Smart constructor for `HistoryCapacity`.
* Validates that history capacity is a positive safe integer >= 1 (defaults to 30). Accepts branded and unbranded capacity.
*
* @param capacity - Raw or branded capacity integer.
* @returns Validated HistoryCapacity brand.
*
* @example
* ```typescript
* const cap = toHistoryCapacity(50);
* ```
*/

---

### `isHistoryCapacity`

```typescript
export function isHistoryCapacity(value: unknown): value is HistoryCapacity
```

/**
* Type guard checking if a value is a valid HistoryCapacity.
*
* @param value - Unknown input to check.
* @returns True if value is a safe integer >= 1.
*
* @example
* ```typescript
* if (isHistoryCapacity(config.capacity)) {
*   setJournalCapacity(config.capacity);
* }
* ```
*/

---


## 📁 `utils/brandedStrings.ts`

### `createBrandedIdentity`

```typescript
export function createBrandedIdentity<B extends string>(brandName: B)
```

/**
* Higher-order factory creating smart constructor and type guard for a branded string domain entity.
*
* @template B - Brand discriminator name.
* @param brandName - Entity name for error reporting and brand identification.
*
* @example
* ```typescript
* const tokenIdentity = createBrandedIdentity('AuthToken');
* const token = tokenIdentity.toBrand('xyz-123');
* const valid = tokenIdentity.isBrand(token);
* ```
*/

---


## 📁 `utils/broadcastSync.ts`

### `createBroadcastSync`

```typescript
export function createBroadcastSync(channelName = 'popover-trail-sync'): BroadcastSyncManager
```

*JSDoc отсутствует*

---

### `broadcast`

```typescript
const broadcast = (type: PopoverSyncMessage['type'], key?: string) =>
```

*JSDoc отсутствует*

---

### `subscribe`

```typescript
const subscribe = (listener: PopoverSyncListener): (() => void) =>
```

*JSDoc отсутствует*

---

### `destroy`

```typescript
const destroy = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferBranded.ts`

### `toLogicalIndex`

```typescript
export function toLogicalIndex(idx: number): BufferLogicalIndex
```

/**
* Converts a raw number to a validated, truncated logical index.
*/

---

### `toPhysicalIndex`

```typescript
export function toPhysicalIndex(idx: number): BufferPhysicalIndex
```

/**
* Converts a raw number to a validated, truncated physical index.
*/

---

### `toBufferRevision`

```typescript
export function toBufferRevision(rev: number): BufferRevision
```

/**
* Converts a raw number to a non-negative integer buffer revision.
*/

---

### `toBufferCapacity`

```typescript
export function toBufferCapacity(cap: number): BufferCapacity
```

/**
* Converts a raw number to a positive buffer capacity (minimum 1).
*/

---

### `nextRevision`

```typescript
export function nextRevision(rev: BufferRevision): BufferRevision
```

/**
* Increments the revision counter with 32-bit unsigned overflow wrap-around.
*/

---

### `isLogicalIndex`

```typescript
export function isLogicalIndex(val: unknown): val is BufferLogicalIndex
```

/**
* Validates if an unknown value satisfies the BufferLogicalIndex invariants.
*/

---

### `isPhysicalIndex`

```typescript
export function isPhysicalIndex(val: unknown): val is BufferPhysicalIndex
```

/**
* Validates if an unknown value satisfies the BufferPhysicalIndex invariants.
*/

---

### `isBufferRevision`

```typescript
export function isBufferRevision(val: unknown): val is BufferRevision
```

/**
* Validates if an unknown value satisfies the BufferRevision invariants.
*/

---

### `isBufferCapacity`

```typescript
export function isBufferCapacity(val: unknown): val is BufferCapacity
```

/**
* Validates if an unknown value satisfies the BufferCapacity invariants.
*/

---


## 📁 `utils/buffer/bufferConfig.ts`

### `resolveBufferConfig`

```typescript
export function resolveBufferConfig<T>(
  opt: BufferCapacity | number | RingBufferOptions<T>,
  onEvict?: (item: T) => void,
): ResolvedBufferConfig<T>
```

/**
* Resolves raw numbers or configuration objects into a normalized `ResolvedBufferConfig`.
*
* @template T - Type of elements stored in the buffer.
* @param opt - Numerical capacity or `RingBufferOptions` configuration dictionary.
* @param onEvict - Optional fallback eviction callback.
* @returns Fully validated and normalized `ResolvedBufferConfig<T>`.
*
* @example
* ```typescript
* const config = resolveBufferConfig<string>({ capacity: 16, autoExpand: true });
* console.log(config.isPowerOf2); // true
* console.log(config.mask); // 15
* ```
*/

---


## 📁 `utils/buffer/bufferErrors.ts`

### `isBufferDomainError`

```typescript
export function isBufferDomainError(val: unknown): val is BufferDomainError
```

*JSDoc отсутствует*

---

### `isInvalidCapacityError`

```typescript
export function isInvalidCapacityError(val: unknown): val is InvalidCapacityError
```

*JSDoc отсутствует*

---

### `isBufferOverflowError`

```typescript
export function isBufferOverflowError(val: unknown): val is BufferOverflowError
```

*JSDoc отсутствует*

---

### `isBufferEmptyError`

```typescript
export function isBufferEmptyError(val: unknown): val is BufferEmptyError
```

*JSDoc отсутствует*

---

### `isIndexOutOfBoundsError`

```typescript
export function isIndexOutOfBoundsError(val: unknown): val is IndexOutOfBoundsError
```

*JSDoc отсутствует*

---

### `matchBufferError`

```typescript
export function matchBufferError<R>(
  err: BufferDomainError,
  cases: {
    INVALID_CAPACITY: (e: InvalidCapacityError) => R;
    BUFFER_OVERFLOW: (e: BufferOverflowError) => R;
    BUFFER_EMPTY: (e: BufferEmptyError) => R;
    INDEX_OUT_OF_BOUNDS: (e: IndexOutOfBoundsError) => R;
  },
): R
```

*JSDoc отсутствует*

---

### `createInvalidCapacityError`

```typescript
export function createInvalidCapacityError(cap: unknown, msg?: string): InvalidCapacityError
```

*JSDoc отсутствует*

---

### `createBufferOverflowError`

```typescript
export function createBufferOverflowError(cap: number, msg?: string): BufferOverflowError
```

*JSDoc отсутствует*

---

### `createBufferEmptyError`

```typescript
export function createBufferEmptyError(msg?: string): BufferEmptyError
```

*JSDoc отсутствует*

---

### `createIndexOutOfBoundsError`

```typescript
export function createIndexOutOfBoundsError(
  idx: number,
  size: number,
  msg?: string,
): IndexOutOfBoundsError
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferFind.ts`

### `searchIndex`

```typescript
function searchIndex<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
  fromEnd: boolean,
): BufferLogicalIndex | -1
```

*JSDoc отсутствует*

---

### `findIndexInRing`

```typescript
export function findIndexInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): BufferLogicalIndex | -1
```

/**
* Searches the ring buffer from head to tail for the first element satisfying a predicate.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param pred - Predicate function tested against each element.
* @returns Logical index of the first match, or `-1` if none found.
*
* @example
* ```ts
* const idx = findIndexInRing(buffer.state, (entry) => entry.key === 'card-1');
* ```
*/

---

### `findLastIndexInRing`

```typescript
export function findLastIndexInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): BufferLogicalIndex | -1
```

/**
* Searches the ring buffer backwards from tail to head for the first element satisfying a predicate.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param pred - Predicate function tested against each element.
* @returns Logical index of the last match, or `-1` if none found.
*
* @example
* ```ts
* const idx = findLastIndexInRing(buffer.state, (entry) => entry.isPinned);
* ```
*/

---

### `findInRing`

```typescript
export function findInRing<T, S extends T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferTypeGuard<T, S>,
): S | undefined
```

/**
* Finds the first item in the ring buffer satisfying a type guard or predicate.
*
* @template T - Stored item type.
* @template S - Narrowed subtype.
* @param state - Readonly ring buffer state.
* @param pred - Predicate or type guard function.
* @returns The matching item, or `undefined` if none found.
*
* @example
* ```ts
* const item = findInRing(buffer.state, (item) => item.score > 10);
* ```
*/

---

### `findInRing`

```typescript
export function findInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): T | undefined
```

*JSDoc отсутствует*

---

### `findInRing`

```typescript
export function findInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): T | undefined
```

*JSDoc отсутствует*

---

### `findLastInRing`

```typescript
export function findLastInRing<T, S extends T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferTypeGuard<T, S>,
): S | undefined
```

/**
* Finds the last item in the ring buffer satisfying a type guard or predicate.
*
* @template T - Stored item type.
* @template S - Narrowed subtype.
* @param state - Readonly ring buffer state.
* @param pred - Predicate or type guard function.
* @returns The matching item, or `undefined` if none found.
*
* @example
* ```ts
* const item = findLastInRing(buffer.state, (item) => item.active);
* ```
*/

---

### `findLastInRing`

```typescript
export function findLastInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): T | undefined
```

*JSDoc отсутствует*

---

### `findLastInRing`

```typescript
export function findLastInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): T | undefined
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferGuards.ts`

### `isValidBufferCapacity`

```typescript
export function isValidBufferCapacity(val: unknown): val is BufferCapacity
```

/** Validates whether a value is a valid positive finite buffer capacity integer. */

---

### `isRingBufferOptions`

```typescript
export function isRingBufferOptions<T = unknown>(val: unknown): val is RingBufferOptions<T>
```

/** Checks whether an unknown value is a valid RingBufferOptions object. */

---

### `isReadonlyRingBuffer`

```typescript
export function isReadonlyRingBuffer<T = unknown>(val: unknown): val is ReadonlyRingBuffer<T>
```

/**
* Checks whether an unknown object adheres to the ReadonlyRingBuffer interface.
*/

---

### `isRingBuffer`

```typescript
export function isRingBuffer<T = unknown>(val: unknown): val is RingBuffer<T>
```

*JSDoc отсутствует*

---

### `isRingBufferState`

```typescript
export function isRingBufferState<T = unknown>(val: unknown): val is RingBufferState<T>
```

/** Validates whether an unknown value conforms to internal RingBufferState shape. */

---

### `isBufferEmpty`

```typescript
export function isBufferEmpty(
  target: { readonly count: number } | { readonly size: number },
): boolean
```

*JSDoc отсутствует*

---

### `isBufferFull`

```typescript
export function isBufferFull(
  target:
    | { readonly count: number; readonly capacity: number }
    | { readonly size: number; readonly capacity: number },
): boolean
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferIndex.ts`

### `validateCapacity`

```typescript
export function validateCapacity(capacity: BufferCapacity | number): BufferCapacity
```

*JSDoc отсутствует*

---

### `isPowerOfTwo`

```typescript
export function isPowerOfTwo(n: number): boolean
```

*JSDoc отсутствует*

---

### `computePhysicalIndex`

```typescript
export function computePhysicalIndex(
  head: BufferPhysicalIndex | number,
  offset: BufferLogicalIndex | number,
  capacity: BufferCapacity | number,
  isPowerOf2: boolean,
  mask: number,
): BufferPhysicalIndex
```

*JSDoc отсутствует*

---

### `getPhysicalIndex`

```typescript
export function getPhysicalIndex<T = unknown>(
  state: ReadonlyRingBufferState<T>,
  offset: BufferLogicalIndex | number,
): BufferPhysicalIndex
```

*JSDoc отсутствует*

---

### `getBufferItem`

```typescript
export function getBufferItem<T>(
  state: ReadonlyRingBufferState<T>,
  offset: BufferLogicalIndex | number,
): T | undefined
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferIteration.ts`

### `forEachItem`

```typescript
export function forEachItem<T>(state: ReadonlyRingBufferState<T>, fn: BufferConsumer<T>): void
```

/**
* Iterates over each item in logical FIFO insertion order (oldest to newest).
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @param fn - Consumer callback receiving each item and its logical index.
*
* @example
* ```typescript
* forEachItem(state, (item, index) => {
*   console.log(`[${index}]:`, item);
* });
* ```
*/

---

### `forEachReversedItem`

```typescript
export function forEachReversedItem<T>(
  state: ReadonlyRingBufferState<T>,
  fn: BufferConsumer<T>,
): void
```

/**
* Iterates over each item in reverse logical insertion order (newest to oldest).
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @param fn - Consumer callback receiving each item and its relative loop index.
*
* @example
* ```typescript
* forEachReversedItem(state, (item) => {
*   console.log('Most recent item:', item);
* });
* ```
*/

---

### `itemAt`

```typescript
export function itemAt<T>(
  state: ReadonlyRingBufferState<T>,
  relativeIndex: BufferLogicalIndex | number,
): T | undefined
```

/**
* Retrieves an item at a relative index supporting positive (0..count-1) and negative (-1..-count) indexing.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @param relativeIndex - 0-based offset or negative relative offset from end (-1 = newest).
* @returns The element at `relativeIndex` or `undefined` if out of bounds.
*
* @example
* ```typescript
* const oldest = itemAt(state, 0);
* const newest = itemAt(state, -1);
* ```
*/

---

### `createBufferIterator`

```typescript
export function createBufferIterator<T>(state: ReadonlyRingBufferState<T>): IterableIterator<T>
```

/**
* Creates an iterable iterator over all active values in FIFO order.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @returns An `IterableIterator<T>` over the active elements.
*
* @example
* ```typescript
* for (const val of createBufferIterator(state)) {
*   console.log(val);
* }
* ```
*/

---

### `createBufferEntriesIterator`

```typescript
export function createBufferEntriesIterator<T>(
  state: ReadonlyRingBufferState<T>,
): IterableIterator<[BufferLogicalIndex, T]>
```

/**
* Creates an iterable iterator yielding `[index, value]` tuples in FIFO order.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @returns An `IterableIterator<[BufferLogicalIndex, T]>`.
*
* @example
* ```typescript
* for (const [idx, item] of createBufferEntriesIterator(state)) {
*   console.log(idx, item);
* }
* ```
*/

---

### `createBufferKeysIterator`

```typescript
export function createBufferKeysIterator<T = unknown>(
  state: ReadonlyRingBufferState<T>,
): IterableIterator<BufferLogicalIndex>
```

/**
* Creates an iterable iterator yielding logical index keys in FIFO order.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @returns An `IterableIterator<BufferLogicalIndex>`.
*
* @example
* ```typescript
* const keys = Array.from(createBufferKeysIterator(state));
* ```
*/

---

### `bufferToArray`

```typescript
export function bufferToArray<T>(state: ReadonlyRingBufferState<T>): T[]
```

/**
* Copies all active circular buffer elements into a newly allocated standard JavaScript array in FIFO order.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @returns Array containing active buffer elements in logical order.
*
* @example
* ```typescript
* const list = bufferToArray(state);
* ```
*/

---

### `bufferToReversedArray`

```typescript
export function bufferToReversedArray<T>(state: ReadonlyRingBufferState<T>): T[]
```

/**
* Copies all active circular buffer elements into a newly allocated standard JavaScript array in reverse order.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @returns Array containing active buffer elements in reverse logical order.
*
* @example
* ```typescript
* const reversedList = bufferToReversedArray(state);
* ```
*/

---


## 📁 `utils/buffer/bufferMonadic.ts`

### `peekRingResult`

```typescript
export function peekRingResult<T>(state: ReadonlyRingBufferState<T>): Result<T, BufferEmptyError>
```

/**
* Safely inspects the newest (last pushed) item in the ring buffer without mutating state.
*
* @template T - Buffer item type.
* @param state - Internal ring buffer state.
* @returns Ok with the newest item, or Err(BufferEmptyError) if buffer count is 0.
*/

---

### `peekFirstRingResult`

```typescript
export function peekFirstRingResult<T>(
  state: ReadonlyRingBufferState<T>,
): Result<T, BufferEmptyError>
```

/**
* Safely inspects the oldest (first pushed) item in the ring buffer without mutating state.
*
* @template T - Buffer item type.
* @param state - Internal ring buffer state.
* @returns Ok with the oldest item, or Err(BufferEmptyError) if buffer count is 0.
*/

---

### `itemAtRingResult`

```typescript
export function itemAtRingResult<T>(
  state: ReadonlyRingBufferState<T>,
  relativeIndex: BufferRelativeIndex,
): Result<T, IndexOutOfBoundsError>
```

/**
* Safely retrieves an item by logical or negative relative index without throwing.
*
* @remarks
* Supports Python-style negative indices where `-1` represents the newest item (`count - 1`)
* and `0` represents the oldest item (`0`).
*
* @template T - Buffer item type.
* @param state - Internal ring buffer state.
* @param relativeIndex - Relative integer offset.
* @returns Ok with the item, or Err(IndexOutOfBoundsError) if the index exceeds active bounds.
*/

---

### `popRingResult`

```typescript
export function popRingResult<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): Result<T, BufferEmptyError>
```

*JSDoc отсутствует*

---

### `shiftRingResult`

```typescript
export function shiftRingResult<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): Result<T, BufferEmptyError>
```

*JSDoc отсутствует*

---

### `tryPushRing`

```typescript
export function tryPushRing<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
  item: T,
  onResize?: (cap: number) => void,
): Result<void, BufferOverflowError>
```

*JSDoc отсутствует*

---

### `tryUnshiftRing`

```typescript
export function tryUnshiftRing<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
  item: T,
  onResize?: (cap: number) => void,
): Result<void, BufferOverflowError>
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferMutation.ts`

### `swapBufferItems`

```typescript
export function swapBufferItems<T>(
  state: RingBufferState<T>,
  indexA: BufferRelativeIndex,
  indexB: BufferRelativeIndex,
): boolean
```

/**
* Swaps two elements in-place within the ring buffer using logical or negative relative indices.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @param indexA - Relative or logical index of first item (supports negative relative indexing).
* @param indexB - Relative or logical index of second item (supports negative relative indexing).
* @returns `true` if elements were swapped; `false` if either index was out of bounds.
*
* @example
* ```typescript
* swapBufferItems(state, 0, -1); // Swap first and last elements
* ```
*/

---

### `reverseBuffer`

```typescript
export function reverseBuffer<T>(state: RingBufferState<T>): void
```

/**
* Reverses all active elements in-place within the circular buffer without allocating scratch arrays.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state to reverse.
*
* @example
* ```typescript
* reverseBuffer(state);
* ```
*/

---

### `fillBuffer`

```typescript
export function fillBuffer<T>(state: RingBufferState<T>, value: T): void
```

/**
* Replaces all active element slots in the circular buffer with the specified value.
*
* @template T - Type of elements stored in the buffer.
* @param state - Target buffer state.
* @param value - Value to overwrite active slots with.
*
* @example
* ```typescript
* fillBuffer(state, null);
* ```
*/

---


## 📁 `utils/buffer/bufferQueue.ts`

### `maybeAutoExpand`

```typescript
function maybeAutoExpand<T>(state: RingBufferState<T>, onResize?: (newCap: number) => void): void
```

*JSDoc отсутствует*

---

### `evictSlot`

```typescript
function evictSlot<T>(state: RingBufferState<T>, physicalIndex: BufferPhysicalIndex): void
```

*JSDoc отсутствует*

---

### `pushItem`

```typescript
export function pushItem<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
  item: T,
  onResize?: (newCap: number) => void,
): void
```

*JSDoc отсутствует*

---

### `popItem`

```typescript
export function popItem<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): T | undefined
```

*JSDoc отсутствует*

---

### `shiftItem`

```typescript
export function shiftItem<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): T | undefined
```

*JSDoc отсутствует*

---

### `unshiftItem`

```typescript
export function unshiftItem<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
  item: T,
  onResize?: (newCap: number) => void,
): void
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferReduce.ts`

### `someInRing`

```typescript
export function someInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): boolean
```

/**
* Tests whether at least one element in the ring buffer passes the predicate test.
* Short-circuits immediately upon encountering a matching element.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param pred - Predicate function tested against elements.
* @returns `true` if any element matches; `false` otherwise.
*
* @example
* ```ts
* const hasPinned = someInRing(buffer.state, (card) => card.isPinned);
* ```
*/

---

### `everyInRing`

```typescript
export function everyInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): boolean
```

/**
* Tests whether all elements in the ring buffer pass the predicate test.
* Short-circuits immediately upon encountering the first non-matching element.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param pred - Predicate function tested against elements.
* @returns `true` if all elements match; `false` otherwise.
*
* @example
* ```ts
* const allMounted = everyInRing(buffer.state, (card) => card.mounted);
* ```
*/

---

### `reduceInRing`

```typescript
export function reduceInRing<T, U>(
  state: ReadonlyRingBufferState<T>,
  reducer: BufferReducer<T, U>,
  initial: U,
): U
```

/**
* Executes a reducer callback on each element in the ring buffer in chronological order (head to tail).
*
* @template T - Stored item type.
* @template U - Accumulated accumulator type.
* @param state - Readonly ring buffer state.
* @param reducer - Reducer callback function `(acc, item, index) => nextAcc`.
* @param initial - Initial seed accumulator value.
* @returns The final accumulated value.
*
* @example
* ```ts
* const totalWeight = reduceInRing(buffer.state, (sum, entry) => sum + entry.weight, 0);
* ```
*/

---

### `reduceRightInRing`

```typescript
export function reduceRightInRing<T, U>(
  state: ReadonlyRingBufferState<T>,
  reducer: BufferReducer<T, U>,
  initial: U,
): U
```

/**
* Executes a reducer callback on each element in the ring buffer in reverse chronological order (tail to head).
*
* @template T - Stored item type.
* @template U - Accumulated accumulator type.
* @param state - Readonly ring buffer state.
* @param reducer - Reducer callback function `(acc, item, index) => nextAcc`.
* @param initial - Initial seed accumulator value.
* @returns The final accumulated value.
*
* @example
* ```ts
* const latestSummary = reduceRightInRing(buffer.state, (acc, item) => `${acc}, ${item.id}`, '');
* ```
*/

---


## 📁 `utils/buffer/bufferResult.ts`

### `createRingBufferSafe`

```typescript
export function createRingBufferSafe<T>(
  opt: number | RingBufferOptions<T>,
  onEvict?: (item: T) => void,
  factory?: BufferFactory<T>,
): Result<RingBuffer<T>, BufferDomainError>
```

*JSDoc отсутствует*

---

### `createRingBufferFromSafe`

```typescript
export function createRingBufferFromSafe<T>(
  items: Iterable<T>,
  capacity?: number,
  factory?: BufferFactory<T>,
): Result<RingBuffer<T>, BufferDomainError>
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferSearch.ts`

### `indexOfInRing`

```typescript
export function indexOfInRing<T>(
  state: ReadonlyRingBufferState<T>,
  item: T,
  fromIndex: BufferRelativeIndex = 0,
): BufferLogicalIndex | -1
```

/**
* Searches for the first occurrence of an item in the ring buffer starting from `fromIndex`.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param item - Value to locate (strict equality `===`).
* @param fromIndex - Logical starting index (supports negative relative offsets).
* @returns The logical index of the match, or `-1` if not found.
*
* @example
* ```ts
* const idx = indexOfInRing(buffer.state, 'entry-1');
* ```
*/

---

### `lastIndexOfInRing`

```typescript
export function lastIndexOfInRing<T>(
  state: ReadonlyRingBufferState<T>,
  item: T,
  fromIndex?: BufferRelativeIndex,
): BufferLogicalIndex | -1
```

/**
* Searches backwards for the last occurrence of an item in the ring buffer starting from `fromIndex`.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param item - Value to locate (strict equality `===`).
* @param fromIndex - Logical starting index from which to search backwards.
* @returns The logical index of the match, or `-1` if not found.
*
* @example
* ```ts
* const lastIdx = lastIndexOfInRing(buffer.state, 'target');
* ```
*/

---

### `includesInRing`

```typescript
export function includesInRing<T>(
  state: ReadonlyRingBufferState<T>,
  item: T,
  fromIndex: BufferRelativeIndex = 0,
): boolean
```

/**
* Determines whether the ring buffer contains a specified value.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param item - Value to check for inclusion.
* @param fromIndex - Logical starting index to begin searching.
* @returns `true` if item exists in buffer; `false` otherwise.
*
* @example
* ```ts
* if (includesInRing(buffer.state, 'card-key')) { ... }
* ```
*/

---


## 📁 `utils/buffer/bufferSlice.ts`

### `sliceRing`

```typescript
export function sliceRing<T>(
  state: ReadonlyRingBufferState<T>,
  start: BufferRelativeIndex = 0,
  end: BufferRelativeIndex = state.count,
): T[]
```

/**
* Extracts a shallow array slice of elements from the ring buffer between `start` and `end`.
* Supports negative relative indices (e.g. `-1` refers to the last element).
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param start - Starting relative logical index (inclusive, defaults to 0).
* @param end - Ending relative logical index (exclusive, defaults to state.count).
* @returns An array containing the sliced elements in FIFO order.
*
* @example
* ```ts
* const recent = sliceRing(buffer.state, -5); // last 5 items
* ```
*/

---

### `countBound`

```typescript
function countBound(count: number, end: number): number
```

*JSDoc отсутствует*

---

### `copyRingTo`

```typescript
export function copyRingTo<T>(
  state: ReadonlyRingBufferState<T>,
  target: (T | undefined)[],
  targetOffset: BufferRelativeIndex = 0,
): number
```

/**
* Copies elements from the ring buffer into a target array starting at `targetOffset`.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state.
* @param target - Destination array.
* @param targetOffset - Offset index within target array to begin copying (default: 0).
* @returns Total number of elements successfully copied.
*
* @example
* ```ts
* const target = new Array(10);
* const copied = copyRingTo(buffer.state, target, 0);
* ```
*/

---

### `cloneRing`

```typescript
export function cloneRing<T>(
  state: ReadonlyRingBufferState<T>,
  createBuffer: (opt: RingBufferOptions<T>) => RingBuffer<T>,
): RingBuffer<T>
```

/**
* Creates an independent clone of the ring buffer preserving options and contents.
*
* @template T - Stored item type.
* @param state - Readonly ring buffer state to clone.
* @param createBuffer - Factory callback to instantiate the new buffer instance.
* @returns A new cloned RingBuffer instance.
*
* @example
* ```ts
* const cloned = cloneRing(buffer.state, (opts) => new RingBuffer(opts));
* ```
*/

---

### `resizeRing`

```typescript
export function resizeRing<T>(
  state: RingBufferState<T>,
  newCapacity: BufferCapacity | number,
): void
```

/**
* Resizes the underlying buffer array to a new capacity.
* If the new capacity is smaller than current item count, oldest elements are evicted.
*
* @template T - Stored item type.
* @param state - Mutable ring buffer state.
* @param newCapacity - New capacity integer.
*
* @example
* ```ts
* resizeRing(buffer.state, 128);
* ```
*/

---

### `shrinkRingToFit`

```typescript
export function shrinkRingToFit<T>(state: RingBufferState<T>): void
```

/**
* Shrinks the buffer capacity to match the current count of elements, freeing unused array slots.
*
* @template T - Stored item type.
* @param state - Mutable ring buffer state.
*
* @example
* ```ts
* shrinkRingToFit(buffer.state);
* ```
*/

---


## 📁 `utils/buffer/bufferState.ts`

### `createRingBufferState`

```typescript
export function createRingBufferState<T>(config: ResolvedBufferConfig<T>): RingBufferState<T>
```

*JSDoc отсутствует*

---

### `evictBufferItems`

```typescript
export function evictBufferItems<T>(state: RingBufferState<T>, count: number): void
```

*JSDoc отсутствует*

---

### `clearRingBufferState`

```typescript
export function clearRingBufferState<T>(state: RingBufferState<T>): void
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/bufferTransform.ts`

### `mapRingBuffer`

```typescript
export function mapRingBuffer<T, U>(
  state: ReadonlyRingBufferState<T>,
  fn: BufferTransform<T, U>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<U>,
): RingBuffer<U>
```

/**
* Transforms buffer elements by applying a mapping projection function to each item.
* Preserves buffer capacity while creating a new strongly typed RingBuffer container.
*
* @param state - Current ring buffer state snapshot.
* @param fn - Transformation function applied to each buffer entry.
* @param createBuffer - Factory method to instantiate the result buffer.
* @returns A newly populated RingBuffer instance containing mapped elements.
*/

---

### `filterRingBuffer`

```typescript
export function filterRingBuffer<T, S extends T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferTypeGuard<T, S>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<S>,
): RingBuffer<S>
```

/**
* Filters elements of a ring buffer using a predicate or type guard into a new RingBuffer.
*
* @template T - Original item type.
* @template S - Filtered subtype.
* @param state - Current ring buffer state.
* @param pred - Predicate or type guard function.
* @param createBuffer - Factory callback to instantiate the result buffer.
* @returns A new RingBuffer containing only matching items.
*
* @example
* ```ts
* const pinnedOnly = filterRingBuffer(buffer.state, (it) => it.isPinned, createBuf);
* ```
*/

---

### `filterRingBuffer`

```typescript
export function filterRingBuffer<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<T>,
): RingBuffer<T>
```

*JSDoc отсутствует*

---

### `filterRingBuffer`

```typescript
export function filterRingBuffer<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<T>,
): RingBuffer<T>
```

*JSDoc отсутствует*

---

### `isIterable`

```typescript
function isIterable<T>(val: unknown): val is Iterable<T>
```

*JSDoc отсутствует*

---

### `flatMapRingBuffer`

```typescript
export function flatMapRingBuffer<T, U>(
  state: ReadonlyRingBufferState<T>,
  fn: BufferTransform<T, Iterable<U> | U>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<U>,
): RingBuffer<U>
```

/**
* Maps each element using a mapping function and flattens the result into a new RingBuffer.
*
* @template T - Input item type.
* @template U - Output item type.
* @param state - Current ring buffer state.
* @param fn - Mapping function returning either a single item or an iterable collection.
* @param createBuffer - Factory callback to instantiate the result buffer.
* @returns A new RingBuffer containing flattened items.
*
* @example
* ```ts
* const flattened = flatMapRingBuffer(buffer.state, (card) => card.tags, createBuf);
* ```
*/

---


## 📁 `utils/buffer/ringBufferCore.ts`

### `create`

```typescript
static create<T>(
    opt: BufferCapacity | number | RingBufferOptions<T>,
    evict?: (i: T) => void,
  ): Result<RingBuffer<T>, BufferDomainError>
```

*JSDoc отсутствует*

---

### `from`

```typescript
static from<T>(
    items: Iterable<T>,
    cap?: BufferCapacity | number,
  ): Result<RingBuffer<T>, BufferDomainError>
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/ringBufferTransform.test.ts`

### `isCircle`

```typescript
const isCircle = (s: Shape): s is
```

*JSDoc отсутствует*

---


## 📁 `utils/buffer/ringBufferTypes.test-d.ts`

### `isDog`

```typescript
const isDog = (item: Animal, _idx: number): item is
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/basePopoverCache.ts`

### `get`

```typescript
public get(key: string): TData | undefined
```

*JSDoc отсутствует*

---

### `set`

```typescript
public set(key: string, data: TData, ttlOrOpts?: number | CacheSetOptions): void
```

*JSDoc отсутствует*

---

### `has`

```typescript
public has(key: string): boolean
```

*JSDoc отсутствует*

---

### `delete`

```typescript
public delete(key: string): boolean
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(): void
```

*JSDoc отсутствует*

---

### `getMany`

```typescript
public getMany(keys: readonly string[]): Map<string, TData>
```

*JSDoc отсутствует*

---

### `setMany`

```typescript
public setMany(entries: readonly BatchSetTuple<TData>[]): void
```

*JSDoc отсутствует*

---

### `deleteMany`

```typescript
public deleteMany(keys: readonly string[]): number
```

*JSDoc отсутствует*

---

### `emitInvalidation`

```typescript
protected emitInvalidation(key: string): void
```

*JSDoc отсутствует*

---

### `stats`

```typescript
public stats(): CacheStats
```

*JSDoc отсутствует*

---

### `destroy`

```typescript
public destroy(): void
```

*JSDoc отсутствует*

---

### `dispose`

```typescript
public dispose(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheBatchOperations.ts`

### `getManyEntries`

```typescript
export function getManyEntries<T>(
  storage: StorageAdapter<T>,
  stats: CacheStatsTracker,
  events: CacheEventEmitter<T>,
  keys: readonly string[],
): Map<string, T>
```

/**
* Retrieves multiple cached entries simultaneously, recording cache hits and misses.
*
* @template T - The stored data type.
* @param storage - The storage adapter backing the cache.
* @param stats - The cache stats tracker.
* @param events - The event emitter for hit/miss notifications.
* @param keys - Array of keys to retrieve.
* @returns A Map containing only the keys that were found and non-expired with their values.
*
* @example
* ```ts
* const results = getManyEntries(storage, stats, events, ['card-1', 'card-2']);
* const card1 = results.get('card-1');
* ```
*/

---

### `setManyEntries`

```typescript
export function setManyEntries<T>(
  storage: StorageAdapter<T>,
  maxSize: number,
  defaultTtl: number,
  events: CacheEventEmitter<T>,
  entries: readonly BatchSetTuple<T>[],
  onEvict?: (key: string, reason: 'expired' | 'lru' | 'weight') => void,
): void
```

/**
* Writes multiple entries to cache in a single batch operation, triggering capacity checks and eviction as needed.
*
* @template T - The stored data type.
* @param storage - The storage adapter backing the cache.
* @param maxSize - Maximum entry capacity allowed in the cache.
* @param defaultTtl - Default time-to-live in milliseconds if not specified per entry.
* @param events - The event emitter for set notifications.
* @param entries - Array of `BatchSetTuple` entries to store.
* @param onEvict - Optional callback invoked when capacity eviction occurs.
*
* @example
* ```ts
* setManyEntries(storage, 100, 60000, events, [
*   ['key-1', data1],
*   ['key-2', data2, { ttl: 30000 }],
* ]);
* ```
*/

---

### `deleteManyEntries`

```typescript
export function deleteManyEntries<T>(
  storage: StorageAdapter<T>,
  keys: readonly string[],
  onDeleted?: (key: string) => void,
): number
```

/**
* Deletes multiple keys from cache, counting successfully removed entries.
*
* @template T - The stored data type.
* @param storage - The storage adapter backing the cache.
* @param keys - Array of keys to delete.
* @param onDeleted - Optional callback invoked for each successfully deleted key.
* @returns The total number of keys successfully deleted.
*
* @example
* ```ts
* const removedCount = deleteManyEntries(storage, ['key-1', 'key-2']);
* ```
*/

---


## 📁 `utils/cache/cacheConfigParser.ts`

### `parseCacheOptions`

```typescript
export function parseCacheOptions<T>(
  ttlOrOpts: number | CacheOptions<T> = DEFAULT_CACHE_TTL_MS,
  defaultSize = DEFAULT_CACHE_MAX_SIZE,
): ParsedCacheOptions<T>
```

/**
* Normalizes input cache configurations or numerical TTLs into a sanitized options object.
*
* @remarks
* Validates that TTL and capacity numbers are finite positive values, falling back to
* `DEFAULT_CACHE_TTL_MS` (5 minutes) and `DEFAULT_CACHE_MAX_SIZE` (500 entries) when invalid.
*
* @template T - Type of payload stored in cache.
* @param ttlOrOpts - Numerical TTL in milliseconds or partial `CacheOptions` object.
* @param defaultSize - Fallback maximum size if not specified (default: 500).
* @returns Fully validated `ParsedCacheOptions<T>` structure.
*
* @example
* ```typescript
* const config = parseCacheOptions({ ttlMs: 60000, maxSize: 200 });
* console.log(config.ttl); // 60000
* console.log(config.maxSize); // 200
* ```
*/

---


## 📁 `utils/cache/cacheCoreOperations.ts`

### `readCacheEntry`

```typescript
export function readCacheEntry<T>(
  storage: StorageAdapter<T>,
  stats: CacheStatsTracker,
  events: CacheEventEmitter<T>,
  key: string,
): T | undefined
```

/**
* Retrieves a cached entry by key, validating temporal expiration and updating LRU positioning.
*
* @remarks
* Implements a non-destructive read with LRU re-insertion: if the entry is valid, it is deleted
* and re-inserted to move it to the most recently used position in iteration-ordered storage.
* If the entry is expired, it is lazily evicted, triggering an `'evict'` event and recording a miss.
*
* @template T - The payload data type.
* @param storage - Underlying storage adapter holding the cache entries.
* @param stats - Statistics tracker for hit and miss counters.
* @param events - Event emitter for cache lifecycle notifications.
* @param key - Cache key to inspect.
* @returns The cached payload if valid and unexpired; otherwise `undefined`.
*/

---

### `writeCacheEntry`

```typescript
export function writeCacheEntry<T>(
  storage: StorageAdapter<T>,
  maxSize: number,
  defaultTtl: number,
  events: CacheEventEmitter<T>,
  key: string,
  data: T,
  ttlOrOpts?: number | CacheSetOptions,
  onEvict?: (key: string, reason: 'expired' | 'lru' | 'weight') => void,
): void
```

/**
* Writes or updates an entry in the cache storage, enforcing capacity constraints and calculating metadata.
*
* @remarks
* Prior to insertion, `ensureCapacity` is executed to evict the least recently used or expired items
* if the total size exceeds `maxSize`. If the payload is a Promise, rejection handlers are attached
* to automatically purge the pending key upon failure to prevent caching broken promises.
*
* @template T - The payload data type.
* @param storage - Underlying storage adapter.
* @param maxSize - Maximum item limit before LRU eviction triggers.
* @param defaultTtl - Default TTL in milliseconds if not specified in `ttlOrOpts`.
* @param events - Event emitter for cache notifications.
* @param key - Storage key.
* @param data - Payload value or promise to store.
* @param ttlOrOpts - Numerical TTL in milliseconds or structured `CacheSetOptions`.
* @param onEvict - Optional custom eviction callback.
*/

---

### `hasCacheEntry`

```typescript
export function hasCacheEntry<T>(storage: StorageAdapter<T>, key: string): boolean
```

/**
* Checks if a key exists in cache storage and is unexpired.
*
* @remarks
* If the key exists but its TTL has lapsed, it is lazily deleted and returns `false`.
*
* @template T - The payload data type.
* @param storage - Underlying storage adapter.
* @param key - Storage key to query.
* @returns `true` if a valid unexpired entry exists, otherwise `false`.
*/

---

### `getCacheEntryState`

```typescript
export function getCacheEntryState<T>(entry: CacheEntry<T>, now = Date.now()): CacheEntryState<T>
```

/**
* Evaluates the freshness status of a cache entry.
*
* Checks time against expiration thresholds:
* 1. `expired`: `now > entry.expiry` (past TTL; needs re-fetch or removal).
* 2. `stale`: `entry.staleAt !== undefined && now >= entry.staleAt` (past freshness window, but still within hard expiry).
* 3. `fresh`: `now < entry.expiry` and (if configured) `now < entry.staleAt` (fully valid).
*
* @remarks
* Pure and deterministic when passing the `now` timestamp directly.
*
* @example
* ```ts
* const state = getCacheEntryState(entry, Date.now());
* if (state.status === 'stale') {
*   // Serve stale.data immediately, schedule background revalidation
*   scheduleBackgroundFetch(key);
* }
* ```
*
* @template T - Payload data type.
* @param entry - Cache entry to evaluate.
* @param now - Reference timestamp in milliseconds (defaults to `Date.now()`).
* @returns Discriminated union of type `CacheEntryState<T>`.
*/

---


## 📁 `utils/cache/cacheDAGInvalidation.ts`

### `invalidateDAGBranch`

```typescript
export function invalidateDAGBranch<T = unknown>(
  storage: StorageAdapter<T>,
  rootKey: string,
  getChildren: (key: string) => Iterable<string> | readonly string[] | undefined,
  onDelete?: (key: string) => void,
): number
```

/**
* Recursively invalidates a branch in a directed acyclic graph (DAG) hierarchy in post-order.
*
* Traversal visits all reachable descendants first, accumulating keys in bottom-up order,
* ensuring children are purged before parents. Cycle protection is guaranteed via a visited set.
*
* @template T - The stored data type.
* @param storage - The storage adapter backing the cache.
* @param rootKey - The root entry key whose subtree should be invalidated.
* @param getChildren - Function providing child keys for a given node.
* @param onDelete - Optional callback invoked after each key deletion.
* @returns The number of entries successfully deleted from storage.
*
* @example
* ```ts
* const deleted = invalidateDAGBranch(
*   storage,
*   'menu-root',
*   (key) => childMap.get(key),
*   (deletedKey) => console.log('Deleted:', deletedKey)
* );
* ```
*/

---

### `collect`

```typescript
function collect(currentKey: string): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheEventEmitter.ts`

### `on`

```typescript
public on<E extends CacheEventType>(
    event: E,
    listener: (payload: CacheEventMap<TData>[E]) => void,
  ): () => void
```

*JSDoc отсутствует*

---

### `emit`

```typescript
public emit<E extends CacheEventType>(event: E, payload: CacheEventMap<TData>[E]): void
```

*JSDoc отсутствует*

---

### `hasListeners`

```typescript
public hasListeners(event: CacheEventType): boolean
```

*JSDoc отсутствует*

---

### `subscribe`

```typescript
public subscribe(key: string, listener: (value: TData | undefined) => void): () => void
```

*JSDoc отсутствует*

---

### `notify`

```typescript
public notify(key: string, value: TData | undefined): void
```

*JSDoc отсутствует*

---

### `hasKeySubscribers`

```typescript
public hasKeySubscribers(key: string): boolean
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheEventRevalidator.ts`

### `register`

```typescript
public register(callback: () => void): () => void
```

*JSDoc отсутствует*

---

### `ensureBound`

```typescript
private ensureBound(): void
```

*JSDoc отсутствует*

---

### `unbind`

```typescript
private unbind(): void
```

*JSDoc отсутствует*

---

### `trigger`

```typescript
public trigger(): void
```

*JSDoc отсутствует*

---

### `destroy`

```typescript
public destroy(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheEviction.ts`

### `findEvictionCandidate`

```typescript
export function findEvictionCandidate<T>(
  entries: Iterable<[string, CacheEntry<T>]>,
  now: number,
): EvictionTarget | undefined
```

/**
* Scans cache entries to identify the optimal eviction candidate.
* Prioritizes expired entries over active entries, falling back to the oldest (LRU) entry.
*
* @template T - The stored entry type.
* @param entries - An iterable sequence of `[key, entry]` pairs.
* @param now - Current timestamp in milliseconds.
* @returns The best eviction target candidate, or `undefined` if the iterable is empty.
*
* @example
* ```ts
* const target = findEvictionCandidate(storage.entries(), Date.now());
* if (target) {
*   storage.delete(target.key);
* }
* ```
*/

---

### `ensureCapacity`

```typescript
export function ensureCapacity<T>(
  storage: StorageAdapter<T>,
  maxSize: number,
  newKey: string,
  onEvict?: (key: string, reason: 'expired' | 'lru' | 'weight') => void,
): void
```

/**
* Ensures cache storage stays strictly within the `maxSize` cardinality limit.
* If storage is at or over capacity, repeatedly evicts candidates (expired first, then LRU).
*
* @template T - The stored entry type.
* @param storage - The storage adapter backing the cache.
* @param maxSize - Maximum allowed number of entries.
* @param newKey - The incoming key to be written.
* @param onEvict - Optional callback invoked when an entry is evicted.
*
* @example
* ```ts
* ensureCapacity(storage, 100, 'new-key', (evictedKey, reason) => {
*   console.log(`Evicted ${evictedKey} due to ${reason}`);
* });
* ```
*/

---

### `ensureWeightBudget`

```typescript
export function ensureWeightBudget<T>(
  storage: StorageAdapter<T>,
  weights: CacheWeightTracker,
  onEvict?: (key: string, reason: 'weight') => void,
): void
```

/**
* Ensures that total cache memory weight does not exceed the configured weight budget.
* Continuously evicts candidates until the tracker indicates memory is back within bounds.
*
* @template T - The stored entry type.
* @param storage - The storage adapter backing the cache.
* @param weights - The `CacheWeightTracker` managing memory weights.
* @param onEvict - Optional callback invoked when an entry is evicted for weight.
*
* @example
* ```ts
* ensureWeightBudget(storage, weightTracker, (key) => {
*   weightTracker.recordEviction(key);
* });
* ```
*/

---


## 📁 `utils/cache/cacheInvalidation.test.ts`

### `storage`

```typescript
const storage = (cache as unknown as { storage: StorageAdapter<string> }).storage
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheInvalidation.ts`

### `invalidateMatching`

```typescript
function invalidateMatching<T>(
  storage: StorageAdapter<T>,
  predicate: (key: string, entry: CacheEntry<T> | undefined) => boolean,
): number
```

*JSDoc отсутствует*

---

### `pruneExpiredEntries`

```typescript
export function pruneExpiredEntries<T>(storage: StorageAdapter<T>, now = Date.now()): number
```

/**
* Scans storage and purges all entries whose expiration timestamp is less than `now`.
*
* @template T - The stored entry value type.
* @param storage - The storage adapter backing the cache.
* @param now - Current timestamp in milliseconds (defaults to Date.now()).
* @returns The number of expired entries deleted.
*
* @example
* ```ts
* const purgedCount = pruneExpiredEntries(storage);
* ```
*/

---

### `invalidateByPrefix`

```typescript
export function invalidateByPrefix<T>(storage: StorageAdapter<T>, prefix: string): number
```

/**
* Removes all entries whose keys begin with the given string prefix.
*
* @template T - The stored entry value type.
* @param storage - The storage adapter backing the cache.
* @param prefix - Prefix string to match (e.g. `user:` or `panel-`).
* @returns The number of matched entries deleted.
*
* @example
* ```ts
* const cleared = invalidateByPrefix(storage, 'user:');
* ```
*/

---

### `invalidateByPattern`

```typescript
export function invalidateByPattern<T>(storage: StorageAdapter<T>, regex: RegExp): number
```

/**
* Removes all entries whose keys match a regular expression pattern.
*
* @template T - The stored entry value type.
* @param storage - The storage adapter backing the cache.
* @param regex - Regular expression to test keys against.
* @returns The number of matched entries deleted.
*
* @example
* ```ts
* const cleared = invalidateByPattern(storage, /^session-[0-9]+$/);
* ```
*/

---

### `invalidateByTags`

```typescript
export function invalidateByTags<T>(
  storage: StorageAdapter<T>,
  targetTags: readonly string[],
): number
```

/**
* Removes all entries that possess at least one of the specified tags.
*
* @template T - The stored entry value type.
* @param storage - The storage adapter backing the cache.
* @param targetTags - List of tags to match against entry tags.
* @returns The number of matched entries deleted.
*
* @example
* ```ts
* const cleared = invalidateByTags(storage, ['profile', 'avatar']);
* ```
*/

---


## 📁 `utils/cache/cacheNamespace.ts`

### `createScopedCache`

```typescript
export function createScopedCache<TData>(
  parent: SimplePopoverCache<TData>,
  namespace: string,
): ScopedPopoverCache<TData>
```

/**
* Creates an isolated sub-cache partitioned by a namespace prefix (e.g., `modal:profile:`).
*
* All operations on the returned scoped cache automatically prepend `${namespace}:` to keys,
* and calling `clear()` will only invalidate entries bearing this prefix.
*
* @template TData - Stored data type.
* @param parent - The root or parent `SimplePopoverCache` instance.
* @param namespace - Namespace identifier string.
* @returns A scoped cache instance constrained to the given namespace.
*
* @example
* ```ts
* const userCache = createScopedCache(rootCache, 'users');
* userCache.set('42', { name: 'Alice' }); // Stores as 'users:42' in rootCache
*
* userCache.get('42'); // returns { name: 'Alice' }
* userCache.clear(); // invalidates all 'users:*' keys
* ```
*/

---


## 📁 `utils/cache/cacheRejection.ts`

### `isCatchable`

```typescript
function isCatchable(val: unknown): val is
```

*JSDoc отсутствует*

---

### `handlePromiseRejection`

```typescript
export function handlePromiseRejection<T>(storage: StorageAdapter<T>, key: string, data: T): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheSequenceGuard.ts`

### `next`

```typescript
public next(key: string): number
```

*JSDoc отсутствует*

---

### `isLatest`

```typescript
public isLatest(key: string, ticket: number): boolean
```

*JSDoc отсутствует*

---

### `delete`

```typescript
public delete(key: string): boolean
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheSlidingExpiration.ts`

### `touchCacheEntry`

```typescript
export function touchCacheEntry<T = unknown>(
  storage: StorageAdapter<T>,
  key: string,
  opts: number | TouchOptions,
): boolean
```

/**
* Extends the TTL (time-to-live) of an active cache entry (sliding window expiration).
*
* If the entry is already expired or has exceeded its `maxLifetimeMs` ceiling,
* it is deleted from storage and `false` is returned.
*
* @template T - The stored entry value type.
* @param storage - The storage adapter holding the entry.
* @param key - The cache key to touch.
* @param opts - Extension duration in milliseconds or a structured `TouchOptions` object.
* @returns `true` if the entry was found, valid, and successfully refreshed; `false` otherwise.
*
* @example
* ```ts
* // Extend by 5 seconds on user activity:
* const refreshed = touchCacheEntry(storage, 'user-session', 5000);
*
* // Extend by 5 seconds with a hard 30-minute ceiling:
* touchCacheEntry(storage, 'auth-token', { extensionMs: 5000, maxLifetimeMs: 1800000 });
* ```
*/

---


## 📁 `utils/cache/cacheSnapshot.ts`

### `isValidSnapshotEntry`

```typescript
function isValidSnapshotEntry<T>(entry: unknown): entry is CacheEntry<T>
```

*JSDoc отсутствует*

---

### `exportCacheSnapshot`

```typescript
export function exportCacheSnapshot<T>(storage: StorageAdapter<T>): Array<[string, CacheEntry<T>]>
```

/**
* Serializes all entries from a cache storage adapter into an exportable array of key-entry tuples.
*
* @template T - Type of payload stored in cache.
* @param storage - Storage adapter to dump.
* @returns Array of [key, CacheEntry] tuples representing current storage state.
*
* @example
* ```typescript
* const entries = exportCacheSnapshot(cache.storage);
* localStorage.setItem('saved_cache', JSON.stringify(entries));
* ```
*/

---

### `restoreCacheSnapshot`

```typescript
export function restoreCacheSnapshot<T>(
  storage: StorageAdapter<T>,
  snapshot: Iterable<unknown>,
  maxSize: number,
  events: CacheEventEmitter<T>,
): number
```

/**
* Restores cache entries from an exported snapshot into storage with prototype-pollution immunity.
*
* @remarks
* Filters out prototype pollution attempts (`__proto__`, `constructor`, `prototype`), expired entries,
* and malformed records. Enforces capacity limits using `ensureCapacity`.
*
* @template T - Type of payload stored in cache.
* @param storage - Target storage adapter to populate.
* @param snapshot - Iterable collection of candidate key-entry tuples.
* @param maxSize - Maximum storage capacity threshold.
* @param events - Event emitter to dispatch notifications for restored keys with active subscribers.
* @returns Total count of valid entries successfully ingested into storage.
*
* @example
* ```typescript
* const restoredCount = restoreCacheSnapshot(cache.storage, savedEntries, 200, cache.events);
* console.log(`Restored ${restoredCount} entries`);
* ```
*/

---


## 📁 `utils/cache/cacheStatsTracker.ts`

### `recordHit`

```typescript
public recordHit(): void
```

*JSDoc отсутствует*

---

### `recordMiss`

```typescript
public recordMiss(): void
```

*JSDoc отсутствует*

---

### `getStats`

```typescript
public getStats(currentSize: number): CacheStats
```

*JSDoc отсутствует*

---

### `reset`

```typescript
public reset(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheStorage.ts`

### `get`

```typescript
public get(key: string): CacheEntry<T> | undefined
```

*JSDoc отсутствует*

---

### `set`

```typescript
public set(key: string, entry: CacheEntry<T>): void
```

*JSDoc отсутствует*

---

### `delete`

```typescript
public delete(key: string): boolean
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(): void
```

*JSDoc отсутствует*

---

### `keys`

```typescript
public keys(): Iterable<string>
```

*JSDoc отсутствует*

---

### `entries`

```typescript
public entries(): Iterable<[string, CacheEntry<T>]>
```

*JSDoc отсутствует*

---

### `broadcastInvalidate`

```typescript
public broadcastInvalidate(key: string): void
```

*JSDoc отсутствует*

---

### `destroy`

```typescript
public destroy(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheSWRController.ts`

### `isUpdaterFunction`

```typescript
function isUpdaterFunction<TData>(value: TData | UpdaterFn<TData>): value is UpdaterFn<TData>
```

*JSDoc отсутствует*

---

### `resolveUpdater`

```typescript
function resolveUpdater<TData>(
  updater: TData | UpdaterFn<TData>,
  previous: TData | undefined,
): TData
```

*JSDoc отсутствует*

---

### `revalidate`

```typescript
public async revalidate(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData>
```

/**
* Forces revalidation of an entry via its fetcher function.
* Emits a 'revalidate' event on success or 'error' event on failure.
* Race conditions from out-of-order responses are rejected via sequenceGuard tickets.
*
* @param key - Cache key to revalidate.
* @param fetcher - Async loader function.
* @param opts - Optional SWR configuration (retries, retryDelayMs).
* @returns Promise resolving to the fresh fetched data.
*/

---

### `task`

```typescript
const task = async () =>
```

*JSDoc отсутствует*

---

### `execute`

```typescript
public async execute(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData>
```

/**
* Reads data adhering to Stale-While-Revalidate semantics:
* - If cached and fresh: returns immediately.
* - If cached but stale: returns cached value immediately while triggering background revalidation.
* - If not cached: awaits revalidation and returns fresh data.
*
* @param key - Cache key.
* @param fetcher - Async loader function.
* @param opts - Optional SWR configuration.
* @returns Promise resolving to either fresh or stale data.
*/

---

### `mutate`

```typescript
public mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData
```

/**
* Optimistically updates or sets data for a key, invalidating any pending background fetch tickets.
*
* @param key - Cache key to mutate.
* @param updater - New value or functional updater receiving previous value.
* @returns The updated value stored in the cache.
*
* @example
* ```ts
* swr.mutate('counter', (prev = 0) => prev + 1);
* ```
*/

---

### `clear`

```typescript
public clear(): void
```

/**
* Resets sequence ticket guards.
*/

---


## 📁 `utils/cache/cacheSWRRunner.ts`

### `runDeduplicated`

```typescript
public async runDeduplicated(key: string, task: () => Promise<T>): Promise<T>
```

/**
* Executes a task function deduplicating simultaneous requests for the same key.
* If a task for the key is already running, returns the existing in-flight Promise.
*
* @param key - Unique cache key identifier.
* @param task - Async task returning the desired value.
* @returns Promise resolving to the task outcome.
*
* @example
* ```ts
* const p1 = runner.runDeduplicated('key1', fetchFn);
* const p2 = runner.runDeduplicated('key1', fetchFn);
* // p1 === p2, only one fetchFn call is initiated.
* ```
*/

---

### `runWithRetry`

```typescript
public async runWithRetry(
    task: () => Promise<T>,
    retries = 2,
    baseDelayMs = 200,
    attempt = 1,
  ): Promise<T>
```

/**
* Runs an asynchronous task with exponential backoff and jittered delays on failure.
*
* @param task - Async task function to execute.
* @param retries - Maximum number of retries before throwing (default: 2).
* @param baseDelayMs - Base retry delay in milliseconds (default: 200).
* @param attempt - Internal tracker for the current attempt count.
* @returns Promise resolving to the successful task output.
*
* @example
* ```ts
* const result = await runner.runWithRetry(() => fetchApi('/endpoint'), 3, 300);
* ```
*/

---

### `jitter`

```typescript
const jitter = (attempt * 17) % 50
```

*JSDoc отсутствует*

---

### `isInFlight`

```typescript
public isInFlight(key: string): boolean
```

/**
* Checks whether an asynchronous operation is currently in-flight for the specified key.
*
* @param key - The cache key to check.
* @returns `true` if a request is actively in-flight; `false` otherwise.
*/

---

### `clear`

```typescript
public clear(): void
```

/**
* Clears all in-flight tracking entries.
*/

---


## 📁 `utils/cache/cacheTagIndex.ts`

### `register`

```typescript
public register(key: string, tags?: readonly string[]): void
```

/**
* Associates an entry key with one or more tags.
* Cleans up prior associations if the key was already registered.
*
* @param key - The cache entry key.
* @param tags - Optional list of tags to associate.
*/

---

### `unregister`

```typescript
public unregister(key: string): void
```

/**
* Unregisters a key, removing all of its tag associations.
*
* @param key - The cache entry key to remove.
*/

---

### `getKeysForTag`

```typescript
public getKeysForTag(tag: string): ReadonlySet<string> | undefined
```

/**
* Returns all keys associated with a specific tag.
*
* @param tag - Tag name.
* @returns Readonly set of matching keys, or undefined if no keys match.
*/

---

### `getKeysForTags`

```typescript
public getKeysForTags(tags: readonly string[]): Set<string>
```

/**
* Returns a deduplicated Set of keys associated with any of the provided tags.
*
* @param tags - Array of tags to query.
* @returns Set of keys matching any of the specified tags.
*/

---

### `clear`

```typescript
public clear(): void
```

/**
* Clears all tag-to-key and key-to-tag index records.
*/

---

### `invalidateWithTagIndex`

```typescript
export function invalidateWithTagIndex(
  storage: { delete(key: string): boolean },
  tagIndex: CacheTagIndex,
  tags: string | readonly string[],
  onDelete?: (key: string) => void,
): number
```

/**
* Invalidates all cache entries matching the specified tags using the inverted tag index.
*
* @param storage - Object with a `delete` method (such as a CacheStorageAdapter).
* @param tagIndex - The `CacheTagIndex` holding tag mappings.
* @param tags - A single tag string or list of tag strings to invalidate.
* @param onDelete - Optional callback invoked after each key deletion.
* @returns The total number of entries successfully deleted.
*
* @example
* ```ts
* const purged = invalidateWithTagIndex(storage, tagIndex, ['dashboard', 'analytics']);
* ```
*/

---


## 📁 `utils/cache/cacheTieredStorage.ts`

### `get`

```typescript
public get(key: string): CacheEntry<T> | undefined
```

*JSDoc отсутствует*

---

### `set`

```typescript
public set(key: string, entry: CacheEntry<T>): void
```

*JSDoc отсутствует*

---

### `delete`

```typescript
public delete(key: string): boolean
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheTimer.ts`

### `hasUnrefMethod`

```typescript
function hasUnrefMethod(timer: unknown): timer is
```

*JSDoc отсутствует*

---

### `safeUnref`

```typescript
function safeUnref(timer: ReturnType<typeof setInterval>): void
```

*JSDoc отсутствует*

---

### `startPruneTimer`

```typescript
public startPruneTimer(intervalMs: number, task: () => void): void
```

/**
* Starts a background pruning interval if not already active.
*
* @param intervalMs - Duration in milliseconds between prune runs.
* @param task - Maintenance callback to invoke on each tick.
*
* @example
* ```typescript
* timers.startPruneTimer(30000, () => cache.evictExpired());
* ```
*/

---

### `registerPolling`

```typescript
public registerPolling(key: string, intervalMs: number, task: () => void): () => void
```

/**
* Registers a recurring polling timer for a specific cache key.
*
* @param key - Cache key identifying this polling stream.
* @param intervalMs - Polling interval in milliseconds.
* @param task - Execution callback for each poll tick.
* @returns Cleanup function that stops polling for this key.
*
* @example
* ```typescript
* const stop = timers.registerPolling('user-profile', 5000, () => fetchProfile());
* // Later:
* stop();
* ```
*/

---

### `stopPolling`

```typescript
public stopPolling(key: string): void
```

/**
* Cancels and removes the active polling timer for the specified key.
*
* @param key - Cache key to stop polling for.
*/

---

### `destroy`

```typescript
public destroy(): void
```

/**
* Disposes all active prune and polling intervals idempotently.
*/

---


## 📁 `utils/cache/cacheWeightEstimator.ts`

### `estimateByteWeight`

```typescript
export function estimateByteWeight(value: unknown, depth = 0, maxDepth = 2): number
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/cacheWeightTracker.ts`

### `add`

```typescript
public add(weight = 1): void
```

*JSDoc отсутствует*

---

### `remove`

```typescript
public remove(weight = 1): void
```

*JSDoc отсутствует*

---

### `isOverBudget`

```typescript
public isOverBudget(): boolean
```

*JSDoc отсутствует*

---

### `reset`

```typescript
public reset(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/invalidatablePopoverCache.ts`

### `pruneExpired`

```typescript
public pruneExpired(): number
```

*JSDoc отсутствует*

---

### `invalidatePrefix`

```typescript
public invalidatePrefix(prefix: string): number
```

*JSDoc отсутствует*

---

### `invalidatePattern`

```typescript
public invalidatePattern(regex: RegExp): number
```

*JSDoc отсутствует*

---

### `invalidateTags`

```typescript
public invalidateTags(tags: string | readonly string[]): number
```

*JSDoc отсутствует*

---

### `invalidateBranch`

```typescript
public invalidateBranch(
    rootKey: string,
    getChildren: (key: string) => Iterable<string> | readonly string[] | undefined,
  ): number
```

*JSDoc отсутствует*

---

### `touch`

```typescript
public touch(key: string, opts?: number | TouchOptions): boolean
```

*JSDoc отсутствует*

---


## 📁 `utils/cache/SimplePopoverCache.ts`

### `isStale`

```typescript
public isStale(key: string): boolean
```

/**
* Checks if a cached key has passed its time-to-live (TTL) or stale-while-revalidate threshold.
*
* @param key - Cache entry key to check.
* @returns `true` if missing or expired, `false` if fresh.
*/

---

### `getOrSet`

```typescript
public getOrSet(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData>
```

/**
* Retrieves an item from cache, or fetches and stores it if missing or stale.
*
* @param key - Cache key identifier.
* @param fetcher - Async loader function.
* @param opts - SWR fetch options (deduplication, timeout, stale-while-revalidate).
*/

---

### `mutate`

```typescript
public mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData
```

/**
* Optimistically updates a cached value and notifies key subscribers.
*
* @param key - Cache key to update.
* @param updater - New value or update function receiving the previous value.
* @returns The updated value.
*/

---

### `revalidate`

```typescript
public revalidate(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData>
```

/**
* Forces revalidation of a key in the background, updating the cache upon resolution.
*
* @param key - Cache key to refresh.
* @param fetcher - Async loader function.
* @param opts - SWR options.
*/

---

### `poll`

```typescript
public poll(key: string, intervalMs: number, fetcher: () => Promise<TData>): () => void
```

/**
* Periodically polls a remote data source at fixed intervals and updates the cache.
*
* @param key - Cache key.
* @param intervalMs - Polling interval in milliseconds.
* @param fetcher - Async loader function.
* @returns Cleanup function to stop polling.
*/

---

### `scope`

```typescript
public scope(namespace: string): ScopedPopoverCache<TData>
```

/**
* Creates a namespaced sub-cache instance where all keys are prefixed automatically.
*
* @param namespace - Prefix namespace string.
* @returns Scoped cache wrapper.
*/

---

### `dump`

```typescript
public dump(): Array<[string, CacheEntry<TData>]>
```

/**
* Serializes all cached entries into an exportable array for persistence or debugging.
*/

---

### `restore`

```typescript
public restore(snapshot: Iterable<unknown>): number
```

/**
* Restores cached entries from a previously exported snapshot.
*
* @param snapshot - Iterable collection of key-entry tuples.
* @returns Number of successfully restored entries.
*/

---

### `subscribe`

```typescript
public subscribe(key: string, listener: (value: TData | undefined) => void): () => void
```

/**
* Subscribes a listener callback to changes for a specific cache key.
*
* @param key - Key to monitor.
* @param listener - Callback receiving the new value or undefined if evicted.
* @returns Unsubscribe function.
*/

---

### `on`

```typescript
public on<E extends CacheEventType>(
    event: E,
    listener: (payload: CacheEventMap<TData>[E]) => void,
  ): () => void
```

/**
* Subscribes a listener to global cache lifecycle events (hit, miss, evict, set, etc.).
*
* @param event - Lifecycle event name.
* @param listener - Event handler.
* @returns Unsubscribe function.
*/

---


## 📁 `utils/cache/webStorageAdapter.ts`

### `isCacheEntry`

```typescript
function isCacheEntry<T>(val: unknown): val is CacheEntry<T>
```

*JSDoc отсутствует*

---

### `get`

```typescript
public get(key: string): CacheEntry<T> | undefined
```

*JSDoc отсутствует*

---

### `set`

```typescript
public set(key: string, entry: CacheEntry<T>): void
```

*JSDoc отсутствует*

---

### `delete`

```typescript
public delete(key: string): boolean
```

*JSDoc отсутствует*

---

### `clear`

```typescript
public clear(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/cleanObject.ts`

### `omitKey`

```typescript
export function omitKey<T, K extends string = string>(
  record: Partial<Record<K, T>>,
  keyToOmit: K,
): Partial<Record<K, T>>
```

/**
* Creates a shallow copy of a record omitting the specified key.
* Avoids the `delete` operator to preserve V8 hidden classes.
*
* @template T - Value type of the record.
* @template K - Key type of the record.
* @param record - Source record.
* @param keyToOmit - Key to exclude from the new record.
* @returns A new record with the key omitted, or the original record if unchanged.
*
* @example
* ```typescript
* const user = { id: 'u1', password: 'secret', name: 'Alice' };
* const sanitized = omitKey(user, 'password');
* // => { id: 'u1', name: 'Alice' }
* ```
*/

---

### `omitKeys`

```typescript
export function omitKeys<T, K extends string = string>(
  record?: Partial<Record<K, T>> | null,
  keysToOmit?: ReadonlySet<K> | readonly K[] | null,
): Partial<Record<K, T>>
```

/**
* Creates a shallow copy of a record omitting multiple specified keys.
*
* @template T - Value type of the record.
* @template K - Key type of the record.
* @param record - Source record.
* @param keysToOmit - Set or array of keys to exclude.
* @returns A new record with the keys omitted.
*
* @example
* ```typescript
* const config = { debug: true, host: 'localhost', port: 8080 };
* const publicConfig = omitKeys(config, ['debug']);
* ```
*/

---

### `safeAssign`

```typescript
export function safeAssign<T extends object, S extends object>(
  target: T,
  source?: S | null,
): T & S
```

/**
* Safely assigns source properties to a target object protecting against prototype pollution.
*
* @template T - Target object type.
* @template S - Source object type.
* @param target - Base destination object.
* @param source - Incoming source properties.
* @returns Merged intersection object without unsafe prototype keys.
*
* @example
* ```typescript
* const base = { title: 'Card' };
* const merged = safeAssign(base, { description: 'Info' });
* ```
*/

---

### `pickKeys`

```typescript
export function pickKeys<T, K extends string = string>(
  record: Partial<Record<K, T>>,
  keysToPick: ReadonlySet<K> | readonly K[],
): Partial<Record<K, T>>
```

/**
* Creates a shallow copy of a record containing only the specified keys.
* Protects against prototype pollution by skipping unsafe keys.
*
* @template T - Value type of the record.
* @template K - Key type of the record.
* @param record - Source record.
* @param keysToPick - Set or array of keys to include.
* @returns A new record containing only the picked keys.
*
* @example
* ```typescript
* const fullRecord = { id: 1, name: 'Root', role: 'admin', internalToken: 'xyz' };
* const userView = pickKeys(fullRecord, ['id', 'name']);
* // => { id: 1, name: 'Root' }
* ```
*/

---

### `isEmptyRecord`

```typescript
export function isEmptyRecord(record?: object | null): boolean
```

/**
* Checks whether a record contains zero own enumerable properties.
* Executes in O(1) without heap allocation (unlike Object.keys(record).length === 0).
*
* @param record - Source record to inspect.
* @returns True if nullish or having no own enumerable properties.
*
* @example
* ```typescript
* isEmptyRecord({}); // => true
* isEmptyRecord({ a: 1 }); // => false
* isEmptyRecord(null); // => true
* ```
*/

---

### `mapValues`

```typescript
export function mapValues<K extends string | number, V, R>(
  record: Partial<Record<K, V>>,
  fn: (value: V, key: K) => R,
): Partial<Record<K, R>>
```

/**
* Transforms the values of a record using a mapping function.
* Protects against prototype pollution by skipping unsafe keys.
*
* @template K - Key type.
* @template V - Input value type.
* @template R - Output value type.
* @param record - Source record.
* @param fn - Value transformer function.
* @returns A new record with transformed values.
*
* @example
* ```typescript
* const scores = { alice: 10, bob: 15 };
* const doubled = mapValues(scores, (v) => v * 2);
* // => { alice: 20, bob: 30 }
* ```
*/

---

### `filterObject`

```typescript
export function filterObject<K extends string | number, V>(
  record: Record<K, V>,
  predicate: (value: V, key: K) => boolean,
): Record<K, V>
```

/**
* Filters a record based on a key-value predicate evaluation.
* Protects against prototype pollution by skipping unsafe keys.
*
* @template K - Key type.
* @template V - Value type.
* @param record - Source record.
* @param predicate - Entry filter function.
* @returns A new record containing only entries that satisfied the predicate.
*
* @example
* ```typescript
* const items = { a: 1, b: 2, c: 3 };
* const even = filterObject(items, (v) => v % 2 === 0);
* // => { b: 2 }
* ```
*/

---

### `filterObject`

```typescript
export function filterObject<K extends string | number, V>(
  record: Partial<Record<K, V>>,
  predicate: (value: V, key: K) => boolean,
): Partial<Record<K, V>>
```

*JSDoc отсутствует*

---

### `filterObject`

```typescript
export function filterObject<K extends string | number, V>(
  record: Partial<Record<K, V>>,
  predicate: (value: V, key: K) => boolean,
): Partial<Record<K, V>>
```

*JSDoc отсутствует*

---

### `compactObject`

```typescript
export function compactObject<K extends string | number, V>(
  record?: Partial<Record<K, V | null | undefined>> | null,
): Partial<Record<K, V>>
```

/**
* Removes null and undefined values from a record, returning a clean partial record.
* Protects against prototype pollution by skipping unsafe keys.
*
* @template K - Key type.
* @template V - Value type.
* @param record - Source record.
* @returns A new record containing only defined, non-null values.
*
* @example
* ```typescript
* const raw = { a: 1, b: null, c: undefined, d: 'ok' };
* const clean = compactObject(raw);
* // => { a: 1, d: 'ok' }
* ```
*/

---

### `invertObject`

```typescript
export function invertObject<K extends string | number, V extends string | number>(
  record?: Record<K, V> | Partial<Record<K, V>> | readonly V[] | null,
): Record<V, K>
```

/**
* Inverts keys and values of a record ({ a: 'x' } -> { x: 'a' }).
* Protects against prototype pollution by skipping unsafe keys and values.
*
* @template K - Source key type.
* @template V - Source value type.
* @param record - Source record with unique string or number values.
* @returns A new inverted record.
*
* @example
* ```typescript
* const mapping = { first: '1st', second: '2nd' };
* const inverted = invertObject(mapping);
* // => { '1st': 'first', '2nd': 'second' }
* ```
*/

---

### `val`

```typescript
const val = (record as Record<string, V>)[key]
```

*JSDoc отсутствует*

---

### `deepFreeze`

```typescript
export function deepFreeze<T>(obj: T): Readonly<T>
```

/**
* Recursively freezes an object and its nested properties, preventing runtime mutations.
*
* @template T - Object type.
* @param obj - Target object to freeze deeply.
* @returns Deeply frozen object.
*
* @example
* ```typescript
* const config = deepFreeze({ api: { endpoint: '/popovers', retries: 3 } });
* ```
*/

---


## 📁 `utils/clone.test.ts`

### `fn`

```typescript
const fn = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/clone.ts`

### `cloneBuiltinInstance`

```typescript
function cloneBuiltinInstance(obj: object): object | null
```

*JSDoc отсутствует*

---

### `fastClone`

```typescript
export function fastClone<T>(obj: T): T
```

/**
* Deep-clones state objects and data payloads using the fastest available strategy.
*
* @remarks
* Utilizes native `structuredClone` when supported, and gracefully falls back to recursive
* object/array/Map/Set cloning when non-serializable properties (e.g. functions, DOM nodes) are encountered.
* Prototype pollution keys are explicitly skipped during cloning.
*
* @template T - Input object type.
* @param obj - Object, array, or primitive value to clone.
* @returns An isolated deep copy of the input value.
*
* @example
* ```typescript
* const clonedState = fastClone(currentState);
* clonedState.settings.theme = 'dark'; // currentState unaffected
* ```
*/

---


## 📁 `utils/clsx.ts`

### `appendRecordClasses`

```typescript
function appendRecordClasses(
  rec: Record<string, boolean | null | undefined>,
  classes: string[],
): void
```

*JSDoc отсутствует*

---

### `clsx`

```typescript
export function clsx(
  ...inputs: Array<string | boolean | null | undefined | Record<string, boolean | null | undefined>>
): string
```

/**
* Lightweight, zero-allocation className concatenation helper.
* Filters out falsy values and handles conditional class dictionaries while skipping
* prototype pollution keys (`__proto__`, `constructor`, `prototype`).
*
* @param inputs - Variable list of class names, boolean flags, or conditional class maps.
* @returns Space-delimited concatenated class string.
*
* @example
* ```typescript
* clsx('popover-card', isActive && 'is-active', { 'is-pinned': isPinned });
* // => 'popover-card is-active is-pinned'
* ```
*/

---


## 📁 `utils/collections.test.ts`

### `mockEntry`

```typescript
const mockEntry = (key: string): TrailEntry => ({
    key,
    status: 'idle',
    data: null,
    error: null,
    isLoading: false,
    rect: undefined,
  })
```

*JSDoc отсутствует*

---


## 📁 `utils/collections.ts`

### `getEntryAtIndex`

```typescript
export function getEntryAtIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
): TrailEntry<TData, TPopoverKey> | undefined
```

/**
* Retrieves an entry at a unified index spanning floating and cascading trail collections.
*
* @example
* ```ts
* const entry = getEntryAtIndex(state.floating, state.trail, 2);
* ```
*
* @param floating - Readonly array of floating pinned popover entries.
* @param trail - Readonly array of cascading trail popover entries.
* @param index - Continuous index across floating (0..F-1) and trail (F..F+T-1).
* @returns Found TrailEntry or undefined if index is out of bounds.
*/

---

### `findEntryIndex`

```typescript
export function findEntryIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): number
```

/**
* Finds the continuous index of a popover key across floating and trail collections.
*
* @example
* ```ts
* const idx = findEntryIndex(state.floating, state.trail, 'menuItem');
* if (idx !== -1) {
*   console.log('Found entry at index:', idx);
* }
* ```
*
* @param floating - Readonly array of floating popover entries.
* @param trail - Readonly array of cascading trail popover entries.
* @param key - Popover key to locate.
* @returns Index 0..total-1 if found, or -1 if absent.
*/

---

### `hasEntryWithKey`

```typescript
export function hasEntryWithKey<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): boolean
```

/**
* Checks whether an entry with the target key is present in either floating or trail collection.
*
* @example
* ```ts
* if (hasEntryWithKey(state.floating, state.trail, 'profileMenu')) {
*   // Card is currently active
* }
* ```
*
* @param floating - Readonly array of floating popovers.
* @param trail - Readonly array of cascading popovers.
* @param key - Popover key to check.
* @returns True if active in either collection.
*/

---

### `findEntryInStore`

```typescript
export function findEntryInStore<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): TrailEntry<TData, TPopoverKey> | undefined
```

/**
* Finds and returns the first TrailEntry matching `key` across floating and trail collections.
*
* @example
* ```ts
* const entry = findEntryInStore(state.floating, state.trail, 'userCard');
* ```
*
* @param floating - Readonly array of floating popovers.
* @param trail - Readonly array of cascading popovers.
* @param key - Popover key to search for.
* @returns Matching TrailEntry or undefined if absent.
*/

---

### `unique`

```typescript
export function unique<T>(items: readonly T[]): readonly T[]
```

/**
* Returns a deduplicated array preserving original insertion order.
*
* @example
* ```ts
* unique(['a', 'b', 'a', 'c']); // => ['a', 'b', 'c']
* ```
*
* @template T - Element type.
* @param items - Readonly array of items.
* @returns Frozen array of unique elements.
*/

---

### `partition`

```typescript
export function partition<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): readonly [readonly T[], readonly T[]]
```

/**
* Splits an array into a 2-tuple `[truthy, falsy]` according to predicate.
*
* @example
* ```ts
* const [even, odd] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
* // even => [2, 4], odd => [1, 3, 5]
* ```
*
* @template T - Element type.
* @param items - Source array.
* @param predicate - Filter condition.
* @returns Readonly 2-tuple `[matching, nonMatching]`.
*/

---

### `groupBy`

```typescript
export function groupBy<T, K extends string | number>(
  items: readonly T[],
  getKey: (item: T) => K,
): Record<K, readonly T[]>
```

/**
* Groups elements of an array by key extracted via `getKey` selector.
* Protects against prototype pollution by discarding unsafe object keys.
*
* @example
* ```ts
* const words = ['apple', 'avocado', 'banana'];
* const byFirstLetter = groupBy(words, (w) => w[0]);
* // => { a: ['apple', 'avocado'], b: ['banana'] }
* ```
*
* @template T - Item type.
* @template K - Group key.
*/

---

### `keyBy`

```typescript
export function keyBy<T, K extends string | number>(
  items: readonly T[],
  getKey: (item: T) => K,
): Record<K, T>
```

/**
* Creates a dictionary mapping keys to array items using `getKey` selector.
* Later items overwrite earlier items with the same key.
*
* @example
* ```ts
* const users = [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }];
* const usersById = keyBy(users, (u) => u.id);
* // => { u1: { id: 'u1', name: 'Alice' }, u2: { id: 'u2', name: 'Bob' } }
* ```
*
* @template T - Item type.
* @template K - Key type.
*/

---

### `chunk`

```typescript
export function chunk<T>(items: readonly T[], size: number): readonly (readonly T[])[]
```

/**
* Splits an array into chunks of specified maximum size.
*
* @example
* ```ts
* chunk([1, 2, 3, 4, 5], 2); // => [[1, 2], [3, 4], [5]]
* ```
*
* @template T - Element type.
* @param items - Array to chunk.
* @param size - Chunk size (must be >= 1).
* @returns Array of chunks.
*/

---

### `zip`

```typescript
export function zip<A, B>(a: readonly A[], b: readonly B[]): readonly (readonly [A, B])[]
```

/**
* Zips two arrays into an array of 2-tuples up to the length of the shorter array.
*
* @example
* ```ts
* zip(['a', 'b'], [1, 2, 3]); // => [['a', 1], ['b', 2]]
* ```
*
* @template A - First array element type.
* @template B - Second array element type.
* @param a - First source array.
* @param b - Second source array.
* @returns Frozen array of paired tuples.
*/

---

### `range`

```typescript
export function range(start: number, end: number, step = 1): readonly number[]
```

/**
* Generates an arithmetic progression sequence of numbers from start (inclusive) to end (exclusive).
*
* @example
* ```ts
* range(0, 5);    // => [0, 1, 2, 3, 4]
* range(0, 10, 2); // => [0, 2, 4, 6, 8]
* ```
*
* @param start - Starting value (inclusive).
* @param end - Ending bound (exclusive).
* @param step - Step increment (defaults to 1, must not be 0).
* @returns Frozen array of numbers in progression.
*/

---

### `compact`

```typescript
export function compact<T>(array: readonly (T | null | undefined)[]): readonly T[]
```

/**
* Removes null and undefined elements from an array with zero allocations on empty input.
*
* @example
* ```ts
* compact(['a', null, 'b', undefined, 'c']); // => ['a', 'b', 'c']
* ```
*
* @template T - Element type.
* @param array - Array with potentially null or undefined items.
* @returns Frozen array of non-nullable elements.
*/

---


## 📁 `utils/componentUtils.test.ts`

### `getter`

```typescript
const getter = () => el
```

*JSDoc отсутствует*

---


## 📁 `utils/componentUtils.ts`

### `resolvePolymorphicProps`

```typescript
export function resolvePolymorphicProps<E extends ElementType>(
  as?: E,
  defaultElement: ElementType = 'button',
)
```

/**
* Resolves a polymorphic component element type and default native button properties (`type="button"`).
*
* Ensures that rendered `<button>` elements default to `type="button"` to avoid accidentally submitting parent forms.
*
* @template E - Target ElementType to render.
* @param as - Optional polymorphic component override.
* @param defaultElement - Fallback element type (defaults to `'button'`).
* @returns Object containing the resolved `Component` and default `buttonProps`.
*
* @example
* ```tsx
* function CustomAction({ as, ...props }) {
*   const { Component, buttonProps } = resolvePolymorphicProps(as);
*   return <Component {...buttonProps} {...props} />;
* }
* ```
*/

---

### `resolveContainerElement`

```typescript
export function resolveContainerElement(
  container?: HTMLElement | (() => HTMLElement | null) | { current: HTMLElement | null } | null,
): HTMLElement | null
```

/**
* Resolves a container reference, accessor function, or direct DOM element to a raw HTMLElement.
*
* Handles React refs `{ current: HTMLElement }`, lazy getter functions `() => HTMLElement`, or direct HTMLElement.
*
* @param container - Target container candidate (RefObject, getter function, direct node, or undefined).
* @returns Resolved HTMLElement or null if unavailable.
*
* @example
* ```tsx
* const portalTarget = resolveContainerElement(customRef);
* const bodyTarget = resolveContainerElement(() => document.getElementById('modal-root'));
* ```
*/

---


## 📁 `utils/configDefinitions.ts`

### `createPopoverKey`

```typescript
export function createPopoverKey<T extends string>(key: T): PopoverKey<T>
```

/**
* Constructs a nominal `PopoverKey` branded string identifier.
*/

---

### `definePopoverResolver`

```typescript
export function definePopoverResolver<TData = unknown, TContext = unknown>(
  resolver: PopoverResolver<TData, TContext>,
): PopoverResolver<TData, TContext>
```

/**
* Identity helper for defining a `PopoverResolver` with full generic type inference.
*/

---

### `definePopoverConfig`

```typescript
export function definePopoverConfig<T extends PopoverDisplayOptions>(config: T): T
```

/**
* Identity helper for defining a `PopoverDisplayOptions` configuration object with full autocompletion.
*/

---


## 📁 `utils/controller/cardMutations.ts`

### `updateCardData`

```typescript
export function updateCardData<TData, TContext, TPopoverKey extends string>(
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  data: TData,
): void
```

/**
* Updates the data payload of an active popover card in-place and clears its loading flag.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param store - Target Zustand store instance.
* @param key - Identifier of the card to update.
* @param data - New data payload.
*
* @example
* ```typescript
* updateCardData(store, 'profile-card', { name: 'Bob', role: 'admin' });
* ```
*/

---

### `pinCard`

```typescript
export function pinCard<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect,
): void
```

/**
* Pins an active popover card if currently unpinned, preserving its screen coordinates.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param key - Key of the card to pin.
* @param rect - Optional DOMRect bounding coordinates.
*
* @example
* ```typescript
* pinCard(state, 'card-1', cardEl.getBoundingClientRect());
* ```
*/

---

### `unpinCard`

```typescript
export function unpinCard<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): void
```

/**
* Unpins an active popover card if currently pinned, returning it to cascade flow.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param key - Key of the card to unpin.
*
* @example
* ```typescript
* unpinCard(state, 'card-1');
* ```
*/

---

### `addCardParent`

```typescript
export function addCardParent<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  childKey: TPopoverKey,
  parentKey: TPopoverKey,
): boolean
```

/**
* Connects a directed edge in the DAG from `parentKey` to `childKey`.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param childKey - Child node key.
* @param parentKey - Parent node key.
* @returns True if edge was added, false if rejected.
*
* @example
* ```typescript
* addCardParent(state, 'child-card', 'parent-card');
* ```
*/

---

### `removeCardParent`

```typescript
export function removeCardParent<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  childKey: TPopoverKey,
  parentKey: TPopoverKey,
): void
```

/**
* Disconnects a directed edge in the DAG between parent and child.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param childKey - Child node key.
* @param parentKey - Parent node key.
*
* @example
* ```typescript
* removeCardParent(state, 'child-card', 'parent-card');
* ```
*/

---


## 📁 `utils/controller/cardQueries.ts`

### `getCardEntry`

```typescript
export function getCardEntry<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): TrailEntry<TData, TPopoverKey> | undefined
```

/**
* Selects the active TrailEntry for a specific card key.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param key - Popover key to find.
* @returns Found TrailEntry or undefined if not active.
*
* @example
* ```typescript
* const entry = getCardEntry(state, 'card-1');
* ```
*/

---

### `getCardOffset`

```typescript
export function getCardOffset<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): DragOffset
```

/**
* Retrieves the current drag offset vector of a popover card.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param key - Popover key.
* @returns 2D drag offset object `{ x, y }`.
*
* @example
* ```typescript
* const { x, y } = getCardOffset(state, 'card-1');
* ```
*/

---

### `getCardBreadcrumbs`

```typescript
export function getCardBreadcrumbs<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[]
```

/**
* Resolves the breadcrumb path from the root ancestor to the specified card.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param key - Target popover key.
* @returns Array of keys tracing root to target.
*
* @example
* ```typescript
* const crumbs = getCardBreadcrumbs(state, 'settings-card');
* ```
*/

---

### `getCardDepth`

```typescript
export function getCardDepth<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): number
```

/**
* Retrieves the hierarchical topological depth of a card in the DAG.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param key - Popover key.
* @returns Non-negative depth integer.
*
* @example
* ```typescript
* const depth = getCardDepth(state, 'settings-card');
* ```
*/

---

### `getCardParents`

```typescript
export function getCardParents<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[]
```

/**
* Retrieves all direct parent keys of a card in the DAG.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param key - Popover key.
* @returns Readonly array of parent keys.
*
* @example
* ```typescript
* const parents = getCardParents(state, 'settings-card');
* ```
*/

---

### `getCardChildren`

```typescript
export function getCardChildren<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): readonly TPopoverKey[]
```

/**
* Retrieves all direct children keys opened by a card in the DAG.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param state - Store state instance.
* @param key - Popover key.
* @returns Readonly array of child keys.
*
* @example
* ```typescript
* const children = getCardChildren(state, 'menu-card');
* ```
*/

---


## 📁 `utils/controller/controllerCore.ts`

### `getState`

```typescript
const getState = (): PopoverStore<TData, TContext, TPopoverKey> =>
```

*JSDoc отсутствует*

---

### `clear`

```typescript
const clear = () => getState().clear()
```

*JSDoc отсутствует*

---


## 📁 `utils/controller/fluentQueries.ts`

### `createBuilderQueries`

```typescript
export function createBuilderQueries<TData, TContext, TPopoverKey extends string>(
  key: TPopoverKey,
  getState: () => PopoverStore<TData, TContext, TPopoverKey>,
): Pick<
  PopoverCardFluentBuilder<TData, TPopoverKey>,
  | 'get'
  | 'isOpen'
  | 'isPinned'
  | 'isLoading'
  | 'data'
  | 'error'
  | 'offset'
  | 'breadcrumbs'
  | 'depth'
  | 'parents'
  | 'children'
>
```

/**
* Constructs the read-only inspection query methods for a scoped card fluent builder.
*
* @template TData - Payload data type.
* @template TContext - Context type.
* @template TPopoverKey - Popover key type.
* @param key - Target popover card key.
* @param getState - Safe store state accessor.
* @returns Object containing all query inspection methods (`isOpen`, `isPinned`, `data`, etc.).
*
* @example
* ```typescript
* const queries = createBuilderQueries('profile-card', store.getState);
* if (queries.isOpen()) {
*   console.log('Depth:', queries.depth());
* }
* ```
*/

---


## 📁 `utils/dag/dagCycle.ts`

### `isReachableAncestor`

```typescript
export function isReachableAncestor<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  startKey: TPopoverKey,
  targetAncestorKey: TPopoverKey,
): boolean
```

/**
* Checks if a target ancestor key is reachable by traversing up the parent hierarchy.
*
* @remarks
* Uses an iterative depth-first search (DFS) with a visited set to avoid infinite loops.
* Returns `true` if `startKey === targetAncestorKey` or if `targetAncestorKey` is an ancestor.
*
* @example
* ```ts
* const isAncestor = isReachableAncestor(nodes, 'leafPopover', 'rootMenu');
* if (isAncestor) {
*   console.log('rootMenu is an ancestor of leafPopover');
* }
* ```
*
* @template TPopoverKey - Node identifier type.
* @param nodes - Kernel DAG node dictionary.
* @param startKey - Popover key to begin traversing upward from.
* @param targetAncestorKey - Ancestor popover key to search for.
* @returns `true` if reachable as an ancestor, otherwise `false`.
*/

---

### `wouldCreateCycle`

```typescript
export function wouldCreateCycle<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  childKey: TPopoverKey,
  candidateParentKey: TPopoverKey,
): boolean
```

/**
* Checks whether adding a directed edge from `candidateParentKey` to `childKey` would create a cycle.
*
* @remarks
* An edge `candidateParentKey -> childKey` creates a cycle if and only if `childKey` is already
* an ancestor of `candidateParentKey` (i.e. `candidateParentKey` can reach `childKey` going up).
*
* @example
* ```ts
* if (wouldCreateCycle(nodes, 'childCard', 'parentCard')) {
*   throw new Error('Adding this parent edge would create a cycle!');
* }
* ```
*
* @template TPopoverKey - Node identifier type.
* @param nodes - Kernel DAG node dictionary.
* @param childKey - Proposed child popover key.
* @param candidateParentKey - Proposed parent popover key.
* @returns `true` if edge insertion would produce a cyclic dependency.
*/

---

### `resolveReparentingCycles`

```typescript
export function resolveReparentingCycles<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  node: InternalDAGNode<TPopoverKey>,
  cleanParentKey: TPopoverKey,
): void
```

/**
* Prunes conflicting child edges before reparenting a popover node to prevent circular loops.
*
* In the cascading popover hierarchy, when a card `node` adopts `cleanParentKey` as its new parent
* (for example, during reparenting or multi-parent attachment), any existing child of `node` that
* is already an ancestor of `cleanParentKey` would form an infinite loop. This function severs
* those conflicting downward edges and safely reassigns primary parent pointers.
*
* @template TPopoverKey - Node identifier type.
* @param nodes - Kernel DAG node dictionary.
* @param node - The node being reparented.
* @param cleanParentKey - The proposed new parent key for `node`.
*
* @example
* ```typescript
* // Ensure reparenting cardB to cardC won't cause circular references
* resolveReparentingCycles(dagNodes, cardBNode, 'cardC');
* ```
*/

---


## 📁 `utils/dag/dagGuards.ts`

### `isDAGNode`

```typescript
export function isDAGNode<TPopoverKey extends string = string>(
  val: unknown,
): val is DAGNode<TPopoverKey>
```

/**
* Validates whether an unknown value conforms to a valid `DAGNode` structure.
*
* @template TPopoverKey - Node key identifier type.
* @param val - Unknown candidate value to validate.
* @returns True if value is a valid DAGNode record.
*
* @example
* ```typescript
* if (isDAGNode(item)) {
*   console.log('Valid DAG node at depth:', item.depth);
* }
* ```
*/

---

### `isRootNode`

```typescript
export function isRootNode<TPopoverKey extends string = string>(
  node: DAGNode<TPopoverKey>,
): boolean
```

/**
* Checks whether a given DAG node is a root anchor (has no incoming parent edges and depth 0).
*
* @template TPopoverKey - Node key identifier type.
* @param node - Target DAG node to check.
* @returns True if the node has zero parents and depth 0.
*
* @example
* ```typescript
* if (isRootNode(node)) {
*   console.log('Node is a root anchor');
* }
* ```
*/

---

### `isLeafNode`

```typescript
export function isLeafNode<TPopoverKey extends string = string>(
  node: DAGNode<TPopoverKey>,
): boolean
```

/**
* Checks whether a given DAG node is a leaf (has no outgoing child edges).
*
* @template TPopoverKey - Node key identifier type.
* @param node - Target DAG node to check.
* @returns True if the node has zero children.
*
* @example
* ```typescript
* if (isLeafNode(node)) {
*   console.log('Node is an outermost leaf popover');
* }
* ```
*/

---


## 📁 `utils/dag/dagMetrics.test.ts`

### `internalNodes`

```typescript
const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes
```

*JSDoc отсутствует*

---

### `internalNodes`

```typescript
const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes
```

*JSDoc отсутствует*

---


## 📁 `utils/dag/dagMetrics.ts`

### `findRoots`

```typescript
export function findRoots<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[]
```

/**
* Finds all root keys in the DAG (nodes with zero incoming parent edges).
*
* @template TPopoverKey - Key identifier type.
* @param nodes - Internal DAG node dictionary.
* @returns Array of root keys.
*
* @example
* ```typescript
* const roots = findRoots(dagNodes);
* // => ['main-menu', 'notifications-anchor']
* ```
*/

---

### `findLeaves`

```typescript
export function findLeaves<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[]
```

/**
* Finds all leaf keys in the DAG (nodes with zero outgoing child edges).
*
* @template TPopoverKey - Key identifier type.
* @param nodes - Internal DAG node dictionary.
* @returns Array of leaf keys.
*
* @example
* ```typescript
* const leaves = findLeaves(dagNodes);
* // => ['color-picker', 'confirm-modal']
* ```
*/

---

### `computeMaxDepth`

```typescript
export function computeMaxDepth<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): number
```

/**
* Computes the maximum directed tree depth across all nodes in the DAG.
*
* @template TPopoverKey - Key identifier type.
* @param nodes - Internal DAG node dictionary.
* @returns Maximum depth integer (0 if empty or root-only).
*
* @example
* ```typescript
* const maxDepth = computeMaxDepth(dagNodes);
* ```
*/

---

### `isDescendantOf`

```typescript
export function isDescendantOf<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  childKey: TPopoverKey,
  ancestorKey: TPopoverKey,
): boolean
```

/**
* Checks whether `childKey` is a transitive descendant of `ancestorKey`.
* Uses iterative upward traversal with visited set to guard against cycles.
*
* @template TPopoverKey - Key identifier type.
* @param nodes - Internal DAG node dictionary.
* @param childKey - Proposed descendant key.
* @param ancestorKey - Proposed ancestor key.
* @returns True if `childKey` is an active descendant of `ancestorKey`.
*
* @example
* ```typescript
* if (isDescendantOf(dagNodes, 'sub-sub-item', 'root-menu')) {
*   console.log('Cascade relationship confirmed');
* }
* ```
*/

---


## 📁 `utils/dag/dagMutation.ts`

### `ensureNode`

```typescript
function ensureNode<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  key: K,
): InternalDAGNode<K>
```

*JSDoc отсутствует*

---

### `insertDAGNode`

```typescript
export function insertDAGNode<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  key: K,
  parentKey?: K,
): void
```

/**
* Inserts a new node or updates an existing node's primary parent in the DAG.
* Resolves reparenting cycles automatically before edge commitment.
*
* @template K - Key identifier type.
* @param nodes - Internal DAG node dictionary.
* @param key - Unique key of the node to insert.
* @param parentKey - Optional parent key to connect under.
*
* @example
* ```typescript
* insertDAGNode(dagNodes, 'user-menu');
* insertDAGNode(dagNodes, 'profile-card', 'user-menu');
* ```
*/

---

### `connectDAGEdge`

```typescript
export function connectDAGEdge<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  parentKey: K,
  childKey: K,
): boolean
```

/**
* Connects a directed edge from `parentKey` to `childKey`.
* Rejects connection and returns `false` if the edge would introduce a cycle.
*
* @template K - Key identifier type.
* @param nodes - Internal DAG node dictionary.
* @param parentKey - Starting parent node key.
* @param childKey - Target child node key.
* @returns True if the edge was safely connected, false if rejected due to cycle prevention.
*
* @example
* ```typescript
* const connected = connectDAGEdge(dagNodes, 'menu-a', 'submenu-b');
* ```
*/

---

### `disconnectDAGEdge`

```typescript
export function disconnectDAGEdge<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  parentKey: K,
  childKey: K,
): void
```

/**
* Disconnects a directed edge from `parentKey` to `childKey`.
* Reassigns the child's primary parent pointer to a remaining parent if applicable.
*
* @template K - Key identifier type.
* @param nodes - Internal DAG node dictionary.
* @param parentKey - Starting parent node key.
* @param childKey - Target child node key.
*
* @example
* ```typescript
* disconnectDAGEdge(dagNodes, 'menu-a', 'submenu-b');
* ```
*/

---

### `deleteDAGNode`

```typescript
export function deleteDAGNode<K extends string>(nodes: Map<K, InternalDAGNode<K>>, key: K): void
```

/**
* Removes a node and severs all connected incoming parent edges and outgoing child edges.
*
* @template K - Key identifier type.
* @param nodes - Internal DAG node dictionary.
* @param key - Key of the node to remove.
*
* @example
* ```typescript
* deleteDAGNode(dagNodes, 'profile-card');
* ```
*/

---


## 📁 `utils/dag/dagOrdering.ts`

### `computeTeardownPlan`

```typescript
export function computeTeardownPlan<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  rootKey: TPopoverKey,
  includeRoot = false,
): TPopoverKey[]
```

/**
* Computes a bottom-up teardown order for a popover and all its descendants.
*
* When a parent popover is dismissed, all its child flyouts and submenus must be closed too.
* This function performs a post-order depth-first traversal so that leaf cards (deepest descendants)
* are closed first before their parents, preventing orphaned DOM elements and broken focus restoration.
*
* @template TPopoverKey - Node identifier type.
* @param nodes - Internal DAG node dictionary.
* @param rootKey - Root key of the subtree to tear down.
* @param includeRoot - When true, includes `rootKey` at the end of the teardown array. Default is false.
* @returns Array of popover keys ordered from deepest leaves to root.
*
* @example
* ```typescript
* // If menu -> submenu -> detailsCard:
* const teardownKeys = computeTeardownPlan(dagNodes, 'menu', true);
* // => ['detailsCard', 'submenu', 'menu']
* for (const key of teardownKeys) {
*   closePopover(key);
* }
* ```
*/

---

### `postOrder`

```typescript
const postOrder = (k: TPopoverKey): void =>
```

*JSDoc отсутствует*

---

### `topologicalSort`

```typescript
export function topologicalSort<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[]
```

/**
* Topologically sorts popover nodes using Kahn's algorithm (parents before children).
*
* Used when calculating cascading coordinate offsets or synchronizing hierarchical context
* down the trail, ensuring that every parent popover's position and data are resolved before
* its child cards are positioned.
*
* @template TPopoverKey - Node identifier type.
* @param nodes - Internal DAG node dictionary.
* @returns Array of popover keys in topological order.
*
* @example
* ```typescript
* const order = topologicalSort(dagNodes);
* for (const key of order) {
*   calculatePositionFor(key);
* }
* ```
*/

---

### `deg`

```typescript
const deg = (inDegree.get(child) ?? 1) - 1
```

*JSDoc отсутствует*

---

### `safeTopologicalSort`

```typescript
export function safeTopologicalSort<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TopologicalSortResult<TPopoverKey>
```

/**
* Topologically sorts popover nodes, returning an error Result if an illegal cycle is detected.
*
* @remarks
* Unlike standard topologicalSort, this function will not return a partial or corrupted order.
* If a cycle is detected, it returns `Err(DAGCycleError)` listing all keys trapped in the cycle.
*
* @example
* ```ts
* const result = safeTopologicalSort(dagNodes);
* if (isOk(result)) {
*   console.log('Topological order:', result.data);
* } else {
*   console.error('Cycle detected in keys:', result.error.cycleKeys);
* }
* ```
*
* @template TPopoverKey - Node identifier type.
* @param nodes - Internal DAG node dictionary.
* @returns `Ok(order)` on successful sort, or `Err(DAGCycleError)` if cycles exist.
*/

---

### `deg`

```typescript
const deg = (inDegree.get(child) ?? 1) - 1
```

*JSDoc отсутствует*

---

### `computeTopologicalZIndex`

```typescript
export function computeTopologicalZIndex<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  baseZIndex = 1000,
): Map<TPopoverKey, number>
```

/**
* Computes visual stacking z-indices so child popovers always render above their parents.
*
* Traverses the DAG from root anchors down to leaves, assigning strictly increasing integer
* z-index values starting from `baseZIndex`. This ensures flyout submenus and nested details
* naturally render on top of their parent containers without manual z-index bookkeeping.
*
* @template TPopoverKey - Node identifier type.
* @param nodes - Kernel DAG node dictionary.
* @param baseZIndex - Starting base z-index offset (defaults to 1000).
* @returns Map pairing each popover key with its allocated integer z-index.
*
* @example
* ```typescript
* const zMap = computeTopologicalZIndex(dagNodes, 1000);
* const childZ = zMap.get('nestedSubmenu'); // e.g. 1002
* const parentZ = zMap.get('rootMenu');      // e.g. 1000
* ```
*/

---

### `visit`

```typescript
const visit = (k: TPopoverKey): void =>
```

*JSDoc отсутствует*

---


## 📁 `utils/dag/dagSnapshot.ts`

### `exportSnapshot`

```typescript
export function exportSnapshot<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): DAGSnapshot<TPopoverKey>
```

/**
* Serializes the DAG node dictionary into a serializable snapshot envelope.
*
* @template TPopoverKey - Node key identifier type.
* @param nodes - Internal DAG node dictionary.
* @returns Serialized DAGSnapshot containing node keys, parent connections, and depths.
*
* @example
* ```typescript
* const snapshot = exportSnapshot(dagNodes);
* localStorage.setItem('dag_state', JSON.stringify(snapshot));
* ```
*/

---

### `importSnapshot`

```typescript
export function importSnapshot<TPopoverKey extends string>(
  snapshot: DAGSnapshot<TPopoverKey> | null | undefined,
  targetDAG: PopoverDAG<TPopoverKey>,
): boolean
```

/**
* Hydrates a target `PopoverDAG` instance from a serialized snapshot envelope.
*
* Clears the target DAG and recreates all nodes and multi-parent directed edges.
*
* @template TPopoverKey - Node key identifier type.
* @param snapshot - Snapshot object to import, or null/undefined.
* @param targetDAG - Target PopoverDAG instance to hydrate into.
* @returns True if import succeeded, false if snapshot was null or invalid.
*
* @example
* ```typescript
* const restored = importSnapshot(snapshot, targetDAG);
* if (restored) {
*   console.log('DAG successfully restored with size:', targetDAG.size);
* }
* ```
*/

---


## 📁 `utils/dag/dagTraversal.test.ts`

### `internalNodes`

```typescript
const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes
```

*JSDoc отсутствует*

---

### `internalNodes`

```typescript
const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes
```

*JSDoc отсутствует*

---

### `internalNodes`

```typescript
const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes
```

*JSDoc отсутствует*

---

### `internalNodes`

```typescript
const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes
```

*JSDoc отсутствует*

---


## 📁 `utils/dag/dagTraversal.ts`

### `visitDescendants`

```typescript
export function visitDescendants<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  parentKey: TPopoverKey,
  visitor: (key: TPopoverKey) => boolean | void,
  visited: Set<TPopoverKey> = new Set<TPopoverKey>(),
): boolean
```

/**
* Iteratively traverses all descendant keys of a parent node in depth-first order.
*
* @remarks
* Uses an explicit array stack to prevent call-stack overflows on deep hierarchies.
* Traversal terminates early if `visitor` returns `false`.
*
* @param nodes - Kernel DAG node dictionary.
* @param parentKey - Starting root key of the cascade branch.
* @param visitor - Callback invoked for each visited descendant key. Return `false` to abort early.
* @param visited - Optional set tracking visited keys to guard against cycles.
* @returns `false` if stopped early by the visitor callback, `true` otherwise.
*/

---

### `collectDescendants`

```typescript
export function collectDescendants<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  parentKey: TPopoverKey,
  outSet: Set<TPopoverKey>,
): Set<TPopoverKey>
```

/**
* Collects all reachable descendant keys of a parent node into a target Set.
*
* Traverses downward using depth-first search, adding all reachable keys into `outSet`.
*
* @template TPopoverKey - Node key identifier type.
* @param nodes - Kernel DAG node dictionary.
* @param parentKey - Starting parent key.
* @param outSet - Mutable set into which descendant keys are inserted.
* @returns The populated `outSet`.
*
* @example
* ```typescript
* const descendants = collectDescendants(dagNodes, 'main-menu', new Set());
* console.log('Descendants count:', descendants.size);
* ```
*/

---

### `collectAncestors`

```typescript
export function collectAncestors<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  childKey: TPopoverKey,
  outSet: Set<TPopoverKey> = new Set<TPopoverKey>(),
): Set<TPopoverKey>
```

/**
* Collects all reachable ancestor keys above a target child node up to root anchors.
*
* Traverses upward using depth-first search, adding all reachable ancestor keys into `outSet`.
*
* @template TPopoverKey - Node key identifier type.
* @param nodes - Kernel DAG node dictionary.
* @param childKey - Starting target child key.
* @param outSet - Mutable set to collect ancestor keys into (defaults to new Set).
* @returns The populated `outSet` containing all ancestor keys.
*
* @example
* ```typescript
* const ancestors = collectAncestors(dagNodes, 'flyout-submenu');
* if (ancestors.has('main-menu')) {
*   console.log('main-menu is an ancestor of flyout-submenu');
* }
* ```
*/

---

### `getBreadcrumbs`

```typescript
export function getBreadcrumbs<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  targetKey: TPopoverKey,
): TPopoverKey[]
```

/**
* Computes the unique breadcrumb trail path from the root anchor down to the target popover.
*
* @remarks
* Backtracks via `parentKey` pointers until reaching a root node without a parent.
* Returns an array ordered from root ancestor to target: `[root, intermediate, ..., target]`.
*
* @example
* ```ts
* const breadcrumbs = getBreadcrumbs(dagNodes, 'nestedMenuSubitem');
* // => ['rootMenu', 'subMenu', 'nestedMenuSubitem']
* ```
*
* @param nodes - Kernel DAG node dictionary.
* @param targetKey - Leaf or target popover key.
* @returns Array of keys tracing the path from root to target, or empty array if target not in DAG.
*/

---


## 📁 `utils/displayOptions.ts`

### `isDisplayOptionKey`

```typescript
export function isDisplayOptionKey(key: string): key is DisplayOptionKey
```

/**
* Checks whether a given string is a valid display option key.
*
* @param key - Candidate string key.
* @returns True if `key` is a known display option property name.
*
* @example
* ```typescript
* isDisplayOptionKey('placement'); // => true
* isDisplayOptionKey('unknownProp'); // => false
* ```
*/

---

### `extractDisplayOptions`

```typescript
export function extractDisplayOptions<TData = unknown, TPopoverKey extends string = string>(
  entry?:
    | Partial<TrailEntry<TData, TPopoverKey>>
    | Partial<Record<DisplayOptionKey, unknown>>
    | null,
): OpenRootOptions & OpenNestedOptions
```

/**
* Extracts pure display and styling options from a trail entry or raw dictionary.
* Filters out metadata, internal state, and non-display properties.
*
* @template TData - Popover payload data type.
* @template TPopoverKey - Popover key identifier type.
* @param entry - Candidate trail entry or partial options record.
* @returns Pure display options dictionary.
*
* @example
* ```typescript
* const options = extractDisplayOptions(trailEntry);
* console.log(options.placement, options.offset);
* ```
*/

---

### `mergeDisplayOptions`

```typescript
export function mergeDisplayOptions(
  base: OpenRootOptions & OpenNestedOptions,
  overrides?: Partial<OpenRootOptions & OpenNestedOptions> | null,
): OpenRootOptions & OpenNestedOptions
```

/**
* Merges a base display configuration with optional overrides.
*
* @param base - Default base display options.
* @param overrides - Optional overriding options.
* @returns Consolidated display options.
*
* @example
* ```typescript
* const merged = mergeDisplayOptions(defaultOptions, { placement: 'bottom-start' });
* ```
*/

---

### `areDisplayOptionsEqual`

```typescript
export function areDisplayOptionsEqual(
  a?: Partial<OpenRootOptions & OpenNestedOptions> | null,
  b?: Partial<OpenRootOptions & OpenNestedOptions> | null,
): boolean
```

/**
* Evaluates shallow value equality between two display options records.
*
* @param a - First display options record.
* @param b - Second display options record.
* @returns True if all display option properties are strictly equal.
*
* @example
* ```typescript
* if (!areDisplayOptionsEqual(prevOptions, nextOptions)) {
*   recomputeLayout();
* }
* ```
*/

---


## 📁 `utils/disposable.test.ts`

### `cleanup`

```typescript
const cleanup = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/domainValues.ts`

### `constructor`

```typescript
private constructor(val: number)
```

*JSDoc отсутствует*

---

### `of`

```typescript
public static of(val: number): ZIndex
```

/** Creates a new ZIndex value object. */

---

### `next`

```typescript
public next(): ZIndex
```

/** Returns a new ZIndex incremented by 1. */

---

### `elevate`

```typescript
public elevate(step = 10): ZIndex
```

/** Returns a new ZIndex incremented by the specified step (defaults to 10). */

---

### `constructor`

```typescript
private constructor(val: number)
```

*JSDoc отсутствует*

---

### `of`

```typescript
public static of(val: number): DurationMs
```

/** Creates a DurationMs instance with the given millisecond count. */

---

### `zero`

```typescript
public static zero(): DurationMs
```

/** Creates a 0ms DurationMs instance. */

---


## 📁 `utils/domEvents.test.ts`

### `createMockElement`

```typescript
function createMockElement(attributes: Record<string, string> = {}): Element
```

*JSDoc отсутствует*

---


## 📁 `utils/domEvents.ts`

### `getEventPath`

```typescript
export function getEventPath(e: Event): EventTarget[]
```

/**
* Returns the event propagation path array, with support for Shadow DOM `composedPath()`.
*
* @param e - DOM Event instance.
* @returns Array of EventTarget nodes traversed during event propagation.
*
* @example
* ```typescript
* const path = getEventPath(event);
* ```
*/

---

### `getEventTarget`

```typescript
export function getEventTarget<T extends EventTarget = HTMLElement>(
  e: Event,
  guard?: (node: EventTarget) => node is T,
): T | null
```

/**
* Safely extracts the event target or primary Shadow DOM origin node from an event.
*
* @template T - Expected EventTarget or HTMLElement subclass.
* @param e - DOM Event instance.
* @param guard - Optional type guard to validate target.
* @returns Target element or null if unavailable.
*
* @example
* ```typescript
* const button = getEventTarget(event, (node): node is HTMLButtonElement => node instanceof HTMLButtonElement);
* ```
*/

---

### `isPortalOrExcludedTarget`

```typescript
export function isPortalOrExcludedTarget(e: Event): boolean
```

/**
* Inspects the event propagation path for elements explicitly marked with
* `data-popover-portal` or `data-popover-ignore-outside` attributes.
*
* @param e - DOM Event instance.
* @returns True if any ancestor in the event path is marked to be ignored.
*
* @example
* ```typescript
* if (isPortalOrExcludedTarget(event)) {
*   return; // Skip outside dismiss
* }
* ```
*/

---


## 📁 `utils/domGuards.ts`

### `isClickInsidePortal`

```typescript
export function isClickInsidePortal(e: Event, portalKey?: string): boolean
```

/**
* Checks whether a DOM event originated inside a popover portal element.
*
* @param e - DOM Event instance.
* @param portalKey - Optional specific portal key string to match.
* @returns True if the event occurred inside an active portal.
*
* @example
* ```typescript
* if (isClickInsidePortal(event, 'portal-main')) {
*   // Do not dismiss
* }
* ```
*/

---

### `isClickOnIgnoredTrigger`

```typescript
export function isClickOnIgnoredTrigger(e: Event, triggerElement?: HTMLElement | null): boolean
```

/**
* Checks whether a click event occurred on the trigger element or on an element marked with `data-popover-ignore-outside`.
*
* @param e - DOM Event instance.
* @param triggerElement - Known trigger element.
* @returns True if click should be ignored by outside-click dismiss handlers.
*
* @example
* ```typescript
* if (isClickOnIgnoredTrigger(event, triggerButton)) {
*   return; // Ignore outside click
* }
* ```
*/

---

### `hasBoundingClientRect`

```typescript
export function hasBoundingClientRect(
  val: unknown,
): val is
```

/**
* Type guard testing whether a value exposes a valid `getBoundingClientRect()` method.
*
* @param val - Candidate value to test.
* @returns True if value has getBoundingClientRect function.
*
* @example
* ```typescript
* if (hasBoundingClientRect(target)) {
*   const rect = target.getBoundingClientRect();
* }
* ```
*/

---

### `isStopPropagationLike`

```typescript
function isStopPropagationLike(e: unknown): e is
```

*JSDoc отсутствует*

---

### `stopPropagation`

```typescript
export function stopPropagation(e: unknown): void
```

/**
* Safely stops event propagation if the candidate provides a `stopPropagation` method.
*
* @param e - Unknown event candidate (safely handles null/undefined).
*
* @example
* ```typescript
* stopPropagation(event);
* ```
*/

---

### `findNextFocusable`

```typescript
export function findNextFocusable(container: HTMLElement, reverse = false): HTMLElement | null
```

/**
* Finds the first (or last, in reverse mode) keyboard focusable element inside a DOM container.
*
* @param container - Root DOM element to query.
* @param reverse - When true, finds the last focusable element; when false, finds the first.
* @returns Focusable HTMLElement or null if none exist.
*
* @example
* ```typescript
* const firstInput = findNextFocusable(cardContainer);
* firstInput?.focus();
* ```
*/

---


## 📁 `utils/domSelector.ts`

### `escapeSelector`

```typescript
export function escapeSelector(val: string): string
```

/**
* Escapes a string value for safe use within CSS selectors.
*
* Caches results in an internal bounded Map to avoid repetitive `CSS.escape` overhead.
* Falls back to the raw string if `CSS.escape` is unavailable in the environment (e.g. SSR).
*
* @param val - Value to escape for use in CSS selectors.
* @returns Escaped selector string.
*
* @example
* ```typescript
* const selector = escapeSelector('user:123/special');
* const element = document.querySelector(`[data-key="${selector}"]`);
* ```
*/

---


## 📁 `utils/domUtils.ts`

### `sanitizeRect`

```typescript
export function sanitizeRect(
  rawRect: { x?: number; y?: number; width?: number; height?: number } | null | undefined,
): DOMRect | null
```

/**
* Sanitizes a raw bounding rectangle object, replacing NaN or non-finite values with 0.
*
* @param rawRect - Potential rectangle candidate with x, y, width, height.
* @returns Conforming DOMRect instance, or null if input was null/undefined.
*
* @example
* ```typescript
* const rect = sanitizeRect({ x: 10, y: NaN, width: 200, height: 100 });
* console.log(rect?.y); // 0
* ```
*/

---


## 📁 `utils/dragBounds.ts`

### `clampDragCoordinatesInPlace`

```typescript
export function clampDragCoordinatesInPlace(
  x: number,
  y: number,
  bounds: ClampBounds | undefined,
  outTarget: { x: number; y: number },
): void
```

/**
* Clamps 2D coordinates into a reusable destination object with zero heap allocations on hot drag paths.
* Normalizes non-finite coordinates to zero or bounding boundaries.
*
* @param x - Desired horizontal coordinate.
* @param y - Desired vertical coordinate.
* @param bounds - Optional bounding constraints (`minX`, `maxX`, `minY`, `maxY`).
* @param outTarget - Target destination object mutated in-place.
*
* @example
* ```typescript
* const scratch = { x: 0, y: 0 };
* clampDragCoordinatesInPlace(150, 80, { minX: 0, maxX: 100, minY: 0, maxY: 100 }, scratch);
* // scratch => { x: 100, y: 80 }
* ```
*/

---

### `clampDragCoordinates`

```typescript
export function clampDragCoordinates(
  x: number,
  y: number,
  bounds?: ClampBounds,
):
```

/**
* Constrains coordinate pair `(x, y)` within rectangular boundaries.
*
* @param x - Raw X coordinate.
* @param y - Raw Y coordinate.
* @param bounds - Optional rectangular boundary limits.
* @returns New clamped coordinate vector `{ x, y }`.
*
* @example
* ```typescript
* const clamped = clampDragCoordinates(250, -50, { minX: 0, maxX: 200, minY: 0, maxY: 200 });
* // => { x: 200, y: 0 }
* ```
*/

---

### `toDragOffset`

```typescript
export function toDragOffset(x: number, y: number):
```

/**
* Constructs a 2D drag offset object `{ x, y }`.
*
* @param x - Horizontal offset.
* @param y - Vertical offset.
* @returns 2D offset vector.
*
* @example
* ```typescript
* const offset = toDragOffset(15, 25);
* ```
*/

---

### `isDragOffsetEqual`

```typescript
export function isDragOffsetEqual(
  a?: { x: number; y: number } | null,
  b?: { x: number; y: number } | null,
): boolean
```

/**
* Determines whether two 2D drag offset vectors are value-equal.
*
* @param a - First offset vector.
* @param b - Second offset vector.
* @returns True if both coordinates match exactly.
*
* @example
* ```typescript
* isDragOffsetEqual({ x: 10, y: 20 }, { x: 10, y: 20 }); // => true
* isDragOffsetEqual({ x: 10, y: 20 }, { x: 5, y: 20 });  // => false
* ```
*/

---


## 📁 `utils/dragPhysics.ts`

### `normalizeDragDelta`

```typescript
export function normalizeDragDelta(
  deltaX: number,
  deltaY: number,
  scale = 1,
):
```

/**
* Normalizes raw pointer drag deltas taking into account canvas or container CSS scale factors.
*
* @example
* ```ts
* const delta = normalizeDragDelta(20, 40, 2); // => { x: 10, y: 20 }
* ```
*
* @param deltaX - Raw horizontal mouse/touch pixel delta.
* @param deltaY - Raw vertical mouse/touch pixel delta.
* @param scale - CSS zoom/scale transform factor of the container (default 1).
* @returns Normalized coordinate offset object.
*/

---

### `normalizeDragDeltaInto`

```typescript
export function normalizeDragDeltaInto(
  deltaX: number,
  deltaY: number,
  scale = 1,
  out: { x: number; y: number },
): void
```

/**
* Mutates target coordinate object in-place with normalized drag deltas to avoid heap allocations.
*
* @example
* ```ts
* const scratch = { x: 0, y: 0 };
* normalizeDragDeltaInto(30, 60, 1.5, scratch);
* // scratch => { x: 20, y: 40 }
* ```
*
* @param deltaX - Raw horizontal drag delta.
* @param deltaY - Raw vertical drag delta.
* @param scale - Container CSS scale factor.
* @param out - Destination object to write normalized x and y into.
*/

---

### `computeTiltMatrixInPlace`

```typescript
export function computeTiltMatrixInPlace(
  deltaX: number,
  deltaY: number,
  maxAngle: number,
  sensitivity: number,
  out: { rotationX: number; rotationY: number },
): void
```

/**
* Computes 3D tilt rotation angles in degrees directly into a reusable destination object.
*
* @remarks
* Produces zero heap allocations on high-frequency pointermove / animation frame events.
*
* @param deltaX - Horizontal drag displacement from initial grab point.
* @param deltaY - Vertical drag displacement from initial grab point.
* @param maxAngle - Upper angle threshold in degrees clamping the maximum tilt.
* @param sensitivity - Sensitivity multiplier for converting pixel delta into degrees.
* @param out - Destination object to receive rotationX and rotationY.
*/

---

### `computeTiltMatrix`

```typescript
export function computeTiltMatrix(
  deltaX: number,
  deltaY: number,
  maxAngle = 15,
  sensitivity = 0.1,
):
```

/**
* Computes 3D tilt rotation angles in degrees for interactive pointer dragging.
*
* @example
* ```ts
* const tilt = computeTiltMatrix(10, -15, 12, 0.08);
* // apply to card style: `transform: perspective(600px) rotateX(${tilt.rotationX}deg) rotateY(${tilt.rotationY}deg)`
* ```
*
* @param deltaX - Horizontal drag displacement from initial grab coordinate.
* @param deltaY - Vertical drag displacement from initial grab coordinate.
* @param maxAngle - Upper threshold clamping maximum 3D rotation in degrees (default 15).
* @param sensitivity - Multiplier for converting pixel offsets into degrees (default 0.1).
* @returns Object with calculated `rotationX` and `rotationY` degrees.
*/

---

### `applyDragFriction`

```typescript
export function applyDragFriction(delta: number, friction = 0.5): number
```

/**
* Applies physical resistance/friction factor to a drag displacement value.
*
* @example
* ```ts
* const resisted = applyDragFriction(100, 0.4); // => 60
* ```
*
* @param delta - Input displacement distance.
* @param friction - Resistance coefficient between 0 (no resistance) and 1 (full lock).
* @returns Damped displacement value.
*/

---


## 📁 `utils/dragRectClamping.ts`

### `clampCoordinateToBounds`

```typescript
export function clampCoordinateToBounds(
  transform: DragTransform2D,
  activeNodeRect: DragNodeRect,
  bounds: DragBoundsRect,
): DragTransform2D
```

/**
* Constrains drag transform coordinates relative to an active DOM node rectangle and bounding box.
* Guarantees that dragging the node will never push any of its edges outside `bounds`.
*
* @param transform - Current drag transform with 2D translation and scale.
* @param activeNodeRect - Bounding client rectangle of the dragged DOM node.
* @param bounds - Outer boundary rectangle constraining movement.
* @returns Updated `DragTransform2D` with clamped coordinates.
*
* @example
* ```typescript
* const clamped = clampCoordinateToBounds(
*   { x: 50, y: 120, scaleX: 1, scaleY: 1 },
*   { top: 100, left: 100, bottom: 200, right: 300, width: 200, height: 100 },
*   { top: 0, left: 0, bottom: 800, right: 1200 },
* );
* ```
*/

---

### `clampToViewport`

```typescript
export function clampToViewport(
  transform: DragTransform2D,
  activeNodeRect: DragNodeRect,
): DragTransform2D
```

/**
* Clamps drag transform coordinates to keep the active node entirely within viewport boundaries.
* In SSR / non-browser environments, safely falls back to a standard 1920x1080 viewport.
*
* @param transform - Current drag transform.
* @param activeNodeRect - Bounding rectangle of the dragged node.
* @returns Clamped transform constrained to viewport dimensions.
*
* @example
* ```typescript
* const viewportClamped = clampToViewport(dragTransform, nodeRect);
* ```
*/

---

### `clampToContainer`

```typescript
export function clampToContainer(
  transform: DragTransform2D,
  activeNodeRect: DragNodeRect,
  containerRect: { top: number; left: number; right: number; bottom: number },
): DragTransform2D
```

/**
* Clamps drag transform coordinates to keep the active node within container element boundaries.
*
* @param transform - Current drag transform.
* @param activeNodeRect - Bounding rectangle of the dragged node.
* @param containerRect - Bounding rectangle of the enclosing container element.
* @returns Clamped transform constrained to container boundaries.
*
* @example
* ```typescript
* const containerClamped = clampToContainer(dragTransform, nodeRect, containerRect);
* ```
*/

---

### `boundaryProximity`

```typescript
export function boundaryProximity(
  currentPos: number,
  minBound: number,
  maxBound: number,
): number
```

/**
* Calculates normalized proximity ratio (0.0 to 1.0) of a position between boundary bounds.
* Useful for calculating auto-scroll acceleration or edge glow effects.
*
* @param currentPos - Current position coordinate.
* @param minBound - Lower boundary coordinate.
* @param maxBound - Upper boundary coordinate.
* @returns Normalized scalar ratio in [0, 1].
*
* @example
* ```typescript
* const proximity = boundaryProximity(pointerX, 0, window.innerWidth);
* ```
*/

---


## 📁 `utils/equality.ts`

### `shallowEqualArray`

```typescript
export function shallowEqualArray<T>(a?: readonly T[], b?: readonly T[]): boolean
```

/**
* Performs a zero-allocation shallow equality comparison between two readonly arrays using `Object.is`.
*
* @template T - Element type.
* @param a - First array.
* @param b - Second array.
* @returns True if both arrays have identical length and identical elements.
*
* @example
* ```typescript
* shallowEqualArray([1, 2], [1, 2]); // true
* shallowEqualArray([1, 2], [1, 3]); // false
* ```
*/

---

### `areSetsEqual`

```typescript
export function areSetsEqual<T>(a?: ReadonlySet<T>, b?: ReadonlySet<T>): boolean
```

/**
* Checks whether two sets contain the exact same items.
*
* @template T - Value type.
* @param a - First Set.
* @param b - Second Set.
* @returns True if both sets have identical size and members.
*
* @example
* ```typescript
* areSetsEqual(new Set(['a', 'b']), new Set(['b', 'a'])); // true
* ```
*/

---

### `shallowEqual`

```typescript
export function shallowEqual<T>(objA: T, objB: T): boolean
```

/**
* Performs a high-performance shallow equality comparison between two values, objects, or arrays.
* Traverses object keys without allocating intermediate arrays (`Object.keys()`).
*
* @template T - Input value type.
* @param objA - First value.
* @param objB - Second value.
* @returns True if shallowly equal.
*
* @example
* ```typescript
* shallowEqual({ x: 10, y: 20 }, { x: 10, y: 20 }); // true
* shallowEqual({ x: 10 }, { x: 20 }); // false
* ```
*/

---

### `areObjectsEqual`

```typescript
function areObjectsEqual(recA: Record<string, unknown>, recB: Record<string, unknown>): boolean
```

*JSDoc отсутствует*

---

### `areObjectsDeepEqual`

```typescript
function areObjectsDeepEqual(
  recA: Record<string, unknown>,
  recB: Record<string, unknown>,
): boolean
```

*JSDoc отсутствует*

---

### `isDeepEqual`

```typescript
export function isDeepEqual<T>(a: T, b: T): boolean
```

/**
* Performs a recursive deep equality comparison between two arbitrary structures.
*
* @template T - Input value type.
* @param a - First value.
* @param b - Second value.
* @returns True if both structures are deeply structurally identical.
*
* @example
* ```typescript
* isDeepEqual({ nested: { a: 1 } }, { nested: { a: 1 } }); // true
* ```
*/

---

### `isCollisionConfigEqual`

```typescript
export function isCollisionConfigEqual(a?: unknown, b?: unknown): boolean
```

/**
* Compares two collision configuration objects for structural equality.
*
* @param a - First config.
* @param b - Second config.
* @returns True if both configurations match.
*/

---


## 📁 `utils/errorFormatting.ts`

### `formatPopoverErrorMessage`

```typescript
export function formatPopoverErrorMessage(
  code: PopoverErrorCode,
  message: string,
  remediationHint?: string,
): string
```

/**
* Formats a standardized domain error message string containing error code and optional remediation advice.
*
* @param code - Standardized PopoverErrorCode constant.
* @param message - Descriptive failure message.
* @param remediationHint - Optional actionable advice on how to resolve the issue.
* @returns Formatted error string.
*
* @example
* ```typescript
* formatPopoverErrorMessage(
*   PopoverErrorCode.CIRCULAR_CASCADE,
*   'Cycle detected between card-A and card-B',
*   'Ensure child popover does not open its parent node.',
* );
* ```
*/

---


## 📁 `utils/errors.ts`

### `isPopoverError`

```typescript
public static isPopoverError<C extends PopoverErrorCode>(
    error: unknown,
    code: C,
  ): error is PopoverError<C>
```

/**
* Type guard checking if an error is a PopoverError, optionally narrowing by specific code.
*
* @template C - Specific PopoverErrorCode.
* @param error - Unknown error candidate.
* @param code - Optional specific code to check.
* @returns True if error is a PopoverError matching code.
*
* @example
* ```typescript
* if (PopoverError.isPopoverError(err, PopoverErrorCode.CIRCULAR_CASCADE)) {
*   console.error('Circular popover reference detected!');
* }
* ```
*/

---

### `isPopoverError`

```typescript
public static isPopoverError(error: unknown): error is PopoverError
```

*JSDoc отсутствует*

---

### `isPopoverError`

```typescript
public static isPopoverError(error: unknown, code?: PopoverErrorCode): error is PopoverError
```

*JSDoc отсутствует*

---

### `createPopoverError`

```typescript
export function createPopoverError<TCode extends PopoverErrorCode = PopoverErrorCode>(
  code: TCode,
  message: string,
  remediationHint?: string,
  cause?: unknown,
): PopoverError<TCode>
```

/**
* Factory helper creating a new PopoverError instance.
*
* @template TCode - Specific error code type.
* @param code - Standardized PopoverErrorCode.
* @param message - Descriptive failure message.
* @param remediationHint - Actionable suggestion for the developer.
* @param cause - Optional root cause error.
* @returns New PopoverError instance.
*
* @example
* ```typescript
* const err = createPopoverError(PopoverErrorCode.RESOLVER_TIMEOUT, 'Resolver took > 5000ms');
* ```
*/

---

### `isPopoverError`

```typescript
export function isPopoverError<C extends PopoverErrorCode>(
  error: unknown,
  code: C,
): error is PopoverError<C>
```

/**
* Type guard verifying if an unknown error object is a PopoverError.
*
* @template C - Specific PopoverErrorCode.
* @param error - Error object to inspect.
* @param code - Optional code to match.
* @returns True if error conforms to PopoverError.
*
* @example
* ```typescript
* if (isPopoverError(err)) {
*   console.log('Error code:', err.code);
* }
* ```
*/

---

### `isPopoverError`

```typescript
export function isPopoverError(error: unknown): error is PopoverError
```

*JSDoc отсутствует*

---

### `isPopoverError`

```typescript
export function isPopoverError(error: unknown, code?: PopoverErrorCode): error is PopoverError
```

*JSDoc отсутствует*

---


## 📁 `utils/functional.test.ts`

### `double`

```typescript
const double = (n: number) => n * 2
```

*JSDoc отсутствует*

---

### `addTen`

```typescript
const addTen = (n: number) => n + 10
```

*JSDoc отсутствует*

---

### `toString`

```typescript
const toString = (n: number) => `value: $
```

*JSDoc отсутствует*

---

### `step1`

```typescript
const step1 = (x: number) => x + 1
```

*JSDoc отсутствует*

---

### `step2`

```typescript
const step2 = (x: number) => x * 2
```

*JSDoc отсутствует*

---

### `step3`

```typescript
const step3 = (x: number) => x - 3
```

*JSDoc отсутствует*

---

### `step4`

```typescript
const step4 = (x: number) => String(x)
```

*JSDoc отсутствует*

---

### `step5`

```typescript
const step5 = (x: string) => x.length
```

*JSDoc отсутствует*

---

### `step6`

```typescript
const step6 = (x: number) => x > 0
```

*JSDoc отсутствует*

---

### `double`

```typescript
const double = (n: number) => n * 2
```

*JSDoc отсутствует*

---

### `addTen`

```typescript
const addTen = (n: number) => n + 10
```

*JSDoc отсутствует*

---

### `isPositive`

```typescript
const isPositive = (n: number) => n > 0
```

*JSDoc отсутствует*

---

### `isEven`

```typescript
const isEven = (n: number) => n % 2 === 0
```

*JSDoc отсутствует*

---


## 📁 `utils/functional.ts`

### `identity`

```typescript
export function identity<T>(value: T): T
```

/** The identity function. Returns the passed argument without modification. */

---

### `noop`

```typescript
export function noop(): void
```

/** Pure singleton no-op callback. */

---

### `constant`

```typescript
export function constant<T>(val: T): () => T
```

/** Returns a constant function that always produces `val`. */

---

### `pipe`

```typescript
export function pipe<A>(a: A): A
```

/**
* Performs left-to-right function composition (pipeline).
*
* @template A - Initial value type.
* @param a - Initial value.
* @returns Final composed result.
*
* @example
* ```typescript
* const format = pipe(
*   '  hello  ',
*   (s) => s.trim(),
*   (s) => s.toUpperCase(),
* ); // => 'HELLO'
* ```
*/

---

### `pipe`

```typescript
export function pipe<A, B>(a: A, ab: (a: A) => B): B
```

*JSDoc отсутствует*

---

### `pipe`

```typescript
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
```

*JSDoc отсутствует*

---

### `pipe`

```typescript
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D
```

*JSDoc отсутствует*

---

### `pipe`

```typescript
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): E
```

*JSDoc отсутствует*

---

### `pipe`

```typescript
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): F
```

*JSDoc отсутствует*

---

### `pipe`

```typescript
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
): G
```

*JSDoc отсутствует*

---

### `pipe`

```typescript
export function pipe<T = unknown>(value: T, ...fns: readonly ((arg: T) => T)[]): T
```

*JSDoc отсутствует*

---

### `pipe`

```typescript
export function pipe(value: unknown, ...fns: readonly ((arg: unknown) => unknown)[]): unknown
```

*JSDoc отсутствует*

---

### `compose`

```typescript
export function compose<A, B>(ab: (a: A) => B): (a: A) => B
```

/**
* Performs right-to-left function composition.
*
* @returns Composed function executing right-to-left.
*
* @example
* ```typescript
* const roundAndDouble = compose(
*   (n: number) => n * 2,
*   (n: number) => Math.round(n),
* );
* roundAndDouble(4.6); // => 10
* ```
*/

---

### `compose`

```typescript
export function compose<A, B, C>(bc: (b: B) => C, ab: (a: A) => B): (a: A) => C
```

*JSDoc отсутствует*

---

### `compose`

```typescript
export function compose<A, B, C, D>(
  cd: (c: C) => D,
  bc: (b: B) => C,
  ab: (a: A) => B,
): (a: A) => D
```

*JSDoc отсутствует*

---

### `compose`

```typescript
export function compose<A, B, C, D, E>(
  de: (d: D) => E,
  cd: (c: C) => D,
  bc: (b: B) => C,
  ab: (a: A) => B,
): (a: A) => E
```

*JSDoc отсутствует*

---

### `compose`

```typescript
export function compose<T = unknown>(...fns: readonly ((arg: T) => T)[]): (initial: T) => T
```

*JSDoc отсутствует*

---

### `compose`

```typescript
export function compose(
  ...fns: readonly ((arg: unknown) => unknown)[]
): (initial: unknown) => unknown
```

*JSDoc отсутствует*

---

### `curry2`

```typescript
export function curry2<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R
```

/** Curries a binary function into a sequence of two unary functions. */

---

### `prop`

```typescript
export function prop<T, K extends keyof T>(key: K): (obj: T) => T[K]
```

/** Creates an accessor function extracting the specified property from an object. */

---

### `propEq`

```typescript
export function propEq<T, K extends keyof T>(key: K, value: T[K]): (obj: T) => boolean
```

/** Creates a predicate checking if an object's property strictly equals the specified value. */

---

### `and`

```typescript
export function and<T>(...predicates: readonly ((val: T) => boolean)[]): (val: T) => boolean
```

/**
* Combines multiple predicates into a single conjunction predicate (logical AND).
* Short-circuits with zero heap allocations on hot path.
*
* @template T - Target value type.
* @param predicates - Readonly array of predicate functions.
* @returns Conjunction predicate function.
*
* @example
* ```typescript
* const isPositiveEven = and(
*   (n: number) => n > 0,
*   (n: number) => n % 2 === 0,
* );
* isPositiveEven(4); // => true
* isPositiveEven(-2); // => false
* ```
*/

---

### `or`

```typescript
export function or<T>(...predicates: readonly ((val: T) => boolean)[]): (val: T) => boolean
```

/**
* Combines multiple predicates into a single disjunction predicate (logical OR).
* Short-circuits with zero heap allocations on hot path.
*
* @template T - Target value type.
* @param predicates - Readonly array of predicate functions.
* @returns Disjunction predicate function.
*
* @example
* ```typescript
* const isZeroOrNegative = or(
*   (n: number) => n === 0,
*   (n: number) => n < 0,
* );
* isZeroOrNegative(0); // => true
* isZeroOrNegative(5); // => false
* ```
*/

---

### `not`

```typescript
export function not<T>(predicate: (val: T) => boolean): (val: T) => boolean
```

/** Inverts a predicate function (logical NOT). */

---


## 📁 `utils/guards/actionStateGuards.ts`

### `isPopoverActionState`

```typescript
export function isPopoverActionState<TData = unknown, TError = Error>(
  val: unknown,
): val is PopoverActionState<TData, TError>
```

/** Validates whether an unknown value conforms to a PopoverActionState structure. */

---

### `isIdleActionState`

```typescript
export function isIdleActionState<TData, TError = Error>(
  state: PopoverActionState<TData, TError>,
): state is Extract<PopoverActionState<TData, TError>,
```

/** Checks if the action state is currently idle. */

---

### `isPendingActionState`

```typescript
export function isPendingActionState<TData, TError = Error>(
  state: PopoverActionState<TData, TError>,
): state is Extract<PopoverActionState<TData, TError>,
```

/** Checks if the action state is currently pending. */

---

### `isSuccessActionState`

```typescript
export function isSuccessActionState<TData, TError = Error>(
  state: PopoverActionState<TData, TError>,
): state is Extract<PopoverActionState<TData, TError>,
```

/** Checks if the action state resolved successfully. */

---

### `isErrorActionState`

```typescript
export function isErrorActionState<TData, TError = Error>(
  state: PopoverActionState<TData, TError>,
): state is Extract<PopoverActionState<TData, TError>,
```

/** Checks if the action state encountered an error. */

---


## 📁 `utils/guards/anchorGuards.ts`

### `isVirtualElementAnchor`

```typescript
export function isVirtualElementAnchor(source?: AnchorEventLike | null): source is VirtualElement
```

/**
* Type guard checking if an `AnchorEventLike` source is a Floating UI `VirtualElement`.
*
* @param source - Candidate anchor target or event.
* @returns True if `source` conforms to the VirtualElement interface.
*
* @example
* ```typescript
* if (isVirtualElementAnchor(anchor)) {
*   const rect = anchor.getBoundingClientRect();
* }
* ```
*/

---

### `isDOMElementAnchor`

```typescript
export function isDOMElementAnchor(source?: AnchorEventLike | null): source is Element
```

/**
* Type guard checking if an unknown source is a native DOM Element.
*
* @param source - Candidate anchor target or event.
* @returns True if `source` is an `Element`.
*
* @example
* ```typescript
* if (isDOMElementAnchor(target)) {
*   target.scrollIntoView();
* }
* ```
*/

---

### `isEventAnchor`

```typescript
export function isEventAnchor(
  source?: AnchorEventLike | null,
): source is
```

/**
* Type guard checking if an AnchorEventLike source is a DOM event with a currentTarget HTMLElement.
*
* @param source - Candidate anchor event or target.
* @returns True if `source` is an event containing an HTMLElement currentTarget.
*
* @example
* ```typescript
* if (isEventAnchor(e)) {
*   console.log(e.currentTarget);
* }
* ```
*/

---

### `toValidatedAnchorRef`

```typescript
export function toValidatedAnchorRef(source?: AnchorEventLike | null): ValidatedAnchorRef
```

/**
* Validates and converts an AnchorEventLike source into a ValidatedAnchorRef with geometry bounds.
*
* @param source - Candidate anchor target or event.
* @returns Standardized ValidatedAnchorRef with callable `getBoundingClientRect`.
*
* @example
* ```typescript
* const anchorRef = toValidatedAnchorRef(mouseEvent);
* const rect = anchorRef.getBoundingClientRect();
* ```
*/

---


## 📁 `utils/guards/arrayGuards.ts`

### `isNonEmptyArray`

```typescript
export function isNonEmptyArray<T>(val: readonly T[]): val is readonly [T, ...T[]]
```

/** Checks if an array is non-empty with at least one element. */

---

### `isNonEmptyArray`

```typescript
export function isNonEmptyArray<T>(val: unknown): val is readonly [T, ...T[]]
```

*JSDoc отсутствует*

---

### `isNonEmptyArray`

```typescript
export function isNonEmptyArray(val: unknown): boolean
```

*JSDoc отсутствует*

---

### `isArray`

```typescript
export function isArray<T = unknown>(val: unknown): val is readonly T[]
```

/** Checks whether an unknown value is an array, narrowing to a readonly array. */

---

### `isIterable`

```typescript
export function isIterable<T = unknown>(val: unknown): val is Iterable<T>
```

/** Checks whether an unknown value implements the Iterable protocol. */

---


## 📁 `utils/guards/configGuards.ts`

### `isDragAxis`

```typescript
export function isDragAxis(val: unknown): val is DragAxis
```

/** Validates whether a value is a DragAxis ('x' | 'y' | 'both'). */

---

### `isCascadeOffsetDirection`

```typescript
export function isCascadeOffsetDirection(val: unknown): val is CascadeOffsetDirection
```

/** Validates whether a value is a CascadeOffsetDirection ('left' | 'right' | 'top' | 'bottom' | 'none'). */

---

### `isHoverConfig`

```typescript
export function isHoverConfig(val: unknown): val is HoverConfig
```

/** Validates whether a value conforms to HoverConfig. */

---

### `isCollisionConfig`

```typescript
export function isCollisionConfig(val: unknown): val is CollisionConfig
```

/** Validates whether a value conforms to CollisionConfig. */

---

### `isFocusLockOptions`

```typescript
export function isFocusLockOptions(val: unknown): val is FocusLockOptions
```

/** Validates whether a value conforms to FocusLockOptions. */

---

### `isButtonControlConfig`

```typescript
export function isButtonControlConfig(val: unknown): val is ButtonControlConfig
```

/** Validates whether a value conforms to ButtonControlConfig. */

---

### `isStateStorageEngine`

```typescript
export function isStateStorageEngine(val: unknown): val is StateStorageEngine
```

/** Validates whether a value conforms to StateStorageEngine duck-type. */

---

### `isPopoverPersistConfig`

```typescript
export function isPopoverPersistConfig(val: unknown): val is PopoverPersistConfig
```

/** Validates whether a value conforms to PopoverPersistConfig. */

---

### `isPopoverDisplayOptions`

```typescript
export function isPopoverDisplayOptions(val: unknown): val is PopoverDisplayOptions
```

/** Validates whether a value conforms to PopoverDisplayOptions. */

---


## 📁 `utils/guards/domGuards.ts`

### `isHTMLElement`

```typescript
export function isHTMLElement(val: unknown): val is HTMLElement
```

/** Type guard verifying if an unknown value is an HTMLElement instance. */

---

### `isElement`

```typescript
export function isElement(val: unknown): val is Element
```

/** Type guard verifying if an unknown value is a DOM Element instance. */

---

### `isElementLike`

```typescript
export function isElementLike(val: unknown): val is Element
```

/** Type guard verifying if an unknown value satisfies an Element-like contract (DOM or test mock). */

---

### `isMessageEvent`

```typescript
export function isMessageEvent(val: unknown): val is MessageEvent
```

/** Type guard verifying if an unknown value is a native MessageEvent. */

---

### `escapeCssIdentifier`

```typescript
export function escapeCssIdentifier(ident: string): string
```

/** Safely escapes a CSS identifier for query selectors. */

---

### `isTextEditableElement`

```typescript
export function isTextEditableElement(el: unknown): el is HTMLElement
```

/** Determines whether a DOM element is an interactive text editing control. */

---

### `isClickableElement`

```typescript
export function isClickableElement(el: unknown): el is HTMLElement
```

/** Determines whether an element is a clickable button or anchor link. */

---

### `isStorageAvailable`

```typescript
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean
```

/** Checks whether the given Storage engine is accessible without throwing. */

---


## 📁 `utils/guards/entryGuards.ts`

### `isResolvedEntry`

```typescript
export function isResolvedEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is TrailEntry<TData, TPopoverKey> &
```

/**
* Type guard verifying if a `TrailEntry` has resolved data successfully.
* Narrows `entry.data` to `TData` (non-undefined) and `entry.error` to `null`.
*
* @template TData - Entry payload data type.
* @template TPopoverKey - Popover identifier type.
* @param entry - Candidate trail entry to inspect.
* @returns True if entry status is 'success' or contains defined data without errors.
*
* @example
* ```typescript
* if (isResolvedEntry(entry)) {
*   console.log(entry.data);
* }
* ```
*/

---

### `isLoadingEntry`

```typescript
export function isLoadingEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is TrailEntry<TData, TPopoverKey> &
```

/**
* Type guard verifying if a `TrailEntry` is actively fetching data.
*
* @template TData - Entry payload data type.
* @template TPopoverKey - Popover identifier type.
* @param entry - Candidate trail entry to inspect.
* @returns True if entry has `isLoading: true`.
*
* @example
* ```typescript
* if (isLoadingEntry(entry)) {
*   showSpinner();
* }
* ```
*/

---

### `isErrorEntry`

```typescript
export function isErrorEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is TrailEntry<TData, TPopoverKey> &
```

/**
* Type guard verifying if a `TrailEntry` encountered an error during data resolution.
*
* @template TData - Entry payload data type.
* @template TPopoverKey - Popover identifier type.
* @param entry - Candidate trail entry to inspect.
* @returns True if entry has an `Error` instance in its error field.
*
* @example
* ```typescript
* if (isErrorEntry(entry)) {
*   showError(entry.error.message);
* }
* ```
*/

---

### `getEntryState`

```typescript
export function getEntryState<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined | null,
): PopoverEntryDiscriminatedState<TData>
```

/**
* Extracts a normalized discriminated state object from a `TrailEntry` for switch/case pattern matching.
*
* @template TData - Entry payload data type.
* @template TPopoverKey - Popover identifier type.
* @param entry - Candidate trail entry or null/undefined.
* @returns Discriminated union representation of the entry's lifecycle and data state.
*
* @example
* ```typescript
* const state = getEntryState(entry);
* switch (state.status) {
*   case 'loading': return <Spinner />;
*   case 'error': return <ErrorAlert error={state.error} />;
*   case 'success': return <Content data={state.data} />;
*   case 'idle': return null;
* }
* ```
*/

---

### `isTrailEntry`

```typescript
export function isTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is TrailEntry<TData, TPopoverKey>
```

/**
* Non-throwing boolean type guard verifying that an unknown value matches the TrailEntry interface.
*
* @template TData - Entry payload data type.
* @template TPopoverKey - Popover identifier type.
* @param val - Candidate value to evaluate.
* @returns True if `val` satisfies the minimum TrailEntry shape.
*
* @example
* ```typescript
* if (isTrailEntry(item)) {
*   console.log(item.key);
* }
* ```
*/

---

### `assertIsTrailEntry`

```typescript
export function assertIsTrailEntry<TData = unknown>(
  value: unknown,
): asserts value is TrailEntry<TData>
```

/**
* Assertion function verifying that `value` matches the `TrailEntry` interface.
*
* @template TData - Entry payload data type.
* @param value - Candidate value to assert.
* @throws {TypeError} If `value` is not a valid TrailEntry.
*
* @example
* ```typescript
* assertIsTrailEntry(entry);
* // entry is now typed as TrailEntry<TData>
* ```
*/

---


## 📁 `utils/guards/envGuards.ts`

### `isBrowser`

```typescript
export function isBrowser(): boolean
```

/** Returns true if executing in a browser environment with `window` defined. */

---

### `isServer`

```typescript
export function isServer(): boolean
```

/** Returns true if executing in a server/Node.js environment where `window` is undefined. */

---

### `isDOM`

```typescript
export function isDOM(): boolean
```

/** Returns true if executing in a DOM environment with `document` defined. */

---

### `isTouchDevice`

```typescript
export function isTouchDevice(): boolean
```

/** Returns true if running on a device that supports primary touch input. */

---

### `prefersReducedMotion`

```typescript
export function prefersReducedMotion(): boolean
```

/** Returns true if the user's OS or browser preference has reduced motion enabled. */

---

### `isBroadcastChannelSupported`

```typescript
export function isBroadcastChannelSupported(): boolean
```

/** Returns true if the browser environment supports the BroadcastChannel API. */

---

### `isResizeObserverSupported`

```typescript
export function isResizeObserverSupported(): boolean
```

/** Returns true if the browser environment supports ResizeObserver. */

---

### `isMutationObserverSupported`

```typescript
export function isMutationObserverSupported(): boolean
```

/** Returns true if the browser environment supports MutationObserver. */

---

### `isIntersectionObserverSupported`

```typescript
export function isIntersectionObserverSupported(): boolean
```

/** Returns true if the browser environment supports IntersectionObserver. */

---

### `isAnimationFrameSupported`

```typescript
export function isAnimationFrameSupported(): boolean
```

/** Returns true if requestAnimationFrame and cancelAnimationFrame are supported. */

---


## 📁 `utils/guards/errorGuards.ts`

### `isError`

```typescript
export function isError(val: unknown): val is Error
```

/** Type guard checking if an unknown value is an instance of Error. */

---

### `isErrorLike`

```typescript
export function isErrorLike(val: unknown): val is
```

/** Cross-realm duck-type guard checking if an object has error-like structure (name and message). */

---

### `isAbortError`

```typescript
export function isAbortError(err: unknown): boolean
```

/** Checks if an error represents an AbortError from an AbortController or fetch cancellation. */

---

### `toError`

```typescript
export function toError(err: unknown): Error
```

/** Normalizes any unknown thrown value or error candidate into a standard Error object. */

---

### `toErrorMessage`

```typescript
export function toErrorMessage(err: unknown): string
```

/** Extracts a descriptive error message string from any unknown thrown entity. */

---


## 📁 `utils/guards/eventGuards.ts`

### `isPopoverStoreEvent`

```typescript
export function isPopoverStoreEvent<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is PopoverStoreEvent<TData, TPopoverKey>
```

/**
* Validates that an unknown candidate is a PopoverStoreEvent.
*
* @template TData - Event payload data type.
* @template TPopoverKey - Popover key identifier type.
* @param val - Candidate value to evaluate.
* @returns True if `val` conforms to a valid PopoverStoreEvent.
*
* @example
* ```typescript
* if (isPopoverStoreEvent(event)) {
*   console.log(event.type, event.key);
* }
* ```
*/

---

### `matchesEventAction`

```typescript
function matchesEventAction<TData, TPopoverKey extends string, A extends PopoverEventAction>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
  action: A,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>,
```

/** Internal predicate matching a PopoverStoreEvent against an action name. */

---

### `isOpenRootEvent`

```typescript
export function isOpenRootEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
```

/**
* Type guard for 'open_root' event.
*
* @template TData - Event payload data type.
* @template TPopoverKey - Popover key identifier type.
* @param event - Candidate store event.
* @returns True if event is 'open_root'.
*
* @example
* ```typescript
* if (isOpenRootEvent(event)) {
*   console.log('Root opened:', event.key);
* }
* ```
*/

---

### `isPushNestedEvent`

```typescript
export function isPushNestedEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
```

/**
* Type guard for 'push_nested' event.
*
* @template TData - Event payload data type.
* @template TPopoverKey - Popover key identifier type.
* @param event - Candidate store event.
* @returns True if event is 'push_nested'.
*
* @example
* ```typescript
* if (isPushNestedEvent(event)) {
*   console.log('Nested child opened:', event.key, 'parent:', event.parentKey);
* }
* ```
*/

---

### `isCloseEvent`

```typescript
export function isCloseEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>,
```

/**
* Type guard for 'close' event.
*
* @template TData - Event payload data type.
* @template TPopoverKey - Popover key identifier type.
* @param event - Candidate store event.
* @returns True if event is 'close'.
*
* @example
* ```typescript
* if (isCloseEvent(event)) {
*   console.log('Closed popover:', event.key);
* }
* ```
*/

---

### `isPinEvent`

```typescript
export function isPinEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>,
```

/**
* Type guard for 'pin' event.
*
* @template TData - Event payload data type.
* @template TPopoverKey - Popover key identifier type.
* @param event - Candidate store event.
* @returns True if event is 'pin'.
*
* @example
* ```typescript
* if (isPinEvent(event)) {
*   console.log('Pinned card:', event.key);
* }
* ```
*/

---

### `isUnpinEvent`

```typescript
export function isUnpinEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>,
```

/**
* Type guard for 'unpin' event.
*
* @template TData - Event payload data type.
* @template TPopoverKey - Popover key identifier type.
* @param event - Candidate store event.
* @returns True if event is 'unpin'.
*
* @example
* ```typescript
* if (isUnpinEvent(event)) {
*   console.log('Unpinned card:', event.key);
* }
* ```
*/

---

### `isClearEvent`

```typescript
export function isClearEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>,
```

/**
* Type guard for 'clear' event.
*
* @template TData - Event payload data type.
* @template TPopoverKey - Popover key identifier type.
* @param event - Candidate store event.
* @returns True if event is 'clear'.
*
* @example
* ```typescript
* if (isClearEvent(event)) {
*   console.log('Cleared all active cards');
* }
* ```
*/

---


## 📁 `utils/guards/eventLifecycleGuards.ts`

### `matchesEventAction`

```typescript
function matchesEventAction<TData, TPopoverKey extends string, A extends PopoverEventAction>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
  action: A,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>,
```

*JSDoc отсутствует*

---

### `isResolveStartEvent`

```typescript
export function isResolveStartEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
```

/** Type guard for 'resolve_start' event. */

---

### `isResolveSuccessEvent`

```typescript
export function isResolveSuccessEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
```

/** Type guard for 'resolve_success' event. */

---

### `isResolveErrorEvent`

```typescript
export function isResolveErrorEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
```

/** Type guard for 'resolve_error' event. */

---

### `isResolvePerfEvent`

```typescript
export function isResolvePerfEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
```

/** Type guard for 'resolve_perf' event. */

---

### `isDragStartEvent`

```typescript
export function isDragStartEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
```

/** Type guard for 'drag_start' event. */

---

### `isDragEndEvent`

```typescript
export function isDragEndEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
```

/** Type guard for 'drag_end' event. */

---

### `isTimelineStep`

```typescript
export function isTimelineStep<TData = unknown>(val: unknown): val is PopoverTimelineStep<TData>
```

/** Validates whether an unknown candidate conforms to PopoverTimelineStep. */

---

### `isActiveTimelineStep`

```typescript
export function isActiveTimelineStep<TData = unknown>(
  val: unknown,
): val is ActiveTimelineStep<TData>
```

/** Validates whether an unknown candidate conforms to ActiveTimelineStep. */

---


## 📁 `utils/guards/focusGuards.ts`

### `getActiveHTMLElement`

```typescript
export function getActiveHTMLElement(): HTMLElement | null
```

/** Returns the currently active document element if it is an HTMLElement. */

---

### `canElementReceiveFocus`

```typescript
export function canElementReceiveFocus(el: unknown): el is HTMLElement
```

/** Checks whether an element is connected to the DOM and can receive focus. */

---

### `isFocusableElement`

```typescript
export function isFocusableElement(
  el: unknown,
): el is HTMLElement &
```

/** Type guard verifying if an unknown entity is an HTMLElement that can receive focus. */

---

### `isFocusWithin`

```typescript
export function isFocusWithin(
  container: Element | null,
  activeElement: Element | null = isDOM() ? document.activeElement : null,
): boolean
```

/** Determines whether focus is within the container or on document body. */

---

### `isPointerOrMouseEvent`

```typescript
export function isPointerOrMouseEvent(e: unknown): e is PointerEvent | MouseEvent
```

/** Type guard validating whether an event is a MouseEvent or PointerEvent. */

---

### `isContainedInPath`

```typescript
export function isContainedInPath(
  path: readonly EventTarget[],
  target: Element | null,
  container: Element | null | undefined,
): boolean
```

/** Checks whether an event target path or target element is contained within a container element. */

---


## 📁 `utils/guards/geometryGuards.ts`

### `isPopoverRect`

```typescript
export function isPopoverRect(val: unknown): val is PopoverRect
```

/**
* Validates whether an unknown value conforms to a finite immutable PopoverRect.
*/

---

### `isDOMRect`

```typescript
export function isDOMRect(val: unknown): val is DOMRect
```

/**
* Non-throwing type guard checking if an unknown value is a valid DOMRect instance or duck-type.
*/

---

### `isDOMRectOrPopoverRect`

```typescript
export function isDOMRectOrPopoverRect(val: unknown): val is DOMRect | PopoverRect
```

/**
* Union type guard checking if a value is either a DOMRect or a PopoverRect.
*/

---

### `isPoint2D`

```typescript
export function isPoint2D(val: unknown): val is Point2D
```

/**
* Validates whether a value is an immutable 2D point with finite coordinates.
*/

---

### `isDragOffset`

```typescript
export function isDragOffset(val: unknown, limit = 10000): val is DragOffset
```

/**
* Validates whether a value is a finite DragOffset within coordinate bounds.
*/

---


## 📁 `utils/guards/keyboardGuards.ts`

### `isKeyIdentifiable`

```typescript
export function isKeyIdentifiable(val: unknown): val is KeyIdentifiable
```

/** Type guard verifying if an unknown entity has a string key property. */

---

### `isKeyboardEvent`

```typescript
export function isKeyboardEvent(val: unknown): val is KeyboardEvent
```

/** Type guard verifying if an unknown value is a native KeyboardEvent or duck-type. */

---

### `isKey`

```typescript
export function isKey(e: KeyIdentifiable, key: string): boolean
```

/** Helper predicate checking if an event matches a specific key string. */

---

### `isEscapeKey`

```typescript
export function isEscapeKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to Escape. */

---

### `isTabKey`

```typescript
export function isTabKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to Tab. */

---

### `isEnterKey`

```typescript
export function isEnterKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to Enter. */

---

### `isSpaceKey`

```typescript
export function isSpaceKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to Space. */

---

### `isActivationKey`

```typescript
export function isActivationKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key is a WCAG standard activation key (Enter or Space). */

---

### `hasModifierKey`

```typescript
export function hasModifierKey(e: ModifierIdentifiable): boolean
```

/** Checks if any modifier keys (Cmd/Ctrl/Alt/Shift) are active. */

---


## 📁 `utils/guards/keyboardNavGuards.ts`

### `isArrowUpKey`

```typescript
export function isArrowUpKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to ArrowUp. */

---

### `isArrowDownKey`

```typescript
export function isArrowDownKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to ArrowDown. */

---

### `isArrowLeftKey`

```typescript
export function isArrowLeftKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to ArrowLeft. */

---

### `isArrowRightKey`

```typescript
export function isArrowRightKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to ArrowRight. */

---

### `isVerticalArrowKey`

```typescript
export function isVerticalArrowKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key is a vertical arrow navigation key (ArrowUp or ArrowDown). */

---

### `isHorizontalArrowKey`

```typescript
export function isHorizontalArrowKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key is a horizontal arrow navigation key (ArrowLeft or ArrowRight). */

---

### `isHomeKey`

```typescript
export function isHomeKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to Home. */

---

### `isEndKey`

```typescript
export function isEndKey(e: KeyIdentifiable): boolean
```

/** Checks if the event key corresponds to End. */

---


## 📁 `utils/guards/lifecycleGuards.ts`

### `isTransitionStatus`

```typescript
export function isTransitionStatus(val: unknown): val is PopoverTransitionStatus
```

/**
* Validates whether an unknown value is a valid PopoverTransitionStatus.
*
* @param val - Candidate value to evaluate.
* @returns True if `val` is 'idle', 'mounting', 'mounted', or 'unmounting'.
*
* @example
* ```typescript
* isTransitionStatus('mounted'); // => true
* isTransitionStatus('unknown'); // => false
* ```
*/

---

### `isMountedEntry`

```typescript
export function isMountedEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T &
```

/**
* Checks whether a popover entry is currently in the mounted transition state.
*
* @template T - Entry type extending TrailEntryBase.
* @param entry - Candidate entry object.
* @returns True if `entry.transitionStatus === 'mounted'`.
*
* @example
* ```typescript
* if (isMountedEntry(entry)) {
*   // Safe to trigger child cascades or interactive animations
* }
* ```
*/

---

### `isUnmountingEntry`

```typescript
export function isUnmountingEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T &
```

/**
* Checks whether a popover entry is currently in the unmounting exit transition state.
*
* @template T - Entry type extending TrailEntryBase.
* @param entry - Candidate entry object.
* @returns True if `entry.transitionStatus === 'unmounting'`.
*
* @example
* ```typescript
* if (isUnmountingEntry(entry)) {
*   // Entry is currently playing exit animation
* }
* ```
*/

---

### `isMountingEntry`

```typescript
export function isMountingEntry<T extends TrailEntryBase>(
  entry: T | undefined | null,
): entry is T &
```

/**
* Checks whether a popover entry is currently in the mounting initial transition state.
*
* @template T - Entry type extending TrailEntryBase.
* @param entry - Candidate entry object.
* @returns True if `entry.transitionStatus === 'mounting'`.
*
* @example
* ```typescript
* if (isMountingEntry(entry)) {
*   // Entry is mounting and measuring DOM bounds
* }
* ```
*/

---


## 📁 `utils/guards/numberGuards.ts`

### `isFiniteNumber`

```typescript
export function isFiniteNumber(value: unknown): value is number
```

/** Checks if a value is a valid finite number. */

---

### `isNumberInRange`

```typescript
export function isNumberInRange(value: unknown, min: number, max: number): value is number
```

/** Checks if a value is a valid finite number within the inclusive range [min, max]. */

---

### `isNonNegativeFinite`

```typescript
export function isNonNegativeFinite(value: unknown): value is number
```

/** Checks if a value is a valid finite number greater than or equal to 0. */

---

### `isPositiveFinite`

```typescript
export function isPositiveFinite(value: unknown): value is number
```

/** Checks if a value is a valid finite positive number strictly greater than 0. */

---

### `isCoordinateWithinBounds`

```typescript
export function isCoordinateWithinBounds(value: unknown, limit = 10000): value is number
```

/** Checks if a coordinate value is a valid finite number within [-limit, limit]. */

---

### `areCoordinatesWithinBounds`

```typescript
export function areCoordinatesWithinBounds(x: unknown, y: unknown, limit = 10000): boolean
```

/** Checks if both X and Y coordinates are valid finite numbers within [-limit, limit]. */

---

### `toFiniteOrDefault`

```typescript
export function toFiniteOrDefault(value: unknown, fallback = 0): number
```

/** Sanitizes an unknown numeric candidate to a safe finite number with default fallback. */

---

### `isFinitePoint`

```typescript
export function isFinitePoint(pt: unknown): pt is
```

/** Checks if an object has finite coordinate properties x and y. */

---

### `isFiniteRect`

```typescript
export function isFiniteRect(rect: unknown): rect is
```

/** Checks if an object has finite rectangular coordinates top and left. */

---


## 📁 `utils/guards/objectGuards.ts`

### `isPlainObject`

```typescript
export function isPlainObject(val: unknown): val is Record<string, unknown>
```

/**
* Validates whether a value is a plain JavaScript dictionary object (`{}` or `Object.create(null)`),
* rejecting class instances (Date, RegExp, Map, Set, Error) and arrays.
*/

---

### `isSafeRecord`

```typescript
export function isSafeRecord(val: unknown): val is Record<string, unknown>
```

/** Validates whether an object is a plain record immune to prototype pollution (contains no dangerous keys). */

---

### `isObjectRecord`

```typescript
export function isObjectRecord(val: unknown): val is Record<PropertyKey, unknown>
```

/** Type guard verifying whether an unknown candidate is a non-null object record. */

---

### `hasFunctionProperty`

```typescript
export function hasFunctionProperty<K extends PropertyKey>(
  obj: unknown,
  prop: K,
): obj is Record<K, (...args: readonly unknown[]) => unknown>
```

/** Type guard verifying whether an object has a specific callable function property. */

---

### `isPromiseLike`

```typescript
export function isPromiseLike<T = unknown>(val: unknown): val is PromiseLike<T>
```

/** Type guard verifying whether an unknown value is a Promise or Thenable. */

---

### `hasSafeProperty`

```typescript
export function hasSafeProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown>
```

/** Safe property accessor guard verifying own property existence and guarding against prototype pollution keys. */

---


## 📁 `utils/guards/placementGuards.ts`

### `isPopoverPlacement`

```typescript
export function isPopoverPlacement(val: unknown): val is PopoverPlacement
```

/** Validates whether a value is a recognized Floating UI placement. */

---

### `isSide`

```typescript
export function isSide(val: unknown): val is 'top' | 'right' | 'bottom' | 'left'
```

/** Validates whether a value is a cardinal side. */

---

### `isAlignment`

```typescript
export function isAlignment(val: unknown): val is 'start' | 'end'
```

/** Validates whether a value is an alignment suffix. */

---

### `isAutoPlacement`

```typescript
export function isAutoPlacement(val: unknown): val is 'auto' | 'auto-start' | 'auto-end'
```

/** Validates whether a value is an automatic placement strategy. */

---

### `isVerticalPlacement`

```typescript
export function isVerticalPlacement(placement: PopoverPlacement): boolean
```

/** Checks whether a placement is vertically oriented (top or bottom). */

---

### `isHorizontalPlacement`

```typescript
export function isHorizontalPlacement(placement: PopoverPlacement): boolean
```

/** Checks whether a placement is horizontally oriented (left or right). */

---

### `isResponsiveMode`

```typescript
export function isResponsiveMode(val: unknown): val is PopoverResponsiveMode
```

/** Validates whether a value is a valid responsive presentation mode. */

---

### `isLayoutStrategy`

```typescript
export function isLayoutStrategy(val: unknown): val is PopoverLayoutStrategy
```

/** Validates whether a value is a valid layout strategy. */

---


## 📁 `utils/guards/reactGuards.ts`

### `isRenderProp`

```typescript
export function isRenderProp<T = unknown>(
  children: unknown,
): children is (scope: T) => React.ReactNode
```

/**
* Type guard checking if `children` is a Render Prop function taking `scope` context.
*
* @template T - Render prop argument scope type.
* @param children - Candidate children prop value.
* @returns True if `children` is a function taking scope context.
*
* @example
* ```tsx
* if (isRenderProp(children)) {
*   return children(cardScope);
* }
* ```
*/

---

### `isReactRefObject`

```typescript
export function isReactRefObject<T = unknown>(ref: unknown): ref is MutableRefLike<T>
```

/**
* Type guard verifying if an unknown reference object is a mutable React ref object.
*
* @template T - Current ref element type.
* @param ref - Candidate ref object.
* @returns True if `ref` has a `.current` property.
*
* @example
* ```typescript
* if (isReactRefObject<HTMLElement>(ref)) {
*   console.log(ref.current);
* }
* ```
*/

---

### `hasRefProperty`

```typescript
export function hasRefProperty<T>(val: unknown): val is HasRefProp<T>
```

/**
* Type guard verifying if an object contains a `ref` property.
*
* @template T - Element type.
* @param val - Candidate object to inspect.
* @returns True if `val` contains a `ref` field.
*/

---

### `extractElementRef`

```typescript
export function extractElementRef<T = HTMLElement>(
  element: React.ReactElement,
): React.Ref<T> | undefined
```

/**
* Safely extracts a ref from a ReactElement across React 18 and React 19 representations.
*
* @template T - Element type.
* @param element - React element instance.
* @returns Ref object or function if present, otherwise undefined.
*
* @example
* ```typescript
* const childRef = extractElementRef<HTMLDivElement>(child);
* ```
*/

---

### `isSyntheticEvent`

```typescript
export function isSyntheticEvent(e: unknown): e is React.SyntheticEvent
```

/**
* Type guard verifying if an unknown event is a React SyntheticEvent.
*
* @param e - Candidate event object.
* @returns True if `e` has `nativeEvent`, `preventDefault`, and `stopPropagation`.
*
* @example
* ```typescript
* if (isSyntheticEvent(evt)) {
*   evt.stopPropagation();
* }
* ```
*/

---

### `isCurrentlyRenderingInReact`

```typescript
export function isCurrentlyRenderingInReact(): boolean
```

/**
* Checks if the current execution frame is within an active React component render phase.
*
* @returns True if React current dispatcher or current owner is populated.
*
* @example
* ```typescript
* if (!isCurrentlyRenderingInReact()) {
*   // Safe to execute side-effects or schedule updates
* }
* ```
*/

---


## 📁 `utils/guards/responsiveGuards.ts`

### `isBottomSheetMode`

```typescript
export function isBottomSheetMode(
  mode: string | undefined,
  isMobile: boolean,
  strategy?: string,
): boolean
```

/**
* Checks whether the popover should render as a mobile bottom-sheet based on
* explicit mode, automatic mobile viewport detection, or layout strategy.
*/

---

### `isCenteredModalMode`

```typescript
export function isCenteredModalMode(mode: string | undefined, strategy?: string): boolean
```

/**
* Checks whether the popover should render as a viewport-centered modal card.
*/

---

### `isDockedTopMode`

```typescript
export function isDockedTopMode(strategy: string | undefined): boolean
```

/**
* Checks whether the popover should dock to the top edge navigation bar.
*/

---


## 📁 `utils/guards/spatialGuards.ts`

### `isValidBoundingBox`

```typescript
export function isValidBoundingBox(bounds: unknown): bounds is BoundingBox
```

/**
* Type guard validating that a value is a well-formed BoundingBox with finite coordinates
* and non-negative dimensions.
*/

---

### `isValidQuadItem`

```typescript
export function isValidQuadItem<TId extends string = string>(item: unknown): item is QuadItem<TId>
```

/**
* Type guard validating that an item node has a valid non-empty identifier and valid bounding box.
*/

---

### `boxesIntersect`

```typescript
export function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean
```

/**
* Determines whether two 2D bounding boxes intersect.
* Correctly handles zero-dimension bounds (points and edges) using inclusive boundaries.
*/

---


## 📁 `utils/guards/stringGuards.ts`

### `isNonEmptyString`

```typescript
export function isNonEmptyString(value: unknown): value is string
```

/** Checks whether a value is a trimmed, non-empty string. */

---

### `isFunction`

```typescript
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown
```

/** Checks whether a value is a callable function. */

---

### `isRecordObject`

```typescript
export function isRecordObject(value: unknown): value is Record<string, unknown>
```

/** Checks whether a value is a non-null, non-array object record. */

---


## 📁 `utils/guards/syncGuards.ts`

### `isPopoverSyncActionType`

```typescript
export function isPopoverSyncActionType(type: unknown): type is PopoverSyncActionType
```

/**
* Type guard verifying if an action string is a valid PopoverSyncActionType.
*/

---

### `isPopoverSyncMessage`

```typescript
export function isPopoverSyncMessage(data: unknown): data is PopoverSyncMessage
```

/**
* Type guard validating that an untrusted incoming broadcast message conforms
* to the PopoverSyncMessage envelope schema and is immune to prototype pollution.
*/

---


## 📁 `utils/guards/valueObjectGuards.ts`

### `isZIndex`

```typescript
export function isZIndex(val: unknown): val is ZIndex
```

/**
* Validates that an unknown candidate is a ZIndex value object instance.
*/

---

### `isDurationMs`

```typescript
export function isDurationMs(val: unknown): val is DurationMs
```

/**
* Validates that an unknown candidate is a DurationMs value object instance.
*/

---

### `isPoint2DInstance`

```typescript
export function isPoint2DInstance(val: unknown): val is Point2D
```

/**
* Validates that an unknown candidate is a Point2D class instance.
*/

---

### `isRectBoundsInstance`

```typescript
export function isRectBoundsInstance(val: unknown): val is RectBounds
```

/**
* Validates that an unknown candidate is a RectBounds class instance.
*/

---


## 📁 `utils/guards/viewportGuards.ts`

### `extractNumericStyle`

```typescript
export function extractNumericStyle(val: unknown): number
```

/**
* Safely extracts a numeric pixel value from a CSS style property (number or string with 'px').
*/

---

### `assertIsDOMRect`

```typescript
export function assertIsDOMRect(value: unknown): asserts value is DOMRect
```

/**
* Assertion function verifying that `value` matches the `DOMRect` interface.
*/

---


## 📁 `utils/invariant.ts`

### `invariant`

```typescript
export function invariant(
  condition: unknown,
  messageOrFactory: string | (() => Error | string),
): asserts condition
```

/**
* Fail-fast invariant assertion guard.
* Validates that `condition` is truthy, throwing a formatted descriptive error if false.
* Narrowing predicate for TypeScript control flow analysis.
*
* @param condition - Candidate truthy condition to assert.
* @param messageOrFactory - Diagnostic message string or error factory function.
* @throws {Error} If condition evaluates to falsy.
*
* @example
* ```typescript
* invariant(store != null, 'Store must be initialized before dispatching actions');
* invariant(entry.depth <= 10, () => new RangeError('Cascade depth exceeded'));
* ```
*/

---


## 📁 `utils/keyedTimerPool.ts`

### `has`

```typescript
public has(key: TKey): boolean
```

/**
* Checks if a timer is currently scheduled for the specified key.
*
* @param key - Identifier to check.
* @returns True if a timer is active.
*/

---

### `schedule`

```typescript
public schedule(key: TKey, delay: number, callback: () => void): void
```

/**
* Schedules a delayed callback for the specified key, automatically cancelling any previous timer for that key.
* If delay is 0 or negative, executes via `deferMicrotask` to avoid macro-timer overhead.
*
* @param key - Timer identifier.
* @param delay - Delay in milliseconds.
* @param callback - Function to execute when timer expires.
*
* @example
* ```typescript
* pool.schedule('menu', 200, () => showMenu());
* ```
*/

---

### `cancel`

```typescript
public cancel(key: TKey): boolean
```

/**
* Cancels a pending timer by its key.
*
* @param key - Timer identifier to cancel.
* @returns True if a timer was found and cancelled, false otherwise.
*
* @example
* ```typescript
* pool.cancel('menu');
* ```
*/

---

### `cancelKeys`

```typescript
public cancelKeys(keys: Iterable<TKey>): void
```

/**
* Cancels all timers matching the provided sequence of keys.
*
* @param keys - Iterable collection of keys to cancel.
*
* @example
* ```typescript
* pool.cancelKeys(['card-1', 'card-2']);
* ```
*/

---

### `cancelAll`

```typescript
public cancelAll(): void
```

/**
* Cancels and clears all currently scheduled timers in the pool.
*
* @example
* ```typescript
* pool.cancelAll();
* ```
*/

---

### `dispose`

```typescript
public dispose(): void
```

/**
* Disposes the timer pool, cancelling all active timers and rejecting future scheduling.
*/

---


## 📁 `utils/layout/layoutStrategyTypes.ts`

### `resolveViewportDimensions`

```typescript
export function resolveViewportDimensions(params: LayoutStrategyParams):
```

*JSDoc отсутствует*

---


## 📁 `utils/lruCache.ts`

### `createLRUCache`

```typescript
export function createLRUCache<K, V>(maxSize = 50): LRUCache<K, V>
```

/**
* Creates a bounded O(1) LRU (Least Recently Used) cache backed by JavaScript Map key insertion order.
*
* @template K - Cache key type.
* @template V - Cached value type.
* @param maxSize - Maximum number of entries before eviction (defaults to 50).
* @returns An initialized `LRUCache` instance.
*
* @example
* ```typescript
* const cache = createLRUCache<string, HTMLElement>(10);
* cache.set('header', headerEl);
* const el = cache.get('header');
* ```
*/

---


## 📁 `utils/matchActionState.ts`

### `matchActionState`

```typescript
export function matchActionState<TData, TError, R>(
  state: PopoverActionState<TData, TError>,
  matchers: ActionStateMatchers<TData, TError, R>,
): R
```

/**
* Exhaustive pattern matcher executing the corresponding callback based on the action's lifecycle status.
* Guarantees compile-time exhaustiveness via assertNever.
*
* @remarks
* Designed for React 19 Concurrent Actions and optimistic reconciliation.
* Pattern matching handles `idle`, `pending` (with optimistic flag), `success` (with non-null data),
* and `error` (with typed error and optional fallback data).
*
* @template TData - Action payload model.
* @template TError - Action error model (defaults to Error).
* @template R - Return type produced by pattern matchers.
* @param state - The PopoverActionState instance to match against.
* @param matchers - Object containing callbacks for each distinct action lifecycle status.
* @returns The return value of the matched branch callback.
*
* @example
* ```typescript
* const statusLabel = matchActionState(actionState, {
*   idle: () => 'Ready',
*   pending: (data, isOptimistic) => isOptimistic ? 'Saving optimistically...' : 'Submitting...',
*   success: (data) => `Saved item ${data.id}`,
*   error: (err) => `Failed: ${err.message}`,
* });
* ```
*/

---


## 📁 `utils/matchEntryState.ts`

### `matchEntryState`

```typescript
export function matchEntryState<TData, R, TPopoverKey extends string = string>(
  target: TrailEntry<TData, TPopoverKey>,
  matchers: EntryStateMatchers<TData, R, TPopoverKey>,
): R
```

/**
* Exhaustive pattern matcher for popover entry states.
* Executes the corresponding branch callback based on the resolved status.
*
* @remarks
* Supports both full `TrailEntry` instances and lightweight `PopoverEntryDiscriminatedState` tuples.
* When `idle` handler is omitted from `matchers`, automatically falls back to `loading`
* to maintain seamless 3-state compatibility with existing UI spinners.
*
* @template TData - Data model associated with the popover.
* @template R - Return type produced by branch handlers.
* @template TPopoverKey - Branded key identifier type.
* @param target - The trail entry or discriminated state snapshot.
* @param matchers - Callback map for each possible lifecycle status.
* @returns The computed result of the matching handler.
*
* @example
* ```typescript
* const ui = matchEntryState(entry, {
*   idle: () => <Skeleton />,
*   loading: () => <Spinner />,
*   error: (err) => <ErrorMessage error={err} />,
*   success: (item) => <CardContent data={item.data} />,
* });
* ```
*/

---

### `matchEntryState`

```typescript
export function matchEntryState<TData, R>(
  target: PopoverEntryDiscriminatedState<TData>,
  matchers: DiscriminatedStateMatchers<TData, R>,
): R
```

*JSDoc отсутствует*

---

### `matchEntryState`

```typescript
export function matchEntryState<TData, R, TPopoverKey extends string = string>(
  target: TrailEntry<TData, TPopoverKey> | PopoverEntryDiscriminatedState<TData>,
  matchers: EntryStateMatchers<TData, R, TPopoverKey> | DiscriminatedStateMatchers<TData, R>,
): R
```

*JSDoc отсутствует*

---


## 📁 `utils/math.ts`

### `clamp`

```typescript
export function clamp(value: number, min: number, max: number): number
```

/**
* Clamps a numeric value between an inclusive minimum and maximum bound.
* Safely normalizes NaN or non-finite inputs to the fallback bound.
*/

---

### `lerp`

```typescript
export function lerp(start: number, end: number, factor: number): number
```

/** Linearly interpolates between two numeric points by factor t. */

---

### `inRange`

```typescript
export function inRange(value: number, min: number, max: number): boolean
```

/** Checks whether a number is within a bounded interval [min, max] inclusive. */

---

### `degToRad`

```typescript
export function degToRad(degrees: number): number
```

/** Converts degrees to radians. */

---

### `radToDeg`

```typescript
export function radToDeg(radians: number): number
```

/** Converts radians to degrees. */

---

### `roundTo`

```typescript
export function roundTo(value: number, decimals = 0): number
```

/** Rounds a numeric scalar to the specified number of decimal digits safely. */

---

### `approxEqual`

```typescript
export function approxEqual(a: number, b: number, epsilon = 1e-6): boolean
```

/** Evaluates whether two numbers are approximately equal within tolerance epsilon. */

---

### `normalizeRatio`

```typescript
export function normalizeRatio(value: number, min: number, max: number): number
```

/** Computes the normalized ratio t in [0, 1] between min and max (inverse lerp). */

---

### `toFiniteNumber`

```typescript
export function toFiniteNumber(val: unknown, fallback = 0): number
```

/** Normalizes an unknown value to a finite number, returning fallback if non-finite. */

---


## 📁 `utils/memoize.ts`

### `memoizeOne`

```typescript
export function memoizeOne<Args extends readonly unknown[], R>(
  fn: (...args: Args) => R,
  isEqual: (newArgs: Args, lastArgs: Args) => boolean = shallowEqualArray,
): MemoizedFn<Args, R>
```

/**
* Memoizes the last result of a function with bounded capacity 1.
* Prevents heap accumulation and GC pauses by retaining at most one snapshot.
*
* @template Args - Arguments tuple.
* @template R - Return value type.
* @param fn - Pure computation function to memoize.
* @param isEqual - Custom arguments equality comparator (defaults to `shallowEqualArray`).
* @returns Memoized function with `.clear()` invalidation handle.
*
* @example
* ```typescript
* const computeBoundingBox = memoizeOne((x: number, y: number, w: number, h: number) => ({
*   left: x,
*   top: y,
*   right: x + w,
*   bottom: y + h,
* }));
* const box = computeBoundingBox(10, 20, 100, 50);
* computeBoundingBox.clear();
* ```
*/

---

### `memoized`

```typescript
const memoized = ((...args: Args): R => {
    if (hasResult && lastArgs !== null && isEqual(args, lastArgs)) {
      return lastResult as R;
    }

    lastResult = fn(...args);
    lastArgs = args;
    hasResult = true;
    return lastResult;
  }) as MemoizedFn<Args, R>
```

*JSDoc отсутствует*

---

### `memoizeWeak`

```typescript
export function memoizeWeak<K extends object, R>(
  fn: (key: K) => R,
): ((key: K) => R) &
```

/**
* Memoizes a single-argument object function using WeakMap.
* Guarantees zero memory retention: cache entries are automatically garbage collected
* when the key object is unreachable.
*
* @template K - Object key type.
* @template R - Result type.
* @param fn - Transformer function mapping object key to result.
* @returns Weak memoized function with `.delete()` entry removal handle.
*
* @example
* ```typescript
* const getElementLayout = memoizeWeak((el: HTMLElement) => ({
*   width: el.offsetWidth,
*   height: el.offsetHeight,
* }));
* const layout = getElementLayout(cardRef);
* ```
*/

---

### `memoized`

```typescript
const memoized = (key: K): R =>
```

*JSDoc отсутствует*

---


## 📁 `utils/memorySentinel.ts`

### `trackMemoryCleanup`

```typescript
export function trackMemoryCleanup(target?: object | null, popoverKey?: string | null): void
```

/**
* Registers a DOM element or object for development-mode Garbage Collection monitoring.
*
* @remarks
* Uses JavaScript's `FinalizationRegistry` to detect detached DOM nodes that remain retained
* in memory due to dangling event listeners or circular references.
*
* @param target - Object or DOM node instance to monitor.
* @param popoverKey - Identifying popover key string.
*
* @example
* ```typescript
* trackMemoryCleanup(cardElement, 'card-1');
* ```
*/

---

### `untrackMemoryCleanup`

```typescript
export function untrackMemoryCleanup(target?: object | null): void
```

/**
* Unregisters a tracked object from GC monitoring when explicitly unmounted.
*
* @param target - Object or DOM node to unregister.
*
* @example
* ```typescript
* untrackMemoryCleanup(cardElement);
* ```
*/

---


## 📁 `utils/Point2D.ts`

### `resolveCoords`

```typescript
function resolveCoords(pt?: { x?: number; y?: number } | null):
```

*JSDoc отсутствует*

---

### `zero`

```typescript
static zero(): Point2D
```

/**
* Returns a singleton immutable point at origin (0, 0).
*
* @returns Zero vector point.
*/

---

### `of`

```typescript
static of(x: number, y: number): Point2D
```

/**
* Factory producing a new Point2D instance.
*
* @param x - Horizontal coordinate.
* @param y - Vertical coordinate.
* @returns New Point2D.
*
* @example
* ```typescript
* const pt = Point2D.of(100, 200);
* ```
*/

---

### `fromObject`

```typescript
static fromObject(obj?: { x?: number; y?: number } | null): Point2D
```

/**
* Creates a Point2D from an object containing x and y coordinates.
*
* @param obj - Object with optional x and y properties.
* @returns New Point2D.
*
* @example
* ```typescript
* const pt = Point2D.fromObject({ x: 40, y: 80 });
* ```
*/

---


## 📁 `utils/pool/keyedPool.ts`

### `findNextBucket`

```typescript
export function findNextBucket(buckets: readonly number[], minSize: number): number
```

*JSDoc отсутствует*

---

### `createBucketPool`

```typescript
export function createBucketPool<T>(
  buckets: readonly number[],
  factory: (bucketSize: number) => T,
  reset?: (item: T) => void,
): KeyedPool<number, T> &
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/objectPoolCore.ts`

### `create`

```typescript
static create<T>(opts: ObjectPoolOptions<T>): Result<ObjectPool<T>, InvalidPoolOptionsError>
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolAssert.ts`

### `checkPoolClean`

```typescript
export function checkPoolClean(pool: { inUse: number }): boolean
```

*JSDoc отсутствует*

---

### `assertPoolClean`

```typescript
export function assertPoolClean<T>(pool: PoolAuditable<T>): boolean
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolBatch.ts`

### `acquireManyItems`

```typescript
export function acquireManyItems<T>(acquireSingle: () => T, count: number, out: T[] = []): T[]
```

*JSDoc отсутствует*

---

### `releaseManyItems`

```typescript
export function releaseManyItems<T>(
  releaseSingle: (item: T) => void,
  items: Iterable<Maybe<T>>,
): void
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolBranded.ts`

### `toPoolCapacity`

```typescript
export function toPoolCapacity(cap: number): PoolCapacity
```

/**
* Smart constructor for PoolCapacity.
* Validates and clamps capacity to a positive integer (minimum 1).
*
* @param cap - Raw capacity number.
* @returns Validated and clamped PoolCapacity.
*/

---

### `toPoolSize`

```typescript
export function toPoolSize(size: number): PoolSize
```

/**
* Smart constructor for PoolSize.
* Validates and clamps size to a non-negative integer (minimum 0).
*
* @param size - Raw pool size number.
* @returns Validated and clamped PoolSize.
*/

---

### `toPoolTimeoutMs`

```typescript
export function toPoolTimeoutMs(ms: number): PoolTimeoutMs
```

/**
* Smart constructor for PoolTimeoutMs.
* Validates and clamps timeout duration in milliseconds (minimum 0).
*
* @param ms - Raw timeout duration in milliseconds.
* @returns Validated and clamped PoolTimeoutMs.
*/

---

### `isPoolCapacity`

```typescript
export function isPoolCapacity(val: unknown): val is PoolCapacity
```

/**
* Type guard verifying if an unknown value satisfies PoolCapacity invariants.
*/

---

### `isPoolSize`

```typescript
export function isPoolSize(val: unknown): val is PoolSize
```

/**
* Type guard verifying if an unknown value satisfies PoolSize invariants.
*/

---

### `isPoolTimeoutMs`

```typescript
export function isPoolTimeoutMs(val: unknown): val is PoolTimeoutMs
```

/**
* Type guard verifying if an unknown value satisfies PoolTimeoutMs invariants.
*/

---


## 📁 `utils/pool/poolBuilder.ts`

### `poolBuilder`

```typescript
export function poolBuilder<T>(factory: () => T): PoolBuilder<T>
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolCollections.ts`

### `createArrayPool`

```typescript
export function createArrayPool<T = unknown>(initial = 16, max = 128): ObjectPool<T[]>
```

/**
* Creates an object pool of reusable arrays, automatically cleared on release.
*
* @template T - Element type of the pooled arrays.
* @param initial - Initial pre-allocated array count (default: 16).
* @param max - Maximum array pool capacity (default: 128).
* @returns An `ObjectPool<T[]>` instance.
*
* @example
* ```typescript
* const pool = createArrayPool<string>(8, 32);
* const list = pool.acquire();
* list.push('item-1', 'item-2');
* pool.release(list); // automatically resets length to 0
* ```
*/

---

### `createMapPool`

```typescript
export function createMapPool<K = string, V = unknown>(
  initial = 8,
  max = 64,
): ObjectPool<Map<K, V>>
```

/**
* Creates an object pool of reusable `Map<K, V>` instances, automatically cleared on release.
*
* @template K - Map key type.
* @template V - Map value type.
* @param initial - Initial pre-allocated map count (default: 8).
* @param max - Maximum map pool capacity (default: 64).
* @returns An `ObjectPool<Map<K, V>>` instance.
*
* @example
* ```typescript
* const pool = createMapPool<string, number>(4, 16);
* const map = pool.acquire();
* map.set('count', 42);
* pool.release(map); // automatically clears the map
* ```
*/

---


## 📁 `utils/pool/poolConfig.ts`

### `resolvePoolOptions`

```typescript
export function resolvePoolOptions<T>(
  target: (() => T) | ObjectPoolOptions<T>,
  reset?: (item: T) => void,
  initialCapacity: number | PoolSize = DEFAULT_POOL_INITIAL,
  maxCapacity: number | PoolCapacity = DEFAULT_POOL_MAX,
): ObjectPoolResolvedConfig<T>
```

*JSDoc отсутствует*

---

### `isObjectPoolOptions`

```typescript
function isObjectPoolOptions<T>(val: unknown): val is ObjectPoolOptions<T>
```

*JSDoc отсутствует*

---

### `validatePoolOptions`

```typescript
export function validatePoolOptions<T>(
  options: unknown,
): Result<ObjectPoolResolvedConfig<T>, InvalidPoolOptionsError>
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolErrors.ts`

### `isPoolDomainError`

```typescript
export function isPoolDomainError(val: unknown): val is PoolDomainError
```

*JSDoc отсутствует*

---

### `isInvalidPoolOptionsError`

```typescript
export function isInvalidPoolOptionsError(val: unknown): val is InvalidPoolOptionsError
```

*JSDoc отсутствует*

---

### `isPoolExhaustedError`

```typescript
export function isPoolExhaustedError(val: unknown): val is PoolExhaustedError
```

*JSDoc отсутствует*

---

### `isPoolDisposedError`

```typescript
export function isPoolDisposedError(val: unknown): val is PoolDisposedError
```

*JSDoc отсутствует*

---

### `matchPoolError`

```typescript
export function matchPoolError<R>(
  err: PoolDomainError,
  cases: {
    INVALID_POOL_OPTIONS: (e: InvalidPoolOptionsError) => R;
    POOL_EXHAUSTED: (e: PoolExhaustedError) => R;
    POOL_DISPOSED: (e: PoolDisposedError) => R;
  },
): R
```

*JSDoc отсутствует*

---

### `createInvalidPoolOptionsError`

```typescript
export function createInvalidPoolOptionsError(
  msg: string,
  options?: unknown,
): InvalidPoolOptionsError
```

*JSDoc отсутствует*

---

### `createPoolExhaustedError`

```typescript
export function createPoolExhaustedError(cap: number, msg?: string): PoolExhaustedError
```

*JSDoc отсутствует*

---

### `createPoolDisposedError`

```typescript
export function createPoolDisposedError(msg?: string): PoolDisposedError
```

*JSDoc отсутствует*

---



## 📁 `utils/pool/poolMemory.ts`

### `shrinkPoolToFit`

```typescript
export function shrinkPoolToFit<T>(
  storage: PoolStorage<T>,
  minCapacity = 0,
  onEvict?: (item: T) => void,
): number
```

*JSDoc отсутствует*

---

### `warmupPool`

```typescript
export function warmupPool<T>(
  storage: PoolStorage<T>,
  targetCount: number,
  factory: () => T,
): number
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolMultiScope.ts`

### `runWithPair`

```typescript
export function runWithPair<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (a: T, b: T) => R,
): R
```

/**
* Multi-Item Scoped RAII Execution for High-Frequency Geometry Pairs and Triples.
* Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
*
* @module utils/pool/poolMultiScope
*/

---

### `runWithTriple`

```typescript
export function runWithTriple<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (a: T, b: T, c: T) => R,
): R
```

*JSDoc отсутствует*

---

### `runWithPairAsync`

```typescript
export async function runWithPairAsync<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (a: T, b: T) => Promise<R>,
): Promise<R>
```

*JSDoc отсутствует*

---

### `runWithMany`

```typescript
export function runWithMany<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  count: number,
  fn: (items: readonly T[]) => R,
): R
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolOperations.ts`

### `tryResetItem`

```typescript
export function tryResetItem<T>(reset: ((item: T) => void) | undefined, item: T): void
```

/**
* Safely executes an item reset callback inside an isolated try-catch barrier.
*
* @remarks
* In accordance with Rule 14 (Fault Isolation), exceptions thrown by user callbacks
* are caught and suppressed to prevent pool corruption.
*
* @template T - Type of pooled resource.
* @param reset - Optional callback to reset item state.
* @param item - Resource instance to reset.
*
* @example
* ```typescript
* tryResetItem((box) => { box.width = 0; }, box);
* ```
*/

---

### `tryEvictItem`

```typescript
export function tryEvictItem<T>(onEvict: ((item: T) => void) | undefined, item: T): void
```

/**
* Safely executes an item eviction callback inside an isolated try-catch barrier.
*
* @remarks
* In accordance with Rule 14 (Fault Isolation), exceptions thrown by user callbacks
* are caught and suppressed to prevent pool corruption.
*
* @template T - Type of pooled resource.
* @param onEvict - Optional callback invoked when an item is evicted due to capacity overflow.
* @param item - Resource instance being evicted.
*
* @example
* ```typescript
* tryEvictItem((item) => item.destroy(), item);
* ```
*/

---

### `acquirePooled`

```typescript
export function acquirePooled<T>(
  storage: PoolStorage<T>,
  factory: () => T,
  tracker: PoolMetricsTracker,
  sentinel: PoolLeakSentinel<T>,
  observers?: PoolObserverHub<T>,
): T
```

/**
* Borrows an available resource from storage, or instantiates a new one via factory if empty.
*
* @template T - Type of pooled resource.
* @param storage - Underlying pool storage buffer.
* @param factory - Instantiation factory when storage is empty.
* @param tracker - Metrics tracker recording hits and misses.
* @param sentinel - Leak detection sentinel recording active allocations.
* @param observers - Optional observer hub broadcasting pool events.
* @returns An acquired instance of `T`.
*
* @example
* ```typescript
* const item = acquirePooled(storage, factory, tracker, sentinel);
* ```
*/

---

### `releasePooled`

```typescript
export function releasePooled<T>(
  storage: PoolStorage<T>,
  item: T | null | undefined,
  reset: ((item: T) => void) | undefined,
  onEvict: ((item: T) => void) | undefined,
  tracker: PoolMetricsTracker,
  sentinel: PoolLeakSentinel<T>,
  observers?: PoolObserverHub<T>,
): boolean
```

/**
* Returns a borrowed resource to the pool storage buffer.
*
* @remarks
* If the item is invalid, already in storage, or the pool has exceeded capacity,
* the item is evicted and `false` is returned.
*
* @template T - Type of pooled resource.
* @param storage - Underlying pool storage buffer.
* @param item - Resource instance to return.
* @param reset - Optional callback to reset item state.
* @param onEvict - Optional callback when item cannot fit in storage.
* @param tracker - Metrics tracker recording returns.
* @param sentinel - Leak detection sentinel untracking returned instance.
* @param observers - Optional observer hub broadcasting pool events.
* @returns `true` if accepted back into storage; `false` if rejected or evicted.
*
* @example
* ```typescript
* const accepted = releasePooled(storage, item, reset, onEvict, tracker, sentinel);
* ```
*/

---


## 📁 `utils/pool/poolPipeline.ts`

### `mapWithItem`

```typescript
export function mapWithItem<T, In, Out>(
  pool: PoolBorrower<T>,
  items: Iterable<In>,
  fn: (pooled: T, input: In, index: number) => Out,
  out: Out[] = [],
): Out[]
```

*JSDoc отсутствует*

---

### `forEachWithItem`

```typescript
export function forEachWithItem<T, In>(
  pool: PoolBorrower<T>,
  items: Iterable<In>,
  fn: (pooled: T, input: In, index: number) => void,
): void
```

*JSDoc отсутствует*

---

### `reduceWithItem`

```typescript
export function reduceWithItem<T, In, Acc>(
  pool: PoolBorrower<T>,
  items: Iterable<In>,
  initial: Acc,
  fn: (acc: Acc, pooled: T, input: In, index: number) => Acc,
): Acc
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolRegistry.ts`

### `isObjectPoolBase`

```typescript
function isObjectPoolBase<T>(val: unknown): val is ObjectPoolBase<T>
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolReset.ts`

### `composeResetters`

```typescript
export function composeResetters<T>(...resetters: Array<(item: T) => void>): (item: T) => void
```

*JSDoc отсутствует*

---

### `createPropertyResetter`

```typescript
export function createPropertyResetter<T extends object>(defaults: Partial<T>): (item: T) => void
```

*JSDoc отсутствует*

---

### `createArrayResetter`

```typescript
export function createArrayResetter<T extends { length: number }>(): (item: T) => void
```

*JSDoc отсутствует*

---

### `createVector2DResetter`

```typescript
export function createVector2DResetter(
  defaultX = 0,
  defaultY = 0,
): (item: { x: number; y: number }) => void
```

*JSDoc отсутствует*

---

### `createBoundingBoxResetter`

```typescript
export function createBoundingBoxResetter(
  defaultX = 0,
  defaultY = 0,
  defaultWidth = 0,
  defaultHeight = 0,
): (item: { x: number; y: number; width: number; height: number }) => void
```

*JSDoc отсутствует*

---

### `createNoopResetter`

```typescript
export function createNoopResetter<T>(): (item: T) => void
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/poolScope.ts`

### `runWithItem`

```typescript
export function runWithItem<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (item: T) => R,
): R
```

/**
* Executes a function with a borrowed pooled item and guarantees its release via `finally`.
*
* @template T - Type of pooled resource.
* @template R - Return value type of callback function.
* @param acquire - Factory callback to borrow the item.
* @param release - Teardown callback to return the item.
* @param fn - Work callback receiving the borrowed item.
* @returns The return value of `fn`.
*
* @example
* ```typescript
* const len = runWithItem(
*   () => pool.acquire(),
*   (item) => pool.release(item),
*   (arr) => {
*     arr.push('a', 'b');
*     return arr.length;
*   },
* );
* ```
*/

---

### `runWithItemResult`

```typescript
export function runWithItemResult<T, R, E>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (item: T) => Result<R, E>,
): Result<R, E>
```

/**
* Executes a function returning a `Result` with a borrowed pooled item, guaranteeing its release.
*
* @template T - Type of pooled resource.
* @template R - Ok result type.
* @template E - Err domain error type.
* @param acquire - Factory callback to borrow the item.
* @param release - Teardown callback to return the item.
* @param fn - Work callback returning a `Result`.
* @returns The `Result<R, E>` produced by `fn`.
*
* @example
* ```typescript
* const res = runWithItemResult(
*   () => pool.acquire(),
*   (item) => pool.release(item),
*   (box) => Ok(box.width * box.height),
* );
* ```
*/

---

### `runWithItemAsync`

```typescript
export async function runWithItemAsync<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (item: T) => Promise<R>,
): Promise<R>
```

/**
* Executes an asynchronous function with a borrowed pooled item and guarantees its release.
*
* @template T - Type of pooled resource.
* @template R - Resolved promise value type.
* @param acquire - Factory callback to borrow the item.
* @param release - Teardown callback to return the item.
* @param fn - Async work callback receiving the borrowed item.
* @returns Promise resolving to the result of `fn`.
*
* @example
* ```typescript
* const count = await runWithItemAsync(
*   () => pool.acquire(),
*   (item) => pool.release(item),
*   async (buffer) => {
*     await fillBuffer(buffer);
*     return buffer.byteLength;
*   },
* );
* ```
*/

---

### `createScopedItem`

```typescript
export function createScopedItem<T>(
  acquire: () => T,
  release: (item: T) => void,
): ScopedPooledItem<T>
```

/**
* Creates an explicit resource management wrapper around a pooled item compatible with `using` / `Symbol.dispose`.
*
* @template T - Type of pooled resource.
* @param acquire - Factory callback to borrow the item.
* @param release - Teardown callback to return the item.
* @returns A `ScopedPooledItem<T>` with idempotent disposal.
*
* @example
* ```typescript
* {
*   using scoped = createScopedItem(() => pool.acquire(), (i) => pool.release(i));
*   scoped.value.x = 100;
* } // automatically released at scope exit
* ```
*/

---

### `doRelease`

```typescript
const doRelease = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/pool/spatialPools.ts`

### `createPointPool`

```typescript
export function createPointPool(initial = 32, max = 256): ObjectPool<PooledPoint>
```

/**
* Creates an object pool of mutable 2D points (`{ x, y }`).
*
* @param initial - Initial pre-allocated capacity (default: 32).
* @param max - Maximum pool capacity before overflow items are discarded (default: 256).
* @returns An `ObjectPool<PooledPoint>` instance.
*
* @example
* ```ts
* const pointPool = createPointPool(16, 64);
* const pt = pointPool.acquire();
* pt.x = 100;
* pt.y = 200;
* pointPool.release(pt);
* ```
*/

---

### `createBoxPool`

```typescript
export function createBoxPool(initial = 16, max = 128): ObjectPool<PooledBox>
```

/**
* Creates an object pool of mutable bounding box objects (`{ x, y, top, left, width, height }`).
*
* @param initial - Initial pre-allocated capacity (default: 16).
* @param max - Maximum pool capacity before overflow items are discarded (default: 128).
* @returns An `ObjectPool<PooledBox>` instance.
*
* @example
* ```ts
* const boxPool = createBoxPool(8, 32);
* const box = boxPool.acquire();
* box.width = 300;
* box.height = 150;
* boxPool.release(box);
* ```
*/

---

### `createSetPool`

```typescript
export function createSetPool<T = string>(initial = 8, max = 64): ObjectPool<Set<T>>
```

/**
* Creates an object pool of reusable `Set<T>` instances, automatically cleared on release.
*
* @template T - Type of items stored in the set.
* @param initial - Initial capacity (default: 8).
* @param max - Maximum capacity (default: 64).
* @returns An `ObjectPool<Set<T>>` instance.
*
* @example
* ```ts
* const setPool = createSetPool<string>(4, 16);
* const set = setPool.acquire();
* set.add('item-1');
* setPool.release(set); // automatically clears the set
* ```
*/

---


## 📁 `utils/predicates.ts`

### `isKeyInList`

```typescript
export function isKeyInList<T extends HasKey>(list: readonly T[], key: string): boolean
```

/**
* Checks whether an object with the specified `key` exists in an array.
* Fast iteration with early return and zero allocations.
*
* @template T - Element type extending HasKey.
* @param list - Array of keyed elements.
* @param key - Identifier string to find.
* @returns True if an element with the exact key exists.
*
* @example
* ```typescript
* const entries = [{ key: 'card-1' }, { key: 'card-2' }];
* isKeyInList(entries, 'card-1'); // => true
* isKeyInList(entries, 'card-3'); // => false
* ```
*/

---

### `isPopoverActive`

```typescript
export function isPopoverActive(
  state: { readonly trail: readonly HasKey[]; readonly floating: readonly HasKey[] },
  key: string,
): boolean
```

/**
* Checks whether a popover key is actively present in either the cascading trail or floating list.
*
* @param state - Trail and floating entry lists.
* @param key - Popover key to check.
* @returns True if the key is active in trail or floating entries.
*
* @example
* ```typescript
* const isActive = isPopoverActive(storeState, 'card-profile');
* ```
*/

---

### `shouldTrackFloatingGeometry`

```typescript
export function shouldTrackFloatingGeometry(isPinned?: boolean, isDragging?: boolean): boolean
```

/**
* Determines whether floating geometry (drag/pin offsets) needs active tracking.
*
* @param isPinned - Whether popover is currently pinned.
* @param isDragging - Whether popover is actively being dragged.
* @returns True if pinned or dragging.
*
* @example
* ```typescript
* if (shouldTrackFloatingGeometry(entry.isPinned, entry.isDragging)) {
*   syncCoordinates();
* }
* ```
*/

---

### `hasAnimationClassesChanged`

```typescript
export function hasAnimationClassesChanged(
  prev?: {
    readonly mountingClassName?: string;
    readonly unmountingClassName?: string;
    readonly mountedClassName?: string;
  },
  next?: {
    readonly mountingClassName?: string;
    readonly unmountingClassName?: string;
    readonly mountedClassName?: string;
  },
): boolean
```

/**
* Compares two animation class name configuration objects for visual changes.
*
* @param prev - Previous animation class configuration.
* @param next - Next animation class configuration.
* @returns True if class names have changed and require a CSS re-computation.
*
* @example
* ```typescript
* if (hasAnimationClassesChanged(prevClasses, nextClasses)) {
*   updateClassNames();
* }
* ```
*/

---

### `isNonNullable`

```typescript
export function isNonNullable<T>(value: T): value is NonNullable<T>
```

/** Type guard verifying that a value is neither `null` nor `undefined`. */

---

### `isDefined`

```typescript
export function isDefined<T>(value: T | undefined): value is T
```

/** Type guard asserting that an optional candidate is defined (not `undefined`). */

---

### `isNull`

```typescript
export function isNull<T>(value: T | null): value is null
```

/** Type guard asserting that a nullable candidate is strictly `null`. */

---

### `isUndefined`

```typescript
export function isUndefined<T>(value: T | undefined): value is undefined
```

/** Type guard asserting that an optional candidate is strictly `undefined`. */

---

### `isMatchingKey`

```typescript
export function isMatchingKey<T extends HasKey>(key: string): (item: T) => boolean
```

/**
* Creates a predicate checking if an object's `key` matches the target string.
*
* @template T - Object extending HasKey.
* @param key - Target key string to match.
* @returns Predicate function.
*
* @example
* ```typescript
* const matchesCardA = isMatchingKey('card-a');
* const target = items.find(matchesCardA);
* ```
*/

---

### `hasKeyIn`

```typescript
export function hasKeyIn<T extends HasKey>(keys: ReadonlySet<string>): (item: T) => boolean
```

/**
* Creates a predicate checking if an object's `key` is contained within a Set.
*
* @template T - Object extending HasKey.
* @param keys - Set of target key strings.
* @returns Predicate function.
*
* @example
* ```typescript
* const activeKeys = new Set(['card-1', 'card-2']);
* const isInActiveSet = hasKeyIn(activeKeys);
* const filtered = items.filter(isInActiveSet);
* ```
*/

---


## 📁 `utils/reactTransitions.ts`

### `reactScheduleTransition`

```typescript
export function reactScheduleTransition(callback: () => void): void
```

/**
* Schedules `callback` inside React's `startTransition` (concurrent low-priority render).
*
* @param callback - State mutation to schedule as a non-blocking transition.
*/

---


## 📁 `utils/RectBounds.ts`

### `fromDOMRect`

```typescript
static fromDOMRect(rect?: DOMRect | Partial<DOMRect> | null): RectBounds
```

/**
* Creates a RectBounds from a browser DOMRect or partial DOMRect object.
*
* @param rect - DOMRect instance or compatible object.
* @returns RectBounds instance.
*
* @example
* ```typescript
* const bounds = RectBounds.fromDOMRect(element.getBoundingClientRect());
* ```
*/

---

### `of`

```typescript
static of(top: number, left: number, width: number, height: number): RectBounds
```

/**
* Factory producing a new RectBounds from explicit coordinates.
*
* @param top - Top coordinate.
* @param left - Left coordinate.
* @param width - Rectangle width.
* @param height - Rectangle height.
* @returns RectBounds instance.
*/

---


## 📁 `utils/resizeObserverRegistry.test.ts`

### `createMockElement`

```typescript
function createMockElement(): Element
```

*JSDoc отсутствует*

---

### `createMockResizeEntry`

```typescript
function createMockResizeEntry(target: Element): ResizeObserverEntry
```

*JSDoc отсутствует*

---


## 📁 `utils/resizeObserverRegistry.ts`

### `notifyElementResize`

```typescript
function notifyElementResize(callbacks: Set<ResizeCallback>, entry: ResizeObserverEntry): void
```

*JSDoc отсутствует*

---

### `initObserver`

```typescript
private initObserver()
```

*JSDoc отсутствует*

---

### `resetRegistryForTesting`

```typescript
export const resetRegistryForTesting = () => ResizeObserverRegistry.clear()
```

*JSDoc отсутствует*

---


## 📁 `utils/resource/asyncCompositeDisposable.ts`

### `safelyDisposeAsyncItem`

```typescript
async function safelyDisposeAsyncItem(d: AsyncCleanupItem): Promise<void>
```

*JSDoc отсутствует*

---

### `disposeAsync`

```typescript
async disposeAsync(): Promise<void>
```

/**
* Asynchronously disposes all registered items in LIFO order, awaiting their resolution concurrently.
*
* @returns Promise resolving when all items have completed teardown.
*/

---


## 📁 `utils/resource/compositeDisposable.ts`

### `safelyDisposeItem`

```typescript
function safelyDisposeItem(d: CleanupItem): void
```

*JSDoc отсутствует*

---


## 📁 `utils/resource/disposableErrors.ts`

### `createDisposedError`

```typescript
export function createDisposedError(contextName?: string): ObjectDisposedError
```

/**
* Creates an `ObjectDisposedError` representing access to an already-disposed terminal resource.
*
* @param contextName - Optional name of the subsystem or resource.
* @returns An `ObjectDisposedError` instance.
*
* @example
* ```typescript
* const err = createDisposedError('HistoryBuffer');
* console.error(err.message);
* ```
*/

---

### `isObjectDisposedError`

```typescript
export function isObjectDisposedError(val: unknown): val is ObjectDisposedError
```

/**
* Type guard verifying if an unknown error object is an `ObjectDisposedError`.
*
* @param val - Value to test.
* @returns True if value is an ObjectDisposedError.
*
* @example
* ```typescript
* if (isObjectDisposedError(error)) {
*   console.warn('Attempted to use disposed resource:', error.contextName);
* }
* ```
*/

---


## 📁 `utils/resource/disposableGuards.ts`

### `isObjectRecord`

```typescript
function isObjectRecord(val: unknown): val is Record<PropertyKey, unknown>
```

/**
* Type guard verifying if an unknown value is a non-null object record.
*
* @param val - Target candidate to inspect.
* @returns True if value is an object record.
*/

---

### `isDisposable`

```typescript
export function isDisposable(val: unknown): val is ScopeDisposable
```

/**
* Type guard checking if an unknown target satisfies the synchronous ScopeDisposable contract.
* Checks for either standard `dispose()` method or Symbol.dispose implementation.
*
* @param val - Candidate value to evaluate.
* @returns True if value conforms to ScopeDisposable.
*
* @example
* ```typescript
* if (isDisposable(item)) {
*   item.dispose();
* }
* ```
*/

---

### `isAsyncDisposable`

```typescript
export function isAsyncDisposable(val: unknown): val is AsyncScopeDisposable
```

/**
* Type guard checking if an unknown target satisfies the AsyncScopeDisposable contract.
* Checks for either `disposeAsync()` method or Symbol.asyncDispose implementation.
*
* @param val - Candidate value to evaluate.
* @returns True if value conforms to AsyncScopeDisposable.
*
* @example
* ```typescript
* if (isAsyncDisposable(item)) {
*   await item.disposeAsync();
* }
* ```
*/

---

### `assertNotDisposed`

```typescript
export function assertNotDisposed(disposed: boolean, contextName?: string): void
```

/**
* Asserts that a stateful subsystem has not been disposed, enforcing RAII lifecycle invariants.
*
* @param disposed - Boolean flag indicating if disposal has occurred.
* @param contextName - Optional name of the subsystem for debugging.
* @throws Error if already disposed.
*
* @example
* ```typescript
* assertNotDisposed(this.disposed, 'HistoryJournal');
* ```
*/

---

### `isTerminalOmegaState`

```typescript
export function isTerminalOmegaState(target: { readonly isDisposed?: boolean }): boolean
```

/**
* Invariant check verifying if an entity has reached the terminal Omega disposal state.
*
* @param target - Stateful entity carrying an isDisposed indicator.
* @returns True if entity is in terminal Omega state.
*
* @example
* ```typescript
* if (isTerminalOmegaState(store)) {
*   return;
* }
* ```
*/

---


## 📁 `utils/resource/disposableTypes.ts`

### `DISPOSE_SYMBOL`

```typescript
export const DISPOSE_SYMBOL = (Symbol.dispose ??
  Symbol.for('Symbol.dispose')) as typeof Symbol.dispose
```

*JSDoc отсутствует*

---

### `ASYNC_DISPOSE_SYMBOL`

```typescript
export const ASYNC_DISPOSE_SYMBOL = (Symbol.asyncDispose ??
  Symbol.for('Symbol.asyncDispose')) as typeof Symbol.asyncDispose
```

*JSDoc отсутствует*

---

### `isObjectRecord`

```typescript
function isObjectRecord(val: unknown): val is Record<PropertyKey, unknown>
```

*JSDoc отсутствует*

---

### `getDisposeMethod`

```typescript
export function getDisposeMethod(d: unknown): (() => void) | undefined
```

/**
* Extracts a bound synchronous disposal function from an object conforming to `ScopeDisposable` or `Symbol.dispose`.
*
* @param d - Target candidate to extract disposal method from.
* @returns Bound disposal function if present, or `undefined`.
*
* @example
* ```typescript
* const dispose = getDisposeMethod(resource);
* dispose?.();
* ```
*/

---

### `getAsyncDisposeMethod`

```typescript
export function getAsyncDisposeMethod(d: unknown): (() => Promise<void>) | undefined
```

/**
* Extracts a bound asynchronous disposal function from an object conforming to `AsyncScopeDisposable` or `Symbol.asyncDispose`.
*
* @param d - Target candidate to extract async disposal method from.
* @returns Bound async disposal function if present, or `undefined`.
*
* @example
* ```typescript
* const disposeAsync = getAsyncDisposeMethod(asyncResource);
* await disposeAsync?.();
* ```
*/

---


## 📁 `utils/resource/fixedCompositeDisposable.ts`

### `safelyDispose`

```typescript
function safelyDispose(d: CleanupItem): void
```

*JSDoc отсутствует*

---


## 📁 `utils/resource/refCountDisposable.ts`

### `safelyDispose`

```typescript
function safelyDispose(d: CleanupItem): void
```

*JSDoc отсутствует*

---

### `release`

```typescript
private release(): void
```

*JSDoc отсутствует*

---

### `teardown`

```typescript
private teardown(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/resource/resourceAdapters.test.ts`

### `listener`

```typescript
const listener = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/resource/resourceAdapters.ts`

### `createTimerDisposable`

```typescript
export function createTimerDisposable(timerId: ReturnType<typeof setTimeout>): ScopeDisposable
```

/**
* Wraps a setTimeout/setInterval timer ID into an idempotent disposable.
*
* @param timerId - Return value from setTimeout or setInterval.
* @returns Disposable that calls `clearTimeout` upon disposal.
*
* @example
* ```typescript
* const timer = createTimerDisposable(setTimeout(() => doWork(), 1000));
* timer.dispose(); // Cancels the timer
* ```
*/

---

### `createRafDisposable`

```typescript
export function createRafDisposable(rafId: number): ScopeDisposable
```

/**
* Wraps a requestAnimationFrame ID into an idempotent disposable.
*
* @param rafId - Return value from requestAnimationFrame.
* @returns Disposable that calls `cancelAnimationFrame` upon disposal.
*
* @example
* ```typescript
* const anim = createRafDisposable(requestAnimationFrame(tick));
* anim.dispose(); // Cancels pending animation frame
* ```
*/

---

### `createEventListenerDisposable`

```typescript
export function createEventListenerDisposable<K extends string>(
  target: EventTarget | null | undefined,
  type: K,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions,
): ScopeDisposable
```

/**
* Wraps a DOM or EventTarget listener into an idempotent disposable.
*
* @template K - Event name string type.
* @param target - EventTarget, DOM Node, or Window (safely handles null/undefined).
* @param type - Event name (e.g. 'keydown', 'pointermove').
* @param listener - Event listener callback or object.
* @param options - Optional event listener options or capture boolean.
* @returns Disposable that removes the listener upon disposal.
*
* @example
* ```typescript
* const listener = createEventListenerDisposable(window, 'keydown', onKeyDown);
* listener.dispose(); // Removes listener
* ```
*/

---

### `createAbortDisposable`

```typescript
export function createAbortDisposable(
  controller: AbortController | null | undefined,
): ScopeDisposable
```

/**
* Wraps an AbortController into an idempotent disposable.
*
* @param controller - AbortController instance (safely handles null/undefined).
* @returns Disposable that triggers `controller.abort()` upon disposal.
*
* @example
* ```typescript
* const controller = new AbortController();
* const abort = createAbortDisposable(controller);
* abort.dispose(); // Aborts if not already aborted
* ```
*/

---

### `createSubscriptionDisposable`

```typescript
export function createSubscriptionDisposable(unsubscribe: () => void): ScopeDisposable
```

/**
* Wraps a generic unsubscribe callback into an idempotent disposable.
*
* @param unsubscribe - Callback function invoked on disposal.
* @returns Disposable that executes the unsubscribe function.
*
* @example
* ```typescript
* const sub = createSubscriptionDisposable(store.subscribe(handleChange));
* sub.dispose(); // Unsubscribes
* ```
*/

---


## 📁 `utils/resource/resourceScope.ts`

### `disposeResource`

```typescript
function disposeResource(r: ScopeDisposable): void
```

*JSDoc отсутствует*

---

### `disposeResourceAsync`

```typescript
async function disposeResourceAsync(r: AsyncScopeDisposable | ScopeDisposable): Promise<void>
```

*JSDoc отсутствует*

---

### `using`

```typescript
export function using<TResource extends ScopeDisposable, TReturn>(
  resource: TResource,
  fn: (res: TResource) => TReturn,
): TReturn
```

/**
* Executes a scoped computation with a disposable resource, guaranteeing resource teardown in a `finally` block.
*
* @template TResource - Disposable resource type conforming to `ScopeDisposable`.
* @template TReturn - Return value of the computation.
* @param resource - Disposable resource to manage.
* @param fn - Callback receiving the active resource.
* @returns Resulting value of `fn(resource)`.
*
* @example
* ```typescript
* const count = using(new CompositeDisposable(), (scope) => {
*   scope.add(createTimerDisposable(t1));
*   return 42;
* });
* // scope is guaranteed to be disposed here
* ```
*/

---

### `usingAsync`

```typescript
export async function usingAsync<TResource extends AsyncScopeDisposable | ScopeDisposable, TReturn>(
  resource: TResource,
  fn: (res: TResource) => Promise<TReturn>,
): Promise<TReturn>
```

/**
* Asynchronously executes a scoped computation with an async (or sync) disposable resource,
* guaranteeing asynchronous teardown in a `finally` block.
*
* @template TResource - Resource type conforming to `AsyncScopeDisposable` or `ScopeDisposable`.
* @template TReturn - Return value of the asynchronous computation.
* @param resource - Async or sync disposable resource to manage.
* @param fn - Asynchronous computation callback receiving the active resource.
* @returns Promise resolving to the value returned by `fn(resource)`.
*
* @example
* ```typescript
* const data = await usingAsync(new AsyncCompositeDisposable(), async (scope) => {
*   scope.add(asyncResource);
*   return await fetchData();
* });
* // scope is asynchronously disposed here
* ```
*/

---

### `usingResult`

```typescript
export function usingResult<TResource extends ScopeDisposable, TReturn, E>(
  resource: TResource,
  fn: (res: TResource) => Result<TReturn, E>,
  onError: (err: unknown) => E,
): Result<TReturn, E>
```

/**
* Executes a callback with a disposable resource and guarantees cleanup in a `finally` block.
* Returns the callback's `Result`, or catches any thrown exception into `Err`.
*
* @template TResource - Disposable resource (`[Symbol.dispose]` or `.dispose()`).
* @template TReturn - Value payload type.
* @template E - Error type.
* @param resource - Resource to manage.
* @param fn - Callback receiving the resource.
* @param onError - Optional function to map unknown caught errors to type `E`.
* @returns Result containing the computed Ok data, or captured Err.
*
* @example
* ```typescript
* const result = usingResult(createHistoryManager(30), (history) => {
*   history.pushSnapshot(state);
*   return history.undoResult(nextState);
* });
* // history is guaranteed to be disposed here
* ```
*/

---

### `usingResult`

```typescript
export function usingResult<TResource extends ScopeDisposable, TReturn, E = Error>(
  resource: TResource,
  fn: (res: TResource) => Result<TReturn, E>,
): Result<TReturn, E | Error>
```

*JSDoc отсутствует*

---

### `usingResult`

```typescript
export function usingResult<TResource extends ScopeDisposable, TReturn, E>(
  resource: TResource,
  fn: (res: TResource) => Result<TReturn, E>,
  onError?: (err: unknown) => E,
): Result<TReturn, E | Error>
```

*JSDoc отсутствует*

---


## 📁 `utils/resource/serialDisposable.ts`

### `safelyDispose`

```typescript
function safelyDispose(d: CleanupItem): void
```

*JSDoc отсутствует*

---


## 📁 `utils/resource/singleDisposable.ts`

### `createDisposable`

```typescript
export function createDisposable(
  cleanupFn: () => void,
): ScopeDisposable &
```

/**
* Creates an idempotent disposable wrapper around a cleanup function.
* Ensures the cleanup function executes at most once and catches any thrown errors.
* Implements both `.dispose()` and `[Symbol.dispose]` contracts.
*
* @param cleanupFn - Teardown or resource deallocation callback.
* @returns Idempotent disposable resource with `isDisposed` status indicator.
*
* @example
* ```typescript
* const disposable = createDisposable(() => {
*   ws.close();
* });
*
* disposable.dispose(); // Runs cleanupFn
* disposable.dispose(); // No-op, already disposed
* console.log(disposable.isDisposed); // true
* ```
*/

---

### `doCleanup`

```typescript
const doCleanup = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/result/resultCombinators.ts`

### `mapResult`

```typescript
export function mapResult<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E>
```

/**
* Transforms the inner value of an `OkResult` using a mapping function.
* If the result is an `ErrResult`, returns it unchanged.
*
* @example
* ```ts
* const r = Ok(5);
* const doubled = mapResult(r, (x) => x * 2); // Ok(10)
* ```
*
* @param result - Input Result.
* @param fn - Transformer applied to successful data.
* @returns New Result with transformed value or original error.
*/

---

### `flatMapResult`

```typescript
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E>
```

/**
* Chains a computation that returns another `Result`.
* If the input is an `ErrResult`, returns it immediately without calling `fn`.
*
* @example
* ```ts
* const parse = (s: string) => s.length > 0 ? Ok(s.trim()) : Err('empty');
* const res = flatMapResult(Ok('  hello  '), parse); // Ok('hello')
* ```
*
* @param result - Input Result.
* @param fn - Function returning a new Result.
* @returns The Result returned by `fn` or original error.
*/

---

### `mapErr`

```typescript
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>
```

/**
* Transforms the error of an `ErrResult` using a mapping function.
* If the result is an `OkResult`, returns it unchanged.
*
* @example
* ```ts
* const r = Err('not_found');
* const formatted = mapErr(r, (err) => ({ code: 404, message: err }));
* ```
*
* @param result - Input Result.
* @param fn - Transformer applied to the error payload.
* @returns Result with transformed error or original data.
*/

---

### `unwrapOr`

```typescript
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T
```

/**
* Extracts the inner value if `Ok`, or returns a fallback value if `Err`.
*
* @example
* ```ts
* const value = unwrapOr(Ok(42), 0); // 42
* const fallback = unwrapOr(Err('fail'), 0); // 0
* ```
*
* @param result - Input Result.
* @param fallback - Default value returned on failure.
* @returns Inner data or fallback.
*/

---

### `unwrapOrElse`

```typescript
export function unwrapOrElse<T, E>(result: Result<T, E>, fallbackFn: (error: E) => T): T
```

/**
* Extracts the inner value if `Ok`, or computes a fallback by calling `fallbackFn(error)` if `Err`.
*
* @example
* ```ts
* const value = unwrapOrElse(Err('404'), (err) => `Default for ${err}`);
* ```
*
* @param result - Input Result.
* @param fallbackFn - Function producing a fallback value from the error.
* @returns Inner data or computed fallback.
*/

---

### `unwrap`

```typescript
export function unwrap<T, E>(result: Result<T, E>): T
```

/**
* Extracts the inner value if `Ok`, or throws the error if `Err`.
*
* @remarks
* If `result.error` is not an instance of `Error`, it is wrapped into a native `Error` before throwing.
*
* @example
* ```ts
* const data = unwrap(fetchResult); // throws Error if fetch failed
* ```
*
* @param result - Input Result.
* @returns Inner data.
* @throws `Error` if result is an ErrResult.
*/

---

### `matchResult`

```typescript
export function matchResult<T, E, R>(
  result: Result<T, E>,
  patterns: { ok: (data: T) => R; err: (error: E) => R },
): R
```

/**
* Pattern-matches against a Result, executing `patterns.ok` on success or `patterns.err` on failure.
*
* @example
* ```ts
* const message = matchResult(result, {
*   ok: (user) => `Hello, ${user.name}!`,
*   err: (error) => `Failed to load: ${error.message}`,
* });
* ```
*
* @param result - Input Result.
* @param patterns - Object containing `ok` and `err` handlers.
* @returns Output of the executed pattern handler.
*/

---

### `tapResult`

```typescript
export function tapResult<T, E>(result: Result<T, E>, fn: (data: T) => void): Result<T, E>
```

/**
* Runs a side-effect callback if the Result is `Ok`, returning the original Result unchanged.
*
* @example
* ```ts
* const res = tapResult(saveResult, (data) => console.log('Saved:', data));
* ```
*
* @param result - Input Result.
* @param fn - Side-effect callback receiving success data.
* @returns The original Result unchanged.
*/

---

### `tapErr`

```typescript
export function tapErr<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E>
```

/**
* Runs a side-effect callback if the Result is `Err`, returning the original Result unchanged.
*
* @example
* ```ts
* const res = tapErr(loadResult, (err) => logger.warn('Load failed:', err));
* ```
*
* @param result - Input Result.
* @param fn - Side-effect callback receiving the error.
* @returns The original Result unchanged.
*/

---

### `fromThrowable`

```typescript
export function fromThrowable<T>(fn: () => T): Result<T, Error>
```

/**
* Safely executes a synchronous function, wrapping any thrown exception into an Err Result.
*
* @remarks
* Eliminates unhandled try/catch blocks. If `onError` is provided, maps the caught unknown error
* to a strongly typed domain error `E`. Otherwise falls back to a standardized `Error` instance.
*
* @template T - Successful return value type.
* @template E - Mapped error type.
* @param fn - Synchronous closure to execute safely.
* @param onError - Optional transformer converting unknown exceptions into domain error `E`.
* @returns Ok with the computed value, or Err with the captured error.
*
* @example
* ```typescript
* const res = fromThrowable(() => JSON.parse(rawText), (e) => new ParseError(String(e)));
* ```
*/

---

### `fromThrowable`

```typescript
export function fromThrowable<T, E>(fn: () => T, onError: (err: unknown) => E): Result<T, E>
```

*JSDoc отсутствует*

---

### `fromThrowable`

```typescript
export function fromThrowable<T, E>(
  fn: () => T,
  onError?: (err: unknown) => E,
): Result<T, E | Error>
```

*JSDoc отсутствует*

---

### `fromPromise`

```typescript
export function fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>>
```

/**
* Safely awaits a Promise, converting any rejection into an `Err` result without throwing.
*
* @template T - Resolved value type.
* @template E - Mapped error type.
* @param promise - Promise to await.
* @param onError - Optional function to map unknown rejection reasons into error `E`.
* @returns Promise resolving to `Ok` on success or `Err` on failure.
*
* @example
* ```typescript
* const result = await fromPromise(fetch('/api/popovers'), (e) => new NetworkError(e));
* ```
*/

---

### `fromPromise`

```typescript
export function fromPromise<T, E>(
  promise: Promise<T>,
  onError: (err: unknown) => E,
): Promise<Result<T, E>>
```

*JSDoc отсутствует*

---

### `fromPromise`

```typescript
export async function fromPromise<T, E>(
  promise: Promise<T>,
  onError?: (err: unknown) => E,
): Promise<Result<T, E | Error>>
```

*JSDoc отсутствует*

---

### `collectResults`

```typescript
export function collectResults<T, E>(results: readonly Result<T, E>[]): Result<readonly T[], E>
```

/**
* Combines an array of Results into a single Result containing an array of values.
* If any Result is an `Err`, returns the first error encountered.
*
* @template T - Value type of successful results.
* @template E - Error type of failed results.
* @param results - Array of Results to evaluate.
* @returns Ok with all values, or the first encountered Err.
*/

---

### `partitionResults`

```typescript
export function partitionResults<T, E>(
  results: readonly Result<T, E>[],
):
```

/**
* Partitions an array of Results into accumulated successes and accumulated errors.
*
* @remarks
* Unlike `collectResults`, does not short-circuit. Accumulates all Ok values into `.ok`
* and all Err values into `.err`, allowing partial failures to be inspected simultaneously.
*
* @template T - Value type.
* @template E - Error type.
* @param results - Array of Results to partition.
* @returns An immutable object containing readonly arrays of all `ok` and `err` items.
*/

---

### `combineResults`

```typescript
export function combineResults<T1, T2, E>(
  r1: Result<T1, E>,
  r2: Result<T2, E>,
): Result<readonly [T1, T2], E>
```

/**
* Combines two independent Results into a single Result containing a 2-tuple.
*
* @remarks
* Zips `r1` and `r2`. Fails with the first encountered Err if either computation failed.
*
* @template T1 - Type of the first result value.
* @template T2 - Type of the second result value.
* @template E - Error type.
* @param r1 - First Result.
* @param r2 - Second Result.
* @returns Ok with a readonly 2-tuple `[T1, T2]`, or the first failing Err.
*/

---

### `mapAsyncResult`

```typescript
export async function mapAsyncResult<T, U, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
  fn: (data: T) => U | Promise<U>,
): Promise<Result<U, E>>
```

/**
* Asynchronously maps the Ok value of a Result using an async or sync transformer function.
*
* @template T - Input success type.
* @template U - Output success type.
* @template E - Error type.
* @param result - Result or Promise resolving to a Result.
* @param fn - Transformer returning U or Promise<U>.
* @returns Promise resolving to the transformed Result.
*/

---

### `flatMapAsyncResult`

```typescript
export async function flatMapAsyncResult<T, U, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
  fn: (data: T) => Result<U, E> | Promise<Result<U, E>>,
): Promise<Result<U, E>>
```

/**
* Monadic Kleisli composition over asynchronous Result transformations.
*
* @template T - Input success type.
* @template U - Output success type.
* @template E - Error type.
* @param result - Result or Promise resolving to a Result.
* @param fn - Asynchronous transformation returning a new Result.
* @returns Promise resolving to the chained Result.
*/

---


## 📁 `utils/result/resultTypes.ts`

### `Ok`

```typescript
export function Ok<T>(data: T): OkResult<T>
```

/**
* Creates a frozen OkResult representing successful computation with data.
*
* @template T - Data payload type.
* @param data - The success payload.
* @returns An immutable OkResult wrapper.
*
* @example
* ```typescript
* const res = Ok(42);
* if (res.success) {
*   console.log(res.data); // 42
* }
* ```
*/

---

### `Err`

```typescript
export function Err<E>(error: E): ErrResult<E>
```

/**
* Creates a frozen ErrResult representing a failed computation with a typed error.
*
* @template E - Error payload type.
* @param error - The failure description or domain error object.
* @returns An immutable ErrResult wrapper.
*
* @example
* ```typescript
* const res = Err(new Error('Failed to resolve'));
* if (!res.success) {
*   console.error(res.error);
* }
* ```
*/

---

### `isOk`

```typescript
export function isOk<T, E>(result: Result<T, E>): result is OkResult<T>
```

/**
* Type guard asserting that a Result is an OkResult.
*
* @template T - Data payload type.
* @template E - Error payload type.
* @param result - Result instance to inspect.
* @returns True if the result represents success.
*
* @example
* ```typescript
* if (isOk(res)) {
*   console.log(res.data);
* }
* ```
*/

---

### `isErr`

```typescript
export function isErr<T, E>(result: Result<T, E>): result is ErrResult<E>
```

/**
* Type guard asserting that a Result is an ErrResult.
*
* @template T - Data payload type.
* @template E - Error payload type.
* @param result - Result instance to inspect.
* @returns True if the result represents failure.
*
* @example
* ```typescript
* if (isErr(res)) {
*   console.error(res.error);
* }
* ```
*/

---

### `isResult`

```typescript
export function isResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E>
```

/**
* Validates whether an unknown value conforms to a Result structure.
*
* @template T - Expected Ok data type.
* @template E - Expected Err error type.
* @param val - Candidate value to evaluate.
* @returns True if `val` is a non-null object with boolean `success` property.
*
* @example
* ```typescript
* if (isResult(val)) {
*   console.log(val.success);
* }
* ```
*/

---

### `isOkResult`

```typescript
export function isOkResult<T = unknown>(val: unknown): val is OkResult<T>
```

/**
* Non-throwing type guard checking if an unknown value is an OkResult.
*
* @template T - Expected Ok data type.
* @param val - Candidate value to evaluate.
* @returns True if `val` is an OkResult.
*
* @example
* ```typescript
* if (isOkResult(val)) {
*   console.log(val.data);
* }
* ```
*/

---

### `isErrResult`

```typescript
export function isErrResult<E = unknown>(val: unknown): val is ErrResult<E>
```

/**
* Non-throwing type guard checking if an unknown value is an ErrResult.
*
* @template E - Expected Err error type.
* @param val - Candidate value to evaluate.
* @returns True if `val` is an ErrResult.
*
* @example
* ```typescript
* if (isErrResult(val)) {
*   console.error(val.error);
* }
* ```
*/

---


## 📁 `utils/result/resultWrapping.ts`

### `wrapResult`

```typescript
export function wrapResult<T>(fn: () => T): Result<T, PopoverError>
```

/**
* Safely executes a synchronous function, catching any exceptions and returning a `Result<T, PopoverError>`.
*
* @remarks
* If the caught exception is already an instance of `PopoverError`, it is returned directly.
* Otherwise, wraps the unknown exception into a `PopoverError` with `INVALID_TRANSITION` error code.
*
* @example
* ```ts
* const result = wrapResult(() => computeLayout(config));
* if (isOk(result)) {
*   render(result.data);
* }
* ```
*
* @param fn - Synchronous function to execute safely.
* @returns Ok with the return value, or Err with PopoverError.
*/

---

### `wrapAsyncResult`

```typescript
export async function wrapAsyncResult<T>(promise: Promise<T>): Promise<Result<T, PopoverError>>
```

/**
* Safely awaits an asynchronous Promise, catching any rejections and returning a `Promise<Result<T, PopoverError>>`.
*
* @remarks
* If the rejection reason is already an instance of `PopoverError`, it is returned directly.
* Otherwise, wraps the exception into a `PopoverError` with `RESOLVER_TIMEOUT` error code.
*
* @example
* ```ts
* const result = await wrapAsyncResult(fetchCardData(id));
* ```
*
* @param promise - Promise to await safely.
* @returns Promise resolving to Ok or Err with PopoverError.
*/

---


## 📁 `utils/safeCallback.test.ts`

### `fn`

```typescript
const fn = (a: number, b: number) => a + b
```

*JSDoc отсутствует*

---

### `throwingFn`

```typescript
const throwingFn = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/safeCallback.ts`

### `safeCallback`

```typescript
export function safeCallback<TArgs extends unknown[], TReturn>(
  fn: ((...args: TArgs) => TReturn) | null | undefined,
  args: TArgs,
  options?: SafeCallbackOptions,
): TReturn | undefined
```

/**
* Fault-isolated callback executor.
* Protects state machines, batching loops, and subscribers from throwing unhandled consumer exceptions.
* Catches errors, logs diagnostics, and optionally dispatches to an error handler.
*
* @template TArgs - Argument tuple type.
* @template TReturn - Callback return value type.
* @param fn - Consumer callback function (safely handles null/undefined).
* @param args - Arguments to pass into the callback.
* @param options - Configuration including contextName for logging and custom onError hook.
* @returns Resulting return value, or `undefined` if execution failed or fn is not a function.
*
* @example
* ```typescript
* const result = safeCallback(onOpenChange, [true], {
*   contextName: 'usePopoverCard',
*   onError: (err) => console.error('Listener failed', err),
* });
* ```
*/

---


## 📁 `utils/safeKeys.ts`

### `isRecord`

```typescript
export function isRecord(val: unknown): val is Record<string, unknown>
```

/**
* Type guard verifying an unknown value is a non-null, non-array object record.
*
* @param val - Candidate value to evaluate.
* @returns True if `val` is a standard JavaScript dictionary/record object.
*
* @example
* ```typescript
* if (isRecord(payload)) {
*   console.log(payload.title);
* }
* ```
*/

---

### `isUnsafeKey`

```typescript
export function isUnsafeKey(key: string): boolean
```

/**
* Checks whether a key string carries a prototype-pollution vector (`__proto__`, `constructor`, or `prototype`).
*
* @param key - Property key to check.
* @returns True if the key is dangerous and must be rejected.
*
* @example
* ```typescript
* isUnsafeKey('__proto__'); // => true
* isUnsafeKey('safeProperty'); // => false
* ```
*/

---

### `areKeysSafe`

```typescript
export function areKeysSafe(keys: Iterable<unknown>): boolean
```

/**
* Validates that every iterable member is a non-empty string and free of prototype-pollution vectors.
*
* @param keys - Iterable collection of key candidates.
* @returns True if all keys are valid and safe.
*
* @example
* ```typescript
* areKeysSafe(['id', 'title', 'count']); // => true
* areKeysSafe(['id', '__proto__']); // => false
* ```
*/

---

### `isValidStorageKey`

```typescript
export function isValidStorageKey(key: string): boolean
```

/**
* Validates a user-supplied storage or cache key:
* must be non-blank and free of pollution vectors.
*
* @param key - Candidate storage key string.
* @returns True if `key` is non-empty, trimmed, and safe for persistence engines.
*
* @example
* ```typescript
* isValidStorageKey('popover:trail:state'); // => true
* isValidStorageKey('constructor'); // => false
* isValidStorageKey('   '); // => false
* ```
*/

---


## 📁 `utils/setOperations.ts`

### `setUnion`

```typescript
export function setUnion<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T>
```

/**
* Computes the union of two sets (A ∪ B).
* Returns the original reference when one set is empty or both sets are identical.
*
* @example
* ```ts
* const s1 = new Set(['a', 'b']);
* const s2 = new Set(['b', 'c']);
* setUnion(s1, s2); // => Set { 'a', 'b', 'c' }
* ```
*
* @template T - Element type.
* @param a - First set.
* @param b - Second set.
* @returns Frozen set containing elements from both sets.
*/

---

### `setIntersection`

```typescript
export function setIntersection<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T>
```

/**
* Computes the intersection of two sets (A ∩ B).
* Iterates over the smaller set to minimize lookup operations.
*
* @example
* ```ts
* const s1 = new Set(['a', 'b']);
* const s2 = new Set(['b', 'c']);
* setIntersection(s1, s2); // => Set { 'b' }
* ```
*
* @template T - Element type.
* @param a - First set.
* @param b - Second set.
* @returns Frozen set containing elements present in both sets.
*/

---

### `setDifference`

```typescript
export function setDifference<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T>
```

/**
* Computes the relative complement of b in a (A \ B).
* Returns elements present in `a` that are not present in `b`.
*
* @example
* ```ts
* const s1 = new Set(['a', 'b', 'c']);
* const s2 = new Set(['b']);
* setDifference(s1, s2); // => Set { 'a', 'c' }
* ```
*
* @template T - Element type.
* @param a - Base set.
* @param b - Elements to exclude.
* @returns Frozen set containing elements from `a` not in `b`.
*/

---

### `setSymmetricDifference`

```typescript
export function setSymmetricDifference<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T>
```

/**
* Computes the symmetric difference of two sets (A △ B = (A \ B) ∪ (B \ A)).
*
* @example
* ```ts
* const s1 = new Set(['a', 'b']);
* const s2 = new Set(['b', 'c']);
* setSymmetricDifference(s1, s2); // => Set { 'a', 'c' }
* ```
*
* @template T - Element type.
* @param a - First set.
* @param b - Second set.
* @returns Frozen set containing elements present in either set, but not in both.
*/

---

### `isSubset`

```typescript
export function isSubset<T>(subset: ReadonlySet<T>, superset: ReadonlySet<T>): boolean
```

/**
* Determines whether `subset` is a subset of `superset` (A ⊆ B).
*
* @example
* ```ts
* isSubset(new Set(['a']), new Set(['a', 'b'])); // => true
* ```
*
* @template T - Element type.
* @param subset - Potential subset.
* @param superset - Potential superset.
* @returns True if all elements in `subset` exist in `superset`.
*/

---

### `isSuperset`

```typescript
export function isSuperset<T>(superset: ReadonlySet<T>, subset: ReadonlySet<T>): boolean
```

/**
* Determines whether `superset` is a superset of `subset` (A ⊇ B).
*
* @example
* ```ts
* isSuperset(new Set(['a', 'b']), new Set(['a'])); // => true
* ```
*
* @template T - Element type.
* @param superset - Potential superset.
* @param subset - Potential subset.
* @returns True if `superset` contains all elements of `subset`.
*/

---

### `isDisjoint`

```typescript
export function isDisjoint<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean
```

/**
* Determines whether two sets are disjoint (A ∩ B = ∅).
*
* @example
* ```ts
* isDisjoint(new Set(['a']), new Set(['b'])); // => true
* isDisjoint(new Set(['a']), new Set(['a'])); // => false
* ```
*
* @template T - Element type.
* @param a - First set.
* @param b - Second set.
* @returns True if the sets share no common elements.
*/

---


## 📁 `utils/slot.test.tsx`

### `el`

```typescript
const el = (
      <Slot id="slot-id" className="slot-class">
        <button className="child-class">Click</button>
      </Slot>
    )
```

*JSDoc отсутствует*

---

### `h1`

```typescript
const h1 = () =>
```

*JSDoc отсутствует*

---

### `h2`

```typescript
const h2 = () =>
```

*JSDoc отсутствует*

---

### `el`

```typescript
const el = (
      <Slot ref={ref}>
        <div id="target" />
      </Slot>
    )
```

*JSDoc отсутствует*

---


## 📁 `utils/slot.ts`

### `composeHandlers`

```typescript
export function composeHandlers<E>(
  originalHandler?: ((e: E) => void) | null,
  ourHandler?: ((e: E) => void) | null,
): (e: E) => void
```

/**
* Composes two optional event handlers into a single callback.
* Invokes `originalHandler` followed by `ourHandler`.
*
* @template E - Event object type.
* @param originalHandler - Consumer's pre-existing event handler.
* @param ourHandler - Internal library event handler.
* @returns Combined event handler executing both functions sequentially.
*
* @example
* ```typescript
* const handleClick = composeHandlers(
*   props.onClick,
*   (e) => { console.log('Internal click handled'); },
* );
* ```
*/

---

### `mergeProps`

```typescript
export function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown>
```

/**
* Merges slot properties with underlying child properties:
* - Concatenates `className` strings via `clsx`.
* - Merges nested `style` objects.
* - Chains conflicting `on*` event handlers with `composeHandlers`.
* - Overwrites remaining attributes with child properties taking precedence.
*
* @param slotProps - Host slot properties.
* @param childProps - Target child component properties.
* @returns Consolidated merged property dictionary.
*
* @example
* ```typescript
* const merged = mergeProps(
*   { className: 'btn-slot', onClick: onSlotClick },
*   { className: 'btn-child', onClick: onChildClick },
* );
* ```
*/

---

### `assignRef`

```typescript
function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null): void
```

*JSDoc отсутствует*

---

### `mergedRef`

```typescript
const mergedRef = (node: HTMLElement | null) =>
```

*JSDoc отсутствует*

---


## 📁 `utils/spatial/quadTreeCore.ts`

### `getItems`

```typescript
public getItems(): readonly QuadItem<TId>[]
```

/**
* Returns items stored directly in this QuadTree node (not including subdivided child quadrants).
*/

---

### `getNodes`

```typescript
public getNodes(): readonly QuadTree<TId>[]
```

/**
* Returns the four subdivided child quadrant nodes (`[ne, nw, sw, se]`), or an empty array if not subdivided.
*/

---

### `clear`

```typescript
public clear(): void
```

/**
* Empties all items and recursively clears all child quadrant subtrees.
*/

---

### `split`

```typescript
private split(): void
```

/**
* Splits this quadrant node into four sub-quadrants: North-East, North-West, South-West, South-East.
*/

---

### `coalesce`

```typescript
public coalesce(): boolean
```

/**
* Attempts to collapse empty or sparsely populated child quadrants back into this parent node.
*
* @returns `true` if child quadrants were collapsed, `false` otherwise.
*/

---

### `insert`

```typescript
public insert(item?: QuadItem<TId> | Partial<QuadItem<TId>> | null): void
```

/**
* Inserts an item into the QuadTree, subdividing into quadrants if capacity is exceeded.
*
* @param item - Spatial item containing an `id` and `bounds` rectangle.
*
* @example
* ```typescript
* tree.insert({
*   id: 'popover-1',
*   bounds: { x: 100, y: 150, width: 250, height: 180 },
* });
* ```
*/

---

### `remove`

```typescript
public remove(id: TId): boolean
```

/**
* Removes an item by its unique ID, coalescing empty child quadrants if appropriate.
*
* @param id - Identifier of the item to remove.
* @returns `true` if the item was found and removed, `false` otherwise.
*
* @example
* ```typescript
* tree.remove('popover-1');
* ```
*/

---

### `update`

```typescript
public update(id: TId, newBounds: BoundingBox): boolean
```

/**
* Updates an existing item's spatial bounding box.
*
* @param id - Identifier of the item.
* @param newBounds - Updated bounding box.
* @returns `true` if updated, `false` if the item was not found.
*
* @example
* ```typescript
* tree.update('popover-1', { x: 120, y: 160, width: 250, height: 180 });
* ```
*/

---

### `visit`

```typescript
public visit(
    target: BoundingBox,
    visitor: (item: QuadItem<TId>) => boolean | void,
    seen?: Set<string>,
  ): boolean
```

/**
* Traverses all items intersecting the `target` box, executing `visitor` for each.
*
* If `visitor` returns `false`, traversal stops early.
*
* @param target - Search bounding box.
* @param visitor - Callback invoked for each intersecting item.
* @param seen - Optional set to deduplicate items spanning quadrant boundaries.
* @returns `false` if stopped early, `true` otherwise.
*/

---

### `retrieve`

```typescript
public retrieve(
    returnItems: QuadItem<TId>[] = [],
    bounds?: BoundingBox,
    seen?: Set<string>,
  ): QuadItem<TId>[]
```

/**
* Retrieves all items that intersect with the specified bounding box.
*
* @param returnItems - Optional array to collect results into (reusable to avoid allocations).
* @param bounds - Optional search box (defaults to entire tree bounds).
* @param seen - Optional set for tracking visited IDs.
* @returns Array containing intersecting items.
*
* @example
* ```typescript
* const overlapping = tree.retrieve([], { x: 50, y: 50, width: 200, height: 200 });
* ```
*/

---

### `hasCollision`

```typescript
public hasCollision(target: BoundingBox, excludeId?: TId): boolean
```

/**
* Checks whether any item in the tree intersects with the `target` bounding box.
*
* @param target - Target bounding box to test.
* @param excludeId - Optional ID to ignore (e.g. self collision check).
* @returns `true` if an intersection exists, `false` otherwise.
*
* @example
* ```typescript
* const collides = tree.hasCollision(candidateBox, 'current-dragged-card');
* ```
*/

---

### `findFirst`

```typescript
public findFirst(
    target: BoundingBox,
    predicate?: (item: QuadItem<TId>) => boolean,
  ): QuadItem<TId> | undefined
```

/**
* Finds the first item intersecting the `target` box that matches the optional predicate.
*
* @param target - Search bounding box.
* @param predicate - Optional filter function.
* @returns First matching item or `undefined`.
*
* @example
* ```typescript
* const pinnedCard = tree.findFirst(searchArea, (item) => item.id.startsWith('pinned-'));
* ```
*/

---

### `findFirstResult`

```typescript
public findFirstResult(
    target: BoundingBox,
    predicate?: (item: QuadItem<TId>) => boolean,
  ): Result<QuadItem<TId>, SpatialNotFoundError>
```

/**
* Queries the tree for the first item intersecting the target bounding box that satisfies an optional predicate.
*
* @returns `Ok(QuadItem)` if found, or `Err(SpatialNotFoundError)` if no matching item exists.
*
* @example
* ```typescript
* const result = tree.findFirstResult(searchArea);
* if (isOk(result)) {
*   console.log('Found card:', result.data.id);
* }
* ```
*/

---

### `nearest`

```typescript
public nearest(point: Point2D, maxDistance?: number): QuadItem<TId> | undefined
```

/**
* Finds the nearest item in the tree to a 2D coordinate point within an optional max distance.
*
* @param point - Target 2D point (x, y).
* @param maxDistance - Optional maximum search radius in pixels.
* @returns Nearest item or `undefined`.
*
* @example
* ```typescript
* const closest = tree.nearest({ x: 400, y: 300 }, 150);
* ```
*/

---

### `nearestResult`

```typescript
public nearestResult(
    point: Point2D,
    maxDistance?: number,
  ): Result<QuadItem<TId>, SpatialNotFoundError>
```

/**
* Searches for the spatially nearest item to a 2D coordinate point within an optional maximum Euclidean radius.
*
* @param point - Target 2D point (x, y).
* @param maxDistance - Optional maximum Euclidean distance threshold.
* @returns `Ok(QuadItem)` if a candidate exists within radius, or `Err(SpatialNotFoundError)`.
*
* @example
* ```typescript
* const result = tree.nearestResult({ x: 400, y: 300 }, 100);
* ```
*/

---

### `dispose`

```typescript
public dispose(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/spatial/spatialAABB.ts`

### `intersectionBox`

```typescript
export function intersectionBox(a: BoundingBox, b: BoundingBox): BoundingBox | null
```

/**
* Computes the rectangular intersection of two axis-aligned bounding boxes (AABBs).
*
* @param a - First bounding box.
* @param b - Second bounding box.
* @returns The overlapping `BoundingBox`, or `null` if the boxes do not intersect.
*
* @example
* ```ts
* const overlap = intersectionBox({ x: 0, y: 0, width: 100, height: 100 }, { x: 50, y: 50, width: 100, height: 100 });
* // returns { x: 50, y: 50, width: 50, height: 50 }
* ```
*/

---

### `intersectionArea`

```typescript
export function intersectionArea(a: BoundingBox, b: BoundingBox): number
```

/**
* Calculates the numeric area of intersection between two bounding boxes.
*
* @param a - First bounding box.
* @param b - Second bounding box.
* @returns Non-negative area in square pixels (0 if no intersection).
*
* @example
* ```ts
* const area = intersectionArea(boxA, boxB);
* ```
*/

---

### `boundingUnion`

```typescript
export function boundingUnion(a: BoundingBox, b: BoundingBox): BoundingBox
```

/**
* Computes the minimal bounding box enclosing both given bounding boxes (AABB Union).
*
* @param a - First bounding box.
* @param b - Second bounding box.
* @returns The combined bounding box enclosing both `a` and `b`.
*
* @example
* ```ts
* const united = boundingUnion(boxA, boxB);
* ```
*/

---

### `overlapRatio`

```typescript
export function overlapRatio(a: BoundingBox, b: BoundingBox): number
```

/**
* Calculates the Intersection-over-Union (IoU) overlap ratio between two bounding boxes.
*
* Formula: `IoU = intersectionArea / unionArea`
*
* @param a - First bounding box.
* @param b - Second bounding box.
* @returns Float value between 0.0 (no overlap) and 1.0 (identical bounds).
*
* @example
* ```ts
* const ratio = overlapRatio(cardBox, obstacleBox);
* if (ratio > 0.5) { ... }
* ```
*/

---

### `distanceToBox`

```typescript
export function distanceToBox(
  point: { readonly x: number; readonly y: number },
  box: BoundingBox,
): number
```

/**
* Computes the minimum Euclidean distance from a 2D point to the perimeter of a bounding box.
* If the point is inside the bounding box, returns 0.
*
* @param point - Target 2D coordinate point `{ x, y }`.
* @param box - Bounding box.
* @returns Euclidean distance in pixels.
*
* @example
* ```ts
* const dist = distanceToBox({ x: 10, y: 10 }, { x: 50, y: 50, width: 100, height: 100 });
* ```
*/

---


## 📁 `utils/spatial/spatialAABBInto.ts`

### `copyBoundingBoxInto`

```typescript
export function copyBoundingBoxInto(src: BoundingBox, out: MutableBoundingBox): void
```

/**
* Copies coordinates and dimensions from a source bounding box into a mutable target.
*
* @param src - Source bounding box.
* @param out - Pre-allocated target bounding box to write into.
*
* @example
* ```ts
* copyBoundingBoxInto(anchorRect, scratchBox);
* ```
*/

---

### `intersectionBoxInto`

```typescript
export function intersectionBoxInto(
  a: BoundingBox,
  b: BoundingBox,
  out: MutableBoundingBox,
): boolean
```

/**
* Computes the intersection of two bounding boxes, writing the resulting coordinates
* directly into the provided output structure to prevent heap allocation.
*
* @param a - First bounding box.
* @param b - Second bounding box.
* @param out - Mutable output bounding box.
* @returns `true` if boxes intersect and `out` was populated; `false` otherwise.
*
* @example
* ```ts
* if (intersectionBoxInto(boxA, boxB, scratchBox)) {
*   // scratchBox contains the intersection rect
* }
* ```
*/

---

### `boundingUnionInto`

```typescript
export function boundingUnionInto(a: BoundingBox, b: BoundingBox, out: MutableBoundingBox): void
```

/**
* Computes the minimal bounding box enclosing both given boxes, writing directly into `out`.
*
* @param a - First bounding box.
* @param b - Second bounding box.
* @param out - Mutable output bounding box.
*
* @example
* ```ts
* boundingUnionInto(boxA, boxB, scratchUnionBox);
* ```
*/

---

### `distanceToBoxSquared`

```typescript
export function distanceToBoxSquared(point: Point2D, box: BoundingBox): number
```

/**
* Computes the squared Euclidean distance between a 2D point and the perimeter of a bounding box.
* Avoids costly `Math.sqrt()` computation in hot distance ranking paths.
*
* @param point - Point coordinates `{ x, y }`.
* @param box - Target bounding box.
* @returns Squared Euclidean distance ($d^2$).
*
* @example
* ```ts
* const sqDist = distanceToBoxSquared(cursorPos, cardBox);
* ```
*/

---


## 📁 `utils/spatial/spatialAffine.ts`

### `identityMatrix`

```typescript
export function identityMatrix(): Matrix2D
```

/**
* Returns the immutable identity affine matrix singleton.
*
* @example
* ```typescript
* const m = identityMatrix(); // [1, 0, 0, 1, 0, 0]
* ```
*/

---

### `multiplyMatrix2D`

```typescript
export function multiplyMatrix2D(m1: Matrix2D, m2: Matrix2D): Matrix2D
```

/**
* Multiplies two 2D affine matrices (`m1 * m2`) to compose transformations.
*
* Useful when combining nested container transforms, such as a scaled modal inside
* a translated wrapper.
*
* @param m1 - Left-hand matrix operand.
* @param m2 - Right-hand matrix operand.
* @returns Resulting composite 2D affine transformation matrix.
*
* @example
* ```typescript
* const combined = multiplyMatrix2D(wrapperMatrix, modalMatrix);
* ```
*/

---

### `invertMatrix2D`

```typescript
export function invertMatrix2D(m: Matrix2D): Matrix2D | null
```

/**
* Computes the inverse matrix of a 2D affine transformation matrix.
*
* Used to convert global screen coordinates into coordinates local to a CSS-transformed container.
* If the determinant is close to zero or non-finite (singular matrix), returns `null` to avoid `NaN`.
*
* @param m - Matrix to invert.
* @returns Inverted `Matrix2D` or `null` if the matrix is singular.
*
* @example
* ```typescript
* const inv = invertMatrix2D(containerMatrix);
* if (inv) {
*   const localPoint = transformPoint2D(screenPoint, inv);
* }
* ```
*/

---

### `invertMatrix2DResult`

```typescript
export function invertMatrix2DResult(m: Matrix2D): Result<Matrix2D, SingularMatrixError>
```

/**
* Inverts a 2D affine transform matrix, returning a `Result`.
*
* @remarks
* Useful when converting screen coordinates to coordinates inside a CSS-transformed container.
* Returns `Ok(inverse)` on success, or `Err(SingularMatrixError)` if the matrix is collapsed
* (determinant close to zero) and cannot be inverted.
*
* @example
* ```ts
* const invResult = invertMatrix2DResult(containerMatrix);
* if (isOk(invResult)) {
*   const localPoint = transformPoint2D(screenPoint, invResult.value);
* }
* ```
*
* @param m - Affine matrix to invert.
* @returns `Result` with inverted matrix or singular error.
*/

---

### `transformPoint2DInto`

```typescript
export function transformPoint2DInto(p: Point2D, m: Matrix2D, out: { x: number; y: number }): void
```

/**
* Transforms a 2D point in-place using matrix multiplication without heap allocations.
*
* Designed for animation loops and pointer tracking where allocating `{ x, y }` objects
* would trigger garbage collector pauses.
*
* @param p - Source 2D point.
* @param m - Affine matrix.
* @param out - Pre-allocated target object to receive the transformed coordinates.
*
* @example
* ```typescript
* const scratch = { x: 0, y: 0 };
* transformPoint2DInto({ x: 10, y: 20 }, matrix, scratch);
* ```
*/

---

### `transformPoint2D`

```typescript
export function transformPoint2D(p: Point2D, m: Matrix2D): Point2D
```

/**
* Transforms a 2D point coordinates by an affine transformation matrix.
*
* @param p - 2D point to transform.
* @param m - Affine transformation matrix.
* @returns Transformed point coordinates `{ x, y }`.
*
* @example
* ```typescript
* const transformed = transformPoint2D({ x: 10, y: 20 }, scaleMatrix);
* ```
*/

---

### `inverseTransformPoint2D`

```typescript
export function inverseTransformPoint2D(p: Point2D, m: Matrix2D): Point2D
```

/**
* Normalizes a screen coordinate back to local container space using inverse matrix transformation.
*
* If the matrix is singular (uninvertible), the original point `p` is returned unchanged.
*
* @param p - Transformed screen point (e.g. from mouse event clientX, clientY).
* @param m - Forward transformation matrix of the container.
* @returns Normalized point in container-local coordinates.
*
* @example
* ```typescript
* const localPoint = inverseTransformPoint2D({ x: e.clientX, y: e.clientY }, containerMatrix);
* ```
*/

---

### `transformAABBInto`

```typescript
export function transformAABBInto(
  box: BoundingBox,
  m: Matrix2D,
  out: { x: number; y: number; width: number; height: number },
): void
```

/**
* Computes the axis-aligned bounding box of a transformed rectangle in-place without heap allocations.
*
* @param box - Source bounding box.
* @param m - Affine matrix.
* @param out - Pre-allocated target object to receive the enclosing envelope.
*
* @example
* ```typescript
* const scratchBox = { x: 0, y: 0, width: 0, height: 0 };
* transformAABBInto(popoverBox, transformMatrix, scratchBox);
* ```
*/

---

### `transformAABB`

```typescript
export function transformAABB(box: BoundingBox, m: Matrix2D): BoundingBox
```

/**
* Transforms an axis-aligned bounding box (AABB) by an affine matrix, returning the minimum enclosing AABB.
*
* @param box - Source bounding box.
* @param m - Affine matrix.
* @returns New enclosing `BoundingBox`.
*
* @example
* ```typescript
* const transformedBounds = transformAABB(cardBounds, scaleAndTranslateMatrix);
* ```
*/

---


## 📁 `utils/spatial/spatialBounds.ts`

### `sanitizeBounds`

```typescript
export function sanitizeBounds(bounds?: BoundingBox): BoundingBox
```

/**
* Sanitizes and normalizes an input bounding box to guarantee finite numeric dimensions.
*
* @remarks
* Replaces non-finite values (`NaN`, `Infinity`, `-Infinity`) with 0, and guarantees
* width and height are non-negative.
*
* @param bounds - Raw or optional input bounding box.
* @returns Sanitized `BoundingBox` with safe finite numbers.
*
* @example
* ```typescript
* const clean = sanitizeBounds({ x: NaN, y: 10, width: -5, height: 100 });
* // => { x: 0, y: 10, width: 0, height: 100 }
* ```
*/

---

### `getQuadrantIndex`

```typescript
export function getQuadrantIndex(bounds: BoundingBox, parentBounds: BoundingBox): SpatialQuadrant
```

/**
* Determines which child quadrant entirely encloses the given bounding box within its parent bounds.
*
* @remarks
* If the bounding box straddles horizontal or vertical midpoints ($vMid$ or $hMid$), it cannot
* fit completely inside any single sub-quadrant and must remain in the current parent QuadTree node.
* In this case, `Quadrant.None` (`-1`) is returned.
*
* ```
*        North (top)
*   NW (1)   |   NE (0)
* -----------+-----------
*   SW (2)   |   SE (3)
*        South (bottom)
* ```
*
* @param bounds - Target rectangle to evaluate.
* @param parentBounds - Enclosing quadrant boundary of the parent node.
* @returns Matching `QuadrantIndex` (0..3) if completely contained, or `Quadrant.None` (-1) if straddling.
*
* @example
* ```typescript
* const quadrant = getQuadrantIndex(
*   { x: 10, y: 10, width: 20, height: 20 },
*   { x: 0, y: 0, width: 100, height: 100 }
* );
* // => Quadrant.NW (1)
* ```
*/

---


## 📁 `utils/spatial/spatialClusters.ts`

### `computeEnclosingBounds`

```typescript
function computeEnclosingBounds<TId extends string>(items: readonly QuadItem<TId>[]): BoundingBox
```

*JSDoc отсутствует*

---

### `findSpatialClusters`

```typescript
export function findSpatialClusters<TId extends string>(
  items: readonly QuadItem<TId>[],
): SpatialCluster<TId>[]
```

/**
* Partitions a collection of items into connected spatial clusters using BFS over a QuadTree.
* Two items belong to the same cluster if their bounding boxes overlap or form an unbroken chain of intersections.
*
* @template TId - Item identifier type.
* @param items - Items to cluster.
* @returns Array of disjoint `SpatialCluster` objects.
*
* @example
* ```ts
* const clusters = findSpatialClusters(popoverItems);
* for (const cluster of clusters) {
*   console.log(`Cluster with ${cluster.items.length} popovers spanning`, cluster.bounds);
* }
* ```
*/

---


## 📁 `utils/spatial/spatialCoalesce.ts`

### `canCoalesceQuadNodes`

```typescript
export function canCoalesceQuadNodes<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  parentItemCount: number,
  maxItems: number,
): boolean
```

/**
* Checks whether subdivided child quadrant nodes can be collapsed back into their parent.
*
* @remarks
* Child quadrants can collapse if:
* 1. None of the child quadrants have their own subdivided children (leaf level).
* 2. The combined number of items in the parent and all child nodes does not exceed `maxItems`.
*
* @param nodes - Array of 4 child quadrant nodes.
* @param parentItemCount - Number of items currently stored at the parent level.
* @param maxItems - Node capacity limit.
* @returns `true` if quadrants can safely collapse back into the parent.
*/

---

### `collectCoalescedItems`

```typescript
export function collectCoalescedItems<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  parentItems: readonly QuadItem<TId>[],
): QuadItem<TId>[]
```

/**
* Merges and deduplicates items from all child quadrants and the parent into a single list.
*
* @param nodes - Subdivided child quadrant nodes.
* @param parentItems - Items stored at the parent level.
* @returns Consolidated deduplicated item list.
*/

---

### `tryCoalesceQuadTree`

```typescript
export function tryCoalesceQuadTree<TId extends string>(
  nodes: QuadTree<TId>[],
  items: QuadItem<TId>[],
  maxItems: number,
): QuadItem<TId>[] | null
```

/**
* Attempts to collapse child quadrants back into the parent if the combined item count is within capacity.
*
* @remarks
* If conditions are met, pulls all items into the returned array, clears child nodes, and truncates `nodes.length = 0`.
*
* @param nodes - Mutable array of child quadrant nodes.
* @param items - Mutable array of parent items.
* @param maxItems - Capacity limit for a single node.
* @returns Consolidated array of items if collapsed, or `null` if the node cannot be collapsed.
*/

---


## 📁 `utils/spatial/spatialCollision.ts`

### `hasCollisionInNodes`

```typescript
export function hasCollisionInNodes<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  bounds: BoundingBox,
  target: BoundingBox,
  excludeId?: TId,
): boolean
```

/**
* Tests whether any item within the given QuadTree nodes collides with the target bounding box.
* Short-circuits immediately upon discovering the first collision.
*
* @template TId - Node identifier type.
* @param nodes - Array of child QuadTree nodes to traverse.
* @param items - Items stored at the current tree level.
* @param bounds - Current node bounding box.
* @param target - Target bounding box to test for collisions.
* @param excludeId - Optional ID to ignore during collision checking (e.g. self-collision).
* @returns `true` if an overlapping item exists; `false` otherwise.
*
* @example
* ```ts
* const collides = hasCollisionInNodes(nodes, items, bounds, targetBox, 'card-1');
* ```
*/

---

### `findFirstInNodes`

```typescript
export function findFirstInNodes<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  bounds: BoundingBox,
  target: BoundingBox,
  predicate?: (item: QuadItem<TId>) => boolean,
): QuadItem<TId> | undefined
```

/**
* Searches QuadTree nodes for the first item intersecting the target bounding box that satisfies a predicate.
* Short-circuits immediately once a match is found.
*
* @template TId - Node identifier type.
* @param nodes - Array of child QuadTree nodes to traverse.
* @param items - Items stored at the current tree level.
* @param bounds - Current node bounding box.
* @param target - Target bounding box to test for intersection.
* @param predicate - Optional filter function to evaluate matched items.
* @returns The first matching `QuadItem` or `undefined` if none found.
*
* @example
* ```ts
* const obstacle = findFirstInNodes(nodes, items, bounds, targetBox, (it) => it.id.startsWith('pinned-'));
* ```
*/

---


## 📁 `utils/spatial/spatialCorridor.ts`

### `sign`

```typescript
function sign(p1: Point2D, p2: Point2D, p3: Point2D): number
```

/**
* Computes the 2D cross-product of vectors (p1 - p3) and (p2 - p3).
*
* @remarks
* Used for half-plane orientation testing. If sign is positive, point lies on one side;
* if negative, on the opposite side; if zero, the points are collinear.
*/

---

### `isPointInTriangle`

```typescript
export function isPointInTriangle(p: Point2D, a: Point2D, b: Point2D, c: Point2D): boolean
```

/**
* Determines whether a 2D point lies inside or on the boundary of a triangle (a, b, c).
*
* @remarks
* Uses the half-plane cross-product method. A point is inside the triangle if and only if
* it lies on the same side of all three directed line segments (ab, bc, ca).
*
* @example
* ```ts
* const inside = isPointInTriangle(
*   { x: 5, y: 5 },
*   { x: 0, y: 0 },
*   { x: 10, y: 0 },
*   { x: 5, y: 10 },
* ); // => true
* ```
*
* @param p - 2D point to test.
* @param a - First vertex of triangle.
* @param b - Second vertex of triangle.
* @param c - Third vertex of triangle.
* @returns True if point is inside or on the perimeter of the triangle.
*/

---

### `isPointInBox`

```typescript
export function isPointInBox(p: Point2D, box: BoundingBox): boolean
```

/**
* Checks whether a 2D coordinate point lies within an axis-aligned bounding box.
*
* @example
* ```ts
* isPointInBox({ x: 15, y: 25 }, { x: 10, y: 20, width: 50, height: 50 }); // => true
* ```
*
* @param p - Point coordinate.
* @param box - Axis-aligned bounding box.
* @returns True if point falls inside the box bounds.
*/

---

### `isCursorInSafeTriangle`

```typescript
export function isCursorInSafeTriangle(
  cursor: Point2D,
  anchorOrigin: Point2D,
  targetBounds: BoundingBox,
): boolean
```

/**
* Evaluates whether the pointer cursor is moving through the safe triangle corridor
* spanning between the trigger anchor origin and the target popover card.
*
* @remarks
* Zero heap allocation: scratch points `pA` and `pB` are leased from `sharedPointPool`.
* Selects the triangle base vertices from the target card edge closest to the anchor.
*
* @example
* ```ts
* const inTriangle = isCursorInSafeTriangle(
*   { x: 120, y: 60 },
*   { x: 50, y: 50 },
*   { x: 150, y: 20, width: 200, height: 300 },
* );
* ```
*
* @param cursor - Current pointer coordinates.
* @param anchorOrigin - Center origin of the triggering element.
* @param targetBounds - Bounding box of the target child popover card.
* @returns True if the cursor is within the safe transit triangle.
*/

---

### `isCursorInSafeCorridor`

```typescript
export function isCursorInSafeCorridor(
  cursor: Point2D,
  anchorOrigin: Point2D,
  targetBounds: BoundingBox,
): boolean
```

/**
* Checks whether the pointer cursor is either inside the target child card or traversing
* through the safe corridor triangle connecting the parent anchor to the child.
*
* @example
* ```ts
* if (isCursorInSafeCorridor(cursorPoint, triggerPoint, childCardBox)) {
*   // Keep submenu open while user navigates diagonally
* }
* ```
*
* @param cursor - Current pointer position.
* @param anchorOrigin - Anchor trigger center.
* @param targetBounds - Child popover card bounds.
* @returns True if pointer is within the safe corridor.
*/

---


## 📁 `utils/spatial/spatialEnergy.ts`

### `totalOverlapArea`

```typescript
export function totalOverlapArea(
  card: BoundingBox,
  obstacles: readonly BoundingBox[],
): number
```

/**
* Computes the total overlapping intersection area between a candidate bounding box and obstacles.
*
* @param card - Bounding box of the popover card.
* @param obstacles - Array of obstacle bounding boxes to test against.
* @returns Total intersection area in square pixels.
*
* @example
* ```typescript
* const overlap = totalOverlapArea(candidateBox, existingCards);
* if (overlap === 0) {
*   // Clear placement with zero collisions
* }
* ```
*/

---

### `cascadePlacementEnergy`

```typescript
export function cascadePlacementEnergy(
  position: Point2D,
  size: Size2D,
  obstacles: readonly BoundingBox[],
  preferredPosition: Point2D,
  lambda = 0.5,
): number
```

/**
* Computes the spatial cascade placement penalty ("energy") for a candidate position.
*
* Evaluates placement quality using a combined penalty score:
* `EnergyScore = OverlapArea + (lambda * distanceSquared)`
*
* Where:
* - **OverlapArea**: Total pixel intersection area with other popovers (heavily penalized).
* - **Distance penalty**: Squared distance from the preferred anchor position, scaled by `lambda`.
*
* Uses `sharedBoxPool` to avoid temporary heap allocations in animation loops.
*
* @param position - Candidate top-left coordinate.
* @param size - Dimensions of the popover card.
* @param obstacles - Existing obstacle bounding boxes.
* @param preferredPosition - Desired anchor coordinate.
* @param lambda - Distance penalty multiplier (default 0.5).
* @returns Evaluated placement energy score (lower is better).
*
* @example
* ```typescript
* const score = cascadePlacementEnergy(
*   { x: 200, y: 150 },
*   { width: 300, height: 200 },
*   existingCards,
*   { x: 180, y: 150 },
* );
* ```
*/

---

### `selectLowestEnergyPlacement`

```typescript
export function selectLowestEnergyPlacement(
  candidates: readonly Point2D[],
  size: Size2D,
  obstacles: readonly BoundingBox[],
  preferredPosition: Point2D,
  lambda = 0.5,
): Point2D | undefined
```

/**
* Evaluates candidate positions and selects the one that minimizes overlap collisions and anchor distance.
*
* @remarks
* Iterates through `candidates` and picks the position with the lowest computed energy score.
*
* @example
* ```ts
* const bestPlacement = selectLowestEnergyPlacement(
*   [rightPlacement, leftPlacement, bottomPlacement],
*   cardSize,
*   obstacles,
*   preferredTriggerPosition,
* );
* ```
*
* @param candidates - List of candidate coordinates (e.g. right-start, left-start, bottom-start).
* @param size - Dimensions of the popover card.
* @param obstacles - Existing obstacle bounding boxes.
* @param preferredPosition - Desired ideal anchor coordinate.
* @param lambda - Distance penalty multiplier (default 0.5).
* @returns Best position coordinate, or `undefined` if candidates list is empty.
*/

---


## 📁 `utils/spatial/spatialInsert.test.ts`

### `onSplit`

```typescript
const onSplit = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/spatial/spatialInsert.ts`

### `splitQuadNodes`

```typescript
export function splitQuadNodes<TId extends string>(
  bounds: BoundingBox,
  maxItems: number,
  maxLevels: number,
  nextLevel: number,
  factory: (b: BoundingBox, mi: number, ml: number, l: number) => QuadTree<TId>,
): QuadTree<TId>[]
```

/**
* Subdivides a parent node boundary into four quadrant children (NE, NW, SW, SE).
*
* @param bounds - Spatial boundary of the parent node.
* @param maxItems - Threshold count before a child node will split.
* @param maxLevels - Maximum tree depth limit.
* @param nextLevel - Depth tier index for the newly created children.
* @param factory - Factory function to instantiate QuadTree nodes without circular imports.
* @returns Tuple-like array containing [ne, nw, sw, se] child QuadTree instances.
*
* @example
* ```typescript
* const children = splitQuadNodes(bounds, 16, 8, 1, (b, mi, ml, l) => new QuadTree(b, mi, ml, l));
* ```
*/

---

### `insertQuadItem`

```typescript
export function insertQuadItem<TId extends string>(
  nodes: QuadTree<TId>[],
  items: QuadItem<TId>[],
  bounds: BoundingBox,
  maxItems: number,
  maxLevels: number,
  level: number,
  item: QuadItem<TId> | Partial<QuadItem<TId>> | null | undefined,
  onSplit: () => void,
): QuadItem<TId>[]
```

/**
* Inserts an item into a QuadTree node or delegates to the appropriate sub-quadrant.
*
* @remarks
* If the item fits entirely inside one of the 4 sub-quadrants, it is delegated to that child.
* If it straddles quadrant boundaries, it remains stored in this parent node.
* When the parent node exceeds `maxItems` capacity and has not reached `maxLevels`, it splits
* into 4 sub-quadrants and redistributes existing items.
*
* @param nodes - Array of child quadrant nodes.
* @param items - Items currently stored in this node.
* @param bounds - Boundary of this node.
* @param maxItems - Maximum items before triggering a split.
* @param maxLevels - Maximum tree depth.
* @param level - Current depth level of this node.
* @param item - Candidate item to insert.
* @param onSplit - Callback to create child quadrants when splitting.
* @returns Array of items that remain at this node level (those that cannot fit in a single child quadrant).
*
* @example
* ```typescript
* insertQuadItem(nodes, items, bounds, 16, 8, 0, newItem, () => split());
* ```
*/

---

### `removeQuadItem`

```typescript
export function removeQuadItem<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: QuadItem<TId>[],
  id: TId,
): boolean
```

/**
* Removes an item matching the specified ID from items or child quadrants.
*
* @param nodes - Child quadrant nodes.
* @param items - Items stored at this node level.
* @param id - Identifier of the item to remove.
* @returns `true` if an item was found and removed, `false` otherwise.
*
* @example
* ```typescript
* const removed = removeQuadItem(nodes, items, 'card-1');
* ```
*/

---


## 📁 `utils/spatial/spatialKNN.ts`

### `findNearestQuadItem`

```typescript
export function findNearestQuadItem<TId extends string = string>(
  tree: QuadTree<TId>,
  point: Point2D,
  maxDistance = Infinity,
): QuadItem<TId> | undefined
```

/**
* Searches the QuadTree for the nearest indexed item to a target 2D point.
*
* @remarks
* Recursively visits quadrants ordered by distance from the point to quadrant bounds,
* pruning branches that cannot beat the current best distance.
*
* @example
* ```ts
* const nearest = findNearestQuadItem(quadTree, { x: 100, y: 200 }, 50);
* if (nearest) {
*   console.log('Closest popover:', nearest.id);
* }
* ```
*
* @param tree - Root or subtree QuadTree node.
* @param point - Target 2D coordinates.
* @param maxDistance - Maximum search radius in pixels (default Infinity).
* @returns Nearest item or undefined if none within maxDistance.
*/

---

### `search`

```typescript
function search(node: QuadTree<TId>): void
```

*JSDoc отсутствует*

---

### `findMagneticSnap`

```typescript
export function findMagneticSnap(
  bounds: BoundingBox,
  obstacles: readonly BoundingBox[],
  threshold = 12,
): SnapResult
```

/**
* Computes magnetic snapping coordinates for a moving bounding box against static obstacles.
*
* @remarks
* Tests four candidate snapping alignments along each axis:
* - **Horizontal (X)**:
*   1. Card's left edge snaps to obstacle's right edge (`obstacle.x + obstacle.width`)
*   2. Card's right edge snaps to obstacle's left edge (`obstacle.x - card.width`)
*   3. Card's left edge aligns with obstacle's left edge (`obstacle.x`)
*   4. Card's right edge aligns with obstacle's right edge (`obstacle.x + obstacle.width - card.width`)
* - **Vertical (Y)**:
*   1. Card's top edge snaps to obstacle's bottom edge (`obstacle.y + obstacle.height`)
*   2. Card's bottom edge snaps to obstacle's top edge (`obstacle.y - card.height`)
*   3. Card's top edge aligns with obstacle's top edge (`obstacle.y`)
*   4. Card's bottom edge aligns with obstacle's bottom edge (`obstacle.y + obstacle.height - card.height`)
*
* The closest candidate within the `threshold` distance wins.
*
* @example
* ```ts
* const snap = findMagneticSnap(draggedCardBounds, existingCards, 12);
* const nextX = snap.snapX ?? draggedCardBounds.x;
* const nextY = snap.snapY ?? draggedCardBounds.y;
* ```
*
* @param bounds - Current bounding box of the card being dragged.
* @param obstacles - Bounding boxes of existing cards or UI obstacles.
* @param threshold - Maximum snapping distance in pixels (default 12px).
* @returns Snapped X and Y coordinates (or undefined if outside threshold).
*/

---


## 📁 `utils/spatial/spatialQuery.test.ts`

### `setupTreeWithChildren`

```typescript
function setupTreeWithChildren():
```

*JSDoc отсутствует*

---


## 📁 `utils/spatial/spatialQuery.ts`

### `visitQuadItems`

```typescript
export function visitQuadItems<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  parentBounds: BoundingBox,
  target: BoundingBox,
  visitor: (item: QuadItem<TId>) => boolean | void,
  seen: Set<string>,
): boolean
```

/**
* Traverses items in the QuadTree intersecting with the target bounding box, invoking a visitor callback.
*
* @remarks
* Uses hierarchical bounding box pruning:
* 1. If the target box fits entirely into a single sub-quadrant, execution recurses into that quadrant only.
* 2. Otherwise, iterates child quadrants and visits any whose bounds intersect with the target box.
* 3. Tests items stored directly in this node and calls `visitor` for those that intersect and have not been visited yet (`seen` Set).
*
* Traversal terminates early if `visitor` returns `false`.
*
* @param nodes - Child quadrant subtrees.
* @param items - Items stored at this node level.
* @param parentBounds - Boundary of this node.
* @param target - Target query rectangle.
* @param visitor - Callback receiving intersecting items. Return `false` to abort early.
* @param seen - Mutable set tracking visited item IDs to prevent duplicates.
* @returns `false` if aborted early, `true` otherwise.
*
* @example
* ```typescript
* visitQuadItems(nodes, items, bounds, targetBox, (item) => {
*   console.log('Intersects with:', item.id);
* }, new Set());
* ```
*/

---

### `queryQuadItems`

```typescript
export function queryQuadItems<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  parentBounds: BoundingBox,
  target: BoundingBox,
  returnItems: QuadItem<TId>[],
  seen: Set<string>,
): void
```

/**
* Collects all items in the QuadTree intersecting with the target bounding box into an array.
*
* @param nodes - Child quadrant subtrees.
* @param items - Items stored at this node level.
* @param parentBounds - Boundary of this node.
* @param target - Target query rectangle.
* @param returnItems - Array into which intersecting items are pushed.
* @param seen - Mutable set tracking visited item IDs.
*
* @example
* ```typescript
* const results: QuadItem[] = [];
* queryQuadItems(nodes, items, bounds, targetBox, results, new Set());
* ```
*/

---


## 📁 `utils/spatial/spatialQueryPool.ts`

### `withPooledSeen`

```typescript
export function withPooledSeen<R>(fn: (seen: Set<string>) => R): R
```

*JSDoc отсутствует*

---


## 📁 `utils/spatial/spatialSnapshot.ts`

### `exportSpatialSnapshot`

```typescript
export function exportSpatialSnapshot<TId extends string>(
  tree: QuadTree<TId>,
): SpatialSnapshot<TId>
```

/**
* Exports a QuadTree spatial index into an immutable serializable snapshot.
*
* @template TId - Unique string identifier type for stored items.
* @param tree - QuadTree instance to export.
* @returns Serializable snapshot containing root bounds, capacities, and all stored items.
*
* @example
* ```typescript
* const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });
* tree.insert({ id: 'card-1', bounds: { x: 10, y: 10, width: 50, height: 50 } });
*
* const snapshot = exportSpatialSnapshot(tree);
* console.log(snapshot.items.length); // 1
* ```
*/

---

### `importSpatialSnapshot`

```typescript
export function importSpatialSnapshot<TId extends string>(
  snapshot: SpatialSnapshot<TId> | null | undefined,
): QuadTree<TId> | null
```

/**
* Restores a QuadTree spatial index from a serialized snapshot.
*
* @remarks
* Returns `null` if the snapshot is missing, malformed, or missing required bounds.
*
* @template TId - Unique string identifier type for stored items.
* @param snapshot - The serialized snapshot to restore, or null/undefined.
* @returns A fully restored `QuadTree` instance populated with snapshot items, or `null` if invalid.
*
* @example
* ```typescript
* const restored = importSpatialSnapshot(snapshot);
* if (restored) {
*   const hits = restored.retrieve([], searchArea);
* }
* ```
*/

---


## 📁 `utils/spatial/spatialSubdivide.ts`

### `subdivideBounds`

```typescript
export function subdivideBounds(bounds: BoundingBox): QuadrantSubdivision
```

/**
* Subdivides an axis-aligned bounding box into four equal sub-quadrants (NE, NW, SW, SE).
*
* @param bounds - Spatial boundary to divide into four quadrants.
* @returns Quadrant boundaries for `ne`, `nw`, `sw`, and `se`.
*
* @example
* ```typescript
* const quadrants = subdivideBounds({ x: 0, y: 0, width: 100, height: 100 });
* // quadrants.nw => { x: 0, y: 0, width: 50, height: 50 }
* // quadrants.ne => { x: 50, y: 0, width: 50, height: 50 }
* // quadrants.sw => { x: 0, y: 50, width: 50, height: 50 }
* // quadrants.se => { x: 50, y: 50, width: 50, height: 50 }
* ```
*/

---


## 📁 `utils/spatial/spatialVector.ts`

### `createPoint2D`

```typescript
export function createPoint2D(x = 0, y = 0): Point2D
```

/**
* Creates a finite sanitized 2D point object.
*
* @param x - X coordinate (sanitized to finite number, defaults to 0).
* @param y - Y coordinate (sanitized to finite number, defaults to 0).
* @returns Sanitized `Point2D`.
*
* @example
* ```ts
* const pt = createPoint2D(10, 25);
* ```
*/

---

### `distanceSquared2D`

```typescript
export function distanceSquared2D(a: Point2D, b: Point2D): number
```

/**
* Computes the squared Euclidean distance between two 2D points.
*
* @param a - First point.
* @param b - Second point.
* @returns Squared Euclidean distance ($\Delta x^2 + \Delta y^2$).
*
* @example
* ```ts
* const d2 = distanceSquared2D({ x: 0, y: 0 }, { x: 3, y: 4 }); // 25
* ```
*/

---

### `distance2D`

```typescript
export function distance2D(a: Point2D, b: Point2D): number
```

/**
* Computes the Euclidean distance between two 2D points.
*
* @param a - First point.
* @param b - Second point.
* @returns Euclidean distance ($\sqrt{\Delta x^2 + \Delta y^2}$).
*
* @example
* ```ts
* const d = distance2D({ x: 0, y: 0 }, { x: 3, y: 4 }); // 5
* ```
*/

---

### `manhattanDistance2D`

```typescript
export function manhattanDistance2D(a: Point2D, b: Point2D): number
```

/**
* Computes the Manhattan (L1 norm / taxicab) distance between two 2D points.
*
* @param a - First point.
* @param b - Second point.
* @returns Manhattan distance ($|\Delta x| + |\Delta y|$).
*
* @example
* ```ts
* const m = manhattanDistance2D({ x: 0, y: 0 }, { x: 3, y: 4 }); // 7
* ```
*/

---

### `vectorLength2D`

```typescript
export function vectorLength2D(v: Point2D): number
```

/**
* Calculates the Euclidean length (magnitude) of a 2D vector from the origin.
*
* @param v - Vector coordinates.
* @returns Vector magnitude ($\sqrt{x^2 + y^2}$).
*
* @example
* ```ts
* const len = vectorLength2D({ x: 3, y: 4 }); // 5
* ```
*/

---

### `dotProduct2D`

```typescript
export function dotProduct2D(a: Point2D, b: Point2D): number
```

/**
* Computes the algebraic dot product (scalar product) of two 2D vectors.
*
* @param a - First vector.
* @param b - Second vector.
* @returns Scalar dot product ($a_x b_x + a_y b_y$).
*
* @example
* ```ts
* const dot = dotProduct2D({ x: 1, y: 0 }, { x: 0, y: 1 }); // 0 (orthogonal)
* ```
*/

---

### `addPoints2DInto`

```typescript
export function addPoints2DInto(a: Point2D, b: Point2D, out: { x: number; y: number }): void
```

/**
* Adds two 2D points writing the coordinates directly into `out` without allocating heap memory.
*
* @param a - First point.
* @param b - Second point.
* @param out - Mutable point object to receive result coordinates.
*
* @example
* ```ts
* addPoints2DInto(pos, delta, scratchPt);
* ```
*/

---

### `addPoints2D`

```typescript
export function addPoints2D(a: Point2D, b: Point2D): Point2D
```

/**
* Adds two 2D points returning a new `Point2D`.
*
* @param a - First point.
* @param b - Second point.
* @returns Sum point ($a + b$).
*
* @example
* ```ts
* const sum = addPoints2D({ x: 10, y: 20 }, { x: 5, y: -5 }); // { x: 15, y: 15 }
* ```
*/

---

### `subtractPoints2DInto`

```typescript
export function subtractPoints2DInto(a: Point2D, b: Point2D, out: { x: number; y: number }): void
```

/**
* Subtracts point `b` from point `a` writing into `out` without allocating heap memory.
*
* @param a - Minuend point.
* @param b - Subtrahend point.
* @param out - Mutable point object to receive result coordinates.
*
* @example
* ```ts
* subtractPoints2DInto(currentPos, anchorPos, scratchDelta);
* ```
*/

---

### `subtractPoints2D`

```typescript
export function subtractPoints2D(a: Point2D, b: Point2D): Point2D
```

/**
* Subtracts point `b` from point `a` returning a new `Point2D`.
*
* @param a - Minuend point.
* @param b - Subtrahend point.
* @returns Difference vector ($a - b$).
*
* @example
* ```ts
* const diff = subtractPoints2D({ x: 20, y: 30 }, { x: 5, y: 10 }); // { x: 15, y: 20 }
* ```
*/

---

### `scalePoint2DInto`

```typescript
export function scalePoint2DInto(p: Point2D, factor: number, out: { x: number; y: number }): void
```

/**
* Multiplies a 2D point by a scalar factor writing directly into `out` without heap allocation.
*
* @param p - Input point.
* @param factor - Numeric multiplier.
* @param out - Mutable target object.
*
* @example
* ```ts
* scalePoint2DInto(velocity, 0.95, scratchVel);
* ```
*/

---

### `scalePoint2D`

```typescript
export function scalePoint2D(p: Point2D, factor: number): Point2D
```

/**
* Multiplies a 2D point by a scalar factor returning a new `Point2D`.
*
* @param p - Input point.
* @param factor - Numeric multiplier.
* @returns Scaled point ($p \cdot \text{factor}$).
*
* @example
* ```ts
* const scaled = scalePoint2D({ x: 10, y: 20 }, 2); // { x: 20, y: 40 }
* ```
*/

---

### `lerpPoint2DInto`

```typescript
export function lerpPoint2DInto(
  a: Point2D,
  b: Point2D,
  t: number,
  out: { x: number; y: number },
): void
```

/**
* Performs linear interpolation (lerp) between points `a` and `b` by fraction `t` [0, 1] into `out`.
*
* @param a - Starting point ($t = 0$).
* @param b - Ending point ($t = 1$).
* @param t - Normalized interpolation factor (clamped between 0 and 1).
* @param out - Mutable target object.
*
* @example
* ```ts
* lerpPoint2DInto(startPos, endPos, 0.5, scratchPos);
* ```
*/

---

### `lerpPoint2D`

```typescript
export function lerpPoint2D(a: Point2D, b: Point2D, t: number): Point2D
```

/**
* Linearly interpolates between points `a` and `b` by parameter `t` [0, 1].
*
* @param a - Starting point ($t = 0$).
* @param b - Ending point ($t = 1$).
* @param t - Interpolation parameter.
* @returns Interpolated point.
*
* @example
* ```ts
* const midpoint = lerpPoint2D({ x: 0, y: 0 }, { x: 100, y: 100 }, 0.5); // { x: 50, y: 50 }
* ```
*/

---


## 📁 `utils/stringUtils.ts`

### `kebabCase`

```typescript
export function kebabCase(str: string): string
```

/**
* Converts camelCase, PascalCase, or snake_case string to kebab-case.
*
* @param str - Input string.
* @returns Kebab-cased string.
*
* @example
* ```typescript
* kebabCase('popoverCardHeader'); // "popover-card-header"
* kebabCase('User_Profile');       // "user-profile"
* ```
*/

---

### `camelCase`

```typescript
export function camelCase(str: string): string
```

/**
* Converts kebab-case or snake_case string to camelCase.
*
* @param str - Input string.
* @returns CamelCased string.
*
* @example
* ```typescript
* camelCase('popover-card-header'); // "popoverCardHeader"
* camelCase('user_name');           // "userName"
* ```
*/

---

### `capitalize`

```typescript
export function capitalize(str: string): string
```

/**
* Capitalizes the first character of a string.
*
* @param str - Input string.
* @returns String with first letter capitalized.
*
* @example
* ```typescript
* capitalize('popover'); // "Popover"
* ```
*/

---

### `ensurePrefix`

```typescript
export function ensurePrefix(str: string, prefix: string): string
```

/**
* Guarantees that a string begins with the specified prefix.
*
* @param str - Target string.
* @param prefix - Desired prefix.
* @returns String with prefix prepended if not already present.
*
* @example
* ```typescript
* ensurePrefix('card-1', 'popover-'); // "popover-card-1"
* ensurePrefix('popover-card-1', 'popover-'); // "popover-card-1"
* ```
*/

---

### `ensureSuffix`

```typescript
export function ensureSuffix(str: string, suffix: string): string
```

/**
* Guarantees that a string terminates with the specified suffix.
*
* @param str - Target string.
* @param suffix - Desired suffix.
* @returns String with suffix appended if not already present.
*
* @example
* ```typescript
* ensureSuffix('data', '.json'); // "data.json"
* ```
*/

---

### `truncate`

```typescript
export function truncate(str: string, maxLength: number, suffix = '...'): string
```

/**
* Truncates a string to maxLength, appending a suffix if truncation occurs.
*
* @param str - Input string.
* @param maxLength - Maximum allowed length.
* @param suffix - Ellipsis or marker (defaults to '...').
* @returns Truncated string.
*
* @example
* ```typescript
* truncate('Long popover title here', 12); // "Long popo..."
* ```
*/

---


## 📁 `utils/styles.ts`

### `getPopoverStyles`

```typescript
export function getPopoverStyles({
  finalLayoutPos,
  offset = ZERO_OFFSET,

  dragX = 0,
  dragY = 0,
  rotation = 0,
  rotationX = 0,
  rotationY = 0,
  zIndex = DEFAULT_FALLBACK_Z_INDEX,
}: GetPopoverStylesParams): CSSProperties
```

/**
* Computes hardware-accelerated CSS properties and `--pt-*` custom variables for a popover card.
* Normalizes input coordinates to finite numbers, applies subpixel rounding during dynamic dragging,
* and caches static layout positions via an internal LRU cache to eliminate style object re-allocation.
*
* @param params - Layout coordinates, drag deltas, 3D tilt rotations, and stacking z-index.
* @returns React `CSSProperties` object with absolute positioning, transform, and custom properties.
*
* @example
* ```typescript
* const cardStyle = getPopoverStyles({
*   finalLayoutPos: { top: 120, left: 340 },
*   offset: { x: 10, y: 0 },
*   dragX: 5,
*   dragY: 0,
*   rotation: 2,
*   zIndex: 105,
* });
* ```
*/

---


## 📁 `utils/stylesTransform.ts`

### `hashTransformCoordinates`

```typescript
export function hashTransformCoordinates(
  top: number,
  left: number,
  tx: number,
  ty: number,
  zIndex: number,
): number
```

/**
* Computes a 32-bit integer hash from geometric layout coordinates and zIndex.
* Utilizes multiplicative Murmur-style bit mixing (`Math.imul` and XOR shifts)
* to produce uniform hash distributions with zero heap allocations on hot interaction paths.
*
* @param top - Vertical layout position in pixels.
* @param left - Horizontal layout position in pixels.
* @param tx - Computed X translation in pixels.
* @param ty - Computed Y translation in pixels.
* @param zIndex - Visual stacking order index.
* @returns 32-bit integer hash suitable for LRU cache lookup keys.
*
* @example
* ```typescript
* const key = hashTransformCoordinates(120, 350, 0, 0, 100);
* const cachedStyle = styleCache.get(key);
* ```
*/

---

### `buildPopoverCssVar`

```typescript
export function buildPopoverCssVar(name: string): string
```

/**
* Ensures a custom CSS variable name carries the canonical `--pt-` prefix.
*
* @param name - Base variable name or raw CSS custom property.
* @returns Normalized CSS variable name with `--pt-` prefix.
*
* @example
* ```typescript
* buildPopoverCssVar('drag-x'); // => '--pt-drag-x'
* buildPopoverCssVar('--pt-drag-x'); // => '--pt-drag-x'
* ```
*/

---

### `buildTransformString`

```typescript
export function buildTransformString(
  translateX: number,
  translateY: number,
  rotX: number,
  rotY: number,
  rotZ: number,
): string
```

/**
* Constructs a hardware-accelerated CSS `transform` string.
* Optimizes static translations to `translate3d(x, y, 0px)`
* and adds 3D perspective projection and Euler axis rotations (`rotateX`, `rotateY`, `rotateZ`)
* only when tilt or rotation dynamics are active.
*
* @param translateX - Translation along the X axis in pixels.
* @param translateY - Translation along the Y axis in pixels.
* @param rotX - 3D rotation around the X axis in degrees (pitch).
* @param rotY - 3D rotation around the Y axis in degrees (yaw).
* @param rotZ - 2D planar rotation around the Z axis in degrees (roll).
* @returns Hardware-accelerated CSS transform string.
*
* @example
* ```typescript
* buildTransformString(150, 40, 0, 0, 0);
* // => 'translate3d(150px, 40px, 0px)'
*
* buildTransformString(150, 40, 5, 2, -3);
* // => 'perspective(1000px) translate3d(150px, 40px, 0px) rotateX(5.00deg) rotateY(2.00deg) rotateZ(-3.00deg)'
* ```
*/

---


## 📁 `utils/theme/themeCore.ts`

### `applyThemeTokens`

```typescript
export function applyThemeTokens(
  element: HTMLElement | ElementWithStyleLike | null = typeof document !== 'undefined'
    ? document.documentElement
    : null,
  tokens?: PopoverThemeTokens,
): ScopeDisposable
```

*JSDoc отсутствует*

---


## 📁 `utils/theme/themeDom.ts`

### `injectStyleProperty`

```typescript
export function injectStyleProperty(
  element: HTMLElement | ElementWithStyleLike,
  propertyName: string,
  value: string,
): void
```

*JSDoc отсутствует*

---

### `removeThemeTokens`

```typescript
export function removeThemeTokens(
  element: HTMLElement | ElementWithStyleLike | null = typeof document !== 'undefined'
    ? document.documentElement
    : null,
): void
```

*JSDoc отсутствует*

---


## 📁 `utils/themeTokens.test.ts`

### `createMockElement`

```typescript
function createMockElement()
```

*JSDoc отсутствует*

---


## 📁 `utils/triggerRegistry.test.ts`

### `createMockElement`

```typescript
function createMockElement(): HTMLElement
```

*JSDoc отсутствует*

---


## 📁 `utils/triggerRegistry.ts`

### `pruneDeadRefs`

```typescript
function pruneDeadRefs(): void
```

*JSDoc отсутствует*

---


## 📁 `utils/uuid.ts`

### `generateTabId`

```typescript
export function generateTabId(): string
```

/**
* Generates a cryptographically strong UUID v4 or random fallback string
* suitable for tab sessions and transient keys.
*
* @returns Unique tab/session ID string.
*
* @example
* ```typescript
* const tabId = generateTabId();
* // => '3b241101-e2bb-4255-8caf-4136c566a964'
* ```
*/

---


## 📁 `utils/virtualElement.ts`

### `createDefaultDOMRect`

```typescript
export function createDefaultDOMRect(): DOMRect
```

/**
* Creates a safe zero-dimension fallback DOMRect instance.
*
* @returns Standard DOMRect or conforming fallback object.
*
* @example
* ```typescript
* const rect = createDefaultDOMRect();
* console.log(rect.width); // 0
* ```
*/

---

### `createVirtualElement`

```typescript
export function createVirtualElement(
  x: number,
  y: number,
  width = 0,
  height = 0,
): AnchorEventLike &
```

/**
* Factory helper creating a VirtualElement / AnchorEventLike object from coordinates.
*
* Useful for anchoring floating popovers to arbitrary pointer clicks or virtual coordinates
* without requiring an actual DOM element.
*
* @param x - Horizontal coordinate in pixels.
* @param y - Vertical coordinate in pixels.
* @param width - Optional width bounding box (default: 0).
* @param height - Optional height bounding box (default: 0).
* @returns Virtual anchor object with `getBoundingClientRect()`.
*
* @example
* ```typescript
* const virtualAnchor = createVirtualElement(event.clientX, event.clientY);
* openPopover('context-menu', { anchor: virtualAnchor });
* ```
*/

---

### `normalizeDOMRect`

```typescript
export function normalizeDOMRect(
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
    right?: number;
    bottom?: number;
    x?: number;
    y?: number;
  } | null,
): DOMRect
```

/**
* Normalizes any DOMRect-like or ClientRect object into a conforming DOMRect.
*
* Sanitizes non-finite coordinates, computes missing `right` and `bottom` boundaries,
* and ensures negative dimensions are clamped to 0.
*
* @param rect - Target rectangle candidate.
* @returns Conforming DOMRect object.
*
* @example
* ```typescript
* const safeRect = normalizeDOMRect({ top: 10, left: 20, width: 100, height: 50 });
* console.log(safeRect.right); // 120
* ```
*/

---


## 📁 `utils/worker/workerCore.ts`

### `createWorkerResolver`

```typescript
export function createWorkerResolver<TData = unknown, TContext = unknown>(
  workerOrFn: WorkerTarget<TData, TContext>,
  options: WorkerResolverOptions<TData> = {},
): WorkerResolver<TData, TContext>
```

*JSDoc отсутствует*

---

### `initWorker`

```typescript
const initWorker = (): Worker | null =>
```

*JSDoc отсутствует*

---

### `terminate`

```typescript
const terminate = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/worker/workerRpc.test.ts`

### `dispatchMessage`

```typescript
async function dispatchMessage(data: unknown): Promise<void>
```

*JSDoc отсутствует*

---


## 📁 `utils/worker/workerRpc.ts`

### `handleWorkerAbort`

```typescript
function handleWorkerAbort(activeTasks: Map<number, AbortController>, id: number): void
```

*JSDoc отсутствует*

---

### `handleWorkerResolve`

```typescript
async function handleWorkerResolve<TData, TContext>(
  selfScope: WindowOrWorkerGlobalScope & { postMessage(message: unknown): void },
  activeTasks: Map<number, AbortController>,
  msg: WorkerTaskResolveMessage<TContext>,
  handler: (key: string, parentData?: unknown, context?: TContext) => MaybePromise<TData>,
): Promise<void>
```

*JSDoc отсутствует*

---

### `isWorkerTaskMessage`

```typescript
function isWorkerTaskMessage<TContext>(data: unknown): data is WorkerTaskMessage<TContext>
```

*JSDoc отсутствует*

---

### `definePopoverWorkerRPC`

```typescript
export function definePopoverWorkerRPC<TData = unknown, TContext = unknown>(
  handler: (key: string, parentData?: unknown, context?: TContext) => MaybePromise<TData>,
): void
```

/**
* Initializes and registers an RPC message router inside a Web Worker thread for async data fetching.
*
* @template TData - Resolved data payload type.
* @template TContext - Optional context object type.
* @param handler - Worker resolver function receiving key, parentData, and context.
*
* @example
* ```typescript
* // In worker.ts:
* definePopoverWorkerRPC(async (key, parentData) => {
*   const res = await fetch(`/api/popovers/${key}`);
*   return res.json();
* });
* ```
*/

---


## 📁 `utils/worker/workerScript.ts`

### `createPopoverWorkerScript`

```typescript
export function createPopoverWorkerScript<TContext = unknown>(
  resolverFn: (key: string, parentData?: unknown, context?: TContext) => unknown,
): string
```

/**
* Worker Script Code Generation for Blob Workers.
* Clean Architecture Layer 2: Headless State Management.
*
* @module utils/worker/workerScript
*/

---


## 📁 `utils/worker/workerTask.ts`

### `executeWorkerTask`

```typescript
export function executeWorkerTask<TData, TContext>(
  params: TaskParams<TData, TContext>,
): Promise<TData>
```

*JSDoc отсутствует*

---

### `cleanup`

```typescript
const cleanup = () =>
```

*JSDoc отсутствует*

---

### `handleMessage`

```typescript
const handleMessage = (e: MessageEvent<WorkerResponseMessage<TData>>) =>
```

*JSDoc отсутствует*

---

### `handleError`

```typescript
const handleError = (err: ErrorEvent) =>
```

*JSDoc отсутствует*

---

### `handleAbort`

```typescript
const handleAbort = () =>
```

*JSDoc отсутствует*

---


## 📁 `utils/zeroGcInvariants.test.ts`

### `deltaX`

```typescript
const deltaX = (frame % 300) - 150
```

*JSDoc отсутствует*

---

### `deltaY`

```typescript
const deltaY = (frame % 300) - 150
```

*JSDoc отсутствует*

---

### `memoryGrowthKb`

```typescript
const memoryGrowthKb = (endMemory - startMemory) / 1024
```

*JSDoc отсутствует*

---


## 📁 `utils.test.ts`

### `add1`

```typescript
const add1 = (n: number) => n + 1
```

*JSDoc отсутствует*

---

### `double`

```typescript
const double = (n: number) => n * 2
```

*JSDoc отсутствует*

---


## 📁 `validators/validateComponentScope.ts`

### `validateCardSubComponentScope`

```typescript
export function validateCardSubComponentScope(hasContext: boolean, subComponentName: string): void
```

/** PT-106: Validates card sub-component context placement. */

---

### `validateTimelineSubComponentScope`

```typescript
export function validateTimelineSubComponentScope(
  hasContext: boolean,
  subComponentName: string,
): void
```

/** PT-107: Validates timeline sub-component context placement. */

---

### `validatePortalContainer`

```typescript
export function validatePortalContainer(container: Element | null): void
```

/** PT-125: Validates portal container DOM node existence. */

---

### `validatePortalExclusion`

```typescript
export function validatePortalExclusion(elementName: string): void
```

/** PT-130: Validates portal exclusion element attributes. */

---


## 📁 `validators/validatePerformance.ts`

### `markPerformance`

```typescript
export function markPerformance(name: string): void
```

*JSDoc отсутствует*

---

### `measurePerformance`

```typescript
export function measurePerformance(name: string, startMark: string, endMark?: string): void
```

*JSDoc отсутствует*

---


## 📁 `validators/validateProvider.ts`

### `validateCascadeStep`

```typescript
export function validateCascadeStep(step: number | undefined): void
```

/** PT-109: Validates cascade offset step. */

---

### `validateDefaultOffset`

```typescript
export function validateDefaultOffset(offset: number | undefined): void
```

/** PT-110: Validates default offset gap. */

---

### `validateBaseZIndex`

```typescript
export function validateBaseZIndex(zIndex: number | undefined): void
```

/** PT-111: Validates base z-index. */

---

### `validateExitDuration`

```typescript
export function validateExitDuration(duration: number | undefined): void
```

/** PT-112: Validates exit transition duration. */

---

### `validateProviderResolver`

```typescript
export function validateProviderResolver(hasResolver: boolean): void
```

/** PT-113: Validates provider resolver initialization. */

---

### `validateCascadeDepth`

```typescript
export function validateCascadeDepth(depth: number): void
```

/** PT-115: Validates maximum cascade depth. */

---

### `validateFactoryPlacement`

```typescript
export function validateFactoryPlacement(isInsideRender?: boolean): void
```

/** PT-126: Validates createPopoverTrail factory placement. */

---

### `validateStoreControllerInstance`

```typescript
export function validateStoreControllerInstance(store: unknown): void
```

/** PT-127: Validates store instance provided to createPopoverController. */

---


## 📁 `validators/validateSchema.ts`

### `validateSchemaKey`

```typescript
export function validateSchemaKey(hasKey: boolean, key: string): void
```

/** PT-108: Validates schema key presence. */

---

### `validateSchemaCircularChild`

```typescript
export function validateSchemaCircularChild(parentKey: string, childKey: string): void
```

/** PT-128: Validates schema circular child definitions. */

---

### `validateResolverTimeout`

```typescript
export function validateResolverTimeout(durationMs: number, key: string): void
```

/** PT-129: Validates resolver timeout duration. */

---


## 📁 `validators/validateSpatial.ts`

### `validateDragOffset`

```typescript
export function validateDragOffset(x: number, y: number): void
```

/** PT-114: Validates drag offset coordinates. */

---

### `validateStackGroup`

```typescript
export function validateStackGroup(stackGroup: Maybe<string>): void
```

/** PT-116: Validates stack group filter string. */

---

### `validatePinDragState`

```typescript
export function validatePinDragState(isPinned: boolean, allowDragWhenUnpinned?: boolean): void
```

/** PT-121: Validates pin drag state logic. */

---

### `validateQuadTreeBounds`

```typescript
export function validateQuadTreeBounds(width: number, height: number): void
```

/** PT-123: Validates QuadTree spatial bounding box dimensions. */

---


## 📁 `validators/validateStorageAndState.ts`

### `validateHistoryCapacity`

```typescript
export function validateHistoryCapacity(maxHistory: number): void
```

/** PT-117: Validates history snapshot stack capacity. */

---

### `validateSharedMemorySupport`

```typescript
export function validateSharedMemorySupport(useSharedMemory?: boolean): void
```

/** PT-119: Validates SharedArrayBuffer worker support. */

---

### `validateHydrationError`

```typescript
export function validateHydrationError(key: string, error: unknown): void
```

/** PT-120: Validates hydration error states. */

---

### `validateStorageKey`

```typescript
export function validateStorageKey(storageKey: string): void
```

/** PT-122: Validates snapshot manager storage keys. */

---

### `validateFSMTransitionEvent`

```typescript
export function validateFSMTransitionEvent(eventType: string): void
```

/** PT-124: Validates FSM transition event types. */

---


## 📁 `validators/validateTrigger.ts`

### `validatePopoverKey`

```typescript
export function validatePopoverKey(key: string | undefined): void
```

/** PT-101: Validates popover key format. */

---

### `validatePlacement`

```typescript
export function validatePlacement(placement: PopoverPlacement | undefined): void
```

/** PT-102: Validates placement string. */

---

### `validateHoverDelays`

```typescript
export function validateHoverDelays(openDelay?: number, closeDelay?: number): void
```

/** PT-103 & PT-104: Validates hover delays. */

---

### `validateCascadeAncestry`

```typescript
export function validateCascadeAncestry(popoverKey: string, parentKey: string | null): void
```

/** PT-105: Validates parent-child cascade loops. */

---

### `validateTriggerEvent`

```typescript
export function validateTriggerEvent(hasEvent: boolean): void
```

/** PT-118: Validates trigger action event handlers. */

---


## 📁 `validators/warningEngine.ts`

### `isDevEnv`

```typescript
export function isDevEnv(): boolean
```

*JSDoc отсутствует*

---

### `emitDevWarning`

```typescript
function emitDevWarning(code: string, message: string): void
```

/** Single Source of Truth for logging warnings to console in dev mode */

---

### `warnDev`

```typescript
export function warnDev(condition: boolean, message: string): void
```

/**
* Development guardrail warning logger.
*/

---

### `isDevWarningDetails`

```typescript
export function isDevWarningDetails(val: unknown): val is DevWarningDetails
```

/**
* Type guard verifying if an unknown object is valid DevWarningDetails.
*/

---

### `warnDevDetails`

```typescript
export function warnDevDetails(condition: boolean, details: DevWarningDetails): void
```

/**
* Structured error logger with code and detailed message.
*/

---

