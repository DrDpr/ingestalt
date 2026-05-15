'use client';

/**
 * Client-side utility for interacting with the local file system
 * via the VS Code protocol.
 */
export const useFileSystem = () => {
  
  // Get the local project root from localStorage (configured by user)
  const getLocalRoot = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('horizon_local_root') || '';
  };

  const setLocalRoot = (path: string) => {
    // Normalize path: replace backslashes and remove trailing slash
    const normalized = path.replace(/\\/g, '/').replace(/\/$/, '');
    localStorage.setItem('horizon_local_root', normalized);
  };

  const hasRoot = !!getLocalRoot();

  /**
   * Constructs and opens a vscode:// link
   * @param relativePath Path relative to project root
   * @param line Optional line number to jump to
   */
  const openInCode = (relativePath: string, line?: number) => {
    const root = getLocalRoot();
    
    if (!root) {
      console.warn("No local root configured.");
      return false; // Signal that we need config
    }

    // Ensure path doesn't have leading slash
    const cleanPath = relativePath.replace(/^[/\\]/, '');
    const fullPath = `${root}/${cleanPath}`;

    // Normalize for URL
    const normalizedPath = fullPath.replace(/\\/g, '/');
    
    // Construct protocol URL
    const url = `vscode://file/${normalizedPath}${line ? `:${line}` : ''}`;
    
    window.open(url, '_self');
    return true;
  };

  return { openInCode, getLocalRoot, setLocalRoot, hasRoot };
};
