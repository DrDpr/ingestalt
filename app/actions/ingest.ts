/**
 * Client-safe Ingestion Stub
 * Local-first directory ingestion is handled fully on the client-side via File System Access API
 */
export async function readWorkspaceFiles(basePath: string): Promise<{ content: string; filepath: string }[]> {
  console.warn('[Ingest] readWorkspaceFiles is a server action and is not available in static client builds.');
  return [];
}
