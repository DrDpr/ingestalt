---
id: node_ui_layout
title: Layout Components
type: ui
tags: [layout, shell, toolbar, sidebar]
relations:
  - targetId: node_ui_canvas
    type: contains
    label: Main canvas area
  - targetId: node_ui_inspector
    type: contains
    label: Inspector panel
  - targetId: node_ui_state
    type: reads
    label: Panel visibility state
---

# Layout Components

## Purpose
Provides the application shell structure with toolbar, sidebars, and main content area, managing layout state and responsive behavior.

## Key Files
- [`lib/drdpr-horizon/components/layout/WorkspaceLayout.tsx`](../lib/drdpr-horizon/components/layout/WorkspaceLayout.tsx) - Main layout wrapper
- [`lib/drdpr-horizon/components/layout/AppShell.tsx`](../lib/drdpr-horizon/components/layout/AppShell.tsx) - Application shell
- [`lib/drdpr-horizon/components/layout/Toolbar.tsx`](../lib/drdpr-horizon/components/layout/Toolbar.tsx) - Top toolbar
- [`lib/drdpr-horizon/components/layout/SpatialSidebar.tsx`](../lib/drdpr-horizon/components/layout/SpatialSidebar.tsx) - Left sidebar

## Architecture

### Layout Hierarchy

```
WorkspaceLayout
└── AppShell
    ├── Toolbar (top)
    ├── SpatialSidebar (left, collapsible)
    ├── HorizonCanvas (center)
    └── Inspector (right, collapsible)
```

### WorkspaceLayout

**Component Structure:**
```typescript
export function WorkspaceLayout({ children }: Props) {
  const { theme } = useTheme();
  
  return (
    <div className={cn('workspace-layout', theme)}>
      <ThemeProvider attribute="class" defaultTheme="system">
        {children}
      </ThemeProvider>
    </div>
  );
}
```

### AppShell

**Component Structure:**
```typescript
export function AppShell() {
  const isLeftOpen = useUIStore(state => state.isLeftOpen);
  const isInspectorOpen = useUIStore(state => state.isInspectorOpen);
  
  return (
    <div className="app-shell">
      <Toolbar />
      
      <div className="app-body">
        {isLeftOpen && <SpatialSidebar />}
        
        <main className="main-content">
          <HorizonCanvas />
        </main>
        
        {isInspectorOpen && <Inspector />}
      </div>
    </div>
  );
}
```

**CSS Grid Layout:**
```css
.app-shell {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}

.app-body {
  display: grid;
  grid-template-columns: auto 1fr auto;
  overflow: hidden;
}

.main-content {
  position: relative;
  overflow: hidden;
}
```

### Toolbar

**Component Structure:**
```typescript
export function Toolbar() {
  const setLeftOpen = useUIStore(state => state.setLeftOpen);
  const toggleInspector = useUIStore(state => state.toggleInspector);
  const toggleSearch = useUIStore(state => state.toggleSearch);
  
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <button onClick={() => setLeftOpen(true)}>
          <MenuIcon />
        </button>
        <h1>Ingestalt</h1>
      </div>
      
      <div className="toolbar-center">
        <SearchBar />
      </div>
      
      <div className="toolbar-right">
        <button onClick={toggleSearch}>
          <SearchIcon />
        </button>
        <button onClick={toggleInspector}>
          <PanelRightIcon />
        </button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
```

**Toolbar Actions:**
- Toggle left sidebar
- Global search
- Toggle inspector
- Theme switcher
- User menu (settings, logout)
- Workspace switcher

### SpatialSidebar

