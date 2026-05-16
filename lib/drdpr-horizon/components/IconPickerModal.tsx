'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import { DynamicIcon, getAvailableIcons } from './DynamicIcon';

interface IconPickerModalProps {
  show: boolean;
  currentIcon?: string;
  onSelect: (iconName: string) => void;
  onCancel: () => void;
}

/**
 * Searchable Lucide Icon Picker Modal
 */
export function IconPickerModal({ show, currentIcon = 'Box', onSelect, onCancel }: IconPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const allIcons = useMemo(() => getAvailableIcons(), []);
  
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return allIcons.slice(0, 100); // Show first 100 by default
    const query = searchQuery.toLowerCase();
    return allIcons.filter(icon => icon.toLowerCase().includes(query)).slice(0, 100);
  }, [searchQuery, allIcons]);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-3xl border-2 border-border bg-card shadow-2xl rounded-xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <DynamicIcon name={currentIcon} size={24} className="text-blue-500" />
            <h3 className="text-lg font-bold text-foreground">Select Icon</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground/60 hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons... (e.g., database, user, settings)"
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>
          <div className="mt-2 text-xs text-foreground/50">
            Showing {filteredIcons.length} of {allIcons.length} icons
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-8 gap-2">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => onSelect(iconName)}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:border-blue-500 hover:bg-blue-500/10 ${
                  iconName === currentIcon
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-border bg-background'
                }`}
                title={iconName}
              >
                <DynamicIcon
                  name={iconName}
                  size={24}
                  className={`transition-transform group-hover:scale-110 ${
                    iconName === currentIcon ? 'text-blue-500' : 'text-foreground/60'
                  }`}
                />
                <span className="text-xs mt-1 text-foreground/40 truncate w-full text-center group-hover:text-foreground/80">
                  {iconName}
                </span>
              </button>
            ))}
          </div>
          
          {filteredIcons.length === 0 && (
            <div className="text-center py-12 text-foreground/40">
              <p className="text-sm">No icons found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-between items-center">
          <div className="text-xs text-foreground/50">
            All icons from <span className="font-mono">lucide-react</span>
          </div>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-foreground/60 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Made with Bob
