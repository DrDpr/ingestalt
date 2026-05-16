'use client';

import { db } from './db';
import { layoutAndPersist, ingestWorkspace } from './ingest-client';

/**
 * Reads all .md files from a FileSystemDirectoryHandle recursively (top-level only for now).
 */
/**
 * Reads all .md files from a FileSystemDirectoryHandle recursively.
 */
export async function readFilesFromHandle(dirHandle: FileSystemDirectoryHandle, path = ''): Promise<{ content: string; filepath: string }[]> {
  const results: { content: string; filepath: string }[] = [];

  for await (const [name, entry] of (dirHandle as any).entries()) {
    const relativePath = path ? `${path}/${name}` : name;
    
    if (entry.kind === 'file' && name.endsWith('.md')) {
      const file = await (entry as FileSystemFileHandle).getFile();
      const content = await file.text();
      results.push({ content, filepath: relativePath });
    } else if (entry.kind === 'directory') {
      const subResults = await readFilesFromHandle(entry, relativePath);
      results.push(...subResults);
    }
  }

  return results;
}

/**
 * Connects to a folder via the File System Access API, stores the handle
 * in IndexedDB for persistence, and returns the handle.
 */
export async function connectAndStoreFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
    // Persist the handle to DB — Dexie can store FileSystemHandle natively
    await db.config.put({ id: 'project_root', handle });
    return handle;
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error('[FSA] Failed to connect folder:', err);
    }
    return null;
  }
}

/**
 * Gets the stored handle (if any) and requests permission if needed.
 */
export async function getStoredFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const config = await db.config.get('project_root');
    if (!config?.handle) return null;

    const handle = config.handle as FileSystemDirectoryHandle;

    // Re-verify permission (required after page reload)
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm === 'granted') return handle;

    const req = await handle.requestPermission({ mode: 'readwrite' });
    if (req === 'granted') return handle;

    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if a directory handle likely points to a project root or system folder
 * rather than a documentation/notes folder.
 */
export async function isProbablyProjectRoot(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const rootMarkers = ['node_modules', '.git', 'package.json', 'venv', '.venv', '.next', '.gemini', 'target', 'vendor'];
  try {
    for await (const [name] of (handle as any).entries()) {
      if (rootMarkers.includes(name)) return true;
    }
  } catch (e) {
    console.warn('[FSA] Could not perform root check:', e);
  }
  return false;
}

/**
 * Primary client-side ingestion:
 * 1. Uses stored FSA handle if available
 * 2. Falls back to prompting the user to pick a folder
 * 3. Reads all .md files and ingests them into IndexedDB
 */
export async function ingestFromFileSystem(
  onProgress?: (msg: string) => void, 
  skipRootCheck = false,
  forceNewIds = true,
  whitelistPaths?: string[],
  preReadFiles?: { content: string; filepath: string }[]
): Promise<{ count: number; nodeIds: string[]; isProjectRoot?: boolean }> {
  onProgress?.('Checking stored folder handle...');

  let handle = await getStoredFolderHandle();

  if (!handle) {
    onProgress?.('No stored handle — requesting folder access...');
    handle = await connectAndStoreFolder();
  }

  if (!handle) {
    onProgress?.('Folder access denied or cancelled.');
    return { count: 0, nodeIds: [] };
  }

  // Check if this looks like a project root (e.g. has node_modules)
  if (!skipRootCheck) {
    const isRoot = await isProbablyProjectRoot(handle);
    if (isRoot) {
      return { count: 0, nodeIds: [], isProjectRoot: true };
    }
  }

  onProgress?.(`Reading files from "${handle.name}"...`);
  const files = preReadFiles || await readFilesFromHandle(handle);

  if (files.length === 0) {
    onProgress?.('No markdown files found in selected folder.');
    return { count: 0, nodeIds: [] };
  }

  onProgress?.(`Laying out and persisting ${files.length} file(s)...`);

  const workspaceId = handle.name;
  const result = await layoutAndPersist(files, workspaceId, forceNewIds, whitelistPaths);

  onProgress?.(`Done. Ingested ${result.count} nodes from "${handle.name}".`);
  return { ...result, isProjectRoot: false };
}

/**
 * Pure Sync entry point:
 * Only updates documentation for nodes already on the canvas.
 */
export async function syncFromFileSystem(workspaceId: string, onProgress?: (msg: string) => void): Promise<{ count: number }> {
  let handle = await getStoredFolderHandle();
  if (!handle) return { count: 0 };

  onProgress?.(`Reading files from "${handle.name}" for sync...`);
  const files = await readFilesFromHandle(handle);

  if (files.length === 0) return { count: 0 };

  const result = await import('./ingest-client').then(m => m.syncNodesFromFiles(files, workspaceId));

  onProgress?.(`Sync complete. Updated ${result.count} nodes.`);
  return result;
}

/**
 * Silently checks if we currently have readwrite permission for a stored handle.
 * Does NOT prompt the user — use this for passive UI state checks on mount.
 * Returns true only if permission is already 'granted'.
 */
export async function verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    return perm === 'granted';
  } catch {
    return false;
  }
}

/**
 * Fallback: server-side ingestion via path string.
 */
export { ingestWorkspace as ingestFromServerPath };
