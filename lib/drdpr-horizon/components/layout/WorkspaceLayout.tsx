'use client';

import React from 'react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { AppShell } from './AppShell';
import { SpatialSidebar } from './SpatialSidebar';
import { Toaster } from '@/lib/drdpr-horizon/components/ui/Toaster';
import { cn } from '@/lib/drdpr-horizon/lib/utils';

import { useMediaQuery } from '@/lib/drdpr-horizon/lib/hooks/useMediaQuery';

/**
 * WorkspaceLayout - Main layout using AppShell with ResizableSidebar
 *
 * Replaces RGL with smooth resizable sidebars:
 * - Left: SpatialSidebar (Palette, Perspectives, Entities)
 * - Right: Inspector (opens when node selected)
 * - Top: Floating Toolbar (collapsible via show/hide badge)
 * - Auto-switches push/overlay at 75% width
 */
export function WorkspaceLayout({
  canvas,
  inspector,
  toolbar,
  children
}: {
  canvas: React.ReactNode;
  inspector: React.ReactNode;
  toolbar?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const isInspectorOpen = useUIStore((state) => state.isInspectorOpen);
  const setInspectorOpen = useUIStore((state) => state.setInspectorOpen);
  const isToolbarOpen = useUIStore((state) => state.isToolbarOpen);
  const setToolbarOpen = useUIStore((state) => state.setToolbarOpen);
  const isLeftOpen = useUIStore((state) => state.isLeftOpen);
  const setLeftOpen = useUIStore((state) => state.setLeftOpen);

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const prevLeftOpen = React.useRef(isLeftOpen);
  const prevInspectorOpen = React.useRef(isInspectorOpen);

  React.useEffect(() => {
    if (!isDesktop) {
      if (isLeftOpen && !prevLeftOpen.current && isInspectorOpen) {
        setInspectorOpen(false);
      } else if (isInspectorOpen && !prevInspectorOpen.current && isLeftOpen) {
        setLeftOpen(false);
      }
    }
    prevLeftOpen.current = isLeftOpen;
    prevInspectorOpen.current = isInspectorOpen;
  }, [isLeftOpen, isInspectorOpen, isDesktop, setLeftOpen, setInspectorOpen]);
  
  return (
    <div className="relative h-screen w-screen overflow-hidden">
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
        <div className="relative w-full h-full overflow-hidden">
          {canvas}
          {children}

          {/* Floating Toolbar wrapper */}
          <div 
            className={cn(
              "absolute top-0 left-0 right-0 z-[100] transition-all duration-300 pointer-events-none",
              isToolbarOpen ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"
            )}
          >
            {toolbar}
          </div>

          {/* Floating Toggle Handle */}
          <div className="absolute top-0 left-0 right-0 z-[101] flex justify-center pointer-events-none">
            <button
              onClick={() => setToolbarOpen(!isToolbarOpen)}
              className="pointer-events-auto w-32 h-2.5 bg-card/60 backdrop-blur-md hover:bg-card/90 border-x border-b border-border/20 rounded-b-md shadow-sm transition-all focus:outline-none cursor-pointer flex items-center justify-center group"
              title={isToolbarOpen ? "Hide Toolbar" : "Show Toolbar"}
            >
              <div className="w-8 h-0.5 bg-foreground/15 rounded-full group-hover:bg-foreground/35 transition-all duration-300" />
            </button>
          </div>
        </div>
      </AppShell>

      <Toaster />
    </div>
  );
}
