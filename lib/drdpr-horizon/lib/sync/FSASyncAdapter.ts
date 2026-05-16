import matter from 'gray-matter';

export class FSASyncAdapter {
  async syncNode(node: any, rootHandle: FileSystemDirectoryHandle) {
    // Look in payload for the filename
    const filepath = node.payload?.filename || node.payload?.filepath;
    if (!filepath) return;
    const content = this.serialize(node);
    try {
      await this.writeFile(rootHandle, filepath, content);
      console.log(`[FSASync] Synced node ${node.id} to ${filepath}`);
    } catch (err) {
      console.error(`[FSASync] Failed to sync node ${node.id}:`, err);
    }
  }
  private serialize(node: any): string {
    const { content, ...restOfPayload } = node.payload;
    
    // Merge core spatial data with payload customizations
    const frontmatter = {
      id: node.id,
      configId: node.configId,
      position: node.position,
      ...restOfPayload
    };
    
    // gray-matter's stringify will create the perfect Markdown + YAML file
    return matter.stringify(content || '', frontmatter);
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
