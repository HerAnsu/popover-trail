/**
 * Unified Store Architecture Subsystem Entrypoint for popover-trail.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * Re-exports the complete functional state machine, CQRS event buses,
 * transaction journals, asynchronous resolver pipelines, and contravariant selectors.
 *
 * @module store
 */

// Core Store Engine & Lifecycle Composition
export * from './core';
export * from './storeTypes';
export * from './constants';

// CQRS Buses, Event Bus & State Machine Automata
export * from './cqrs';
export * from './eventBus';
export * from './fsm';

// Actions, Slices & Atomic Transactions
export * from './actions';
export * from './slices';
export * from './transactions';
export * from './batching';

// Pure Functional Domain Reducers
export * from './reducers';

// State Inspection & Contravariant Selectors
export * from './selectors';

// Asynchronous Resolver Pipeline & Effect Runner
export * from './resolver';
export * from './effects';
export * from './controllers';

// Temporal Dynamics & Transition Schedulers
export * from './scheduler';

// History Journal, Cross-Tab Persistence & SSR Hydration
export * from './history';
export * from './persistence';
export * from './snapshot';
export * from './hydration';
export * from './middleware';
