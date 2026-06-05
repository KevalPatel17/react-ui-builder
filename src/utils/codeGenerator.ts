import type { CanvasElement } from '../types';

// Helper to determine if a component is a container layout
const isContainer = (type: string) => {
  return (
    type.includes('container') ||
    type.includes('layout') ||
    type.includes('flex') ||
    type === 'card' ||
    type === 'hero' ||
    type === 'split-50-50' ||
    type === 'modal-overlay' ||
    type === 'drawer'
  );
};

// ----------------------------------------------------
// 1. TAILWIND CLASS GENERATOR
// ----------------------------------------------------
const styleToTailwind = (element: CanvasElement, isChildOfContainer: boolean): string => {
  const style = element.style;
  const props = element.props;
  const classes: string[] = [];

  // Position
  if (isChildOfContainer) {
    classes.push('relative w-full');
  } else {
    classes.push('absolute');
    classes.push(`left-[${Math.round(element.x)}px]`);
    classes.push(`top-[${Math.round(element.y)}px]`);
    classes.push(`w-[${Math.round(element.width)}px]`);
    classes.push(`h-[${Math.round(element.height)}px]`);
  }

  // Z-index
  if (element.zIndex !== 0) {
    classes.push(`z-[${element.zIndex}]`);
  }

  // Rotation
  if (element.rotation) {
    classes.push(`rotate-[${element.rotation}deg]`);
  }

  // Background
  if (style.backgroundColor) {
    // If it's a standard hex/named color
    classes.push(`bg-[${style.backgroundColor}]`);
  }
  if (style.backgroundOpacity !== 1) {
    classes.push(`opacity-[${style.backgroundOpacity}]`);
  }

  // Text color (if not heading/input text which handles it internally)
  if (style.textColor) {
    classes.push(`text-[${style.textColor}]`);
  }

  // Border
  if (style.borderWidth > 0) {
    classes.push(`border-[${style.borderWidth}px]`);
    classes.push(`border-[${style.borderColor || '#d1d5db'}]`);
    if (style.borderStyle !== 'solid') {
      classes.push(`border-${style.borderStyle}`);
    }
  }
  if (style.borderRadius > 0) {
    classes.push(`rounded-[${style.borderRadius}px]`);
  }

  // Box Shadow
  const shadow = style.boxShadow;
  if (shadow.opacity > 0) {
    classes.push(`shadow-[${shadow.x}px_${shadow.y}px_${shadow.blur}px_${shadow.spread}px_rgba(0,0,0,${shadow.opacity})]`);
  }

  // Paddings
  const p = style.padding;
  if (p.t === p.r && p.r === p.b && p.b === p.l) {
    if (p.t > 0) classes.push(`p-[${p.t}px]`);
  } else {
    if (p.t > 0) classes.push(`pt-[${p.t}px]`);
    if (p.r > 0) classes.push(`pr-[${p.r}px]`);
    if (p.b > 0) classes.push(`pb-[${p.b}px]`);
    if (p.l > 0) classes.push(`pl-[${p.l}px]`);
  }

  // Margins
  const m = style.margin;
  if (m.t === m.r && m.r === m.b && m.b === m.l) {
    if (m.t > 0) classes.push(`m-[${m.t}px]`);
  } else {
    if (m.t !== 0) classes.push(`mt-[${m.t}px]`);
    if (m.r !== 0) classes.push(`mr-[${m.r}px]`);
    if (m.b !== 0) classes.push(`mb-[${m.b}px]`);
    if (m.l !== 0) classes.push(`ml-[${m.l}px]`);
  }

  // Display container layouts
  if (style.display === 'flex') {
    classes.push('flex');
    classes.push(style.flexDirection === 'column' ? 'flex-col' : 'flex-row');
    if (style.flexWrap === 'wrap') classes.push('flex-wrap');
    
    // Justify
    if (style.justifyContent === 'center') classes.push('justify-center');
    else if (style.justifyContent === 'flex-end') classes.push('justify-end');
    else if (style.justifyContent === 'space-between') classes.push('justify-between');
    else if (style.justifyContent === 'space-around') classes.push('justify-around');
    else if (style.justifyContent === 'space-evenly') classes.push('justify-evenly');

    // Align
    if (style.alignItems === 'center') classes.push('items-center');
    else if (style.alignItems === 'flex-start') classes.push('items-start');
    else if (style.alignItems === 'flex-end') classes.push('items-end');
    else if (style.alignItems === 'baseline') classes.push('items-baseline');
    else if (style.alignItems === 'stretch') classes.push('items-stretch');

    if (style.gap > 0) classes.push(`gap-[${style.gap}px]`);
  } else if (style.display === 'grid') {
    classes.push('grid');
    classes.push(`grid-cols-${style.gridColumns || 1}`);
    if (style.gridRows) classes.push(`grid-rows-${style.gridRows}`);
    if (style.gap > 0) classes.push(`gap-[${style.gap}px]`);
  }

  // Typography fontStyle rules
  if (props.fontFamily && props.fontFamily !== 'inherit') {
    classes.push(`font-['${props.fontFamily}']`);
  }
  if (props.fontSize && props.fontSize !== 14) {
    classes.push(`text-[${props.fontSize}px]`);
  }
  if (props.fontWeight && props.fontWeight !== 400) {
    classes.push(`font-[${props.fontWeight}]`);
  }
  if (props.lineHeight) {
    classes.push(`leading-[${props.lineHeight}]`);
  }
  if (props.letterSpacing) {
    classes.push(`tracking-[${props.letterSpacing}px]`);
  }
  if (props.textAlign) {
    classes.push(`text-${props.textAlign}`);
  }
  if (props.textDecoration && props.textDecoration !== 'none') {
    classes.push(props.textDecoration);
  }

  return classes.join(' ');
};

