'use client';

import React from 'react';
import { WorkspaceLayout } from '@/lib/drdpr-horizon/components/layout/WorkspaceLayout';
import { HorizonCanvas } from '@/lib/drdpr-horizon/components/canvas/HorizonCanvas';
import { Inspector } from '@/lib/drdpr-horizon/components/inspector/Inspector';
import { Toolbar } from '@/lib/drdpr-horizon/components/layout/Toolbar';
import { ReactFlowProvider } from '@xyflow/react';

/**
 * Canvas Page - Spatial Graph IDE
 *
 * Architecture:
 * - AppShell wrapper with ResizableSidebar (replaces RGL)
 * - Left: SpatialSidebar (Palette, Perspectives, Entities)
 * - Center: HorizonCanvas (infinite canvas)
 * - Right: Inspector (node editor, opens on selection)
 * - Top: Toolbar (ingest, sync, view controls)
 *
 * Data Flow:
 * - IndexedDB via Dexie
 * - Zustand for UI state
 * - EventBus + SyncManager for sync
 */
export default function CanvasPage() {
  const canvasComponent = React.useMemo(() => (
    <ReactFlowProvider>
      <HorizonCanvas />
    </ReactFlowProvider>
  ), []);
  
  const inspectorComponent = React.useMemo(() => <Inspector />, []);
  const toolbarComponent = React.useMemo(() => <Toolbar />, []);

  return (
    <WorkspaceLayout
      canvas={canvasComponent}
      inspector={inspectorComponent}
      toolbar={toolbarComponent}
    />
  );
}
