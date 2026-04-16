import { useMemo, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import { FileCheck, Users, AlertTriangle, Clock, CheckCircle2, LogOut, AlertCircle } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { CountUp } from '../../components/CountUp';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Homework, User } from '../../types';
import { mockUsers } from '../../data/mockData';
import logoWhiteFull from '@/assets/logo/logo-full-white.png';

export function CuratorDashboard() {
  const { user, logout } = useAuth();
  const { courses, enrollments, progress, homework, getCourseProgress, reviewHomework } = useDataStore();
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // All users from localStorage
  const allUsers = useMemo<User[]>(() => {
    try {
      const stored = localStorage.getItem('unick_users');
      return stored ? JSON.parse(stored) : mockUsers;
    } catch { return mockUsers; }
  }, [homework, enrollments]);

  const userMap = useMemo(() => {
    const m: Record<string, User> = {};
    for (const u of allUsers) m[u.id] = u;
    return m;
  }, [allUsers]);

  const coursesMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of courses) m[c.id] = c.title;
    return m;
  }, [courses]);

  // Pending homework (curator reviews ALL homework)
  const pendingHw = useMemo(() => {
    return homework.filter(h => h.status === 'submitted' || h.status === 'review');
  }, [homework]);

  const reviewedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return homework.filter(h => h.reviewedAt && h.reviewedAt.slice(0, 10) === today).length;
  }, [homework]);

  // At-risk students: enrolled but no activity in 7+ days
  const atRiskStudents = useMemo(() => {
    const items: { user: User; courseTitle: string; daysSince: number; progressPct: number }[] = [];
    for (const [uid, cids] of Object.entries(enrollments)) {
      const u = userMap[uid];
      if (!u || u.role !== 'student') continue;
      for (const cid of cids) {
        const p = progress[uid]?.[cid];
        if (!p) {
          // Enrolled but no progress
          items.push({ user: u, courseTitle: coursesMap[cid] || '', daysSince: 999, progressPct: 0 });
        } else {
          const daysSince = Math.floor((Date.now() - new Date(p.lastActivity).getTime()) / 86400000);
          if (daysSince >= 7 && p.progress < 100) {
            items.push({ user: u, courseTitle: coursesMap[cid] || '', daysSince, progressPct: p.progress });
          }
        }
      }
    }
    return items.sort((a, b) => b.daysSince - a.daysSince).slice(0, 5);
  }, [enrollments, progress, userMap, coursesMap]);

  const totalStudents = useMemo(() => {
    return new Set(Object.keys(enrollments)).size;
  }, [enrollments]);

  const stats = [
    { label: 'ДЗ на проверке', value: pendingHw.length, icon: FileCheck, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
    { label: 'Проверено сегодня', value: reviewedToday, icon: CheckCircle2, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
    { label: 'В зоне риска', value: atRiskStudents.length, icon: AlertTriangle, color: 'bg-[#F5E642]', text: 'text-[#5A5000]' },
    { label: 'Всего учеников', value: totalStudents, icon: Users, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
  ];

  const openReview = (hw: Homework) => {
    setSelectedHw(hw);
    setFeedback(hw.feedback || '');
  };

  const handleReview = (status: 'approved' | 'returned') => {
    if (!selectedHw || !user) return;
    if (status === 'returned' && !feedback.trim()) {
      toast.error('Напишите комментарий для доработки');
      return;
    }
    reviewHomework(selectedHw.id, status, feedback, user.id);
    toast.success(status === 'approved' ? 'Работа принята!' : 'Возвращено на доработку');
    setSelectedHw(null);
    setFeedback('');
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-[#1A1A2E] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoWhiteFull} alt="Unick" className="h-6" />
            <Badge variant="secondary" className="bg-white/15 text-white border-0">Куратор</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-white text-sm hidden md:inline" style={{ fontFamily: 'var(--font-body)' }}>{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/70 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
            Привет, {user?.name?.split(' ')[0] || 'Куратор'}!
          </h1>
          <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
            Ваша задача — помочь ученикам успешно пройти курсы
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`${s.color} border-0`}>
                <CardContent className="p-5">
                  <s.icon className={`w-5 h-5 ${s.text} mb-3`} strokeWidth={1.5} />
                  <p className={`text-[28px] font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                    <CountUp value={s.value} />
                  </p>
                  <p className="text-[11px] text-[#1A1A2E]/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending homework */}
          <div>
            <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Ожидают проверки
            </h2>
            {pendingHw.length === 0 ? (
              <Card className="border-0">
                <CardContent className="p-6 text-center">
                  <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Все работы проверены 🎉</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingHw.map((hw, i) => {
                  const student = userMap[hw.studentId];
                  return (
                    <motion.div key={hw.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all cursor-pointer" onClick={() => openReview(hw)}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={student?.avatar} />
                            <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{student?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                              {student?.name || 'Студент'}
                            </p>
                            <p className="text-[11px] text-[#8A8A9A] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                              {hw.title} · {coursesMap[hw.courseId]}
                            </p>
                          </div>
                          <Badge variant="info" className="text-[10px]"><Clock className="w-3 h-3 mr-1" />Проверить</Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* At-risk students */}
          <div>
            <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Ученики в зоне риска
            </h2>
            {atRiskStudents.length === 0 ? (
              <Card className="border-0">
                <CardContent className="p-6 text-center">
                  <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Все ученики активны 👍</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {atRiskStudents.map((s, i) => (
                  <motion.div key={`${s.user.id}-${i}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={s.user.avatar} />
                            <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{s.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>{s.user.name}</p>
                            <p className="text-[11px] text-[#8A8A9A] truncate" style={{ fontFamily: 'var(--font-body)' }}>{s.courseTitle}</p>
                          </div>
                          <Badge variant="destructive" className="text-[10px]">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {s.daysSince === 999 ? 'Не начал' : `${s.daysSince} дн.`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={s.progressPct} className="h-1.5 flex-1" />
                          <span className="text-[11px] font-semibold text-[#1A1A2E]">{s.progressPct}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedHw} onOpenChange={(o) => !o && setSelectedHw(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedHw?.title}</DialogTitle>
          </DialogHeader>
          {selectedHw && (
            <div className="space-y-4">
              <div className="bg-[#F5F4F2] rounded-xl p-4">
                <p className="text-[11px] font-semibold text-[#8A8A9A] mb-2 uppercase" style={{ fontFamily: 'var(--font-body)' }}>Задание</p>
                <p className="text-[13px] text-[#1A1A2E] whitespace-pre-line" style={{ fontFamily: 'var(--font-body)' }}>
                  {selectedHw.description}
                </p>
              </div>
              <div className="bg-white border border-[#1A1A2E]/10 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-[#8A8A9A] mb-2 uppercase" style={{ fontFamily: 'var(--font-body)' }}>Решение ученика</p>
                <p className="text-[13px] text-[#1A1A2E] whitespace-pre-line" style={{ fontFamily: 'var(--font-body)' }}>
                  {selectedHw.submission?.content || 'Нет содержимого'}
                </p>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#1A1A2E] mb-1.5 block" style={{ fontFamily: 'var(--font-body)' }}>
                  Обратная связь
                </label>
                <Textarea rows={4} placeholder="Напишите комментарий..." value={feedback} onChange={e => setFeedback(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => handleReview('returned')} className="text-[#FF6B6B] border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10">
              На доработку
            </Button>
            <Button onClick={() => handleReview('approved')} className="bg-[#C5E8A0] text-[#2D5016] hover:bg-[#B5D890]">
              <CheckCircle2 className="w-4 h-4 mr-2" />Принять
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
