import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Users, PlayCircle, Trophy, FileCheck, Timer, Activity, BarChart3, TrendingDown, AlertTriangle, MessageSquare,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from 'recharts';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { EmptyState } from '../../components/EmptyState';
import { PageSkeleton } from '../../components/skeletons/PageSkeleton';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import {
  authorKpis, biggestDrop, dailyCompletions, formatDurationHours, lessonFunnel, plural, pluralize, studentsAtRisk,
} from '../../lib/analytics';

const ALL = 'all';
const heading = { fontFamily: 'var(--font-heading)' } as const;
const body = { fontFamily: 'var(--font-body)' } as const;

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
const formatDay = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

export function AuthorAnalytics() {
  const { user } = useAuth();
  const { courses, enrollmentRecords, progressRows, homework, getUser, loading } = useDataStore();
  const [picked, setSelected] = useState<string>(ALL);

  const myCourses = useMemo(() => courses.filter(c => c.schoolId === user?.schoolId), [courses, user?.schoolId]);
  // Если выбранный курс удалили — возвращаемся ко всем курсам
  const selected = picked !== ALL && myCourses.some(c => c.id === picked) ? picked : ALL;
  const scopeCourses = useMemo(
    () => (selected === ALL ? myCourses : myCourses.filter(c => c.id === selected)),
    [myCourses, selected],
  );
  const scopeIds = useMemo(() => new Set(scopeCourses.map(c => c.id)), [scopeCourses]);
  // Для воронки нужен конкретный курс; если курс один — берём его
  const funnelCourse = selected === ALL ? (myCourses.length === 1 ? myCourses[0] : undefined) : scopeCourses[0];

  const now = useMemo(() => new Date(), [progressRows, homework, enrollmentRecords]);
  const input = useMemo(
    () => ({ courses: scopeCourses, enrollments: enrollmentRecords, progressRows, homework, now }),
    [scopeCourses, enrollmentRecords, progressRows, homework, now],
  );

  const kpis = useMemo(() => authorKpis(input), [input]);
  const funnel = useMemo(
    () => (funnelCourse ? lessonFunnel(funnelCourse, enrollmentRecords, progressRows) : null),
    [funnelCourse, enrollmentRecords, progressRows],
  );
  const drop = useMemo(() => (funnel ? biggestDrop(funnel.steps) : null), [funnel]);
  const activity = useMemo(() => dailyCompletions(progressRows, scopeIds, now, 28), [progressRows, scopeIds, now]);
  const activityTotal = activity.reduce((s, d) => s + d.lessons, 0);
  const atRisk = useMemo(() => studentsAtRisk(input), [input]);
  const courseTitle = (id: string) => myCourses.find(c => c.id === id)?.title ?? 'Курс';

  if (loading) return <PageSkeleton />;

  if (myCourses.length === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <PageHeader />
        <Card className="border-0">
          <EmptyState
            icon={BarChart3}
            title="Пока нечего анализировать"
            description="Создайте первый курс и пригласите учеников — здесь появится статистика прохождения."
            action={<Button asChild className="bg-[#7C6AF7] hover:bg-[#6B59E6]"><Link to="/author/courses/new">Создать курс</Link></Button>}
          />
        </Card>
      </div>
    );
  }

  const share = (n: number) => (kpis.students ? ` · ${Math.round((n / kpis.students) * 100)}%` : '');
  const stats = [
    { label: plural(kpis.students, ['ученик', 'ученика', 'учеников']), hint: 'записаны на курсы', value: String(kpis.students), icon: Users, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
    { label: 'начали', hint: `прошли хотя бы 1 урок${share(kpis.started)}`, value: String(kpis.started), icon: PlayCircle, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
    { label: 'завершили', hint: `прошли курс на 100%${share(kpis.finished)}`, value: String(kpis.finished), icon: Trophy, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
    { label: 'ДЗ ждут проверки', hint: kpis.pendingHomework ? 'сданы и не проверены' : 'всё проверено', value: String(kpis.pendingHomework), icon: FileCheck, color: 'bg-[#FFE5D9]', text: 'text-[#C2410C]' },
    {
      label: 'медиана проверки ДЗ',
      hint: kpis.reviewedHomework ? `по ${pluralize(kpis.reviewedHomework, ['проверенному ДЗ', 'проверенным ДЗ', 'проверенным ДЗ'])}` : 'проверенных ДЗ пока нет',
      value: kpis.medianReviewHours === null ? '—' : formatDurationHours(kpis.medianReviewHours),
      icon: Timer, color: 'bg-white', text: 'text-[#1A1A2E]',
    },
    { label: 'активны за 7 дней', hint: 'урок или сдача ДЗ', value: String(kpis.activeLast7Days), icon: Activity, color: 'bg-white', text: 'text-[#1A1A2E]' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <PageHeader />
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full sm:w-72 bg-white" aria-label="Курс">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все курсы</SelectItem>
            {myCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {stats.map(s => (
          <Card key={s.label} className={`${s.color} border-0`}>
            <CardContent className="p-4 sm:p-5">
              <s.icon className={`w-5 h-5 ${s.text} mb-3`} strokeWidth={1.5} />
              <p className={`text-[22px] sm:text-[26px] leading-tight font-bold ${s.text}`} style={heading}>{s.value}</p>
              <p className="text-[12px] font-medium text-[#1A1A2E] mt-1" style={body}>{s.label}</p>
              <p className="text-[11px] text-[#1A1A2E]/55" style={body}>{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Воронка уроков */}
      <Card className="border-0 mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <h3 className="text-[16px] font-semibold text-[#1A1A2E]" style={heading}>Где отваливаются ученики</h3>
            {funnel && funnel.enrolled > 0 && (
              <span className="text-[12px] text-[#8A8A9A]" style={body}>
                {funnelCourse!.title} · {pluralize(funnel.enrolled, ['ученик', 'ученика', 'учеников'])}
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#8A8A9A] mb-4" style={body}>Доля записанных учеников, завершивших каждый урок</p>

          {!funnelCourse ? (
            <EmptyState icon={TrendingDown} title="Выберите курс" description="Воронка строится по урокам одного курса — выберите его в списке вверху." />
          ) : !funnel || funnel.steps.length === 0 ? (
            <EmptyState icon={TrendingDown} title="В курсе пока нет уроков" description="Добавьте уроки, чтобы видеть, как ученики их проходят." />
          ) : funnel.enrolled === 0 ? (
            <EmptyState icon={TrendingDown} title="На курс ещё никто не записан" description="Когда появятся ученики, здесь будет видно, на каком уроке они останавливаются." />
          ) : (
            <>
              {drop ? (
                <div className="flex gap-3 items-start rounded-xl bg-[#FFE5D9] p-3 sm:p-4 mb-4">
                  <AlertTriangle className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#1A1A2E]" style={body}>
                    Больше всего учеников останавливается после урока «{drop.after.title}»: его прошли {drop.after.percent}%,
                    а следующий урок «{drop.next.title}» — {drop.next.percent}% (−{drop.drop} п.п.).
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-[#2D5016] bg-[#C5E8A0]/50 rounded-xl p-3 mb-4" style={body}>
                  Резких падений между уроками нет.
                </p>
              )}
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={funnel.steps} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#EEE" />
                  <XAxis dataKey="position" tick={{ fontSize: 12, fill: '#8A8A9A' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12, fill: '#8A8A9A' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#F5F4F2' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const s = payload[0].payload as (typeof funnel.steps)[number];
                      return (
                        <div className="bg-white rounded-lg shadow-md px-3 py-2 text-[12px] max-w-[240px]" style={body}>
                          <p className="text-[#8A8A9A]">Урок {s.position} · {s.moduleTitle}</p>
                          <p className="font-medium text-[#1A1A2E]">{s.title}</p>
                          <p className="text-[#7C6AF7] mt-1">{s.percent}% · {pluralize(s.completed, ['ученик', 'ученика', 'учеников'])}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="percent" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {funnel.steps.map(s => (
                      <Cell key={s.lessonId} fill={drop && s.lessonId === drop.next.lessonId ? '#FF9F7A' : '#7C6AF7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-[#8A8A9A] mt-2" style={body}>По горизонтали — номер урока в курсе. Наведите на столбец, чтобы увидеть название.</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Активность */}
      <Card className="border-0 mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h3 className="text-[16px] font-semibold text-[#1A1A2E]" style={heading}>Пройденные уроки за 28 дней</h3>
            <span className="text-[12px] text-[#8A8A9A]" style={body}>
              Всего {pluralize(activityTotal, ['урок', 'урока', 'уроков'])}
            </span>
          </div>
          {activityTotal === 0 ? (
            <EmptyState icon={Activity} title="За последние 4 недели уроков не проходили" description="Как только ученики начнут отмечать уроки, здесь появится график по дням." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activity} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#EEE" />
                <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 11, fill: '#8A8A9A' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8A8A9A' }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#F5F4F2' }}
                  labelFormatter={v => formatDay(String(v))}
                  formatter={(v: number) => [pluralize(v, ['урок', 'урока', 'уроков']), 'Пройдено']}
                />
                <Bar dataKey="lessons" fill="#7C6AF7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Зона риска */}
      <Card className="border-0">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-1" style={heading}>Ученики в зоне риска</h3>
          <p className="text-[12px] text-[#8A8A9A] mb-4" style={body}>Нет активности 7 дней и больше, курс не пройден до конца</p>
          {atRisk.length === 0 ? (
            <EmptyState icon={Users} title="Все ученики на связи" description="Никто не пропадал дольше недели. Отличная работа!" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ученик</TableHead>
                  {selected === ALL && <TableHead className="hidden md:table-cell">Курс</TableHead>}
                  <TableHead>Последняя активность</TableHead>
                  <TableHead className="w-[140px]">Прогресс</TableHead>
                  <TableHead className="text-right"><span className="sr-only">Действия</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRisk.map(r => {
                  const u = getUser(r.userId);
                  return (
                    <TableRow key={`${r.userId}|${r.courseId}`}>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={u?.avatar} />
                            <AvatarFallback className="bg-[#EDE9FF] text-[#7C6AF7] text-xs">{u?.name?.charAt(0) ?? '?'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#1A1A2E] truncate max-w-[160px]" style={body}>{u?.name ?? 'Ученик'}</p>
                            {selected === ALL && <p className="text-[11px] text-[#8A8A9A] truncate max-w-[160px] md:hidden" style={body}>{courseTitle(r.courseId)}</p>}
                          </div>
                        </div>
                      </TableCell>
                      {selected === ALL && <TableCell className="hidden md:table-cell text-[13px] text-[#1A1A2E]">{courseTitle(r.courseId)}</TableCell>}
                      <TableCell className="text-[13px]" style={body}>
                        {r.lastActivity ? (
                          <span className="text-[#1A1A2E]">{formatDate(r.lastActivity)}</span>
                        ) : (
                          <span className="text-[#8A8A9A]">не начинал · записан {formatDate(r.enrolledAt)}</span>
                        )}
                        <span className="block text-[11px] text-[#C2410C]">{pluralize(r.daysInactive, ['день', 'дня', 'дней'])} без активности</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={r.progress} className="h-1.5 w-16 sm:w-20" />
                          <span className="text-[12px] text-[#8A8A9A]">{r.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="text-[#7C6AF7]">
                          <Link to={`/author/chat?with=${encodeURIComponent(r.userId)}`}>
                            <MessageSquare className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Написать</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={heading}>Аналитика</h1>
      <p className="text-[13px] text-[#8A8A9A]" style={body}>Как ученики проходят ваши курсы — по реальным данным</p>
    </div>
  );
}
