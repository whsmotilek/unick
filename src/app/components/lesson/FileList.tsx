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
        <li key={`${f.path}-${i}`} className="flex items-center gap-3 rounded-xl bg-[#F5F4F2] px-3 py-2">
          <FileText className="w-4 h-4 text-[#7C6AF7] shrink-0" />
          <button type="button" onClick={() => open(f)} className="flex-1 text-left text-sm text-[#1A1A2E] truncate hover:underline">
            {f.name}
          </button>
          <span className="text-xs text-[#8A8A9A]">{formatSize(f.size)}</span>
          {onRemove ? (
            <button type="button" aria-label="Удалить файл" onClick={() => onRemove(i)} className="text-[#8A8A9A] hover:text-[#FF6B6B]">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Download className="w-4 h-4 text-[#8A8A9A]" />
          )}
        </li>
      ))}
    </ul>
  );
}
