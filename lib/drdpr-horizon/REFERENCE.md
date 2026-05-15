# Horizon Pack — Hackathon Starter Reference

This document explains every file in `drdpr-horizon/`, what it does, and how the pieces wire together. Read this before touching the code.

---

## Mental Model

Horizon is a **spatial graph IDE**. Every piece of data is a `HorizonNode` stored in a local IndexedDB (Dexie). Nodes live on an infinite canvas powered by `@xyflow/react`. You click a node to open the Inspector, which shows its content and schema-driven fields. The Toolbar controls ingest (importing files into nodes) and canvas display settings.

```
app/page.tsx
  └── WorkspaceLayout (split pane)
        ├── Toolbar          (top bar)
        ├── HorizonCanvas    (left: @xyflow/react infinite canvas)
        └── Inspector        (right: deep-zoom panel)
```

---

## Stack

| Package | Role |
|---|---|
| `next` | Framework (App Router) |
| `@xyflow/react` | Infinite canvas, node/edge rendering |
| `dexie` + `dexie-react-hooks` | Local IndexedDB database |
| `zustand` | UI-only state (selection, inspector open, etc.) |
| `framer-motion` | Animations |
| `@tiptap/*` | Rich text editor inside the Inspector |
| `lucide-react` | Icons |
| `tailwindcss` v4 | Styling |
| `radix-ui` | Only one primitive: `@radix-ui/react-popover` |
| `gray-matter` | YAML frontmatter parsing for Markdown ingest |
| `class-variance-authority` | Variant styling for Button |

---

## `lib/db.ts` — The Database Schema

**This is where to start.** Defines two tables:

- `HorizonNode<TPayload>`: The universal data primitive. `payload` is `Record<string, any>` — you put everything domain-specific in there. No top-level domain fields.
- `HorizonEdge`: A directed relationship between two nodes.

```typescript
// Every piece of data is one of these:
{ id, configId, workspaceId, position, payload, lastModified }
```

`configId` links a node to a `standards` node — the node that defines its schema. For example, a `devlog` node has `configId: 'node_standards_devlog'`.

---

## `lib/store/useUIStore.ts` — Volatile UI State

A single Zustand store for everything that is NOT persisted:

- `selectedNodeId` — which node is focused (drives Inspector open state)
- `relationshipMode` — `'all' | 'selected' | 'trace'` — how edges are filtered on canvas
- `edgePathType` — `'organic' | 'circuit'` — edge visual style
- `searchQuery`, `activeTags` — canvas filter state
- `viewport` — React Flow viewport state

---

## `lib/parser.ts` — Markdown → Node

Parses a Markdown file with YAML frontmatter into a `HorizonNode`.

```
---
id: my_node
type: devlog
title: "My Entry"
---
# Content here
```

Any unknown YAML key goes directly into `payload`. The `type` field maps to a `configId` (`node_standards_${type}`). If `definitions` exists, it becomes a `standards` node.

---

## `lib/ingest-client.ts` — Browser Ingest Orchestrator

Reads files from a `FileSystemDirectoryHandle` (File System Access API), parses them, upserts them into `db.nodes`, and writes edges. Use this to bulk-import a project directory of markdown files.

## `lib/ingest-fsa.ts` — FSA Directory Reader

Lower-level: given a `FileSystemDirectoryHandle`, recursively yields `{ path, content }` for every `.md` file.

## `lib/serializer.ts` — Node → Markdown

Reverse of the parser. Serializes a `HorizonNode` back to a Markdown string with YAML frontmatter. Used by the auto-save loop.

## `lib/seed.ts` — Initial Data

Seeds an empty database with a few example nodes so the canvas isn't blank on first load.

---

## `lib/hooks/useFileSystem.ts`

Manages the user's selected root directory handle (`showDirectoryPicker()`). Stores the handle in state so ingest can re-use it.

## `lib/hooks/useSync.ts`

Auto-save loop: watches for `lastModified` changes (via Dexie `useLiveQuery`) and serializes changed nodes back to the file system. Runs every N seconds.

## `lib/hooks/useGenerator.ts`

Sends a node's context to an AI API route and upserts the returned node data. Drives the `PromptModal`.

---

## `components/canvas/HorizonCanvas.tsx` — The Main Canvas

The heart of the app. Wires `@xyflow/react` to Dexie:
- `useLiveQuery` — subscribes to `db.nodes` and `db.edges` reactively
- Converts `HorizonNode[]` → React Flow `Node[]` and `HorizonEdge[]` → React Flow `Edge[]`
- Applies the `relationshipMode` filter to show all/selected/trace edges
- Registers custom node types (ApiNode, DatabaseNode, etc.) and custom edge types (FloatingEdge)

