import { HorizonNode, HorizonEdge } from '../db';

export function generateProfessionalWiki(nodes: HorizonNode[], edges: HorizonEdge[] = [], standards: HorizonNode[] = []): string {
  const sortedNodes = [...nodes].sort((a, b) => 
    (a.payload?.title || '').localeCompare(b.payload?.title || '')
  );

  const serializedNodes = JSON.stringify(sortedNodes);
  const serializedEdges = JSON.stringify(edges);
  const serializedStandards = JSON.stringify(standards);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation Wiki</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" id="hljs-theme">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #ffffff;
      --fg: #1a1a1a;
      --sidebar-bg: #f9fafb;
      --border: #e5e7eb;
      --accent: #2563eb;
      --accent-soft: #eff6ff;
      --muted: #6b7280;
      --code-bg: #f3f4f6;
      --nav-hover: #f3f4f6;
    }

    .dark {
      --bg: #0b0e14;
      --fg: #e5e7eb;
      --sidebar-bg: #11141d;
      --border: #1f2937;
      --accent: #3b82f6;
      --accent-soft: #1e293b;
      --muted: #9ca3af;
      --code-bg: #1a1f2e;
      --nav-hover: #1a1f2e;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.6;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar */
    aside {
      width: 300px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .sidebar-header h1 {
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-container {
      padding: 1rem 1.5rem;
    }

    #search-input {
      width: 100%;
      padding: 0.6rem 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      color: var(--fg);
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }

    #search-input:focus {
      border-color: var(--accent);
    }

    nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }

    .nav-group {
      margin-bottom: 1.5rem;
    }

    .nav-group-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      margin-bottom: 0.5rem;
      padding: 0 0.5rem;
    }

    .nav-item {
      display: block;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      text-decoration: none;
      color: var(--fg);
      font-size: 0.9rem;
      transition: all 0.2s;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-item:hover {
      background: var(--nav-hover);
    }

    .nav-item.active {
      background: var(--accent-soft);
      color: var(--accent);
      font-weight: 500;
    }

    .nav-item .nav-badge {
      float: right;
      font-size: 0.65rem;
      opacity: 0.5;
    }

    /* Search Results */
    .search-result-snippet {
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 0.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .highlight {
      background: rgba(59, 130, 246, 0.2);
      color: var(--accent);
      padding: 0 2px;
      border-radius: 2px;
    }

    /* Relationship Section */
    .relations-section {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
    }

    .relations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .relation-card {
      padding: 1rem;
      background: var(--sidebar-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      text-decoration: none;
      color: var(--fg);
      transition: all 0.2s;
    }

    .relation-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }

    .relation-type {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }

    .relation-title {
      font-weight: 600;
      font-size: 0.9rem;
    }

    /* Properties Table & Interpreters */
    .properties-box {
      background: var(--sidebar-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .field-container {
      margin-bottom: 2rem;
    }

    .field-container:last-child { margin-bottom: 0; }

    .field-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
      opacity: 0.7;
    }

    .property-row {
      display: flex;
      justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
    }

    .property-row:last-child { border: none; }
    .property-label { color: var(--muted); font-weight: 500; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; }
    .property-value { font-weight: 600; }

    /* Schema Table Styling */
    .wiki-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .wiki-table th {
      background: var(--nav-hover);
      padding: 0.75rem;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.65rem;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
    }

    .wiki-table td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .wiki-table tr:last-child td { border-bottom: none; }

    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* List Item Styling */
    .wiki-list-item {
      padding: 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .wiki-list-item-title {
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
      color: var(--accent);
    }

    .wiki-list-item-desc {
      font-size: 0.8rem;
      color: var(--muted);
    }

    /* Process Flow */
    .flow-step {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      position: relative;
    }

    .flow-number {
      width: 24px;
      height: 24px;
      background: var(--accent);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
      flex-shrink: 0;
      z-index: 2;
    }

    .flow-content {
      padding-top: 2px;
    }

    /* Governance Manifest Styling */
    .manifest-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border-left: 4px solid var(--accent);
    }

    .manifest-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }

    .manifest-type-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--muted);
      font-weight: 700;
    }

    .manifest-category {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--accent);
      background: var(--accent-soft);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }

    .manifest-field-row {
      display: grid;
      grid-template-columns: 1fr 1fr 100px;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.8rem;
    }

    .manifest-field-row:last-child { border-bottom: none; }

    .manifest-field-name { font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .manifest-field-type { color: var(--accent); font-weight: 500; }

    /* Tags */
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .tag-pill {
      font-size: 0.7rem;
      background: var(--nav-hover);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      color: var(--muted);
    }

    /* Interlinks */
    .prose a[href^="#"] {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px dashed var(--accent);
      transition: all 0.2s;
    }

    .prose a[href^="#"]:hover {
      background: var(--accent-soft);
      border-bottom-style: solid;
    }

    .prose a[href^="#"]::before {
      content: "⚓ ";
      font-size: 0.8em;
      opacity: 0.5;
    }

    /* Main Content */
    main {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    header {
      height: 64px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 2rem;
      gap: 1rem;
      background: var(--bg);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .theme-toggle {
      background: none;
      border: 1px solid var(--border);
      color: var(--fg);
      padding: 0.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .theme-toggle:hover {
      background: var(--nav-hover);
    }

    #content-area {
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
      padding: 4rem 2rem;
    }

    .page-header {
      margin-bottom: 3rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .page-meta {
      display: flex;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: var(--muted);
    }

    .badge {
      background: var(--accent-soft);
      color: var(--accent);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.7rem;
    }

    /* Markdown Styles */
    .prose h2 { font-size: 1.75rem; margin: 2rem 0 1rem; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    .prose h3 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; font-weight: 600; }
    .prose p { margin-bottom: 1.25rem; }
    .prose ul, .prose ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
    .prose li { margin-bottom: 0.5rem; }
    .prose blockquote { border-left: 4px solid var(--accent); padding-left: 1rem; color: var(--muted); font-style: italic; margin: 1.5rem 0; }
    
    .prose code {
      font-family: 'JetBrains Mono', monospace;
      background: var(--code-bg);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }

    .prose pre {
      background: var(--code-bg);
      padding: 1.5rem;
      border-radius: 0.75rem;
      overflow-x: auto;
      margin: 1.5rem 0;
      border: 1px solid var(--border);
    }

    .prose pre code {
      background: none;
      padding: 0;
      font-size: 0.9rem;
    }

    .prose img { max-width: 100%; border-radius: 0.75rem; margin: 1.5rem 0; }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      color: var(--muted);
      text-align: center;
    }

    .empty-state h2 { color: var(--fg); margin-bottom: 0.5rem; }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--muted); }
  </style>
</head>
<body>
  <aside>
    <div class="sidebar-header">
      <h1><span>📚</span> Wiki</h1>
    </div>
    <div class="search-container">
      <input type="text" id="search-input" placeholder="Search documentation..." autocomplete="off">
    </div>
    <nav id="sidebar-nav">
      <div class="nav-group">
        <div class="nav-group-title">Articles</div>
        <div id="nav-items-container">
          <!-- Items will be injected here -->
        </div>
      </div>
    </nav>
  </aside>

  <main>
    <header>
      <button class="theme-toggle" id="theme-toggle">
        <span id="theme-icon">🌙</span>
        <span id="theme-text">Dark Mode</span>
      </button>
    </header>

    <div id="content-area">
      <div id="page-content" class="prose">
        <!-- Content will be injected here -->
      </div>
    </div>
  </main>

  <script>
    const nodes = ${serializedNodes};
    const edges = ${serializedEdges};
    const standards = ${serializedStandards};
    let currentNodeId = null;

    // Initialize marked with highlight.js
    marked.setOptions({
      highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: 'hljs language-'
    });

    function renderNav(filter = '') {
      const container = document.getElementById('nav-items-container');
      const isSearching = filter.length > 0;
      
      if (isSearching) {
        const filteredNodes = nodes.filter(node => 
          (node.payload?.title || '').toLowerCase().includes(filter.toLowerCase()) ||
          (node.payload?.content || '').toLowerCase().includes(filter.toLowerCase()) ||
          (node.payload?.tags || []).some(t => t.toLowerCase().includes(filter.toLowerCase()))
        );

        container.innerHTML = \`
          <div class="nav-group-title">Search Results</div>
          \${filteredNodes.map(node => {
            const content = node.payload?.content || '';
            const idx = content.toLowerCase().indexOf(filter.toLowerCase());
            let snippet = '';
            if (idx !== -1) {
              const start = Math.max(0, idx - 40);
              const end = Math.min(content.length, idx + 80);
              snippet = (start > 0 ? '...' : '') + 
                content.substring(start, end).replace(new RegExp(filter, 'gi'), match => \`<span class="highlight">\${match}</span>\`) +
                (end < content.length ? '...' : '');
            }

            return \`
              <a class="nav-item \${node.id === currentNodeId ? 'active' : ''}" 
                 onclick="navigateTo('\${node.id}')">
                <div class="relation-title">\${node.payload?.title || 'Untitled'}</div>
                \${snippet ? \`<div class="search-result-snippet">\${snippet}</div>\` : ''}
              </a>
            \`;
          }).join('')}
        \`;
      } else {
        // Group by type
        const groups = {};
        nodes.forEach(node => {
          const type = node.payload?.type || 'Other';
          if (!groups[type]) groups[type] = [];
          groups[type].push(node);
        });

        container.innerHTML = Object.entries(groups).map(([type, typeNodes]) => \`
          <div class="nav-group">
            <div class="nav-group-title">\${type}</div>
            \${typeNodes.map(node => \`
              <a class="nav-item \${node.id === currentNodeId ? 'active' : ''}" 
                 onclick="navigateTo('\${node.id}')">
                \${node.payload?.title || 'Untitled'}
                <span class="nav-badge">\${(node.payload?.tags || []).length || ''}</span>
              </a>
            \`).join('')}
          </div>
        \`).join('');
      }
    }

    // Custom renderer for interlinks
    const renderer = new marked.Renderer();
    const originalLink = renderer.link.bind(renderer);
    renderer.link = (href, title, text) => {
      // If href matches a node ID, make it an internal navigation link
      if (nodes.some(n => n.id === href)) {
        return \`<a href="#\${href}" onclick="navigateTo('\${href}'); return false;" title="\${title || ''}">\${text}</a>\`;
      }
      // Standard markdown links with target="_blank"
      return \`<a href="\${href}" title="\${title || ''}" target="_blank" rel="noopener noreferrer">\${text}</a>\`;
    };

    function navigateTo(id) {
      currentNodeId = id;
      const node = nodes.find(n => n.id === id);
      const contentEl = document.getElementById('page-content');
      
      if (!node) {
        contentEl.innerHTML = \`
          <div class="empty-state">
            <h2>Select an article</h2>
            <p>Choose a document from the sidebar to start reading.</p>
          </div>
        \`;
        return;
      }
      
      // Pre-process WikiLinks [[ID]] or [[ID|Label]]
      let content = node.payload?.content || '*No content available.*';
      content = content.replace(/\\[\\[([^|\\]]+)(?:\\|([^\\]]+))?\\]\\]/g, (match, linkId, label) => {
        const targetNode = nodes.find(n => n.id === linkId);
        if (targetNode) {
          return \`[\${label || targetNode.payload?.title || linkId}](\${linkId})\`;
        }
        return match;
      });

      const htmlContent = marked.parse(content, { renderer });
      
      // Calculate relationships
      const outgoing = edges.filter(e => e.sourceId === id);
      const incoming = edges.filter(e => e.targetId === id);

      const relatedNodes = (edgeList, isIncoming) => {
        return edgeList.map(edge => {
          const targetId = isIncoming ? edge.sourceId : edge.targetId;
          const targetNode = nodes.find(n => n.id === targetId);
          if (!targetNode) return null;
          return { node: targetNode, type: edge.type };
        }).filter(Boolean);
      };

      const forwardLinks = relatedNodes(outgoing, false);
      const backLinks = relatedNodes(incoming, true);

      // Find standard definition
      let standardDef = null;
      for (const s of standards) {
        const def = (s.payload?.definitions || []).find(d => d.id === node.configId);
        if (def) { standardDef = def; break; }
        if (s.id === node.configId) { standardDef = s.payload; break; }
      }

      function renderField(field, data) {
        if (data === undefined || data === null) return '';

        let html = \`<div class="field-container">\`;
        html += \`<div class="field-header" style="color: \${field.color || 'inherit'}">\${field.name.replace(/_/g, ' ')}</div>\`;

        if (field.type === 'schema_table') {
          html += \`<table class="wiki-table"><thead><tr><th>Field</th><th>Type / Details</th></tr></thead><tbody>\`;
          (Array.isArray(data) ? data : []).forEach(col => {
            const colString = typeof col === 'string' ? col : col.name;
            const match = colString.match(/^(.*?)(?:\\\\s*\\\\((.*?)\\\\))?$/);
            html += \`<tr><td class="font-mono">\${match?.[1] || colString}</td><td class="muted font-mono">\${match?.[2] || ''}</td></tr>\`;
          });
          html += \`</tbody></table>\`;
        } else if (field.type === 'tables_list') {
          (Array.isArray(data) ? data : []).forEach(table => {
            html += \`<div style="margin-bottom: 1rem;"><div class="property-label font-mono" style="margin-bottom: 0.5rem; color: var(--accent)">TABLE: \${table.name}</div>\`;
            html += \`<table class="wiki-table"><thead><tr><th>Column</th><th>Details</th></tr></thead><tbody>\`;
            (table.columns || []).forEach(col => {
              const colString = typeof col === 'string' ? col : col.name;
              const match = colString.match(/^(.*?)(?:\\\\s*\\\\((.*?)\\\\))?$/);
              html += \`<tr><td class="font-mono">\${match?.[1] || colString}</td><td class="muted font-mono">\${match?.[2] || ''}</td></tr>\`;
            });
            html += \`</tbody></table></div>\`;
          });
        } else if (field.type === 'interface_list') {
          (Array.isArray(data) ? data : []).forEach(item => {
            html += \`<div class="wiki-list-item"><div class="wiki-list-item-title font-mono">\${item.name}()</div><div class="wiki-list-item-desc">\${item.description}</div></div>\`;
          });
        } else if (field.type === 'code_list') {
          (Array.isArray(data) ? data : []).forEach(snip => {
            html += \`<div style="margin-bottom: 1rem;"><div class="property-label font-mono" style="margin-bottom: 0.25rem;">\${snip.name}</div><pre class="font-mono" style="margin: 0; padding: 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: 0.5rem;"><code>\${snip.code}</code></pre></div>\`;
          });
        } else if (field.type === 'story_list') {
          (Array.isArray(data) ? data : []).forEach(story => {
            const text = typeof story === 'string' ? story : story.text;
            const isDone = typeof story === 'string' ? false : !!story.done;
            html += \`<div class="wiki-list-item" style="display: flex; gap: 0.75rem; align-items: center; \${isDone ? 'opacity: 0.6' : ''}">
              <div style="width: 14px; height: 14px; border: 1px solid var(--border); border-radius: 3px; display: flex; align-items: center; justify-content: center; background: \${isDone ? 'var(--accent)' : 'transparent'}">\${isDone ? '✓' : ''}</div>
              <div style="\${isDone ? 'text-decoration: line-through' : ''}">\${text}</div>
            </div>\`;
          });
        } else if (field.type === 'flow_list') {
          (Array.isArray(data) ? data : []).forEach((step, i) => {
            html += \`<div class="flow-step"><div class="flow-number">\${i+1}</div><div class="flow-content"><div class="relation-title">\${step.action}</div><div class="wiki-list-item-desc">\${step.description}</div></div></div>\`;
          });
        } else if (Array.isArray(data)) {
           html += \`<div class="tags-container">\${data.map(t => \`<span class="tag-pill">\${t}</span>\`).join('')}</div>\`;
        } else if (typeof data === 'object') {
           html += \`<pre class="font-mono" style="background: var(--bg); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; font-size: 0.75rem;">\${JSON.stringify(data, null, 2)}</pre>\`;
        } else {
           html += \`<div class="property-value">\${data}</div>\`;
        }

        html += \`</div>\`;
        return html;
      }

      function renderGovernanceManifest(definitions) {
        if (!definitions || !definitions.length) return '';
        
        let html = \`<div class="relations-section" style="margin-top: 0; border-top: none;">\`;
        html += \`<div class="nav-group-title">Governance Manifest</div>\`;
        
        definitions.forEach(def => {
          html += \`
            <div class="manifest-card" style="border-left-color: \${def.color || 'var(--accent)'}">
              <div class="manifest-header">
                <div class="manifest-type-id">\${def.id}</div>
                <div class="manifest-category" style="color: \${def.color || 'var(--accent)'}; background: \${def.color ? def.color + '15' : 'var(--accent-soft)'}">\${def.type}</div>
              </div>
              <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--muted);">
                <span>Icon: \${def.icon || 'Box'}</span>
                <span style="width: 12px; height: 12px; border-radius: 2px; background: \${def.color || '#888888'}"></span>
                <span>\${def.color || '#888888'}</span>
              </div>
              
              <div class="wiki-table" style="background: transparent; border: none;">
                <div class="nav-group-title" style="padding-left: 0.5rem; margin-bottom: 0.5rem;">Property Schema</div>
                <div class="manifest-field-row" style="background: var(--nav-hover); border-radius: 4px; font-weight: 800; font-size: 0.65rem; color: var(--muted);">
                  <div>PROPERTY</div>
                  <div>DATA TYPE</div>
                  <div>ICON</div>
                </div>
                \${(def.fields || []).map(field => \`
                  <div class="manifest-field-row">
                    <div class="manifest-field-name">\${field.name}</div>
                    <div class="manifest-field-type">\${field.type}</div>
                    <div style="font-size: 0.7rem; opacity: 0.6;">\${field.icon || 'Box'}</div>
                  </div>
                \`).join('')}
              </div>
            </div>
          \`;
        });
        
        html += \`</div>\`;
        return html;
      }

      contentEl.innerHTML = \`
        <div class="page-header">
          <div class="page-meta">
            <span class="badge">\${node.payload?.type || 'article'}</span>
            <span>Last modified: \${new Date(node.lastModified).toLocaleDateString()}</span>
          </div>
          <h1>\${node.payload?.title || 'Untitled'}</h1>
          <div class="tags-container">
            \${(node.payload?.tags || []).map(t => \`<span class="tag-pill">#\${t}</span>\`).join('')}
          </div>
        </div>

        <div class="properties-box">
          <div class="field-header">SYSTEM CORE</div>
          <div class="property-row">
            <span class="property-label">NODE_ID</span>
            <span class="property-value font-mono">\${node.id}</span>
          </div>
          <div class="property-row">
            <span class="property-label">NODE_TYPE</span>
            <span class="property-value font-mono uppercase">\${node.payload?.type || 'unknown'}</span>
          </div>
          
          <div style="margin-top: 2rem;"></div>

          \${standardDef && standardDef.fields ? 
            standardDef.fields.map(f => renderField(f, node.payload[f.name])).join('') :
            Object.entries(node.payload || {})
              .filter(([k]) => !['title', 'content', 'type', 'tags', 'definitions'].includes(k))
              .map(([k, v]) => \`
                <div class="property-row">
                  <span class="property-label">\${k.toUpperCase()}</span>
                  <span class="property-value">\${typeof v === 'object' ? JSON.stringify(v) : v}</span>
                </div>
              \`).join('')
          }
        </div>

        <div class="prose">
          \${htmlContent}
        </div>

        \${node.payload?.type === 'standards' ? renderGovernanceManifest(node.payload?.definitions) : ''}

        \${forwardLinks.length > 0 || backLinks.length > 0 ? \`
          <div class="relations-section">
            <div class="nav-group-title">Relationships</div>
            <div class="relations-grid">
              \${forwardLinks.map(rel => \`
                <a class="relation-card" onclick="navigateTo('\${rel.node.id}')">
                  <div class="relation-type">Refers to (\${rel.type})</div>
                  <div class="relation-title">\${rel.node.payload?.title}</div>
                </a>
              \`).join('')}
              \${backLinks.map(rel => \`
                <a class="relation-card" onclick="navigateTo('\${rel.node.id}')">
                  <div class="relation-type">Referenced by (\${rel.type})</div>
                  <div class="relation-title">\${rel.node.payload?.title}</div>
                </a>
              \`).join('')}
            </div>
          </div>
        \` : ''}
      \`;

      // Trigger highlight.js for any new code blocks
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });

      renderNav(document.getElementById('search-input').value);
      
      // Scroll to top
      document.querySelector('main').scrollTop = 0;

      // Update URL hash without reload
      window.location.hash = id;
    }

    // Search functionality
    document.getElementById('search-input').addEventListener('input', (e) => {
      renderNav(e.target.value);
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const hljsTheme = document.getElementById('hljs-theme');

    themeToggle.addEventListener('click', () => {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        document.getElementById('theme-icon').innerText = '☀️';
        document.getElementById('theme-text').innerText = 'Light Mode';
        hljsTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
      } else {
        html.classList.add('dark');
        document.getElementById('theme-icon').innerText = '🌙';
        document.getElementById('theme-text').innerText = 'Dark Mode';
        hljsTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
      }
    });

    // Initialize
    window.addEventListener('load', () => {
      const hash = window.location.hash.substring(1);
      if (hash && nodes.some(n => n.id === hash)) {
        navigateTo(hash);
      } else if (nodes.length > 0) {
        navigateTo(nodes[0].id);
      } else {
        navigateTo(null);
      }
    });

    // Handle back/forward buttons
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.substring(1);
      if (hash && hash !== currentNodeId) {
        navigateTo(hash);
      }
    });
  </script>
</body>
</html>`;
}
