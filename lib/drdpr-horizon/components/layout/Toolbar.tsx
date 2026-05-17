'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Share2, Anchor, Zap, ZapOff, Cpu, Plus, Compass, Trash2, FolderOpen, CheckCircle2, Loader2, Sun, Moon, Eraser, Keyboard, FileText, Camera, Info, ChevronDown, BookOpen } from 'lucide-react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { ingestFromFileSystem, getStoredFolderHandle, connectAndStoreFolder, verifyPermission, syncFromFileSystem, readFilesFromHandle } from '@/lib/drdpr-horizon/lib/ingest-fsa';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { useTheme } from 'next-themes';
import { PromptModal } from '../PromptModal';
import { generateProfessionalWiki } from '@/lib/drdpr-horizon/lib/publish/wikiGenerator';
import { exportCanvas, exportNodeWithRelationships, exportSelectedNodes } from '@/lib/drdpr-horizon/lib/exportCanvas';
import { ExportPreviewModal } from '../ExportPreviewModal';
import { useReactFlow } from '@xyflow/react';
import { useToast } from '@/lib/drdpr-horizon/lib/store/useToastStore';
import { useMediaQuery } from '@/lib/drdpr-horizon/lib/hooks/useMediaQuery';

export function Toolbar() {
  const {
    relationshipMode, setRelationshipMode,
    edgeHandleType, setEdgeHandleType,
    edgePathType, setEdgePathType,
    setActiveGraphId,
    activeGraphId,
    setShortcutsHelpOpen,
    setGuideOpen,
    selectedNodeIds,
    selectedNodeId,
    clearNodeSelection,
    isPaletteOpen,
    setPaletteOpen,
    autoSaveEnabled, setAutoSaveEnabled,
    refreshRate, setRefreshRate,
    isLeftOpen, isInspectorOpen
  } = useUIStore();
  
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const { setTheme, resolvedTheme } = useTheme();
  const { getNodes, getEdges } = useReactFlow();

  const [isIngesting, setIsIngesting] = useState(false);
  const [showRefreshMenu, setShowRefreshMenu] = useState(false);
  const [showRelationMenu, setShowRelationMenu] = useState(false);
  const [showEdgeMenu, setShowEdgeMenu] = useState(false);
  const [permissionState, setPermissionState] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [exportTarget, setExportTarget] = useState<'node' | 'selection' | 'canvas' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [connectedFolder, setConnectedFolder] = useState<string | null>(null);
  const { toast } = useToast();
  const [promptConfig, setPromptConfig] = useState<{
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

  // --- AUTO-REFRESH HEARTBEAT ---
  useEffect(() => {
    if (refreshRate === 0 || !activeGraphId || isIngesting) return;

    const interval = setInterval(() => {
      if (permissionState === 'granted') {
         handleSyncCurrent();
      }
    }, refreshRate * 1000);

    return () => clearInterval(interval);
  }, [refreshRate, activeGraphId, permissionState, isIngesting]);

  useEffect(() => {
    setMounted(true);
    const checkHandle = async () => {
      const handle = await getStoredFolderHandle();
      if (handle) {
        setConnectedFolder(handle.name);
        const hasPerm = await verifyPermission(handle);
        setPermissionState(hasPerm ? 'granted' : 'prompt');
      }
    };
    checkHandle();
  }, []);

  // Click outside to close all dropdowns
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-trigger') && !target.closest('.dropdown-menu')) {
        setShowRefreshMenu(false);
        setShowRelationMenu(false);
        setShowEdgeMenu(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleIngest = async () => {
    setIsIngesting(true);
    try {
      const handle = await getStoredFolderHandle();
      if (!handle) {
        toast({ title: 'Discovery Failed', description: 'Connect folder first', variant: 'destructive' });
        return;
      }

      const hasPerm = await verifyPermission(handle);
      if (!hasPerm) {
        toast({ title: 'Access Denied', description: 'Authorization required', variant: 'destructive' });
        return;
      }

      let targetWorkspaceId: string;

      if (activeGraphId) {
        const activeGraph = await db.graphs.get(activeGraphId);
        targetWorkspaceId = activeGraph?.workspaceId || activeGraphId;
        toast({ title: 'Scanning Root', description: `Adding docs to ${activeGraph?.name || 'Current'}`, duration: 2000 });
      } else {
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
        toast({ title: 'New Canvas', description: `Initialized workspace for ${handle.name}` });
      }

      // PEEK PHASE
      const files = await readFilesFromHandle(handle);
      if (files.length === 0) {
        toast({ title: 'Discovery Empty', description: 'No markdown files found', variant: 'destructive' });
        return;
      }

      // COLLISION CHECK
      const existingNodes = await db.nodes.where('workspaceId').equals(targetWorkspaceId).toArray();
      const existingFilenames = new Set(existingNodes.map(n => n.payload.filename).filter(Boolean));
      const collisions = files.filter(f => existingFilenames.has(f.filepath));

      if (collisions.length > 0) {
        setPromptConfig({
          show: true,
          title: 'DUPLICATE NODES DETECTED',
          message: `${collisions.length} of the ${files.length} files already exist on this canvas. Do you want to update existing nodes or duplicate them?`,
          type: 'warning',
          options: [
            { label: 'UPDATE EXISTING', value: 'update' },
            { label: 'DUPLICATE ALL', value: 'duplicate' }
          ],
          onConfirm: async (val) => {
            setPromptConfig(prev => ({ ...prev, show: false }));
            setIsIngesting(true);
            try {
              if (val === 'update') {
                const result = await ingestFromFileSystem(() => {}, true, false, undefined, files);
                finalizeIngestion(result, targetWorkspaceId);
              } else {
                const result = await ingestFromFileSystem(() => {}, true, true, undefined, files);
                finalizeIngestion(result, targetWorkspaceId);
              }
            } finally {
              setIsIngesting(false);
            }
          }
        });
        setIsIngesting(false); // Stop the initial "Discovery" loading state while prompting
        return;
      }

      let result = await ingestFromFileSystem((msg) => {
        toast({ title: 'Discovery Progress', description: msg, duration: 1000 });
      }, false, true, undefined, files);

      if (result.isProjectRoot) {
        setPromptConfig({
          show: true,
          title: 'WIDE INGESTION WARNING',
          message: `The folder "${handle.name}" contains project files. Ingesting this will index everything. Continue?`,
          type: 'warning',
          options: [
            { label: 'INGEST ANYWAY', value: 'confirm' },
            { label: 'CANCEL', value: 'cancel' }
          ],
          onConfirm: async (val) => {
            setPromptConfig(prev => ({ ...prev, show: false }));
            if (val === 'confirm') {
              const retryResult = await ingestFromFileSystem(() => {}, true, true);
              finalizeIngestion(retryResult, targetWorkspaceId);
            }
          }
        });
        return;
      }

      await finalizeIngestion(result, targetWorkspaceId);
    } catch (e) {
      console.error('Ingestion error:', e);
      toast({ title: 'Ingestion Error', description: 'Failed to process files', variant: 'destructive' });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleConnect = async () => {
    try {
      const handle = await connectAndStoreFolder();
      if (handle) {
        setConnectedFolder(handle.name);
        setPermissionState('granted');
        toast({ title: 'Project Linked', description: `Connected to ${handle.name}`, variant: 'success' });
      }
    } catch (e) {
      console.error('Connect error:', e);
      toast({ title: 'Connection Failed', variant: 'destructive' });
    }
  };

  const handleVerify = async () => {
    const handle = await getStoredFolderHandle();
    if (!handle) return handleConnect();
    
    const hasPerm = await verifyPermission(handle);
    if (hasPerm) {
      setPermissionState('granted');
      toast({ title: 'Authorized', variant: 'success', duration: 1500 });
    } else {
      toast({ title: 'Authorization Required', description: 'Please click the badge to grant access', variant: 'destructive' });
    }
  };

  const handleSyncCurrent = async () => {
    if (!activeGraphId) return;
    
    setIsIngesting(true);
    try {
      const handle = await getStoredFolderHandle();
      if (!handle) return;

      const activeGraph = await db.graphs.get(activeGraphId);
      if (!activeGraph) return;

      const targetWorkspaceId = activeGraph.workspaceId || activeGraphId;
      const result = await syncFromFileSystem(targetWorkspaceId, (msg) => {
        toast({ title: 'Discovery', description: msg, duration: 3000 });
      });
      
      if (result.count > 0) {
        toast({ 
          title: 'Sync Complete', 
          description: `Updated ${result.count} node${result.count > 1 ? 's' : ''}`, 
          variant: 'success',
          duration: 2000
        });
      }
    } catch (e) {
      toast({ title: 'Sync Failed', variant: 'destructive' });
    } finally {
      setIsIngesting(false);
    }
  };

  const finalizeIngestion = async (result: any, targetWorkspaceId: string) => {
    for (const nodeId of result.nodeIds) {
      await db.nodes.update(nodeId, { workspaceId: targetWorkspaceId });
    }

    const allEdges = await db.edges.toArray();
    const edgesToUpdate = allEdges.filter(e =>
      result.nodeIds.includes(e.sourceId) || result.nodeIds.includes(e.targetId)
    );
    for (const edge of edgesToUpdate) {
      await db.edges.update(edge.id, { workspaceId: targetWorkspaceId });
    }

    toast({ title: 'Ingestion Complete', description: `${result.count} nodes added to canvas`, variant: 'success' });
  };

  const handleChangeFolder = async () => {
    await handleConnect();
  };

  const handleToggleSync = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
  };

  const handleClear = async () => {
    setPromptConfig({
      show: true,
      title: 'CLEAR CANVAS',
      message: 'Are you sure you want to clear all nodes and connections from the current canvas? This cannot be undone.',
      type: 'danger',
      options: [
        { label: 'CLEAR ALL', value: 'confirm', variant: 'danger' },
        { label: 'CANCEL', value: 'cancel' }
      ],
      onConfirm: async (val) => {
        if (val === 'confirm') {
          try {
            const activeGraph = await db.graphs.get(activeGraphId!);
            const targetWorkspaceId = activeGraph?.workspaceId || activeGraphId;
            await db.nodes.where('workspaceId').equals(targetWorkspaceId!).delete();
            await db.edges.where('workspaceId').equals(targetWorkspaceId!).delete();
          } catch (e) {
            console.error('Failed to clear canvas:', e);
          }
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleGenerateWiki = async () => {
    if (!activeGraphId) return;
    setIsGenerating(true);
    try {
      const activeGraph = await db.graphs.get(activeGraphId);
      await generateProfessionalWiki(activeGraphId, activeGraph?.name || 'Graph');
    } finally {
      setIsGenerating(false);
    }
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
        ? `Found ${orphans.length} orphaned nodes from deleted canvases. Purge them?`
        : 'No orphaned nodes found. Your database is clean.',
      type: orphans.length > 0 ? 'warning' : 'success',
      options: orphans.length > 0
        ? [{ label: 'PURGE DATABASE', value: 'confirm', variant: 'danger' }, { label: 'CANCEL', value: 'cancel' }]
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

  if (!isDesktop && (isLeftOpen || isInspectorOpen)) return null;

  return (
    <div className="absolute top-4 md:top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-all duration-200">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 pointer-events-auto max-w-[95vw] px-4">
      {/* 1. SYSTEM ISLAND */}
      <Island>
                

        <ActionButton
          onClick={() => setPaletteOpen(!isPaletteOpen)}
          icon={<ZapOff size={14} className={isPaletteOpen ? 'text-amber-400' : ''} />}
          label={isPaletteOpen ? "Hide Palette" : "Show Palette"}
        />
        <ActionButton
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          icon={mounted && resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          label={mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        />
        <div className="w-px h-3 bg-border/20 mx-0.5" />

        <ActionButton
          onClick={handleClear}
          disabled={!activeGraphId}
          icon={<Trash2 size={14} />}
          label="Clear Canvas"
          color="text-red-400"
        />
      </Island>

      {/* 2. GROUNDING ISLAND */}
      <Island className="px-1.5">
        <div className="flex items-center gap-1 pr-1">
          <ActionButton
            onClick={handleToggleSync}
            disabled={!connectedFolder}
            icon={<Zap size={14} className={autoSaveEnabled ? 'fill-current animate-pulse' : ''} />}
            label={autoSaveEnabled ? "Live Push: Active" : "Enable Live Push"}
            color={autoSaveEnabled ? "text-amber-400 bg-amber-500/10" : "text-foreground/40"}
          />
          
          <div className="relative flex items-center group/sync">
            <button
              onClick={handleSyncCurrent}
              disabled={isIngesting || !activeGraphId}
              className={`p-2 rounded-lg transition-all relative group/btn ${
                activeGraphId ? 'text-green-400/80 hover:text-green-400 hover:bg-green-500/5' : 'text-foreground/20'
              }`}
            >
              <RefreshCw size={14} className={isIngesting || refreshRate > 0 ? 'animate-spin-slow' : ''} />
              
              {/* Tooltip - Adjusted to bottom */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity uppercase tracking-widest border border-border/20 pointer-events-none z-[120]">
                {refreshRate > 0 ? `Auto-Pull (${refreshRate}s)` : "Manual Pull"}
              </div>
            </button>
            
            <button
              onClick={() => setShowRefreshMenu(!showRefreshMenu)}
              className={`dropdown-trigger p-1 -ml-1.5 rounded-full hover:bg-secondary transition-colors z-[110] ${showRefreshMenu ? 'text-green-400' : 'text-foreground/20'}`}
            >
              <ChevronDown size={10} className={`transition-transform duration-300 ${showRefreshMenu ? 'rotate-180' : ''}`} />
            </button>

            {showRefreshMenu && (
              <div className="dropdown-menu absolute top-10 left-0 p-2 bg-card/90 backdrop-blur-3xl border border-border/40 rounded-xl shadow-2xl min-w-[120px] animate-in slide-in-from-top-2 fade-in duration-200 z-[120]">
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-2 ml-1">Pull Interval</h3>
                <div className="flex flex-col gap-1">
                  {[0, 5, 10, 30].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setRefreshRate(rate);
                        setShowRefreshMenu(false);
                      }}
                      className={`px-2 py-1.5 text-xs font-bold rounded-lg text-left transition-colors ${
                        refreshRate === rate ? 'bg-green-500/20 text-green-400' : 'hover:bg-secondary text-foreground/60'
                      }`}
                    >
                      {rate === 0 ? 'Manual' : `Every ${rate}s`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-4 bg-border/20 mx-1" />

        <div className="flex items-center gap-1.5 px-1 pr-2">
          {/* FOLDER CONNECTION / RE-AUTH */}
          <button
            onClick={permissionState === 'granted' ? handleChangeFolder : handleVerify}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 group/folder ${
              permissionState === 'granted' 
                ? 'text-blue-400 hover:bg-blue-500/5' 
                : 'text-amber-400 bg-amber-500/10 animate-pulse'
            }`}
          >
            <FolderOpen size={14} />
            {connectedFolder && (
              <div className="flex items-center gap-2 max-w-[140px]">
                <span className="text-xs font-mono opacity-60 truncate">{connectedFolder}</span>
                {permissionState !== 'granted' && (
                  <span className="text-xs uppercase tracking-widest bg-amber-500/20 px-1 rounded">RE-AUTH</span>
                )}
              </div>
            )}
            
            <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover/folder:opacity-100 transition-opacity uppercase  tracking-widest border border-border/20 pointer-events-none z-[120]">
              {permissionState === 'granted' ? 'Change Project Folder' : 'Re-authorize Access'}
            </div>
          </button>

          <div className="w-px h-3 bg-border/20 mx-0.5" />

          {/* INGEST ACTION */}
          <ActionButton
            onClick={handleIngest}
            disabled={isIngesting || permissionState !== 'granted'}
            icon={<Plus size={14} className={isIngesting ? 'animate-bounce' : ''} />}
            label="Discover New Nodes"
            color="text-blue-400"
          />
        </div>
      </Island>

      {/* 3. VIEW ISLAND */}
      <Island className="px-2">
        {/* Relationship Mode Dropdown */}
        <div className="relative flex items-center">
          <button
            onClick={() => {
              setShowRelationMenu(!showRelationMenu);
              setShowEdgeMenu(false);
              setShowRefreshMenu(false);
            }}
            className={`dropdown-trigger p-1.5 px-2.5 rounded-lg flex items-center gap-2 transition-all hover:bg-secondary text-foreground/75 ${
              showRelationMenu ? 'bg-secondary text-foreground font-semibold' : ''
            }`}
          >
            {relationshipMode === 'all' && <Share2 size={13} />}
            {relationshipMode === 'selected' && <Compass size={13} />}
            {relationshipMode === 'trace' && <Anchor size={13} />}
            <span className="hidden md:inline text-xs uppercase tracking-wider">
              Relations: {relationshipMode}
            </span>
            <span className="inline md:hidden text-xs uppercase tracking-wider">
              {relationshipMode}
            </span>
            <ChevronDown size={11} className={`transition-transform duration-300 ${showRelationMenu ? 'rotate-180' : ''}`} />
          </button>

          {showRelationMenu && (
            <div className="dropdown-menu absolute top-10 left-0 p-2 bg-card/95 backdrop-blur-3xl border border-border/40 rounded-xl shadow-2xl min-w-[150px] animate-in slide-in-from-top-2 fade-in duration-200 z-[120]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 ml-2">Show Relations</h3>
              <div className="flex flex-col gap-1">
                {(['all', 'selected', 'trace'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setRelationshipMode(mode);
                      setShowRelationMenu(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg text-left transition-colors flex items-center gap-2 ${
                      relationshipMode === mode 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-secondary text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {mode === 'all' && <Share2 size={12} />}
                    {mode === 'selected' && <Compass size={12} />}
                    {mode === 'trace' && <Anchor size={12} />}
                    <span className="capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-3 bg-border/20 mx-1" />

        {/* Edge Styling Dropdown */}
        <div className="relative flex items-center">
          <button
            onClick={() => {
              setShowEdgeMenu(!showEdgeMenu);
              setShowRelationMenu(false);
              setShowRefreshMenu(false);
            }}
            className={`dropdown-trigger p-1.5 px-2.5 rounded-lg flex items-center gap-2 transition-all hover:bg-secondary text-foreground/75 ${
              showEdgeMenu ? 'bg-secondary text-foreground font-semibold' : ''
            }`}
          >
            {edgePathType === 'organic' && <Share2 size={13} />}
            {edgePathType === 'circuit' && <Cpu size={13} className="text-emerald-400" />}
            {edgePathType === 'smart' && <Compass size={13} className="text-blue-400" />}
            <span className="hidden md:inline text-xs uppercase tracking-wider">
              Edges: {edgePathType === 'smart' ? 'Avoidance' : edgePathType} ({edgeHandleType})
            </span>
            <span className="inline md:hidden text-xs uppercase tracking-wider">
              {edgePathType === 'smart' ? 'Avoid' : edgePathType} ({edgeHandleType})
            </span>
            <ChevronDown size={11} className={`transition-transform duration-300 ${showEdgeMenu ? 'rotate-180' : ''}`} />
          </button>

          {showEdgeMenu && (
            <div className="dropdown-menu absolute top-10 left-0 p-3 bg-card/95 backdrop-blur-3xl border border-border/40 rounded-xl shadow-2xl min-w-[200px] animate-in slide-in-from-top-2 fade-in duration-200 z-[120]">
              {/* Section 1: Handle Type */}
              <div className="mb-2.5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-1.5 ml-1">Handle Attachment</h3>
                <div className="flex flex-col gap-1">
                  {(['fixed', 'smart'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setEdgeHandleType(type);
                      }}
                      className={`px-2 py-1.5 text-xs font-bold rounded-lg text-left transition-colors flex items-center gap-2 ${
                        edgeHandleType === type 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-secondary text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      {type === 'fixed' && <Anchor size={11} />}
                      {type === 'smart' && <Zap size={11} className="text-purple-400" />}
                      <span className="capitalize">{type} Handles</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/20 my-2" />

              {/* Section 2: Path Type */}
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-1.5 ml-1">Routing Path</h3>
                <div className="flex flex-col gap-1">
                  {(['organic', 'circuit', 'smart'] as const).map((path) => (
                    <button
                      key={path}
                      onClick={() => {
                        setEdgePathType(path);
                      }}
                      className={`px-2 py-1.5 text-xs font-bold rounded-lg text-left transition-colors flex items-center gap-2 ${
                        edgePathType === path 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-secondary text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      {path === 'organic' && <Share2 size={11} />}
                      {path === 'circuit' && <Cpu size={11} className="text-emerald-400" />}
                      {path === 'smart' && <Compass size={11} className="text-blue-400" />}
                      <span>{path === 'smart' ? 'Avoidance' : path.charAt(0).toUpperCase() + path.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Island>

      {/* 4. OUTPUT ISLAND */}
      <Island>
        <ActionButton
          onClick={() => setExportTarget('canvas')}
          icon={<Camera size={14} />}
          label="Capture Canvas"
        />
        
        <Link href="/wiki" className="p-2 hover:bg-secondary rounded-lg transition-all group relative">
          <FileText size={14} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
          <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest border border-border/20 pointer-events-none z-[120]">
            Browse Live Wiki
          </div>
        </Link>

        <ActionButton
          onClick={() => setShortcutsHelpOpen(true)}
          icon={<Keyboard size={14} />}
          label="Shortcuts"
        />
        <ActionButton
          onClick={() => setGuideOpen(true)}
          icon={<BookOpen size={14} />}
          label="User Guide"
        />
        
        <Link href="/about" className="p-2 hover:bg-secondary rounded-lg transition-all group relative">
          <Info size={14} className="text-foreground/30 group-hover:text-foreground/60" />
          <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase  tracking-widest border border-border/20 pointer-events-none z-[120]">
            About Ingestalt
          </div>
        </Link>
      </Island>

      {/* MODALS */}
      <PromptModal
        show={promptConfig.show}
        title={promptConfig.title}
        message={promptConfig.message}
        options={promptConfig.options}
        icon={promptConfig.icon}
        type={promptConfig.type}
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
          
          let graphName = 'Canvas';
          if (activeGraphId) {
             const activeGraph = await db.graphs.get(activeGraphId);
             if (activeGraph?.name) {
                graphName = activeGraph.name.replace(/[<>:"/\\|?*]+/g, '').trim() || 'Canvas';
             }
          }
          
          const options = { format: 'png' as const, backgroundColor: bg, download: false };

          if (exportTarget === 'node' && selectedNodeId) {
            return await exportNodeWithRelationships(canvasElement, nodes, edges, selectedNodeId, options);
          } else if (exportTarget === 'selection' && selectedNodeIds.size > 1) {
            return await exportSelectedNodes(canvasElement, nodes, edges, Array.from(selectedNodeIds), { ...options, filename: `${graphName} (Selection)` });
          } else {
            return await exportCanvas(canvasElement, nodes, { ...options, filename: graphName });
          }
        }}
      />
      </div>
    </div>
  );
}

function Island({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 p-1 bg-card/60 backdrop-blur-2xl border border-border/40 rounded-xl shadow-md ${className}`}>
      {children}
    </div>
  );
}

function ActionButton({ 
  onClick, 
  icon, 
  label, 
  color = "text-foreground/60", 
  disabled = false 
}: { 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string, 
  color?: string, 
  disabled?: boolean 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 hover:bg-secondary rounded-lg transition-all group relative disabled:opacity-20 ${color}`}
    >
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase  tracking-widest border border-border/20 pointer-events-none z-[120]">
        {label}
      </div>
    </button>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 px-2.5 rounded-lg flex items-center gap-2 transition-all group relative ${
        active 
          ? 'bg-background shadow-sm text-foreground' 
          : 'text-foreground/30 hover:text-foreground/60'
      }`}
    >
      {icon}
      <span className="text-xs font-black uppercase tracking-tighter">{label}</span>
      
      {/* Tooltip for small icon buttons - Adjusted to bottom */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase  tracking-widest border border-border/20 pointer-events-none z-[120]">
        {label} Mode
      </div>
    </button>
  );
}
