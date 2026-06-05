import { useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';

export const useKeyboardShortcuts = () => {
  const {
    selectedIds,
    elements,
    undo,
    redo,
    deleteElements,
    duplicateElements,
    copySelected,
    pasteSelected,
    selectElements,
    updateElement,
    saveToHistory
  } = useBuilderStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // 1. Undo & Redo: Ctrl+Z / Ctrl+Y
      if (ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      if (ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      // 2. Clipboard: Ctrl+C / Ctrl+V
      if (ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelected();
      }
      if (ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteSelected();
      }

      // 3. Duplicate: Ctrl+D
      if (ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateElements(selectedIds);
      }

      // 4. Select All: Ctrl+A
      if (ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectElements(elements.map((el) => el.id));
      }

      // 5. Delete / Backspace: Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteElements(selectedIds);
      }

      // 6. Escape: Deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        selectElements([]);
      }

      // 7. Arrow Nudging: Arrow keys (nudge by 1px, Shift+Arrow nudge by 10px)
      if (
        selectedIds.length > 0 &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        e.preventDefault();
        const nudgeAmount = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === 'ArrowUp') dy = -nudgeAmount;
        if (e.key === 'ArrowDown') dy = nudgeAmount;
        if (e.key === 'ArrowLeft') dx = -nudgeAmount;
        if (e.key === 'ArrowRight') dx = nudgeAmount;

        selectedIds.forEach((id) => {
          const el = elements.find((x) => x.id === id);
          if (el && !el.locked) {
            // Relative coordinates if inside container, absolute if not
            updateElement(id, {
              x: el.x + dx,
              y: el.y + dy,
            });
          }
        });

        // Trigger history save at end of nudge
        saveToHistory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, elements, undo, redo, deleteElements, duplicateElements, copySelected, pasteSelected, selectElements, updateElement, saveToHistory]);
};
