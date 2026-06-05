import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import type { CanvasElement, ComponentProps } from '../../types';

interface TypographySectionProps {
  element: CanvasElement;
}

export const TypographySection: React.FC<TypographySectionProps> = ({ element }) => {
  const { updateElement, saveToHistory } = useBuilderStore();
  const props = element.props;

  const handlePropsChange = (changes: Partial<ComponentProps>) => {
    updateElement(element.id, { props: { ...props, ...changes } });
  };

  // Check if component supports text options
  const isTypographySupported =
    !element.type.includes('container') &&
    !element.type.includes('layout') &&
    element.type !== 'rect' &&
    element.type !== 'circle' &&
    element.type !== 'triangle' &&
    element.type !== 'rounded-rect' &&
    element.type !== 'line' &&
    element.type !== 'spacer' &&
    element.type !== 'divider' &&
    element.type !== 'image-placeholder' &&
    element.type !== 'spinner' &&
    element.type !== 'avatar';

  if (!isTypographySupported) return null;

  const fontFamilies = [
    { value: 'Inter', label: 'Sans - Inter' },
    { value: 'Roboto', label: 'Sans - Roboto' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Playfair Display', label: 'Serif - Playfair' },
    { value: 'monospace', label: 'Monospace' },
  ];

  const fontWeights = [
    { value: 100, label: 'Thin (100)' },
    { value: 300, label: 'Light (300)' },
    { value: 400, label: 'Regular (400)' },
    { value: 500, label: 'Medium (500)' },
    { value: 600, label: 'Semi-Bold (600)' },
    { value: 700, label: 'Bold (700)' },
    { value: 900, label: 'Black (900)' },
  ];

  return (
    <div className="space-y-3.5 p-3 border-b border-[#1f202c]">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        Typography
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Font Family */}
        <div className="col-span-2">
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Font Family</label>
          <select
            value={props.fontFamily ?? 'Inter'}
            onChange={(e) => handlePropsChange({ fontFamily: e.target.value as any })}
            onBlur={saveToHistory}
            disabled={element.locked}
            className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-2 py-1.5 focus:outline-none cursor-pointer"
          >
            {fontFamilies.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] text-gray-400 font-bold uppercase block">Font Size</label>
            <span className="text-[10px] text-gray-500 font-mono">{props.fontSize ?? 14}px</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="96"
              value={props.fontSize ?? 14}
              onChange={(e) => handlePropsChange({ fontSize: parseInt(e.target.value) || 14 })}
              onMouseUp={saveToHistory}
              disabled={element.locked}
              className="flex-1 accent-indigo-500 cursor-pointer"
            />
            <input
              type="number"
              min="8"
              value={props.fontSize ?? 14}
              onChange={(e) => handlePropsChange({ fontSize: parseInt(e.target.value) || 14 })}
              onBlur={saveToHistory}
              disabled={element.locked}
              className="w-12 bg-[#0b0c11] border border-[#1f202c] text-center rounded py-0.5"
            />
          </div>
        </div>

        {/* Font Weight */}
        <div>
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Weight</label>
          <select
            value={props.fontWeight ?? 400}
            onChange={(e) => handlePropsChange({ fontWeight: parseInt(e.target.value) || 400 })}
            onBlur={saveToHistory}
            disabled={element.locked}
            className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 text-xs text-white rounded px-1.5 py-1 focus:outline-none cursor-pointer"
          >
            {fontWeights.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Color */}
        <div>
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Text Color</label>
          <div className="flex gap-1">
            <input
              type="color"
              value={props.color?.startsWith('#') && props.color.length === 7 ? props.color : '#1f2937'}
              onChange={(e) => {
                handlePropsChange({ color: e.target.value });
                // Keep element.style.textColor in sync too
                updateElement(element.id, { style: { ...element.style, textColor: e.target.value } });
              }}
              onBlur={saveToHistory}
              disabled={element.locked}
              className="w-6 h-6 rounded border border-gray-800 bg-[#0b0c11] cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={props.color ?? '#1f2937'}
              onChange={(e) => {
                handlePropsChange({ color: e.target.value });
                updateElement(element.id, { style: { ...element.style, textColor: e.target.value } });
              }}
              onBlur={saveToHistory}
              disabled={element.locked}
              className="w-full bg-[#0b0c11] border border-[#1f202c] text-[10px] text-white rounded px-1 focus:outline-none font-mono uppercase"
            />
          </div>
        </div>

        {/* Line Height & Letter Spacing */}
        <div>
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Line Height</label>
          <input
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={props.lineHeight ?? 1.5}
            onChange={(e) => handlePropsChange({ lineHeight: parseFloat(e.target.value) || 1.2 })}
            onBlur={saveToHistory}
            disabled={element.locked}
            className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2 py-1 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Spacing (px)</label>
          <input
            type="number"
            step="0.5"
            value={props.letterSpacing ?? 0}
            onChange={(e) => handlePropsChange({ letterSpacing: parseFloat(e.target.value) || 0 })}
            onBlur={saveToHistory}
            disabled={element.locked}
            className="w-full bg-[#0b0c11] border border-[#1f202c] text-xs text-white rounded px-2 py-1 focus:outline-none"
          />
        </div>

        {/* Text Align & Decoration */}
        <div className="col-span-2 pt-1">
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1.5">Alignment</label>
          <div className="flex gap-1 bg-[#0b0c11] p-0.5 rounded border border-[#1f202c]">
            {([
              { align: 'left', icon: <AlignLeft className="w-3.5 h-3.5" /> },
              { align: 'center', icon: <AlignCenter className="w-3.5 h-3.5" /> },
              { align: 'right', icon: <AlignRight className="w-3.5 h-3.5" /> },
              { align: 'justify', icon: <AlignJustify className="w-3.5 h-3.5" /> },
            ] as const).map(({ align, icon }) => (
              <button
                key={align}
                onClick={() => {
                  handlePropsChange({ textAlign: align });
                  saveToHistory();
                }}
                disabled={element.locked}
                className={`flex-1 py-1 rounded flex items-center justify-center cursor-pointer transition-all ${
                  props.textAlign === align
                    ? 'bg-indigo-600 text-white shadow-inner'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-950'
                }`}
                title={`Align ${align}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Text Decorations */}
        <div className="col-span-2">
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1.5">Decoration</label>
          <div className="flex gap-1 bg-[#0b0c11] p-0.5 rounded border border-[#1f202c] text-[10px]">
            {([
              { value: 'none', label: 'None' },
              { value: 'underline', label: 'Underline' },
              { value: 'line-through', label: 'Strike' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  handlePropsChange({ textDecoration: value });
                  saveToHistory();
                }}
                disabled={element.locked}
                className={`flex-1 py-1 rounded cursor-pointer transition-all font-semibold uppercase text-[9px] ${
                  props.textDecoration === value
                    ? 'bg-indigo-600 text-white shadow-inner'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-950'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
