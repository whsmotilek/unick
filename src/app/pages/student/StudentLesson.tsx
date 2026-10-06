import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Lock, Video, FileText, BookOpen, CheckSquare, Paperclip,
  Menu, X, Eye, ListOrdered,
} from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '../../components/ui/sheet';
import { plural } from '../../lib/analytics';
import { Link, Navigate, useParams, useNavigate, useLocation } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { VideoPlayer } from '../../components/lesson/VideoPlayer';
import { FileList } from '../../components/lesson/FileList';
import { HomeworkPanel } from '../../components/lesson/HomeworkPanel';
import { QuizPlayer } from '../../components/lesson/QuizPlayer';
import { PageSkeleton } from '../../components/skeletons/PageSkeleton';
import { sanitizeHtml } from '../../lib/sanitize';
import { flattenCourse } from '../../lib/courseAccess';
import { homeworkDeadline, lessonData, LESSON_TYPE_LABELS } from '../../lib/lessonContent';
import type { Lesson } from '../../types';

const lessonIcons: Record<Lesson['type'], typeof Video> = {
  video: Video, text: FileText, quiz: CheckSquare, homework: BookOpen, audio: FileText, file: Paperclip,
};

export function StudentLesson() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preview = location.pathname.startsWith('/author/');
  const base = preview ? `/author/courses/${id}/preview` : `/student/courses/${id}/lesson`;
  const { user } = useAuth();
  const { loading, getCourse, getProgress, markLessonComplete, enrollmentRecords, isEnrolled } = useDataStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const course = getCourse(id || '');
  const completedIds = useMemo(
    () => new Set(user && course ? getProgress(user.id, course.id)?.completedLessons ?? [] : []),
    [user, course, getProgress],
  );
  const flat = useMemo(() => (course ? flattenCourse(course, completedIds) : []), [course, completedIds]);
  const current = flat.find(l => l.lesson.id === lessonId);

  // Урок открывается с начала: прокручиваем ближайший прокручиваемый контейнер (в кабинете это <main> раскладки)
  useEffect(() => {
    setMobileListOpen(false);
    let el: HTMLElement | null = rootRef.current;
    while (el && !(el.scrollHeight > el.clientHeight && /(auto|scroll)/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
    (el ?? window).scrollTo({ top: 0 });
  }, [lessonId]);

  if (loading) return <PageSkeleton />;
  if (!course) return <Navigate to={preview ? '/author/courses' : '/student/courses'} replace />;
  if (!preview && user && !isEnrolled(user.id, course.id)) return <Navigate to={`/student/courses/${course.id}`} replace />;
  if (!current) return <Navigate to={preview ? `/author/courses/${course.id}` : `/student/courses/${course.id}`} replace />;

  const { lesson, module } = current;
  const locked = !preview && !current.unlocked;
  const completed = current.completed;
  const data = lessonData(lesson);
  const prev = flat[current.index - 1];
  const next = flat[current.index + 1];
  const progressPct = flat.length ? Math.round((flat.filter(l => l.completed).length / flat.length) * 100) : 0;
  const enrolledAt = user ? enrollmentRecords.find(e => e.userId === user.id && e.courseId === course.id)?.createdAt : undefined;

  const complete = () => {
    if (!user || preview) return;
    markLessonComplete(user.id, course.id, lesson.id);
    if (next) {
      toast.success('Урок пройден');
      navigate(`${base}/${next.lesson.id}`);
    } else {
      toast.success('Поздравляем, вы прошли курс!');
    }
  };

  const lessonList = (
    <div className="p-2">
      {course.modules.map((m, mi) => (
        <div key={m.id} className="mb-2">
          <p className="px-2.5 pt-3 pb-1.5 text-[13px] lg:text-[12px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>{mi + 1}. {m.title}</p>
          {flat.filter(l => l.module.id === m.id).map(l => {
            const isCurrent = l.lesson.id === lesson.id;
            const isLocked = !preview && !l.unlocked;
            const Icon = lessonIcons[l.lesson.type] || FileText;
            return (
              <Link
                key={l.lesson.id}
                to={`${base}/${l.lesson.id}`}
                data-current={isCurrent || undefined}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => setMobileListOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2.5 lg:py-2 min-h-11 lg:min-h-0 rounded-lg text-[14px] lg:text-[13px] transition-colors ${
                  isCurrent ? 'bg-[#EDE9FF] text-[#7C6AF7] font-medium' : isLocked ? 'text-[#1A1A2E]/40' : 'text-[#1A1A2E]/75 hover:bg-[#F5F4F2]'
                }`}
              >
                {l.completed ? <CheckCircle2 className="w-4 h-4 text-[#7C6AF7] shrink-0" aria-label="пройден" />
                  : isLocked ? <Lock className="w-4 h-4 shrink-0" aria-label="закрыт" /> : <Circle className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-[#7C6AF7]' : 'text-[#8A8A9A]'}`} />}
                <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" strokeWidth={1.5} />
                <span className="flex-1 min-w-0 line-clamp-2 lg:line-clamp-1 leading-snug">{l.lesson.title}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderBody = () => {
    if (locked) {
      return (
        <div className="bg-white rounded-2xl p-6 sm:p-10 text-center">
          <Lock className="w-10 h-10 mx-auto mb-3 text-[#8A8A9A]" strokeWidth={1.5} />
          <p className="font-semibold text-[#1A1A2E] mb-1">Урок пока закрыт</p>
          <p className="text-sm text-[#8A8A9A] mb-4">Он откроется, когда вы пройдёте предыдущие уроки. Домашние задания засчитываются после проверки автором.</p>
          {prev && <Button asChild variant="outline" className="h-11 sm:h-10 w-full sm:w-auto"><Link to={`${base}/${prev.lesson.id}`}><ArrowLeft className="w-4 h-4 mr-2" />К предыдущему уроку</Link></Button>}
        </div>
      );
    }
    return (
      <div className="space-y-4 sm:space-y-6">
        {lesson.type === 'video' && (
          // На телефоне видео во всю ширину экрана, без скруглений
          <div className="-mx-4 sm:mx-0 [&>div]:max-sm:rounded-none">
            <VideoPlayer url={data.url} title={lesson.title} />
          </div>
        )}

        {lesson.type === 'quiz' ? (
          <div className="bg-white rounded-2xl p-4 sm:p-8">
            {/* Проверка на сервере; пройденный тест бэкенд сам отмечает завершённым */}
            <QuizPlayer key={lesson.id} lessonId={lesson.id} questions={data.questions ?? []} passPercent={data.passPercent ?? 70} completed={completed} />
          </div>
        ) : data.html ? (
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            {lesson.type === 'homework' && <Badge variant="warning" className="mb-4">Домашнее задание</Badge>}
            <div className="lesson-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.html) }} />
          </div>
        ) : lesson.type === 'text' ? (
          <div className="bg-white rounded-2xl p-5 sm:p-8 text-[#8A8A9A] text-sm">Текст урока ещё не добавлен.</div>
        ) : null}

        {(data.files?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl p-4 sm:p-6">
            <p className="text-sm font-semibold text-[#1A1A2E] mb-3">Материалы урока</p>
            <FileList files={data.files!} bucket="lesson-files" />
          </div>
        )}

        {lesson.type === 'homework' && (
          <div className="bg-white rounded-2xl p-4 sm:p-8">
            {(() => {
              const deadline = homeworkDeadline(data, enrolledAt);
              return deadline ? <p className="text-[13px] text-[#8A8A9A] mb-4">Срок сдачи: {new Date(deadline).toLocaleDateString('ru-RU')}</p> : null;
            })()}
            <HomeworkPanel courseId={course.id} lessonId={lesson.id} title={lesson.title} description={data.html ?? ''}
              deadline={homeworkDeadline(data, enrolledAt)} readOnly={preview} />
          </div>
        )}
      </div>
    );
  };

  const canMarkComplete = !preview && !locked && !completed && (lesson.type === 'video' || lesson.type === 'text' || lesson.type === 'file' || lesson.type === 'audio');
  const showNext = !!next && (preview || next.unlocked);
  // На телефоне «Назад» превращается в иконку, если рядом есть основная кнопка
  const compactPrev = canMarkComplete || showNext;

  return (
    <div ref={rootRef} className="flex h-full min-h-screen bg-[#F5F4F2]">
      <aside className={`${sidebarOpen ? 'w-[300px]' : 'w-0'} hidden lg:flex transition-all overflow-hidden bg-white border-r border-[#1A1A2E]/5 flex-col shrink-0`}>
        <div className="p-4 border-b border-[#1A1A2E]/5">
          <Link to={preview ? `/author/courses/${course.id}` : `/student/courses/${course.id}`}
            className="text-[12px] text-[#8A8A9A] hover:text-[#1A1A2E] flex items-center gap-1 mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" />{preview ? 'К редактору курса' : 'К программе курса'}
          </Link>
          <h2 className="text-[14px] font-semibold text-[#1A1A2E] mb-3 line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>{course.title}</h2>
          {!preview && (
            <>
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="text-[#8A8A9A]">Прогресс курса</span>
                <span className="font-semibold text-[#1A1A2E]">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">{lessonList}</div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {preview && (
          <div className="bg-[#1A1A2E] text-white text-sm px-4 py-2 flex items-center gap-2">
            <Eye className="w-4 h-4 shrink-0" />Предпросмотр: так урок видит ученик
          </div>
        )}
        <div className="flex-1 flex flex-col w-full px-4 pt-0 pb-0 sm:px-6 lg:py-6 max-w-4xl mx-auto">
          {/* Телефон/планшет: компактная липкая панель с номером урока и кнопкой содержания */}
          <div className="lg:hidden sticky top-0 z-20 -mx-4 sm:-mx-6 mb-4 bg-white/95 backdrop-blur border-b border-[#1A1A2E]/5">
            <div className="flex items-center gap-1 px-2 sm:px-4 h-14">
              <Button asChild variant="ghost" size="icon" className="shrink-0 text-[#1A1A2E]">
                <Link to={preview ? `/author/courses/${course.id}` : `/student/courses/${course.id}`} aria-label={preview ? 'К редактору курса' : 'К программе курса'}>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <button type="button" onClick={() => setMobileListOpen(true)}
                className="flex-1 min-w-0 h-11 px-2 rounded-xl text-left hover:bg-[#F5F4F2] transition-colors"
                aria-haspopup="dialog" aria-expanded={mobileListOpen}>
                <span className="block text-[14px] font-semibold text-[#1A1A2E] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  Урок {current.index + 1} из {flat.length}
                </span>
                <span className="block text-[12px] text-[#8A8A9A] leading-tight truncate">{course.title}</span>
              </button>
              <Button variant="outline" size="sm" onClick={() => setMobileListOpen(true)} className="shrink-0 h-10 px-3 text-[13px]">
                <ListOrdered className="w-4 h-4" />Уроки
              </Button>
            </div>
            {!preview && (
              <div className="h-0.5 bg-[#1A1A2E]/5" aria-hidden>
                <div className="h-full bg-[#7C6AF7] transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center justify-between mb-4 gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
              {sidebarOpen ? 'Скрыть' : 'Содержание'}
            </Button>
          </div>

          <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
            <SheetContent side="bottom"
              className="lg:hidden gap-0 max-h-[85dvh] rounded-t-[24px] border-0 bg-white pb-[env(safe-area-inset-bottom)] [&>button:last-child]:hidden"
              onOpenAutoFocus={e => {
                e.preventDefault();
                requestAnimationFrame(() => document.querySelector('[data-lesson-sheet] [data-current]')?.scrollIntoView({ block: 'center' }));
              }}>
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#1A1A2E]/15" aria-hidden />
              <div className="flex items-start gap-3 px-4 pt-3 pb-3 border-b border-[#1A1A2E]/5">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-[16px] font-semibold text-[#1A1A2E] leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>{course.title}</SheetTitle>
                  <SheetDescription className="text-[12px] text-[#8A8A9A] mt-0.5">
                    {preview ? `${flat.length} ${plural(flat.length, ['урок', 'урока', 'уроков'])}` : `Пройдено ${flat.filter(l => l.completed).length} из ${flat.length} · ${progressPct}%`}
                  </SheetDescription>
                  {!preview && <Progress value={progressPct} className="h-1.5 mt-2" />}
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 -mr-2 -mt-1" aria-label="Закрыть">
                    <X className="w-5 h-5" />
                  </Button>
                </SheetClose>
              </div>
              <div className="overflow-y-auto overscroll-contain pb-3" data-lesson-sheet>{lessonList}</div>
            </SheetContent>
          </Sheet>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={lesson.id} className="flex-1 flex flex-col">
            <div className="mb-4">
              <p className="text-[12px] text-[#8A8A9A] mb-1.5 sm:mb-2 break-words">{module.title} · {LESSON_TYPE_LABELS[lesson.type]}</p>
              <div className="flex items-center gap-x-3 gap-y-2 mb-2 flex-wrap">
                <h1 className="text-[22px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] break-words min-w-0" style={{ fontFamily: 'var(--font-heading)' }}>{lesson.title}</h1>
                {completed && <Badge variant="success"><Check className="w-3 h-3 mr-1" />Пройдено</Badge>}
              </div>
            </div>

            <div className="mb-4 sm:mb-6">{renderBody()}</div>

            {/* Навигация: на телефоне — липкая нижняя панель с отступом под «домашнюю» полоску iOS */}
            {(prev || canMarkComplete || showNext) && (
              <div className="sticky bottom-0 z-20 mt-auto lg:mt-0 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur border-t border-[#1A1A2E]/5
                lg:static lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0 lg:mb-10 lg:bg-transparent lg:backdrop-blur-none lg:border-0">
                <div className="flex items-center gap-2 lg:justify-between lg:gap-3">
                  {prev && (
                    <Button asChild variant="outline" className={`h-11 lg:h-10 shrink-0 ${compactPrev ? 'max-lg:w-11 max-lg:px-0' : 'flex-1 lg:flex-none'}`}>
                      <Link to={`${base}/${prev.lesson.id}`} aria-label="Предыдущий урок">
                        <ArrowLeft className={`w-4 h-4 ${compactPrev ? 'lg:mr-2' : 'mr-2'}`} />
                        <span className={compactPrev ? 'max-lg:sr-only' : ''}>Предыдущий</span>
                      </Link>
                    </Button>
                  )}
                  {compactPrev && <div className="flex flex-1 lg:flex-none gap-2 min-w-0 lg:ml-auto">
                    {canMarkComplete && (
                      <Button onClick={complete} className="flex-1 lg:flex-none h-11 lg:h-10 min-w-0 bg-[#C5E8A0] text-[#2D5016] hover:bg-[#B5D890] transition-transform active:scale-[0.98]">
                        <Check className="w-4 h-4 mr-2" />{next ? 'Пройдено, дальше' : 'Завершить курс'}
                      </Button>
                    )}
                    {next && showNext && (
                      <Button asChild variant={canMarkComplete ? 'outline' : 'default'} className={`h-11 lg:h-10 ${canMarkComplete ? 'shrink-0 max-lg:w-11 max-lg:px-0' : 'flex-1 lg:flex-none'}`}>
                        <Link to={`${base}/${next.lesson.id}`} aria-label="Следующий урок">
                          <span className={canMarkComplete ? 'max-lg:sr-only' : ''}>Следующий</span><ArrowRight className={`w-4 h-4 ${canMarkComplete ? 'lg:ml-2' : 'ml-2'}`} />
                        </Link>
                      </Button>
                    )}
                  </div>}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
