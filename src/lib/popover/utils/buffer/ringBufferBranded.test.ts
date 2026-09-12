import { describe, it, expect } from 'vitest';
import {
  toLogicalIndex,
  isLogicalIndex,
  toPhysicalIndex,
  isPhysicalIndex,
  toBufferRevision,
  isBufferRevision,
  toBufferCapacity,
  isBufferCapacity,
} from './bufferBranded';

describe('RingBuffer Nominal Branded Types', () => {
  describe('BufferLogicalIndex', () => {
    it('creates branded logical indices via toLogicalIndex', () => {
      const idx = toLogicalIndex(5.8);
      expect(idx).toBe(5);
      expect(isLogicalIndex(idx)).toBe(true);
    });

    it('validates logical indices via isLogicalIndex', () => {
      expect(isLogicalIndex(0)).toBe(true);
      expect(isLogicalIndex(10)).toBe(true);
      expect(isLogicalIndex(-1)).toBe(false);
      expect(isLogicalIndex(3.14)).toBe(false);
      expect(isLogicalIndex('5')).toBe(false);
      expect(isLogicalIndex(null)).toBe(false);
      expect(isLogicalIndex(undefined)).toBe(false);
      expect(isLogicalIndex(Number.NaN)).toBe(false);
    });
  });

  describe('BufferPhysicalIndex', () => {
    it('creates branded physical indices via toPhysicalIndex', () => {
      const pIdx = toPhysicalIndex(3.9);
      expect(pIdx).toBe(3);
      expect(isPhysicalIndex(pIdx)).toBe(true);
    });

    it('validates physical indices via isPhysicalIndex', () => {
      expect(isPhysicalIndex(0)).toBe(true);
      expect(isPhysicalIndex(4)).toBe(true);
      expect(isPhysicalIndex(-2)).toBe(false);
      expect(isPhysicalIndex(2.5)).toBe(false);
      expect(isPhysicalIndex('4')).toBe(false);
      expect(isPhysicalIndex({})).toBe(false);
    });
  });

  describe('BufferRevision', () => {
    it('creates clamped non-negative branded revisions via toBufferRevision', () => {
      expect(toBufferRevision(0)).toBe(0);
      expect(toBufferRevision(12.7)).toBe(12);
      expect(toBufferRevision(-5)).toBe(0);
    });

    it('validates revisions via isBufferRevision', () => {
      expect(isBufferRevision(0)).toBe(true);
      expect(isBufferRevision(42)).toBe(true);
      expect(isBufferRevision(-1)).toBe(false);
      expect(isBufferRevision(1.5)).toBe(false);
      expect(isBufferRevision('10')).toBe(false);
      expect(isBufferRevision(null)).toBe(false);
    });
  });

  describe('BufferCapacity', () => {
    it('creates clamped positive branded capacity via toBufferCapacity', () => {
      expect(toBufferCapacity(8.9)).toBe(8);
      expect(toBufferCapacity(0)).toBe(1);
      expect(toBufferCapacity(-5)).toBe(1);
    });

    it('validates positive integer capacity via isBufferCapacity', () => {
      expect(isBufferCapacity(1)).toBe(true);
      expect(isBufferCapacity(16)).toBe(true);
      expect(isBufferCapacity(0)).toBe(false);
      expect(isBufferCapacity(-1)).toBe(false);
      expect(isBufferCapacity(4.5)).toBe(false);
      expect(isBufferCapacity('16')).toBe(false);
    });
  });
});
