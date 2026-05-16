'use client';

import { useCallback } from 'react';
import { db } from '../db';
import { serializeNodeToMarkdown } from '../serializer';
import { useUIStore } from '../store/useUIStore';

/**
 * useSync Hook
 * 
 * Provides sync functionality for writing nodes to the file system.
 * This is the bridge between the database and the File System Access API.
 * 
 * Key Functions:
 * - syncNodeToFile: Serializes a node and writes it to disk
 * - syncAllNodes: Bulk sync operation for all nodes
 * 
 * @see lib/sync/FSASyncAdapter.ts for the actual file writing logic
 * @see lib/serializer.ts for node-to-markdown conversion
 */
export function useSync() {
  const autoSaveEnabled = useUIStore((state) => state.autoSaveEnabled);
  const directoryHandle = useUIStore((state) => (state as any).directoryHandle);

  /**
   * Sync a single node to the file system
   * Converts the node to Markdown with YAML frontmatter and writes to disk
   */
  const syncNodeToFile = useCallback(async (nodeId: string) => {
    if (!directoryHandle) {
      console.log('[useSync] No directory handle - skipping sync');
      return;
    }

    try {
      const node = await db.nodes.get(nodeId);
      if (!node) {
        console.warn('[useSync] Node not found:', nodeId);
        return;
      }

      // Get edges for this node to include in relations
      const outgoingEdges = await db.edges.where('sourceId').equals(nodeId).toArray();
      const relations = outgoingEdges.map(e => ({
        target: e.targetId,
        type: e.type
      }));

      // Add relations to node for serialization
      const nodeWithRelations = { ...node, relations };

      // Serialize node to Markdown
      const markdown = serializeNodeToMarkdown(nodeWithRelations);
      
      // Use filename from payload, or generate from title, or use node ID
      const filename = node.payload?.filename ||
        `${node.payload?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || node.id}.md`;
      
      // Write to file system
      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(markdown);
      await writable.close();

      console.log('[useSync] ✓ Synced node to file:', filename);
    } catch (error) {
      console.error('[useSync] ✗ Failed to sync node:', error);
      // Show error to user
      alert(`Failed to sync to disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [directoryHandle]);

  /**
   * Sync all nodes in the workspace to the file system
   * Useful for bulk export operations
   */
  const syncAllNodes = useCallback(async () => {
    if (!autoSaveEnabled || !directoryHandle) {
      console.log('[useSync] Auto-save disabled or no directory handle');
      return;
    }

    try {
      const nodes = await db.nodes.toArray();
      console.log(`[useSync] Syncing ${nodes.length} nodes...`);

      for (const node of nodes) {
        await syncNodeToFile(node.id);
      }

      console.log('[useSync] All nodes synced successfully');
    } catch (error) {
      console.error('[useSync] Failed to sync all nodes:', error);
    }
  }, [autoSaveEnabled, directoryHandle, syncNodeToFile]);

  /**
   * Connect to a folder using File System Access API
   * Opens a directory picker and stores the handle for future syncs
   */
  const connectFolder = useCallback(async () => {
    try {
      // Request directory access
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });

      // Store the handle in the UI store
      useUIStore.getState().setDirectoryHandle(handle);
      useUIStore.getState().setAutoSaveEnabled(true);

      console.log('[useSync] Connected to folder:', handle.name);
      return handle;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('[useSync] User cancelled folder selection');
      } else {
        console.error('[useSync] Failed to connect folder:', error);
      }
      return null;
    }
  }, []);

  return {
    syncNodeToFile,
    syncAllNodes,
    connectFolder,
  };
}

// Made with Bob
