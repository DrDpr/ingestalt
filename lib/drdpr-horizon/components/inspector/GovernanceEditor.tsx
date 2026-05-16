'use client';

import React, { useState } from 'react';
import { ShieldAlert, Settings2, ChevronDown, ChevronUp, Trash2, Plus, Copy } from 'lucide-react';
import { GarnishedNode } from '../canvas/nodes/GarnishedNode';
import { db } from '../../lib/db';
import { useUIStore } from '../../lib/store/useUIStore';
import { useSync } from '../../lib/hooks/useSync';
import { LocalInput } from '../ui/LocalInput';
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
    <div className="bg-background h-full flex flex-col overflow-hidden">
      {!hideHeader && (
        <div className="p-4 flex items-center justify-between bg-card/20">
          <div className="flex items-center gap-2 text-amber-500">
            <ShieldAlert size={16} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Governance Manifest</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLocalIsEditing(!localIsEditing)} 
              className={`p-1.5 rounded-md transition-colors ${localIsEditing ? 'bg-amber-600 text-foreground' : 'bg-secondary text-foreground/60 hover:text-foreground'}`}
            >
              <Settings2 size={14} />
            </button>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-1.5 rounded-md bg-secondary text-foreground/60 hover:text-foreground transition-colors"
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
      )}

      {(!isCollapsed || hideHeader) && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-background">
          {definitions.map((def: any, idx: number) => (
            <div key={idx} className="space-y-4 p-4 bg-card/50 rounded-xl border border-border/50 hover:border-amber-500/30 transition-colors">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <DynamicIcon name={def.icon || 'Box'} size={12} style={{ color: def.color || '#888888' }} />
                      <span className="text-xs uppercase font-bold tracking-widest" style={{ color: def.color || '#888888' }}>
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
                        className="p-1 hover:bg-secondary text-foreground/60 rounded transition-colors"
                      >
                        {collapsedConfigs[idx] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      </button>
                    </div>
                  </div>
                  
                  {!collapsedConfigs[idx] && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1"><label className="text-xs uppercase font-bold text-foreground/50">Type ID</label><LocalInput className="w-full bg-secondary border border-input rounded px-2 py-1 text-xs text-amber-200 font-mono" value={def.id} onChange={(val) => updateDef(idx, { id: val })} /></div>
                        <div className="space-y-1"><label className="text-xs uppercase font-bold text-foreground/50">Category</label><LocalInput className="w-full bg-secondary border border-input rounded px-2 py-1 text-xs text-foreground/80" value={def.type} onChange={(val) => updateDef(idx, { type: val })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1"><label className="text-xs uppercase font-bold text-foreground/50">Lucide Icon</label><LocalInput className="w-full bg-secondary border border-input rounded px-2 py-1 text-xs text-foreground/80" value={def.icon} onChange={(val) => updateDef(idx, { icon: val })} /></div>
                        <div className="space-y-1"><label className="text-xs uppercase font-bold text-foreground/50">Accent</label><LocalInput type="color" className="w-full h-7 bg-secondary border border-input rounded p-1 cursor-pointer" value={def.color} onChange={(val) => updateDef(idx, { color: val })} /></div>
                      </div>
                      
                      {/* Nested Field Editor */}
                      <div className="pt-2 border-t border-border">
                        <label className="text-xs uppercase font-bold text-foreground/50 mb-2 block">Properties</label>
                        <div className="grid grid-cols-1 gap-2">
                          {(def.fields || []).map((field: any, fIdx: number) => (
                            <div key={fIdx} className="grid grid-cols-5 gap-1 items-center bg-secondary/30 p-1 rounded-md group">
                              <LocalInput className="bg-transparent text-xs text-foreground/70 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-1" value={field.name} onChange={(val) => {
                                const newFields = [...def.fields];
                                newFields[fIdx].name = val;
                                updateDef(idx, { fields: newFields });
                              }} />
                              <LocalInput className="bg-transparent text-xs text-blue-400/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-1" value={field.type} onChange={(val) => {
                                const newFields = [...def.fields];
                                newFields[fIdx].type = val;
                                updateDef(idx, { fields: newFields });
                              }} />
                              <LocalInput className="bg-transparent text-xs text-foreground/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-1" value={field.icon || ''} placeholder="Icon" onChange={(val) => {
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
                          className="mt-2 w-full flex items-center justify-center gap-1.5 p-1.5 border border-dashed border-input hover:border-amber-500/50 hover:text-amber-400/70 text-xs font-bold uppercase tracking-widest text-foreground/50 rounded-md transition-all"
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
                    <span className="text-xs text-foreground/50 uppercase font-bold tracking-widest font-mono">{def.id}</span>
                    <span className="text-xs text-amber-500/50 uppercase font-bold">{def.type}</span>
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
              className="w-full p-3 rounded-xl border-2 border-dashed border-border hover:border-amber-500/50 text-foreground/50 hover:text-amber-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={14} /> Add Configuration
            </button>
          )}
        </div>
      )}
    </div>
  );
}
