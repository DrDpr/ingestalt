'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Share2, Anchor, Zap, ZapOff, Cpu, Compass, Trash2, FolderOpen, CheckCircle2, Loader2, Sun, Moon, Eraser, Keyboard, Copy, Download, FileText, X, Camera } from 'lucide-react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { ingestFromFileSystem, getStoredFolderHandle, connectAndStoreFolder, verifyPermission } from '@/lib/drdpr-horizon/lib/ingest-fsa';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { useTheme } from 'next-themes';
import { PromptModal } from '../PromptModal';
import { generateProfessionalWiki } from '@/lib/drdpr-horizon/lib/publish/wikiGenerator';
import { exportCanvas, exportNodeWithRelationships, exportSelectedNodes } from '@/lib/drdpr-horizon/lib/exportCanvas';
import { ExportPreviewModal } from '../ExportPreviewModal';
import { useReactFlow } from '@xyflow/react';

export function Toolbar() {
  const {
    relationshipMode, setRelationshipMode,
    edgeHandleType, setEdgeHandleType,
    edgePathType, setEdgePathType,
    setActiveGraphId,
    activeGraphId,
    setShortcutsHelpOpen,
    selectedNodeIds,
    selectedNodeId,
    clearNodeSelection,
    isPaletteOpen,
    setPaletteOpen
  } = useUIStore();
  const { setTheme, resolvedTheme } = useTheme();
  const { getNodes, getEdges } = useReactFlow();

  const [connectedFolder, setConnectedFolder] = useState<string | null>(null);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [permissionState, setPermissionState] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [mounted, setMounted] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
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

  const [exportTarget, setExportTarget] = useState<'node' | 'selection' | 'canvas' | null>(null);

  // On mount, check handle and permission
  useEffect(() => {
    setMounted(true);
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
      let result = await ingestFromFileSystem((msg) => setIngestStatus(msg));

      // Handle Project Root Warning
      if (result.isProjectRoot) {
        setIngestStatus('⚠ Potential project root detected');
        setPromptConfig({
          show: true,
          title: 'WIDE INGESTION WARNING',
          message: `The folder "${handle.name}" contains project files (like node_modules or .git). Ingesting this might result in a lot of noise. Do you want to continue indexing markdown files from this entire project, or cancel and select a more specific documentation folder?`,
          options: [
            { label: 'INGEST ANYWAY', value: 'confirm' },
            { label: 'SELECT DIFFERENT FOLDER', value: 'change' },
            { label: 'CANCEL', value: 'cancel' }
          ],
          onConfirm: async (val) => {
            setPromptConfig(prev => ({ ...prev, show: false }));
            if (val === 'confirm') {
              const retryResult = await ingestFromFileSystem((msg) => setIngestStatus(msg), true);
              finalizeIngestion(retryResult, targetWorkspaceId);
            } else if (val === 'change') {
              await handleChangeFolder();
            } else {
              setIngestStatus('Ingestion cancelled.');
              setTimeout(() => setIngestStatus(null), 3000);
            }
          }
        });
        return;
      }

      await finalizeIngestion(result, targetWorkspaceId);

    } catch (e) {
      console.error('Ingestion error:', e);
      setIngestStatus('✗ Ingestion failed');
      setTimeout(() => setIngestStatus(null), 3000);
    } finally {
      setIsIngesting(false);
    }
  };

  const finalizeIngestion = async (result: any, targetWorkspaceId: string) => {
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

  const handleExportCanvas = async () => {
    const canvasElement = document.querySelector('.react-flow') as HTMLElement;
    if (!canvasElement) {
      console.error('Canvas element not found');
      return;
    }

    try {
      const nodes = getNodes();
      const edges = getEdges();

      // If a single node is selected, prompt between node or canvas
      if (selectedNodeId && selectedNodeIds.size === 1) {
        setPromptConfig({
          show: true,
          title: 'EXPORT SCREENSHOT',
          message: 'Export the selected node with its relationships, or the entire canvas?',
          options: [
            { label: 'NODE + RELATIONSHIPS', value: 'node' },
            { label: 'ENTIRE CANVAS', value: 'canvas' },
            { label: 'CANCEL', value: 'cancel' }
          ],
          onConfirm: async (val) => {
            if (val === 'node') {
              setExportTarget('node');
            } else if (val === 'canvas') {
              setExportTarget('canvas');
            }
            setPromptConfig(prev => ({ ...prev, show: false }));
          }
        });
      }
      // If multiple nodes are selected, default to selection export
      else if (selectedNodeIds.size > 1) {
        setExportTarget('selection');
      }
      // Otherwise, default to entire canvas
      else {
        setExportTarget('canvas');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export canvas. Please try again.');
    }
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
            className={`p-2 hover:bg-secondary rounded transition-colors disabled:opacity-50 ${permissionState === 'prompt' && connectedFolder
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-foreground/60 hover:text-foreground'
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

          <div className="h-6 w-[1px] bg-border mx-1" />
          <button
            onClick={handleExportCanvas}
            title={
              selectedNodeId && selectedNodeIds.size === 1
                ? 'Export node with relationships'
                : selectedNodeIds.size > 1
                ? 'Export selected nodes'
                : 'Export canvas screenshot'
            }
            className="p-2 hover:bg-secondary text-foreground/60 hover:text-foreground rounded transition-colors"
          >
            <Camera size={16} />
          </button>
          <button
            onClick={() => setShortcutsHelpOpen(true)}
            title="Keyboard Shortcuts"
            className="p-2 hover:bg-secondary text-foreground/60 hover:text-foreground rounded transition-colors"
          >
            <Keyboard size={16} />
          </button>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 hover:bg-secondary text-foreground/60 hover:text-foreground rounded transition-colors"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        {/* Folder status badge */}
        {(connectedFolder || ingestStatus) && (
          <button
            onClick={connectedFolder ? handleChangeFolder : undefined}
            title={connectedFolder ? 'Click to change folder' : undefined}
            className={`flex items-center gap-1.5 px-2 py-1 bg-card/80 border border-border rounded text-xs font-mono max-w-[220px] transition-colors outline-none ${
              connectedFolder ? 'cursor-pointer hover:border-blue-500/50 hover:bg-secondary/60 group' : 'cursor-default'
            }`}
          >
            {ingestStatus ? (
              <span className="text-blue-400 truncate font-bold">{ingestStatus}</span>
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
                <span className="text-foreground/40 truncate group-hover:text-blue-400">{connectedFolder}</span>
              </>
            )}
          </button>
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
              className={`px-3 py-1 text-xs uppercase tracking-wider  rounded transition-all ${relationshipMode === mode.id
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
              className={`flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider  rounded transition-all ${edgeHandleType === mode.id
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
              className={`flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider  rounded transition-all ${edgePathType === mode.id
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

      {/* Floating Palette Toggle */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-foreground/40 ml-1">Palette</span>
        <div className="flex bg-card/80 backdrop-blur border border-border rounded p-1 shadow-xs">
          <button
            onClick={() => setPaletteOpen(!isPaletteOpen)}
            title={isPaletteOpen ? "Hide Floating Palette" : "Show Floating Palette"}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider rounded transition-all ${isPaletteOpen
                ? 'bg-amber-600/50 text-foreground shadow-lg'
                : 'text-foreground/40 hover:text-foreground/90'
              }`}
          >
            {isPaletteOpen ? <Zap size={10} /> : <ZapOff size={10} />}
            {isPaletteOpen ? 'Floating' : 'Hidden'}
          </button>
        </div>
      </div>



      <PromptModal
        show={promptConfig.show}
        title={promptConfig.title}
        message={promptConfig.message}
        options={promptConfig.options}
        onConfirm={promptConfig.onConfirm}
        onCancel={() => setPromptConfig(prev => ({ ...prev, show: false }))}
      />

      <ExportPreviewModal
        show={exportTarget !== null}
        onCancel={() => setExportTarget(null)}
        generateImage={async (transparent: boolean) => {
          const canvasElement = document.querySelector('.react-flow') as HTMLElement;
          if (!canvasElement) throw new Error('Canvas element not found');

          const nodes = getNodes();
          const edges = getEdges();
          const bg = transparent ? 'transparent' : (resolvedTheme === 'dark' ? '#09090b' : '#ffffff');
          const options = { format: 'png' as const, backgroundColor: bg, download: false };

          if (exportTarget === 'node' && selectedNodeId) {
            return await exportNodeWithRelationships(canvasElement, nodes, edges, selectedNodeId, options);
          } else if (exportTarget === 'selection' && selectedNodeIds.size > 1) {
            return await exportSelectedNodes(canvasElement, nodes, edges, Array.from(selectedNodeIds), options);
          } else {
            return await exportCanvas(canvasElement, nodes, options);
          }
        }}
      />
    </div>
  );
}
