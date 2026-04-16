import { useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, Users, BookOpen, FileCheck } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { CountUp } from '../../components/CountUp';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const CHART_COLORS = ['#7C6AF7', '#B8D8F8', '#C5E8A0', '#F5E642', '#F9D0E8', '#FFE5D9'];

export function AuthorAnalytics() {
  const { user } = useAuth();
  const { courses, enrollments, progress, homework, getCourseProgress } = useDataStore();

  const myCourses = useMemo(() => courses.filter(c => c.schoolId === (user?.schoolId || 'school-1')), [courses, user]);

  // Course distribution by students
  const courseDistribution = useMemo(() => {
    return myCourses.map(c => {
      const studentCount = Object.values(enrollments).filter(cids => cids.includes(c.id)).length;
      return { name: c.title.length > 20 ? c.title.slice(0, 20) + '…' : c.title, value: studentCount };
    }).filter(d => d.value > 0);
  }, [myCourses, enrollments]);

  // Lesson completion rates
  const lessonCompletion = useMemo(() => {
    const data: { name: string; rate: number }[] = [];
    for (const c of myCourses.slice(0, 1)) {
      for (const m of c.modules) {
        for (const l of m.lessons) {
          const enrolledStudents = Object.entries(enrollments).filter(([, cids]) => cids.includes(c.id));
          if (enrolledStudents.length === 0) continue;
          const completedCount = enrolledStudents.filter(([uid]) =>
            progress[uid]?.[c.id]?.completedLessons.includes(l.id)
          ).length;
          data.push({
            name: l.title.length > 15 ? l.title.slice(0, 15) + '…' : l.title,
            rate: Math.round((completedCount / enrolledStudents.length) * 100),
          });
        }
      }
    }
    return data;
  }, [myCourses, enrollments, progress]);

  // Activity over last 6 weeks (simplified - group by week)
  const activityData = useMemo(() => {
    const weeks: { week: string; lessons: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      weeks.push({ week: `Нед ${6 - i}`, lessons: 0 });
    }
    for (const userProgress of Object.values(progress)) {
      for (const cp of Object.values(userProgress)) {
        if (!myCourses.some(c => c.id === cp.courseId)) continue;
        for (const lid of cp.completedLessons) {
          // Approximation: distribute completions evenly across weeks
        }
      }
    }
    // Simulate based on lastActivity
    for (const userProgress of Object.values(progress)) {
      for (const cp of Object.values(userProgress)) {
        if (!myCourses.some(c => c.id === cp.courseId)) continue;
        const lastDate = new Date(cp.lastActivity);
        const daysAgo = Math.floor((now.getTime() - lastDate.getTime()) / 86400000);
        const weekIdx = 5 - Math.min(5, Math.floor(daysAgo / 7));
        if (weekIdx >= 0 && weekIdx < 6) {
          weeks[weekIdx].lessons += cp.completedLessons.length;
        }
      }
    }
    return weeks;
  }, [progress, myCourses]);

  const myCourseIds = myCourses.map(c => c.id);
  const totalStudents = new Set(Object.entries(enrollments).flatMap(([uid, cids]) => cids.some(id => myCourseIds.includes(id)) ? [uid] : [])).size;
  const totalLessons = myCourses.reduce((s, c) => s + c.modules.reduce((sm, m) => sm + m.lessons.length, 0), 0);
  const totalCompletions = useMemo(() => {
    let count = 0;
    for (const userProgress of Object.values(progress)) {
      for (const cp of Object.values(userProgress)) {
        if (myCourseIds.includes(cp.courseId)) count += cp.completedLessons.length;
      }
    }
    return count;
  }, [progress, myCourseIds]);
  const pendingHw = homework.filter(h => myCourseIds.includes(h.courseId) && (h.status === 'submitted' || h.status === 'review')).length;

  const stats = [
    { label: 'Активных учеников', value: totalStudents, icon: Users, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
    { label: 'Всего уроков', value: totalLessons, icon: BookOpen, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
    { label: 'Завершений уроков', value: totalCompletions, icon: TrendingUp, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
    { label: 'ДЗ на проверке', value: pendingHw, icon: FileCheck, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Аналитика</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Статистика по вашим курсам</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <Card key={i} className={`${s.color} border-0`}>
            <CardContent className="p-5">
              <s.icon className={`w-5 h-5 ${s.text} mb-3`} strokeWidth={1.5} />
              <p className={`text-[28px] font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                <CountUp value={s.value} />
              </p>
              <p className="text-[11px] text-[#1A1A2E]/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-0">
          <CardContent className="p-6">
            <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Активность по неделям</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#8A8A9A' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8A8A9A' }} />
                <Tooltip />
                <Line type="monotone" dataKey="lessons" stroke="#7C6AF7" strokeWidth={3} dot={{ fill: '#7C6AF7', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-6">
            <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Распределение учеников по курсам</h3>
            {courseDistribution.length === 0 ? (
              <p className="text-center text-[13px] text-[#8A8A9A] py-12" style={{ fontFamily: 'var(--font-body)' }}>Нет данных</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={courseDistribution} dataKey="value" nameKey="name" outerRadius={90} label>
                    {courseDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {lessonCompletion.length > 0 && (
        <Card className="border-0">
          <CardContent className="p-6">
            <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Прохождение уроков (первый курс)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lessonCompletion}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8A8A9A' }} angle={-15} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12, fill: '#8A8A9A' }} />
                <Tooltip />
                <Bar dataKey="rate" fill="#7C6AF7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
