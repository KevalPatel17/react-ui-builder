import { create } from 'zustand';
import type { CanvasElement, ComponentType, StyleProps, ComponentProps } from '../types';

interface BuilderState {
  elements: CanvasElement[];
  selectedIds: string[];
  history: CanvasElement[][];
  historyIndex: number;
  canvasSize: { width: number; height: number; type: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'custom' };
  zoom: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  copiedElements: Omit<CanvasElement, 'id'>[];
  copiedStyles: { props: ComponentProps; style: StyleProps } | null;
  darkMode: boolean;
  componentSearch: string;
  favorites: ComponentType[];
  previewMode: boolean;
  
  // Actions
  addElement: (el: CanvasElement) => void;
  updateElement: (id: string, changes: Partial<CanvasElement>) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  selectElements: (ids: string[]) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, w: number, h: number) => void;
  reorderLayer: (id: string, direction: 'up' | 'down' | 'front' | 'back') => void;
  groupElements: (ids: string[]) => void;
  ungroupElements: (ids: string[]) => void;
  alignSelected: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-h' | 'distribute-v') => void;
  
  // Clipboard
  copySelected: () => void;
  pasteSelected: () => void;
  copyStyles: (id: string) => void;
  pasteStyles: (id: string) => void;

  // History & Options
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  setZoom: (z: number) => void;
  setCanvasSize: (width: number, height: number, type: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'custom') => void;
  setGridVisible: (visible: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setComponentSearch: (query: string) => void;
  toggleFavorite: (type: ComponentType) => void;
  setPreviewMode: (preview: boolean) => void;
  clearCanvas: () => void;
  loadTemplate: (elements: CanvasElement[]) => void;
}


const createHistorySnapshot = (elements: CanvasElement[]): CanvasElement[] => {
  return JSON.parse(JSON.stringify(elements));
};

