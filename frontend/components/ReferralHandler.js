'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'notion_arabs_tracking';

export default function ReferralHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    const utm_source = searchParams.get('utm_source');

    if (ref || utm_source) {
      const existingStr = localStorage.getItem(STORAGE_KEY);
      let data = {};
      
      if (existingStr) {
        try { data = JSON.parse(existingStr); } catch (e) { data = {}; }
      }

      // Update with new values if they exist in URL
      if (ref) data.ref = ref;
      if (utm_source) data.utm_source = utm_source;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [searchParams]);

  return null;
}

// Utility to get the data
export const getTrackingData = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
};
