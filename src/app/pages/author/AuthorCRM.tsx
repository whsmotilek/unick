import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Tag,
  TrendingUp,
  Clock,
  DollarSign,
  Eye,
  Edit,
  MoreVertical,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';

export function AuthorCRM() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState('all');

  const funnelStages = [
    { id: 'lead', label: 'Лиды', count: 45, color: 'bg-[#B8D8F8]' },
    { id: 'trial', label: 'Пробный период', count: 28, color: 'bg-[#F5E642]' },
    { id: 'active', label: 'Активные', count: 342, color: 'bg-[#C5E8A0]' },
    { id: 'paused', label: 'На паузе', count: 12, color: 'bg-[#FFE5D9]' },
    { id: 'churned', label: 'Ушли', count: 8, color: 'bg-[#F5F4F2]' }
  ];

  const students = [
    {
      id: 1,
      name: 'Анна Иванова',
      email: 'anna@example.com',
      phone: '+7 (999) 123-45-67',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      stage: 'active',
      tags: ['VIP', 'UI/UX'],
      courses: ['UI/UX Дизайн', 'Figma'],
      ltv: 45000,
      joinDate: '2026-01-15',
      lastContact: '2026-05-07',
      nextAction: 'Отправить материалы',
      progress: 75,
      engagement: 'high',
      notes: 3
    },
    {
      id: 2,
      name: 'Петр Смирнов',
      email: 'petr@example.com',
      phone: '+7 (999) 234-56-78',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      stage: 'trial',
      tags: ['Новичок'],
      courses: ['Figma'],
      ltv: 0,
      joinDate: '2026-05-05',
      lastContact: '2026-05-06',
      nextAction: 'Звонок через 2 дня',
      progress: 15,
      engagement: 'medium',
      notes: 1
    },
    {
      id: 3,
      name: 'Мария Петрова',
      email: 'maria@example.com',
      phone: '+7 (999) 345-67-89',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      stage: 'paused',
      tags: ['В зоне риска'],
      courses: ['UI/UX Дизайн'],
      ltv: 15000,
      joinDate: '2026-03-10',
      lastContact: '2026-04-28',
      nextAction: 'Реактивация',
      progress: 28,
      engagement: 'low',
      notes: 5
    },
    {
      id: 4,
      name: 'Алекс Джонсон',
      email: 'alex@example.com',
      phone: '+7 (999) 456-78-90',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      stage: 'active',
      tags: ['Амбассадор', 'UI/UX', 'Веб-дизайн'],
      courses: ['UI/UX Дизайн', 'Веб-дизайн Pro', 'Figma'],
      ltv: 65000,
      joinDate: '2025-11-20',
      lastContact: '2026-05-08',
      nextAction: 'Отзыв и кейс',
      progress: 92,
      engagement: 'high',
      notes: 8
    }
  ];

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  const activities = [
    {
      id: 1,
      type: 'course',
      title: 'Завершил урок "Основы UX"',
      timestamp: '2026-05-08 14:30',
      icon: CheckCircle2,
      color: 'text-[#2D5016]'
    },
    {
      id: 2,
      type: 'message',
      title: 'Отправлено письмо: Напоминание о домашке',
      timestamp: '2026-05-07 10:15',
      icon: Mail,
      color: 'text-[#7C6AF7]'
    },
    {
      id: 3,
      type: 'call',
      title: 'Звонок: Обсуждение прогресса',
      timestamp: '2026-05-05 16:00',
      icon: Phone,
      color: 'text-[#FF6B6B]'
    },
    {
      id: 4,
      type: 'homework',
      title: 'Сдана домашка: Анализ интерфейса',
      timestamp: '2026-05-04 18:45',
      icon: FileText,
      color: 'text-[#5A5000]'
    }
  ];

  const getEngagementBadge = (engagement: string) => {
    switch (engagement) {
      case 'high': return <Badge variant="success" className="text-[10px]">Высокая</Badge>;
      case 'medium': return <Badge variant="warning" className="text-[10px]">Средняя</Badge>;
      case 'low': return <Badge variant="destructive" className="text-[10px]">Низкая</Badge>;
      default: return null;
    }
  };

  const getStageBadge = (stage: string) => {
    const stageData = funnelStages.find(s => s.id === stage);
    return <Badge variant="secondary" className="text-[10px]">{stageData?.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              CRM Ученики
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Управление отношениями и жизненным циклом учеников
            </p>
          </div>
          
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Добавить ученика
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-6">
        {/* Sales Funnel */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-[16px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Воронка продаж
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {funnelStages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveTab(stage.id)}
                  className={`${stage.color} rounded-xl p-4 text-center transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] ${
                    activeTab === stage.id ? 'ring-2 ring-[#7C6AF7] ring-offset-2' : ''
                  }`}
                >
                  <p className="text-[11px] font-medium text-[#1A1A2E]/70 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                    {stage.label}
                  </p>
                  <p className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {stage.count}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                    <Input
                      placeholder="Поиск по имени, email, телефону..."
                      className="pl-10 h-11 rounded-xl border-[#1A1A2E]/10"
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Фильтры
                  </Button>
                </div>

                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedStudent === student.id
                          ? 'bg-[#EDE9FF] border-[#7C6AF7]'
                          : 'bg-white border-[#1A1A2E]/10 hover:border-[#7C6AF7]/40'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-[#7C6AF7] text-white">
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                                {student.name}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                {getStageBadge(student.stage)}
                                {getEngagementBadge(student.engagement)}
                                {student.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[9px]">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-[#8A8A9A]">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[11px] text-[#8A8A9A] mb-3">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="truncate">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{student.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>LTV: ₽{student.ltv.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Последний контакт: {new Date(student.lastContact).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-[#FF6B6B]" />
                              <span className="text-[11px] text-[#1A1A2E] font-medium">
                                {student.nextAction}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-7 text-[11px]">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Написать
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-[11px]">
                                <Eye className="w-3 h-3 mr-1" />
                                Профиль
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Details */}
          <div className="space-y-6">
            {selectedStudentData ? (
              <>
                {/* Quick Info */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={selectedStudentData.avatar} />
                        <AvatarFallback className="bg-[#7C6AF7] text-white text-[20px]">
                          {selectedStudentData.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                          {selectedStudentData.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStudentData.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-[9px]">
                              <Tag className="w-2.5 h-2.5 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-[11px] text-[#8A8A9A] mb-1">Email</Label>
                        <p className="text-[13px] text-[#1A1A2E]">{selectedStudentData.email}</p>
                      </div>
                      <div>
                        <Label className="text-[11px] text-[#8A8A9A] mb-1">Телефон</Label>
                        <p className="text-[13px] text-[#1A1A2E]">{selectedStudentData.phone}</p>
                      </div>
                      <div>
                        <Label className="text-[11px] text-[#8A8A9A] mb-1">Дата регистрации</Label>
                        <p className="text-[13px] text-[#1A1A2E]">
                          {new Date(selectedStudentData.joinDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <Label className="text-[11px] text-[#8A8A9A] mb-1">LTV</Label>
                        <p className="text-[18px] font-bold text-[#2D5016]" style={{ fontFamily: 'var(--font-heading)' }}>
                          ₽{selectedStudentData.ltv.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-6">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        Звонок
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Чат
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Встреча
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Courses */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                      Курсы ({selectedStudentData.courses.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedStudentData.courses.map((course, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#F5F4F2] flex items-center justify-between">
                          <span className="text-[12px] text-[#1A1A2E]">{course}</span>
                          <Badge variant="success" className="text-[9px]">{selectedStudentData.progress}%</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Timeline */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                      История активности
                    </h3>
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-[#F5F4F2] flex items-center justify-center ${activity.color}`}>
                            <activity.icon className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[12px] text-[#1A1A2E] mb-0.5">{activity.title}</p>
                            <p className="text-[10px] text-[#8A8A9A]">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Показать все
                    </Button>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[14px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                        Заметки
                      </h3>
                      <Badge variant="secondary" className="text-[10px]">{selectedStudentData.notes}</Badge>
                    </div>
                    <textarea
                      placeholder="Добавить заметку..."
                      className="w-full min-h-[100px] px-3 py-2 text-[12px] rounded-lg border border-[#1A1A2E]/10 focus:outline-none focus:ring-2 focus:ring-[#7C6AF7] resize-none mb-3"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                    <Button size="sm" className="w-full gap-2">
                      <Send className="w-3.5 h-3.5" />
                      Добавить заметку
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-[#8A8A9A] mx-auto mb-3" />
                  <p className="text-[13px] text-[#8A8A9A]">
                    Выберите ученика для просмотра деталей
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
