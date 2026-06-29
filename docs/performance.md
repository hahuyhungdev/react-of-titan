# 🚄 Performance

## Code Splitting

Use route-level code splitting with React.lazy:

```tsx
const DashboardPage = lazy(() => import("@/pages/dashboard"));
```

Vite handles chunk splitting automatically at build time. Avoid excessive splitting — balance between initial load and request count.

## Loading Strategy

- **Eager** — critical above-the-fold content
- **Lazy** — below-the-fold routes, heavy components
- **Prefetch** — likely next routes when user hovers on links

## Image Optimization

- Explicit `width` and `height` on all images
- `loading="lazy"` for below-the-fold images
- Use modern formats (AVIF, WebP) with fallbacks
- Never ship source images far beyond rendered size

## Animation Performance

Animate compositor-friendly properties only:

- `transform`
- `opacity`
- `clip-path`

Avoid animating layout-bound properties (`width`, `height`, `margin`, `padding`).

## Bundle Budget

| Page Type | JS Budget (gzipped) |
| --------- | ------------------- |
| Landing   | < 150kb             |
| App page  | < 300kb             |

## AI Assistance

When using AI assistants, ask for a focused performance review before major releases or after adding heavy dependencies.
