import { useEffect, useState } from 'react';
import { Video } from 'lucide-react';
import { parseVideoUrl } from '../../lib/video';
import { useDataStore } from '../../store/DataStore';

export function VideoPlayer({ url, title }: { url?: string; title: string }) {
  const { fileUrl } = useDataStore();
  const source = parseVideoUrl(url);
  const [fileSrc, setFileSrc] = useState<string | null>(null);

  useEffect(() => {
    setFileSrc(null);
    if (source.kind !== 'file') return;
    let cancelled = false;
    fileUrl('lesson-files', source.src).then(src => { if (!cancelled) setFileSrc(src); }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

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
      ) : source.kind === 'file' && fileSrc ? (
        <video src={fileSrc} controls controlsList="nodownload" className="w-full h-full" onContextMenu={e => e.preventDefault()} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-2">
          <Video className="w-12 h-12" strokeWidth={1.5} />
          <span className="text-sm">{source.kind === 'invalid' ? 'Видео не добавлено' : 'Загрузка…'}</span>
        </div>
      )}
    </div>
  );
}
