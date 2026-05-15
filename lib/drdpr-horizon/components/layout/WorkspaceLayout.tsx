'use client';

import { useState, useEffect, useMemo } from 'react';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import { useUIStore } from '@/lib/store/useUIStore';
import { LayoutDashboard, FileText } from 'lucide-react';
import React from 'react';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Static layout configs – defined outside component so they are never re-created
const LAYOUTS_OPEN = {
  lg:  [{ i: 'canvas', x: 0, y: 0, w: 8,  h: 1 }, { i: 'inspector', x: 8, y: 0, w: 4, h: 1 }],
  md:  [{ i: 'canvas', x: 0, y: 0, w: 8,  h: 1 }, { i: 'inspector', x: 8, y: 0, w: 4, h: 1 }],
  sm:  [{ i: 'canvas', x: 0, y: 0, w: 8,  h: 1 }, { i: 'inspector', x: 8, y: 0, w: 4, h: 1 }],
  xs:  [{ i: 'canvas', x: 0, y: 0, w: 8,  h: 1 }, { i: 'inspector', x: 8, y: 0, w: 4, h: 1 }],
  xxs: [{ i: 'canvas', x: 0, y: 0, w: 12, h: 1 }, { i: 'inspector', x: 0, y: 1, w: 12, h: 1 }],
};

const LAYOUTS_CLOSED = {
  lg:  [{ i: 'canvas', x: 0, y: 0, w: 12, h: 1 }, { i: 'inspector', x: 12, y: 0, w: 0, h: 1 }],
  md:  [{ i: 'canvas', x: 0, y: 0, w: 12, h: 1 }, { i: 'inspector', x: 12, y: 0, w: 0, h: 1 }],
  sm:  [{ i: 'canvas', x: 0, y: 0, w: 12, h: 1 }, { i: 'inspector', x: 12, y: 0, w: 0, h: 1 }],
  xs:  [{ i: 'canvas', x: 0, y: 0, w: 12, h: 1 }, { i: 'inspector', x: 12, y: 0, w: 0, h: 1 }],
  xxs: [{ i: 'canvas', x: 0, y: 0, w: 12, h: 1 }, { i: 'inspector', x: 12, y: 0, w: 0, h: 1 }],
};

const COLS = { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 };
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const MARGIN: [number, number] = [8, 8];

export function WorkspaceLayout({
  canvas,
  inspector,
}: {
  canvas: React.ReactNode;
  inspector: React.ReactNode;
}) {
  const isInspectorOpen = useUIStore((state) => state.isInspectorOpen);
  const { width, containerRef, mounted } = useContainerWidth();
  const [rowHeight, setRowHeight] = useState(800);

  useEffect(() => {
    const updateHeight = () => {
      // 100vh - topbar (56px) - outer padding (8px top + 8px bottom) - row margin (8px)
      setRowHeight(window.innerHeight - 56 - 16 - 8);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const layouts = useMemo(() => isInspectorOpen ? LAYOUTS_OPEN : LAYOUTS_CLOSED, [isInspectorOpen]);

  if (!mounted) {
    return (
      <div ref={containerRef} className="w-full h-screen bg-neutral-950 p-2 pt-14 overflow-hidden" />
    );
  }

  return (
    <div ref={containerRef} className="w-full h-screen bg-neutral-950 p-2 pt-14 overflow-hidden">
      {width > 0 && (
        <Responsive
          className="layout"
          layouts={layouts}
          cols={COLS}
          breakpoints={BREAKPOINTS}
          width={width}
          rowHeight={rowHeight}
          isBounded={true}
          draggableHandle=".drag-handle"
          margin={MARGIN}
          isResizable={true}
        >
          {/* Canvas panel – always mounted to prevent width caching bugs */}
          <div
            key="canvas"
            className="bg-neutral-900 border border-neutral-800/50 rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300"
          >
            <div className="drag-handle w-full h-9 bg-neutral-800/30 cursor-grab active:cursor-grabbing flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={14} className="text-blue-500" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-neutral-500">Architecture Canvas</span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-neutral-800" />
                <div className="w-2 h-2 rounded-full bg-neutral-800" />
              </div>
            </div>
            <div className="flex-1 relative bg-[#050505] min-h-0">
              {canvas}
            </div>
          </div>

          {/* Inspector panel – always mounted, hidden via CSS visibility.
              This ensures RGL's internal cache remains stable when toggling widths. */}
          <div
            key="inspector"
            className="bg-neutral-900 border border-neutral-800/50 rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300"
            style={{ 
              visibility: isInspectorOpen ? 'visible' : 'hidden', 
              pointerEvents: isInspectorOpen ? 'auto' : 'none',
              opacity: isInspectorOpen ? 1 : 0 
            }}
          >
            <div className="drag-handle w-full h-9 bg-neutral-800/30 cursor-grab active:cursor-grabbing flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-purple-500" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-neutral-500">Document Inspector</span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-neutral-800" />
                <div className="w-2 h-2 rounded-full bg-neutral-800" />
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-[#080808] min-h-0">
              {inspector}
            </div>
          </div>
        </Responsive>
      )}
    </div>
  );
}
