export function markPerformance(name: string): void {
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
    try {
      performance.mark(name);
    } catch {
      // Ignore performance mark errors in restricted environments
    }
  }
}

export function measurePerformance(name: string, startMark: string, endMark?: string): void {
  if (typeof performance !== 'undefined' && typeof performance.measure === 'function') {
    try {
      performance.measure(name, startMark, endMark);
      if (typeof performance.clearMarks === 'function') {
        performance.clearMarks(startMark);
        if (endMark) {
          performance.clearMarks(endMark);
        }
      }
    } catch {
      // Ignore performance measure errors
    }
  }
}
