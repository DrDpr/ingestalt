---
id: node_api_seed
configId: node_standards_api
title: Database Seeding
type: api
icon: Network
color: '#22c55e'
tags: [seed, mock-data, development, testing]
methods:
  - seedDatabase
relations:
  - targetId: node_api_parser
    type: calls
    label: Parses mock markdown
  - targetId: node_db_horizon
    type: writes
    label: Populates database
---

# Database Seeding

## Purpose
Provides mock data and utilities for seeding the IndexedDB database with sample nodes and edges for development and testing purposes.

## Key Files
- [`lib/drdpr-horizon/lib/seed.ts`](../lib/drdpr-horizon/lib/seed.ts) - Seeding implementation

## Architecture

### Core Function: `seedDatabase()`

**Signature:**
```typescript
async function seedDatabase(workspaceId?: string): Promise<void>
```

**Process:**
1. Defines mock Markdown documents with frontmatter
2. Parses each document using `parseMarkdownToNode()`
3. Extracts nodes and edges from parsed results
4. Bulk inserts into IndexedDB using `bulkAdd()`
5. Logs completion status

### Mock Data Structure

**Example Mock Document:**
```markdown
---
id: node_db_users
title: Users Table
type: database
tags: [core, auth, backend]
columns:
  - name: id (uuid, pk)
  - name: email (string, unique)
  - name: created_at (timestamp)
relations: []
---
# Developer Notes
Ensure RLS policies block public read access to the email column.
```

### Seed Data Categories
1. **Database Nodes** - Table schemas with columns
2. **API Nodes** - Endpoint definitions with relations
3. **UI Nodes** - Component documentation
4. **Standards Nodes** - Implementation patterns

### Workspace Targeting
```typescript
const targetWorkspace = workspaceId || 'seed-workspace';
```
- Defaults to `'seed-workspace'` if not specified
- Allows seeding into specific workspaces
- Prevents pollution of production workspaces

## Dependencies
- [`lib/db.ts`](../lib/drdpr-horizon/lib/db.ts) - Database operations
- [`lib/parser.ts`](../lib/drdpr-horizon/lib/parser.ts) - Markdown parsing

## Relations
- **Calls:** [`api_parser`](./api_parser.md) - Parses mock markdown
- **Writes to:** [`db_horizon`](./db_horizon.md) - Populates database
- **Used by:** Development and testing workflows

## Key Concepts

### Mock Data Design
Mock documents demonstrate:
- Proper frontmatter structure
- Relationship definitions
- Domain-specific fields (columns, endpoints, etc.)
- Content formatting standards

### Bulk Operations
```typescript
await db.nodes.bulkAdd(nodes);
await db.edges.bulkAdd(edges);
```
- More efficient than individual inserts
- Atomic operation (all or nothing)
- Faster for large datasets

### Development Workflow
1. Clear existing seed workspace: `db.nodes.where('workspaceId').equals('seed-workspace').delete()`
2. Run seed function: `seedDatabase('seed-workspace')`
3. Verify in canvas or inspector
4. Iterate on mock data structure

### Testing Use Cases
- UI component development
- Relationship visualization testing
- Search and filter functionality
- Export/import validation
- Performance testing with realistic data

### Extensibility
Add new mock documents to `MOCK_DOCS` array:
```typescript
const MOCK_DOCS = [
  `---
  id: node_new_example
  title: New Example
  type: custom
  ---
  Content here...`,
  // ... more mocks
];