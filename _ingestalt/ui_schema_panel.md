---
id: node_ui_schema_panel
configId: node_standards_frontend
title: Schema Panel
type: frontend
icon: Layout
color: '#a855f7'
tags: [schema, database, editor, inspector]
components:
  - SchemaPanel
  - ColumnEditor
  - IndexEditor
  - ConstraintEditor
relations:
  - targetId: node_ui_inspector
    type: used-by
    label: Schema tab in inspector
  - targetId: node_db_horizon
    type: reads-writes
    label: Schema data
---

# Schema Panel

## Purpose
Specialized editor for database schema definitions, allowing users to define tables, columns, constraints, and relationships in a structured interface.

## Key Files
- [`lib/drdpr-horizon/components/inspector/SchemaPanel.tsx`](../lib/drdpr-horizon/components/inspector/SchemaPanel.tsx) - Schema editor component

## Architecture

### Component Structure

```typescript
export function SchemaPanel({ nodeId }: Props) {
  const node = useLiveQuery(() => db.nodes.get(nodeId), [nodeId]);
  const schema = node?.payload.schema || { columns: [], indexes: [] };
  
  return (
    <div className="schema-panel">
      <ColumnEditor
        columns={schema.columns}
        onChange={(columns) => updateSchema({ columns })}
      />
      
      <IndexEditor
        indexes={schema.indexes}
        onChange={(indexes) => updateSchema({ indexes })}
      />
      
      <ConstraintEditor
        constraints={schema.constraints}
        onChange={(constraints) => updateSchema({ constraints })}
      />
    </div>
  );
}
```

### Schema Data Structure

**Column Definition:**
```typescript
interface Column {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyRef?: {
    table: string;
    column: string;
  };
  isUnique: boolean;
  description?: string;
}
```

**Index Definition:**
```typescript
interface Index {
  name: string;
  columns: string[];
  isUnique: boolean;
  type: 'btree' | 'hash' | 'gin' | 'gist';
}
```

**Constraint Definition:**
```typescript
interface Constraint {
  name: string;
  type: 'check' | 'unique' | 'foreign_key';
  definition: string;
  columns: string[];
}
```

### Column Editor

**Component:**
```typescript
function ColumnEditor({ columns, onChange }: Props) {
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  
  const addColumn = () => {
    const newColumn: Column = {
      name: 'new_column',
      type: 'text',
      nullable: true,
      isPrimaryKey: false,
      isForeignKey: false,
      isUnique: false,
    };
    onChange([...columns, newColumn]);
  };
  
  const updateColumn = (index: number, updates: Partial<Column>) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };
  
  const deleteColumn = (index: number) => {
    onChange(columns.filter((_, i) => i !== index));
  };
  
  return (
    <div className="column-editor">
      <div className="editor-header">
        <h3>Columns</h3>
        <button onClick={addColumn}>
          <PlusIcon /> Add Column
        </button>
      </div>
      
      <table className="column-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Nullable</th>
            <th>PK</th>
            <th>FK</th>
            <th>Unique</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((column, index) => (
            <tr key={index}>
              <td>
                <input
                  value={column.name}
                  onChange={(e) => updateColumn(index, { name: e.target.value })}
                />
              </td>
              <td>
                <select
                  value={column.type}
                  onChange={(e) => updateColumn(index, { type: e.target.value })}
                >
                  <option value="text">Text</option>
                  <option value="integer">Integer</option>
                  <option value="bigint">BigInt</option>
                  <option value="uuid">UUID</option>
                  <option value="timestamp">Timestamp</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={column.nullable}
                  onChange={(e) => updateColumn(index, { nullable: e.target.checked })}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={column.isPrimaryKey}
                  onChange={(e) => updateColumn(index, { isPrimaryKey: e.target.checked })}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={column.isForeignKey}
                  onChange={(e) => updateColumn(index, { isForeignKey: e.target.checked })}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={column.isUnique}
                  onChange={(e) => updateColumn(index, { isUnique: e.target.checked })}
                />
              </td>
              <td>
                <button onClick={() => setEditingColumn(column)}>
                  <EditIcon />
                </button>
                <button onClick={() => deleteColumn(index)}>
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {editingColumn && (
        <ColumnDetailModal
          column={editingColumn}
          onSave={(updated) => {
            const index = columns.findIndex(c => c.name === editingColumn.name);
            updateColumn(index, updated);
            setEditingColumn(null);
          }}
          onClose={() => setEditingColumn(null)}
        />
      )}
    </div>
  );
}
```

### Column Detail Modal

