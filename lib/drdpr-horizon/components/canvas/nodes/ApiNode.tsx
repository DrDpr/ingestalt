import React, { memo } from 'react';
import { Network } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const ApiNode = memo(({ id, data, isStatic }: { id: string, data: any, isStatic?: boolean }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      icon={<Network size={16} className="text-green-400" />}
      colorClass="border-green-500 bg-green-950/80 text-green-100"
      isStatic={isStatic}
    />
  );
});
