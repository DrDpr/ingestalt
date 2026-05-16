import type { HorizonDatabase } from "../db";
import { FSASyncAdapter } from './FSASyncAdapter';

export class SyncManager {
  private fsaAdapter: FSASyncAdapter;
  constructor(
    private db: HorizonDatabase,
    private bus: any // Using any to avoid broken external type dependencies
  ) {
    this.fsaAdapter = new FSASyncAdapter();
    
    // Listen for changes emitted by the Inspector or Canvas
    this.bus.on('node:updated', (payload: { nodeId: string }) => {
      this.handleNodeChange(payload.nodeId);
    });
    this.bus.on('node:created', (payload: { nodeId: string }) => {
      this.handleNodeChange(payload.nodeId);
    });
  }
  private async handleNodeChange(nodeId: string) {
    const node = await this.db.nodes.get(nodeId);
    if (!node) return;
    // Retrieve the file system handle stored during ingestion
    // In ingest-fsa.ts, we store the handle under the 'project_root' ID
    const config = await this.db.config.get('project_root');
    
    if (config?.handle) {
      // Sync the node to the file system
      await this.fsaAdapter.syncNode(node, config.handle as FileSystemDirectoryHandle);
    } else {
      console.warn(`[SyncManager] Cannot sync node ${nodeId}: No file system handle found in config.`);
    }
  }
}
