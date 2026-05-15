import { 
  Database, 
  Network, 
  Layout, 
  Box, 
  ShieldAlert, 
  FileText, 
  HelpCircle,
  Cpu,
  Layers,
  Zap,
  Anchor,
  Compass,
  RefreshCw,
  Share2,
  Trash2,
  X,
  Edit2,
  Eye,
  Settings2,
  Plus,
  Search,
  Code2
} from 'lucide-react';
import React from 'react';

// Explicitly mapping icons prevents tree-shaking from removing them
const ICON_MAP: Record<string, any> = {
  Database,
  Network,
  Layout,
  Box,
  ShieldAlert,
  FileText,
  HelpCircle,
  Cpu,
  Layers,
  Zap,
  Anchor,
  Compass,
  RefreshCw,
  Share2,
  Trash2,
  X,
  Edit2,
  Eye,
  Settings2,
  Plus,
  Search,
  Code2
};

export const DynamicIcon = ({ 
  name, 
  size = 16, 
  className = "", 
  style = {} 
}: { 
  name: string, 
  size?: number, 
  className?: string,
  style?: React.CSSProperties 
}) => {
  const normalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = ICON_MAP[normalizedName] || ICON_MAP['Box'];
  
  if (!ICON_MAP[normalizedName]) {
    console.warn(`[DynamicIcon] Icon "${normalizedName}" not in explicit map. Falling back to Box.`);
  }
  
  return <IconComponent size={size} className={className} style={style} />;
};
