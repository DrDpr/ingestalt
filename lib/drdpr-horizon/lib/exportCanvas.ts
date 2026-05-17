import { toPng, toJpeg, toSvg } from 'html-to-image';
import { getNodesBounds, getViewportForBounds, Node, Edge } from '@xyflow/react';

export type ExportFormat = 'png' | 'jpeg' | 'svg';

interface ExportOptions {
  format?: ExportFormat;
  quality?: number; // 0-1 for jpeg
  backgroundColor?: string;
  padding?: number; // padding around the exported area
  filename?: string;
}

/**
 * Core helper that uses the official React Flow image export method.
 * It targets the `.react-flow__viewport` and applies a temporary transform via CSS
 * to perfectly frame the requested nodes, ensuring even off-screen nodes are captured.
 */
async function captureViewportBounds(
  canvasElement: HTMLElement,
  nodesToExport: Node[],
  options: ExportOptions & { download?: boolean }
): Promise<{ dataUrl: string, filename: string, format: string }> {
  const {
    format = 'png',
    quality = 0.95,
    backgroundColor = '#09090b',
    padding = 50,
    filename = `export-${Date.now()}`
  } = options;

  const viewportElement = canvasElement.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewportElement) {
    throw new Error('Could not find React Flow viewport element.');
  }

  if (nodesToExport.length === 0) {
    throw new Error('No nodes provided for export.');
  }

  // Calculate precise bounds of the target nodes
  const bounds = getNodesBounds(nodesToExport);
  const imageWidth = bounds.width + padding * 2;
  const imageHeight = bounds.height + padding * 2;
  
  // We force a 1:1 scale (zoom: 1) to prevent CSS scaling which causes blurry text in html-to-image.
  // We simply translate the viewport so the bounding box starts exactly after our padding.
  const transform = {
    x: -bounds.x + padding,
    y: -bounds.y + padding,
    zoom: 1
  };

  const exportOptions = {
    backgroundColor,
    cacheBust: true,
    pixelRatio: 2, // 2x resolution for retina-crisp exports
    width: imageWidth,
    height: imageHeight,
    style: {
      width: `${imageWidth}px`,
      height: `${imageHeight}px`,
      // This is the magic: temporarily overrides the viewport transform just for the capture
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
    },
  };

  // Chromium bug fix: SVG foreignObject rendering fails with backdrop-filter and box-shadows on transformed elements.
  // We temporarily disable them and apply a solid background, then restore them afterwards.
  const isDark = document.documentElement.classList.contains('dark');
  const solidBg = isDark ? '#09090b' : '#ffffff';
  
  // Add exporting class to disable blur/animations via global CSS
  viewportElement.classList.add('exporting');
  
  const modifiedNodes: { el: HTMLElement, bg: string, shadow: string }[] = [];

  // Disable on nodes (they have backdrop-blur-xl and shadow-xl)
  viewportElement.querySelectorAll('.react-flow__node > div').forEach((el) => {
    const htmlEl = el as HTMLElement;
    modifiedNodes.push({
      el: htmlEl,
      bg: htmlEl.style.backgroundColor,
      shadow: htmlEl.style.boxShadow
    });
    
    htmlEl.style.setProperty('box-shadow', 'none', 'important');
    htmlEl.style.setProperty('background-color', solidBg, 'important');
  });

  try {
    let dataUrl: string;
    switch (format) {
      case 'jpeg':
        dataUrl = await toJpeg(viewportElement, { ...exportOptions, quality });
        break;
      case 'svg':
        dataUrl = await toSvg(viewportElement, exportOptions);
        break;
      case 'png':
      default:
        dataUrl = await toPng(viewportElement, exportOptions);
        break;
    }

    // Auto-download if not explicitly disabled
    if (options.download !== false) {
      try {
        if ('showSaveFilePicker' in window) {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'svg' ? 'image/svg+xml' : 'image/png';
          
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: `${filename}.${format}`,
            types: [{
              description: `${format.toUpperCase()} Image`,
              accept: { [mimeType]: [`.${format}`] },
            }],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } else {
          const link = document.createElement('a');
          link.download = `${filename}.${format}`;
          link.href = dataUrl;
          link.click();
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('File save failed or aborted:', err);
          // Fallback to standard download if File System Access API fails (e.g., security constraints)
          const link = document.createElement('a');
          link.download = `${filename}.${format}`;
          link.href = dataUrl;
          link.click();
        }
      }
    }
    
    return { dataUrl, filename, format };
  } finally {
    // Remove exporting class
    viewportElement.classList.remove('exporting');

    // Restore original styles
    modifiedNodes.forEach(({ el, bg, shadow }) => {
      el.style.backgroundColor = bg;
      el.style.boxShadow = shadow;
    });
  }
}

/**
 * Export the entire React Flow canvas as an image, including all off-screen nodes.
 */
export async function exportCanvas(
  canvasElement: HTMLElement,
  nodes: Node[],
  options: ExportOptions & { download?: boolean } = {}
): Promise<{ dataUrl: string, filename: string, format: string }> {
  try {
    const filename = options.filename || `canvas-export-${Date.now()}`;
    return await captureViewportBounds(canvasElement, nodes, { ...options, filename });
  } catch (error) {
    console.error('Failed to export entire canvas:', error);
    throw error;
  }
}

/**
 * Export a specific node along with any nodes directly connected to it via edges.
 */
export async function exportNodeWithRelationships(
  canvasElement: HTMLElement,
  nodes: Node[],
  edges: Edge[],
  targetNodeId: string,
  options: ExportOptions & { download?: boolean } = {}
): Promise<{ dataUrl: string, filename: string, format: string }> {
  try {
    // 1. Find the target node and all connected nodes
    const connectedNodeIds = new Set<string>([targetNodeId]);
    
    // Find all edges connected to the target node
    const connectedEdges = edges.filter(
      edge => edge.source === targetNodeId || edge.target === targetNodeId
    );
    
    // Add all connected node IDs
    connectedEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    // 2. Filter down to only the nodes we want to capture
    const nodesToExport = nodes.filter(node => connectedNodeIds.has(node.id));
    
    if (nodesToExport.length === 0) {
      throw new Error('Target node not found or has no connections');
    }

    // 3. Generate a nice filename based on the primary node
    const targetNode = nodes.find(n => n.id === targetNodeId);
    const label = targetNode?.data?.label;
    const defaultFilename = label && typeof label === 'string'
      ? `${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-export-${Date.now()}`
      : `node-export-${Date.now()}`;

    const filename = options.filename || defaultFilename;

    return await captureViewportBounds(canvasElement, nodesToExport, { ...options, filename });
  } catch (error) {
    console.error('Failed to export node with relationships:', error);
    throw error;
  }
}

/**
 * Export only the nodes currently selected by the user.
 */
export async function exportSelectedNodes(
  canvasElement: HTMLElement,
  nodes: Node[],
  edges: Edge[],
  selectedNodeIds: string[],
  options: ExportOptions & { download?: boolean } = {}
): Promise<{ dataUrl: string, filename: string, format: string }> {
  try {
    if (selectedNodeIds.length === 0) {
      throw new Error('No nodes selected');
    }

    const nodesToExport = nodes.filter(node => selectedNodeIds.includes(node.id));
    
    if (nodesToExport.length === 0) {
      throw new Error('Selected nodes not found in graph');
    }

    const filename = options.filename || `selection-export-${Date.now()}`;

    return await captureViewportBounds(canvasElement, nodesToExport, { ...options, filename });
  } catch (error) {
    console.error('Failed to export selected nodes:', error);
    throw error;
  }
}
