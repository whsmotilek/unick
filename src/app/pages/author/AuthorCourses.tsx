import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Users, 
  TrendingUp,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  PlayCircle
} from 'lucide-react';
import { Link } from 'react-router';

export function AuthorCourses() {
  const [searchQuery, setSearchQuery] = useState('');

  const courses = [
    {
      id: 1,
      title: 'Основы UI/UX Дизайна',
      description: 'Комплексный курс по основам пользовательского опыта и интерфейсов',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      status: 'published',
      students: 342,
      completion: 68,
      revenue: '₽485,000',
      lessons: 16,
      duration: '8 недель',
      color: 'bg-[#EDE9FF]'
    },
    {
      id: 2,
      title: 'Figma для начинающих',
      description: 'Научитесь работать в Figma от нуля до профи',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=250&fit=crop',
      status: 'published',
      students: 215,
      completion: 72,
      revenue: '₽320,000',
      lessons: 11,
      duration: '4 недели',
      color: 'bg-[#FFE5D9]'
    },
    {
      id: 3,
      title: 'Веб-дизайн Pro',
      description: 'Продвинутый курс для профессионалов',
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop',
      status: 'draft',
      students: 0,
      completion: 0,
      revenue: '₽0',
      lessons: 10,
      duration: '6 недель',
      color: 'bg-[#FFF4DC]'
    },
    {
      id: 4,
      title: 'Мобильный дизайн',
      description: 'Создание интерфейсов для iOS и Android',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
      status: 'published',
      students: 128,
      completion: 65,
      revenue: '₽192,000',
      lessons: 14,
      duration: '5 недель',
      color: 'bg-[#C5E8A0]'
    }
  ];

  const stats = [
    { label: 'Всего курсов', value: '12', color: 'bg-[#EDE9FF]', textColor: 'text-[#7C6AF7]' },
    { label: 'Опубликовано', value: '9', color: 'bg-[#C5E8A0]', textColor: 'text-[#2D5016]' },
    { label: 'Всего учеников', value: '685', color: 'bg-[#F5E642]', textColor: 'text-[#5A5000]' },
    { label: 'Средняя доходимость', value: '68%', color: 'bg-[#B8D8F8]', textColor: 'text-[#0D3B66]' }
  ];

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
              Управляйте своими курсами и отслеживайте их эффективность
            </p>
          </div>
          
          <Link to="/author/courses/new">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Создать курс
            </Button>
          </Link>
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
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                <Input
                  placeholder="Поиск по курсам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-[#1A1A2E]/10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Сортировка
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge 
                    variant={course.status === 'published' ? 'success' : 'secondary'}
                    className="backdrop-blur-sm bg-white/90"
                  >
                    {course.status === 'published' ? 'Опубликован' : 'Черновик'}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-[10px]">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {course.lessons} уроков
                  </Badge>
                  <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-[10px]">
                    <Clock className="w-3 h-3 mr-1" />
                    {course.duration}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                      {course.title}
                    </h3>
                    <p className="text-[13px] text-[#8A8A9A] line-clamp-2" style={{ fontFamily: 'var(--font-body)' }}>
                      {course.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-[#8A8A9A] hover:text-[#1A1A2E]">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {course.status === 'published' && (
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-[#1A1A2E]/5 my-4">
                    <div>
                      <p className="text-[11px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Учеников</p>
                      <p className="text-[16px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                        {course.students}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Доходимость</p>
                      <p className="text-[16px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                        {course.completion}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Доход</p>
                      <p className="text-[16px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                        {course.revenue}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link to={`/author/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Edit className="w-4 h-4" />
                      Редактировать
                    </Button>
                  </Link>
                  {course.status === 'published' && (
                    <Button variant="outline" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for New Course */}
        <Card className="border-2 border-dashed border-[#1A1A2E]/20 hover:border-[#7C6AF7]/40 transition-colors">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EDE9FF] flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[#7C6AF7]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Создайте новый курс
            </h3>
            <p className="text-[13px] text-[#8A8A9A] mb-6 max-w-md mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
              Используйте мощный конструктор для создания образовательного контента с видео, тестами и домашними заданиями
            </p>
            <Link to="/author/courses/new">
              <Button size="lg">
                Начать создание
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
