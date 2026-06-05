import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown, Edit2, Folder, HelpCircle } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import type { CanvasElement } from '../../types';

export const LayersTab: React.FC = () => {
  const {
    elements,
    selectedIds,
    selectElements,
    updateElement,
    deleteElements,
    reorderLayer,
    saveToHistory
  } = useBuilderStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Handle renaming of layers
  const startRename = (el: CanvasElement) => {
    setEditingId(el.id);
    setEditingName(el.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      updateElement(id, { name: editingName.trim() });
      saveToHistory();
    }
    setEditingId(null);
  };

  // Toggle visible status
  const toggleVisibility = (el: CanvasElement) => {
    updateElement(el.id, { hidden: !el.hidden });
    saveToHistory();
  };

  // Toggle locked status
  const toggleLock = (el: CanvasElement) => {
    updateElement(el.id, { locked: !el.locked });
    saveToHistory();
  };

  // Recursive renderer for nested children
  const renderLayerRow = (el: CanvasElement, depth = 0) => {
    const isSelected = selectedIds.includes(el.id);
    const isEditing = editingId === el.id;
    const hasChildren = elements.some((child) => child.parentId === el.id);

    return (
      <div key={el.id} className="space-y-1">
        <div
          onClick={(e) => {
            e.stopPropagation();
            selectElements([el.id]);
          }}
          className={`group flex items-center px-2 py-1.5 rounded-md cursor-pointer border select-none transition-all ${
            isSelected
              ? 'bg-indigo-600/20 border-indigo-600/50 text-white'
              : 'bg-gray-950/40 border-gray-900/60 hover:bg-gray-800/40 hover:border-gray-800 text-gray-300'
          }`}
          style={{ marginLeft: `${depth * 14}px` }}
        >
          {/* Layer Icon */}
          <div className="mr-2 text-indigo-400 shrink-0">
            {el.type.includes('container') || el.type.includes('layout') || el.type === 'card' ? (
              <Folder className="w-3.5 h-3.5 fill-indigo-500/10 text-indigo-400" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-indigo-300" />
            )}
          </div>

          {/* Layer Name / Renamer */}
          <div className="flex-1 min-w-0 mr-2">
            {isEditing ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => saveRename(el.id)}
                onKeyDown={(e) => e.key === 'Enter' && saveRename(el.id)}
                className="w-full bg-gray-900 border border-indigo-500 focus:outline-none text-[11px] text-white px-1.5 py-0.5 rounded"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                onDoubleClick={() => startRename(el)}
                className="text-[11px] font-medium block truncate"
              >
                {el.name}
              </span>
            )}
          </div>

          {/* Action buttons (Lock, Hide, Delete, Reorder) */}
          <div className={`flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
            {/* Rename */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRename(el);
              }}
              className="text-gray-500 hover:text-white transition-colors p-0.5"
              title="Rename Layer"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            {/* Visibility */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(el);
              }}
              className={`transition-colors p-0.5 ${el.hidden ? 'text-rose-500 hover:text-rose-400' : 'text-gray-500 hover:text-white'}`}
              title={el.hidden ? 'Show Layer' : 'Hide Layer'}
            >
              {el.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>

            {/* Lock */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(el);
              }}
              className={`transition-colors p-0.5 ${el.locked ? 'text-amber-500 hover:text-amber-400' : 'text-gray-500 hover:text-white'}`}
              title={el.locked ? 'Unlock Element' : 'Lock Element'}
            >
              {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteElements([el.id]);
              }}
              className="text-gray-500 hover:text-rose-400 transition-colors p-0.5"
              title="Delete Layer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Nested Children Rendering */}
        {hasChildren &&
          elements
            .filter((child) => child.parentId === el.id)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((child) => renderLayerRow(child, depth + 1))}
      </div>
    );
  };

  // Only get root elements (elements with no parentId) to start rendering tree recursive
  const rootElements = elements
    .filter((el) => !el.parentId)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar flex flex-col h-full">
      {/* Layer Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-950 border border-gray-800 text-[10px]">
          <span className="font-bold text-gray-500 uppercase tracking-wider">
            Z-Order Controls
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => reorderLayer(selectedIds[0], 'down')}
              className="p-1 rounded bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Move Down (Send Backward)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => reorderLayer(selectedIds[0], 'up')}
              className="p-1 rounded bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Move Up (Bring Forward)"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => reorderLayer(selectedIds[0], 'back')}
              className="px-1.5 py-1 rounded bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white transition-all cursor-pointer font-semibold"
              title="Send to Back"
            >
              Back
            </button>
            <button
              onClick={() => reorderLayer(selectedIds[0], 'front')}
              className="px-1.5 py-1 rounded bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white transition-all cursor-pointer font-semibold"
              title="Bring to Front"
            >
              Front
            </button>
          </div>
        </div>
      )}

      {/* Layers Tree */}
      <div className="flex-1 space-y-2">
        {rootElements.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            No layers on canvas. Drag components or containers to begin!
          </div>
        ) : (
          rootElements.map((el) => renderLayerRow(el, 0))
        )}
      </div>
    </div>
  );
};
