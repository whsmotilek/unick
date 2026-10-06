import { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RichTextEditor } from '../lesson/RichTextEditor';
import { FileUpload } from '../lesson/FileUpload';
import { FileList } from '../lesson/FileList';
import { VideoPlayer } from '../lesson/VideoPlayer';
import { parseVideoUrl } from '../../lib/video';
import { lessonData, mergeQuizKey, quizAnswersKey, LESSON_TYPE_LABELS, type LessonData, type QuizQuestion } from '../../lib/lessonContent';
import { useDataStore } from '../../store/DataStore';
import type { AttachedFile, Lesson } from '../../types';

type EditableType = 'video' | 'text' | 'homework' | 'quiz' | 'file';
const TYPES: EditableType[] = ['video', 'text', 'homework', 'quiz', 'file'];

export interface LessonDraft {
  title: string;
  type: Lesson['type'];
  data: LessonData;
  /** Для теста: ключ ответов, который нужно сохранить через saveQuizKey */
  quizKey?: { answers: Record<string, string[]>; passPercent: number };
}

const newQuestion = (): QuizQuestion => {
  const a = crypto.randomUUID(), b = crypto.randomUUID();
  return { id: crypto.randomUUID(), text: '', options: [{ id: a, text: '' }, { id: b, text: '' }], correct: [a] };
};

function QuizEditor({ questions, onChange }: { questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }) {
  const update = (i: number, patch: Partial<QuizQuestion>) => onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-[#1A1A2E]/10 p-3 space-y-2">
          <div className="flex gap-2 items-start">
            <span className="text-sm font-semibold text-[#8A8A9A] mt-2.5">{i + 1}.</span>
            <Input value={q.text} onChange={e => update(i, { text: e.target.value })} placeholder="Текст вопроса" />
            <Button type="button" variant="ghost" size="icon" aria-label="Удалить вопрос" onClick={() => onChange(questions.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-4 h-4 text-[#FF6B6B]" />
            </Button>
          </div>
          {q.options.map((o, oi) => {
            const isCorrect = q.correct.includes(o.id);
            return (
              <div key={o.id} className="flex gap-2 items-center pl-6">
                <button
                  type="button"
                  title={isCorrect ? 'Правильный ответ' : 'Отметить правильным'}
                  onClick={() => update(i, { correct: isCorrect ? q.correct.filter(id => id !== o.id) : [...q.correct, o.id] })}
                >
                  {isCorrect ? <CheckCircle2 className="w-5 h-5 text-[#2D9D5B]" /> : <Circle className="w-5 h-5 text-[#8A8A9A]" />}
                </button>
                <Input
                  value={o.text}
                  onChange={e => update(i, { options: q.options.map((x, xi) => (xi === oi ? { ...x, text: e.target.value } : x)) })}
                  placeholder={`Вариант ${oi + 1}`}
                  className="h-9"
                />
                {q.options.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" aria-label="Удалить вариант"
                    onClick={() => update(i, { options: q.options.filter(x => x.id !== o.id), correct: q.correct.filter(id => id !== o.id) })}>
                    <Trash2 className="w-3.5 h-3.5 text-[#8A8A9A]" />
                  </Button>
                )}
              </div>
            );
          })}
          <Button type="button" variant="ghost" size="sm" className="ml-6"
            onClick={() => update(i, { options: [...q.options, { id: crypto.randomUUID(), text: '' }] })}>
            <Plus className="w-3.5 h-3.5 mr-1" />Вариант
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...questions, newQuestion()])}>
        <Plus className="w-4 h-4 mr-1" />Добавить вопрос
      </Button>
      <p className="text-xs text-[#8A8A9A]">Отметьте галочкой правильные ответы. Если правильных несколько, ученик должен выбрать все.</p>
    </div>
  );
}

