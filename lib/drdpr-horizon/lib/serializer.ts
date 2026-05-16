import yaml from 'js-yaml';

/**
 * Serializes a Horizon Node back into a Markdown string with YAML frontmatter.
 */
export function serializeNodeToMarkdown(node: any): string {
  const { payload } = node;
  
  // Extract frontmatter fields
  const frontmatter: any = {
    title: payload.title || 'Untitled',
    type: payload.type || 'other',
    configId: node.configId,
  };

  // Add optional fields
  if (payload.tags && payload.tags.length > 0) frontmatter.tags = payload.tags;
  if (payload.filepath) frontmatter.filepath = payload.filepath;
  if (payload.filename) frontmatter.filename = payload.filename;
  if (payload.icon) frontmatter.icon = payload.icon;
  if (payload.color) frontmatter.color = payload.color;
  
  // Add metadata fields (any other payload keys that aren't content)
  Object.keys(payload).forEach(key => {
    if (!['title', 'type', 'content', 'tags', 'filepath', 'filename', 'icon', 'color', 'relations'].includes(key)) {
      frontmatter[key] = payload[key];
    }
  });

  // Handle Relations (derived from Edges, usually passed in node.relations)
  if (node.relations && node.relations.length > 0) {
    frontmatter.relations = node.relations;
  }

  const yamlBlock = yaml.dump(frontmatter).trim();
  const content = payload.content || '';

  return `---\n${yamlBlock}\n---\n\n${content}`;
}
