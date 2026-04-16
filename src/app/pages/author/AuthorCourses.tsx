import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Plus, Search, BookOpen, Users, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { CountUp } from '../../components/CountUp';
import { motion } from 'motion/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

export function AuthorCourses() {
  const { user } = useAuth();
  const { courses, enrollments, deleteCourse, getCourseProgress } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const myCourses = useMemo(() => {
    return courses.filter(c => c.schoolId === (user?.schoolId || 'school-1'));
  }, [courses, user]);

  const filtered = useMemo(() => {
    if (!searchQuery) return myCourses;
    const q = searchQuery.toLowerCase();
    return myCourses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [myCourses, searchQuery]);

  const totalCourses = myCourses.length;
  const publishedCount = myCourses.filter(c => c.status === 'published').length;
  const totalStudents = useMemo(() => {
    const studentSet = new Set<string>();
    for (const [userId, courseIds] of Object.entries(enrollments)) {
      if (myCourses.some(c => courseIds.includes(c.id))) studentSet.add(userId);
    }
    return studentSet.size;
  }, [enrollments, myCourses]);
  const avgCompletion = useMemo(() => {
    let sum = 0, count = 0;
    for (const [uid, cids] of Object.entries(enrollments)) {
      for (const cid of cids) {
        if (myCourses.some(c => c.id === cid)) {
          sum += getCourseProgress(uid, cid);
          count++;
        }
      }
    }
    return count ? Math.round(sum / count) : 0;
  }, [enrollments, myCourses, getCourseProgress]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCourse(deleteId);
    toast.success('Курс удалён');
    setDeleteId(null);
  };

  const studentsByCourse = (courseId: string) =>
    Object.values(enrollments).filter(cids => cids.includes(courseId)).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Курсы</h1>
          <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Управляйте всеми курсами вашей школы</p>
        </div>
        <Link to="/author/courses/new">
          <Button className="transition-transform active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-2" />Создать курс
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Всего курсов', value: totalCourses, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
          { label: 'Опубликовано', value: publishedCount, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
          { label: 'Учеников', value: totalStudents, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
          { label: 'Средний прогресс', value: avgCompletion, suffix: '%', color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
        ].map((stat, i) => (
          <Card key={i} className={`${stat.color} border-0`}>
            <CardContent className="p-5">
              <p className="text-[12px] text-[#1A1A2E]/60 mb-1" style={{ fontFamily: 'var(--font-body)' }}>{stat.label}</p>
              <p className={`text-[28px] font-bold ${stat.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
          <Input
            placeholder="Поиск курсов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-[#1A1A2E]/10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={searchQuery ? 'Ничего не найдено' : 'У вас пока нет курсов'}
          description={searchQuery ? 'Попробуйте изменить поиск' : 'Создайте свой первый курс — это займёт пару минут'}
          action={!searchQuery ? (
            <Link to="/author/courses/new">
              <Button><Plus className="w-4 h-4 mr-2" />Создать курс</Button>
            </Link>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => {
            const studentCount = studentsByCourse(course.id);
            const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="border-0 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 duration-300">
                  <Link to={`/author/courses/${course.id}`}>
                    <div className="aspect-video bg-[#F5F4F2] overflow-hidden">
                      {course.cover ? (
                        <img src={course.cover} alt={course.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8A8A9A]">
                          <BookOpen className="w-12 h-12" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={course.status === 'published' ? 'success' : 'secondary'}>
                        {course.status === 'published' ? 'Опубликован' : 'Черновик'}
                      </Badge>
                    </div>
                    <Link to={`/author/courses/${course.id}`}>
                      <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-1 line-clamp-2 hover:text-[#7C6AF7] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-[12px] text-[#8A8A9A] mb-4 line-clamp-2" style={{ fontFamily: 'var(--font-body)' }}>
                      {course.description || 'Нет описания'}
                    </p>
                    <div className="flex items-center justify-between text-[12px] text-[#8A8A9A] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />{lessonCount} уроков
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />{studentCount} учеников
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/author/courses/${course.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="w-3.5 h-3.5 mr-1" />Редактировать
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(course.id)}>
                        <Trash2 className="w-4 h-4 text-[#FF6B6B]" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить курс?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить. Все ученики будут отчислены.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#FF6B6B] hover:bg-[#E55555]">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
