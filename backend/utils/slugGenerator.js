/**
 * Utility functions for generating URL-friendly slugs from Arabic text
 */

/**
 * Arabic to English transliteration map
 */
const arabicToEnglish = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
  'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th',
  'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
  'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
  'ة': 'h', 'ء': 'a', 'ؤ': 'w', 'ئ': 'y'
};

/**
 * Generate a URL-friendly slug from Arabic text
 * @param {string} text - The Arabic text to convert
 * @returns {string} - The generated slug
 */
function generateSlug(text) {
  if (!text) return '';

  // Convert Arabic text to English transliteration
  let slug = text
    .split('')
    .map(char => arabicToEnglish[char] || char)
    .join('')
    .toLowerCase();

  // Remove or replace special characters and spaces
  slug = slug
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

  return slug;
}

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} baseSlug - The base slug
 * @param {Function} checkExists - Function to check if slug exists
 * @returns {Promise<string>} - The unique slug
 */
async function generateUniqueSlug(baseSlug, checkExists) {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Generate slug from template title with uniqueness check
 * @param {string} title - The template title
 * @param {Function} checkExists - Function to check if slug exists
 * @param {string} excludeId - ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} - The unique slug
 */
async function generateTemplateSlug(title, checkExists, excludeId = null) {
  const baseSlug = generateSlug(title);

  // If no base slug could be generated, create a fallback
  if (!baseSlug) {
    const fallbackSlug = `template-${Date.now()}`;
    return generateUniqueSlug(fallbackSlug, checkExists);
  }

  // Check uniqueness
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = {
  generateSlug,
  generateUniqueSlug,
  generateTemplateSlug
};
