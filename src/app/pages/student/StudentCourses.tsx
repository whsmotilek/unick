import { pluralize } from '../../lib/analytics';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Search, BookOpen, Compass, Play } from 'lucide-react';
import { Link } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';

export function StudentCourses() {
  const { user } = useAuth();
  const { courses, enrollments, progress, getCourseProgress } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  const myCourses = useMemo(() => {
    if (!user) return [];
    const enrolledIds = enrollments[user.id] || [];
    return courses.filter(c => enrolledIds.includes(c.id)).map(c => ({
      ...c,
      progressPct: getCourseProgress(user.id, c.id),
      completedSet: new Set(progress[user.id]?.[c.id]?.completedLessons || []),
    }));
  }, [user, courses, enrollments, progress, getCourseProgress]);

  const filtered = useMemo(() => {
    let list = myCourses;
    if (filter === 'in-progress') list = list.filter(c => c.progressPct > 0 && c.progressPct < 100);
    else if (filter === 'completed') list = list.filter(c => c.progressPct >= 100);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }
    return list;
  }, [myCourses, filter, searchQuery]);

  const getNextLesson = (course: typeof myCourses[0]) => {
    for (const m of course.modules) {
      for (const l of m.lessons) {
        if (!course.completedSet.has(l.id)) return l;
      }
    }
    return course.modules[0]?.lessons[0] || null;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Мои курсы</h1>
          <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Курсы, на которые вы записаны</p>
        </div>
        <Link to="/student/catalog" className="shrink-0">
          <Button variant="outline">
            <Compass className="w-4 h-4 mr-2" />Каталог
          </Button>
        </Link>
      </div>

      {myCourses.length > 0 && (
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mb-6 sm:flex-wrap sm:items-center">
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible [scrollbar-width:none]">
          {[
            { id: 'all', label: 'Все' },
            { id: 'in-progress', label: 'В процессе' },
            { id: 'completed', label: 'Завершённые' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`shrink-0 px-4 h-10 rounded-lg text-sm font-medium transition-all ${
                filter === tab.id ? 'bg-[#1A1A2E] text-white' : 'bg-white text-[#8A8A9A] hover:bg-[#F5F4F2]'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {tab.label}
            </button>
          ))}
          </div>
          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64 h-11 sm:h-10 text-base sm:text-sm bg-white border-[#1A1A2E]/10"
            />
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={myCourses.length === 0 ? 'У вас пока нет курсов' : 'Ничего не найдено'}
          description={myCourses.length === 0 ? 'Перейдите в каталог и запишитесь на интересный курс' : 'Попробуйте изменить фильтр'}
          action={myCourses.length === 0 ? (
            <Link to="/student/catalog"><Button><Compass className="w-4 h-4 mr-2" />Открыть каталог</Button></Link>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((course, i) => {
            const nextLesson = getNextLesson(course);
            const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
            const isCompleted = course.progressPct >= 100;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="border-0 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 duration-300 h-full flex flex-col gap-0">
                  <div className="aspect-video bg-[#F5F4F2] overflow-hidden relative">
                    {course.cover ? (
                      <img src={course.cover} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-[#8A8A9A]" strokeWidth={1.5} /></div>
                    )}
                    {isCompleted && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="success">Завершён</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-3 line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      {course.title}
                    </h3>
                    <div className="mb-3 mt-auto">
                      <div className="flex items-center justify-between text-[12px] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                        <span className="text-[#8A8A9A]">Прогресс</span>
                        <span className="font-semibold text-[#1A1A2E]">{course.progressPct}%</span>
                      </div>
                      <Progress value={course.progressPct} className="h-1.5" />
                    </div>
                    <p className="text-[12px] text-[#8A8A9A] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                      {pluralize(lessonCount, ['урок', 'урока', 'уроков'])}
                    </p>
                    {nextLesson && (
                      <Link to={`/student/courses/${course.id}/lesson/${nextLesson.id}`}>
                        <Button className="w-full h-11 sm:h-10 transition-transform active:scale-[0.98]">
                          {isCompleted ? 'Пересмотреть' : course.progressPct > 0 ? 'Продолжить' : 'Начать'}
                          <Play className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
