import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { ArrowRight, BookOpen, CheckCircle2, Circle, Lock, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../store/DataStore';
import { PageSkeleton } from '../../components/skeletons/PageSkeleton';
import { flattenCourse, nextLessonToStudy } from '../../lib/courseAccess';
import { LESSON_TYPE_LABELS } from '../../lib/lessonContent';
import { plural } from '../../lib/analytics';

export function StudentCourseOverview() {
  const { id } = useParams();
  const { user } = useAuth();
  const { loading, getCourse, getProgress, isEnrolled, homework, users } = useDataStore();
  const course = getCourse(id || '');

  const completed = useMemo(
    () => new Set(user && course ? getProgress(user.id, course.id)?.completedLessons ?? [] : []),
    [user, course, getProgress],
  );
  const flat = useMemo(() => (course ? flattenCourse(course, completed) : []), [course, completed]);

  if (loading) return <PageSkeleton />;
  if (!course || !user) return <Navigate to="/student/courses" replace />;
  if (!isEnrolled(user.id, course.id)) return <Navigate to="/student/catalog" replace />;

  const doneCount = flat.filter(l => l.completed).length;
  const pct = flat.length ? Math.round((doneCount / flat.length) * 100) : 0;
  const nextUp = nextLessonToStudy(flat);
  const author = users.find(u => u.schoolId === course.schoolId && u.role === 'author');

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Link to="/student/courses" className="text-[13px] text-[#8A8A9A] hover:text-[#1A1A2E] mb-2 sm:mb-4 inline-flex items-center min-h-10 -ml-1 px-1">← Мои курсы</Link>

      <Card className="border-0 overflow-hidden mb-6 gap-0">
        {course.cover && <img src={course.cover} alt="" className="w-full h-40 sm:h-48 object-cover" />}
        <CardContent className="p-5 sm:p-6">
          <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-2 break-words" style={{ fontFamily: 'var(--font-heading)' }}>{course.title}</h1>
          {author && <p className="text-sm text-[#8A8A9A] mb-3">Автор: {author.name}</p>}
          {course.description && <p className="text-[14px] text-[#1A1A2E]/80 whitespace-pre-line mb-5">{course.description}</p>}
          <div className="flex items-center justify-between gap-3 text-sm mb-2">
            <span className="text-[#8A8A9A]">Пройдено {doneCount} из {flat.length} {plural(flat.length, ['урока', 'уроков', 'уроков'])}</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2 mb-5" />
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            {nextUp ? (
              <Button asChild className="h-11 sm:h-10"><Link to={`/student/courses/${course.id}/lesson/${nextUp.lesson.id}`}>{doneCount === 0 ? 'Начать обучение' : pct === 100 ? 'Повторить курс' : 'Продолжить'}<ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
            ) : (
              <p className="text-sm text-[#8A8A9A]">Автор ещё не добавил уроки.</p>
            )}
            {author && (
              <Button asChild variant="outline" className="h-11 sm:h-10"><Link to={`/student/chat?with=${author.id}`}><MessageSquare className="w-4 h-4 mr-2" />Написать автору</Link></Button>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-[18px] font-semibold text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Программа</h2>
      <div className="space-y-3">
        {course.modules.map((m, mi) => {
          const items = flat.filter(l => l.module.id === m.id);
          return (
            <Card key={m.id} className="border-0">
              <CardContent className="p-0 [&:last-child]:pb-2">
                <div className="px-4 sm:px-5 py-4 border-b border-[#1A1A2E]/5 flex items-center justify-between gap-3">
                  <p className="font-semibold text-[14px] text-[#1A1A2E] min-w-0">{mi + 1}. {m.title}</p>
                  <span className="text-xs text-[#8A8A9A] shrink-0">{items.filter(i => i.completed).length}/{items.length}</span>
                </div>
                {items.map(l => {
                  const hw = l.lesson.type === 'homework' ? homework.find(h => h.lessonId === l.lesson.id && h.studentId === user.id) : undefined;
                  const row = (
                    <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 min-h-12 ${l.unlocked ? 'hover:bg-[#F5F4F2]' : 'opacity-50'}`}>
                      {l.completed ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7C6AF7]" /> : l.unlocked ? <Circle className="w-4 h-4 shrink-0 text-[#8A8A9A]" /> : <Lock className="w-4 h-4 shrink-0 text-[#8A8A9A]" />}
                      <span className="flex-1 min-w-0 text-sm text-[#1A1A2E] break-words">{l.lesson.title}</span>
                      <span className="text-xs text-[#8A8A9A] shrink-0 text-right">
                        {hw ? (hw.status === 'approved' ? 'Принято' : hw.status === 'returned' ? 'На доработку' : 'На проверке') : LESSON_TYPE_LABELS[l.lesson.type]}
                      </span>
                    </div>
                  );
                  return l.unlocked
                    ? <Link key={l.lesson.id} to={`/student/courses/${course.id}/lesson/${l.lesson.id}`} className="block">{row}</Link>
                    : <div key={l.lesson.id}>{row}</div>;
                })}
                {items.length === 0 && <p className="px-4 sm:px-5 py-3 text-sm text-[#8A8A9A] flex items-center gap-2"><BookOpen className="w-4 h-4" />Уроки скоро появятся</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
