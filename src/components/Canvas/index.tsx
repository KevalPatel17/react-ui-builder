import React, { useRef, useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { CanvasElement } from './CanvasElement';
import { GridGuides } from './GridGuides';
import { ContextMenu } from './ContextMenu';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useDragElement } from '../../hooks/useDragElement';
import type { GuideLine } from '../../utils/snapGuides';
import { createDefaultElement } from '../Sidebar/ComponentTab';

export const Canvas: React.FC = () => {
  const {
    elements,
    selectElements,
    zoom,
    canvasSize,
    gridVisible,
    previewMode,
    addElement,
  } = useBuilderStore();

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);

  // States
  const [dragGuides, setDragGuides] = useState<GuideLine[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Selection Marquee (Click & Drag to select)
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Bind Keyboard Shortcuts
  useKeyboardShortcuts();

  // Bind Custom Dragging Hook
  const { startDrag } = useDragElement(artboardRef, setDragGuides);

  // Track spacebar for panning cursor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setSpacePressed(true);
        // Prevent default spacebar scrolling
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Auto-center the artboard inside the viewport on initial load or canvas preset size changes
  useEffect(() => {
    const handleCenter = () => {
      if (canvasContainerRef.current) {
        const containerRect = canvasContainerRef.current.getBoundingClientRect();
        const initialX = Math.max(20, (containerRect.width - canvasSize.width * (zoom / 100)) / 2);
        const initialY = Math.max(20, (containerRect.height - canvasSize.height * (zoom / 100)) / 2);
        setPan({ x: initialX, y: initialY });
      }
    };

    handleCenter();
    const timer = setTimeout(handleCenter, 50);
    return () => clearTimeout(timer);
  }, [canvasSize]);

  // Track panning with window listeners for absolute smoothness
  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  // --- Canvas Mouse Actions: Panning & Marquee Selection ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (previewMode) return;
    
    // Check if right click (show context menu)
    if (e.button === 2) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
      return;
    }

    setContextMenu(null);

    // Click on canvas background deselects elements
    if (e.target === artboardRef.current || e.target === canvasContainerRef.current) {
      selectElements([]);
    }

    if (spacePressed || e.target === canvasContainerRef.current) {
      // Figma-style panning or panning on dark empty canvas background directly
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    // Otherwise, start Drag Marquee Selection if clicking on background
    if (e.target === artboardRef.current) {
      const rect = artboardRef.current.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / (zoom / 100);
      const clickY = (e.clientY - rect.top) / (zoom / 100);
      setMarquee({ startX: clickX, startY: clickY, currentX: clickX, currentY: clickY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (marquee && artboardRef.current) {
      const rect = artboardRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / (zoom / 100);
      const currentY = (e.clientY - rect.top) / (zoom / 100);
      setMarquee((prev) => prev ? { ...prev, currentX, currentY } : null);

      // Perform Selection calculations in real-time
      const x1 = Math.min(marquee.startX, currentX);
      const x2 = Math.max(marquee.startX, currentX);
      const y1 = Math.min(marquee.startY, currentY);
      const y2 = Math.max(marquee.startY, currentY);

      // Check which elements intersect with the selection box
      const overlapped = elements.filter((el) => {
        if (el.hidden) return false;
        
        // Element bounds
        const elL = el.x;
        const elR = el.x + el.width;
        const elT = el.y;
        const elB = el.y + el.height;

        // Intersection check
        return (
          elL < x2 &&
          elR > x1 &&
          elT < y2 &&
          elB > y1
        );
      });

      selectElements(overlapped.map((el) => el.id));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setMarquee(null);
  };

  // --- HTML5 Drag & Drop from Sidebar ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (previewMode || !artboardRef.current) return;

    try {
      let template: any = null;
      const craftTemplateStr = e.dataTransfer.getData('application/react-craft-template');
      const builderTypeStr = e.dataTransfer.getData('application/react-builder-type');

      if (craftTemplateStr) {
        template = JSON.parse(craftTemplateStr);
      } else if (builderTypeStr) {
        const type = builderTypeStr as any;
        const id = `${type}_${Math.random().toString(36).substr(2, 9)}`;
        const defaultEl = createDefaultElement(type, id);
        
        // Match specific layout logic from LayoutTab/ComponentTab click handlers
        if (type.includes('col') || type.includes('grid')) {
          defaultEl.style.display = 'grid';
          if (type === 'container-2col') defaultEl.style.gridColumns = 2;
          else if (type === 'container-3col') defaultEl.style.gridColumns = 3;
          else if (type === 'container-4col') defaultEl.style.gridColumns = 4;
          else defaultEl.style.gridColumns = 1;
        } else if (type.includes('flex')) {
          defaultEl.style.display = 'flex';
          defaultEl.style.flexDirection = type === 'flex-row' ? 'row' : 'column';
        }
        
        template = defaultEl;
      }

      if (!template) return;

      const rect = artboardRef.current.getBoundingClientRect();
      const zoomFactor = zoom / 100;

      // Drop coords factoring in scale
      let dropX = (e.clientX - rect.left) / zoomFactor;
      let dropY = (e.clientY - rect.top) / zoomFactor;

      // Snap to grid on drop
      dropX = Math.round(dropX / 8) * 8;
      dropY = Math.round(dropY / 8) * 8;

      // Subtract half-size to center drops on cursor
      const width = template.width || 120;
      const height = template.height || 45;
      const x = Math.max(0, Math.round(dropX - width / 2));
      const y = Math.max(0, Math.round(dropY - height / 2));

      // Append element
      addElement({
        ...template,
        x,
        y,
      });

    } catch (err) {
      console.error('Failed to parse drag drop template', err);
    }
  };

  // Prevent default context menu from showing
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Root canvas elements (top-level only, nested renders inside themselves)
  const rootElements = elements.filter((el) => !el.parentId && !el.hidden);

  return (
    <div
      ref={canvasContainerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      className={`flex-1 h-full overflow-hidden relative outline-none transition-colors select-none ${
        previewMode ? 'bg-[#f8fafc]' : 'bg-[#0b0c11]'
      } ${spacePressed ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
    >
      {/* Zoom / Translation Wrapper */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: 'top left',
        }}
        className="absolute transition-transform duration-75 ease-out"
      >
        {/* Device Viewport Frame Container */}
        <div
          ref={artboardRef}
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
          }}
          className={`relative shadow-2xl transition-all duration-300 ${
            previewMode
              ? 'bg-transparent border-0'
              : 'bg-white border border-[#1f202c]/60 rounded-md'
          } ${gridVisible && !previewMode ? 'dot-grid' : ''}`}
        >
          {/* Elements Renderer */}
          {rootElements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              onStartDrag={startDrag}
            />
          ))}

          {/* Alignment Snapping Guides */}
          {!previewMode && (
            <GridGuides
              guides={dragGuides}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />
          )}

          {/* Drag Marquee Visual Box */}
          {marquee && (
            <div
              className="absolute bg-indigo-500/15 border border-indigo-500 pointer-events-none z-[9999]"
              style={{
                left: `${Math.min(marquee.startX, marquee.currentX)}px`,
                top: `${Math.min(marquee.startY, marquee.currentY)}px`,
                width: `${Math.abs(marquee.startX - marquee.currentX)}px`,
                height: `${Math.abs(marquee.startY - marquee.currentY)}px`,
              }}
            />
          )}
        </div>
      </div>

      {/* Right Click Context Menu overlay */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
