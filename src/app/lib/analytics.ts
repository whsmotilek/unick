import type { Course, Enrollment, EnrollmentSource, Homework, LessonProgressRow, User } from '../types';
import { flattenCourse } from './courseAccess';

/**
 * Чистые функции для аналитики автора и панели администратора.
 * Все расчёты — только по реальным данным (записи, отметки уроков, ДЗ), без оценок и симуляций.
 * Текущий момент передаётся параметром `now`, чтобы функции было легко тестировать.
 */

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

// ===== Общие утилиты =====

/** Русская форма множественного числа: plural(5, ['ученик', 'ученика', 'учеников']) → 'учеников' */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(Math.trunc(n));
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

/** Число со склонённым словом: pluralize(3, ['урок', 'урока', 'уроков']) → '3 урока' */
export function pluralize(n: number, forms: [string, string, string]): string {
  return `${n} ${plural(n, forms)}`;
}

/** Медиана; null для пустого массива */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Длительность в часах → «меньше часа», «5 часов», «3 дня» */
export function formatDurationHours(hours: number): string {
  if (hours < 1) return 'меньше часа';
  if (hours < 48) {
    const h = Math.round(hours);
    return pluralize(h, ['час', 'часа', 'часов']);
  }
  const d = Math.round(hours / 24);
  return pluralize(d, ['день', 'дня', 'дней']);
}

/** Ключ дня в локальном времени: YYYY-MM-DD */
export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const time = (iso: string | undefined) => (iso ? new Date(iso).getTime() : NaN);
const isPendingHw = (h: Homework) => h.status === 'submitted' || h.status === 'review';
const lessonIdsOf = (c: Course) => new Set(c.modules.flatMap(m => m.lessons.map(l => l.id)));
const maxIso = (a: string | null, b: string | undefined): string | null =>
  !b ? a : !a || time(b) > time(a) ? b : a;

/** userId → множество courseId по действующим (не отозванным) записям в выбранных курсах */
export function enrolledByUser(enrollments: Enrollment[], courseIds: Set<string>): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const e of enrollments) {
    if (e.status === 'revoked' || !courseIds.has(e.courseId)) continue;
    let set = map.get(e.userId);
    if (!set) map.set(e.userId, (set = new Set()));
    set.add(e.courseId);
  }
  return map;
}

/** `${userId}|${courseId}` → множество завершённых lessonId (только существующие уроки) */
function completionsByPair(courses: Course[], progressRows: LessonProgressRow[]): Map<string, Set<string>> {
  const lessonsByCourse = new Map(courses.map(c => [c.id, lessonIdsOf(c)]));
  const map = new Map<string, Set<string>>();
  for (const r of progressRows) {
    const lessons = lessonsByCourse.get(r.courseId);
    if (!lessons || !lessons.has(r.lessonId)) continue;
    const key = `${r.userId}|${r.courseId}`;
    let set = map.get(key);
    if (!set) map.set(key, (set = new Set()));
    set.add(r.lessonId);
  }
  return map;
}

// ===== Аналитика автора =====

export interface AnalyticsInput {
  /** Курсы, по которым считаем (уже отфильтрованные по школе / выбранному курсу) */
  courses: Course[];
  enrollments: Enrollment[];
  progressRows: LessonProgressRow[];
  homework: Homework[];
  now: Date;
}

export interface AuthorKpis {
  /** Ученики с действующей записью хотя бы на один курс */
  students: number;
  /** Завершили хотя бы один урок */
  started: number;
  /** Прошли хотя бы один курс на 100% */
  finished: number;
  /** ДЗ, ждущие проверки */
  pendingHomework: number;
  /** Медианное время проверки ДЗ в часах; null — проверенных ДЗ нет */
  medianReviewHours: number | null;
  /** Сколько ДЗ учтено в медиане */
  reviewedHomework: number;
  /** Ученики с активностью (урок или сдача ДЗ) за последние 7 дней */
  activeLast7Days: number;
}

