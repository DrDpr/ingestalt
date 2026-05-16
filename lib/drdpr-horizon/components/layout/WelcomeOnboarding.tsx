'use client';

import React, { useEffect, useState } from 'react';
import { PromptModal } from '../PromptModal';
import { connectAndStoreFolder, getStoredFolderHandle } from '@/lib/drdpr-horizon/lib/ingest-fsa';

export function WelcomeOnboarding() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

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
          setTimeout(() => setShow(true), 1500);
        }
      } catch (e) {
        console.warn('Storage access issue in onboarding:', e);
      }
    };
    checkOnboarding();
  }, []);

  const handleConfirm = async (val: string) => {
    if (val === 'connect') {
      await connectAndStoreFolder();
    }
    try {
      localStorage.setItem('ingestalt_onboarding_complete', 'true');
    } catch (e) {}
    setShow(false);
  };

  if (!mounted) return null;

  return (
    <PromptModal
      show={show}
      title="WELCOME TO INGESTALT"
      message="Your architectural workspace is ready. To get started, connect a folder where you keep your notes or documentation (.md files). We'll automatically organize them into a visual map for you. You can also start with an empty folder to begin drafting from scratch."
      options={[
        { label: 'CONNECT NOTES FOLDER', value: 'connect' },
        { label: 'DISMISS', value: 'cancel' }
      ]}
      onConfirm={handleConfirm}
      onCancel={() => {
        try {
          localStorage.setItem('ingestalt_onboarding_complete', 'true');
        } catch (e) {}
        setShow(false);
      }}
    />
  );
}
