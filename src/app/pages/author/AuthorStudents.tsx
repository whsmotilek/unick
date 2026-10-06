import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Search, Users } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { CountUp } from '../../components/CountUp';
import { motion } from 'motion/react';
import { User } from '../../types';
import { pluralize } from '../../lib/analytics';

export function AuthorStudents() {
  const { user } = useAuth();
  const { courses, enrollments, progress, getCourseProgress, getCompletedLessonsCount, users } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');

  const myCourseIds = useMemo(() => {
    return courses.filter(c => c.schoolId === user?.schoolId).map(c => c.id);
  }, [courses, user]);

  const myCoursesMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of courses) m[c.id] = c.title;
    return m;
  }, [courses]);

  const allUsers = users;

  const students = useMemo(() => {
    const map: Record<string, { user: User; courses: { id: string; title: string; progress: number }[] }> = {};
    for (const [uid, cids] of Object.entries(enrollments)) {
      const enrolledMine = cids.filter(cid => myCourseIds.includes(cid));
      if (enrolledMine.length === 0) continue;
      const u = allUsers.find(x => x.id === uid);
      if (!u) continue;
      map[uid] = {
        user: u,
        courses: enrolledMine.map(cid => ({
          id: cid,
          title: myCoursesMap[cid] || '',
          progress: getCourseProgress(uid, cid),
        }))
      };
    }
    return Object.values(map);
  }, [enrollments, myCourseIds, allUsers, myCoursesMap, getCourseProgress]);

  const filtered = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s => s.user.name.toLowerCase().includes(q) || s.user.email.toLowerCase().includes(q));
  }, [students, searchQuery]);

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.courses.some(c => c.progress > 0 && c.progress < 100)).length;
  const completedStudents = students.filter(s => s.courses.some(c => c.progress >= 100)).length;
  const avgProgress = students.length
    ? Math.round(students.reduce((sum, s) => sum + s.courses.reduce((cs, c) => cs + c.progress, 0) / s.courses.length, 0) / students.length)
    : 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Ученики</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Все ученики на ваших курсах</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Всего', value: totalStudents, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
          { label: 'Активных', value: activeStudents, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
          { label: 'Завершили', value: completedStudents, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
          { label: 'Средний прогресс', value: avgProgress, suffix: '%', color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
        ].map((s, i) => (
          <Card key={i} className={`${s.color} border-0`}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[12px] leading-snug text-[#1A1A2E]/60 mb-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              <p className={`text-[24px] sm:text-[28px] leading-tight font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative sm:max-w-md mb-4 sm:mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
        <Input
          placeholder="Поиск учеников..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 sm:h-10 bg-white border-[#1A1A2E]/10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={students.length === 0 ? 'Учеников пока нет' : 'Ничего не найдено'}
          description={students.length === 0 ? 'Запишите учеников на свои курсы или подождите пока они зарегистрируются' : 'Попробуйте изменить поиск'}
        />
      ) : (
        <Card className="border-0">
          <CardContent className="p-1 sm:p-2">
            <div className="divide-y divide-[#1A1A2E]/5">
              {filtered.map((s, i) => {
                const avgPct = Math.round(s.courses.reduce((sum, c) => sum + c.progress, 0) / s.courses.length);
                return (
                  <motion.div
                    key={s.user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start md:items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[#F5F4F2]/50 transition-colors rounded-lg"
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={s.user.avatar} />
                      <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">
                        {s.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-body)' }}>{s.user.name}</p>
                      <p className="text-[12px] text-[#8A8A9A] truncate" style={{ fontFamily: 'var(--font-body)' }}>{s.user.email}</p>
                      {/* На телефоне курсы и прогресс — под именем, на всю ширину строки */}
                      <p className="md:hidden text-[12px] text-[#8A8A9A] truncate mt-1" style={{ fontFamily: 'var(--font-body)' }} title={s.courses.map(c => c.title).join(', ')}>
                        {s.courses.length === 1 ? s.courses[0].title : pluralize(s.courses.length, ['курс', 'курса', 'курсов'])}
                      </p>
                      <div className="md:hidden flex items-center gap-2 mt-1.5">
                        <Progress value={avgPct} className="h-1.5 flex-1" aria-label="Прогресс" />
                        <span className="text-[12px] font-semibold text-[#1A1A2E] w-9 text-right">{avgPct}%</span>
                      </div>
                    </div>
                    <div className="hidden md:block flex-1 min-w-0 max-w-xs">
                      <p className="text-[12px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                        {pluralize(s.courses.length, ['курс', 'курса', 'курсов'])}
                      </p>
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {s.courses.slice(0, 2).map(c => (
                          <Badge key={c.id} variant="secondary" title={c.title} className="text-[11px] max-w-full shrink justify-start">
                            <span className="truncate">{c.title}</span>
                          </Badge>
                        ))}
                        {s.courses.length > 2 && <Badge variant="secondary" className="text-[11px]">+{s.courses.length - 2}</Badge>}
                      </div>
                    </div>
                    <div className="hidden md:block w-28 shrink-0">
                      <p className="text-[12px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Прогресс</p>
                      <div className="flex items-center gap-2">
                        <Progress value={avgPct} className="h-1.5 flex-1" />
                        <span className="text-[12px] font-semibold text-[#1A1A2E]">{avgPct}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
