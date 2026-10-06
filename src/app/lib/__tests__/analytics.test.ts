import { describe, expect, it } from 'vitest';
import {
  authorKpis, biggestDrop, dailyCompletions, formatDurationHours, lessonFunnel, localDayKey, median, pilotGoals,
  pilotOverview, plural, recentSignups, schoolsTable, studentsAtRisk,
} from '../analytics';
import type { Course, Enrollment, Homework, LessonProgressRow, User } from '../../types';

const NOW = new Date(2026, 9, 6, 12, 0, 0);
const daysAgo = (n: number, hour = 12) => new Date(2026, 9, 6 - n, hour).toISOString();

const lesson = (id: string, moduleId: string, order: number) => ({
  id, moduleId, order, title: `Урок ${id}`, type: 'text' as const, content: { type: 'text' as const, data: {} }, isLocked: false,
});

const course = (id: string, schoolId = 's1', status: Course['status'] = 'published'): Course => ({
  id, schoolId, title: id, description: '', status, accessType: 'invite', sequential: false, createdAt: '', updatedAt: '',
  modules: [
    { id: `${id}-m2`, courseId: id, title: 'M2', order: 2, lessons: [lesson(`${id}-l3`, `${id}-m2`, 1)] },
    { id: `${id}-m1`, courseId: id, title: 'M1', order: 1, lessons: [lesson(`${id}-l2`, `${id}-m1`, 2), lesson(`${id}-l1`, `${id}-m1`, 1)] },
  ],
});

let eid = 0;
const enr = (userId: string, courseId: string, createdAt = daysAgo(30), extra: Partial<Enrollment> = {}): Enrollment => ({
  id: `e${eid++}`, userId, courseId, status: 'active', source: 'invite', createdAt, ...extra,
});
const row = (userId: string, courseId: string, lessonId: string, completedAt = daysAgo(1)): LessonProgressRow => ({ userId, courseId, lessonId, completedAt });
const hw = (patch: Partial<Homework>): Homework => ({
  id: Math.random().toString(), lessonId: 'c1-l1', studentId: 'u1', courseId: 'c1', title: 'ДЗ', description: '', status: 'submitted', ...patch,
});
const user = (id: string, role: User['role'], schoolId?: string, name = id): User => ({ id, name, email: `${id}@x`, role, schoolId });

describe('plural', () => {
  const f: [string, string, string] = ['ученик', 'ученика', 'учеников'];
  it('склоняет по правилам русского языка', () => {
    expect(plural(1, f)).toBe('ученик');
    expect(plural(21, f)).toBe('ученик');
    expect(plural(3, f)).toBe('ученика');
    expect(plural(22, f)).toBe('ученика');
    expect(plural(5, f)).toBe('учеников');
    expect(plural(11, f)).toBe('учеников');
    expect(plural(12, f)).toBe('учеников');
    expect(plural(111, f)).toBe('учеников');
    expect(plural(0, f)).toBe('учеников');
  });
});

