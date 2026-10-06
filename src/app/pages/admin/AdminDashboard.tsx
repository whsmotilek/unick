import { AuthorRequests } from '../../components/admin/AuthorRequests';
import { NotificationBell } from '../../components/NotificationBell';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  LogOut, Users, School, BookOpen, GraduationCap, CheckCircle2, FileCheck, Target, UserPlus, RefreshCw, LayoutDashboard,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { EmptyState } from '../../components/EmptyState';
import { PageSkeleton } from '../../components/skeletons/PageSkeleton';
import { DemoBanner } from '../../components/DemoBanner';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../store/DataStore';
import {
  ENROLLMENT_SOURCES, pilotGoals, pilotOverview, plural, pluralize, recentSignups, schoolsTable,
} from '../../lib/analytics';
import type { Course, EnrollmentSource, UserRole } from '../../types';
import logoWhiteFull from '@/assets/logo/logo-full-white.png';

const heading = { fontFamily: 'var(--font-heading)' } as const;
const body = { fontFamily: 'var(--font-body)' } as const;

const SOURCE_LABELS: Record<EnrollmentSource, string> = {
  invite: 'По приглашению',
  manual: 'Добавлены автором',
  free: 'Самозапись',
  network: 'Из каталога Unick',
  payment: 'Оплата',
};
const SOURCE_COLORS: Record<EnrollmentSource, string> = {
  invite: '#7C6AF7',
  manual: '#B8D8F8',
  free: '#C5E8A0',
  network: '#FFE5D9',
  payment: '#1A1A2E',
};
const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Ученик',
  author: 'Автор',
  curator: 'Куратор',
  admin: 'Админ',
  methodologist: 'Методолог',
  support: 'Поддержка',
};
const STATUS_STYLES: Record<Course['status'], { label: string; className: string }> = {
  published: { label: 'опубликован', className: 'bg-[#C5E8A0] text-[#2D5016]' },
  draft: { label: 'черновик', className: 'bg-[#F5F4F2] text-[#8A8A9A]' },
  archived: { label: 'в архиве', className: 'bg-[#FFE5D9] text-[#8A4B2A]' },
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
const SIGNUPS_PREVIEW = 15;

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { users, courses, enrollmentRecords, progressRows, homework, loading, refresh } = useDataStore();
  const [showAllSignups, setShowAllSignups] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const now = useMemo(() => new Date(), [users, courses, enrollmentRecords, progressRows, homework]);
  const input = useMemo(
    () => ({ users, courses, enrollments: enrollmentRecords, progressRows, homework, now }),
    [users, courses, enrollmentRecords, progressRows, homework, now],
  );
  const overview = useMemo(() => pilotOverview(input), [input]);
  const goals = useMemo(() => pilotGoals(overview), [overview]);
  const schools = useMemo(() => schoolsTable(input), [input]);
  const signups = useMemo(() => recentSignups(input), [input]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refresh(); } finally { setRefreshing(false); }
  };

  const header = (
    <header className="bg-[#1A1A2E] text-white sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto pl-4 pr-2 sm:px-6 h-14 flex items-center gap-2 sm:gap-3">
        <img src={logoWhiteFull} alt="Unick" className="h-5 sm:h-6 w-auto shrink-0" />
        <span className="hidden sm:inline text-[12px] text-white/50 border-l border-white/15 pl-3" style={body}>Панель пилота</span>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-2 min-w-0">
          <span className="hidden md:inline text-[12px] text-white/60 truncate max-w-[220px]" style={body}>{user?.email}</span>
          {user?.schoolId && (
            <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 max-sm:size-10 max-sm:px-0">
              <Link to="/author" aria-label="Кабинет автора" title="Кабинет автора">
                <LayoutDashboard className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Кабинет автора</span>
              </Link>
            </Button>
          )}
          <NotificationBell variant="dark" />
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing} className="text-white/80 hover:text-white hover:bg-white/10 max-sm:size-10 max-sm:px-0" aria-label="Обновить данные" title="Обновить данные">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Выйти" className="text-white/80 hover:text-white hover:bg-white/10 max-sm:size-10 max-sm:px-0">
            <LogOut className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4F2]">
        {header}
        <PageSkeleton />
      </div>
    );
  }

  const totals = [
    { label: plural(overview.authors, ['автор', 'автора', 'авторов']), value: overview.authors, hint: pluralize(overview.schools, ['школа', 'школы', 'школ']), icon: Users, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
    { label: 'курсов опубликовано', value: overview.coursesPublished, hint: `${pluralize(overview.coursesDraft, ['черновик', 'черновика', 'черновиков'])}${overview.coursesArchived ? ` · ${overview.coursesArchived} в архиве` : ''}`, icon: BookOpen, color: 'bg-[#B8D8F8]', text: 'text-[#0D3B66]' },
    { label: 'учеников на курсах', value: overview.enrolledStudents, hint: `аккаунтов учеников: ${overview.studentAccounts}`, icon: GraduationCap, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
    { label: 'записей на курсы', value: overview.enrollments, hint: 'действующих', icon: UserPlus, color: 'bg-white', text: 'text-[#1A1A2E]' },
    { label: 'уроков за 7 дней', value: overview.lessonsCompletedThisWeek, hint: 'отмечено пройденными', icon: CheckCircle2, color: 'bg-white', text: 'text-[#1A1A2E]' },
    { label: 'ДЗ ждут проверки', value: overview.pendingHomework, hint: 'во всех школах', icon: FileCheck, color: 'bg-[#FFE5D9]', text: 'text-[#C2410C]' },
  ];
  const sourceTotal = overview.enrollments;
  const visibleSignups = showAllSignups ? signups : signups.slice(0, SIGNUPS_PREVIEW);

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {header}
      <DemoBanner />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mb-6">
          <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#1A1A2E] mb-1" style={heading}>Как идёт пилот</h1>
          <p className="text-[13px] text-[#8A8A9A]" style={body}>Все школы, курсы и ученики платформы</p>
        </div>

        <AuthorRequests />

        {/* Цели пилота */}
        <Card className="border-0 mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#7C6AF7]" strokeWidth={1.5} />
              <h2 className="text-[16px] font-semibold text-[#1A1A2E]" style={heading}>Цели пилота</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {goals.map(g => (
                <div key={g.key}>
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <span className="text-[13px] text-[#1A1A2E] min-w-0" style={body}>{g.label}</span>
                    <span className="text-[13px] text-[#8A8A9A] shrink-0 whitespace-nowrap" style={body}>
                      <span className="text-[20px] font-bold text-[#1A1A2E]" style={heading}>{g.value}</span> / {g.target}
                    </span>
                  </div>
                  <Progress value={g.percent} className="h-2.5" />
                  <p className="text-[12px] text-[#8A8A9A] mt-1.5" style={body}>
                    {g.value >= g.target ? 'Цель достигнута' : `Осталось ${g.target - g.value} · ${g.percent}%`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Итоги */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
          {totals.map(s => (
            <Card key={s.label} className={`${s.color} border-0`}>
              <CardContent className="p-4 sm:p-5">
                <s.icon className={`w-5 h-5 ${s.text} mb-3`} strokeWidth={1.5} />
                <p className={`text-[24px] sm:text-[28px] leading-tight font-bold ${s.text}`} style={heading}>{s.value}</p>
                <p className="text-[12px] font-medium text-[#1A1A2E] mt-1" style={body}>{s.label}</p>
                <p className="text-[12px] leading-snug text-[#1A1A2E]/55" style={body}>{s.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Источники записей */}
        <Card className="border-0 mb-6">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#1A1A2E] mb-4" style={heading}>Откуда приходят ученики</h2>
            {sourceTotal === 0 ? (
              <p className="text-[13px] text-[#8A8A9A]" style={body}>Записей на курсы пока нет.</p>
            ) : (
              <>
                <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-[#F5F4F2]">
                  {ENROLLMENT_SOURCES.filter(s => overview.enrollmentsBySource[s] > 0).map(s => (
                    <div key={s} style={{ width: `${(overview.enrollmentsBySource[s] / sourceTotal) * 100}%`, background: SOURCE_COLORS[s] }} />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {ENROLLMENT_SOURCES.map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SOURCE_COLORS[s] }} />
                      <span className="text-[13px] text-[#1A1A2E] min-w-0" style={body}>{SOURCE_LABELS[s]}</span>
                      <span className="ml-auto lg:ml-1 text-[13px] font-semibold text-[#1A1A2E]" style={body}>{overview.enrollmentsBySource[s]}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Школы */}
        <Card className="border-0 mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <School className="w-5 h-5 text-[#7C6AF7]" strokeWidth={1.5} />
              <h2 className="text-[16px] font-semibold text-[#1A1A2E]" style={heading}>Школы и авторы</h2>
            </div>
            {schools.length === 0 ? (
              <EmptyState icon={School} title="Школ пока нет" description="Когда первый автор зарегистрируется, его школа появится здесь." />
            ) : (
              <>
              {/* Телефон: карточка на школу */}
              <ul className="md:hidden divide-y divide-[#1A1A2E]/5">
                {schools.map(s => (
                  <li key={s.schoolId} className="py-3 first:pt-0 last:pb-0">
                    {s.authors.length === 0 ? (
                      <p className="text-[13px] text-[#8A8A9A]" style={body}>Автор не найден</p>
                    ) : s.authors.map(a => (
                      <div key={a.id} className="min-w-0 mb-1 last:mb-0">
                        <p className="text-[14px] font-medium text-[#1A1A2E] truncate" style={body}>{a.name}</p>
                        <p className="text-[12px] text-[#8A8A9A] truncate" style={body}>{a.email}</p>
                      </div>
                    ))}
                    <p className="text-[12px] text-[#8A8A9A] mt-1.5" style={body}>
                      <span className="font-semibold text-[#1A1A2E]">{pluralize(s.students, ['ученик', 'ученика', 'учеников'])}</span>
                      {' · '}активность: {s.lastActivity ? formatDate(s.lastActivity) : 'нет'}
                    </p>
                    {s.courses.length === 0 ? (
                      <p className="text-[13px] text-[#8A8A9A] mt-2" style={body}>Курсов нет</p>
                    ) : (
                      <ul className="mt-2 space-y-1.5">
                        {s.courses.map(c => (
                          <li key={c.id} className="flex items-start justify-between gap-2 rounded-lg border border-[#1A1A2E]/8 px-3 py-2">
                            <span className="text-[13px] text-[#1A1A2E] min-w-0 break-words" style={body}>{c.title}</span>
                            <Badge className={`${STATUS_STYLES[c.status].className} border-0 text-[12px] px-1.5 py-0 shrink-0`}>{STATUS_STYLES[c.status].label}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Автор</TableHead>
                    <TableHead>Курсы</TableHead>
                    <TableHead className="text-right">Ученики</TableHead>
                    <TableHead className="text-right">Последняя активность</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map(s => (
                    <TableRow key={s.schoolId} className="align-top">
                      <TableCell className="min-w-[160px]">
                        {s.authors.length === 0 ? (
                          <span className="text-[13px] text-[#8A8A9A]" style={body}>Автор не найден</span>
                        ) : s.authors.map(a => (
                          <div key={a.id} className="mb-1 last:mb-0">
                            <p className="text-[13px] font-medium text-[#1A1A2E]" style={body}>{a.name}</p>
                            <p className="text-[12px] text-[#8A8A9A] truncate max-w-[200px]" style={body}>{a.email}</p>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="min-w-[200px] whitespace-normal">
                        {s.courses.length === 0 ? (
                          <span className="text-[13px] text-[#8A8A9A]" style={body}>Курсов нет</span>
                        ) : (
                          <ul className="space-y-1">
                            {s.courses.map(c => (
                              <li key={c.id} className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[13px] text-[#1A1A2E]" style={body}>{c.title}</span>
                                <Badge className={`${STATUS_STYLES[c.status].className} border-0 text-[12px] px-1.5 py-0`}>{STATUS_STYLES[c.status].label}</Badge>
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-[13px] font-semibold text-[#1A1A2E]">{s.students}</TableCell>
                      <TableCell className="text-right text-[13px] text-[#8A8A9A]" style={body}>
                        {s.lastActivity ? formatDate(s.lastActivity) : 'нет'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* Пользователи */}
        <Card className="border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <h2 className="text-[16px] font-semibold text-[#1A1A2E]" style={heading}>Новые пользователи</h2>
              <span className="text-[12px] text-[#8A8A9A]" style={body}>{pluralize(users.length, ['пользователь', 'пользователя', 'пользователей'])}</span>
            </div>
            <p className="text-[12px] text-[#8A8A9A] mb-4" style={body}>
              По дате первой записи на курс — даты регистрации в данных нет. Без записей — в конце, по имени.
            </p>
            {signups.length === 0 ? (
              <EmptyState icon={Users} title="Пользователей пока нет" />
            ) : (
              <>
                <ul className="sm:hidden divide-y divide-[#1A1A2E]/5">
                  {visibleSignups.map(r => (
                    <li key={r.user.id} className="py-2.5 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#1A1A2E] truncate" style={body}>{r.user.name}</p>
                        <p className="text-[12px] text-[#8A8A9A] truncate" style={body}>{r.user.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-[12px] border-[#1A1A2E]/10 text-[#1A1A2E]/70">{ROLE_LABELS[r.user.role] ?? r.user.role}</Badge>
                        <p className="text-[12px] text-[#8A8A9A] mt-1 whitespace-nowrap" style={body}>
                          {r.courses ? `${pluralize(r.courses, ['курс', 'курса', 'курсов'])} · ${r.firstEnrollmentAt ? formatDate(r.firstEnrollmentAt) : '—'}` : 'нет записей'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Table className="hidden sm:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead className="hidden sm:table-cell">Роль</TableHead>
                      <TableHead className="text-right">Курсы</TableHead>
                      <TableHead className="text-right">Первая запись</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSignups.map(r => (
                      <TableRow key={r.user.id}>
                        <TableCell>
                          <p className="text-[13px] font-medium text-[#1A1A2E] truncate max-w-[180px]" style={body}>{r.user.name}</p>
                          <p className="text-[12px] text-[#8A8A9A] truncate max-w-[180px]" style={body}>{r.user.email}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-[12px] border-[#1A1A2E]/10 text-[#1A1A2E]/70">{ROLE_LABELS[r.user.role] ?? r.user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-[13px] text-[#1A1A2E]">{r.courses}</TableCell>
                        <TableCell className="text-right text-[13px] text-[#8A8A9A]" style={body}>
                          {r.firstEnrollmentAt ? formatDate(r.firstEnrollmentAt) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {signups.length > SIGNUPS_PREVIEW && (
                  <div className="text-center mt-3">
                    <Button variant="ghost" size="sm" className="text-[#7C6AF7] h-10 sm:h-8" onClick={() => setShowAllSignups(v => !v)}>
                      {showAllSignups ? 'Свернуть' : `Показать всех (${signups.length})`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
