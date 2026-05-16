'use client';

import { readWorkspaceFiles } from '@/app/actions/ingest';
import { db } from './db';
import { parseMarkdownToNode } from './parser';

/**
 * ARCHITECTURAL LAYOUT CONFIGURATION
 */
const LAYOUT_CONFIG = {
  COLUMN_WIDTH: 250,
  NESTING_OFFSET: 60,
  MIN_Y_GAP: 20,
  NODE_WIDTH_BOUND: 300,
  NODE_HEIGHT_BOUND: 80,
  NUDGE_STEP: 40,
  ROOT_START_Y: 50,
};

const TYPE_X_BASE: Record<string, number> = {
  database: 0,
  api: LAYOUT_CONFIG.COLUMN_WIDTH,
  hook: LAYOUT_CONFIG.COLUMN_WIDTH * 2,
  frontend: LAYOUT_CONFIG.COLUMN_WIDTH * 3,
  standards: -LAYOUT_CONFIG.COLUMN_WIDTH,
  horizonDoc: -LAYOUT_CONFIG.COLUMN_WIDTH * 2,
  other: LAYOUT_CONFIG.COLUMN_WIDTH * 4
};

/**
 * Shared layout + persistence engine.
 * Accepts raw file contents, runs the "Solid Geometry" auto-layout,
 * then writes positioned nodes and edges to IndexedDB.
 * Used by both server-path and FSA ingestion.
 */
export async function layoutAndPersist(
  fileContents: { content: string; filepath: string }[],
  workspaceId: string = 'default',
  forceNewIds: boolean = true
): Promise<{ count: number; nodeIds: string[] }> {
  if (fileContents.length === 0) return { count: 0, nodeIds: [] };

  const parsedResults = fileContents.map((doc) => {
    const result = parseMarkdownToNode(doc.content, workspaceId, forceNewIds);
    // Backlink the physical filename so the sync engine writes to the right file
    result.node.payload.filename = doc.filepath;
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

  const placeNode = (node: any, depth: number, preferredY?: number) => {
    if (positionedNodes.has(node.id)) return;

    const type = node.payload?.type || 'other';
    const baseX = TYPE_X_BASE[type] ?? LAYOUT_CONFIG.COLUMN_WIDTH * 4;
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
    (TYPE_X_BASE[a.payload?.type || 'other'] || 0) - (TYPE_X_BASE[b.payload?.type || 'other'] || 0)
  );
  roots.forEach(root => placeNode(root, 0));
  rawNodes.forEach(node => placeNode(node, 0));

  // Use bulkAdd to ensure we're creating new records, not updating existing ones
  // This is crucial for data forking - each ingestion creates independent instances
  try {
    await db.nodes.bulkAdd(Array.from(positionedNodes.values()));
    await db.edges.bulkAdd(edges);
  } catch (error: any) {
    // If there are duplicate keys (shouldn't happen with forceNewIds), fall back to bulkPut
    console.warn('bulkAdd failed, falling back to bulkPut:', error);
    await db.nodes.bulkPut(Array.from(positionedNodes.values()));
    await db.edges.bulkPut(edges);
  }

  return { count: positionedNodes.size, nodeIds };
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
