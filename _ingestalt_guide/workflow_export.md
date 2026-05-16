---
id: node_1778950064037_workflow_export
configId: node_standards_other
position:
  x: 1000
  'y': 850
title: 'Portability & Curation Guide'
tags: []
type: other
filename: workflow_export.md
---
# Portability & Curation Outputs

Ingestalt treats documentation as a fluid asset. You can export your architectural graphs and curated node data in several formats.

## 1. Canvas High-Quality Capture

To take a high-fidelity image of your canvas:
1. Click the **Camera Icon** (Capture Canvas) in the Toolbar.
2. Select your desired settings in the preview window (e.g. transparent vs solid background).
3. Click **Download PNG**.

### Behind the Scenes: Export Normalization
To guarantee crisp, publication-grade exports, Ingestalt automatically:
- Applies an `.exporting` layout state class.
- Temporarily disables hardware-heavy CSS effects (like backdrop-filters, blurs, and glow transitions) during render.
- Restores all visual animations and blurs instantly once the image file is saved.

## 2. Interactive Standalone Wikis

You can generate a self-contained, interactive documentation portal that functions offline:
1. Select the group of nodes you want to include on the canvas (or all of them).
2. On the **Batch Action Toolbar**, click **Generate Wiki**.
3. Enter a title and author name when prompted.
4. An `.html` file is built and downloaded.

### Portal Features:
- **Zero-Dependency SPA**: Runs on any device with a single click.
- **Dynamic Search & Filtering**: Real-time content filtering.
- **Graph Visualization**: Interactive 3D/2D node relationship graphs built into the page.
- **Property Interpretation**: Renders high-fidelity database tables, interface specs, and checklists exactly like the Ingestalt editor itself.

## 3. Batch Action Toolbar Curation

Summoned by selecting multiple nodes (`Shift` + Drag), this toolbar enables quick bulk exports:
- **Copy Markdown**: Bundles all selected nodes into a single, beautifully-structured continuous Markdown stream (`# Node Title \n\n Content...`) and copies it to your clipboard—perfect for seeding LLM context windows.
- **Export JSON**: Downloads a structured `.json` bundle containing all selected nodes, frontmatter, and their interconnecting relationships for ingestion into other engines.
- **Batch Delete**: Safely purges a selected cohort of nodes and their connection edges in a single, atomic database transaction.
