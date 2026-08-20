import { wrapResult } from '../utils/result';

export function markPerformance(name: string): void {
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
    wrapResult(() => performance.mark(name));
  }
}

export function measurePerformance(name: string, startMark: string, endMark?: string): void {
  if (typeof performance !== 'undefined' && typeof performance.measure === 'function') {
    wrapResult(() => {
      performance.measure(name, startMark, endMark);
      if (typeof performance.clearMarks === 'function') {
        performance.clearMarks(startMark);
        if (endMark) {
          performance.clearMarks(endMark);
        }
      }
    });
  }
}
