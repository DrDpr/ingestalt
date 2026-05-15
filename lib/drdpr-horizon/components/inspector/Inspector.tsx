'use client';

import React, { useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store/useUIStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { X, Eye, Edit2, ChevronDown, ChevronRight, Share2, ShieldAlert, Cpu, FileText, Settings2, HardDrive, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSync } from '@/lib/hooks/useSync';
import { LocalInput } from '@/components/ui/LocalInput';

// --- Modular Imports ---
import { RelationshipPanel } from './RelationshipPanel';
import { GovernanceEditor } from './GovernanceEditor';
import { PayloadInterpretersView } from './PayloadInterpretersView';
import { HorizonEditor } from './Editor';

export function Inspector() {
  const { selectedNodeId, setSelectedNodeId, autoSaveEnabled } = useUIStore();
  const { syncNodeToFile } = useSync();
  const [mode, setMode] = useState<'preview' | 'edit'>('edit');
  const [isSavingManual, setIsSavingManual] = useState(false);
  
  // Panel States
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    relationships: true,
    governance: true,
    payload: true,
    documentation: true
  });

  // Governance Edit State (MOVED ABOVE EARLY RETURN)
  const [isEditingGovernance, setIsEditingGovernance] = useState(false);

  const togglePanel = (id: string) => {
    setOpenPanels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeNode = useLiveQuery(
    () => (selectedNodeId ? db.nodes.get(selectedNodeId) : undefined),
    [selectedNodeId]
  );

  // Check for relationships to decide whether to show the panel
  const hasRelationships = useLiveQuery(async () => {
    if (!selectedNodeId) return false;
    const count = await db.edges.where('sourceId').equals(selectedNodeId)
      .or('targetId').equals(selectedNodeId)
      .count();
    return count > 0;
  }, [selectedNodeId]);

  // Check for standards to decide if Properties panel is applicable
  const activeStandards = useLiveQuery(
    () => db.nodes.toArray().then(nodes => nodes.filter(n => n.payload?.type === 'standards')), 
    []
  );

  const standardDef = useMemo(() => {
    if (!activeNode || !activeStandards) return null;
    const configId = activeNode.configId;
    for (const s of activeStandards) {
      const def = (s.payload?.definitions || []).find((d: any) => d.id === configId);
      if (def) return def;
      if (s.id === configId) return s.payload;
    }
    return null;
  }, [activeNode, activeStandards]);

  if (!selectedNodeId || !activeNode) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500 font-mono text-[10px] uppercase tracking-widest">
        Select a node to inspect
      </div>
    );
  }

  const { payload } = activeNode;
  const type = payload?.type || 'other';

  // --- Logic for Visibility ---
  const showGovernance = type === 'standards';
  const showPayload = !!(standardDef && standardDef.fields);

  const handleManualSave = async () => {
    if (!selectedNodeId) return;
    setIsSavingManual(true);
    await syncNodeToFile(selectedNodeId);
    // Artificial delay for feedback
    setTimeout(() => setIsSavingManual(false), 500);
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!selectedNodeId) return;
    await db.nodes.update(selectedNodeId, {
      'payload.title': newTitle,
      lastModified: Date.now()
    });
    if (autoSaveEnabled) await syncNodeToFile(selectedNodeId);
  };

  return (
    <div className="flex flex-col h-full bg-[#080808] text-neutral-200 overflow-hidden">
      {/* Inspector Header */}
      <div className="flex justify-between items-start p-4 border-b border-neutral-800 bg-neutral-900/50 flex-shrink-0 z-20">
        <div className="flex-1 min-w-0 mr-4">
          <LocalInput 
            value={payload?.title || ''}
            onChange={(val) => handleTitleChange(val)}
            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-neutral-100 uppercase tracking-widest placeholder:text-neutral-700"
            placeholder="Node Title"
          />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-bold uppercase">
              {type}
            </span>
            <LocalInput 
              value={payload?.filename || `${activeNode.id}.md`}
              onChange={async (val) => {
                await db.nodes.update(selectedNodeId, {
                  'payload.filename': val,
                  lastModified: Date.now()
                });
                if (autoSaveEnabled) await syncNodeToFile(selectedNodeId);
              }}
              className="bg-transparent border-none focus:ring-0 text-[9px] text-neutral-600 font-mono italic outline-none hover:text-neutral-400 transition-colors w-full"
              placeholder={`${activeNode.id}.md`}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!autoSaveEnabled && (
            <button 
              onClick={handleManualSave}
              disabled={isSavingManual}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest ${
                isSavingManual 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-blue-500/50 hover:text-white'
              }`}
            >
              {isSavingManual ? <Loader2 size={12} className="animate-spin" /> : <HardDrive size={12} />}
              {isSavingManual ? 'Saving...' : 'Save to Disk'}
            </button>
          )}

          <div className="flex bg-neutral-800 rounded-lg p-1 mr-2">
            <button 
              onClick={() => setMode('preview')}
              className={`p-1.5 rounded-md transition-colors ${mode === 'preview' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <Eye size={14} />
            </button>
            <button 
              onClick={() => setMode('edit')}
              className={`p-1.5 rounded-md transition-colors ${mode === 'edit' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <Edit2 size={14} />
            </button>
          </div>
          <button 
            onClick={() => setSelectedNodeId(null)}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Accordion Stack Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* 1. Relationships (Only if connected) */}
        {hasRelationships && (
          <CollapsibleSection 
            id="relationships" 
            title="Relationships" 
            icon={<Share2 size={14} className="text-blue-500" />} 
            isOpen={openPanels.relationships} 
            onToggle={() => togglePanel('relationships')}
          >
            <RelationshipPanel node={activeNode} hideHeader />
          </CollapsibleSection>
        )}

        {/* 2. Governance (Only for Standards Nodes) */}
        {showGovernance && (
          <CollapsibleSection 
            id="governance" 
            title="Governance Manifest" 
            icon={<ShieldAlert size={14} className="text-amber-500" />} 
            isOpen={openPanels.governance} 
            onToggle={() => togglePanel('governance')}
            headerAction={
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditingGovernance(!isEditingGovernance); }}
                className={`p-1 rounded-md transition-colors ${isEditingGovernance ? 'bg-amber-600 text-white' : 'hover:bg-neutral-800 text-neutral-500'}`}
              >
                <Settings2 size={12} />
              </button>
            }
          >
            <GovernanceEditor node={activeNode} hideHeader externalIsEditing={isEditingGovernance} />
          </CollapsibleSection>
        )}

        {/* 3. Payload / Interpretation (Only if standard matches) */}
        {showPayload && (
          <CollapsibleSection 
            id="payload" 
            title="Properties" 
            icon={<Cpu size={14} className="text-purple-500" />} 
            isOpen={openPanels.payload} 
            onToggle={() => togglePanel('payload')}
          >
            <PayloadInterpretersView node={activeNode} hideHeader />
          </CollapsibleSection>
        )}

        {/* 4. Documentation (Always Visible) */}
        <CollapsibleSection 
          id="documentation" 
          title="Documentation" 
          icon={<FileText size={14} className="text-green-500" />} 
          isOpen={openPanels.documentation} 
          onToggle={() => togglePanel('documentation')}
          isLast
        >
          <div className="min-h-[300px]">
            {mode === 'edit' ? (
              <HorizonEditor 
                key={activeNode.id} 
                nodeId={activeNode.id} 
                initialContent={payload?.content || ''} 
              />
            ) : (
              <div className="p-6 overflow-auto prose prose-invert prose-sm max-w-none custom-scrollbar bg-neutral-950">
                <ReactMarkdown>{payload?.content || ''}</ReactMarkdown>
              </div>
            )}
          </div>
        </CollapsibleSection>

      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isLast?: boolean;
  headerAction?: React.ReactNode;
}

function CollapsibleSection({ title, icon, isOpen, onToggle, children, isLast, headerAction }: CollapsibleSectionProps) {
  return (
    <div className={`border-b border-neutral-800/50 ${isLast ? 'border-b-0' : ''}`}>
      <div className="flex items-center bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors group">
        <button 
          onClick={onToggle}
          className="flex-1 h-10 flex items-center gap-3 px-4"
        >
          {isOpen ? <ChevronDown size={14} className="text-neutral-600" /> : <ChevronRight size={14} className="text-neutral-600" />}
          <div className="flex items-center gap-2">
            {icon}
            <span className={`text-[10px] uppercase tracking-[0.15em] font-black transition-colors ${isOpen ? 'text-neutral-300' : 'text-neutral-500'}`}>
              {title}
            </span>
          </div>
        </button>
        {headerAction && (
          <div className="px-3">
            {headerAction}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="bg-neutral-950 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
