import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Lock, Video, FileText, BookOpen, CheckSquare,
  ChevronDown, ChevronUp, Menu, X, Check
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const lessonIcons = {
  video: Video,
  text: FileText,
  quiz: CheckSquare,
  homework: BookOpen,
  audio: FileText,
  file: FileText,
};

export function StudentLesson() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCourse, getLesson, isLessonComplete, markLessonComplete, getCourseProgress } = useDataStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const course = getCourse(id || '');
  const lessonInfo = getLesson(id || '', lessonId || '');

  // Auto-expand current module when lesson changes
  useEffect(() => {
    if (lessonInfo) setExpandedModule(lessonInfo.module.id);
  }, [lessonInfo?.module.id]);

  // Build flat lesson list for navigation
  const allLessons = useMemo(() => {
    if (!course) return [];
    const list: { id: string; moduleId: string; title: string; order: number }[] = [];
    course.modules.forEach(m => {
      m.lessons.forEach(l => list.push({ id: l.id, moduleId: m.id, title: l.title, order: l.order }));
    });
    return list;
  }, [course]);

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (!course || !lessonInfo) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="border-0 max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-[20px] font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Урок не найден</h2>
            <Link to="/student/courses">
              <Button>← К моим курсам</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { lesson, module } = lessonInfo;
  const completed = user ? isLessonComplete(user.id, course.id, lesson.id) : false;
  const courseProgress = user ? getCourseProgress(user.id, course.id) : 0;

  const handleComplete = () => {
    if (!user) return;
    markLessonComplete(user.id, course.id, lesson.id);
    toast.success(nextLesson ? 'Урок завершён! Переходим к следующему' : 'Курс завершён!');
    if (nextLesson) {
      setTimeout(() => navigate(`/student/courses/${course.id}/lesson/${nextLesson.id}`), 600);
    }
  };

  const renderContent = () => {
    if (lesson.type === 'video') {
      const url = lesson.content?.data?.url;
      return (
        <div className="aspect-video bg-black rounded-2xl overflow-hidden">
          {url ? (
            <iframe
              src={url}
              title={lesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <Video className="w-12 h-12" strokeWidth={1.5} />
            </div>
          )}
        </div>
      );
    }
    if (lesson.type === 'text') {
      return (
        <div
          className="prose prose-sm max-w-none bg-white rounded-2xl p-8"
          style={{ fontFamily: 'var(--font-body)' }}
          dangerouslySetInnerHTML={{ __html: lesson.content?.data?.html || '<p>Контент не задан</p>' }}
        />
      );
    }
    if (lesson.type === 'homework') {
      return (
        <div className="bg-white rounded-2xl p-8">
          <Badge variant="warning" className="mb-4">Домашнее задание</Badge>
          <h3 className="text-[20px] font-bold text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Задание
          </h3>
          <p className="text-[14px] text-[#1A1A2E] mb-4 whitespace-pre-line" style={{ fontFamily: 'var(--font-body)' }}>
            {lesson.content?.data?.instructions || 'Описание задания не задано'}
          </p>
          {lesson.content?.data?.deadline && (
            <p className="text-[12px] text-[#8A8A9A] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              Срок сдачи: {new Date(lesson.content.data.deadline).toLocaleDateString('ru-RU')}
            </p>
          )}
          <Link to="/student/homework">
            <Button>Перейти к сдаче →</Button>
          </Link>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-2xl p-8">
        <p className="text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
          Контент этого типа пока не поддерживается
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-screen bg-[#F5F4F2]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-[300px]' : 'w-0'} hidden lg:flex transition-all overflow-hidden bg-white border-r border-[#1A1A2E]/5 flex-col`}>
        <div className="p-4 border-b border-[#1A1A2E]/5">
          <Link to={`/student/courses`} className="text-[12px] text-[#8A8A9A] hover:text-[#1A1A2E] flex items-center gap-1 mb-2 transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
            <ArrowLeft className="w-3 h-3" />К курсам
          </Link>
          <h2 className="text-[14px] font-semibold text-[#1A1A2E] mb-3 line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {course.title}
          </h2>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Прогресс курса</span>
            <span className="font-semibold text-[#1A1A2E]">{courseProgress}%</span>
          </div>
          <Progress value={courseProgress} className="h-1.5" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {course.modules.map((m, mi) => {
            const expanded = expandedModule === m.id;
            return (
              <div key={m.id} className="mb-1">
                <button
                  onClick={() => setExpandedModule(expanded ? null : m.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F5F4F2] transition-colors text-left"
                >
                  <span className="text-[12px] font-semibold text-[#1A1A2E] truncate pr-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {mi + 1}. {m.title}
                  </span>
                  {expanded ? <ChevronUp className="w-3.5 h-3.5 text-[#8A8A9A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#8A8A9A]" />}
                </button>
                {expanded && (
                  <div className="mt-1 ml-2">
                    {m.lessons.map((l) => {
                      const isCurrent = l.id === lesson.id;
                      const isDone = user ? isLessonComplete(user.id, course.id, l.id) : false;
                      const Icon = lessonIcons[l.type] || FileText;
                      return (
                        <Link
                          key={l.id}
                          to={`/student/courses/${course.id}/lesson/${l.id}`}
                          className={`flex items-center gap-2 p-2 rounded-lg text-[12px] transition-colors ${
                            isCurrent ? 'bg-[#EDE9FF] text-[#7C6AF7] font-medium' : 'text-[#1A1A2E]/70 hover:bg-[#F5F4F2]'
                          }`}
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[#7C6AF7] flex-shrink-0" />
                          ) : l.isLocked ? (
                            <Lock className="w-4 h-4 text-[#8A8A9A] flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#8A8A9A] flex-shrink-0" />
                          )}
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                          <span className="line-clamp-1">{l.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex">
              {sidebarOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
              {sidebarOpen ? 'Скрыть' : 'Содержание'}
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={lesson.id}>
            <div className="mb-4">
              <p className="text-[12px] text-[#8A8A9A] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                Модуль: {module.title}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {lesson.title}
                </h1>
                {completed && <Badge variant="success"><Check className="w-3 h-3 mr-1" />Пройдено</Badge>}
              </div>
              {lesson.description && (
                <p className="text-[14px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  {lesson.description}
                </p>
              )}
            </div>

            <div className="mb-6">{renderContent()}</div>

            {/* Action buttons */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div>
                {prevLesson && (
                  <Link to={`/student/courses/${course.id}/lesson/${prevLesson.id}`}>
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />Предыдущий
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex gap-2">
                {!completed && (
                  <Button onClick={handleComplete} className="bg-[#C5E8A0] text-[#2D5016] hover:bg-[#B5D890] transition-transform active:scale-[0.98]">
                    <Check className="w-4 h-4 mr-2" />Завершить урок
                  </Button>
                )}
                {nextLesson && (
                  <Link to={`/student/courses/${course.id}/lesson/${nextLesson.id}`}>
                    <Button>Следующий<ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
