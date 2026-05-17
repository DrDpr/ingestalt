import { HorizonNode, HorizonEdge } from '../db';
import { WIKI_STYLES } from './wiki/wikiStyles';
import { getWikiScript } from './wiki/wikiScript';
import { getWikiHtml } from './wiki/wikiTemplate';

export interface WikiOptions {
  title?: string;
  author?: string;
  icon?: string;
  enableProjectRoot?: boolean;
}

export function generateProfessionalWiki(nodes: HorizonNode[], edges: HorizonEdge[] = [], standards: HorizonNode[] = [], options: WikiOptions = {}): string {
  const wikiTitle = options.title || 'Documentation Wiki';
  const author = options.author || 'Ingestalt Spatial Engine';
  const icon = options.icon || '📚';
  const enableProjectRoot = options.enableProjectRoot ?? true;
  
  const sortedNodes = [...nodes].sort((a, b) => 
    (a.payload?.title || '').localeCompare(b.payload?.title || '')
  );

  const serializedNodes = JSON.stringify(sortedNodes);
  const serializedEdges = JSON.stringify(edges);
  const serializedStandards = JSON.stringify(standards);

  const scriptContent = getWikiScript(serializedNodes, serializedEdges, serializedStandards, enableProjectRoot);
  
  return getWikiHtml(wikiTitle, author, WIKI_STYLES, scriptContent, icon, enableProjectRoot);
}
