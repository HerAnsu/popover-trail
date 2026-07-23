# Guide 9: Library Development, Testing & Tools

Guide for developers contributing to or testing the `popover-trail` library codebase.

---

## 1. Development Scripts & Tooling

The library uses a modern, high-performance toolchain:

* **TypeScript 7**: Static type checker with strict declaration emit rules (`tsc --noEmit`, `tsc -p tsconfig.lib.json --emitDeclarationOnly`).
* **Tsup**: Fast TypeScript library bundler generating ESM and CJS bundles.
* **Vitest**: Unit testing framework (103 unit & integration tests across 16 test files).
* **Oxlint**: High-performance Rust-based static linter (0 warnings, 0 errors).
* **Oxfmt**: High-performance Rust-based code formatter.
* **GitHub Actions**: Continuous Integration pipeline (`.github/workflows/ci.yml`).

### Available npm Commands

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | Dev Server | Starts Vite dev server with example workspace app. |
| `npm run build:lib` | Library Build | Bundles ESM, CJS, and `.d.ts` outputs into `dist/` via Tsup and TS7 `tsc`. |
| `npm run test` | Unit Tests | Executes the 103 Vitest unit & integration tests. |
| `npm run typecheck` | Type Check | Validates TypeScript types across codebase without emitting files. |
| `npm run lint` | Code Quality | Runs Oxlint static code analyzer. |
| `npm run format` | Code Format | Formats codebase using Oxfmt. |

---

## 2. Unit Testing Library Components with Vitest

When testing components that utilize `popover-trail`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PopoverProvider, PopoverTrigger, PopoverTrail, PopoverCard, isResolvedEntry } from 'popover-trail';

describe('Popover Trail Integration', () => {
  it('opens popover card and resolves data on trigger click', async () => {
    const mockResolver = vi.fn().mockResolvedValue({ title: 'Test Payload' });

    render(
      <PopoverProvider resolveData={mockResolver}>
        <PopoverTrigger popoverKey="test-card-1">
          <button>Open Card</button>
        </PopoverTrigger>

        <PopoverTrail
          renderCard={(entry, index, isPinned) => (
            <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
              <PopoverCard.Content>
                {entry.isLoading && <span>Loading...</span>}
                {isResolvedEntry(entry) && <span>{entry.data.title}</span>}
              </PopoverCard.Content>
            </PopoverCard>
          )}
        />
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

---

## Summary Checklist

- [x] Run `npm run typecheck` to verify TypeScript 7 types before committing.
- [x] Run `npm test` to verify all 103 Vitest unit tests pass cleanly.
- [x] Run `npm run build:lib` to test distribution bundle generation.
