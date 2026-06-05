import { useState } from 'react';
import { useBuilderStore } from '../store/builderStore';
import type { CanvasElement } from '../types';

export type ResizeHandleType = 't' | 'r' | 'b' | 'l' | 'tl' | 'tr' | 'bl' | 'br';

export const useResizeElement = () => {
  const { zoom, snapToGrid, updateElement, saveToHistory } = useBuilderStore();
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (
    e: React.MouseEvent,
    element: CanvasElement,
    handle: ResizeHandleType
  ) => {
    if (element.locked) return;
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = element.width;
    const startH = element.height;
    const startElX = element.x;
    const startElY = element.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const zoomFactor = zoom / 100;
      const dx = (moveEvent.clientX - startX) / zoomFactor;
      const dy = (moveEvent.clientY - startY) / zoomFactor;

      let newWidth = startW;
      let newHeight = startH;
      let newX = startElX;
      let newY = startElY;

      // Vertical Resizing (t, b)
      if (handle.includes('t')) {
        newHeight = startH - dy;
        newY = startElY + dy;
      } else if (handle.includes('b')) {
        newHeight = startH + dy;
      }

      // Horizontal Resizing (l, r)
      if (handle.includes('l')) {
        newWidth = startW - dx;
        newX = startElX + dx;
      } else if (handle.includes('r')) {
        newWidth = startW + dx;
      }

      // Apply Snapping (e.g. 8px grid)
      if (snapToGrid) {
        // Snap dimensions
        newWidth = Math.round(newWidth / 8) * 8;
        newHeight = Math.round(newHeight / 8) * 8;
        
        // Snap coordinates for top/left anchors to keep alignment stable
        if (handle.includes('l')) {
          newX = Math.round(newX / 8) * 8;
          // Compensate width difference from snapping coordinate
          newWidth = startW + (startElX - newX);
        }
        if (handle.includes('t')) {
          newY = Math.round(newY / 8) * 8;
          newHeight = startH + (startElY - newY);
        }
      }

      // Enforce Minimum Size limits
      const minSize = 10;
      if (newWidth < minSize) {
        newWidth = minSize;
        if (handle.includes('l')) {
          newX = startElX + startW - minSize;
        }
      }
      if (newHeight < minSize) {
        newHeight = minSize;
        if (handle.includes('t')) {
          newY = startElY + startH - minSize;
        }
      }

      updateElement(element.id, {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        x: Math.round(newX),
        y: Math.round(newY),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      saveToHistory();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return { startResize, isResizing };
};
