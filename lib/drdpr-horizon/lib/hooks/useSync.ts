'use client';

import { db } from '@/lib/db';
import { serializeNodeToMarkdown } from '@/lib/serializer';
import { useCallback, useState } from 'react';

/**
 * Hook for managing client-side file system synchronization.
 * Uses the modern File System Access API.
 */
export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  // Request directory access and store the handle in DB
  const connectFolder = useCallback(async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      
      // Store in IndexedDB for persistence (Dexie can store FileSystemHandle objects!)
      await db.config.put({ id: 'project_root', handle });
      return true;
    } catch (err) {
      console.error('Failed to connect folder:', err);
      return false;
    }
  }, []);

  // Save a specific node to its corresponding file
  const syncNodeToFile = useCallback(async (nodeId: string) => {
    const node = await db.nodes.get(nodeId);
    if (!node) return;

    // Get all outgoing edges to derive 'relations'
    const outgoingEdges = await db.edges.where('sourceId').equals(nodeId).toArray();
    const relations = outgoingEdges.map(e => ({
      target: e.targetId,
      type: e.type
    }));

    const markdown = serializeNodeToMarkdown({ ...node, relations });
    
    try {
      const config = await db.config.get('project_root');
      if (!config || !config.handle) {
        console.warn('No project folder connected.');
        return;
      }

      const handle = config.handle;
      
      // Check for permission (required after page reload)
      if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
        // We might need a user gesture here, but let's try
        if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
          return;
        }
      }

      // Filename strategy: use custom filename from payload, fallback to nodeId
      const fileName = node.payload?.filename || `${nodeId}.md`;
      const fileHandle = await handle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      await writable.write(markdown);
      await writable.close();
      
      console.log(`Synced ${fileName} to disk.`);
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }, []);

  return { connectFolder, syncNodeToFile, isSyncing };
}
