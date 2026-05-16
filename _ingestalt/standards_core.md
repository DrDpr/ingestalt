---
id: node_standards_core
title: Core Standards
type: standards
tags: [standards, conventions, architecture, patterns]
relations:
  - targetId: node_api_parser
    type: implemented-by
    label: Node structure standards
  - targetId: node_ui_node_horizon
    type: implemented-by
    label: Node type standards
---

# Core Standards

## Purpose
Defines the core standards, conventions, and patterns used throughout the Ingestalt system for consistency and maintainability.

## Key Files
- This documentation file serves as the central reference for standards
- Standards are implemented across all components

## Architecture

### Node Type Standards

**Supported Node Types:**
```typescript
type NodeType = 
  | 'database'    // Database tables, schemas
  | 'api'         // API endpoints, services
  | 'frontend'    // UI components, pages
  | 'hook'        // React hooks, utilities
  | 'other'       // Generic documentation
  | 'standards'   // Standard definitions
  | 'horizonDoc'  // Horizon documentation
  | 'ai-task';    // AI-generated tasks
```

**Type Characteristics:**

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| database | Blue/Cyan | Database | Tables, schemas, queries |
| api | Green | Server | Endpoints, services, APIs |
| frontend | Purple/Pink | Component | UI components, pages |
| hook | Orange | Code | React hooks, utilities |
| other | Gray | Document | Generic documentation |
| standards | Yellow | Star | Standards, patterns |
| horizonDoc | Indigo | Book | System documentation |
| ai-task | Violet | Sparkles | AI-generated tasks |

### Frontmatter Schema

**Required Fields:**
```yaml
---
id: node_unique_id          # Unique identifier
title: Node Title           # Human-readable name
type: database              # Node type (see above)
---
```

**Optional Fields:**
```yaml
---
tags: [tag1, tag2]         # Searchable tags
position:                   # Canvas position
  x: 100
  y: 200
relations:                  # Edges to other nodes
  - targetId: node_other_id
    type: reads
    label: Optional description
configId: node_standards_database  # Config reference
---
```

### Relationship Types

**Standard Relationship Types:**
```typescript
type RelationType =
  | 'reads'           // Reads data from
  | 'writes'          // Writes data to
  | 'calls'           // Invokes/calls
  | 'implements'      // Implements interface/standard
  | 'extends'         // Extends/inherits from
  | 'uses'            // Uses/depends on
  | 'contains'        // Contains/includes
  | 'references'      // References/links to
  | 'alternative-to'  // Alternative implementation
  | 'used-by';        // Used by (inverse)
```

**Relationship Semantics:**
- **reads:** Data flow (source reads from target)
- **writes:** Data flow (source writes to target)
- **calls:** Control flow (source invokes target)
- **implements:** Conformance (source implements target standard)
- **extends:** Inheritance (source extends target)
- **uses:** Dependency (source depends on target)
- **contains:** Composition (source contains target)

### Naming Conventions

**Node IDs:**
```
Format: node_{type}_{name}
Examples:
  - node_db_users
  - node_api_getUser
  - node_ui_canvas
  - node_standards_core
```

**Edge IDs:**
```
Format: edge_{sourceId}_{targetId}
Example: edge_node_api_getUser_node_db_users
```

**Workspace IDs:**
```
Format: workspace_{name}
Example: workspace_ingestalt
```

### File Organization

**Project Structure:**
```
project/
├── _ingestalt/              # Architecture docs
│   ├── api_*.md            # API documentation
│   ├── ui_*.md             # UI documentation
│   ├── db_*.md             # Database documentation
│   └── standards_*.md      # Standards documentation
├── docs/                    # User documentation
├── src/                     # Source code
└── README.md               # Project overview
```

**Documentation Naming:**
```
Format: {category}_{name}.md
Examples:
  - api_parser.md
  - ui_canvas.md
  - db_horizon.md
  - standards_core.md
```

### Code Standards

**TypeScript:**
- Strict mode enabled
- Explicit return types for functions
- Interface over type for objects
- Descriptive variable names

**React:**
- Functional components
- Hooks for state management
- Props interfaces defined
- Memoization for performance

**Styling:**
- Tailwind CSS utility classes
- Component-scoped styles
- Consistent spacing scale
- Theme variables for colors

### Database Standards

**Node Structure:**
```typescript
interface HorizonNode {
  id: string;              // Required: Unique ID
  configId: string;        // Required: Type reference
  workspaceId: string;     // Required: Workspace
  position: Position;      // Required: Canvas position
  lastModified: number;    // Required: Timestamp
  payload: {
    title: string;         // Required: Display name
    content: string;       // Required: Markdown content
    tags: string[];        // Required: Empty array if none
    type: string;          // Required: Node type
    [key: string]: any;    // Optional: Domain fields
  };
}
```

**Edge Structure:**
```typescript
interface HorizonEdge {
  id: string;              // Required: Unique ID
  workspaceId: string;     // Required: Workspace
  sourceId: string;        // Required: Source node
  targetId: string;        // Required: Target node
  lastModified: number;    // Required: Timestamp
  payload: {
    type: string;          // Required: Relationship type
    label?: string;        // Optional: Display label
    [key: string]: any;    // Optional: Domain fields
  };
}
```

### UI Standards

**Component Structure:**
```typescript
// 1. Imports
import { useState } from 'react';
import { ComponentProps } from './types';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export function Component({ prop1, prop2 }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

**Accessibility:**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Screen reader support

### Error Handling

**Standard Pattern:**
```typescript
try {
  await operation();
} catch (error) {
  console.error('[Context] Error message:', error);
  // Show user-friendly error
  showToast('Operation failed. Please try again.');
}
```

**Error Logging:**
- Prefix with context: `[Parser]`, `[Canvas]`, etc.
- Include relevant details
- Don't expose sensitive data
- Provide actionable messages

## Dependencies
- None (this is the foundational standard)

## Relations
- **Implemented by:** All components
- **Referenced by:** [`api_parser`](./api_parser.md) - Node structure
- **Referenced by:** [`ui_node_horizon`](./ui_node_horizon.md) - Node types

## Key Concepts

### Consistency
Standards ensure consistency across:
- Code structure
- Naming conventions
- Data models
- UI patterns
- Error handling

### Extensibility
Standards designed for extension:
- New node types can be added
- New relationship types supported
- Custom fields in payload
- Plugin architecture (future)

### Documentation-First
Architecture documented before implementation:
- Clear specifications
- Shared understanding
- Easier onboarding
- Better maintenance

### Type Safety
TypeScript for type safety:
- Compile-time checks
- IDE autocomplete
- Refactoring support
- Self-documenting code

### Local-First Principles
- Data stored locally
- Offline functionality
- User owns data
- No server dependency
- Privacy by default