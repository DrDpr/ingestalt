import React, { memo } from 'react';
import { FileText } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const OtherNode = memo(({ id, data, isStatic }: { id: string, data: any, isStatic?: boolean }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      icon={<FileText size={16} className="text-neutral-400" />}
      colorClass="border-input bg-card/80 text-neutral-100"
      isStatic={isStatic}
    />
  );
});
