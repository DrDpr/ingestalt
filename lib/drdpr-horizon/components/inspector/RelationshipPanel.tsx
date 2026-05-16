'use client';

import React, { useState, useMemo } from 'react';
import { Share2, ArrowRight, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useUIStore } from '../../lib/store/useUIStore';

export function RelationshipPanel({ node, hideHeader = false }: { node: any, hideHeader?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setHoveredNodeId } = useUIStore();
  
  const incomingEdges = useLiveQuery(() => db.edges.where('targetId').equals(node.id).toArray(), [node.id]);
  const outgoingEdges = useLiveQuery(() => db.edges.where('sourceId').equals(node.id).toArray(), [node.id]);

  const allRelatedNodes = useLiveQuery(async () => {
    const relatedIds = [
      ...(incomingEdges || []).map(e => e.sourceId), 
      ...(outgoingEdges || []).map(e => e.targetId)
    ];
    if (relatedIds.length === 0) return [];
    return db.nodes.where('id').anyOf(relatedIds).toArray();
  }, [incomingEdges, outgoingEdges]);

  // Grouping Logic
  const groupedOutgoing = useMemo(() => {
    if (!outgoingEdges) return {};
    return outgoingEdges.reduce((acc: any, edge) => {
      const type = edge.type || 'relates_to';
      if (!acc[type]) acc[type] = [];
      acc[type].push(edge);
      return acc;
    }, {});
  }, [outgoingEdges]);

  const groupedIncoming = useMemo(() => {
    if (!incomingEdges) return {};
    return incomingEdges.reduce((acc: any, edge) => {
      const type = edge.type || 'relates_to';
      if (!acc[type]) acc[type] = [];
      acc[type].push(edge);
      return acc;
    }, {});
  }, [incomingEdges]);

  if (!incomingEdges?.length && !outgoingEdges?.length) return null;

  return (
    <div className="bg-background h-full flex flex-col overflow-hidden">
      {!hideHeader && (
        <div 
          className="p-4 flex items-center justify-between bg-card/20 cursor-pointer hover:bg-card/40 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-2 text-blue-500">
            <Share2 size={16} />
            <h3 className="text-sm font-semibold uppercase">Relationships</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/40 font-mono">
              {incomingEdges?.length || 0} IN / {outgoingEdges?.length || 0} OUT
            </span>
            {isCollapsed ? <ChevronDown size={14} className="text-foreground/40" /> : <ChevronUp size={14} className="text-foreground/40" />}
          </div>
        </div>
      )}

      {(!isCollapsed || hideHeader) && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-background">
          
          {/* Outgoing Section */}
          {Object.keys(groupedOutgoing).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase font-black  text-foreground/40 ml-1">
                <ArrowRight size={10} className="text-green-500" />
                Outgoing Connections
              </div>
              {Object.entries(groupedOutgoing).map(([type, edges]: [string, any]) => (
                <div key={type} className="space-y-1 ml-1 pl-3 border-l border-border">
                  <div className="text-xs uppercase text-foreground/50 font-bold mb-2 flex justify-between items-center pr-2">
                    <span>{type}</span>
                    <span className="bg-card px-1 rounded text-foreground/40">{edges.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {edges.map((edge: any) => {
                      const targetNode = allRelatedNodes?.find(n => n.id === edge.targetId);
                      return (
                        <div 
                          key={edge.id} 
                          onMouseEnter={() => setHoveredNodeId(edge.targetId)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className="flex items-center justify-between bg-card/30 p-2 rounded border border-border/30 hover:border-blue-500/50 hover:bg-secondary/50 transition-all cursor-default group/item"
                        >
                          <span className="text-xs font-mono text-foreground/60 group-hover/item:text-foreground transition-colors">
                            {targetNode?.payload?.title || edge.targetId}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Incoming Section */}
          {Object.keys(groupedIncoming).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase font-black  text-foreground/40 ml-1">
                <ArrowLeft size={10} className="text-blue-500" />
                Incoming Connections
              </div>
              {Object.entries(groupedIncoming).map(([type, edges]: [string, any]) => (
                <div key={type} className="space-y-1 ml-1 pl-3 border-l border-border">
                  <div className="text-xs uppercase text-foreground/50 font-bold mb-2 flex justify-between items-center pr-2">
                    <span>{type}</span>
                    <span className="bg-card px-1 rounded text-foreground/40">{edges.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {edges.map((edge: any) => {
                      const sourceNode = allRelatedNodes?.find(n => n.id === edge.sourceId);
                      return (
                        <div 
                          key={edge.id} 
                          onMouseEnter={() => setHoveredNodeId(edge.sourceId)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className="flex items-center justify-between bg-card/30 p-2 rounded border border-border/30 hover:border-blue-500/50 hover:bg-secondary/50 transition-all cursor-default group/item"
                        >
                          <span className="text-xs font-mono text-foreground/60 group-hover/item:text-foreground transition-colors">
                            {sourceNode?.payload?.title || edge.sourceId}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
