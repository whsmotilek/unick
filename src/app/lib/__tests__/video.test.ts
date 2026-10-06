import { describe, expect, it } from 'vitest';
import { parseVideoUrl } from '../video';

describe('parseVideoUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=EgYIBT-h6tw', 'https://www.youtube.com/embed/EgYIBT-h6tw'],
    ['https://youtu.be/EgYIBT-h6tw?t=10', 'https://www.youtube.com/embed/EgYIBT-h6tw'],
    ['https://www.youtube.com/embed/EgYIBT-h6tw', 'https://www.youtube.com/embed/EgYIBT-h6tw'],
    ['https://youtube.com/shorts/abc_DEF-123', 'https://www.youtube.com/embed/abc_DEF-123'],
    ['https://vk.com/video-22822305_456242111', 'https://vk.com/video_ext.php?oid=-22822305&id=456242111&hd=2'],
    ['https://vkvideo.ru/video-22822305_456242111', 'https://vk.com/video_ext.php?oid=-22822305&id=456242111&hd=2'],
    ['https://rutube.ru/video/0123456789abcdef0123456789abcdef/', 'https://rutube.ru/play/embed/0123456789abcdef0123456789abcdef'],
    ['https://kinescope.io/abc123', 'https://kinescope.io/embed/abc123'],
  ])('%s → iframe', (input, src) => {
    const r = parseVideoUrl(input);
    expect(r.kind).toBe('iframe');
    expect(r.kind === 'iframe' && r.src).toBe(src);
  });

  it('распознаёт файлы', () => {
    expect(parseVideoUrl('https://cdn.example.com/a.mp4').kind).toBe('file');
    expect(parseVideoUrl('course-id/lesson/video.mp4').kind).toBe('file');
  });

  it('отклоняет мусор', () => {
    expect(parseVideoUrl('').kind).toBe('invalid');
    expect(parseVideoUrl('javascript:alert(1)').kind).toBe('invalid');
    expect(parseVideoUrl('https://example.com/page').kind).toBe('invalid');
  });
});
