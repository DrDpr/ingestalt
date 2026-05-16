'use client';

import { useState } from 'react';
import { db } from '../db';

export function useGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateApiFromDb = async (dbNode: any, selectedColumns: string[]) => {
    if (!dbNode || selectedColumns.length === 0) return;

    setIsGenerating(true);
    try {
      // 1. Call our Next.js API (to be created)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'database',
          targetType: 'api',
          context: {
            tableName: dbNode.payload?.title || 'UnknownTable',
            columns: selectedColumns,
          }
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      const result = await response.json();

      // 2. Create the new API Node in IndexedDB
      const newNodeId = `node_api_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.nodes.add({
        id: newNodeId,
        configId: 'node_standards_api', // Governed by the API standard
        workspaceId: 'default',
        position: { 
          x: dbNode.position.x + 300, 
          y: dbNode.position.y 
        },
        lastModified: Date.now(),
        payload: {
          title: `${dbNode.payload?.title} API`,
          type: 'api',
          content: result.markdown || '# Generated API\nNo content returned.',
          methods: result.methods || [],
          tags: ['generated', 'ai-sync']
        }
      });

      // 3. Create a relationship edge
      await db.edges.add({
        id: `edge_${dbNode.id}_${newNodeId}`,
        workspaceId: 'default',
        sourceId: dbNode.id,
        targetId: newNodeId,
        type: 'serves'
      });

      return newNodeId;
    } catch (err) {
      console.error('[Generator] Error:', err);
      alert('AI Generation failed. Check console.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateApiFromDb,
    isGenerating
  };
}
