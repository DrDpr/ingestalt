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
  const { selectedNodeId, hoveredNodeId } = useUIStore();
  const isSelected = !isStatic && (selectedNodeId === id || selectedNodeId === data.id);
  const isHovered = hoveredNodeId === id || hoveredNodeId === data.id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete node "${data.label}"?`)) {
      await db.nodes.delete(id);
    }
  };

  return (
    <div 
      className={cn(
        "group relative rounded-2xl border p-4 min-w-[200px] shadow-xl backdrop-blur-xl transition-all duration-300",
        colorClass,
        isSelected ? "ring-2 ring-white/50 scale-105" : "hover:border-border/20",
        isHovered && "ring-4 ring-blue-500/50 scale-110 shadow-[0_0_30px_rgba(59,130,246,0.5)] z-50 border-blue-400/50"
      )}
      style={style}
    >
      {!isStatic && (
        <button 
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-50"
        >
          <X size={12} />
        </button>
      )}

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
