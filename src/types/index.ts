export type ComponentType =
  // Form Elements
  | 'text-input'
  | 'password-input'
  | 'email-input'
  | 'number-input'
  | 'textarea'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'radio-group'
  | 'toggle-switch'
  | 'slider'
  | 'date-picker'
  | 'file-upload'
  | 'search-input'
  // Buttons
  | 'primary-btn'
  | 'secondary-btn'
  | 'outline-btn'
  | 'ghost-btn'
  | 'icon-btn'
  | 'btn-group'
  | 'fab'
  // Display Elements
  | 'heading'
  | 'paragraph'
  | 'label'
  | 'badge'
  | 'tag'
  | 'avatar'
  | 'avatar-group'
  | 'icon'
  | 'divider'
  | 'spacer'
  | 'progress-bar'
  | 'spinner'
  | 'tooltip'
  | 'image-placeholder'
  // Cards & Containers
  | 'card'
  | 'profile-card'
  | 'stats-card'
  | 'pricing-card'
  | 'alert'
  | 'notification'
  | 'empty-state'
  | 'list-item'
  | 'table'
  | 'accordion'
  // Layout
  | 'container-1col'
  | 'container-2col'
  | 'container-3col'
  | 'container-4col'
  | 'flex-row'
  | 'flex-col'
  | 'hero'
  | 'split-50-50'
  | 'layout-hcf'
  | 'layout-sm'
  | 'modal-overlay'
  | 'drawer'
  // Shapes
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'rounded-rect'
  | 'line';

export interface ShadowConfig {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

export interface StyleProps {
  backgroundColor: string;
  backgroundOpacity: number;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderRadius: number;
  boxShadow: ShadowConfig;
  opacity: number;
  padding: { t: number; r: number; b: number; l: number };
  margin: { t: number; r: number; b: number; l: number };
  
  // Layout flex/grid properties
  display: 'block' | 'flex' | 'grid';
  flexDirection: 'row' | 'column';
  flexWrap: 'nowrap' | 'wrap';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  gap: number;
  gridColumns: number;
  gridRows: number;
}

export interface ComponentProps {
  text?: string;
  placeholder?: string;
  options?: string[];
  checked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  fontSize?: number;
  fontFamily?: 'Inter' | 'Roboto' | 'Poppins' | 'Nunito' | 'Playfair Display' | 'monospace' | 'inherit';
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  iconName?: string;
  iconPosition?: 'left' | 'right';
  imageUrl?: string;
  color?: string;
  
  // Custom props
  columns?: string[];
  rows?: any[][];
  striped?: boolean;
  bordered?: boolean;
  
  // Container props
  padding?: number;
  elevation?: number;
  clickable?: boolean;
  
  // Form fields
  label?: string;
  helperText?: string;
  error?: boolean;

  // Interaction triggers
  clickAction?: {
    type: 'show' | 'hide' | 'alert' | 'none';
    targetId?: string;
    value?: string; // Alert message
  };
}

export interface CanvasElement {
  id: string;
  name: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  groupId?: string;
  parentId?: string; // For elements placed inside layouts
  props: ComponentProps;
  style: StyleProps;
}
