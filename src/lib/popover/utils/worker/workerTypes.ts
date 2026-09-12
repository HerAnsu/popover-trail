/**
 * Web Worker Resolver Type Contracts and Message Envelopes.
 * Clean Architecture Layer 1: Core Kernel Types.
 *
 * @module utils/worker/workerTypes
 */

import type { PopoverResolver } from '../../types';
import type { DISPOSE_SYMBOL } from '../disposable';

/**
 * Configuration options for background Web Worker resolvers.
 */
export interface WorkerResolverOptions<TData = unknown> {
  /** Execution timeout in milliseconds before aborting the worker task. */
  timeoutMs?: number;
  /** Function returning Transferable objects to transfer by reference rather than cloning. */
  transferables?: (data: TData) => Transferable[];
  /** Callback triggered when the worker encounters an unhandled runtime error. */
  onWorkerError?: (error: Error) => void;
  /** Whether to automatically restart the Web Worker if an error or crash occurs. */
  autoRestart?: boolean;
  /** Whether shared array buffer memory is utilized for message transfer. */
  useSharedMemory?: boolean;
}

/**
 * Disposable and termination contracts for background worker resolvers.
 */
export interface WorkerResolverDisposables {
  /** Explicitly terminates the active Web Worker instance. */
  terminate(): void;
  /** Alias for terminate to satisfy generic lifecycle contracts. */
  destroy(): void;
  /** Implements standard disposable interface. */
  dispose(): void;
  /** Implements explicit resource management symbol disposal. */
  readonly [DISPOSE_SYMBOL]: () => void;
}

/**
 * Fully typed PopoverResolver backed by a Web Worker instance with explicit disposal.
 */
export type WorkerResolver<TData = unknown, TContext = unknown> = PopoverResolver<
  TData,
  TContext
> &
  WorkerResolverDisposables;


export interface WorkerTaskResolveMessage<TContext = unknown, TPopoverKey extends string = string> {
  readonly action?: 'resolve';
  readonly id: number;
  readonly key?: TPopoverKey;
  readonly parentData?: unknown;
  readonly context?: TContext;
}

export interface WorkerTaskAbortMessage {
  readonly action: 'abort';
  readonly id: number;
  readonly key?: string;
}

export type WorkerTaskMessage<TContext = unknown, TPopoverKey extends string = string> =
  | WorkerTaskResolveMessage<TContext, TPopoverKey>
  | WorkerTaskAbortMessage;

export type WorkerResponseMessage<TData = unknown> =
  | {
      readonly id: number;
      readonly success: true;
      readonly data: TData;
      readonly error?: never;
    }
  | {
      readonly id: number;
      readonly success: false;
      readonly data?: never;
      readonly error?: string;
    };
