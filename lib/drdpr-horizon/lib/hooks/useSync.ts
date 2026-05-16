'use client';

import { useCallback } from 'react';
import { db } from '../db';
import { serializeNodeToMarkdown } from '../serializer';
import { useUIStore } from '../store/useUIStore';
import { getStoredFolderHandle } from '../ingest-fsa';
import { FSASyncAdapter } from '../sync/FSASyncAdapter';

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
  const adapter = new FSASyncAdapter();

  /**
   * Sync a single node to the file system
   * Converts the node to Markdown with YAML frontmatter and writes to disk
   */
  
  const syncNodeToFile = useCallback(async (nodeId: string) => {
    // 1. Get the handle from IndexedDB (persisted) instead of UI Store
    const handle = await getStoredFolderHandle();
    
    if (!handle) {
      console.warn('[useSync] No directory handle found in IndexedDB');
      alert('No folder connected. Please connect a folder in the toolbar first.');
      return;
    }
    try {
      const node = await db.nodes.get(nodeId);
      if (!node) return;
      // 2. Use our centralized adapter to handle the heavy lifting
      // This ensures customizations are included and gray-matter is used
      await adapter.syncNode(node, handle);
      console.log('[useSync] ✓ Manual sync successful');
    } catch (error) {
      console.error('[useSync] ✗ Manual sync failed:', error);
      alert(`Failed to sync to disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

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
