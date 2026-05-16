'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Zap, Compass, X, Command as CommandIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { useUIStore } from '../../lib/store/useUIStore';
import { db } from '../../lib/db';
import { useReactFlow } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { DynamicIcon } from '../DynamicIcon';

export function CommandSearch() {
  const { isSearchOpen, setSearchOpen, setSelectedNodeId } = useUIStore();
  const { setCenter, fitView } = useReactFlow();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery(''); // Clear query when closing
    }
  }, [isSearchOpen]);
  // Dynamic Standards Map (replicated from HorizonCanvas)
  const standardsMap = useLiveQuery(async () => {
    const nodes = await db.nodes.toArray();
    const map = new Map<string, any>();
    nodes.forEach(node => {
      if (node.payload?.type === 'standards') {
        const defs = node.payload?.definitions || [];
        defs.forEach((d: any) => {
          map.set(d.id, d);
        });
        if (node.payload?.configId || node.id) {
          map.set(node.payload?.configId || node.id, {
            type: node.payload?.type,
            label: node.payload?.title,
            icon: node.payload?.icon || 'ShieldAlert',
            color: node.payload?.color || '#f59e0b',
          });
        }
      }
    });
    return map;
  }, []) || new Map();

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      const lowerQuery = query.toLowerCase();
      const allNodes = await db.nodes.toArray();
      
      const matchedNodes = allNodes.filter(node => {
        const title = node.payload?.title?.toLowerCase() || '';
        const content = node.payload?.content?.toLowerCase() || '';
        const type = node.payload?.type?.toLowerCase() || '';
        return title.includes(lowerQuery) || content.includes(lowerQuery) || type.includes(lowerQuery);
      });

      setResults(matchedNodes.slice(0, 8));
      setSelectedIndex(0);
    };

    performSearch();
  }, [query]);

  const handleSelect = (node: any) => {
    if (!node) return;

    // Navigate to node - further away zoom for better context
    if (node.position) {
      setCenter(node.position.x, node.position.y, { zoom: 0.8, duration: 800 });
    } else {
      fitView({ nodes: [{ id: node.id }], duration: 800, padding: 0.5 });
    }

    // Select and open inspector
    setSelectedNodeId(node.id);
    setSearchOpen(false);

    // Trigger a temporary highlight effect (handled via global event or store)
    window.dispatchEvent(new CustomEvent('highlight-node', { detail: { id: node.id } }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Search Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Input Area */}
          <div className="flex items-center px-6 py-5 border-b border-border/10 bg-secondary/10">
            <Search className="w-5 h-5 text-foreground/40 mr-4" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search nodes, standards, or content..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-foreground/20 font-medium"
            />
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 text-[10px] font-bold bg-background/50 border border-border/20 rounded-md text-foreground/40">ESC</kbd>
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((node, index) => {
                  // Resolve standard appearance
                  const standard = standardsMap.get(node.configId);
                  const nodeColor = node.payload?.color || (standard ? standard.color : '#52525b');
                  const nodeIcon = node.payload?.icon || (standard ? standard.icon : 'FileText');

                  return (
                    <button
                      key={node.id}
                      onClick={() => handleSelect(node)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-start gap-4 p-4 rounded-2xl transition-all text-left group",
                        index === selectedIndex ? "bg-secondary text-foreground shadow-sm" : "hover:bg-secondary/40 text-foreground/60"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-xl transition-all duration-300",
                        index === selectedIndex ? "bg-background shadow-md scale-110" : "bg-secondary/60"
                      )}>
                        <DynamicIcon 
                          name={nodeIcon} 
                          size={20} 
                          style={{ color: index === selectedIndex ? nodeColor : `${nodeColor}80` }} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold uppercase tracking-tight text-sm">
                            {node.payload?.title || 'Untitled Node'}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-20">
                            {node.payload?.type || 'node'}
                          </span>
                        </div>
                        <p className="text-xs opacity-40 line-clamp-1 mt-0.5 font-medium">
                          {node.payload?.content || 'No content available'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : query ? (
              <div className="py-12 text-center">
                <Compass className="w-10 h-10 text-foreground/10 mx-auto mb-4 animate-pulse" />
                <p className="text-sm font-bold uppercase tracking-widest text-foreground/20">No matching coordinates found</p>
              </div>
            ) : (
              <div className="py-8 px-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-4">Recent Perspectives</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-border/5 bg-secondary/5 text-foreground/30 text-xs font-bold uppercase tracking-tight">
                    Type to find architectural nodes...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border/10 bg-secondary/5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-foreground/20">
              <span className="flex items-center gap-1.5"><ArrowUp size={10} /><ArrowDown size={10} /> Navigate</span>
              <span className="flex items-center gap-1.5"><CommandIcon size={10} /> Enter to Open</span>
            </div>
            <div className="text-[10px] font-bold text-foreground/10">
              Ingestalt
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
