---
id: node_ui_editor_commands
title: Editor Slash Commands
type: ui
tags: [editor, commands, slash-commands, tiptap]
relations:
  - targetId: node_ui_editor
    type: used-by
    label: Command palette in editor
---

# Editor Slash Commands

## Purpose
Provides a command palette interface triggered by typing `/` in the editor, allowing quick insertion of blocks and formatting without using toolbar buttons.

## Key Files
- [`lib/drdpr-horizon/components/editor/SlashCommandExtension.ts`](../lib/drdpr-horizon/components/editor/SlashCommandExtension.ts) - TipTap extension
- [`lib/drdpr-horizon/components/editor/SlashCommands.tsx`](../lib/drdpr-horizon/components/editor/SlashCommands.tsx) - Command palette UI
- [`lib/drdpr-horizon/components/editor/slashCommandSuggestion.tsx`](../lib/drdpr-horizon/components/editor/slashCommandSuggestion.tsx) - Suggestion logic

## Architecture

### Extension Structure

**TipTap Extension:**
```typescript
export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',
  
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: ({ query }) => {
          return commands.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let component: ReactRenderer;
          let popup: Instance[];
          
          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommands, {
                props,
                editor: props.editor,
              });
              
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate: (props) => {
              component.updateProps(props);
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },
            onExit: () => {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
```

### Command Definitions

**Command Structure:**
```typescript
interface Command {
  title: string;
  description?: string;
  icon?: string;
  command: (props: CommandProps) => void;
  category?: string;
}

interface CommandProps {
  editor: Editor;
  range: Range;
}
```

**Available Commands:**
```typescript
const commands: Command[] = [
  // Text Blocks
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'Heading1',
    category: 'Text',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'Heading2',
    category: 'Text',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: 'Paragraph',
    description: 'Regular text',
    icon: 'Paragraph',
    category: 'Text',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  
  // Lists
  {
    title: 'Bullet List',
    description: 'Unordered list',
    icon: 'List',
    category: 'Lists',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Ordered list',
    icon: 'ListOrdered',
    category: 'Lists',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Task List',
    description: 'Checklist',
    icon: 'CheckSquare',
    category: 'Lists',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  
  // Code
  {
    title: 'Code Block',
    description: 'Code with syntax highlighting',
    icon: 'Code',
    category: 'Code',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  
  // Advanced
  {
    title: 'Table',
    description: 'Insert a table',
    icon: 'Table',
    category: 'Advanced',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    title: 'Blockquote',
    description: 'Quote or callout',
    icon: 'Quote',
    category: 'Advanced',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Horizontal Rule',
    description: 'Divider line',
    icon: 'Minus',
    category: 'Advanced',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];
```

### UI Component

**SlashCommands Component:**
```typescript
export function SlashCommands({ items, command }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items]);
  
  return (
    <div className="slash-commands">
      {items.map((item, index) => (
        <button
          key={index}
          className={cn('command-item', {
            'selected': index === selectedIndex,
          })}
          onClick={() => selectItem(index)}
        >
          <DynamicIcon name={item.icon} />
          <div>
            <div className="title">{item.title}</div>
            {item.description && (
              <div className="description">{item.description}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
```

### Filtering Logic

**Query Matching:**
```typescript
function filterCommands(query: string): Command[] {
  const lowerQuery = query.toLowerCase();
  
  return commands.filter(cmd => {
    // Match title
    if (cmd.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Match description
    if (cmd.description?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Match category
    if (cmd.category?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  });
}
```

**Fuzzy Matching (Optional):**
```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(commands, {
  keys: ['title', 'description', 'category'],
  threshold: 0.3,
});

function fuzzyFilterCommands(query: string): Command[] {
  if (!query) return commands;
  return fuse.search(query).map(result => result.item);
}
```

## Dependencies
- `@tiptap/suggestion` - Suggestion plugin
- `tippy.js` - Tooltip positioning
- `@tiptap/react` - React renderer

## Relations
- **Used by:** [`ui_editor`](./ui_editor.md) - Command palette
- **Extends:** TipTap editor functionality

## Key Concepts

### Suggestion Plugin
TipTap's suggestion plugin provides:
- Character trigger detection (`/`)
- Query extraction
- Popup positioning
- Keyboard navigation
- Command execution

### Command Categories
Commands are organized into categories:
- **Text** - Headings, paragraphs
- **Lists** - Bullet, numbered, task lists
- **Code** - Code blocks, inline code
- **Advanced** - Tables, blockquotes, rules
- **Media** - Images, videos (future)

### Keyboard Navigation
- `↑` / `↓` - Navigate commands
- `Enter` - Execute selected command
- `Esc` - Close palette
- Continue typing to filter

### Range Deletion
Before inserting new block, delete the trigger:
```typescript
editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
```
This removes the `/` character and any query text.

### Popup Positioning
Uses Tippy.js for smart positioning:
- Appears below cursor
- Adjusts if near viewport edge
- Follows cursor during typing
- Dismisses on click outside

### Extensibility
Add new commands by extending the array:
```typescript
commands.push({
  title: 'Custom Block',
  description: 'My custom block type',
  icon: 'Star',
  category: 'Custom',
  command: ({ editor, range }) => {
    // Custom logic
  },
});
```

### Future Enhancements
- AI-powered command suggestions
- Recent commands history
- Custom user commands
- Command aliases
- Context-aware commands (based on node type)