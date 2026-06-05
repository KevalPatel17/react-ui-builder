import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Unlock, Settings, AlertCircle } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import { PositionSection } from './PositionSection';
import { AppearanceSection } from './AppearanceSection';
import { TypographySection } from './TypographySection';
import { ComponentSection } from './ComponentSection';

export const PropertiesPanel: React.FC = () => {
  const { selectedIds, elements, updateElement, saveToHistory } = useBuilderStore();
  const [editingName, setEditingName] = useState('');

  const selectedElement = elements.find((el) => selectedIds.includes(el.id));

  // Sync editing name with store changes
  useEffect(() => {
    if (selectedElement) {
      setEditingName(selectedElement.name);
    }
  }, [selectedElement?.id, selectedElement?.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameBlur = () => {
    if (selectedElement && editingName.trim()) {
      updateElement(selectedElement.id, { name: editingName.trim() });
      saveToHistory();
    }
  };

  const toggleLock = () => {
    if (selectedElement) {
      updateElement(selectedElement.id, { locked: !selectedElement.locked });
      saveToHistory();
    }
  };

  const toggleVisibility = () => {
    if (selectedElement) {
      updateElement(selectedElement.id, { hidden: !selectedElement.hidden });
      saveToHistory();
    }
  };

  return (
    <div className="w-full h-full bg-[#12131a] border-l border-[#1f202c] flex flex-col select-none overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1f202c] bg-[#0b0c11] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">Properties</span>
        </div>
        {selectedElement && (
          <div className="flex items-center gap-1">
            <button
              onClick={toggleVisibility}
              className={`p-1 rounded hover:bg-gray-800 transition-colors cursor-pointer ${selectedElement.hidden ? 'text-rose-500' : 'text-gray-500 hover:text-gray-300'
                }`}
              title={selectedElement.hidden ? 'Show Element' : 'Hide Element'}
            >
              {selectedElement.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleLock}
              className={`p-1 rounded hover:bg-gray-800 transition-colors cursor-pointer ${selectedElement.locked ? 'text-amber-500' : 'text-gray-500 hover:text-gray-300'
                }`}
              title={selectedElement.locked ? 'Unlock Element' : 'Lock Element'}
            >
              {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {!selectedElement ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 space-y-3">
          <div className="p-3 bg-gray-950/40 rounded-full border border-gray-900 shadow-inner">
            <AlertCircle className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-300 mb-1">No Element Selected</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed max-w-[180px] mx-auto">
              Click any element on the canvas to configure position, typography, spacing, and style overrides.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 divide-y divide-[#1f202c]/50">
          {/* Element Name rename field */}
          <div className="p-3 bg-[#0b0c11]/50">
            <label className="text-[8px] text-gray-500 font-bold uppercase block mb-1">Layer Label</label>
            <input
              type="text"
              value={editingName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              disabled={selectedElement.locked}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 focus:border-indigo-500 text-xs font-bold text-white rounded px-2.5 py-1.5 focus:outline-none transition-all disabled:opacity-60"
            />
            {selectedElement.locked && (
              <span className="text-[8px] text-amber-500 font-semibold block mt-1">
                🔒 Element is locked. Unlock it in the toolbar to edit styling.
              </span>
            )}
          </div>

          {/* Section Stack */}
          <PositionSection element={selectedElement} />
          <ComponentSection element={selectedElement} />
          <TypographySection element={selectedElement} />
          <AppearanceSection element={selectedElement} />
        </div>
      )}
    </div>
  );
};
