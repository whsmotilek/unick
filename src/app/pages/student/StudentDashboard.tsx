import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { BookOpen, FileCheck, TrendingUp, Trophy, Play, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { CountUp } from '../../components/CountUp';
import { motion } from 'motion/react';
import { useMemo } from 'react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { courses, enrollments, progress, getHomeworkForStudent, getCourseProgress, getCompletedLessonsCount } = useDataStore();

  const myCourses = useMemo(() => {
    if (!user) return [];
    const enrolledIds = enrollments[user.id] || [];
    return courses.filter(c => enrolledIds.includes(c.id)).map(c => ({
      ...c,
      progressPct: getCourseProgress(user.id, c.id),
      completedSet: new Set(progress[user.id]?.[c.id]?.completedLessons || []),
    }));
  }, [user, courses, enrollments, progress, getCourseProgress]);

  const completedLessons = user ? getCompletedLessonsCount(user.id) : 0;
  const activeCourses = myCourses.filter(c => c.progressPct < 100).length;
  const completedCourses = myCourses.filter(c => c.progressPct >= 100).length;
  const avgProgress = myCourses.length ? Math.round(myCourses.reduce((s, c) => s + c.progressPct, 0) / myCourses.length) : 0;

  // Streak: count consecutive days with activity
  const streak = useMemo(() => {
    if (!user) return 0;
    const userProgress = progress[user.id] || {};
    const dates = new Set<string>();
    for (const p of Object.values(userProgress)) {
      if (p.lastActivity) {
        dates.add(new Date(p.lastActivity).toISOString().slice(0, 10));
      }
    }
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (dates.has(d.toISOString().slice(0, 10))) count++;
      else if (i > 0) break;
    }
    return count;
  }, [user, progress]);

  const pendingHomework = useMemo(() => {
    if (!user) return [];
    const userHw = getHomeworkForStudent(user.id);
    const tasks: Array<{ courseTitle: string; lessonTitle: string; deadline?: string; lessonId: string }> = [];
    for (const c of myCourses) {
      for (const m of c.modules) {
        for (const l of m.lessons) {
          if (l.type === 'homework' && !userHw.find(h => h.lessonId === l.id)) {
            tasks.push({
              courseTitle: c.title,
              lessonTitle: l.title,
              deadline: l.content?.data?.deadline,
              lessonId: l.id,
            });
          }
        }
      }
    }
    return tasks.slice(0, 4);
  }, [user, myCourses, getHomeworkForStudent]);

  const getNextLesson = (course: typeof myCourses[0]) => {
    for (const m of course.modules) {
      for (const l of m.lessons) {
        if (!course.completedSet.has(l.id)) return l;
      }
    }
    return course.modules[0]?.lessons[0] || null;
  };

  const stats = [
    { label: 'Активных курсов', value: activeCourses, icon: BookOpen, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
    { label: 'Уроков пройдено', value: completedLessons, icon: TrendingUp, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
    { label: 'Средний прогресс', value: avgProgress, suffix: '%', icon: FileCheck, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
    { label: 'Дней подряд', value: streak, icon: Trophy, color: 'bg-[#F5E642]', text: 'text-[#5A5000]' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Привет, {user?.name?.split(' ')[0] || 'Ученик'}! 👋
        </h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
          {streak > 0 ? `Вы учитесь ${streak} ${streak === 1 ? 'день' : 'дней'} подряд — так держать!` : 'Начните учиться сегодня'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`${s.color} border-0`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <s.icon className={`w-5 h-5 ${s.text}`} strokeWidth={1.5} />
                  {completedCourses > 0 && i === 0 && <Badge variant="success" className="text-[10px]">{completedCourses} ✓</Badge>}
                </div>
                <p className={`text-[28px] font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[11px] text-[#1A1A2E]/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Мои курсы</h2>
            <Link to="/student/courses" className="text-[13px] text-[#7C6AF7] hover:underline" style={{ fontFamily: 'var(--font-body)' }}>
              Все курсы →
            </Link>
          </div>
          {myCourses.length === 0 ? (
            <Card className="border-0">
              <CardContent className="p-8 text-center">
                <Compass className="w-12 h-12 text-[#8A8A9A] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Начните учиться сегодня
                </h3>
                <p className="text-[13px] text-[#8A8A9A] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                  Откройте каталог и запишитесь на интересный курс
                </p>
                <Link to="/student/catalog">
                  <Button>Открыть каталог</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myCourses.slice(0, 3).map(c => {
                const next = getNextLesson(c);
                return (
                  <Card key={c.id} className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[#F5F4F2] overflow-hidden flex-shrink-0">
                        {c.cover ? <img src={c.cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-[#8A8A9A]" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-2 line-clamp-1" style={{ fontFamily: 'var(--font-heading)' }}>
                          {c.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Progress value={c.progressPct} className="h-1.5 flex-1" />
                          <span className="text-[11px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>{c.progressPct}%</span>
                        </div>
                      </div>
                      {next && (
                        <Link to={`/student/courses/${c.id}/lesson/${next.id}`}>
                          <Button size="sm" className="transition-transform active:scale-[0.98]">
                            <Play className="w-3 h-3 mr-1" />Продолжить
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Задания</h2>
            <Link to="/student/homework" className="text-[13px] text-[#7C6AF7] hover:underline" style={{ fontFamily: 'var(--font-body)' }}>
              Все →
            </Link>
          </div>
          {pendingHomework.length === 0 ? (
            <Card className="border-0">
              <CardContent className="p-6 text-center">
                <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Все задания сданы 🎉</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingHomework.map((task, i) => {
                const days = task.deadline ? Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000) : null;
                return (
                  <Card key={i} className="border-0">
                    <CardContent className="p-4">
                      <p className="text-[11px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                        {task.courseTitle}
                      </p>
                      <p className="text-[13px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                        {task.lessonTitle}
                      </p>
                      {days !== null && (
                        <Badge variant={days < 3 ? 'destructive' : days < 7 ? 'warning' : 'secondary'} className="text-[10px]">
                          {days < 0 ? 'Просрочено' : days === 0 ? 'Сегодня' : `Осталось ${days} дн.`}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              <Link to="/student/homework">
                <Button variant="outline" className="w-full">К заданиям<ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
