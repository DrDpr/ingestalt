'use client';

import React, { useState } from 'react';
import { ShieldAlert, Settings2, ChevronDown, ChevronUp, Trash2, Plus, Copy } from 'lucide-react';
import { GarnishedNode } from '../canvas/nodes/GarnishedNode';
import { db } from '@/lib/db';
import { useUIStore } from '@/lib/store/useUIStore';
import { useSync } from '@/lib/hooks/useSync';
import { LocalInput } from '@/components/ui/LocalInput';
import { DynamicIcon } from '../DynamicIcon';

export function GovernanceEditor({ node, hideHeader = false, externalIsEditing = false }: { node: any, hideHeader?: boolean, externalIsEditing?: boolean }) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const isEditing = hideHeader ? externalIsEditing : localIsEditing;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedConfigs, setCollapsedConfigs] = useState<Record<number, boolean>>({});
  const { payload } = node;
  const definitions = payload?.definitions || [];

  const { autoSaveEnabled } = useUIStore();
  const { syncNodeToFile } = useSync();

  const handleUpdateDefinitions = async (newDefs: any[]) => {
    await db.nodes.update(node.id, { 
      payload: { ...payload, definitions: newDefs }, 
      lastModified: Date.now() 
    });
    if (autoSaveEnabled) {
      await syncNodeToFile(node.id);
    }
  };

  const updateDef = (idx: number, updates: any) => {
    const newDefs = [...definitions];
    newDefs[idx] = { ...newDefs[idx], ...updates };
    handleUpdateDefinitions(newDefs);
  };

  return (
    <div className="bg-neutral-950 h-full flex flex-col overflow-hidden">
      {!hideHeader && (
        <div className="p-4 flex items-center justify-between bg-neutral-900/20">
          <div className="flex items-center gap-2 text-amber-500">
            <ShieldAlert size={16} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Governance Manifest</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLocalIsEditing(!localIsEditing)} 
              className={`p-1.5 rounded-md transition-colors ${localIsEditing ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              <Settings2 size={14} />
            </button>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-1.5 rounded-md bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
      )}

      {(!isCollapsed || hideHeader) && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-neutral-950">
          {definitions.map((def: any, idx: number) => (
            <div key={idx} className="space-y-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/50 hover:border-amber-500/30 transition-colors">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center gap-2">
                      <DynamicIcon name={def.icon || 'Box'} size={12} style={{ color: def.color || '#888888' }} />
                      <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: def.color || '#888888' }}>
                        {def.type || 'Configuration'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          const newDefs = [...definitions];
                          newDefs.splice(idx, 1);
                          handleUpdateDefinitions(newDefs);
                        }}
                        className="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                        title="Delete Configuration"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button 
                        onClick={() => setCollapsedConfigs(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className="p-1 hover:bg-neutral-800 text-neutral-400 rounded transition-colors"
                      >
                        {collapsedConfigs[idx] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      </button>
                    </div>
                  </div>
                  
                  {!collapsedConfigs[idx] && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-500">Type ID</label><LocalInput className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-[10px] text-amber-200 font-mono" value={def.id} onChange={(val) => updateDef(idx, { id: val })} /></div>
                        <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-500">Category</label><LocalInput className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-[10px] text-neutral-200" value={def.type} onChange={(val) => updateDef(idx, { type: val })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-500">Lucide Icon</label><LocalInput className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-[10px] text-neutral-200" value={def.icon} onChange={(val) => updateDef(idx, { icon: val })} /></div>
                        <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-500">Accent</label><LocalInput type="color" className="w-full h-7 bg-neutral-800 border border-neutral-700 rounded p-1 cursor-pointer" value={def.color} onChange={(val) => updateDef(idx, { color: val })} /></div>
                      </div>
                      
                      {/* Nested Field Editor */}
                      <div className="pt-2 border-t border-neutral-800">
                        <label className="text-[8px] uppercase font-bold text-neutral-500 mb-2 block">Properties</label>
                        <div className="grid grid-cols-1 gap-2">
                          {(def.fields || []).map((field: any, fIdx: number) => (
                            <div key={fIdx} className="grid grid-cols-5 gap-1 items-center bg-neutral-800/30 p-1 rounded-md group">
                              <LocalInput className="bg-transparent text-[9px] text-neutral-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-1" value={field.name} onChange={(val) => {
                                const newFields = [...def.fields];
                                newFields[fIdx].name = val;
                                updateDef(idx, { fields: newFields });
                              }} />
                              <LocalInput className="bg-transparent text-[9px] text-blue-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-1" value={field.type} onChange={(val) => {
                                const newFields = [...def.fields];
                                newFields[fIdx].type = val;
                                updateDef(idx, { fields: newFields });
                              }} />
                              <LocalInput className="bg-transparent text-[9px] text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-1" value={field.icon || ''} placeholder="Icon" onChange={(val) => {
                                const newFields = [...def.fields];
                                newFields[fIdx].icon = val;
                                updateDef(idx, { fields: newFields });
                              }} />
                              <LocalInput type="color" className="w-full h-3 bg-transparent cursor-pointer" value={field.color || '#666666'} onChange={(val) => {
                                const newFields = [...def.fields];
                                newFields[fIdx].color = val;
                                updateDef(idx, { fields: newFields });
                              }} />
                              <button 
                                onClick={() => {
                                  const newFields = [...def.fields];
                                  newFields.splice(fIdx, 1);
                                  updateDef(idx, { fields: newFields });
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-all flex justify-center"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => {
                            const newFields = [...(def.fields || []), { name: 'new_field', type: 'text', icon: 'Box', color: '#888888' }];
                            updateDef(idx, { fields: newFields });
                          }}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 p-1.5 border border-dashed border-neutral-700 hover:border-amber-500/50 hover:text-amber-400 text-[9px] font-bold uppercase tracking-widest text-neutral-500 rounded-md transition-all"
                        >
                          <Plus size={10} />
                          Add Property
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest font-mono">{def.id}</span>
                    <span className="text-[10px] text-amber-500/50 uppercase font-bold">{def.type}</span>
                  </div>
                  <div className="scale-90 origin-top-left -mb-4">
                    <GarnishedNode id={`preview_${def.id}`} isStatic={true} data={{ label: `${def.type.toUpperCase()} PREVIEW`, type: def.type, icon: def.icon, color: def.color, tags: ['active', 'standard'] }} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isEditing && (
            <button 
              onClick={() => {
                const newDefs = [...definitions, { id: 'new_config_type', type: 'new_type', icon: 'Box', color: '#888888', fields: [] }];
                handleUpdateDefinitions(newDefs);
              }}
              className="w-full p-3 rounded-xl border-2 border-dashed border-neutral-800 hover:border-amber-500/50 text-neutral-500 hover:text-amber-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={14} /> Add Configuration
            </button>
          )}
        </div>
      )}
    </div>
  );
}
