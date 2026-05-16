---
id: node_ui_canvas
title: Horizon Canvas
type: ui
tags: [canvas, react-flow, visualization, spatial]
relations:
  - targetId: node_ui_state
    type: reads
    label: Selection and viewport state
  - targetId: node_ui_node_horizon
    type: contains
    label: Renders node components
  - targetId: node_db_horizon
    type: reads
    label: Loads nodes and edges
---

# Horizon Canvas

## Purpose
Main spatial canvas component that renders the interactive node graph using React Flow, providing visualization, navigation, and interaction for the architectural documentation.

## Key Files
- [`lib/drdpr-horizon/components/canvas/HorizonCanvas.tsx`](../lib/drdpr-horizon/components/canvas/HorizonCanvas.tsx) - Main canvas component
- [`lib/drdpr-horizon/components/canvas/Palette.tsx`](../lib/drdpr-horizon/components/canvas/Palette.tsx) - Node creation palette
- [`lib/drdpr-horizon/components/canvas/BatchActionToolbar.tsx`](../lib/drdpr-horizon/components/canvas/BatchActionToolbar.tsx) - Multi-select actions
- [`lib/drdpr-horizon/components/canvas/edges/FloatingEdge.tsx`](../lib/drdpr-horizon/components/canvas/edges/FloatingEdge.tsx) - Custom edge component
- [`lib/drdpr-horizon/components/canvas/edges/smartPath.ts`](../lib/drdpr-horizon/components/canvas/edges/smartPath.ts) - Edge path algorithms

## Architecture

### Component Hierarchy
```
HorizonCanvas
├── ReactFlow
│   ├── Background
│   ├── Controls
│   ├── MiniMap
│   ├── Nodes (GarnishedNode)
│   └── Edges (FloatingEdge)
├── Palette
├── BatchActionToolbar
└── KeyboardShortcutsHelp
```

### React Flow Integration

**Node Types Mapping:**
```typescript
const nodeTypes = {
  database: GarnishedNode,
  api: GarnishedNode,
  frontend: GarnishedNode,
  hook: GarnishedNode,
  other: GarnishedNode,
  standards: GarnishedNode,
  horizonDoc: GarnishedNode,
  'ai-task': GarnishedNode,
};
```

**Edge Types:**
```typescript
const edgeTypes = {
  floating: FloatingEdge,
};
```

### Data Flow

**Loading from Database:**
```typescript
const dbNodes = useLiveQuery(() => 
  db.nodes.where('workspaceId').equals(currentWorkspace).toArray()
);

const dbEdges = useLiveQuery(() =>
  db.edges.where('workspaceId').equals(currentWorkspace).toArray()
);
```

**Transformation to React Flow:**
```typescript
const nodes = dbNodes.map(node => ({
  id: node.id,
  type: node.payload.type,
  position: node.position,
  data: node.payload,
}));

const edges = dbEdges.map(edge => ({
  id: edge.id,
  source: edge.sourceId,
  target: edge.targetId,
  type: 'floating',
  data: edge.payload,
}));
```

### Event Handlers

**Node Selection:**
```typescript
onNodeClick={(event, node) => {
  if (event.shiftKey) {
    toggleNodeSelection(node.id);
  } else {
    setSelectedNodeId(node.id);
  }
}}
```

**Node Drag:**
```typescript
onNodeDragStop={(event, node) => {
  // Update position in database
  db.nodes.update(node.id, {
    position: node.position,
    lastModified: Date.now(),
  });
}}
```

**Viewport Changes:**
```typescript
onViewportChange={(viewport) => {
  setViewport(viewport);
}}
```

**Pane Click:**
```typescript
onPaneClick={() => {
  clearSelection();
  setIsInspectorOpen(false);
}}
```

### Canvas Features

**Background:**
- Dot pattern grid
- Configurable color based on theme
- Helps with spatial orientation

**Controls:**
- Zoom in/out buttons
- Fit view button
- Lock/unlock interaction

**MiniMap:**
- Overview of entire canvas
- Shows viewport position
- Click to navigate

**Selection Modes:**
- Single click - Select one node
- Shift + click - Multi-select
- Box selection - Drag to select multiple
- Pane click - Clear selection

## Dependencies
- `@xyflow/react` - React Flow library
- `dexie-react-hooks` - Live database queries
- [`lib/db.ts`](../lib/drdpr-horizon/lib/db.ts) - Database access
- [`lib/store/useUIStore.ts`](../lib/drdpr-horizon/lib/store/useUIStore.ts) - UI state
- [`lib/hooks/useKeyboardShortcuts.ts`](../lib/drdpr-horizon/lib/hooks/useKeyboardShortcuts.ts) - Keyboard shortcuts

## Relations
- **Reads from:** [`db_horizon`](./db_horizon.md) - Loads nodes and edges
- **Reads from:** [`ui_state`](./ui_state.md) - Selection and viewport
- **Contains:** [`ui_node_horizon`](./ui_node_horizon.md) - Node components
- **Contains:** Palette - Node creation
- **Contains:** BatchActionToolbar - Multi-select actions

## Key Concepts

### Spatial Documentation
The canvas provides a 2D spatial representation of architectural components, allowing developers to:
- See relationships visually
- Organize by domain or layer
- Navigate large codebases spatially
- Understand system structure at a glance

### Live Queries
Uses Dexie's `useLiveQuery` for reactive updates:
- Automatically re-renders when database changes
- No manual subscription management
- Efficient change detection

### Viewport Persistence
Canvas position and zoom are persisted in UI store:
- Restores view on page reload
- Maintains context across sessions
- Per-workspace viewport state

### Performance Optimization
- Only renders visible nodes (React Flow virtualization)
- Debounced position updates
- Memoized node/edge transformations
- Efficient edge path calculations

### Keyboard Shortcuts
- `Cmd/Ctrl + A` - Select all nodes
- `Cmd/Ctrl + C` - Copy selected nodes
- `Cmd/Ctrl + V` - Paste nodes
- `Delete/Backspace` - Delete selected nodes
- `Cmd/Ctrl + Z` - Undo (if implemented)
- `Cmd/Ctrl + F` - Focus search
- `?` - Show keyboard shortcuts help

### Edge Rendering Modes
- **Floating edges** - Dynamic connection points
- **Smart paths** - Avoid node overlaps
- **Organic curves** - Smooth bezier paths
- **Circuit paths** - Right-angle connections