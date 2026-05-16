'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Cpu, Loader2
} from 'lucide-react';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useGenerator } from '../../lib/hooks/useGenerator';
import { DynamicIcon } from '../DynamicIcon';

// --- Modular Imports ---
import { 
  SchemaTable, 
  TablesList, 
  InterfaceList, 
  CodeList 
} from './PayloadInterpreters';
import { GovernanceEditor } from './GovernanceEditor';
import { RelationshipPanel } from './RelationshipPanel';

export function SchemaPanel({ node }: { node: any }) {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const { payload, configId } = node;
  const type = payload?.type || 'other';

  const { generateApiFromDb, isGenerating } = useGenerator();

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

  const toggleColumn = (name: string) => {
    const next = new Set(selectedColumns);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedColumns(next);
  };

  // 1. Governance View
  if (type === 'standards') {
    return <GovernanceEditor node={node} />;
  }

  // 2. Data/Interpreter View
  if (standardDef && standardDef.fields) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Top-level system context */}
        <RelationshipPanel node={node} />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="bg-background p-4 border-b border-border space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-400">
                <Cpu size={16} className="text-amber-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Properties</h3>
              </div>
              {selectedColumns.size > 0 && (
                <button 
                  disabled={isGenerating} 
                  onClick={() => generateApiFromDb(node, Array.from(selectedColumns))} 
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-secondary text-foreground px-2 py-1 rounded shadow-lg transition-all animate-fade-in font-bold"
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  GENERATE API
                </button>
              )}
            </div>

            <div className="space-y-6 pb-20">
              {standardDef.fields.map((field: any, idx: number) => {
                const fieldData = payload[field.name];
                if (!fieldData) return null;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase font-black tracking-widest ml-1" style={{ color: field.color }}>
                      <DynamicIcon name={field.icon || 'Box'} size={12} />
                      {field.name}
                    </div>
                    
                    {field.type === 'schema_table' && (
                      <SchemaTable 
                        data={fieldData} 
                        selectedColumns={selectedColumns} 
                        onToggle={toggleColumn} 
                      />
                    )}
                    {field.type === 'tables_list' && (
                      <TablesList 
                        data={fieldData} 
                        selectedColumns={selectedColumns}
                        onToggle={toggleColumn}
                      />
                    )}
                    {field.type === 'interface_list' && <InterfaceList data={fieldData} />}
                    {field.type === 'code_list' && <CodeList data={fieldData} />}
                    {field.type === 'file_path' && (
                      <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-card p-2 rounded-lg border border-border">
                        <DynamicIcon name="FileCode" size={14} className="text-purple-500" />
                        {fieldData}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Fallback (at least show relationships)
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <RelationshipPanel node={node} />
      <div className="p-8 text-center space-y-2">
        <div className="text-neutral-600 text-xs italic">No specific standard assigned.</div>
        <div className="text-xs text-neutral-700 font-mono uppercase tracking-widest">{configId}</div>
      </div>
    </div>
  );
}
