import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Lock, Video, FileText, BookOpen, CheckSquare, Paperclip,
  Menu, X, Eye,
} from 'lucide-react';
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

  const course = getCourse(id || '');
  const completedIds = useMemo(
    () => new Set(user && course ? getProgress(user.id, course.id)?.completedLessons ?? [] : []),
    [user, course, getProgress],
  );
  const flat = useMemo(() => (course ? flattenCourse(course, completedIds) : []), [course, completedIds]);
  const current = flat.find(l => l.lesson.id === lessonId);

  useEffect(() => { setMobileListOpen(false); window.scrollTo({ top: 0 }); }, [lessonId]);

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
          <p className="px-2.5 py-2 text-[12px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>{mi + 1}. {m.title}</p>
          {flat.filter(l => l.module.id === m.id).map(l => {
            const isCurrent = l.lesson.id === lesson.id;
            const isLocked = !preview && !l.unlocked;
            const Icon = lessonIcons[l.lesson.type] || FileText;
            return (
              <Link
                key={l.lesson.id}
                to={`${base}/${l.lesson.id}`}
                className={`flex items-center gap-2 p-2 rounded-lg text-[12px] transition-colors ${
                  isCurrent ? 'bg-[#EDE9FF] text-[#7C6AF7] font-medium' : isLocked ? 'text-[#1A1A2E]/40' : 'text-[#1A1A2E]/70 hover:bg-[#F5F4F2]'
                }`}
              >
                {l.completed ? <CheckCircle2 className="w-4 h-4 text-[#7C6AF7] shrink-0" />
                  : isLocked ? <Lock className="w-4 h-4 shrink-0" /> : <Circle className="w-4 h-4 text-[#8A8A9A] shrink-0" />}
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span className="line-clamp-1">{l.lesson.title}</span>
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
        <div className="bg-white rounded-2xl p-10 text-center">
          <Lock className="w-10 h-10 mx-auto mb-3 text-[#8A8A9A]" strokeWidth={1.5} />
          <p className="font-semibold text-[#1A1A2E] mb-1">Урок пока закрыт</p>
          <p className="text-sm text-[#8A8A9A] mb-4">Он откроется, когда вы пройдёте предыдущие уроки. Домашние задания засчитываются после проверки автором.</p>
          {prev && <Button asChild variant="outline"><Link to={`${base}/${prev.lesson.id}`}><ArrowLeft className="w-4 h-4 mr-2" />К предыдущему уроку</Link></Button>}
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {lesson.type === 'video' && <VideoPlayer url={data.url} title={lesson.title} />}

        {lesson.type === 'quiz' ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8">
            {/* Проверка на сервере; пройденный тест бэкенд сам отмечает завершённым */}
            <QuizPlayer key={lesson.id} lessonId={lesson.id} questions={data.questions ?? []} passPercent={data.passPercent ?? 70} completed={completed} />
          </div>
        ) : data.html ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8">
            {lesson.type === 'homework' && <Badge variant="warning" className="mb-4">Домашнее задание</Badge>}
            <div className="lesson-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.html) }} />
          </div>
        ) : lesson.type === 'text' ? (
          <div className="bg-white rounded-2xl p-8 text-[#8A8A9A] text-sm">Текст урока ещё не добавлен.</div>
        ) : null}

        {(data.files?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl p-6">
            <p className="text-sm font-semibold text-[#1A1A2E] mb-3">Материалы урока</p>
            <FileList files={data.files!} bucket="lesson-files" />
          </div>
        )}

        {lesson.type === 'homework' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8">
            {(() => {
              const deadline = homeworkDeadline(data, enrolledAt);
              return deadline ? <p className="text-[12px] text-[#8A8A9A] mb-4">Срок сдачи: {new Date(deadline).toLocaleDateString('ru-RU')}</p> : null;
            })()}
            <HomeworkPanel courseId={course.id} lessonId={lesson.id} title={lesson.title} description={data.html ?? ''}
              deadline={homeworkDeadline(data, enrolledAt)} readOnly={preview} />
          </div>
        )}
      </div>
    );
  };

  const canMarkComplete = !preview && !locked && !completed && (lesson.type === 'video' || lesson.type === 'text' || lesson.type === 'file' || lesson.type === 'audio');

  return (
    <div className="flex h-full min-h-screen bg-[#F5F4F2]">
      <aside className={`${sidebarOpen ? 'w-[300px]' : 'w-0'} hidden lg:flex transition-all overflow-hidden bg-white border-r border-[#1A1A2E]/5 flex-col shrink-0`}>
        <div className="p-4 border-b border-[#1A1A2E]/5">
          <Link to={preview ? `/author/courses/${course.id}` : `/student/courses/${course.id}`}
            className="text-[12px] text-[#8A8A9A] hover:text-[#1A1A2E] flex items-center gap-1 mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" />{preview ? 'К редактору курса' : 'К программе курса'}
          </Link>
          <h2 className="text-[14px] font-semibold text-[#1A1A2E] mb-3 line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>{course.title}</h2>
          {!preview && (
            <>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-[#8A8A9A]">Прогресс курса</span>
                <span className="font-semibold text-[#1A1A2E]">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">{lessonList}</div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        {preview && (
          <div className="bg-[#1A1A2E] text-white text-sm px-4 py-2 flex items-center gap-2">
            <Eye className="w-4 h-4" />Предпросмотр: так урок видит ученик
          </div>
        )}
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4 gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex">
              {sidebarOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
              {sidebarOpen ? 'Скрыть' : 'Содержание'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMobileListOpen(o => !o)} className="lg:hidden">
              <Menu className="w-4 h-4 mr-2" />Урок {current.index + 1} из {flat.length}
            </Button>
          </div>
          {mobileListOpen && <div className="lg:hidden bg-white rounded-2xl mb-4 max-h-[60vh] overflow-y-auto">{lessonList}</div>}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={lesson.id}>
            <div className="mb-4">
              <p className="text-[12px] text-[#8A8A9A] mb-2">{module.title} · {LESSON_TYPE_LABELS[lesson.type]}</p>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>{lesson.title}</h1>
                {completed && <Badge variant="success"><Check className="w-3 h-3 mr-1" />Пройдено</Badge>}
              </div>
            </div>

            <div className="mb-6">{renderBody()}</div>

            <div className="flex items-center justify-between flex-wrap gap-3 mb-10">
              <div>
                {prev && (
                  <Button asChild variant="outline"><Link to={`${base}/${prev.lesson.id}`}><ArrowLeft className="w-4 h-4 mr-2" />Предыдущий</Link></Button>
                )}
              </div>
              <div className="flex gap-2">
                {canMarkComplete && (
                  <Button onClick={complete} className="bg-[#C5E8A0] text-[#2D5016] hover:bg-[#B5D890] transition-transform active:scale-[0.98]">
                    <Check className="w-4 h-4 mr-2" />{next ? 'Пройдено, дальше' : 'Завершить курс'}
                  </Button>
                )}
                {next && (preview || next.unlocked) && (
                  <Button asChild variant={canMarkComplete ? 'outline' : 'default'}><Link to={`${base}/${next.lesson.id}`}>Следующий<ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
