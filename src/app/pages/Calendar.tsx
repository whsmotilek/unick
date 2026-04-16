import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  Video,
  FileText,
  AlertCircle,
  Users,
  Play,
  X,
  Edit,
  Trash2,
  Bell,
  MapPin,
  Link as LinkIcon
} from 'lucide-react';

type EventType = 'lesson' | 'deadline' | 'live' | 'release' | 'meeting';

interface CalendarEvent {
  id: number;
  title: string;
  type: EventType;
  date: Date;
  time: string;
  duration?: string;
  description?: string;
  course?: string;
  instructor?: string;
  location?: string;
  link?: string;
  attendees?: number;
  color: string;
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 3)); // March 3, 2026
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<EventType[]>(['lesson', 'deadline', 'live', 'release', 'meeting']);

  const events: CalendarEvent[] = [
    {
      id: 1,
      title: 'Вебинар: Основы UX дизайна',
      type: 'live',
      date: new Date(2026, 2, 5, 18, 0),
      time: '18:00',
      duration: '2 часа',
      description: 'Прямой эфир с разбором основных принципов UX дизайна',
      course: 'UI/UX Дизайн',
      instructor: 'Александр Иванов',
      link: 'https://zoom.us/j/123456',
      attendees: 45,
      color: '#FF6B6B'
    },
    {
      id: 2,
      title: 'Дедлайн: Домашка по Figma',
      type: 'deadline',
      date: new Date(2026, 2, 7, 23, 59),
      time: '23:59',
      description: 'Сдать дизайн мобильного приложения',
      course: 'Figma Pro',
      color: '#F5E642'
    },
    {
      id: 3,
      title: 'Выход урока: Анимация в Figma',
      type: 'release',
      date: new Date(2026, 2, 8, 10, 0),
      time: '10:00',
      description: 'Новый урок доступен для просмотра',
      course: 'Figma Pro',
      color: '#7C6AF7'
    },
    {
      id: 4,
      title: 'Консультация с куратором',
      type: 'meeting',
      date: new Date(2026, 2, 10, 15, 0),
      time: '15:00',
      duration: '30 мин',
      description: 'Разбор домашнего задания',
      instructor: 'Мария Петрова',
      link: 'https://meet.google.com/abc-defg-hij',
      color: '#B8D8F8'
    },
    {
      id: 5,
      title: 'Урок: Типографика',
      type: 'lesson',
      date: new Date(2026, 2, 12, 12, 0),
      time: '12:00',
      duration: '45 мин',
      course: 'UI/UX Дизайн',
      description: 'Изучаем основы типографики в дизайне',
      color: '#C5E8A0'
    },
    {
      id: 6,
      title: 'Дедлайн: Проект "Редизайн сайта"',
      type: 'deadline',
      date: new Date(2026, 2, 15, 23, 59),
      time: '23:59',
      description: 'Финальный проект по курсу',
      course: 'UI/UX Дизайн',
      color: '#F5E642'
    },
    {
      id: 7,
      title: 'Прямой эфир: Q&A сессия',
      type: 'live',
      date: new Date(2026, 2, 18, 19, 0),
      time: '19:00',
      duration: '1 час',
      description: 'Ответы на вопросы студентов',
      instructor: 'Александр Иванов',
      attendees: 67,
      link: 'https://youtube.com/live/xyz',
      color: '#FF6B6B'
    },
    {
      id: 8,
      title: 'Выход модуля: Продвинутая верстка',
      type: 'release',
      date: new Date(2026, 2, 20, 9, 0),
      time: '09:00',
      description: 'Открывается новый модуль курса',
      course: 'Веб-дизайн Pro',
      color: '#7C6AF7'
    },
    {
      id: 9,
      title: 'Групповой созвон',
      type: 'meeting',
      date: new Date(2026, 2, 22, 16, 0),
      time: '16:00',
      duration: '1 час',
      description: 'Обсуждение финальных проектов',
      attendees: 12,
      color: '#B8D8F8'
    },
    {
      id: 10,
      title: 'Дедлайн: Тест по UI компонентам',
      type: 'deadline',
      date: new Date(2026, 2, 25, 20, 0),
      time: '20:00',
      course: 'UI/UX Дизайн',
      color: '#F5E642'
    }
  ];

  const eventTypes = [
    { id: 'lesson' as EventType, label: 'Уроки', icon: FileText, color: '#C5E8A0' },
    { id: 'deadline' as EventType, label: 'Дедлайны', icon: AlertCircle, color: '#F5E642' },
    { id: 'live' as EventType, label: 'Прямые эфиры', icon: Video, color: '#FF6B6B' },
    { id: 'release' as EventType, label: 'Релизы уроков', icon: Play, color: '#7C6AF7' },
    { id: 'meeting' as EventType, label: 'Встречи', icon: Users, color: '#B8D8F8' }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear() &&
             activeFilters.includes(event.type);
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const toggleFilter = (type: EventType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const upcomingEvents = events
    .filter(e => e.date >= new Date() && activeFilters.includes(e.type))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const getEventIcon = (type: EventType) => {
    const eventType = eventTypes.find(t => t.id === type);
    return eventType ? eventType.icon : FileText;
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Календарь
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Занятия, дедлайны, эфиры и события
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Фильтры
            </Button>
            <Button className="gap-2" onClick={() => setShowEventModal(true)}>
              <Plus className="w-4 h-4" />
              Добавить событие
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-[20px] font-semibold text-[#1A1A2E] capitalize min-w-[200px] text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                      {monthName}
                    </h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                    >
                      Месяц
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                    >
                      Неделя
                    </Button>
                    <Button
                      variant={viewMode === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('day')}
                    >
                      День
                    </Button>
                  </div>
                </div>

                {/* Event Type Filters */}
                <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-[#1A1A2E]/5">
                  {eventTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleFilter(type.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                        activeFilters.includes(type.id)
                          ? 'ring-2 ring-offset-1'
                          : 'opacity-40 hover:opacity-70'
                      }`}
                      style={{
                        backgroundColor: type.color + '40',
                        color: '#1A1A2E',
                        ringColor: type.color
                      }}
                    >
                      <type.icon className="w-3.5 h-3.5" />
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Weekday Headers */}
                  {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[11px] font-semibold text-[#8A8A9A] py-2"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                  ))}

                  {/* Calendar Days */}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const dayEvents = getEventsForDay(day);
                    const isToday = day === new Date().getDate() &&
                                   currentDate.getMonth() === new Date().getMonth() &&
                                   currentDate.getFullYear() === new Date().getFullYear();

                    return (
                      <div
                        key={day}
                        className={`aspect-square border rounded-xl p-2 transition-all hover:shadow-md ${
                          isToday
                            ? 'bg-[#EDE9FF] border-[#7C6AF7] ring-2 ring-[#7C6AF7] ring-offset-2'
                            : 'bg-white border-[#1A1A2E]/10 hover:border-[#7C6AF7]/40'
                        }`}
                      >
                        <div className="h-full flex flex-col">
                          <div className={`text-[13px] font-semibold mb-1 ${
                            isToday ? 'text-[#7C6AF7]' : 'text-[#1A1A2E]'
                          }`} style={{ fontFamily: 'var(--font-heading)' }}>
                            {day}
                          </div>
                          <div className="flex-1 overflow-hidden space-y-0.5">
                            {dayEvents.slice(0, 3).map((event) => {
                              const EventIcon = getEventIcon(event.type);
                              return (
                                <button
                                  key={event.id}
                                  onClick={() => setSelectedEvent(event)}
                                  className="w-full text-left px-1.5 py-0.5 rounded text-[9px] font-medium transition-all hover:scale-105"
                                  style={{
                                    backgroundColor: event.color + '40',
                                    color: '#1A1A2E'
                                  }}
                                >
                                  <div className="flex items-center gap-1 truncate">
                                    <EventIcon className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate">{event.time}</span>
                                  </div>
                                </button>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <div className="text-[9px] text-[#8A8A9A] text-center mt-0.5">
                                +{dayEvents.length - 3} еще
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Event Details */}
            {selectedEvent ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: selectedEvent.color + '40' }}
                    >
                      {(() => {
                        const EventIcon = getEventIcon(selectedEvent.type);
                        return <EventIcon className="w-5 h-5 text-[#1A1A2E]" />;
                      })()}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedEvent(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    {selectedEvent.title}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-[12px] text-[#8A8A9A]">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {selectedEvent.date.toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#8A8A9A]">
                      <Clock className="w-4 h-4" />
                      <span>
                        {selectedEvent.time}
                        {selectedEvent.duration && ` • ${selectedEvent.duration}`}
                      </span>
                    </div>
                    {selectedEvent.course && (
                      <div className="flex items-center gap-2 text-[12px] text-[#8A8A9A]">
                        <FileText className="w-4 h-4" />
                        <span>{selectedEvent.course}</span>
                      </div>
                    )}
                    {selectedEvent.instructor && (
                      <div className="flex items-center gap-2 text-[12px] text-[#8A8A9A]">
                        <Users className="w-4 h-4" />
                        <span>{selectedEvent.instructor}</span>
                      </div>
                    )}
                    {selectedEvent.attendees && (
                      <div className="flex items-center gap-2 text-[12px] text-[#8A8A9A]">
                        <Users className="w-4 h-4" />
                        <span>{selectedEvent.attendees} участников</span>
                      </div>
                    )}
                    {selectedEvent.link && (
                      <a
                        href={selectedEvent.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[12px] text-[#7C6AF7] hover:underline"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>Ссылка на событие</span>
                      </a>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <p className="text-[12px] text-[#8A8A9A] leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                      {selectedEvent.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Bell className="w-3.5 h-3.5" />
                      Напомнить
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="w-3.5 h-3.5" />
                      Изменить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-[#EDE9FF] to-[#F9D0E8] border-0">
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="w-12 h-12 text-[#7C6AF7] mx-auto mb-3" />
                  <p className="text-[13px] text-[#1A1A2E]/70" style={{ fontFamily: 'var(--font-body)' }}>
                    Выберите событие на календаре для просмотра деталей
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Events */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Ближайшие события
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full text-left p-3 rounded-xl border border-[#1A1A2E]/10 hover:border-[#7C6AF7]/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: event.color + '40' }}
                          >
                            <EventIcon className="w-4 h-4 text-[#1A1A2E]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-[#1A1A2E] mb-1 truncate">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-[#8A8A9A]">
                              <span>
                                {event.date.toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                              <span>•</span>
                              <span>{event.time}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-[#FFF4DC] border-0">
              <CardContent className="p-5">
                <h3 className="text-[13px] font-semibold text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  Статистика месяца
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8A8A9A]">Всего событий</span>
                    <span className="font-semibold text-[#1A1A2E]">{events.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8A8A9A]">Прямых эфиров</span>
                    <span className="font-semibold text-[#1A1A2E]">
                      {events.filter(e => e.type === 'live').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8A8A9A]">Дедлайнов</span>
                    <span className="font-semibold text-[#1A1A2E]">
                      {events.filter(e => e.type === 'deadline').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8A8A9A]">Новых уроков</span>
                    <span className="font-semibold text-[#1A1A2E]">
                      {events.filter(e => e.type === 'release').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Event Modal (placeholder) */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Новое событие
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEventModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-[13px] mb-2 block">Название события</Label>
                  <Input placeholder="Введите название..." className="h-11 rounded-xl" />
                </div>

                <div>
                  <Label className="text-[13px] mb-2 block">Тип события</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {eventTypes.slice(0, 4).map((type) => (
                      <button
                        key={type.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-[#1A1A2E]/10 hover:border-[#7C6AF7] transition-all text-left"
                      >
                        <type.icon className="w-4 h-4" />
                        <span className="text-[12px] font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[13px] mb-2 block">Дата</Label>
                    <Input type="date" className="h-11 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-[13px] mb-2 block">Время</Label>
                    <Input type="time" className="h-11 rounded-xl" />
                  </div>
                </div>

                <div>
                  <Label className="text-[13px] mb-2 block">Описание</Label>
                  <textarea
                    className="w-full min-h-[100px] px-3 py-2 text-[13px] rounded-xl border border-[#1A1A2E]/10 focus:outline-none focus:ring-2 focus:ring-[#7C6AF7] resize-none"
                    placeholder="Добавьте описание..."
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEventModal(false)}
                  >
                    Отмена
                  </Button>
                  <Button className="flex-1">
                    Создать событие
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
