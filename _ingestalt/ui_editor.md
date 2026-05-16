---
id: node_ui_editor
configId: node_standards_frontend
title: Content Editor
type: frontend
icon: Layout
color: '#a855f7'
tags: [editor, tiptap, markdown, rich-text]
components:
  - Editor
  - EditorBubbleMenu
  - TableBubbleMenu
  - SlashCommands
relations:
  - targetId: node_ui_inspector
    type: used-by
    label: Embedded in inspector
  - targetId: node_ui_editor_commands
    type: contains
    label: Slash commands
  - targetId: node_ui_editor_menus
    type: contains
    label: Bubble menus
---

# Content Editor

## Purpose
Rich text editor component for editing node content with Markdown support, slash commands, and formatting tools.

## Key Files
- [`lib/drdpr-horizon/components/inspector/Editor.tsx`](../lib/drdpr-horizon/components/inspector/Editor.tsx) - Main editor component
- [`lib/drdpr-horizon/components/editor/EditorBubbleMenu.tsx`](../lib/drdpr-horizon/components/editor/EditorBubbleMenu.tsx) - Selection toolbar
- [`lib/drdpr-horizon/components/editor/TableBubbleMenu.tsx`](../lib/drdpr-horizon/components/editor/TableBubbleMenu.tsx) - Table editing toolbar
- [`lib/drdpr-horizon/components/editor/SlashCommandExtension.ts`](../lib/drdpr-horizon/components/editor/SlashCommandExtension.ts) - Slash command extension
- [`lib/drdpr-horizon/components/editor/SlashCommands.tsx`](../lib/drdpr-horizon/components/editor/SlashCommands.tsx) - Command palette UI
- [`lib/drdpr-horizon/components/editor/slashCommandSuggestion.tsx`](../lib/drdpr-horizon/components/editor/slashCommandSuggestion.tsx) - Command suggestions

## Architecture

### TipTap Configuration

**Extensions:**
```typescript
const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    codeBlock: { HTMLAttributes: { class: 'code-block' } },
  }),
  Placeholder.configure({
    placeholder: 'Start typing or use / for commands...',
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: 'link' },
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
  SlashCommandExtension,
  // ... more extensions
];
```

**Editor Instance:**
```typescript
const editor = useEditor({
  extensions,
  content: initialContent,
  onUpdate: ({ editor }) => {
    const markdown = editor.storage.markdown.getMarkdown();
    onContentChange(markdown);
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none',
    },
  },
});
```

### Content Format

**Storage Format (Markdown):**
```markdown
# Heading 1

This is **bold** and *italic* text.

- List item 1
- List item 2

```typescript
const example = 'code block';
```

[Link text](https://example.com)
```

**Editor Format (ProseMirror JSON):**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Heading 1" }]
    }
  ]
}
```

### Formatting Features

**Text Formatting:**
- Bold (`Cmd/Ctrl + B`)
- Italic (`Cmd/Ctrl + I`)
- Strikethrough
- Code (`Cmd/Ctrl + E`)
- Underline

**Block Formatting:**
- Headings (H1-H4)
- Paragraphs
- Blockquotes
- Code blocks with syntax highlighting
- Horizontal rules

**Lists:**
- Bullet lists
- Numbered lists
- Task lists (checkboxes)
- Nested lists

**Tables:**
- Insert table
- Add/remove rows
- Add/remove columns
- Merge cells
- Table headers

**Links:**
- Insert link (`Cmd/Ctrl + K`)
- Edit link
- Remove link
- Open link in new tab

### Slash Commands

**Trigger:**
Type `/` to open command palette

**Available Commands:**
```typescript
const commands = [
  {
    title: 'Heading 1',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Code Block',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    title: 'Table',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range)
        .insertTable({ rows: 3, cols: 3 }).run();
    },
  },
  // ... more commands
];
```

**Command Categories:**
- **Basic Blocks:** Paragraph, headings, blockquote
- **Lists:** Bullet, numbered, task list
- **Code:** Inline code, code block
- **Media:** Image, video, embed
- **Advanced:** Table, horizontal rule, callout

### Bubble Menus

**Selection Menu (EditorBubbleMenu):**
Appears when text is selected:
- Bold, italic, strikethrough
- Code, link
- Heading levels
- Clear formatting

**Table Menu (TableBubbleMenu):**
Appears when cursor is in table:
- Add row above/below
- Add column left/right
- Delete row/column
- Merge cells
- Toggle header row

### Auto-save

**Debounced Save:**
```typescript
const debouncedSave = useMemo(
  () => debounce((content: string) => {
    onSave(content);
  }, 500),
  [onSave]
);

useEffect(() => {
  if (editor) {
    editor.on('update', ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      debouncedSave(markdown);
    });
  }
}, [editor, debouncedSave]);
```

**Save Indicator:**
- Saving... (during debounce)
- Saved (after successful save)
- Error (if save fails)

## Dependencies
- `@tiptap/react` - Editor framework
- `@tiptap/starter-kit` - Basic extensions
- `@tiptap/extension-table` - Table support
- `@tiptap/extension-link` - Link support
- `@tiptap/extension-placeholder` - Placeholder text
- `tiptap-markdown` - Markdown serialization

## Relations
- **Used by:** [`ui_inspector`](./ui_inspector.md) - Content editing
- **Contains:** [`ui_editor_commands`](./ui_editor_commands.md) - Slash commands
- **Contains:** [`ui_editor_menus`](./ui_editor_menus.md) - Bubble menus

## Key Concepts

### Markdown-First
- Content stored as Markdown in database
- Converted to ProseMirror JSON for editing
- Converted back to Markdown on save
- Preserves formatting and structure

### Collaborative Editing (Future)
TipTap supports collaborative editing via Y.js:
- Real-time multi-user editing
- Conflict-free replicated data types (CRDTs)
- Cursor presence
- Change tracking

### Syntax Highlighting
Code blocks support syntax highlighting for:
- JavaScript/TypeScript
- Python
- SQL
- JSON
- Markdown
- And more...

### Keyboard Shortcuts
- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + E` - Inline code
- `Cmd/Ctrl + K` - Insert link
- `Cmd/Ctrl + Shift + 7` - Ordered list
- `Cmd/Ctrl + Shift + 8` - Bullet list
- `Cmd/Ctrl + Shift + 9` - Task list
- `Cmd/Ctrl + Alt + 1-4` - Headings
- `Cmd/Ctrl + Enter` - Hard break
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo

### Accessibility
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels
- Semantic HTML output

### Performance
- Lazy loading of extensions
- Debounced updates
- Virtual scrolling for large documents
- Efficient re-rendering