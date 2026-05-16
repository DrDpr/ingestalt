---
id: node_ui_editor_menus
configId: node_standards_frontend
title: Editor Bubble Menus
type: frontend
icon: Layout
color: '#a855f7'
tags: [editor, menus, toolbar, tiptap]
relations:
  - targetId: node_ui_editor
    type: used-by
    label: Context menus in editor
---

# Editor Bubble Menus

## Purpose
Context-sensitive floating toolbars that appear when text is selected or when editing specific elements like tables, providing quick access to formatting and editing options.

## Key Files
- [`lib/drdpr-horizon/components/editor/EditorBubbleMenu.tsx`](../lib/drdpr-horizon/components/editor/EditorBubbleMenu.tsx) - Text selection menu
- [`lib/drdpr-horizon/components/editor/TableBubbleMenu.tsx`](../lib/drdpr-horizon/components/editor/TableBubbleMenu.tsx) - Table editing menu

## Architecture

### EditorBubbleMenu (Text Selection)

**Component Structure:**
```typescript
export function EditorBubbleMenu({ editor }: Props) {
  if (!editor) return null;
  
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
      }}
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        const { empty } = selection;
        
        // Don't show if selection is empty
        if (empty) return false;
        
        // Don't show in code blocks
        if (editor.isActive('codeBlock')) return false;
        
        return true;
      }}
    >
      <div className="bubble-menu">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon="Bold"
          tooltip="Bold (Cmd+B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon="Italic"
          tooltip="Italic (Cmd+I)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          icon="Strikethrough"
          tooltip="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          icon="Code"
          tooltip="Code (Cmd+E)"
        />
        
        <Separator />
        
        <HeadingDropdown editor={editor} />
        
        <Separator />
        
        <LinkButton editor={editor} />
        
        <Separator />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          icon="RemoveFormatting"
          tooltip="Clear formatting"
        />
      </div>
    </BubbleMenu>
  );
}
```

**Toolbar Buttons:**
```typescript
interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: string;
  tooltip: string;
  disabled?: boolean;
}

function ToolbarButton({ onClick, active, icon, tooltip, disabled }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('toolbar-button', { active, disabled })}
      title={tooltip}
    >
      <DynamicIcon name={icon} size={16} />
    </button>
  );
}
```

**Heading Dropdown:**
```typescript
function HeadingDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  
  const currentLevel = [1, 2, 3, 4].find(level =>
    editor.isActive('heading', { level })
  );
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="toolbar-button">
          <DynamicIcon name={`Heading${currentLevel || ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        {[1, 2, 3, 4].map(level => (
          <button
            key={level}
            onClick={() => {
              editor.chain().focus().setHeading({ level }).run();
              setOpen(false);
            }}
            className={cn('dropdown-item', {
              active: editor.isActive('heading', { level }),
            })}
          >
            <DynamicIcon name={`Heading${level}`} />
            Heading {level}
          </button>
        ))}
        <button
          onClick={() => {
            editor.chain().focus().setParagraph().run();
            setOpen(false);
          }}
          className={cn('dropdown-item', {
            active: editor.isActive('paragraph'),
          })}
        >
          <DynamicIcon name="Paragraph" />
          Paragraph
        </button>
      </PopoverContent>
    </Popover>
  );
}
```

**Link Button:**
```typescript
function LinkButton({ editor }: { editor: Editor }) {
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);
  
  const setLink = () => {
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setOpen(false);
    setUrl('');
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn('toolbar-button', {
            active: editor.isActive('link'),
          })}
        >
          <DynamicIcon name="Link" />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="link-input">
          <input
            type="url"
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setLink();
            }}
          />
          <button onClick={setLink}>Set Link</button>
          {editor.isActive('link') && (
            <button onClick={() => editor.chain().focus().unsetLink().run()}>
              Remove Link
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### TableBubbleMenu

**Component Structure:**
```typescript
export function TableBubbleMenu({ editor }: Props) {
  if (!editor) return null;
  
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
      }}
      shouldShow={({ editor }) => editor.isActive('table')}
    >
      <div className="bubble-menu table-menu">
        <ToolbarButton
          onClick={() => editor.chain().focus().addRowBefore().run()}
          icon="ArrowUp"
          tooltip="Add row above"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().addRowAfter().run()}
          icon="ArrowDown"
          tooltip="Add row below"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteRow().run()}
          icon="Trash"
          tooltip="Delete row"
        />
        
        <Separator />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          icon="ArrowLeft"
          tooltip="Add column left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          icon="ArrowRight"
          tooltip="Add column right"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteColumn().run()}
          icon="Trash"
          tooltip="Delete column"
        />
        
        <Separator />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().mergeCells().run()}
          icon="Merge"
          tooltip="Merge cells"
          disabled={!editor.can().mergeCells()}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().splitCell().run()}
          icon="Split"
          tooltip="Split cell"
          disabled={!editor.can().splitCell()}
        />
        
        <Separator />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          icon="Header"
          tooltip="Toggle header row"
          active={editor.isActive('tableHeader')}
        />
        
        <Separator />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteTable().run()}
          icon="Trash2"
          tooltip="Delete table"
        />
      </div>
    </BubbleMenu>
  );
}
```

### Positioning Logic

**TipTap BubbleMenu:**
Uses Tippy.js for positioning:
- Appears above/below selection
- Adjusts to viewport boundaries
- Follows selection during scrolling
- Hides when selection is cleared

**Custom Positioning:**
```typescript
tippyOptions={{
  duration: 100,
  placement: 'top',
  offset: [0, 8],
  popperOptions: {
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom', 'top'],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
        },
      },
    ],
  },
}}
```

## Dependencies
- `@tiptap/react` - BubbleMenu component
- `tippy.js` - Positioning engine
- [`components/DynamicIcon.tsx`](../lib/drdpr-horizon/components/DynamicIcon.tsx) - Icons
- [`components/ui/popover.tsx`](../lib/drdpr-horizon/components/ui/popover.tsx) - Dropdowns

## Relations
- **Used by:** [`ui_editor`](./ui_editor.md) - Context menus

## Key Concepts

### Context-Sensitive Display
Menus only appear when relevant:
- Text menu: When text is selected
- Table menu: When cursor is in table
- Link menu: When link is selected
- Code menu: When in code block (future)

### Active State Indicators
Buttons show active state:
```typescript
active={editor.isActive('bold')}
```
Helps users understand current formatting.

### Keyboard Shortcuts
All menu actions have keyboard shortcuts:
- Displayed in tooltips
- Work even when menu is hidden
- Consistent with standard editors

### Disabled States
Some actions are conditionally disabled:
```typescript
disabled={!editor.can().mergeCells()}
```
Prevents invalid operations.

### Smooth Transitions
- Fade in/out animations
- Position transitions
- Debounced updates

### Accessibility
- Keyboard navigation within menu
- ARIA labels
- Focus management
- Screen reader announcements

### Performance
- Memoized components
- Debounced position updates
- Lazy rendering
- Efficient re-renders only on state change