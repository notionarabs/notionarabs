import { useState, useEffect } from 'react';

export function useRatingPopup(template, user, isAuthenticated) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasCheckedPopup, setHasCheckedPopup] = useState(false);

  // Check if popup should be shown
  useEffect(() => {
    if (!template?._id || !isAuthenticated || !user || hasCheckedPopup) {
      return;
    }

    // Check if user has downloaded this template recently
    const checkShouldShowPopup = () => {
      try {
        // Check if popup was dismissed for this template
        const dismissedPopups = JSON.parse(localStorage.getItem('dismissedRatingPopups') || '[]');
        if (dismissedPopups.includes(template._id)) {
          setHasCheckedPopup(true);
          return;
        }

        // Check if user has orders for this template
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const hasTemplateOrder = orders.some(order =>
          order.items && order.items.some(item =>
            item.templateId === template._id || item.id === template._id
          )
        );

        if (hasTemplateOrder) {
          // Check if this is a recent download (within last 2 hours) - more aggressive timing for popup
          const recentOrder = orders.find(order => {
            const orderDate = new Date(order.date || order.createdAt);
            const hoursDiff = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
            return hoursDiff <= 2 && order.items && order.items.some(item =>
              item.templateId === template._id || item.id === template._id
            );
          });

          if (recentOrder) {
            // Check if user has already rated this template
            const ratingKey = `userRating_${template._id}_${user._id || user.id}`;
            const hasRated = localStorage.getItem(ratingKey);

            if (!hasRated) {
              // Show popup after a delay - but only if they haven't used the inline rating
              setTimeout(() => {
                setShowPopup(true);
              }, 5000); // 5 second delay to give time for inline rating
            }
          }
        }
      } catch (error) {
        console.error('Error checking popup state:', error);
      } finally {
        setHasCheckedPopup(true);
      }
    };

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(checkShouldShowPopup, 1000);
    return () => clearTimeout(timer);
  }, [template?._id, user, isAuthenticated, hasCheckedPopup]);

  // Listen for download events to show popup
  useEffect(() => {
    const handleDownload = (event) => {
      if (event.detail?.templateId === template?._id) {
        // Wait longer for the download to complete and give user time to use inline rating
        setTimeout(() => {
          // Double check if user hasn't rated yet before showing popup
          const ratingKey = `userRating_${template._id}_${user?._id || user?.id}`;
          const hasRated = localStorage.getItem(ratingKey);
          if (!hasRated) {
            setShowPopup(true);
          }
        }, 8000); // 8 second delay after download
      }
    };

    window.addEventListener('templateDownloaded', handleDownload);
    return () => window.removeEventListener('templateDownloaded', handleDownload);
  }, [template?._id]);

  const closePopup = () => {
    setShowPopup(false);
  };

  const markAsRated = () => {
    if (template?._id && user?._id) {
      const ratingKey = `userRating_${template._id}_${user._id}`;
      localStorage.setItem(ratingKey, 'true');
    }
    setShowPopup(false);
  };

  return {
    showPopup,
    closePopup,
    markAsRated
  };
}
