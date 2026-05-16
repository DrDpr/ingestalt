import { db } from './db';
import { parseMarkdownToNode } from './parser';

const MOCK_DOCS = [
  `---
id: node_db_users
title: Users Table
type: database
tags: [core, auth, backend]
columns:
  - name: id (uuid, pk)
  - name: email (string, unique)
  - name: created_at (timestamp)
relations: []
---
# Developer Notes
Ensure RLS policies block public read access to the email column.`,

  `---
id: node_api_getUser
title: Get User Profile
type: api
tags: [auth, backend, supabase]
relations: 
  - target: node_db_users
    type: reads
---
# Implementation Standard
\`\`\`typescript
Calling storage API: 
1. Define Vars 
2. Call useStorage.tsx
\`\`\`
`
];

export async function seedDatabase(workspaceId?: string) {
  const targetWorkspace = workspaceId || 'seed-workspace';
  
  console.log(`Seeding database with initial agnostic nodes to workspace: ${targetWorkspace}...`);
  
  const parsedResults = MOCK_DOCS.map((md) => parseMarkdownToNode(md, targetWorkspace));
  
  const nodes = parsedResults.map(r => r.node);
  const edges = parsedResults.flatMap(r => r.edges);

  await db.nodes.bulkAdd(nodes);
  await db.edges.bulkAdd(edges);
  
  console.log(`Seeding complete: ${nodes.length} nodes and ${edges.length} edges added.`);
}
