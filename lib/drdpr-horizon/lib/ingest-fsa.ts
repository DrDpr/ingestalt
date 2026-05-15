'use client';

import { db } from './db';
import { layoutAndPersist, ingestWorkspace } from './ingest-client';

/**
 * Reads all .md files from a FileSystemDirectoryHandle recursively (top-level only for now).
 */
/**
 * Reads all .md files from a FileSystemDirectoryHandle recursively.
 */
async function readFilesFromHandle(dirHandle: FileSystemDirectoryHandle, path = ''): Promise<{ content: string; filepath: string }[]> {
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
 * Primary client-side ingestion:
 * 1. Uses stored FSA handle if available
 * 2. Falls back to prompting the user to pick a folder
 * 3. Reads all .md files and ingests them into IndexedDB
 */
export async function ingestFromFileSystem(onProgress?: (msg: string) => void): Promise<number> {
  onProgress?.('Checking stored folder handle...');

  let handle = await getStoredFolderHandle();

  if (!handle) {
    onProgress?.('No stored handle — requesting folder access...');
    handle = await connectAndStoreFolder();
  }

  if (!handle) {
    onProgress?.('Folder access denied or cancelled.');
    return 0;
  }

  onProgress?.(`Reading files from "${handle.name}"...`);
  const files = await readFilesFromHandle(handle);

  if (files.length === 0) {
    onProgress?.('No markdown files found in selected folder.');
    return 0;
  }

  onProgress?.(`Laying out and persisting ${files.length} file(s)...`);

  const workspaceId = handle.name;
  const count = await layoutAndPersist(files, workspaceId);

  onProgress?.(`Done. Ingested ${count} nodes from "${handle.name}".`);
  return count;
}

/**
 * Fallback: server-side ingestion via path string.
 */
export { ingestWorkspace as ingestFromServerPath };
