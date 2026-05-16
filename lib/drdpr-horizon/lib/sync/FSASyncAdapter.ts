import yaml from 'js-yaml';
import type { NodeRecord } from '@drdpr/workspace-core';

export class FSASyncAdapter {
  async syncNode(node: NodeRecord, rootHandle: FileSystemDirectoryHandle) {
    if (!node.filepath) return;

    const content = this.serialize(node);
    try {
      await this.writeFile(rootHandle, node.filepath, content);
      console.log(`[FSASync] Synced node ${node.id} to ${node.filepath}`);
    } catch (err) {
      console.error(`[FSASync] Failed to sync node ${node.id}:`, err);
    }
  }

  private serialize(node: NodeRecord): string {
    const frontmatter = {
      id: node.id,
      type: node.type,
      tags: node.tags,
      position: node.position,
      ...node.payload
    };
    
    // Remove content from frontmatter to keep it clean
    const content = node.payload.content || '';
    delete (frontmatter as any).content;
    
    const yamlBlock = yaml.dump(frontmatter);
    return `---\n${yamlBlock}---\n\n${content}`;
  }

  private async writeFile(root: FileSystemDirectoryHandle, path: string, content: string) {
    const parts = path.split(/[/\\]/); // Handle both slashes
    let current = root;
    
    // Traverse/Create directories
    for (let i = 0; i < parts.length - 1; i++) {
      if (!parts[i]) continue;
      current = await current.getDirectoryHandle(parts[i], { create: true });
    }
    
    // Write file
    const filename = parts[parts.length - 1];
    const fileHandle = await current.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}
