'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { CORE_BASE_TYPES } from '@/lib/drdpr-horizon/lib/constants';
import { marked } from 'marked';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Calendar,
  Tag,
  Network,
  FileText,
  Hash,
  Sparkles,
  GitBranch,
  Layers,
  ChevronRight,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LiveWikiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);
  const [isGraphDropdownOpen, setIsGraphDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [projectRoot, setProjectRoot] = useState('');

  // Load Project Root
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('horizon_local_root') || localStorage.getItem('horizon-wiki-base-path') || '';
      setProjectRoot(stored);
    }
  }, []);

  const handleProjectRootChange = (val: string) => {
    const clean = val.replace(/\\/g, '/').replace(/\/$/, '');
    setProjectRoot(clean);
    localStorage.setItem('horizon_local_root', clean);
  };

  const handleAutoGuessPath = () => {
    let path = window.location.pathname;
    if (path.startsWith('/')) path = path.substring(1);
    
    const parts = path.split('/');
    parts.pop(); // Remove filename
    
    // If in subfolder, suggest parent
    if (parts.length > 0 && ['docs', 'wiki', 'out', 'dist'].includes(parts[parts.length-1].toLowerCase())) {
      parts.pop();
    }
    
    const guessed = parts.join('/');
    handleProjectRootChange(guessed);
  };

  const handleJumpToMethod = async (methodName: string, relativePath?: string) => {
    const path = relativePath || activeNode?.payload?.filepath;
    if (!path) {
      alert("No file path associated with this document.");
      return;
    }
    const root = projectRoot || localStorage.getItem('horizon_local_root') || '';
    if (!root) {
      alert("Please configure your Project Root path at the top of the page first!");
      return;
    }
    
    // Construct VS Code protocol URI
    const cleanPath = path.replace(/^[/\\]/, '');
    const fullPath = `${root}/${cleanPath}`.replace(/\\/g, '/');
    const vscodeUrl = `vscode://file/${fullPath}`;
    
    window.open(vscodeUrl, '_self');
  };

  // 1. Live subscribe to Dexie DB
  const nodes = useLiveQuery(() => db.nodes.toArray()) || [];
  const edges = useLiveQuery(() => db.edges.toArray()) || [];
  const graphs = useLiveQuery(() => db.graphs.toArray()) || [];

  // Sticky graph selection setup
  React.useEffect(() => {
    if (graphs.length > 0 && !selectedGraphId) {
      const stored = localStorage.getItem('horizon-active-graph-id');
      if (stored && graphs.some(g => g.id === stored)) {
        setSelectedGraphId(stored);
      } else {
        setSelectedGraphId(graphs[0].id);
      }
    }
  }, [graphs, selectedGraphId]);

  // Click outside to close graph dropdown
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.graph-switcher-container')) {
        setIsGraphDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleGraphChange = (id: string) => {
    setSelectedGraphId(id);
    localStorage.setItem('horizon-active-graph-id', id);
    setActiveNodeId(null);
  };

  // Filter valid document nodes (nodes with titles and content) that belong to the active graph's workspaceId
  const docNodes = useMemo(() => {
    if (!selectedGraphId) return [];
    const activeGraph = graphs.find(g => g.id === selectedGraphId);
    if (!activeGraph) return [];
    return nodes.filter(n => n.payload?.title && n.workspaceId === activeGraph.workspaceId);
  }, [nodes, graphs, selectedGraphId]);

  // Set the first node as active once nodes load
  React.useEffect(() => {
    if (docNodes.length > 0 && !activeNodeId) {
      setActiveNodeId(docNodes[0].id);
    }
  }, [docNodes, activeNodeId]);

  // Filter list by search query
  const filteredNodes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return docNodes;
    return docNodes.filter(n => {
      const title = (n.payload?.title || '').toLowerCase();
      const content = (n.payload?.content || '').toLowerCase();
      const tags = (n.payload?.tags || []).join(' ').toLowerCase();
      const type = (n.payload?.type || '').toLowerCase();
      return title.includes(q) || content.includes(q) || tags.includes(q) || type.includes(q);
    });
  }, [docNodes, searchQuery]);

  const activeNode = useMemo(() => {
    return docNodes.find(n => n.id === activeNodeId) || null;
  }, [docNodes, activeNodeId]);

  // Find standard definition for the active node
  const activeStandardDef = useMemo(() => {
    if (!activeNode?.configId) return null;
    
    // 1. Search in live standards nodes in DEXIE DB
    const standardsNodes = docNodes.filter(n => n.payload?.type === 'standards');
    for (const s of standardsNodes) {
      const def = (s.payload?.definitions || []).find((d: any) => d.id === activeNode.configId);
      if (def) return def;
      if (s.id === activeNode.configId) return s.payload;
    }
    
    // 2. Fallback to CORE_BASE_TYPES from constants
    return CORE_BASE_TYPES.find(c => c.id === activeNode.configId) || null;
  }, [activeNode, docNodes]);

  // Outbound (forward) and Inbound (backward) relationships
  const relations = useMemo(() => {
    if (!activeNodeId || !selectedGraphId) return { forward: [], backward: [] };

    const activeGraph = graphs.find(g => g.id === selectedGraphId);
    if (!activeGraph) return { forward: [], backward: [] };

    const wId = activeGraph.workspaceId;
    const forwardEdges = edges.filter(e => e.sourceId === activeNodeId && e.workspaceId === wId);
    const backwardEdges = edges.filter(e => e.targetId === activeNodeId && e.workspaceId === wId);

    const forward = forwardEdges.map(e => {
      const targetNode = docNodes.find(n => n.id === e.targetId);
      return targetNode ? { node: targetNode, label: e.label || 'refers' } : null;
    }).filter(Boolean);

    const backward = backwardEdges.map(e => {
      const sourceNode = docNodes.find(n => n.id === e.sourceId);
      return sourceNode ? { node: sourceNode, label: e.label || 'referenced by' } : null;
    }).filter(Boolean);

    return { forward, backward };
  }, [activeNodeId, edges, docNodes, selectedGraphId, graphs]);

  // Handle internal wiki link clicks inside the compiled HTML body
  React.useEffect(() => {
    const handleWikiClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('.internal-wiki-link');
      if (link) {
        e.preventDefault();
        const nodeId = link.getAttribute('data-node-id');
        if (nodeId) {
          setActiveNodeId(nodeId);
        }
      }
    };
    document.addEventListener('click', handleWikiClick);
    return () => document.removeEventListener('click', handleWikiClick);
  }, []);

  // Helper to generate marked-style url-friendly id string, stripping HTML tags & code backticks to ensure 100% ID matching
  const generateHeadingId = (text: string) => {
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/`/g, '');
    return cleanText.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Render HTML content safely with custom ID generation matching static generator
  const htmlContent = useMemo(() => {
    if (!activeNode?.payload?.content) return '';
    try {
      const renderer = new marked.Renderer();

      renderer.heading = (arg1: any, arg2: any) => {
        let text = '';
        let level = 2;
        if (typeof arg1 === 'object' && arg1 !== null) {
          text = arg1.text || '';
          level = arg1.depth || 2;
        } else {
          text = arg1 || '';
          level = arg2 || 2;
        }
        const id = generateHeadingId(text);
        return `<h${level} id="${id}" class="scroll-mt-20">${text}</h${level}>`;
      };

      renderer.link = (arg1: any, arg2: any, arg3: any) => {
        let href = '';
        let title = '';
        let text = '';
        if (typeof arg1 === 'object' && arg1 !== null) {
          href = arg1.href || '';
          title = arg1.title || '';
          text = arg1.text || '';
        } else {
          href = arg1 || '';
          title = arg2 || '';
          text = arg3 || '';
        }

        // Match node interlinks
        if (nodes.some(n => n.id === href)) {
          return `<a href="#${href}" class="internal-wiki-link" data-node-id="${href}">${text}</a>`;
        }

        return `<a href="${href}" title="${title}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      };

      // De-duplicate title: Remove the first H1 if it exists at the start
      const bodyContent = activeNode.payload.content.replace(/^#\s+.*\n?/, '');
      return marked.parse(bodyContent, { renderer });
    } catch (e) {
      return activeNode.payload.content;
    }
  }, [activeNode, nodes]);

  // Dynamically parse headings from the active article content (levels 2 and 3)
  const headings = useMemo(() => {
    if (!activeNode?.payload?.content) return [];

    const lines = activeNode.payload.content.split('\n');
    const headingMatches: Array<{ level: number; text: string; id: string }> = [];

    lines.forEach(line => {
      // Trim carriage returns and spaces first to support Windows line splits correctly
      const cleanLine = line.trim();
      // Look for lines starting with ## or ### heading markers
      const match = cleanLine.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = generateHeadingId(text);
        headingMatches.push({ level, text, id });
      }
    });

    return headingMatches;
  }, [activeNode]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
  };

  // Dynamic active section scrolling observer
  React.useEffect(() => {
    if (headings.length === 0) return;

    // Use a small timeout to let dangerouslySetInnerHTML commit and settle in the DOM first
    const timer = setTimeout(() => {
      const mainEl = document.querySelector('main');
      if (!mainEl) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.find(e => e.isIntersecting);
          if (visible) {
            setActiveHeadingId(visible.target.id);
          }
        },
        { 
          root: mainEl,
          // rootMargin checks for elements near the top quarter offset of the scrolling main container
          rootMargin: '-20px 0px -75% 0px' 
        }
      );

      headings.forEach(h => {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      });

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [headings, activeNodeId]);

  interface TreeItem {
    node: any;
    children: TreeItem[];
  }

  // Hierarchical parent-child path tree builder matching static export template
  const buildTree = (typeNodes: any[]) => {
    const sorted = [...typeNodes].sort((a, b) => {
      const aName = a.payload?.filename || a.id;
      const bName = b.payload?.filename || b.id;
      return aName.length - bName.length;
    });

    const root: TreeItem[] = [];
    const map: Record<string, TreeItem> = {};

    sorted.forEach(node => {
      map[node.id] = { node, children: [] };
    });

    sorted.forEach(node => {
      const item = map[node.id];
      const nodeName = node.payload?.filename?.replace('.md', '') || node.id;

      let parentId: string | null = null;

      for (const other of sorted) {
        if (other.id === node.id) continue;
        const otherName = other.payload?.filename?.replace('.md', '') || other.id;

        if (nodeName.startsWith(otherName + '_')) {
          if (!parentId || otherName.length > (map[parentId]?.node.payload?.filename?.replace('.md', '') || map[parentId]?.node.id).length) {
            parentId = other.id;
          }
        }
      }

      if (parentId && map[parentId]) {
        map[parentId].children.push(item);
      } else {
        root.push(item);
      }
    });

    const sortByTitle = (a: TreeItem, b: TreeItem) => (a.node.payload?.title || '').localeCompare(b.node.payload?.title || '');
    const sortChildren = (item: TreeItem) => {
      item.children.sort(sortByTitle);
      item.children.forEach(sortChildren);
    };
    root.sort(sortByTitle);
    root.forEach(sortChildren);

    return root;
  };

  const hasActiveDescendant = (item: TreeItem): boolean => {
    if (item.node.id === activeNodeId) return true;
    return item.children.some(c => hasActiveDescendant(c));
  };

  const toggleNode = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Helper to render tree node recursively
  const renderTreeItem = (item: TreeItem) => {
    const node = item.node;
    const children = item.children;
    const hasChildren = children.length > 0;
    const active = node.id === activeNodeId;
    const isCollapsed = collapsedNodes[node.id] !== undefined
      ? collapsedNodes[node.id]
      : !hasActiveDescendant(item);

    return (
      <div key={node.id} className="space-y-0.5">
        <div className="flex items-center group/item hover:bg-secondary/[0.02] rounded-none">
          {hasChildren ? (
            <button
              onClick={(e) => toggleNode(node.id, e)}
              className="w-5 h-5 flex items-center justify-center text-muted-foreground/60 hover:text-foreground text-xs transition-transform select-none"
            >
              <span className={`transform transition-transform duration-150 ${isCollapsed ? '-rotate-90' : ''}`}>
                ▼
              </span>
            </button>
          ) : (
            <div className="w-5 h-5 shrink-0" />
          )}

          <button
            onClick={() => {
              setActiveNodeId(node.id);
              setIsSidebarOpen(false);
            }}
            className={`flex-1 text-left py-1.5 px-2 truncate transition-all flex items-center justify-between border-l-2 ${active
              ? 'border-blue-500 text-blue-400 font-bold bg-secondary/[0.08]'
              : 'border-transparent text-foreground/75 hover:text-foreground'
              }`}
          >
            <span className="truncate tracking-wider text-xs uppercase font-mono">
              {node.payload?.title || 'UNTITLED'}
            </span>
            {(node.payload?.tags || []).length > 0 && (
              <span className="text-xs border border-border/10 bg-secondary/[0.04] text-muted-foreground px-1 py-0.2 ml-2 font-mono tracking-normal shrink-0">
                {(node.payload?.tags || []).length}
              </span>
            )}
          </button>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="pl-4 border-l border-border/10 space-y-0.5 ml-2.5">
            {children.map(renderTreeItem)}
          </div>
        )}
      </div>
    );
  };

  // Render standards schema tables if the active node defines any standards
  const renderStandardsManifest = (definitions: any) => {
    if (!definitions || !Array.isArray(definitions)) return null;
    return (
      <div className="mt-12 space-y-6 pt-8 border-t border-border/10">
        <div className="text-xs tracking-widest text-muted-foreground font-mono uppercase">
          GOVERNANCE MANIFEST // REGISTERED STANDARDS
        </div>
        {definitions.map((def: any, i: number) => (
          <div key={i} className="border border-border/10 bg-secondary/[0.02] p-5 rounded-none space-y-4">
            <div className="flex items-center justify-between border-b border-border/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚖️</span>
                <span className="font-bold tracking-widest text-xs uppercase text-foreground/90">
                  {def.name || 'Unnamed Definition'}
                </span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 uppercase tracking-widest">
                STANDARD
              </span>
            </div>

            <div className="border border-border/10 bg-background/50 overflow-hidden">
              <div className="grid grid-cols-3 gap-2 bg-secondary/[0.04] px-4 py-2 border-b border-border/10 font-mono text-xs font-bold text-muted-foreground tracking-widest uppercase">
                <div>Property</div>
                <div>Data Type</div>
                <div>Icon</div>
              </div>
              {(def.fields || []).map((field: any, j: number) => (
                <div key={j} className="grid grid-cols-3 gap-2 px-4 py-2 border-b border-border/5 last:border-none font-mono text-xs items-center">
                  <div className="font-bold text-foreground/80">{field.name}</div>
                  <div className="text-muted-foreground">{field.type}</div>
                  <div className="text-xs opacity-60 flex items-center gap-1">
                    <span>📦</span> {field.icon || 'Box'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Premium custom field interpreter suite matching static/canvas workspace
  const renderPropertiesSection = () => {
    if (!activeNode?.payload) return null;

    // Define standard payload keys to exclude from custom rendering
    const standardKeys = ['title', 'content', 'type', 'tags', 'definitions', 'id', 'color', 'icon', 'filename', 'configId', 'relations'];
    
    // Find fields defined in the active standard definition
    const standardFields = activeStandardDef?.fields || [];
    const standardFieldNames = standardFields.map((f: any) => f.name);

    // Filter out custom attributes that are NOT in standardFields
    const customEntries = Object.entries(activeNode.payload).filter(
      ([k]) => !standardKeys.includes(k) && !standardFieldNames.includes(k)
    );

    // Check if there is anything to render at all
    const hasStandardFields = standardFields.some((f: any) => activeNode.payload[f.name] !== undefined);
    const hasCustomEntries = customEntries.length > 0;

    if (!hasStandardFields && !hasCustomEntries) return null;

    // Field visual interpreter dispatch
    const renderFieldContent = (type: string, data: any, fieldColor?: string) => {
      if (data === undefined || data === null) return null;

      switch (type) {
        case 'schema_table': {
          const tableData = Array.isArray(data) ? data : [];
          if (tableData.length === 0) return <div className="text-muted-foreground italic text-[11px] uppercase tracking-wider font-mono pl-1">No columns defined</div>;
          return (
            <div className="border border-border/10 bg-background/30 overflow-hidden font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 bg-secondary/[0.04] px-4 py-2 border-b border-border/10 font-bold text-muted-foreground tracking-widest uppercase text-[10px]">
                <div>Field / Column</div>
                <div>Details</div>
              </div>
              {tableData.map((col: any, idx: number) => {
                const colString = typeof col === 'string' ? col : col.name;
                const match = colString.match(/^(.*?)(?:\s*\((.*?)\))?$/);
                const name = match?.[1]?.trim() || colString;
                const details = match?.[2]?.trim() || '';
                return (
                  <div key={idx} className="grid grid-cols-2 gap-2 px-4 py-2 border-b border-border/5 last:border-none items-center hover:bg-secondary/[0.01]">
                    <div className="font-bold text-foreground/80">{name}</div>
                    <div className="text-muted-foreground tracking-wider">{details || '-'}</div>
                  </div>
                );
              })}
            </div>
          );
        }

        case 'tables_list': {
          const tables = Array.isArray(data) ? data : [];
          if (tables.length === 0) return <div className="text-muted-foreground italic text-[11px] uppercase tracking-wider font-mono pl-1">No tables defined</div>;
          return (
            <div className="space-y-4">
              {tables.map((table: any, idx: number) => {
                const isString = typeof table === 'string';
                const tableName = isString ? table : (table.name || 'untitled');
                const columns = isString ? [] : (table.columns || table.indices || []);
                return (
                  <div key={idx} className="border border-border/10 bg-secondary/[0.01] rounded-none overflow-hidden space-y-2 p-3">
                    <div className="flex items-center gap-2 border-b border-border/15 pb-2 text-[11px] font-bold text-blue-400 font-mono tracking-widest uppercase">
                      <Layers className="w-3.5 h-3.5" />
                      TABLE: {tableName}
                    </div>
                    {renderFieldContent('schema_table', columns)}
                  </div>
                );
              })}
            </div>
          );
        }

        case 'interface_list': {
          const list = Array.isArray(data) ? data : [];
          if (list.length === 0) return <div className="text-muted-foreground italic text-[11px] uppercase tracking-wider font-mono pl-1">No methods defined</div>;
          return (
            <div className="space-y-3 font-mono">
              {list.map((item: any, i: number) => {
                const name = typeof item === 'string' ? item : (item.name || 'unknown');
                const desc = typeof item === 'string' ? '' : (item.description || '');
                return (
                  <div key={i} className="border border-border/10 bg-secondary/[0.01] hover:bg-secondary/[0.04] transition-all p-3.5 rounded-none flex items-start justify-between group">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="font-bold text-xs text-emerald-400 tracking-wide uppercase">
                        {name}()
                      </div>
                      {desc && (
                        <div className="text-[11px] text-muted-foreground tracking-wider normal-case">
                          {desc}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleJumpToMethod(name, activeNode.payload?.filepath)}
                      className="p-1 text-muted-foreground/60 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 rounded-none transition-all flex items-center justify-center shadow-none shrink-0"
                      title="Jump to code in editor"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        }

        case 'code_list': {
          const snippets = Array.isArray(data) ? data : [];
          if (snippets.length === 0) return <div className="text-muted-foreground italic text-[11px] uppercase tracking-wider font-mono pl-1">No snippets defined</div>;
          return (
            <div className="space-y-3 font-mono">
              {snippets.map((snip: any, idx: number) => (
                <div key={idx} className="border border-border/10 bg-secondary/[0.01] rounded-none overflow-hidden">
                  <div className="bg-secondary/[0.04] px-4 py-2 border-b border-border/10 flex justify-between items-center text-[10px] font-bold tracking-widest text-muted-foreground">
                    <span>{snip.name?.toUpperCase() || 'SNIPPET'}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(snip.code || '');
                        alert('Code snippet copied to clipboard!');
                      }}
                      className="text-[10px] hover:text-foreground font-mono transition-colors border border-border/10 px-1.5 py-0.5 hover:bg-secondary/[0.08]"
                    >
                      COPY
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-background/50 text-[11px] leading-relaxed text-blue-300">
                    <code>{snip.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          );
        }

        case 'story_list': {
          const stories = Array.isArray(data) ? data : [];
          if (stories.length === 0) return <div className="text-muted-foreground italic text-[11px] uppercase tracking-wider font-mono pl-1">No user stories defined</div>;
          return (
            <div className="space-y-2 font-mono">
              {stories.map((story: any, idx: number) => {
                const text = typeof story === 'string' ? story : story.text;
                const isDone = typeof story === 'string' ? false : !!story.done;
                return (
                  <div key={idx} className="flex gap-3 items-center bg-secondary/[0.01] border border-border/5 p-3 hover:border-amber-500/20 transition-all">
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${isDone ? 'bg-amber-500 border-amber-500 text-black' : 'border-border/30'}`}>
                      {isDone && <span className="text-[10px] font-bold font-sans">✓</span>}
                    </div>
                    <span className={`text-[11px] tracking-wide normal-case ${isDone ? 'text-muted-foreground/60 line-through' : 'text-foreground/80'}`}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }

        case 'flow_list': {
          const steps = Array.isArray(data) ? data : [];
          if (steps.length === 0) return <div className="text-muted-foreground italic text-[11px] uppercase tracking-wider font-mono pl-1">No process steps defined</div>;
          return (
            <div className="space-y-4 font-mono relative pl-4 border-l border-border/10 ml-2">
              {steps.map((step: any, idx: number) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[27px] top-0.5 w-[20px] h-[20px] rounded-none bg-blue-500 text-black flex items-center justify-center font-bold text-[9px] tracking-normal">
                    {idx + 1}
                  </div>
                  <div className="text-xs font-bold text-blue-400 tracking-wide uppercase">
                    {step.action}
                  </div>
                  {step.description && (
                    <div className="text-[11px] text-muted-foreground tracking-wider leading-relaxed normal-case">
                      {step.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        case 'file_path': {
          const path = String(data || '');
          if (!path) return <div className="text-muted-foreground italic text-[11px] uppercase tracking-wider font-mono pl-1">No path defined</div>;
          return (
            <div className="flex items-center gap-2 font-mono">
              <div className="flex-1 bg-secondary/[0.04] border border-border/10 p-2.5 text-xs text-muted-foreground truncate rounded-none uppercase tracking-wider select-all">
                {path}
              </div>
              <button
                onClick={() => handleJumpToMethod('', path)}
                className="p-2.5 bg-secondary/[0.08] hover:bg-secondary/[0.15] text-muted-foreground hover:text-foreground border border-border/10 hover:border-border/20 transition-all shrink-0 flex items-center justify-center shadow-none rounded-none"
                title="Open file in VSCode editor"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        default: {
          if (Array.isArray(data)) {
            return (
              <div className="flex flex-wrap gap-1.5 font-mono pl-1">
                {data.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 border border-border/15 bg-secondary/[0.02] text-muted-foreground text-[10px] tracking-wider uppercase">
                    {String(t)}
                  </span>
                ))}
              </div>
            );
          }
          if (typeof data === 'object' && data !== null) {
            return (
              <pre className="bg-background/50 border border-border/10 p-3.5 text-[11px] text-blue-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {JSON.stringify(data, null, 2)}
              </pre>
            );
          }
          return (
            <div className="text-[11px] tracking-wider text-foreground/80 leading-relaxed pl-1 select-text normal-case font-mono">
              {String(data)}
            </div>
          );
        }
      }
    };

    return (
      <div className="mt-12 space-y-6">
        <div className="text-xs tracking-widest text-muted-foreground font-mono uppercase border-b border-border/10 pb-2">
          PROPERTY SCHEMA // DATA INTERPRETERS
        </div>
        
        <div className="space-y-6">
          {/* Render standard fields sequentially */}
          {standardFields.map((field: any, idx: number) => {
            const fieldData = activeNode.payload[field.name];
            if (fieldData === undefined) return null;

            return (
              <div key={`std-${idx}`} className="space-y-2.5">
                <div 
                  className="text-xs font-black uppercase tracking-widest font-mono flex items-center gap-2"
                  style={{ color: field.color || 'var(--accent)' }}
                >
                  <span className="text-[10px] opacity-60">■</span>
                  {field.name.replace(/_/g, ' ')}
                </div>
                {renderFieldContent(field.type, fieldData, field.color)}
              </div>
            );
          })}

          {/* Render extra custom attributes that were not defined in standard */}
          {hasCustomEntries && (
            <div className="space-y-6 pt-4 border-t border-border/5">
              <div className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase font-mono">
                ADDITIONAL PROPERTIES
              </div>
              {customEntries.map(([key, val]: any) => (
                <div key={`cust-${key}`} className="space-y-2.5">
                  <div className="text-xs font-black text-foreground/75 uppercase tracking-widest font-mono flex items-center gap-2">
                    <span className="text-[10px] opacity-40">□</span>
                    {key.replace(/_/g, ' ')}
                  </div>
                  {renderFieldContent('default', val)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground transition-colors duration-300 relative font-mono uppercase selection:bg-foreground/20 text-xs tracking-wider flex flex-col md:flex-row">

      {/* Dynamic Grid Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      {/* Premium Ultra-thin Custom Scrollbars matching Static Export */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar {
          width: 6px !important;
          height: 6px !important;
        }
        ::-webkit-scrollbar-track {
          background: transparent !important;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08) !important;
          border-radius: 0px !important;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2) !important;
        }
        :not(.dark) ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08) !important;
        }
        :not(.dark) ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2) !important;
        }
      `}} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 w-full border-r border-border/10 bg-background/95 backdrop-blur-md shrink-0 flex flex-col z-50 transform transition-transform duration-300 md:static md:w-80 md:bg-background/50 md:backdrop-blur-none md:translate-x-0 md:h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >

        {/* Navigation Header */}
        <div className="p-6 border-b border-border/10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-black">📚</span>
              <span className="font-black tracking-widest text-xs">INGESTALT_WIKI</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mr-1"
              >
                <X className="w-4 h-4" />
              </button>
              <Link href="/canvas">
                <Button variant="ghost" size="sm" className="h-7 px-2 font-mono uppercase text-xs flex items-center gap-1 border border-border/10 hover:border-border/20 rounded-none shrink-0 shadow-none">
                  <ArrowLeft className="w-3 h-3" /> Canvas
                </Button>
              </Link>
            </div>
          </div>

          {/* Canvas Switcher Dropdown */}
          {graphs.length > 0 && (
            <div className="space-y-1 bg-secondary/[0.02] border border-border/15 p-2 px-2.5 graph-switcher-container relative">
              <label className="text-xs font-black text-muted-foreground tracking-widest uppercase">
                Active Workspace Canvas
              </label>

              <button
                onClick={() => setIsGraphDropdownOpen(!isGraphDropdownOpen)}
                className="w-full flex items-center justify-between text-left text-xs font-mono uppercase text-foreground py-1 focus:outline-none select-none transition-colors border-none bg-transparent"
              >
                <span className="truncate pr-4 tracking-wider">
                  {graphs.find(g => g.id === selectedGraphId)?.name || 'SELECT CANVAS...'}
                  <span className="text-xs text-muted-foreground/60 ml-2 font-normal">
                    ({nodes.filter(n => n.payload?.title && n.workspaceId === graphs.find(gr => gr.id === selectedGraphId)?.workspaceId).length})
                  </span>
                </span>
                <span className="text-muted-foreground/60 text-xs transition-transform duration-200">
                  {isGraphDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Floating Custom Options List */}
              {isGraphDropdownOpen && (
                <div className="absolute left-0 right-0 top-[48px] bg-card border border-border rounded-lg shadow-2xl overflow-hidden py-1 z-[150] animate-in fade-in slide-in-from-top-1 duration-150">
                  {graphs.map(g => {
                    const count = nodes.filter(n => n.payload?.title && n.workspaceId === g.workspaceId).length;
                    const isSelected = g.id === selectedGraphId;
                    return (
                      <button
                        key={g.id}
                        onClick={() => {
                          handleGraphChange(g.id);
                          setIsGraphDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-mono uppercase transition-all flex items-center justify-between ${isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-secondary/80 text-foreground/80 hover:text-foreground'
                          }`}
                      >
                        <span className="truncate">{g.name || 'UNNAMED CANVAS'}</span>
                        <span className="text-xs bg-secondary/[0.08] px-1.5 py-0.5 border border-border/10 text-muted-foreground">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Search Inputs */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search wiki..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/[0.04] border border-border/10 text-foreground placeholder:text-muted-foreground/60 text-xs tracking-wider rounded-none focus:outline-none focus:border-blue-500 transition-colors uppercase font-mono"
            />
          </div>
        </div>

        {/* Dynamic Articles Index */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs italic">
              No matching records found
            </div>
          ) : searchQuery.trim().length > 0 ? (
            <div className="space-y-1">
              <div className="text-xs font-black text-muted-foreground tracking-widest px-2 mb-2 font-mono uppercase">
                Search Results ({filteredNodes.length})
              </div>
              {filteredNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => {
                    setActiveNodeId(node.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 transition-all flex items-center justify-between border-l-2 ${activeNodeId === node.id ? 'bg-secondary/[0.08] border-blue-500 text-blue-400 font-bold' : 'border-transparent hover:bg-secondary/[0.02] text-foreground/75'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs shrink-0 opacity-60">
                      {node.payload?.type === 'standards' ? '⚖️' : '📄'}
                    </span>
                    <span className="truncate tracking-wider text-xs">
                      {node.payload?.title || 'UNTITLED'}
                    </span>
                  </div>
                  <ChevronRight className={`w-3 h-3 transition-transform ${activeNodeId === node.id ? 'translate-x-0.5 opacity-80' : 'opacity-30'}`} />
                </button>
              ))}
            </div>
          ) : (() => {
            const groups: Record<string, any[]> = {};
            filteredNodes.forEach(node => {
              const type = node.payload?.type || 'Other';
              const typeKey = type.toUpperCase();
              if (!groups[typeKey]) groups[typeKey] = [];
              groups[typeKey].push(node);
            });

            return Object.entries(groups).map(([type, typeNodes]) => {
              const tree = buildTree(typeNodes);
              return (
                <div key={type} className="space-y-1.5">
                  <div className="text-xs font-black text-muted-foreground/60 tracking-widest px-2 py-1 uppercase font-mono border-b border-border/5">
                    {type}
                  </div>
                  <div className="space-y-0.5 pl-1">
                    {tree.map(item => renderTreeItem(item))}
                  </div>
                </div>
              );
            });
          })()}
        </nav>
      </aside>

      {/* 2. Main Content Portal View */}
      <main className="flex-1 overflow-y-auto z-10 flex flex-col min-h-0 bg-background/30">

        {/* Sticky Topbar Header matching static publication */}
        <header className="sticky top-0 bg-background/85 backdrop-blur-md border-b border-border/10 px-6 py-4 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5 text-blue-400" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 text-sm">📚</span>
              <span className="font-mono font-black text-xs tracking-widest uppercase">
                {graphs.find(g => g.id === selectedGraphId)?.name || 'UNNAMED CANVAS'}
              </span>
            </div>
          </div>

          {/* Project Root Configuration matching Static Publication */}
          <div className="hidden lg:flex items-center gap-2.5">
            <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase font-mono">
              PROJECT ROOT
            </span>
            <div className="flex items-center bg-secondary/[0.04] border border-border/10 h-7 text-xs font-mono overflow-hidden">
              <span className="px-2.5 text-[10px] text-muted-foreground/50 border-r border-border/10 flex items-center h-full select-none lowercase">
                vscode://file/
              </span>
              <input
                type="text"
                placeholder="e.g. d:/Desktop/ingestalt"
                value={projectRoot}
                onChange={(e) => handleProjectRootChange(e.target.value)}
                className="w-48 xl:w-64 bg-transparent border-none px-2 h-full text-foreground/90 placeholder:text-muted-foreground/30 text-[11px] focus:outline-none uppercase font-mono tracking-wider"
              />
              <button
                onClick={handleAutoGuessPath}
                title="Guess path from location"
                className="px-2 bg-secondary/[0.08] hover:bg-secondary/[0.15] text-muted-foreground hover:text-foreground text-[10px] font-bold border-l border-border/10 h-full transition-all shrink-0"
              >
                AUTO
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end font-mono">
              <span className="text-xs font-black tracking-widest text-foreground/80">INGESTALT</span>
              <span className="text-xs text-muted-foreground/60 tracking-wider">// ARCHITECTURE_WIKI</span>
            </div>
          </div>
        </header>

        {activeNode ? (
          <div className="flex-1 flex flex-row max-w-[1400px] w-full mx-auto justify-between items-start px-6">
            
            {/* Center Content Column */}
            <div className="flex-1 max-w-[800px] py-12 md:py-16 flex flex-col justify-between min-h-full mx-auto w-full">
              <div>
                {/* Node Header Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono mb-4">
                  <span className="px-2 py-0.5 border border-border/10 bg-secondary/[0.04] text-xs uppercase tracking-widest">
                    {activeNode.payload?.type || 'ARTICLE'}
                  </span>
                  {activeNode.lastModified && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(activeNode.lastModified).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Document Title */}
                <h1 className="text-3xl md:text-4xl font-black tracking-widest uppercase mb-6 leading-tight text-foreground/90">
                  {activeNode.payload?.title || 'UNTITLED'}
                </h1>

                {/* Tags Pills */}
                {activeNode.payload?.tags && activeNode.payload.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {activeNode.payload.tags.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-secondary/[0.04] border border-border/10 font-mono text-xs text-muted-foreground uppercase">
                        <Hash className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Compiled Markdown Body Content */}
                <div 
                  className="prose prose-stark max-w-none text-xs leading-relaxed tracking-wider text-foreground/80 dark:prose-invert font-mono uppercase space-y-4"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Node Custom Field Properties Table */}
                {renderPropertiesSection()}

                {/* Governance Standards Manifest */}
                {activeNode.payload?.type === 'standards' && renderStandardsManifest(activeNode.payload?.definitions)}

                {/* Relationships Dynamic Layout */}
                {(relations.forward.length > 0 || relations.backward.length > 0) && (
                  <div className="mt-16 pt-8 border-t border-border/10 space-y-6">
                    <div className="text-xs tracking-widest text-muted-foreground font-mono uppercase">
                      RELATIONSHIPS GRID // LIVE GRAPH WIRES
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Forward References */}
                      {relations.forward.map((rel: any, i: number) => (
                        <button
                          key={`fw-${i}`}
                          onClick={() => setActiveNodeId(rel.node.id)}
                          className="p-4 border border-border/10 bg-secondary/[0.01] hover:bg-secondary/[0.04] transition-all text-left group flex flex-col gap-2 rounded-none"
                        >
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-500 uppercase tracking-widest">
                            <span>Refers to // {rel.label}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="font-black text-xs tracking-widest text-foreground/80 uppercase group-hover:text-blue-400 transition-colors">
                            {rel.node.payload?.title || 'UNTITLED'}
                          </span>
                        </button>
                      ))}

                      {/* Inbound References */}
                      {relations.backward.map((rel: any, i: number) => (
                        <button
                          key={`bw-${i}`}
                          onClick={() => setActiveNodeId(rel.node.id)}
                          className="p-4 border border-border/10 bg-secondary/[0.01] hover:bg-secondary/[0.04] transition-all text-left group flex flex-col gap-2 rounded-none"
                        >
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-500 uppercase tracking-widest">
                            <span>Referenced by // {rel.label}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="font-black text-xs tracking-widest text-foreground/80 uppercase group-hover:text-purple-400 transition-colors">
                            {rel.node.payload?.title || 'UNTITLED'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stark Monospaced Technical Footer */}
              <div className="mt-16 pt-6 border-t border-border/10 flex justify-between items-center text-xs text-muted-foreground font-mono">
                <span>NODE_ID: {activeNode.id}</span>
                <span>CONFIG_ID: {activeNode.configId || 'N/A'}</span>
              </div>
            </div>

            {/* 3. Right Sidebar - Table of Contents Outline (ON THIS PAGE) */}
            {headings.length > 0 && (
              <aside className="hidden lg:flex w-64 border-l border-border/10 bg-background/30 shrink-0 flex-col p-6 sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto font-mono">
                <div className="text-xs font-black text-muted-foreground tracking-widest uppercase mb-4 font-mono">
                  ON THIS PAGE
                </div>
                <div className="space-y-3 font-mono">
                  {headings.map((h, i) => {
                    const isHighlighted = activeHeadingId === h.id;
                    return (
                      <button
                        key={i}
                        onClick={() => scrollToHeading(h.id)}
                        className={`w-full text-left text-xs tracking-wide transition-all uppercase truncate block border-l-2 pl-3 -ml-0.5 ${
                          isHighlighted
                            ? 'text-blue-400 font-bold border-blue-500'
                            : 'text-foreground/60 hover:text-foreground border-transparent hover:border-border/30'
                        }`}
                        style={{ 
                          marginLeft: `${(h.level - 2) * 16}px`,
                          fontSize: h.level === 3 ? '10px' : '11px'
                        }}
                      >
                        {h.text}
                      </button>
                    );
                  })}
                </div>
              </aside>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-3 animate-pulse" />
            <h3 className="font-bold text-xs tracking-widest text-foreground/60 uppercase">
              No Articles Registered
            </h3>
            <p className="text-xs text-muted-foreground uppercase mt-1 max-w-xs">
              Go to the Spatial Canvas, add some documents and title them to load the wiki index.
            </p>
          </div>
        )}
      </main>

    </div>
  );
}
