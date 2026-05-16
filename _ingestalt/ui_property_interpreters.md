---
id: node_ui_property_interpreters
configId: node_standards_frontend
title: Property Interpreters
type: frontend
icon: Cpu
color: '#3b82f6'
tags: [inspector, dynamic-ui, rendering, schema]
relations:
  - targetId: node_ui_inspector
    type: contained-by
    label: Primary property view
  - targetId: node_standards_core
    type: implements
    label: Follows field type standards
---

# Property Interpreters

## Purpose
A modular rendering system that dynamically adapts the inspector UI based on the `configId` and field types defined in the system standards. It transforms raw payload data into domain-specific interactive controls.

## Architecture

### 1. PayloadInterpretersView
The top-level coordinator that:
- Loads the `standardDef` for the current node.
- Maps payload keys to specialized interpreters.
- Implements **Intelligent Hydration** (merging Markdown schemas into payload views).
- Handles "Orphaned" schemas discovered via heuristic scanning.

### 2. Standard Interpreters

| Interpreter | Field Type | Data Structure | Purpose |
|-------------|------------|----------------|---------|
| **SchemaTable** | `schema_table` | Array of Strings | Renders a table of columns/indices with selection support. |
| **TablesList** | `tables_list` | Array of Objects | Renders multiple named tables with their columns. |
| **InterfaceList** | `interface_list`| Array of Objects | Renders method lists with "Jump to Code" capabilities. |
| **CodeList** | `code_list` | Array of Objects | Renders named code snippets with copy-to-clipboard. |
| **UserStoryList**| `story_list` | Array of Strings | Renders a checklist of user stories/requirements. |
| **ProcessFlow** | `flow_list` | Array of Objects | Renders a numbered sequence of steps with descriptions. |

## Advanced Features

### Intelligent Hydration
When a node is a `database` type, the system performs a fuzzy match between the `tables` payload and any `interface` definitions found in the Markdown content. 
- **Pluralization Handling**: Automatically matches `nodes` -> `HorizonNode`.
- **Injection**: Injects discovered columns into "empty" payload tables automatically.

### Code Navigation
The `InterfaceList` interpreter integrates with the `api_parser` and `FileSystem` hooks to allow direct navigation from the inspector to the source code:
- **locateMethodInFile**: Heuristically finds the line number of a method in the associated `.ts` file.
- **openInCode**: Jumps directly to the line in VS Code.

## Key Components

- **LocalInput / LocalTextArea**: Monospace, high-density inputs optimized for the Noir Editorial design system.
- **DynamicIcon**: Resolves icon names from the standard definition to Lucide components.

## Data Flow

1. **Detection**: `PayloadInterpretersView` identifies the `configId`.
2. **Discovery**: `discoveredSchema` memo scans `node.payload.content`.
3. **Hydration**: `enrichedData` loop merges payload strings with discovered objects.
4. **Rendering**: The standard field list is iterated, rendering the appropriate modular sub-component for each field type.

## Relations
- **Contained by:** `ui_inspector`
- **Implements:** `standards_core` (defines the `tables_list`, `interface_list`, etc., types)
