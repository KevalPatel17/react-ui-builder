import React, { useRef, useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { CanvasElement } from './CanvasElement';
import { GridGuides } from './GridGuides';
import { ContextMenu } from './ContextMenu';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useDragElement } from '../../hooks/useDragElement';
import type { GuideLine } from '../../utils/snapGuides';
import { createDefaultElement } from '../Sidebar/ComponentTab';
import type { ComponentType } from '../../types';

export const Canvas: React.FC = () => {
  const {
    elements,
    selectElements,
    zoom,
    canvasSize,
    gridVisible,
    previewMode,
    addElement,
    drawMode,
    setDrawMode,
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

  // Draw Mode Drawing States
  const [drawingRect, setDrawingRect] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const [drawMenu, setDrawMenu] = useState<{ clientX: number; clientY: number; rect: { x: number; y: number; w: number; h: number } } | null>(null);

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

    // If drawMode is active, draw a custom component bounding box
    if (drawMode) {
      if (e.target === artboardRef.current) {
        const rect = artboardRef.current.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / (zoom / 100);
        const clickY = (e.clientY - rect.top) / (zoom / 100);
        setDrawingRect({ startX: clickX, startY: clickY, currentX: clickX, currentY: clickY });
        setDrawMenu(null); // Clear previous menu if drawing again
      }
      return;
    }

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
    if (drawMode && drawingRect && artboardRef.current) {
      const rect = artboardRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / (zoom / 100);
      const currentY = (e.clientY - rect.top) / (zoom / 100);
      setDrawingRect((prev) => prev ? { ...prev, currentX, currentY } : null);
      return;
    }

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

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    setMarquee(null);

    if (drawMode && drawingRect) {
      const x = Math.min(drawingRect.startX, drawingRect.currentX);
      const y = Math.min(drawingRect.startY, drawingRect.currentY);
      const w = Math.abs(drawingRect.startX - drawingRect.currentX);
      const h = Math.abs(drawingRect.startY - drawingRect.currentY);

      if (w > 5 && h > 5) {
        // Show components popup near the cursor
        setDrawMenu({
          clientX: e.clientX,
          clientY: e.clientY,
          rect: { x, y, w, h }
        });
      }
      setDrawingRect(null);
    }
  };

  const handleCreateComponent = (type: ComponentType) => {
    if (!drawMenu) return;
    const { rect } = drawMenu;
    const id = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const defaultEl = createDefaultElement(type, id);
    
    // Override position and size
    defaultEl.x = Math.round(rect.x / 8) * 8;
    defaultEl.y = Math.round(rect.y / 8) * 8;
    defaultEl.width = Math.max(30, Math.round(rect.w / 8) * 8);
    defaultEl.height = Math.max(20, Math.round(rect.h / 8) * 8);
    
    // Grid alignment overrides if flex/grid
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

    addElement(defaultEl);
    setDrawMenu(null);
    setDrawMode(false); // Disable draw mode after inserting
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
  const rootElements = elements.filter((el) => !el.parentId && (!previewMode || !el.hidden));

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
          {/* Drawing Mode Visual Box */}
          {drawingRect && (
            <div
              className="absolute bg-emerald-500/15 border-2 border-emerald-500 border-dashed pointer-events-none z-[9999]"
              style={{
                left: `${Math.min(drawingRect.startX, drawingRect.currentX)}px`,
                top: `${Math.min(drawingRect.startY, drawingRect.currentY)}px`,
                width: `${Math.abs(drawingRect.startX - drawingRect.currentX)}px`,
                height: `${Math.abs(drawingRect.startY - drawingRect.currentY)}px`,
              }}
            />
          )}
        </div>
      </div>

      {/* Draw Menu Component Selection popup */}
      {drawMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${drawMenu.clientX + 10}px`,
            top: `${drawMenu.clientY + 10}px`,
            zIndex: 99999,
          }}
          className="bg-[#12131a] border border-[#1f202c] shadow-2xl rounded-xl p-2 w-48 text-left animate-scale-up"
        >
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1 border-b border-[#1f202c]">
            Convert sketch to:
          </div>
          <div className="flex flex-col gap-0.5">
            {[
              { type: 'primary-btn', label: 'Primary Button' },
              { type: 'text-input', label: 'Form Input' },
              { type: 'heading', label: 'Heading Text' },
              { type: 'paragraph', label: 'Paragraph Body' },
              { type: 'card', label: 'Card Container' },
              { type: 'container-2col', label: '2-Col Grid Layout' },
              { type: 'circle', label: 'Circle Shape' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => handleCreateComponent(item.type as ComponentType)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-indigo-600 hover:text-white text-gray-300 text-xs transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDrawMenu(null)}
            className="w-full text-center mt-1 text-[10px] text-gray-500 hover:text-rose-400 border-t border-[#1f202c] pt-1.5 cursor-pointer transition-colors"
          >
            Cancel Sketch
          </button>
        </div>
      )}

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