**Extended Properties:**
```typescript
function ColumnDetailModal({ column, onSave, onClose }: Props) {
  const [localColumn, setLocalColumn] = useState(column);
  
  return (
    <Modal open onClose={onClose}>
      <div className="column-detail">
        <h3>Column Details: {column.name}</h3>
        
        <label>
          Description
          <textarea
            value={localColumn.description || ''}
            onChange={(e) => setLocalColumn({ ...localColumn, description: e.target.value })}
          />
        </label>
        
        <label>
          Default Value
          <input
            value={localColumn.defaultValue || ''}
            onChange={(e) => setLocalColumn({ ...localColumn, defaultValue: e.target.value })}
          />
        </label>
        
        {localColumn.isForeignKey && (
          <>
            <label>
              Foreign Table
              <input
                value={localColumn.foreignKeyRef?.table || ''}
                onChange={(e) => setLocalColumn({
                  ...localColumn,
                  foreignKeyRef: {
                    ...localColumn.foreignKeyRef!,
                    table: e.target.value,
                  },
                })}
              />
            </label>
            <label>
              Foreign Column
              <input
                value={localColumn.foreignKeyRef?.column || ''}
                onChange={(e) => setLocalColumn({
                  ...localColumn,
                  foreignKeyRef: {
                    ...localColumn.foreignKeyRef!,
                    column: e.target.value,
                  },
                })}
              />
            </label>
          </>
        )}
        
        <div className="modal-actions">
          <button onClick={() => onSave(localColumn)}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}
```

### Index Editor

**Component:**
```typescript
function IndexEditor({ indexes, onChange }: Props) {
  const addIndex = () => {
    const newIndex: Index = {
      name: 'idx_new',
      columns: [],
      isUnique: false,
      type: 'btree',
    };
    onChange([...indexes, newIndex]);
  };
  
  return (
    <div className="index-editor">
      <div className="editor-header">
        <h3>Indexes</h3>
        <button onClick={addIndex}>
          <PlusIcon /> Add Index
        </button>
      </div>
      
      {indexes.map((index, i) => (
        <div key={i} className="index-item">
          <input
            value={index.name}
            onChange={(e) => {
              const updated = [...indexes];
              updated[i] = { ...updated[i], name: e.target.value };
              onChange(updated);
            }}
          />
          <select
            value={index.type}
            onChange={(e) => {
              const updated = [...indexes];
              updated[i] = { ...updated[i], type: e.target.value as any };
              onChange(updated);
            }}
          >
            <option value="btree">B-Tree</option>
            <option value="hash">Hash</option>
            <option value="gin">GIN</option>
            <option value="gist">GiST</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={index.isUnique}
              onChange={(e) => {
                const updated = [...indexes];
                updated[i] = { ...updated[i], isUnique: e.target.checked };
                onChange(updated);
              }}
            />
            Unique
          </label>
          <button onClick={() => onChange(indexes.filter((_, idx) => idx !== i))}>
            <TrashIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
```

### SQL Generation

**Generate CREATE TABLE:**
```typescript
function generateCreateTableSQL(node: HorizonNode): string {
  const { schema } = node.payload;
  const tableName = node.payload.title;
  
  const columnDefs = schema.columns.map(col => {
    let def = `  ${col.name} ${col.type.toUpperCase()}`;
    if (col.isPrimaryKey) def += ' PRIMARY KEY';
    if (!col.nullable) def += ' NOT NULL';
    if (col.isUnique) def += ' UNIQUE';
    if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
    return def;
  }).join(',\n');
  
  return `CREATE TABLE ${tableName} (\n${columnDefs}\n);`;
}
```

## Dependencies
- [`lib/db.ts`](../lib/drdpr-horizon/lib/db.ts) - Database operations
- `dexie-react-hooks` - Live queries

## Relations
- **Used by:** [`ui_inspector`](./ui_inspector.md) - Schema tab
- **Reads/Writes:** [`db_horizon`](./db_horizon.md) - Schema data

## Key Concepts

### Structured Schema Definition
Unlike free-form content, schema is structured data:
- Type-safe column definitions
- Validation rules
- Relationship tracking
- SQL generation

### Visual Schema Editor
Table-based interface for:
- Quick column addition
- Inline editing
- Constraint management
- Index configuration

### Foreign Key Relationships
When marking a column as FK:
- Automatically creates edge to referenced table
- Validates referenced table exists
- Shows relationship in canvas

### SQL Export
Generate SQL DDL from schema:
- CREATE TABLE statements
- Index definitions
- Constraint definitions
- Migration scripts

### Schema Validation
Validates schema before saving:
- At least one column
- Primary key defined
- Valid data types
- No duplicate column names
- Valid foreign key references

### Auto-completion
When editing foreign keys:
- Suggests existing tables
- Suggests columns from referenced table
- Validates references