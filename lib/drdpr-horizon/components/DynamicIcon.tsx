'use client';

import React, { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type IconName = keyof typeof LucideIcons;

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  fallback?: IconName;
}

/**
 * DynamicIcon - Renders any valid Lucide icon by name
 *
 * Converts string icon names to actual Lucide icon components.
 * Supports all Lucide icons without hardcoded mapping.
 *
 * @param name - Icon name (case-insensitive, auto-normalized to PascalCase)
 * @param size - Icon size in pixels (default: 16)
 * @param className - Additional CSS classes
 * @param style - Inline styles
 * @param fallback - Fallback icon name if primary not found (default: 'Box')
 * @param ...props - Additional Lucide icon props (color, strokeWidth, etc.)
 *
 * @example
 * <DynamicIcon name="database" size={24} />
 * <DynamicIcon name="Settings" className="text-blue-500" />
 * <DynamicIcon name="invalid-icon" fallback="HelpCircle" />
 */
export const DynamicIcon = ({
  name,
  size = 16,
  className = "",
  style = {},
  fallback = 'Box',
  ...props
}: DynamicIconProps) => {
  const IconComponent = useMemo(() => {
    // Normalize icon name to PascalCase
    const normalizedName = name
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') as IconName;
    
    // Try to get icon from lucide-react
    const Icon = LucideIcons[normalizedName] as LucideIcon | undefined;
    
    if (Icon) {
      return Icon;
    }
    
    // Fallback icon
    const FallbackIcon = LucideIcons[fallback] as LucideIcon | undefined;
    
    if (!FallbackIcon) {
      console.warn(`[DynamicIcon] Neither "${normalizedName}" nor fallback "${fallback}" found. Using Box.`);
      return LucideIcons.Box;
    }
    
    console.warn(`[DynamicIcon] Icon "${normalizedName}" not found. Using fallback "${fallback}".`);
    return FallbackIcon;
  }, [name, fallback]);
  
  return <IconComponent size={size} className={className} style={style} {...props} />;
};

/**
 * Helper to check if icon name is valid
 */
export const isValidIconName = (name: string): boolean => {
  const normalizedName = name
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  return normalizedName in LucideIcons;
};

/**
 * Get all available icon names
 */
export const getAvailableIcons = (): string[] => {
  return Object.keys(LucideIcons).filter(
    key => typeof LucideIcons[key as IconName] === 'function'
  );
};
