import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { 
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageSquare,
  Eye,
  Calendar,
  Award
} from 'lucide-react';

export function AuthorStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  const stats = [
    { label: 'Всего учеников', value: '685', change: '+12%', trend: 'up', color: 'bg-[#B8D8F8]', textColor: 'text-[#0D3B66]' },
    { label: 'Активных', value: '542', change: '+8%', trend: 'up', color: 'bg-[#C5E8A0]', textColor: 'text-[#2D5016]' },
    { label: 'В зоне риска', value: '23', change: '-5%', trend: 'down', color: 'bg-[#FFE5D9]', textColor: 'text-[#FF6B6B]' },
    { label: 'Средний прогресс', value: '64%', change: '+3%', trend: 'up', color: 'bg-[#EDE9FF]', textColor: 'text-[#7C6AF7]' }
  ];

  const students = [
    {
      id: 1,
      name: 'Петр Смирнов',
      email: 'petr@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      course: 'UI/UX Дизайн',
      progress: 85,
      lastActive: '2 часа назад',
      status: 'active',
      completedLessons: 14,
      totalLessons: 16,
      streak: 12,
      risk: 'low'
    },
    {
      id: 2,
      name: 'Мария Петрова',
      email: 'maria@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      course: 'Figma для начинающих',
      progress: 15,
      lastActive: '7 дней назад',
      status: 'at-risk',
      completedLessons: 2,
      totalLessons: 11,
      streak: 0,
      risk: 'high'
    },
    {
      id: 3,
      name: 'Алекс Джонсон',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      course: 'Веб-дизайн Pro',
      progress: 92,
      lastActive: '1 час назад',
      status: 'active',
      completedLessons: 9,
      totalLessons: 10,
      streak: 25,
      risk: 'low'
    },
    {
      id: 4,
      name: 'Анна Иванова',
      email: 'anna@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      course: 'UI/UX Дизайн',
      progress: 55,
      lastActive: '1 день назад',
      status: 'active',
      completedLessons: 9,
      totalLessons: 16,
      streak: 5,
      risk: 'medium'
    },
    {
      id: 5,
      name: 'Иван Сидоров',
      email: 'ivan@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      course: 'Мобильный дизайн',
      progress: 28,
      lastActive: '5 дней назад',
      status: 'at-risk',
      completedLessons: 4,
      totalLessons: 14,
      streak: 0,
      risk: 'high'
    },
    {
      id: 6,
      name: 'Сара Уилсон',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      course: 'Figma для начинающих',
      progress: 72,
      lastActive: '3 часа назад',
      status: 'active',
      completedLessons: 8,
      totalLessons: 11,
      streak: 8,
      risk: 'low'
    }
  ];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return <Badge variant="destructive" className="text-[10px]">Высокий риск</Badge>;
      case 'medium': return <Badge variant="warning" className="text-[10px]">Средний риск</Badge>;
      case 'low': return <Badge variant="success" className="text-[10px]">Низкий риск</Badge>;
      default: return null;
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTab === 'all') return matchesSearch;
    if (filterTab === 'active') return matchesSearch && student.status === 'active';
    if (filterTab === 'at-risk') return matchesSearch && student.risk === 'high';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Ученики
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Управляйте учениками и отслеживайте их прогресс
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Экспорт
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.color} border-0`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className={`text-[11px] font-medium uppercase tracking-wide ${stat.textColor} opacity-70`} style={{ fontFamily: 'var(--font-body)' }}>
                    {stat.label}
                  </p>
                  <div className={`flex items-center gap-1 ${stat.trend === 'up' ? 'text-[#2D5016]' : 'text-[#FF6B6B]'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-medium">{stat.change}</span>
                  </div>
                </div>
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
                  placeholder="Поиск по имени, email или курсу..."
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
                  variant={filterTab === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterTab('active')}
                  size="sm"
                >
                  Активные
                </Button>
                <Button 
                  variant={filterTab === 'at-risk' ? 'default' : 'outline'}
                  onClick={() => setFilterTab('at-risk')}
                  size="sm"
                >
                  В зоне риска
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F4F2] border-b border-[#1A1A2E]/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#8A8A9A] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                      Ученик
                    </th>
                    <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#8A8A9A] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                      Курс
                    </th>
                    <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#8A8A9A] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                      Прогресс
                    </th>
                    <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#8A8A9A] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                      Активность
                    </th>
                    <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#8A8A9A] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                      Риск
                    </th>
                    <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#8A8A9A] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A2E]/5">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[#F5F4F2] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="bg-[#7C6AF7] text-white">
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-[13px] font-medium text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                              {student.name}
                            </p>
                            <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                          {student.course}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                              {student.progress}%
                            </span>
                            <span className="text-[10px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                              {student.completedLessons}/{student.totalLessons}
                            </span>
                          </div>
                          <Progress value={student.progress} className="h-1.5" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#8A8A9A]" />
                          <span className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                            {student.lastActive}
                          </span>
                        </div>
                        {student.streak > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Award className="w-3.5 h-3.5 text-[#F5E642]" />
                            <span className="text-[10px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                              {student.streak} дней
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getRiskBadge(student.risk)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-gradient-to-br from-[#EDE9FF] to-[#F9D0E8] border-0">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#7C6AF7]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  AI-Рекомендация
                </h3>
                <p className="text-[13px] text-[#1A1A2E]/80 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                  5 учеников не заходили более 5 дней. Рекомендуем отправить персонализированное напоминание.
                </p>
                <Button size="sm">
                  Отправить напоминание
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
