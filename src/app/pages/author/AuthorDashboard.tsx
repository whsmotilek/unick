import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Bell,
  Search
} from 'lucide-react';
import { Link } from 'react-router';

export function AuthorDashboard() {
  const stats = [
    {
      title: 'Активных учеников',
      value: '342',
      subtitle: '28 новых',
      change: '+12%',
      color: 'bg-[#F5E642]',
      textColor: 'text-[#5A5000]'
    },
    {
      title: 'Доход',
      value: '₽485K',
      subtitle: 'За месяц',
      change: '+12.5%',
      color: 'bg-[#F9D0E8]',
      textColor: 'text-[#8B2F5C]'
    },
    {
      title: 'Доходимость',
      value: '68%',
      subtitle: 'Средний показатель',
      change: '+5%',
      color: 'bg-[#C5E8A0]',
      textColor: 'text-[#2D5016]'
    },
    {
      title: 'Активных курсов',
      value: '12',
      subtitle: '3 новых курса',
      change: '+25%',
      color: 'bg-[#B8D8F8]',
      textColor: 'text-[#0D3B66]'
    }
  ];

  const aiInsights = [
    {
      id: '1',
      title: 'Урок 4 имеет высокий процент отвала',
      description: 'Падение доходимости на 14% после этого урока. Рекомендуем упростить материал.',
      badge: 'Высокий приоритет',
      badgeColor: 'destructive'
    },
    {
      id: '2',
      title: '5 учеников в зоне риска оттока',
      description: 'Не заходили более 7 дней. AI подготовил персонализированные сообщения.',
      badge: 'Требуется действие',
      badgeColor: 'warning'
    },
    {
      id: '3',
      title: 'Доходимость выросла на 5%',
      description: 'Ваши последние изменения в курсе "UI/UX дизайн" дали результат!',
      badge: 'Успех',
      badgeColor: 'success'
    }
  ];

  const recentActivity = [
    { 
      student: 'Петр Смирнов', 
      action: 'сдал домашку', 
      course: 'UI/UX Дизайн',
      time: '5 мин назад',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
    },
    { 
      student: 'Мария Петрова', 
      action: 'записалась на', 
      course: 'Figma для начинающих',
      time: '1 час назад',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    },
    { 
      student: 'Алекс Джонсон', 
      action: 'завершил урок', 
      course: 'Веб-дизайн Pro',
      time: '2 часа назад',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Доброе утро, Анна
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Вот что происходит в вашей школе сегодня
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
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
                  <div>
                    <p className={`text-[11px] font-medium uppercase tracking-wide ${stat.textColor} opacity-80`} style={{ fontFamily: 'var(--font-body)' }}>
                      {stat.title}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-white/50">
                    {stat.change}
                  </Badge>
                </div>
                <div>
                  <p className={`text-[28px] font-bold ${stat.textColor} mb-1`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {stat.value}
                  </p>
                  <p className={`text-[11px] ${stat.textColor} opacity-70`} style={{ fontFamily: 'var(--font-body)' }}>
                    {stat.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-[#7C6AF7]" />
                  <h2 className="text-[16px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                    AI-Инсайты
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div 
                      key={insight.id}
                      className="p-4 rounded-xl bg-[#F5F4F2] border border-[#1A1A2E]/5 hover:border-[#7C6AF7]/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                          {insight.title}
                        </h3>
                        <Badge variant={insight.badgeColor as any} className="text-[10px]">
                          {insight.badge}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#8A8A9A] leading-relaxed mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                        {insight.description}
                      </p>
                      <Button size="sm" variant="ghost" className="h-7 px-3 text-[#7C6AF7] hover:bg-[#EDE9FF]">
                        Подробнее
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-[16px] font-semibold text-[#1A1A2E] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
                  Последняя активность
                </h2>
                
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <img 
                        src={activity.avatar} 
                        alt={activity.student}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#1A1A2E] font-medium mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                          {activity.student}
                        </p>
                        <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          {activity.action}{' '}
                          <span className="text-[#7C6AF7]">{activity.course}</span>
                        </p>
                        <p className="text-[10px] text-[#8A8A9A] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="link" className="w-full mt-4 text-[#7C6AF7]" size="sm">
                  Вся активность
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/author/courses" className="group">
            <Card className="bg-white border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EDE9FF] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#7C6AF7]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    Создать новый курс
                  </h3>
                  <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                    Начните создавать следующий курс
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#8A8A9A] group-hover:text-[#7C6AF7] transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/author/students" className="group">
            <Card className="bg-white border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFE5D9] flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#FF6B6B]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    Управление учениками
                  </h3>
                  <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                    Смотрите прогресс и вовлеченность
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#8A8A9A] group-hover:text-[#FF6B6B] transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/author/analytics" className="group">
            <Card className="bg-white border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C5E8A0] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#2D5016]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    Смотреть аналитику
                  </h3>
                  <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                    Отслеживайте показатели и инсайты
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#8A8A9A] group-hover:text-[#2D5016] transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
