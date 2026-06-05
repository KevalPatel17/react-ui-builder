import React, { useEffect } from 'react';
import { Copy, Clipboard, Trash2, Group, Ungroup, ArrowUp, ArrowDown } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const {
    selectedIds,
    elements,
    duplicateElements,
    deleteElements,
    reorderLayer,
    groupElements,
    ungroupElements,
    copyStyles,
    pasteStyles,
    copiedStyles
  } = useBuilderStore();

  const targetId = selectedIds[0];
  const selectedElement = elements.find((el) => el.id === targetId);

  useEffect(() => {
    const handleOutsideClick = () => onClose();
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [onClose]);

  if (selectedIds.length === 0) return null;

  return (
    <div
      className="absolute bg-[#12131a] border border-[#1f202c] shadow-2xl rounded-lg py-1.5 min-w-[170px] z-[9999] select-none text-[11px] text-gray-300"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Duplicate */}
      <button
        onClick={() => {
          duplicateElements(selectedIds);
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
        <span>Duplicate Element</span>
      </button>

      {/* Group / Ungroup */}
      {selectedIds.length >= 2 ? (
        <button
          onClick={() => {
            groupElements(selectedIds);
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Group className="w-3.5 h-3.5 text-gray-400" />
          <span>Group Elements</span>
        </button>
      ) : selectedElement?.groupId ? (
        <button
          onClick={() => {
            ungroupElements([targetId]);
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Ungroup className="w-3.5 h-3.5 text-gray-400" />
          <span>Ungroup Element</span>
        </button>
      ) : null}

      <div className="h-px bg-[#1f202c] my-1" />

      {/* Copy / Paste Styles */}
      <button
        onClick={() => {
          copyStyles(targetId);
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Clipboard className="w-3.5 h-3.5 text-gray-400" />
        <span>Copy Style Properties</span>
      </button>
      <button
        onClick={() => {
          pasteStyles(targetId);
          onClose();
        }}
        disabled={!copiedStyles}
        className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
      >
        <Clipboard className="w-3.5 h-3.5 text-gray-400" />
        <span>Paste Style Properties</span>
      </button>

      <div className="h-px bg-[#1f202c] my-1" />

      {/* Bring Forward / Send Backward */}
      <button
        onClick={() => {
          reorderLayer(targetId, 'up');
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <ArrowUp className="w-3.5 h-3.5 text-gray-400" />
        <span>Bring Forward</span>
      </button>
      <button
        onClick={() => {
          reorderLayer(targetId, 'down');
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
        <span>Send Backward</span>
      </button>

      <div className="h-px bg-[#1f202c] my-1" />

      {/* Delete */}
      <button
        onClick={() => {
          deleteElements(selectedIds);
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 hover:bg-rose-600 hover:text-white text-rose-400 flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete Selected</span>
      </button>
    </div>
  );
};
