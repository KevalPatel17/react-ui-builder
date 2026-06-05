import { useState } from 'react';
import { useBuilderStore } from '../store/builderStore';
import type { CanvasElement } from '../types';
import { calculateSnapAndGuides } from '../utils/snapGuides';
import type { GuideLine } from '../utils/snapGuides';

export const useDragElement = (
  canvasRef: React.RefObject<HTMLDivElement | null>,
  setDragGuides: (guides: GuideLine[]) => void
) => {
  const {
    elements,
    zoom,
    snapToGrid,
    moveElement,
    updateElement,
    saveToHistory,
    selectedIds,
    selectElements,
  } = useBuilderStore();

  const [isDragging, setIsDragging] = useState(false);

  const startDrag = (e: React.MouseEvent, element: CanvasElement) => {
    if (element.locked) return;
    e.stopPropagation();

    // Select the element if not already selected
    if (!selectedIds.includes(element.id)) {
      selectElements([element.id]);
    }

    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    
    // Store original position of all selected elements for multi-dragging
    const dragStarts = selectedIds.map((id) => {
      const el = elements.find((x) => x.id === id);
      return {
        id,
        x: el?.x ?? 0,
        y: el?.y ?? 0,
        el: el!,
      };
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const zoomFactor = zoom / 100;
      const dx = (moveEvent.clientX - startX) / zoomFactor;
      const dy = (moveEvent.clientY - startY) / zoomFactor;

      // Single drag alignment smart guides
      if (dragStarts.length === 1) {
        const item = dragStarts[0];
        
        // Temporary element with delta applied
        const tempEl = {
          ...item.el,
          x: item.x + dx,
          y: item.y + dy,
        };

        const snapResult = calculateSnapAndGuides(
          tempEl,
          elements,
          snapToGrid
        );

        moveElement(item.id, snapResult.x, snapResult.y);
        setDragGuides(snapResult.guides);
      } else {
        // Multi-select drag (nudge all by delta, no guides snap for simplicity)
        dragStarts.forEach((item) => {
          let newX = item.x + dx;
          let newY = item.y + dy;

          if (snapToGrid) {
            newX = Math.round(newX / 8) * 8;
            newY = Math.round(newY / 8) * 8;
          }

          moveElement(item.id, newX, newY);
        });
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsDragging(false);
      setDragGuides([]);
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Perform Nesting Check on drag complete:
      // Check if dropped inside a layout container
      if (canvasRef.current && dragStarts.length === 1) {
        const draggedId = dragStarts[0].id;
        const draggedEl = elements.find((el) => el.id === draggedId);
        
        if (draggedEl && !draggedEl.locked) {
          // Calculate drop coordinate relative to canvas bounding client rect
          const canvasRect = canvasRef.current.getBoundingClientRect();
          const dropXRelative = (upEvent.clientX - canvasRect.left) / (zoom / 100);
          const dropYRelative = (upEvent.clientY - canvasRect.top) / (zoom / 100);

          // Find container elements under this drop point (excluding the dragged element itself)
          const containers = elements.filter(
            (el) =>
              el.id !== draggedId &&
              !el.hidden &&
              (el.type.includes('container') ||
                el.type.includes('layout') ||
                el.type === 'card' ||
                el.type === 'hero' ||
                el.type === 'split-50-50')
          );

          let potentialParent: CanvasElement | null = null;
          let deepestZ = -9999;

          // Find the top-most container bounding box that contains the drop point
          containers.forEach((container) => {
            // Check boundaries
            const containerL = container.x;
            const containerR = container.x + container.width;
            const containerT = container.y;
            const containerB = container.y + container.height;

            if (
              dropXRelative >= containerL &&
              dropXRelative <= containerR &&
              dropYRelative >= containerT &&
              dropYRelative <= containerB
            ) {
              if (container.zIndex > deepestZ) {
                deepestZ = container.zIndex;
                potentialParent = container;
              }
            }
          });

          if (potentialParent) {
            const parent = potentialParent as CanvasElement;
            // If the element has a new parent or changed parents
            if (draggedEl.parentId !== parent.id) {
              // Convert coordinate relative to parent
              const relativeX = draggedEl.x - parent.x;
              const relativeY = draggedEl.y - parent.y;

              updateElement(draggedId, {
                parentId: parent.id,
                x: relativeX,
                y: relativeY,
              });
            }
          } else {
            // Dropped outside all containers, clear parentId and restore absolute positions
            if (draggedEl.parentId) {
              // Get parent's absolute coordinates
              const parent = elements.find((p) => p.id === draggedEl.parentId);
              if (parent) {
                const absX = parent.x + draggedEl.x;
                const absY = parent.y + draggedEl.y;

                updateElement(draggedId, {
                  parentId: undefined,
                  x: absX,
                  y: absY,
                });
              }
            }
          }
        }
      }

      saveToHistory();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return { startDrag, isDragging };
};
