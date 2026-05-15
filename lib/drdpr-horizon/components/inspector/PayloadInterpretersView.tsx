'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Cpu, Loader2
} from 'lucide-react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useGenerator } from '@/lib/hooks/useGenerator';
import { DynamicIcon } from '../DynamicIcon';
import { useFileSystem } from '@/lib/hooks/useFileSystem';
import { useSync } from '@/lib/hooks/useSync';
import { useUIStore } from '@/lib/store/useUIStore';
import { ExternalLink, FolderOpen, Save, Trash2, Plus, ChevronDown } from 'lucide-react';
import { LocalInput, LocalTextArea } from '@/components/ui/LocalInput';

// --- Modular Imports ---
import { 
  SchemaTable, 
  TablesList, 
  InterfaceList, 
  CodeList,
  UserStoryList,
  ProcessFlowList
} from './PayloadInterpreters';

export function PayloadInterpretersView({ node, hideHeader = false }: { node: any, hideHeader?: boolean }) {
  const { syncNodeToFile } = useSync();
  const { autoSaveEnabled } = useUIStore();
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [rootInput, setRootInput] = useState('');
  
  const { payload, configId } = node;
  const { openInCode, hasRoot, setLocalRoot, getLocalRoot } = useFileSystem();

  const { generateApiFromDb, isGenerating } = useGenerator();

  const handleAction = (callback: () => void) => {
    if (!hasRoot) {
      setRootInput(getLocalRoot());
      setIsConfiguring(true);
    } else {
      callback();
    }
  };

  const handleSaveRoot = () => {
    if (rootInput.trim()) {
      setLocalRoot(rootInput.trim());
      setIsConfiguring(false);
    }
  };

  const activeStandards = useLiveQuery(
    () => db.nodes.toArray().then(nodes => nodes.filter(n => n.payload?.type === 'standards')), 
    []
  );
  
  const standardDef = useMemo(() => {
    if (!activeStandards) return null;
    for (const s of activeStandards) {
      const def = (s.payload?.definitions || []).find((d: any) => d.id === configId);
      if (def) return def;
      if (s.id === configId) return s.payload;
    }
    return null;
  }, [activeStandards, configId]);

  const handleDeleteField = async (fieldName: string) => {
    if (!confirm(`Remove field "${fieldName}" from this node?`)) return;
    const newPayload = { ...payload };
    delete newPayload[fieldName];
    
    await db.nodes.update(node.id, { payload: newPayload, lastModified: Date.now() });
    if (autoSaveEnabled) await syncNodeToFile(node.id);
  };

  const handleAddField = async (fieldName: string) => {
    const newPayload = { ...payload };
    // Initialize with empty default based on standard or common sense
    newPayload[fieldName] = '';
    
    await db.nodes.update(node.id, { payload: newPayload, lastModified: Date.now() });
    if (autoSaveEnabled) await syncNodeToFile(node.id);
  };

  const handleUpdateField = async (fieldName: string, value: any) => {
    const newPayload = { ...payload, [fieldName]: value };
    await db.nodes.update(node.id, { payload: newPayload, lastModified: Date.now() });
    // Note: We don't auto-sync on every keystroke here to avoid disk thrashing.
    // The user can rely on the debounce in the Editor or manual save, but let's 
    // add a debounced sync here if needed later. For now, it just updates DB.
  };

  const handleUpdateFieldBlur = async () => {
    if (autoSaveEnabled) await syncNodeToFile(node.id);
  };

  // Find fields defined in standard but missing in node payload
  const missingFields = useMemo(() => {
    if (!standardDef?.fields) return [];
    return standardDef.fields.filter((f: any) => payload[f.name] === undefined);
  }, [standardDef, payload]);

  const toggleColumn = (name: string) => {
    const next = new Set(selectedColumns);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedColumns(next);
  };

  if (!standardDef || !standardDef.fields) {
    return (
      <div className="p-8 text-center text-neutral-600 text-xs italic bg-neutral-950 h-full">
        No specific standard assigned for data interpretation.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-950 relative">
      {/* Configuration Overlay */}
      {isConfiguring && (
        <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <FolderOpen size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Setup Local Root</h3>
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              To open files and jump to methods, Horizon needs to know where your project lives on this computer.
            </p>
            <div className="space-y-2">
              <input 
                type="text" 
                value={rootInput}
                onChange={(e) => setRootInput(e.target.value)}
                placeholder="e.g. D:/Desktop/Horizon/horizon"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-white focus:border-blue-500 outline-none transition-colors"
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveRoot}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  Save Configuration
                </button>
                <button 
                  onClick={() => setIsConfiguring(false)}
                  className="px-4 py-2 text-[10px] text-neutral-500 hover:text-white uppercase font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!hideHeader && (
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400">
            <Cpu size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Properties</h3>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-32">
        {selectedColumns.size > 0 && (
          <button 
            disabled={isGenerating} 
            onClick={() => generateApiFromDb(node, Array.from(selectedColumns))} 
            className="w-full flex items-center justify-center gap-1.5 text-[10px] bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white px-2 py-2 rounded shadow-lg transition-all font-bold sticky top-0 z-10"
          >
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            GENERATE API FROM SELECTED
          </button>
        )}

        <div className="space-y-8">
          {standardDef.fields.map((field: any, idx: number) => {
            const fieldData = payload[field.name];
            if (fieldData === undefined) return null; // Only show if exists in payload
            
            return (
              <div key={idx} className="group/field relative space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 uppercase font-black tracking-widest ml-1" style={{ color: field.color }}>
                  <div className="flex items-center gap-2">
                    <DynamicIcon name={field.icon || 'Box'} size={13} />
                    {field.name.replace(/_/g, ' ')}
                  </div>
                  <button 
                    onClick={() => handleDeleteField(field.name)}
                    className="opacity-0 group-hover/field:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                
                {field.type === 'schema_table' && (
                  <SchemaTable 
                    data={fieldData} 
                    selectedColumns={selectedColumns} 
                    onToggle={toggleColumn} 
                    onUpdate={async (newData) => {
                      await handleUpdateField(field.name, newData);
                      handleUpdateFieldBlur();
                    }}
                  />
                )}
                {field.type === 'tables_list' && (
                  <TablesList 
                    data={fieldData} 
                    selectedColumns={selectedColumns}
                    onToggle={toggleColumn}
                    onUpdate={async (newData) => {
                      await handleUpdateField(field.name, newData);
                      handleUpdateFieldBlur();
                    }}
                  />
                )}
                {field.type === 'interface_list' && (
                  <InterfaceList 
                    data={fieldData} 
                    filePath={payload.filepath} 
                    onAction={(cb) => handleAction(cb)}
                    onUpdate={async (newData) => {
                      await handleUpdateField(field.name, newData);
                      handleUpdateFieldBlur();
                    }}
                  />
                )}
                {field.type === 'code_list' && (
                  <CodeList 
                    data={fieldData} 
                    onUpdate={async (newData) => {
                      await handleUpdateField(field.name, newData);
                      handleUpdateFieldBlur();
                    }}
                  />
                )}
                {field.type === 'story_list' && (
                  <UserStoryList 
                    data={fieldData} 
                    onUpdate={async (newData) => {
                      await handleUpdateField(field.name, newData);
                      handleUpdateFieldBlur();
                    }}
                  />
                )}
                {field.type === 'flow_list' && (
                  <ProcessFlowList 
                    data={fieldData} 
                    onUpdate={async (newData) => {
                      await handleUpdateField(field.name, newData);
                      handleUpdateFieldBlur();
                    }}
                  />
                )}
                {field.type === 'file_path' && (
                  <div className="flex items-center gap-2">
                    <LocalInput 
                      value={fieldData} 
                      onChange={(val) => handleUpdateField(field.name, val)}
                      onBlur={handleUpdateFieldBlur}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded p-2 text-xs font-mono text-neutral-300 focus:border-blue-500 focus:outline-none"
                    />
                    <button 
                      onClick={() => handleAction(() => openInCode(fieldData))}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded border border-neutral-700 transition-colors flex-shrink-0"
                      title="Open in VSCode"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                )}
                {/* Smart fallback for unspecialized types */}
                {!['schema_table', 'tables_list', 'interface_list', 'code_list', 'file_path', 'story_list', 'flow_list', 'library_list'].includes(field.type) && (() => {
                  // Array of primitives → editable tag chips
                  if (Array.isArray(fieldData)) {
                    return (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {fieldData.map((item: any, i: number) => (
                            <div key={i} className="group flex items-center gap-1 bg-neutral-800 border border-neutral-700 rounded-full px-2 py-0.5">
                              <span className="text-xs font-mono text-neutral-300">{String(item)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  // Plain object → pretty JSON read-only
                  if (typeof fieldData === 'object' && fieldData !== null) {
                    return (
                      <pre className="bg-neutral-900 border border-neutral-800 rounded p-3 text-xs font-mono text-blue-200/70 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(fieldData, null, 2)}
                      </pre>
                    );
                  }
                  // Long string → multiline textarea
                  const strVal = String(fieldData ?? '');
                  if (strVal.length > 60 || strVal.includes('\n')) {
                    return (
                      <LocalTextArea
                        value={strVal}
                        onChange={(val) => handleUpdateField(field.name, val)}
                        onBlur={handleUpdateFieldBlur}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-xs font-mono text-neutral-300 focus:border-blue-500 focus:outline-none min-h-[80px] resize-y"
                      />
                    );
                  }
                  // Short string → single-line input
                  return (
                    <LocalInput
                      value={strVal}
                      onChange={(val) => handleUpdateField(field.name, val)}
                      onBlur={handleUpdateFieldBlur}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-xs font-mono text-neutral-300 focus:border-blue-500 focus:outline-none"
                    />
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Add Field Section */}
        {missingFields.length > 0 && (
          <div className="pt-6 border-t border-neutral-900">
            <div className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
              <Plus size={10} />
              Available Attributes
            </div>
            <div className="grid grid-cols-1 gap-2">
              {missingFields.map((f: any) => (
                <button
                  key={f.name}
                  onClick={() => handleAddField(f.name)}
                  className="flex items-center gap-3 p-3 bg-neutral-900/40 border border-neutral-800/50 hover:border-blue-500/50 hover:bg-neutral-900 rounded-xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                    <DynamicIcon name={f.icon || 'Plus'} size={14} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-neutral-300 group-hover:text-white">{f.name}</div>
                    <div className="text-[9px] text-neutral-600 uppercase tracking-tighter">{f.type.replace('_', ' ')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
