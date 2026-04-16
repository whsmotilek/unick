import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { FileCheck, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function StudentHomework() {
  const { user } = useAuth();
  const { courses, getHomeworkForStudent, submitHomework, enrollments } = useDataStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [submissions, setSubmissions] = useState<Record<string, string>>({});

  // Build "available" homework: all homework lessons in enrolled courses
  const availableTasks = useMemo(() => {
    if (!user) return [];
    const enrolledIds = enrollments[user.id] || [];
    const userHw = getHomeworkForStudent(user.id);
    const tasks: Array<{
      lessonId: string;
      courseId: string;
      courseTitle: string;
      moduleTitle: string;
      lessonTitle: string;
      instructions: string;
      deadline?: string;
      submitted?: typeof userHw[0];
    }> = [];
    for (const c of courses) {
      if (!enrolledIds.includes(c.id)) continue;
      for (const m of c.modules) {
        for (const l of m.lessons) {
          if (l.type === 'homework') {
            const submission = userHw.find(h => h.lessonId === l.id);
            tasks.push({
              lessonId: l.id,
              courseId: c.id,
              courseTitle: c.title,
              moduleTitle: m.title,
              lessonTitle: l.title,
              instructions: l.content?.data?.instructions || '',
              deadline: l.content?.data?.deadline,
              submitted: submission,
            });
          }
        }
      }
    }
    return tasks;
  }, [user, courses, enrollments, getHomeworkForStudent]);

  const filtered = useMemo(() => {
    if (filter === 'all') return availableTasks;
    if (filter === 'pending') return availableTasks.filter(t => !t.submitted);
    if (filter === 'submitted') return availableTasks.filter(t => t.submitted?.status === 'submitted' || t.submitted?.status === 'review');
    if (filter === 'graded') return availableTasks.filter(t => t.submitted?.status === 'approved' || t.submitted?.status === 'returned');
    return availableTasks;
  }, [availableTasks, filter]);

  const counts = useMemo(() => ({
    all: availableTasks.length,
    pending: availableTasks.filter(t => !t.submitted).length,
    submitted: availableTasks.filter(t => t.submitted?.status === 'submitted' || t.submitted?.status === 'review').length,
    graded: availableTasks.filter(t => t.submitted?.status === 'approved' || t.submitted?.status === 'returned').length,
  }), [availableTasks]);

  const handleSubmit = (task: typeof availableTasks[0]) => {
    if (!user) return;
    const content = submissions[task.lessonId];
    if (!content?.trim()) {
      toast.error('Введите решение задания');
      return;
    }
    submitHomework({
      lessonId: task.lessonId,
      studentId: user.id,
      courseId: task.courseId,
      title: task.lessonTitle,
      description: task.instructions,
      deadline: task.deadline,
      content,
    });
    setSubmissions(prev => ({ ...prev, [task.lessonId]: '' }));
    toast.success('Работа отправлена!');
  };

  const daysToDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return days;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Домашние задания</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Сдавайте работы и получайте обратную связь</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Всего', value: counts.all, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
          { label: 'К сдаче', value: counts.pending, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
          { label: 'На проверке', value: counts.submitted, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
          { label: 'Проверено', value: counts.graded, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
        ].map((s, i) => (
          <Card key={i} className={`${s.color} border-0`}>
            <CardContent className="p-5">
              <p className="text-[12px] text-[#1A1A2E]/60 mb-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              <p className={`text-[28px] font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'all', label: 'Все' },
          { id: 'pending', label: 'К сдаче' },
          { id: 'submitted', label: 'На проверке' },
          { id: 'graded', label: 'Проверено' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === t.id ? 'bg-[#1A1A2E] text-white' : 'bg-white text-[#8A8A9A] hover:bg-[#F5F4F2]'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title={filter === 'pending' ? 'Нет заданий к сдаче' : filter === 'all' ? 'Пока нет заданий' : 'Нет заданий в этой категории'}
          description={availableTasks.length === 0 ? 'Запишитесь на курс с заданиями' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((task, i) => {
            const days = daysToDeadline(task.deadline);
            const status = task.submitted?.status;
            return (
              <motion.div key={task.lessonId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div className="flex-1">
                        <p className="text-[12px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                          {task.courseTitle} · {task.moduleTitle}
                        </p>
                        <h3 className="text-[18px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                          {task.lessonTitle}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'approved' && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Принято</Badge>}
                        {status === 'returned' && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />На доработку</Badge>}
                        {(status === 'submitted' || status === 'review') && <Badge variant="info"><Clock className="w-3 h-3 mr-1" />На проверке</Badge>}
                        {!status && days !== null && (
                          <Badge variant={days < 3 ? 'destructive' : days < 7 ? 'warning' : 'secondary'}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {days < 0 ? 'Просрочено' : days === 0 ? 'Сегодня' : `Осталось ${days} дн.`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-[13px] text-[#1A1A2E]/70 mb-4 whitespace-pre-line" style={{ fontFamily: 'var(--font-body)' }}>
                      {task.instructions}
                    </p>

                    {task.submitted && (
                      <div className="bg-[#F5F4F2] rounded-xl p-4 mb-4">
                        <p className="text-[11px] font-semibold text-[#8A8A9A] mb-2 uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                          Ваше решение
                        </p>
                        <p className="text-[13px] text-[#1A1A2E] whitespace-pre-line" style={{ fontFamily: 'var(--font-body)' }}>
                          {task.submitted.submission?.content}
                        </p>
                        {task.submitted.feedback && (
                          <div className="mt-4 pt-4 border-t border-[#1A1A2E]/10">
                            <p className="text-[11px] font-semibold text-[#8A8A9A] mb-2 uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                              Обратная связь от автора
                            </p>
                            <p className="text-[13px] text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                              {task.submitted.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {(!task.submitted || status === 'returned') && (
                      <div className="space-y-3">
                        <Textarea
                          rows={5}
                          placeholder="Опишите ваше решение..."
                          value={submissions[task.lessonId] || ''}
                          onChange={e => setSubmissions(prev => ({ ...prev, [task.lessonId]: e.target.value }))}
                        />
                        <Button onClick={() => handleSubmit(task)} className="transition-transform active:scale-[0.98]">
                          Сдать работу
                        </Button>
                      </div>
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
