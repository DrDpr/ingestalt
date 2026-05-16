# Horizon IDE - Feature Specification

> **Spec-Driven Development Document**
> Version: 1.1.0
> Last Updated: 2026-05-16

---

## 🎯 Product Vision

Horizon is a **spatial graph IDE** that enables developers to visualize, document, and manage complex software architectures through an infinite canvas interface. Every piece of data is a node with relationships, stored locally in IndexedDB, and synchronized with the file system.

---

## 📋 Core Features

### 1. **Infinite Canvas Workspace**

#### 1.1 Canvas Navigation
- **FR-1.1.1**: Users can pan the canvas by dragging the background
- **FR-1.1.2**: Users can zoom in/out using mouse wheel or pinch gestures
- **FR-1.1.3**: Canvas supports viewport persistence across sessions
- **FR-1.1.4**: Mini-map provides overview and quick navigation
- **FR-1.1.5**: Background grid with dots or lines (configurable)

#### 1.2 Node Management
- **FR-1.2.1**: Users can create nodes by dragging from the Palette
- **FR-1.2.2**: Nodes can be repositioned via drag-and-drop
- **FR-1.2.3**: Multiple nodes can be selected and moved together
- **FR-1.2.4**: Nodes display icon, title, and type indicator
- **FR-1.2.5**: Selection ring highlights active node
- **FR-1.2.6**: Double-click node to open Inspector

#### 1.4 Node Appearance Customization
- **FR-1.4.1**: Node color customization at type level (Standards node defines default colors)
- **FR-1.4.2**: Per-node color override capability for individual customization
- **FR-1.4.3**: Node icon selection from integrated icon library (Lucide icons)
- **FR-1.4.4**: Node size presets (compact, standard, expanded)
- **FR-1.4.5**: Node border style options (solid, dashed, dotted) with thickness control
- **FR-1.4.6**: Node shape variants (rounded-lg, rounded-xl, rounded-2xl, square)
- **FR-1.4.7**: Appearance settings accessible from Inspector panel
- **FR-1.4.8**: Real-time preview of appearance changes
- **FR-1.4.9**: Reset to type defaults option

#### 1.3 Edge Management
- **FR-1.3.1**: Users can create edges between nodes
- **FR-1.3.2**: Edges automatically calculate optimal attachment points
- **FR-1.3.3**: Two edge styles: Organic (bezier) and Circuit (orthogonal)
- **FR-1.3.4**: Edge labels display relationship type
- **FR-1.3.5**: Edges have directional arrows (source → target)

---

### 2. **Node Type System**

#### 2.1 Built-in Node Types
- **FR-2.1.1**: **Database Node** - Represents data stores with schema
- **FR-2.1.2**: **API Node** - Represents REST/GraphQL endpoints
- **FR-2.1.3**: **Frontend Node** - Represents UI components/pages
- **FR-2.1.4**: **Hook Node** - Represents React hooks or utilities
- **FR-2.1.5**: **Standards Node** - Defines schemas for other node types
- **FR-2.1.6**: **Document Node** - General documentation/notes

#### 2.2 Schema-Driven Fields
- **FR-2.2.1**: Each node type has a configId linking to its schema
- **FR-2.2.2**: Standards nodes define field types (text, list, table, code)
- **FR-2.2.3**: Inspector renders fields based on schema definition
- **FR-2.2.4**: Custom node types can be created at runtime

#### 2.3 Node Payload
- **FR-2.3.1**: All domain data stored in flexible `payload` object
- **FR-2.3.2**: Common fields: title, content, tags, metadata
- **FR-2.3.3**: Type-specific fields defined by schema
- **FR-2.3.4**: Payload supports nested objects and arrays

---

### 3. **Inspector Panel**

#### 3.1 Layout & Navigation
- **FR-3.1.1**: Inspector slides in from right when node selected
- **FR-3.1.2**: Resizable split-pane layout (canvas | inspector)
- **FR-3.1.3**: Close button returns to full canvas view
- **FR-3.1.4**: Drag handle for panel title bar

#### 3.2 Properties Tab
- **FR-3.2.1**: Display all schema-defined fields
- **FR-3.2.2**: Inline editing with auto-save (debounced)
- **FR-3.2.3**: Field type renderers:
  - Text input for strings
  - Textarea for long text
  - Code editor for code blocks
  - Table editor for structured data
  - List editor for arrays
- **FR-3.2.4**: Validation based on field schema
- **FR-3.2.5**: Manual save button when auto-save disabled

