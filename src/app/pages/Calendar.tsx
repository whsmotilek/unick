import { useMemo, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, ChevronRight, FileCheck, BookOpen } from 'lucide-react';
import { useDataStore } from '../store/DataStore';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Link } from 'react-router';

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  type: 'homework' | 'lesson';
  title: string;
  courseTitle?: string;
  link?: string;
}

const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function Calendar() {
  const { user } = useAuth();
  const { courses, enrollments, homework } = useDataStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = useMemo<CalendarEvent[]>(() => {
    if (!user) return [];
    const list: CalendarEvent[] = [];
    const enrolledIds = user.role === 'student'
      ? (enrollments[user.id] || [])
      : courses.filter(c => c.schoolId === user.schoolId).map(c => c.id);

    for (const c of courses) {
      if (!enrolledIds.includes(c.id)) continue;
      for (const m of c.modules) {
        for (const l of m.lessons) {
          if (l.type === 'homework' && l.content?.data?.deadline) {
            list.push({
              date: l.content.data.deadline.slice(0, 10),
              type: 'homework',
              title: l.title,
              courseTitle: c.title,
              link: user.role === 'student' ? '/student/homework' : '/author/homework',
            });
          }
        }
      }
    }

    // Recent submissions for author/curator
    if (user.role === 'author' || user.role === 'curator') {
      for (const h of homework) {
        if (h.submittedAt && enrolledIds.includes(h.courseId)) {
          const c = courses.find(c => c.id === h.courseId);
          list.push({
            date: h.submittedAt.slice(0, 10),
            type: 'lesson',
            title: `Сдано: ${h.title}`,
            courseTitle: c?.title,
          });
        }
      }
    }

    return list;
  }, [user, courses, enrollments, homework]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);

  // Build calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = useMemo(() => {
    return events
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events, todayStr]);

  const goPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Календарь</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Дедлайны и события ваших курсов</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {monthNames[month]} {year}
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToday}>Сегодня</Button>
                  <Button variant="ghost" size="icon" onClick={goPrev}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={goNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Week days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(d => (
                  <div key={d} className="text-center text-[11px] font-semibold text-[#8A8A9A] py-2" style={{ fontFamily: 'var(--font-body)' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (d === null) return <div key={i} />;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const dayEvents = eventsByDate[dateStr] || [];
                  const isToday = dateStr === todayStr;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.005 }}
                      className={`aspect-square rounded-xl p-1.5 text-left transition-colors ${
                        isToday ? 'bg-[#7C6AF7] text-white' : dayEvents.length ? 'bg-[#EDE9FF]' : 'hover:bg-[#F5F4F2]'
                      }`}
                    >
                      <p className={`text-[12px] font-semibold ${isToday ? 'text-white' : 'text-[#1A1A2E]'}`} style={{ fontFamily: 'var(--font-body)' }}>
                        {d}
                      </p>
                      {dayEvents.length > 0 && (
                        <div className={`mt-1 flex gap-0.5 flex-wrap`}>
                          {dayEvents.slice(0, 3).map((_, ei) => (
                            <span key={ei} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-[#7C6AF7]'}`} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming events */}
        <div>
          <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Ближайшие события</h2>
          {upcoming.length === 0 ? (
            <Card className="border-0">
              <CardContent className="p-6 text-center">
                <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  Ближайших событий нет
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {upcoming.map((e, i) => {
                const days = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-0 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EDE9FF] flex items-center justify-center flex-shrink-0">
                            {e.type === 'homework'
                              ? <FileCheck className="w-4 h-4 text-[#7C6AF7]" />
                              : <BookOpen className="w-4 h-4 text-[#7C6AF7]" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1A1A2E] line-clamp-1" style={{ fontFamily: 'var(--font-body)' }}>
                              {e.title}
                            </p>
                            {e.courseTitle && (
                              <p className="text-[11px] text-[#8A8A9A] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                                {e.courseTitle}
                              </p>
                            )}
                            <Badge variant={days <= 0 ? 'destructive' : days < 3 ? 'warning' : 'secondary'} className="text-[10px]">
                              {days === 0 ? 'Сегодня' : days === 1 ? 'Завтра' : `Через ${days} дн.`}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
              {user?.role === 'student' && (
                <Link to="/student/homework">
                  <Button variant="outline" className="w-full mt-2">К заданиям</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
