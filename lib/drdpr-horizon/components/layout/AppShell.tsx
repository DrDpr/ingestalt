'use client';

import * as React from 'react';
import { cn } from '@/lib/drdpr-horizon/lib/utils';
import { ResizableSidebar } from '@/lib/drdpr-horizon/components/ui/resizable-sidebar';

export interface SidebarConfig {
  side: 'left' | 'right';
  open: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  content: React.ReactNode;
}

export interface AppShellProps {
  /** Left sidebar configuration */
  leftSidebar?: SidebarConfig;
  /** Right sidebar configuration */
  rightSidebar?: SidebarConfig;
  /** Main content */
  children: React.ReactNode;
  /** Top toolbar/header */
  toolbar?: React.ReactNode;
  /** Callbacks for sidebar state changes */
  onLeftSidebarChange?: (open: boolean) => void;
  onRightSidebarChange?: (open: boolean) => void;
  /** Styling */
  className?: string;
  toolbarClassName?: string;
  contentClassName?: string;
}

/**
 * AppShell - Main layout wrapper with resizable sidebars
 * 
 * Handles dual sidebars (left + right) with automatic push/overlay switching.
 * Sidebars push content when < 75% width, overlay when >= 75%.
 * 
 * @example
 * <AppShell
 *   leftSidebar={{
 *     side: 'left',
 *     open: isLeftOpen,
 *     defaultWidth: 320,
 *     content: <Palette />
 *   }}
 *   rightSidebar={{
 *     side: 'right',
 *     open: inspectorOpen,
 *     defaultWidth: 400,
 *     content: <Inspector />
 *   }}
 *   toolbar={<Toolbar />}
 * >
 *   <Canvas />
 * </AppShell>
 */
export function AppShell({
  leftSidebar,
  rightSidebar,
  children,
  toolbar,
  onLeftSidebarChange,
  onRightSidebarChange,
  className,
  toolbarClassName,
  contentClassName,
}: AppShellProps) {
  // Wrap content with sidebars
  let content = children;
  
  // Apply right sidebar first (innermost)
  if (rightSidebar) {
    content = (
      <ResizableSidebar
        side="right"
        open={rightSidebar.open}
        onOpenChange={onRightSidebarChange || (() => {})}
        defaultWidth={rightSidebar.defaultWidth}
        minWidth={rightSidebar.minWidth}
        maxWidth={rightSidebar.maxWidth}
        panel={rightSidebar.content}
        panelClassName="h-full overflow-hidden"
        contentClassName="h-full overflow-hidden"
      >
        {content}
      </ResizableSidebar>
    );
  }
  
  // Apply left sidebar (outermost)
  if (leftSidebar) {
    content = (
      <ResizableSidebar
        side="left"
        open={leftSidebar.open}
        onOpenChange={onLeftSidebarChange || (() => {})}
        defaultWidth={leftSidebar.defaultWidth}
        minWidth={leftSidebar.minWidth}
        maxWidth={leftSidebar.maxWidth}
        panel={leftSidebar.content}
        panelClassName="h-full overflow-hidden"
        contentClassName="h-full overflow-hidden"
      >
        {content}
      </ResizableSidebar>
    );
  }
  
  return (
    <div className={cn('h-screen w-screen flex flex-col overflow-hidden bg-background', className)}>
      {toolbar && (
        <div className={cn('shrink-0 border-b border-foreground/10', toolbarClassName)}>
          {toolbar}
        </div>
      )}
      <div className={cn('flex-1 overflow-hidden', contentClassName)}>
        {content}
      </div>
    </div>
  );
}

/**
 * Hook to manage sidebar state
 */
export function useSidebarState(initialOpen = false) {
  const [open, setOpen] = React.useState(initialOpen);
  
  const toggle = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);
  
  const close = React.useCallback(() => {
    setOpen(false);
  }, []);
  
  const openSidebar = React.useCallback(() => {
    setOpen(true);
  }, []);
  
  return {
    open,
    setOpen,
    toggle,
    close,
    openSidebar,
  };
}

// Made with Bob
