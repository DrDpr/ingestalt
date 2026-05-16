'use client';

import { readWorkspaceFiles } from '@/app/actions/ingest';
import { db } from './db';
import { parseMarkdownToNode } from './parser';

/**
 * ARCHITECTURAL LAYOUT CONFIGURATION
 */
export const LAYOUT_CONFIG = {
  COLUMN_WIDTH: 250,
  NESTING_OFFSET: 60,
  MIN_Y_GAP: 20,
  NODE_WIDTH_BOUND: 300,
  NODE_HEIGHT_BOUND: 80,
  NUDGE_STEP: 40,
  ROOT_START_Y: 50,
};

export function getXBase(config: typeof LAYOUT_CONFIG) {
  return {
    database: 0,
    api: config.COLUMN_WIDTH,
    hook: config.COLUMN_WIDTH * 2,
    frontend: config.COLUMN_WIDTH * 3,
    standards: -config.COLUMN_WIDTH,
    horizonDoc: -config.COLUMN_WIDTH * 2,
    other: config.COLUMN_WIDTH * 4
  };
}

/**
 * Shared layout + persistence engine.
 * Accepts raw file contents, runs the "Solid Geometry" auto-layout,
 * then writes positioned nodes and edges to IndexedDB.
 * Used by both server-path and FSA ingestion.
 */
