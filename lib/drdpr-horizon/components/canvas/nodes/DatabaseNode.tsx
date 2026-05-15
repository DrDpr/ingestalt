import React, { memo } from 'react';
import { Database } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const DatabaseNode = memo(({ id, data, isStatic }: { id: string, data: any, isStatic?: boolean }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      icon={<Database size={16} className="text-blue-400" />}
      colorClass="border-blue-500 bg-blue-950/80 text-blue-100"
      isStatic={isStatic}
    />
  );
});
