# Engineering Principles, Architecture & Operational Charter

This document serves as the governing architectural charter for the `popover-trail` library. It defines the foundational methodologies, structural constraints, theoretical paradigms, and quality standards for all software engineers and autonomous agents modifying this codebase.

---

## 1. System Mission & Axiomatic Foundations

`popover-trail` is a high-performance, accessible, headless cascading popover engine built on pure functional state machines, directed acyclic graphs (DAG), and declarative compound UI abstractions.

Every contribution must preserve the following core system axioms:

1. **State Determinism**: Given identical historical state sequences and inputs, the core state machine must produce bit-for-bit identical outputs with zero environmental non-determinism. State evolution is modeled as a deterministic discrete transition function:
   $$\delta: \mathcal{S} \times \mathcal{A} \to \mathcal{S}' \times \vec{\mathcal{E}}$$
   where $\mathcal{S}$ is the immutable state space, $\mathcal{A}$ is the action space, $\mathcal{S}'$ is the transformed state, and $\vec{\mathcal{E}}$ is the ordered sequence of declarative side-effect descriptors.
2. **Strict Layer Isolation**: Inner layers must remain entirely agnostic of outer consumers, rendering engines, browser environments, and concrete UI frameworks.
3. **Zero Garbage Collection Churn in Interaction Paths**: High-frequency user interactions (pointer dragging, scroll tracking, animation frames) must produce zero heap allocations:
   $$\text{Alloc}(\text{Frame}) = 0 \text{ bytes}$$
4. **Topological Graph Integrity**: The active cascading hierarchy forms a strict Directed Acyclic Graph $G = (V, E)$ with guaranteed cycle freedom and deterministic traversal paths.
5. **Resilient Fault Containment**: Exceptions originating from consumer callbacks, middleware, or external environments must never corrupt internal state machines or disrupt active transactions.
6. **Bounded Resource Footprint**: Peak heap memory $\mathcal{M}(G)$ is strictly bounded as a linear function of active node cardinality:
   $$\mathcal{M}(G) \le \mathcal{M}_0 + c \cdot |V|$$

---

## 2. Four-Tier Layer Stratification (Clean Architecture)

The codebase enforces a unidirectional, strictly nested Clean Architecture (Onion) topology. Dependencies point strictly inward. Upward or lateral cross-layer imports are prohibited and verified automatically by dependency analysis tooling.

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Presentation & UI Components                       │
│ (Compound Components, Portals, Slots, Dialogs, A11y Roles)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (depends strictly on Layer 3)
┌──────────────────────────────▼──────────────────────────────┐
│ Layer 3: Reactive Integration & Hooks                       │
│ (Context Providers, Hook Composition, Viewport Adapters)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (depends strictly on Layer 2)
┌──────────────────────────────▼──────────────────────────────┐
│ Layer 2: Headless State Management & Orchestration          │
│ (Store Slices, CQRS Dispatchers, Event Bus, Snapshot Sync)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (depends strictly on Layer 1)
┌──────────────────────────────▼──────────────────────────────┐
│ Layer 1: Core Kernel (Pure Functional Domain)               │
│ (Reducers, DAG Graph Topology, Vector Math, Result Monads)  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities and Constraints:

* **Layer 1 (Core Kernel)**:
  * **Responsibilities**: Pure state transition reducers, topological DAG algorithms, 2D coordinate geometry, Result monads, error models, and invariant validators.
  * **Constraints**: Zero external dependencies. Completely decoupled from React, Zustand, Floating UI, browser DOM interfaces (`window`, `document`, `HTMLElement`), and Web APIs.
* **Layer 2 (Headless State Management)**:
  * **Responsibilities**: Zustand store slices, CQRS dispatchers, event bus implementation, storage synchronization, history managers, and transition schedulers.
  * **Constraints**: Pure orchestration only. Delegates all business calculations, coordinate transformations, and transition plans to Layer 1. Must never import React components, JSX, or DOM renderer internals.
* **Layer 3 (Reactive Integration & Hooks)**:
  * **Responsibilities**: React lifecycle adapters, context providers, coordinate synchronization hooks, keyboard managers, and DOM event listeners.
  * **Constraints**: Bridges Headless State with React reactivity. Must never import UI compound components or render JSX markup.
