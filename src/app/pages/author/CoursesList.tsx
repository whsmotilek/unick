import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { 
  Plus, 
  Search,
  Users,
  TrendingUp,
  MoreVertical,
  Play,
  Settings,
  Copy,
  Archive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const courses = [
  {
    id: '1',
    title: 'Основы UI/UX дизайна',
    description: 'Полный курс по дизайну интерфейсов от основ до продвинутых техник',
    students: 156,
    lessons: 24,
    completion: 68,
    revenue: '₽234,000',
    status: 'published',
    color: 'bg-[#f8d7e8]',
    icon: '🎨'
  },
  {
    id: '2',
    title: 'Figma для начинающих',
    description: 'Практический курс по работе в Figma с нуля до профессионала',
    students: 98,
    lessons: 18,
    completion: 72,
    revenue: '₽156,000',
    status: 'published',
    color: 'bg-[#d4f4dd]',
    icon: '🎯'
  },
  {
    id: '3',
    title: 'Анимация в интерфейсах',
    description: 'Создание микроанимаций и интерактивных прототипов',
    students: 88,
    lessons: 15,
    completion: 64,
    revenue: '₽95,000',
    status: 'published',
    color: 'bg-[#fef3c7]',
    icon: '✨'
  },
  {
    id: '4',
    title: 'Дизайн-системы',
    description: 'Построение масштабируемых дизайн-систем для больших продуктов',
    students: 0,
    lessons: 12,
    completion: 0,
    revenue: '₽0',
    status: 'draft',
    color: 'bg-[#e9d5ff]',
    icon: '📐'
  },
  {
    id: '5',
    title: 'UX Исследования',
    description: 'Методы исследования пользователей и тестирования интерфейсов',
    students: 64,
    lessons: 20,
    completion: 58,
    revenue: '₽78,000',
    status: 'published',
    color: 'bg-[#dbeafe]',
    icon: '🔍'
  },
  {
    id: '6',
    title: 'Mobile App Design',
    description: 'Проектирование мобильных приложений для iOS и Android',
    students: 0,
    lessons: 0,
    completion: 0,
    revenue: '₽0',
    status: 'draft',
    color: 'bg-[#fed7aa]',
    icon: '📱'
  }
];

export function CoursesList() {
  const publishedCourses = courses.filter(c => c.status === 'published');
  const draftCourses = courses.filter(c => c.status === 'draft');
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);

  return (
    <div className="p-8 space-y-8 bg-[#f5f7fa] min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Мои курсы 📚</h1>
          <p className="text-slate-600">
            {publishedCourses.length} опубликовано • {draftCourses.length} в черновиках • {totalStudents} учеников
          </p>
        </div>
        <Link to="/author/courses/new">
          <Button size="lg" className="gap-2 rounded-2xl shadow-lg">
            <Plus className="w-5 h-5" />
            Создать курс
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="search"
            placeholder="Поиск курсов..."
            className="pl-12 h-12 rounded-2xl bg-white border-0 shadow-sm"
          />
        </div>
        <Button variant="outline" className="rounded-2xl border-0 bg-white shadow-sm">
          Все курсы
        </Button>
        <Button variant="ghost" className="rounded-2xl">
          Опубликованные ({publishedCourses.length})
        </Button>
        <Button variant="ghost" className="rounded-2xl">
          Черновики ({draftCourses.length})
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Всего курсов</p>
          <p className="text-3xl font-bold">{courses.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Активных учеников</p>
          <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Ср. доходимость</p>
          <p className="text-3xl font-bold">
            {Math.round(publishedCourses.reduce((sum, c) => sum + c.completion, 0) / publishedCourses.length)}%
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Общая выручка</p>
          <p className="text-3xl font-bold">
            ₽{(courses.reduce((sum, c) => sum + parseInt(c.revenue.replace(/[^\d]/g, '')), 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Опубликованные курсы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedCourses.map((course) => (
            <div
              key={course.id}
              className={`${course.color} rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{course.icon}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl">
                    <DropdownMenuItem>
                      <Play className="w-4 h-4 mr-2" />
                      Предпросмотр
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Настройки
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Дублировать
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Архивировать
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link to={`/author/courses/${course.id}`}>
                <h3 className="text-xl font-bold mb-2 hover:underline">{course.title}</h3>
              </Link>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>

              <div className="flex items-center gap-4 mb-4 text-sm text-slate-700">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{course.students}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span className="font-medium">{course.lessons} уроков</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Доходимость</span>
                  <span className="font-bold">{course.completion}%</span>
                </div>
                <Progress value={course.completion} className="h-2 bg-white/50" />
              </div>

              <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Выручка</p>
                  <p className="text-lg font-bold">{course.revenue}</p>
                </div>
                <Link to={`/author/courses/${course.id}`}>
                  <Button className="rounded-full">
                    Редактировать
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Draft Courses */}
      {draftCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Черновики</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftCourses.map((course) => (
              <div
                key={course.id}
                className={`${course.color} rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-slate-300 opacity-75 hover:opacity-100`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{course.icon}</div>
                  <Badge variant="secondary" className="rounded-full">
                    Черновик
                  </Badge>
                </div>

                <Link to={`/author/courses/${course.id}`}>
                  <h3 className="text-xl font-bold mb-2 hover:underline">{course.title}</h3>
                </Link>
                <p className="text-sm text-slate-600 mb-4">{course.description}</p>

                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <Play className="w-4 h-4" />
                  <span>{course.lessons} уроков</span>
                </div>

                <Link to={`/author/courses/${course.id}`}>
                  <Button className="w-full rounded-full">
                    Продолжить редактирование
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Course */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Создать новый курс</h2>
        <Link to="/author/courses/new">
          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-slate-300 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Создать новый курс</h3>
            <p className="text-sm text-slate-600 text-center max-w-md mb-4">
              Запустите новый образовательный продукт и начните обучать учеников
            </p>
            <Button size="lg" className="rounded-2xl">
              Начать создание
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
