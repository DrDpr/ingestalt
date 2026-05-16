/**
 * Core architectural types supported by the Ingestalt engine.
 * These types define the default visual style and available data interpreters.
 */
export const CORE_BASE_TYPES = [
  {
    id: 'note',
    label: 'Note',
    icon: 'FileText',
    color: '#94a3b8',
    description: 'General purpose documentation or observations.',
    fields: []
  },
  {
    id: 'database',
    label: 'Database',
    icon: 'Database',
    color: '#3b82f6',
    description: 'Data structures, persistence layers, and schemas.',
    fields: [
      { name: 'tables', type: 'tables_list', icon: 'Layers', color: '#3b82f6' }
    ]
  },
  {
    id: 'api',
    label: 'API',
    icon: 'Wifi',
    color: '#22c55e',
    description: 'Service endpoints, network requests, and external interfaces.',
    fields: [
      { name: 'methods', type: 'interface_list', icon: 'Zap', color: '#22c55e' },
      { name: 'filepath', type: 'file_path', icon: 'FileText', color: '#94a3b8' }
    ]
  },
  {
    id: 'frontend',
    label: 'Frontend',
    icon: 'Layout',
    color: '#a855f7',
    description: 'User interfaces, components, and layout structures.',
    fields: [
      { name: 'stories', type: 'story_list', icon: 'BookOpen', color: '#a855f7' },
      { name: 'filepath', type: 'file_path', icon: 'FileText', color: '#94a3b8' }
    ]
  },
  {
    id: 'hook',
    label: 'Logic / Hook',
    icon: 'Box',
    color: '#f59e0b',
    description: 'Reusable business logic, state management, or React hooks.',
    fields: [
      { name: 'process', type: 'flow_list', icon: 'Activity', color: '#f59e0b' },
      { name: 'filepath', type: 'file_path', icon: 'FileText', color: '#94a3b8' }
    ]
  },
  {
    id: 'ai-task',
    label: 'AI Task',
    icon: 'CheckSquare',
    color: '#a855f7',
    description: 'Actionable items or automation prompts for AI agents.',
    fields: [],
    prompts: [
      { label: 'Analyze Context', template: 'Analyze the following architectural context: {context}' }
    ]
  }
];

export const SUPPORTED_FIELD_TYPES = [
  { id: 'text', label: 'Plain Text / JSON', description: 'Standard input for strings or JSON data.' },
  { id: 'file_path', label: 'File Path', description: 'Clickable path to open files in your editor.' },
  { id: 'interface_list', label: 'Method List', description: 'Table of functions with jump-to-code capability.' },
  { id: 'tables_list', label: 'Database Tables', description: 'Complex schema management for DB records.' },
  { id: 'code_list', label: 'Code Snippets', description: 'Collection of editable code blocks.' },
  { id: 'story_list', label: 'User Stories', description: 'Checklist of behavioral requirements.' },
  { id: 'flow_list', label: 'Process Flow', description: 'Numbered sequence of execution steps.' }
];
