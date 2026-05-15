'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { DynamicIcon } from '@/components/DynamicIcon';
import { Plus, GripHorizontal, Wifi, Zap, ZapOff } from 'lucide-react';
import { useSync } from '@/lib/hooks/useSync';
import { useUIStore } from '@/lib/store/useUIStore';

export function Palette() {
  const { connectFolder } = useSync();
  const { autoSaveEnabled, setAutoSaveEnabled } = useUIStore();
  const activeStandards = useLiveQuery(
    () => db.nodes.toArray().then(nodes => nodes.filter(n => n.payload?.type === 'standards')),
    []
  );

  // Extract all definitions from all standard nodes
  const availableTypes = React.useMemo(() => {
    if (!activeStandards) return [];
    const types: any[] = [];
    activeStandards.forEach(s => {
      if (s.payload?.definitions) {
        types.push(...s.payload.definitions);
      }
    });
    return types;
  }, [activeStandards]);

  const onDragStart = (event: React.DragEvent, nodeType: string, configId: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/horizon-config', configId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-2 bg-neutral-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
    >
      <div className="flex flex-col items-center gap-2 pb-2 border-b border-white/5 mb-1 group/sync">
        <button 
          onClick={connectFolder}
          className="w-10 h-10 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 flex items-center justify-center transition-all shadow-lg"
          title="Connect Local Project Folder"
        >
          <Wifi size={18} className="text-blue-400 group-hover/sync:scale-110 transition-transform" />
        </button>

        <button 
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            autoSaveEnabled 
              ? 'bg-amber-500/20 border border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'bg-neutral-800 border border-white/5 text-neutral-500 hover:text-neutral-300'
          }`}
          title={autoSaveEnabled ? "Auto-Save Enabled" : "Auto-Save Disabled"}
        >
          {autoSaveEnabled ? <Zap size={14} /> : <ZapOff size={14} />}
        </button>
        
        <span className="text-[8px] uppercase font-black tracking-tighter text-neutral-600">Settings</span>
      </div>

      <div className="flex flex-col items-center gap-1 pb-2 border-b border-white/5 mb-1">
        <Plus size={14} className="text-neutral-500" />
        <span className="text-[8px] uppercase font-black tracking-tighter text-neutral-600">Palette</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {availableTypes.map((type) => (
          <div
            key={type.id}
            draggable
            onDragStart={(e) => onDragStart(e, type.id, type.id)}
            onMouseDown={(e) => e.stopPropagation()}
            className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-neutral-800/50 border border-white/5 hover:border-white/20 hover:bg-neutral-700/50 transition-all cursor-grab active:cursor-grabbing shadow-lg"
          >
            <DynamicIcon 
              name={type.icon || 'Box'} 
              size={20} 
              style={{ color: type.color || '#a3a3a3' }}
              className="group-hover:scale-110 transition-transform"
            />
            
            {/* Tooltip */}
            <div className="absolute left-16 px-2 py-1 rounded bg-black text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 uppercase tracking-widest font-bold">
              {type.title}
            </div>
            
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neutral-900 rounded-full flex items-center justify-center border border-white/5">
               <GripHorizontal size={8} className="text-neutral-600" />
            </div>
          </div>
        ))}
      </div>
      
      {availableTypes.length === 0 && (
        <div className="w-10 h-10 rounded-xl bg-neutral-800/20 border border-dashed border-white/5 flex items-center justify-center">
          <span className="text-[8px] text-neutral-600">Empty</span>
        </div>
      )}
    </div>
  );
}
