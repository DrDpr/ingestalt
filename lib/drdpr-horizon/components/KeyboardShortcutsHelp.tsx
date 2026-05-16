'use client';

import React from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Command, MousePointer2 } from 'lucide-react';
import { useUIStore } from '../lib/store/useUIStore';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: Array<string | { icon: React.ReactNode; label: string }>;
    description: string;
  }>;
}

export function KeyboardShortcutsHelp() {
  const { isShortcutsHelpOpen, setShortcutsHelpOpen } = useUIStore();
  
  // Detect platform
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const mod = isMac ? '⌘' : 'Ctrl';

  if (!isShortcutsHelpOpen) return null;

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Canvas Navigation',
      shortcuts: [
        {
          keys: [
            { icon: <ArrowUp size={12} />, label: '↑' },
            { icon: <ArrowDown size={12} />, label: '↓' },
            { icon: <ArrowLeft size={12} />, label: '←' },
            { icon: <ArrowRight size={12} />, label: '→' }
          ],
          description: 'Pan canvas'
        },
        {
          keys: [
            'Shift',
            { icon: <ArrowUp size={12} />, label: '↑' },
            { icon: <ArrowDown size={12} />, label: '↓' },
            { icon: <ArrowLeft size={12} />, label: '←' },
            { icon: <ArrowRight size={12} />, label: '→' }
          ],
          description: 'Fast pan'
        },
        { keys: [mod, '+'], description: 'Zoom in' },
        { keys: [mod, '-'], description: 'Zoom out' },
        { keys: [mod, '0'], description: 'Fit all nodes' },
        { keys: [mod, 'Shift', '0'], description: 'Fit selected nodes' },
        { keys: [mod, '1'], description: 'Reset zoom to 100%' },
      ],
    },
    {
      title: 'Node Operations',
      shortcuts: [
        { keys: ['Delete'], description: 'Delete selected' },
        { keys: [mod, 'D'], description: 'Duplicate selected' },
        { keys: [mod, 'C'], description: 'Copy selected' },
        { keys: [mod, 'V'], description: 'Paste copied' },
        { keys: ['Esc'], description: 'Deselect' },
        { keys: ['Enter'], description: 'Open inspector' },
      ],
    },
    {
      title: 'Search & Filtering',
      shortcuts: [
        { keys: [mod, 'K'], description: 'Open search' },
        { keys: [mod, 'P'], description: 'Open search' },
        { keys: [mod, 'F'], description: 'Focus search' },
      ],
    },
    {
      title: 'View Modes',
      shortcuts: [
        { keys: [mod, 'E'], description: 'Cycle edge styles' },
        { keys: [mod, 'Shift', 'T'], description: 'Toggle theme' },
      ],
    },
    {
      title: 'Inspector',
      shortcuts: [
        { keys: ['Esc'], description: 'Close inspector' },
        { keys: [mod, 'S'], description: 'Save changes' },
      ],
    },
    {
      title: 'Help',
      shortcuts: [
        { keys: [mod, 'Shift', '?'], description: 'Show this help' },
        { keys: ['F1'], description: 'Show this help' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-neutral-900 border-b border-neutral-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Master Horizon with these keyboard shortcuts
            </p>
          </div>
          <button
            onClick={() => setShortcutsHelpOpen(false)}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, sidx) => (
                  <div
                    key={sidx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-800/50 transition-colors"
                  >
                    <span className="text-sm text-neutral-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, kidx) => (
                        <React.Fragment key={kidx}>
                          {kidx > 0 && (
                            <span className="text-neutral-600 text-xs mx-0.5">+</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded shadow-sm text-neutral-200">
                            {typeof key === 'string' ? key : (
                              <span className="flex items-center gap-1">
                                {key.icon}
                                <span>{key.label}</span>
                              </span>
                            )}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-neutral-900 border-t border-neutral-800 text-center">
          <p className="text-xs text-neutral-500">
            Press <kbd className="px-2 py-0.5 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded">
              {mod}
            </kbd> + <kbd className="px-2 py-0.5 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded">
              ?
            </kbd> or <kbd className="px-2 py-0.5 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded">
              F1
            </kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
