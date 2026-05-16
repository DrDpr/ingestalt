'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { X, Trash2, Download, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateProfessionalWiki } from '@/lib/drdpr-horizon/lib/publish/wikiGenerator';

export function BatchActionToolbar() {
  const { selectedNodeIds, clearNodeSelection } = useUIStore();
  const [isGenerating, setIsGenerating] = useState(false);

  if (selectedNodeIds.size === 0) return null;

  const handleDelete = async () => {
    if (!confirm(`Delete ${selectedNodeIds.size} selected nodes?`)) return;
    
    await db.nodes.bulkDelete(Array.from(selectedNodeIds));
    // Also delete related edges
    const edges = await db.edges.toArray();
    const edgesToDelete = edges.filter(e => 
      selectedNodeIds.has(e.sourceId) || selectedNodeIds.has(e.targetId)
    );
    await db.edges.bulkDelete(edgesToDelete.map(e => e.id));
    
    clearNodeSelection();
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
    alert('Content copied to clipboard!');
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl">
      <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <span className="text-xs font-bold text-blue-400">{selectedNodeIds.size} Selected</span>
      </div>
      
      <div className="w-px h-6 bg-border/30" />
      
      <Button
        onClick={handleCopyContent}
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-xs"
      >
        <Copy size={14} className="mr-2" />
        Copy Content
      </Button>
      
      <Button
        onClick={handleExport}
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-xs"
      >
        <Download size={14} className="mr-2" />
        Export JSON
      </Button>
      
      <Button
        onClick={handleGenerateWiki}
        disabled={isGenerating}
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-xs"
      >
        <FileText size={14} className="mr-2" />
        {isGenerating ? 'Generating...' : 'Generate Wiki'}
      </Button>
      
      <div className="w-px h-6 bg-border/30" />
      
      <Button
        onClick={handleDelete}
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
      >
        <Trash2 size={14} className="mr-2" />
        Delete
      </Button>
      
      <button
        onClick={clearNodeSelection}
        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-foreground/50 hover:text-foreground"
        title="Clear selection"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Made with Bob
