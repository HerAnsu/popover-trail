import { describe, it, expect } from 'vitest';
import {
  kebabCase,
  camelCase,
  capitalize,
  ensurePrefix,
  ensureSuffix,
  truncate,
} from './stringUtils';

describe('stringUtils', () => {
  describe('kebabCase', () => {
    it('converts camelCase and PascalCase to kebab-case', () => {
      expect(kebabCase('transitionDurationMs')).toBe('transition-duration-ms');
      expect(kebabCase('PopoverCard')).toBe('popover-card');
      expect(kebabCase('borderRadiusPx')).toBe('border-radius-px');
      expect(kebabCase('is2DMatrix')).toBe('is2-d-matrix');
    });

    it('handles empty and single character strings', () => {
      expect(kebabCase('')).toBe('');
      expect(kebabCase('a')).toBe('a');
      expect(kebabCase('A')).toBe('a');
    });
  });

  describe('camelCase', () => {
    it('converts kebab-case and snake_case to camelCase', () => {
      expect(camelCase('transition-duration-ms')).toBe('transitionDurationMs');
      expect(camelCase('popover_card')).toBe('popoverCard');
      expect(camelCase('--custom-var')).toBe('customVar');
    });

    it('handles empty strings', () => {
      expect(camelCase('')).toBe('');
    });
  });

  describe('capitalize', () => {
    it('capitalizes the first character', () => {
      expect(capitalize('popover')).toBe('Popover');
      expect(capitalize('')).toBe('');
      expect(capitalize('A')).toBe('A');
    });
  });

  describe('ensurePrefix', () => {
    it('prepends prefix only if missing', () => {
      expect(ensurePrefix('pt-base-z-index', '--')).toBe('--pt-base-z-index');
      expect(ensurePrefix('--pt-base-z-index', '--')).toBe('--pt-base-z-index');
      expect(ensurePrefix('', '--')).toBe('--');
    });
  });

  describe('ensureSuffix', () => {
    it('appends suffix only if missing', () => {
      expect(ensureSuffix('10', 'px')).toBe('10px');
      expect(ensureSuffix('10px', 'px')).toBe('10px');
      expect(ensureSuffix('', 'px')).toBe('px');
    });
  });

  describe('truncate', () => {
    it('truncates strings exceeding maxLength', () => {
      expect(truncate('Hello world', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('Very long sentence', 5, '..')).toBe('Ver..');
    });

    it('handles edge cases with empty string or non-positive length', () => {
      expect(truncate('', 5)).toBe('');
      expect(truncate('test', 0)).toBe('');
      expect(truncate('test', -1)).toBe('');
    });
  });
});
