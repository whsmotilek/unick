import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useDataStore } from '../../store/DataStore';
import type { FileBucket } from '../../lib/backend/types';

// Лимит бесплатного тарифа Supabase — 50 МБ на файл. Большие видео — через Kinescope / VK Видео.
const MAX_MB: Record<FileBucket, number> = { covers: 5, 'lesson-files': 50, 'homework-files': 20 };

/** Безопасное имя файла для пути в хранилище */
export function storageName(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, '') : '';
  return `${crypto.randomUUID()}${ext}`;
}

export function FileUpload({
  bucket, pathPrefix, accept, label = 'Загрузить файл', onUploaded, variant = 'outline',
}: {
  bucket: FileBucket;
  /** Префикс пути, первым сегментом обязан идти id курса */
  pathPrefix: string;
  accept?: string;
  label?: string;
  variant?: 'outline' | 'default' | 'ghost';
  onUploaded: (result: { path: string; name: string; size: number }) => void;
}) {
  const { uploadFile } = useDataStore();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MB[bucket] * 1024 * 1024) {
      toast.error(`Файл больше ${MAX_MB[bucket]} МБ`);
      return;
    }
    setBusy(true);
    try {
      const path = await uploadFile(bucket, `${pathPrefix}/${storageName(file.name)}`, file);
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
      <Button type="button" variant={variant} size="sm" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        {busy ? 'Загрузка…' : label}
      </Button>
    </>
  );
}

export function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
