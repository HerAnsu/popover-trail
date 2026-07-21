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
          entries.map((entry) => (
            <DocumentCard key={entry.key} entry={entry} />
          ))
        }
      </DocumentTrail.PopoverPortal>
    </DocumentTrail.PopoverProvider>
  );
}

function DocumentCard({ entry }: { entry: any }) {
  // DocumentTrail.usePopover is pre-typed
  const { data, close } = DocumentTrail.usePopover(entry.key);

  return (
    <div className="doc-card">
      <h4>{data?.title}</h4>
      <p>Author: {data?.author}</p>
      <button onClick={close}>Close</button>
    </div>
  );
}
```
