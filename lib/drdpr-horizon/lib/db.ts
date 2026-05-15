import Dexie, { type Table } from 'dexie';

/**
 * 1. The Core Primitive (The "Vessel")
 * Horizon doesn't care what's inside the payload; it just manages the spatial 
 * and relational configuration of the node.
 */
export interface HorizonNode<TPayload = any> {
  id: string;
  configId: string; // The ID of the standards node (e.g., 'node_standards_devlog')
  workspaceId: string; // For scoped loading and context swapping
  position: { x: number; y: number }; // Spatial logic
  dimensions?: { width: number; height: number }; // Spatial logic
  lastModified: number;
  
  // The Payload: Domain-specific data (e.g., title, content, tags, known_bugs)
  payload: TPayload; 
}

/**
 * 2. The Directed Edge (The "Logic String")
 * Relationships are externalized to enable O(1) graph traversal.
 */
export interface HorizonEdge {
  id: string;
  workspaceId: string;
  sourceId: string;
  targetId: string;
  type: string; // e.g., 'references', 'uses', 'populates'
  metadata?: Record<string, any>;
}

export class HorizonDatabase extends Dexie {
  nodes!: Table<HorizonNode>;
  edges!: Table<HorizonEdge>;

  constructor() {
    super('HorizonDB');
    
    // V3: Indexing payload.type for standards lookup
    this.version(3).stores({
      // Indexes: configId for type recognition, workspaceId for scoping, payload.type for fast standard filtering
      nodes: 'id, configId, workspaceId, lastModified, payload.type',
      
      // Compound index [sourceId+targetId] for rapid relationship lookups
      edges: 'id, workspaceId, sourceId, targetId, type, [sourceId+targetId]',
      config: 'id'
    });
  }
}

export const db = new HorizonDatabase();
