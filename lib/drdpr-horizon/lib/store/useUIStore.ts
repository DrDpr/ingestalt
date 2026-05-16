import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface UIState {
  setLeftOpen: (open: boolean) => void;
  isLeftOpen: boolean;
  // Global Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  highlightNodeId: string | null;
  selectedNodeIds: Set<string>;
  
  // Search & Filtering
  searchQuery: string;
  activeTags: string[];
  
  // Perspectives (Graph Views)
  activeGraphId: string | null;
  refreshRate: number; // 0 = manual, otherwise seconds
  setRefreshRate: (rate: number) => void;
  
  // App Config & Workspace
  isInspectorOpen: boolean;
  isSearchOpen: boolean;
  isToolbarOpen: boolean;
  isPaletteOpen: boolean;
  isShortcutsHelpOpen: boolean; // Keyboard shortcuts help modal
  relationshipMode: 'all' | 'selected' | 'trace';
  edgeHandleType: 'fixed' | 'smart';
  edgePathType: 'organic' | 'circuit';
  basePath: string;
  
  // Canvas State (React Flow Viewport)
  viewport: Viewport;
  autoSaveEnabled: boolean;
  
  // File System Access API
  directoryHandle: FileSystemDirectoryHandle | null;
  
  // Clipboard for copy/paste
  copiedNodeIds: string[];
  
  // Actions
  setSelectedNodeId: (id: string | null) => void;
  setHighlightNodeId: (id: string | null) => void;
  setPrimaryNodeId: (id: string | null) => void; // Sets inspector node WITHOUT resetting multi-select set
  clearSelection: () => void;
  setHoveredNodeId: (id: string | null) => void;
  toggleNodeSelection: (id: string) => void;
  clearNodeSelection: () => void;
  selectAllNodes: (nodeIds: string[]) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  
  setActiveGraphId: (id: string | null) => void;
  
  setInspectorOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setToolbarOpen: (open: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
  setShortcutsHelpOpen: (open: boolean) => void;
  setRelationshipMode: (mode: 'all' | 'selected' | 'trace') => void;
  setEdgeHandleType: (mode: 'fixed' | 'smart') => void;
  setEdgePathType: (mode: 'organic' | 'circuit') => void;
  cycleEdgePathType: () => void;
  setBasePath: (path: string) => void;
  
  setViewport: (viewport: Viewport) => void;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  
  // Clipboard actions
  setCopiedNodeIds: (ids: string[]) => void;
  clearCopiedNodes: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial State
      selectedNodeId: null,
      hoveredNodeId: null,
      highlightNodeId: null,
      selectedNodeIds: new Set<string>(),
      isLeftOpen: true,
      searchQuery: '',
      activeTags: [],
      activeGraphId: null,
      refreshRate: 0,
      basePath: '',
      
      isInspectorOpen: false,
      isSearchOpen: false,
      isToolbarOpen: true,
      isPaletteOpen: true,
      isShortcutsHelpOpen: false,
      relationshipMode: 'all',
      edgeHandleType: 'smart',
      edgePathType: 'circuit',
      
      viewport: { x: 0, y: 0, zoom: 1 },
      autoSaveEnabled: false,
      directoryHandle: null,
      copiedNodeIds: [],

      // Actions
      setSelectedNodeId: (id) => set({
        selectedNodeId: id,
        selectedNodeIds: id ? new Set([id]) : new Set<string>(),
        isInspectorOpen: !!id
      }),
      
      setHighlightNodeId: (id) => set({ highlightNodeId: id }),

      setPrimaryNodeId: (id) => set({
        selectedNodeId: id,
        isInspectorOpen: !!id
        // Does NOT reset selectedNodeIds — safe to call alongside selectAllNodes
      }),
      
      clearSelection: () => set({
        selectedNodeId: null,
        selectedNodeIds: new Set<string>(),
        isInspectorOpen: false
      }),
      
      setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
      toggleNodeSelection: (id) => set((state) => {
        const newSelection = new Set(state.selectedNodeIds);
        let nextSelectedNodeId = state.selectedNodeId;

        if (newSelection.has(id)) {
          newSelection.delete(id);
          // If we deselected the primary node, pick another one from the set or null
          if (nextSelectedNodeId === id) {
            nextSelectedNodeId = Array.from(newSelection).pop() || null;
          }
        } else {
          newSelection.add(id);
          nextSelectedNodeId = id; // Focus the last selected node
        }
        
        return { 
          selectedNodeIds: newSelection,
          selectedNodeId: nextSelectedNodeId,
          isInspectorOpen: !!nextSelectedNodeId
        };
      }),
      clearNodeSelection: () => set({ selectedNodeIds: new Set<string>() }),
      selectAllNodes: (nodeIds) => set({ selectedNodeIds: new Set(nodeIds) }),
      setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      toggleTag: (tag) => set((state) => ({
        activeTags: state.activeTags.includes(tag)
          ? state.activeTags.filter((t) => t !== tag)
          : [...state.activeTags, tag]
      })),
      
      clearTags: () => set({ activeTags: [] }),
      
      setRefreshRate: (rate) => set({ refreshRate: rate }),
      
      setActiveGraphId: (id) => set({ activeGraphId: id, autoSaveEnabled: false }),
      
      setInspectorOpen: (open) => set({ isInspectorOpen: open }),
      setLeftOpen: (open) => set({ isLeftOpen: open }),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      setToolbarOpen: (open) => set({ isToolbarOpen: open }),
      setPaletteOpen: (open) => set({ isPaletteOpen: open }),
      setShortcutsHelpOpen: (open) => set({ isShortcutsHelpOpen: open }),
      setRelationshipMode: (mode) => set({ relationshipMode: mode }),
      setEdgeHandleType: (mode) => set({ edgeHandleType: mode }),
      setEdgePathType: (mode) => set({ edgePathType: mode }),
      cycleEdgePathType: () => set((state) => ({
        edgePathType: state.edgePathType === 'organic' ? 'circuit' : 'organic'
      })),
      setBasePath: (path) => set({ basePath: path }),
      
      setViewport: (viewport) => set({ viewport }),
      setDirectoryHandle: (handle) => set({ directoryHandle: handle }),
      
      // Clipboard actions
      setCopiedNodeIds: (ids) => set({ copiedNodeIds: ids }),
      clearCopiedNodes: () => set({ copiedNodeIds: [] }),
    }),
    {
      name: 'horizon-ui-store',
      partialize: (state) => ({
        isToolbarOpen: state.isToolbarOpen,
        isPaletteOpen: state.isPaletteOpen,
        relationshipMode: state.relationshipMode,
        edgeHandleType: state.edgeHandleType,
        edgePathType: state.edgePathType,
        autoSaveEnabled: state.autoSaveEnabled,
        activeGraphId: state.activeGraphId,
      }),
    }
  )
);