export function LessonEditorDialog({
  open, onOpenChange, courseId, initial, onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  /** null — новый урок */
  initial: Lesson | null;
  onSave: (draft: LessonDraft) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Lesson['type']>('video');
  const [data, setData] = useState<LessonData>({});
  const { quizKeys } = useDataStore();

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? '');
    setType(initial?.type ?? 'video');
    if (!initial) { setData({}); return; }
    const d = lessonData(initial);
    if (initial.type === 'quiz') {
      // Правильные ответы хранятся отдельно (quiz_keys) — возвращаем их в вопросы
      const key = quizKeys.find(k => k.lessonId === initial.id);
      d.questions = mergeQuizKey(d.questions ?? [], key?.answers);
      if (key) d.passPercent = key.passPercent;
    }
    setData(d);
    // quizKeys намеренно не в зависимостях: не сбрасываем черновик при обновлении стора
  }, [open, initial]);

  const patch = (p: Partial<LessonData>) => setData(d => ({ ...d, ...p }));
  const files = data.files ?? [];
  const addFile = (f: AttachedFile) => patch({ files: [...files, f] });

  const save = () => {
    if (!title.trim()) { toast.error('Введите название урока'); return; }
    if (type === 'video' && data.url && parseVideoUrl(data.url).kind === 'invalid') {
      toast.error('Не удалось распознать ссылку на видео. Поддерживаются YouTube, VK Видео, Rutube, Kinescope или загрузка файла.');
      return;
    }
    if (type === 'quiz') {
      const qs = data.questions ?? [];
      if (!qs.length) { toast.error('Добавьте хотя бы один вопрос'); return; }
      const bad = qs.findIndex(q => !q.text.trim() || q.options.some(o => !o.text.trim()) || q.correct.length === 0);
      if (bad >= 0) { toast.error(`Вопрос ${bad + 1}: заполните текст, все варианты и отметьте правильный ответ`); return; }
    }
    const { instructions: _legacy, ...clean } = data;
    if (type === 'quiz') {
      const questions = (clean.questions ?? []).map(q => ({ ...q, multiple: q.correct.length > 1 }));
      const passPercent = clean.passPercent ?? 70;
      onSave({ title: title.trim(), type, data: { ...clean, questions, passPercent }, quizKey: { answers: quizAnswersKey(questions), passPercent } });
      return;
    }
    onSave({ title: title.trim(), type, data: clean });
  };

  const htmlLabel = type === 'homework' ? 'Задание' : type === 'text' ? 'Текст урока' : 'Описание (необязательно)';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Редактировать урок' : 'Новый урок'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="lesson-title">Название</Label>
              <Input id="lesson-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Как выбрать кисти" autoFocus className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="lesson-type">Тип урока</Label>
              <Select value={type} onValueChange={(v: Lesson['type']) => setType(v)}>
                <SelectTrigger id="lesson-type" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t} value={t}>{LESSON_TYPE_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === 'video' && (
            <div className="space-y-3">
              <Label htmlFor="lesson-video">Видео</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input id="lesson-video" value={data.url && !data.url.startsWith('data:') ? data.url : ''} onChange={e => patch({ url: e.target.value })}
                  placeholder="Ссылка на YouTube, VK Видео, Rutube или Kinescope" />
                <FileUpload bucket="lesson-files" pathPrefix={`${courseId}/video`} accept="video/mp4,video/webm,video/quicktime"
                  label="Загрузить файл" onUploaded={f => patch({ url: f.path })} />
              </div>
              <p className="text-xs text-[#8A8A9A]">
                Для платного курса лучше использовать Kinescope или загружать файл: ссылку на YouTube ученик может переслать кому угодно.
              </p>
              {data.url && <div className="max-w-md"><VideoPlayer url={data.url} title={title} /></div>}
            </div>
          )}

          {type === 'quiz' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label htmlFor="pass">Порог прохождения</Label>
                <Input id="pass" type="number" min={0} max={100} className="w-24 h-9" value={data.passPercent ?? 70}
                  onChange={e => patch({ passPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
                <span className="text-sm text-[#8A8A9A]">% правильных ответов</span>
              </div>
              <QuizEditor questions={data.questions ?? []} onChange={questions => patch({ questions })} />
            </div>
          ) : (
            <div>
              <Label className="mb-1.5 block">{htmlLabel}</Label>
              <RichTextEditor value={data.html ?? ''} onChange={html => patch({ html })}
                placeholder={type === 'homework' ? 'Опишите задание и критерии, по которым будете проверять' : 'Текст урока…'} />
            </div>
          )}

          {type === 'homework' && (
            <div className="flex items-center gap-3">
              <Label htmlFor="deadline">Срок сдачи</Label>
              <Input id="deadline" type="number" min={0} className="w-24 h-9" value={data.deadlineDays ?? ''}
                onChange={e => patch({ deadlineDays: e.target.value ? Math.max(0, Number(e.target.value)) : undefined })} placeholder="—" />
              <span className="text-sm text-[#8A8A9A]">дней после начала обучения (пусто — без срока)</span>
            </div>
          )}

          {type !== 'quiz' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Материалы к уроку</Label>
                <FileUpload bucket="lesson-files" pathPrefix={`${courseId}/files`} label="Прикрепить файл"
                  onUploaded={f => addFile({ path: f.path, name: f.name, size: f.size })} />
              </div>
              <FileList files={files} bucket="lesson-files" onRemove={i => patch({ files: files.filter((_, idx) => idx !== i) })} />
              {!files.length && <p className="text-xs text-[#8A8A9A]">PDF, презентации, чек-листы — ученик сможет их скачать.</p>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={save}>{initial ? 'Сохранить' : 'Добавить урок'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