export async function layoutAndPersist(
  fileContents: { content: string; filepath: string }[],
  workspaceId: string = 'default',
  forceNewIds: boolean = true,
  whitelistPaths?: string[]
): Promise<{ count: number; nodeIds: string[] }> {
  if (fileContents.length === 0) return { count: 0, nodeIds: [] };

  // Filter by whitelist if provided (STRICT SYNC MODE)
  const filteredContents = whitelistPaths 
    ? fileContents.filter(f => whitelistPaths.includes(f.filepath))
    : fileContents;

  if (filteredContents.length === 0) return { count: 0, nodeIds: [] };

  // Load existing nodes for this workspace to allow filename-based matching (prevents duplicates)
  const existingNodes = await db.nodes.where('workspaceId').equals(workspaceId).toArray();
  const filenameMap = new Map(existingNodes.map(n => [n.payload.filename, n.id]));

  const parsedResults = filteredContents.map((doc) => {
    // If we have an existing node for this filename, don't force a new ID even if requested
    // unless the user explicitly wants a full fork.
    const existingId = filenameMap.get(doc.filepath);
    
    const result = parseMarkdownToNode(doc.content, workspaceId, forceNewIds && !existingId);
    
    // Backlink the physical filename so the sync engine writes to the right file
    result.node.payload.filename = doc.filepath;

    // SYNC FIX: If we are in sync mode (no forceNewIds) and we found a matching node by filename,
    // override the generated ID to ensure we perform an UPDATE instead of an ADD.
    if (!forceNewIds && existingId) {
       result.node.id = existingId;
    }
    
    // Final fallback: If still untitled, use the filename (without extension)
    if (result.node.payload.title === 'Untitled Node' || !result.node.payload.title) {
      const fileName = doc.filepath.split('/').pop()?.replace('.md', '') || 'Untitled Node';
      // Clean up common naming patterns
      result.node.payload.title = fileName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return result;
  });

  const rawNodes = parsedResults.map(r => r.node);
  let edges = parsedResults.flatMap(r => r.edges);
  const nodeIds = rawNodes.map(n => n.id);

  // If we forced new IDs, we need to remap edge target IDs
  if (forceNewIds) {
    // Build a map of old IDs (from markdown) to new IDs (generated)
    const idMap = new Map<string, string>();
    parsedResults.forEach(result => {
      const oldId = result.node.payload.id; // Original ID from markdown frontmatter
      const newId = result.node.id; // New generated ID
      if (oldId && oldId !== newId) {
        idMap.set(oldId, newId);
      }
    });

    // Remap edge target IDs
    edges = edges.map(edge => {
      const newTargetId = idMap.get(edge.targetId) || edge.targetId;
      const newSourceId = idMap.get(edge.sourceId) || edge.sourceId;
      return {
        ...edge,
        id: `edge_${newSourceId}_${newTargetId}`,
        sourceId: newSourceId,
        targetId: newTargetId
      };
    }).filter(edge => {
      // Only keep edges where both source and target exist in the new node set
      const sourceExists = nodeIds.includes(edge.sourceId);
      const targetExists = nodeIds.includes(edge.targetId);
      return sourceExists && targetExists;
    });
  }

  const adjacency = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();
  edges.forEach(e => {
    adjacency.set(e.sourceId, [...(adjacency.get(e.sourceId) || []), e.targetId]);
    parentsOf.set(e.targetId, [...(parentsOf.get(e.targetId) || []), e.sourceId]);
  });

  const positionedNodes = new Map<string, any>();
  const columnWatermarks = new Map<number, number>();
  const typeXBase = getXBase(LAYOUT_CONFIG);

  const placeNode = (node: any, depth: number, preferredY?: number) => {
    if (positionedNodes.has(node.id)) return;

    const type = node.payload?.type || 'other';
    const baseX = typeXBase[type] ?? LAYOUT_CONFIG.COLUMN_WIDTH * 4;
    
    // SPATIAL PRESERVATION: If we are in sync mode and this node already exists, 
    // use its existing position instead of calculating a new one.
    const existingNode = existingNodes.find(n => n.id === node.id);
    if (!forceNewIds && existingNode) {
       positionedNodes.set(node.id, { ...node, position: existingNode.position });
       return;
    }

    const x = baseX + (depth * LAYOUT_CONFIG.NESTING_OFFSET);

    const placedParents = (parentsOf.get(node.id) || [])
      .map(id => positionedNodes.get(id))
      .filter(Boolean);

    let targetY: number;
    if (placedParents.length > 0) {
      targetY = placedParents.reduce((sum: number, p: any) => sum + p.position.y, 0) / placedParents.length;
    } else {
      targetY = preferredY ?? LAYOUT_CONFIG.ROOT_START_Y;
    }

    const colKey = Math.floor(x / 100);
    let finalY = Math.max(targetY, columnWatermarks.get(colKey) || LAYOUT_CONFIG.ROOT_START_Y);

    let foundSpot = false;
    while (!foundSpot) {
      const overlap = Array.from(positionedNodes.values()).find(n =>
        Math.abs(n.position.x - x) < LAYOUT_CONFIG.NODE_WIDTH_BOUND &&
        Math.abs(n.position.y - finalY) < LAYOUT_CONFIG.NODE_HEIGHT_BOUND
      );
      if (overlap) {
        finalY += LAYOUT_CONFIG.NUDGE_STEP;
      } else {
        foundSpot = true;
      }
    }

    [colKey - 1, colKey, colKey + 1].forEach(b =>
      columnWatermarks.set(b, finalY + LAYOUT_CONFIG.MIN_Y_GAP)
    );

    positionedNodes.set(node.id, { ...node, position: { x, y: finalY } });

    const childrenIds = adjacency.get(node.id) || [];
    const children = rawNodes.filter(n => childrenIds.includes(n.id));
    children.forEach((child, i) => {
      const spreadOffset = (i * LAYOUT_CONFIG.MIN_Y_GAP) - ((children.length - 1) * (LAYOUT_CONFIG.MIN_Y_GAP / 2));
      placeNode(child, depth + 1, finalY + spreadOffset);
    });
  };

  const roots = rawNodes.filter(
    n => !parentsOf.has(n.id) || n.payload?.type === 'database' || n.payload?.type === 'standards'
  );
  roots.sort((a, b) =>
    (typeXBase[a.payload?.type || 'other'] || 0) - (typeXBase[b.payload?.type || 'other'] || 0)
  );
  roots.forEach(root => placeNode(root, 0));
  rawNodes.forEach(node => placeNode(node, 0));

  // Persist with the correct strategy: bulkAdd for new (isolation) mode, bulkPut for sync mode
  if (forceNewIds) {
    try {
      await db.nodes.bulkAdd(Array.from(positionedNodes.values()));
      await db.edges.bulkAdd(edges);
    } catch (error: any) {
      console.warn('bulkAdd failed in isolation mode, falling back to bulkPut:', error);
      await db.nodes.bulkPut(Array.from(positionedNodes.values()));
      await db.edges.bulkPut(edges);
    }
  } else {
    // SYNC MODE: Always use bulkPut to update existing records efficiently
    await db.nodes.bulkPut(Array.from(positionedNodes.values()));
    await db.edges.bulkPut(edges);
  }

  return { count: positionedNodes.size, nodeIds: Array.from(positionedNodes.keys()) };
}

/**
 * Recalculates spatial layout for a given set of nodes.
 * Useful for cleanup after manual dragging or during batch operations.
 */
export async function performAutoLayout(nodeIds: string[], config: typeof LAYOUT_CONFIG = LAYOUT_CONFIG) {
  if (nodeIds.length === 0) return;
  
  const rawNodes = await db.nodes.bulkGet(nodeIds);
  const nodes = rawNodes.filter((n): n is any => n !== undefined);
  
  const edges = await db.edges.where('sourceId').anyOf(nodeIds)
    .or('targetId').anyOf(nodeIds)
    .toArray();
  
  // Filter edges to only those connecting nodes within the set
  const internalEdges = edges.filter(e => nodeIds.includes(e.sourceId) && nodeIds.includes(e.targetId));

  const adjacency = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();
  internalEdges.forEach(e => {
    adjacency.set(e.sourceId, [...(adjacency.get(e.sourceId) || []), e.targetId]);
    parentsOf.set(e.targetId, [...(parentsOf.get(e.targetId) || []), e.sourceId]);
  });

  const positionedNodes = new Map<string, any>();
  const columnWatermarks = new Map<number, number>();
  const typeXBase = getXBase(config);

  const placeNode = (node: any, depth: number, preferredY?: number) => {
    if (positionedNodes.has(node.id)) return;

    const type = node.payload?.type || 'other';
    const baseX = typeXBase[type] ?? config.COLUMN_WIDTH * 4;
    const x = baseX + (depth * config.NESTING_OFFSET);

    const placedParents = (parentsOf.get(node.id) || [])
      .map(id => positionedNodes.get(id))
      .filter(Boolean);

    let targetY: number;
    if (placedParents.length > 0) {
      targetY = placedParents.reduce((sum: number, p: any) => sum + p.position.y, 0) / placedParents.length;
    } else {
      targetY = preferredY ?? config.ROOT_START_Y;
    }

    const colKey = Math.floor(x / 100);
    let finalY = Math.max(targetY, columnWatermarks.get(colKey) || config.ROOT_START_Y);

    let foundSpot = false;
    while (!foundSpot) {
      const overlap = Array.from(positionedNodes.values()).find(n =>
        Math.abs(n.position.x - x) < config.NODE_WIDTH_BOUND &&
        Math.abs(n.position.y - finalY) < config.NODE_HEIGHT_BOUND
      );
      if (overlap) {
        finalY += config.NUDGE_STEP;
      } else {
        foundSpot = true;
      }
    }

    [colKey - 1, colKey, colKey + 1].forEach(b =>
      columnWatermarks.set(b, finalY + config.MIN_Y_GAP)
    );

    positionedNodes.set(node.id, { ...node, position: { x, y: finalY } });

    const childrenIds = adjacency.get(node.id) || [];
    const children = nodes.filter(n => childrenIds.includes(n.id));
    children.forEach((child, i) => {
      const spreadOffset = (i * config.MIN_Y_GAP) - ((children.length - 1) * (config.MIN_Y_GAP / 2));
      placeNode(child, depth + 1, finalY + spreadOffset);
    });
  };

  const roots = nodes.filter(
    n => !parentsOf.has(n.id) || n.payload?.type === 'database' || n.payload?.type === 'standards'
  );
  roots.sort((a, b) =>
    (typeXBase[a.payload?.type || 'other'] || 0) - (typeXBase[b.payload?.type || 'other'] || 0)
  );
  roots.forEach(root => placeNode(root, 0));
  nodes.forEach(node => placeNode(node, 0));

  await db.nodes.bulkPut(Array.from(positionedNodes.values()));
}

/**
 * Server-path ingestion: reads files via Next.js server action, then layouts.
 */
export async function ingestWorkspace(basePath: string, forceNewIds: boolean = true): Promise<{ count: number; nodeIds: string[] }> {
  try {
    const workspaceId = basePath || 'default';
    const fileContents = await readWorkspaceFiles(basePath);
    return await layoutAndPersist(fileContents, workspaceId, forceNewIds);
  } catch (error) {
    console.error('Workspace ingestion failed:', error);
    throw error;
  }
}

/**
 * PURE SYNC: Updates existing nodes in-place without re-calculating layout or edges.
 */
export async function syncNodesFromFiles(
  fileContents: { content: string; filepath: string }[],
  workspaceId: string
): Promise<{ count: number }> {
  if (fileContents.length === 0) return { count: 0 };

  const existingNodes = await db.nodes.where('workspaceId').equals(workspaceId).toArray();
  const filenameToId = new Map(existingNodes.map(n => [n.payload.filename, n.id]));

  let updatedCount = 0;
  const updates: any[] = [];

  for (const doc of fileContents) {
    const existingId = filenameToId.get(doc.filepath);
    if (!existingId) continue; // Skip files not on canvas

    const existingNode = existingNodes.find(n => n.id === existingId);
    if (!existingNode) continue;

    const { node } = parseMarkdownToNode(doc.content, workspaceId, false);
    
    // Merge new content into existing node, PRESERVING position and ID
    updates.push({
      ...existingNode,
      payload: {
        ...existingNode.payload,
        ...node.payload,
        content: node.payload.content,
        filename: doc.filepath
      },
      lastModified: Date.now()
    });
    updatedCount++;
  }

  if (updates.length > 0) {
    await db.nodes.bulkPut(updates);
  }

  return { count: updatedCount };
}
