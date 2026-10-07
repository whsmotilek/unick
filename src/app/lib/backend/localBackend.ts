import type {
  AppNotification, ChatMessage, Course, Enrollment, Homework, Invite, Lesson, LessonProgressRow, QuizKey, QuizResult, User,
} from '../../types';
import { seedChats, seedCourses, seedEnrollments, seedHomework, seedProgress } from '../../store/seed';
import { mockUsers } from '../../data/mockData';
import { assembleCourses, stripQuizAnswers, type Backend, type CourseMeta, type ModuleMeta } from './types';
import { gradeQuiz } from '../lessonContent';

/**
 * Демо-бэкенд: все данные в localStorage этого браузера.
 * Используется, пока не заданы VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 * Повторяет основные правила доступа серверной версии, чтобы демо вело себя так же.
 */

const DB_KEY = 'unick_demo_db_v2';
export const DEMO_USERS_KEY = 'unick_users';

interface DemoDb {
  courses: CourseMeta[];
  modules: ModuleMeta[];
  lessons: (Lesson & { courseId: string })[];
  enrollments: Enrollment[];
  progress: LessonProgressRow[];
  homework: Homework[];
  messages: ChatMessage[];
  invites: Invite[];
  quizKeys: QuizKey[];
  notifications: AppNotification[];
}

function seedDb(): DemoDb {
  const courses: CourseMeta[] = [];
  const modules: ModuleMeta[] = [];
  const lessons: (Lesson & { courseId: string })[] = [];
  for (const c of seedCourses) {
    const { modules: ms, ...meta } = c;
    courses.push({ ...meta, accessType: meta.accessType ?? 'free', sequential: meta.sequential ?? false });
    for (const m of ms) {
      const { lessons: ls, ...mm } = m;
      modules.push(mm);
      for (const l of ls) lessons.push({ ...l, courseId: c.id });
    }
  }
  const now = new Date().toISOString();
  const enrollments: Enrollment[] = Object.entries(seedEnrollments).flatMap(([userId, cids]) =>
    cids.map(courseId => ({ id: `enr-${userId}-${courseId}`, courseId, userId, status: 'active' as const, source: 'manual' as const, createdAt: now })));
  const progress: LessonProgressRow[] = Object.entries(seedProgress).flatMap(([userId, byCourse]) =>
    Object.values(byCourse).flatMap(p => p.completedLessons.map(lessonId => ({ userId, courseId: p.courseId, lessonId, completedAt: p.lastActivity }))));
  return {
    courses, modules, lessons, enrollments, progress,
    homework: seedHomework,
    messages: Object.values(seedChats).flat(),
    invites: [{ id: 'inv-demo', courseId: 'course-1', code: 'demo', label: 'Демо-приглашение', uses: 0, active: true, createdAt: now }],
    quizKeys: [],
    notifications: [],
  };
}

function readDb(): DemoDb {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return { ...seedDb(), ...JSON.parse(raw) };
  } catch { /* повреждённые данные — пересоздаём */ }
  return seedDb();
}

export function getDemoUsers(): User[] {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...mockUsers];
}

