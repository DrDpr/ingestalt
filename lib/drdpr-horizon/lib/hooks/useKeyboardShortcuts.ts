import { useEffect, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useUIStore } from '../store/useUIStore';
import { db } from '../db';
import { useTheme } from 'next-themes';

interface KeyboardShortcutsOptions {
  onDelete?: (nodeIds: string[]) => void;
  onDuplicate?: (nodeIds: string[]) => void;
  onCopy?: (nodeIds: string[]) => void;
  onPaste?: () => void;
  getAllNodeIds?: () => string[];
}

/**
 * Custom hook for handling keyboard shortcuts
 * Implements FR-10.1 through FR-10.7 from FEATURES.md
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();
  const { setTheme, resolvedTheme } = useTheme();
  const {
    selectedNodeId,
    cycleEdgePathType,
    setShortcutsHelpOpen,
    setInspectorOpen,
    isInspectorOpen,
    setLeftOpen,
    isLeftOpen,
    setPaletteOpen,
    isPaletteOpen,
    setSearchOpen,
    isSearchOpen,
    copiedNodeIds,
    setCopiedNodeIds,
    clearCopiedNodes,
    selectedNodeIds,
    clearSelection,
    selectAllNodes,
  } = useUIStore();

  // Detect platform for Cmd (Mac) vs Ctrl (Windows/Linux)
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'metaKey' : 'ctrlKey';

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Don't handle shortcuts when typing in input fields (except for Escape)
      if (isInputField && event.key !== 'Escape') {
        return;
      }

      const mod = event[modKey];
      const shift = event.shiftKey;
      const alt = event.altKey;

      // FR-10.7.2: Shortcuts help panel (Ctrl/Cmd+? or F1)
      if ((mod && shift && event.key === '?') || event.key === 'F1') {
        event.preventDefault();
        setShortcutsHelpOpen(true);
        return;
      }

      // FR-10.2.6 & FR-10.3.1: Escape - Deselect all or close inspector
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isInspectorOpen) {
          setInspectorOpen(false);
        } else if (selectedNodeId) {
          clearSelection();
        }
        return;
      }

      // FR-10.2.3: Copy selected nodes (Ctrl/Cmd+C)
      if (mod && event.key === 'c' && selectedNodeIds.size > 0) {
        event.preventDefault();
        const ids = Array.from(selectedNodeIds);
        setCopiedNodeIds(ids);
        options.onCopy?.(ids);
        return;
      }

      // FR-10.2.4: Paste copied nodes (Ctrl/Cmd+V)
      if (mod && event.key === 'v' && copiedNodeIds.length > 0) {
        event.preventDefault();
        options.onPaste?.();
        return;
      }

      // FR-10.2.2: Duplicate selected nodes (Ctrl/Cmd+D)
      if (mod && event.key === 'd' && selectedNodeIds.size > 0) {
        event.preventDefault();
        options.onDuplicate?.(Array.from(selectedNodeIds));
        return;
      }

      // Select All Nodes (Ctrl/Cmd+A)
      if (mod && event.key === 'a') {
        if (options.getAllNodeIds) {
          event.preventDefault();
          const ids = options.getAllNodeIds();
          selectAllNodes(ids);
        }
        return;
      }

      // Delete (Backspace / Delete)
      if ((event.key === 'Backspace' || event.key === 'Delete') && !isInputField) {
        if (selectedNodeIds.size > 0) {
          event.preventDefault();
          options.onDelete?.(Array.from(selectedNodeIds));
        }
        return;
      }

      // FR-10.3.3: Save changes (Ctrl/Cmd+S)
      if (mod && event.key === 's') {
        event.preventDefault();
        // Auto-save is handled by the system, this just prevents browser save dialog
        return;
      }

      // FR-10.4.1 & FR-10.4.2: Open search (Ctrl/Cmd+K or Ctrl/Cmd+P or Ctrl/Cmd+F)
      if (mod && (event.key === 'k' || event.key === 'p' || event.key === 'f')) {
        event.preventDefault();
        if (event.key === 'p') {
          setPaletteOpen(!isPaletteOpen);
        } else {
          setSearchOpen(!isSearchOpen);
        }
        return;
      }

      // Toggle Sidebar (Ctrl/Cmd+B)
      if (mod && event.key === 'b') {
        event.preventDefault();
        setLeftOpen(!isLeftOpen);
        return;
      }

      // Toggle Inspector (Ctrl/Cmd+I)
      if (mod && event.key === 'i') {
        event.preventDefault();
        setInspectorOpen(!isInspectorOpen);
        return;
      }

      // FR-10.5.3: Toggle theme (Ctrl/Cmd+Shift+T)
      if (mod && shift && event.key === 'T') {
        event.preventDefault();
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        return;
      }

      // FR-10.5.2: Cycle edge styles (Ctrl/Cmd+E)
      if (mod && event.key === 'e') {
        event.preventDefault();
        cycleEdgePathType();
        return;
      }

      // FR-10.1.2: Zoom in (Ctrl/Cmd++)
      if (mod && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        zoomIn({ duration: 200 });
        return;
      }

      // FR-10.1.2: Zoom out (Ctrl/Cmd+-)
      if (mod && event.key === '-') {
        event.preventDefault();
        zoomOut({ duration: 200 });
        return;
      }

      // FR-10.1.3: Fit view to all nodes (Ctrl/Cmd+0)
      if (mod && event.key === '0') {
        event.preventDefault();
        fitView({ duration: 300, padding: 0.2 });
        return;
      }

      // FR-10.1.4: Fit view to selected node (Ctrl/Cmd+Shift+0)
      if (mod && shift && event.key === ')') { // Shift+0 produces ')'
        event.preventDefault();
        if (selectedNodeId) {
          fitView({
            duration: 300,
            padding: 0.2,
            nodes: [{ id: selectedNodeId }]
          });
        }
        return;
      }

      // FR-10.1.5: Reset zoom to 100% (Ctrl/Cmd+1)
      if (mod && event.key === '1') {
        event.preventDefault();
        setCenter(0, 0, { zoom: 1, duration: 300 });
        return;
      }

      // FR-10.1.1: Pan canvas with arrow keys
      if (!mod && !shift && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const panAmount = 50;
        const { x, y } = useUIStore.getState().viewport;
        
        switch (event.key) {
          case 'ArrowUp':
            setCenter(x, y - panAmount, { duration: 100 });
            break;
          case 'ArrowDown':
            setCenter(x, y + panAmount, { duration: 100 });
            break;
          case 'ArrowLeft':
            setCenter(x - panAmount, y, { duration: 100 });
            break;
          case 'ArrowRight':
            setCenter(x + panAmount, y, { duration: 100 });
            break;
        }
        return;
      }

      // FR-10.1.1: Fast pan with Shift+Arrow
      if (!mod && shift && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const panAmount = 200;
        const { x, y } = useUIStore.getState().viewport;
        
        switch (event.key) {
          case 'ArrowUp':
            setCenter(x, y - panAmount, { duration: 100 });
            break;
          case 'ArrowDown':
            setCenter(x, y + panAmount, { duration: 100 });
            break;
          case 'ArrowLeft':
            setCenter(x - panAmount, y, { duration: 100 });
            break;
          case 'ArrowRight':
            setCenter(x, y + panAmount, { duration: 100 });
            break;
        }
        return;
      }

      // FR-10.2.6: Open inspector (Enter)
      if (event.key === 'Enter' && selectedNodeId && !isInputField) {
        event.preventDefault();
        setInspectorOpen(true);
        return;
      }
    },
    [
      modKey,
      selectedNodeId,
      copiedNodeIds,
      isInspectorOpen,
      options,
      fitView,
      zoomIn,
      zoomOut,
      setCenter,
      clearSelection,
      setTheme,
      resolvedTheme,
      cycleEdgePathType,
      setShortcutsHelpOpen,
      setInspectorOpen,
      setSearchOpen,
      setCopiedNodeIds,
      selectedNodeIds,
      clearSelection,
      selectAllNodes,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    isMac,
    modKey: isMac ? 'Cmd' : 'Ctrl',
  };
}

// Made with Bob
