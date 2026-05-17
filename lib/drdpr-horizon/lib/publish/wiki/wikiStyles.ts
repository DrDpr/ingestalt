export const WIKI_STYLES = `
    :root {
      --bg: #ffffff;
      --fg: #1a1a1a;
      --sidebar-bg: #fafafa;
      --border: rgba(0, 0, 0, 0.08);
      --accent: #2563eb;
      --accent-soft: rgba(37, 99, 235, 0.05);
      --muted: #71717a;
      --code-bg: rgba(0, 0, 0, 0.03);
      --nav-hover: rgba(0, 0, 0, 0.05);
      
      --font-sans: 'Geist', -apple-system, system-ui, sans-serif;
      --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
      --font-heading: 'Space Grotesk', sans-serif;
    }

    .dark {
      --bg: #030303;
      --fg: #f4f4f5;
      --sidebar-bg: #09090b;
      --border: rgba(255, 255, 255, 0.08);
      --accent: #3b82f6;
      --accent-soft: rgba(59, 130, 246, 0.08);
      --muted: #a1a1aa;
      --code-bg: rgba(255, 255, 255, 0.03);
      --nav-hover: rgba(255, 255, 255, 0.05);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: var(--font-sans);
      background: var(--bg);
      color: var(--fg);
      line-height: 1.6;
      display: flex;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    /* Stark Grid Background */
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      opacity: 0.03;
      background: linear-gradient(to right, currentColor 1px, transparent 1px),
                  linear-gradient(to bottom, currentColor 1px, transparent 1px);
      background-size: 30px 30px;
    }

    /* Sidebar */
    aside {
      width: 300px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      z-index: 10;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .sidebar-header h1 {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      text-transform: uppercase;
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
      border-radius: 0px;
      color: var(--fg);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-bottom: 0.5rem;
      padding: 0 0.5rem;
    }

    .nav-item {
      display: block;
      padding: 0.5rem 0.75rem;
      border-radius: 0px;
      text-decoration: none;
      color: var(--fg);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.2s;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-left: 2px solid transparent;
    }

    .nav-item:hover {
      background: var(--nav-hover);
      border-left-color: var(--border);
    }

    .nav-item.active {
      background: var(--accent-soft);
      color: var(--accent);
      font-weight: 700;
      border-left-color: var(--accent);
    }

    .nav-item .nav-badge {
      float: right;
      font-size: 0.6rem;
      opacity: 0.6;
      font-family: var(--font-mono);
    }

    /* Nested Tree Navigation styling */
    .tree-node-container {
      margin-left: 0.75rem;
      border-left: 1px solid var(--border);
      padding-left: 0.25rem;
      display: flex;
      flex-direction: column;
    }
    
    .nav-item-wrapper {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
    }
    
    .tree-chevron {
      width: 1.25rem;
      height: 1.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.6rem;
      color: var(--muted);
      transition: transform 0.2s, color 0.2s;
      user-select: none;
      z-index: 5;
    }
    
    .tree-chevron:hover {
      color: var(--fg);
    }
    
    .tree-chevron.collapsed {
      transform: rotate(-90deg);
    }

    .tree-children {
      transition: max-height 0.25s ease-out, opacity 0.2s;
      overflow: hidden;
    }

    .tree-children.collapsed {
      display: none;
    }

    /* Search Results */
    .search-result-snippet {
      font-size: 0.7rem;
      color: var(--muted);
      margin-top: 0.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
      text-transform: none;
      letter-spacing: 0px;
    }

    .highlight {
      background: rgba(59, 130, 246, 0.2);
      color: var(--accent);
      padding: 0 2px;
      border-radius: 0px;
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
      border-radius: 0px;
      text-decoration: none;
      color: var(--fg);
      transition: all 0.2s;
    }

    .relation-card:hover {
      border-color: var(--accent);
      background: var(--nav-hover);
    }

    .relation-type {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }

    .relation-title {
      font-family: var(--font-heading);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.02em;
    }

    /* Properties Table & Interpreters */
    .properties-box {
      background: var(--sidebar-bg);
      border: 1px solid var(--border);
      border-radius: 0px;
      padding: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .field-container {
      margin-bottom: 2rem;
      border: 1px solid var(--border);
      padding: 1rem;
      background: var(--bg);
    }

    .field-container:last-child { margin-bottom: 0; }

    .field-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .property-row {
      display: flex;
      justify-content: space-between;
      padding: 0.6rem 0.5rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.75rem;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .property-row:last-child { border: none; }
    .property-label { color: var(--muted); font-weight: 600; font-size: 0.7rem; }
    .property-value { font-weight: 700; color: var(--fg); }

    /* Schema Table Styling */
    .wiki-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.75rem;
      font-family: var(--font-mono);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0px;
      overflow: hidden;
    }

    .wiki-table th {
      background: var(--nav-hover);
      padding: 0.75rem;
      text-align: left;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.65rem;
      letter-spacing: 0.05em;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
    }

    .wiki-table td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .wiki-table tr:last-child td { border-bottom: none; }

    .font-mono { font-family: var(--font-mono); }

    /* List Item Styling */
    .wiki-list-item {
      padding: 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0px;
      margin-bottom: 0.75rem;
    }

    .wiki-list-item-title {
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
      color: var(--accent);
    }

    .wiki-list-item-desc {
      font-size: 0.75rem;
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
      border-radius: 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
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
      background: var(--sidebar-bg);
      border: 1px solid var(--border);
      border-radius: 0px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border-left: 2px solid var(--accent);
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
      font-family: var(--font-mono);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      font-weight: 800;
    }

    .manifest-category {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      background: var(--accent-soft);
      padding: 0.2rem 0.6rem;
      border: 1px solid var(--border);
    }

    .manifest-field-row {
      display: grid;
      grid-template-columns: 1fr 1fr 100px;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .manifest-field-row:last-child { border-bottom: none; }

    .manifest-field-name { font-weight: 800; color: var(--fg); }
    .manifest-field-type { color: var(--accent); font-weight: 700; }

    /* Tags */
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .tag-pill {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: transparent;
      border: 1px solid var(--border);
      padding: 0.15rem 0.5rem;
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

    /* TOC Sidebar */
    .toc-sidebar {
      width: 260px;
      padding: 4rem 2rem 4rem 1rem;
      flex-shrink: 0;
      display: none; /* Hidden by default, shown if headings exist */
      z-index: 10;
    }

    @media (min-width: 1200px) {
      .toc-sidebar { display: block; }
    }

    .toc-sticky {
      position: sticky;
      top: 100px;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }

    .toc-title {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 1rem;
      letter-spacing: 0.1em;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .toc-link {
      display: block;
      font-family: var(--font-mono);
      color: var(--muted);
      text-decoration: none;
      margin-bottom: 0.6rem;
      transition: all 0.2s;
      line-height: 1.4;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-left: 2px solid transparent;
      padding-left: 0.75rem;
    }

    .toc-link:hover {
      color: var(--accent);
      border-left-color: var(--border);
    }

    .toc-link.active {
      color: var(--accent);
      font-weight: 700;
      border-left-color: var(--accent);
    }

    .toc-level-2 { margin-left: 0; }
    .toc-level-3 { margin-left: 1rem; font-size: 0.65rem; }

    /* Main Content */
    main {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      z-index: 10;
    }

    .topbar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.8rem 2rem;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .workspace-config {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .workspace-label {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
    }

    .workspace-input-group {
      display: flex;
      align-items: center;
      background: var(--sidebar-bg);
      border: 1px solid var(--border);
      border-radius: 0px;
      overflow: hidden;
      height: 30px;
    }

    .workspace-prefix {
      padding: 0 0.75rem;
      color: var(--muted);
      border-right: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.02em;
      display: flex;
      align-items: center;
      height: 100%;
      opacity: 0.7;
    }

    .workspace-input {
      font-size: 0.7rem;
      padding: 0 0.75rem;
      background: transparent;
      border: none;
      color: var(--fg);
      width: 250px;
      outline: none;
      font-family: var(--font-mono);
      height: 100%;
    }

    .workspace-btn {
      padding: 0 0.75rem;
      background: var(--accent-soft);
      color: var(--accent);
      border: none;
      border-left: 1px solid var(--border);
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      height: 100%;
      transition: all 0.2s;
    }

    .workspace-btn:hover {
      background: var(--accent);
      color: #ffffff;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 0.15em;
      color: var(--fg);
    }

    .brand-sub {
      color: var(--muted);
      font-weight: 500;
      letter-spacing: 0.05em;
      opacity: 0.7;
    }

    .theme-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--muted);
      width: 30px;
      height: 30px;
      border-radius: 0px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .theme-btn:hover {
      color: var(--fg);
      border-color: var(--fg);
      background: var(--nav-hover);
    }

    .article-container {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
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
      font-family: var(--font-heading);
      font-size: 2.2rem;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
      letter-spacing: 0.02em;
      line-height: 1.1;
    }

    .page-meta {
      display: flex;
      gap: 0.75rem;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      align-items: center;
    }

    .badge {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--accent);
      padding: 0.15rem 0.5rem;
      border-radius: 0px;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.6rem;
      letter-spacing: 0.08em;
    }

    /* Markdown Styles */
    .prose {
      font-size: 0.85rem;
      letter-spacing: 0.01em;
    }

    .prose h2 { 
      font-family: var(--font-heading);
      font-size: 1.4rem; 
      margin: 2.5rem 0 1rem; 
      font-weight: 800; 
      text-transform: uppercase;
      letter-spacing: 0.02em;
      border-bottom: 1px solid var(--border); 
      padding-bottom: 0.5rem; 
      scroll-margin-top: 80px; 
    }

    .prose h3 { 
      font-family: var(--font-heading);
      font-size: 1.1rem; 
      margin: 2rem 0 0.75rem; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.02em;
      scroll-margin-top: 80px; 
    }

    .prose p { margin-bottom: 1.25rem; }
    .prose ul, .prose ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
    .prose li { margin-bottom: 0.5rem; }
    .prose blockquote { border-left: 2px solid var(--accent); padding-left: 1rem; color: var(--muted); font-style: italic; margin: 1.5rem 0; }
    
    .prose code {
      font-family: var(--font-mono);
      background: var(--code-bg);
      padding: 0.2rem 0.4rem;
      border-radius: 0px;
      border: 1px solid var(--border);
      font-size: 0.8em;
    }

    .prose pre {
      background: var(--sidebar-bg);
      padding: 1.5rem;
      border-radius: 0px;
      overflow-x: auto;
      margin: 1.5rem 0;
      border: 1px solid var(--border);
    }

    .prose pre code {
      background: none;
      padding: 0;
      border: none;
      font-size: 0.8rem;
    }

    .prose img { max-width: 100%; border-radius: 0px; border: 1px solid var(--border); margin: 1.5rem 0; }

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

    .empty-state h2 { font-family: var(--font-heading); text-transform: uppercase; color: var(--fg); margin-bottom: 0.5rem; }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 0px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

    /* Hamburger Menu Toggle Button (Desktop-hidden) */
    .mobile-menu-toggle {
      display: none;
    }

    /* Sidebar Drawer Overlay/Backdrop */
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(3, 3, 3, 0.4);
      backdrop-filter: blur(4px);
      z-index: 99;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      body {
        position: relative;
        overflow-x: hidden;
      }

      /* Slide-out Drawer Navigation */
      aside:not(.toc-sidebar) {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 280px;
        transform: translateX(-100%);
        z-index: 100;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 20px 0 30px rgba(0, 0, 0, 0.2);
        border-right: 1px solid var(--border);
      }

      aside:not(.toc-sidebar).active {
        transform: translateX(0);
      }

      .sidebar-overlay.active {
        display: block;
        opacity: 1;
      }

      /* Responsive Topbar */
      .topbar-header {
        padding: 0.6rem 1rem;
        height: 56px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }

      /* Hide project root workspace config input on mobile to declutter */
      .workspace-config {
        display: none !important;
      }

      /* Hamburger menu toggle button shown on mobile */
      .mobile-menu-toggle {
        display: flex !important;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--border);
        color: var(--fg);
        width: 32px;
        height: 32px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        padding: 0;
        border-radius: 0px;
      }

      .mobile-menu-toggle:hover {
        background: var(--nav-hover);
        border-color: var(--fg);
      }

      .topbar-actions {
        width: auto;
        gap: 0.75rem;
        margin-left: auto;
      }

      .brand-logo {
        font-size: 0.65rem;
        letter-spacing: 0.1em;
      }

      .brand-sub {
        display: none; /* Hide brand sub-text on narrow screens to save space */
      }

      /* Content Area Adjustment */
      main {
        width: 100vw;
        max-width: 100%;
      }

      .article-container {
        padding: 1rem;
        width: 100%;
        max-width: 100vw;
      }

      #content-area {
        padding: 1rem 0;
        width: 100%;
      }

      .toc-sidebar {
        display: none !important;
      }

      .page-header h1 {
        font-size: 1.6rem;
      }

      .relations-grid {
        grid-template-columns: 1fr;
      }
    }
`;
