'use client';

import React from 'react';
import { getBezierPath, getSmoothStepPath, useInternalNode, useStore, EdgeProps, BaseEdge, InternalNode } from '@xyflow/react';
import { getFloatingEdgeParams } from './utils';
import { getSmartPath } from './smartPath';
import { useUIStore } from '@/lib/store/useUIStore';

export function FloatingEdge({ id, source, target, markerEnd, style, label }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const allNodes = useStore((s) => Array.from(s.nodeLookup.values())) as InternalNode[];
  const edgeHandleType = useUIStore((state) => state.edgeHandleType);
  const edgePathType = useUIStore((state) => state.edgePathType);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getFloatingEdgeParams(
    sourceNode, 
    targetNode, 
    edgeHandleType === 'fixed'
  );

  const pathParams = {
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  };

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (edgePathType === 'smart') {
    [edgePath, labelX, labelY] = getSmartPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
      sourcePos: sourcePos,
      targetPos: targetPos,
      nodes: allNodes as any, // InternalNode vs Node type cast if needed
      sourceId: source,
      targetId: target,
    });
  } else {
    const [path, lx, ly] = edgePathType === 'organic' 
      ? getBezierPath(pathParams)
      : getSmoothStepPath(pathParams);
    edgePath = path;
    labelX = lx;
    labelY = ly;
  }

  return (
    <BaseEdge 
      id={id} 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={style} 
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}
      labelShowBg={true}
      labelBgStyle={{ fill: '#0f172a', fillOpacity: 0.9 }}
      labelBgPadding={[6, 3]}
      labelBgBorderRadius={4}
    />
  );
}
