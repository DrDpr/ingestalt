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
} from '@xyflow/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useUIStore } from '@/lib/store/useUIStore';
import { GarnishedNode } from './nodes/GarnishedNode';
import { FloatingEdge } from './edges/FloatingEdge';

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
};

const edgeTypes = {
  floating: FloatingEdge,
};

import { Palette } from './Palette';

import { useSync } from '@/lib/hooks/useSync';

export function HorizonCanvas() {
  const { 
    setSelectedNodeId, selectedNodeId, 
    relationshipMode, setViewport, viewport,
    autoSaveEnabled
  } = useUIStore();
  const { screenToFlowPosition } = useReactFlow();
  const { syncNodeToFile } = useSync();

  // 1. Fetch agnostic data
  const dbNodesData = useLiveQuery(() => db.nodes.toArray(), []);
  const dbEdgesData = useLiveQuery(() => db.edges.toArray(), []);

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
      const nodeColor = standard ? standard.color : '#52525b';
      const nodeIcon = standard ? standard.icon : 'FileText';
      
      return {
        id: node.id,
        type: ['database', 'api', 'frontend', 'hook', 'standards'].includes(resolvedType) ? resolvedType : 'other',
        position: node.position,
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

  const onNodeClick = useCallback((e: any, node: Node) => setSelectedNodeId(node.id), [setSelectedNodeId]);
  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);
  const onMoveEnd = useCallback((e: any, vp: any) => setViewport(vp), [setViewport]);
  const onNodeDragStop = useCallback(async (e: any, node: Node) => {
    await db.nodes.update(node.id, { position: node.position });
  }, []);

  const onConnect = useCallback(async (params: any) => {
    const { source, target } = params;
    if (!source || !target) return;
    const id = `edge_${source}_${target}`;
    if (await db.edges.get(id)) return;
    await db.edges.add({ id, workspaceId: 'default', sourceId: source, targetId: target, type: 'relates' });
    
    // Sync the source node because its YAML 'relations' just changed
    if (autoSaveEnabled) {
      await syncNodeToFile(source);
    }
  }, [syncNodeToFile, autoSaveEnabled]);

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

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = `node_${Math.random().toString(36).substr(2, 9)}`;
      const title = `New ${activeStandardsMap.get(configId)?.title || 'Node'}`;

      await db.nodes.add({
        id,
        configId,
        workspaceId: 'default',
        position,
        lastModified: Date.now(),
        payload: {
          title,
          type: activeStandardsMap.get(configId)?.type || 'other',
          content: `# ${title}\nSpawned from palette.`,
          tags: []
        }
      });
      
      // Export newly spawned node to disk if auto-save is enabled
      if (autoSaveEnabled) {
        await syncNodeToFile(id);
      }
      
      setSelectedNodeId(id);
    },
    [screenToFlowPosition, activeStandardsMap, setSelectedNodeId, syncNodeToFile, autoSaveEnabled]
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

  return (
    <div className="w-full h-full relative">
      <Palette />
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd} onNodeDragStop={onNodeDragStop}
        onConnect={onConnect} onEdgeDoubleClick={onEdgeDoubleClick}
        onPaneContextMenu={onPaneContextMenu}
        onDragOver={onDragOver} onDrop={onDrop}
        nodeTypes={nodeTypes_internal} edgeTypes={edgeTypes}
        fitView className="bg-neutral-950" defaultViewport={viewport}
      >
        <Background color="#333" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="fill-neutral-400 bg-neutral-900 border-neutral-800" />
        <MiniMap 
          className="bg-neutral-900 border border-neutral-800 rounded-lg" 
          nodeColor={(n) => n.data?.color || '#52525b'}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
