# Guide 9: SSR, Testing & Debugging Strategies

Guide for SSR (Server-Side Rendering in Next.js / Remix), unit testing popovers with Vitest and React Testing Library, and debugging popover tree states.

---

## 1. Server-Side Rendering (SSR) & Next.js Nuances

In SSR environments (Next.js App Router, Remix, Gatsby), DOM elements like `document.body` or `window` do not exist on the server.

### Mounting Portals Safely in Client Components

Ensure components using `<PopoverPortal>` or Floating UI placement calculations are designated as Client Components (`'use client'` in Next.js) or wait for client hydration:

```tsx
'use client'; // Required in Next.js App Router

import { useState, useEffect } from 'react';
import { PopoverPortal } from 'popover-trail';

export function ClientPopoverPortal({ children }: { children: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch before client mount

  return <PopoverPortal>{children}</PopoverPortal>;
}
```

### Initial Hydration State (`initialState`)

Pass pre-rendered store state into `<PopoverProvider>` for SSR hydration:

```tsx
<PopoverProvider
  initialState={{
    maxDepth: 10,
    closePinnedDescendants: false,
  }}
>
  <App />
</PopoverProvider>
```

---

## 2. Unit & Integration Testing (Vitest / React Testing Library)

### Mocking Resolvers in Unit Tests

When testing popover triggers and cards with Vitest:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PopoverProvider, PopoverTrigger, PopoverPortal, isResolvedEntry } from 'popover-trail';

describe('Popover Trail Integration', () => {
  it('opens popover card and resolves data on click', async () => {
    const mockResolver = vi.fn().mockResolvedValue({ title: 'Test Resolved Data' });

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

    // 1. Click trigger
    fireEvent.click(screen.getByText('Open Card'));

    // 2. Expect resolver to be called
    expect(mockResolver).toHaveBeenCalledWith('test-card-1', undefined, undefined, expect.any(AbortSignal));

    // 3. Wait for resolved state
    await waitFor(() => {
      expect(screen.getByText('Test Resolved Data')).toBeInTheDocument();
    });
  });
});
```

---

## 3. Debugging Strategies & Inspection Tools

### Inspecting Raw Zustand Store State

Call `usePopoverStoreApi().getState()` or log state slices inside custom React DevTools inspect components:

```tsx
import { usePopoverStore } from 'popover-trail';

export function PopoverDebugPanel() {
  const trail = usePopoverStore((state) => state.trail);
  const floating = usePopoverStore((state) => state.floating);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="debug-panel" style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 9999, background: '#111', color: '#0f0', padding: 10, fontSize: 12 }}>
      <div>Active Trail Stack: {trail.map((e) => e.key).join(' -> ') || 'Empty'}</div>
      <div>Pinned Floating Array: {floating.map((e) => e.key).join(', ') || 'Empty'}</div>
    </div>
  );
}
```
