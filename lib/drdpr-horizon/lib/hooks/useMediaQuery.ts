'use client';

import { useEffect, useState } from 'react';

/**
 * useMediaQuery - React hook for responsive media queries
 * 
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean - true if query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
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
