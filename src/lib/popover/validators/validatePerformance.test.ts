import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { markPerformance, measurePerformance } from './validatePerformance';

describe('validatePerformance', () => {
  let markSpy: ReturnType<typeof vi.spyOn>;
  let measureSpy: ReturnType<typeof vi.spyOn>;
  let clearMarksSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    markSpy = vi.spyOn(performance, 'mark').mockImplementation(() => ({} as PerformanceMark));
    measureSpy = vi.spyOn(performance, 'measure').mockImplementation(() => ({} as PerformanceMeasure));
    clearMarksSpy = vi.spyOn(performance, 'clearMarks').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delegates to performance.mark with mark name', () => {
    markPerformance('popover-open-start');
    expect(markSpy).toHaveBeenCalledWith('popover-open-start');
  });

  it('handles errors inside markPerformance gracefully', () => {
    markSpy.mockImplementation(() => {
      throw new Error('Mark creation failed');
    });

    expect(() => markPerformance('failing-mark')).not.toThrow();
  });

  it('measures duration and clears start mark when endMark is omitted', () => {
    measurePerformance('popover-transition', 'start-mark');
    expect(measureSpy).toHaveBeenCalledWith('popover-transition', 'start-mark', undefined);
    expect(clearMarksSpy).toHaveBeenCalledWith('start-mark');
    expect(clearMarksSpy).toHaveBeenCalledTimes(1);
  });

  it('measures duration and clears both start and end marks when provided', () => {
    measurePerformance('popover-transition', 'start-mark', 'end-mark');
    expect(measureSpy).toHaveBeenCalledWith('popover-transition', 'start-mark', 'end-mark');
    expect(clearMarksSpy).toHaveBeenCalledWith('start-mark');
    expect(clearMarksSpy).toHaveBeenCalledWith('end-mark');
    expect(clearMarksSpy).toHaveBeenCalledTimes(2);
  });

  it('handles measure errors gracefully without uncaught exceptions', () => {
    measureSpy.mockImplementation(() => {
      throw new Error('Invalid mark reference');
    });

    expect(() => {
      measurePerformance('error-measure', 'missing-start', 'missing-end');
    }).not.toThrow();
  });
});