// ----------------------------------------------------
// 2. CORE ELEMENT JSX MARKUP RENDERER
// ----------------------------------------------------
const renderElementJSX = (
  element: CanvasElement,
  elements: CanvasElement[],
  indent: string
): string => {
  const isChild = !!element.parentId;
  const tailwindClasses = styleToTailwind(element, isChild);
  const props = element.props;

  // Gather children
  const children = elements
    .filter((el) => el.parentId === element.id && !el.hidden)
    .sort((a, b) => a.zIndex - b.zIndex);

  const nextIndent = indent + '  ';

  // Helper to build inline styles (fallback for custom fonts etc)
  const styleAttr = props.fontFamily && props.fontFamily !== 'inherit'
    ? ` style={{ fontFamily: '${props.fontFamily}' }}`
    : '';

  switch (element.type) {
    // Inputs
    case 'text-input':
    case 'password-input':
    case 'email-input':
    case 'number-input':
    case 'search-input': {
      const type = element.type.split('-')[0];
      const isSearch = element.type === 'search-input';
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}${props.label ? `<label className="block text-xs font-semibold mb-1 text-gray-700">${props.label}</label>` : ''}
${nextIndent}<div className="relative">
${nextIndent}  ${isSearch ? `<Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 opacity-40" />` : ''}
${nextIndent}  <input
${nextIndent}    type="${type === 'search' ? 'text' : type}"
${nextIndent}    placeholder="${props.placeholder || ''}"
${nextIndent}    disabled={${props.disabled || false}}
${nextIndent}    className="w-full bg-white border border-gray-300 text-xs rounded px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-indigo-500 ${props.error ? 'border-red-500 bg-red-50' : ''} ${isSearch ? 'pl-8' : ''}"
${nextIndent}  />
${nextIndent}</div>
${nextIndent}${props.helperText ? `<span className="text-[10px] block mt-1 ${props.error ? 'text-red-500' : 'text-gray-400'}">${props.helperText}</span>` : ''}
${indent}</div>`;
    }

    case 'textarea':
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}${props.label ? `<label className="block text-xs font-semibold mb-1 text-gray-700">${props.label}</label>` : ''}
${nextIndent}<textarea
${nextIndent}  placeholder="${props.placeholder || ''}"
${nextIndent}  disabled={${props.disabled || false}}
${nextIndent}  rows={3}
${nextIndent}  className="w-full bg-white border border-gray-300 text-xs rounded px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
${nextIndent}/>
${indent}</div>`;

    case 'select':
    case 'multi-select':
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}${props.label ? `<label className="block text-xs font-semibold mb-1 text-gray-700">${props.label}</label>` : ''}
${nextIndent}<div className="relative">
${nextIndent}  <select
${nextIndent}    disabled={${props.disabled || false}}
${nextIndent}    className="w-full bg-white border border-gray-300 text-xs rounded px-3 py-2 text-black appearance-none focus:outline-none"
${nextIndent}  >
${nextIndent}    <option value="">${props.placeholder || 'Select option...'}</option>
${nextIndent}    ${(props.options || []).map((o) => `<option value="${o}">${o}</option>`).join(`\n${nextIndent}    `)}
${nextIndent}  </select>
${nextIndent}  <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 opacity-50 text-gray-500 pointer-events-none" />
${nextIndent}</div>
${indent}</div>`;

    case 'checkbox':
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}<label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
${nextIndent}  <input type="checkbox" defaultChecked={${props.checked || false}} disabled={${props.disabled || false}} className="accent-indigo-600 w-4 h-4" />
${nextIndent}  <span>${props.text || 'Checkbox label'}</span>
${nextIndent}</label>
${indent}</div>`;

    case 'toggle-switch':
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}<div className="flex items-center justify-between w-full">
${nextIndent}  <span className="text-xs font-medium">${props.text || 'Toggle label'}</span>
${nextIndent}  <button className="w-8 h-4.5 flex items-center rounded-full p-0.5 ${props.checked ? 'bg-indigo-600' : 'bg-gray-300'}">
${nextIndent}    <div className="bg-white w-3.5 h-3.5 rounded-full shadow transform duration-200 ${props.checked ? 'translate-x-3.5' : 'translate-x-0'}" />
${nextIndent}  </button>
${nextIndent}</div>
${indent}</div>`;

    case 'radio-group':
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}${props.text ? `<span className="block text-xs font-semibold mb-2 text-gray-700">${props.text}</span>` : ''}
${nextIndent}<div className="space-y-1.5">
${nextIndent}  ${(props.options || []).map((o, idx) => `<label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
${nextIndent}    <input type="radio" name="radio-${element.id}" defaultChecked={${idx === 0}} className="accent-indigo-600" />
${nextIndent}    <span>${o}</span>
${nextIndent}  </label>`).join(`\n${nextIndent}  `)}
${nextIndent}</div>
${indent}</div>`;

    case 'slider':
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}${props.text ? `<span className="block text-xs font-medium mb-1 text-gray-700">${props.text}</span>` : ''}
${nextIndent}<input type="range" className="w-full accent-indigo-600" />
${indent}</div>`;

    case 'date-picker':
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}${props.label ? `<label className="block text-xs font-semibold mb-1 text-gray-700">${props.label}</label>` : ''}
${nextIndent}<div className="relative">
${nextIndent}  <input type="date" className="w-full bg-white border border-gray-300 text-xs rounded px-3 py-2 text-black focus:outline-none" />
${nextIndent}</div>
${indent}</div>`;

    case 'file-upload':
      return `${indent}<div className="${tailwindClasses}"${styleAttr}>
${nextIndent}<div className="w-full flex flex-col justify-center items-center border border-dashed border-gray-300 bg-gray-50 rounded-lg p-3 text-center">
${nextIndent}  <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
${nextIndent}  <span className="text-xs font-semibold text-gray-600">${props.label || 'Upload File'}</span>
${nextIndent}  <span className="text-[10px] text-gray-400 mt-0.5">${props.placeholder || 'Release file here'}</span>
${nextIndent}</div>
${indent}</div>`;

    // Buttons
    case 'primary-btn':
    case 'secondary-btn':
    case 'outline-btn':
    case 'ghost-btn': {
      const isLeft = props.iconPosition !== 'right';
      const iconMarkup = props.iconName ? `<${props.iconName} className="w-3.5 h-3.5" />` : '';
      return `${indent}<button className="${tailwindClasses}">
${nextIndent}${props.loading ? '<Loader2 className="w-3.5 h-3.5 animate-spin" />' : isLeft ? iconMarkup : ''}
${nextIndent}<span>${props.text || 'Button'}</span>
${nextIndent}${!props.loading && !isLeft ? iconMarkup : ''}
${indent}</button>`;
    }

    case 'icon-btn':
      return `${indent}<button className="${tailwindClasses}">
${nextIndent}<${props.iconName || 'Star'} className="w-5 h-5" />
${indent}</button>`;

    case 'btn-group':
      return `${indent}<div className="${tailwindClasses}">
${nextIndent}${(props.options || []).map((o) => `<button className="flex-1 py-1 text-center font-semibold text-xs border-r border-gray-200 last:border-r-0 hover:bg-gray-50">${o}</button>`).join(`\n${nextIndent}`)}
${indent}</div>`;

    case 'fab':
      return `${indent}<button className="${tailwindClasses} flex items-center justify-center shadow-lg text-white">
${nextIndent}<${props.iconName || 'Plus'} className="w-5 h-5" />
${indent}</button>`;

    // Display
    case 'heading':
      return `${indent}<h2 className="${tailwindClasses}">${props.text || 'Heading'}</h2>`;
    case 'paragraph':
      return `${indent}<p className="${tailwindClasses}">${props.text || 'Paragraph body content.'}</p>`;
    case 'label':
      return `${indent}<span className="${tailwindClasses}">${props.text || 'Label text'}</span>`;
    case 'badge':
      return `${indent}<span className="${tailwindClasses} flex items-center justify-center font-bold text-[10px] rounded-full uppercase px-2">${props.text || 'New'}</span>`;
    case 'tag':
      return `${indent}<span className="${tailwindClasses} flex items-center justify-center font-medium text-[10px] rounded px-1.5 border border-indigo-400/20">${props.text || 'Tag'}</span>`;
    case 'avatar':
      return `${indent}<div className="${tailwindClasses} overflow-hidden rounded-full border border-gray-200">
${nextIndent}${props.imageUrl ? `<img src="${props.imageUrl}" alt="Avatar" className="w-full h-full object-cover" />` : '<div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">JD</div>'}
${indent}</div>`;

    case 'avatar-group':
      return `${indent}<div className="${tailwindClasses} flex -space-x-2.5 items-center">
${nextIndent}<div className="w-7 h-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">JD</div>
${nextIndent}<div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">MS</div>
${nextIndent}<div className="w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">TL</div>
${indent}</div>`;

    case 'icon':
      return `${indent}<div className="${tailwindClasses}">
${nextIndent}<${props.iconName || 'Star'} className="w-full h-full" />
${indent}</div>`;

    case 'divider':
      return `${indent}<hr className="${tailwindClasses} border-t border-gray-200" />`;
    case 'spacer':
      return `${indent}<div className="${tailwindClasses}"></div>`;
    case 'progress-bar': {
      const val = parseInt(props.text || '45') || 0;
      return `${indent}<div className="${tailwindClasses}">
${nextIndent}<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden p-0.5 border border-gray-300">
${nextIndent}  <div className="bg-indigo-600 h-full rounded-full flex items-center justify-end px-1" style={{ width: '${val}%' }}>
${nextIndent}    ${props.checked ? `<span className="text-[7px] text-white font-extrabold">${val}%</span>` : ''}
${nextIndent}  </div>
${nextIndent}</div>
${indent}</div>`;
    }

    case 'spinner':
      return `${indent}<div className="${tailwindClasses} flex items-center justify-center">
${nextIndent}<Loader2 className="w-full h-full animate-spin text-indigo-600" />
${indent}</div>`;

    case 'tooltip':
      return `${indent}<div className="${tailwindClasses} relative group flex items-center justify-center">
${nextIndent}<div className="border border-gray-300 rounded px-3 py-1 cursor-help hover:bg-gray-50 flex items-center gap-1">
${nextIndent}  <HelpCircle className="w-3.5 h-3.5 opacity-60" />
${nextIndent}  <span className="text-xs text-gray-700 font-medium">${props.text || 'Tooltip'}</span>
${nextIndent}</div>
${nextIndent}<div className="absolute bottom-full mb-1.5 hidden group-hover:block bg-gray-900 border border-gray-800 text-white text-[9px] py-1 px-2 rounded whitespace-nowrap shadow-md z-[9999]">
${nextIndent}  ${props.helperText || 'Help details'}
${nextIndent}</div>
${indent}</div>`;

    case 'image-placeholder':
      return `${indent}<div className="${tailwindClasses} bg-gray-100 flex flex-col items-center justify-center border border-gray-200 rounded text-center">
${nextIndent}<Image className="w-8 h-8 text-gray-400 mb-1" />
${nextIndent}<span className="text-[10px] text-gray-400 font-semibold">Image Placeholder</span>
${indent}</div>`;

    // Cards & Complex Layout Blocks
    case 'card':
      return `${indent}<div className="${tailwindClasses}">
${nextIndent}<h4 className="text-xs font-bold text-gray-900 mb-1">Card Title</h4>
${nextIndent}<p className="text-[11px] text-gray-500 mb-2.5">Lorem ipsum description details.</p>
${nextIndent}<div className="space-y-2">
${children.map((child) => renderElementJSX(child, elements, nextIndent + '  ')).join('\n')}
${nextIndent}</div>
${indent}</div>`;

    case 'profile-card':
      return `${indent}<div className="${tailwindClasses} flex flex-col items-center justify-center text-center p-3">
${nextIndent}<div className="w-14 h-14 rounded-full bg-indigo-100 mb-2 overflow-hidden shrink-0 border border-indigo-200">
${nextIndent}  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
${nextIndent}</div>
${nextIndent}<h4 className="text-xs font-bold text-gray-950">Alexa Carter</h4>
${nextIndent}<p className="text-[10px] text-gray-500 font-medium mb-3">Senior Product Designer</p>
${nextIndent}<button className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-full shadow">Follow</button>
${indent}</div>`;

    case 'stats-card':
      return `${indent}<div className="${tailwindClasses} flex flex-col justify-between text-left">
${nextIndent}<span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Monthly Revenue</span>
${nextIndent}<div className="flex items-baseline gap-1.5 mt-1">
${nextIndent}  <span className="text-lg font-black text-gray-900">$12,482</span>
${nextIndent}  <span className="text-[9px] font-bold text-green-500">+14.2%</span>
${nextIndent}</div>
${nextIndent}<span className="text-[8px] text-gray-400 mt-2 block">Since last billing cycle</span>
${indent}</div>`;

    case 'pricing-card':
      return `${indent}<div className="${tailwindClasses} flex flex-col justify-between items-center text-center p-4">
${nextIndent}<div className="space-y-1">
${nextIndent}  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[8px] font-extrabold rounded-full uppercase tracking-wider">Popular Choice</span>
${nextIndent}  <h4 className="text-sm font-extrabold text-gray-900 mt-1">Professional Plan</h4>
${nextIndent}  <div className="flex items-baseline justify-center gap-0.5 mt-2">
${nextIndent}    <span className="text-2xl font-black text-gray-950">$39</span>
${nextIndent}    <span className="text-[9px] text-gray-500 font-bold uppercase">/ mo</span>
${nextIndent}  </div>
${nextIndent}</div>
${nextIndent}<ul className="text-[10px] text-gray-600 space-y-1 my-4 text-left w-full border-t border-gray-100 pt-3">
${nextIndent}  <li>✓ Unlimited cloud designs</li>
${nextIndent}  <li>✓ 10 React components exports</li>
${nextIndent}  <li>✓ 24/7 dedicated support</li>
${nextIndent}</ul>
${nextIndent}<button className="w-full py-1.5 bg-indigo-600 text-white font-bold text-[10px] rounded shadow hover:bg-indigo-500 uppercase tracking-wider">Get Started</button>
${indent}</div>`;

    case 'alert':
      return `${indent}<div className="${tailwindClasses} flex items-center gap-2 text-left bg-amber-50 text-amber-900 border-amber-200">
${nextIndent}<AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
${nextIndent}<div className="flex-1 min-w-0">
${nextIndent}  <span className="font-bold text-xs block leading-none">${props.text || 'Alert warning'}</span>
${nextIndent}  <span className="text-[9px] opacity-75 mt-0.5 block">Warning: unsaved changes detected.</span>
${nextIndent}</div>
${indent}</div>`;

    case 'notification':
      return `${indent}<div className="${tailwindClasses} flex items-center gap-2.5 text-left">
${nextIndent}<div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
${nextIndent}  <Bell className="w-3.5 h-3.5" />
${nextIndent}</div>
${nextIndent}<div className="flex-1 min-w-0 leading-tight">
${nextIndent}  <span className="font-bold text-[10px] text-gray-900 block">Email Verified</span>
${nextIndent}  <span className="text-[9px] text-gray-400 block truncate">Welcome aboard, designer!</span>
${nextIndent}</div>
${indent}</div>`;

    case 'empty-state':
      return `${indent}<div className="${tailwindClasses} flex flex-col items-center justify-center text-center p-4">
${nextIndent}<FolderOpen className="w-8 h-8 text-gray-300 mb-1" />
${nextIndent}<h5 className="text-[11px] font-bold text-gray-800">No projects found</h5>
${nextIndent}<p className="text-[9px] text-gray-400 mt-0.5 leading-relaxed max-w-[180px]">Create a new design file to populate data.</p>
${indent}</div>`;

    case 'list-item':
      return `${indent}<div className="${tailwindClasses} flex items-center justify-between border-b border-gray-100 px-1">
${nextIndent}<div className="flex items-center gap-2">
${nextIndent}  <div className="w-2 h-2 rounded-full bg-indigo-600" />
${nextIndent}  <span className="text-xs font-semibold text-gray-800">Dashboard List Item Row</span>
${nextIndent}</div>
${nextIndent}<ChevronRight className="w-3.5 h-3.5 opacity-40" />
${indent}</div>`;

    case 'table': {
      const columns = props.columns || ['Name', 'Role', 'Status'];
      const rows = props.rows || [['John Doe', 'Dev', 'Active']];
      return `${indent}<div className="${tailwindClasses} overflow-x-auto select-none bg-white rounded border border-gray-200">
${nextIndent}<table className="w-full text-left text-[10px] text-gray-600 border-collapse">
${nextIndent}  <thead>
${nextIndent}    <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[8px] tracking-wider text-gray-500">
${nextIndent}      ${columns.map((c) => `<th className="px-3 py-1.5">${c}</th>`).join(`\n${nextIndent}      `)}
${nextIndent}    </tr>
${nextIndent}  </thead>
${nextIndent}  <tbody className="divide-y divide-gray-100">
${nextIndent}    ${rows.map((row) => `<tr className="hover:bg-gray-50/60">
${nextIndent}      ${row.map((cell) => `<td className="px-3 py-1.5 font-medium">${cell}</td>`).join(`\n${nextIndent}      `)}
${nextIndent}    </tr>`).join(`\n${nextIndent}    `)}
${nextIndent}  </tbody>
${nextIndent}</table>
${indent}</div>`;
    }

    case 'accordion':
      return `${indent}<div className="${tailwindClasses} bg-white border border-gray-200 rounded overflow-hidden">
${nextIndent}<div className="px-3 py-2 bg-gray-50 flex items-center justify-between border-b border-gray-200 cursor-pointer">
${nextIndent}  <span className="text-xs font-bold text-gray-900">${props.text || 'Accordion Header'}</span>
${nextIndent}  <ChevronDown className="w-3.5 h-3.5 opacity-55" />
${nextIndent}</div>
${nextIndent}<div className="p-3 text-[10px] text-gray-500 leading-normal border-t border-gray-100">
${nextIndent}  {/* Expanded body content */}
${nextIndent}  ${props.helperText || 'Accordion collapsed panel content.'}
${nextIndent}</div>
${indent}</div>`;

    // Shapes
    case 'rect':
    case 'rounded-rect':
    case 'circle':
      return `${indent}<div className="${tailwindClasses}"></div>`;
    case 'triangle':
      return `${indent}<svg className="${tailwindClasses} fill-current" viewBox="0 0 24 24">
${nextIndent}<path d="M12 2L2 22h20L12 2z" />
${indent}</svg>`;
    case 'line':
      return `${indent}<div className="${tailwindClasses} h-[2px] bg-gray-400"></div>`;

    // Layout Containers (Flex/Grid)
    default:
      if (isContainer(element.type)) {
        return `${indent}<div className="${tailwindClasses}">
${children.map((child) => renderElementJSX(child, elements, nextIndent)).join('\n')}
${indent}</div>`;
      }
      return `${indent}<div className="${tailwindClasses}">${element.name}</div>`;
  }
};

