# Browser Dialog Inventory

This document tracks all instances of native browser dialogs (`alert`, `confirm`, `prompt`) within the Ingestalt codebase. These should eventually be replaced with the `PromptModal` component for a more consistent and professional user experience.

## Summary

| File Path | Type | Line | Context |
| :--- | :--- | :--- | :--- |
| `lib/drdpr-horizon/components/layout/Toolbar.tsx` | `confirm` | 373 | Delete selected nodes confirmation |
| `lib/drdpr-horizon/components/layout/SpatialSidebar.tsx` | `alert` | 159 | Snapshot saved confirmation |
| `lib/drdpr-horizon/components/layout/SpatialSidebar.tsx` | `alert` | 168 | No snapshot found warning |
| `lib/drdpr-horizon/components/layout/SpatialSidebar.tsx` | `alert` | 186 | Canvas restored confirmation |
| `lib/drdpr-horizon/components/layout/SpatialSidebar.tsx` | `alert` | 245 | Invalid Atlas file format error |
| `lib/drdpr-horizon/components/layout/SpatialSidebar.tsx` | `alert` | 280 | Atlas imported success |
| `lib/drdpr-horizon/components/layout/SpatialSidebar.tsx` | `alert` | 283 | Atlas import failed error |
| `lib/drdpr-horizon/components/layout/SpatialSidebar.tsx` | `alert` | 298 | No orphaned nodes found notice |
| `lib/drdpr-horizon/components/inspector/PayloadInterpreters.tsx` | `alert` | 175 | No file path warning |
| `lib/drdpr-horizon/components/inspector/PayloadInterpreters.tsx` | `alert` | 278 | Copied to clipboard confirmation |
| `lib/drdpr-horizon/components/inspector/PayloadInterpretersView.tsx` | `confirm` | 71 | Remove field confirmation |
| `lib/drdpr-horizon/lib/publish/wikiGenerator.ts` | `alert` | 833 | Project Root not set warning (in exported HTML) |
| `lib/drdpr-horizon/components/canvas/HorizonCanvas.tsx` | `confirm` | 245 | Delete connection confirmation |
| `lib/drdpr-horizon/components/canvas/HorizonCanvas.tsx` | `prompt` | 331 | Spawn node type prompt |
| `lib/drdpr-horizon/components/canvas/HorizonCanvas.tsx` | `prompt` | 333 | Node title prompt |
| `lib/drdpr-horizon/components/canvas/HorizonCanvas.tsx` | `confirm` | 345 | Delete node(s) confirmation |
| `lib/drdpr-horizon/lib/hooks/useSync.ts` | `alert` | 39 | No folder connected warning |
| `lib/drdpr-horizon/lib/hooks/useSync.ts` | `alert` | 51 | Sync failed error |
| `lib/drdpr-horizon/lib/hooks/useGenerator.ts` | `alert` | 64 | AI Generation failed error |
| `lib/drdpr-horizon/components/canvas/BatchActionToolbar.tsx` | `confirm` | 17 | Delete selected nodes confirmation |
| `lib/drdpr-horizon/components/canvas/BatchActionToolbar.tsx` | `alert` | 92 | Content copied confirmation |
| `lib/drdpr-horizon/components/canvas/nodes/BaseNode.tsx` | `confirm` | 27 | Delete node confirmation |

## Implementation Priority

### High Priority (Destructive Actions)
- **Delete Node/Connection**: Needs a clear "Are you sure?" modal with high-visibility warning.
- **Clear Canvas**: Already handled in some places, but needs unification.

### Medium Priority (User Input)
- **Spawn Node Type/Title**: Replacing `prompt()` with a proper input modal will allow for validation and better UX (e.g., dropdowns for types).

### Low Priority (Informational)
- **Success/Error Notices**: Can be replaced with toasts or simple `PromptModal` success variants.
