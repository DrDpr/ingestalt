export function getWikiHtml(wikiTitle: string, author: string, styles: string, script: string, icon: string = '📚'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${wikiTitle}</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" id="hljs-theme">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${styles}
  </style>
</head>
<body>
  <aside>
    <div class="sidebar-header">
      <h1 style="font-size: 1.1rem; letter-spacing: -0.01em; color: var(--accent);"><span>${icon}</span> ${wikiTitle}</h1>
      <div style="font-size: 0.65rem; color: var(--muted); margin-top: 0.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">BY ${author}</div>
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
  <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleMobileSidebar(event)"></div>

  <main>
    <header class="topbar-header">
      <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle Menu" onclick="toggleMobileSidebar(event)">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>
      <div class="workspace-config">
        <span class="workspace-label">Project Root</span>
        <div class="workspace-input-group">
          <span class="workspace-prefix">vscode://file/</span>
          <input type="text" id="base-path-input" placeholder="e.g. d:/Desktop/ingestalt" autocomplete="off" class="workspace-input">
          <button id="guess-path-btn" title="Guess path from current URL" class="workspace-btn">AUTO</button>
        </div>
      </div>
      
      <div class="topbar-actions">
        <div class="brand-logo">
          <span>INGESTALT</span>
          <span class="brand-sub">// ARCHITECTURE_WIKI</span>
        </div>
        <button class="theme-toggle theme-btn" id="theme-toggle" title="Toggle theme">
          <svg id="theme-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </button>
      </div>
    </header>

    <div class="article-container">
      <div id="content-area">
        <div id="page-content">
          <!-- Content will be injected here -->
        </div>
      </div>
      
      <aside class="toc-sidebar" id="toc-sidebar">
        <div class="toc-sticky">
          <div class="toc-title">On this page</div>
          <div id="toc-links"></div>
        </div>
      </aside>
    </div>
  </main>

  <script>
    ${script}
  </script>
</body>
</html>`;
}