**Component Structure:**
```typescript
export function SpatialSidebar() {
  const setLeftOpen = useUIStore(state => state.setLeftOpen);
  const activeTags = useUIStore(state => state.activeTags);
  const toggleTag = useUIStore(state => state.toggleTag);
  
  return (
    <aside className="spatial-sidebar">
      <div className="sidebar-header">
        <h2>Navigation</h2>
        <button onClick={() => setLeftOpen(false)}>
          <XIcon />
        </button>
      </div>
      
      <div className="sidebar-content">
        <WorkspaceSelector />
        
        <section>
          <h3>Quick Actions</h3>
          <button onClick={handleIngest}>
            <UploadIcon /> Ingest Files
          </button>
          <button onClick={handleExport}>
            <DownloadIcon /> Export
          </button>
        </section>
        
        <section>
          <h3>Tags</h3>
          <TagList tags={allTags} activeTags={activeTags} onToggle={toggleTag} />
        </section>
        
        <section>
          <h3>Recent Nodes</h3>
          <RecentNodesList />
        </section>
      </div>
    </aside>
  );
}
```

**Sidebar Sections:**
- Workspace selector
- Quick actions (ingest, export, sync)
- Tag filters
- Recent nodes
- Saved views/perspectives
- Settings

### Responsive Behavior

**Breakpoints:**
```typescript
const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};
```

**Mobile Layout:**
```typescript
// On mobile, sidebars become overlays
const isMobile = useMediaQuery('(max-width: 768px)');

if (isMobile) {
  return (
    <Sheet open={isLeftOpen} onOpenChange={setLeftOpen}>
      <SheetContent side="left">
        <SpatialSidebar />
      </SheetContent>
    </Sheet>
  );
}
```

**Tablet Layout:**
- Collapsible sidebars
- Reduced toolbar items
- Touch-friendly controls

**Desktop Layout:**
- Full toolbar
- Resizable sidebars
- Keyboard shortcuts

### Resizable Panels

**ResizableSidebar Component:**
```typescript
export function ResizableSidebar({ children, side, defaultWidth }: Props) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  
  const handleMouseDown = () => setIsResizing(true);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = side === 'left'
        ? e.clientX
        : window.innerWidth - e.clientX;
      
      setWidth(Math.max(200, Math.min(800, newWidth)));
    };
    
    const handleMouseUp = () => setIsResizing(false);
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, side]);
  
  return (
    <div className="resizable-sidebar" style={{ width }}>
      {children}
      <div
        className="resize-handle"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
```

## Dependencies
- [`components/ui/sheet.tsx`](../lib/drdpr-horizon/components/ui/sheet.tsx) - Mobile overlays
- [`components/ui/resizable-sidebar.tsx`](../lib/drdpr-horizon/components/ui/resizable-sidebar.tsx) - Resizable panels
- [`lib/store/useUIStore.ts`](../lib/drdpr-horizon/lib/store/useUIStore.ts) - Layout state
- [`lib/hooks/useMediaQuery.ts`](../lib/drdpr-horizon/lib/hooks/useMediaQuery.ts) - Responsive detection

## Relations
- **Contains:** [`ui_canvas`](./ui_canvas.md) - Main canvas
- **Contains:** [`ui_inspector`](./ui_inspector.md) - Inspector panel
- **Reads from:** [`ui_state`](./ui_state.md) - Panel visibility

## Key Concepts

### Spatial Navigation
Left sidebar provides spatial navigation:
- Tag-based filtering
- Recent nodes
- Saved perspectives
- Quick jump to nodes

### Panel State Persistence
Panel visibility and sizes are persisted:
```typescript
const useUIStore = create(
  persist(
    (set) => ({
      isLeftOpen: true,
      isInspectorOpen: false,
      leftSidebarWidth: 300,
      inspectorWidth: 400,
    }),
    { name: 'layout-state' }
  )
);
```

### Keyboard Shortcuts
- `Cmd/Ctrl + B` - Toggle left sidebar
- `Cmd/Ctrl + I` - Toggle inspector
- `Cmd/Ctrl + K` - Focus search
- `Cmd/Ctrl + ,` - Open settings

### Accessibility
- Semantic HTML structure
- ARIA landmarks
- Keyboard navigation
- Focus management
- Screen reader support

### Performance
- Lazy loading of sidebar content
- Virtual scrolling for long lists
- Debounced resize handlers
- Memoized components

### Theme Support
Layout adapts to light/dark themes:
- Dynamic colors
- Contrast adjustments
- Border styles
- Shadow depths