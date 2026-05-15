import { create } from 'zustand';

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface UIState {
  // Global Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  
  // Search & Filtering
  searchQuery: string;
  activeTags: string[];
  
  // App Config & Workspace
  isInspectorOpen: boolean;
  isSearchOpen: boolean;
  relationshipMode: 'all' | 'selected' | 'trace';
  edgeHandleType: 'fixed' | 'smart';
  edgePathType: 'organic' | 'circuit';
  basePath: string;
  
  // Canvas State (React Flow Viewport)
  viewport: Viewport;
  autoSaveEnabled: boolean;
  
  // Actions
  setSelectedNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  
  setInspectorOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setRelationshipMode: (mode: 'all' | 'selected' | 'trace') => void;
  setEdgeHandleType: (mode: 'fixed' | 'smart') => void;
  setEdgePathType: (mode: 'organic' | 'circuit') => void;
  setBasePath: (path: string) => void;
  
  setViewport: (viewport: Viewport) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial State
  selectedNodeId: null,
  hoveredNodeId: null,
  searchQuery: '',
  activeTags: [],
  basePath: '',
  
  isInspectorOpen: false,
  isSearchOpen: false,
  relationshipMode: 'all',
  edgeHandleType: 'smart',
  edgePathType: 'circuit', // Fixed to match interface
  
  viewport: { x: 0, y: 0, zoom: 1 },
  autoSaveEnabled: false,

  // Actions
  setSelectedNodeId: (id) => set({ selectedNodeId: id, isInspectorOpen: !!id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleTag: (tag) => set((state) => ({
    activeTags: state.activeTags.includes(tag)
      ? state.activeTags.filter((t) => t !== tag)
      : [...state.activeTags, tag]
  })),
  
  clearTags: () => set({ activeTags: [] }),
  
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setRelationshipMode: (mode) => set({ relationshipMode: mode }),
  setEdgeHandleType: (mode) => set({ edgeHandleType: mode }),
  setEdgePathType: (mode) => set({ edgePathType: mode }),
  setBasePath: (path) => set({ basePath: path }),
  
  setViewport: (viewport) => set({ viewport }),
}));
