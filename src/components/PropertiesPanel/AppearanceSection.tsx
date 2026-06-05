import React from 'react';
import { useBuilderStore } from '../../store/builderStore';
import type { CanvasElement, StyleProps, ShadowConfig } from '../../types';

interface AppearanceSectionProps {
  element: CanvasElement;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({ element }) => {
  const { updateElement, saveToHistory } = useBuilderStore();
  const style = element.style;

  const handleStyleChange = (changes: Partial<StyleProps>) => {
    updateElement(element.id, { style: { ...style, ...changes } });
  };

  const handleShadowChange = (shadowChanges: Partial<ShadowConfig>) => {
    const updatedShadow = { ...style.boxShadow, ...shadowChanges };
    updateElement(element.id, { style: { ...style, boxShadow: updatedShadow } });
  };

  const handlePaddingChange = (side: 't' | 'r' | 'b' | 'l', val: number) => {
    const updatedPadding = { ...style.padding, [side]: val };
    updateElement(element.id, { style: { ...style, padding: updatedPadding } });
  };

  const handleMarginChange = (side: 't' | 'r' | 'b' | 'l', val: number) => {
    const updatedMargin = { ...style.margin, [side]: val };
    updateElement(element.id, { style: { ...style, margin: updatedMargin } });
  };

  const isContainer =
    element.type.includes('container') ||
    element.type.includes('layout') ||
    element.type.includes('flex') ||
    element.type === 'card' ||
    element.type === 'hero' ||
    element.type === 'split-50-50';

  return (
    <div className="space-y-4 p-3 border-b border-[#1f202c]">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        Appearance
      </div>

      {/* Background & Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] text-gray-400 font-bold uppercase block">Background Color</label>
          <span className="text-[9px] text-gray-500 font-mono">{style.backgroundColor}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="color"
            value={style.backgroundColor.startsWith('#') && style.backgroundColor.length === 7 ? style.backgroundColor : '#ffffff'}
            onChange={(e) => {
              handleStyleChange({ backgroundColor: e.target.value });
            }}
            onBlur={saveToHistory}
            disabled={element.locked}
            className="w-8 h-8 rounded border border-gray-800 bg-[#0b0c11] cursor-pointer"
          />
          <input
            type="text"
            value={style.backgroundColor}
            onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
            onBlur={saveToHistory}
            disabled={element.locked}
            className="flex-1 bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2.5 font-mono uppercase focus:outline-none"
          />
        </div>

        {/* Bg Opacity */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-gray-400 font-bold uppercase">Background Opacity</span>
            <span className="text-[10px] text-gray-500 font-mono">{Math.round(style.backgroundOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={style.backgroundOpacity ?? 1}
            onChange={(e) => handleStyleChange({ backgroundOpacity: parseFloat(e.target.value) })}
            onMouseUp={saveToHistory}
            disabled={element.locked}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Borders configuration */}
      <div className="space-y-2.5 pt-2 border-t border-[#1f202c]/55">
        <span className="text-[9px] text-gray-400 font-bold uppercase block">Border Styling</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] text-gray-500 font-bold uppercase block mb-1">Color</label>
            <div className="flex gap-1">
              <input
                type="color"
                value={style.borderColor.startsWith('#') && style.borderColor.length === 7 ? style.borderColor : '#d1d5db'}
                onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                onBlur={saveToHistory}
                disabled={element.locked}
                className="w-6 h-6 rounded border border-gray-800 bg-transparent cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={style.borderColor}
                onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                onBlur={saveToHistory}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] text-[10px] text-white rounded px-1.5 focus:outline-none font-mono uppercase"
              />
            </div>
          </div>
          <div>
            <label className="text-[8px] text-gray-500 font-bold uppercase block mb-1">Radius (px)</label>
            <input
              type="number"
              min="0"
              value={style.borderRadius}
              onChange={(e) => handleStyleChange({ borderRadius: parseInt(e.target.value) || 0 })}
              onBlur={saveToHistory}
              disabled={element.locked}
              className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2 py-1 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[8px] text-gray-500 font-bold uppercase block mb-1">Width (px)</label>
            <input
              type="number"
              min="0"
              value={style.borderWidth}
              onChange={(e) => handleStyleChange({ borderWidth: parseInt(e.target.value) || 0 })}
              onBlur={saveToHistory}
              disabled={element.locked}
              className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2 py-1 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[8px] text-gray-500 font-bold uppercase block mb-1">Style</label>
            <select
              value={style.borderStyle}
              onChange={(e) => handleStyleChange({ borderStyle: e.target.value as any })}
              onBlur={saveToHistory}
              disabled={element.locked}
              className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-1.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Box Shadow */}
      <div className="space-y-2 pt-2 border-t border-[#1f202c]/55">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-gray-400 font-bold uppercase">Box Shadow</span>
          <input
            type="checkbox"
            checked={style.boxShadow.opacity > 0}
            onChange={(e) => handleShadowChange({ opacity: e.target.checked ? 0.15 : 0 })}
            onChangeCapture={saveToHistory}
            disabled={element.locked}
            className="accent-indigo-500 cursor-pointer"
          />
        </div>
        {style.boxShadow.opacity > 0 && (
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-300">
            <div>
              <label className="text-[8px] text-gray-500 block mb-0.5">X Offset</label>
              <input
                type="number"
                value={style.boxShadow.x}
                onChange={(e) => handleShadowChange({ x: parseInt(e.target.value) || 0 })}
                onBlur={saveToHistory}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] rounded px-1.5 py-0.5 text-white"
              />
            </div>
            <div>
              <label className="text-[8px] text-gray-500 block mb-0.5">Y Offset</label>
              <input
                type="number"
                value={style.boxShadow.y}
                onChange={(e) => handleShadowChange({ y: parseInt(e.target.value) || 0 })}
                onBlur={saveToHistory}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] rounded px-1.5 py-0.5 text-white"
              />
            </div>
            <div>
              <label className="text-[8px] text-gray-500 block mb-0.5">Blur Radius</label>
              <input
                type="number"
                min="0"
                value={style.boxShadow.blur}
                onChange={(e) => handleShadowChange({ blur: parseInt(e.target.value) || 0 })}
                onBlur={saveToHistory}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] rounded px-1.5 py-0.5 text-white"
              />
            </div>
            <div>
              <label className="text-[8px] text-gray-500 block mb-0.5">Shadow Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={style.boxShadow.opacity}
                onChange={(e) => handleShadowChange({ opacity: parseFloat(e.target.value) })}
                onMouseUp={saveToHistory}
                disabled={element.locked}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Padding & Spacing */}
      <div className="space-y-2 pt-2 border-t border-[#1f202c]/55">
        <span className="text-[9px] text-gray-400 font-bold uppercase block">Paddings (px)</span>
        <div className="grid grid-cols-4 gap-1">
          {([{ side: 't', label: 'Top' }, { side: 'r', label: 'Right' }, { side: 'b', label: 'Bottom' }, { side: 'l', label: 'Left' }] as const).map(({ side, label }) => (
            <div key={side}>
              <label className="text-[8px] text-gray-500 text-center block mb-0.5">{label}</label>
              <input
                type="number"
                min="0"
                value={style.padding?.[side] ?? 0}
                onChange={(e) => handlePaddingChange(side, parseInt(e.target.value) || 0)}
                onBlur={saveToHistory}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded py-1 text-center focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Spacing Margins */}
      <div className="space-y-2 pt-2 border-t border-[#1f202c]/55">
        <span className="text-[9px] text-gray-400 font-bold uppercase block">Margins (px)</span>
        <div className="grid grid-cols-4 gap-1">
          {([{ side: 't', label: 'Top' }, { side: 'r', label: 'Right' }, { side: 'b', label: 'Bottom' }, { side: 'l', label: 'Left' }] as const).map(({ side, label }) => (
            <div key={side}>
              <label className="text-[8px] text-gray-500 text-center block mb-0.5">{label}</label>
              <input
                type="number"
                value={style.margin?.[side] ?? 0}
                onChange={(e) => handleMarginChange(side, parseInt(e.target.value) || 0)}
                onBlur={saveToHistory}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded py-1 text-center focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Container Layout Properties (Only render for containers/grids) */}
      {isContainer && (
        <div className="space-y-3 pt-3 border-t border-[#1f202c]">
          <span className="text-[9px] text-gray-400 font-bold uppercase block">Container Layout Settings</span>

          {/* Display mode */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] text-gray-500 block mb-1">Display</label>
              <select
                value={style.display ?? 'block'}
                onChange={(e) => handleStyleChange({ display: e.target.value as any })}
                onBlur={saveToHistory}
                disabled={element.locked}
                className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-1.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="block">Block</option>
                <option value="flex">Flexbox</option>
                <option value="grid">CSS Grid</option>
              </select>
            </div>

            <div>
              <label className="text-[8px] text-gray-500 block mb-1">Gap Spacing (px)</label>
              <input
                type="number"
                min="0"
                value={style.gap ?? 8}
                onChange={(e) => handleStyleChange({ gap: parseInt(e.target.value) || 0 })}
                onBlur={saveToHistory}
                disabled={element.locked || style.display === 'block'}
                className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2 py-1 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Flexbox Specific */}
          {style.display === 'flex' && (
            <div className="space-y-2.5 p-2 rounded bg-gray-950/40 border border-gray-900/60">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="text-[8px] text-gray-500 block mb-1">Direction</label>
                  <select
                    value={style.flexDirection ?? 'row'}
                    onChange={(e) => handleStyleChange({ flexDirection: e.target.value as any })}
                    onBlur={saveToHistory}
                    disabled={element.locked}
                    className="w-full bg-[#0b0c11] border border-[#1f202c] text-white rounded py-0.5 px-1 focus:outline-none"
                  >
                    <option value="row">Row (horizontal)</option>
                    <option value="column">Column (vertical)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] text-gray-500 block mb-1">Flex Wrap</label>
                  <select
                    value={style.flexWrap ?? 'nowrap'}
                    onChange={(e) => handleStyleChange({ flexWrap: e.target.value as any })}
                    onBlur={saveToHistory}
                    disabled={element.locked}
                    className="w-full bg-[#0b0c11] border border-[#1f202c] text-white rounded py-0.5 px-1 focus:outline-none"
                  >
                    <option value="nowrap">No Wrap</option>
                    <option value="wrap">Wrap</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 text-[10px]">
                <div>
                  <label className="text-[8px] text-gray-500 block mb-0.5">Justify Content</label>
                  <select
                    value={style.justifyContent ?? 'flex-start'}
                    onChange={(e) => handleStyleChange({ justifyContent: e.target.value as any })}
                    onBlur={saveToHistory}
                    disabled={element.locked}
                    className="w-full bg-[#0b0c11] border border-[#1f202c] text-white rounded py-0.5 px-1"
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="space-between">Space Between</option>
                    <option value="space-around">Space Around</option>
                    <option value="space-evenly">Space Evenly</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] text-gray-500 block mb-0.5">Align Items</label>
                  <select
                    value={style.alignItems ?? 'center'}
                    onChange={(e) => handleStyleChange({ alignItems: e.target.value as any })}
                    onBlur={saveToHistory}
                    disabled={element.locked}
                    className="w-full bg-[#0b0c11] border border-[#1f202c] text-white rounded py-0.5 px-1"
                  >
                    <option value="stretch">Stretch</option>
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="baseline">Baseline</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Grid Specific */}
          {style.display === 'grid' && (
            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-gray-950/40 border border-gray-900/60 text-[10px]">
              <div>
                <label className="text-[8px] text-gray-500 block mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={style.gridColumns ?? 2}
                  onChange={(e) => handleStyleChange({ gridColumns: parseInt(e.target.value) || 1 })}
                  onBlur={saveToHistory}
                  disabled={element.locked}
                  className="w-full bg-[#0b0c11] border border-[#1f202c] rounded py-0.5 px-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[8px] text-gray-500 block mb-1">Rows (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={style.gridRows ?? 1}
                  onChange={(e) => handleStyleChange({ gridRows: parseInt(e.target.value) || 1 })}
                  onBlur={saveToHistory}
                  disabled={element.locked}
                  className="w-full bg-[#0b0c11] border border-[#1f202c] rounded py-0.5 px-1.5 text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
