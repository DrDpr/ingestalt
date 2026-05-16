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
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { DynamicIcon } from '@/lib/drdpr-horizon/components/DynamicIcon';
import { PromptModal } from '../PromptModal';
import { useReactFlow } from '@xyflow/react';

const CORE_TEMPLATES = [
  { id: 'note', title: 'Note', icon: FileText, color: '#94a3b8' },
  { id: 'database', title: 'Record', icon: Database, color: '#3b82f6' },
  { id: 'standards', title: 'Standards', icon: Settings, color: '#f59e0b' },
  { id: 'ai-task', title: 'AI Task', icon: CheckSquare, color: '#a855f7' },
];

export function SpatialSidebar() {
  const { activeGraphId, setActiveGraphId, setSelectedNodeId } = useUIStore();
  const { setCenter, fitView } = useReactFlow();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isCreatingGraph, setIsCreatingGraph] = React.useState(false);
  const [newGraphName, setNewGraphName] = React.useState('');
  const [promptConfig, setPromptConfig] = React.useState<{
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

  // Dynamic Standards Map (replicated from CommandSearch/Canvas)
  const standardsMap = useLiveQuery(async () => {
    const nodes = await db.nodes.toArray();
    const map = new Map<string, any>();
    nodes.forEach(node => {
      if (node.payload?.type === 'standards') {
        const defs = node.payload?.definitions || [];
        defs.forEach((d: any) => {
          map.set(d.id, d);
        });
        if (node.payload?.configId || node.id) {
          map.set(node.payload?.configId || node.id, {
            type: node.payload?.type,
            label: node.payload?.title,
            icon: node.payload?.icon || 'ShieldAlert',
            color: node.payload?.color || '#f59e0b',
          });
        }
      }
    });
    return map;
  }, []) || new Map();
  
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
    if (!workspaceFilter) return [];
    return allNodes.filter(n => n.workspaceId === workspaceFilter);
  }, [allNodes, workspaceFilter]);
  
  // 3. Extract Autoregistered Types (Horizon feature)
  const standards = filteredNodes.filter(n => n.payload?.type === 'standards');
  const autoregisteredTypes = React.useMemo(() => {
    const types: any[] = [];
    const seenIds = new Set<string>();
    
    standards.forEach(s => {
      if (s.payload?.definitions) {
        s.payload.definitions.forEach((def: any) => {
          if (!seenIds.has(def.id)) {
            types.push(def);
            seenIds.add(def.id);
          }
        });
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
    
    setPromptConfig({
      show: true,
      title: 'DELETE CANVAS',
      message: 'This will remove the canvas and all nodes associated with it. This cannot be undone.',
      type: 'danger',
      icon: <Trash2 size={24} />,
      options: [
        { label: 'DELETE EVERYTHING', value: 'confirm', variant: 'danger' },
        { label: 'CANCEL', value: 'cancel' }
      ],
      onConfirm: async (val) => {
        if (val === 'confirm') {
          const graph = await db.graphs.get(graphId);
          if (graph) {
            await db.nodes.where('workspaceId').equals(graph.workspaceId).delete();
            await db.edges.where('workspaceId').equals(graph.workspaceId).delete();
          }
          await db.graphs.delete(graphId);
          if (activeGraphId === graphId) setActiveGraphId(null);
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  };
  // Save canvas snapshot (Atlas)
  const handleSaveSnapshot = async (graphId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const graph = await db.graphs.get(graphId);
    if (!graph) return;
    
    // Get all nodes in this workspace
    const nodes = await db.nodes.where('workspaceId').equals(graph.workspaceId).toArray();
    
    // Create snapshot with node positions
    const snapshot = {
      nodes: nodes.map(n => ({ id: n.id, position: n.position })),
      viewport: { x: 0, y: 0, zoom: 1 }, // Will be updated from canvas
      timestamp: Date.now()
    };
    
    await db.graphs.update(graphId, { snapshot });
    setPromptConfig({
      show: true,
      title: 'SNAPSHOT SAVED',
      message: 'Canvas snapshot has been successfully recorded to the local database.',
      type: 'success',
      icon: <Save size={24} />,
      options: [{ label: 'EXCELLENT', value: 'close' }],
      onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
    });
  };

  // Restore canvas from snapshot
  const handleRestoreSnapshot = async (graphId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const graph = await db.graphs.get(graphId);
    if (!graph || !graph.snapshot) {
      setPromptConfig({
        show: true,
        title: 'NO SNAPSHOT',
        message: 'No recorded snapshot found for this canvas to restore from.',
        type: 'warning',
        icon: <RotateCcw size={24} />,
        options: [{ label: 'UNDERSTOOD', value: 'close' }],
        onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
      });
      return;
    }
    
    setPromptConfig({
      show: true,
      title: 'RESTORE CANVAS',
      message: `Restore node positions from snapshot taken on ${new Date(graph.snapshot.timestamp).toLocaleString()}?`,
      type: 'info',
      icon: <RotateCcw size={24} />,
      options: [
        { label: 'RESTORE POSITIONS', value: 'confirm' },
        { label: 'CANCEL', value: 'cancel' }
      ],
      onConfirm: async (val) => {
        if (val === 'confirm' && graph.snapshot) {
          // Restore node positions
          for (const nodeSnapshot of graph.snapshot.nodes) {
            await db.nodes.update(nodeSnapshot.id, { position: nodeSnapshot.position });
          }
          setPromptConfig({
            show: true,
            title: 'RESTORED',
            message: 'Canvas has been restored to the snapshot state.',
            type: 'success',
            icon: <CheckSquare size={24} />,
            options: [{ label: 'PERFECT', value: 'close' }],
            onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
          });
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  };

  // Export canvas as Atlas file
  const handleExportAtlas = async (graphId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const graph = await db.graphs.get(graphId);
    if (!graph) return;
    
    // Get all data for this canvas
    const nodes = await db.nodes.where('workspaceId').equals(graph.workspaceId).toArray();
    const edges = await db.edges.where('workspaceId').equals(graph.workspaceId).toArray();
    
    const atlasData = {
      version: '1.0',
      graph: {
        id: graph.id,
        name: graph.name,
        description: graph.description,
        workspaceId: graph.workspaceId,
        snapshot: graph.snapshot
      },
      nodes,
      edges,
      exportedAt: Date.now()
    };
    
    // Download as JSON file
    const blob = new Blob([JSON.stringify(atlasData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${graph.name.replace(/\s+/g, '_')}_atlas.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Atlas file
  const handleImportAtlas = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const atlasData = JSON.parse(text);
        
        if (!atlasData.version || !atlasData.graph) {
          setPromptConfig({
            show: true,
            title: 'INVALID ATLAS',
            message: 'The selected file does not appear to be a valid Ingestalt Atlas format.',
            type: 'danger',
            icon: <Upload size={24} />,
            options: [{ label: 'TRY AGAIN', value: 'close' }],
            onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
          });
          return;
        }
        
        // Create new workspace ID to avoid conflicts
        const newWorkspaceId = `workspace_${Date.now()}`;
        const newGraphId = `graph_${Date.now()}`;
        
        // Import graph
        await db.graphs.add({
          id: newGraphId,
          workspaceId: newWorkspaceId,
          name: `${atlasData.graph.name} (Imported)`,
          description: atlasData.graph.description,
          config: {},
          snapshot: atlasData.graph.snapshot
        });
        
        // Import nodes with new workspace ID
        for (const node of atlasData.nodes) {
          await db.nodes.add({
            ...node,
            workspaceId: newWorkspaceId
          });
        }
        
        // Import edges with new workspace ID
        for (const edge of atlasData.edges) {
          await db.edges.add({
            ...edge,
            workspaceId: newWorkspaceId
          });
        }
        
        setActiveGraphId(newGraphId);
        setPromptConfig({
          show: true,
          title: 'IMPORT SUCCESS',
          message: `Atlas for "${atlasData.graph.name}" has been successfully imported into a new workspace.`,
          type: 'success',
          icon: <Download size={24} />,
          options: [{ label: 'VIEW CANVAS', value: 'close' }],
          onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
        });
      } catch (error) {
        console.error('Import error:', error);
        setPromptConfig({
          show: true,
          title: 'IMPORT FAILED',
          message: 'An error occurred while importing the Atlas file. See console for details.',
          options: [{ label: 'CLOSE', value: 'close' }],
          onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
        });
      }
    };
    
    input.click();
  };

  // Purge Orphans using PromptModal
  const handlePurgeOrphans = async () => {
    const allGraphs = await db.graphs.toArray();
    const validWorkspaceIds = new Set(allGraphs.map(g => g.workspaceId));
    const everyNode = await db.nodes.toArray();
    const orphans = everyNode.filter(n => !validWorkspaceIds.has(n.workspaceId));
    
    if (orphans.length === 0) {
      setPromptConfig({
        show: true,
        title: 'DATABASE CLEAN',
        message: 'No orphaned nodes found. Your database is fully synchronized.',
        options: [{ label: 'EXCELLENT', value: 'close' }],
        onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
      });
      return;
    }
    setPromptConfig({
      show: true,
      title: 'PURGE ORPHANS',
      message: `Found ${orphans.length} orphaned nodes from deleted canvases. Purge them now?`,
      options: [
        { label: 'PURGE DATABASE', value: 'confirm' },
        { label: 'KEEP THEM', value: 'cancel' }
      ],
      onConfirm: async (val) => {
        if (val === 'confirm') {
          const orphanIds = orphans.map(n => n.id);
          await db.nodes.bulkDelete(orphanIds);
          
          const everyEdge = await db.edges.toArray();
          const orphanEdgeIds = everyEdge
            .filter(e => !validWorkspaceIds.has(e.workspaceId))
            .map(e => e.id);
          await db.edges.bulkDelete(orphanEdgeIds);
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
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
            <div className="flex items-center gap-1">
              <button
                onClick={handleImportAtlas}
                className="text-foreground/20 hover:text-blue-400 transition-colors p-1"
                title="Import Atlas file"
              >
                <Upload className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsCreatingGraph(true)}
                className="text-foreground/20 hover:text-foreground transition-colors p-1"
                title="Create new canvas"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
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
                  "group flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition-all border border-transparent",
                  activeGraphId === graph.id ? "bg-secondary/5 border-border/10 text-foreground" : "text-foreground/40 hover:bg-secondary/[0.02] hover:text-foreground/60"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Layout size={12} className={activeGraphId === graph.id ? "text-blue-400" : ""} />
                  <span className="text-xs font-bold truncate tracking-wider">{graph.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleSaveSnapshot(graph.id, e)}
                    className="text-foreground/20 hover:text-green-400 transition-colors p-1"
                    title="Save snapshot"
                  >
                    <Save size={10} />
                  </button>
                  {graph.snapshot && (
                    <button
                      onClick={(e) => handleRestoreSnapshot(graph.id, e)}
                      className="text-foreground/20 hover:text-blue-400 transition-colors p-1"
                      title="Restore from snapshot"
                    >
                      <RotateCcw size={10} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleExportAtlas(graph.id, e)}
                    className="text-foreground/20 hover:text-purple-400 transition-colors p-1"
                    title="Export as Atlas file"
                  >
                    <Download size={10} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteGraph(graph.id, e)}
                    className="text-foreground/20 hover:text-red-400 transition-colors p-1"
                    title="Delete canvas"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
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
          .map((node) => {
            // Resolve standard appearance
            const standard = standardsMap.get(node.configId);
            const nodeColor = node.payload?.color || (standard ? standard.color : '#52525b');
            const nodeIcon = node.payload?.icon || (standard ? standard.icon : 'FileText');

            return (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => onNodeDragStart(e, node.id)}
                onClick={() => {
                  // Highlight and Select Node
                  setSelectedNodeId(node.id);
                  if (node.position) {
                    setCenter(node.position.x, node.position.y, { zoom: 0.8, duration: 800 });
                  } else {
                    fitView({ nodes: [{ id: node.id }], duration: 800, padding: 0.5 });
                  }
                  window.dispatchEvent(new CustomEvent('highlight-node', { detail: { id: node.id } }));
                }}
                className="group flex flex-col p-3 hover:bg-secondary/[0.03] border border-transparent hover:border-border/5 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
              >
                {/* Edge accent based on registered color */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 opacity-40" style={{ backgroundColor: nodeColor }} />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <DynamicIcon name={nodeIcon} size={12} style={{ color: nodeColor }} className="opacity-80 shrink-0" />
                    <div className="text-xs font-bold text-foreground/60 group-hover:text-foreground truncate tracking-wider">
                      {node.payload?.title || 'UNTITLED_NODE'}
                    </div>
                  </div>
                  <div className="text-[10px] uppercase font-black tracking-tighter text-foreground/10 group-hover:text-foreground/20">{node.payload?.type}</div>
                </div>
                <div className="flex items-center gap-2 mt-1 ml-5">
                  <div className="text-[10px] text-foreground/20 tabular-nums">ID_{node.id.slice(0,8)}</div>
                  <div className="size-0.5 rounded-full bg-secondary/10" />
                  <div className="text-[10px] text-foreground/20 truncate">MOD_{new Date(node.lastModified).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
          </div>
        </SidebarCollapsible>
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

function SidebarCollapsible({ title, count, isOpen, onToggle, children, action }: any) {
  return (
    <div className="border-b border-border/5 last:border-b-0">
      <div 
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        className={cn("w-full h-12 flex items-center justify-between px-6 hover:bg-secondary/[0.02] transition-colors group cursor-pointer", isOpen && "border-b" ,"bg-muted/60 hover:bg-muted/100")}
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
      </div>
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
