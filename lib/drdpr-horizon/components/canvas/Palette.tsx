'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/drdpr-horizon/lib/db';
import { DynamicIcon } from '@/lib/drdpr-horizon/components/DynamicIcon';
import { Plus, GripHorizontal, FolderOpen, Zap, ZapOff, CheckCircle2, Upload } from 'lucide-react';
import { useSync } from '@/lib/drdpr-horizon/lib/hooks/useSync';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { getStoredFolderHandle, connectAndStoreFolder, verifyPermission } from '@/lib/drdpr-horizon/lib/ingest-fsa';

export function Palette() {
  const { autoSaveEnabled, setAutoSaveEnabled, isLeftOpen, isPaletteOpen } = useUIStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [connectedFolder, setConnectedFolder] = React.useState<string | null>(null);
  const [permissionState, setPermissionState] = React.useState<'granted' | 'prompt' | 'denied'>('prompt');

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

  const availableTypes = React.useMemo(() => {
    if (!activeStandards) return [];
    const types: any[] = [];
    const seen = new Set<string>();

    activeStandards.forEach(s => {
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
  }, [activeStandards]);

  const onDragStart = (event: React.DragEvent, nodeType: string, configId: string) => {
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
      <div className="flex flex-col items-center gap-1 pb-2 border-b border-border/5 mb-2">
        <Plus size={14} className="text-foreground/30" />
        <span className="text-xs uppercase font-black tracking-tighter text-foreground/40 text-center leading-[0.8]">Palette</span>
      </div>

      <div className="flex flex-col gap-3">
        {availableTypes.map((type) => (
          <div
            key={type.id}
            draggable
            onDragStart={(e) => onDragStart(e, type.type || type.id, type.id)}
            onMouseDown={(e) => e.stopPropagation()}
            className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-secondary/50 border border-border/5 hover:border-border/20 hover:bg-secondary-700/50 transition-all cursor-grab active:cursor-grabbing shadow-xs"
          >
            <DynamicIcon
              name={type.icon || 'Box'}
              size={20}
              style={{ color: type.color || '#a3a3a3' }}
              className="group-hover:scale-110 transition-transform"
            />

            {/* Tooltip */}
            <div className="absolute left-16 px-3 py-1.5 rounded-lg bg-background/50 backdrop-blur-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 border border-border/10 uppercase tracking-widest translate-x-2 group-hover:translate-x-0 shadow-xs z-[60]">
              {(type.label || type.title || type.type || type.id.split('_')[0]).replace(/_/g, ' ')}
            </div>

            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-card rounded-full flex items-center justify-center border border-border/5">
              <GripHorizontal size={8} className="text-foreground/40" />
            </div>
          </div>
        ))}
      </div>

      {availableTypes.length === 0 && (
        <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-dashed border-border/5 flex items-center justify-center">
          <span className="text-xs text-foreground/40 text-xs uppercase font-bold">Empty</span>
        </div>
      )}
    </div>
  );
}
