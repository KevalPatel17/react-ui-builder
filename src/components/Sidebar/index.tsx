import React, { useState } from 'react';
import { PlusCircle, Layout, Palette, Layers, Search, Trash2 } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import { ComponentTab } from './ComponentTab';
import { LayoutTab } from './LayoutTab';
import { ColorsTab } from './ColorsTab';
import { LayersTab } from './LayersTab';

export const Sidebar: React.FC = () => {
  const { componentSearch, setComponentSearch, elements, clearCanvas } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<'components' | 'layout' | 'colors' | 'layers'>('components');

  const tabs = [
    { id: 'components', label: 'Components', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'layout', label: 'Layout', icon: <Layout className="w-4 h-4" /> },
    { id: 'colors', label: 'Colors', icon: <Palette className="w-4 h-4" /> },
    { id: 'layers', label: 'Layers', icon: <Layers className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="w-full h-full bg-[#12131a] border-r border-[#1f202c] flex flex-col select-none">
      {/* Tabs list */}
      <div className="flex border-b border-[#1f202c] bg-[#0b0c11]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1.5 transition-all text-center border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/10'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-semibold tracking-wider uppercase">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conditional Component Search box */}
      {activeTab === 'components' && (
        <div className="px-4 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search elements..."
              value={componentSearch}
              onChange={(e) => setComponentSearch(e.target.value)}
              className="w-full bg-[#0b0c11] border border-[#1f202c] hover:border-gray-700 focus:border-indigo-500 text-xs text-white placeholder-gray-500 rounded-lg pl-9 pr-3 py-2 focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'components' && <ComponentTab />}
        {activeTab === 'layout' && <LayoutTab />}
        {activeTab === 'colors' && <ColorsTab />}
        {activeTab === 'layers' && <LayersTab />}
      </div>

      {/* Clear Canvas / Quick Actions bottom bar */}
      <div className="p-3 border-t border-[#1f202c] bg-[#0b0c11] flex items-center justify-between">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          {elements.length} Elements
        </span>
        {elements.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all elements?')) {
                clearCanvas();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>
    </div>
  );
};
