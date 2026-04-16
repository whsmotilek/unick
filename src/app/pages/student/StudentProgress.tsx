import { useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Trophy, Flame, BookOpen, Target, Lock, CheckCircle2, Star, Sparkles, Award } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { CountUp } from '../../components/CountUp';
import { motion } from 'motion/react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  color: string;
}

export function StudentProgress() {
  const { user } = useAuth();
  const { courses, enrollments, progress, getCompletedLessonsCount, homework } = useDataStore();

  const completedLessons = user ? getCompletedLessonsCount(user.id) : 0;
  const level = Math.floor(completedLessons / 5) + 1;
  const lessonsToNext = 5 - (completedLessons % 5);
  const xpProgress = ((5 - lessonsToNext) / 5) * 100;

  const myCourses = useMemo(() => {
    if (!user) return [];
    const enrolledIds = enrollments[user.id] || [];
    return courses.filter(c => enrolledIds.includes(c.id));
  }, [user, courses, enrollments]);

  // Streak
  const streak = useMemo(() => {
    if (!user) return 0;
    const userProgress = progress[user.id] || {};
    const dates = new Set<string>();
    for (const p of Object.values(userProgress)) {
      if (p.lastActivity) dates.add(new Date(p.lastActivity).toISOString().slice(0, 10));
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

  const submittedHw = user ? homework.filter(h => h.studentId === user.id).length : 0;
  const approvedHw = user ? homework.filter(h => h.studentId === user.id && h.status === 'approved').length : 0;

  // Build achievements
  const achievements: Achievement[] = useMemo(() => [
    { id: 'first_lesson', title: 'Первый шаг', description: 'Завершите свой первый урок', icon: Star, unlocked: completedLessons >= 1, color: 'bg-[#F5E642]' },
    { id: 'five_lessons', title: 'Пятёрка', description: 'Пройдите 5 уроков', icon: BookOpen, unlocked: completedLessons >= 5, color: 'bg-[#B8D8F8]' },
    { id: 'ten_lessons', title: 'Десятка', description: 'Пройдите 10 уроков', icon: Target, unlocked: completedLessons >= 10, color: 'bg-[#C5E8A0]' },
    { id: 'first_hw', title: 'Сдача', description: 'Сдайте первое домашнее задание', icon: CheckCircle2, unlocked: submittedHw >= 1, color: 'bg-[#FFE5D9]' },
    { id: 'approved_hw', title: 'Отличник', description: 'Получите одобренное ДЗ', icon: Sparkles, unlocked: approvedHw >= 1, color: 'bg-[#EDE9FF]' },
    { id: 'level_3', title: 'Уровень 3', description: 'Достигните 3 уровня', icon: Trophy, unlocked: level >= 3, color: 'bg-[#F9D0E8]' },
    { id: 'streak_3', title: 'Постоянство', description: '3 дня подряд обучения', icon: Flame, unlocked: streak >= 3, color: 'bg-[#FFE5D9]' },
    { id: 'streak_7', title: 'Неделя', description: '7 дней подряд обучения', icon: Award, unlocked: streak >= 7, color: 'bg-[#F5E642]' },
  ], [completedLessons, submittedHw, approvedHw, level, streak]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const stats = [
    { label: 'Уровень', value: level, icon: Trophy, color: 'bg-[#F5E642]', text: 'text-[#5A5000]' },
    { label: 'Дней подряд', value: streak, icon: Flame, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
    { label: 'Уроков пройдено', value: completedLessons, icon: BookOpen, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
    { label: 'Достижений', value: `${unlockedCount}/${achievements.length}`, icon: Award, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Мой прогресс</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Ваши достижения и статистика обучения</p>
      </div>

      {/* Level card */}
      <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white border-0 mb-6 overflow-hidden relative">
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[12px] opacity-80 mb-1" style={{ fontFamily: 'var(--font-body)' }}>Текущий уровень</p>
              <p className="text-[48px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                <CountUp value={level} />
              </p>
              <p className="text-[12px] opacity-80 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                {lessonsToNext} {lessonsToNext === 1 ? 'урок' : 'уроков'} до уровня {level + 1}
              </p>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between mb-2 text-[12px]" style={{ fontFamily: 'var(--font-body)' }}>
                <span>Прогресс уровня</span>
                <span className="font-bold">{Math.round(xpProgress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <motion.div
                  className="bg-white rounded-full h-3"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`${s.color} border-0`}>
              <CardContent className="p-5">
                <s.icon className={`w-5 h-5 ${s.text} mb-3`} strokeWidth={1.5} />
                <p className={`text-[28px] font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  {typeof s.value === 'number' ? <CountUp value={s.value} /> : s.value}
                </p>
                <p className="text-[11px] text-[#1A1A2E]/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div>
          <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Достижения</h2>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`${a.unlocked ? a.color : 'bg-white'} border-0 ${a.unlocked ? '' : 'opacity-50'}`}>
                  <CardContent className="p-4 text-center">
                    {a.unlocked ? (
                      <a.icon className="w-8 h-8 text-[#1A1A2E] mx-auto mb-2" strokeWidth={1.5} />
                    ) : (
                      <Lock className="w-8 h-8 text-[#8A8A9A] mx-auto mb-2" strokeWidth={1.5} />
                    )}
                    <p className="text-[12px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                      {a.title}
                    </p>
                    <p className="text-[10px] text-[#1A1A2E]/60" style={{ fontFamily: 'var(--font-body)' }}>
                      {a.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Course progress */}
        <div>
          <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Прогресс по курсам</h2>
          {myCourses.length === 0 ? (
            <Card className="border-0">
              <CardContent className="p-6 text-center">
                <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  Запишитесь на курс, чтобы видеть прогресс
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myCourses.map((c, i) => {
                const userProgress = progress[user!.id]?.[c.id];
                const lessonCount = c.modules.reduce((s, m) => s + m.lessons.length, 0);
                const completed = userProgress?.completedLessons.length || 0;
                const pct = lessonCount ? Math.round((completed / lessonCount) * 100) : 0;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2 gap-3">
                          <h3 className="text-[14px] font-semibold text-[#1A1A2E] line-clamp-1" style={{ fontFamily: 'var(--font-heading)' }}>
                            {c.title}
                          </h3>
                          <Badge variant={pct >= 100 ? 'success' : 'secondary'}>{pct}%</Badge>
                        </div>
                        <Progress value={pct} className="h-1.5 mb-2" />
                        <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          {completed} из {lessonCount} уроков пройдено
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
