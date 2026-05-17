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
  const isMac = typeof navigator !== 'undefined' && 
                ((typeof navigator.platform === 'string' && navigator.platform.toUpperCase().indexOf('MAC') >= 0) ||
                 (typeof navigator.userAgent === 'string' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)));
  const mod = isMac ? '⌘' : 'Ctrl';

  if (!isShortcutsHelpOpen) return null;

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Canvas Navigation',
      shortcuts: [
        { keys: ['Space + Drag'], description: 'Pan canvas (Hold Space)' },
        { keys: ['Middle Click'], description: 'Pan canvas' },
        { keys: [mod, 'Wheel'], description: 'Zoom in/out' },
        { keys: [mod, '0'], description: 'Fit view' },
      ],
    },
    {
      title: 'Workspace Architecture',
      shortcuts: [
        { keys: [mod, 'B'], description: 'Toggle Sidebar' },
        { keys: [mod, 'I'], description: 'Toggle Inspector' },
        { keys: [mod, 'P'], description: 'Toggle Palette' },
        { keys: [mod, 'K'], description: 'Command Search' },
      ],
    },
    {
      title: 'Nodes & Selection',
      shortcuts: [
        { keys: ['Click'], description: 'Select node' },
        { keys: ['Shift + Click'], description: 'Multi-select' },
        { keys: ['Drag'], description: 'Move nodes' },
        { keys: [mod, 'C'], description: 'Copy node' },
        { keys: [mod, 'V'], description: 'Paste node' },
        { keys: ['Backspace', 'Del'], description: 'Delete node' },
      ],
    },
    {
      title: 'Inspector Logic',
      shortcuts: [
        { keys: ['Enter'], description: 'Open selected node' },
        { keys: ['Esc'], description: 'Close / Deselect' },
        { keys: [mod, 'S'], description: 'Sync to disk' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-card border border-border/40 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border/10 bg-secondary/20">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Ingestalt Controls</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mt-1">
              Keyboard Architecture & Shortcuts
            </p>
          </div>
          <button
            onClick={() => setShortcutsHelpOpen(false)}
            className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/10 transition-all text-foreground/40 hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {shortcutGroups.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-border/10 pb-2">
                  <div className="w-1 h-3 bg-blue-500 rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
                    {group.title}
                  </h3>
                </div>
                <div className="space-y-1">
                  {group.shortcuts.map((shortcut, sidx) => (
                    <div
                      key={sidx}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-secondary/30 transition-all group"
                    >
                      <span className="text-xs font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {shortcut.keys.map((key, kidx) => (
                          <React.Fragment key={kidx}>
                            {kidx > 0 && (
                              <span className="text-foreground/20 text-[10px]">+</span>
                            )}
                            <kbd className="min-w-[24px] h-6 px-2 flex items-center justify-center text-[10px] font-mono bg-background/50 backdrop-blur border border-border/20 rounded shadow-[0_2px_0_rgba(0,0,0,0.1)] text-foreground/80 font-bold">
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
        </div>

        {/* Footer */}
        <div className="p-6 bg-secondary/10 border-t border-border/10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30">
            Press <kbd className="px-1.5 py-0.5 bg-background/40 rounded border border-border/20 mx-1">{mod}</kbd> + <kbd className="px-1.5 py-0.5 bg-background/40 rounded border border-border/20 mx-1">?</kbd> to toggle help
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
