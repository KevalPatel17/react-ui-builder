import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import type { CanvasElement } from '../../types';

interface PositionSectionProps {
  element: CanvasElement;
}

export const PositionSection: React.FC<PositionSectionProps> = ({ element }) => {
  const { updateElement, saveToHistory } = useBuilderStore();
  const [aspectLocked, setAspectLocked] = useState(false);
  const [localValues, setLocalValues] = useState({
    x: element.x,
    y: element.y,
    w: element.width,
    h: element.height,
    rotation: element.rotation || 0,
  });

  // Keep local values sync with store changes (e.g. from mouse dragging)
  useEffect(() => {
    setLocalValues({
      x: Math.round(element.x),
      y: Math.round(element.y),
      w: Math.round(element.width),
      h: Math.round(element.height),
      rotation: element.rotation || 0,
    });
  }, [element.x, element.y, element.width, element.height, element.rotation]);

  const handleChange = (field: 'x' | 'y' | 'w' | 'h' | 'rotation', val: number) => {
    setLocalValues((prev) => {
      const next = { ...prev, [field]: val };
      
      // Aspect ratio locking calculations
      if (aspectLocked && field === 'w' && element.width > 0) {
        const ratio = element.height / element.width;
        next.h = Math.round(val * ratio);
      } else if (aspectLocked && field === 'h' && element.height > 0) {
        const ratio = element.width / element.height;
        next.w = Math.round(val * ratio);
      }
      
      return next;
    });
  };

  const handleBlur = (field: 'x' | 'y' | 'w' | 'h' | 'rotation') => {
    const val = localValues[field];
    
    if (field === 'x') updateElement(element.id, { x: val });
    else if (field === 'y') updateElement(element.id, { y: val });
    else if (field === 'w') {
      updateElement(element.id, { width: val });
      if (aspectLocked) updateElement(element.id, { height: localValues.h });
    } else if (field === 'h') {
      updateElement(element.id, { height: val });
      if (aspectLocked) updateElement(element.id, { width: localValues.w });
    } else if (field === 'rotation') {
      updateElement(element.id, { rotation: val });
    }
    
    saveToHistory();
  };

  // If element is placed inside a flow container (e.g. Flexbox/Grid), X/Y positions are managed by flow layout.
  const isNested = !!element.parentId;

  return (
    <div className="space-y-3 p-3 border-b border-[#1f202c]">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        Position & Size
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Width & Height */}
        <div>
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Width (px)</label>
          <input
            type="number"
            value={localValues.w}
            onChange={(e) => handleChange('w', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('w')}
            disabled={element.locked}
            className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 focus:border-indigo-500 text-xs text-white rounded px-2 py-1.5 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] text-gray-400 font-bold uppercase block">Height (px)</label>
            <button
              onClick={() => setAspectLocked(!aspectLocked)}
              className={`text-gray-500 hover:text-white transition-colors cursor-pointer`}
              title={aspectLocked ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
            >
              {aspectLocked ? <Lock className="w-3 h-3 text-indigo-400" /> : <Unlock className="w-3 h-3 text-gray-600" />}
            </button>
          </div>
          <input
            type="number"
            value={localValues.h}
            onChange={(e) => handleChange('h', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('h')}
            disabled={element.locked}
            className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 focus:border-indigo-500 text-xs text-white rounded px-2 py-1.5 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* X & Y coordinates (only active if absolute positioned) */}
        <div>
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">
            X position {isNested && <span className="text-[8px] text-amber-500 font-normal lowercase">(nested)</span>}
          </label>
          <input
            type="number"
            value={localValues.x}
            onChange={(e) => handleChange('x', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('x')}
            disabled={element.locked || isNested}
            className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 focus:border-indigo-500 text-xs text-white rounded px-2 py-1.5 focus:outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">
            Y position {isNested && <span className="text-[8px] text-amber-500 font-normal lowercase">(nested)</span>}
          </label>
          <input
            type="number"
            value={localValues.y}
            onChange={(e) => handleChange('y', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('y')}
            disabled={element.locked || isNested}
            className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 focus:border-indigo-500 text-xs text-white rounded px-2 py-1.5 focus:outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          />
        </div>

        {/* Rotation */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] text-gray-400 font-bold uppercase block">Rotation (°)</label>
            <span className="text-[10px] text-gray-500 font-mono">{localValues.rotation}°</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="360"
              value={localValues.rotation}
              onChange={(e) => handleChange('rotation', parseInt(e.target.value) || 0)}
              onMouseUp={() => handleBlur('rotation')}
              disabled={element.locked}
              className="flex-1 accent-indigo-500 cursor-pointer disabled:cursor-not-allowed"
            />
            <input
              type="number"
              min="0"
              max="360"
              value={localValues.rotation}
              onChange={(e) => handleChange('rotation', parseInt(e.target.value) || 0)}
              onBlur={() => handleBlur('rotation')}
              disabled={element.locked}
              className="w-14 bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 focus:border-indigo-500 text-xs text-white rounded px-1.5 py-1 text-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
