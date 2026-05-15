'use client';

import React from 'react';
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout';
import { HorizonCanvas } from '@/components/canvas/HorizonCanvas';
import { Inspector } from '@/components/inspector/Inspector';
import { Toolbar } from '@/components/layout/Toolbar';

import { ReactFlowProvider } from '@xyflow/react';

export default function Home() {
  const canvasComponent = React.useMemo(() => (
    <ReactFlowProvider>
      <HorizonCanvas />
    </ReactFlowProvider>
  ), []);
  const inspectorComponent = React.useMemo(() => <Inspector />, []);

  return (
    <main className="w-full h-screen relative bg-neutral-950">
      <div className="pb-2"><Toolbar/></div>

      <WorkspaceLayout 
        canvas={canvasComponent} 
        inspector={inspectorComponent} 
      />
    </main>
  );
}
