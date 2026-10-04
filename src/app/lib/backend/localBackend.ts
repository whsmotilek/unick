import type {
  ChatMessage, Course, Enrollment, Homework, Invite, Lesson, LessonProgressRow, User,
} from '../../types';
import { seedChats, seedCourses, seedEnrollments, seedHomework, seedProgress } from '../../store/seed';
import { mockUsers } from '../../data/mockData';
import { assembleCourses, type Backend, type CourseMeta, type ModuleMeta } from './types';

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
  const enroll = (courseId: string, userId: string, source: Enrollment['source'], inviteId?: string) => {
    if (db.enrollments.some(e => e.courseId === courseId && e.userId === userId && e.status !== 'revoked')) return;
    const existing = db.enrollments.find(e => e.courseId === courseId && e.userId === userId);
    const row: Enrollment = existing
      ? { ...existing, status: 'active' }
      : { id: crypto.randomUUID(), courseId, userId, status: 'active', source, inviteId, createdAt: new Date().toISOString() };
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
      commit({ ...db, lessons: upsert(db.lessons, { ...l, courseId }, x => x.id === l.id) });
    },
    async deleteLesson(id) { commit({ ...db, lessons: db.lessons.filter(l => l.id !== id) }); },

    async saveEnrollment(e) {
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
      const progress = db.progress.filter(p => !(p.userId === h.studentId && p.lessonId === h.lessonId));
      if (h.status === 'approved') progress.push({ userId: h.studentId, courseId: h.courseId, lessonId: h.lessonId, completedAt: new Date().toISOString() });
      const keepOld = h.status !== 'approved' && h.status !== 'returned';
      commit({
        ...db,
        homework: upsert(db.homework, h, x => x.lessonId === h.lessonId && x.studentId === h.studentId),
        progress: keepOld ? db.progress : progress,
      });
    },

    async sendMessage(m) { commit({ ...db, messages: [...db.messages, m] }); },
    async markRead(userId, withUserId) {
      commit({ ...db, messages: db.messages.map(m => m.toUserId === userId && m.fromUserId === withUserId ? { ...m, read: true } : m) });
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
