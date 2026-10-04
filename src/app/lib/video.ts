/**
 * Приводит ссылку на видео к виду, который можно встроить в урок.
 * Поддерживаются YouTube, VK Видео, Rutube, Kinescope, прямые ссылки на файл и загруженные файлы.
 */
export type VideoSource =
  | { kind: 'iframe'; src: string; provider: string }
  | { kind: 'file'; src: string }
  | { kind: 'invalid' };

export function parseVideoUrl(raw: string | undefined | null): VideoSource {
  const value = (raw ?? '').trim();
  if (!value) return { kind: 'invalid' };
  // Загруженный в хранилище файл (путь без схемы) или data URL в демо-режиме
  if (value.startsWith('data:video/')) return { kind: 'file', src: value };
  if (!/^https?:\/\//i.test(value)) return /\.(mp4|webm|mov|m4v)$/i.test(value) ? { kind: 'file', src: value } : { kind: 'invalid' };

  let url: URL;
  try { url = new URL(value); } catch { return { kind: 'invalid' }; }
  const host = url.hostname.replace(/^www\.|^m\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return id ? { kind: 'iframe', provider: 'YouTube', src: `https://www.youtube.com/embed/${id}` } : { kind: 'invalid' };
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id = url.searchParams.get('v')
      ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
    return id ? { kind: 'iframe', provider: 'YouTube', src: `https://www.youtube.com/embed/${id}` } : { kind: 'invalid' };
  }
  if (host === 'vk.com' || host === 'vkvideo.ru' || host === 'vk.ru') {
    if (url.pathname === '/video_ext.php') return { kind: 'iframe', provider: 'VK Видео', src: value };
    const m = (url.pathname + url.search).match(/video(-?\d+)_(\d+)/);
    return m
      ? { kind: 'iframe', provider: 'VK Видео', src: `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}&hd=2` }
      : { kind: 'invalid' };
  }
  if (host === 'rutube.ru') {
    const m = url.pathname.match(/\/(?:video|play\/embed)\/(?:private\/)?([0-9a-f]{32})/i);
    if (!m) return { kind: 'invalid' };
    const p = url.searchParams.get('p');
    return { kind: 'iframe', provider: 'Rutube', src: `https://rutube.ru/play/embed/${m[1]}${p ? `?p=${p}` : ''}` };
  }
  if (host === 'kinescope.io') {
    const id = url.pathname.replace(/^\/(embed\/)?/, '').split('/')[0];
    return id ? { kind: 'iframe', provider: 'Kinescope', src: `https://kinescope.io/embed/${id}` } : { kind: 'invalid' };
  }
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url.pathname)) return { kind: 'file', src: value };
  return { kind: 'invalid' };
}
