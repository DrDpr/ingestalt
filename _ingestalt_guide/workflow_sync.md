---
id: node_1778950064037_workflow_sync
configId: node_standards_other
position:
  x: 1000
  'y': 650
title: 'Grounding & Sync Loop Guide'
tags: []
type: other
filename: workflow_sync.md
---
# Grounding & Sync Loop

The **Sync Loop** connects Ingestalt's in-browser database (IndexedDB) directly to your local file system using the modern **File System Access API (FSA)**. This achieves real-time, bi-directional grounding.

## 1. Directory Connection

To link your codebase:
1. Click the **Folder Icon** in the Toolbar.
2. Select your project's root folder or the subfolder containing your documentation nodes.
3. Grant the browser read/write permissions when prompted.
4. The folder name will appear on the folder badge in the Toolbar.

## 2. Re-authorization (FSA Security)
For security, modern browsers revoke folder handle access upon page reloads:
- **RE-AUTH Indicator**: If you reload the page, the folder badge turns orange and displays `RE-AUTH`.
- **Action**: Click the badge once and approve the browser's permission prompt to instantly re-establish the connection.

## 3. Sync & Heartbeat Intervals

Ingestalt supports two modes of sync from disk (pulling edits made in your IDE):
- **Manual Pull**: Click the **Re-Sync (Refresh)** icon in the Toolbar to perform a full scanning scan.
- **Auto-Pull (Heartbeat)**: Click the arrow dropdown next to the Refresh icon to configure an automatic pull heartbeat (`5s`, `10s`, or `30s`). The icon will spin slowly as it periodically checks the files for external edits.

## 4. Discovery & Collision Scenarios

When you click **Discover New Nodes** (⚡) in the Toolbar, Ingestalt crawls the connected folder. It handles special cases gracefully:

### Node Collisions
If files you are ingesting already exist as nodes on your canvas:
- You will be prompted to either:
  1. **Update Existing**: Merge new property definitions into the existing canvas nodes.
  2. **Duplicate All**: Create duplicate, separate nodes for the incoming files.

### Wide Ingestion Warning
If you attempt to ingest a folder containing general system or code folders (like `node_modules` or `.git`), Ingestalt will flag a warning:
- You can either **Ingest Anyway** (indices all markdown files recursively) or **Cancel** to choose a specific subfolder.
