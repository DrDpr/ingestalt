'use client';

import React, { useState, useMemo } from 'react';
import { Share2, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Trash2, Plus, Edit2, X, Check, Search, RefreshCw } from 'lucide-react';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useUIStore } from '../../lib/store/useUIStore';
import { useSync } from '../../lib/hooks/useSync';

const RELATION_TYPES = [
  'reads', 'writes', 'calls', 'implements', 'extends', 'uses', 'contains', 'references', 'relates_to'
];

export function RelationshipPanel({ node, hideHeader = false }: { node: any, hideHeader?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingType, setIsEditingType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedType, setSelectedType] = useState('references');
  const [customType, setCustomType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [editingCustomType, setEditingCustomType] = useState('');
  const [showEditingCustomInput, setShowEditingCustomInput] = useState(false);
  
  const { setHoveredNodeId, autoSaveEnabled } = useUIStore();
  const { syncNodeToFile } = useSync();
  
  const incomingEdges = useLiveQuery(() => db.edges.where('targetId').equals(node.id).toArray(), [node.id]);
  const outgoingEdges = useLiveQuery(() => db.edges.where('sourceId').equals(node.id).toArray(), [node.id]);

  const allNodesInWorkspace = useLiveQuery(
    () => db.nodes.where('workspaceId').equals(node.workspaceId).toArray(),
    [node.workspaceId]
  );

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

  const handleDeleteEdge = async (edgeId: string) => {
    await db.edges.delete(edgeId);
    if (autoSaveEnabled) await syncNodeToFile(node.id);
  };

  const handleUpdateEdgeType = async (edgeId: string, newType: string) => {
    await db.edges.update(edgeId, { type: newType });
    setIsEditingType(null);
    setShowEditingCustomInput(false);
    if (autoSaveEnabled) await syncNodeToFile(node.id);
  };

  const handleReverseEdge = async (edge: any) => {
    await db.edges.update(edge.id, { 
      sourceId: edge.targetId, 
      targetId: edge.sourceId 
    });
    if (autoSaveEnabled) await syncNodeToFile(node.id);
  };

  const handleAddEdge = async () => {
    if (!selectedTargetId) return;
    
    const finalType = showCustomInput ? customType || 'relates_to' : selectedType;
    const edgeId = `edge_${node.id}_${selectedTargetId}_${Date.now()}`;
    await db.edges.add({
      id: edgeId,
      workspaceId: node.workspaceId,
      sourceId: node.id,
      targetId: selectedTargetId,
      type: finalType
    });

    setIsAdding(false);
    setSelectedTargetId('');
    setCustomType('');
    setShowCustomInput(false);
    if (autoSaveEnabled) await syncNodeToFile(node.id);
  };

  const availableNodes = useMemo(() => {
    if (!allNodesInWorkspace) return [];
    const relatedIds = new Set([
      node.id,
      ...(incomingEdges || []).map(e => e.sourceId),
      ...(outgoingEdges || []).map(e => e.targetId)
    ]);
    
    return allNodesInWorkspace.filter(n => 
      !relatedIds.has(n.id) && 
      (n.payload?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       n.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allNodesInWorkspace, incomingEdges, outgoingEdges, node.id, searchQuery]);

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
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-background pb-20">
          
          {/* Add Relationship UI */}
          {isAdding ? (
            <div className="bg-secondary/30 p-4 rounded-xl border border-blue-500/30 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-blue-400">Add Relationship</h4>
                <button onClick={() => setIsAdding(false)} className="text-foreground/40 hover:text-foreground"><X size={14} /></button>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-foreground/40">Target Node</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 text-foreground/30" size={12} />
                    <input 
                      type="text" 
                      placeholder="Search nodes..." 
                      className="w-full bg-background border border-border rounded px-8 py-1.5 text-xs focus:ring-1 focus:ring-blue-500/50 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto border border-border rounded mt-1 custom-scrollbar">
                    {availableNodes.map(n => (
                      <button 
                        key={n.id}
                        onClick={() => setSelectedTargetId(n.id)}
                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-secondary transition-colors flex justify-between items-center ${selectedTargetId === n.id ? 'bg-blue-500/20 text-blue-400' : ''}`}
                      >
                        <span>{n.payload?.title || n.id}</span>
                        <span className="text-[10px] font-mono opacity-40">{n.payload?.type}</span>
                      </button>
                    ))}
                    {availableNodes.length === 0 && (
                      <div className="p-3 text-center text-xs text-foreground/30 italic">No other nodes available</div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-foreground/40">Relationship Type</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-xs text-blue-400 focus:ring-1 focus:ring-blue-500/50 outline-none"
                      value={showCustomInput ? 'custom' : selectedType}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowCustomInput(true);
                        } else {
                          setShowCustomInput(false);
                          setSelectedType(e.target.value);
                        }
                      }}
                    >
                      {RELATION_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="custom">custom...</option>
                    </select>
                    {showCustomInput && (
                      <input 
                        type="text" 
                        placeholder="Type..." 
                        className="w-1/3 bg-background border border-blue-500/30 rounded px-2 py-1.5 text-xs text-blue-400 focus:ring-1 focus:ring-blue-500/50 outline-none animate-in slide-in-from-right-2"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleAddEdge}
                  disabled={!selectedTargetId}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-secondary text-secondary text-xs font-bold uppercase py-2 rounded shadow-lg transition-all"
                >
                  Confirm Relationship
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-blue-500/50 hover:text-blue-400 text-xs font-bold uppercase tracking-widest text-foreground/40 rounded-xl transition-all"
            >
              <Plus size={14} /> Add Relationship
            </button>
          )}

          {/* Outgoing Section */}
          {Object.keys(groupedOutgoing).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase font-black text-foreground/40 ml-1">
                <ArrowRight size={10} className="text-green-500" />
                Outgoing Connections
              </div>
              {Object.entries(groupedOutgoing).map(([type, edges]: [string, any]) => (
                <div key={type} className="space-y-1 ml-1 pl-3 border-l border-border">
                  <div className="text-xs uppercase text-foreground/50 font-bold mb-2 flex justify-between items-center pr-2 group">
                    <span>{type}</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-card px-1 rounded text-foreground/40">{edges.length}</span>
                    </div>
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
                          <div className="flex flex-col">
                            <span className="text-xs font-mono text-foreground/60 group-hover/item:text-foreground transition-colors">
                              {targetNode?.payload?.title || edge.targetId}
                            </span>
                            {isEditingType === edge.id ? (
                              <div className="flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-left-2">
                                <select 
                                  className="bg-background border border-border rounded px-1 py-0.5 text-[10px] text-blue-400 focus:ring-1 focus:ring-blue-500/50 outline-none"
                                  value={showEditingCustomInput ? 'custom' : edge.type}
                                  autoFocus={!showEditingCustomInput}
                                  onChange={(e) => {
                                    if (e.target.value === 'custom') {
                                      setShowEditingCustomInput(true);
                                      setEditingCustomType(edge.type);
                                    } else {
                                      handleUpdateEdgeType(edge.id, e.target.value);
                                    }
                                  }}
                                  onBlur={() => !showEditingCustomInput && setIsEditingType(null)}
                                >
                                  {RELATION_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                  <option value="custom">custom...</option>
                                </select>
                                {showEditingCustomInput && (
                                  <div className="flex items-center gap-1">
                                    <input 
                                      type="text" 
                                      className="w-20 bg-background border border-blue-500/30 rounded px-1 py-0.5 text-[10px] text-blue-400 focus:ring-1 focus:ring-blue-500/50 outline-none"
                                      value={editingCustomType}
                                      onChange={(e) => setEditingCustomType(e.target.value)}
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateEdgeType(edge.id, editingCustomType);
                                        if (e.key === 'Escape') {
                                          setShowEditingCustomInput(false);
                                          setIsEditingType(null);
                                        }
                                      }}
                                    />
                                    <button 
                                      onClick={() => handleUpdateEdgeType(edge.id, editingCustomType)}
                                      className="p-0.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                                    >
                                      <Check size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-foreground/30 font-bold uppercase">{edge.type}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleReverseEdge(edge)}
                              className="p-1 hover:bg-blue-500/10 text-foreground/40 hover:text-blue-500 rounded transition-colors"
                              title="Reverse Direction"
                            >
                              <RefreshCw size={12} />
                            </button>
                            <button 
                              onClick={() => setIsEditingType(edge.id)}
                              className="p-1 hover:bg-blue-500/10 text-blue-500 rounded transition-colors"
                              title="Edit Relation Type"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteEdge(edge.id)}
                              className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                              title="Delete Relationship"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
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
              <div className="flex items-center gap-2 text-xs uppercase font-black text-foreground/40 ml-1">
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
                          <div className="flex flex-col">
                            <span className="text-xs font-mono text-foreground/60 group-hover/item:text-foreground transition-colors">
                              {sourceNode?.payload?.title || edge.sourceId}
                            </span>
                            <span className="text-[10px] text-foreground/30 font-bold uppercase">{edge.type}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleReverseEdge(edge)}
                              className="p-1 hover:bg-blue-500/10 text-foreground/40 hover:text-blue-500 rounded transition-colors"
                              title="Reverse Direction"
                            >
                              <RefreshCw size={12} />
                            </button>
                            {/* Deleting incoming from this side is allowed, though it's technically an outgoing relationship from the other node */}
                            <button 
                              onClick={() => handleDeleteEdge(edge.id)}
                              className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                              title="Delete Relationship"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!incomingEdges?.length && !outgoingEdges?.length && !isAdding) && (
            <div className="p-8 text-center space-y-2 border border-dashed border-border rounded-xl">
              <div className="text-foreground/30 text-xs italic">No relationships established yet.</div>
              <p className="text-[10px] text-foreground/20 uppercase tracking-tighter">Use the button above to connect this node to others.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
