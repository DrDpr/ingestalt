'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { X, Trash2, Download, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      const nodes = await db.nodes.bulkGet(Array.from(selectedNodeIds));
      const validNodes = nodes.filter(n => n !== undefined);
      
      // Generate HTML wiki
      const html = generateStaticWiki(validNodes);
      
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

function generateStaticWiki(nodes: any[]): string {
  const sortedNodes = nodes.sort((a, b) => 
    (a.payload?.title || '').localeCompare(b.payload?.title || '')
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation Wiki</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #e5e7eb;
      background: #0f172a;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 3rem 0;
      margin-bottom: 3rem;
      border-bottom: 2px solid #334155;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 1rem;
    }
    nav {
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 2rem;
      border: 1px solid #334155;
    }
    nav h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #f1f5f9;
    }
    nav ul { list-style: none; }
    nav li { margin: 0.5rem 0; }
    nav a {
      color: #60a5fa;
      text-decoration: none;
      transition: color 0.2s;
    }
    nav a:hover { color: #93c5fd; }
    .node {
      background: #1e293b;
      padding: 2rem;
      margin-bottom: 2rem;
      border-radius: 0.75rem;
      border: 1px solid #334155;
    }
    .node h2 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
      color: #f1f5f9;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 0.5rem;
    }
    .node-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-type {
      background: #3b82f6;
      color: #eff6ff;
    }
    .badge-tag {
      background: #334155;
      color: #cbd5e1;
    }
    .content {
      color: #cbd5e1;
      line-height: 1.8;
    }
    .content h1, .content h2, .content h3 {
      color: #f1f5f9;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .content p { margin-bottom: 1rem; }
    .content code {
      background: #0f172a;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      color: #fbbf24;
    }
    .content pre {
      background: #0f172a;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1rem 0;
      border: 1px solid #334155;
    }
    .content pre code {
      background: none;
      padding: 0;
    }
    .content ul, .content ol {
      margin-left: 2rem;
      margin-bottom: 1rem;
    }
    .content li { margin: 0.5rem 0; }
    footer {
      text-align: center;
      padding: 2rem 0;
      color: #64748b;
      border-top: 1px solid #334155;
      margin-top: 3rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>📚 Documentation Wiki</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>
    </div>
  </header>
  
  <div class="container">
    <nav>
      <h2>📑 Table of Contents</h2>
      <ul>
        ${sortedNodes.map(node => `
          <li><a href="#node-${node.id}">${node.payload?.title || 'Untitled'}</a></li>
        `).join('')}
      </ul>
    </nav>
    
    ${sortedNodes.map(node => `
      <article class="node" id="node-${node.id}">
        <h2>${node.payload?.title || 'Untitled'}</h2>
        <div class="node-meta">
          <span class="badge badge-type">${node.payload?.type || 'other'}</span>
          ${(node.payload?.tags || []).map((tag: string) => `
            <span class="badge badge-tag">${tag}</span>
          `).join('')}
        </div>
        <div class="content">
          ${markdownToHtml(node.payload?.content || '')}
        </div>
      </article>
    `).join('')}
    
    <footer>
      <p>Generated by Ingestalt • ${nodes.length} nodes</p>
    </footer>
  </div>
</body>
</html>`;
}

function markdownToHtml(markdown: string): string {
  // Simple markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  return `<p>${html}</p>`;
}

// Made with Bob
