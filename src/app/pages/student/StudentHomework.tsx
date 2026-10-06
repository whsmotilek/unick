import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FileCheck, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { HomeworkPanel, HomeworkStatusBadge } from '../../components/lesson/HomeworkPanel';
import { lessonData, homeworkDeadline } from '../../lib/lessonContent';
import { sanitizeHtml } from '../../lib/sanitize';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';

export function StudentHomework() {
  const { user } = useAuth();
  const { courses, getHomeworkForStudent, enrollments, enrollmentRecords } = useDataStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

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
            const data = lessonData(l);
            const enrolledAt = enrollmentRecords.find(e => e.userId === user.id && e.courseId === c.id)?.createdAt;
            tasks.push({
              lessonId: l.id,
              courseId: c.id,
              courseTitle: c.title,
              moduleTitle: m.title,
              lessonTitle: l.title,
              instructions: data.html || '',
              deadline: homeworkDeadline(data, enrolledAt),
              submitted: submission,
            });
          }
        }
      }
    }
    return tasks;
  }, [user, courses, enrollments, enrollmentRecords, getHomeworkForStudent]);

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

  const daysToDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return days;
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Домашние задания</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Сдавайте работы и получайте обратную связь</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Всего', value: counts.all, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
          { label: 'К сдаче', value: counts.pending, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
          { label: 'На проверке', value: counts.submitted, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
          { label: 'Проверено', value: counts.graded, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
        ].map((s, i) => (
          <Card key={i} className={`${s.color} border-0`}>
            <CardContent className="px-4 py-3 [&:last-child]:pb-3 sm:p-5 sm:[&:last-child]:pb-5 max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-2">
              <p className="text-[13px] sm:text-[12px] leading-tight text-[#1A1A2E]/70 sm:mb-1 min-w-0" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              <p className={`text-[22px] sm:text-[28px] leading-tight font-bold shrink-0 ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible [scrollbar-width:none]">
        {[
          { id: 'all', label: 'Все' },
          { id: 'pending', label: 'К сдаче' },
          { id: 'submitted', label: 'На проверке' },
          { id: 'graded', label: 'Проверено' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`shrink-0 px-4 h-10 rounded-lg text-sm font-medium transition-all ${
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
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div className="flex-1 min-w-0 basis-60">
                        <p className="text-[12px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                          {task.courseTitle} · {task.moduleTitle}
                        </p>
                        <h3 className="text-[17px] sm:text-[18px] leading-snug font-semibold text-[#1A1A2E] break-words" style={{ fontFamily: 'var(--font-heading)' }}>
                          {task.lessonTitle}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <HomeworkStatusBadge status={status} />
                        {!status && days !== null && (
                          <Badge variant={days < 3 ? 'destructive' : days < 7 ? 'warning' : 'secondary'}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {days < 0 ? 'Просрочено' : days === 0 ? 'Сегодня' : `Осталось ${days} дн.`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="lesson-content lesson-content--compact mb-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(task.instructions) }} />
                    <HomeworkPanel courseId={task.courseId} lessonId={task.lessonId} title={task.lessonTitle}
                      description={task.instructions} deadline={task.deadline} />
                    <Link to={`/student/courses/${task.courseId}/lesson/${task.lessonId}`} className="inline-flex items-center min-h-10 text-sm text-[#7C6AF7] hover:underline mt-2">
                      Открыть урок<ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
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
