# Standards & Data Engineering

Ingestalt is built on a "Flexible Standard" system. You can define how different types of nodes should look and what data they should carry.

## Supported Node Types

By default, Ingestalt supports several specialized architectural types:
- **Database**: Schemas, tables, and data models.
- **API**: Endpoints, methods, and services.
- **Frontend**: Pages, components, and UI logic.
- **Hook**: Logic-only React components and utilities.
- **Standards**: Definitions of other node types.

## Supported Data Interpreters

When you define a standard, you can use these specialized data types to render rich UI in the Inspector:

| Data Type | UI Interpreter | Behavior |
|-----------|----------------|----------|
| `tables_list` | **Tables View** | Renders named tables with column definitions. Supports "Intelligent Hydration." |
| `interface_list` | **Interface View** | Renders method lists with descriptions and "Jump to Code" (Zap) buttons. |
| `code_list` | **Snippet View** | Renders copyable code blocks with custom names. |
| `story_list` | **Checklist** | Renders interactive checkboxes for requirements/stories. |
| `flow_list` | **Process View** | Renders a numbered sequence of steps for logic flow documentation. |
| `file_path` | **Path Input** | Renders a path field with an "Open in VS Code" button. |

## How to Build a Standard

Standards are defined as nodes themselves (usually with `type: standards`).

### Example: Defining a "Microservice" Standard
```yaml
id: node_standards_microservice
type: standards
definitions:
  - id: microservice
    icon: Cloud
    color: '#06b6d4'
    fields:
      - name: endpoints
        type: interface_list
      - name: port
        type: string
      - name: repository
        type: file_path
```

## Creating Custom Data Schemas
To ensure the **Property Interpreters** render correctly, follow these JSON/YAML structures in your node payload:

### Tables List
```yaml
tables:
  - name: users
    columns: [id, username, email]
```

### Interface List
```yaml
methods:
  - name: getUser
    description: Fetches a user by ID
```

### Flow List
```yaml
steps:
  - action: Initialize
    description: Setup database connection
  - action: Fetch
    description: Execute the query
```
