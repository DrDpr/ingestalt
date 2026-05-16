---
id: node_ui_relationship_panel
configId: node_standards_frontend
title: Relationship Panel
type: frontend
icon: Link
color: '#a855f7'
tags: [inspector, relationships, topology, edges]
relations:
  - targetId: node_ui_inspector
    type: contained-by
    label: Topology management tab
  - targetId: node_db_horizon
    type: reads-writes
    label: Edge management
---

# Relationship Panel

## Purpose
The central hub for managing the bidirectional relationships (edges) of a node. It allows users to define dependencies, data flows, and structural parent-child relationships within the spatial graph.

## Architecture

### 1. Bidirectional Tracking
The panel automatically separates and displays relationships based on their directionality relative to the current node:
- **Dependencies (Outgoing Edges)**: Nodes that the current node "reads from," "uses," or "implements."
- **Dependents (Incoming Edges)**: Nodes that "read from" or "use" the current node.

### 2. Relational Schema
Relationships are structured as `HorizonEdge` objects in the database, with a payload containing:
- `type`: The semantic type (e.g., `reads`, `writes`, `contains`).
- `label`: An optional descriptive label for the edge.

## Key Features

- **Semantic Selection**: Dropdown for standard relationship types (defined in `standards_core`).
- **Interactive Navigation**: Clicking a related node's title instantly navigates the canvas to and selects that node.
- **Batch Management**: Ability to quickly add multiple relationships or delete existing ones.
- **Labeling**: Inline editing of edge labels for high-fidelity architectural mapping.

## Key Components

- **EdgeRow**: A compact, monospace row for individual relationship management.
- **NodeSelector**: A searchable list for selecting target nodes for new edges.

## Data Flow

1. **Query**: The panel uses `useLiveQuery` to find all edges where `sourceId === node.id` OR `targetId === node.id`.
2. **Resolution**: Related node IDs are resolved to their full `HorizonNode` objects to display titles and icons.
3. **Modification**: When an edge is updated, the `lastModified` timestamp is bumped, triggering a sync to the associated Markdown files.

## Relations
- **Contained by:** `ui_inspector`
- **Reads/Writes:** `db_horizon` (Edges table)
- **Implements:** `standards_core` (Relation types)
