import { useEffect, useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useDataStore } from '../../store/DataStore';
import type { FileBucket } from '../../lib/backend/types';

// Лимиты совпадают с настройками бакетов на сервере (миграция 0009). Файлы больше 6 МБ
// загружаются частями с докачкой, поэтому большие видео уроков можно грузить прямо в платформу.
const MAX_MB: Record<FileBucket, number> = { covers: 5, 'lesson-files': 2048, 'homework-files': 20 };

/** Безопасное имя файла для пути в хранилище */
export function storageName(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, '') : '';
  return `${crypto.randomUUID()}${ext}`;
}

export function FileUpload({
  bucket, pathPrefix, accept, label = 'Загрузить файл', onUploaded, variant = 'outline', className,
}: {
  bucket: FileBucket;
  /** Префикс пути, первым сегментом обязан идти id курса */
  pathPrefix: string;
  accept?: string;
  label?: string;
  variant?: 'outline' | 'default' | 'ghost';
  className?: string;
  onUploaded: (result: { path: string; name: string; size: number }) => void;
}) {
  const { uploadFile } = useDataStore();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // Пока идёт загрузка, браузер предупредит при попытке закрыть вкладку
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MB[bucket] * 1024 * 1024) {
      toast.error(`Файл больше ${MAX_MB[bucket] >= 1024 ? `${MAX_MB[bucket] / 1024} ГБ` : `${MAX_MB[bucket]} МБ`}`);
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const path = await uploadFile(bucket, `${pathPrefix}/${storageName(file.name)}`, file, setProgress);
      onUploaded({ path, name: file.name, size: file.size });
    } catch (e) {
      toast.error(`Не удалось загрузить: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <>
      <input ref={input} type="file" accept={accept} className="hidden" onChange={e => onFile(e.target.files?.[0])} />
      <Button
        type="button" variant={variant} size="sm" disabled={busy} onClick={() => input.current?.click()}
        className={`${className ?? ''} ${dragOver ? 'ring-2 ring-[#7C6AF7] ring-offset-1' : ''}`}
        // Файл можно перетащить прямо на кнопку
        onDragOver={e => { e.preventDefault(); if (!busy) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); if (!busy) onFile(e.dataTransfer.files?.[0]); }}
        title="Нажмите или перетащите файл"
      >
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        {busy ? (progress > 0 && progress < 1 ? `Загрузка ${Math.round(progress * 100)}%` : 'Загрузка…') : label}
      </Button>
    </>
  );
}

export function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
