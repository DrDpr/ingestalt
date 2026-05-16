'use client';

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
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

import { useSync } from '../../lib/hooks/useSync';

export function HorizonCanvas() {
  const {
    setSelectedNodeId, selectedNodeId,
    clearSelection,
    relationshipMode, setViewport, viewport,
    autoSaveEnabled, theme, activeGraphId,
    copiedNodeIds, setCopiedNodeIds,
    toggleNodeSelection, selectedNodeIds, selectAllNodes, setPrimaryNodeId
  } = useUIStore();
  const { resolvedTheme } = useTheme();
  const { screenToFlowPosition, getNodes } = useReactFlow();
  const { syncNodeToFile } = useSync();

  // Get the active graph to determine its workspaceId
  const activeGraph = useLiveQuery(async () => {
    if (!activeGraphId) return null;
    return await db.graphs.get(activeGraphId);
  }, [activeGraphId]);

  // Determine the workspace filter: use graph's workspaceId if graph exists, otherwise use activeGraphId directly
  const workspaceFilter = activeGraph?.workspaceId || activeGraphId;

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
    await db.nodes.update(node.id, { position: node.position });
  }, []);

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
    if (confirm('Delete this connection?')) {
      await db.edges.delete(edge.id);
      // Sync the source node because its YAML 'relations' just changed
      if (autoSaveEnabled) {
        await syncNodeToFile(edge.source);
      }
    }
  }, [syncNodeToFile, autoSaveEnabled]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

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
      const nodeType = type || activeStandardsMap.get(configId)?.type || 'other';
      const title = `New ${activeStandardsMap.get(configId)?.title || type.charAt(0).toUpperCase() + type.slice(1)}`;

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
    // Prompt-based spawning is now secondary to the Palette, but we'll keep it as a fallback
    const type = prompt('Spawn node type? (database, api, frontend, other)', 'other');
    if (!type) return;
    const title = prompt('Node title?', 'New Node');
    if (!title) return;
    const id = `node_${Math.random().toString(36).substr(2, 9)}`;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    db.nodes.add({
      id, configId: `node_standards_${type}`, workspaceId: 'default', position, lastModified: Date.now(),
      payload: { title, type, content: `# ${title}\nGenerated on canvas.`, tags: [] }
    });
  }, [screenToFlowPosition]);

  // Keyboard shortcuts handlers
  const handleDelete = useCallback(async (nodeIds: string[]) => {
    if (confirm(`Delete ${nodeIds.length} node(s)?`)) {
      await Promise.all(nodeIds.map(id => db.nodes.delete(id)));
      clearSelection();
    }
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
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={['Shift', 'Control', 'Meta']}
        colorMode={resolvedTheme as 'dark' | 'light' | 'system' || 'system'}
      >
        <Background
          color="var(--border)"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const nodeData = node.data as any;
            return nodeData?.color || (resolvedTheme === 'dark' ? '#52525b' : '#e4e4e7');
          }}
          className="bg-background border border-border"
        />
      </ReactFlow>
    </div>
  );
}
