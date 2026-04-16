import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { 
  PlayCircle,
  Clock,
  BookOpen,
  CheckCircle2,
  Search,
  Filter,
  Award,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router';

export function StudentCourses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  const courses = [
    {
      id: 1,
      title: 'Основы UI/UX Дизайна',
      instructor: 'Анна Иванова',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      progress: 75,
      totalLessons: 16,
      completedLessons: 12,
      nextLesson: { id: 13, title: 'Урок 13: Исследование пользователей' },
      duration: '8 недель',
      status: 'in-progress',
      color: 'bg-[#EDE9FF]'
    },
    {
      id: 2,
      title: 'Figma для начинающих',
      instructor: 'Мария Куратова',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=250&fit=crop',
      progress: 45,
      totalLessons: 11,
      completedLessons: 5,
      nextLesson: { id: 6, title: 'Урок 6: Компоненты и варианты' },
      duration: '4 недели',
      status: 'in-progress',
      color: 'bg-[#FFE5D9]'
    },
    {
      id: 3,
      title: 'Веб-дизайн Pro',
      instructor: 'Алекс Джонсон',
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop',
      progress: 30,
      totalLessons: 10,
      completedLessons: 3,
      nextLesson: { id: 4, title: 'Урок 4: Типографика в вебе' },
      duration: '6 недель',
      status: 'in-progress',
      color: 'bg-[#FFF4DC]'
    },
    {
      id: 4,
      title: 'Мобильный дизайн',
      instructor: 'Игорь Петров',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
      progress: 100,
      totalLessons: 14,
      completedLessons: 14,
      nextLesson: null,
      duration: '5 недель',
      status: 'completed',
      color: 'bg-[#C5E8A0]'
    }
  ];

  const stats = [
    { label: 'Активных курсов', value: '3', color: 'bg-[#B8D8F8]', textColor: 'text-[#0D3B66]' },
    { label: 'Завершенных', value: '1', color: 'bg-[#C5E8A0]', textColor: 'text-[#2D5016]' },
    { label: 'Уроков пройдено', value: '34', color: 'bg-[#F5E642]', textColor: 'text-[#5A5000]' },
    { label: 'Средний прогресс', value: '62%', color: 'bg-[#EDE9FF]', textColor: 'text-[#7C6AF7]' }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTab === 'all') return matchesSearch;
    if (filterTab === 'in-progress') return matchesSearch && course.status === 'in-progress';
    if (filterTab === 'completed') return matchesSearch && course.status === 'completed';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Мои курсы
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Продолжайте обучение и отслеживайте свой прогресс
            </p>
          </div>
          
          <Badge variant="success" className="px-4 py-2">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Level 3
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.color} border-0`}>
              <CardContent className="p-5">
                <p className={`text-[11px] font-medium uppercase tracking-wide ${stat.textColor} opacity-70 mb-2`} style={{ fontFamily: 'var(--font-body)' }}>
                  {stat.label}
                </p>
                <p className={`text-[28px] font-bold ${stat.textColor}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                <Input
                  placeholder="Поиск по курсам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-[#1A1A2E]/10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant={filterTab === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterTab('all')}
                  size="sm"
                >
                  Все
                </Button>
                <Button 
                  variant={filterTab === 'in-progress' ? 'default' : 'outline'}
                  onClick={() => setFilterTab('in-progress')}
                  size="sm"
                >
                  В процессе
                </Button>
                <Button 
                  variant={filterTab === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterTab('completed')}
                  size="sm"
                >
                  Завершенные
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <Badge 
                    variant={course.status === 'completed' ? 'success' : 'default'}
                    className="backdrop-blur-sm bg-white/90"
                  >
                    {course.status === 'completed' ? 'Завершен' : 'В процессе'}
                  </Badge>
                  {course.status === 'completed' && (
                    <div className="w-12 h-12 rounded-full bg-[#C5E8A0] flex items-center justify-center backdrop-blur-sm">
                      <Award className="w-6 h-6 text-[#2D5016]" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-[10px]">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {course.totalLessons} уроков
                  </Badge>
                  <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-[10px]">
                    <Clock className="w-3 h-3 mr-1" />
                    {course.duration}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-[18px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                    от {course.instructor}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                      Прогресс
                    </span>
                    <span className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                      {course.completedLessons}/{course.totalLessons} • {course.progress}%
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                {course.status === 'in-progress' && course.nextLesson && (
                  <div className="mb-4 p-3 rounded-xl bg-[#F5F4F2] border border-[#1A1A2E]/5">
                    <div className="flex items-center gap-2 mb-1">
                      <PlayCircle className="w-4 h-4 text-[#7C6AF7]" strokeWidth={1.5} />
                      <span className="text-[11px] font-medium text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                        Следующий урок
                      </span>
                    </div>
                    <p className="text-[12px] text-[#1A1A2E] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                      {course.nextLesson.title}
                    </p>
                  </div>
                )}

                {course.status === 'completed' && (
                  <div className="mb-4 p-3 rounded-xl bg-[#C5E8A0] border border-[#2D5016]/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2D5016]" strokeWidth={2} />
                      <span className="text-[12px] font-medium text-[#2D5016]" style={{ fontFamily: 'var(--font-body)' }}>
                        Курс завершен! Сертификат доступен
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {course.status === 'in-progress' ? (
                    <Link to={`/student/courses/${course.id}/lesson/${course.nextLesson?.id}`} className="flex-1">
                      <Button className="w-full gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Продолжить обучение
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to={`/student/courses/${course.id}/lesson/1`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          <PlayCircle className="w-4 h-4" />
                          Пересмотреть
                        </Button>
                      </Link>
                      <Button className="gap-2">
                        <Award className="w-4 h-4" />
                        Сертификат
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommendation */}
        <Card className="bg-gradient-to-br from-[#EDE9FF] to-[#F9D0E8] border-0">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#7C6AF7]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Рекомендация для вас
                </h3>
                <p className="text-[13px] text-[#1A1A2E]/80 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                  На основе вашего прогресса, мы рекомендуем курс "Продвинутый UX-дизайн". Это поможет вам развить навыки после завершения основ.
                </p>
                <Button size="sm" variant="outline" className="bg-white hover:bg-white/80">
                  Посмотреть курс
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
