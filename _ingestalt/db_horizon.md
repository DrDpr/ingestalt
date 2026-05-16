---
id: node_db_horizon
title: Horizon Database
type: database
tags: [indexeddb, dexie, storage, local-first]
relations:
  - targetId: node_api_parser
    type: written-by
    label: Receives parsed nodes
  - targetId: node_ui_canvas
    type: read-by
    label: Loads nodes for display
  - targetId: node_ui_inspector
    type: read-write-by
    label: Node editing
---

# Horizon Database

## Purpose
Local-first IndexedDB database using Dexie.js for storing nodes, edges, and workspace data with reactive queries and offline support.

## Key Files
- [`lib/drdpr-horizon/lib/db.ts`](../lib/drdpr-horizon/lib/db.ts) - Database schema and operations

## Architecture

### Database Schema

**Tables:**
```typescript
class HorizonDB extends Dexie {
  nodes!: Table<HorizonNode>;
  edges!: Table<HorizonEdge>;
  workspaces!: Table<Workspace>;
  
  constructor() {
    super('HorizonDB');
    
    this.version(1).stores({
      nodes: 'id, workspaceId, configId, lastModified, [workspaceId+configId]',
      edges: 'id, workspaceId, sourceId, targetId, [workspaceId+sourceId], [workspaceId+targetId]',
      workspaces: 'id, name, lastModified',
    });
  }
}
```

### Data Models

**HorizonNode:**
```typescript
interface HorizonNode {
  id: string;                    // Unique identifier
  configId: string;              // References node type standard
  workspaceId: string;           // Workspace isolation
  position: { x: number; y: number }; // Canvas position
  lastModified: number;          // Timestamp
  payload: {
    title: string;
    content: string;
    tags: string[];
    type: string;
    [key: string]: any;          // Domain-specific fields
  };
}
```

**HorizonEdge:**
```typescript
interface HorizonEdge {
  id: string;                    // Unique identifier
  workspaceId: string;           // Workspace isolation
  sourceId: string;              // Source node ID
  targetId: string;              // Target node ID
  lastModified: number;          // Timestamp
  payload: {
    type: string;                // Relationship type
    label?: string;              // Optional label
    [key: string]: any;          // Domain-specific fields
  };
}
```

**Workspace:**
```typescript
interface Workspace {
  id: string;
  name: string;
  description?: string;
  lastModified: number;
  settings?: {
    defaultView?: string;
    theme?: string;
    [key: string]: any;
  };
}
```

### Indexes

**Node Indexes:**
- Primary: `id`
- Workspace: `workspaceId`
- Config: `configId`
- Composite: `[workspaceId+configId]`
- Modified: `lastModified`

**Edge Indexes:**
- Primary: `id`
- Workspace: `workspaceId`
- Source: `sourceId`
- Target: `targetId`
- Composite: `[workspaceId+sourceId]`, `[workspaceId+targetId]`

### Query Patterns

**Get All Nodes in Workspace:**
```typescript
const nodes = await db.nodes
  .where('workspaceId')
  .equals(workspaceId)
  .toArray();
```

**Get Node by ID:**
```typescript
const node = await db.nodes.get(nodeId);
```

**Get Edges for Node:**
```typescript
const outgoingEdges = await db.edges
  .where('sourceId')
  .equals(nodeId)
  .toArray();

const incomingEdges = await db.edges
  .where('targetId')
  .equals(nodeId)
  .toArray();
```

**Search Nodes:**
```typescript
const results = await db.nodes
  .where('workspaceId')
  .equals(workspaceId)
  .filter(node => 
    node.payload.title.toLowerCase().includes(query.toLowerCase()) ||
    node.payload.content.toLowerCase().includes(query.toLowerCase())
  )
  .toArray();
```

**Live Queries (React):**
```typescript
const nodes = useLiveQuery(
  () => db.nodes.where('workspaceId').equals(workspaceId).toArray(),
  [workspaceId]
);
```

### CRUD Operations

**Create:**
```typescript
await db.nodes.add({
  id: generateId(),
  workspaceId,
  configId,
  position: { x: 0, y: 0 },
  lastModified: Date.now(),
  payload: { title, content, tags, type },
});
```

**Read:**
```typescript
const node = await db.nodes.get(nodeId);
```

**Update:**
```typescript
await db.nodes.update(nodeId, {
  payload: { ...node.payload, title: newTitle },
  lastModified: Date.now(),
});
```

**Delete:**
```typescript
await db.nodes.delete(nodeId);
```

**Bulk Operations:**
```typescript
await db.nodes.bulkAdd(nodes);
await db.nodes.bulkUpdate(updates);
await db.nodes.bulkDelete(ids);
```

## Dependencies
- `dexie` - IndexedDB wrapper
- `dexie-react-hooks` - React integration

## Relations
- **Written by:** [`api_parser`](./api_parser.md) - Stores parsed nodes
- **Written by:** [`api_seed`](./api_seed.md) - Seed data
- **Read by:** [`ui_canvas`](./ui_canvas.md) - Display nodes
- **Read/Write by:** [`ui_inspector`](./ui_inspector.md) - Edit nodes

## Key Concepts

### Local-First Architecture
All data stored locally in browser's IndexedDB:
- No server required for core functionality
- Works offline
- Fast queries
- User owns their data

### Workspace Isolation
Multiple workspaces in single database:
- Separate projects
- No data mixing
- Easy switching
- Independent settings

### Reactive Queries
Dexie's live queries automatically update components:
- No manual subscriptions
- Efficient change detection
- Real-time UI updates

### Agnostic Schema
Flexible payload structure:
- Domain-specific fields in payload
- No rigid schema
- Easy to extend
- Type-safe with TypeScript

### Performance
- Indexed queries for fast lookups
- Bulk operations for efficiency
- Lazy loading
- Query optimization

### Data Migration
Version management for schema changes:
```typescript
this.version(2).stores({
  nodes: 'id, workspaceId, configId, lastModified, [workspaceId+configId]',
  // ... updated schema
}).upgrade(tx => {
  // Migration logic
});
```

### Export/Import
- Export workspace to JSON
- Import from JSON
- Backup and restore
- Share workspaces