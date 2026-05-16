import type { AppDB } from '@drdpr/workspace-core';
import type { EventBus, EventMap } from '@drdpr/event-bus';
import { FSASyncAdapter } from './FSASyncAdapter';
import { GitSyncAdapter } from './GitSyncAdapter';

export class SyncManager {
  private fsaAdapter: FSASyncAdapter;
  private gitAdapter: GitSyncAdapter;

  constructor(
    private db: AppDB,
    private bus: EventBus<EventMap>
  ) {
    this.fsaAdapter = new FSASyncAdapter();
    this.gitAdapter = new GitSyncAdapter();
    
    // Listen for changes
    this.bus.on('node:updated', ({ nodeId }) => this.handleNodeChange(nodeId));
    this.bus.on('node:created', ({ nodeId }) => this.handleNodeChange(nodeId));
  }

  private async handleNodeChange(nodeId: string) {
    const node = await this.db.nodes.get(nodeId);
    if (!node) return;

    // 1. Sync to File System (FSA)
    const config = await this.db.config.get(`config:${node.workspaceId}`);
    if (config?.fsHandle) {
      await this.fsaAdapter.syncNode(node, config.fsHandle);
    }

    // 2. Sync to Git (Stub)
    await this.gitAdapter.syncNode(node);
  }
}