export const useBuilderStore = create<BuilderState>((set, get) => {
  // Try to load initial dark mode from localstorage
  const storedDark = localStorage.getItem('builder-dark-mode');
  const initialDark = storedDark ? JSON.parse(storedDark) : true;
  
  // Try to load canvas size
  const storedSize = localStorage.getItem('builder-canvas-size');
  const initialSize = storedSize ? JSON.parse(storedSize) : { width: 1440, height: 900, type: 'desktop' };

  return {
    elements: [],
    selectedIds: [],
    history: [[]],
    historyIndex: 0,
    canvasSize: initialSize,
    zoom: 100,
    gridVisible: true,
    snapToGrid: true,
    copiedElements: [],
    copiedStyles: null,
    darkMode: initialDark,
    componentSearch: '',
    favorites: [],
    previewMode: false,

    saveToHistory: () => {
      const { elements, history, historyIndex } = get();
      const currentSnapshot = createHistorySnapshot(elements);
      const newHistory = history.slice(0, historyIndex + 1);
      
      // Limit history to 50 entries
      if (newHistory.length >= 50) {
        newHistory.shift();
      }

      set({
        history: [...newHistory, currentSnapshot],
        historyIndex: newHistory.length,
      });

      // Save to localStorage as auto-save
      localStorage.setItem('builder-canvas-elements', JSON.stringify(elements));
    },

    addElement: (el) => {
      set((state) => {
        // If element is dropped inside a container, update container's children references
        const updatedElements = [...state.elements, el];
        
        if (el.parentId) {
          const parent = updatedElements.find((p) => p.id === el.parentId);
          if (parent) {
            // Recalculate zIndex to be larger than parent's children
            const siblings = updatedElements.filter((s) => s.parentId === el.parentId);
            el.zIndex = siblings.length + parent.zIndex;
          }
        }
        
        return {
          elements: updatedElements,
          selectedIds: [el.id],
        };
      });
      get().saveToHistory();
    },

    updateElement: (id, changes) => {
      set((state) => {
        const updatedElements = state.elements.map((el) => {
          if (el.id === id) {
            // Handle merging styling or props object if present
            const updatedStyle = changes.style ? { ...el.style, ...changes.style } : el.style;
            const updatedProps = changes.props ? { ...el.props, ...changes.props } : el.props;
            
            return {
              ...el,
              ...changes,
              props: updatedProps,
              style: updatedStyle,
            };
          }
          return el;
        });

        return { elements: updatedElements };
      });
      // Do not push history on every slide, components call saveToHistory onMouseUp/onChangeEnd
    },

    deleteElements: (ids) => {
      if (ids.length === 0) return;
      set((state) => {
        // Collect all element IDs to delete (including nested children if any element is a container)
        const allIdsToDelete = new Set<string>();
        
        const collectChildren = (id: string) => {
          allIdsToDelete.add(id);
          state.elements.forEach((child) => {
            if (child.parentId === id) {
              collectChildren(child.id);
            }
          });
        };

        ids.forEach(collectChildren);

        const updatedElements = state.elements.filter((el) => !allIdsToDelete.has(el.id));
        const updatedSelected = state.selectedIds.filter((id) => !allIdsToDelete.has(id));

        return {
          elements: updatedElements,
          selectedIds: updatedSelected,
        };
      });
      get().saveToHistory();
    },

    duplicateElements: (ids) => {
      if (ids.length === 0) return;
      set((state) => {
        const newElements: CanvasElement[] = [];
        const idMapping: { [oldId: string]: string } = {};

        // 1. Gather all duplicated items and assign new IDs
        const itemsToDuplicate = state.elements.filter((el) => ids.includes(el.id));
        
        itemsToDuplicate.forEach((el) => {
          const newId = `${el.type}_${Math.random().toString(36).substr(2, 9)}`;
          idMapping[el.id] = newId;

          // Duplicate children as well if it's a container
          const duplicateChildTree = (parentOldId: string, parentNewId: string) => {
            state.elements.forEach((child) => {
              if (child.parentId === parentOldId) {
                const childNewId = `${child.type}_${Math.random().toString(36).substr(2, 9)}`;
                idMapping[child.id] = childNewId;
                
                newElements.push({
                  ...JSON.parse(JSON.stringify(child)),
                  id: childNewId,
                  parentId: parentNewId,
                  x: child.x,
                  y: child.y,
                  zIndex: child.zIndex + 1,
                });
                
                duplicateChildTree(child.id, childNewId);
              }
            });
          };

          newElements.push({
            ...JSON.parse(JSON.stringify(el)),
            id: newId,
            name: `${el.name} (Copy)`,
            x: el.x + 24, // Shift slightly
            y: el.y + 24,
            zIndex: el.zIndex + 1,
            selectedIds: [],
          });

          duplicateChildTree(el.id, newId);
        });

        return {
          elements: [...state.elements, ...newElements],
          selectedIds: Object.values(idMapping).filter((newId) => {
            // Select original duplicated roots
            const el = newElements.find((x) => x.id === newId);
            return el && !el.parentId;
          }),
        };
      });
      get().saveToHistory();
    },

    selectElements: (ids) => {
      set({ selectedIds: ids });
    },

    moveElement: (id, x, y) => {
      set((state) => ({
        elements: state.elements.map((el) => (el.id === id ? { ...el, x, y } : el)),
      }));
    },

    resizeElement: (id, w, h) => {
      set((state) => ({
        elements: state.elements.map((el) => (el.id === id ? { ...el, width: w, height: h } : el)),
      }));
    },

    reorderLayer: (id, direction) => {
      set((state) => {
        const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
        const index = sorted.findIndex((el) => el.id === id);
        if (index === -1) return {};

        if (direction === 'up' && index < sorted.length - 1) {
          // Swap zIndexes
          const temp = sorted[index].zIndex;
          sorted[index].zIndex = sorted[index + 1].zIndex;
          sorted[index + 1].zIndex = temp;
        } else if (direction === 'down' && index > 0) {
          const temp = sorted[index].zIndex;
          sorted[index].zIndex = sorted[index - 1].zIndex;
          sorted[index - 1].zIndex = temp;
        } else if (direction === 'front') {
          const maxZ = Math.max(...state.elements.map((e) => e.zIndex), 0);
          sorted[index].zIndex = maxZ + 1;
        } else if (direction === 'back') {
          const minZ = Math.min(...state.elements.map((e) => e.zIndex), 0);
          sorted[index].zIndex = minZ - 1;
        }

        return { elements: sorted };
      });
      get().saveToHistory();
    },

    groupElements: (ids) => {
      if (ids.length <= 1) return;
      const groupId = `group_${Math.random().toString(36).substr(2, 9)}`;
      
      set((state) => ({
        elements: state.elements.map((el) =>
          ids.includes(el.id) ? { ...el, groupId } : el
        ),
      }));
      get().saveToHistory();
    },

    ungroupElements: (ids) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          ids.includes(el.id) ? { ...el, groupId: undefined } : el
        ),
      }));
      get().saveToHistory();
    },

    alignSelected: (type) => {
      const { selectedIds, elements } = get();
      if (selectedIds.length < 2) return;

      const selectedItems = elements.filter((el) => selectedIds.includes(el.id));
      
      // Calculate boundaries
      const lefts = selectedItems.map((el) => el.x);
      const rights = selectedItems.map((el) => el.x + el.width);
      const tops = selectedItems.map((el) => el.y);
      const bottoms = selectedItems.map((el) => el.y + el.height);

      const minLeft = Math.min(...lefts);
      const maxRight = Math.max(...rights);
      const minTop = Math.min(...tops);
      const maxBottom = Math.max(...bottoms);

      set((state) => {
        const updatedElements = state.elements.map((el) => {
          if (!selectedIds.includes(el.id)) return el;

          let newX = el.x;
          let newY = el.y;

          switch (type) {
            case 'left':
              newX = minLeft;
              break;
            case 'right':
              newX = maxRight - el.width;
              break;
            case 'top':
              newY = minTop;
              break;
            case 'bottom':
              newY = maxBottom - el.height;
              break;
            case 'center':
              const centerX = minLeft + (maxRight - minLeft) / 2;
              newX = centerX - el.width / 2;
              break;
            case 'middle':
              const centerY = minTop + (maxBottom - minTop) / 2;
              newY = centerY - el.height / 2;
              break;
          }

          return { ...el, x: newX, y: newY };
        });

        // Handle distributions
        if (type === 'distribute-h' || type === 'distribute-v') {
          const sortedByPos = [...selectedItems].sort((a, b) =>
            type === 'distribute-h' ? a.x - b.x : a.y - b.y
          );
          
          const totalSize = sortedByPos.reduce(
            (acc, curr) => acc + (type === 'distribute-h' ? curr.width : curr.height),
            0
          );
          const totalSpace = (type === 'distribute-h' ? maxRight - minLeft : maxBottom - minTop) - totalSize;
          const gap = totalSpace / (sortedByPos.length - 1);

          let currentOffset = type === 'distribute-h' ? minLeft : minTop;
          
          return {
            elements: state.elements.map((el) => {
              const idx = sortedByPos.findIndex((item) => item.id === el.id);
              if (idx === -1) return el;
              
              if (idx === 0) {
                currentOffset += type === 'distribute-h' ? el.width + gap : el.height + gap;
                return el; // Keeps the first element in place
              }
              if (idx === sortedByPos.length - 1) {
                // Keep the last element in place
                return el;
              }
              
              const calculatedPos = currentOffset;
              currentOffset += (type === 'distribute-h' ? el.width : el.height) + gap;

              return type === 'distribute-h'
                ? { ...el, x: calculatedPos }
                : { ...el, y: calculatedPos };
            }),
          };
        }

        return { elements: updatedElements };
      });
      get().saveToHistory();
    },

    copySelected: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return;
      
      const rootsToCopy = elements.filter((el) => selectedIds.includes(el.id) && !el.parentId);
      
      // Save deep copy
      const copies = rootsToCopy.map((el) => {
        const copy = JSON.parse(JSON.stringify(el));
        // Remove ID for copying template
        return copy;
      });

      set({ copiedElements: copies });
    },

    pasteSelected: () => {
      const { copiedElements } = get();
      if (copiedElements.length === 0) return;

      set((state) => {
        const newElements: CanvasElement[] = [];
        const newIds: string[] = [];

        copiedElements.forEach((elTemplate) => {
          const newId = `${elTemplate.type}_${Math.random().toString(36).substr(2, 9)}`;
          newIds.push(newId);

          const copy = JSON.parse(JSON.stringify(elTemplate)) as CanvasElement;
          copy.id = newId;
          copy.name = `${copy.name} (Pasted)`;
          copy.x = copy.x + 32; // Offset slightly
          copy.y = copy.y + 32;
          copy.zIndex = Math.max(...state.elements.map((e) => e.zIndex), 0) + 1;
          
          newElements.push(copy);
        });

        return {
          elements: [...state.elements, ...newElements],
          selectedIds: newIds,
        };
      });
      get().saveToHistory();
    },

    copyStyles: (id) => {
      const el = get().elements.find((e) => e.id === id);
      if (el) {
        set({
          copiedStyles: {
            props: JSON.parse(JSON.stringify(el.props)),
            style: JSON.parse(JSON.stringify(el.style)),
          },
        });
      }
    },

    pasteStyles: (id) => {
      const { copiedStyles } = get();
      if (!copiedStyles) return;
      
      set((state) => ({
        elements: state.elements.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              props: { ...el.props, ...copiedStyles.props },
              style: { ...el.style, ...copiedStyles.style },
            };
          }
          return el;
        }),
      }));
      get().saveToHistory();
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        set({
          elements: createHistorySnapshot(history[nextIndex]),
          historyIndex: nextIndex,
          selectedIds: [], // Deselect to prevent references issues
        });
      }
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        set({
          elements: createHistorySnapshot(history[nextIndex]),
          historyIndex: nextIndex,
          selectedIds: [],
        });
      }
    },

    setZoom: (z) => {
      set({ zoom: Math.min(Math.max(z, 50), 125) });
    },

    setCanvasSize: (width, height, type) => {
      const sizeObj = { width, height, type };
      set({ canvasSize: sizeObj });
      localStorage.setItem('builder-canvas-size', JSON.stringify(sizeObj));
    },

    setGridVisible: (visible) => {
      set({ gridVisible: visible });
    },

    setSnapToGrid: (snap) => {
      set({ snapToGrid: snap });
    },

    setDarkMode: (dark) => {
      set({ darkMode: dark });
      localStorage.setItem('builder-dark-mode', JSON.stringify(dark));
    },

    setComponentSearch: (query) => {
      set({ componentSearch: query });
    },

    toggleFavorite: (type) => {
      set((state) => {
        const index = state.favorites.indexOf(type);
        const newFavs = [...state.favorites];
        if (index === -1) {
          newFavs.push(type);
        } else {
          newFavs.splice(index, 1);
        }
        return { favorites: newFavs };
      });
    },

    setPreviewMode: (preview) => {
      set({ previewMode: preview, selectedIds: [] });
    },

    clearCanvas: () => {
      set({ elements: [], selectedIds: [] });
      get().saveToHistory();
    },

    loadTemplate: (elements) => {
      set({
        elements: createHistorySnapshot(elements),
        selectedIds: [],
      });
      get().saveToHistory();
    },
  };
});