export function authorKpis({ courses, enrollments, progressRows, homework, now }: AnalyticsInput): AuthorKpis {
  const courseIds = new Set(courses.map(c => c.id));
  const enrolled = enrolledByUser(enrollments, courseIds);
  const completions = completionsByPair(courses, progressRows);
  const totals = new Map(courses.map(c => [c.id, lessonIdsOf(c).size]));

  let started = 0;
  let finished = 0;
  for (const [userId, cids] of enrolled) {
    let hasAny = false;
    let hasFull = false;
    for (const cid of cids) {
      const done = completions.get(`${userId}|${cid}`)?.size ?? 0;
      const total = totals.get(cid) ?? 0;
      if (done > 0) hasAny = true;
      if (total > 0 && done >= total) hasFull = true;
    }
    if (hasAny) started++;
    if (hasFull) finished++;
  }

  const scopedHw = homework.filter(h => courseIds.has(h.courseId));
  const reviewDurations = scopedHw
    .filter(h => (h.status === 'approved' || h.status === 'returned') && h.submittedAt && h.reviewedAt)
    .map(h => (time(h.reviewedAt) - time(h.submittedAt)) / HOUR_MS)
    .filter(h => Number.isFinite(h) && h >= 0);

  const since = now.getTime() - 7 * DAY_MS;
  const active = new Set<string>();
  for (const r of progressRows) {
    if (enrolled.get(r.userId)?.has(r.courseId) && time(r.completedAt) >= since) active.add(r.userId);
  }
  for (const h of scopedHw) {
    if (enrolled.get(h.studentId)?.has(h.courseId) && time(h.submittedAt) >= since) active.add(h.studentId);
  }

  return {
    students: enrolled.size,
    started,
    finished,
    pendingHomework: scopedHw.filter(isPendingHw).length,
    medianReviewHours: median(reviewDurations),
    reviewedHomework: reviewDurations.length,
    activeLast7Days: active.size,
  };
}

export interface FunnelStep {
  lessonId: string;
  title: string;
  moduleTitle: string;
  /** Порядковый номер урока в курсе, с 1 */
  position: number;
  completed: number;
  /** % записанных учеников, завершивших урок */
  percent: number;
}

/** Воронка прохождения уроков курса: для каждого урока по порядку — доля записанных учеников, завершивших его. */
export function lessonFunnel(course: Course, enrollments: Enrollment[], progressRows: LessonProgressRow[]): { enrolled: number; steps: FunnelStep[] } {
  const enrolled = new Set(
    enrollments.filter(e => e.courseId === course.id && e.status !== 'revoked').map(e => e.userId),
  );
  const doneBy = new Map<string, Set<string>>();
  for (const r of progressRows) {
    if (r.courseId !== course.id || !enrolled.has(r.userId)) continue;
    let set = doneBy.get(r.lessonId);
    if (!set) doneBy.set(r.lessonId, (set = new Set()));
    set.add(r.userId);
  }
  const steps = flattenCourse(course, []).map(({ lesson, module, index }) => {
    const completed = doneBy.get(lesson.id)?.size ?? 0;
    return {
      lessonId: lesson.id,
      title: lesson.title,
      moduleTitle: module.title,
      position: index + 1,
      completed,
      percent: enrolled.size ? Math.round((completed / enrolled.size) * 100) : 0,
    };
  });
  return { enrolled: enrolled.size, steps };
}

export interface FunnelDrop {
  /** Урок, после которого ученики останавливаются */
  after: FunnelStep;
  next: FunnelStep;
  /** Падение в процентных пунктах */
  drop: number;
}

/** Самое большое падение между соседними уроками воронки; null, если падений нет. */
export function biggestDrop(steps: FunnelStep[]): FunnelDrop | null {
  let best: FunnelDrop | null = null;
  for (let i = 0; i < steps.length - 1; i++) {
    const drop = steps[i].percent - steps[i + 1].percent;
    if (drop > 0 && (!best || drop > best.drop)) best = { after: steps[i], next: steps[i + 1], drop };
  }
  return best;
}

export interface DayActivity {
  /** YYYY-MM-DD в локальном времени */
  date: string;
  lessons: number;
}

/** Завершённые уроки по дням за последние `days` дней (включая сегодня), по реальным датам completedAt. */
export function dailyCompletions(progressRows: LessonProgressRow[], courseIds: Set<string>, now: Date, days = 28): DayActivity[] {
  const result: DayActivity[] = [];
  const index = new Map<string, DayActivity>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const item = { date: localDayKey(d), lessons: 0 };
    result.push(item);
    index.set(item.date, item);
  }
  for (const r of progressRows) {
    if (!courseIds.has(r.courseId)) continue;
    const t = time(r.completedAt);
    if (!Number.isFinite(t)) continue;
    const item = index.get(localDayKey(new Date(t)));
    if (item) item.lessons++;
  }
  return result;
}

