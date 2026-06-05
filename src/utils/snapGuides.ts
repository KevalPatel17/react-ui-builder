import type { CanvasElement } from '../types';

export interface GuideLine {
  type: 'h' | 'v'; // h is horizontal line (constant Y), v is vertical line (constant X)
  pos: number;
}

interface SnapResult {
  x: number;
  y: number;
  guides: GuideLine[];
}

export const calculateSnapAndGuides = (
  draggingElement: CanvasElement,
  allElements: CanvasElement[],
  snapToGrid: boolean,
  gridSize = 8,
  tolerance = 5
): SnapResult => {
  let snappedX = draggingElement.x;
  let snappedY = draggingElement.y;
  
  // Grid Snapping
  if (snapToGrid) {
    snappedX = Math.round(snappedX / gridSize) * gridSize;
    snappedY = Math.round(snappedY / gridSize) * gridSize;
  }

  const guides: GuideLine[] = [];
  
  // Calculate smart alignment guides with other siblings at the same parent depth
  const siblings = allElements.filter(
    (el) => el.id !== draggingElement.id && el.parentId === draggingElement.parentId && !el.hidden
  );

  if (siblings.length === 0) {
    return { x: snappedX, y: snappedY, guides };
  }

  const dragWidth = draggingElement.width;
  const dragHeight = draggingElement.height;

  // Drag element edges
  const dragL = snappedX;
  const dragR = snappedX + dragWidth;
  const dragC = snappedX + dragWidth / 2;
  
  const dragT = snappedY;
  const dragB = snappedY + dragHeight;
  const dragM = snappedY + dragHeight / 2;

  let snapXApplied = false;
  let snapYApplied = false;

  for (const sibling of siblings) {
    const sibL = sibling.x;
    const sibR = sibling.x + sibling.width;
    const sibC = sibling.x + sibling.width / 2;

    const sibT = sibling.y;
    const sibB = sibling.y + sibling.height;
    const sibM = sibling.y + sibling.height / 2;

    // --- Vertical Guides (Aligning X positions) ---
    if (!snapXApplied) {
      // Left to Left
      if (Math.abs(dragL - sibL) < tolerance) {
        snappedX = sibL;
        guides.push({ type: 'v', pos: sibL });
        snapXApplied = true;
      }
      // Left to Right
      else if (Math.abs(dragL - sibR) < tolerance) {
        snappedX = sibR;
        guides.push({ type: 'v', pos: sibR });
        snapXApplied = true;
      }
      // Right to Left
      else if (Math.abs(dragR - sibL) < tolerance) {
        snappedX = sibL - dragWidth;
        guides.push({ type: 'v', pos: sibL });
        snapXApplied = true;
      }
      // Right to Right
      else if (Math.abs(dragR - sibR) < tolerance) {
        snappedX = sibR - dragWidth;
        guides.push({ type: 'v', pos: sibR });
        snapXApplied = true;
      }
      // Center to Center
      else if (Math.abs(dragC - sibC) < tolerance) {
        snappedX = sibC - dragWidth / 2;
        guides.push({ type: 'v', pos: sibC });
        snapXApplied = true;
      }
    }

    // --- Horizontal Guides (Aligning Y positions) ---
    if (!snapYApplied) {
      // Top to Top
      if (Math.abs(dragT - sibT) < tolerance) {
        snappedY = sibT;
        guides.push({ type: 'h', pos: sibT });
        snapYApplied = true;
      }
      // Top to Bottom
      else if (Math.abs(dragT - sibB) < tolerance) {
        snappedY = sibB;
        guides.push({ type: 'h', pos: sibB });
        snapYApplied = true;
      }
      // Bottom to Top
      else if (Math.abs(dragB - sibT) < tolerance) {
        snappedY = sibT - dragHeight;
        guides.push({ type: 'h', pos: sibT });
        snapYApplied = true;
      }
      // Bottom to Bottom
      else if (Math.abs(dragB - sibB) < tolerance) {
        snappedY = sibB - dragHeight;
        guides.push({ type: 'h', pos: sibB });
        snapYApplied = true;
      }
      // Middle to Middle
      else if (Math.abs(dragM - sibM) < tolerance) {
        snappedY = sibM - dragHeight / 2;
        guides.push({ type: 'h', pos: sibM });
        snapYApplied = true;
      }
    }

    if (snapXApplied && snapYApplied) break;
  }

  return {
    x: snappedX,
    y: snappedY,
    guides,
  };
};
