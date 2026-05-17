'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, FolderOpen, BookOpen, ArrowRight, Layers, FileText, Zap } from 'lucide-react';
import { connectAndStoreFolder, getStoredFolderHandle } from '@/lib/drdpr-horizon/lib/ingest-fsa';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';

export function WelcomeOnboarding() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const setGuideOpen = useUIStore((state) => state.setGuideOpen);

  useEffect(() => {
    setMounted(true);
    const checkOnboarding = async () => {
      try {
        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem('ingestalt_onboarding_complete');
        
        // Also check if a folder is already connected (don't annoy returning users)
        const existingHandle = await getStoredFolderHandle();
        
        if (!hasSeenOnboarding && !existingHandle) {
          // Small delay for better UX
          setTimeout(() => setShow(true), 1200);
        }
      } catch (e) {
        console.warn('Storage access issue in onboarding:', e);
      }
    };
    checkOnboarding();
  }, []);

  const handleConnectFolder = async () => {
    try {
      await connectAndStoreFolder();
      localStorage.setItem('ingestalt_onboarding_complete', 'true');
    } catch (e) {}
    setShow(false);
  };

  const handleOpenGuide = () => {
    try {
      localStorage.setItem('ingestalt_onboarding_complete', 'true');
    } catch (e) {}
    setShow(false);
    setGuideOpen(true);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('ingestalt_onboarding_complete', 'true');
    } catch (e) {}
    setShow(false);
  };

  if (!mounted || !show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 font-mono uppercase text-xs tracking-wider select-none text-foreground">
      {/* Stark Technical Background Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl border border-border/20 bg-background p-8 md:p-10 shadow-2xl flex flex-col gap-6 overflow-hidden rounded-none"
      >
        {/* Left emerald line accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-xs tracking-widest text-emerald-500 font-black">INGESTALT // WORKSPACE_INITIALIZATION</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black tracking-widest leading-none text-foreground/90 uppercase">
            WELCOME TO INGESTALT
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xl mt-3">
            YOUR SPATIAL EDITORIAL ENVIRONMENT IS READY. INGESTALT BREEZINGLY MAPS CONNOTATIVE MARKDOWN NOTES INTO VISUALLY DRAWN BLUEPRINTS FOR SOFTWARE ARCHITECTURE.
          </p>
        </div>

        {/* 3 Step Visual Map */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border/10 py-6 my-2 bg-secondary/[0.01]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-foreground/45" />
              <span className="font-black text-xs text-foreground">01 // CODE FILES</span>
            </div>
            <span className="text-xs text-muted-foreground leading-normal">
              CONNECT A FOLDER CONTAINING YOUR MARKDOWN NOTES (.MD) FROM LOCAL DISK.
            </span>
          </div>

          <div className="flex flex-col gap-2 border-t sm:border-t-0 sm:border-l border-border/10 pt-4 sm:pt-0 sm:pl-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-foreground/45" />
              <span className="font-black text-xs text-foreground">02 // CANVAS MAP</span>
            </div>
            <span className="text-xs text-muted-foreground leading-normal">
              Nodes are positioned on the visual canvas. Drag nodes and draw relationships.
            </span>
          </div>

          <div className="flex flex-col gap-2 border-t sm:border-t-0 sm:border-l border-border/10 pt-4 sm:pt-0 sm:pl-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-foreground/45" />
              <span className="font-black text-xs text-foreground">03 // AI INJECTION</span>
            </div>
            <span className="text-xs text-muted-foreground leading-normal">
              Compile granular markdown contexts into prompt blocks to feed AI IDE assistants.
            </span>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConnectFolder}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-black text-xs py-4 px-6 rounded-none flex items-center justify-center gap-2 group transition-all"
            >
              <FolderOpen size={14} className="shrink-0" />
              CONNECT NOTES FOLDER
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 shrink-0" />
            </button>

            <button
              onClick={handleOpenGuide}
              className="flex-1 border border-border/10 hover:border-foreground/30 bg-secondary/[0.02] hover:bg-secondary/[0.06] font-black text-xs py-4 px-6 rounded-none flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen size={14} className="shrink-0" />
              READ THE USER GUIDE
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground text-xs font-black tracking-widest text-center mt-2 transition-all hover:underline"
          >
            START WITH EMPTY CANVAS (DISMISS)
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
