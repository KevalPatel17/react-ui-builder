import React from 'react';
import {
  Undo,
  Redo,
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Sun,
  Moon,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  Code,
  Sparkles,
  Pencil
} from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';

interface ToolbarProps {
  onOpenExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenExport }) => {
  const {
    selectedIds,
    undo,
    redo,
    historyIndex,
    history,
    zoom,
    setZoom,
    canvasSize,
    setCanvasSize,
    gridVisible,
    setGridVisible,
    snapToGrid,
    setSnapToGrid,
    darkMode,
    setDarkMode,
    previewMode,
    setPreviewMode,
    alignSelected,
    drawMode,
    setDrawMode
  } = useBuilderStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const isMultiSelect = selectedIds.length >= 2;

  const viewports = [
    { type: 'mobile', width: 375, height: 667, icon: <Smartphone className="w-3.5 h-3.5" />, label: 'Mobile (375x667)' },
    { type: 'tablet', width: 768, height: 1024, icon: <Tablet className="w-3.5 h-3.5" />, label: 'Tablet (768x1024)' },
    { type: 'laptop', width: 1280, height: 800, icon: <Laptop className="w-3.5 h-3.5" />, label: 'Laptop (1280x800)' },
    { type: 'desktop', width: 1440, height: 900, icon: <Monitor className="w-3.5 h-3.5" />, label: 'Desktop (1440x900)' },
  ] as const;

  return (
    <div className="h-14 bg-[#12131a] border-b border-[#1f202c] px-4 flex items-center justify-between select-none shrink-0 text-white">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="leading-none">
          <span className="text-xs font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">React Craft</span>
          <span className="text-[8px] font-bold text-indigo-400 block tracking-widest uppercase">UI Builder</span>
        </div>
      </div>

      {/* Center Layout Tools */}
      {!previewMode && (
        <div className="flex items-center gap-6">
          {/* History Controls */}
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-900">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300 hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300 hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Draw/Sketch Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-900">
            <button
              onClick={() => setDrawMode(!drawMode)}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                drawMode
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
              title={drawMode ? "Exit Draw Mode" : "Draw to UI (Sketch Components)"}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Viewport Presets Selector */}
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-900">
            {viewports.map((vp) => (
              <button
                key={vp.type}
                onClick={() => setCanvasSize(vp.width, vp.height, vp.type)}
                className={`p-1.5 rounded flex items-center gap-1 text-xs transition-all cursor-pointer ${
                  canvasSize.type === vp.type
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
                title={vp.label}
              >
                {vp.icon}
                <span className="text-[10px] hidden md:inline capitalize">{vp.type}</span>
              </button>
            ))}
          </div>

          {/* Zoom Level presets */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Zoom</span>
            <div className="flex items-center gap-1 bg-gray-950 px-2 py-1 rounded-lg border border-gray-900 text-[10px] font-mono">
              <button
                onClick={() => setZoom(zoom - 10)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer px-1"
              >
                -
              </button>
              <span className="min-w-[32px] text-center font-bold text-indigo-400">{zoom}%</span>
              <button
                onClick={() => setZoom(zoom + 10)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer px-1"
              >
                +
              </button>
            </div>
          </div>

          {/* Alignment Tools (Visible when multiple elements selected) */}
          {isMultiSelect && (
            <div className="flex items-center gap-1 bg-indigo-950/30 px-1.5 py-1 rounded-lg border border-indigo-500/20 animate-fade-in">
              <span className="text-[8px] text-indigo-300 font-bold uppercase px-1">Align</span>
              <button
                onClick={() => alignSelected('left')}
                className="p-1 rounded hover:bg-indigo-900/40 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alignSelected('center')}
                className="p-1 rounded hover:bg-indigo-900/40 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="Align Horiz Center"
              >
                <AlignHorizontalJustifyCenter className="w-3.5 h-3.5 rotate-90" />
              </button>
              <button
                onClick={() => alignSelected('right')}
                className="p-1 rounded hover:bg-indigo-900/40 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-indigo-500/20 mx-1" />
              <button
                onClick={() => alignSelected('top')}
                className="p-1 rounded hover:bg-indigo-900/40 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="Align Top"
              >
                <AlignLeft className="w-3.5 h-3.5 rotate-90" />
              </button>
              <button
                onClick={() => alignSelected('middle')}
                className="p-1 rounded hover:bg-indigo-900/40 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="Align Vert Center"
              >
                <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alignSelected('bottom')}
                className="p-1 rounded hover:bg-indigo-900/40 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="Align Bottom"
              >
                <AlignRight className="w-3.5 h-3.5 rotate-90" />
              </button>
              <div className="w-px h-4 bg-indigo-500/20 mx-1" />
              <button
                onClick={() => alignSelected('distribute-h')}
                className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-indigo-900/30 hover:bg-indigo-900/60 text-indigo-300 cursor-pointer"
                title="Distribute Horizontally"
              >
                Dist-H
              </button>
              <button
                onClick={() => alignSelected('distribute-v')}
                className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-indigo-900/30 hover:bg-indigo-900/60 text-indigo-300 cursor-pointer"
                title="Distribute Vertically"
              >
                Dist-V
              </button>
            </div>
          )}
        </div>
      )}

      {/* Right Side Options (Grid snap, Theme toggle, Preview, Export React) */}
      <div className="flex items-center gap-3">
        {!previewMode && (
          <>
            {/* Grid display toggles */}
            <div className="flex items-center gap-3 text-xs border-r border-[#1f202c] pr-3 shrink-0">
              <label className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={gridVisible}
                  onChange={(e) => setGridVisible(e.target.checked)}
                  className="accent-indigo-500 cursor-pointer"
                />
                Show Grid
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="accent-indigo-500 cursor-pointer"
                />
                Snap to Grid
              </label>
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-950 border border-gray-900 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title={darkMode ? 'Switch to Light Mode UI' : 'Switch to Dark Mode UI'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </>
        )}

        {/* Live Preview Toggle */}
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
            previewMode
              ? 'bg-rose-500 border-rose-500 hover:bg-rose-600 text-white'
              : 'bg-gray-950 border-gray-900 text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
          title={previewMode ? 'Exit Interactive Preview' : 'Interactive Live Preview'}
        >
          {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
        </button>

        {/* Export React */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-black shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Code className="w-4 h-4" />
          <span>Export React</span>
        </button>
      </div>
    </div>
  );
};
