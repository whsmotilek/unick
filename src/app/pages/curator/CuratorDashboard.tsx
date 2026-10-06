import { useMemo, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import { FileCheck, Users, AlertTriangle, Clock, CheckCircle2, LogOut, AlertCircle } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { CountUp } from '../../components/CountUp';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { sanitizeHtml } from '../../lib/sanitize';
import { FileList } from '../../components/lesson/FileList';
import { NotificationBell } from '../../components/NotificationBell';
import { useNavigate } from 'react-router';
import { Homework, User } from '../../types';
import { localDayKey, pluralize } from '../../lib/analytics';
import logoWhiteFull from '@/assets/logo/logo-full-white.png';

export function CuratorDashboard() {
  const { user, logout } = useAuth();
  const { courses, enrollments, progress, homework, getCourseProgress, reviewHomework, users } = useDataStore();
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const allUsers = users;

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
    const today = localDayKey(new Date());
    return homework.filter(h => h.reviewedAt && localDayKey(new Date(h.reviewedAt)) === today).length;
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
      <header className="bg-[#1A1A2E] sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto h-14 sm:h-16 pl-4 pr-2 sm:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src={logoWhiteFull} alt="Unick" className="h-5 sm:h-6 shrink-0" />
            <Badge variant="secondary" className="bg-white/15 text-white border-0 text-[12px]">Куратор</Badge>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <NotificationBell variant="dark" />
            <Avatar className="w-8 h-8 hidden sm:flex">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-white text-sm hidden md:inline" style={{ fontFamily: 'var(--font-body)' }}>{user?.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Выйти" title="Выйти" className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-1 break-words" style={{ fontFamily: 'var(--font-heading)' }}>
            Привет, {user?.name?.split(' ')[0] || 'Куратор'}!
          </h1>
          <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
            Ваша задача — помочь ученикам успешно пройти курсы
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`${s.color} border-0`}>
                <CardContent className="p-4 sm:p-5">
                  <s.icon className={`w-5 h-5 ${s.text} mb-2 sm:mb-3`} strokeWidth={1.5} />
                  <p className={`text-[24px] sm:text-[28px] leading-tight font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                    <CountUp value={s.value} />
                  </p>
                  <p className="text-[12px] leading-snug text-[#1A1A2E]/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending homework */}
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1A1A2E] mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
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
                      <Card
                        role="button"
                        tabIndex={0}
                        className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#7C6AF7]"
                        onClick={() => openReview(hw)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReview(hw); } }}
                      >
                        <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarImage src={student?.avatar} />
                            <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{student?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                              {student?.name || 'Студент'}
                            </p>
                            <p className="text-[12px] text-[#8A8A9A] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                              {hw.title} · {coursesMap[hw.courseId]}
                            </p>
                          </div>
                          <Badge variant="info" className="text-[12px] shrink-0"><Clock className="w-3 h-3 mr-1" />Проверить</Badge>
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
            <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1A1A2E] mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
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
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start sm:items-center gap-3 mb-3">
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarImage src={s.user.avatar} />
                            <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{s.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-body)' }}>{s.user.name}</p>
                            <p className="text-[12px] text-[#8A8A9A] truncate" style={{ fontFamily: 'var(--font-body)' }}>{s.courseTitle}</p>
                            {/* На телефоне статус — под именем, чтобы не наезжал на длинные имена */}
                            <Badge variant="destructive" className="sm:hidden mt-1.5 text-[12px]">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {s.daysSince === 999 ? 'Не начал' : `${pluralize(s.daysSince, ['день', 'дня', 'дней'])} без активности`}
                            </Badge>
                          </div>
                          <Badge variant="destructive" className="hidden sm:inline-flex text-[12px] shrink-0">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {s.daysSince === 999 ? 'Не начал' : `${pluralize(s.daysSince, ['день', 'дня', 'дней'])} без активности`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={s.progressPct} className="h-1.5 flex-1" />
                          <span className="text-[12px] font-semibold text-[#1A1A2E] w-9 text-right">{s.progressPct}%</span>
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
        {/* Шапка и кнопки закреплены, прокручивается только содержимое */}
        <DialogContent className="flex flex-col gap-0 p-0 max-sm:p-0 overflow-hidden w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[85vh]">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 pr-12 sm:pr-12 text-left border-b border-[#1A1A2E]/5 shrink-0">
            <DialogTitle className="text-[16px] sm:text-lg leading-snug break-words">{selectedHw?.title}</DialogTitle>
            {selectedHw && (
              <DialogDescription className="text-[12px] sm:text-[13px] text-[#8A8A9A] break-words">
                {userMap[selectedHw.studentId]?.name || 'Студент'} · {coursesMap[selectedHw.courseId]}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedHw && (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4">
              <div className="bg-[#F5F4F2] rounded-xl p-3 sm:p-4">
                <p className="text-[12px] font-semibold text-[#8A8A9A] mb-2 uppercase" style={{ fontFamily: 'var(--font-body)' }}>Задание</p>
                <div className="lesson-content lesson-content--compact break-words [overflow-wrap:anywhere]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedHw.description || '') }} />
              </div>
              <div className="bg-white border border-[#1A1A2E]/10 rounded-xl p-3 sm:p-4 min-w-0">
                <p className="text-[12px] font-semibold text-[#8A8A9A] mb-2 uppercase" style={{ fontFamily: 'var(--font-body)' }}>Решение ученика</p>
                <p className="text-[14px] sm:text-[13px] leading-relaxed text-[#1A1A2E] whitespace-pre-line [overflow-wrap:anywhere]" style={{ fontFamily: 'var(--font-body)' }}>
                  {selectedHw.submission?.content || (selectedHw.files?.length ? '' : 'Нет содержимого')}
                </p>
                {(selectedHw.files?.length ?? 0) > 0 && (
                  <div className="mt-3 min-w-0"><FileList files={selectedHw.files!} bucket="homework-files" /></div>
                )}
              </div>
              <div>
                <label htmlFor="curator-hw-feedback" className="text-[13px] sm:text-[12px] font-medium text-[#1A1A2E] mb-1.5 block" style={{ fontFamily: 'var(--font-body)' }}>
                  Обратная связь
                </label>
                <Textarea id="curator-hw-feedback" rows={4} placeholder="Напишите комментарий..." value={feedback} onChange={e => setFeedback(e.target.value)} className="text-base sm:text-sm" />
              </div>
            </div>
          )}
          <DialogFooter className="grid grid-cols-2 sm:flex shrink-0 gap-2 px-4 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 border-t border-[#1A1A2E]/5 bg-background">
            <Button variant="outline" onClick={() => handleReview('returned')} className="h-11 sm:h-10 px-3 text-[#FF6B6B] border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10">
              На доработку
            </Button>
            <Button onClick={() => handleReview('approved')} className="h-11 sm:h-10 px-3 bg-[#C5E8A0] text-[#2D5016] hover:bg-[#B5D890]">
              <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-2" />Принять
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
