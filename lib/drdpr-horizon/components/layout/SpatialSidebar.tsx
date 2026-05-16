'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { cn } from '@/lib/drdpr-horizon/lib/utils';
import {
  Plus,
  Search,
  Layout,
  Wifi,
  Box,
  FileText,
  BookOpen,
  CheckSquare,
  ChevronDown,
  Database,
  Trash2,
  Settings
} from 'lucide-react';
import { DynamicIcon } from '@/lib/drdpr-horizon/components/DynamicIcon';

const CORE_TEMPLATES = [
  { id: 'note', title: 'Note', icon: FileText, color: '#94a3b8' },
  { id: 'database', title: 'Record', icon: Database, color: '#3b82f6' },
  { id: 'standards', title: 'Standards', icon: Settings, color: '#f59e0b' },
];

export function SpatialSidebar() {
  const { activeGraphId, setActiveGraphId } = useUIStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isCreatingGraph, setIsCreatingGraph] = React.useState(false);
  const [newGraphName, setNewGraphName] = React.useState('');
  
  // 1. Load Canvas (Space feature)
  const graphs = useLiveQuery(() => db.graphs.toArray()) || [];
  
  // Get the active graph to determine its workspaceId
  const activeGraph = useLiveQuery(async () => {
    if (!activeGraphId) return null;
    return await db.graphs.get(activeGraphId);
  }, [activeGraphId]);

  // Determine the workspace filter: use graph's workspaceId if graph exists, otherwise use activeGraphId directly
  const workspaceFilter = activeGraph?.workspaceId || activeGraphId;
  
  // 2. Load Nodes (For Entity List and Autoregistration)
  const allNodes = useLiveQuery(() => db.nodes.toArray()) || [];
  
  // Filter nodes by active graph's workspace
  const filteredNodes = React.useMemo(() => {
    if (!workspaceFilter) return allNodes;
    return allNodes.filter(n => n.workspaceId === workspaceFilter);
  }, [allNodes, workspaceFilter]);
  
  // 3. Extract Autoregistered Types (Horizon feature)
  const standards = filteredNodes.filter(n => n.payload?.type === 'standards');
  const autoregisteredTypes = React.useMemo(() => {
    const types: any[] = [];
    standards.forEach(s => {
      if (s.payload?.definitions) {
        types.push(...s.payload.definitions);
      }
    });
    return types;
  }, [standards]);

  const [openSections, setOpenSections] = React.useState({
    canvas: true,
    palette: true,
    nodes: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Create new graph/canvas
  const handleCreateGraph = async () => {
    if (!newGraphName.trim()) return;
    
    const newGraph = {
      id: `graph_${Date.now()}`,
      workspaceId: `workspace_${Date.now()}`,
      name: newGraphName.trim(),
      description: '',
      config: {}
    };
    
    await db.graphs.add(newGraph);
    setActiveGraphId(newGraph.id);
    setNewGraphName('');
    setIsCreatingGraph(false);
  };

  // Switch to a different graph
  const handleSwitchGraph = (graphId: string | null) => {
    setActiveGraphId(graphId);
  };

  // Delete a graph
  const handleDeleteGraph = async (graphId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this canvas? All nodes in this view will remain but be unassigned.')) {
      await db.graphs.delete(graphId);
      if (activeGraphId === graphId) {
        setActiveGraphId(null);
      }
    }
  };

  const onTypeDragStart = (event: React.DragEvent, typeId: string, configId?: string) => {
    event.dataTransfer.setData('application/reactflow', typeId);
    if (configId) event.dataTransfer.setData('application/horizon-config', configId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeDragStart = (event: React.DragEvent, nodeId: string) => {
    event.dataTransfer.setData('application/reactflow-node-id', nodeId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-screen border-r border-border/5 bg-background flex flex-col shrink-0 select-none overflow-hidden font-mono uppercase">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-border/5">
        <h2 className="text-xs font-black  text-foreground/40">Ingestalt</h2>
      </div>

      {/* Filter */}
      <div className="px-6 py-4 border-b border-border/5 bg-secondary/[0.02]">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-foreground/20 group-focus-within:text-foreground transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full bg-secondary/5 border-none rounded-none py-2 pl-9 pr-4 text-xs tracking-widest focus:ring-1 focus:ring-muted/10 placeholder:text-foreground/10 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* Canvas Section */}
        <SidebarCollapsible
          title="Canvas"
          count={graphs.length}
          isOpen={openSections.canvas}
          onToggle={() => toggleSection('canvas')}
          action={
            <button
              onClick={() => setIsCreatingGraph(true)}
              className="text-foreground/20 hover:text-foreground transition-colors p-1"
              title="Create new canvas"
            >
              <Plus className="w-3 h-3" />
            </button>
          }
        >
          <div className="px-4 pb-4 space-y-0.5">
            {/* Create Graph Form */}
            {isCreatingGraph && (
              <div className="mb-3 p-3 bg-secondary/[0.03] border border-border/10 space-y-2">
                <input
                  type="text"
                  value={newGraphName}
                  onChange={(e) => setNewGraphName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateGraph();
                    if (e.key === 'Escape') {
                      setIsCreatingGraph(false);
                      setNewGraphName('');
                    }
                  }}
                  placeholder="CANVAS NAME"
                  autoFocus
                  className="w-full bg-secondary/5 border border-border/10 rounded-none py-1.5 px-2 text-xs tracking-widest focus:ring-1 focus:ring-muted/20 placeholder:text-foreground/20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateGraph}
                    className="flex-1 bg-secondary/10 hover:bg-secondary/20 text-foreground text-xs py-1.5 px-3 tracking-wider transition-colors"
                  >
                    CREATE
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingGraph(false);
                      setNewGraphName('');
                    }}
                    className="flex-1 bg-secondary/5 hover:bg-secondary/10 text-foreground/60 text-xs py-1.5 px-3 tracking-wider transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Graph List */}
            {graphs.map((graph) => (
              <div
                key={graph.id}
                onClick={() => handleSwitchGraph(graph.id)}
                className={cn(
                  "group flex items-center justify-between gap-3 px-3 py-2 cursor-pointer transition-all border border-transparent",
                  activeGraphId === graph.id ? "bg-secondary/5 border-border/10 text-foreground" : "text-foreground/40 hover:bg-secondary/[0.02] hover:text-foreground/60"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Layout size={12} className={activeGraphId === graph.id ? "text-blue-400" : ""} />
                  <span className="text-xs font-bold truncate tracking-wider">{graph.name}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteGraph(graph.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-foreground/20 hover:text-red-400 transition-all p-1"
                  title="Delete canvas"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </SidebarCollapsible>

        {/* Architectural Palette Section */}
        <SidebarCollapsible 
          title="Palette" 
          isOpen={openSections.palette} 
          onToggle={() => toggleSection('palette')}
        >
          <div className="px-4 pb-4 space-y-4">
            {/* Core Types */}
            <div className="grid grid-cols-4 gap-2">
              {CORE_TEMPLATES.map(type => (
                <div
                  key={type.id}
                  draggable
                  onDragStart={(e) => onTypeDragStart(e, type.id)}
                  className="flex flex-col items-center justify-center aspect-square rounded-none bg-secondary/[0.03] border border-border/5 hover:border-border/20 hover:bg-secondary/[0.05] transition-all cursor-grab active:cursor-grabbing group"
                  title={type.title}
                >
                  <type.icon size={14} style={{ color: type.color }} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs mt-1 text-foreground/40 group-hover:text-foreground/80">{type.id}</span>
                </div>
              ))}
            </div>

            {/* Autoregistered Types */}
            {autoregisteredTypes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/5">
                <div className="text-xs text-foreground/40 tracking-widest mb-2">FROM CANVAS</div>
                <div className="grid grid-cols-4 gap-2">
                  {autoregisteredTypes.map(type => (
                    <div
                      key={type.id}
                      draggable
                      onDragStart={(e) => onTypeDragStart(e, type.type, type.id)}
                      className="flex flex-col items-center justify-center aspect-square rounded-none bg-secondary/[0.03] border border-border/5 hover:border-border/20 hover:bg-secondary/[0.05] transition-all cursor-grab active:cursor-grabbing group"
                      title={type.title}
                    >
                      <DynamicIcon name={type.icon || 'Box'} size={14} style={{ color: type.color }} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs mt-1 text-foreground/40 group-hover:text-foreground/80 truncate w-full text-center px-1">{type.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SidebarCollapsible>

        {/* Entity Library Section */}
        <SidebarCollapsible
          title="Nodes"
          count={filteredNodes.filter(n => n.payload?.type !== 'standards').length}
          isOpen={openSections.nodes}
          onToggle={() => toggleSection('nodes')}
        >
          <div className="px-4 pb-12 space-y-0.5">
            {filteredNodes
              .filter(n => n.payload?.type !== 'standards')
              .filter(n => !searchQuery || n.payload?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((node) => (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => onNodeDragStart(e, node.id)}
                className="group flex flex-col p-3 hover:bg-secondary/[0.03] border border-transparent hover:border-border/5 transition-all cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-foreground/60 group-hover:text-foreground truncate tracking-wider">
                    {node.payload?.title || 'UNTITLED_NODE'}
                  </div>
                  <div className="text-xs text-foreground/10">{node.payload?.type}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs text-foreground/20 tabular-nums">ID_{node.id.slice(0,8)}</div>
                  <div className="size-1 rounded-full bg-secondary/10" />
                  <div className="text-xs text-foreground/20 truncate">MOD_{new Date(node.lastModified).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </SidebarCollapsible>
      </div>
    </div>
  );
}

function SidebarCollapsible({ title, count, isOpen, onToggle, children, action }: any) {
  return (
    <div className="border-b border-border/5 last:border-b-0">
      <button 
        onClick={onToggle}
        className={cn("w-full h-12 flex items-center justify-between px-6 hover:bg-secondary/[0.02] transition-colors group", isOpen && "border-b" ,"bg-muted/60 hover:bg-muted/100")}
      >
        <div className="flex items-center gap-3">
          <div className={cn("text-xs font-black uppercase text-foreground/20 group-hover:text-foreground/60 transition-colors", isOpen && "!text-foreground/60")}>
            {title}
          </div>
          {count !== undefined && (
            <div className="text-xs text-foreground/10 tabular-nums">
              [{count}]
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 ">
          {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
          <ChevronDown size={10} className={cn("text-foreground/10 group-hover:text-foreground/40 transition-transform duration-300", !isOpen && "-rotate-90")} />
        </div>
      </button>
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
