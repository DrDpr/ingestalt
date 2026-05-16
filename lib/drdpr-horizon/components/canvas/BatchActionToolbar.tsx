'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { X, Trash2, Download, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateProfessionalWiki } from '@/lib/drdpr-horizon/lib/publish/wikiGenerator';
import { PromptModal } from '../PromptModal';

export function BatchActionToolbar() {
  const { selectedNodeIds, clearNodeSelection } = useUIStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    options?: { label: string; value: string }[];
    onConfirm: (val: string) => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  if (selectedNodeIds.size === 0) return null;

  const handleDelete = async () => {
    setPromptConfig({
      show: true,
      title: 'DELETE SELECTION',
      message: `Are you sure you want to delete ${selectedNodeIds.size} selected nodes and all their connections?`,
      options: [
        { label: 'DELETE ALL', value: 'confirm' },
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
    const validNodes = nodes.filter(n => n !== undefined);
    
    const exportData = {
      version: '1.0',
      nodes: validNodes,
      exportedAt: Date.now(),
      count: validNodes.length
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nodes_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateWiki = async () => {
    setIsGenerating(true);
    
    try {
      const selectedNodes = await db.nodes.bulkGet(Array.from(selectedNodeIds));
      const validNodes = selectedNodes.filter(n => n !== undefined);
      
      const allEdges = await db.edges.toArray();
      const relevantEdges = allEdges.filter(e => 
        selectedNodeIds.has(e.sourceId) && selectedNodeIds.has(e.targetId)
      );
      
      const allNodes = await db.nodes.toArray();
      const standards = allNodes.filter(n => n.payload?.type === 'standards');
      
      const html = generateProfessionalWiki(validNodes, relevantEdges, standards);
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wiki_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
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
      options: [{ label: 'EXCELLENT', value: 'close' }],
      onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
    });
  };

  const isVisible = selectedNodeIds.size > 0;

  return (
    <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 p-1.5 bg-card/60 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out ${
      isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
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
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/80 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-widest border border-border/10 pointer-events-none">
            Cancel
          </div>
        </button>
      </div>

      <PromptModal
        show={promptConfig.show}
        title={promptConfig.title}
        message={promptConfig.message}
        options={promptConfig.options}
        onConfirm={promptConfig.onConfirm}
        onCancel={() => setPromptConfig(prev => ({ ...prev, show: false }))}
      />
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
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 border border-border/10 uppercase tracking-widest translate-y-2 group-hover:translate-y-0 shadow-2xl pointer-events-none z-[110]">
        {label}
      </div>
    </button>
  );
}

import { Loader2 } from 'lucide-react';
// Made with Bob