#### 3.3 Editor Tab
- **FR-3.3.1**: Rich text editor powered by Tiptap
- **FR-3.3.2**: Markdown support (import/export)
- **FR-3.3.3**: Slash commands for quick formatting
- **FR-3.3.4**: Bubble menu for text selection actions
- **FR-3.3.5**: Support for:
  - Headings (H1-H6)
  - Bold, italic, underline, strikethrough
  - Lists (ordered, unordered, task lists)
  - Code blocks with syntax highlighting
  - Tables with cell editing
  - Links and images
  - Blockquotes
  - Horizontal rules
- **FR-3.3.6**: Character count display
- **FR-3.3.7**: Auto-save to `payload.content`

#### 3.4 Relations Tab
- **FR-3.4.1**: List all incoming edges (← sources)
- **FR-3.4.2**: List all outgoing edges (→ targets)
- **FR-3.4.3**: Create new relationships via node ID input
- **FR-3.4.4**: Delete existing relationships
- **FR-3.4.5**: Click relationship to navigate to connected node
- **FR-3.4.6**: Display relationship type (e.g., "uses", "serves")

#### 3.5 Governance Tab (Standards Nodes Only)
- **FR-3.5.1**: Visual schema editor for node type definitions
- **FR-3.5.2**: Add/remove field definitions
- **FR-3.5.3**: Configure field properties:
  - Field name
  - Field type
  - Required/optional
  - Default value
  - Validation rules
- **FR-3.5.4**: Set node type metadata (icon, color)
- **FR-3.5.5**: Changes propagate to all nodes of that type

---

### 4. **Toolbar**

#### 4.1 Workspace Controls
- **FR-4.1.1**: Workspace name display
- **FR-4.1.2**: Theme toggle (light/dark mode)
- **FR-4.1.3**: Settings menu access

#### 4.2 Ingest & Sync
- **FR-4.2.1**: "Ingest" button opens folder picker
- **FR-4.2.2**: Bulk import Markdown files from directory
- **FR-4.2.3**: Parse YAML frontmatter into node payload
- **FR-4.2.4**: Auto-sync toggle (enable/disable)
- **FR-4.2.5**: Manual sync button
- **FR-4.2.6**: Sync status indicator
- **FR-4.2.7**: Connected folder name display

#### 4.3 View Controls
- **FR-4.3.1**: Relationship mode switcher:
  - **All**: Show all edges
  - **Selected**: Show only edges connected to selected node
  - **Trace**: Show path between selected nodes
- **FR-4.3.2**: Edge style switcher (Organic | Circuit)
- **FR-4.3.3**: Search bar for filtering nodes
- **FR-4.3.4**: Tag filter dropdown

#### 4.4 Data Management
- **FR-4.4.1**: Seed database with example data
- **FR-4.4.2**: Clear all data (with confirmation)
- **FR-4.4.3**: Export workspace to JSON
- **FR-4.4.4**: Import workspace from JSON

---

### 5. **Spatial Sidebar (Navigation & Palette)**

#### 5.1 System Navigation
- **FR-5.1.1**: **Perspectives** - Users can create and switch between multiple spatial "views" or "graphs" within the same workspace.
- **FR-5.1.2**: **Entity Library** - A searchable list of all actual nodes in the database, draggable onto any perspective.
- **FR-5.1.3**: **Architectural Palette** - A launcher for new node types.

#### 5.2 Autoregistration (Node Creation)
- **FR-5.2.1**: The palette is auto-populated from **Standards** nodes in the database.
- **FR-5.2.2**: Click to spawn a new node at viewport center.
- **FR-5.2.3**: Drag to spawn at a specific canvas position.
- **FR-5.2.4**: Supports "Core Templates" (Note, Task, Record) and "Custom Standards".

---

### 6. **Data Persistence**

#### 6.1 Local Database (IndexedDB)
- **FR-6.1.1**: All data stored in Dexie (IndexedDB wrapper)
- **FR-6.1.2**: Two tables: `nodes` and `edges`
- **FR-6.1.3**: Reactive queries with `useLiveQuery`
- **FR-6.1.4**: Automatic re-renders on data changes
- **FR-6.1.5**: Workspace scoping via `workspaceId`

#### 6.2 Event-Driven Sync
- **FR-6.2.1**: **EventBus** - All system-wide updates emit signals to a centralized nervous system.
- **FR-6.2.2**: **SyncManager** - An orchestrator that listens for events and triggers persistence tasks.
- **FR-6.2.3**: **FSASyncAdapter** - Dedicated worker that serializes nodes to Markdown/YAML and writes to the browser's File System Access API.
- **FR-6.2.4**: Push-based persistence ensures data integrity without UI overhead.

#### 6.3 Import/Export
- **FR-6.3.1**: Import directory of Markdown files
- **FR-6.3.2**: Export all nodes to Markdown files
- **FR-6.3.3**: Preserve directory structure
- **FR-6.3.4**: Handle binary files (images, PDFs)

