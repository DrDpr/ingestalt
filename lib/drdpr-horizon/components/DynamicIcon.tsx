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
    // 1. Try a direct match first (this fixes the PascalCase issue)
    let Icon = LucideIcons[name as IconName];
    
    // 2. If not found, try to normalize (for kebab-case or lowercase inputs)
    if (!Icon) {
      const normalizedName = name
        .split(/[-_\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('') as IconName;
      Icon = LucideIcons[normalizedName];
    }
    
    // 3. Validate and Return
    if (Icon && (typeof Icon === 'function' || typeof Icon === 'object')) {
      return Icon as React.ComponentType<LucideProps>;
    }
    
    const FallbackIcon = LucideIcons[fallback];
    
    if (FallbackIcon && (typeof FallbackIcon === 'function' || typeof FallbackIcon === 'object')) {
      console.warn(`[DynamicIcon] Icon "${name}" not found. Using fallback "${fallback}".`);
      return FallbackIcon as React.ComponentType<LucideProps>;
    }
    
    console.warn(`[DynamicIcon] Neither "${name}" nor fallback "${fallback}" found. Using Box.`);
    return LucideIcons.Box as React.ComponentType<LucideProps>;
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
  const excludeList = ['createLucideIcon', 'Icon', 'icons', 'default', 'LucideIcon'];
  
  return Object.keys(LucideIcons).filter(key => {
    if (excludeList.includes(key)) return false;
    
    // Icons always start with Uppercase
    if (key.charAt(0) !== key.charAt(0).toUpperCase()) return false;

    const value = LucideIcons[key as IconName];
    
    // Stricter check: Most icons in modern Lucide are objects with a specific 
    // displayName or are simple functions.
    const isRenderable = value && (
      (typeof value === 'function') || 
      (typeof value === 'object' && (value as any).displayName)
    );
    
    return isRenderable;
  });
};
