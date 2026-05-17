'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { DynamicIcon } from '@/lib/drdpr-horizon/components/DynamicIcon';
import { Plus, GripHorizontal, FolderOpen, Zap, ZapOff, CheckCircle2, Upload, ChevronRight, Check } from 'lucide-react';
import { useSync } from '@/lib/drdpr-horizon/lib/hooks/useSync';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { getStoredFolderHandle, connectAndStoreFolder, verifyPermission } from '@/lib/drdpr-horizon/lib/ingest-fsa';

export function Palette() {
  const { autoSaveEnabled, setAutoSaveEnabled, isLeftOpen, isPaletteOpen, activeGraphId } = useUIStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  
  const [connectedFolder, setConnectedFolder] = React.useState<string | null>(null);
  const [permissionState, setPermissionState] = React.useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
  const [listHeight, setListHeight] = React.useState<number | 'auto'>('auto');
  const [hoveredType, setHoveredType] = React.useState<any | null>(null);
  const [tooltipCoords, setTooltipCoords] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [enabledWorkspaces, setEnabledWorkspaces] = React.useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('palette_enabled_workspaces');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // Sync folder status on mount
  React.useEffect(() => {
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

  const handleConnect = async () => {
    const handle = await connectAndStoreFolder();
    if (handle) {
      setConnectedFolder(handle.name);
      setPermissionState('granted');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      window.dispatchEvent(new CustomEvent('import-file', { detail: { file } }));
    }
    // Reset so the same file can be imported twice if needed
    e.target.value = '';
  };

  const activeStandards = useLiveQuery(
    () => db.nodes.toArray().then(nodes => nodes.filter(n => n.payload?.type === 'standards')),
    []
  );

  const activeGraph = useLiveQuery(async () => {
    if (!activeGraphId) return null;
    return await db.graphs.get(activeGraphId);
  }, [activeGraphId]);

  const allGraphs = useLiveQuery(
    () => db.graphs.toArray(),
    []
  );

  const workspaceFilter = activeGraph?.workspaceId || activeGraphId;

  // Compile a list of unique workspaces that contain standard nodes
  const uniqueStandardsWorkspaceIds = React.useMemo(() => {
    if (!activeStandards) return [];
    const ids = new Set<string>();
    activeStandards.forEach(s => {
      if (s.workspaceId) ids.add(s.workspaceId);
    });
    return Array.from(ids);
  }, [activeStandards]);

  // Map workspace IDs to graph names
  const getWorkspaceName = React.useCallback((wsId: string) => {
    if (wsId === workspaceFilter) {
      return `${activeGraph?.name || 'Current'} (Active)`;
    }
    const match = allGraphs?.find(g => g.workspaceId === wsId || g.id === wsId);
    if (match) return match.name;
    return wsId.replace(/^workspace_/, '').replace(/_/g, ' ');
  }, [allGraphs, workspaceFilter, activeGraph]);

  const toggleWorkspace = (wsId: string) => {
    setEnabledWorkspaces(prev => {
      const next = { ...prev };
      const currentVal = next[wsId] !== false;
      next[wsId] = !currentVal;
      
      localStorage.setItem('palette_enabled_workspaces', JSON.stringify(next));
      return next;
    });
  };

  const availableTypes = React.useMemo(() => {
    if (!activeStandards) return [];
    const types: any[] = [];
    const seen = new Set<string>();

    activeStandards.forEach(s => {
      const wsId = s.workspaceId;
      // Skip if workspace is explicitly disabled
      const isEnabled = enabledWorkspaces[wsId] !== false;
      if (!isEnabled) {
        return;
      }

      if (s.payload?.definitions) {
        s.payload.definitions.forEach((def: any) => {
          // Use definition ID as unique key, skip duplicates
          if (!seen.has(def.id)) {
            seen.add(def.id);
            types.push(def);
          }
        });
      }
    });
    return types;
  }, [activeStandards, enabledWorkspaces]);

  // Measure content scrollHeight to drive height transition
  React.useEffect(() => {
    if (listRef.current) {
      const height = listRef.current.scrollHeight;
      // Constrain height if too many are registered (max 320px)
      const constrainedHeight = Math.min(height, 320);
      setListHeight(constrainedHeight);
    }
  }, [availableTypes]);

  const onDragStart = (event: React.DragEvent, nodeType: string, configId: string) => {
    setHoveredType(null);
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/horizon-config', configId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const isVisible = !isLeftOpen && isPaletteOpen;

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-2 bg-card/40 backdrop-blur-2xl border border-border/10 rounded-2xl shadow-md transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'
        }`}
    >
      <div className="flex flex-col items-center gap-1 pb-2 border-b border-border/5 mb-2 relative">
        {/* Sleek Rotating Chevrolet Button */}
        <div className="group relative flex items-center justify-center">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center justify-center p-1.5 rounded-lg hover:bg-secondary/40 border border-transparent hover:border-border/10 transition-all ${
              showFilterDropdown ? 'text-blue-400 bg-secondary/30 border-border/10' : 'text-foreground/30'
            }`}
          >
            <ChevronRight size={14} className={`transition-transform duration-300 ${showFilterDropdown ? 'rotate-180 text-blue-400' : ''}`} />
          </button>
          
          {/* Custom Tooltip */}
          <div className="absolute left-10 px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest border border-border/20 pointer-events-none z-[120] shadow-md translate-x-2 group-hover:translate-x-0 transition-all duration-200">
            Filter Canvases
          </div>
        </div>
        <span className="text-xs uppercase font-black tracking-tighter text-foreground/40 text-center leading-[0.8] mb-1">Palette</span>

        {/* Dynamic Checklist Dropdown */}
        {showFilterDropdown && (
          <div 
            className="absolute left-14 top-2 z-[70] w-56 p-3 bg-background/95 backdrop-blur-md border border-border/10 rounded-xl shadow-lg flex flex-col gap-2 transition-all duration-200"
            onMouseLeave={() => setShowFilterDropdown(false)}
          >
            <div className="text-xs uppercase font-black tracking-widest text-foreground/30 border-b border-border/5 px-1 pb-1.5 mb-1 flex items-center justify-between">
              <span>Filter Standards</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold font-mono">
                {uniqueStandardsWorkspaceIds.length} Canvases
              </span>
            </div>
            
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
              {uniqueStandardsWorkspaceIds.map((wsId) => {
                const isEnabled = enabledWorkspaces[wsId] !== false;
                const name = getWorkspaceName(wsId);
                const isCurrent = wsId === workspaceFilter;
                
                return (
                  <button
                    key={wsId}
                    onClick={() => toggleWorkspace(wsId)}
                    className={`group/item flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left text-xs transition-all border ${
                      isEnabled 
                        ? 'bg-blue-500/[0.03] text-foreground border-blue-500/10' 
                        : 'text-foreground/40 hover:bg-secondary/10 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                        isEnabled 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-border/30 group-hover/item:border-border/60'
                      }`}>
                        {isEnabled && <Check size={10} strokeWidth={4} />}
                      </div>
                      <span className={`truncate ${isCurrent ? 'font-black text-blue-400' : ''}`}>
                        {name}
                      </span>
                    </div>
                  </button>
                );
              })}
              
              {uniqueStandardsWorkspaceIds.length === 0 && (
                <div className="text-xs text-foreground/30 text-center py-4 uppercase font-bold tracking-tight">
                  No standards found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Animated Height Wrapper with Smooth Vertical Breathing */}
      <div 
        style={{ height: typeof listHeight === 'number' ? `${listHeight}px` : 'auto' }}
        className="transition-[height] duration-500 ease-in-out overflow-y-auto overflow-x-hidden pr-0.5 scrollbar-none scroll-smooth"
      >
        <div ref={listRef} className="flex flex-col gap-3 py-0.5">
          {availableTypes.map((type) => (
            <div
              key={type.id}
              draggable
              onDragStart={(e) => onDragStart(e, type.type || type.id, type.id)}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredType(type);
                setTooltipCoords({
                  top: rect.top + rect.height / 2,
                  left: rect.right + 10,
                });
              }}
              onMouseLeave={() => {
                setHoveredType(null);
              }}
              className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-secondary/50 border border-border/5 hover:border-border/20 hover:bg-secondary-700/50 transition-all cursor-grab active:cursor-grabbing shadow-xs"
            >
              <DynamicIcon
                name={type.icon || 'Box'}
                size={20}
                style={{ color: type.color || '#a3a3a3' }}
                className="group-hover:scale-110 transition-transform"
              />

              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-card rounded-full flex items-center justify-center border border-border/5">
                <GripHorizontal size={8} className="text-foreground/40" />
              </div>
            </div>
          ))}

          {availableTypes.length === 0 && (
            <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-dashed border-border/10 flex items-center justify-center">
              <span className="text-xs text-foreground/30 uppercase font-black tracking-tighter">Empty</span>
            </div>
          )}
        </div>
      </div>

      {hoveredType && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${tooltipCoords.top}px`,
            left: `${tooltipCoords.left}px`,
            transform: 'translateY(-50%)',
          }}
          className="px-3 py-1.5 rounded-lg bg-background/95 backdrop-blur-md text-xs text-foreground border border-border/20 uppercase tracking-widest shadow-lg z-[9999] pointer-events-none animate-in fade-in slide-in-from-left-1 duration-150 flex flex-col gap-0.5"
        >
          <span className="font-semibold text-xs text-foreground/80">
            {(hoveredType.label || hoveredType.title || hoveredType.type || hoveredType.id.split('_')[0]).replace(/_/g, ' ')}
          </span>
          {hoveredType.description && (
            <span className="text-xs text-foreground/50 lowercase tracking-normal font-medium leading-tight max-w-[200px] break-words">
              {hoveredType.description}
            </span>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