---

### 7. **AI-Powered Features**

#### 7.1 Node Generation
- **FR-7.1.1**: Generate related nodes from context
- **FR-7.1.2**: Example: Database → API endpoints
- **FR-7.1.3**: Example: API → Frontend components
- **FR-7.1.4**: Example: Documentation → Implementation
- **FR-7.1.5**: Automatic relationship creation

#### 7.2 AI Integration
- **FR-7.2.1**: `/api/generate` endpoint for AI calls
- **FR-7.2.2**: Context-aware prompts from node data
- **FR-7.2.3**: Streaming responses for long generations
- **FR-7.2.4**: Prompt modal for user input
- **FR-7.2.5**: Generation history tracking

#### 7.3 Smart Suggestions
- **FR-7.3.1**: Suggest missing relationships
- **FR-7.3.2**: Recommend node types based on content
- **FR-7.3.3**: Auto-complete for node titles
- **FR-7.3.4**: Schema validation suggestions

---

### 8. **Search & Filtering**

#### 8.1 Node Search
- **FR-8.1.1**: Full-text search across all node content
- **FR-8.1.2**: Search by title, tags, type
- **FR-8.1.3**: Fuzzy matching for typos
- **FR-8.1.4**: Search results highlight on canvas

#### 8.2 Filtering
- **FR-8.2.1**: Filter by node type
- **FR-8.2.2**: Filter by tags
- **FR-8.2.3**: Filter by date range
- **FR-8.2.4**: Combine multiple filters (AND/OR)

#### 8.3 Graph Queries
- **FR-8.3.1**: Find all nodes connected to X
- **FR-8.3.2**: Find shortest path between A and B
- **FR-8.3.3**: Find orphaned nodes (no edges)
- **FR-8.3.4**: Find circular dependencies

---

### 10. **Keyboard Shortcuts**

#### 10.1 Canvas Navigation
- **FR-10.1.1**: Pan canvas with arrow keys (Shift+Arrow for faster pan)
- **FR-10.1.2**: Zoom in/out with Ctrl/Cmd + Plus/Minus
- **FR-10.1.3**: Fit view to all nodes (Ctrl/Cmd+0)
- **FR-10.1.4**: Fit view to selected nodes (Ctrl/Cmd+Shift+0)
- **FR-10.1.5**: Reset zoom to 100% (Ctrl/Cmd+1)

#### 10.2 Node Operations
- **FR-10.2.1**: Delete selected node (Delete or Backspace)
- **FR-10.2.2**: Duplicate selected node (Ctrl/Cmd+D)
- **FR-10.2.3**: Copy selected node (Ctrl/Cmd+C)
- **FR-10.2.4**: Paste copied node (Ctrl/Cmd+V)
- **FR-10.2.5**: Deselect (Escape)
- **FR-10.2.6**: Open node inspector (Enter or Double-click)

#### 10.3 Inspector & Editing
- **FR-10.3.1**: Close inspector panel (Escape)
- **FR-10.3.2**: Switch inspector tabs (Ctrl/Cmd+1-5 for tabs 1-5)
- **FR-10.3.3**: Save changes (Ctrl/Cmd+S)
- **FR-10.3.4**: Focus search in inspector (Ctrl/Cmd+F)

#### 10.4 Search & Filtering
- **FR-10.4.1**: Open global search (Ctrl/Cmd+K or Ctrl/Cmd+P)
- **FR-10.4.2**: Focus search bar (Ctrl/Cmd+F)
- **FR-10.4.3**: Clear search (Escape when search focused)
- **FR-10.4.4**: Navigate search results (Up/Down arrows)

#### 10.5 View Modes & Display
- **FR-10.5.1**: Toggle relationship mode (Ctrl/Cmd+R)
- **FR-10.5.2**: Cycle edge styles (Ctrl/Cmd+E)
- **FR-10.5.3**: Toggle theme (Ctrl/Cmd+Shift+T)
- **FR-10.5.4**: Toggle sidebar (Ctrl/Cmd+B)
- **FR-10.5.5**: Toggle mini-map (Ctrl/Cmd+M)

#### 10.6 Customization & Help
- **FR-10.6.1**: Keyboard shortcuts displayed in tooltips
- **FR-10.6.2**: Shortcuts help panel (Ctrl/Cmd+? or F1)
- **FR-10.6.3**: Platform-aware shortcuts (Cmd on Mac, Ctrl on Windows/Linux)
- **FR-10.6.4**: Configurable shortcuts via settings (future enhancement)

---

### 11. **Collaboration Features** (Future)

