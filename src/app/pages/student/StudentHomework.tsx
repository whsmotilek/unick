import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Upload,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Link as LinkIcon,
  X
} from 'lucide-react';

export function StudentHomework() {
  const [activeTab, setActiveTab] = useState('pending');

  const homeworks = [
    {
      id: 1,
      title: 'Анализ интерфейса приложения',
      course: 'UI/UX Дизайн',
      description: 'Выберите любое мобильное приложение и проведите детальный анализ его интерфейса. Опишите сильные и слабые стороны.',
      dueDate: '2026-05-10',
      status: 'pending',
      priority: 'high',
      points: 100
    },
    {
      id: 2,
      title: 'Создание библиотеки компонентов',
      course: 'Figma для начинающих',
      description: 'Создайте базовую библиотеку компонентов в Figma с кнопками, инпутами и карточками.',
      dueDate: '2026-05-15',
      status: 'pending',
      priority: 'medium',
      points: 80
    },
    {
      id: 3,
      title: 'Исследование пользователей',
      course: 'UI/UX Дизайн',
      description: 'Проведите интервью с 3 пользователями и создайте персоны на основе полученных данных.',
      dueDate: '2026-05-05',
      status: 'submitted',
      priority: 'high',
      points: 120,
      submittedDate: '2026-05-04',
      feedback: null
    },
    {
      id: 4,
      title: 'Типографика в вебе',
      course: 'Веб-дизайн Pro',
      description: 'Создайте руководство по типографике для веб-проекта с примерами использования.',
      dueDate: '2026-04-28',
      status: 'graded',
      priority: 'low',
      points: 90,
      score: 85,
      submittedDate: '2026-04-27',
      gradedDate: '2026-04-30',
      feedback: 'Отличная работа! Хорошо подобраны шрифты и описаны правила использования. Рекомендую добавить больше примеров адаптивной типографики.'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-[10px]">Высокий</Badge>;
      case 'medium': return <Badge variant="warning" className="text-[10px]">Средний</Badge>;
      case 'low': return <Badge variant="success" className="text-[10px]">Низкий</Badge>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="text-[10px]">Ожидает</Badge>;
      case 'submitted': return <Badge variant="default" className="text-[10px]">Сдано</Badge>;
      case 'graded': return <Badge variant="success" className="text-[10px]">Проверено</Badge>;
      default: return null;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date('2026-05-08'); // Mock current date
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return { text: 'Просрочено', color: 'text-[#FF6B6B]' };
    if (diff === 0) return { text: 'Сегодня', color: 'text-[#FF6B6B]' };
    if (diff === 1) return { text: 'Завтра', color: 'text-[#F5E642]' };
    if (diff <= 3) return { text: `${diff} дня`, color: 'text-[#F5E642]' };
    return { text: `${diff} дней`, color: 'text-[#8A8A9A]' };
  };

  const filteredHomeworks = homeworks.filter(hw => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return hw.status === 'pending';
    if (activeTab === 'submitted') return hw.status === 'submitted';
    if (activeTab === 'graded') return hw.status === 'graded';
    return true;
  });

  const stats = [
    { label: 'Всего заданий', value: homeworks.length.toString(), color: 'bg-[#B8D8F8]', textColor: 'text-[#0D3B66]' },
    { label: 'Ожидают сдачи', value: homeworks.filter(h => h.status === 'pending').length.toString(), color: 'bg-[#FFE5D9]', textColor: 'text-[#FF6B6B]' },
    { label: 'На проверке', value: homeworks.filter(h => h.status === 'submitted').length.toString(), color: 'bg-[#F5E642]', textColor: 'text-[#5A5000]' },
    { label: 'Проверено', value: homeworks.filter(h => h.status === 'graded').length.toString(), color: 'bg-[#C5E8A0]', textColor: 'text-[#2D5016]' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Домашние задания
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Управляйте своими заданиями и отслеживайте их статус
            </p>
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

        {/* Tabs */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveTab('all')}
                size="sm"
              >
                Все
              </Button>
              <Button 
                variant={activeTab === 'pending' ? 'default' : 'outline'}
                onClick={() => setActiveTab('pending')}
                size="sm"
              >
                Ожидают сдачи
              </Button>
              <Button 
                variant={activeTab === 'submitted' ? 'default' : 'outline'}
                onClick={() => setActiveTab('submitted')}
                size="sm"
              >
                На проверке
              </Button>
              <Button 
                variant={activeTab === 'graded' ? 'default' : 'outline'}
                onClick={() => setActiveTab('graded')}
                size="sm"
              >
                Проверено
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Homework List */}
        <div className="space-y-4">
          {filteredHomeworks.map((homework) => {
            const dueInfo = getDaysUntilDue(homework.dueDate);
            
            return (
              <Card key={homework.id} className={`hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all ${
                homework.status === 'pending' && dueInfo.text === 'Просрочено' ? 'border-l-4 border-l-[#FF6B6B]' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[18px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                          {homework.title}
                        </h3>
                        {getStatusBadge(homework.status)}
                        {getPriorityBadge(homework.priority)}
                      </div>
                      <p className="text-[11px] text-[#7C6AF7] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                        {homework.course}
                      </p>
                      <p className="text-[13px] text-[#8A8A9A] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                        {homework.description}
                      </p>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 justify-end mb-2">
                        <Calendar className="w-4 h-4 text-[#8A8A9A]" />
                        <span className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          {new Date(homework.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 justify-end ${dueInfo.color}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                          {dueInfo.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {homework.status === 'pending' && (
                    <div className="border-t border-[#1A1A2E]/5 pt-4 mt-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`file-${homework.id}`} className="text-[13px] mb-2 block">
                            Прикрепите файлы
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`file-${homework.id}`}
                              type="file"
                              className="h-10 rounded-xl border-[#1A1A2E]/10"
                            />
                            <Button variant="outline" size="icon" className="h-10 w-10">
                              <Upload className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`link-${homework.id}`} className="text-[13px] mb-2 block">
                            Или добавьте ссылку
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`link-${homework.id}`}
                              placeholder="https://..."
                              className="h-10 rounded-xl border-[#1A1A2E]/10"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                            Максимум баллов: {homework.points}
                          </span>
                          <Button className="gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Сдать работу
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {homework.status === 'submitted' && (
                    <div className="border-t border-[#1A1A2E]/5 pt-4 mt-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#EDE9FF]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#7C6AF7]" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                              Работа отправлена на проверку
                            </p>
                            <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                              Сдано: {new Date(homework.submittedDate!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Посмотреть
                        </Button>
                      </div>
                    </div>
                  )}

                  {homework.status === 'graded' && (
                    <div className="border-t border-[#1A1A2E]/5 pt-4 mt-4 space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#C5E8A0]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-[#2D5016]" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                              Работа проверена
                            </p>
                            <p className="text-[11px] text-[#1A1A2E]/70" style={{ fontFamily: 'var(--font-body)' }}>
                              Проверено: {new Date(homework.gradedDate!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[24px] font-bold text-[#2D5016]" style={{ fontFamily: 'var(--font-heading)' }}>
                            {homework.score}/{homework.points}
                          </p>
                          <p className="text-[10px] text-[#1A1A2E]/70" style={{ fontFamily: 'var(--font-body)' }}>
                            баллов
                          </p>
                        </div>
                      </div>
                      
                      {homework.feedback && (
                        <div className="p-4 rounded-xl bg-white border border-[#1A1A2E]/10">
                          <p className="text-[11px] font-medium text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                            Отзыв куратора:
                          </p>
                          <p className="text-[13px] text-[#8A8A9A] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                            {homework.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
