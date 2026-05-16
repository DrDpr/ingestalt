---
id: node_1778950064037_manual_inspector
configId: node_standards_other
position:
  x: 1000
  'y': 450
title: 'Modular Inspector Guide'
tags: []
type: other
filename: manual_inspector.md
---
# The Modular Inspector

The **Modular Inspector** is the control panel for fine-grained metadata curation, documentation editing, and AI prompt building.

## 1. Tabbed Operations

The Inspector is split into four contextual tabs, adapting to the selected node:

### Content Tab
- **Rich Editor**: A fully-featured Markdown workspace. Edits are immediately autosaved to IndexedDB and written to your local file (if live push is enabled).
- **Standards Check**: Highlights whether the node follows the standards of its `configId`.

### Relationships Tab
- **Bidirectional List**: Shows all outgoing and incoming relationships for the selected node.
- **Topology Editor**: Allows adding new relations or deleting existing ones via dropdowns.
- **Visual Filters**: Toggles relationship views in the main Toolbar (`Relations: All` vs `Selected` vs `Trace`).

### Properties Tab
- Renders specialized UI components based on the node's architectural `configId`:
  - **Tables List**: Edit database tables, fields, and types dynamically.
  - **Interface List**: Edit API endpoints, methods, parameters, and routes.
  - **Flow List**: Document multi-step processes or user-flows sequentially.
  - **Story Checklist**: Manage user stories and checklist items.
  - **File Path Input**: Direct file location reference with an **Open in VS Code (⚡)** button.

### AI Tasks Tab (Prompt Builder)
- **Granular Filter Toggles**: Selectively check or uncheck which components of the node (Markdown, properties, relations, schemas) to feed to the IDE's AI assistant.
- **Heuristic Virtual Fields**: Automatically pulls virtual models (e.g. interfaces and schemas defined in plain markdown) and includes them as selectable options.
- **Generate Prompt**: Generates a rich, grounded prompt block to copy to your clipboard.

## 2. Editorial Engineering
All properties edited inside the Inspector are serialized back into the frontmatter of your local `.md` file, making Ingestalt a transparent editor for your files.
