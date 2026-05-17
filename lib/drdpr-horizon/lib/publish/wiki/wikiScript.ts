export function getWikiScript(serializedNodes: string, serializedEdges: string, serializedStandards: string, enableProjectRoot: boolean = true): string {
  return `
    const nodes = ${serializedNodes};
    const edges = ${serializedEdges};
    const standards = ${serializedStandards};
    const enableProjectRoot = ${enableProjectRoot};
    let currentNodeId = null;
    let basePath = localStorage.getItem('horizon-wiki-base-path') || '';

    // Initialize path input
    const pathInput = document.getElementById('base-path-input');
    const guessBtn = document.getElementById('guess-path-btn');
    
    if (pathInput) {
      pathInput.value = basePath;
      pathInput.addEventListener('change', (e) => updatePath(e.target.value));
    }
    
    const updatePath = (val) => {
      basePath = val.replace(/\\\\/g, '/');
      if (basePath && !basePath.endsWith('/')) basePath += '/';
      localStorage.setItem('horizon-wiki-base-path', basePath);
      if (pathInput) pathInput.value = basePath;
      if (currentNodeId) navigateTo(currentNodeId); 
    };
    
    if (guessBtn) {
      guessBtn.addEventListener('click', () => {
        let path = window.location.pathname;
        // Handle Windows format /C:/...
        if (path.startsWith('/')) path = path.substring(1);
        
        // Remove filename
        const parts = path.split('/');
        parts.pop();
        
        // If we are in a 'docs' or similar subfolder, try to suggest the parent
        if (parts.length > 0 && ['docs', 'wiki', 'out', 'dist'].includes(parts[parts.length-1].toLowerCase())) {
          parts.pop();
        }
        
        const guessed = parts.join('/');
        updatePath(guessed);
      });
    }

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
          \x24{filteredNodes.map(node => {
            const content = node.payload?.content || '';
            const idx = content.toLowerCase().indexOf(filter.toLowerCase());
            let snippet = '';
            if (idx !== -1) {
              const start = Math.max(0, idx - 40);
              const end = Math.min(content.length, idx + 80);
              snippet = (start > 0 ? '...' : '') + 
                content.substring(start, end).replace(new RegExp(filter, 'gi'), match => \`<span class="highlight">\x24{match}</span>\`) +
                (end < content.length ? '...' : '');
            }

            return \`
              <a class="nav-item \x24{node.id === currentNodeId ? 'active' : ''}" 
                 onclick="navigateTo('\x24{node.id}')">
                <div class="relation-title">\x24{node.payload?.title || 'Untitled'}</div>
                \x24{snippet ? \`<div class="search-result-snippet">\x24{snippet}</div>\` : ''}
              </a>
            \`;
          }).join('')}
        \`;
      } else {
        // Build hierarchy tree
        // 1. Group by type
        const groups = {};
        nodes.forEach(node => {
          const type = node.payload?.type || 'Other';
          if (!groups[type]) groups[type] = [];
          groups[type].push(node);
        });

        // 2. Helper to build parent-child links within each type
        function buildTree(typeNodes) {
          const sorted = [...typeNodes].sort((a, b) => {
            const aName = a.payload?.filename || a.id;
            const bName = b.payload?.filename || b.id;
            return aName.length - bName.length;
          });

          const root = [];
          const map = {};

          sorted.forEach(node => {
            map[node.id] = { node, children: [] };
          });

          sorted.forEach(node => {
            const item = map[node.id];
            const nodeName = node.payload?.filename?.replace('.md', '') || node.id;
            
            let parentId = null;
            
            for (const other of sorted) {
              if (other.id === node.id) continue;
              const otherName = other.payload?.filename?.replace('.md', '') || other.id;
              
              if (nodeName.startsWith(otherName + '_')) {
                if (!parentId || otherName.length > (map[parentId]?.node.payload?.filename?.replace('.md', '') || map[parentId]?.node.id).length) {
                  parentId = other.id;
                }
              }
            }

            if (parentId && map[parentId]) {
              map[parentId].children.push(item);
            } else {
              root.push(item);
            }
          });

          const sortByTitle = (a, b) => (a.node.payload?.title || '').localeCompare(b.node.payload?.title || '');
          const sortChildren = (item) => {
            item.children.sort(sortByTitle);
            item.children.forEach(sortChildren);
          };
          root.sort(sortByTitle);
          root.forEach(sortChildren);

          return root;
        }

        // Helper to render tree recursively
        function renderTreeItem(item) {
          const node = item.node;
          const children = item.children;
          const hasChildren = children.length > 0;
          const isCurrentOrParent = node.id === currentNodeId || children.some(c => hasChildrenOfActive(c));
          
          const isCollapsedStored = localStorage.getItem('wiki-tree-collapsed-' + node.id);
          const isCollapsed = isCollapsedStored !== null 
            ? isCollapsedStored === 'true' 
            : !isCurrentOrParent;

          const chevronClass = isCollapsed ? 'tree-chevron collapsed' : 'tree-chevron';
          const childrenClass = isCollapsed ? 'tree-children collapsed' : 'tree-children';

          function hasChildrenOfActive(cItem) {
            if (cItem.node.id === currentNodeId) return true;
            return cItem.children.some(c => hasChildrenOfActive(c));
          }

          return \`
            <div class="tree-node-wrapper">
              <div class="nav-item-wrapper">
                \x24{hasChildren ? \`
                  <div id="\x24{node.id}-chevron" class="\x24{chevronClass}" onclick="toggleGroup('\x24{node.id}', event)">
                    ▾
                  </div>
                \` : '<div style="width: 1.25rem;"></div>'}
                <a class="nav-item \x24{node.id === currentNodeId ? 'active' : ''}" 
                   style="flex: 1; padding-left: 0.5rem;"
                   onclick="navigateTo('\x24{node.id}')">
                  \x24{node.payload?.title || 'Untitled'}
                  <span class="nav-badge">\x24{(node.payload?.tags || []).length || ''}</span>
                </a>
              </div>
              \x24{hasChildren ? \`
                <div id="\x24{node.id}" class="\x24{childrenClass} tree-node-container">
                  \x24{children.map(renderTreeItem).join('')}
                </div>
              \` : ''}
            </div>
          \`;
        }

        container.innerHTML = Object.entries(groups).map(([type, typeNodes]) => {
          const tree = buildTree(typeNodes);
          return \`
            <div class="nav-group">
              <div class="nav-group-title">\x24{type}</div>
              \x24{tree.map(renderTreeItem).join('')}
            </div>
          \`;
        }).join('');
      }
    }

    // Custom renderer for interlinks and headings
    const renderer = new marked.Renderer();
    
    renderer.heading = (arg1, arg2) => {
      let text, level;
      if (typeof arg1 === 'object' && arg1 !== null) {
        text = arg1.text;
        level = arg1.depth;
      } else {
        text = arg1;
        level = arg2;
      }
      const id = (text || '').toString().toLowerCase().replace(/[^\\w]+/g, '-');
      return \`<h\x24{level} id="\x24{id}">\x24{text}</h\x24{level}>\`;
    };

    const originalLink = renderer.link.bind(renderer);
    renderer.link = (arg1, arg2, arg3) => {
      let href, title, text;
      if (typeof arg1 === 'object' && arg1 !== null) {
        ({ href, title, text } = arg1);
      } else {
        href = arg1;
        title = arg2;
        text = arg3;
      }

      // If href matches a node ID, make it an internal navigation link
      if (nodes.some(n => n.id === href)) {
        return \`<a href="#\x24{href}" onclick="event.stopPropagation(); navigateTo('\x24{href}'); return false;" title="\x24{title || ''}">\x24{text}</a>\`;
      }

      // Local anchors for headings
      if (href && href.startsWith('#')) {
        return \`<a href="\x24{href}" title="\x24{title || ''}">\x24{text}</a>\`;
      }

      // VS Code Protocol Support for local files
      const isLocalPath = href && (href.endsWith('.md') || href.endsWith('.ts') || href.endsWith('.tsx') || href.endsWith('.js') || href.endsWith('.jsx') || href.startsWith('../') || href.startsWith('./'));
      
      if (isLocalPath && !href.startsWith('http')) {
        if (!enableProjectRoot) {
          return \`<code>\x24{text}</code>\`;
        }
        if (!basePath) {
          return \`<a href="#" onclick="alert('Please enter your Project Root path at the top of the page first!\\\\n\\\\nExample: d:/Desktop/ingestalt'); return false;" title="Set Project Root to open in VS Code" style="border-bottom: 1px dashed var(--accent); color: var(--accent); cursor: pointer;">\x24{text} ⚙️</a>\`;
        }

        // Clean up relative navigation by resolving ../ and ./
        const baseParts = basePath.split('/').filter(Boolean);
        const relParts = href.split('/');
        const stack = [...baseParts];
        
        for (const p of relParts) {
          if (p === '..') stack.pop();
          else if (p !== '.' && p !== '') stack.push(p);
        }
        
        // On Windows, ensure we have the drive letter format right, e.g. /d:/...
        let absoluteHref = stack.join('/');
        if (!absoluteHref.startsWith('/')) absoluteHref = '/' + absoluteHref;
        
        return \`<a href="vscode://file\x24{absoluteHref}" title="Open in VS Code" style="border-bottom: 1px solid var(--accent); color: var(--accent); cursor: pointer;">\x24{text} ↗</a>\`;
      }

      // Standard markdown links with target="_blank"
      return \`<a href="\x24{href}" title="\x24{title || ''}" target="_blank" rel="noopener noreferrer">\x24{text}</a>\`;
    };

    function scrollToHeading(id) {
      const el = document.getElementById(id);
      const contentArea = document.getElementById('page-content');
      // Only scroll if the target exists and is strictly within the article content
      if (el && contentArea && contentArea.contains(el)) {
        document.querySelector('main').scrollTo({
          top: el.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }

    function navigateTo(id) {
      currentNodeId = id;
      const node = nodes.find(n => n.id === id);
      const contentEl = document.getElementById('page-content');
      const tocArea = document.getElementById('toc-links');
      const tocSidebar = document.getElementById('toc-sidebar');
      
      if (!node) {
        contentEl.innerHTML = \`
          <div class="empty-state">
            <h2>Select an article</h2>
            <p>Choose a document from the sidebar to start reading.</p>
          </div>
        \`;
        tocSidebar.style.display = 'none';
        return;
      }
      
      // Pre-process WikiLinks [[ID]] or [[ID|Label]]
      let bodyContent = node.payload?.content || '*No content available.*';
      
      // De-duplicate title: Remove the first H1 if it exists at the start
      bodyContent = bodyContent.replace(/^#\\s+.*\\n?/, '');

      // Extract headings for TOC
      const headings = [];
      const headingMatches = bodyContent.matchAll(/^#{2,3}\\s+(.*)/gm);
      for (const match of headingMatches) {
        const text = match[1];
        const level = match[0].split(' ')[0].length;
        const hId = text.toLowerCase().replace(/[^\\w]+/g, '-');
        headings.push({ level, text, id: hId });
      }

      // Calculate relationships
      const outgoing = [...edges.filter(e => e.sourceId === id)];
      const incoming = [...edges.filter(e => e.targetId === id)];

      // Merge relationships parsed from node's YAML front-matter relations list!
      const payloadRelations = node.payload?.relations || [];
      if (Array.isArray(payloadRelations)) {
        payloadRelations.forEach(rel => {
          if (rel && rel.targetId && !outgoing.some(e => e.targetId === rel.targetId)) {
            outgoing.push({
              sourceId: id,
              targetId: rel.targetId,
              type: rel.type || 'relates',
              payload: { label: rel.label }
            });
          }
        });
      }

      // Also let's scan all other nodes in the system to see if any refers to this node in their front-matter relations!
      nodes.forEach(otherNode => {
        if (otherNode.id !== id && otherNode.payload?.relations) {
          const otherRels = otherNode.payload.relations;
          if (Array.isArray(otherRels)) {
            otherRels.forEach(rel => {
              if (rel && rel.targetId === id && !incoming.some(e => e.sourceId === otherNode.id)) {
                incoming.push({
                  sourceId: otherNode.id,
                  targetId: id,
                  type: rel.type || 'relates',
                  payload: { label: rel.label }
                });
              }
            });
          }
        }
      });

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

      // Render TOC
      let tocHtml = '';
      if (headings.length > 0) {
        tocHtml += headings.map(h => \`
          <a href="#\x24{h.id}" class="toc-link toc-level-\x24{h.level}">\x24{h.text}</a>
        \`).join('');
      }

      const hasRelations = forwardLinks.length > 0 || backLinks.length > 0;
      if (hasRelations) {
        tocHtml += \`
          <div style="margin: 1.5rem 0 0.5rem; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em;">Related Links</div>
        \`;
        
        forwardLinks.forEach(rel => {
          tocHtml += \`<a href="#\x24{rel.node.id}" onclick="navigateTo('\x24{rel.node.id}')" class="toc-link" style="font-size: 0.75rem; border-left-color: transparent;">↗ \x24{rel.node.payload?.title}</a>\`;
        });
        backLinks.forEach(rel => {
          tocHtml += \`<a href="#\x24{rel.node.id}" onclick="navigateTo('\x24{rel.node.id}')" class="toc-link" style="font-size: 0.75rem; border-left-color: transparent;">↙ \x24{rel.node.payload?.title}</a>\`;
        });
      }

      if (headings.length > 0 || hasRelations) {
        tocSidebar.style.display = 'block';
        tocArea.innerHTML = tocHtml;
      } else {
        tocSidebar.style.display = 'none';
      }

      bodyContent = bodyContent.replace(/\\\\\\[\\\\\\[([^|\\\\\\\\]]+)(?:\\\\|([^\\\\\\\\]]+))?\\\\\\\\]\\\\\\\\]/g, (match, linkId, label) => {
        const targetNode = nodes.find(n => n.id === linkId);
        if (targetNode) {
          return \`[\x24{label || targetNode.payload?.title || linkId}](\x24{linkId})\`;
        }
        return match;
      });

      const htmlContent = marked.parse(bodyContent, { renderer });
      
      // Find standard definition
      let standardDef = null;
      for (const s of standards) {
        const def = (s.payload?.definitions || []).find(d => d.id === node.configId);
        if (def) { standardDef = def; break; }
        if (s.id === node.configId) { standardDef = s.payload; break; }
      }

      const propertyFields = standardDef && standardDef.fields ? 
        standardDef.fields.map(f => renderField(f, (node.payload || {})[f.name])).filter(h => h).join('') :
        Object.entries(node.payload || {})
          .filter(([k]) => !['title', 'content', 'type', 'tags', 'definitions', 'id', 'color', 'icon', 'filename', 'configId', 'relations'].includes(k))
          .map(([k, v]) => \`
            <div class="property-row">
              <span class="property-label">\x24{k.toUpperCase()}</span>
              <span class="property-value">\x24{typeof v === 'object' ? JSON.stringify(v) : v}</span>
            </div>
          \`).join('');

      function renderField(field, data) {
        if (data === undefined || data === null) return '';

        let html = \`<div class="field-container">\`;
        html += \`<div class="field-header" style="color: \x24{field.color || 'inherit'}">\x24{field.name.replace(/_/g, ' ')}</div>\`;

        if (field.type === 'schema_table') {
          html += \`<table class="wiki-table"><thead><tr><th>Field</th><th>Type / Details</th></tr></thead><tbody>\`;
          (Array.isArray(data) ? data : []).forEach(col => {
            const colString = typeof col === 'string' ? col : col.name;
            const match = colString.match(/^(.*?)(?:\\s*\\((.*?)\\))?$/);
            html += \`<tr><td class="font-mono">\x24{match?.[1] || colString}</td><td class="muted font-mono">\x24{match?.[2] || ''}</td></tr>\`;
          });
          html += \`</tbody></table>\`;
        } else if (field.type === 'tables_list') {
          (Array.isArray(data) ? data : []).forEach(table => {
            html += \`<div style="margin-bottom: 1rem;"><div class="property-label font-mono" style="margin-bottom: 0.5rem; color: var(--accent)">TABLE: \x24{table.name}</div>\`;
            html += \`<table class="wiki-table"><thead><tr><th>Column</th><th>Details</th></tr></thead><tbody>\`;
            (table.columns || []).forEach(col => {
              const colString = typeof col === 'string' ? col : col.name;
              const match = colString.match(/^(.*?)(?:\\s*\\((.*?)\\))?$/);
              html += \`<tr><td class="font-mono">\x24{match?.[1] || colString}</td><td class="muted font-mono">\x24{match?.[2] || ''}</td></tr>\`;
            });
            html += \`</tbody></table></div>\`;
          });
        } else if (field.type === 'interface_list') {
          (Array.isArray(data) ? data : []).forEach(item => {
            const name = typeof item === 'string' ? item : (item.name || 'unknown');
            const desc = typeof item === 'string' ? '' : (item.description || '');
            html += \`<div class="wiki-list-item"><div class="wiki-list-item-title font-mono">\x24{name}()</div>\x24{desc ? \`<div class="wiki-list-item-desc">\x24{desc}</div>\` : ''}</div>\`;
          });
        } else if (field.type === 'code_list') {
          (Array.isArray(data) ? data : []).forEach(snip => {
            html += \`<div style="margin-bottom: 1rem;"><div class="property-label font-mono" style="margin-bottom: 0.25rem;">\x24{snip.name}</div><pre class="font-mono" style="margin: 0; padding: 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: 0.5rem;"><code>\x24{snip.code}</code></pre></div>\`;
          });
        } else if (field.type === 'story_list') {
          (Array.isArray(data) ? data : []).forEach(story => {
            const text = typeof story === 'string' ? story : story.text;
            const isDone = typeof story === 'string' ? false : !!story.done;
            html += \`<div class="wiki-list-item" style="display: flex; gap: 0.75rem; align-items: center; \x24{isDone ? 'opacity: 0.6' : ''}">
              <div style="width: 14px; height: 14px; border: 1px solid var(--border); border-radius: 3px; display: flex; align-items: center; justify-content: center; background: \x24{isDone ? 'var(--accent)' : 'transparent'}">\x24{isDone ? '✓' : ''}</div>
              <div style="\x24{isDone ? 'text-decoration: line-through' : ''}">\x24{text}</div>
            </div>\`;
          });
        } else if (field.type === 'flow_list') {
          (Array.isArray(data) ? data : []).forEach((step, i) => {
            html += \`<div class="flow-step"><div class="flow-number">\x24{i+1}</div><div class="flow-content"><div class="relation-title">\x24{step.action}</div><div class="wiki-list-item-desc">\x24{step.description}</div></div></div>\`;
          });
        } else if (Array.isArray(data)) {
           html += \`<div class="tags-container">\x24{data.map(t => \`<span class="tag-pill">\x24{t}</span>\`).join('')}</div>\`;
        } else if (typeof data === 'object') {
           html += \`<pre class="font-mono" style="background: var(--bg); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; font-size: 0.75rem;">\x24{JSON.stringify(data, null, 2)}</pre>\`;
        } else {
           html += \`<div class="field-value">\x24{data}</div>\`;
        }

        html += \`</div>\`;
        return html;
      }

      function renderGovernanceManifest(definitions) {
        if (!definitions || !definitions.length) return '';
        
        let html = \`<div class="relations-section" style="margin-top: 0; border-top: none;">\`;
        html += \`<div class="nav-group-title">Node Types</div>\`;
        
        definitions.forEach(def => {
          html += \`
            <div class="manifest-card" style="border-left-color: \x24{def.color || 'var(--accent)'}">
              <div class="manifest-header">
                <div class="manifest-type-id">\x24{def.id}</div>
                <div class="manifest-category" style="color: \x24{def.color || 'var(--accent)'}; background: \x24{def.color ? def.color + '15' : 'var(--accent-soft)'}">\x24{def.type}</div>
              </div>
              <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--muted);">
                <span>Icon: \x24{def.icon || 'Box'}</span>
                <span style="width: 12px; height: 12px; border-radius: 2px; background: \x24{def.color || '#888888'}"></span>
                <span>\x24{def.color || '#888888'}</span>
              </div>
              
              <div class="wiki-table" style="background: transparent; border: none;">
                <div class="nav-group-title" style="padding-left: 0.5rem; margin-bottom: 0.5rem;">Property Schema</div>
                <div class="manifest-field-row" style="background: var(--nav-hover); border-radius: 4px; font-weight: 800; font-size: 0.65rem; color: var(--muted);">
                  <div>PROPERTY</div>
                  <div>DATA TYPE</div>
                  <div>ICON</div>
                </div>
                \x24{(def.fields || []).map(field => \`
                  <div class="manifest-field-row">
                    <div class="manifest-field-name">\x24{field.name}</div>
                    <div class="manifest-field-type">\x24{field.type}</div>
                    <div style="font-size: 0.7rem; opacity: 0.6;">\x24{field.icon || 'Box'}</div>
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
            <span class="badge">\x24{node.payload?.type || 'article'}</span>
            <span>Last modified: \x24{new Date(node.lastModified).toLocaleDateString()}</span>
          </div>
          <h1>\x24{node.payload?.title || 'Untitled'}</h1>
          <div class="tags-container">
            \x24{(node.payload?.tags || []).map(t => \`<span class="tag-pill">#\x24{t}</span>\`).join('')}
          </div>
        </div>

        <div class="prose">
          \x24{htmlContent}
        </div>

        \x24{propertyFields ? \`<div class="properties-box" style="margin-top: 3rem;">\x24{propertyFields}</div>\` : ''}

        <div style="margin-top: 4rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; opacity: 0.4; font-size: 0.7rem; font-family: 'JetBrains Mono', monospace;">
          <span>ID: \x24{node.id}</span>
          <span>CONFIG: \x24{node.configId}</span>
        </div>

        \x24{node.payload?.type === 'standards' ? renderGovernanceManifest(node.payload?.definitions) : ''}

        \x24{forwardLinks.length > 0 || backLinks.length > 0 ? \`
          <div class="relations-section">
            <div class="nav-group-title">Relationships</div>
            <div class="relations-grid">
              \x24{forwardLinks.map(rel => \`
                <a class="relation-card" onclick="navigateTo('\x24{rel.node.id}')">
                  <div class="relation-type">Refers to (\x24{rel.type})</div>
                  <div class="relation-title">\x24{rel.node.payload?.title}</div>
                </a>
              \`).join('')}
              \x24{backLinks.map(rel => \`
                <a class="relation-card" onclick="navigateTo('\x24{rel.node.id}')">
                  <div class="relation-type">Referenced by (\x24{rel.type})</div>
                  <div class="relation-title">\x24{rel.node.payload?.title}</div>
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
      
      // Auto-expand parents of current node in the tree sidebar
      let parentEl = document.getElementById(id);
      while (parentEl) {
        parentEl = parentEl.parentElement;
        if (parentEl && parentEl.classList.contains('tree-node-container')) {
          parentEl.classList.remove('collapsed');
          const chevron = document.getElementById(parentEl.id + '-chevron');
          if (chevron) chevron.classList.remove('collapsed');
          localStorage.setItem('wiki-tree-collapsed-' + parentEl.id, 'false');
        }
      }
      
      // Scroll to top
      document.querySelector('main').scrollTop = 0;

      // Update URL hash without reload
      window.location.hash = id;

      // Close mobile sidebar if open
      const sidebar = document.querySelector('aside:not(.toc-sidebar)');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      }
    }

    window.toggleGroup = function(groupId, event) {
      if (event) event.stopPropagation();
      const el = document.getElementById(groupId);
      const chevron = document.getElementById(groupId + '-chevron');
      if (el && chevron) {
        const isCollapsed = el.classList.toggle('collapsed');
        chevron.classList.toggle('collapsed', isCollapsed);
        localStorage.setItem('wiki-tree-collapsed-' + groupId, isCollapsed ? 'true' : 'false');
      }
    };

    window.toggleMobileSidebar = function(event) {
      if (event) event.stopPropagation();
      const sidebar = document.querySelector('aside:not(.toc-sidebar)');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar && overlay) {
        const isActive = sidebar.classList.toggle('active');
        overlay.classList.toggle('active', isActive);
      }
    };

    // Search functionality
    document.getElementById('search-input').addEventListener('input', (e) => {
      renderNav(e.target.value);
    });

    // Theme toggling and state persistence
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const hljsTheme = document.getElementById('hljs-theme');

    // Initialize theme: default to light if not explicitly set to dark
    const savedTheme = localStorage.getItem('horizon-wiki-theme') || 'light';
    if (savedTheme === 'dark') {
      html.classList.add('dark');
      document.getElementById('theme-icon').innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
      hljsTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
    } else {
      html.classList.remove('dark');
      document.getElementById('theme-icon').innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
      hljsTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    }

    themeToggle.addEventListener('click', () => {
      const icon = document.getElementById('theme-icon');
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
        hljsTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
        localStorage.setItem('horizon-wiki-theme', 'light');
      } else {
        html.classList.add('dark');
        icon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
        hljsTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
        localStorage.setItem('horizon-wiki-theme', 'dark');
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
        if (nodes.some(n => n.id === hash)) {
          navigateTo(hash);
        } else {
          scrollToHeading(hash);
        }
      }
    });
  `;
}