#### 11.1 Real-time Sync
- **FR-11.1.1**: WebSocket connection for live updates
- **FR-11.1.2**: Cursor presence indicators
- **FR-11.1.3**: Conflict resolution for concurrent edits
- **FR-11.1.4**: Activity feed

#### 11.2 Sharing
- **FR-11.2.1**: Generate shareable links
- **FR-11.2.2**: Export to static HTML
- **FR-11.2.3**: Embed canvas in other apps
- **FR-11.2.4**: Permission management

---

## 🎨 UI/UX Requirements

### Design System
- **UX-1**: Dark mode by default (neutral-950 background)
- **UX-2**: Consistent spacing (8px grid system)
- **UX-3**: Smooth animations (framer-motion)
- **UX-4**: Accessible color contrast (WCAG AA)
- **UX-5**: Keyboard navigation support
- **UX-6**: Responsive layout (mobile-friendly)

### Keyboard Navigation
- **UX-7**: All major features accessible via keyboard
- **UX-8**: Visual feedback for keyboard focus states
- **UX-9**: Keyboard shortcuts follow platform conventions
- **UX-10**: Shortcuts help accessible via Ctrl/Cmd+?

### Node Customization
- **UX-11**: Appearance changes preview in real-time
- **UX-12**: Color picker with preset palette
- **UX-13**: Icon picker with search functionality
- **UX-14**: Appearance settings accessible from inspector


### Performance
- **PERF-1**: Canvas renders 1000+ nodes smoothly
- **PERF-2**: Debounced input (prevent re-renders)
- **PERF-3**: Virtualized lists for large datasets
- **PERF-4**: Lazy loading for off-screen nodes
- **PERF-5**: IndexedDB queries < 50ms

---

## 🔧 Technical Requirements

### Browser Support
- **TECH-1**: Chrome/Edge 90+
- **TECH-2**: Firefox 88+
- **TECH-3**: Safari 14+
- **TECH-4**: File System Access API required

### Dependencies
- **TECH-5**: Next.js 16+ (App Router)
- **TECH-6**: React 19+
- **TECH-7**: TypeScript 5+
- **TECH-8**: Tailwind CSS 4+

### Data Schema
- **TECH-9**: HorizonNode interface with generic payload
- **TECH-10**: HorizonEdge interface for relationships
- **TECH-11**: Dexie v4 for IndexedDB
- **TECH-12**: Zustand for UI state

---

## 📊 Success Metrics

### User Engagement
- **METRIC-1**: Average session duration > 15 minutes
- **METRIC-2**: Nodes created per session > 10
- **METRIC-3**: Return user rate > 60%

### Performance
- **METRIC-4**: Time to first render < 2 seconds
- **METRIC-5**: Canvas interaction latency < 16ms (60fps)
- **METRIC-6**: Database query time < 50ms

### Quality
- **METRIC-7**: Zero data loss incidents
- **METRIC-8**: Sync success rate > 99%
- **METRIC-9**: User-reported bugs < 5 per month

---

## 🚀 Implementation Phases

### Phase 1: Core Canvas
- Infinite canvas with pan/zoom
- Basic node types (Database, API, Frontend)
- Edge rendering with smart paths
- Inspector panel with tabs
- Local IndexedDB storage

### Phase 2: Rich Editing
- Tiptap editor integration
- Markdown import/export
- Schema-driven fields
- Governance editor

### Phase 3: File System Sync
- File System Access API integration
- EventBus and SyncManager architecture
- Bulk ingest from directory
- YAML frontmatter parsing

### Phase 4: Enhanced Interaction
- Keyboard shortcuts system
- Node appearance customization UI
- Keyboard shortcuts help panel

### Phase 5: Hybrid Spatial OS
- Perspectives and Multiple View support
- Integrated Entity Library
- Autoregistration from Standards
- Noir Editorial design implementation

### Phase 6: AI Features
- `/api/generate` endpoint
- Context-aware generation
- Prompt modal UI
- Generation history

### Phase 7: Advanced Features
- Full-text search
- Graph queries
- Export to static HTML
- Collaboration features

---

## 📝 Notes

### Design Decisions
1. **Why IndexedDB?** - Browser-native, no server required, works offline
2. **Why Dexie?** - Reactive queries, better DX than raw IndexedDB
3. **Why Zustand?** - Minimal boilerplate, no context hell
4. **Why @xyflow/react?** - Battle-tested, performant, extensible

### Known Limitations
- File System Access API not available in all browsers
- Large graphs (10k+ nodes) may impact performance
- No built-in version control (use Git for Markdown files)

### Future Considerations
- Plugin system for custom node types
- Cloud sync option (optional)
- Mobile app (React Native)
- VS Code extension

---

**Document Status**: Living Document  
**Maintained By**: Development Team  
**Review Cycle**: Bi-weekly