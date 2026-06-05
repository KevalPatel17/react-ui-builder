import { useState } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ExportModal } from './components/ExportModal';
import { useBuilderStore } from './store/builderStore';

export default function App() {
  const { previewMode, darkMode } = useBuilderStore();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-[#0b0c11] ${darkMode ? 'dark' : ''}`}>
      {/* Top Navbar */}
      <Toolbar onOpenExport={() => setExportOpen(true)} />

      {/* Resizable panels layout */}
      <div className="flex-1 min-h-0 flex relative">
        {previewMode ? (
          // Fullscreen Canvas in Preview Mode
          <Canvas />
        ) : (
          <PanelGroup orientation="horizontal" className="w-full h-full" defaultLayout={{ "sidebar-panel": 18, "canvas-panel": 64, "properties-panel": 18 }}>
            {/* Left Sidebar */}
            <Panel id="sidebar-panel" defaultSize="18%" minSize="15%" maxSize="25%" className="h-full flex flex-col">
              <Sidebar />
            </Panel>

            <PanelResizeHandle className="w-2 cursor-col-resize shrink-0 flex items-center justify-center group">
              <div className="w-[1.5px] h-full bg-[#1f202c] group-hover:bg-indigo-500/80 group-active:bg-indigo-500 transition-colors" />
            </PanelResizeHandle>

            {/* Center Canvas */}
            <Panel id="canvas-panel" defaultSize="64%" minSize="40%" className="h-full flex flex-col">
              <Canvas />
            </Panel>

            <PanelResizeHandle className="w-2 cursor-col-resize shrink-0 flex items-center justify-center group">
              <div className="w-[1.5px] h-full bg-[#1f202c] group-hover:bg-indigo-500/80 group-active:bg-indigo-500 transition-colors" />
            </PanelResizeHandle>

            {/* Right Properties Panel */}
            <Panel id="properties-panel" defaultSize="18%" minSize="15%" maxSize="25%" className="h-full flex flex-col">
              <PropertiesPanel />
            </Panel>
          </PanelGroup>
        )}
      </div>

      {/* Export overlay modal */}
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
