---
id: node_ui_ai_task_builder
configId: node_standards_frontend
title: AI Task Prompt Builder
type: frontend
icon: Sparkles
color: '#8b5cf6'
tags: [ai, prompt-engineering, context, injection]
relations:
  - targetId: node_ui_inspector
    type: contained-by
    label: Inspector sub-panel
  - targetId: node_api_parser
    type: references
    label: Content parsing logic
---

# AI Task Prompt Builder

## Purpose
A high-fidelity prompt engineering interface that allows users to curate precise architectural context for AI agents. It transforms raw node data into surgical context injections, reducing token waste and improving AI output quality.

## Architecture

### 1. Context Injection Pipeline
The system aggregates data from three primary architectural layers:
- **Markdown Content**: The raw descriptive text of the node.
- **Node Properties**: Domain-specific payload data (JSON).
- **Graph Relationships**: Incoming and outgoing edges representing the system topology.

### 2. Architectural Field Selection
Instead of injecting entire JSON blobs, the builder provides a granular selection UI:
- **Deep Unraveling**: Recursively discovers sub-properties in complex objects and tables (Array of Objects).
- **Column Selection**: For tables, users can select specific columns (e.g., just `id` and `title`) to inject.
- **Grouping**: Fields are grouped by parent key with "All/None" batch toggles.

### 3. Heuristic Schema Discovery
For `database` nodes, the system implements an "Intelligent Scanning" layer:
- **Regex Discovery**: Parses Markdown content for `interface` and `class` definitions.
- **Virtual Properties**: Surfaces discovered fields as selectable "Architectural Fields" even if they are not stored in the YAML frontmatter.
- **Singular/Plural Matching**: Automatically links plural table names in payload to singular interface definitions in content.

## Key Components

- **AITaskPromptBuilder**: Main container and prompt assembly logic.
- **ContextToggle**: Visual switches for high-level context layers.
- **FieldSelector**: Monospace grid of sub-property toggles grouped by architectural parent.

## Data Flow

1. **Discovery**: `availablePaths` and `virtualSchema` memos scan the node payload and content.
2. **Curation**: User selects specific fields; state is managed via a `Set<string>` of dot-notated paths.
3. **Synthesis**: `contextContent` memo filters the payload and formats the final Markdown string.
4. **Injection**: The result is wrapped in a `# ARCHITECTURAL CONTEXT` header for AI consumption.

## Implementation Details

### Heuristic Scanner Regex
```typescript
/interface\s+(\w+)\s*{([\s\S]*?)\n}/g
```
*Handles multiline definitions and nested braces (e.g., coordinates or nested objects).*

### Path Labeling
The UI uses a "Leaf-Only" labeling strategy for deep paths:
- `payload.metrics.latency` -> Label: `latency`
- `schema.HorizonNode.id` -> Label: `id`

## Relations
- **Contained by:** `ui_inspector`
- **Reads from:** `db_horizon`
- **References:** `api_parser` (for structural consistency)
