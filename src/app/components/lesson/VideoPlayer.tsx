import { useEffect, useRef, useState } from 'react';
import { Video } from 'lucide-react';
import { parseVideoUrl } from '../../lib/video';
import { useDataStore } from '../../store/DataStore';

export function VideoPlayer({ url, title }: { url?: string; title: string }) {
  const { fileUrl } = useDataStore();
  const source = parseVideoUrl(url);
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resume = useRef<{ time: number; play: boolean } | null>(null);
  const retries = useRef(0);

  const loadSignedUrl = () => {
    if (source.kind !== 'file') return Promise.resolve();
    return fileUrl('lesson-files', source.src).then(setFileSrc);
  };

  useEffect(() => {
    setFileSrc(null);
    setFailed(false);
    retries.current = 0;
    if (source.kind !== 'file') return;
    let cancelled = false;
    fileUrl('lesson-files', source.src).then(src => { if (!cancelled) setFileSrc(src); }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Временная ссылка на файл могла истечь (долгая пауза) — берём новую и продолжаем с того же места
  const onError = () => {
    const v = videoRef.current;
    if (!v || retries.current >= 3) { setFailed(true); return; }
    retries.current += 1;
    resume.current = { time: v.currentTime, play: !v.paused };
    loadSignedUrl().catch(() => setFailed(true));
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v || !resume.current) return;
    v.currentTime = resume.current.time;
    if (resume.current.play) v.play().catch(() => {});
    resume.current = null;
  };

  return (
    <div className="aspect-video bg-black rounded-2xl overflow-hidden">
      {source.kind === 'iframe' ? (
        <iframe
          src={source.src}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : source.kind === 'file' && fileSrc && !failed ? (
        <video
          ref={videoRef}
          src={fileSrc}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          className="w-full h-full"
          onContextMenu={e => e.preventDefault()}
          onError={onError}
          onLoadedMetadata={onLoadedMetadata}
          onPlaying={() => { retries.current = 0; }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/60 gap-2 px-6 text-center">
          <Video className="w-12 h-12" strokeWidth={1.5} />
          <span className="text-sm">
            {source.kind === 'invalid' ? 'Видео не добавлено' : failed ? 'Не удалось загрузить видео. Обновите страницу или напишите автору.' : 'Загрузка…'}
          </span>
        </div>
      )}
    </div>
  );
}
