const sanitizeHtml = require('sanitize-html');

// Matches the output of the Tiptap RichTextEditor (StarterKit + Link + Image + TextAlign)
const BLOG_CONTENT_OPTIONS = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
    'a', 'img', 'blockquote', 'code', 'pre', 'hr'
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    p: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
    h4: ['style']
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/]
    }
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' })
  }
};

function sanitizeBlogContent(html) {
  return sanitizeHtml(html || '', BLOG_CONTENT_OPTIONS);
}

module.exports = { sanitizeBlogContent };
