import { useMemo, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Search, MessageSquare, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { CountUp } from '../../components/CountUp';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { mockUsers } from '../../data/mockData';
import { User } from '../../types';

type Stage = 'all' | 'leads' | 'active' | 'completing' | 'at_risk' | 'completed';

export function AuthorCRM() {
  const { user } = useAuth();
  const { courses, enrollments, progress, getCourseProgress, getCompletedLessonsCount } = useDataStore();
  const [stage, setStage] = useState<Stage>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const myCourseIds = useMemo(() => {
    return courses.filter(c => c.schoolId === (user?.schoolId || 'school-1')).map(c => c.id);
  }, [courses, user]);

  const allUsers = useMemo<User[]>(() => {
    try {
      const stored = localStorage.getItem('unick_users');
      return stored ? JSON.parse(stored) : mockUsers;
    } catch { return mockUsers; }
  }, []);

  const userMap = useMemo(() => {
    const m: Record<string, User> = {};
    for (const u of allUsers) m[u.id] = u;
    return m;
  }, [allUsers]);

  // Build student records with stage classification
  const students = useMemo(() => {
    const items: Array<{
      user: User;
      avgProgress: number;
      coursesCount: number;
      lastActivityDays: number;
      stage: Stage;
      courseTitles: string[];
    }> = [];

    for (const [uid, cids] of Object.entries(enrollments)) {
      const enrolledMine = cids.filter(cid => myCourseIds.includes(cid));
      if (enrolledMine.length === 0) continue;
      const u = userMap[uid];
      if (!u) continue;

      let totalProgress = 0;
      let lastActivity = 0;
      const courseTitles: string[] = [];
      for (const cid of enrolledMine) {
        const p = progress[uid]?.[cid];
        const pct = getCourseProgress(uid, cid);
        totalProgress += pct;
        if (p?.lastActivity) {
          const t = new Date(p.lastActivity).getTime();
          if (t > lastActivity) lastActivity = t;
        }
        const c = courses.find(c => c.id === cid);
        if (c) courseTitles.push(c.title);
      }
      const avgProgress = Math.round(totalProgress / enrolledMine.length);
      const lastActivityDays = lastActivity ? Math.floor((Date.now() - lastActivity) / 86400000) : 999;

      let s: Stage;
      if (avgProgress === 0) s = 'leads';
      else if (avgProgress >= 100) s = 'completed';
      else if (lastActivityDays >= 7) s = 'at_risk';
      else if (avgProgress >= 70) s = 'completing';
      else s = 'active';

      items.push({ user: u, avgProgress, coursesCount: enrolledMine.length, lastActivityDays, stage: s, courseTitles });
    }
    return items;
  }, [enrollments, myCourseIds, userMap, progress, getCourseProgress, courses]);

  const stageCounts = useMemo(() => ({
    all: students.length,
    leads: students.filter(s => s.stage === 'leads').length,
    active: students.filter(s => s.stage === 'active').length,
    completing: students.filter(s => s.stage === 'completing').length,
    at_risk: students.filter(s => s.stage === 'at_risk').length,
    completed: students.filter(s => s.stage === 'completed').length,
  }), [students]);

  const filtered = useMemo(() => {
    let list = students;
    if (stage !== 'all') list = list.filter(s => s.stage === stage);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.user.name.toLowerCase().includes(q) || s.user.email.toLowerCase().includes(q));
    }
    return list;
  }, [students, stage, search]);

  const stages: { id: Stage; label: string; color: string; text: string }[] = [
    { id: 'leads', label: 'Лиды', color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
    { id: 'active', label: 'Активные', color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
    { id: 'completing', label: 'Завершают', color: 'bg-[#F5E642]', text: 'text-[#5A5000]' },
    { id: 'at_risk', label: 'В риске', color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
    { id: 'completed', label: 'Завершили', color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
  ];

  const selected = selectedId ? students.find(s => s.user.id === selectedId) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>CRM</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Воронка учеников и работа с ними</p>
      </div>

      {/* Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stages.map(s => (
          <button key={s.id} onClick={() => setStage(s.id === stage ? 'all' : s.id)}>
            <Card className={`${s.color} border-0 ${stage === s.id ? 'ring-2 ring-[#7C6AF7]' : ''} hover:shadow-md transition-all`}>
              <CardContent className="p-4 text-center">
                <p className={`text-[24px] font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  <CountUp value={stageCounts[s.id]} />
                </p>
                <p className="text-[11px] text-[#1A1A2E]/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
              Ученики {stage !== 'all' ? `(${stages.find(s => s.id === stage)?.label})` : ''}
            </h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
              <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="Нет учеников"
              description={students.length === 0 ? 'Здесь появятся ученики записанные на ваши курсы' : 'В этой стадии воронки никого нет'}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((s, i) => {
                const stageData = stages.find(st => st.id === s.stage);
                return (
                  <motion.div key={s.user.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card
                      className={`border-0 cursor-pointer hover:shadow-md transition-all ${selectedId === s.user.id ? 'ring-2 ring-[#7C6AF7]' : ''}`}
                      onClick={() => setSelectedId(s.user.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={s.user.avatar} />
                          <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{s.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>{s.user.name}</p>
                          <p className="text-[11px] text-[#8A8A9A] truncate" style={{ fontFamily: 'var(--font-body)' }}>{s.user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`${stageData?.color} ${stageData?.text} border-0 text-[10px]`}>
                            {stageData?.label}
                          </Badge>
                          <span className="text-[12px] font-semibold text-[#1A1A2E] w-10 text-right" style={{ fontFamily: 'var(--font-body)' }}>{s.avgProgress}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected student detail */}
        <div>
          <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Карточка</h2>
          {!selected ? (
            <Card className="border-0">
              <CardContent className="p-8 text-center">
                <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  Выберите ученика чтобы увидеть детали
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={selected.user.id}>
              <Card className="border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selected.user.avatar} />
                      <AvatarFallback className="bg-[#7C6AF7] text-white">{selected.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[15px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>{selected.user.name}</p>
                      <p className="text-[12px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>{selected.user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-[11px] text-[#8A8A9A] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Средний прогресс</p>
                      <div className="flex items-center gap-2">
                        <Progress value={selected.avgProgress} className="h-2 flex-1" />
                        <span className="text-[13px] font-semibold text-[#1A1A2E]">{selected.avgProgress}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[12px]" style={{ fontFamily: 'var(--font-body)' }}>
                      <div className="bg-[#F5F4F2] rounded-xl p-3">
                        <p className="text-[#8A8A9A] mb-1">Курсов</p>
                        <p className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>{selected.coursesCount}</p>
                      </div>
                      <div className="bg-[#F5F4F2] rounded-xl p-3">
                        <p className="text-[#8A8A9A] mb-1">Активность</p>
                        <p className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                          {selected.lastActivityDays === 999 ? '—' : `${selected.lastActivityDays} дн.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-[#8A8A9A] mb-2 uppercase" style={{ fontFamily: 'var(--font-body)' }}>Курсы</p>
                    <div className="space-y-1">
                      {selected.courseTitles.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-[11px] mr-1 mb-1">{t}</Badge>
                      ))}
                    </div>
                  </div>

                  <Link to="/author/chat">
                    <Button className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />Написать
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
