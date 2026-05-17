'use client';

import * as React from 'react';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '../../lib/hooks/useMediaQuery';

export type SidePullSide = 'left' | 'right' | 'top' | 'bottom';
export type SidePullMode = 'overlay' | 'push';

export interface SidePullProps {
  side: SidePullSide;

  open: boolean;
  onOpenChange: (open: boolean) => void;

  panel: React.ReactNode;
  children: React.ReactNode;

  /** Overlay = Sheet; Push = resizes layout inside wrapper */
  mode?: SidePullMode;
  /** Optional responsive mode: base for mobile, md+ for desktop */
  responsiveMode?: { base: SidePullMode; md: SidePullMode };

  /** Size of the panel (px). For left/right = width, top/bottom = height */
  size?: number;

  /** Edge handle: a thin pull tab */
  showHandle?: boolean;
  handleClassName?: string;
  /** If true, handle sits at the edge of the pushed panel when open (push mode) */
  handleFollowsPanel?: boolean;

  /** Overlay styling */
  blurOverlay?: boolean;
  animate?: boolean;

  className?: string;
  panelClassName?: string;
  contentClassName?: string;
}

export function SidePull({
  side,
  open,
  onOpenChange,
  panel,
  children,
  mode,
  responsiveMode,
  size = 320,
  showHandle = true,
  handleClassName,
  handleFollowsPanel = true,
  blurOverlay = true,
  animate = true,
  className,
  panelClassName,
  contentClassName,
}: SidePullProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const effectiveMode = responsiveMode ? (isDesktop ? responsiveMode.md : responsiveMode.base) : (isDesktop ? 'push' : 'overlay');

  const isHorizontal = side === 'left' || side === 'right';
  const panelStyle: React.CSSProperties = isHorizontal
    ? { width: open ? size : 0 }
    : { height: open ? size : 0 };

  const handleOffsetPx = effectiveMode === 'push' && handleFollowsPanel && open ? size : 0;

  const handleStyle: React.CSSProperties = (() => {
    switch (side) {
      case 'left':
        return { left: handleOffsetPx };
      case 'right':
        return { right: handleOffsetPx };
      case 'top':
        return { top: handleOffsetPx };
      case 'bottom':
        return { bottom: handleOffsetPx };
    }
  })();

  const handleBase = cn(
    'fixed z-40 bg-background/50 backdrop-blur-md hover:bg-background/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40 border-foreground/20 shadow-md transition-all group',
    side === 'left' || side === 'right'
      ? 'top-1/2 -translate-y-1/2 h-32 w-2.5 border-y'
      : 'left-1/2 -translate-x-1/2 w-32 h-2.5 border-x',
    side === 'left' ? 'border-r rounded-r-sm' : '',
    side === 'right' ? 'border-l rounded-l-sm' : '',
    side === 'top' ? 'border-b rounded-b-sm' : '',
    side === 'bottom' ? 'border-t rounded-t-sm' : '',
    handleClassName
  );

  const renderHandle = showHandle ? (
    <button
      type="button"
      aria-label="Toggle panel"
      onClick={() => onOpenChange(!open)}
      className={handleBase}
      style={handleStyle}
    />
  ) : null;

  if (effectiveMode === 'overlay') {
    return (
      <>
        {renderHandle}
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side={side}
            className={cn('p-0', !animate && 'transition-none', className)}
            overlayClassName={cn(!blurOverlay && 'supports-backdrop-filter:backdrop-blur-none', !animate && 'duration-0')}
            showCloseButton={true}
          >
            <div className={cn('h-full w-full', panelClassName)}>{panel}</div>
          </SheetContent>
        </Sheet>
        <div className={cn(contentClassName)}>{children}</div>
      </>
    );
  }

  // push mode
  return (
    <div className={cn('relative h-full w-full', className)}>
      {renderHandle}
      <div className={cn('h-full w-full', isHorizontal ? 'flex' : 'flex flex-col')}
      >
        {(side === 'left' || side === 'top') && (
          <div
            className={cn(
              'shrink-0 border-foreground/10 bg-background',
              open && side === 'top' ? 'overflow-visible' : 'overflow-hidden',
              isHorizontal ? 'border-r' : 'border-b',
              animate && (isHorizontal ? 'transition-[width] duration-200' : 'transition-[height] duration-200')
            )}
            style={panelStyle}
          >
            <div className={cn('h-full w-full', panelClassName)}>{panel}</div>
          </div>
        )}

        <div className={cn('min-w-0 min-h-0 flex-1 overflow-hidden', contentClassName)}>{children}</div>

        {(side === 'right' || side === 'bottom') && (
          <div
            className={cn(
              'shrink-0 border-foreground/10 bg-background',
              open && side === 'bottom' ? 'overflow-visible' : 'overflow-hidden',
              isHorizontal ? 'border-l' : 'border-t',
              animate && (isHorizontal ? 'transition-[width] duration-200' : 'transition-[height] duration-200')
            )}
            style={panelStyle}
          >
            <div className={cn('h-full w-full', panelClassName)}>{panel}</div>
          </div>
        )}
      </div>
    </div>
  );
}
