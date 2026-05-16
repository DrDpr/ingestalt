---
id: node_ui_prompts
configId: node_standards_frontend
title: Prompt Components
type: frontend
icon: Layout
color: '#a855f7'
tags: [prompts, dialogs, modals, ui]
components:
  - PromptModal
  - ConfirmDialog
  - IconPickerModal
  - KeyboardShortcutsHelp
relations:
  - targetId: node_ui_canvas
    type: used-by
    label: User interactions
  - targetId: node_ui_inspector
    type: used-by
    label: Confirmation dialogs
---

# Prompt Components

## Purpose
Provides reusable dialog and modal components for user interactions, confirmations, and data input throughout the application.

## Key Files
- [`lib/drdpr-horizon/components/PromptModal.tsx`](../lib/drdpr-horizon/components/PromptModal.tsx) - Generic prompt modal
- [`lib/drdpr-horizon/components/ConfirmDialog.tsx`](../lib/drdpr-horizon/components/ConfirmDialog.tsx) - Confirmation dialog
- [`lib/drdpr-horizon/components/IconPickerModal.tsx`](../lib/drdpr-horizon/components/IconPickerModal.tsx) - Icon selection modal
- [`lib/drdpr-horizon/components/KeyboardShortcutsHelp.tsx`](../lib/drdpr-horizon/components/KeyboardShortcutsHelp.tsx) - Shortcuts reference

## Architecture

### Component Types

**PromptModal:**
- Generic text input dialog
- Used for renaming, creating nodes
- Supports validation

**ConfirmDialog:**
- Confirmation for destructive actions
- Delete, clear, reset operations
- Variant styling (default/destructive)

**IconPickerModal:**
- Visual icon selector
- Search and filter by category
- Grid layout with preview

**KeyboardShortcutsHelp:**
- Reference modal for shortcuts
- Categorized by function
- Platform-specific key display

## Dependencies
- [`components/ui/sheet.tsx`](../lib/drdpr-horizon/components/ui/sheet.tsx) - Dialog components
- [`lib/store/useUIStore.ts`](../lib/drdpr-horizon/lib/store/useUIStore.ts) - UI state

## Relations
- **Used by:** [`ui_canvas`](./ui_canvas.md) - User interactions
- **Used by:** [`ui_inspector`](./ui_inspector.md) - Confirmation dialogs

## Key Concepts

### Reusable Dialogs
Consistent dialog patterns across the application for better UX and maintainability.

### Keyboard Shortcuts Reference
Helps users discover and learn keyboard shortcuts, improving productivity.

### Accessibility
All dialogs support keyboard navigation, focus management, and screen readers.