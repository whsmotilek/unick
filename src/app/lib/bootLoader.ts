/**
 * Экран загрузки из index.html: показывается мгновенно, до загрузки JS,
 * и плавно исчезает, когда приложение получило сессию и первые данные.
 */
const MIN_VISIBLE_MS = 450; // короче — выглядит как мигание
let hidden = false;

export function hideBootLoader() {
  if (hidden) return;
  hidden = true;
  const el = document.getElementById('boot');
  if (!el) return;
  const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
  window.setTimeout(() => {
    el.classList.add('boot--hide');
    window.setTimeout(() => el.remove(), 500);
  }, wait);
}
