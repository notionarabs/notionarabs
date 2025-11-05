'use client';

import { useTelegramPopup } from '../hooks/useTelegramPopup';
import TelegramPopup from './TelegramPopup';

export default function TelegramPopupWrapper() {
  const { showPopup, dismissPopup, closePopup } = useTelegramPopup();

  return (
    <TelegramPopup
      isOpen={showPopup}
      onClose={closePopup}
      onDismiss={dismissPopup}
    />
  );
}

