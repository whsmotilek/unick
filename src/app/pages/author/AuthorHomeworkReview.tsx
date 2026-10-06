import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { FileCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { sanitizeHtml } from '../../lib/sanitize';
import { FileList } from '../../components/lesson/FileList';
import { Homework } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const isPending = (h: Homework) => h.status === 'submitted' || h.status === 'review';
const isReviewed = (h: Homework) => h.status === 'approved' || h.status === 'returned';
const submittedTime = (h: Homework) => (h.submittedAt ? new Date(h.submittedAt).getTime() : 0);

export function AuthorHomeworkReview() {
  const { user } = useAuth();
  const { courses, homework, reviewHomework, users } = useDataStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [feedback, setFeedback] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const myCourses = useMemo(() => courses.filter(c => c.schoolId === user?.schoolId), [courses, user]);
  const myCourseIds = useMemo(() => myCourses.map(c => c.id), [myCourses]);

  const userMap = useMemo(() => {
    const map: Record<string, (typeof users)[number]> = {};
    for (const u of users) map[u.id] = u;
    return map;
  }, [users]);

  const myCoursesMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of courses) m[c.id] = c.title;
    return m;
  }, [courses]);

  const submissions = useMemo(() => {
    return homework.filter(h => myCourseIds.includes(h.courseId) && (courseFilter === 'all' || h.courseId === courseFilter));
  }, [homework, myCourseIds, courseFilter]);

  // «На проверке» — сначала те, кто ждёт дольше всех; остальные — сначала новые
  const filtered = useMemo(() => {
    if (filter === 'pending') return submissions.filter(isPending).sort((a, b) => submittedTime(a) - submittedTime(b));
    const list = filter === 'reviewed' ? submissions.filter(isReviewed) : [...submissions];
    return list.sort((a, b) => submittedTime(b) - submittedTime(a));
  }, [submissions, filter]);

  const counts = {
    all: submissions.length,
    pending: submissions.filter(isPending).length,
    reviewed: submissions.filter(isReviewed).length,
  };

  const openReview = (hw: Homework) => {
    setSelectedHw(hw);
    // Повторно сданную работу проверяем с чистого листа; прошлый комментарий показан отдельно
    setFeedback(isPending(hw) ? '' : hw.feedback || '');
  };

  const handleReview = (status: 'approved' | 'returned') => {
    if (!selectedHw || !user) return;
    if (status === 'returned' && !feedback.trim()) {
      toast.error('Напишите комментарий для доработки');
      return;
    }
    reviewHomework(selectedHw.id, status, feedback, user.id);
    toast.success(status === 'approved' ? 'Работа принята!' : 'Работа возвращена на доработку');
    setSelectedHw(null);
    setFeedback('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Проверка домашек</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Все работы учеников ваших курсов</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Всего', value: counts.all, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
          { label: 'На проверке', value: counts.pending, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
          { label: 'Проверено', value: counts.reviewed, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
        ].map((s, i) => (
          <Card key={i} className={`${s.color} border-0`}>
            <CardContent className="p-3 sm:p-5">
              <p className="text-[12px] leading-tight text-[#1A1A2E]/60 mb-1 truncate" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              <p className={`text-[22px] sm:text-[28px] leading-tight font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6 sm:items-center">
        <div className="grid grid-cols-3 sm:flex gap-1 sm:gap-2 bg-white sm:bg-transparent rounded-xl p-1 sm:p-0">
        {[
          { id: 'pending', label: 'На проверке' },
          { id: 'reviewed', label: 'Проверенные' },
          { id: 'all', label: 'Все' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            aria-pressed={filter === t.id}
            className={`px-2 sm:px-4 h-10 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === t.id ? 'bg-[#1A1A2E] text-white' : 'bg-white text-[#8A8A9A] hover:bg-[#F5F4F2]'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {t.label}
          </button>
        ))}
        </div>
        {myCourses.length > 1 && (
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger aria-label="Курс" className="w-full sm:w-64 sm:ml-auto h-11 sm:h-10 bg-white border-0 min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все курсы</SelectItem>
              {myCourses.map(c => (
                <SelectItem key={c.id} value={c.id}><span className="truncate max-w-[16rem]">{c.title}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileCheck} title="Нет работ для проверки" description="Здесь появятся домашки, когда ученики их сдадут" />
      ) : (
        <div className="space-y-3">
          {filtered.map((hw, i) => {
            const student = userMap[hw.studentId];
            return (
              <motion.div key={hw.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card
                  role="button"
                  tabIndex={0}
                  className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#7C6AF7]"
                  onClick={() => openReview(hw)}
                  onKeyDown={e => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReview(hw); }
                  }}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={student?.avatar} />
                        <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">
                          {student?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-x-2 gap-y-1 mb-1">
                          <h3 className="text-[14px] font-semibold text-[#1A1A2E] min-w-0 break-words" style={{ fontFamily: 'var(--font-heading)' }}>
                            {student?.name || 'Студент'}
                          </h3>
                          {hw.status === 'approved' && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Принято</Badge>}
                          {hw.status === 'returned' && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Возвращено</Badge>}
                          {(hw.status === 'submitted' || hw.status === 'review') && <Badge variant="info"><Clock className="w-3 h-3 mr-1" />На проверке</Badge>}
                        </div>
                        <p className="text-[13px] text-[#1A1A2E] mb-1 break-words" style={{ fontFamily: 'var(--font-body)' }}>
                          {hw.title}
                        </p>
                        <p className="text-[12px] text-[#8A8A9A] break-words" style={{ fontFamily: 'var(--font-body)' }}>
                          {myCoursesMap[hw.courseId]} · Сдано {hw.submittedAt ? new Date(hw.submittedAt).toLocaleDateString('ru-RU') : '—'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedHw} onOpenChange={(o) => !o && setSelectedHw(null)}>
        {/* Шапка и кнопки закреплены, прокручивается только содержимое — «Принять» всегда под рукой */}
        <DialogContent className="flex flex-col gap-0 p-0 max-sm:p-0 overflow-hidden w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[85vh]">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 pr-12 sm:pr-12 text-left border-b border-[#1A1A2E]/5 shrink-0">
            <DialogTitle className="text-[16px] sm:text-lg leading-snug break-words">{selectedHw?.title}</DialogTitle>
            {selectedHw && (
              <DialogDescription className="text-[12px] sm:text-[13px] text-[#8A8A9A] break-words">
                {userMap[selectedHw.studentId]?.name || 'Студент'} · {myCoursesMap[selectedHw.courseId]}
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
              {isPending(selectedHw) && selectedHw.feedback && (
                <div className="bg-white/60 border border-dashed border-[#1A1A2E]/15 rounded-xl p-3 sm:p-4">
                  <p className="text-[12px] font-semibold text-[#8A8A9A] mb-2 uppercase" style={{ fontFamily: 'var(--font-body)' }}>Прошлый комментарий</p>
                  <p className="text-[13px] text-[#1A1A2E] whitespace-pre-line [overflow-wrap:anywhere]" style={{ fontFamily: 'var(--font-body)' }}>{selectedHw.feedback}</p>
                </div>
              )}
              <div>
                <label htmlFor="hw-feedback" className="text-[13px] sm:text-[12px] font-medium text-[#1A1A2E] mb-1.5 block" style={{ fontFamily: 'var(--font-body)' }}>
                  Обратная связь
                </label>
                <Textarea
                  id="hw-feedback"
                  rows={4}
                  placeholder="Напишите комментарий или замечания..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="text-base sm:text-sm"
                />
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
