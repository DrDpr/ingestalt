import React, { memo } from 'react';
import { Layout } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const FrontendNode = memo(({ id, data, isStatic }: { id: string, data: any, isStatic?: boolean }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      icon={<Layout size={16} className="text-purple-400" />}
      colorClass="border-purple-500 bg-purple-950/80 text-purple-100"
      isStatic={isStatic}
    />
  );
});