export interface AtRiskStudent {
  userId: string;
  courseId: string;
  /** Последняя активность по курсу (урок или сдача ДЗ); null — активности ещё не было */
  lastActivity: string | null;
  enrolledAt: string;
  /** Сколько полных дней без активности (от последней активности, а если её нет — от записи) */
  daysInactive: number;
  progress: number;
}

/**
 * Ученики в зоне риска: действующая запись, прогресс < 100% и нет активности по курсу `inactiveDays`+ дней.
 * Если ученик ещё ничего не делал, отсчёт идёт от даты записи (только что записавшиеся не попадают в список).
 */
export function studentsAtRisk({ courses, enrollments, progressRows, homework, now }: AnalyticsInput, inactiveDays = 7): AtRiskStudent[] {
  const byId = new Map(courses.map(c => [c.id, c]));
  const completions = completionsByPair(courses, progressRows);
  const last = new Map<string, string>();
  const bump = (key: string, iso: string | undefined) => {
    const next = maxIso(last.get(key) ?? null, iso);
    if (next) last.set(key, next);
  };
  for (const r of progressRows) bump(`${r.userId}|${r.courseId}`, r.completedAt);
  for (const h of homework) bump(`${h.studentId}|${h.courseId}`, h.submittedAt);

  const seen = new Set<string>();
  const result: AtRiskStudent[] = [];
  for (const e of enrollments) {
    const course = byId.get(e.courseId);
    const key = `${e.userId}|${e.courseId}`;
    if (!course || e.status === 'revoked' || seen.has(key)) continue;
    seen.add(key);
    const total = lessonIdsOf(course).size;
    if (total === 0) continue;
    const done = completions.get(key)?.size ?? 0;
    const progress = Math.round((done / total) * 100);
    if (progress >= 100) continue;
    const lastActivity = last.get(key) ?? null;
    const reference = time(lastActivity ?? e.createdAt);
    if (!Number.isFinite(reference)) continue;
    const daysInactive = Math.floor((now.getTime() - reference) / DAY_MS);
    if (daysInactive < inactiveDays) continue;
    result.push({ userId: e.userId, courseId: e.courseId, lastActivity, enrolledAt: e.createdAt, daysInactive, progress });
  }
  return result.sort((a, b) => b.daysInactive - a.daysInactive);
}

// ===== Панель администратора =====

export interface AdminInput {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  progressRows: LessonProgressRow[];
  homework: Homework[];
  now: Date;
}

export const ENROLLMENT_SOURCES: EnrollmentSource[] = ['invite', 'manual', 'free', 'network', 'payment'];

export interface PilotOverview {
  authors: number;
  schools: number;
  coursesPublished: number;
  coursesDraft: number;
  coursesArchived: number;
  /** Пользователи с ролью «ученик» */
  studentAccounts: number;
  /** Уникальные пользователи с действующей записью хотя бы на один курс */
  enrolledStudents: number;
  /** Действующие записи на курсы */
  enrollments: number;
  enrollmentsBySource: Record<EnrollmentSource, number>;
  lessonsCompletedThisWeek: number;
  pendingHomework: number;
}

export function pilotOverview({ users, courses, enrollments, progressRows, homework, now }: AdminInput): PilotOverview {
  const schools = new Set<string>();
  for (const c of courses) if (c.schoolId) schools.add(c.schoolId);
  for (const u of users) if (u.role === 'author' && u.schoolId) schools.add(u.schoolId);

  const active = enrollments.filter(e => e.status !== 'revoked');
  const bySource = Object.fromEntries(ENROLLMENT_SOURCES.map(s => [s, 0])) as Record<EnrollmentSource, number>;
  for (const e of active) bySource[e.source] = (bySource[e.source] ?? 0) + 1;

  const since = now.getTime() - 7 * DAY_MS;
  return {
    authors: users.filter(u => u.role === 'author').length,
    schools: schools.size,
    coursesPublished: courses.filter(c => c.status === 'published').length,
    coursesDraft: courses.filter(c => c.status === 'draft').length,
    coursesArchived: courses.filter(c => c.status === 'archived').length,
    studentAccounts: users.filter(u => u.role === 'student').length,
    enrolledStudents: new Set(active.map(e => e.userId)).size,
    enrollments: active.length,
    enrollmentsBySource: bySource,
    lessonsCompletedThisWeek: progressRows.filter(r => time(r.completedAt) >= since).length,
    pendingHomework: homework.filter(isPendingHw).length,
  };
}

