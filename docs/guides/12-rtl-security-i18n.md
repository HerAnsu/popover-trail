# Guide 12: RTL Layouts, Security & Internationalization

Guide for Right-to-Left (RTL) layout support, Content Security Policy (CSP) compliance, and XSS prevention.

---

## 1. Right-to-Left (RTL) Language Support

Popover Trail automatically integrates with Floating UI layout mirroring for Right-to-Left (RTL) writing systems (such as Arabic, Hebrew, and Persian).

### Automatic RTL Detection

When `document.dir === 'rtl'` or an ancestor container has `dir="rtl"`, placement alignment automatically mirrors horizontal directions:

```tsx
export function RTLApp() {
  return (
    <div dir="rtl" className="rtl-container">
      <PopoverProvider>
        {/* Placement 'right-start' automatically flips to 'left-start' in RTL mode */}
        <PopoverTrigger popoverKey="arabic-node" placement="right-start">
          <button>افتح البطاقة</button>
        </PopoverTrigger>
      </PopoverProvider>
    </div>
  );
}
```

### Manual Placement Mirroring

To force explicit placement direction overrides regardless of DOM `dir` settings, pass `cascadeDirection`:

```tsx
<PopoverProvider cascadeDirection="left">
  <App />
</PopoverProvider>
```

---

## 2. Security & XSS Prevention

When rendering dynamic data returned by `resolveData` (especially user-generated content or remote markdown/HTML):

### Sanitizing Dynamic HTML Content

Never pass raw unsanitized HTML strings directly into `dangerouslySetInnerHTML` inside popover card components:

```tsx
import DOMPurify from 'dompurify';
import { isResolvedEntry, type TrailEntry } from 'popover-trail';

export function SafeCardBody({ entry }: { entry: TrailEntry<{ rawHtml: string }> }) {
  if (!isResolvedEntry(entry)) return null;

  // ✅ Always sanitize raw HTML payloads before rendering
  const cleanHtml = DOMPurify.sanitize(entry.data.rawHtml);

  return (
    <div
      className="card-safe-content"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
```

### Content Security Policy (CSP) Directives

Popover Trail does not execute inline script tags (`<script>`) or use `eval()`. For strict CSP headers:

```http
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self';
```

*(Note: `style-src 'unsafe-inline'` is required for dynamic inline `transform` and `z-index` coordinate styles applied during dragging).*
