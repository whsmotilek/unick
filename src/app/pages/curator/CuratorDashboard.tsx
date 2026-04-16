import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Clock, CheckCircle2, AlertTriangle, Users, MessageSquare, LogOut, Bell, Search } from 'lucide-react';
import { Link } from 'react-router';

export function CuratorDashboard() {
  const stats = [
    {
      title: 'Ожидают проверки',
      value: '7',
      color: 'bg-[#F5E642]',
      icon: Clock,
      textColor: 'text-[#5A5000]'
    },
    {
      title: 'Проверено сегодня',
      value: '12',
      color: 'bg-[#C5E8A0]',
      icon: CheckCircle2,
      textColor: 'text-[#2D5016]'
    },
    {
      title: 'В зоне риска',
      value: '5',
      color: 'bg-[#FFE5D9]',
      icon: AlertTriangle,
      textColor: 'text-[#FF6B6B]'
    },
    {
      title: 'Мои ученики',
      value: '45',
      color: 'bg-[#B8D8F8]',
      icon: Users,
      textColor: 'text-[#0D3B66]'
    }
  ];

  const urgentReviews = [
    {
      student: 'Петр Смирнов',
      assignment: 'Анализ интерфейса',
      submitted: 'вчера',
      deadline: 'сегодня',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
    },
    {
      student: 'Анна Джонсон',
      assignment: 'Исследование пользователей',
      submitted: '2 часа назад',
      deadline: 'сегодня',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    },
    {
      student: 'Алекс Браун',
      assignment: 'Вайрфреймы',
      submitted: 'вчера',
      deadline: 'завтра',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
    }
  ];

  const atRiskStudents = [
    {
      name: 'Мария Петрова',
      lastSeen: '7 дней назад',
      progress: 15,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    },
    {
      name: 'Иван Иванов',
      lastSeen: '5 дней назад',
      progress: 25,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    {
      name: 'Сара Уилсон',
      lastSeen: '8 дней назад',
      progress: 10,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Панель куратора
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Добро пожаловать, Мария Куратова
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <LogOut className="w-4 h-4" />
                Выйти
              </Button>
            </Link>
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
                  <p className={`text-[11px] font-medium uppercase tracking-wide ${stat.textColor} opacity-70`} style={{ fontFamily: 'var(--font-body)' }}>
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Reviews */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-[18px] font-semibold text-[#1A1A2E] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
                Срочные проверки
              </h2>
              <div className="space-y-3">
                {urgentReviews.map((review, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border border-[#1A1A2E]/10 rounded-xl hover:border-[#7C6AF7]/30 transition-colors">
                    <img 
                      src={review.avatar} 
                      alt={review.student}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1A1A2E] mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                        {review.assignment}
                      </p>
                      <p className="text-xs text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                        {review.student} • Сдано {review.submitted}
                      </p>
                      <Badge variant="destructive" className="mt-2 text-[10px]">
                        Срок {review.deadline}
                      </Badge>
                    </div>
                    <Button size="sm">Проверить</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* At Risk Students */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-[18px] font-semibold text-[#1A1A2E] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
                Ученики в зоне риска
              </h2>
              <div className="space-y-3">
                {atRiskStudents.map((student, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border border-[#1A1A2E]/10 rounded-xl hover:border-[#FF6B6B]/30 transition-colors">
                    <img 
                      src={student.avatar} 
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1A1A2E] mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                        {student.name}
                      </p>
                      <p className="text-xs text-[#8A8A9A] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                        Был(а) онлайн {student.lastSeen}
                      </p>
                      <Progress value={student.progress} className="h-1.5" />
                      <p className="text-[10px] text-[#8A8A9A] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                        {student.progress}% выполнено
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] border-0 text-white">
          <CardContent className="p-8 text-center">
            <p className="text-[16px] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              Полный функционал куратора скоро появится
            </p>
            <Link to="/">
              <Button variant="outline" className="bg-white text-[#7C6AF7] hover:bg-white/90 border-0">
                ← Назад к выбору роли
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
