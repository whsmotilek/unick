import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Search, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { pluralize } from '../../lib/analytics';

export function StudentCatalog() {
  const { user } = useAuth();
  const { courses, enrollments, enrollFree } = useDataStore();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const enrolledIds = useMemo(() => (user ? (enrollments[user.id] || []) : []), [user, enrollments]);

  // Каталог: открытые для свободной записи курсы + курсы, на которые ученик уже записан.
  // Курсы по приглашению и платные сюда не попадают — в них приходят по ссылке автора.
  const published = useMemo(() => {
    return courses.filter(c =>
      (c.status === 'published' && c.accessType === 'free') || enrolledIds.includes(c.id));
  }, [courses, enrolledIds]);

  const filtered = useMemo(() => {
    if (!searchQuery) return published;
    const q = searchQuery.toLowerCase();
    return published.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [published, searchQuery]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    setBusyId(courseId);
    try {
      await enrollFree(courseId);
      toast.success('Вы записаны на курс!');
      navigate(`/student/courses/${courseId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось записаться');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Каталог курсов</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Найдите курс по душе и начните учиться</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
          <Input
            placeholder="Поиск курсов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 sm:h-10 text-base sm:text-sm bg-white border-[#1A1A2E]/10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={searchQuery ? 'Ничего не найдено' : 'Курсов пока нет'}
          description={searchQuery
            ? 'Попробуйте изменить поиск'
            : 'Открытых курсов пока нет. Если автор прислал вам ссылку-приглашение — откройте её'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((course, i) => {
            const isEnrolled = enrolledIds.includes(course.id);
            // До записи уроки не видны (права доступа), поэтому показываем число модулей
            const moduleCount = course.modules.length;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="border-0 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 duration-300 h-full gap-0">
                  <div className="relative aspect-video bg-[#F5F4F2] overflow-hidden">
                    {isEnrolled && (
                      <Badge variant="success" className="absolute top-3 left-3 z-10">
                        <CheckCircle2 className="w-3 h-3" />Вы записаны
                      </Badge>
                    )}
                    {course.cover ? (
                      <img src={course.cover} alt={course.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8A8A9A]">
                        <BookOpen className="w-12 h-12" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col sm:h-[200px]">
                    <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2 line-clamp-2 break-words [overflow-wrap:anywhere]" style={{ fontFamily: 'var(--font-heading)' }}>
                      {course.title}
                    </h3>
                    <p className="text-[13px] text-[#8A8A9A] mb-4 line-clamp-2 flex-1" style={{ fontFamily: 'var(--font-body)' }}>
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-[12px] text-[#8A8A9A] mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{pluralize(moduleCount, ['модуль', 'модуля', 'модулей'])}</span>
                      {course.accessType === 'paid' && course.price ? <span className="font-semibold text-[#1A1A2E]">{course.price.toLocaleString('ru-RU')} ₽</span> : null}
                    </div>
                    {isEnrolled ? (
                      <Button variant="outline" onClick={() => navigate(`/student/courses/${course.id}`)} className="w-full h-11 sm:h-10">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-[#2D5016]" />Перейти к курсу
                      </Button>
                    ) : course.accessType === 'free' ? (
                      <Button onClick={() => handleEnroll(course.id)} disabled={busyId === course.id} className="w-full h-11 sm:h-10 transition-transform active:scale-[0.98]">
                        {busyId === course.id ? 'Запись...' : 'Записаться бесплатно'}<ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="w-full justify-center py-2">
                        {course.accessType === 'paid' ? 'Оплата скоро появится' : 'Доступ по приглашению автора'}
                      </Badge>
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
