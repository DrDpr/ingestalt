'use client';

import * as React from 'react';
import { cn } from '@/lib/drdpr-horizon/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useMediaQuery } from '@/lib/drdpr-horizon/lib/hooks/useMediaQuery';

export type ResizableSidebarSide = 'left' | 'right';

export interface ResizableSidebarProps {
  side: ResizableSidebarSide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panel: React.ReactNode;
  children: React.ReactNode;
  
  /** Initial width in pixels (default: 320) */
  defaultWidth?: number;
  /** Min width in pixels (default: 200) */
  minWidth?: number;
  /** Max width in pixels (default: window.innerWidth * 0.99) */
  maxWidth?: number;
  
  /** Threshold percentage (0-1) where sidebar switches from push to overlay (default: 0.75) */
  overlayThreshold?: number;
  
  /** Show resize handle (default: true) */
  showResizeHandle?: boolean;
  
  /** Animation enabled (default: true) */
  animate?: boolean;
  
  className?: string;
  panelClassName?: string;
  contentClassName?: string;
  resizeHandleClassName?: string;
}

export function ResizableSidebar({
  side,
  open,
  onOpenChange,
  panel,
  children,
  defaultWidth = 320,
  minWidth = 200,
  maxWidth,
  overlayThreshold = 0.75,
  showResizeHandle = true,
  animate = true,
  className,
  panelClassName,
  contentClassName,
  resizeHandleClassName,
}: ResizableSidebarProps) {
  const [width, setWidth] = React.useState(defaultWidth);
  const [isDragging, setIsDragging] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const toggleHandle = (
  <button
    type="button"
    title={`${side} sidebar toggle`} // Add title for hover help
    onClick={() => {
      console.log(`Clicking ${side} toggle`); // Add log to verify which is being hit
      onOpenChange(!open);
    }}
    className={cn(
      "fixed z-50 flex items-center justify-center",
      "bg-background/80 backdrop-blur-md hover:bg-background/90",
      "border-foreground/20 shadow-xl transition-all group",
      "top-1/2 -translate-y-1/2 h-32 w-2.5 border",
      side === 'left' ? "border-l-0 rounded-r-md" : "border-r-0 rounded-l-md"
    )}
    style={{
      [side === 'left' ? 'left' : 'right']: open ? `${width}px` : 0,
      transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
    }}
  />
);

  
  // Calculate effective max width
  const effectiveMaxWidth = React.useMemo(() => {
    if (typeof window === 'undefined') return maxWidth || 800;
    return maxWidth || window.innerWidth * 0.99;
  }, [maxWidth]);
  
  // Determine mode based on width percentage
  const widthPercentage = React.useMemo(() => {
    if (typeof window === 'undefined') return 0;
    return width / window.innerWidth;
  }, [width]);
  
  const mode = widthPercentage >= overlayThreshold ? 'overlay' : 'push';
  
  // Handle resize
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  React.useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = side === 'left' 
        ? e.clientX 
        : window.innerWidth - e.clientX;
      
      setWidth(Math.max(minWidth, Math.min(effectiveMaxWidth, newWidth)));
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, side, minWidth, effectiveMaxWidth]);
  
  // Resize handle component
  const resizeHandle = showResizeHandle && open && mode === 'push' && isDesktop ? (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'absolute top-0 bottom-0 w-[1px] cursor-col-resize z-50 group hover:bg-blue-500/20 transition-colors',
        side === 'left' ? 'right-0' : 'left-0',
        isDragging && 'bg-blue-500/50',
        resizeHandleClassName
      )}
      style={{
        [side === 'left' ? 'right' : 'left']: 0,
      }}
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  ) : null;
  
  // Mobile or overlay mode - use Sheet
  if (!isDesktop) {
    return (
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side={side}
            className={cn('p-0 w-full border-none rounded-none', !animate && 'transition-none', className)}
            overlayClassName={cn(!animate && 'duration-200')}
            showCloseButton={true}
            style={{ width: '100%', maxWidth: '100%' }}
          >
            <div className={cn('h-full w-full', panelClassName)}>{panel}</div>
          </SheetContent>
        </Sheet>
        <div className={cn('h-full w-full', contentClassName)}>{children}</div>
      </>
    );
  }
  
  // Desktop push mode
  return (
    <div className={cn('relative h-full w-full', className)}>
      {toggleHandle}
      <div className="h-full w-full flex">
        {side === 'left' && (
        <div
          className={cn(
            'relative shrink-0 overflow-hidden border-r border-border bg-background/90',
            animate && !isDragging && 'transition-[width] duration-200'
          )}
          style={{ width: open ? `${width}px` : 0 }}
        >
          <div className={cn('h-full w-full', panelClassName)} style={{ width: `${width}px` }}>
            {panel}
          </div>
          {resizeHandle}
        </div>
        )}
        
        <div className={cn('min-w-0 flex-1', contentClassName)}>{children}</div>
        
        {side === 'right' && (
          <div
            className={cn(
              'relative shrink-0 overflow-hidden border-l border-border bg-background/90',
              animate && !isDragging && 'transition-[width] duration-200'
            )}
            style={{ width: open ? `${width}px` : 0 }}
          >
            <div className={cn('h-full w-full', panelClassName)} style={{ width: `${width}px` }}>
              {panel}
            </div>
            {resizeHandle}
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
