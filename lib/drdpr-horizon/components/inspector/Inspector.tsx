'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { X, Eye, Edit2, ChevronDown, ChevronRight, Share2, ShieldAlert, Cpu, FileText, Settings2, HardDrive, Loader2, Palette, Tag, Plus, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSync } from '@/lib/drdpr-horizon/lib/hooks/useSync';
import { LocalInput } from '@/lib/drdpr-horizon/components/ui/LocalInput';
import { DynamicIcon } from '@/lib/drdpr-horizon/components/DynamicIcon';
import { IconPickerModal } from '@/lib/drdpr-horizon/components/IconPickerModal';
import { ConfirmDialog } from '@/lib/drdpr-horizon/components/ConfirmDialog';

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
  
  // New Feature States
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showStandardsDropdown, setShowStandardsDropdown] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const standardsDropdownRef = useRef<HTMLDivElement>(null);

  // Close standards dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (standardsDropdownRef.current && !standardsDropdownRef.current.contains(event.target as Node)) {
        setShowStandardsDropdown(false);
      }
    };

    if (showStandardsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStandardsDropdown]);

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
  // Filter by current workspace to avoid duplicates from other workspaces
  const activeStandards = useLiveQuery(async () => {
    if (!activeNode) return [];
    const workspaceId = activeNode.workspaceId;
    const allNodes = await db.nodes.where('workspaceId').equals(workspaceId).toArray();
    return allNodes.filter(n => n.payload?.type === 'standards');
  }, [activeNode?.workspaceId]);

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
      <div className="flex items-center justify-center h-full text-foreground/30 font-mono text-xs uppercase ">
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

  // New Feature Handlers
  const handleColorChange = async (newColor: string) => {
    if (!selectedNodeId) return;
    await db.nodes.update(selectedNodeId, {
      'payload.color': newColor,
      lastModified: Date.now()
    });
    if (autoSaveEnabled) await syncNodeToFile(selectedNodeId);
  };

  const handleIconChange = async (newIcon: string) => {
    if (!selectedNodeId) return;
    await db.nodes.update(selectedNodeId, {
      'payload.icon': newIcon,
      lastModified: Date.now()
    });
    setShowIconPicker(false);
    if (autoSaveEnabled) await syncNodeToFile(selectedNodeId);
  };

  const handleStandardChange = async (newConfigId: string) => {
    if (!selectedNodeId) return;
    await db.nodes.update(selectedNodeId, {
      configId: newConfigId,
      lastModified: Date.now()
    });
    setShowStandardsDropdown(false);
    if (autoSaveEnabled) await syncNodeToFile(selectedNodeId);
  };

  const handleAddTag = async () => {
    if (!selectedNodeId || !newTagInput.trim()) return;
    const currentTags = activeNode?.payload?.tags || [];
    if (currentTags.includes(newTagInput.trim())) {
      setNewTagInput('');
      return;
    }
    await db.nodes.update(selectedNodeId, {
      'payload.tags': [...currentTags, newTagInput.trim()],
      lastModified: Date.now()
    });
    setNewTagInput('');
    if (autoSaveEnabled) await syncNodeToFile(selectedNodeId);
  };

  const handleRemoveTag = async (tag: string) => {
    if (!selectedNodeId) return;
    const currentTags = activeNode?.payload?.tags || [];
    await db.nodes.update(selectedNodeId, {
      'payload.tags': currentTags.filter((t: string) => t !== tag),
      lastModified: Date.now()
    });
    setShowDeleteConfirm(false);
    setTagToDelete(null);
    if (autoSaveEnabled) await syncNodeToFile(selectedNodeId);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground/60 overflow-hidden">
      {/* Modals */}
      <IconPickerModal
        show={showIconPicker}
        currentIcon={payload?.icon || 'FileText'}
        onSelect={handleIconChange}
        onCancel={() => setShowIconPicker(false)}
      />
      <ConfirmDialog
        show={showDeleteConfirm}
        title="Remove Tag"
        message={`Are you sure you want to remove the tag "${tagToDelete}"?`}
        variant="warning"
        confirmText="Remove"
        onConfirm={() => tagToDelete && handleRemoveTag(tagToDelete)}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTagToDelete(null);
        }}
      />

      {/* Inspector Header */}
      <div className="flex justify-between items-start p-4 border-b border-border bg-background/50 flex-shrink-0 z-20">
        <div className="flex-1 min-w-0 mr-4">
          <LocalInput
            value={payload?.title || ''}
            onChange={(val) => handleTitleChange(val)}
            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-foreground/80 uppercase  placeholder:text-foreground/30"
            placeholder="Node Title"
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Standards Switcher */}
            <div className="relative" ref={standardsDropdownRef}>
              <button
                onClick={() => setShowStandardsDropdown(!showStandardsDropdown)}
                className="text-xs px-1.5 py-0.5 rounded bg-background text-foreground/50 font-bold uppercase hover:bg-secondary transition-colors flex items-center gap-1"
              >
                {type}
                <ChevronDown size={10} />
              </button>
              {showStandardsDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[150px] max-h-[200px] overflow-y-auto custom-scrollbar">
                  {activeStandards?.map((std) => (
                    <div key={std.id}>
                      {std.payload?.definitions?.map((def: any) => (
                        <button
                          key={def.id}
                          onClick={() => handleStandardChange(def.id)}
                          className={`w-full px-3 py-2 text-left text-xs hover:bg-secondary transition-colors flex items-center gap-2 ${
                            activeNode.configId === def.id ? 'bg-secondary' : ''
                          }`}
                        >
                          <DynamicIcon name={def.icon || 'Box'} size={12} style={{ color: def.color }} />
                          <span>{def.type}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-1">
              <Palette size={10} className="text-foreground/40" />
              <input
                type="color"
                value={payload?.color || '#52525b'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-6 h-4 rounded cursor-pointer border border-border"
                title="Node Color"
              />
            </div>

            {/* Icon Picker */}
            <button
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background hover:bg-secondary transition-colors"
              title="Change Icon"
            >
              <DynamicIcon name={payload?.icon || 'FileText'} size={12} style={{ color: payload?.color || '#52525b' }} />
            </button>

            <LocalInput
              value={payload?.filename || `${activeNode.id}.md`}
              onChange={async (val) => {
                await db.nodes.update(selectedNodeId, {
                  'payload.filename': val,
                  lastModified: Date.now()
                });
                if (autoSaveEnabled) await syncNodeToFile(selectedNodeId);
              }}
              className="bg-transparent border-none focus:ring-0 text-xs text-foreground/50 font-mono italic outline-none hover:text-foreground/30 transition-colors flex-1 min-w-[100px]"
              placeholder={`${activeNode.id}.md`}
            />
          </div>

          {/* Inline Tag Editor */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <Tag size={10} className="text-foreground/40" />
            {(payload?.tags || []).map((tag: string) => (
              <div
                key={tag}
                className="group flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs text-blue-400"
              >
                <span>{tag}</span>
                <button
                  onClick={() => {
                    setTagToDelete(tag);
                    setShowDeleteConfirm(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                >
                  <XCircle size={10} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
                className="w-20 px-2 py-0.5 text-xs bg-transparent border border-dashed border-border rounded focus:outline-none focus:border-blue-500 text-foreground/60"
              />
              <button
                onClick={handleAddTag}
                className="p-0.5 hover:bg-secondary rounded transition-colors text-foreground/40 hover:text-foreground"
                title="Add Tag"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!autoSaveEnabled && (
            <button 
              onClick={handleManualSave}
              disabled={isSavingManual}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase  ${
                isSavingManual 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                  : 'bg-background border-input text-foreground/50 hover:border-blue-500/50 hover:text-foreground'
              }`}
            >
              {isSavingManual ? <Loader2 size={12} className="animate-spin" /> : <HardDrive size={12} />}
              {isSavingManual ? 'Saving...' : 'Save to Disk'}
            </button>
          )}

          <div className="flex bg-background rounded-lg p-1 mr-2">
            <button 
              onClick={() => setMode('preview')}
              className={`p-1.5 rounded-md transition-colors ${mode === 'preview' ? 'bg-background text-foreground' : 'text-foreground/50 hover:text-foreground/60'}`}
            >
              <Eye size={14} />
            </button>
            <button 
              onClick={() => setMode('edit')}
              className={`p-1.5 rounded-md transition-colors ${mode === 'edit' ? 'bg-background text-foreground' : 'text-foreground/50 hover:text-foreground/60'}`}
            >
              <Edit2 size={14} />
            </button>
          </div>
          <button 
            onClick={() => setSelectedNodeId(null)}
            className="p-1 hover:bg-background rounded text-foreground/50 hover:text-foreground transition-colors"
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
                className={`p-1 rounded-md transition-colors ${isEditingGovernance ? 'bg-amber-600 text-foreground' : 'hover:bg-background text-foreground/50'}`}
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
              <div className="p-6 overflow-auto prose prose-sm max-w-none custom-scrollbar bg-background">
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
    <div className={`border-b border-border/50 ${isLast ? 'border-b-0' : ''}`}>
      <div className="flex items-center bg-background/30 hover:bg-background/50 transition-colors group">
        <button 
          onClick={onToggle}
          className="flex-1 h-10 flex items-center gap-3 px-4"
        >
          {isOpen ? <ChevronDown size={14} className="text-foreground/50" /> : <ChevronRight size={14} className="text-foreground/50" />}
          <div className="flex items-center gap-2">
            {icon}
            <span className={`text-xs font-black uppercase transition-colors ${isOpen ? 'text-foreground/50' : 'text-foreground/50'}`}>
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
        <div className="bg-background animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
