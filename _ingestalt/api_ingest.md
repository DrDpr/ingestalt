---
id: node_api_ingest
configId: node_standards_api
title: Ingest Client
type: api
icon: Network
color: '#22c55e'
tags: [ingestion, file-system-access, client-side, indexeddb]
methods:
  - ingestFromFSA
  - traverseDirectory
relations:
  - targetId: node_api_parser
    type: calls
    label: Parses markdown files
  - targetId: node_db_horizon
    type: writes
    label: Stores parsed nodes
  - targetId: node_ui_state
    type: updates
    label: Updates directory handle
---

# Ingest Client

## Purpose
Provides client-side file ingestion using the File System Access API, allowing users to select directories and import Markdown files directly into the local IndexedDB database.

## Key Files
- [`lib/drdpr-horizon/lib/ingest-client.ts`](../lib/drdpr-horizon/lib/ingest-client.ts) - Client-side ingestion
- [`lib/drdpr-horizon/lib/ingest-fsa.ts`](../lib/drdpr-horizon/lib/ingest-fsa.ts) - File System Access API wrapper

## Architecture

### Core Function: `ingestFromFSA()`

**Signature:**
```typescript
async function ingestFromFSA(
  directoryHandle: FileSystemDirectoryHandle,
  workspaceId: string
): Promise<void>
```

**Process:**
1. Recursively traverses directory using FSA
2. Filters for `.md` files
3. Reads file content as text
4. Parses each file using `parseMarkdownToNode()`
5. Bulk inserts nodes and edges into IndexedDB
6. Updates UI state with directory handle for persistence

### File System Access API Integration

**Directory Selection:**
```typescript
const handle = await window.showDirectoryPicker({
  mode: 'read',
  startIn: 'documents'
});
```

**Recursive Traversal:**
```typescript
async function traverseDirectory(
  dirHandle: FileSystemDirectoryHandle,
  path: string = ''
) {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'directory') {
      await traverseDirectory(entry, `${path}/${entry.name}`);
    } else if (entry.kind === 'file' && entry.name.endsWith('.md')) {
      const file = await entry.getFile();
      const content = await file.text();
      // Process file
    }
  }
}
```

### Batch Processing
- Collects all nodes and edges before database write
- Uses `bulkAdd()` for efficient IndexedDB insertion
- Provides progress feedback during ingestion

## Dependencies
- File System Access API (browser native)
- [`lib/parser.ts`](../lib/drdpr-horizon/lib/parser.ts) - Markdown parsing
- [`lib/db.ts`](../lib/drdpr-horizon/lib/db.ts) - Database operations
- [`lib/store/useUIStore.ts`](../lib/drdpr-horizon/lib/store/useUIStore.ts) - State management

## Relations
- **Calls:** [`api_parser`](./api_parser.md) - Parses markdown content
- **Writes to:** [`db_horizon`](./db_horizon.md) - Stores nodes and edges
- **Updates:** [`ui_state`](./ui_state.md) - Persists directory handle
- **Alternative to:** [`api_actions`](./api_actions.md) - Server-side approach

## Key Concepts

### File System Access API
Modern browser API that allows web apps to read/write local files with user permission. Provides:
- Directory picker dialog
- Recursive directory traversal
- File reading without upload
- Permission persistence across sessions

### Local-First Architecture
- All data stored in browser's IndexedDB
- No server required for core functionality
- Works offline after initial load
- User maintains full control of data

### Permission Model
```typescript
// Request permission
const handle = await window.showDirectoryPicker();

// Permission persists in handle
// Can be stored in IndexedDB for future sessions
await handle.requestPermission({ mode: 'read' });
```

### Browser Compatibility
- Chrome/Edge: Full support
- Safari: Partial support (iOS 15.2+)
- Firefox: Not supported (use server actions fallback)

### Workspace Isolation
Each ingestion creates nodes in a specific workspace, allowing multiple projects to coexist in the same database without conflicts.