import { describe, it, expect } from 'vitest';
import { resolvePolymorphicProps, resolveContainerElement } from './componentUtils';

describe('componentUtils', () => {
  describe('resolvePolymorphicProps', () => {
    it('defaults to button element and adds type="button" attribute', () => {
      const { Component, buttonProps } = resolvePolymorphicProps();
      expect(Component).toBe('button');
      expect(buttonProps).toEqual({ type: 'button' });
    });

    it('preserves native button type="button" when "button" is explicitly passed', () => {
      const { Component, buttonProps } = resolvePolymorphicProps('button');
      expect(Component).toBe('button');
      expect(buttonProps).toEqual({ type: 'button' });
    });

    it('omits type="button" for non-button HTML elements', () => {
      const divProps = resolvePolymorphicProps('div');
      expect(divProps.Component).toBe('div');
      expect(divProps.buttonProps).toEqual({});

      const anchorProps = resolvePolymorphicProps('a');
      expect(anchorProps.Component).toBe('a');
      expect(anchorProps.buttonProps).toEqual({});
    });

    it('respects defaultElement parameter when as is undefined', () => {
      const { Component, buttonProps } = resolvePolymorphicProps(undefined, 'nav');
      expect(Component).toBe('nav');
      expect(buttonProps).toEqual({});
    });
  });

  describe('resolveContainerElement', () => {
    it('returns null when container is undefined or null', () => {
      expect(resolveContainerElement(undefined)).toBeNull();
      expect(resolveContainerElement(null)).toBeNull();
    });

    it('returns direct HTMLElement unchanged', () => {
      const el = { nodeType: 1 } as HTMLElement;
      expect(resolveContainerElement(el)).toBe(el);
    });

    it('invokes getter function and returns returned HTMLElement', () => {
      const el = { nodeType: 1 } as HTMLElement;
      const getter = () => el;
      expect(resolveContainerElement(getter)).toBe(el);
    });

    it('unwraps ref object containing current property', () => {
      const el = { nodeType: 1 } as HTMLElement;
      const ref = { current: el };
      expect(resolveContainerElement(ref)).toBe(el);
    });
  });
});
