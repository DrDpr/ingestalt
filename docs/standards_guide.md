# Ingestalt Standards & Definitions Guide

This guide outlines the standards for documenting and defining nodes within the Ingestalt spatial documentation engine. Adhering to these standards ensures that both humans and AI agents can maintain a consistent, high-fidelity visualization of the system architecture.

## 1. The Definition Schema

Every core standards document should contain a `definitions` block in its YAML frontmatter. This block defines the metadata for specific node types, including their visual representation and data fields.

### Structure

```yaml
definitions:
  - id: node_standards_type_name
    type: type_name
    icon: LucideIconName
    color: '#hexcolor'
    fields:
      - name: field_name
        type: field_type
        icon: OptionalIcon
        color: '#optionalcolor'
```

### Purpose
- **Visual Consistency**: Maps node types to specific colors and icons.
- **Data Integrity**: Defines which fields are expected for specific node types.
- **AI Guidance**: Provides a clear schema for AI agents to follow when generating or updating documentation.

---

## 2. Colors & Icons

Consistency in color and iconography is critical for spatial navigation.

| Type | Color | Icon | Description |
| :--- | :--- | :--- | :--- |
| **Database** | `#3b82f6` (Blue) | `Database` | Tables, schemas, and persistence layers. |
| **API** | `#22c55e` (Green) | `Network` | Endpoints, services, and data parsers. |
| **Frontend** | `#a855f7` (Purple) | `Layout` | UI components, pages, and layouts. |
| **Hook** | `#f59e0b` (Orange) | `Zap` | React hooks and state management logic. |
| **State** | `#ec4899` (Pink) | `Activity` | Global state stores and transitions. |
| **Standards** | `#fbbf24` (Yellow) | `Star` | Core principles and architectural rules. |
| **Task** | `#8b5cf6` (Violet) | `Sparkles` | AI tasks or actionable items. |

---

## 3. Node Configuration (`configId`)

Instead of repeating definitions in every file, use the `configId` field in the frontmatter to reference a definition defined in `standards_core.md` or other standards files.

```yaml
---
id: my_new_node
configId: node_standards_database
type: database
title: User Database
---
```

---

## 4. Relationship Standards

Relationships should use standardized types to enable meaningful graph analysis.

- `reads` / `writes`: Data flow.
- `calls`: Execution flow.
- `implements`: Conformance to a standard.
- `uses`: General dependency.
- `contains`: Composition/Parent-child relationship.

---

## 5. Implementation Workflow for AI Agents

When creating or modifying documentation in the `_ingestalt` directory:

1.  **Check `standards_core.md`**: Identify the appropriate `configId` for the node you are working on.
2.  **Apply Frontmatter**: Ensure `id`, `configId`, `type`, `title`, and `relations` are present.
3.  **Append, Don't Reduce**: When updating existing files, add missing configuration metadata and fields rather than removing existing content.
4.  **Use Semantic Fields**: Use fields like `methods`, `filepath`, `endpoints`, or `tables` as defined in the schema to provide structured data for the Inspector.
