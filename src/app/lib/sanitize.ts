import DOMPurify from 'dompurify';

/** Очищает HTML урока: оставляет форматирование, убирает скрипты, обработчики и опасные ссылки. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4',
      'blockquote', 'code', 'pre', 'hr', 'img', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|data:image\/)/i,
  });
}

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});
