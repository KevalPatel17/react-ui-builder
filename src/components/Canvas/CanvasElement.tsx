import React from 'react';
import * as Icons from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import type { CanvasElement as ElementType, StyleProps } from '../../types';
import { useResizeElement } from '../../hooks/useResizeElement';

interface CanvasElementProps {
  element: ElementType;
  onStartDrag?: (e: React.MouseEvent, element: ElementType) => void;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({ element, onStartDrag }) => {
  const {
    elements,
    selectedIds,
    selectElements,
    previewMode,
  } = useBuilderStore();

  const { startResize } = useResizeElement();

  const isSelected = selectedIds.includes(element.id);
  const isNested = !!element.parentId;

  // Resolve Icon by String
  const renderIcon = (name?: string, className = "w-4 h-4") => {
    if (!name) return null;
    const IconComponent = (Icons as any)[name];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Icons.HelpCircle className={className} />;
  };

  // Convert StyleProps into React Inline Styles
  const getInlineStyles = (style: StyleProps, isPreview: boolean): React.CSSProperties => {
    const shadow = style.boxShadow;
    const shadowStr = shadow.opacity > 0
      ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(0, 0, 0, ${shadow.opacity})`
      : 'none';

    const isFormElement = [
      'text-input', 'password-input', 'email-input', 'number-input', 'search-input',
      'textarea', 'select', 'multi-select', 'checkbox', 'radio-group',
      'toggle-switch', 'slider', 'date-picker', 'file-upload'
    ].includes(element.type);

    const baseStyles: React.CSSProperties = {
      position: isNested ? 'relative' : 'absolute',
      left: isNested ? undefined : `${element.x}px`,
      top: isNested ? undefined : `${element.y}px`,
      width: isNested ? '100%' : `${element.width}px`,
      height: isNested ? 'auto' : `${element.height}px`,
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      zIndex: element.zIndex,
      color: style.textColor,
      opacity: style.opacity,
      marginTop: `${style.margin.t}px`,
      marginRight: `${style.margin.r}px`,
      marginBottom: `${style.margin.b}px`,
      marginLeft: `${style.margin.l}px`,
      boxSizing: 'border-box',
      transition: 'box-shadow 0.2s border-color 0.2s',
      cursor: isPreview ? (element.props.clickable ? 'pointer' : 'default') : 'move',
    };

    if (!isFormElement) {
      baseStyles.backgroundColor = style.backgroundColor;
      baseStyles.borderColor = style.borderColor;
      baseStyles.borderWidth = `${style.borderWidth}px`;
      baseStyles.borderStyle = style.borderStyle;
      baseStyles.borderRadius = `${style.borderRadius}px`;
      baseStyles.boxShadow = shadowStr;
      baseStyles.paddingTop = `${style.padding.t}px`;
      baseStyles.paddingRight = `${style.padding.r}px`;
      baseStyles.paddingBottom = `${style.padding.b}px`;
      baseStyles.paddingLeft = `${style.padding.l}px`;
    }

    // Container Specific flex/grid layouts
    if (style.display === 'flex') {
      baseStyles.display = 'flex';
      baseStyles.flexDirection = style.flexDirection;
      baseStyles.flexWrap = style.flexWrap;
      baseStyles.justifyContent = style.justifyContent;
      baseStyles.alignItems = style.alignItems;
      baseStyles.gap = `${style.gap}px`;
    } else if (style.display === 'grid') {
      baseStyles.display = 'grid';
      baseStyles.gridTemplateColumns = `repeat(${style.gridColumns || 1}, minmax(0, 1fr))`;
      if (style.gridRows) {
        baseStyles.gridTemplateRows = `repeat(${style.gridRows}, minmax(0, 1fr))`;
      }
      baseStyles.gap = `${style.gap}px`;
    }

    return baseStyles;
  };

  // Find direct nested children
  const children = elements
    .filter((el) => el.parentId === element.id && (!previewMode || !el.hidden))
    .sort((a, b) => a.zIndex - b.zIndex);

  // Render internal component markup
  const renderInnerContent = () => {
    const props = element.props;
    const fontStyle: React.CSSProperties = {
      fontSize: `${props.fontSize}px`,
      fontFamily: props.fontFamily || 'inherit',
      fontWeight: props.fontWeight,
      lineHeight: props.lineHeight,
      letterSpacing: `${props.letterSpacing}px`,
      textAlign: props.textAlign,
      textDecoration: props.textDecoration,
      color: props.color || undefined,
    };

    switch (element.type) {
      // Inputs
      case 'text-input':
      case 'password-input':
      case 'email-input':
      case 'number-input':
      case 'search-input':
        const inputType = element.type.split('-')[0];
        return (
          <div className="w-full text-left" style={fontStyle}>
            {props.label && <label className="block text-xs font-semibold mb-1 select-none">{props.label}</label>}
            <div className="relative">
              {element.type === 'search-input' && (
                <Icons.Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 opacity-40 text-black" />
              )}
              <input
                type={inputType === 'search' ? 'text' : inputType}
                placeholder={props.placeholder}
                disabled={props.disabled}
                className={`w-full bg-white border text-xs text-black rounded px-3 py-2 focus:outline-none ${
                  props.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } ${element.type === 'search-input' ? 'pl-8' : ''}`}
                readOnly
              />
            </div>
            {props.helperText && (
              <span className={`text-[10px] block mt-1 ${props.error ? 'text-red-500' : 'opacity-60 text-black'}`}>
                {props.helperText}
              </span>
            )}
          </div>
        );
      case 'textarea':
        return (
          <div className="w-full text-left" style={fontStyle}>
            {props.label && <label className="block text-xs font-semibold mb-1 select-none">{props.label}</label>}
            <textarea
              placeholder={props.placeholder}
              disabled={props.disabled}
              rows={2}
              className={`w-full bg-white border border-gray-300 text-xs text-black rounded px-3 py-2 focus:outline-none resize-none`}
              readOnly
            />
          </div>
        );
      case 'select':
      case 'multi-select':
        return (
          <div className="w-full text-left" style={fontStyle}>
            {props.label && <label className="block text-xs font-semibold mb-1 select-none">{props.label}</label>}
            <div className="relative">
              <select
                disabled={props.disabled}
                className="w-full bg-white border border-gray-300 text-xs text-black rounded px-3 py-2 appearance-none focus:outline-none"
              >
                <option value="">{props.placeholder || 'Select value...'}</option>
                {(props.options || []).map((o, idx) => (
                  <option key={idx} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <Icons.ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 opacity-50 pointer-events-none text-black" />
            </div>
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2 text-left" style={fontStyle}>
            <input
              type="checkbox"
              checked={props.checked}
              disabled={props.disabled}
              className="accent-indigo-600 w-4 h-4"
              readOnly
            />
            {props.text && <span className="select-none text-xs">{props.text}</span>}
          </div>
        );
      case 'toggle-switch':
        return (
          <div className="flex items-center justify-between w-full" style={fontStyle}>
            {props.text && <span className="text-xs font-medium mr-2">{props.text}</span>}
            <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 cursor-pointer ${props.checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-200 ease-in-out ${props.checked ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </div>
        );
      case 'radio-group':
        return (
          <div className="w-full text-left" style={fontStyle}>
            {props.text && <span className="block text-xs font-semibold mb-2">{props.text}</span>}
            <div className="space-y-1.5">
              {(props.options || []).map((o, idx) => (
                <label key={idx} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                  <input type="radio" name={element.id} checked={idx === 0} className="accent-indigo-600" readOnly />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'slider':
        return (
          <div className="w-full text-left" style={fontStyle}>
            {props.text && <span className="block text-xs font-medium mb-1">{props.text}</span>}
            <input type="range" className="w-full accent-indigo-600 cursor-pointer" readOnly />
          </div>
        );
      case 'date-picker':
        return (
          <div className="w-full text-left" style={fontStyle}>
            {props.label && <label className="block text-xs font-semibold mb-1 select-none">{props.label}</label>}
            <div className="relative">
              <input type="text" value="YYYY-MM-DD" className="w-full bg-white border border-gray-300 text-xs text-black rounded px-3 py-2" readOnly />
              <Icons.Calendar className="absolute right-2.5 top-2.5 w-4 h-4 opacity-50 text-black" />
            </div>
          </div>
        );
      case 'file-upload':
        return (
          <div className="w-full text-left flex flex-col justify-center items-center border border-dashed border-gray-300 bg-gray-50/50 rounded-lg p-3 text-center" style={fontStyle}>
            <Icons.UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-xs font-semibold text-gray-600 select-none">{props.label || 'Upload File'}</span>
            <span className="text-[10px] text-gray-400 mt-0.5 select-none">{props.placeholder || 'Upload file here'}</span>
          </div>
        );

      // Buttons
      case 'primary-btn':
      case 'secondary-btn':
      case 'outline-btn':
      case 'ghost-btn':
        const isLeftIcon = props.iconPosition !== 'right';
        return (
          <button
            className="w-full h-full flex items-center justify-center gap-1.5 transition-all text-xs font-semibold truncate select-none border"
            style={{
              backgroundColor: 'inherit',
              color: 'inherit',
              borderColor: 'inherit',
              borderWidth: 'inherit',
              borderStyle: 'inherit',
              borderRadius: 'inherit',
              ...fontStyle,
            }}
          >
            {props.loading && <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {!props.loading && isLeftIcon && renderIcon(props.iconName, "w-3.5 h-3.5")}
            <span>{props.text}</span>
            {!props.loading && !isLeftIcon && renderIcon(props.iconName, "w-3.5 h-3.5")}
          </button>
        );
      case 'icon-btn':
        return (
          <div className="w-full h-full flex items-center justify-center">
            {renderIcon(props.iconName || 'Star', "w-5 h-5")}
          </div>
        );
      case 'btn-group':
        return (
          <div className="flex w-full h-full border border-inherit rounded-inherit divide-x divide-gray-300/40" style={fontStyle}>
            {(props.options || []).map((o, idx) => (
              <button key={idx} className="flex-1 py-1 text-center font-semibold text-xs hover:bg-gray-100/10 truncate">
                {o}
              </button>
            ))}
          </div>
        );
      case 'fab':
        return (
          <button className="w-full h-full rounded-full flex items-center justify-center shadow-lg text-white">
            {renderIcon(props.iconName || 'Plus', "w-5 h-5")}
          </button>
        );

      // Display
      case 'heading':
        return <h2 className="w-full truncate leading-tight" style={fontStyle}>{props.text}</h2>;
      case 'paragraph':
        return <p className="w-full leading-normal text-xs" style={fontStyle}>{props.text}</p>;
      case 'label':
        return <span className="w-full block leading-none font-semibold" style={fontStyle}>{props.text}</span>;
      case 'badge':
        return (
          <span className="w-full h-full flex items-center justify-center font-bold text-[10px] rounded-full uppercase truncate px-2 select-none">
            {props.text}
          </span>
        );
      case 'tag':
        return (
          <span className="w-full h-full flex items-center justify-center font-medium text-[10px] rounded px-1.5 border border-indigo-400/20 select-none gap-0.5">
            {props.text}
          </span>
        );
      case 'avatar':
        return (
          <div className="w-full h-full rounded-full overflow-hidden border border-gray-200">
            {props.imageUrl ? (
              <img src={props.imageUrl} alt="Avatar" className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">JD</div>
            )}
          </div>
        );
      case 'avatar-group':
        return (
          <div className="flex -space-x-2.5 items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">JD</div>
            <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">MS</div>
            <div className="w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">TL</div>
          </div>
        );
      case 'icon':
        return <div className="w-full h-full flex items-center justify-center">{renderIcon(props.iconName || 'Star', "w-full h-full")}</div>;
      case 'divider':
        return <div className="w-full h-[1px] border-b border-gray-300/60" />;
      case 'spacer':
        return <div className="w-full h-full" />;
      case 'progress-bar':
        const val = parseInt(props.text || '45') || 0;
        return (
          <div className="w-full flex flex-col justify-center gap-1 text-left">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden p-0.5 border border-gray-300">
              <div className="bg-indigo-600 h-full rounded-full flex items-center justify-end px-1" style={{ width: `${val}%` }}>
                {props.checked && val > 15 && (
                  <span className="text-[7px] text-white font-extrabold">{val}%</span>
                )}
              </div>
            </div>
          </div>
        );
      case 'spinner':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <Icons.Loader2 className="w-full h-full animate-spin text-indigo-600" />
          </div>
        );
      case 'tooltip':
        return (
          <div className="relative group/tooltip flex items-center justify-center w-full h-full">
            <div className="border border-gray-300 rounded px-3 py-1 cursor-help hover:bg-gray-50 flex items-center gap-1">
              <Icons.HelpCircle className="w-3.5 h-3.5 opacity-60 text-black" />
              <span className="text-xs text-gray-700 font-medium select-none">{props.text || 'Tooltip'}</span>
            </div>
            {/* Tooltip flyout (simulate visible on hover) */}
            <div className="absolute bottom-full mb-1.5 hidden group-hover/tooltip:block bg-gray-900 border border-gray-800 text-white text-[9px] py-1 px-2 rounded whitespace-nowrap shadow-md z-[9999]">
              {props.helperText || 'Help details'}
            </div>
          </div>
        );
      case 'image-placeholder':
        return (
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center border border-gray-200 rounded text-center">
            <Icons.Image className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-[10px] text-gray-400 font-semibold select-none">300 x 160 Image</span>
          </div>
        );

      // Cards
      case 'card':
        return (
          <div className="w-full text-left">
            <h4 className="text-xs font-bold text-gray-900 mb-1 select-none">Card Header</h4>
            <p className="text-[11px] text-gray-500 mb-2.5">Lorem ipsum dolor sit amet details.</p>
            {/* Draw nested kids */}
            <div className="space-y-2">{children.map((child) => <CanvasElement key={child.id} element={child} />)}</div>
          </div>
        );
      case 'profile-card':
        return (
          <div className="w-full flex flex-col items-center justify-center text-center p-3">
            <div className="w-14 h-14 rounded-full bg-indigo-100 border border-indigo-200 mb-2 flex items-center justify-center font-bold text-lg text-indigo-600 shadow-inner overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
            </div>
            <h4 className="text-xs font-bold text-gray-950">Alexa Carter</h4>
            <p className="text-[10px] text-gray-500 font-medium mb-3">Senior Product Designer</p>
            <button className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-full shadow cursor-pointer">
              Follow
            </button>
          </div>
        );
      case 'stats-card':
        return (
          <div className="w-full text-left flex flex-col justify-between h-full">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider select-none">Monthly Revenue</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-black text-gray-900">$12,482</span>
              <span className="text-[9px] font-bold text-green-500">+14.2%</span>
            </div>
            <span className="text-[8px] text-gray-400 mt-2 block select-none">Since last billing cycle</span>
          </div>
        );
      case 'pricing-card':
        return (
          <div className="w-full flex flex-col h-full justify-between items-center text-center p-4">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[8px] font-extrabold rounded-full uppercase tracking-wider select-none">Popular Choice</span>
              <h4 className="text-sm font-extrabold text-gray-900 mt-1">Professional Plan</h4>
              <div className="flex items-baseline justify-center gap-0.5 mt-2">
                <span className="text-2xl font-black text-gray-950">$39</span>
                <span className="text-[9px] text-gray-500 font-bold uppercase select-none">/ month</span>
              </div>
            </div>
            <ul className="text-[10px] text-gray-600 space-y-1 my-4 text-left w-full border-t border-gray-100 pt-3.5">
              <li>✓ Unlimited cloud designs</li>
              <li>✓ 10 React components exports</li>
              <li>✓ 24/7 dedicated support</li>
            </ul>
            <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded shadow cursor-pointer uppercase tracking-wider">
              Get Started
            </button>
          </div>
        );
      case 'alert':
        return (
          <div className="w-full flex items-center gap-2 text-left">
            <Icons.AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-xs select-none block leading-none">{props.text || 'Alert notification'}</span>
              <span className="text-[9px] opacity-75 mt-0.5 block select-none">Warning: unsaved workspace changes detect.</span>
            </div>
          </div>
        );
      case 'notification':
        return (
          <div className="w-full flex items-center gap-2.5 text-left">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
              <Icons.Bell className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <span className="font-bold text-[10px] text-gray-900 select-none block">Email Verified</span>
              <span className="text-[9px] text-gray-400 select-none truncate block">Welcome aboard, designer!</span>
            </div>
          </div>
        );
      case 'empty-state':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <Icons.FolderOpen className="w-8 h-8 text-gray-300 mb-1" />
            <h5 className="text-[11px] font-bold text-gray-800">No projects found</h5>
            <p className="text-[9px] text-gray-400 mt-0.5 leading-relaxed max-w-[200px] select-none">
              Create a new design file in your dashboard to populate data here.
            </p>
          </div>
        );
      case 'list-item':
        return (
          <div className="w-full h-full flex items-center justify-between border-b border-gray-100 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-xs font-semibold text-gray-800 select-none">Dashboard Task List Row</span>
            </div>
            <Icons.ChevronRight className="w-3.5 h-3.5 opacity-40 text-black" />
          </div>
        );
      case 'table':
        const columns = props.columns || ['Name', 'Role', 'Status'];
        const rows = props.rows || [['John Doe', 'Dev', 'Active']];
        return (
          <div className="w-full overflow-x-auto select-none bg-white rounded border border-gray-200">
            <table className="w-full text-left text-[10px] text-gray-600 border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[8px] tracking-wider text-gray-500">
                  {columns.map((c, i) => (
                    <th key={i} className="px-3 py-1.5">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-gray-50/60">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5 font-medium">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'accordion':
        return (
          <div className="w-full text-left bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 flex items-center justify-between border-b border-gray-200 cursor-pointer">
              <span className="text-xs font-bold text-gray-900 select-none">{props.text || 'Accordion Header'}</span>
              <Icons.ChevronDown className="w-3.5 h-3.5 opacity-55 text-black" />
            </div>
            {/* Show expanded panel content in editor representation */}
            <div className="p-3 text-[10px] text-gray-500 leading-normal border-t border-gray-100">
              {props.helperText || 'Accordion collapsed panel content.'}
            </div>
          </div>
        );

      // Shapes
      case 'rect':
      case 'rounded-rect':
        return <div className="w-full h-full" />;
      case 'circle':
        return <div className="w-full h-full rounded-full" />;
      case 'triangle':
        return (
          <svg className="w-full h-full fill-current pointer-events-none" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
        );
      case 'line':
        return <div className="w-full h-[2px]" />;

      // Layout elements container rows/grids
      case 'container-1col':
      case 'container-2col':
      case 'container-3col':
      case 'container-4col':
      case 'flex-row':
      case 'flex-col':
      case 'split-50-50':
      case 'hero':
      case 'layout-hcf':
      case 'layout-sm':
      case 'modal-overlay':
      case 'drawer':
        // Wireframes contain children recursively
        return (
          <>
            {/* If no children in editor mode, display helper instructions */}
            {!previewMode && children.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border border-dashed border-gray-300 px-2 py-1.5 rounded bg-gray-50/40">
                  Container Box: Drop items inside
                </span>
              </div>
            )}
            {children.map((child) => (
              <CanvasElement key={child.id} element={child} />
            ))}
          </>
        );

      default:
        return <div>{element.name}</div>;
    }
  };

  const inlineStyles = getInlineStyles(element.style, previewMode);

  return (
    <div
      id={element.id}
      style={inlineStyles}
      className={`relative select-none ${
        !previewMode
          ? `group/canvas-item border-dashed ${
              isSelected
                ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-600'
                : 'border-transparent hover:border-indigo-400/50'
            }`
          : ''
      } ${element.hidden && !previewMode ? 'opacity-30 border-red-500/50 border-2' : ''}`}
      onMouseDown={(e) => {
        if (previewMode) return;
        const target = e.target as HTMLElement;
        if (target.className.includes('cursor-') || target.className.includes('border-indigo-')) return;
        if (onStartDrag) {
          onStartDrag(e, element);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (previewMode) {
          const action = element.props.clickAction;
          if (action && action.type !== 'none') {
            if (action.type === 'show' && action.targetId) {
              useBuilderStore.getState().updateElement(action.targetId, { hidden: false });
            } else if (action.type === 'hide' && action.targetId) {
              useBuilderStore.getState().updateElement(action.targetId, { hidden: true });
            } else if (action.type === 'alert' && action.value) {
              alert(action.value);
            }
          }
          return;
        }
        
        // Multi-select with Shift
        if (e.shiftKey) {
          if (isSelected) {
            selectElements(selectedIds.filter((id) => id !== element.id));
          } else {
            selectElements([...selectedIds, element.id]);
          }
        } else {
          selectElements([element.id]);
        }
      }}
    >
      {/* Visual content of element */}
      {renderInnerContent()}

      {/* Resize handles (Only rendered when selected in editor mode) */}
      {!previewMode && isSelected && !element.locked && (
        <>
          {/* Cardinal directions edges */}
          {(['t', 'r', 'b', 'l'] as const).map((handle) => (
            <div
              key={handle}
              onMouseDown={(e) => startResize(e, element, handle)}
              className={`absolute border border-indigo-600 bg-white hover:bg-indigo-500 transition-colors z-[9999] ${
                handle === 't' ? 'top-[-4px] left-[50%] translate-x-[-50%] w-4 h-1.5 cursor-ns-resize rounded-full' :
                handle === 'b' ? 'bottom-[-4px] left-[50%] translate-x-[-50%] w-4 h-1.5 cursor-ns-resize rounded-full' :
                handle === 'l' ? 'left-[-4px] top-[50%] translate-y-[-50%] w-1.5 h-4 cursor-ew-resize rounded-full' :
                'right-[-4px] top-[50%] translate-y-[-50%] w-1.5 h-4 cursor-ew-resize rounded-full'
              }`}
            />
          ))}

          {/* Diagonals corners */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((handle) => (
            <div
              key={handle}
              onMouseDown={(e) => startResize(e, element, handle)}
              className={`absolute w-2.5 h-2.5 bg-white border-2 border-indigo-600 rounded z-[9999] ${
                handle === 'tl' ? 'top-[-5px] left-[-5px] cursor-nwse-resize' :
                handle === 'tr' ? 'top-[-5px] right-[-5px] cursor-nesw-resize' :
                handle === 'bl' ? 'bottom-[-5px] left-[-5px] cursor-nesw-resize' :
                'bottom-[-5px] right-[-5px] cursor-nwse-resize'
              }`}
            />
          ))}

          {/* Selection indicator label tag */}
          <div className="absolute left-0 bottom-full mb-1 text-[8px] font-bold text-white bg-indigo-600 px-1 py-0.5 rounded shadow pointer-events-none leading-none select-none select-all uppercase">
            {element.name}
          </div>
        </>
      )}
    </div>
  );
};
