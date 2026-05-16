---
id: node_1778950064037_manual_canvas
configId: node_standards_other
position:
  x: 1000
  'y': 250
title: 'Spatial Canvas Guide'
tags: []
type: other
filename: manual_canvas.md
---
# The Spatial Canvas

The **Spatial Canvas** is the primary visual grid of Ingestalt. It provides a real-time, high-fidelity visualization of your codebase architecture.

## 1. Grid Navigation

- **Pan**: Click and drag on any empty region of the canvas to move your view.
- **Zoom**: Scroll your mouse wheel or pinch your trackpad to zoom in and out.
- **Fit View**: Double-click on the canvas background to automatically center and scale the view to see all nodes at once.

## 2. Managing Nodes & Selection

- **Selection Halo**: Clicking any node opens it inside the Inspector and highlights it with a visual glow matching its specific architectural type.
- **Multi-Selection**: Hold `Shift` and drag a bounding box around multiple nodes to select them. This immediately summons the **Batch Action Toolbar** at the bottom of the screen.

## 3. Drawing & Managing Edges

Relationships define the topology and data flow of your project:
- **Draw Edges**: Move your cursor over any node. Circular connection handles will appear. Click and drag from any handle, then drop the line onto another node to establish a new relationship.
- **Edge Routing Options**: Toggle between routing algorithms in the Toolbar:
  - **Avoidance (Smart)**: Automatically routes edges around other nodes to prevent overlapping.
  - **Organic**: Curved bezier paths for a soft, human flow.
  - **Circuit**: Orthogonal, grid-aligned tracks for an engineering-grade blueprint aesthetic.
- **Handle Types**: Choose `smart` (handles slide to the closest side of the node) or `fixed` (handles attach permanently to top/bottom/left/right).
- **Deletion**: Double-click any edge directly on the canvas to safely delete it from the IndexedDB and local markdown frontmatter.

## 4. Selection & Layout Parameters
When multiple nodes are selected, the **Batch Action Toolbar** provides an interactive **Layout Parameters** drawer:
- **Column Width**: Sets the grid alignment width.
- **Vertical Gap**: Adjusts the gap between stacked components.
- **Nesting Depth**: Sets the indentation offset for child sub-components.
- Click **Autolayout Selection** (⚡) to automatically reorganize the selected subset of nodes using these parameters.