export interface PilotGoal {
  key: 'authors' | 'courses' | 'students';
  label: string;
  value: number;
  target: number;
  percent: number;
}

/** Цели пилота из карты трекшна */
export const PILOT_TARGETS: Record<PilotGoal['key'], number> = { authors: 5, courses: 5, students: 50 };

export function pilotGoals(o: PilotOverview, targets = PILOT_TARGETS): PilotGoal[] {
  const goal = (key: PilotGoal['key'], label: string, value: number, target: number): PilotGoal => ({
    key, label, value, target, percent: target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0,
  });
  return [
    goal('authors', 'Авторы', o.authors, targets.authors),
    goal('courses', 'Опубликованные курсы', o.coursesPublished, targets.courses),
    goal('students', 'Ученики на курсах', o.enrolledStudents, targets.students),
  ];
}

export interface SchoolRow {
  schoolId: string;
  authors: User[];
  courses: Course[];
  /** Уникальные ученики с действующей записью на курсы школы */
  students: number;
  /** Последнее событие на курсах школы: урок, сдача ДЗ или запись; null — событий нет */
  lastActivity: string | null;
}

export function schoolsTable({ users, courses, enrollments, progressRows, homework }: AdminInput): SchoolRow[] {
  const rows = new Map<string, SchoolRow>();
  const row = (schoolId: string) => {
    let r = rows.get(schoolId);
    if (!r) rows.set(schoolId, (r = { schoolId, authors: [], courses: [], students: 0, lastActivity: null }));
    return r;
  };
  for (const u of users) if (u.role === 'author' && u.schoolId) row(u.schoolId).authors.push(u);
  const schoolOfCourse = new Map<string, string>();
  for (const c of courses) {
    if (!c.schoolId) continue;
    row(c.schoolId).courses.push(c);
    schoolOfCourse.set(c.id, c.schoolId);
  }

  const students = new Map<string, Set<string>>();
  const touch = (courseId: string, iso: string | undefined) => {
    const sid = schoolOfCourse.get(courseId);
    if (!sid) return;
    const r = row(sid);
    r.lastActivity = maxIso(r.lastActivity, iso);
  };
  for (const e of enrollments) {
    const sid = schoolOfCourse.get(e.courseId);
    if (!sid) continue;
    touch(e.courseId, e.createdAt);
    if (e.status === 'revoked') continue;
    let set = students.get(sid);
    if (!set) students.set(sid, (set = new Set()));
    set.add(e.userId);
  }
  for (const r of progressRows) touch(r.courseId, r.completedAt);
  for (const h of homework) touch(h.courseId, h.submittedAt);
  for (const [sid, set] of students) row(sid).students = set.size;

  return [...rows.values()].sort((a, b) => {
    if (a.lastActivity && b.lastActivity) return time(b.lastActivity) - time(a.lastActivity);
    if (a.lastActivity || b.lastActivity) return a.lastActivity ? -1 : 1;
    return b.students - a.students;
  });
}

export interface SignupRow {
  user: User;
  /** Дата первой записи на курс — у пользователя нет даты регистрации, это ближайший реальный ориентир */
  firstEnrollmentAt: string | null;
  courses: number;
}

/** Пользователи, отсортированные по дате первой записи на курс (сначала новые); без записей — в конце по имени. */
export function recentSignups({ users, enrollments }: Pick<AdminInput, 'users' | 'enrollments'>): SignupRow[] {
  const first = new Map<string, string>();
  const count = new Map<string, Set<string>>();
  for (const e of enrollments) {
    const prev = first.get(e.userId);
    if (!prev || time(e.createdAt) < time(prev)) first.set(e.userId, e.createdAt);
    if (e.status === 'revoked') continue;
    let set = count.get(e.userId);
    if (!set) count.set(e.userId, (set = new Set()));
    set.add(e.courseId);
  }
  return users
    .map(user => ({ user, firstEnrollmentAt: first.get(user.id) ?? null, courses: count.get(user.id)?.size ?? 0 }))
    .sort((a, b) => {
      if (a.firstEnrollmentAt && b.firstEnrollmentAt) return time(b.firstEnrollmentAt) - time(a.firstEnrollmentAt);
      if (a.firstEnrollmentAt || b.firstEnrollmentAt) return a.firstEnrollmentAt ? -1 : 1;
      return a.user.name.localeCompare(b.user.name, 'ru');
    });
}