**To add a new node type:** Create a component in `components/canvas/nodes/`, register it in the `nodeTypes` map inside `HorizonCanvas.tsx`.

## `components/canvas/Palette.tsx`

Left sidebar launcher. Reads `standards` nodes from the DB to auto-populate available node types. Clicking spawns a new node of that type at the center of the current viewport.

## `components/canvas/nodes/BaseNode.tsx`

The shared shell used by all node type components. Handles:
- Selection ring styling
- Icon (via `DynamicIcon`)
- Title display
- Hold-to-drag handle

All other node files (`ApiNode`, `DatabaseNode`, etc.) just render `<BaseNode>` with their specific `configId`.

## `components/canvas/edges/FloatingEdge.tsx`

A smart edge that calculates attachment points on the fly based on which side of the node the other end is closest to. Replaces fixed `source/targetHandle` positions.

## `components/canvas/edges/smartPath.ts`

The path algorithm that draws either:
- **Organic**: Smooth bezier curves
- **Circuit**: Right-angle orthogonal routes (like a PCB trace)

---

## `components/inspector/Inspector.tsx`

The right panel. Opens when a node is selected. Has three main tabs:
- **Properties** — renders `PayloadInterpretersView` based on the node's schema
- **Editor** — rich text editor for `payload.content`
- **Relations** — shows connected edges

## `components/inspector/PayloadInterpreters.tsx`

Given a list of schema `fields` (from the `standards` node), renders the appropriate input for each field type (text, list, table, code, etc.).

## `components/inspector/PayloadInterpretersView.tsx`

A filterable, column-selectable table view of payload data. Useful for `database`-type nodes with many records.

## `components/inspector/GovernanceEditor.tsx`

Visual editor for `standards` nodes. Lets you define new node types (type ID, icon, color, schema fields) without writing YAML.

## `components/inspector/RelationshipPanel.tsx`

Shows all edges connected to the selected node. Allows creating new edges by typing a target node ID and edge type.

## `components/inspector/SchemaPanel.tsx`

Read-only view of the schema fields defined for the selected node's type.

## `components/inspector/Editor.tsx`

The Tiptap-powered rich text editor. Supports slash commands, bubble menus, tables, code blocks, and images. Writes to `payload.content`.

---

## `components/layout/WorkspaceLayout.tsx`

A resizable split-pane shell. Canvas takes the left side; Inspector slides in from the right when a node is selected.

## `components/layout/Toolbar.tsx`

Top bar that houses:
- Workspace name
- Ingest button (triggers `useFileSystem` picker then `ingest-client`)
- Relationship mode switcher
- Edge style switcher
- Search
- Theme toggle

---

## `components/ui/LocalInput.tsx` — The Key Pattern

**Use this everywhere** instead of a standard controlled `<input>`. It buffers keystrokes in local state and only propagates the value to the DB on `blur` or `Enter`. This prevents React from re-rendering the entire canvas on every keystroke while editing a node's title.

---

## Wiring It All Together (Hackathon Start Sequence)

1. Create a new Next.js app: `npx create-next-app@latest ./`
2. Install deps: `npm install dexie dexie-react-hooks zustand @xyflow/react framer-motion @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder lucide-react gray-matter next-themes class-variance-authority clsx tailwind-merge @radix-ui/react-popover`
3. Drop `pack/` files into the new project (matching directory structure)
4. Copy `app/globals.css` — contains all CSS custom properties for theming
5. The entry point is `app/page.tsx` — it renders `WorkspaceLayout` with `HorizonCanvas` and `Inspector`

### Key Wiring Points
- `useUIStore.selectedNodeId` → drives whether Inspector is open
- `HorizonCanvas` reads from `db.nodes` and `db.edges` via `useLiveQuery`
- `Palette` reads from `db.nodes.where('payload.type').equals('standards')` to auto-build the node launcher
- `GovernanceEditor` writes back to the `standards` node's `payload.definitions` array

---

## Customization for the Hackathon

| Goal | Where to change |
|---|---|
| Add a new node type | Add to `nodes/`, register in `HorizonCanvas.tsx nodeTypes` |
| Add new schema fields | Edit a `standards` node in `GovernanceEditor` at runtime |
| Change edge style default | `useUIStore` initial state: `edgePathType: 'circuit'` |
| Add AI features | Use `useGenerator.ts` pattern, wire to your AI route |
| Add new inspector tab | Edit `Inspector.tsx` tabs section |
