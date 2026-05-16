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
 * Export the entire React Flow canvas as an image
 */
export async function exportCanvas(
  canvasElement: HTMLElement,
  options: ExportOptions & { download?: boolean } = {}
): Promise<{ dataUrl: string, filename: string, format: string }> {
  const {
    format = 'png',
    quality = 0.95,
    backgroundColor = '#09090b',
    filename = `canvas-export-${Date.now()}`
  } = options;

  try {
    let dataUrl: string;

    const exportOptions = {
      backgroundColor,
      cacheBust: true,
      pixelRatio: 2, // Higher quality
    };

    switch (format) {
      case 'jpeg':
        dataUrl = await toJpeg(canvasElement, { ...exportOptions, quality });
        break;
      case 'svg':
        dataUrl = await toSvg(canvasElement, exportOptions);
        break;
      case 'png':
      default:
        dataUrl = await toPng(canvasElement, exportOptions);
        break;
    }

    // Download the image if requested
    if (options.download !== false) {
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = dataUrl;
      link.click();
    }
    
    return { dataUrl, filename, format };
  } catch (error) {
    console.error('Failed to export canvas:', error);
    throw error;
  }
}

/**
 * Export a specific node with its relationships
 * This focuses the viewport on the node and its connected nodes
 */
export async function exportNodeWithRelationships(
  canvasElement: HTMLElement,
  nodes: Node[],
  edges: Edge[],
  targetNodeId: string,
  options: ExportOptions & { download?: boolean } = {}
): Promise<{ dataUrl: string, filename: string, format: string }> {
  const {
    format = 'png',
    quality = 0.95,
    backgroundColor = '#09090b',
    padding = 100,
    filename
  } = options;

  try {
    // Find the target node and all connected nodes
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

    // Get the nodes to export
    const nodesToExport = nodes.filter(node => connectedNodeIds.has(node.id));
    
    if (nodesToExport.length === 0) {
      throw new Error('No nodes found to export');
    }

    // Get the target node for filename
    const targetNode = nodes.find(n => n.id === targetNodeId);
    const label = targetNode?.data?.label;
    const defaultFilename = label && typeof label === 'string'
      ? `${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-export-${Date.now()}`
      : `node-export-${Date.now()}`;

    // Calculate bounds of the nodes to export
    const bounds = getNodesBounds(nodesToExport);
    
    // Add padding
    const paddedBounds = {
      x: bounds.x - padding,
      y: bounds.y - padding,
      width: bounds.width + padding * 2,
      height: bounds.height + padding * 2,
    };

    // Get viewport for these bounds
    const viewport = getViewportForBounds(
      paddedBounds,
      canvasElement.offsetWidth,
      canvasElement.offsetHeight,
      0.5, // min zoom
      2,   // max zoom
      0.1  // padding
    );

    // Create a temporary container with the calculated viewport
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${paddedBounds.width}px`;
    tempContainer.style.height = `${paddedBounds.height}px`;
    tempContainer.style.backgroundColor = backgroundColor;
    document.body.appendChild(tempContainer);

    // Clone the canvas element
    const clonedCanvas = canvasElement.cloneNode(true) as HTMLElement;
    
    // Apply viewport transformation
    const reactFlowViewport = clonedCanvas.querySelector('.react-flow__viewport') as HTMLElement;
    if (reactFlowViewport) {
      reactFlowViewport.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
    }
    
    tempContainer.appendChild(clonedCanvas);

    // Export the temporary container
    let dataUrl: string;
    const exportOptions = {
      backgroundColor,
      cacheBust: true,
      pixelRatio: 2,
      width: paddedBounds.width,
      height: paddedBounds.height,
    };

    switch (format) {
      case 'jpeg':
        dataUrl = await toJpeg(tempContainer, { ...exportOptions, quality });
        break;
      case 'svg':
        dataUrl = await toSvg(tempContainer, exportOptions);
        break;
      case 'png':
      default:
        dataUrl = await toPng(tempContainer, exportOptions);
        break;
    }

    // Clean up
    document.body.removeChild(tempContainer);

    const finalFilename = filename || defaultFilename;
    // Download the image
    if (options.download !== false) {
      const link = document.createElement('a');
      link.download = `${finalFilename}.${format}`;
      link.href = dataUrl;
      link.click();
    }
    
    return { dataUrl, filename: finalFilename, format };
  } catch (error) {
    console.error('Failed to export node with relationships:', error);
    throw error;
  }
}

/**
 * Export selected nodes with their interconnections
 */
export async function exportSelectedNodes(
  canvasElement: HTMLElement,
  nodes: Node[],
  edges: Edge[],
  selectedNodeIds: string[],
  options: ExportOptions & { download?: boolean } = {}
): Promise<{ dataUrl: string, filename: string, format: string }> {
  const {
    format = 'png',
    quality = 0.95,
    backgroundColor = '#09090b',
    padding = 100,
    filename = `selection-export-${Date.now()}`
  } = options;

  try {
    if (selectedNodeIds.length === 0) {
      throw new Error('No nodes selected');
    }

    // Get the nodes to export
    const nodesToExport = nodes.filter(node => selectedNodeIds.includes(node.id));
    
    if (nodesToExport.length === 0) {
      throw new Error('No nodes found to export');
    }

    // Export using the full canvas approach
    let dataUrl: string;
    const exportOptions = {
      backgroundColor,
      cacheBust: true,
      pixelRatio: 2,
    };

    switch (format) {
      case 'jpeg':
        dataUrl = await toJpeg(canvasElement, { ...exportOptions, quality });
        break;
      case 'svg':
        dataUrl = await toSvg(canvasElement, exportOptions);
        break;
      case 'png':
      default:
        dataUrl = await toPng(canvasElement, exportOptions);
        break;
    }

    // Download the image
    if (options.download !== false) {
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = dataUrl;
      link.click();
    }
    
    return { dataUrl, filename, format };
  } catch (error) {
    console.error('Failed to export selected nodes:', error);
    throw error;
  }
}

// Made with Bob
