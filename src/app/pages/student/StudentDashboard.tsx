import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  BookOpen,
  Clock,
  Trophy,
  Target,
  PlayCircle,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react';
import { Link } from 'react-router';

export function StudentDashboard() {
  const stats = [
    {
      title: 'Активных курсов',
      value: '3',
      subtitle: 'В процессе',
      color: 'bg-[#F5E642]',
      icon: BookOpen,
      textColor: 'text-[#5A5000]'
    },
    {
      title: 'Завершено',
      value: '12',
      subtitle: 'Уроков пройдено',
      color: 'bg-[#C5E8A0]',
      icon: CheckCircle2,
      textColor: 'text-[#2D5016]'
    },
    {
      title: 'Прогресс',
      value: '68%',
      subtitle: 'Общий',
      color: 'bg-[#B8D8F8]',
      icon: TrendingUp,
      textColor: 'text-[#0D3B66]'
    },
    {
      title: 'Стрик',
      value: '7',
      subtitle: 'Дней',
      color: 'bg-[#F9D0E8]',
      icon: Trophy,
      textColor: 'text-[#8B2F5C]'
    }
  ];

  const courses = [
    {
      id: 1,
      title: 'Основы UI/UX Дизайна',
      instructor: 'Анна Иванова',
      progress: 75,
      nextLesson: 'Урок 8: Исследование пользователей',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      color: 'bg-[#EDE9FF]',
      lessons: '12/16'
    },
    {
      id: 2,
      title: 'Figma для начинающих',
      instructor: 'Мария Куратова',
      progress: 45,
      nextLesson: 'Урок 5: Компоненты',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=250&fit=crop',
      color: 'bg-[#FFE5D9]',
      lessons: '5/11'
    },
    {
      id: 3,
      title: 'Веб-дизайн Pro',
      instructor: 'Алекс Джонсон',
      progress: 30,
      nextLesson: 'Урок 3: Типографика',
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop',
      color: 'bg-[#FFF4DC]',
      lessons: '3/10'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Дизайн главной страницы',
      course: 'UI/UX Дизайн',
      due: 'Завтра, 18:00',
      priority: 'high',
      badge: 'Высокий приоритет'
    },
    {
      id: 2,
      title: 'Библиотека компонентов',
      course: 'Основы Figma',
      due: '20 мая, 12:00',
      priority: 'medium',
      badge: 'Средний'
    },
    {
      id: 3,
      title: 'Упражнение по типографике',
      course: 'Веб-дизайн Pro',
      due: '22 мая, 15:00',
      priority: 'low',
      badge: 'Низкий приоритет'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Продолжайте учиться, Студент
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Вы на верном пути! Продолжайте в том же духе 🎉
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="success" className="px-4 py-2">
              <Trophy className="w-3.5 h-3.5 mr-1.5" />
              Стрик 7 дней
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className={`${stat.color} border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <stat.icon className={`w-6 h-6 ${stat.textColor} opacity-80`} strokeWidth={1.5} />
                </div>
                <div>
                  <p className={`text-[28px] font-bold ${stat.textColor} mb-1`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {stat.value}
                  </p>
                  <p className={`text-[11px] font-medium uppercase tracking-wide ${stat.textColor} opacity-70 mb-0.5`} style={{ fontFamily: 'var(--font-body)' }}>
                    {stat.title}
                  </p>
                  <p className={`text-[11px] ${stat.textColor} opacity-60`} style={{ fontFamily: 'var(--font-body)' }}>
                    {stat.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                Мои курсы
              </h2>
              <Link to="/student/courses">
                <Button variant="link" size="sm" className="text-[#7C6AF7]">
                  Все курсы
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-40 md:h-auto overflow-hidden">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                          {course.lessons} уроков
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                            {course.title}
                          </h3>
                          <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                            от {course.instructor}
                          </p>
                        </div>
                        <Badge variant="default" className="text-[10px]">
                          {course.progress}%
                        </Badge>
                      </div>

                      <Progress value={course.progress} className="h-2 mb-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#8A8A9A]">
                          <PlayCircle className="w-4 h-4" strokeWidth={1.5} />
                          <span className="text-[11px]" style={{ fontFamily: 'var(--font-body)' }}>
                            {course.nextLesson}
                          </span>
                        </div>
                        <Button size="sm" className="h-8">
                          Продолжить
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div>
            <h2 className="text-[20px] font-semibold text-[#1A1A2E] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
              Предстоящие задания
            </h2>
            
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <Card 
                  key={task.id}
                  className={`${
                    task.priority === 'high' ? 'border-l-4 border-l-[#FF6B6B]' :
                    task.priority === 'medium' ? 'border-l-4 border-l-[#F5E642]' :
                    'border-l-4 border-l-[#C5E8A0]'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                        {task.title}
                      </h3>
                      <Badge 
                        variant={
                          task.priority === 'high' ? 'destructive' :
                          task.priority === 'medium' ? 'warning' :
                          'success'
                        }
                        className="text-[10px]"
                      >
                        {task.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#7C6AF7] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                      {task.course}
                    </p>
                    <div className="flex items-center gap-1.5 text-[#8A8A9A]">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="text-[10px]" style={{ fontFamily: 'var(--font-body)' }}>
                        Срок: {task.due}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Все задания
            </Button>
          </div>
        </div>

        {/* Achievement Section */}
        <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-[#F5E642]" fill="#F5E642" />
                  <h3 className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                    Отличная работа!
                  </h3>
                </div>
                <p className="text-[13px] text-white/90 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                  Завершите еще 3 урока на этой неделе, чтобы достичь 4 уровня и разблокировать эксклюзивный контент
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
                    <div className="bg-white h-full rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>70%</span>
                </div>
              </div>
              <Trophy className="w-16 h-16 text-[#F5E642] opacity-50" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
