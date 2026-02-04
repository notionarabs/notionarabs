'use client';

import { useTelegramPopup } from '../hooks/useTelegramPopup';
import { useCreatorTelegramPopup } from '../hooks/useCreatorTelegramPopup';
import TelegramPopup from './TelegramPopup';
import CreatorTelegramPopup from './CreatorTelegramPopup';

export default function TelegramPopupWrapper() {
  const {
    showPopup: showGeneralPopup,
    dismissPopup: dismissGeneralPopup,
    closePopup: closeGeneralPopup
  } = useTelegramPopup();

  const {
    showPopup: showCreatorPopup,
    dismissPopup: dismissCreatorPopup,
    closePopup: closeCreatorPopup
  } = useCreatorTelegramPopup();

  // Prioritize creator popup if both are eligible
  const isCreatorPopupVisible = showCreatorPopup;
  const isGeneralPopupVisible = showGeneralPopup && !isCreatorPopupVisible;

  return (
    <>
      <TelegramPopup
        isOpen={isGeneralPopupVisible}
        onClose={closeGeneralPopup}
        onDismiss={dismissGeneralPopup}
      />
      <CreatorTelegramPopup
        isOpen={isCreatorPopupVisible}
        onClose={closeCreatorPopup}
        onDismiss={dismissCreatorPopup}
      />
    </>
  );
}