// ----------------------------------------------------
// 3. IDENTIFY ALL DYNAMIC LUCIDE ICONS USED
// ----------------------------------------------------
const collectLucideImports = (elements: CanvasElement[]): string[] => {
  const icons = new Set<string>();

  // Add layout icons we use statically in templates
  icons.add('Search');
  icons.add('ChevronDown');
  icons.add('UploadCloud');
  icons.add('Loader2');
  icons.add('Plus');
  icons.add('Star');
  icons.add('Image');
  icons.add('AlertCircle');
  icons.add('Bell');
  icons.add('FolderOpen');
  icons.add('ChevronRight');
  icons.add('HelpCircle');

  // Add custom icons chosen by the user in buttons
  elements.forEach((el) => {
    if (el.props.iconName) {
      icons.add(el.props.iconName);
    }
  });

  return Array.from(icons);
};

// ----------------------------------------------------
// 4. MAIN EXPORTER ENTRYPOINT
// ----------------------------------------------------
export const generateReactCode = (
  elements: CanvasElement[],
  format: 'tailwind' | 'styled-components' | 'html-css'
): string => {
  const rootElements = elements
    .filter((el) => !el.parentId && !el.hidden)
    .sort((a, b) => a.zIndex - b.zIndex);

  const iconsUsed = collectLucideImports(elements);
  const lucideImportLine = `import { ${iconsUsed.join(', ')} } from 'lucide-react';`;

  if (format === 'tailwind') {
    const componentJSX = rootElements
      .map((el) => renderElementJSX(el, elements, '    '))
      .join('\n\n');

    return `import React from 'react';
${lucideImportLine}

export default function ExportedComponent() {
  return (
    <div className="relative w-full h-[600px] bg-[#f8fafc] overflow-hidden border border-gray-200/50 rounded-lg">
${componentJSX}
    </div>
  );
}
`;
  }

  if (format === 'styled-components') {
    // Basic styled components generator mapping elements to styled blocks
    const styledBlocks: string[] = [];
    const elementsMapping: { [id: string]: string } = {};

    elements.forEach((el, index) => {
      const name = `Styled_${el.type.replace('-', '_')}_${index}`;
      elementsMapping[el.id] = name;

      const style = el.style;
      const isChild = !!el.parentId;

      const shadow = style.boxShadow;
      const shadowStr = shadow.opacity > 0
        ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(0, 0, 0, ${shadow.opacity})`
        : 'none';

      let extraRules = '';
      if (style.display === 'flex') {
        extraRules += `  display: flex;\n  flex-direction: ${style.flexDirection || 'row'};\n  flex-wrap: ${style.flexWrap || 'nowrap'};\n  justify-content: ${style.justifyContent || 'flex-start'};\n  align-items: ${style.alignItems || 'stretch'};\n  gap: ${style.gap}px;`;
      } else if (style.display === 'grid') {
        extraRules += `  display: grid;\n  grid-template-columns: repeat(${style.gridColumns || 1}, minmax(0, 1fr));\n  gap: ${style.gap}px;`;
      }

      styledBlocks.push(`const ${name} = styled.div\`
  position: ${isChild ? 'relative' : 'absolute'};
  ${isChild ? '' : `left: ${el.x}px;\n  top: ${el.y}px;\n  width: ${el.width}px;\n  height: ${el.height}px;`}
  z-index: ${el.zIndex};
  background-color: ${style.backgroundColor};
  opacity: ${style.backgroundOpacity};
  border-width: ${style.borderWidth}px;
  border-style: ${style.borderStyle};
  border-color: ${style.borderColor};
  border-radius: ${style.borderRadius}px;
  box-shadow: ${shadowStr};
  padding: ${style.padding.t}px ${style.padding.r}px ${style.padding.b}px ${style.padding.l}px;
  margin: ${style.margin.t}px ${style.margin.r}px ${style.margin.b}px ${style.margin.l}px;
${extraRules}
\`;`);
    });

    const renderStyledJSX = (el: CanvasElement, indent: string): string => {
      const tag = elementsMapping[el.id];
      const children = elements.filter((child) => child.parentId === el.id && !child.hidden);
      const nextIndent = indent + '  ';

      if (children.length > 0) {
        return `${indent}<${tag}>
${children.map((c) => renderStyledJSX(c, nextIndent)).join('\n')}
${indent}</${tag}>`;
      }
      return `${indent}<${tag}>
${nextIndent}{/* Component content details inside here */}
${nextIndent}${el.props.text || el.name}
${indent}</${tag}>`;
    };

    const styledJSX = rootElements.map((el) => renderStyledJSX(el, '    ')).join('\n\n');

    return `import React from 'react';
import styled from 'styled-components';
${lucideImportLine}

export default function ExportedStyledComponent() {
  return (
    <ContainerWrapper>
${styledJSX}
    </ContainerWrapper>
  );
}

const ContainerWrapper = styled.div\`
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #f8fafc;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
\`;

${styledBlocks.join('\n\n')}
`;
  }

  // Fallback: HTML5 + CSS format
  if (format === 'html-css') {
    const cssRules: string[] = [];
    
    const renderHTML = (el: CanvasElement, indent: string): string => {
      const className = `${el.type}-${el.id.substring(0, 4)}`;
      const style = el.style;
      const isChild = !!el.parentId;
      const shadow = style.boxShadow;
      const shadowStr = shadow.opacity > 0
        ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(0, 0, 0, ${shadow.opacity})`
        : 'none';

      let css = `.${className} {
  position: ${isChild ? 'relative' : 'absolute'};
  ${isChild ? '' : `left: ${el.x}px;\n  top: ${el.y}px;\n  width: ${el.width}px;\n  height: ${el.height}px;`}
  background-color: ${style.backgroundColor};
  opacity: ${style.backgroundOpacity};
  border: ${style.borderWidth}px ${style.borderStyle} ${style.borderColor};
  border-radius: ${style.borderRadius}px;
  box-shadow: ${shadowStr};
  padding: ${style.padding.t}px ${style.padding.r}px ${style.padding.b}px ${style.padding.l}px;
  margin: ${style.margin.t}px ${style.margin.r}px ${style.margin.b}px ${style.margin.l}px;
`;
      if (style.display === 'flex') {
        css += `  display: flex;\n  flex-direction: ${style.flexDirection};\n  flex-wrap: ${style.flexWrap};\n  justify-content: ${style.justifyContent};\n  align-items: ${style.alignItems};\n  gap: ${style.gap}px;\n`;
      } else if (style.display === 'grid') {
        css += `  display: grid;\n  grid-template-columns: repeat(${style.gridColumns || 1}, minmax(0, 1fr));\n  gap: ${style.gap}px;\n`;
      }
      css += `}`;
      cssRules.push(css);

      const children = elements.filter((child) => child.parentId === el.id && !child.hidden);
      const nextIndent = indent + '  ';

      if (children.length > 0) {
        return `${indent}<div class="${className}">
${children.map((c) => renderHTML(c, nextIndent)).join('\n')}
${indent}</div>`;
      }
      return `${indent}<div class="${className}">${el.props.text || el.name}</div>`;
    };

    const htmlBody = rootElements.map((el) => renderHTML(el, '    ')).join('\n\n');

    return `<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Exported Layout</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="canvas-wrapper">
${htmlBody}
  </div>
</body>
</html>

/* ======================================= */
/* style.css */
/* ======================================= */
.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #f8fafc;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

${cssRules.join('\n\n')}
`;
  }

  return '';
};
