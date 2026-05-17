# Ingestalt Dynamic Schema & YAML Frontmatter Reference Guide

This document serves as the official dynamic schema reference for the Ingestalt spatial mapping engine. Configure these fields in your note's frontmatter to unlock custom, interactive parameter panels in the Properties Workspace.

---

## 1. Core Header & Identity Attributes
Every physical note inside your workspace supports these identity, spatial, and visual layout variables:

```yaml
title: "User Profile Controller"
type: "api"
icon: "Cpu"
color: "#3b82f6"
tags:
  - "auth"
  - "controller"
filepath: "src/controllers/UserController.ts"
filename: "UserController.ts"
configId: "microservice"
position:
  x: 250
  y: 420
```

### Attributes Breakdown:
- `title`: (String) The visual card name on the spatial flow canvas. If omitted, falls back to the first H1 heading (`# Title`) parsed from the Markdown content.
- `type`: (String) Core base classification (e.g. `api`, `database`, `frontend`, `hook`, `note`, `ai-task`).
- `configId` (or `config_id`): (String) Binds the node card to a specific custom Standards Blueprint configuration definitions schema.
- `position`: (Object) Holds absolute canvas `x` and `y` grid offsets to persist note card positions on the spatial board.

---

## 2. Dynamic Field Types Reference
Ingestalt's Node Types Editor supports 7 distinct data types, mapping frontmatter parameters to structured visual interfaces.

### A. Plain Text (`type: text`)
Standard single-line text input fields or custom parameters.
```yaml
description: "Standard string representation or custom configuration payload."
```

### B. File Path (`type: file_path`)
Deep-linked local file paths. Renders with an active lightning bolt (`⚡`) launch trigger to open the code directly inside your IDE.
```yaml
filepath: "src/components/layout/AppHeader.tsx"
```

### C. Method & Interface List (`type: interface_list`)
Structured table for API methods, controller routines, or handler classes.
```yaml
methods:
  - name: "fetchUsers"
    params: "limit: number, offset: number"
    returns: "Promise<User[]>"
    line: 45
  - name: "createUser"
    params: "data: CreateUserDto"
    returns: "Promise<User>"
    line: 110
```

### D. Database Tables List (`type: tables_list`)
Manage table definitions, schemas, typing constraints, and primary or unique index keys.
```yaml
tables:
  - name: "users"
    columns:
      - name: "id"
        type: "uuid"
        primary: true
      - name: "email"
        type: "varchar(255)"
        unique: true
      - name: "created_at"
        type: "timestamp"
```

### E. Code Snippet Cards (`type: code_list`)
Interactive container blocks to store and visually display code snippets.
```yaml
snippets:
  - label: "Query Filter"
    language: "typescript"
    code: "const activeUsers = users.filter(u => u.status === 'active');"
```

### F. User Story Checklist (`type: story_list`)
Tickable checkboxes mapping development features, stories, or functional goals. Checkbox state writes back directly to YAML booleans.
```yaml
stories:
  - text: "User can successfully authenticate using OAuth credentials."
    completed: true
  - text: "System enforces strict session expiration after 30 minutes."
    completed: false
```

### G. Process Flow List (`type: flow_list`)
Numbered sequence of steps mapping controller actions, data loading cycles, or hooks execution flow.
```yaml
process:
  - step: 1
    label: "Decrypt Auth Token"
    desc: "Authenticate signature via decrypting standard RSA JWT keys."
  - step: 2
    label: "Authorize Scopes"
    desc: "Validate scope permissions block against requested route attributes."
```

---

## 3. Visual Coordination Attributes (`icon`, `color`)
Ingestalt uses custom aesthetic decorators to color-code cards and fields dynamically:

### A. Lucide Icons (`icon`)
Pass any valid Lucide icon string identifier to draw the icon at the top of the node card or field header.
*Popular Examples:*
- `Database`, `Wifi`, `Layout`, `Activity`, `BookOpen`, `Cpu`, `Layers`, `Settings`, `Bot`, `HardDrive`, `Share2`, `FileText`

### B. Theme Accent Colors (`color`)
Define visual border and header brand colors in Hex values.
*Recommended Palette:*
- Blue: `"#3b82f6"`
- Green: `"#22c55e"`
- Purple: `"#a855f7"`
- Orange/Amber: `"#f59e0b"`
- Teal: `"#14b8a6"`
- Rose: `"#f43f5e"`

---

## 4. Custom Standards Blueprint Schema (`type: standards`)
To define custom note schemas that teammates can load and share, design a standard definition blueprint note using this exact frontmatter syntax:

```yaml
title: "Custom Templates Blueprint"
type: "standards"
definitions:
  - id: "microservice"
    type: "Backend Microservice"
    icon: "Cpu"
    color: "#a855f7"
    fields:
      - name: "endpoints"
        type: "interface_list"
        icon: "Zap"
        color: "#a855f7"
      - name: "filepath"
        type: "file_path"
        icon: "FileText"
        color: "#94a3b8"
```

---

## 5. Spatial Board Connection Linkages (`relations`)
Bi-directional canvas connection edges are automatically persisted inside the note's frontmatter under the `relations` key:

```yaml
relations:
  - targetId: "node_db_postgres"
    type: "depends_on"
  - targetId: "node_api_auth"
    type: "references"
```

Each relation object specifies:
- `targetId` (or `target`): The unique ID of the target note card.
- `type`: The relationship type (e.g. `depends_on`, `implements`, `references`).
- `metadata`: Optional additional key-value annotations mapping the relation.

---
*Ingestalt Visual Workspace Engine • High-Fidelity Systems Engineering*
