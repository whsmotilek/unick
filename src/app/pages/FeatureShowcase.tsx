import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Palette, 
  UserCog, 
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
  Calendar
} from 'lucide-react';

export function FeatureShowcase() {
  const authorFeatures = [
    {
      title: 'Управление курсами',
      description: 'Мощный конструктор для создания курсов с модулями, уроками, тестами и домашками',
      icon: BookOpen,
      color: 'bg-[#EDE9FF]',
      iconColor: 'text-[#7C6AF7]',
      link: '/author/courses',
      badge: 'Создано'
    },
    {
      title: 'CRM система',
      description: 'Полная воронка продаж, сегментация учеников, история взаимодействий и автоматизация',
      icon: UserCog,
      color: 'bg-[#FFE5D9]',
      iconColor: 'text-[#FF6B6B]',
      link: '/author/crm',
      badge: 'Новое'
    },
    {
      title: 'Вселенная курсов',
      description: 'Создавайте уникальные дизайн-темы: Marvel для дизайна, Oxford для математики',
      icon: Palette,
      color: 'bg-[#F5E642]',
      iconColor: 'text-[#5A5000]',
      link: '/author/course-universe',
      badge: 'Новое'
    },
    {
      title: 'Ученики и прогресс',
      description: 'Детальная таблица учеников с метриками, AI-рекомендациями и зонами риска',
      icon: Users,
      color: 'bg-[#C5E8A0]',
      iconColor: 'text-[#2D5016]',
      link: '/author/students',
      badge: 'Создано'
    },
    {
      title: 'Аналитика и AI',
      description: 'Интерактивные графики, AI-инсайты, метрики по курсам и доходимости',
      icon: BarChart3,
      color: 'bg-[#B8D8F8]',
      iconColor: 'text-[#0D3B66]',
      link: '/author/analytics',
      badge: 'Создано'
    },
    {
      title: 'Календарь событий',
      description: 'Управление дедлайнами, эфирами, релизами уроков и встречами в одном месте',
      icon: Calendar,
      color: 'bg-[#FFE5D9]',
      iconColor: 'text-[#FF6B6B]',
      link: '/author/calendar',
      badge: 'Новое'
    }
  ];

  const studentFeatures = [
    {
      title: 'Мои курсы',
      description: 'Обзор всех курсов с прогрессом, следующими уроками и рекомендациями',
      icon: GraduationCap,
      color: 'bg-[#EDE9FF]',
      iconColor: 'text-[#7C6AF7]',
      link: '/student/courses',
      badge: 'Создано'
    },
    {
      title: 'Просмотр урока',
      description: 'Интерактивный плеер с видео, материалами, боковой навигацией по модулям',
      icon: BookOpen,
      color: 'bg-[#FFE5D9]',
      iconColor: 'text-[#FF6B6B]',
      link: '/student/courses/1/lesson/1',
      badge: 'Создано'
    },
    {
      title: 'Домашние задания',
      description: 'Управление заданиями, загрузка файлов, отзывы кураторов, оценки',
      icon: CheckCircle2,
      color: 'bg-[#C5E8A0]',
      iconColor: 'text-[#2D5016]',
      link: '/student/homework',
      badge: 'Создано'
    },
    {
      title: 'Прогресс и достижения',
      description: 'Геймификация с уровнями, достижениями, стриками и детальной статистикой',
      icon: TrendingUp,
      color: 'bg-[#F5E642]',
      iconColor: 'text-[#5A5000]',
      link: '/student/progress',
      badge: 'Создано'
    },
    {
      title: 'Календарь',
      description: 'Все дедлайны, эфиры и важные события в одном месте с напоминаниями',
      icon: Calendar,
      color: 'bg-[#B8D8F8]',
      iconColor: 'text-[#0D3B66]',
      link: '/student/calendar',
      badge: 'Новое'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white px-8 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-[12px] font-medium">Новые функции платформы Unick</span>
          </div>
          <h1 className="text-[48px] font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Полный цикл обучения
          </h1>
          <p className="text-[18px] opacity-90 max-w-2xl mx-auto mb-8" style={{ fontFamily: 'var(--font-body)' }}>
            От создания курсов и управления учениками до геймификации и AI-инсайтов. 
            Всё что нужно для успешной образовательной платформы.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/author/courses">
              <Button size="lg" className="bg-white text-[#7C6AF7] hover:bg-white/90 gap-2">
                <Zap className="w-5 h-5" />
                Начать как автор
              </Button>
            </Link>
            <Link to="/student/courses">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                Начать как ученик
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Author Features */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Badge className="mb-4">Для Автора</Badge>
            <h2 className="text-[32px] font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Управляйте своей школой
            </h2>
            <p className="text-[14px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Мощные инструменты для создания, управления и масштабирования вашей образовательной платформы
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorFeatures.map((feature, idx) => (
              <Link key={idx} to={feature.link}>
                <Card className="h-full hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}>
                        <feature.icon className={`w-6 h-6 ${feature.iconColor}`} strokeWidth={1.5} />
                      </div>
                      <Badge variant={feature.badge === 'Новое' ? 'default' : 'success'} className="text-[10px]">
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2 group-hover:text-[#7C6AF7] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-[#8A8A9A] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Student Features */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">Для Ученика</Badge>
            <h2 className="text-[32px] font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Учитесь эффективно
            </h2>
            <p className="text-[14px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Интуитивный интерфейс, геймификация и персонализированный опыт обучения
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentFeatures.map((feature, idx) => (
              <Link key={idx} to={feature.link}>
                <Card className="h-full hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}>
                        <feature.icon className={`w-6 h-6 ${feature.iconColor}`} strokeWidth={1.5} />
                      </div>
                      <Badge variant="success" className="text-[10px]">
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2 group-hover:text-[#7C6AF7] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-[#8A8A9A] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-[#EDE9FF] to-[#F9D0E8] border-0">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-[#7C6AF7] mx-auto mb-4" />
              <h2 className="text-[28px] font-bold text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Готовы начать?
              </h2>
              <p className="text-[14px] text-[#8A8A9A] mb-8 max-w-xl mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
                Все функции уже доступны. Выберите свою роль и изучите возможности платформы Unick.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/role-switcher">
                  <Button size="lg">
                    Переключить роль
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline">
                    На главную
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}