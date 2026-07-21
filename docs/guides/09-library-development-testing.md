# Guide 9: Library Development, Testing & Tools

Guide for developers contributing to or testing the `popover-trail` library codebase.

---

## 1. Development Scripts & Tooling

The library uses a modern, ultra-fast toolchain:

* **Tsup**: Fast TypeScript library bundler generating ESM, CJS, and `.d.ts` declaration files.
* **Vitest**: Unit testing framework for store logic, hooks, and React components.
* **Oxlint**: High-performance Rust-based linter.
* **Oxfmt**: High-performance Rust-based code formatter.
* **Vite**: Development server for the example workspace application.

### Available npm Commands

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | Dev Server | Starts Vite dev server with example workspace app. |
| `npm run build:lib` | Library Build | Bundles library output into `dist/` (ESM, CJS, d.ts) via Tsup. |
| `npm run test` | Unit Tests | Executes the Vitest test suite (`src/lib/popover/store.test.ts`). |
| `npm run lint` | Code Quality | Runs Oxlint code quality checks across codebase. |
| `npm run format` | Code Format | Formats codebase using Oxfmt. |

---

## 2. Unit Testing Library Components with Vitest

When testing components that utilize `popover-trail`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PopoverProvider, PopoverTrigger, PopoverPortal, isResolvedEntry } from 'popover-trail';

describe('Popover Trail Integration', () => {
  it('opens popover card and resolves data on trigger click', async () => {
    const mockResolver = vi.fn().mockResolvedValue({ title: 'Test Payload' });

    render(
      <PopoverProvider resolveData={mockResolver}>
        <PopoverTrigger popoverKey="test-card-1">
          <button>Open Card</button>
        </PopoverTrigger>

        <PopoverPortal>
          {(entries) =>
            entries.map((entry) => (
              <div key={entry.key} data-testid="popover-card">
                {entry.isLoading && <span>Loading...</span>}
                {isResolvedEntry(entry) && <span>{entry.data.title}</span>}
              </div>
            ))
          }
        </PopoverPortal>
      </PopoverProvider>
    );

    // Click trigger
    fireEvent.click(screen.getByText('Open Card'));

    // Assert resolver execution
    expect(mockResolver).toHaveBeenCalledWith('test-card-1', undefined, undefined, expect.any(AbortSignal));

    // Assert resolved state UI render
    await waitFor(() => {
      expect(screen.getByText('Test Payload')).toBeInTheDocument();
    });
  });
});
```

---

## 3. Store Debugging & State Inspection

### Accessing Direct Store State

Use `usePopoverStoreApi().getState()` or `usePopoverStore()` to inspect `trail` and `floating` arrays during development:

```tsx
import { usePopoverStore } from 'popover-trail';

export function PopoverDebugInspector() {
  const trail = usePopoverStore((state) => state.trail);
  const floating = usePopoverStore((state) => state.floating);

  return (
    <div className="popover-debug-box">
      <h4>Active Trail Path ({trail.length})</h4>
      <ul>
        {trail.map((e) => (
          <li key={e.key}>
            {e.key} (parent: {e.parentKey || 'root'})
          </li>
        ))}
      </ul>

      <h4>Floating Pinned Windows ({floating.length})</h4>
      <ul>
        {floating.map((e) => (
          <li key={e.key}>{e.key}</li>
        ))}
      </ul>
    </div>
  );
}
```
