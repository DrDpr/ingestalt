'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, HorizonNode } from '@/lib/drdpr-horizon/lib/db';
import { Copy, Check, Sparkles, FileText, Link, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AITaskPromptBuilderProps {
  node: HorizonNode;
}

const PROMPT_TEMPLATES = [
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

export function AITaskPromptBuilder({ node }: AITaskPromptBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(PROMPT_TEMPLATES[0].id);
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [includeRelated, setIncludeRelated] = useState(true);

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
    let context = `# ${node.payload?.title || 'Untitled'}\n\n`;
    
    if (node.payload?.content) {
      context += `${node.payload.content}\n\n`;
    }

    if (includeRelated && relatedNodes && relatedNodes.length > 0) {
      context += `## Related Nodes (References)\n\n`;
      relatedNodes.forEach(relatedNode => {
        context += `- **${relatedNode.payload?.title || 'Untitled'}** (${relatedNode.payload?.type || 'unknown'})\n`;
      });
      context += `\n`;
    }

    return context;
  }, [node, relatedNodes, includeRelated]);

  // Generate final prompt
  const finalPrompt = useMemo(() => {
    const template = PROMPT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return contextContent;

    if (selectedTemplate === 'custom') {
      return customPrompt.replace('{context}', contextContent);
    }

    return template.template.replace('{context}', contextContent);
  }, [selectedTemplate, customPrompt, contextContent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTemplate = PROMPT_TEMPLATES.find(t => t.id === selectedTemplate);

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
          {PROMPT_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left ${
                selectedTemplate === template.id
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

      {/* Include Related Nodes Toggle */}
      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/20">
        <div className="flex items-center gap-2">
          <Link size={14} className="text-blue-500" />
          <span className="text-xs font-medium text-foreground/70">Include Related Nodes</span>
          {relatedNodes && relatedNodes.length > 0 && (
            <span className="text-xs text-foreground/40">({relatedNodes.length})</span>
          )}
        </div>
        <button
          onClick={() => setIncludeRelated(!includeRelated)}
          className={`w-10 h-5 rounded-full transition-all ${
            includeRelated ? 'bg-blue-500' : 'bg-secondary'
          }`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
            includeRelated ? 'translate-x-5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase text-foreground/60">Generated Prompt</label>
          <span className="text-xs text-foreground/40">{finalPrompt.length} chars</span>
        </div>
        <div className="relative">
          <div className="w-full h-48 px-3 py-2 text-xs bg-background border border-border/30 rounded-lg overflow-y-auto custom-scrollbar text-foreground/70 whitespace-pre-wrap font-mono">
            {finalPrompt}
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
            This prompt includes context from the current node{includeRelated && relatedNodes && relatedNodes.length > 0 ? ' and its related nodes' : ''}. 
            Copy it and paste into your IDE's AI assistant (like IBM Bob) to get AI-powered help with your task.
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
