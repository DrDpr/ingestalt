'use client';

import { useEffect, useState } from 'react';

/**
 * useMediaQuery - React hook for responsive media queries
 * 
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean - true if query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to true (desktop-first) to prevent portal-based Sheet components from mounting
  // during SSR/hydration and immediately unmounting, which crashes React.
  const [matches, setMatches] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    // Set correct value immediately after mount on the client
    setMatches(media.matches);

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } 
    // Legacy browsers
    else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}

// Made with Bob
