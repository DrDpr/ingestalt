'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Share2, Anchor, Zap, Cpu, Compass, Trash2, FolderOpen, CheckCircle2, Loader2, Sun, Moon, Eraser, Keyboard, Copy, Download, FileText, X } from 'lucide-react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { ingestFromFileSystem, getStoredFolderHandle, connectAndStoreFolder, verifyPermission } from '@/lib/drdpr-horizon/lib/ingest-fsa';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { useTheme } from 'next-themes';
import { PromptModal } from '../PromptModal';
import { generateProfessionalWiki } from '@/lib/drdpr-horizon/lib/publish/wikiGenerator';

export function Toolbar() {
  const {
    relationshipMode, setRelationshipMode,
    edgeHandleType, setEdgeHandleType,
    edgePathType, setEdgePathType,
    theme, toggleTheme,
    setActiveGraphId,
    activeGraphId,
    setShortcutsHelpOpen,
    selectedNodeIds,
    clearNodeSelection
  } = useUIStore();
  const { resolvedTheme } = useTheme();

  const [connectedFolder, setConnectedFolder] = useState<string | null>(null);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [permissionState, setPermissionState] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [promptConfig, setPromptConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    options: { label: string; value: string }[];
    onConfirm: (val: string) => void;
  }>({
    show: false,
    title: '',
    message: '',
    options: [],
    onConfirm: () => {},
  });

  // On mount, check handle and permission
  useEffect(() => {
    const checkHandle = async () => {
      const handle = await getStoredFolderHandle();
      if (handle) {
        setConnectedFolder(handle.name);
        // Verify if we actually have permission or need a pulse (re-auth)
        const hasPerm = await verifyPermission(handle);
        setPermissionState(hasPerm ? 'granted' : 'prompt');
      }
    };
    checkHandle();
  }, []);

  const handleIngest = async () => {
    setIsIngesting(true);
    setIngestStatus('Starting...');
    try {
      const handle = await getStoredFolderHandle();
      if (!handle) {
        // If no handle, ingestFromFileSystem will prompt for one
        const result = await ingestFromFileSystem((msg) => setIngestStatus(msg));
        const newHandle = await getStoredFolderHandle();
        if (newHandle) setConnectedFolder(newHandle.name);
        setIngestStatus(`✓ ${result.count} nodes ingested`);
        setTimeout(() => setIngestStatus(null), 3000);
        return;
      }

      setConnectedFolder(handle.name);
      
      // Determine target workspace: use current canvas's workspace or create new one
      let targetWorkspaceId: string;
      
      if (activeGraphId) {
        // If a canvas is active, ingest into its workspace
        const activeGraph = await db.graphs.get(activeGraphId);
        if (activeGraph) {
          targetWorkspaceId = activeGraph.workspaceId;
          setIngestStatus(`Ingesting into "${activeGraph.name}"...`);
        } else {
          // activeGraphId might be a workspace ID directly (legacy)
          targetWorkspaceId = activeGraphId;
          setIngestStatus(`Ingesting into workspace...`);
        }
      } else {
        // No active canvas - create a new workspace and graph
        targetWorkspaceId = `workspace_${handle.name}_${Date.now()}`;
        const newGraph = {
          id: `graph_${Date.now()}`,
          workspaceId: targetWorkspaceId,
          name: handle.name,
          description: `Ingested from ${handle.name}`,
          config: {}
        };
        await db.graphs.add(newGraph);
        setActiveGraphId(newGraph.id);
        setIngestStatus(`Creating new canvas "${handle.name}"...`);
      }

      // Ingest with temporary workspace ID (folder name)
      const result = await ingestFromFileSystem((msg) => setIngestStatus(msg));
      
      // Update ONLY the newly ingested nodes to use the target workspace
      for (const nodeId of result.nodeIds) {
        await db.nodes.update(nodeId, { workspaceId: targetWorkspaceId });
      }
      
      // Update edges for the newly ingested nodes
      const allEdges = await db.edges.toArray();
      const edgesToUpdate = allEdges.filter(e =>
        result.nodeIds.includes(e.sourceId) || result.nodeIds.includes(e.targetId)
      );
      for (const edge of edgesToUpdate) {
        await db.edges.update(edge.id, { workspaceId: targetWorkspaceId });
      }
      
      setIngestStatus(`✓ ${result.count} nodes ingested`);
      setTimeout(() => setIngestStatus(null), 3000);
    } catch (e) {
      console.error('Ingestion error:', e);
      setIngestStatus('✗ Ingestion failed');
      setTimeout(() => setIngestStatus(null), 3000);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleChangeFolder = async () => {
    const handle = await connectAndStoreFolder();
    if (handle) {
      setConnectedFolder(handle.name);
      setIngestStatus(`Folder changed to "${handle.name}"`);
      setTimeout(() => setIngestStatus(null), 2500);
    }
  };

  const handleClear = async () => {
    // Button is now disabled if !activeGraphId, so we just focus on the modal
    setPromptConfig({
      show: true,
      title: 'CLEAR CANVAS',
      message: 'Are you sure you want to clear all nodes and connections from the current canvas? This cannot be undone.',
      options: [
        { label: 'CLEAR ALL', value: 'confirm' },
        { label: 'CANCEL', value: 'cancel' }
      ],
      onConfirm: async (val) => {
        if (val === 'confirm') {
          try {
            const activeGraph = await db.graphs.get(activeGraphId);
            const targetWorkspaceId = activeGraph?.workspaceId || activeGraphId;
            await db.nodes.where('workspaceId').equals(targetWorkspaceId).delete();
            await db.edges.where('workspaceId').equals(targetWorkspaceId).delete();
          } catch (e) {
            console.error('Failed to clear canvas:', e);
          }
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handlePurgeOrphans = async () => {
    const allGraphs = await db.graphs.toArray();
    const validWorkspaceIds = new Set(allGraphs.map(g => g.workspaceId));
    const everyNode = await db.nodes.toArray();
    const orphans = everyNode.filter(n => !validWorkspaceIds.has(n.workspaceId));
    
    setPromptConfig({
      show: true,
      title: orphans.length > 0 ? 'PURGE ORPHANS' : 'DATABASE CLEAN',
      message: orphans.length > 0 
        ? `Found ${orphans.length} orphaned nodes from deleted canvases. These are taking up space in the background. Purge them?`
        : 'No orphaned nodes found. Your database is fully synchronized.',
      options: orphans.length > 0 
        ? [{ label: 'PURGE DATABASE', value: 'confirm' }, { label: 'KEEP THEM', value: 'cancel' }]
        : [{ label: 'EXCELLENT', value: 'close' }],
      onConfirm: async (val) => {
        if (val === 'confirm') {
          const orphanIds = orphans.map(n => n.id);
          await db.nodes.bulkDelete(orphanIds);
          const everyEdge = await db.edges.toArray();
          const orphanEdgeIds = everyEdge.filter(e => !validWorkspaceIds.has(e.workspaceId)).map(e => e.id);
          await db.edges.bulkDelete(orphanEdgeIds);
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  };



  return (
    <div className="flex items-center gap-4 p-4">
      
      {/* Action Group */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 p-1 bg-card/80 backdrop-blur border border-border rounded shadow-xs">
          <button
            onClick={handleIngest}
            disabled={isIngesting}
            title={
              isIngesting ? 'Syncing...'
              : permissionState === 'prompt' && connectedFolder ? `Re-authorize "${connectedFolder}" then sync`
              : connectedFolder ? `Re-sync from "${connectedFolder}"`
              : 'Connect folder & ingest'
            }
            className={`p-2 hover:bg-secondary rounded transition-colors disabled:opacity-50 ${
              permissionState === 'prompt' && connectedFolder
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-neutral-400 hover:text-foreground'
            }`}
          >
            {isIngesting
              ? <Loader2 size={16} className="animate-spin" />
              : permissionState === 'prompt' && connectedFolder
                ? <RefreshCw size={16} className="opacity-60" />
                : connectedFolder
                  ? <RefreshCw size={16} />
                  : <FolderOpen size={16} />}
          </button>
                    <button
            onClick={handleClear}
            disabled={!activeGraphId}
            title={activeGraphId ? "Clear All Nodes" : "Select a canvas first"}
            className="p-2 hover:bg-secondary text-red-400/60 hover:text-red-400 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
          </button>
          
          <button
            onClick={handlePurgeOrphans}
            title="Purge Orphaned Nodes"
            className="p-2 hover:bg-secondary text-amber-400/60 hover:text-amber-400 rounded transition-colors"
          >
            <Eraser size={16} />
          </button>

          <div className="h-6 w-[1px] bg-secondary-700 mx-1" />
          <button
            onClick={() => setShortcutsHelpOpen(true)}
            title="Keyboard Shortcuts"
            className="p-2 hover:bg-secondary text-neutral-400 hover:text-foreground rounded transition-colors"
          >
            <Keyboard size={16} />
          </button>
          <button
            onClick={toggleTheme}
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 hover:bg-secondary text-neutral-400 hover:text-foreground rounded transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        {/* Folder status badge */}
        {(connectedFolder || ingestStatus) && (
          <div
            onClick={!ingestStatus && connectedFolder ? handleChangeFolder : undefined}
            title={!ingestStatus && connectedFolder ? 'Click to change folder' : undefined}
            className={`flex items-center gap-1.5 px-2 py-1 bg-card/80 border border-border rounded text-xs font-mono max-w-[220px] ${
              !ingestStatus && connectedFolder ? 'cursor-pointer hover:border-blue-500/50 hover:bg-secondary/60 group transition-colors' : ''
            }`}
          >
            {ingestStatus ? (
              <span className="text-blue-400 truncate">{ingestStatus}</span>
            ) : permissionState === 'prompt' && connectedFolder ? (
              <>
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-amber-400/80 truncate" title="Click sync to re-authorize">{connectedFolder}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={10} className="text-green-500 flex-shrink-0 group-hover:hidden" />
                <FolderOpen size={10} className="text-blue-400 flex-shrink-0 hidden group-hover:block" />
                <span className="text-foreground/40 truncate group-hover:text-blue-400 transition-colors">{connectedFolder}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="h-4 w-[1px] bg-secondary" />

      {/* Relationship Visualization Mode */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-foreground/40  ml-1">Visualization</span>
        <div className="flex bg-card/80 backdrop-blur border border-border rounded p-1 shadow-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'selected', label: 'Direct' },
            { id: 'trace', label: 'Trace' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setRelationshipMode(mode.id as any)}
              className={`px-3 py-1 text-xs uppercase tracking-wider  rounded transition-all ${
                relationshipMode === mode.id
                  ? 'bg-blue-600/50 text-foreground shadow-lg'
                  : 'text-foreground/40 hover:text-foreground/90'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Anchor Logic Toggle */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-foreground/40  ml-1">Anchors</span>
        <div className="flex bg-card/80 backdrop-blur border border-border rounded p-1 shadow-xs">
          {[
            { id: 'fixed', label: 'Fixed', icon: <Anchor size={10} />, title: 'Top/Bottom Only' },
            { id: 'smart', label: 'Smart', icon: <Zap size={10} />, title: 'Closest 4-Way' }
          ].map((mode) => (
            <button
              key={mode.id}
              title={mode.title}
              onClick={() => setEdgeHandleType(mode.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider  rounded transition-all ${
                edgeHandleType === mode.id
                  ? 'bg-purple-600/50 text-foreground shadow-lg'
                  : 'text-foreground/40 hover:text-foreground/90'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Path Style Toggle */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-foreground/40  ml-1">Path Style</span>
        <div className="flex bg-card/80 backdrop-blur border border-border rounded p-1 shadow-xs">
          {[
            { id: 'organic', label: 'Organic', icon: <Share2 size={10} />, title: 'Bezier Curves' },
            { id: 'circuit', label: 'Circuit', icon: <Cpu size={10} />, title: 'Square Steps' },
            { id: 'smart', label: 'Smart', icon: <Compass size={10} />, title: 'Avoid Nodes' }
          ].map((mode) => (
            <button
              key={mode.id}
              title={mode.title}
              onClick={() => setEdgePathType(mode.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider  rounded transition-all ${
                edgePathType === mode.id
                  ? 'bg-emerald-600/50 text-foreground shadow-lg'
                  : 'text-foreground/40 hover:text-foreground/90'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Actions (when nodes selected) */}
      {selectedNodeIds.size > 0 && (
        <>
          <div className="mx-auto"/>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <span className="text-xs font-bold text-blue-400">{selectedNodeIds.size} Selected</span>
          </div>
          <div className="flex gap-1 p-1 bg-card/80 backdrop-blur border border-border rounded shadow-xs">
            <button onClick={async () => { const nodes = await db.nodes.bulkGet(Array.from(selectedNodeIds)); await navigator.clipboard.writeText(nodes.filter(n => n).map(n => `# ${n.payload?.title}\n\n${n.payload?.content}\n\n---\n\n`).join('')); }} className="p-2 hover:bg-secondary text-foreground/60 hover:text-foreground rounded transition-colors" title="Copy content"><Copy size={16} /></button>
            <button onClick={async () => { const nodes = await db.nodes.bulkGet(Array.from(selectedNodeIds)); const blob = new Blob([JSON.stringify({ nodes: nodes.filter(n => n) }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `export_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); }} className="p-2 hover:bg-secondary text-foreground/60 hover:text-foreground rounded transition-colors" title="Export JSON"><Download size={16} /></button>
            <button onClick={async () => { const nodes = await db.nodes.bulkGet(Array.from(selectedNodeIds)); const validNodes = nodes.filter(n => n !== undefined); const allEdges = await db.edges.toArray(); const relevantEdges = allEdges.filter(e => selectedNodeIds.has(e.sourceId) && selectedNodeIds.has(e.targetId)); const allNodes = await db.nodes.toArray(); const standards = allNodes.filter(n => n.payload?.type === 'standards'); const html = generateProfessionalWiki(validNodes, relevantEdges, standards); const blob = new Blob([html], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `wiki_${Date.now()}.html`; a.click(); URL.revokeObjectURL(url); }} className="p-2 hover:bg-secondary text-foreground/60 hover:text-foreground rounded transition-colors" title="Generate Wiki"><FileText size={16} /></button>
            <button onClick={async () => { if (confirm(`Delete ${selectedNodeIds.size} nodes?`)) { await db.nodes.bulkDelete(Array.from(selectedNodeIds)); const edges = await db.edges.toArray(); await db.edges.bulkDelete(edges.filter(e => selectedNodeIds.has(e.sourceId) || selectedNodeIds.has(e.targetId)).map(e => e.id)); clearNodeSelection(); }}} className="p-2 hover:bg-secondary text-red-400/60 hover:text-red-400 rounded transition-colors" title="Delete selected"><Trash2 size={16} /></button>
            <button onClick={clearNodeSelection} className="p-2 hover:bg-secondary text-foreground/40 hover:text-foreground rounded transition-colors" title="Clear selection"><X size={16} /></button>
          </div>
          <div className="h-4 w-[1px] bg-secondary" />
        </>
      )}

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
