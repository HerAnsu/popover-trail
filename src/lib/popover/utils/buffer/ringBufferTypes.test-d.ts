import { describe, it, expectTypeOf } from 'vitest';
import { RingBuffer } from './ringBufferCore';
import type { Result } from '../result';
import type { ReadonlyRingBuffer, RingBufferOptions, RingBufferMetrics } from './bufferTypes';
import type {
  BufferCapacity,
  BufferLogicalIndex,
  BufferPhysicalIndex,
  BufferRevision,
  BufferRelativeIndex,
} from './bufferBranded';
import type {
  BufferDomainError,
  InvalidCapacityError,
  BufferEmptyError,
  BufferOverflowError,
  IndexOutOfBoundsError,
} from './bufferErrors';

type Animal = { type: 'dog'; bark(): void } | { type: 'cat'; meow(): void };

describe('RingBuffer Type Soundness & Static Contracts', () => {
  it('conforms to ReadonlyRingBuffer interface and monadic return types', () => {
    const ring = new RingBuffer<number>(4);
    expectTypeOf(ring).toMatchTypeOf<ReadonlyRingBuffer<number>>();
    expectTypeOf(ring.peekResult()).toEqualTypeOf<Result<number, BufferEmptyError>>();
    expectTypeOf(ring.atResult(0)).toEqualTypeOf<Result<number, IndexOutOfBoundsError>>();
    expectTypeOf(ring.popResult()).toEqualTypeOf<Result<number, BufferEmptyError>>();
    expectTypeOf(ring.tryPush(1)).toEqualTypeOf<Result<void, BufferOverflowError>>();
  });

  it('preserves type narrowing with custom type guards in find', () => {
    const ring = new RingBuffer<Animal>(4);
    const isDog = (item: Animal, _idx: number): item is { type: 'dog'; bark(): void } => item.type === 'dog';
    expectTypeOf(ring.find(isDog)).toEqualTypeOf<{ type: 'dog'; bark(): void } | undefined>();
    expectTypeOf(ring.findLast(isDog)).toEqualTypeOf<{ type: 'dog'; bark(): void } | undefined>();
  });

  it('validates functional mapping and filtering return types', () => {
    const ring = new RingBuffer<number>(4);
    expectTypeOf(ring.map((x) => String(x))).toEqualTypeOf<RingBuffer<string>>();
    expectTypeOf(ring.filter((x) => x > 0)).toEqualTypeOf<RingBuffer<number>>();
    expectTypeOf(ring.flatMap((x) => [x, x * 2])).toEqualTypeOf<RingBuffer<number>>();
    const ro = ring.asReadonly();
    expectTypeOf(ro).toEqualTypeOf<ReadonlyRingBuffer<number>>();
    expectTypeOf(ro.toReadonlyArray()).toEqualTypeOf<readonly number[]>();
    expectTypeOf(ro.lastIndexOf(5)).toEqualTypeOf<BufferLogicalIndex | -1>();
  });

  it('enforces nominal branding distinction and logical index acceptance', () => {
    expectTypeOf<BufferLogicalIndex>().not.toEqualTypeOf<BufferPhysicalIndex>();
    expectTypeOf<BufferLogicalIndex>().toMatchTypeOf<BufferRelativeIndex>();
    const ring = new RingBuffer<number>(4);
    const idx = ring.findIndex((x) => x > 0);
    expectTypeOf(idx).toEqualTypeOf<BufferLogicalIndex | -1>();
    expectTypeOf(ring.revision).toEqualTypeOf<BufferRevision>();
    expectTypeOf(ring.capacity).toEqualTypeOf<BufferCapacity>();
    expectTypeOf(ring.keys()).toEqualTypeOf<IterableIterator<BufferLogicalIndex>>();
    expectTypeOf(ring.values()).toEqualTypeOf<IterableIterator<number>>();
    expectTypeOf(ring.entries()).toEqualTypeOf<IterableIterator<[BufferLogicalIndex, number]>>();
    expectTypeOf(ring.getMetrics()).toMatchTypeOf<RingBufferMetrics>();
  });

  it('validates domain error discriminated unions and configurations', () => {
    expectTypeOf<InvalidCapacityError>().toMatchTypeOf<BufferDomainError>();
    expectTypeOf<IndexOutOfBoundsError>().toMatchTypeOf<BufferDomainError>();
    const validConfig: RingBufferOptions<string> = { capacity: 10, autoExpand: true, maxCapacity: 100 };
    expectTypeOf(validConfig).toMatchTypeOf<RingBufferOptions<string>>();
  });
});
