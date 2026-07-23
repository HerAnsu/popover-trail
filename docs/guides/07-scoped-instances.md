# Guide 7: Isolated Scoped Instances

If your application requires multiple independent popover systems operating simultaneously (e.g. Main Workspace vs Sidebar Inspector vs Header Navigation), use `createPopoverTrail` to create isolated, pre-typed scopes.

---

## 1. Why Use Scoped Instances?

* **Type Safety**: Enforces strict union types for popover keys, resolved data payloads, and context objects.
* **State Isolation**: Popover operations in one scope do not affect or close popovers in another scope.
* **Zero Boilerplate**: Avoids repeatedly passing generic arguments (`usePopover<MyData, MyContext>('key')`).

---

## 2. Defining a Scoped Instance

Call `createPopoverTrail` with your TypeScript schema:

```ts
import { createPopoverTrail } from 'popover-trail';

// 1. Define Data Schema
export interface DocumentNode {
  id: string;
  title: string;
  author: string;
}

// 2. Define Context Schema
export interface WorkspaceContext {
  theme: 'light' | 'dark';
  readOnly: boolean;
}

// 3. Define Valid Keys Union
export type DocumentPopoverKeys =
  | 'doc-info'
  | 'doc-permissions'
  | 'doc-history';

// 4. Create Scoped Instance Factory
export const DocumentTrail = createPopoverTrail<DocumentNode, WorkspaceContext, DocumentPopoverKeys>();
```

---

## 3. Integrating Scoped Components

`DocumentTrail` exports pre-typed versions of `PopoverProvider`, `PopoverTrigger`, `PopoverPortal`, and hooks:

```tsx
import { PopoverCard, type TrailEntry } from 'popover-trail';
import { DocumentTrail, type DocumentNode } from './documentScope';

// Resolver bound to DocumentNode schema
const resolveDocData = async (key: string): Promise<DocumentNode> => {
  const res = await fetch(`/api/docs/${key}`);
  return res.json();
};

export function DocumentWorkspace() {
  return (
    <DocumentTrail.PopoverProvider
      resolveData={resolveDocData}
      context={{ theme: 'dark', readOnly: false }}
    >
      <div className="document-toolbar">
        {/* DocumentTrail.PopoverTrigger strictly validates popoverKey */}
        <DocumentTrail.PopoverTrigger popoverKey="doc-info" placement="bottom-start">
          <button>Document Info</button>
        </DocumentTrail.PopoverTrigger>
      </div>

      <DocumentTrail.PopoverPortal>
        {(entries) =>
          entries.map((entry, index) => (
            <DocumentCard key={entry.key} entry={entry as TrailEntry<DocumentNode>} index={index} isPinned={entry.isPinned} />
          ))
        }
      </DocumentTrail.PopoverPortal>
    </DocumentTrail.PopoverProvider>
  );
}

function DocumentCard({ entry, index, isPinned }: { entry: TrailEntry<DocumentNode>; index: number; isPinned: boolean }) {
  // DocumentTrail.usePopover is pre-typed to DocumentNode
  const { data } = DocumentTrail.usePopover(entry.key as any);

  return (
    <PopoverCard entry={entry} index={index} isPinned={isPinned} className="doc-card">
      <PopoverCard.Handle className="card-header">
        <span>{data?.title}</span>
        <PopoverCard.PinButton />
        <PopoverCard.CloseButton />
      </PopoverCard.Handle>
      <PopoverCard.Content>
        <p>Author: {data?.author}</p>
      </PopoverCard.Content>
    </PopoverCard>
  );
}
```

---

## 4. Scoped Subsystems Architecture

Scoped instances isolate popover state across different UI regions:
* **Schema Enforcement**: `createPopoverTrail<TData, TContext, TPopoverKey>()` locks down component props and hook return types to exact schemas.
* **Independent Stores**: Each `PopoverProvider` created from a factory maintains its own store instance, so closing popovers in one zone never affects another.
* **Reusable Exports**: Export named scopes (e.g. `DocumentTrail`, `SidebarTrail`) for clean team adoption across large codebases.
