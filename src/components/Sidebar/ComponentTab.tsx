import React from 'react';
import { Star, FileText, Type, Square, ToggleLeft, TextCursorInput, CheckSquare } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import type { ComponentType, CanvasElement, StyleProps, ComponentProps } from '../../types';

interface ComponentItem {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

export const ComponentTab: React.FC = () => {
  const { addElement, componentSearch, favorites, toggleFavorite } = useBuilderStore();

  const categories = [
    {
      title: 'Form Elements',
      items: [
        { type: 'text-input', label: 'Text Input', icon: <TextCursorInput className="w-4 h-4" /> },
        { type: 'password-input', label: 'Password Input', icon: <TextCursorInput className="w-4 h-4 text-red-400" /> },
        { type: 'email-input', label: 'Email Input', icon: <TextCursorInput className="w-4 h-4 text-blue-400" /> },
        { type: 'number-input', label: 'Number Input', icon: <TextCursorInput className="w-4 h-4 text-green-400" /> },
        { type: 'textarea', label: 'Textarea', icon: <FileText className="w-4 h-4" /> },
        { type: 'select', label: 'Dropdown / Select', icon: <ChevronDownIcon /> },
        { type: 'multi-select', label: 'Multi-select', icon: <ChevronDownIcon /> },
        { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-4 h-4" /> },
        { type: 'radio-group', label: 'Radio Group', icon: <CircleIcon /> },
        { type: 'toggle-switch', label: 'Toggle Switch', icon: <ToggleLeft className="w-4 h-4" /> },
        { type: 'slider', label: 'Slider / Range', icon: <SliderIcon /> },
        { type: 'date-picker', label: 'Date Picker', icon: <CalendarIcon /> },
        { type: 'file-upload', label: 'File Upload', icon: <UploadIcon /> },
        { type: 'search-input', label: 'Search Input', icon: <SearchIcon /> },
      ] as ComponentItem[],
    },
    {
      title: 'Buttons',
      items: [
        { type: 'primary-btn', label: 'Primary Button', icon: <ButtonIcon className="bg-indigo-600 border-indigo-600 text-white" /> },
        { type: 'secondary-btn', label: 'Secondary Button', icon: <ButtonIcon className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200" /> },
        { type: 'outline-btn', label: 'Outline Button', icon: <ButtonIcon className="bg-transparent border border-gray-400 dark:border-gray-500" /> },
        { type: 'ghost-btn', label: 'Ghost Button', icon: <ButtonIcon className="bg-transparent text-gray-500 hover:bg-gray-100" /> },
        { type: 'icon-btn', label: 'Icon Button', icon: <Star className="w-4 h-4" /> },
        { type: 'btn-group', label: 'Button Group', icon: <ButtonGroupIcon /> },
        { type: 'fab', label: 'FAB (Float Action)', icon: <FABIcon /> },
      ] as ComponentItem[],
    },
    {
      title: 'Display Elements',
      items: [
        { type: 'heading', label: 'Heading (H1-H4)', icon: <Type className="w-4 h-4 font-bold" /> },
        { type: 'paragraph', label: 'Paragraph text', icon: <Type className="w-4 h-4" /> },
        { type: 'label', label: 'Label', icon: <Type className="w-4 h-3 opacity-60" /> },
        { type: 'badge', label: 'Badge / Pill', icon: <BadgeIcon /> },
        { type: 'tag', label: 'Tag / Chip', icon: <TagIcon /> },
        { type: 'avatar', label: 'Avatar', icon: <AvatarIcon /> },
        { type: 'avatar-group', label: 'Avatar Group', icon: <AvatarGroupIcon /> },
        { type: 'icon', label: 'Icon', icon: <Star className="w-4 h-4 text-amber-500" /> },
        { type: 'divider', label: 'Divider Line', icon: <div className="w-full border-t border-gray-400 my-2" /> },
        { type: 'spacer', label: 'Spacer', icon: <div className="w-4 h-4 border border-dashed border-gray-300 dark:border-gray-600 rounded" /> },
        { type: 'progress-bar', label: 'Progress Bar', icon: <ProgressBarIcon /> },
        { type: 'spinner', label: 'Spinner/Loader', icon: <SpinnerIcon /> },
        { type: 'tooltip', label: 'Tooltip Trigger', icon: <TooltipIcon /> },
        { type: 'image-placeholder', label: 'Image Placeholder', icon: <ImageIcon /> },
      ] as ComponentItem[],
    },
    {
      title: 'Cards & Containers',
      items: [
        { type: 'card', label: 'Basic Card', icon: <Square className="w-4 h-4" /> },
        { type: 'profile-card', label: 'Profile Card', icon: <ProfileCardIcon /> },
        { type: 'stats-card', label: 'Stats Card', icon: <StatsCardIcon /> },
        { type: 'pricing-card', label: 'Pricing Card', icon: <PricingCardIcon /> },
        { type: 'alert', label: 'Alert / Banner', icon: <AlertIcon /> },
        { type: 'notification', label: 'Notification Toast', icon: <BellIcon /> },
        { type: 'empty-state', label: 'Empty State Box', icon: <EmptyStateIcon /> },
        { type: 'list-item', label: 'List Item', icon: <ListIcon /> },
        { type: 'table', label: 'Table Grid', icon: <TableIcon /> },
        { type: 'accordion', label: 'Accordion Item', icon: <AccordionIcon /> },
      ] as ComponentItem[],
    },
    {
      title: 'Shapes',
      items: [
        { type: 'rect', label: 'Rectangle', icon: <div className="w-6 h-4 bg-gray-400 rounded" /> },
        { type: 'circle', label: 'Circle', icon: <div className="w-5 h-5 bg-gray-400 rounded-full" /> },
        { type: 'triangle', label: 'Triangle', icon: <TriangleIcon /> },
        { type: 'rounded-rect', label: 'Rounded Rect', icon: <div className="w-6 h-4 bg-gray-400 rounded-md" /> },
        { type: 'line', label: 'Divider Line', icon: <div className="w-full h-0.5 bg-gray-500" /> },
      ] as ComponentItem[],
    },
  ];

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('application/react-builder-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddClick = (type: ComponentType) => {
    // Generate a default element in the center of the canvas (or standard offset)
    const id = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const newElement = createDefaultElement(type, id);
    addElement(newElement);
  };

  // Filter categories by search
  const filteredCategories = categories.map((cat) => {
    const filteredItems = cat.items.filter((item) =>
      item.label.toLowerCase().includes(componentSearch.toLowerCase())
    );
    return { ...cat, items: filteredItems };
  }).filter((cat) => cat.items.length > 0);

  // Favorites list
  const favoriteItems = categories
    .flatMap((cat) => cat.items)
    .filter((item) => favorites.includes(item.type));

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 no-scrollbar">
      {/* Favorites category */}
      {favoriteItems.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500" /> Favorites
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {favoriteItems.map((item) => (
              <div
                key={`fav-${item.type}`}
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
                onClick={() => handleAddClick(item.type)}
                className="group relative flex flex-col items-center justify-center p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-gray-300 transition-all cursor-pointer text-center"
              >
                <div className="mb-2 text-indigo-400 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium truncate w-full">{item.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.type);
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard categories */}
      {filteredCategories.map((cat) => (
        <div key={cat.title}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {cat.title}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {cat.items.map((item) => {
              const isFav = favorites.includes(item.type);
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  onClick={() => handleAddClick(item.type)}
                  className="group relative flex flex-col items-center justify-center p-3 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 hover:border-indigo-500/50 hover:text-white text-gray-400 transition-all cursor-pointer text-center select-none"
                >
                  <div className="mb-2 text-indigo-400/80 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium truncate w-full">{item.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.type);
                    }}
                    className={`absolute top-1 right-1 transition-opacity ${
                      isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${isFav ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {filteredCategories.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-xs">
          No elements found matching "{componentSearch}"
        </div>
      )}
    </div>
  );
};

// SVG / Boilerplate Icon Subcomponents
const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const CircleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const SliderIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 7v6m10-6v6" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const ButtonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`w-10 h-3.5 border rounded-sm text-[6px] flex items-center justify-center font-bold px-1 select-none ${className}`}>Btn</div>
);
const ButtonGroupIcon = () => (
  <div className="flex border border-gray-500 rounded bg-transparent">
    <div className="px-1 py-0.5 border-r border-gray-500 text-[6px]">A</div>
    <div className="px-1 py-0.5 border-r border-gray-500 text-[6px]">B</div>
    <div className="px-1 py-0.5 text-[6px]">C</div>
  </div>
);
const FABIcon = () => (
  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">+</div>
);
const BadgeIcon = () => (
  <div className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-[8px] rounded-full font-semibold">Badge</div>
);
const TagIcon = () => (
  <div className="px-1.5 py-0.5 border border-indigo-400/40 text-indigo-400 text-[8px] rounded font-medium flex items-center gap-0.5">🏷️ Tag</div>
);
const AvatarIcon = () => (
  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-bold">JD</div>
);
const AvatarGroupIcon = () => (
  <div className="flex -space-x-2">
    <div className="w-4 h-4 rounded-full bg-red-500 border border-gray-900 flex items-center justify-center text-[6px] font-bold text-white">A</div>
    <div className="w-4 h-4 rounded-full bg-blue-500 border border-gray-900 flex items-center justify-center text-[6px] font-bold text-white">B</div>
    <div className="w-4 h-4 rounded-full bg-green-500 border border-gray-900 flex items-center justify-center text-[6px] font-bold text-white">C</div>
  </div>
);
const ImageIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
const ProfileCardIcon = () => (
  <div className="w-12 h-10 border border-gray-700 bg-gray-950 rounded p-1 flex flex-col items-center justify-center">
    <div className="w-3 h-3 rounded-full bg-gray-400 mb-0.5" />
    <div className="w-6 h-1 bg-gray-500 mb-0.5" />
    <div className="w-8 h-0.5 bg-gray-700" />
  </div>
);
const StatsCardIcon = () => (
  <div className="w-12 h-10 border border-gray-700 bg-gray-950 rounded p-1 flex flex-col justify-between">
    <div className="w-4 h-0.5 bg-gray-500" />
    <div className="text-[8px] font-bold text-green-400">$2.4k</div>
    <div className="w-8 h-1 bg-indigo-900/50 rounded" />
  </div>
);
const PricingCardIcon = () => (
  <div className="w-12 h-10 border border-indigo-600 bg-gray-950 rounded p-1 flex flex-col items-center justify-between">
    <div className="w-6 h-0.5 bg-gray-500" />
    <div className="text-[7px] font-extrabold text-white">$19/mo</div>
    <div className="w-8 h-2 bg-indigo-600 rounded-sm" />
  </div>
);
const AlertIcon = () => (
  <div className="w-12 h-3.5 bg-amber-900/30 border border-amber-500/30 rounded flex items-center px-1">
    <div className="w-1 h-1 rounded-full bg-amber-500 mr-1" />
    <div className="w-8 h-0.5 bg-amber-300" />
  </div>
);
const BellIcon = () => (
  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const EmptyStateIcon = () => (
  <div className="w-12 h-10 border border-dashed border-gray-700 bg-gray-950/40 rounded flex flex-col items-center justify-center p-1">
    <div className="w-2 h-2 rounded bg-gray-600 mb-0.5" />
    <div className="w-6 h-0.5 bg-gray-700" />
  </div>
);
const ListIcon = () => (
  <div className="flex flex-col space-y-1">
    <div className="flex items-center space-x-1"><div className="w-1 h-1 bg-indigo-500" /><div className="w-6 h-0.5 bg-gray-500" /></div>
    <div className="flex items-center space-x-1"><div className="w-1 h-1 bg-indigo-500" /><div className="w-6 h-0.5 bg-gray-500" /></div>
  </div>
);
const TableIcon = () => (
  <div className="grid grid-cols-2 gap-0.5 border border-gray-700 p-0.5 rounded bg-gray-950">
    <div className="w-4 h-1 bg-gray-600" /><div className="w-4 h-1 bg-gray-600" />
    <div className="w-4 h-0.5 bg-gray-800" /><div className="w-4 h-0.5 bg-gray-800" />
  </div>
);
const AccordionIcon = () => (
  <div className="w-12 h-4 border border-gray-700 rounded px-1 flex items-center justify-between">
    <div className="w-5 h-0.5 bg-gray-500" />
    <div className="text-[6px]">▼</div>
  </div>
);
const TriangleIcon = () => (
  <svg className="w-5 h-5 text-gray-500 fill-gray-400" viewBox="0 0 24 24">
    <path d="M12 2L2 22h20L12 2z" />
  </svg>
);

const ProgressBarIcon = () => (
  <div className="w-10 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-700">
    <div className="bg-indigo-600 h-full w-[45%] rounded-full" />
  </div>
);

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const TooltipIcon = () => (
  <div className="px-1.5 py-0.5 border border-gray-600 rounded text-[7px] text-gray-400 cursor-help">ℹ️ Tooltip</div>
);

// factory utility for defaults
export const createDefaultElement = (type: ComponentType, id: string, x = 100, y = 100): CanvasElement => {
  const defaultStyle: StyleProps = {
    backgroundColor: '#ffffff',
    backgroundOpacity: 1,
    textColor: '#1f2937',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    boxShadow: { x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.05 },
    opacity: 1,
    padding: { t: 8, r: 16, b: 8, l: 16 },
    margin: { t: 0, r: 0, b: 0, l: 0 },
    display: 'block',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    gridColumns: 2,
    gridRows: 2,
  };

  const defaultProps: ComponentProps = {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: 0,
    textAlign: 'left',
    textDecoration: 'none',
  };

  let width = 180;
  let height = 40;
  let name = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  switch (type) {
    // Form elements
    case 'text-input':
    case 'password-input':
    case 'email-input':
    case 'number-input':
    case 'search-input':
      defaultProps.placeholder = `Enter ${type.split('-')[0]}...`;
      defaultProps.label = name;
      width = 240;
      height = 68;
      break;
    case 'textarea':
      defaultProps.placeholder = 'Type comments here...';
      defaultProps.label = 'Description';
      width = 280;
      height = 98;
      break;
    case 'select':
    case 'multi-select':
      defaultProps.placeholder = 'Select option...';
      defaultProps.options = ['Option A', 'Option B', 'Option C'];
      defaultProps.label = 'Choose Choice';
      width = 240;
      height = 68;
      break;
    case 'checkbox':
      defaultProps.text = 'Accept terms & conditions';
      defaultProps.checked = false;
      width = 220;
      height = 24;
      break;
    case 'radio-group':
      defaultProps.options = ['Option 1', 'Option 2', 'Option 3'];
      defaultProps.text = 'Radio Selection';
      width = 200;
      height = 80;
      break;
    case 'toggle-switch':
      defaultProps.text = 'Enable feature';
      defaultProps.checked = true;
      width = 180;
      height = 28;
      break;
    case 'slider':
      defaultProps.text = 'Volume';
      defaultProps.fontSize = 12;
      width = 220;
      height = 44;
      break;
    case 'date-picker':
      defaultProps.label = 'Select Date';
      width = 220;
      height = 68;
      break;
    case 'file-upload':
      defaultProps.label = 'Upload File';
      defaultProps.placeholder = 'Drag & drop file here...';
      width = 260;
      height = 100;
      break;

    // Buttons
    case 'primary-btn':
      defaultProps.text = 'Save Changes';
      defaultStyle.backgroundColor = '#4f46e5';
      defaultStyle.textColor = '#ffffff';
      defaultStyle.borderColor = '#4f46e5';
      width = 140;
      height = 40;
      break;
    case 'secondary-btn':
      defaultProps.text = 'Cancel';
      defaultStyle.backgroundColor = '#f3f4f6';
      defaultStyle.textColor = '#374151';
      defaultStyle.borderColor = '#d1d5db';
      width = 110;
      height = 40;
      break;
    case 'outline-btn':
      defaultProps.text = 'Outline View';
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.textColor = '#4f46e5';
      defaultStyle.borderColor = '#4f46e5';
      width = 130;
      height = 40;
      break;
    case 'ghost-btn':
      defaultProps.text = 'Skip';
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.textColor = '#6b7280';
      defaultStyle.borderColor = 'transparent';
      defaultStyle.borderWidth = 0;
      width = 90;
      height = 40;
      break;
    case 'icon-btn':
      defaultProps.iconName = 'Star';
      defaultStyle.backgroundColor = '#f3f4f6';
      defaultStyle.textColor = '#4f46e5';
      width = 40;
      height = 40;
      break;
    case 'btn-group':
      defaultProps.options = ['Left', 'Center', 'Right'];
      width = 200;
      height = 40;
      break;
    case 'fab':
      defaultProps.iconName = 'Plus';
      defaultStyle.backgroundColor = '#4f46e5';
      defaultStyle.textColor = '#ffffff';
      defaultStyle.borderRadius = 9999;
      width = 56;
      height = 56;
      break;

    // Display
    case 'heading':
      defaultProps.text = 'Stunning Visual Builder';
      defaultProps.fontSize = 28;
      defaultProps.fontWeight = 700;
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.borderWidth = 0;
      defaultStyle.textColor = '#0f172a';
      width = 350;
      height = 40;
      break;
    case 'paragraph':
      defaultProps.text = 'Easily build gorgeous React interfaces with drag-and-drop components, full customization panels, and instantly export styled production code.';
      defaultProps.fontSize = 14;
      defaultProps.fontWeight = 400;
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.borderWidth = 0;
      defaultStyle.textColor = '#334155';
      width = 380;
      height = 70;
      break;
    case 'label':
      defaultProps.text = 'Email address';
      defaultProps.fontSize = 12;
      defaultProps.fontWeight = 600;
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.borderWidth = 0;
      defaultStyle.textColor = '#475569';
      width = 120;
      height = 20;
      break;
    case 'badge':
      defaultProps.text = 'PRO';
      defaultStyle.backgroundColor = '#e0e7ff';
      defaultStyle.textColor = '#4338ca';
      defaultStyle.borderColor = 'transparent';
      defaultStyle.borderRadius = 9999;
      defaultStyle.borderWidth = 0;
      width = 54;
      height = 22;
      break;
    case 'tag':
      defaultProps.text = 'Marketing';
      defaultStyle.backgroundColor = '#f3f4f6';
      defaultStyle.textColor = '#1f2937';
      defaultStyle.borderRadius = 6;
      defaultStyle.padding = { t: 4, r: 8, b: 4, l: 8 };
      width = 80;
      height = 24;
      break;
    case 'avatar':
      defaultProps.imageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
      defaultStyle.borderRadius = 9999;
      defaultStyle.borderWidth = 0;
      width = 44;
      height = 44;
      break;
    case 'avatar-group':
      width = 90;
      height = 36;
      break;
    case 'icon':
      defaultProps.iconName = 'Star';
      defaultStyle.textColor = '#eab308';
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.borderWidth = 0;
      width = 36;
      height = 36;
      break;
    case 'divider':
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.borderColor = '#e5e7eb';
      defaultStyle.borderWidth = 1;
      width = 300;
      height = 2;
      break;
    case 'spacer':
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.borderWidth = 0;
      width = 100;
      height = 24;
      break;
    case 'progress-bar':
      defaultProps.text = '45';
      width = 240;
      height = 14;
      break;
    case 'spinner':
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.borderWidth = 0;
      width = 32;
      height = 32;
      break;
    case 'tooltip':
      defaultProps.text = 'Hover over me';
      defaultProps.helperText = 'Useful details';
      width = 120;
      height = 36;
      break;
    case 'image-placeholder':
      defaultStyle.backgroundColor = '#f3f4f6';
      width = 300;
      height = 160;
      break;

    // Cards
    case 'card':
      defaultStyle.backgroundColor = '#ffffff';
      defaultStyle.borderRadius = 12;
      defaultStyle.boxShadow = { x: 0, y: 4, blur: 12, spread: -2, color: '#000000', opacity: 0.08 };
      width = 320;
      height = 220;
      break;
    case 'profile-card':
      defaultStyle.backgroundColor = '#ffffff';
      defaultStyle.borderRadius = 12;
      defaultStyle.boxShadow = { x: 0, y: 4, blur: 12, spread: -2, color: '#000000', opacity: 0.08 };
      width = 300;
      height = 260;
      break;
    case 'stats-card':
      defaultStyle.backgroundColor = '#ffffff';
      defaultStyle.borderRadius = 12;
      defaultStyle.boxShadow = { x: 0, y: 4, blur: 12, spread: -2, color: '#000000', opacity: 0.08 };
      width = 220;
      height = 120;
      break;
    case 'pricing-card':
      defaultStyle.backgroundColor = '#ffffff';
      defaultStyle.borderRadius = 16;
      defaultStyle.borderColor = '#6366f1';
      defaultStyle.borderWidth = 2;
      defaultStyle.boxShadow = { x: 0, y: 10, blur: 15, spread: -3, color: '#6366f1', opacity: 0.1 };
      width = 280;
      height = 380;
      break;
    case 'alert':
      defaultStyle.backgroundColor = '#fef3c7';
      defaultStyle.borderColor = '#f59e0b';
      defaultStyle.textColor = '#92400e';
      defaultStyle.borderRadius = 6;
      width = 350;
      height = 56;
      break;
    case 'notification':
      defaultStyle.backgroundColor = '#ffffff';
      defaultStyle.borderRadius = 10;
      defaultStyle.boxShadow = { x: 0, y: 10, blur: 25, spread: -5, color: '#000000', opacity: 0.1 };
      width = 280;
      height = 68;
      break;
    case 'empty-state':
      defaultStyle.backgroundColor = '#fafafa';
      defaultStyle.borderStyle = 'dashed';
      width = 400;
      height = 240;
      break;
    case 'list-item':
      defaultStyle.backgroundColor = '#ffffff';
      width = 350;
      height = 48;
      break;
    case 'table':
      defaultProps.columns = ['Name', 'Role', 'Status'];
      defaultProps.rows = [
        ['Jane Doe', 'Designer', 'Active'],
        ['John Smith', 'Developer', 'Away'],
        ['Sarah Lee', 'Product', 'Active']
      ];
      width = 450;
      height = 180;
      break;
    case 'accordion':
      defaultProps.text = 'Accordion Header Title';
      defaultProps.helperText = 'This is the expanded panel body details.';
      width = 320;
      height = 44;
      break;

    // Layout
    case 'container-1col':
    case 'container-2col':
    case 'container-3col':
    case 'container-4col':
    case 'flex-row':
    case 'flex-col':
    case 'split-50-50':
    case 'hero':
      defaultStyle.backgroundColor = '#fafafa';
      defaultStyle.borderRadius = 8;
      defaultStyle.borderStyle = 'dashed';
      width = 600;
      height = 180;
      break;
    case 'layout-hcf':
      defaultStyle.backgroundColor = '#f9fafb';
      width = 800;
      height = 380;
      break;
    case 'layout-sm':
      defaultStyle.backgroundColor = '#f9fafb';
      width = 800;
      height = 380;
      break;
    case 'modal-overlay':
      defaultStyle.backgroundColor = 'rgba(0, 0, 0, 0.4)';
      defaultStyle.borderRadius = 0;
      width = 500;
      height = 400;
      break;
    case 'drawer':
      defaultStyle.backgroundColor = '#ffffff';
      defaultStyle.borderRadius = 0;
      width = 320;
      height = 450;
      break;

    // Shapes
    case 'rect':
      defaultStyle.backgroundColor = '#9ca3af';
      width = 120;
      height = 80;
      break;
    case 'circle':
      defaultStyle.backgroundColor = '#9ca3af';
      defaultStyle.borderRadius = 9999;
      width = 80;
      height = 80;
      break;
    case 'triangle':
      defaultStyle.backgroundColor = 'transparent';
      defaultStyle.borderWidth = 0;
      width = 80;
      height = 80;
      break;
    case 'rounded-rect':
      defaultStyle.backgroundColor = '#9ca3af';
      defaultStyle.borderRadius = 16;
      width = 120;
      height = 80;
      break;
    case 'line':
      defaultStyle.backgroundColor = '#6b7280';
      width = 150;
      height = 4;
      break;
  }

  return {
    id,
    name,
    type,
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex: 1,
    locked: false,
    hidden: false,
    props: defaultProps,
    style: defaultStyle,
  };
};
