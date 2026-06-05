import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import type { CanvasElement, ComponentProps } from '../../types';

interface ComponentSectionProps {
  element: CanvasElement;
}

export const ComponentSection: React.FC<ComponentSectionProps> = ({ element }) => {
  const { updateElement, saveToHistory } = useBuilderStore();
  const props = element.props;
  const [newOption, setNewOption] = useState('');

  const handlePropsChange = (changes: Partial<ComponentProps>) => {
    updateElement(element.id, { props: { ...props, ...changes } });
  };

  const handleBlur = () => {
    saveToHistory();
  };

  // 1. Options Editor for Dropdowns & Radio groups
  const addOption = () => {
    if (newOption.trim()) {
      const currentOptions = props.options || [];
      handlePropsChange({ options: [...currentOptions, newOption.trim()] });
      setNewOption('');
      saveToHistory();
    }
  };

  const removeOption = (index: number) => {
    const currentOptions = props.options || [];
    const updatedOptions = currentOptions.filter((_, i) => i !== index);
    handlePropsChange({ options: updatedOptions });
    saveToHistory();
  };

  // 2. Table Column Editor
  const addTableColumn = () => {
    const currentCols = props.columns || [];
    const newColName = `Col ${currentCols.length + 1}`;
    const updatedCols = [...currentCols, newColName];
    
    // Add default cell values in existing rows
    const currentRows = props.rows || [];
    const updatedRows = currentRows.map((row) => [...row, '-']);
    
    updateElement(element.id, {
      props: { ...props, columns: updatedCols, rows: updatedRows }
    });
    saveToHistory();
  };

  const removeTableColumn = (index: number) => {
    const currentCols = props.columns || [];
    if (currentCols.length <= 1) return; // Must have at least 1 column
    
    const updatedCols = currentCols.filter((_, i) => i !== index);
    
    // Remove corresponding cell in rows
    const currentRows = props.rows || [];
    const updatedRows = currentRows.map((row) => row.filter((_, i) => i !== index));

    updateElement(element.id, {
      props: { ...props, columns: updatedCols, rows: updatedRows }
    });
    saveToHistory();
  };

  const updateColumnName = (index: number, name: string) => {
    const currentCols = [...(props.columns || [])];
    currentCols[index] = name;
    handlePropsChange({ columns: currentCols });
  };

  // 3. Table Rows Editor
  const addTableRow = () => {
    const currentCols = props.columns || [];
    const currentRows = props.rows || [];
    const newRow = Array(currentCols.length).fill('Cell Data');
    handlePropsChange({ rows: [...currentRows, newRow] });
    saveToHistory();
  };

  const removeTableRow = (index: number) => {
    const currentRows = props.rows || [];
    if (currentRows.length <= 1) return;
    const updatedRows = currentRows.filter((_, i) => i !== index);
    handlePropsChange({ rows: updatedRows });
    saveToHistory();
  };

  const updateCellData = (rowIndex: number, colIndex: number, val: string) => {
    const updatedRows = [...(props.rows || [])].map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const nextRow = [...row];
        nextRow[colIndex] = val;
        return nextRow;
      }
      return row;
    });
    handlePropsChange({ rows: updatedRows });
  };

  return (
    <div className="space-y-4 p-3 border-b border-[#1f202c]">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        Component Settings
      </div>

      <div className="space-y-3 text-xs">
        {/* Render text or content input for display headings/paragraphs/labels/chips/buttons */}
        {(element.type === 'heading' ||
          element.type === 'paragraph' ||
          element.type === 'label' ||
          element.type === 'badge' ||
          element.type === 'tag' ||
          element.type.includes('btn') ||
          element.type === 'checkbox' ||
          element.type === 'toggle-switch' ||
          element.type === 'accordion') && (
          <div>
            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">
              {element.type === 'paragraph' || element.type === 'heading' ? 'Content Text' : 'Label text'}
            </label>
            {element.type === 'paragraph' ? (
              <textarea
                value={props.text ?? ''}
                onChange={(e) => handlePropsChange({ text: e.target.value })}
                onBlur={handleBlur}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none transition-all h-20"
              />
            ) : (
              <input
                type="text"
                value={props.text ?? ''}
                onChange={(e) => handlePropsChange({ text: e.target.value })}
                onBlur={handleBlur}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none transition-all"
              />
            )}
          </div>
        )}

        {/* Inputs helper info: placeholder, label, error state, helperText, disabled */}
        {element.type.includes('input') && element.type !== 'btn-group' && (
          <div className="space-y-3">
            <div>
              <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Input Label</label>
              <input
                type="text"
                value={props.label ?? ''}
                onChange={(e) => handlePropsChange({ label: e.target.value })}
                onBlur={handleBlur}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Placeholder</label>
              <input
                type="text"
                value={props.placeholder ?? ''}
                onChange={(e) => handlePropsChange({ placeholder: e.target.value })}
                onBlur={handleBlur}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Helper Text</label>
              <input
                type="text"
                value={props.helperText ?? ''}
                onChange={(e) => handlePropsChange({ helperText: e.target.value })}
                onBlur={handleBlur}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-[10px] text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={props.error ?? false}
                  onChange={(e) => {
                    handlePropsChange({ error: e.target.checked });
                    saveToHistory();
                  }}
                  disabled={element.locked}
                  className="accent-indigo-500"
                />
                Error State
              </label>
              <label className="flex items-center gap-2 text-[10px] text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={props.disabled ?? false}
                  onChange={(e) => {
                    handlePropsChange({ disabled: e.target.checked });
                    saveToHistory();
                  }}
                  disabled={element.locked}
                  className="accent-indigo-500"
                />
                Disabled
              </label>
            </div>
          </div>
        )}

        {/* Buttons specific variants: disabled, loading, icon, variant */}
        {element.type.includes('btn') && element.type !== 'btn-group' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Btn Variant</label>
                <select
                  value={props.variant ?? 'primary'}
                  onChange={(e) => handlePropsChange({ variant: e.target.value as any })}
                  onBlur={handleBlur}
                  disabled={element.locked}
                  className="w-full bg-[#0b0c11] border border-[#1f202c] text-white rounded px-1.5 py-1 focus:outline-none"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                  <option value="danger">Danger</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Icon Position</label>
                <select
                  value={props.iconPosition ?? 'left'}
                  onChange={(e) => handlePropsChange({ iconPosition: e.target.value as any })}
                  onBlur={handleBlur}
                  disabled={element.locked}
                  className="w-full bg-[#0b0c11] border border-[#1f202c] text-white rounded px-1.5 py-1 focus:outline-none"
                >
                  <option value="left">Left Icon</option>
                  <option value="right">Right Icon</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Icon Name (Lucide)</label>
              <input
                type="text"
                value={props.iconName ?? ''}
                onChange={(e) => handlePropsChange({ iconName: e.target.value })}
                placeholder="Star, Plus, Trash, Search..."
                onBlur={handleBlur}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-[10px] text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={props.loading ?? false}
                  onChange={(e) => {
                    handlePropsChange({ loading: e.target.checked });
                    saveToHistory();
                  }}
                  disabled={element.locked}
                  className="accent-indigo-500"
                />
                Loading State
              </label>
              <label className="flex items-center gap-2 text-[10px] text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={props.disabled ?? false}
                  onChange={(e) => {
                    handlePropsChange({ disabled: e.target.checked });
                    saveToHistory();
                  }}
                  disabled={element.locked}
                  className="accent-indigo-500"
                />
                Disabled
              </label>
            </div>
          </div>
        )}

        {/* Dropdowns, Selects & Radio Groups: list options */}
        {(element.type === 'select' ||
          element.type === 'multi-select' ||
          element.type === 'radio-group' ||
          element.type === 'btn-group') && (
          <div className="space-y-3">
            {element.type !== 'radio-group' && element.type !== 'btn-group' && (
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Dropdown Label</label>
                <input
                  type="text"
                  value={props.label ?? ''}
                  onChange={(e) => handlePropsChange({ label: e.target.value })}
                  onBlur={handleBlur}
                  disabled={element.locked}
                  className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2 py-1.5 focus:outline-none"
                />
              </div>
            )}

            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Options List</span>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="New option name"
                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                  disabled={element.locked}
                  className="flex-1 bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2 py-1 focus:outline-none"
                />
                <button
                  onClick={addOption}
                  disabled={element.locked}
                  className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Display options */}
              <div className="space-y-1 bg-[#0b0c11] p-1.5 rounded border border-[#1f202c] max-h-40 overflow-y-auto">
                {(props.options || []).length === 0 && (
                  <span className="text-[10px] text-gray-600 block text-center py-1">No options yet</span>
                )}
                {(props.options || []).map((opt, index) => (
                  <div key={`${opt}-${index}`} className="flex items-center justify-between p-1 bg-gray-950/40 rounded border border-gray-900 text-[10px] text-gray-300">
                    <span className="truncate mr-2">{opt}</span>
                    <button
                      onClick={() => removeOption(index)}
                      disabled={element.locked}
                      className="text-gray-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {element.type === 'progress-bar' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[9px] text-gray-400 font-bold uppercase block">Progress Value</label>
                <span className="text-[10px] text-gray-500 font-mono">{props.text ?? '0'}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={parseInt(props.text || '0') || 0}
                onChange={(e) => handlePropsChange({ text: e.target.value })}
                onMouseUp={handleBlur}
                disabled={element.locked}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
            <label className="flex items-center gap-2 text-[10px] text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={props.checked ?? true}
                onChange={(e) => {
                  handlePropsChange({ checked: e.target.checked });
                  saveToHistory();
                }}
                disabled={element.locked}
                className="accent-indigo-500"
              />
              Show Value Label Inside
            </label>
          </div>
        )}

        {/* Slider element */}
        {element.type === 'slider' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] text-gray-400 font-bold uppercase block">Slider Title</label>
            </div>
            <input
              type="text"
              value={props.text ?? ''}
              onChange={(e) => handlePropsChange({ text: e.target.value })}
              onBlur={handleBlur}
              disabled={element.locked}
              className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2.5 py-1.5 focus:outline-none"
            />
          </div>
        )}

        {/* Accordion / Tooltip */}
        {(element.type === 'tooltip' || element.type === 'accordion') && (
          <div>
            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">
              {element.type === 'tooltip' ? 'Tooltip Content' : 'Accordion Expanded Body Content'}
            </label>
            <textarea
              value={props.helperText ?? ''}
              onChange={(e) => handlePropsChange({ helperText: e.target.value })}
              onBlur={handleBlur}
              disabled={element.locked}
              className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none h-16"
            />
          </div>
        )}

        {/* Avatar image picker */}
        {element.type === 'avatar' && (
          <div>
            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={props.imageUrl ?? ''}
              onChange={(e) => handlePropsChange({ imageUrl: e.target.value })}
              onBlur={handleBlur}
              disabled={element.locked}
              className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2.5 py-1.5 focus:outline-none"
            />
          </div>
        )}

        {/* Table Editor */}
        {element.type === 'table' && (
          <div className="space-y-4">
            {/* Columns list */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Table Columns</span>
                <button
                  onClick={addTableColumn}
                  disabled={element.locked}
                  className="flex items-center gap-0.5 text-[9px] text-indigo-400 hover:text-white"
                >
                  <Plus className="w-3 h-3" /> Add Column
                </button>
              </div>

              <div className="space-y-1 bg-[#0b0c11] p-1.5 rounded border border-[#1f202c] max-h-36 overflow-y-auto">
                {(props.columns || []).map((col, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => updateColumnName(index, e.target.value)}
                      onBlur={handleBlur}
                      disabled={element.locked}
                      className="flex-1 bg-transparent border-0 text-[10px] text-white py-0.5"
                    />
                    <button
                      onClick={() => removeTableColumn(index)}
                      disabled={element.locked || (props.columns || []).length <= 1}
                      className="text-gray-500 hover:text-rose-400 p-0.5 disabled:opacity-30"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Rows list */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Table Rows</span>
                <button
                  onClick={addTableRow}
                  disabled={element.locked}
                  className="flex items-center gap-0.5 text-[9px] text-indigo-400 hover:text-white"
                >
                  <Plus className="w-3 h-3" /> Add Row
                </button>
              </div>

              <div className="space-y-2 bg-[#0b0c11] p-1.5 rounded border border-[#1f202c] max-h-48 overflow-y-auto">
                {(props.rows || []).map((row, rIdx) => (
                  <div key={rIdx} className="flex flex-col p-1.5 bg-gray-950/40 rounded border border-gray-900 relative group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Row #{rIdx + 1}</span>
                      <button
                        onClick={() => removeTableRow(rIdx)}
                        disabled={element.locked || (props.rows || []).length <= 1}
                        className="text-gray-500 hover:text-rose-400 p-0.5 disabled:opacity-30"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {row.map((cell, cIdx) => (
                        <div key={cIdx}>
                          <span className="text-[7px] text-gray-600 truncate block">{(props.columns || [])[cIdx] || `Col ${cIdx}`}</span>
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCellData(rIdx, cIdx, e.target.value)}
                            onBlur={handleBlur}
                            disabled={element.locked}
                            className="w-full bg-[#0b0c11] border border-gray-800 focus:border-indigo-500 rounded text-[9px] px-1 py-0.5 text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
