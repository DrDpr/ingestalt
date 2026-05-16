---
id: node_ui_inspector
configId: node_standards_frontend
title: Inspector Panel
type: frontend
icon: Layout
color: '#a855f7'
tags: [inspector, editor, panel, details]
components:
  - Inspector
  - RelationshipPanel
  - SchemaPanel
  - GovernanceEditor
  - AITaskPromptBuilder
relations:
  - targetId: node_ui_state
    type: reads
    label: Selected node state
  - targetId: node_ui_editor
    type: contains
    label: Content editor
  - targetId: node_ui_schema_panel
    type: contains
    label: Schema editor
  - targetId: node_db_horizon
    type: reads-writes
    label: Node data
---

# Inspector Panel

## Purpose
Side panel that displays and allows editing of the selected node's properties, content, relationships, and metadata.

## Key Files
- [`lib/drdpr-horizon/components/inspector/Inspector.tsx`](../lib/drdpr-horizon/components/inspector/Inspector.tsx) - Main inspector component
- [`lib/drdpr-horizon/components/inspector/Editor.tsx`](../lib/drdpr-horizon/components/inspector/Editor.tsx) - Content editor
- [`lib/drdpr-horizon/components/inspector/RelationshipPanel.tsx`](../lib/drdpr-horizon/components/inspector/RelationshipPanel.tsx) - Relationship management
- [`lib/drdpr-horizon/components/inspector/SchemaPanel.tsx`](../lib/drdpr-horizon/components/inspector/SchemaPanel.tsx) - Schema editor
- [`lib/drdpr-horizon/components/inspector/GovernanceEditor.tsx`](../lib/drdpr-horizon/components/inspector/GovernanceEditor.tsx) - Governance rules
- [`lib/drdpr-horizon/components/inspector/AITaskPromptBuilder.tsx`](../lib/drdpr-horizon/components/inspector/AITaskPromptBuilder.tsx) - AI task generation

## Architecture

### Component Structure

```
Inspector
├── Header
│   ├── Node title (editable)
│   ├── Node type badge
│   └── Close button
├── Tabs
│   ├── Content Tab
│   │   └── Editor (Markdown)
│   ├── Relationships Tab
│   │   └── RelationshipPanel
│   ├── Schema Tab (for database nodes)
│   │   └── SchemaPanel
│   ├── Governance Tab
│   │   └── GovernanceEditor
│   └── AI Tasks Tab
│       └── AITaskPromptBuilder
└── Footer
    ├── Last modified timestamp
    └── Save status indicator
```

### Data Flow

**Loading Node Data:**
```typescript
const selectedNodeId = useUIStore(state => state.selectedNodeId);

const node = useLiveQuery(
  () => db.nodes.get(selectedNodeId),
  [selectedNodeId]
);
```

**Updating Node:**
```typescript
async function updateNode(updates: Partial<HorizonNode>) {
  await db.nodes.update(selectedNodeId, {
    ...updates,
    lastModified: Date.now(),
  });
}
```

**Auto-save Strategy:**
```typescript
const debouncedSave = useMemo(
  () => debounce((content: string) => {
    updateNode({ payload: { ...node.payload, content } });
  }, 500),
  [node]
);
```

### Tab Components

**Content Tab:**
- Rich text editor (TipTap)
- Markdown support
- Slash commands
- Code blocks with syntax highlighting
- Tables, lists, formatting

**Relationships Tab:**
- List of incoming edges (dependencies)
- List of outgoing edges (dependents)
- Add new relationship button
- Edit relationship type/label
- Delete relationship
- Visual relationship graph

**Schema Tab (Database nodes):**
- Column definitions
- Data types
- Constraints (PK, FK, unique, not null)
- Indexes
- Triggers

**Governance Tab:**
- Access control rules
- Validation rules
- Lifecycle policies
- Compliance requirements

**AI Tasks Tab:**
- Generate implementation tasks
- Create test scenarios
- Generate documentation
- Suggest refactoring

### Inspector States

**Empty State:**
```typescript
if (!selectedNodeId) {
  return (
    <div className="inspector-empty">
      <p>Select a node to view details</p>
    </div>
  );
}
```

**Loading State:**
```typescript
if (!node) {
  return (
    <div className="inspector-loading">
      <Spinner />
    </div>
  );
}
```

**Error State:**
```typescript
if (error) {
  return (
    <div className="inspector-error">
      <p>Failed to load node</p>
      <button onClick={retry}>Retry</button>
    </div>
  );
}
```

### Keyboard Shortcuts

- `Cmd/Ctrl + S` - Save changes
- `Cmd/Ctrl + E` - Focus editor
- `Cmd/Ctrl + K` - Open command palette
- `Esc` - Close inspector
- `Tab` - Switch between tabs

## Dependencies
- `@tiptap/react` - Rich text editor
- `dexie-react-hooks` - Live queries
- [`lib/db.ts`](../lib/drdpr-horizon/lib/db.ts) - Database operations
- [`lib/store/useUIStore.ts`](../lib/drdpr-horizon/lib/store/useUIStore.ts) - UI state
- [`components/ui/resizable-sidebar.tsx`](../lib/drdpr-horizon/components/ui/resizable-sidebar.tsx) - Resizable panel

## Relations
- **Reads from:** [`ui_state`](./ui_state.md) - Selected node
- **Reads/Writes:** [`db_horizon`](./db_horizon.md) - Node data
- **Contains:** [`ui_editor`](./ui_editor.md) - Content editor
- **Contains:** [`ui_schema_panel`](./ui_schema_panel.md) - Schema editor
- **Contains:** RelationshipPanel - Relationship management

## Key Concepts

### Live Updates
Inspector uses Dexie's live queries to automatically reflect changes:
- Updates when node is modified elsewhere
- Shows real-time collaboration changes
- No manual refresh needed

### Optimistic Updates
```typescript
// Update UI immediately
setLocalContent(newContent);

// Save to database (may fail)
try {
  await updateNode({ payload: { content: newContent } });
} catch (error) {
  // Revert on failure
  setLocalContent(node.payload.content);
  showError('Failed to save');
}
```

### Validation
Before saving, validate:
- Required fields (title, type)
- Relationship targets exist
- Schema constraints are valid
- No circular dependencies

### Conflict Resolution
If node was modified elsewhere:
1. Detect conflict (compare lastModified)
2. Show diff view
3. Allow user to choose:
   - Keep local changes
   - Accept remote changes
   - Merge manually

### Resizable Panel
Inspector width can be adjusted:
- Drag handle on left edge
- Minimum width: 300px
- Maximum width: 800px
- Width persisted in UI store

### Type-Specific Tabs
Different node types show different tabs:
- **Database:** Content, Relationships, Schema, Governance
- **API:** Content, Relationships, Governance, AI Tasks
- **Frontend:** Content, Relationships, AI Tasks
- **Other:** Content, Relationships

### Relationship Visualization
RelationshipPanel shows:
- Incoming edges (who depends on this)
- Outgoing edges (what this depends on)
- Relationship types (reads, writes, implements, etc.)
- Clickable to navigate to related nodes

### Metadata Display
Footer shows:
- Created timestamp
- Last modified timestamp
- Modified by (if multi-user)
- File path (if synced)
- Sync status