* **Layer 4 (Presentation & UI Components)**:
  * **Responsibilities**: Compound UI components, portal integrations, accessible DOM wrappers, and polymorphic slots.
  * **Constraints**: Thin declarative wrappers around Layer 3 hooks and contexts. Implements zero raw state logic or mathematical coordinate transformations.

---

## 3. Functional Core / Imperative Shell Methodology

Business logic and side effects are strictly partitioned into distinct execution domains:

* **Algebraic State Transformations (Functional Core)**:
  * State transitions are pure mathematical functions: $(\mathcal{S}, \mathcal{A}) \to (\mathcal{S}', \text{Plan})$.
  * Reducers are purely deterministic and free from side effects: no timer instantiation, no asynchronous execution, no DOM access, and no mutation of incoming arguments.
* **Categorical Semantics of Pipeline Transformations**:
  * Asynchronous and fallible operations (data fetching, pipeline caching, resolution) are modeled as Kleisli arrows over the Result-State monad transformer:
    $$\mathcal{M}(\mathcal{S}, \mathcal{T}) = \mathcal{S} \to \text{Result}\langle \mathcal{S} \times \mathcal{T}, \text{DomainError} \rangle$$
    guaranteeing atomic failure handling without unhandled promise rejections.
* **Declarative Effect Virtualization**:
  * External side effects (request cancellations, timer schedules, subscriber notifications, user callback dispatches) are returned as immutable declarative descriptors within an effect plan.
* **Imperative Shell Execution**:
  * Dedicated effect runners located in store slices receive declarative effect plans, apply state patches atomically, and execute corresponding side effects in a controlled sequence.
* **Command-Query Responsibility Segregation (CQRS)**:
  * State mutations (Commands) and state inspections (Queries/Selectors) are strictly separated.
  * Selectors are co-presheaves (contravariant functors) over immutable state snapshots, ensuring identity preservation and zero evaluation side effects:
    $$\forall s \in \mathcal{S}, \quad \text{Query}(s) \implies s' = s$$

---

## 4. Finite State Automata & Bitmask Transition Algebra

Individual entry lifecycles operate as discrete finite state machines:

* **FSM Formal Definition**:
  * An entry lifecycle is a finite state automaton $\mathcal{M}_{\text{entry}} = \langle \mathcal{Q}, \Sigma, \delta_{\text{entry}}, q_0, \mathcal{F} \rangle$, where:
    $$\mathcal{Q} = \{ \text{idle}, \text{opening}, \text{open}, \text{closing}, \text{closed}, \text{unmounted} \}$$
* **Bitmask Transition Adjacency Matrix**:
  * Allowed transitions are encoded within an immutable bitmask incidence matrix $M_{\text{trans}} \in \{0, 1\}^{|\mathcal{Q}| \times |\mathcal{Q}|}$. Validating transitions executes in $O(1)$ time via bitwise conjunction:
    $$\text{isValid}(q_i \to q_j) \iff (M_{\text{trans}}[i] \mathbin{\&} (1 \ll j)) \neq 0$$
* **Deadlock Freedom & Reachability**:
  * Every reachable non-terminal state $q \in \mathcal{Q}$ possesses a deterministic geodesic path to the terminal unmounted state $\Omega_{\text{entry}}$.

---

## 5. Topological Graph Theory & Cascade Invariants

The popover hierarchy is governed by strict graph-theoretic invariants:

* **Directed Acyclic Graph (DAG)**:
  * Active popovers and their parent-child cascade relationships form a directed acyclic graph $G = (V, E)$, where $V$ is the set of popover keys and $E \subseteq V \times V$ represents hierarchical cascade edges.
  * Cycle prevention is strictly enforced before every edge insertion: an edge $(u, v)$ is admitted if and only if $u \notin \text{Descendants}(v)$.
* **Poset Linear Extension**:
  * The cascade DAG defines a strict partial order $(V, \prec)$. Topological traversal computes an order-preserving linear extension $\mathcal{L}: (V, \prec) \to (V, <)$ such that:
    $$\forall u, v \in V, \quad u \prec v \implies \mathcal{L}(u) < \mathcal{L}(v)$$
* **Deterministic Subtree Pruning**:
  * Closing a parent node $r$ at depth $d$ automatically generates a recursive topological teardown plan for its entire transitive reachable subgraph:
    $$\mathcal{T}(r) = \{ v \in V \mid v \in \text{Reach}(r) \}$$
    Teardown is ordered in reverse topological depth, guaranteeing that orphan nodes cannot persist in the active state.
* **Geodesic Path Projection (Breadcrumbs)**:
  * The path operator $\beta: V \to V^*$ extracts the unique topological geodesic from the root anchor to any active node $v \in V$ in $O(\text{Depth}(v))$ time.
* **Z-Index Bijective Mapping**:
  * The visual stacking order ($z$-index) maintains a strict bijective correspondence with topological activation and focus history:
    $$\mathcal{Z}: V \to \{1, \dots, |V|\} \quad \text{bijective}$$
* **Monotonic Revision Counter**:
  * A global state revision counter increments monotonically if and only if an atomic state patch modifies at least one value property, enabling $O(1)$ state equality assertions for external consumers:
    $$\text{StateRevision}_{t+1} = \begin{cases} \text{StateRevision}_t + 1 & \text{if } \mathcal{S}' \not\equiv \mathcal{S} \\ \text{StateRevision}_t & \text{if } \mathcal{S}' \equiv \mathcal{S} \end{cases}$$

---

## 6. Temporal Dynamics & Transition Scheduling Algebra

Asynchronous time delays and interaction transitions adhere to a rigorous scheduling algebra:

* **Time-Delay Operator $\mathcal{D}(\Delta t, \alpha)$**:
  * Every delayed transition action $\alpha$ is associated with a duration $\Delta t$ and a discrete ownership key $k$.
* **Cancellation Invariance**:
  * An incoming cancellation event for key $k$ permanently annuls any pending delayed operator $\mathcal{D}(\Delta t, \alpha)_k$ prior to its execution, preventing stale transitions from mutating subsequent states.
* **Zero-Latency Fast Path**:
  * When $\Delta t \le 0$, the temporal operator collapses into synchronous microtask execution:
    $$\mathcal{D}(0, \alpha) \equiv \text{deferMicrotask}(\alpha)$$
    eliminating macro-timer creation overhead.

---

## 7. 2D Affine Geometric Transformations & Coordinate Invariants

Spatial calculations for positioning, dragging, and cascading popovers follow strict affine geometric principles:

* **Coordinate Space Partitioning**:
  * The system distinguishes between Global Screen Space, Viewport Anchor Space, and Matrix-Transformed Container Space.
* **Affine Transform Invariance**:
  * When dragging or positioning inside containers with CSS transform matrices (e.g. scale $s$ or zoom factor), coordinates are normalized via inverse transformation:
    $$P_{\text{local}} = M^{-1} \cdot P_{\text{screen}}$$
* **Finite Float Guarantee**:
  * All computed coordinate pairs $(x, y) \in \mathbb{R}^2$ must satisfy $\text{isFinite}(x) \land \text{isFinite}(y)$. Any non-finite value ($\text{NaN}, \pm\infty$) is sanitized to the static singleton zero vector $\vec{0} = (0, 0)$.

---

## 8. Spatial Partitioning & Viewport Clamping Geometry

Cascade positioning and collision handling operate under formal spatial bounding box theory:

* **Axis-Aligned Bounding Box (AABB) Model**:
  * Every popover card $v \in V$ is bounded by an orthogonal rectangle $B(v) = [x_{\min}, y_{\min}, x_{\max}, y_{\max}] \subset \mathbb{R}^2$.
* **Viewport Containment Clamping $\mathcal{C}$**:
  * For a given viewport boundary $\Omega_{\text{viewport}} \subset \mathbb{R}^2$, the clamping operator $\mathcal{C}: B(v) \times \Omega_{\text{viewport}} \to \mathbb{R}^2$ shifts the card position vector such that:
    $$B(v) \cap \Omega_{\text{viewport}} = B(v)$$
    ensuring popovers remain visually reachable regardless of trigger positioning near display edges.
* **Cascade Collision Avoidance & Energy Minimization**:
  * Child popovers compute placement offsets along preferred directional vectors (e.g., right-start $\to$ left-start $\to$ bottom-start) using deterministic fallback vectors that minimize spatial overlap energy without layout oscillation:
    $$E(\vec{p}) = \sum_{u \in V \setminus \{v\}} \text{Area}(B(v, \vec{p}) \cap B(u)) + \lambda \|\vec{p} - \vec{p}_{\text{preferred}}\|^2$$

---

## 9. Cross-Tab Linearizability & Event Sourcing Algebra

When synchronized across multiple browser tabs, state transitions maintain causal consistency:

* **Monotonic Logical Clock**:
  * Every broadcasted state mutation envelope carries a monotonically increasing sequence counter $\lambda \in \mathbb{N}$. An incoming remote event $e$ is accepted if and only if $\lambda(e) > \lambda_{\text{local}}$, preventing out-of-order race conditions.
* **Idempotent State Envelope Deduplication**:
  * Storage and channel broadcasts are stamped with unique causal transaction IDs. Duplicate envelopes received via overlapping broadcast channels are dropped in $O(1)$ time prior to store state ingestion.
* **Schema Validation & Prototype Immunity**:
  * External JSON payloads pass through an explicit validation filter:
    $$\sigma: \text{RawJson} \to \text{ValidEnvelope} \cup \{\bot\}$$
    rejecting non-conforming structures and blocking prototype pollution attacks (`__proto__`, `constructor`).

---

## 10. History Algebra & State Replay Invariants

Undo and Redo capabilities operate under formal state journal algebra:

* **Bounded Ring Buffer Journal**:
  * State evolution history is captured within a bounded journal $\mathcal{H}_K$ of fixed capacity $K$, guaranteeing $O(1)$ snapshot insertion and zero unbounded memory growth.
* **Replay Invertibility Invariant**:
  * For any reversible transition $a \in \mathcal{A}_{\text{reversible}}$, there exists an inverse transition $a^{-1} \in \mathcal{A}$ such that:
    $$\delta(\delta(\mathcal{S}, a), a^{-1}) = \mathcal{S}$$
* **Deterministic Replay Function $\rho$**:
  * Applying historical state journals satisfies the homomorphism:
    $$\rho(\mathcal{S}_0, [a_1, a_2, \dots, a_n]) = \delta^*(\mathcal{S}_0, [a_1, a_2, \dots, a_n])$$

---

## 11. Transaction Isolation & Batching Serializability

Multi-action batch transactions execute under strict atomicity and serializability guarantees:

* **Atomic Batch Transition**:
  * A batch transaction $\mathcal{B} = [a_1, a_2, \dots, a_m]$ is executed as a compound atomic transition:
    $$\delta_{\text{batch}}(\mathcal{S}, \mathcal{B}) = \delta^*(\mathcal{S}, \mathcal{B})$$
    producing a single consolidated state revision increment and unified effect dispatch.
* **Transaction Rollback Protection**:
  * If an invariant validation fails during batch execution, the entire transaction aborts, restoring the state to the pre-transaction snapshot $\mathcal{S}_{\text{pre}}$ with zero side-effect execution.

---

## 12. Modularity, Granularity & Code Hygiene

Maintainability is sustained through strict structural constraints and clean code principles:

* **Single Responsibility & Cohesion Principle (SRP)**:
  * Module boundaries must align with conceptual cohesion and distinct domain responsibilities rather than arbitrary line quotas. Code that changes together, shares private invariants, or implements a cohesive algorithm belongs in the same module.
* **Single Level of Abstraction Principle (SLAP)**:
  * Every function must operate at a consistent level of conceptual abstraction. High-level domain workflows must not be interleaved with low-level bitwise operations, DOM traversals, or raw string concatenations.
* **Rational File Sizing Discipline**:
  * **No Artificial Lower Bound**: Focused micro-modules (e.g. branded type definitions, isolated type guards, pure geometric vector utilities) of 20–60 lines are encouraged whenever they represent a single complete abstraction. Never pad code or comments artificially to meet an arbitrary minimum line count.
  * **Target Range**: Most focused production modules naturally reside within **80 to 250 lines of code (LOC)**.
  * **Soft Upper Threshold (250–300 LOC)**: Modules exceeding 250 LOC should be actively evaluated for extraction opportunities (e.g., separating internal helper algorithms, extracting sub-reducers, or isolating type definitions).
  * **Hard Ceiling (350–400 LOC)**: Files should not exceed 350 LOC unless they represent mathematically irreducible algorithms (such as QuadTree spatial partitioning or complex affine geometric collision solvers) or consolidated type registries where fragmentation would degrade type inference and cohesion.
* **Function Sizing & Complexity Discipline**:
  * Functions must be scoped to a single responsibility and remain within 20 to 40 lines of code in standard flows. Complex state transitions, exhaustive pattern matches, or mathematical steps are permitted up to 50 lines when splitting would harm algorithmic clarity.
* **Continuous Refactoring (Boy Scout Rule)**:
  * Every modification must leave the touched module cleaner than before. Dead comments, unused imports, obsolete compatibility shims, and unchecked type assertions must be eliminated on sight.

---

## 13. Lifecycle Management & Resource Disposal (RAII)

Every stateful subsystem that allocates browser resources, schedules timers, opens channels, or binds DOM listeners must implement Resource Acquisition Is Initialization (RAII) patterns.

* **Explicit Disposal Contracts**:
  * Stateful entities must provide standard disposal methods compatible with modern explicit resource management standards (`[Symbol.dispose]`).
* **Disposal Idempotency**:
  * Invoking teardown methods multiple times must be strictly safe and result in a no-op without raising errors or scheduling duplicate cleanup routines.
* **Post-Disposal Terminal State ($\Omega$)**:
  * Once disposed, an entity enters an unalterable terminal state $\Omega$, rejecting all subsequent registrations, subscriptions, or mutation dispatches:
    $$\forall a \in \mathcal{A}, \quad \delta(\Omega, a) = \Omega$$
* **Deterministic Teardown Ordering**:
  * Teardown routines must execute in reverse order of initialization (bottom-up), ensuring dependent channels and timers terminate before parent containers are dismantled:
    $$\text{Teardown}(N) = \left(\bigcup_{c \in \text{Children}(N)} \text{Teardown}(c)\right) \cup \text{Destroy}(N)$$

---

## 14. Defensive Programming & Blast-Radius Containment

The runtime must maintain stability regardless of invalid external inputs, runtime exceptions, or consumer integration errors.

* **Consumer Blast-Radius Isolation**:
  * All external callbacks, custom middleware, and event handlers must execute inside fault-isolated execution barriers. An unhandled exception within a consumer handler must never corrupt internal state machines, break batching transactions, or halt event propagation to sibling listeners.
* **Structured Diagnostic Channels**:
  * Direct browser console calls (`console.log`, `console.warn`, `console.error`) are prohibited across library modules. All diagnostics must route through a centralized logger equipped with environment guards to ensure complete removal from production bundles.
* **Fail-Fast Configuration Validation**:
  * Store initialization options and geometry parameters must be validated at instantiation boundaries, rejecting invalid configurations before state allocation.

---

## 15. Performance, Zero Garbage Collection Churn & Complexity Bounds

Hot execution paths must eliminate runtime heap allocations to prevent frame drops, micro-stutters, and garbage collection pauses.

* **Hot-Path Allocation Discipline**:
  * High-frequency interaction paths—including pointer drag handlers, animation frame synchronization routines, and state selector evaluations—must not create intermediate arrays, closures, or temporary collection objects:
    $$\text{Alloc}(\text{Frame}) = 0 \text{ bytes}$$
* **Asymptotic Complexity Guarantees**:
  * State Transition Reducers: $O(1)$ to $O(V)$ bounded time.
  * Key-Scoped Event Dispatch: $O(1)$ hash-map dispatch.
  * Topmost Entry Selection: $O(Z)$ single-pass scan ($Z = |\text{zIndexOrder}|$).
  * Subtree Reachability Pruning: $O(|V_{\text{sub}}| + |E_{\text{sub}}|)$.
* **Immutable Constant Sharing**:
  * Empty collections, default coordinate offsets, and initial configuration dictionaries must reuse frozen, static singleton instances (`EMPTY_OBJECT`, `EMPTY_ARRAY`, `EMPTY_SET`, `ZERO_OFFSET`).
* **Shallow Value Object Comparators**:
  * Equivalence evaluations for composite structures (such as coordinate pairs and configuration subsets) must employ specialized shallow value comparators rather than expensive deep recursive traversals.
* **Monomorphic Optimization**:
  * Core domain objects (such as trail entries and coordinate vectors) must maintain consistent property shapes to optimize engine inline caches (IC).

---

## 16. Type System Rigor & Domain Modeling

The type system must enforce runtime correctness at compile time.

* **Making Invalid States Unrepresentable**:
  * States and payloads must be modeled using discriminated unions where mutually exclusive scenarios cannot coexist within the same type structure:
    $$\mathcal{S} = \mathcal{S}_{\text{idle}} \uplus \mathcal{S}_{\text{loading}} \uplus \mathcal{S}_{\text{success}} \uplus \mathcal{S}_{\text{error}}$$
* **Zero Type Escapes**:
  * Unchecked type assertions (`any`, dual type assertions) are prohibited. All type narrowing must rely on custom type guards and exhaustive control flow analysis.
* **Domain Identity Tagging**:
  * Nominal/branded type definitions must be employed for domain keys (`PopoverKey`) to prevent primitive obsession and cross-domain key leakage.
* **Total Functions**:
  * Core domain functions must be total, handling 100% of possible inputs within their declared domain types without unhandled branching.
* **Strict Compiler Enforcement**:
  * The codebase operates under uncompromising compiler configurations, mandating explicit typing, strict null safety, and exact optional property contracts.

---

## 17. Headless UI & Accessible Compound Component Design

Presentation components must deliver complete accessible interactions while remaining fully headless and style-agnostic.

* **Split Context Architecture**:
  * Context providers must separate static component metadata (identifiers, action facades, element references) from high-frequency dynamic states (drag coordinates, animation progress) to prevent re-render cascades in deeply nested component trees.
* **Polymorphic Slot Composition**:
  * Compound components must support headless composition (slot / `asChild` patterns), enabling consumers to attach accessibility attributes and event handlers to arbitrary DOM nodes without wrapping `div` boilerplate.
* **Focus Restoration Fiber Bundles**:
  * The focus restoration stack maintains a fiber mapping $\pi: V \to \text{DOMNodes}$ that projects focus back to the exact initiating trigger element upon card teardown, preserving keyboard flow.
* **WCAG 2.1 AA/AAA Accessibility Parity**:
  * Keyboard navigation, focus traps, focus restoration stacks, and ARIA state relationships (`aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-live`) must remain perfectly synchronized with headless state machine transitions.

---

## 18. Formal System Invariant Matrix

The state machine guarantees that the following formal invariant predicates $\mathcal{I}_1 \dots \mathcal{I}_{12}$ hold unconditionally for all reachable states $\forall \mathcal{S} \in \text{Reachable}(\mathcal{S}_0)$:

1. **$\mathcal{I}_{\text{Acyclic}}$**: $\text{Cycles}(G(\mathcal{S})) = \emptyset$ (Strict cycle freedom in the cascade graph).
2. **$\mathcal{I}_{\text{ZBijection}}$**: Visual stacking order is a bijective projection of active cards.
3. **$\mathcal{I}_{\text{StackUniqueness}}$**: $\forall i \neq j, \text{zIndexOrder}[i] \neq \text{zIndexOrder}[j]$ (Zero duplicate keys in stacking orders).
4. **$\mathcal{I}_{\text{TimerContainment}}$**: $|\text{ActiveTimers}(\mathcal{S})| \le |V(\mathcal{S})| \times K_{\max}$ (Zero unbounded timer growth).
5. **$\mathcal{I}_{\text{FiniteFloat}}$**: $\forall v \in V(\mathcal{S}), \text{isFinite}(\text{pos}_x(v)) \land \text{isFinite}(\text{pos}_y(v))$ (Zero `NaN`/$\pm\infty$ coordinates).
6. **$\mathcal{I}_{\text{OrphanFreedom}}$**: $\forall v \in V_{\text{trail}}(\mathcal{S}), \exists \text{ path } \text{Root} \rightsquigarrow v$ in $G(\mathcal{S})$ (Zero orphan popovers).
7. **$\mathcal{I}_{\text{MonotonicRevision}}$**: $\mathcal{S}_{t+1} \not\equiv \mathcal{S}_t \iff \text{Revision}_{t+1} > \text{Revision}_t$.
8. **$\mathcal{I}_{\text{Discrimination}}$**: Every active entry possesses mutually exclusive status attributes.
9. **$\mathcal{I}_{\text{Terminality}}$**: $\mathcal{S} = \Omega \implies \forall a \in \mathcal{A}, \delta(\Omega, a) = \Omega$ (Disposal permanence).
10. **$\mathcal{I}_{\text{CausalLinearity}}$**: Broadcast events with $\lambda_{\text{remote}} \le \lambda_{\text{local}}$ are safely discarded.
11. **$\mathcal{I}_{\text{ViewportContainment}}$**: $\forall v \in V(\mathcal{S}), B(v) \cap \Omega_{\text{viewport}} = B(v)$ (Guaranteed reachability).
12. **$\mathcal{I}_{\text{ZeroGC}}$**: $\text{Alloc}(\text{Frame}) = 0 \text{ bytes}$ (Zero heap churn in interaction loops).

---

## 19. Linear Temporal Logic (LTL) Lifecycle Guarantees

The execution trace of the state machine satisfies the following formal LTL specifications:

* **Safety Invariant**: Always cycle-free and leak-free:
  $$\Box (\text{Active}(G) \models \mathcal{I}_{\text{Acyclic}} \land \mathcal{I}_{\text{FiniteFloat}})$$
* **Liveness Guarantee**: Any card closure request eventually terminates:
  $$\Box (\text{CloseRequested}(v) \implies \Diamond \text{Unmounted}(v))$$
* **Focus Flow Guarantee**: Deactivation eventually restores focus to the originating trigger:
  $$\Box (\text{Unmounted}(v) \implies \Diamond \text{FocusRestored}(\pi(v)))$$
* **Timer Quiescence**: Post-unmounting guarantees complete absence of active timers:
  $$\Box (\text{Unmounted}(v) \implies \Box \neg \text{ActiveTimers}(v))$$

---

## 20. Presheaf Memoization & Support-Isolated Selector Calculus

Selectors operate as stable mathematical sections over quotient state spaces:

* **Support-Disjoint Invariance**:
  * Let $\text{Supp}(\mathcal{Q}) \subset \text{Domain}(\mathcal{S})$ be the support domain of selector $\mathcal{Q}$. For any atomic state patch $\Delta$, if:
    $$\text{Supp}(\mathcal{Q}) \cap \text{Domain}(\Delta) = \emptyset \implies \mathcal{Q}(\mathcal{S} \oplus \Delta) \equiv \mathcal{Q}(\mathcal{S})$$
    the selector retains strict reference identity, preventing downstream reactive computations.
* **Idempotent Functorial Composition**:
  * Composing selectors $\mathcal{Q}_A \circ \mathcal{Q}_B$ satisfies contravariant associativity and creates zero intermediate collection allocations during projection.

---

## 21. Algebraic Topology of Focus Traversal Spaces

Focus boundaries operate as bounded 1-complexes with exact homological cycles:

* **Tab Cycle Homology**:
  * Focus traversal within an active modal card $v$ forms a path-connected discrete 1-complex $K(v)$. Tab navigation generates a closed 1-cycle $\gamma \in Z_1(K(v))$ with boundary divergence $\partial \gamma = 0$, guaranteeing that keyboard focus cannot escape the card container.
* **Exact Sequence of Focus Restoration**:
  * Deactivation and unmounting form an exact algebraic sequence:
    $$0 \longrightarrow \text{Trigger}(u) \xrightarrow{\iota} \text{ActiveCard}(v) \xrightarrow{\pi} \text{Trigger}(u) \longrightarrow 0$$
    ensuring that upon unmounting $v$, the projection $\pi$ is an exact retraction back to the originating trigger element without focus loss to `document.body`.

---

## 22. Verification Pipeline & Quality Gates

Every code modification must pass an exhaustive verification battery before merging:

* **Static Type Integrity**: 100% type check pass with zero compiler warnings or errors under maximum strictness.
* **Deterministic Unit Testing**: Core logic, state transitions, and topological graph operations must be validated through deterministic, synchronous unit tests requiring zero platform mocks.
* **Property-Based Verification**: Mathematical invariants, topological closures, and record filters must be verified using generative property-based testing across randomized input spaces:
  $$\forall \vec{a} \in \mathcal{A}^*, \quad \text{Invariants}(\delta^*(\mathcal{S}_0, \vec{a})) = \text{true}$$
* **Architectural Boundaries**: Automated dependency structure analysis must confirm zero layer violations, zero backward imports, and zero circular dependencies.
* **Payload Budgets**: Output bundle sizes must comply with strict gzip thresholds, accompanied by continuous dead-code elimination verification.
* **API Stability**: Public contracts must remain backward-compatible across minor iterations, with deprecation pathways clearly designated ahead of major milestones.
