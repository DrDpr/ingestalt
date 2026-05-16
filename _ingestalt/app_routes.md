---
id: node_app_routes
configId: node_standards_frontend
title: Application Routes
type: frontend
icon: Layout
color: '#a855f7'
tags: [nextjs, routing, pages, app-router]
relations:
  - targetId: node_ui_canvas
    type: contains
    label: Canvas page
  - targetId: node_api_ingest
    type: uses
    label: Ingestion functionality
---

# Application Routes

## Purpose
Defines the Next.js App Router structure and page components for the Ingestalt application.

## Key Files
- [`app/layout.tsx`](../app/layout.tsx) - Root layout
- [`app/page.tsx`](../app/page.tsx) - Home page
- [`app/canvas/page.tsx`](../app/canvas/page.tsx) - Canvas workspace
- [`app/globals.css`](../app/globals.css) - Global styles

## Architecture

### Route Structure

```
app/
├── layout.tsx          # Root layout (providers, theme)
├── page.tsx            # Home/landing page
├── globals.css         # Global styles
└── canvas/
    └── page.tsx        # Main canvas workspace
```

### Root Layout

**Component:**
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Features:**
- Theme provider setup
- Global styles
- Font configuration
- Metadata configuration

### Home Page (`/`)

**Component:**
```typescript
export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <h1>Ingestalt</h1>
        <p>Local-first spatial documentation engine</p>
        <Link href="/canvas">
          <button>Open Canvas</button>
        </Link>
      </section>
      
      <section className="features">
        <FeatureCard
          title="Local-First"
          description="All data stored in your browser"
        />
        <FeatureCard
          title="Spatial"
          description="Visual architecture mapping"
        />
        <FeatureCard
          title="Markdown"
          description="Familiar documentation format"
        />
      </section>
    </main>
  );
}
```

**Purpose:**
- Landing page
- Feature showcase
- Quick start guide
- Navigation to canvas

### Canvas Page (`/canvas`)

**Component:**
```typescript
export default function CanvasPage() {
  return (
    <WorkspaceLayout>
      <AppShell />
    </WorkspaceLayout>
  );
}
```

**Features:**
- Main application workspace
- Full-screen canvas
- Inspector panel
- Toolbar and sidebars

### Metadata Configuration

**Root Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Ingestalt - Spatial Documentation Engine',
  description: 'Local-first spatial documentation for developers and AI agents',
  icons: {
    icon: '/favicon.ico',
  },
};
```

**Dynamic Metadata:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${params.workspace} - Ingestalt`,
  };
}
```

### Server Actions

**Ingestion Action:**
```typescript
// app/actions/ingest.ts
'use server';

export async function readWorkspaceFiles(basePath: string) {
  // Server-side file reading
}
```

**Location Action:**
```typescript
// app/actions/locate.ts
'use server';

export async function locateFile(filename: string) {
  // File location utilities
}
```

## Dependencies
- Next.js 14+ (App Router)
- React 18+
- [`components/theme-provider.tsx`](../components/theme-provider.tsx) - Theme management

## Relations
- **Contains:** [`ui_canvas`](./ui_canvas.md) - Canvas workspace
- **Uses:** [`api_ingest`](./api_ingest.md) - File ingestion
- **Uses:** [`ui_layout`](./ui_layout.md) - Layout components

## Key Concepts

### App Router
Next.js App Router features:
- File-based routing
- Server components by default
- Streaming and suspense
- Nested layouts
- Server actions

### Client vs Server Components
- **Server:** Layout, metadata, data fetching
- **Client:** Interactive UI, state management, browser APIs

### Route Groups
Organize routes without affecting URL:
```
app/
├── (marketing)/
│   ├── page.tsx        # /
│   └── about/
│       └── page.tsx    # /about
└── (app)/
    └── canvas/
        └── page.tsx    # /canvas
```

### Loading States
```typescript
// app/canvas/loading.tsx
export default function Loading() {
  return <Spinner />;
}
```

### Error Boundaries
```typescript
// app/canvas/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found Pages
```typescript
// app/canvas/not-found.tsx
export default function NotFound() {
  return <h2>Workspace not found</h2>;
}
```

### Future Routes
Planned routes:
- `/workspace/[id]` - Specific workspace
- `/settings` - Application settings
- `/export` - Export workspace
- `/import` - Import workspace
- `/docs` - Documentation