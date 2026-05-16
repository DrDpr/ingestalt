id: node_api_actions
configId: node_standards_api
title: Server Actions
type: api
icon: Network
color: '#22c55e'
tags: [server-actions, nextjs, file-system, ingestion]
methods:
  - readWorkspaceFiles
relations:
  - targetId: node_api_parser
    type: calls
    label: Parses markdown files
  - targetId: node_api_ingest
    type: alternative-to
    label: Server-side alternative to FSA

# Server Actions

## Purpose
Provides server-side file system access for reading Markdown files when the File System Access API is unavailable (e.g., non-Chromium browsers or server-side rendering).

## Key Files
- [`app/actions/ingest.ts`](../app/actions/ingest.ts) - Server action implementation
- [`app/actions/locate.ts`](../app/actions/locate.ts) - File location utilities

## Architecture

### Core Function: `readWorkspaceFiles()`

**Signature:**
```typescript
async function readWorkspaceFiles(
  basePath: string
): Promise<{ content: string; filepath: string }[]>
```

**Process:**
1. Recursively traverses directory tree from `basePath`
2. Filters for `.md` files only
3. Skips hidden directories (`.git`, `.vscode`) and `node_modules`
4. Reads file content using Node.js `fs/promises`
5. Returns array of file objects with content and relative paths

### Directory Traversal Strategy
```typescript
async function readDir(dirPath: string, relativePath: string = '') {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory() && !shouldSkip(entry.name)) {
      await readDir(fullPath, relPath); // Recursive
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Process markdown file
    }
  }
}
```

### Skip Logic
- Directories starting with `.` (hidden)
- `node_modules` directory
- Preserves relative paths for workspace context

## Dependencies
- `fs/promises` - Node.js file system API
- Next.js Server Actions (`'use server'` directive)

## Relations
- **Calls:** [`api_parser`](./api_parser.md) - Parses read markdown content
- **Alternative to:** [`api_ingest`](./api_ingest.md) - Client-side FSA approach
- **Used by:** [`app_routes`](./app_routes.md) - Ingestion page/route

## Key Concepts

### Server Actions
Next.js Server Actions allow secure server-side operations to be called from client components without creating API routes.

### Fallback Strategy
When File System Access API is not available:
1. User provides workspace path
2. Server action reads files from server file system
3. Returns content to client for processing
4. Client parses and stores in IndexedDB

### Security Considerations
- Server actions run in Node.js environment with full file system access
- Should validate and sanitize `basePath` parameter
- Consider implementing path traversal protection
- Limit to specific allowed directories in production