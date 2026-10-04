import { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../store/DataStore';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import type { AttachedFile, Homework } from '../../types';

export function HomeworkStatusBadge({ status }: { status?: Homework['status'] }) {
  if (status === 'approved') return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Принято</Badge>;
  if (status === 'returned') return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />На доработку</Badge>;
  if (status === 'submitted' || status === 'review') return <Badge variant="info"><Clock className="w-3 h-3 mr-1" />На проверке</Badge>;
  return null;
}

/** Сдача домашнего задания по одному уроку: решение, файлы, статус и ответ автора. */
export function HomeworkPanel({ courseId, lessonId, title, description, deadline, readOnly = false }: {
  courseId: string;
  lessonId: string;
  title: string;
  description: string;
  deadline?: string;
  /** Предпросмотр автором — без формы сдачи */
  readOnly?: boolean;
}) {
  const { user } = useAuth();
  const { homework, submitHomework } = useDataStore();
  const existing = user ? homework.find(h => h.lessonId === lessonId && h.studentId === user.id) : undefined;
  const [text, setText] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const canSubmit = !readOnly && (!existing || existing.status === 'returned');

  const submit = () => {
    if (!user) return;
    if (!text.trim() && files.length === 0) { toast.error('Напишите ответ или прикрепите файл'); return; }
    submitHomework({ lessonId, courseId, studentId: user.id, title, description, deadline, content: text.trim(), files });
    setText('');
    setFiles([]);
    toast.success('Работа отправлена на проверку');
  };

  return (
    <div className="space-y-4">
      {existing && (
        <div className="bg-[#F5F4F2] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-[#8A8A9A] uppercase tracking-wide">Ваше решение</p>
            <HomeworkStatusBadge status={existing.status} />
          </div>
          {existing.submission?.content && (
            <p className="text-[13px] text-[#1A1A2E] whitespace-pre-line">{existing.submission.content}</p>
          )}
          <FileList files={existing.files ?? []} bucket="homework-files" />
          {existing.feedback && (
            <div className="pt-3 border-t border-[#1A1A2E]/10">
              <p className="text-[11px] font-semibold text-[#8A8A9A] mb-1 uppercase tracking-wide">Ответ автора</p>
              <p className="text-[13px] text-[#1A1A2E] whitespace-pre-line">{existing.feedback}</p>
            </div>
          )}
        </div>
      )}

      {canSubmit && user && (
        <div className="space-y-3">
          {existing?.status === 'returned' && (
            <p className="text-sm text-[#8B2F2F]">Автор вернул работу на доработку. Исправьте и отправьте снова.</p>
          )}
          <Textarea rows={5} placeholder="Ваш ответ…" value={text} onChange={e => setText(e.target.value)} />
          <FileList files={files} bucket="homework-files" onRemove={i => setFiles(f => f.filter((_, idx) => idx !== i))} />
          <div className="flex flex-wrap gap-2">
            <FileUpload bucket="homework-files" pathPrefix={`${courseId}/${user.id}`} label="Прикрепить файл"
              onUploaded={f => setFiles(prev => [...prev, { path: f.path, name: f.name, size: f.size }])} />
            <Button onClick={submit}><Send className="w-4 h-4 mr-2" />Отправить на проверку</Button>
          </div>
        </div>
      )}
      {readOnly && <p className="text-xs text-[#8A8A9A]">Здесь ученик пишет ответ и прикрепляет файлы.</p>}
    </div>
  );
}
