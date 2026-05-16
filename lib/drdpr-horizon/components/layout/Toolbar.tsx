'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Share2, Anchor, Zap, ZapOff, Cpu, Plus, Compass, Trash2, FolderOpen, CheckCircle2, Loader2, Sun, Moon, Eraser, Keyboard, FileText, Camera, Info, ChevronDown } from 'lucide-react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { ingestFromFileSystem, getStoredFolderHandle, connectAndStoreFolder, verifyPermission, syncFromFileSystem } from '@/lib/drdpr-horizon/lib/ingest-fsa';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { useTheme } from 'next-themes';
import { PromptModal } from '../PromptModal';
import { generateProfessionalWiki } from '@/lib/drdpr-horizon/lib/publish/wikiGenerator';
import { exportCanvas, exportNodeWithRelationships, exportSelectedNodes } from '@/lib/drdpr-horizon/lib/exportCanvas';
import { ExportPreviewModal } from '../ExportPreviewModal';
import { useReactFlow } from '@xyflow/react';
import { useToast } from '@/lib/drdpr-horizon/lib/store/useToastStore';

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
    setPaletteOpen,
    autoSaveEnabled, setAutoSaveEnabled,
    refreshRate, setRefreshRate
  } = useUIStore();
  
  const { setTheme, resolvedTheme } = useTheme();
  const { getNodes, getEdges } = useReactFlow();

  const [isIngesting, setIsIngesting] = useState(false);
  const [showRefreshMenu, setShowRefreshMenu] = useState(false);
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

      let result = await ingestFromFileSystem((msg) => {
        toast({ title: 'Discovery Progress', description: msg, duration: 1000 });
      }, false, true);

      if (result.isProjectRoot) {
        setPromptConfig({
          show: true,
          title: 'WIDE INGESTION WARNING',
          message: `The folder "${handle.name}" contains project files. Ingesting this will index everything. Continue?`,
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

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3">
      {/* 1. SYSTEM ISLAND */}
      <Island>
        <ActionButton
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          icon={mounted && resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          label={mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        />
        <ActionButton
          onClick={() => setShortcutsHelpOpen(true)}
          icon={<Keyboard size={14} />}
          label="Shortcuts"
        />
        <div className="w-px h-3 bg-border/20 mx-0.5" />
        <ActionButton
          onClick={handlePurgeOrphans}
          icon={<Eraser size={14} />}
          label="Clean Database"
          color="text-amber-400/60"
        />
        <ActionButton
          onClick={handleClear}
          disabled={!activeGraphId}
          icon={<Trash2 size={14} />}
          label="Nuke Canvas"
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
              <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity uppercase font-black tracking-widest border border-border/20 pointer-events-none z-[120]">
                {refreshRate > 0 ? `Auto-Pull (${refreshRate}s)` : "Manual Pull"}
              </div>
            </button>
            
            <button
              onClick={() => setShowRefreshMenu(!showRefreshMenu)}
              className={`p-1 -ml-1.5 rounded-full hover:bg-secondary transition-colors z-[110] ${showRefreshMenu ? 'text-green-400' : 'text-foreground/20'}`}
            >
              <ChevronDown size={10} className={`transition-transform duration-300 ${showRefreshMenu ? 'rotate-180' : ''}`} />
            </button>

            {showRefreshMenu && (
              <div className="absolute top-10 left-0 p-2 bg-card/90 backdrop-blur-3xl border border-border/40 rounded-xl shadow-2xl min-w-[120px] animate-in slide-in-from-top-2 fade-in duration-200 z-[120]">
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
                      {rate === 0 ? 'Manual' : `${rate}s Interval`}
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
                  <span className="text-xs font-black uppercase tracking-widest bg-amber-500/20 px-1 rounded">RE-AUTH</span>
                )}
              </div>
            )}
            
            <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover/folder:opacity-100 transition-opacity uppercase font-black tracking-widest border border-border/20 pointer-events-none z-[120]">
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
      <Island>
        <div className="flex bg-secondary/30 rounded-lg p-0.5">
          <ModeButton 
            active={relationshipMode === 'all'} 
            onClick={() => setRelationshipMode('all')} 
            icon={<Share2 size={12} />} 
            label="All" 
          />
          <ModeButton 
            active={relationshipMode === 'selected'} 
            onClick={() => setRelationshipMode('selected')} 
            icon={<Compass size={12} />} 
            label="Selected" 
          />
          <ModeButton 
            active={relationshipMode === 'trace'} 
            onClick={() => setRelationshipMode('trace')} 
            icon={<Anchor size={12} />} 
            label="Trace" 
          />
        </div>

        <div className="w-px h-3 bg-border/20 mx-1" />

        {/* Edge Styles */}
        <div className="flex gap-2">
          <div className="flex bg-secondary/30 rounded-lg p-0.5">
            <ModeButton 
              active={edgeHandleType === 'fixed'} 
              onClick={() => setEdgeHandleType('fixed')} 
              icon={<Anchor size={12} />} 
              label="Fixed" 
            />
            <ModeButton 
              active={edgeHandleType === 'smart'} 
              onClick={() => setEdgeHandleType('smart')} 
              icon={<Zap size={12} className={edgeHandleType === 'smart' ? 'text-purple-400' : ''} />} 
              label="Smart" 
            />
          </div>

          <div className="flex bg-secondary/30 rounded-lg p-0.5">
            <ModeButton 
              active={edgePathType === 'organic'} 
              onClick={() => setEdgePathType('organic')} 
              icon={<Share2 size={12} />} 
              label="Organic" 
            />
            <ModeButton 
              active={edgePathType === 'circuit'} 
              onClick={() => setEdgePathType('circuit')} 
              icon={<Cpu size={12} className={edgePathType === 'circuit' ? 'text-emerald-400' : ''} />} 
              label="Circuit" 
            />
            <ModeButton 
              active={edgePathType === 'smart'} 
              onClick={() => setEdgePathType('smart')} 
              icon={<Compass size={12} className={edgePathType === 'smart' ? 'text-blue-400' : ''} />} 
              label="Avoidance" 
            />
          </div>
        </div>

        <div className="w-px h-3 bg-border/20 mx-1" />

        <ActionButton
          onClick={() => setPaletteOpen(!isPaletteOpen)}
          icon={<ZapOff size={14} className={isPaletteOpen ? 'text-amber-400' : ''} />}
          label={isPaletteOpen ? "Hide Palette" : "Show Palette"}
        />
      </Island>

      {/* 4. OUTPUT ISLAND */}
      <Island>
        <ActionButton
          onClick={() => setExportTarget('canvas')}
          icon={<Camera size={14} />}
          label="Capture Canvas"
        />
        
        <ActionButton
          onClick={handleGenerateWiki}
          disabled={!activeGraphId}
          icon={isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
          label="Publish Wiki"
          color="text-emerald-400"
        />
        
        <div className="w-px h-3 bg-border/20 mx-0.5" />
        
        <Link href="/about" className="p-2 hover:bg-secondary rounded-lg transition-all group relative">
          <Info size={14} className="text-foreground/30 group-hover:text-foreground/60" />
          <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black tracking-widest border border-border/20 pointer-events-none z-[120]">
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
      <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black tracking-widest border border-border/20 pointer-events-none z-[120]">
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
      <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black tracking-widest border border-border/20 pointer-events-none z-[120]">
        {label} Mode
      </div>
    </button>
  );
}
