'use client';

import { useEffect, useState } from 'react'; // Added useState and useEffect imports
import { useTelegramPopup } from '../hooks/useTelegramPopup';
import TelegramPopup from './TelegramPopup';

export default function TelegramPopupWrapper() {
  const { showPopup, dismissPopup, closePopup } = useTelegramPopup();

  // Move the pathname check directly to the wrapper component's render logic
  if (typeof window !== 'undefined' && window.location.pathname.includes('/embed')) {
    return null;
  }

  // Add a check for screenshot service CSS injection
  if (typeof window !== 'undefined' && window.location.search.includes('screenshotService=true')) {
    return null;
  }

  return (
    <TelegramPopup
      isOpen={showPopup}
      onClose={closePopup}
      onDismiss={dismissPopup}
    />
  );
}