describe('median / formatDurationHours', () => {
  it('считает медиану', () => {
    expect(median([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
  it('форматирует длительность', () => {
    expect(formatDurationHours(0.3)).toBe('меньше часа');
    expect(formatDurationHours(1)).toBe('1 час');
    expect(formatDurationHours(5)).toBe('5 часов');
    expect(formatDurationHours(23)).toBe('23 часа');
    expect(formatDurationHours(72)).toBe('3 дня');
    expect(formatDurationHours(24 * 5)).toBe('5 дней');
  });
});

describe('authorKpis', () => {
  const c1 = course('c1');
  const enrollments = [
    enr('u1', 'c1'), enr('u2', 'c1'), enr('u3', 'c1'),
    enr('u4', 'c1', daysAgo(30), { status: 'revoked' }),
    enr('u5', 'other'),
  ];
  const progressRows = [
    row('u1', 'c1', 'c1-l1', daysAgo(20)), row('u1', 'c1', 'c1-l2', daysAgo(20)), row('u1', 'c1', 'c1-l3', daysAgo(10)),
    row('u2', 'c1', 'c1-l1', daysAgo(2)),
    row('u2', 'c1', 'deleted-lesson', daysAgo(1)),
    row('u4', 'c1', 'c1-l1', daysAgo(1)), // запись отозвана
  ];
  const homework = [
    hw({ studentId: 'u3', status: 'submitted', submittedAt: daysAgo(3) }),
    hw({ studentId: 'u1', status: 'approved', submittedAt: daysAgo(10, 10), reviewedAt: daysAgo(10, 12) }),
    hw({ studentId: 'u1', status: 'returned', submittedAt: daysAgo(12, 0), reviewedAt: daysAgo(11, 0) }),
    hw({ studentId: 'u2', status: 'approved', submittedAt: daysAgo(15, 0), reviewedAt: daysAgo(12, 0) }),
    hw({ courseId: 'other', status: 'review' }),
  ];
  const k = authorKpis({ courses: [c1], enrollments, progressRows, homework, now: NOW });

  it('считает учеников, начавших и закончивших', () => {
    expect(k.students).toBe(3);
    expect(k.started).toBe(2);
    expect(k.finished).toBe(1);
  });
  it('считает ДЗ и медиану проверки', () => {
    expect(k.pendingHomework).toBe(1);
    expect(k.reviewedHomework).toBe(3);
    expect(k.medianReviewHours).toBe(24);
  });
  it('активные за 7 дней — по урокам и сдаче ДЗ', () => {
    expect(k.activeLast7Days).toBe(2); // u2 (урок), u3 (ДЗ)
  });
  it('пустые данные', () => {
    const empty = authorKpis({ courses: [], enrollments: [], progressRows: [], homework: [], now: NOW });
    expect(empty).toMatchObject({ students: 0, started: 0, finished: 0, pendingHomework: 0, medianReviewHours: null, activeLast7Days: 0 });
  });
});

describe('lessonFunnel / biggestDrop', () => {
  const c1 = course('c1');
  const enrollments = [enr('u1', 'c1'), enr('u2', 'c1'), enr('u3', 'c1'), enr('u4', 'c1')];
  const progressRows = [
    ...['u1', 'u2', 'u3', 'u4'].map(u => row(u, 'c1', 'c1-l1')),
    row('u1', 'c1', 'c1-l2'), row('u2', 'c1', 'c1-l2'), row('u3', 'c1', 'c1-l2'),
    row('u1', 'c1', 'c1-l3'),
    row('stranger', 'c1', 'c1-l3'),
  ];
  const { enrolled, steps } = lessonFunnel(c1, enrollments, progressRows);

  it('идёт по урокам в порядке курса', () => {
    expect(enrolled).toBe(4);
    expect(steps.map(s => s.lessonId)).toEqual(['c1-l1', 'c1-l2', 'c1-l3']);
    expect(steps.map(s => s.percent)).toEqual([100, 75, 25]);
    expect(steps.map(s => s.position)).toEqual([1, 2, 3]);
  });
  it('находит самое большое падение', () => {
    const d = biggestDrop(steps)!;
    expect(d.after.lessonId).toBe('c1-l2');
    expect(d.next.lessonId).toBe('c1-l3');
    expect(d.drop).toBe(50);
  });
  it('нет падения — null', () => {
    expect(biggestDrop([])).toBeNull();
    expect(biggestDrop(lessonFunnel(c1, [], []).steps)).toBeNull();
  });
});

describe('dailyCompletions', () => {
  it('раскладывает завершения по реальным дням', () => {
    const rows = [
      row('u1', 'c1', 'a', daysAgo(0, 9)), row('u2', 'c1', 'b', daysAgo(0, 10)),
      row('u1', 'c1', 'c', daysAgo(27)),
      row('u1', 'c1', 'd', daysAgo(28)), // за пределами окна
      row('u1', 'c2', 'e', daysAgo(1)), // чужой курс
    ];
    const days = dailyCompletions(rows, new Set(['c1']), NOW, 28);
    expect(days).toHaveLength(28);
    expect(days[27]).toEqual({ date: localDayKey(NOW), lessons: 2 });
    expect(days[0].lessons).toBe(1);
    expect(days.reduce((s, d) => s + d.lessons, 0)).toBe(3);
  });
});

describe('studentsAtRisk', () => {
  const c1 = course('c1');
  it('выбирает неактивных 7+ дней с прогрессом < 100%', () => {
    const enrollments = [
      enr('old', 'c1'), // ничего не делал 30 дней
      enr('new', 'c1', daysAgo(2)), // только записался
      enr('active', 'c1'),
      enr('done', 'c1'),
      enr('stale', 'c1'),
      enr('hwonly', 'c1'),
    ];
    const progressRows = [
      row('active', 'c1', 'c1-l1', daysAgo(1)),
      ...['c1-l1', 'c1-l2', 'c1-l3'].map(l => row('done', 'c1', l, daysAgo(20))),
      row('stale', 'c1', 'c1-l1', daysAgo(9)),
      row('hwonly', 'c1', 'c1-l1', daysAgo(20)),
    ];
    const homework = [hw({ studentId: 'hwonly', submittedAt: daysAgo(3) })];
    const risk = studentsAtRisk({ courses: [c1], enrollments, progressRows, homework, now: NOW });
    expect(risk.map(r => r.userId)).toEqual(['old', 'stale']);
    expect(risk[0]).toMatchObject({ lastActivity: null, progress: 0, daysInactive: 30 });
    expect(risk[1]).toMatchObject({ progress: 33, daysInactive: 9 });
  });
});

describe('админ: обзор пилота', () => {
  const users = [
    user('a1', 'author', 's1', 'Анна'), user('a2', 'author', 's2', 'Борис'), user('adm', 'admin', undefined, 'Дмитрий'),
    user('u1', 'student', undefined, 'Яна'), user('u2', 'student', undefined, 'Вера'), user('u3', 'student', undefined, 'Глеб'),
  ];
  const courses = [course('c1', 's1'), course('c2', 's1', 'draft'), course('c3', 's2', 'archived')];
  const enrollments = [
    enr('u1', 'c1', daysAgo(10), { source: 'invite' }),
    enr('u2', 'c1', daysAgo(3), { source: 'free' }),
    enr('u1', 'c2', daysAgo(5), { source: 'manual' }),
    enr('u3', 'c3', daysAgo(1), { status: 'revoked', source: 'payment' }),
  ];
  const progressRows = [row('u1', 'c1', 'c1-l1', daysAgo(2)), row('u2', 'c1', 'c1-l1', daysAgo(9))];
  const homework = [hw({ status: 'review' }), hw({ status: 'approved' })];
  const input = { users, courses, enrollments, progressRows, homework, now: NOW };

  it('pilotOverview', () => {
    const o = pilotOverview(input);
    expect(o).toMatchObject({
      authors: 2, schools: 2, coursesPublished: 1, coursesDraft: 1, coursesArchived: 1,
      studentAccounts: 3, enrolledStudents: 2, enrollments: 3, lessonsCompletedThisWeek: 1, pendingHomework: 1,
    });
    expect(o.enrollmentsBySource).toEqual({ invite: 1, manual: 1, free: 1, network: 0, payment: 0 });
  });

  it('pilotGoals ограничивает прогресс 100%', () => {
    const goals = pilotGoals(pilotOverview(input), { authors: 2, courses: 5, students: 50 });
    expect(goals.map(g => g.percent)).toEqual([100, 20, 4]);
  });

  it('schoolsTable', () => {
    const rows = schoolsTable(input);
    // s2: отозванная запись вчера — последнее событие; s1: урок 2 дня назад
    expect(rows.map(r => r.schoolId)).toEqual(['s2', 's1']);
    expect(rows[0]).toMatchObject({ students: 0, lastActivity: daysAgo(1) });
    expect(rows[1]).toMatchObject({ students: 2, lastActivity: daysAgo(2) });
    expect(rows[1].courses.map(c => c.id)).toEqual(['c1', 'c2']);
    expect(rows[1].authors.map(a => a.id)).toEqual(['a1']);
  });

  it('recentSignups сортирует по первой записи, остальных — по имени', () => {
    const rows = recentSignups(input);
    expect(rows.map(r => r.user.id)).toEqual(['u3', 'u2', 'u1', 'a1', 'a2', 'adm']);
    expect(rows.find(r => r.user.id === 'u1')).toMatchObject({ firstEnrollmentAt: daysAgo(10), courses: 2 });
    expect(rows.find(r => r.user.id === 'u3')?.courses).toBe(0);
  });
});
