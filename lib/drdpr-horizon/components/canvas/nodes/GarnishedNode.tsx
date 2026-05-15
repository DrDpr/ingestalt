'use client';

import React, { memo } from 'react';
import { BaseNode } from './BaseNode';
import { DynamicIcon } from '@/components/DynamicIcon';

export const GarnishedNode = memo(({ id, data, isStatic }: { id: string, data: any, isStatic?: boolean }) => {
  // These properties are now dynamically injected by the Standards Engine in HorizonCanvas
  const { icon = 'Box', color = '#52525b' } = data;

  return (
    <BaseNode 
      id={id} 
      data={data} 
      icon={<DynamicIcon name={icon} size={16} style={{ color }} />}
      colorClass="" // We'll use inline styles for the dynamic color
      style={{ 
        borderColor: `${color}80`, // 50% opacity
        backgroundColor: `${color}10`, // 10% opacity
      }}
      isStatic={isStatic}
    />
  );
});
