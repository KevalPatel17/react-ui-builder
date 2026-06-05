import React, { useState } from 'react';
import { Check, History, Paintbrush } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';

export const ColorsTab: React.FC = () => {
  const { selectedIds, elements, updateElement, saveToHistory } = useBuilderStore();
  const [colorTarget, setColorTarget] = useState<'background' | 'text' | 'border'>('background');
  const [customColor, setCustomColor] = useState('#6366f1');
  const [recentColors, setRecentColors] = useState<string[]>([
    '#ffffff', '#f3f4f6', '#1f2937', '#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
  ]);

  // Palette definitions (Tailwind shades 50, 100, 200, 300, 400, 500, 600, 700, 800, 900)
  const palettes = [
    { name: 'Indigo (Primary)', colors: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'] },
    { name: 'Slate (Neutral)', colors: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'] },
    { name: 'Red (Danger)', colors: ['#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'] },
    { name: 'Green (Success)', colors: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'] },
    { name: 'Yellow (Warning)', colors: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'] },
    { name: 'Blue (Info)', colors: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'] },
    { name: 'Purple', colors: ['#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'] },
  ];

  const applyColor = (color: string) => {
    if (selectedIds.length === 0) return;

    selectedIds.forEach((id) => {
      const el = elements.find((e) => e.id === id);
      if (!el) return;

      if (colorTarget === 'background') {
        updateElement(id, { style: { ...el.style, backgroundColor: color } });
      } else if (colorTarget === 'text') {
        // Text color is stored in style or props depending on element type, let's update both to be safe
        updateElement(id, {
          style: { ...el.style, textColor: color },
          props: { ...el.props, color: color }
        });
      } else if (colorTarget === 'border') {
        updateElement(id, { style: { ...el.style, borderColor: color } });
      }
    });

    // Track recently used colors
    if (!recentColors.includes(color)) {
      setRecentColors((prev) => [color, ...prev.slice(0, 11)]);
    }

    saveToHistory();
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const applyCustomColor = () => {
    applyColor(customColor);
  };

  const currentSelectedElement = elements.find((el) => selectedIds.includes(el.id));
  const activeColorValue = currentSelectedElement
    ? colorTarget === 'background'
      ? currentSelectedElement.style.backgroundColor
      : colorTarget === 'text'
      ? currentSelectedElement.style.textColor || currentSelectedElement.props.color || '#1f2937'
      : currentSelectedElement.style.borderColor
    : null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
      {/* Target Selector */}
      <div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
          Apply Color To
        </span>
        <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
          {(['background', 'text', 'border'] as const).map((target) => (
            <button
              key={target}
              onClick={() => setColorTarget(target)}
              className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase transition-all ${
                colorTarget === target
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      {selectedIds.length === 0 && (
        <div className="p-3 rounded-lg border border-amber-500/10 bg-amber-500/5 text-amber-400 text-[11px] text-center">
          ⚠️ Select an element on the canvas to apply colors.
        </div>
      )}

      {selectedIds.length > 0 && activeColorValue && (
        <div className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-800 bg-gray-900/40">
          <div
            className="w-8 h-8 rounded border border-gray-700 shadow-inner flex items-center justify-center text-[10px] font-semibold"
            style={{ backgroundColor: activeColorValue }}
          />
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">Current {colorTarget}</div>
            <div className="text-xs font-mono text-gray-200 uppercase">{activeColorValue}</div>
          </div>
        </div>
      )}

      {/* Custom Picker */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
          Custom Color Picker
        </span>
        <div className="flex gap-2">
          <div className="relative w-9 h-9 rounded-lg border border-gray-800 bg-gray-950 overflow-hidden cursor-pointer flex items-center justify-center shrink-0">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              onBlur={applyCustomColor}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Paintbrush className="w-4 h-4 text-gray-400" style={{ color: customColor }} />
          </div>
          <input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            placeholder="#HEXCode"
            className="flex-1 min-w-0 bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-indigo-500 text-xs text-white rounded-lg px-2.5 font-mono uppercase focus:outline-none transition-all"
          />
          <button
            onClick={applyCustomColor}
            disabled={selectedIds.length === 0}
            className="px-3 bg-indigo-600 disabled:bg-gray-800 text-white disabled:text-gray-500 text-xs font-semibold rounded-lg hover:bg-indigo-500 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Recent Colors */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <History className="w-3.5 h-3.5" /> Recently Used
        </span>
        <div className="grid grid-cols-9 gap-1.5">
          {recentColors.map((color, idx) => (
            <button
              key={`${color}-${idx}`}
              onClick={() => applyColor(color)}
              className="w-full aspect-square rounded border border-gray-800 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-inner group relative"
              style={{ backgroundColor: color }}
              title={color}
            >
              {activeColorValue === color && (
                <Check className={`w-3 h-3 ${color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#f3f4f6' ? 'text-black' : 'text-white'}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Palettes */}
      <div className="space-y-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
          Tailwind Reference Swatches
        </span>
        <div className="space-y-3.5">
          {palettes.map((palette) => (
            <div key={palette.name} className="space-y-1">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                {palette.name}
              </div>
              <div className="grid grid-cols-9 gap-1">
                {palette.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => applyColor(color)}
                    className="w-full aspect-square rounded-sm border border-gray-900 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {activeColorValue === color && (
                      <Check className={`w-2.5 h-2.5 ${color.toLowerCase().startsWith('#f') || color.toLowerCase().startsWith('#e') ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
