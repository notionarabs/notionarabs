/**
 * Smooth scroll utility functions
 */

/**
 * Smoothly scroll to an element by ID
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Optional offset from the top (default: 0)
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Smoothly scroll to the top of the page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Smoothly scroll to the bottom of the page
 */
export const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  });
};

/**
 * Smoothly scroll by a specific amount
 * @param {number} amount - The amount to scroll (positive for down, negative for up)
 */
export const scrollBy = (amount) => {
  window.scrollBy({
    top: amount,
    behavior: 'smooth'
  });
};

/**
 * Check if smooth scrolling is supported
 * @returns {boolean} - True if smooth scrolling is supported
 */
export const isSmoothScrollSupported = () => {
  return 'scrollBehavior' in document.documentElement.style;
};

/**
 * Enable smooth scrolling for all anchor links
 */
export const enableSmoothScrollForAnchors = () => {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const offset = 80; // Account for fixed header
        scrollToElement(targetId, offset);
      }
    });
  });
};

/**
 * Initialize smooth scrolling on page load
 */
export const initSmoothScroll = () => {
  if (typeof window !== 'undefined') {
    // Enable smooth scrolling for anchor links
    enableSmoothScrollForAnchors();

    // Add smooth scroll class to body if supported
    if (isSmoothScrollSupported()) {
      document.body.classList.add('scroll-smooth');
    }
  }
};
