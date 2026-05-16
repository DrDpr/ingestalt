---
id: node_ui_state
title: UI State Management
type: ui
tags: [zustand, state, store, persistence]
relations:
  - targetId: node_ui_canvas
    type: used-by
    label: Canvas viewport and selection
  - targetId: node_ui_inspector
    type: used-by
    label: Inspector panel state
  - targetId: node_ui_layout
    type: used-by
    label: Layout panel visibility
---

# UI State Management

## Purpose
Centralized state management for the Ingestalt UI using Zustand, handling selection, viewport, search, and application configuration with persistence.

## Key Files
- [`lib/drdpr-horizon/lib/store/useUIStore.ts`](../lib/drdpr-horizon/lib/store/useUIStore.ts) - Main UI store

## Architecture

### Store Structure

**State Categories:**
1. **Selection State** - Node selection and hover
2. **Search & Filtering** - Query and tag filters
3. **Panel Visibility** - Inspector, toolbar, shortcuts
4. **Canvas State** - Viewport position and zoom
5. **Configuration** - Theme, edge styles, relationship modes
6. **File System** - Directory handle persistence
7. **Clipboard** - Copy/paste operations

### Key State Properties

```typescript
interface UIState {
  // Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  selectedNodeIds: Set<string>;
  
  // Panels
  isLeftOpen: boolean;
  isInspectorOpen: boolean;
  isSearchOpen: boolean;
  isToolbarOpen: boolean;
  isShortcutsHelpOpen: boolean;
  
  // Search & Filtering
  searchQuery: string;
  activeTags: string[];
  
  // Canvas
  viewport: { x: number; y: number; zoom: number };
  
  // Configuration
  relationshipMode: 'all' | 'selected' | 'trace';
  edgeHandleType: 'fixed' | 'smart';
  edgePathType: 'organic' | 'circuit';
  theme: 'light' | 'dark';
  
  // File System Access
  directoryHandle: FileSystemDirectoryHandle | null;
  
  // Clipboard
  copiedNodeIds: string[];
}
```

### State Actions

**Selection Management:**
```typescript
setSelectedNodeId(id: string | null)      // Single selection
setPrimaryNodeId(id: string | null)       // Primary without clearing multi-select
toggleNodeSelection(id: string)           // Multi-select toggle
clearSelection()                          // Clear all selections
```

**Panel Management:**
```typescript
setLeftOpen(open: boolean)
toggleInspector()
toggleSearch()
toggleToolbar()
toggleShortcutsHelp()
```

**Search & Filtering:**
```typescript
setSearchQuery(query: string)
setActiveTags(tags: string[])
toggleTag(tag: string)
```

**Viewport Management:**
```typescript
setViewport(viewport: Viewport)
```

**Configuration:**
```typescript
setRelationshipMode(mode: 'all' | 'selected' | 'trace')
setEdgeHandleType(type: 'fixed' | 'smart')
setEdgePathType(type: 'organic' | 'circuit')
setTheme(theme: 'light' | 'dark')
```

## Dependencies
- `zustand` - State management library
- `zustand/middleware` - Persistence middleware

## Relations
- **Used by:** [`ui_canvas`](./ui_canvas.md) - Canvas state and selection
- **Used by:** [`ui_inspector`](./ui_inspector.md) - Inspector visibility and selection
- **Used by:** [`ui_layout`](./ui_layout.md) - Panel visibility
- **Used by:** All UI components - Global state access

## Key Concepts

### Zustand Store Pattern
```typescript
const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedNodeId: null,
      
      // Actions
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    }),
    {
      name: 'ingestalt-ui-store',
      partialize: (state) => ({
        // Only persist specific fields
        theme: state.theme,
        viewport: state.viewport,
      }),
    }
  )
);
```

### Persistence Strategy
- Uses `localStorage` via Zustand persist middleware
- Selective persistence (not all state is persisted)
- Persisted fields:
  - `viewport` - Canvas position/zoom
  - `theme` - Light/dark mode
  - `directoryHandle` - File system access (if supported)
  - Panel visibility states

### Multi-Selection Pattern
```typescript
// Set maintains unique node IDs
selectedNodeIds: Set<string>

// Toggle selection
toggleNodeSelection: (id) => set((state) => {
  const newSet = new Set(state.selectedNodeIds);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  return { selectedNodeIds: newSet };
})
```

### Primary vs Multi-Select
- `selectedNodeId` - Primary node shown in inspector
- `selectedNodeIds` - Set of all selected nodes for batch operations
- `setPrimaryNodeId()` - Changes inspector without clearing multi-select
- `setSelectedNodeId()` - Clears multi-select and sets primary

### Relationship Modes
- `'all'` - Show all edges in workspace
- `'selected'` - Show only edges connected to selected nodes
- `'trace'` - Show full dependency chain from selected node

### Edge Rendering Options
- **Handle Type:**
  - `'fixed'` - Static connection points
  - `'smart'` - Dynamic connection points based on node position
- **Path Type:**
  - `'organic'` - Smooth bezier curves
  - `'circuit'` - Right-angle paths