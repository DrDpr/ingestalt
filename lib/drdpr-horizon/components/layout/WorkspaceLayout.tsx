'use client';

import React from 'react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { AppShell } from './AppShell';
import { SpatialSidebar } from './SpatialSidebar';
import { SidePull } from '@/lib/drdpr-horizon/components/ui/side-pull';

/**
 * WorkspaceLayout - Main layout using AppShell with ResizableSidebar
 *
 * Replaces RGL with smooth resizable sidebars:
 * - Left: SpatialSidebar (Palette, Perspectives, Entities)
 * - Right: Inspector (opens when node selected)
 * - Top: Toolbar (collapsible SidePull)
 * - Auto-switches push/overlay at 75% width
 */
export function WorkspaceLayout({
  canvas,
  inspector,
  toolbar,
}: {
  canvas: React.ReactNode;
  inspector: React.ReactNode;
  toolbar?: React.ReactNode;
}) {
  const isInspectorOpen = useUIStore((state) => state.isInspectorOpen);
  const setInspectorOpen = useUIStore((state) => state.setInspectorOpen);
  const isToolbarOpen = useUIStore((state) => state.isToolbarOpen);
  const setToolbarOpen = useUIStore((state) => state.setToolbarOpen);
  const isLeftOpen = useUIStore((state) => state.isLeftOpen);
  const setLeftOpen = useUIStore((state) => state.setLeftOpen);
  
  return (
    <SidePull
      side="top"
      open={isToolbarOpen}
      onOpenChange={setToolbarOpen}
      panel={toolbar}
      mode="push"
      size={100}
      showHandle={true}
      handleFollowsPanel={true}
      animate={true}
      className="h-screen w-screen"
      panelClassName="bg-background"
    >
      <AppShell
        toolbar={null}
        leftSidebar={{
          side: 'left',
          open: isLeftOpen,
          defaultWidth: 288, // 72 * 4 = 288px (w-72)
          minWidth: 250,
          maxWidth: 1700, // No limit
          content: <SpatialSidebar />,
        }}
        rightSidebar={{
          side: 'right',
          open: isInspectorOpen,
          defaultWidth: 400,
          minWidth: 450,
          maxWidth: 1700,
          content: inspector,
        }}
        onLeftSidebarChange={setLeftOpen}
        onRightSidebarChange={setInspectorOpen}
      >
        {canvas}
      </AppShell>
    </SidePull>
  );
}
