---
id: node_api_parser
configId: node_standards_api
title: Markdown Parser
type: api
icon: Network
color: '#22c55e'
tags: [parser, markdown, frontmatter, core]
methods:
  - parseMarkdownToNode
relations:
  - targetId: node_db_horizon
    type: writes
    label: Creates nodes and edges
  - targetId: node_standards_core
    type: implements
    label: Follows node structure standards
---

# Markdown Parser

## Purpose
Parses raw Markdown files with YAML frontmatter into structured `HorizonNode` and `HorizonEdge` objects for the Ingestalt system.

## Key Files
- [`lib/drdpr-horizon/lib/parser.ts`](../lib/drdpr-horizon/lib/parser.ts) - Main parser implementation

## Architecture

### Core Function: `parseMarkdownToNode()`

**Signature:**
```typescript
parseMarkdownToNode(
  rawMarkdown: string,
  workspaceId: string = 'default',
  forceNewId: boolean = false
): ParsedResult
```

**Process:**
1. Uses `gray-matter` to extract YAML frontmatter and content
2. Generates unique node ID (or uses existing from frontmatter)
3. Constructs `HorizonNode` with:
   - `id` - Unique identifier with high entropy
   - `configId` - References node type standards
   - `workspaceId` - Workspace isolation
   - `position` - Canvas coordinates
   - `payload` - All domain-specific data
4. Extracts `relations` array from frontmatter to create `HorizonEdge` objects

### ID Generation Strategy
```typescript
`node_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 9)}`
```
- Timestamp for temporal ordering
- Double random strings for collision resistance
- Prefix for type identification

### Edge Extraction
- Reads `relations` array from frontmatter
- Each relation becomes an `HorizonEdge` with:
  - `sourceId` - Current node
  - `targetId` - Referenced node
  - `type` - Relationship type (reads, writes, implements, etc.)

## Dependencies
- `gray-matter` - YAML frontmatter parsing
- [`lib/db.ts`](../lib/drdpr-horizon/lib/db.ts) - Type definitions

## Relations
- **Writes to:** [`db_horizon`](./db_horizon.md) - Stores parsed nodes and edges
- **Used by:** [`api_ingest`](./api_ingest.md) - Ingestion pipeline
- **Used by:** [`api_seed`](./api_seed.md) - Database seeding
- **Implements:** [`standards_core`](./standards_core.md) - Node structure standards

## Key Concepts

### Agnostic Node Structure
The parser creates domain-agnostic nodes where all domain-specific fields are stored in the `payload` object, allowing flexibility for different node types (database, API, UI, etc.).

### Workspace Isolation
Every node belongs to a workspace, enabling multi-project support within a single database.

### Frontmatter Schema
```yaml
---
id: node_unique_id          # Optional, auto-generated if missing
title: Node Title           # Required
type: database|api|frontend # Node type
tags: [tag1, tag2]         # Optional tags
position:                   # Canvas position
  x: 100
  y: 200
relations:                  # Edges to other nodes
  - targetId: node_other_id
    type: reads
    label: Optional label
---