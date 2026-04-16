import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Search, BookOpen, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function StudentCatalog() {
  const { user } = useAuth();
  const { courses, enrollments, enrollStudent } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const enrolledIds = user ? (enrollments[user.id] || []) : [];

  const published = useMemo(() => {
    return courses.filter(c => c.status === 'published');
  }, [courses]);

  const filtered = useMemo(() => {
    if (!searchQuery) return published;
    const q = searchQuery.toLowerCase();
    return published.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [published, searchQuery]);

  const handleEnroll = (courseId: string) => {
    if (!user) return;
    enrollStudent(user.id, courseId);
    toast.success('Вы записаны на курс!');
    navigate('/student/courses');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Каталог курсов</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Найдите курс по душе и начните учиться</p>
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
          title="Курсов пока нет"
          description="Скоро здесь появятся новые курсы"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => {
            const isEnrolled = enrolledIds.includes(course.id);
            const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
            const studentCount = Object.values(enrollments).filter(cids => cids.includes(course.id)).length;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="border-0 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 duration-300 h-full">
                  <div className="aspect-video bg-[#F5F4F2] overflow-hidden">
                    {course.cover ? (
                      <img src={course.cover} alt={course.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8A8A9A]">
                        <BookOpen className="w-12 h-12" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col h-[200px]">
                    <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2 line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      {course.title}
                    </h3>
                    <p className="text-[12px] text-[#8A8A9A] mb-4 line-clamp-2 flex-1" style={{ fontFamily: 'var(--font-body)' }}>
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-[12px] text-[#8A8A9A] mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{lessonCount} уроков</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{studentCount}</span>
                    </div>
                    {isEnrolled ? (
                      <Badge variant="success" className="w-full justify-center py-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Вы уже записаны
                      </Badge>
                    ) : (
                      <Button onClick={() => handleEnroll(course.id)} className="w-full transition-transform active:scale-[0.98]">
                        Записаться<ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
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
