import { FileText, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import type { AttachedFile } from '../../types';
import type { FileBucket } from '../../lib/backend/types';
import { useDataStore } from '../../store/DataStore';
import { formatSize } from './FileUpload';

export function FileList({ files, bucket, onRemove }: { files: AttachedFile[]; bucket: FileBucket; onRemove?: (index: number) => void }) {
  const { fileUrl } = useDataStore();
  if (!files.length) return null;

  const open = async (f: AttachedFile) => {
    // iOS Safari блокирует window.open после await как всплывающее окно, поэтому
    // пустую вкладку открываем синхронно в обработчике клика, а адрес подставляем потом.
    const w = window.open('', '_blank');
    if (w) w.opener = null;
    try {
      const url = await fileUrl(bucket, f.path);
      if (w && !w.closed) w.location.href = url;
      else window.location.assign(url);
    } catch (e) {
      w?.close();
      toast.error(`Файл недоступен: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <ul className="space-y-2">
      {files.map((f, i) => (
        <li key={`${f.path}-${i}`} className={`flex items-center gap-3 rounded-xl bg-[#F5F4F2] pl-3 py-2 min-w-0 ${onRemove ? 'pr-1 sm:pr-3' : 'pr-3'}`}>
          <FileText className="w-4 h-4 text-[#7C6AF7] shrink-0" />
          <button type="button" onClick={() => open(f)} className="flex-1 min-w-0 text-left text-sm text-[#1A1A2E] truncate hover:underline max-sm:py-1.5">
            {f.name}
          </button>
          <span className="text-xs text-[#8A8A9A] shrink-0 whitespace-nowrap">{formatSize(f.size)}</span>
          {onRemove ? (
            <button type="button" aria-label="Удалить файл" onClick={() => onRemove(i)}
              className="shrink-0 text-[#8A8A9A] hover:text-[#FF6B6B] max-sm:size-9 max-sm:flex max-sm:items-center max-sm:justify-center max-sm:rounded-lg">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Download className="w-4 h-4 text-[#8A8A9A] shrink-0" />
          )}
        </li>
      ))}
    </ul>
  );
}
