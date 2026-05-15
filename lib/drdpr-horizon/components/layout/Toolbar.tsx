'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, Share2, Anchor, Zap, Cpu, Compass, Trash2, FolderOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { useUIStore } from '@/lib/store/useUIStore';
import { ingestFromFileSystem, getStoredFolderHandle, connectAndStoreFolder } from '@/lib/ingest-fsa';
import { seedDatabase } from '@/lib/seed';
import { db } from '@/lib/db';

export function Toolbar() {
  const { 
    relationshipMode, setRelationshipMode, 
    edgeHandleType, setEdgeHandleType,
    edgePathType, setEdgePathType
  } = useUIStore();

  const [connectedFolder, setConnectedFolder] = useState<string | null>(null);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  // On mount, check if we already have a stored handle
  useEffect(() => {
    getStoredFolderHandle().then(handle => {
      if (handle) setConnectedFolder(handle.name);
    });
  }, []);

  const handleIngest = async () => {
    setIsIngesting(true);
    setIngestStatus('Starting...');
    try {
      const count = await ingestFromFileSystem((msg) => setIngestStatus(msg));
      // Refresh connected folder name after potential new connection
      const handle = await getStoredFolderHandle();
      if (handle) setConnectedFolder(handle.name);
      setIngestStatus(`✓ ${count} nodes ingested`);
      setTimeout(() => setIngestStatus(null), 3000);
    } catch (e) {
      setIngestStatus('✗ Ingestion failed');
      setTimeout(() => setIngestStatus(null), 3000);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSeed = async () => {
    try {
      await seedDatabase();
      alert('Mock data seeded!');
    } catch (e) {
      alert('Failed to seed.');
    }
  };

  const handleChangeFolder = async () => {
    const handle = await connectAndStoreFolder();
    if (handle) {
      setConnectedFolder(handle.name);
      setIngestStatus(`Folder changed to "${handle.name}"`);
      setTimeout(() => setIngestStatus(null), 2500);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear ALL nodes and connections from the workspace?')) {
      try {
        await db.nodes.clear();
        await db.edges.clear();
        setConnectedFolder(null);
      } catch (e) {
        alert('Failed to clear database.');
      }
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
      {/* Action Group */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 p-1 bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded shadow-xl">
          <button 
            onClick={handleIngest}
            disabled={isIngesting}
            title={connectedFolder ? `Re-sync from "${connectedFolder}"` : 'Connect folder & ingest'}
            className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors disabled:opacity-50"
          >
            {isIngesting ? <Loader2 size={16} className="animate-spin" /> : connectedFolder ? <RefreshCw size={16} /> : <FolderOpen size={16} />}
          </button>
          <button 
            onClick={handleSeed}
            title="Seed Mock Data"
            className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
          >
            <Database size={16} />
          </button>
          <button 
            onClick={handleClear}
            title="Clear All Nodes"
            className="p-2 hover:bg-neutral-800 text-red-400/60 hover:text-red-400 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {/* Folder status badge */}
        {(connectedFolder || ingestStatus) && (
          <div
            onClick={!ingestStatus && connectedFolder ? handleChangeFolder : undefined}
            title={!ingestStatus && connectedFolder ? 'Click to change folder' : undefined}
            className={`flex items-center gap-1.5 px-2 py-1 bg-neutral-900/80 border border-neutral-800 rounded text-xs font-mono max-w-[220px] ${
              !ingestStatus && connectedFolder ? 'cursor-pointer hover:border-blue-500/50 hover:bg-neutral-800/60 group transition-colors' : ''
            }`}
          >
            {ingestStatus ? (
              <span className="text-blue-400 truncate">{ingestStatus}</span>
            ) : (
              <>
                <CheckCircle2 size={10} className="text-green-500 flex-shrink-0 group-hover:hidden" />
                <FolderOpen size={10} className="text-blue-400 flex-shrink-0 hidden group-hover:block" />
                <span className="text-neutral-500 truncate group-hover:text-blue-400 transition-colors">{connectedFolder}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="h-4 w-[1px] bg-neutral-800" />

      {/* Relationship Visualization Mode */}
      <div className="flex flex-col gap-1">
        <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Visualization</span>
        <div className="flex bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded p-1 shadow-xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'selected', label: 'Direct' },
            { id: 'trace', label: 'Trace' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setRelationshipMode(mode.id as any)}
              className={`px-3 py-1 text-[9px] uppercase tracking-wider font-black rounded transition-all ${
                relationshipMode === mode.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Anchor Logic Toggle */}
      <div className="flex flex-col gap-1">
        <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Anchors</span>
        <div className="flex bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded p-1 shadow-xl">
          {[
            { id: 'fixed', label: 'Fixed', icon: <Anchor size={10} />, title: 'Top/Bottom Only' },
            { id: 'smart', label: 'Smart', icon: <Zap size={10} />, title: 'Closest 4-Way' }
          ].map((mode) => (
            <button
              key={mode.id}
              title={mode.title}
              onClick={() => setEdgeHandleType(mode.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 text-[9px] uppercase tracking-wider font-black rounded transition-all ${
                edgeHandleType === mode.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Path Style Toggle */}
      <div className="flex flex-col gap-1">
        <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Path Style</span>
        <div className="flex bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded p-1 shadow-xl">
          {[
            { id: 'organic', label: 'Organic', icon: <Share2 size={10} />, title: 'Bezier Curves' },
            { id: 'circuit', label: 'Circuit', icon: <Cpu size={10} />, title: 'Square Steps' },
            { id: 'smart', label: 'Smart', icon: <Compass size={10} />, title: 'Avoid Nodes' }
          ].map((mode) => (
            <button
              key={mode.id}
              title={mode.title}
              onClick={() => setEdgePathType(mode.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 text-[9px] uppercase tracking-wider font-black rounded transition-all ${
                edgePathType === mode.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
