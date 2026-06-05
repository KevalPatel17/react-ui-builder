import React from 'react';
import { Columns, Grid, Layout, LayoutGrid, Layers, Maximize, PanelLeft, PlusCircle } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import type { ComponentType } from '../../types';
import { createDefaultElement } from './ComponentTab';

interface LayoutItem {
  type: ComponentType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export const LayoutTab: React.FC = () => {
  const { addElement } = useBuilderStore();

  const layouts: LayoutItem[] = [
    {
      type: 'container-1col',
      label: '1-Column Container',
      desc: 'Simple full-width block wrapper',
      icon: <Columns className="w-5 h-5 text-indigo-400" />,
    },
    {
      type: 'container-2col',
      label: '2-Column Grid',
      desc: 'Side-by-side columns (grid-cols-2)',
      icon: <LayoutGrid className="w-5 h-5 text-indigo-400" />,
    },
    {
      type: 'container-3col',
      label: '3-Column Grid',
      desc: 'Three equal columns layout',
      icon: <Grid className="w-5 h-5 text-indigo-400" />,
    },
    {
      type: 'container-4col',
      label: '4-Column Grid',
      desc: 'Four columns grid for cards',
      icon: <Grid className="w-5 h-5 text-indigo-400 opacity-70" />,
    },
    {
      type: 'flex-row',
      label: 'Flexbox Row',
      desc: 'Elements aligned horizontally',
      icon: <div className="flex space-x-1 border border-indigo-400/50 p-1 rounded w-6 h-5"><div className="w-1.5 h-full bg-indigo-400/50" /><div className="w-1.5 h-full bg-indigo-400/50" /><div className="w-1.5 h-full bg-indigo-400/50" /></div>,
    },
    {
      type: 'flex-col',
      label: 'Flexbox Column',
      desc: 'Elements stacked vertically',
      icon: <div className="flex flex-col space-y-0.5 border border-indigo-400/50 p-1 rounded w-5 h-6"><div className="w-full h-1 bg-indigo-400/50" /><div className="w-full h-1 bg-indigo-400/50" /><div className="w-full h-1 bg-indigo-400/50" /></div>,
    },
    {
      type: 'hero',
      label: 'Hero Section',
      desc: 'Large block with centered header space',
      icon: <Maximize className="w-5 h-5 text-indigo-400" />,
    },
    {
      type: 'split-50-50',
      label: 'Split Layout (50/50)',
      desc: 'Two halves, perfect for split headers',
      icon: <Columns className="w-5 h-5 text-indigo-400" />,
    },
    {
      type: 'layout-hcf',
      label: 'Header + Content + Footer',
      desc: 'Classic website landing scaffolding',
      icon: <Layout className="w-5 h-5 text-indigo-400" />,
    },
    {
      type: 'layout-sm',
      label: 'Sidebar + Main Content',
      desc: 'Admin dashboard layout wireframe',
      icon: <PanelLeft className="w-5 h-5 text-indigo-400" />,
    },
    {
      type: 'modal-overlay',
      label: 'Full-page Modal Overlay',
      desc: 'Centering backdrop overlay',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
    },
    {
      type: 'drawer',
      label: 'Drawer Slide-over',
      desc: 'Right/left sliding drawer container',
      icon: <PanelLeft className="w-5 h-5 text-indigo-400 rotate-180" />,
    },
  ];

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('application/react-builder-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddClick = (type: ComponentType) => {
    const id = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const newElement = createDefaultElement(type, id);
    
    // Set explicit display attributes for Layout elements
    if (type.includes('col') || type.includes('grid')) {
      newElement.style.display = 'grid';
      if (type === 'container-2col') newElement.style.gridColumns = 2;
      else if (type === 'container-3col') newElement.style.gridColumns = 3;
      else if (type === 'container-4col') newElement.style.gridColumns = 4;
      else newElement.style.gridColumns = 1;
    } else if (type.includes('flex')) {
      newElement.style.display = 'flex';
      newElement.style.flexDirection = type === 'flex-row' ? 'row' : 'column';
    } else if (type === 'split-50-50') {
      newElement.style.display = 'grid';
      newElement.style.gridColumns = 2;
    }
    
    addElement(newElement);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
      <div className="text-xs text-gray-400 mb-2">
        Drag layouts onto the canvas or click to add. You can drop child components inside these containers!
      </div>
      
      <div className="space-y-2.5">
        {layouts.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => handleAddClick(item.type)}
            className="group flex items-center p-3 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 hover:border-indigo-500/50 hover:text-white transition-all cursor-pointer select-none"
          >
            <div className="p-2 rounded bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-all mr-3">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-gray-200 group-hover:text-white truncate">{item.label}</h4>
              <p className="text-[10px] text-gray-500 truncate">{item.desc}</p>
            </div>
            <PlusCircle className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
};
