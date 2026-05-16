import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { db } from '@/lib/drdpr-horizon/lib/db';

export interface BaseNodeProps {
  id: string;
  data: any;
  icon: React.ReactNode;
  colorClass: string;
  isStatic?: boolean;
  style?: React.CSSProperties;
}

function BaseNodeInner({ id, data, icon, colorClass, isStatic, style }: BaseNodeProps) {
  const { selectedNodeId, selectedNodeIds, hoveredNodeId, highlightNodeId } = useUIStore();
  const isPrimary = !isStatic && selectedNodeId === id; // primary = inspector open
  const isInMultiSelect = !isStatic && selectedNodeIds.has(id);
  const isHighlighted = highlightNodeId === id;
  const isSelected = isPrimary || isInMultiSelect;
  const isHovered = hoveredNodeId === id || hoveredNodeId === data.id;
  const nodeColor = data.color || '#52525b';


  return (
    <div 
      className={cn(
        "group relative rounded-2xl border p-4 min-w-[200px] shadow-xl backdrop-blur-xl transition-all duration-300",
        colorClass,
        isHovered && "scale-110 shadow-[0_0_30px_rgba(59,130,246,0.5)] z-50",
        isHighlighted && "animate-pulse ring-4 ring-offset-4 ring-blue-500/50"
      )}
      style={{
        ...style,
        // Highlight logic (takes precedence over selection)
        ...(isHighlighted && {
          outline: '4px solid #3b82f6',
          outlineOffset: '8px',
          transform: 'scale(1.1)',
          boxShadow: '0 0 50px rgba(59,130,246,0.5)',
          zIndex: 100,
        }),
        // Primary selection: bright ring with node's own color + glow
        ...(isPrimary && !isHovered && !isHighlighted && {
          outline: `2px solid ${nodeColor}`,
          outlineOffset: '3px',
          boxShadow: `0 0 16px ${nodeColor}60`,
          transform: 'scale(1.05)',
        }),
        // Multi-select (not primary): softer ring with node color
        ...(!isPrimary && isInMultiSelect && !isHovered && {
          outline: `2px dashed ${nodeColor}99`,
          outlineOffset: '3px',
        }),
        // Hover: blue glow override
        ...(isHovered && {
          outline: '2px solid #3b82f6',
          outlineOffset: '3px',
          borderColor: '#60a5fa80',
        }),
      }}
    >

      {!isStatic && <Handle type="target" position={Position.Top} id="t" className="w-2 h-2 !bg-white/10 border-none opacity-0 hover:opacity-100" />}
      {!isStatic && <Handle type="source" position={Position.Bottom} id="b" className="w-2 h-2 !bg-white/10 border-none opacity-0 hover:opacity-100" />}
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 opacity-80">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase text-foreground/90 truncate">
            {data.label}
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {data.tags?.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-foreground/60 font-medium whitespace-nowrap">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isStatic && <Handle type="target" position={Position.Left} id="l" className="w-2 h-2 !bg-white/10 border-none opacity-0 hover:opacity-100" />}
      {!isStatic && <Handle type="source" position={Position.Right} id="r" className="w-2 h-2 !bg-white/10 border-none opacity-0 hover:opacity-100" />}
    </div>
  );
}

export const BaseNode = memo(BaseNodeInner);
