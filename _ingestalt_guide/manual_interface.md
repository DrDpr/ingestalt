---
id: node_1778950064037_4esmdde14um_wqqeh22
configId: node_standards_other
position:
  x: 1000
  'y': 50
title: 'Interface Manual: Canvas & Inspector'
tags: []
type: other
filename: manual_interface.md
---
# Interface Manual: Canvas & Inspector

The Ingestalt UI is a two-pane system: the **Spatial Canvas** (left) and the **Modular Inspector** (right).

## 1\. The Spatial Canvas

The canvas is where you map your mental model of the system.

### Interaction Controls

-   **Select**: Click a node to open its details in the Inspector.
    
-   **Multi-select**: Hold `Shift` and drag to select a group of nodes.
    
-   **Move**: Click and drag any node to reposition it.
    
-   **Draw Edges**: Drag directly from any node's circular boundary handle to another node to instantly establish a relationship. Double-click any edge on the canvas to safely delete it.
    

### Visual Cues

-   **Color Coding**: Each node type has a distinct color (e.g., Blue for Database, Green for API).
    
-   **Icons**: Icons identify the node's architectural role at a glance.
    
-   **Selection Halo**: The currently active node is highlighted with a glow matching its type color.
    

* * *

## 2\. The Modular Inspector

The Inspector is where you "Edit the Architecture."

### Tabs

-   **Content**: A high-fidelity Markdown editor for general documentation.
    
-   **Relationships**: A bidirectional topology manager. Use this to link nodes together.
    
-   **Properties**: The dynamic data layer. This tab changes based on the node's `configId` (e.g., showing tables for databases).
    
-   **AI Tasks**: The Prompt Builder for generating implementation context.
    

### Key Features

-   **Bidirectional Persistence (The Sync Loop)**: Ingestalt is a "Live Lens" for your local project.
    
    -   **Push**: Changes you make in the Inspector (Content, YAML, Relationships) are written to disk instantly if Auto-Sync is enabled.
        
    -   **Pull**: If you edit a `.md` file in your IDE, simply click the **Re-Sync (Refresh)** icon in the Toolbar to reflect those changes on the canvas.
        
-   **Jump to Code**: Look for the **Zap (⚡)** or **External Link** icons to instantly open the associated file or method in VS Code.
    
-   **Property Interpreters**: Specialized UI for complex data like tables and interface lists that "hydrates" from your source code.
