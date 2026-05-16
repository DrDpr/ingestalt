---
id: node_ui_node_horizon
configId: node_standards_frontend
title: Node Components
type: frontend
icon: Layout
color: '#a855f7'
tags: [nodes, components, visualization, react-flow]
components:
  - GarnishedNode
  - BaseNode
  - ApiNode
  - DatabaseNode
  - FrontendNode
relations:
  - targetId: node_ui_canvas
    type: used-by
    label: Rendered on canvas
  - targetId: node_standards_core
    type: implements
    label: Node type standards
  - targetId: node_db_horizon
    type: reads
    label: Node data
---

# Node Components

## Purpose
Provides the visual representation of documentation nodes on the canvas, with type-specific styling, icons, and interactive features.

## Key Files
- [`lib/drdpr-horizon/components/canvas/nodes/GarnishedNode.tsx`](../lib/drdpr-horizon/components/canvas/nodes/GarnishedNode.tsx) - Unified node component
- [`lib/drdpr-horizon/components/canvas/nodes/BaseNode.tsx`](../lib/drdpr-horizon/components/canvas/nodes/BaseNode.tsx) - Base node structure
- [`lib/drdpr-horizon/components/canvas/nodes/ApiNode.tsx`](../lib/drdpr-horizon/components/canvas/nodes/ApiNode.tsx) - API-specific node
- [`lib/drdpr-horizon/components/canvas/nodes/DatabaseNode.tsx`](../lib/drdpr-horizon/components/canvas/nodes/DatabaseNode.tsx) - Database-specific node
- [`lib/drdpr-horizon/components/canvas/nodes/FrontendNode.tsx`](../lib/drdpr-horizon/components/canvas/nodes/FrontendNode.tsx) - Frontend-specific node
- [`lib/drdpr-horizon/components/canvas/nodes/OtherNode.tsx`](../lib/drdpr-horizon/components/canvas/nodes/OtherNode.tsx) - Generic node

## Architecture

### Component Hierarchy

**Unified Approach (GarnishedNode):**
```
GarnishedNode (type-agnostic wrapper)
└── Type-specific rendering based on node.data.type
    ├── Database styling
    ├── API styling
    ├── Frontend styling
    └── Other styling
```

**Legacy Approach (Deprecated):**
```
BaseNode (shared logic)
├── ApiNode
├── DatabaseNode
├── FrontendNode
└── OtherNode
```

### GarnishedNode Structure

**Props:**
```typescript
interface NodeData {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  icon?: string;
  // ... other domain-specific fields
}

interface GarnishedNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
}
```

**Rendering Logic:**
```typescript
function GarnishedNode({ id, data, selected }: GarnishedNodeProps) {
  const style = getStyleForType(data.type);
  const icon = getIconForType(data.type);
  
  return (
    <div className={cn('node', style, { selected })}>
      <Handle type="target" position={Position.Top} />
      
      <div className="node-header">
        <DynamicIcon name={icon} />
        <span>{data.title}</span>
      </div>
      
      <div className="node-body">
        {/* Type-specific content */}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### Type-Specific Styling

**Database Nodes:**
- Color: Blue/Cyan
- Icon: Database
- Shows: Table name, columns, indexes
- Border: Solid

**API Nodes:**
- Color: Green
- Icon: Server/API
- Shows: Endpoint, method, parameters
- Border: Dashed

**Frontend Nodes:**
- Color: Purple/Pink
- Icon: Component
- Shows: Component name, props, state
- Border: Solid

**Other Nodes:**
- Color: Gray
- Icon: Document
- Shows: Title, tags
- Border: Dotted

### Interactive Features

**Selection State:**
```typescript
const isSelected = useUIStore(state => 
  state.selectedNodeIds.has(id) || state.selectedNodeId === id
);
```

**Hover State:**
```typescript
const isHovered = useUIStore(state => state.hoveredNodeId === id);

<div
  onMouseEnter={() => setHoveredNodeId(id)}
  onMouseLeave={() => setHoveredNodeId(null)}
>
```

**Click Handling:**
```typescript
onClick={(e) => {
  if (e.shiftKey) {
    toggleNodeSelection(id);
  } else {
    setSelectedNodeId(id);
    setIsInspectorOpen(true);
  }
}}
```

**Double-Click:**
```typescript
onDoubleClick={() => {
  // Focus on node (zoom and center)
  reactFlowInstance.fitView({
    nodes: [{ id }],
    duration: 300,
  });
}}
```

### Connection Handles

**Target Handle (Top):**
```typescript
<Handle
  type="target"
  position={Position.Top}
  id={`${id}-target`}
  isConnectable={true}
/>
```

**Source Handle (Bottom):**
```typescript
<Handle
  type="source"
  position={Position.Bottom}
  id={`${id}-source`}
  isConnectable={true}
/>
```

**Smart Handles (Dynamic):**
- Calculate optimal connection point based on edge direction
- Multiple handles per side for complex connections
- Auto-hide when not needed

## Dependencies
- `@xyflow/react` - React Flow node components
- [`components/DynamicIcon.tsx`](../lib/drdpr-horizon/components/DynamicIcon.tsx) - Icon rendering
- [`lib/store/useUIStore.ts`](../lib/drdpr-horizon/lib/store/useUIStore.ts) - Selection state
- `tailwindcss` - Styling

## Relations
- **Used by:** [`ui_canvas`](./ui_canvas.md) - Rendered on canvas
- **Implements:** [`standards_core`](./standards_core.md) - Node type standards
- **Reads from:** [`db_horizon`](./db_horizon.md) - Node data

## Key Concepts

### Type-Agnostic Design
GarnishedNode handles all node types in a single component:
- Reduces code duplication
- Easier to maintain consistent styling
- Simpler to add new node types
- Dynamic styling based on `data.type`

### Visual Hierarchy
```
┌─────────────────────┐
│ 🗄️  Users Table     │ ← Header (icon + title)
├─────────────────────┤
│ • id (uuid, pk)     │
│ • email (string)    │ ← Body (type-specific content)
│ • created_at        │
├─────────────────────┤
│ [auth] [core]       │ ← Footer (tags)
└─────────────────────┘
```

### Selection Indicators
- **Selected:** Bold border, elevated shadow
- **Hovered:** Lighter border, subtle glow
- **Multi-selected:** Badge with count
- **Primary:** Different border color

### Responsive Sizing
- Minimum width: 200px
- Maximum width: 400px
- Height: Auto-fit content
- Compact mode for zoomed-out view

### Performance Optimization
- Memoized rendering with `React.memo()`
- Only re-render when data or selection changes
- Lazy load node content when expanded
- Virtual scrolling for large node lists

### Accessibility
- Keyboard navigation support
- ARIA labels for screen readers
- Focus indicators
- Semantic HTML structure

### Custom Node Types
To add a new node type:
1. Add type to `standards_core.md`
2. Define color scheme in theme
3. Add icon mapping in `DynamicIcon`
4. Update `getStyleForType()` in GarnishedNode
5. Add type-specific rendering logic if needed