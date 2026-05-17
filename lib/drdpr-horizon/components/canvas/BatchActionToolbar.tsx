'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { X, Trash2, Download, FileText, Copy, Files, Sparkles, Loader2, LayoutGrid, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateProfessionalWiki } from '@/lib/drdpr-horizon/lib/publish/wikiGenerator';
import { performAutoLayout, LAYOUT_CONFIG } from '@/lib/drdpr-horizon/lib/ingest-client';
import { PromptModal } from '../PromptModal';
import { useMediaQuery } from '@/lib/drdpr-horizon/lib/hooks/useMediaQuery';

export function BatchActionToolbar() {
  const { selectedNodeIds, clearNodeSelection, selectAllNodes, setPrimaryNodeId, isLeftOpen, isInspectorOpen } = useUIStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState(LAYOUT_CONFIG);
  const [promptConfig, setPromptConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    options?: { label: string; value: string; variant?: 'default' | 'danger' }[];
    type?: 'default' | 'danger' | 'warning' | 'success' | 'info';
    icon?: React.ReactNode;
    onConfirm: (val: string) => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const [showWikiModal, setShowWikiModal] = useState(false);
  const [wikiTitle, setWikiTitle] = useState('Project Knowledge Base');
  const [wikiAuthor, setWikiAuthor] = useState('Ingestalt User');
  const [wikiIcon, setWikiIcon] = useState('📚');
  const [wikiEnableProjectRoot, setWikiEnableProjectRoot] = useState(true);

  if (selectedNodeIds.size === 0) return null;
  if (!isDesktop && (isLeftOpen || isInspectorOpen)) return null;

  const handleDelete = async () => {
    setPromptConfig({
      show: true,
      title: 'DELETE SELECTION',
      message: `Are you sure you want to delete ${selectedNodeIds.size} selected nodes and all their connections?`,
      type: 'danger',
      icon: <Trash2 size={24} />,
      options: [
        { label: 'DELETE ALL', value: 'confirm', variant: 'danger' },
        { label: 'CANCEL', value: 'cancel' }
      ],
      onConfirm: async (val) => {
        if (val === 'confirm') {
          await db.nodes.bulkDelete(Array.from(selectedNodeIds));
          const edges = await db.edges.toArray();
          const edgesToDelete = edges.filter(e => 
            selectedNodeIds.has(e.sourceId) || selectedNodeIds.has(e.targetId)
          );
          await db.edges.bulkDelete(edgesToDelete.map(e => e.id));
          clearNodeSelection();
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleExport = async () => {
    const nodes = await db.nodes.bulkGet(Array.from(selectedNodeIds));
    const validNodes = nodes.filter((n): n is any => n !== undefined);
    
    // Also export edges between these nodes
    const allEdges = await db.edges.toArray();
    const relevantEdges = allEdges.filter(e => 
      selectedNodeIds.has(e.sourceId) && selectedNodeIds.has(e.targetId)
    );
    
    const exportData = {
      version: '1.1',
      nodes: validNodes,
      edges: relevantEdges,
      exportedAt: Date.now(),
      count: validNodes.length
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horizon_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateWiki = async () => {
    setShowWikiModal(true);
  };

  const handleCopyContent = async () => {
    const nodes = await db.nodes.bulkGet(Array.from(selectedNodeIds));
    const validNodes = nodes.filter(n => n !== undefined);
    
    const content = validNodes.map(node => {
      return `# ${node.payload?.title || 'Untitled'}\n\n${node.payload?.content || ''}\n\n---\n\n`;
    }).join('');
    
    await navigator.clipboard.writeText(content);
    setPromptConfig({
      show: true,
      title: 'COPIED',
      message: `${validNodes.length} nodes have been serialized and copied to your clipboard as Markdown.`,
      type: 'success',
      icon: <Copy size={24} />,
      options: [{ label: 'EXCELLENT', value: 'close' }],
      onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
    });
  };

  const handleDuplicate = async () => {
    if (selectedNodeIds.size === 0) return;
    
    const nodeIds = Array.from(selectedNodeIds);
    const nodesToDuplicate = await db.nodes.bulkGet(nodeIds);
    const validNodes = nodesToDuplicate.filter((n): n is any => n !== undefined);
    const idMap = new Map<string, string>();
    
    // 1. Map and create new nodes
    const newNodes = validNodes.map(node => {
      const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        lastModified: Date.now(),
      };
    });

    // 2. Find and clone internal edges
    const allEdges = await db.edges.toArray();
    const internalEdges = allEdges.filter(e => 
      idMap.has(e.sourceId) && idMap.has(e.targetId)
    ).map(e => ({
      ...e,
      id: `edge_${idMap.get(e.sourceId)}_${idMap.get(e.targetId)}`,
      sourceId: idMap.get(e.sourceId)!,
      targetId: idMap.get(e.targetId)!,
      workspaceId: e.workspaceId // Keep same workspace for duplication
    }));

    await db.transaction('rw', [db.nodes, db.edges], async () => {
      await db.nodes.bulkAdd(newNodes);
      await db.edges.bulkAdd(internalEdges);
    });

    // Select the newly created nodes
    if (newNodes.length > 0) {
      selectAllNodes(newNodes.map(n => n.id));
      setPrimaryNodeId(newNodes[0].id);
    }
  };

  const handleAutoLayout = async () => {
    setIsLayouting(true);
    try {
      await performAutoLayout(Array.from(selectedNodeIds), layoutConfig);
    } finally {
      setIsLayouting(false);
    }
  };

  const isVisible = selectedNodeIds.size > 0;

  return (
    <div className={`absolute top-28 md:top-auto md:bottom-8 bottom-auto left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 p-1.5 bg-card/60 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out ${
      isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 md:translate-y-12 scale-95 pointer-events-none'
    }`}>
      {/* Selection Count Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl mr-1">
        <span className="text-xs font-black uppercase tracking-widest text-blue-400">{selectedNodeIds.size} Selected</span>
      </div>
      
      <div className="flex gap-1">
        <ActionButton 
          onClick={handleCopyContent} 
          icon={<Copy size={16} />} 
          label="Copy Markdown" 
          color="text-foreground/60"
        />
        <ActionButton 
          onClick={handleDuplicate} 
          icon={<Files size={16} />} 
          label="Duplicate Selection" 
          color="text-foreground/60"
        />
        <ActionButton 
          onClick={handleExport} 
          icon={<Download size={16} />} 
          label="Export JSON" 
          color="text-foreground/60"
        />
        <ActionButton 
          onClick={handleGenerateWiki} 
          icon={isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} 
          label={isGenerating ? "Generating..." : "Generate Wiki"} 
          color="text-emerald-400"
          disabled={isGenerating}
        />
        
        <div className="relative flex items-center group/layout">
          <ActionButton 
            onClick={handleAutoLayout} 
            icon={isLayouting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
            label={isLayouting ? "Layouting..." : "Autolayout Selection"} 
            color="text-amber-400"
            disabled={isLayouting}
          />
          <button 
            onClick={() => setShowLayoutSettings(!showLayoutSettings)}
            className={`p-1 -ml-2 mr-1 rounded-full hover:bg-amber-500/10 transition-colors z-[110] ${showLayoutSettings ? 'text-amber-400 bg-amber-500/5' : 'text-foreground/20 hover:text-amber-400'}`}
            title="Layout Settings"
          >
            <ChevronUp size={12} className={`transition-transform duration-300 ${showLayoutSettings ? 'rotate-180' : ''}`} />
          </button>

          {showLayoutSettings && (
            <div className="absolute top-14 md:top-auto md:bottom-16 left-0 p-4 bg-card/90 backdrop-blur-3xl border border-border/40 rounded-3xl shadow-2xl min-w-[220px] animate-in slide-in-from-top-4 md:slide-in-from-bottom-4 fade-in duration-300 z-[120]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4 ml-1">Layout Parameters</h3>
              <div className="space-y-4">
                <LayoutParam 
                  label="Column Width" 
                  value={layoutConfig.COLUMN_WIDTH} 
                  min={100} max={500} step={10}
                  onChange={(v) => setLayoutConfig(c => ({ ...c, COLUMN_WIDTH: v }))} 
                />
                <LayoutParam 
                  label="Vertical Gap" 
                  value={layoutConfig.MIN_Y_GAP} 
                  min={5} max={100} step={5}
                  onChange={(v) => setLayoutConfig(c => ({ ...c, MIN_Y_GAP: v }))} 
                />
                <LayoutParam 
                  label="Nesting Depth" 
                  value={layoutConfig.NESTING_OFFSET} 
                  min={0} max={200} step={10}
                  onChange={(v) => setLayoutConfig(c => ({ ...c, NESTING_OFFSET: v }))} 
                />
                <button 
                  onClick={() => setLayoutConfig(LAYOUT_CONFIG)}
                  className="w-full py-2 text-[9px] font-bold uppercase tracking-tighter text-foreground/30 hover:text-foreground transition-colors mt-2"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="w-px h-6 bg-border/20 mx-1 self-center" />
        
        <ActionButton 
          onClick={handleDelete} 
          icon={<Trash2 size={16} />} 
          label="Delete Selection" 
          color="text-red-400"
        />
        
        <button
          onClick={clearNodeSelection}
          className="p-2 hover:bg-secondary rounded-xl transition-colors text-foreground/30 hover:text-foreground group relative"
        >
          <X size={16} />
          <div className="absolute top-12 md:top-auto md:bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/80 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-widest border border-border/10 pointer-events-none">
            Cancel
          </div>
        </button>
      </div>

      <PromptModal
        show={promptConfig.show}
        title={promptConfig.title}
        message={promptConfig.message}
        options={promptConfig.options}
        type={promptConfig.type}
        icon={promptConfig.icon}
        onConfirm={promptConfig.onConfirm}
        onCancel={() => setPromptConfig(prev => ({ ...prev, show: false }))}
      />

      {showWikiModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto">
          <div className="w-full max-w-md border-2 border-border bg-card p-6 shadow-2xl rounded-xl text-left" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start gap-4 mb-5 border-b border-border/10 pb-3">
              <div className="text-blue-500/50 shrink-0">
                <FileText size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-blue-500/80 font-bold text-lg mb-1">WIKI EXPORT SETTINGS</h3>
                <p className="text-foreground/80 text-sm leading-relaxed">Configure your generated single-page documentation portal.</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/75 block">PORTAL TITLE</label>
                <input
                  type="text"
                  value={wikiTitle}
                  onChange={(e) => setWikiTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border text-foreground/80 text-sm focus:outline-none rounded-lg transition-all focus:border-blue-500"
                  placeholder="e.g. Project Knowledge Base"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/75 block">AUTHOR NAME</label>
                <input
                  type="text"
                  value={wikiAuthor}
                  onChange={(e) => setWikiAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border text-foreground/80 text-sm focus:outline-none rounded-lg transition-all focus:border-blue-500"
                  placeholder="e.g. Ingestalt User"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/75 block">BUNDLED WIKI ICON</label>
                
                {/* Emoji picker grid */}
                <div className="grid grid-cols-8 gap-1.5 mb-2">
                  {['📚', '🚀', '💡', '⚙️', '🌐', '🛡️', '🧬', '🎯', '💾', '🧩', '🔧', '💻', '⚡', '📊', '🔥', '🎨'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setWikiIcon(emoji)}
                      className={`h-9 flex items-center justify-center text-base border transition-all rounded-lg ${wikiIcon === emoji ? 'border-blue-500 bg-blue-500/10 scale-105 font-bold' : 'border-border hover:bg-secondary hover:scale-105'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Custom Emoji input */}
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-foreground/40 uppercase">CUSTOM:</span>
                  <input
                    type="text"
                    value={wikiIcon}
                    onChange={(e) => setWikiIcon(e.target.value)}
                    className="px-3 py-1 bg-background border border-border text-foreground/80 text-sm focus:outline-none rounded-lg focus:border-blue-500 text-center max-w-[70px]"
                    maxLength={4}
                  />
                  <span className="text-[10px] font-mono text-foreground/40">Current selection: <span className="text-foreground text-xs font-bold ml-1">{wikiIcon}</span></span>
                </div>
              </div>

              {/* Project Root / Local File Linking Checkbox */}
              <div className="flex items-center gap-2 px-1 pt-2 border-t border-border/10">
                <input
                  type="checkbox"
                  id="wiki-enable-root-cb"
                  checked={wikiEnableProjectRoot}
                  onChange={(e) => setWikiEnableProjectRoot(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-blue-600 focus:ring-blue-500 focus:ring-offset-background cursor-pointer"
                />
                <label htmlFor="wiki-enable-root-cb" className="text-[10px] font-bold text-foreground/60 cursor-pointer select-none uppercase tracking-wider leading-snug">
                  Enable Project Root / VS Code File Opening
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowWikiModal(false)}
                variant="outline"
                className="flex-1 border-border bg-card text-foreground/80 hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setShowWikiModal(false);
                  setIsGenerating(true);
                  try {
                    const selectedNodes = await db.nodes.bulkGet(Array.from(selectedNodeIds));
                    const validNodes = selectedNodes.filter((n): n is any => n !== undefined);
                    
                    const allEdges = await db.edges.toArray();
                    const relevantEdges = allEdges.filter(e => 
                      selectedNodeIds.has(e.sourceId) && selectedNodeIds.has(e.targetId)
                    );
                    
                    const allNodes = await db.nodes.toArray();
                    const standards = allNodes.filter(n => n.payload?.type === 'standards');
                    
                    const html = generateProfessionalWiki(validNodes, relevantEdges, standards, {
                      title: wikiTitle,
                      author: wikiAuthor,
                      icon: wikiIcon,
                      enableProjectRoot: wikiEnableProjectRoot
                    });
                    
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${wikiTitle.replace(/\s+/g, '_')}_wiki.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                className="flex-1 text-white bg-blue-600 hover:bg-blue-500"
              >
                {isGenerating ? 'Generating...' : 'Generate Wiki'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ActionButton({ onClick, icon, label, color, disabled }: { onClick: () => void, icon: React.ReactNode, label: string, color: string, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 hover:bg-secondary rounded-xl transition-all group relative disabled:opacity-30 ${color}`}
    >
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-12 md:top-auto md:bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 border border-border/10 uppercase tracking-widest -translate-y-2 md:translate-y-2 group-hover:translate-y-0 shadow-2xl pointer-events-none z-[110]">
        {label}
      </div>
    </button>
  );
}

function LayoutParam({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-bold uppercase tracking-tight text-foreground/60">{label}</label>
        <span className="text-[10px] font-mono text-amber-400 font-bold">{value}px</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-secondary rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
      />
    </div>
  );
}

// Made with Bob
