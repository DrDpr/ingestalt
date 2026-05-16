'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, HorizonNode } from '@/lib/drdpr-horizon/lib/db';
import { Copy, Check, Sparkles, FileText, Link, Wand2, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AITaskPromptBuilderProps {
  node: HorizonNode;
  customTemplates?: { id: string; label: string; template: string }[];
}

const DEFAULT_TEMPLATES = [
  {
    id: 'code-review',
    label: 'Code Review',
    template: 'Review the following code and provide feedback on:\n- Code quality and best practices\n- Potential bugs or issues\n- Performance optimizations\n- Security concerns\n\n{context}'
  },
  {
    id: 'documentation',
    label: 'Generate Documentation',
    template: 'Generate comprehensive documentation for:\n\n{context}\n\nInclude:\n- Overview and purpose\n- API/Interface details\n- Usage examples\n- Edge cases and limitations'
  },
  {
    id: 'refactor',
    label: 'Refactoring Suggestions',
    template: 'Analyze the following code and suggest refactoring improvements:\n\n{context}\n\nFocus on:\n- Code organization\n- Design patterns\n- Maintainability\n- Testability'
  },
  {
    id: 'test-generation',
    label: 'Generate Tests',
    template: 'Generate comprehensive unit tests for:\n\n{context}\n\nInclude:\n- Happy path scenarios\n- Edge cases\n- Error handling\n- Mock data where needed'
  },
  {
    id: 'explain',
    label: 'Explain Code',
    template: 'Explain the following code in detail:\n\n{context}\n\nProvide:\n- High-level overview\n- Step-by-step breakdown\n- Key concepts and patterns used\n- Potential improvements'
  },
  {
    id: 'custom',
    label: 'Custom Prompt',
    template: '{context}'
  }
];

export function AITaskPromptBuilder({ node, customTemplates = [] }: AITaskPromptBuilderProps) {
  const allTemplates = useMemo(() => {
    // Merge custom templates, ensuring 'Custom Prompt' (id: 'custom') is always at the end
    const filteredDefaults = DEFAULT_TEMPLATES.filter(t => t.id !== 'custom');
    const customWithIds = customTemplates.map((t, idx) => ({
      ...t,
      id: t.id || `custom_std_${idx}`
    }));
    return [...customWithIds, ...filteredDefaults, DEFAULT_TEMPLATES.find(t => t.id === 'custom')!];
  }, [customTemplates]);

  const [selectedTemplate, setSelectedTemplate] = useState(allTemplates[0].id);
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  // Context Toggles
  const [includeContent, setIncludeContent] = useState(true);
  const [includeProperties, setIncludeProperties] = useState(true);
  const [includeRelationships, setIncludeRelationships] = useState(true);

  // Get all related nodes through edges
  const relatedNodes = useLiveQuery(async () => {
    const edges = await db.edges
      .where('sourceId').equals(node.id)
      .or('targetId').equals(node.id)
      .toArray();

    const relatedIds = new Set<string>();
    edges.forEach(edge => {
      if (edge.sourceId === node.id) relatedIds.add(edge.targetId);
      if (edge.targetId === node.id) relatedIds.add(edge.sourceId);
    });

    const nodes = await Promise.all(
      Array.from(relatedIds).map(id => db.nodes.get(id))
    );

    return nodes.filter(n => n !== undefined) as HorizonNode[];
  }, [node.id]);

  // Build context from node and related nodes (references only)
  const contextContent = useMemo(() => {
    let context = `# ARCHITECTURAL CONTEXT: ${node.payload?.title || 'Untitled'}\n`;
    context += `Type: ${node.payload?.type || 'unknown'}\n`;
    context += `ID: ${node.id}\n\n`;

    if (includeContent && node.payload?.content) {
      context += `## DOCUMENTATION\n${node.payload.content}\n\n`;
    }

    if (includeProperties) {
      const keysToIgnore = ['title', 'type', 'content', 'icon', 'color', 'filename', 'tags', 'definitions'];
      const properties = Object.entries(node.payload || {})
        .filter(([key]) => !keysToIgnore.includes(key));

      if (properties.length > 0) {
        context += `## PROPERTIES / ATTRIBUTES\n`;
        properties.forEach(([key, value]) => {
          context += `### ${key}\n${JSON.stringify(value, null, 2)}\n\n`;
        });
      }
    }

    if (includeRelationships && relatedNodes && relatedNodes.length > 0) {
      context += `## RELATIONSHIPS / TOPOLOGY\n`;
      relatedNodes.forEach(relatedNode => {
        context += `- ${node.payload?.title || node.id} -> [Related] -> ${relatedNode.payload?.title || 'Untitled'} (${relatedNode.payload?.type || 'unknown'})\n`;
      });
      context += `\n`;
    }

    return context;
  }, [node, relatedNodes, includeContent, includeProperties, includeRelationships]);

  // Generate final prompt
  const finalPrompt = useMemo(() => {
    const template = allTemplates.find(t => t.id === selectedTemplate);
    if (!template) return contextContent;

    if (selectedTemplate === 'custom') {
      if (customPrompt.includes('{context}')) {
        return customPrompt.replace('{context}', contextContent);
      }
      // If no placeholder, append context to the end
      return `${customPrompt}\n\n${contextContent}`;
    }

    return template.template.replace('{context}', contextContent);
  }, [selectedTemplate, customPrompt, contextContent, allTemplates]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTemplate = allTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border/30">
        <Sparkles size={16} className="text-purple-500" />
        <h3 className="text-sm font-bold uppercase text-foreground/80">AI Task Prompt Builder</h3>
      </div>

      {/* Template Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-foreground/60">Prompt Template</label>
        <div className="grid grid-cols-2 gap-2">
          {allTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left ${selectedTemplate === template.id
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : 'bg-secondary/30 border-border/30 text-foreground/60 hover:bg-secondary/50'
                }`}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Input (only for custom template) */}
      {selectedTemplate === 'custom' && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-foreground/60">Custom Prompt</label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your custom prompt here. Use {context} to insert node content..."
            className="w-full h-24 px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:border-purple-500/50 text-foreground/80 resize-none"
          />
        </div>
      )}

      {/* Context Toggles */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-foreground/60">Context Injection</label>
        <div className="grid grid-cols-1 gap-1">
          <ContextToggle
            label="Markdown Content"
            icon={<FileText size={12} />}
            isActive={includeContent}
            onClick={() => setIncludeContent(!includeContent)}
          />
          <ContextToggle
            label="Node Properties"
            icon={<Cpu size={12} />}
            isActive={includeProperties}
            onClick={() => setIncludeProperties(!includeProperties)}
          />
          <ContextToggle
            label="Graph Relationships"
            icon={<Link size={12} />}
            isActive={includeRelationships}
            onClick={() => setIncludeRelationships(!includeRelationships)}
            count={relatedNodes?.length}
          />
        </div>
      </div>

      {/* Density Indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${finalPrompt.length > 2000 ? 'bg-amber-500' : 'bg-green-500'}`} />
          <span className="text-xs font-bold uppercase text-foreground/40 tracking-widest">Prompt Density</span>
        </div>
        <span className="text-xs font-mono text-foreground/40">~{Math.ceil(finalPrompt.length / 4)} tokens</span>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div className="relative group/preview">
          <div className="w-full h-48 px-3 py-2 text-xs bg-secondary/50 border border-border/30 rounded-lg overflow-y-auto custom-scrollbar text-foreground/60 whitespace-pre-wrap font-mono leading-relaxed">
            {finalPrompt}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
            <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground/40 uppercase font-bold">Preview</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleCopy}
          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
        >
          {copied ? (
            <>
              <Check size={14} className="mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} className="mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Wand2 size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-400 leading-relaxed">
            This prompt includes architectural context dynamically based on your toggles (Content, Properties, and Relationships).
            Copy it and paste into your IDE's AI assistant (like IBM Bob) for high-fidelity help.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContextToggle({ label, icon, isActive, onClick, count }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void, count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${isActive
        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
        : 'bg-secondary/20 border-border/20 text-foreground/40 hover:border-border/40'
        }`}
    >
      <div className="flex items-center gap-2">
        <div className={isActive ? 'text-blue-400' : 'text-foreground/30'}>
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
        {count !== undefined && count > 0 && (
          <span className="text-xs bg-background/50 px-1 rounded text-foreground/30">{count}</span>
        )}
      </div>
      <div className={`w-6 h-3 rounded-full relative transition-colors ${isActive ? 'bg-blue-500/50' : 'bg-secondary'}`}>
        <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${isActive ? 'right-0.5' : 'left-0.5'}`} />
      </div>
    </button>
  );
}

// Made with Bob
