import { useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, BookOpen, FileCheck, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { CountUp } from '../../components/CountUp';
import { motion } from 'motion/react';

export function AuthorDashboard() {
  const { user } = useAuth();
  const { courses, enrollments, homework, getCourseProgress, users } = useDataStore();

  const myCourses = useMemo(() => {
    return courses.filter(c => c.schoolId === user?.schoolId);
  }, [courses, user]);

  const myCourseIds = useMemo(() => myCourses.map(c => c.id), [myCourses]);

  const stats = useMemo(() => {
    const studentSet = new Set<string>();
    let progressSum = 0, progressCount = 0;
    for (const [uid, cids] of Object.entries(enrollments)) {
      for (const cid of cids) {
        if (myCourseIds.includes(cid)) {
          studentSet.add(uid);
          progressSum += getCourseProgress(uid, cid);
          progressCount++;
        }
      }
    }
    const myHw = homework.filter(h => myCourseIds.includes(h.courseId));
    const pendingHw = myHw.filter(h => h.status === 'submitted' || h.status === 'review').length;

    return {
      activeStudents: studentSet.size,
      totalCourses: myCourses.length,
      pendingHw,
      avgProgress: progressCount ? Math.round(progressSum / progressCount) : 0,
    };
  }, [myCourseIds, enrollments, homework, getCourseProgress, myCourses]);

  // Recent activity = recent submissions + completions
  const recentActivity = useMemo(() => {
    const userMap: Record<string, (typeof users)[number]> = {};
    for (const u of users) userMap[u.id] = u;

    const items: Array<{ time: string; userId: string; userName: string; userAvatar?: string; action: string; courseTitle?: string }> = [];

    homework.filter(h => myCourseIds.includes(h.courseId) && h.submittedAt).forEach(h => {
      const u = userMap[h.studentId];
      const c = courses.find(c => c.id === h.courseId);
      items.push({
        time: h.submittedAt!,
        userId: h.studentId,
        userName: u?.name || 'Студент',
        userAvatar: u?.avatar,
        action: `сдал ДЗ "${h.title}"`,
        courseTitle: c?.title,
      });
    });

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  }, [homework, myCourseIds, courses, users]);

  const dashStats = [
    { label: 'Активных учеников', value: stats.activeStudents, icon: Users, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
    { label: 'Курсов', value: stats.totalCourses, icon: BookOpen, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
    { label: 'ДЗ на проверке', value: stats.pendingHw, icon: FileCheck, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
    { label: 'Средний прогресс', value: stats.avgProgress, suffix: '%', icon: TrendingUp, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-1 break-words" style={{ fontFamily: 'var(--font-heading)' }}>
            Добро пожаловать, {user?.name?.split(' ')[0] || 'Автор'}!
          </h1>
          <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
            Обзор вашей онлайн-школы
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto transition-transform active:scale-[0.98]">
          <Link to="/author/courses/new">
            <Plus className="w-4 h-4 mr-2" />Создать курс
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {dashStats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`${s.color} border-0`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <s.icon className={`w-5 h-5 ${s.text}`} strokeWidth={1.5} />
                </div>
                <p className={`text-[24px] sm:text-[28px] leading-tight font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[12px] leading-snug text-[#1A1A2E]/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Последняя активность</h2>
          </div>
          <Card className="border-0">
            <CardContent className="p-2">
              {recentActivity.length === 0 ? (
                <p className="text-center text-[13px] text-[#8A8A9A] py-8" style={{ fontFamily: 'var(--font-body)' }}>
                  Активности пока нет
                </p>
              ) : (
                <div className="divide-y divide-[#1A1A2E]/5">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="w-9 h-9 rounded-full bg-[#7C6AF7] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {item.userAvatar ? <img src={item.userAvatar} alt="" className="w-full h-full rounded-full object-cover" /> : item.userName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#1A1A2E] break-words" style={{ fontFamily: 'var(--font-body)' }}>
                          <strong>{item.userName}</strong> {item.action}
                        </p>
                        <p className="text-[12px] text-[#8A8A9A] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                          {item.courseTitle} · {new Date(item.time).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1A1A2E] mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Быстрые действия</h2>
          <div className="space-y-2 sm:space-y-3">
            <Link to="/author/courses" className="block">
              <Card className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all cursor-pointer">
                <CardContent className="p-3 sm:p-4 min-h-14 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EDE9FF] flex items-center justify-center"><BookOpen className="w-4 h-4 text-[#7C6AF7]" /></div>
                    <span className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>Управление курсами</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8A9A]" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/author/homework" className="block">
              <Card className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all cursor-pointer">
                <CardContent className="p-3 sm:p-4 min-h-14 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FFE5D9] flex items-center justify-center"><FileCheck className="w-4 h-4 text-[#FF6B6B]" /></div>
                    <span className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>Проверка ДЗ</span>
                  </div>
                  {stats.pendingHw > 0 && <Badge variant="destructive">{stats.pendingHw}</Badge>}
                </CardContent>
              </Card>
            </Link>
            <Link to="/author/students" className="block">
              <Card className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all cursor-pointer">
                <CardContent className="p-3 sm:p-4 min-h-14 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#B8D8F8] flex items-center justify-center"><Users className="w-4 h-4 text-[#0D3B66]" /></div>
                    <span className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>Ученики</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8A9A]" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/author/analytics" className="block">
              <Card className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all cursor-pointer">
                <CardContent className="p-3 sm:p-4 min-h-14 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#C5E8A0] flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#2D5016]" /></div>
                    <span className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>Аналитика</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8A9A]" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
