import matter from 'gray-matter';
import type { HorizonNode, HorizonEdge } from './db';

interface ParsedResult {
  node: HorizonNode;
  edges: HorizonEdge[];
}

/**
 * Parses a raw Markdown string into an Agnostic Node and its associated Edges.
 */
export function parseMarkdownToNode(rawMarkdown: string, workspaceId: string = 'default'): ParsedResult {
  const { data, content } = matter(rawMarkdown);
  
  const id = data.id || `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const configId = data.configId || data.config_id || (data.type ? `node_standards_${data.type}` : 'node_standards_other');
  
  const node: HorizonNode = {
    id,
    configId,
    workspaceId,
    position: data.position || { x: 0, y: 0 },
    lastModified: Date.now(),
    payload: {
      title: data.title || 'Untitled Node',
      content: content.trim(),
      tags: Array.isArray(data.tags) ? data.tags : [],
      type: data.type || 'other',
      // Store all other domain-specific fields in the payload
      ...data
    }
  };

  // Extract edges from the relations array
  const rawRelations = Array.isArray(data.relations) ? data.relations : [];
  const edges: HorizonEdge[] = rawRelations.map((rel: any) => {
    const targetId = rel.targetId || rel.target || '';
    return {
      id: `edge_${id}_${targetId}`,
      workspaceId,
      sourceId: id,
      targetId,
      type: rel.type || 'relates',
      metadata: rel.metadata || {}
    };
  }).filter(edge => edge.targetId !== '');

  return { node, edges };
}
