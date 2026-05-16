'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * Server Action: Read all .md files from a directory recursively
 * This is used for server-side ingestion when File System Access API is not available
 */
export async function readWorkspaceFiles(basePath: string): Promise<{ content: string; filepath: string }[]> {
  const results: { content: string; filepath: string }[] = [];

  async function readDir(dirPath: string, relativePath: string = '') {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          // Skip node_modules, .git, etc.
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await readDir(fullPath, relPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          results.push({ content, filepath: relPath });
        }
      }
    } catch (error) {
      console.error(`[Server Ingest] Failed to read directory ${dirPath}:`, error);
    }
  }

  await readDir(basePath);
  return results;
}

// Made with Bob