export function saveDemoUsers(users: User[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function upsert<T>(list: T[], item: T, same: (a: T) => boolean): T[] {
  const i = list.findIndex(same);
  if (i < 0) return [...list, item];
  const next = [...list];
  next[i] = { ...next[i], ...item };
  return next;
}

export function createLocalBackend(currentUser: () => User | null): Backend {
  let db = readDb();
  const commit = (next: DemoDb) => {
    db = next;
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* квота */ }
  };
  const me = () => {
    const u = currentUser();
    if (!u) throw new Error('Нужно войти в аккаунт');
    return u;
  };
  const userById = (id: string) => getDemoUsers().find(u => u.id === id);
  const courseById = (id: string) => db.courses.find(c => c.id === id);
  const staffOf = (schoolId: string) => getDemoUsers().filter(u => u.schoolId === schoolId && (u.role === 'author' || u.role === 'curator'));
  const isStaff = (u: User, courseId: string) => u.role === 'admin' || (!!u.schoolId && courseById(courseId)?.schoolId === u.schoolId);

  /** Те же уведомления, что создают триггеры в Supabase */
  const notify = (userId: string, type: string, title: string, body: string, link: string) => {
    const n: AppNotification = { id: crypto.randomUUID(), userId, type, title, body, link, read: false, createdAt: new Date().toISOString() };
    db = { ...db, notifications: [n, ...db.notifications].slice(0, 300) };
  };

  const enroll = (courseId: string, userId: string, source: Enrollment['source'], inviteId?: string) => {
    if (db.enrollments.some(e => e.courseId === courseId && e.userId === userId && e.status !== 'revoked')) return;
    const existing = db.enrollments.find(e => e.courseId === courseId && e.userId === userId);
    const row: Enrollment = existing
      ? { ...existing, status: 'active' }
      : { id: crypto.randomUUID(), courseId, userId, status: 'active', source, inviteId, createdAt: new Date().toISOString() };
    if (!existing) {
      const course = courseById(courseId);
      for (const s of course ? staffOf(course.schoolId).filter(u => u.role === 'author') : []) {
        notify(s.id, 'student_enrolled', 'Новый ученик', `${userById(userId)?.name ?? 'Ученик'} · ${course!.title}`, `/author/courses/${courseId}?tab=access`);
      }
    }
    commit({ ...db, enrollments: upsert(db.enrollments, row, e => e.id === row.id) });
  };

  return {
    async load() {
      db = readDb();
      return {
        courses: assembleCourses(db.courses, db.modules, db.lessons),
        enrollments: db.enrollments,
        progress: db.progress,
        homework: db.homework,
        messages: db.messages,
        users: getDemoUsers(),
        invites: db.invites,
        quizKeys: db.quizKeys.filter(k => { const u = currentUser(); return !!u && isStaff(u, k.courseId); }),
        notifications: db.notifications.filter(n => n.userId === currentUser()?.id),
      };
    },

    async saveCourse(c) {
      const { modules: _m, ...meta } = c as Course;
      commit({ ...db, courses: upsert(db.courses, meta, x => x.id === c.id) });
    },
    async deleteCourse(id) {
      commit({
        ...db,
        courses: db.courses.filter(c => c.id !== id),
        modules: db.modules.filter(m => m.courseId !== id),
        lessons: db.lessons.filter(l => l.courseId !== id),
        enrollments: db.enrollments.filter(e => e.courseId !== id),
        invites: db.invites.filter(i => i.courseId !== id),
      });
    },
    async saveModule(m) {
      const { lessons: _l, ...meta } = m as ModuleMeta & { lessons?: unknown };
      commit({ ...db, modules: upsert(db.modules, meta, x => x.id === m.id) });
    },
    async deleteModule(id) {
      commit({ ...db, modules: db.modules.filter(m => m.id !== id), lessons: db.lessons.filter(l => l.moduleId !== id) });
    },
    async saveLesson(l, courseId) {
      const clean = stripQuizAnswers(l);
      commit({ ...db, lessons: upsert(db.lessons, { ...clean, courseId }, x => x.id === l.id) });
    },
    async deleteLesson(id) { commit({ ...db, lessons: db.lessons.filter(l => l.id !== id) }); },

    async saveEnrollment(e) {
      if (!db.enrollments.some(x => x.courseId === e.courseId && x.userId === e.userId)) {
        enroll(e.courseId, e.userId, e.source);
        return;
      }
      commit({ ...db, enrollments: upsert(db.enrollments, e, x => x.courseId === e.courseId && x.userId === e.userId) });
    },
    async deleteEnrollment(courseId, userId) {
      commit({ ...db, enrollments: db.enrollments.filter(e => !(e.courseId === courseId && e.userId === userId)) });
    },
    async enrollFree(courseId) {
      const course = db.courses.find(c => c.id === courseId);
      if (!course || course.status !== 'published' || course.accessType !== 'free') {
        throw new Error('На этот курс нельзя записаться самостоятельно');
      }
      enroll(courseId, me().id, 'free');
    },
    async enrollByEmail(courseId, email) {
      const user = getDemoUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) throw new Error('Пользователь с таким email не зарегистрирован');
      enroll(courseId, user.id, 'manual');
    },

    async saveInvite(i) { commit({ ...db, invites: upsert(db.invites, i, x => x.id === i.id) }); },
    async inviteInfo(code) {
      const inv = db.invites.find(i => i.code === code);
      if (!inv) return null;
      const c = db.courses.find(x => x.id === inv.courseId);
      if (!c) return null;
      const valid = inv.active && c.status === 'published'
        && (!inv.expiresAt || new Date(inv.expiresAt) > new Date())
        && (inv.maxUses == null || inv.uses < inv.maxUses);
      return {
        courseId: c.id, title: c.title, description: c.description, cover: c.cover, schoolName: 'Демо-школа',
        lessonsCount: db.lessons.filter(l => l.courseId === c.id).length, valid,
      };
    },
    async redeemInvite(code) {
      const user = me();
      const inv = db.invites.find(i => i.code === code);
      if (!inv || !inv.active) throw new Error('Приглашение недействительно');
      if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) throw new Error('Срок приглашения истёк');
      if (db.enrollments.some(e => e.courseId === inv.courseId && e.userId === user.id)) {
        enroll(inv.courseId, user.id, 'invite', inv.id);
        return inv.courseId;
      }
      if (inv.maxUses != null && inv.uses >= inv.maxUses) throw new Error('Лимит мест по приглашению исчерпан');
      enroll(inv.courseId, user.id, 'invite', inv.id);
      commit({ ...db, invites: db.invites.map(i => i.id === inv.id ? { ...i, uses: i.uses + 1 } : i) });
      return inv.courseId;
    },

    async setLessonComplete(row, done) {
      const rest = db.progress.filter(p => !(p.userId === row.userId && p.lessonId === row.lessonId));
      commit({ ...db, progress: done ? [...rest, row] : rest });
    },
    async saveHomework(h) {
      const prev = db.homework.find(x => x.lessonId === h.lessonId && x.studentId === h.studentId);
      const course = courseById(h.courseId);
      if (course && h.status === 'submitted' && (!prev || prev.status !== 'submitted' || prev.submittedAt !== h.submittedAt)) {
        for (const s of staffOf(course.schoolId)) {
          notify(s.id, 'homework_submitted', 'Новое домашнее задание', `${userById(h.studentId)?.name ?? 'Ученик'} · ${h.title} · ${course.title}`,
            s.role === 'curator' ? '/curator' : '/author/homework');
        }
      } else if (course && prev && prev.status !== h.status && (h.status === 'approved' || h.status === 'returned')) {
        notify(h.studentId, 'homework_reviewed', h.status === 'approved' ? 'Домашнее задание принято' : 'Задание вернули на доработку',
          `${h.title} · ${course.title}`, `/student/courses/${h.courseId}/lesson/${h.lessonId}`);
      }
      const progress = db.progress.filter(p => !(p.userId === h.studentId && p.lessonId === h.lessonId));
      if (h.status === 'approved') progress.push({ userId: h.studentId, courseId: h.courseId, lessonId: h.lessonId, completedAt: new Date().toISOString() });
      const keepOld = h.status !== 'approved' && h.status !== 'returned';
      commit({
        ...db,
        homework: upsert(db.homework, h, x => x.lessonId === h.lessonId && x.studentId === h.studentId),
        progress: keepOld ? db.progress : progress,
      });
    },

    async sendMessage(m) {
      const dup = db.notifications.some(n => n.userId === m.toUserId && n.type === 'message' && !n.read && n.link?.endsWith(m.fromUserId));
      if (!dup) {
        const to = userById(m.toUserId);
        const home = to?.role === 'author' ? '/author/chat?with=' : to?.role === 'student' ? '/student/chat?with=' : '/curator?with=';
        notify(m.toUserId, 'message', 'Новое сообщение', `${userById(m.fromUserId)?.name ?? 'Пользователь'}: ${m.content.slice(0, 120)}`, home + m.fromUserId);
      }
      commit({ ...db, messages: [...db.messages, m] });
    },
    async markRead(userId, withUserId) {
      commit({ ...db, messages: db.messages.map(m => m.toUserId === userId && m.fromUserId === withUserId ? { ...m, read: true } : m) });
    },

    async reviewHomework(h) {
      if (!db.homework.some(x => x.id === h.id)) throw new Error('Работа не найдена или нет прав на проверку');
      await this.saveHomework(h);
    },
    async saveQuizKey(k) {
      commit({ ...db, quizKeys: upsert(db.quizKeys, k, x => x.lessonId === k.lessonId) });
    },
    async submitQuiz(lessonId, answers): Promise<QuizResult> {
      const user = me();
      const lesson = db.lessons.find(l => l.id === lessonId && l.type === 'quiz');
      if (!lesson) throw new Error('Тест не найден');
      const enrolled = db.enrollments.some(e => e.courseId === lesson.courseId && e.userId === user.id && e.status !== 'revoked');
      if (!enrolled && !isStaff(user, lesson.courseId)) throw new Error('Нет доступа к курсу');
      const key = db.quizKeys.find(k => k.lessonId === lessonId);
      if (!key) throw new Error('Автор ещё не настроил ответы к тесту');
      const questions = Object.entries(key.answers).map(([id, correct]) => ({ id, text: '', options: [], correct }));
      const r = gradeQuiz(questions, answers);
      const passed = r.percent >= key.passPercent;
      const wrong = questions
        .filter(q => [...(answers[q.id] ?? [])].sort().join('|') !== [...q.correct].sort().join('|') || !(answers[q.id] ?? []).length)
        .map(q => q.id);
      if (enrolled && passed && !db.progress.some(p => p.userId === user.id && p.lessonId === lessonId)) {
        commit({ ...db, progress: [...db.progress, { userId: user.id, courseId: lesson.courseId, lessonId, completedAt: new Date().toISOString() }] });
      }
      return { ...r, passed, passPercent: key.passPercent, wrong, key: passed ? key.answers : null };
    },
    async setAuthorStatus(userId, status) {
      if (currentUser()?.role !== 'admin') throw new Error('Недостаточно прав');
      saveDemoUsers(getDemoUsers().map(u => (u.id === userId ? { ...u, authorStatus: status } : u)));
    },
    async markNotificationsRead(ids) {
      const set = new Set(ids);
      commit({ ...db, notifications: db.notifications.map(n => (set.has(n.id) ? { ...n, read: true } : n)) });
    },

    async uploadFile(_bucket, _path, file) {
      // В демо-режиме файлы не хранятся на сервере — держим data URL (только для небольших файлов).
      if (file.size > 2 * 1024 * 1024) throw new Error('В демо-режиме можно загрузить файл до 2 МБ');
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    },
    async fileUrl(_bucket, path) { return path; },
  };
}
