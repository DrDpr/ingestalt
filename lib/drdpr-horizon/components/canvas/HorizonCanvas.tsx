'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
  SelectionMode,
} from '@xyflow/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { useUIStore } from '../../lib/store/useUIStore';
import { GarnishedNode } from './nodes/GarnishedNode';
import { FloatingEdge } from './edges/FloatingEdge';
import { useKeyboardShortcuts } from '../../lib/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '../KeyboardShortcutsHelp';
import { useTheme } from 'next-themes';
import { PromptModal } from '../PromptModal';

import '@xyflow/react/dist/style.css';

// The node mapping is now fully centralized to the dynamic GarnishedNode
const nodeTypes_internal = {
  database: GarnishedNode,
  api: GarnishedNode,
  frontend: GarnishedNode,
  hook: GarnishedNode,
  other: GarnishedNode,
  standards: GarnishedNode,
  horizonDoc: GarnishedNode,
  'ai-task': GarnishedNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

import { Palette } from './Palette';
import { BatchActionToolbar } from './BatchActionToolbar';
import { CommandSearch } from '../layout/CommandSearch';

import { useSync } from '../../lib/hooks/useSync';
import { Plus, Trash2, Type, Sparkles, Upload, FileJson, FileText as LucideFileText, X } from 'lucide-react';
import { parseMarkdownToNode } from '../../lib/parser';

export function HorizonCanvas() {
  const {
    setSelectedNodeId, selectedNodeId,
    clearSelection,
    relationshipMode, setViewport, viewport,
    autoSaveEnabled, activeGraphId,
    copiedNodeIds, setCopiedNodeIds,
    toggleNodeSelection, selectedNodeIds, selectAllNodes, setPrimaryNodeId
  } = useUIStore();
  const [promptConfig, setPromptConfig] = React.useState<{
    show: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    options?: { label: string; value: string; variant?: 'default' | 'danger' }[];
    icon?: React.ReactNode;
    type?: 'default' | 'danger' | 'warning' | 'success' | 'info';
    onConfirm: (val: string) => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { screenToFlowPosition, getNodes } = useReactFlow();
  const { syncNodeToFile } = useSync();

  const { setHighlightNodeId } = useUIStore();

  // Get the active graph to determine its workspaceId
  const activeGraph = useLiveQuery(async () => {
    if (!activeGraphId) return null;
    return await db.graphs.get(activeGraphId);
  }, [activeGraphId]);

  // Determine the workspace filter: use graph's workspaceId if graph exists, otherwise use activeGraphId directly
  const workspaceFilter = activeGraph?.workspaceId || activeGraphId;

  const handleFileImport = useCallback(async (file: File, position?: { x: number, y: number }) => {
    try {
      const text = await file.text();
      const workspaceId = workspaceFilter || 'default';
      
      // 1. Handle JSON Import (Horizon Export)
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid export file: No nodes found.');
        }

        const nodesToImport = data.nodes.map((n: any) => ({
          ...n,
          workspaceId,
          lastModified: Date.now()
        }));

        const edgesToImport = (data.edges || []).map((e: any) => ({
          ...e,
          workspaceId
        }));

        await db.nodes.bulkPut(nodesToImport);
        await db.edges.bulkPut(edgesToImport);

        setPromptConfig({
          show: true,
          title: 'IMPORT SUCCESSFUL',
          message: `Successfully imported ${nodesToImport.length} nodes and ${edgesToImport.length} edges into the current workspace.`,
          type: 'success',
          icon: <FileJson size={24} className="text-emerald-400" />,
          options: [{ label: 'AWESOME', value: 'close' }],
          onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
        });
      } 
      // 2. Handle Markdown Import (Individual Node Ingestion)
      else if (file.name.endsWith('.md')) {
        const result = parseMarkdownToNode(text, workspaceId, true);
        const node = result.node;
        
        if (position) {
          node.position = position;
        }
        
        await db.nodes.add(node);
        if (result.edges && result.edges.length > 0) {
          await db.edges.bulkAdd(result.edges);
        }
        
        if (autoSaveEnabled) await syncNodeToFile(node.id);

        setPromptConfig({
          show: true,
          title: 'NODE INGESTED',
          message: `Successfully parsed "${node.payload?.title}" from markdown and added it to the workspace.`,
          type: 'success',
          icon: <LucideFileText size={24} className="text-blue-400" />,
          options: [{ label: 'VIEW NODE', value: 'view' }, { label: 'CLOSE', value: 'close' }],
          onConfirm: (val) => {
            if (val === 'view') setSelectedNodeId(node.id);
            setPromptConfig(prev => ({ ...prev, show: false }));
          }
        });
      }
    } catch (error: any) {
      setPromptConfig({
        show: true,
        title: 'IMPORT FAILED',
        message: `Could not import file: ${error.message}`,
        type: 'danger',
        icon: <X size={24} className="text-red-500" />,
        options: [{ label: 'OK', value: 'close' }],
        onConfirm: () => setPromptConfig(prev => ({ ...prev, show: false }))
      });
    }
  }, [workspaceFilter, autoSaveEnabled, syncNodeToFile, setSelectedNodeId]);

  // Listen for search highlights and import events
  useEffect(() => {
    const handleHighlight = (e: any) => {
      const id = e.detail?.id;
      if (id) {
        setHighlightNodeId(id);
        setTimeout(() => setHighlightNodeId(null), 3000); // Pulse for 3 seconds
      }
    };
    const handleImport = (e: any) => {
      const file = e.detail?.file;
      if (file) handleFileImport(file);
    };

    window.addEventListener('highlight-node', handleHighlight);
    window.addEventListener('import-file', handleImport);
    return () => {
      window.removeEventListener('highlight-node', handleHighlight);
      window.removeEventListener('import-file', handleImport);
    };
  }, [setHighlightNodeId, handleFileImport]);

  // 1. Fetch agnostic data (filtered by active graph's workspace)
  const dbNodesData = useLiveQuery(() => {
    if (!workspaceFilter) {
      return db.nodes.toArray();
    }
    return db.nodes.where('workspaceId').equals(workspaceFilter).toArray();
  }, [workspaceFilter]);
  
  const dbEdgesData = useLiveQuery(() => {
    if (!workspaceFilter) {
      return db.edges.toArray();
    }
    return db.edges.where('workspaceId').equals(workspaceFilter).toArray();
  }, [workspaceFilter]);

  // 2. Dynamic Standards Map
  const activeStandardsMap = useMemo(() => {
    if (!dbNodesData) return new Map();
    const map = new Map<string, any>();

    dbNodesData.forEach(node => {
      if (node.payload?.type === 'standards') {
        const defs = node.payload?.definitions || [];
        defs.forEach((d: any) => {
          map.set(d.id, d);
        });
        
        if (node.payload?.configId || node.id) {
           map.set(node.payload?.configId || node.id, {
             type: node.payload?.type,
             label: node.payload?.title,
             title: node.payload?.title,
             icon: node.payload?.icon || 'ShieldAlert',
             color: node.payload?.color || '#f59e0b',
             fields: node.payload?.fields || []
           });
        }
      }
    });

    return map;
  }, [dbNodesData]);

  // 3. Map Agnostic Nodes with Dynamic Icon/Color Injections
  const nodes_transformed: Node[] = useMemo(() => {
    if (!dbNodesData) return [];
    
    return dbNodesData.map((node) => {
      const configId = node.configId;
      const standard = activeStandardsMap.get(configId);
      
      const resolvedType = standard ? standard.type : 'other';
      // Prioritize node-level icon/color over standard defaults
      const nodeColor = node.payload?.color || (standard ? standard.color : '#52525b');
      const nodeIcon = node.payload?.icon || (standard ? standard.icon : 'FileText');
      
      return {
        id: node.id,
        type: ['database', 'api', 'frontend', 'hook', 'standards', 'ai-task'].includes(resolvedType) ? resolvedType : 'other',
        position: node.position,
        // We do NOT pass `selected` to React Flow here to avoid the infinite sync loop.
        // Visual selection is handled by BaseNode reading from useUIStore.
        data: {
          id: node.id,
          label: node.payload?.title || 'Untitled',
          type: resolvedType,
          tags: node.payload?.tags || [],
          configId: configId,
          color: nodeColor,
          icon: nodeIcon,
          fields: standard?.fields || []
        },
      };
    });
  }, [dbNodesData, activeStandardsMap]);

  // 4. Edges & Filter Logic
  const edges_transformed: Edge[] = useMemo(() => {
    if (!dbEdgesData) return [];
    const edgesMap = new Map<string, Edge>();
    dbEdgesData.forEach((edge) => {
      const forwardKey = `${edge.sourceId}->${edge.targetId}`;
      const reverseKey = `${edge.targetId}->${edge.sourceId}`;
      if (edgesMap.has(reverseKey)) {
        const existing = edgesMap.get(reverseKey)!;
        existing.markerStart = { type: MarkerType.ArrowClosed, color: '#64748b' };
        existing.label = `${existing.label} | ${edge.type}`;
      } else if (!edgesMap.has(forwardKey)) {
        edgesMap.set(forwardKey, {
          id: edge.id, source: edge.sourceId, target: edge.targetId,
          type: 'floating', animated: true, label: edge.type,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
          style: { stroke: '#64748b', strokeWidth: 2 },
        });
      }
    });
    return Array.from(edgesMap.values());
  }, [dbEdgesData]);

  const filteredEdges = useMemo(() => {
    if (relationshipMode === 'all') return edges_transformed;
    if (!selectedNodeId) return [];
    if (relationshipMode === 'selected') {
      return edges_transformed.filter(e => e.source === selectedNodeId || e.target === selectedNodeId);
    }
    if (relationshipMode === 'trace') {
      const connectedNodeIds = new Set<string>([selectedNodeId]);
      const tracedEdges = new Set<string>();
      let foundNew = true;
      while (foundNew) {
        foundNew = false;
        edges_transformed.forEach(edge => {
          if (!tracedEdges.has(edge.id) && (connectedNodeIds.has(edge.source) || connectedNodeIds.has(edge.target))) {
            connectedNodeIds.add(edge.source); connectedNodeIds.add(edge.target);
            tracedEdges.add(edge.id); foundNew = true;
          }
        });
      }
      return edges_transformed.filter(e => tracedEdges.has(e.id));
    }
    return edges_transformed;
  }, [edges_transformed, relationshipMode, selectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => { setNodes(nodes_transformed); }, [nodes_transformed, setNodes]);
  useEffect(() => { setEdges(filteredEdges); }, [filteredEdges, setEdges]);

  const onNodeClick = useCallback((e: any, node: Node) => {
    // Multi-select with Ctrl/Cmd/Shift key
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      toggleNodeSelection(node.id);
    } else {
      setSelectedNodeId(node.id);
    }
  }, [setSelectedNodeId, toggleNodeSelection]);

  // Handle drag-selection at the END of the drag action to avoid infinite loops
  const onSelectionEnd = useCallback(() => {
    const selectedNodes = getNodes().filter(n => n.selected);
    if (selectedNodes.length === 0) return;
    
    const ids = selectedNodes.map(n => n.id);
    selectAllNodes(ids);
    // Focus the last node in the group
    setPrimaryNodeId(ids[ids.length - 1]);
  }, [getNodes, selectAllNodes, setPrimaryNodeId]);

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);
  const onMoveEnd = useCallback((e: any, vp: any) => setViewport(vp), [setViewport]);
  const onNodeDragStop = useCallback(async (e: any, node: Node) => {
    // If multiple nodes are selected, they all move together.
    // We need to persist all of them.
    const allNodes = getNodes();
    const draggedNodes = allNodes.filter(n => n.selected);
    
    // Fallback to the single node if selection is empty or doesn't include the dragged node
    const nodesToUpdate = draggedNodes.length > 0 ? draggedNodes : [node];
    
    // Use a transaction for atomic updates to avoid jittering
    await db.transaction('rw', db.nodes, async () => {
      for (const n of nodesToUpdate) {
        await db.nodes.update(n.id, { position: n.position });
      }
    });
  }, [getNodes]);

  const onConnect = useCallback(async (params: any) => {
    const { source, target } = params;
    if (!source || !target) return;
    const id = `edge_${source}_${target}`;
    if (await db.edges.get(id)) return;
    
    // Get workspaceId from active graph's workspace or use activeGraphId directly or 'default'
    const edgeWorkspaceId = workspaceFilter || 'default';
    await db.edges.add({ id, workspaceId: edgeWorkspaceId, sourceId: source, targetId: target, type: 'relates' });
    
    // Sync the source node because its YAML 'relations' just changed
    if (autoSaveEnabled) {
      await syncNodeToFile(source);
    }
  }, [syncNodeToFile, autoSaveEnabled, workspaceFilter]);

  const onEdgeDoubleClick = useCallback(async (e: any, edge: Edge) => {
    setPromptConfig({
      show: true,
      title: 'DELETE CONNECTION',
      message: 'Are you sure you want to remove this relationship?',
      type: 'danger',
      icon: <Trash2 size={24} />,
      options: [
        { label: 'DELETE CONNECTION', value: 'confirm', variant: 'danger' },
        { label: 'CANCEL', value: 'cancel' }
      ],
      onConfirm: async (val) => {
        if (val === 'confirm') {
          await db.edges.delete(edge.id);
          if (autoSaveEnabled) {
            await syncNodeToFile(edge.source);
          }
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  }, [syncNodeToFile, autoSaveEnabled]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);


  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      // Handle File Drop
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        handleFileImport(event.dataTransfer.files[0], position);
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow');
      const configId = event.dataTransfer.getData('application/horizon-config');
      const existingNodeId = event.dataTransfer.getData('application/reactflow-node-id');

      // Handle dragging existing node from sidebar
      if (existingNodeId) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        await db.nodes.update(existingNodeId, { position });
        return;
      }

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = `node_${Math.random().toString(36).substr(2, 9)}`;
      const standard = activeStandardsMap.get(configId);
      const nodeType = type || standard?.type || 'other';
      const typeLabel = standard?.label || standard?.title || type;
      const title = `New ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}`;

      // Get workspaceId from active graph's workspace or use activeGraphId directly or 'default'
      const nodeWorkspaceId = workspaceFilter || 'default';

      // Build payload with special handling for standards nodes
      const payload: any = {
        title,
        type: nodeType,
        content: `# ${title}\nSpawned from palette.`,
        tags: []
      };

      // Initialize standards nodes with empty definitions array and proper styling
      if (nodeType === 'standards') {
        payload.definitions = [];
        payload.icon = 'Settings';
        payload.color = '#f59e0b'; // amber color to match the palette
      }

      await db.nodes.add({
        id,
        configId,
        workspaceId: nodeWorkspaceId,
        position,
        lastModified: Date.now(),
        payload
      });
      
      // Export newly spawned node to disk if auto-save is enabled
      if (autoSaveEnabled) {
        await syncNodeToFile(id);
      }
      
      setSelectedNodeId(id);
    },
    [screenToFlowPosition, activeStandardsMap, setSelectedNodeId, syncNodeToFile, autoSaveEnabled, workspaceFilter]
  );

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  // Keyboard shortcuts handlers
  const handleDelete = useCallback(async (nodeIds: string[]) => {
    setPromptConfig({
      show: true,
      title: 'DELETE SELECTION',
      message: `Are you sure you want to delete ${nodeIds.length} selected nodes and all their connections?`,
      type: 'danger',
      icon: <Trash2 size={24} />,
      options: [
        { label: 'DELETE ALL', value: 'confirm', variant: 'danger' },
        { label: 'CANCEL', value: 'cancel' }
      ],
      onConfirm: async (val) => {
        if (val === 'confirm') {
          // Bulk Delete nodes from DB
          await db.nodes.bulkDelete(nodeIds);
          
          // Identify and delete connected edges
          const edges = await db.edges.toArray();
          const edgesToDelete = edges.filter(e => 
            nodeIds.includes(e.sourceId) || nodeIds.includes(e.targetId)
          );
          await db.edges.bulkDelete(edgesToDelete.map(e => e.id));
          
          clearSelection();
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  }, [clearSelection]);

  const handleDuplicate = useCallback(async (nodeIds: string[]) => {
    const nodesToDuplicate = await db.nodes.bulkGet(nodeIds);
    const newNodes = nodesToDuplicate.filter(Boolean).map(node => ({
      ...node!,
      id: `node_${Math.random().toString(36).substr(2, 9)}`,
      position: { x: node!.position.x + 50, y: node!.position.y + 50 },
      lastModified: Date.now(),
    }));
    await db.nodes.bulkAdd(newNodes);
    // Select the first duplicated node
    if (newNodes.length > 0) {
      setSelectedNodeId(newNodes[0].id);
    }
  }, [setSelectedNodeId]);

  const handleCopy = useCallback((nodeIds: string[]) => {
    setCopiedNodeIds(nodeIds);
  }, [setCopiedNodeIds]);

  const handlePaste = useCallback(async () => {
    if (copiedNodeIds.length === 0) return;
    const nodesToCopy = await db.nodes.bulkGet(copiedNodeIds);
    const newNodes = nodesToCopy.filter(Boolean).map(node => ({
      ...node!,
      id: `node_${Math.random().toString(36).substr(2, 9)}`,
      position: { x: node!.position.x + 100, y: node!.position.y + 100 },
      lastModified: Date.now(),
    }));
    await db.nodes.bulkAdd(newNodes);
    // Select the first pasted node
    if (newNodes.length > 0) {
      setSelectedNodeId(newNodes[0].id);
    }
  }, [copiedNodeIds, setSelectedNodeId]);

  const getAllNodeIds = useCallback(() => {
    return nodes_transformed.map(n => n.id);
  }, [nodes_transformed]);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onCopy: handleCopy,
    onPaste: handlePaste,
    getAllNodeIds,
  });

  const isDark = resolvedTheme === 'dark';
  
  
  return (
    <div className="w-full h-full relative">
      <Palette />
      <KeyboardShortcutsHelp />
      <BatchActionToolbar />
      <CommandSearch />
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick}
        onSelectionEnd={onSelectionEnd}
        onMoveEnd={onMoveEnd} onNodeDragStop={onNodeDragStop}
        onConnect={onConnect} onEdgeDoubleClick={onEdgeDoubleClick}
        onPaneContextMenu={onPaneContextMenu}
        onDragOver={onDragOver} onDrop={onDrop}
        nodeTypes={nodeTypes_internal} edgeTypes={edgeTypes}
        fitView
        className="bg-background"
        defaultViewport={viewport}
        proOptions={{ hideAttribution: true }}
        panOnDrag={[1, 2]}
        panActivationKeyCode="Space"
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={['Shift', 'Control', 'Meta']}
        deleteKeyCode={null}
        colorMode={mounted ? (resolvedTheme as 'dark' | 'light' | 'system' || 'light') : 'light'}
      >
        <Background
          color="var(--border)"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />
      </ReactFlow>
      <PromptModal
        show={promptConfig.show}
        title={promptConfig.title}
        message={promptConfig.message}
        defaultValue={promptConfig.defaultValue}
        options={promptConfig.options}
        icon={promptConfig.icon}
        type={promptConfig.type}
        onConfirm={promptConfig.onConfirm}
        onCancel={() => setPromptConfig(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
