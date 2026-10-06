import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { toast } from 'sonner';
import {
  Course, Module, Lesson, StudentProgress, Homework, ChatMessage, ChatThread, User,
  Enrollment, Invite, InviteInfo, LessonProgressRow, AttachedFile, QuizKey, QuizResult, AppNotification,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { createSupabaseBackend } from '../lib/backend/supabaseBackend';
import { createLocalBackend } from '../lib/backend/localBackend';
import { errorMessage, type Backend, type FileBucket, type Snapshot } from '../lib/backend/types';

/**
 * Единое хранилище данных приложения.
 * Данные текущего пользователя загружаются с бэкенда целиком (на масштабе пилота это десятки записей),
 * изменения применяются к состоянию сразу (оптимистично) и параллельно отправляются на бэкенд.
 * При ошибке показываем сообщение и перезагружаем данные с сервера.
 */

interface DataStoreContextType {
  /** Данные ещё не загружены */
  loading: boolean;
  refresh(): Promise<void>;

  courses: Course[];
  users: User[];
  getUser(id: string): User | undefined;
  enrollmentRecords: Enrollment[];
  invites: Invite[];
  /** Ключи тестов (только у сотрудников школы) */
  quizKeys: QuizKey[];
  notifications: AppNotification[];
  /** Сырые отметки прохождения уроков (для аналитики по датам) */
  progressRows: LessonProgressRow[];
  /** userId -> courseId[] (активные записи) */
  enrollments: Record<string, string[]>;
  progress: Record<string, Record<string, StudentProgress>>;
  homework: Homework[];
  chats: Record<string, ChatMessage[]>;

  // Курсы
  createCourse(data: Partial<Course>): Course;
  updateCourse(id: string, patch: Partial<Course>): void;
  deleteCourse(id: string): void;
  getCourse(id: string): Course | undefined;

  // Модули
  addModule(courseId: string, title: string, description?: string): Module;
  updateModule(courseId: string, moduleId: string, patch: Partial<Module>): void;
  deleteModule(courseId: string, moduleId: string): void;
  moveModule(courseId: string, moduleId: string, direction: -1 | 1): void;

  // Уроки
  addLesson(courseId: string, moduleId: string, data: Partial<Lesson>): Lesson;
  updateLesson(courseId: string, moduleId: string, lessonId: string, patch: Partial<Lesson>): void;
  deleteLesson(courseId: string, moduleId: string, lessonId: string): void;
  moveLesson(courseId: string, moduleId: string, lessonId: string, direction: -1 | 1): void;
  getLesson(courseId: string, lessonId: string): { lesson: Lesson; module: Module } | undefined;

  // Доступ
  enrollStudent(userId: string, courseId: string): void;
  unenrollStudent(userId: string, courseId: string): void;
  isEnrolled(userId: string, courseId: string): boolean;
  enrollFree(courseId: string): Promise<void>;
  enrollByEmail(courseId: string, email: string): Promise<void>;
  createInvite(courseId: string, opts?: { label?: string; maxUses?: number; expiresAt?: string }): Invite;
  setInviteActive(inviteId: string, active: boolean): void;
  inviteInfo(code: string): Promise<InviteInfo | null>;
  redeemInvite(code: string): Promise<string>;

  // Прогресс
  getProgress(userId: string, courseId: string): StudentProgress | undefined;
  markLessonComplete(userId: string, courseId: string, lessonId: string): void;
  unmarkLessonComplete(userId: string, courseId: string, lessonId: string): void;
  isLessonComplete(userId: string, courseId: string, lessonId: string): boolean;
  getCompletedLessonsCount(userId: string): number;
  getCourseProgress(userId: string, courseId: string): number;

  // Тесты
  saveQuizKey(key: QuizKey): void;
  submitQuiz(lessonId: string, answers: Record<string, string[]>): Promise<QuizResult>;

  // Уведомления
  markNotificationsRead(ids: string[]): void;

  // Администратор
  setAuthorStatus(userId: string, status: 'pending' | 'approved' | 'rejected'): void;

  // Домашние задания
  getHomeworkForStudent(userId: string): Homework[];
  getHomeworkForCourse(courseId: string): Homework[];
  submitHomework(data: Omit<Homework, 'id' | 'submittedAt' | 'status'> & { content: string; files?: AttachedFile[] }): Homework;
  reviewHomework(id: string, status: 'approved' | 'returned', feedback: string, reviewerId: string): void;

  // Чат
  sendMessage(fromUserId: string, toUserId: string, content: string): ChatMessage;
  getChatMessages(userIdA: string, userIdB: string): ChatMessage[];
  getChatThreads(userId: string): ChatThread[];
  markChatRead(userId: string, withUserId: string): void;

  // Файлы
  uploadFile(bucket: FileBucket, path: string, file: File): Promise<string>;
  fileUrl(bucket: FileBucket, path: string): Promise<string>;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

const EMPTY: Snapshot = { courses: [], enrollments: [], progress: [], homework: [], messages: [], users: [], invites: [], quizKeys: [], notifications: [] };

function chatKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

const newId = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();
const countLessons = (c: Course) => c.modules.reduce((sum, m) => sum + m.lessons.length, 0);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  const backend: Backend = useMemo(
    () => (supabase ? createSupabaseBackend(supabase) : createLocalBackend(() => userRef.current)),
    [],
  );

  const [data, setData] = useState<Snapshot>(EMPTY);
  // Для какого пользователя загружены данные (undefined — ещё ни для кого).
  // «Загрузка» = данные не для текущего пользователя: так не бывает момента, когда пользователь
  // уже известен, а данные ещё старые (из-за этого мигали заглушки при обновлении страницы).
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);
  const loading = loadedFor !== (user?.id ?? null);
  const lastLoad = useRef(0);

  const refresh = useCallback(async () => {
    const u = userRef.current;
    if (!u) { setData(EMPTY); setLoadedFor(null); return; }
    try {
      const snap = await backend.load(u);
      lastLoad.current = Date.now();
      if (userRef.current?.id !== u.id) return; // пользователь сменился, пока шла загрузка
      setData(snap);
    } catch (e) {
      toast.error(`Не удалось загрузить данные: ${errorMessage(e)}`);
    } finally {
      if (userRef.current?.id === u.id) setLoadedFor(u.id);
    }
  }, [backend]);

  useEffect(() => {
    refresh();
  }, [user?.id, refresh]);

  // Подтягиваем изменения других пользователей при возврате на вкладку и раз в минуту
  useEffect(() => {
    if (!user) return;
    const onFocus = () => { if (Date.now() - lastLoad.current > 15_000) refresh(); };
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60_000);
    return () => { window.removeEventListener('focus', onFocus); window.clearInterval(timer); };
  }, [user, refresh]);

  // Последнее сохранение каждого урока: ключ теста ссылается на урок и должен уйти после него
  const lessonSaves = useRef(new Map<string, Promise<unknown>>());
  const trackLessonSave = (lessonId: string, op: Promise<unknown>) => {
    lessonSaves.current.set(lessonId, op.catch(() => undefined));
    return op;
  };

  /** Отправить изменение на бэкенд; при ошибке — сообщить и откатиться к серверному состоянию. */
  const persist = useCallback((op: Promise<unknown>) => {
    op.catch(e => {
      toast.error(`Изменение не сохранилось: ${errorMessage(e)}`);
      refresh();
    });
  }, [refresh]);

  const patchCourses = (fn: (courses: Course[]) => Course[]) => setData(d => ({ ...d, courses: fn(d.courses) }));
  const findCourse = (id: string) => data.courses.find(c => c.id === id);

  // ===== Производные структуры =====

  const enrollments = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const e of data.enrollments) {
      if (e.status === 'revoked') continue;
      (map[e.userId] ??= []).push(e.courseId);
    }
    return map;
  }, [data.enrollments]);

  const progress = useMemo(() => {
    const map: Record<string, Record<string, StudentProgress>> = {};
    for (const row of data.progress) {
      const byCourse = (map[row.userId] ??= {});
      const p = (byCourse[row.courseId] ??= {
        userId: row.userId, courseId: row.courseId, progress: 0, completedLessons: [], lastActivity: row.completedAt, totalTimeSpent: 0,
      });
      p.completedLessons.push(row.lessonId);
      if (row.completedAt > p.lastActivity) p.lastActivity = row.completedAt;
    }
    for (const byCourse of Object.values(map)) {
      for (const p of Object.values(byCourse)) {
        const course = data.courses.find(c => c.id === p.courseId);
        const total = course ? countLessons(course) : 0;
        if (course) {
          const existing = new Set(course.modules.flatMap(m => m.lessons.map(l => l.id)));
          p.completedLessons = p.completedLessons.filter(id => existing.has(id));
        }
        p.progress = total ? Math.round((p.completedLessons.length / total) * 100) : 0;
      }
    }
    return map;
  }, [data.progress, data.courses]);

  const chats = useMemo(() => {
    const map: Record<string, ChatMessage[]> = {};
    for (const m of data.messages) (map[chatKey(m.fromUserId, m.toUserId)] ??= []).push(m);
    return map;
  }, [data.messages]);

  const usersById = useMemo(() => new Map(data.users.map(u => [u.id, u])), [data.users]);
  const getUser = useCallback((id: string) => usersById.get(id), [usersById]);

  // ===== Курсы =====

  const createCourse = (input: Partial<Course>): Course => {
    const course: Course = {
      id: newId(),
      schoolId: input.schoolId || user?.schoolId || '',
      title: input.title || 'Новый курс',
      description: input.description || '',
      cover: input.cover,
      status: input.status || 'draft',
      accessType: input.accessType || 'invite',
      price: input.price,
      sequential: input.sequential ?? false,
      modules: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    patchCourses(cs => [...cs, course]);
    persist(backend.saveCourse(course));
    return course;
  };

  const updateCourse = (id: string, patch: Partial<Course>) => {
    const current = findCourse(id);
    if (!current) return;
    const next = { ...current, ...patch, updatedAt: nowIso() };
    patchCourses(cs => cs.map(c => (c.id === id ? next : c)));
    persist(backend.saveCourse(next));
  };

  const deleteCourse = (id: string) => {
    setData(d => ({
      ...d,
      courses: d.courses.filter(c => c.id !== id),
      enrollments: d.enrollments.filter(e => e.courseId !== id),
      invites: d.invites.filter(i => i.courseId !== id),
    }));
    persist(backend.deleteCourse(id));
  };

  const getCourse = useCallback((id: string) => data.courses.find(c => c.id === id), [data.courses]);

  // ===== Модули =====

  const withModules = (courseId: string, fn: (ms: Module[]) => Module[]) =>
    patchCourses(cs => cs.map(c => (c.id === courseId ? { ...c, modules: fn(c.modules), updatedAt: nowIso() } : c)));

  const addModule = (courseId: string, title: string, description?: string): Module => {
    const course = findCourse(courseId);
    const module: Module = { id: newId(), courseId, title, description, order: (course?.modules.length ?? 0) + 1, lessons: [] };
    withModules(courseId, ms => [...ms, module]);
    persist(backend.saveModule(module));
    return module;
  };

  const updateModule = (courseId: string, moduleId: string, patch: Partial<Module>) => {
    const m = findCourse(courseId)?.modules.find(x => x.id === moduleId);
    if (!m) return;
    const next = { ...m, ...patch };
    withModules(courseId, ms => ms.map(x => (x.id === moduleId ? next : x)));
    persist(backend.saveModule(next));
  };

  const deleteModule = (courseId: string, moduleId: string) => {
    withModules(courseId, ms => ms.filter(m => m.id !== moduleId));
    persist(backend.deleteModule(moduleId));
  };

  const moveModule = (courseId: string, moduleId: string, direction: -1 | 1) => {
    const course = findCourse(courseId);
    if (!course) return;
    const list = [...course.modules];
    const i = list.findIndex(m => m.id === moduleId);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const renumbered = list.map((m, idx) => ({ ...m, order: idx + 1 }));
    withModules(courseId, () => renumbered);
    persist(Promise.all([renumbered[i], renumbered[j]].map(m => backend.saveModule(m))));
  };

  // ===== Уроки =====

  const withLessons = (courseId: string, moduleId: string, fn: (ls: Lesson[]) => Lesson[]) =>
    withModules(courseId, ms => ms.map(m => (m.id === moduleId ? { ...m, lessons: fn(m.lessons) } : m)));

  const addLesson = (courseId: string, moduleId: string, input: Partial<Lesson>): Lesson => {
    const m = findCourse(courseId)?.modules.find(x => x.id === moduleId);
    const lesson: Lesson = {
      id: newId(),
      moduleId,
      title: input.title || 'Новый урок',
      description: input.description,
      order: (m?.lessons.length ?? 0) + 1,
      type: input.type || 'text',
      content: input.content || { type: input.type || 'text', data: {} },
      isLocked: false,
    };
    withLessons(courseId, moduleId, ls => [...ls, lesson]);
    persist(trackLessonSave(lesson.id, backend.saveLesson(lesson, courseId)));
    return lesson;
  };

  const updateLesson = (courseId: string, moduleId: string, lessonId: string, patch: Partial<Lesson>) => {
    const l = findCourse(courseId)?.modules.find(x => x.id === moduleId)?.lessons.find(x => x.id === lessonId);
    if (!l) return;
    const next = { ...l, ...patch };
    withLessons(courseId, moduleId, ls => ls.map(x => (x.id === lessonId ? next : x)));
    persist(trackLessonSave(lessonId, backend.saveLesson(next, courseId)));
  };

  const deleteLesson = (courseId: string, moduleId: string, lessonId: string) => {
    withLessons(courseId, moduleId, ls => ls.filter(l => l.id !== lessonId));
    persist(backend.deleteLesson(lessonId));
  };

  const moveLesson = (courseId: string, moduleId: string, lessonId: string, direction: -1 | 1) => {
    const m = findCourse(courseId)?.modules.find(x => x.id === moduleId);
    if (!m) return;
    const list = [...m.lessons];
    const i = list.findIndex(l => l.id === lessonId);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const renumbered = list.map((l, idx) => ({ ...l, order: idx + 1 }));
    withLessons(courseId, moduleId, () => renumbered);
    persist(Promise.all([renumbered[i], renumbered[j]].map(l => backend.saveLesson(l, courseId))));
  };

  const getLesson = useCallback((courseId: string, lessonId: string) => {
    const course = data.courses.find(c => c.id === courseId);
    if (!course) return undefined;
    for (const m of course.modules) {
      const lesson = m.lessons.find(l => l.id === lessonId);
      if (lesson) return { lesson, module: m };
    }
    return undefined;
  }, [data.courses]);

  // ===== Доступ =====

  const enrollStudent = (userId: string, courseId: string) => {
    const existing = data.enrollments.find(e => e.userId === userId && e.courseId === courseId);
    const row: Enrollment = existing
      ? { ...existing, status: 'active' }
      : { id: newId(), userId, courseId, status: 'active', source: 'manual', createdAt: nowIso() };
    setData(d => ({ ...d, enrollments: [...d.enrollments.filter(e => e.id !== row.id), row] }));
    persist(backend.saveEnrollment(row));
  };

  const unenrollStudent = (userId: string, courseId: string) => {
    setData(d => ({ ...d, enrollments: d.enrollments.filter(e => !(e.userId === userId && e.courseId === courseId)) }));
    persist(backend.deleteEnrollment(courseId, userId));
  };

  const isEnrolled = useCallback((userId: string, courseId: string) => (enrollments[userId] || []).includes(courseId), [enrollments]);

  const enrollFree = async (courseId: string) => { await backend.enrollFree(courseId); await refresh(); };
  const enrollByEmail = async (courseId: string, email: string) => { await backend.enrollByEmail(courseId, email); await refresh(); };

  const createInvite = (courseId: string, opts?: { label?: string; maxUses?: number; expiresAt?: string }): Invite => {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, '0')).join('');
    const invite: Invite = {
      id: newId(), courseId, code, label: opts?.label, maxUses: opts?.maxUses, expiresAt: opts?.expiresAt,
      uses: 0, active: true, createdAt: nowIso(),
    };
    setData(d => ({ ...d, invites: [...d.invites, invite] }));
    persist(backend.saveInvite(invite));
    return invite;
  };

  const setInviteActive = (inviteId: string, active: boolean) => {
    const inv = data.invites.find(i => i.id === inviteId);
    if (!inv) return;
    const next = { ...inv, active };
    setData(d => ({ ...d, invites: d.invites.map(i => (i.id === inviteId ? next : i)) }));
    persist(backend.saveInvite(next));
  };

  const inviteInfo = (code: string) => backend.inviteInfo(code);
  const redeemInvite = async (code: string) => {
    const courseId = await backend.redeemInvite(code);
    await refresh();
    return courseId;
  };

  // ===== Прогресс =====

  const getProgress = useCallback((userId: string, courseId: string) => progress[userId]?.[courseId], [progress]);

  const markLessonComplete = (userId: string, courseId: string, lessonId: string) => {
    if (data.progress.some(p => p.userId === userId && p.lessonId === lessonId)) return;
    const row: LessonProgressRow = { userId, courseId, lessonId, completedAt: nowIso() };
    setData(d => ({ ...d, progress: [...d.progress, row] }));
    persist(backend.setLessonComplete(row, true));
  };

  const unmarkLessonComplete = (userId: string, courseId: string, lessonId: string) => {
    const row = data.progress.find(p => p.userId === userId && p.lessonId === lessonId);
    if (!row) return;
    setData(d => ({ ...d, progress: d.progress.filter(p => p !== row) }));
    persist(backend.setLessonComplete({ ...row, courseId }, false));
  };

  const isLessonComplete = useCallback(
    (userId: string, courseId: string, lessonId: string) => progress[userId]?.[courseId]?.completedLessons.includes(lessonId) || false,
    [progress],
  );

  const getCompletedLessonsCount = useCallback(
    (userId: string) => Object.values(progress[userId] || {}).reduce((sum, p) => sum + p.completedLessons.length, 0),
    [progress],
  );

  const getCourseProgress = useCallback((userId: string, courseId: string) => progress[userId]?.[courseId]?.progress ?? 0, [progress]);

  // ===== Тесты =====

  const saveQuizKey = (key: QuizKey) => {
    setData(d => ({ ...d, quizKeys: [...d.quizKeys.filter(k => k.lessonId !== key.lessonId), key] }));
    const pending = lessonSaves.current.get(key.lessonId) ?? Promise.resolve();
    persist(pending.then(() => backend.saveQuizKey(key)));
  };

  const submitQuiz = async (lessonId: string, answers: Record<string, string[]>) => {
    const result = await backend.submitQuiz(lessonId, answers);
    const u = userRef.current;
    if (result.passed && u) {
      const lesson = data.courses.flatMap(c => c.modules.flatMap(m => m.lessons.map(l => ({ l, courseId: c.id })))).find(x => x.l.id === lessonId);
      // Сотрудник в предпросмотре не записан на курс — сервер прохождение не сохраняет, и мы тоже
      const enrolled = lesson && data.enrollments.some(e => e.userId === u.id && e.courseId === lesson.courseId && e.status !== 'revoked');
      if (lesson && enrolled && !data.progress.some(p => p.userId === u.id && p.lessonId === lessonId)) {
        setData(d => ({ ...d, progress: [...d.progress, { userId: u.id, courseId: lesson.courseId, lessonId, completedAt: nowIso() }] }));
      }
    }
    return result;
  };

  // ===== Уведомления =====

  const markNotificationsRead = (ids: string[]) => {
    const unread = ids.filter(id => data.notifications.some(n => n.id === id && !n.read));
    if (!unread.length) return;
    setData(d => ({ ...d, notifications: d.notifications.map(n => (unread.includes(n.id) ? { ...n, read: true } : n)) }));
    persist(backend.markNotificationsRead(unread));
  };

  // ===== Администратор =====

  const setAuthorStatus = (userId: string, status: 'pending' | 'approved' | 'rejected') => {
    setData(d => ({ ...d, users: d.users.map(u => (u.id === userId ? { ...u, authorStatus: status } : u)) }));
    persist(backend.setAuthorStatus(userId, status));
  };

  // ===== Домашние задания =====

  const getHomeworkForStudent = useCallback((userId: string) => data.homework.filter(h => h.studentId === userId), [data.homework]);
  const getHomeworkForCourse = useCallback((courseId: string) => data.homework.filter(h => h.courseId === courseId), [data.homework]);

  const submitHomework = (input: Omit<Homework, 'id' | 'submittedAt' | 'status'> & { content: string; files?: AttachedFile[] }): Homework => {
    const existing = data.homework.find(h => h.lessonId === input.lessonId && h.studentId === input.studentId);
    const hw: Homework = {
      ...(existing ?? {}),
      id: existing?.id ?? newId(),
      lessonId: input.lessonId,
      studentId: input.studentId,
      courseId: input.courseId,
      title: input.title,
      description: input.description,
      deadline: input.deadline,
      status: 'submitted',
      submittedAt: nowIso(),
      submission: { type: 'text', content: input.content },
      files: input.files ?? existing?.files ?? [],
    };
    setData(d => ({ ...d, homework: [...d.homework.filter(h => h.id !== hw.id), hw] }));
    persist(backend.saveHomework(hw));
    return hw;
  };

  const reviewHomework = (id: string, status: 'approved' | 'returned', feedback: string, reviewerId: string) => {
    const hw = data.homework.find(h => h.id === id);
    if (!hw) return;
    const next: Homework = { ...hw, status, feedback, reviewerId, reviewedAt: nowIso() };
    // Принятое ДЗ засчитывает урок (на сервере это делает триггер), возврат — снимает отметку
    setData(d => {
      const progressRows = d.progress.filter(p => !(p.userId === hw.studentId && p.lessonId === hw.lessonId));
      if (status === 'approved') progressRows.push({ userId: hw.studentId, courseId: hw.courseId, lessonId: hw.lessonId, completedAt: nowIso() });
      return { ...d, homework: d.homework.map(h => (h.id === id ? next : h)), progress: progressRows };
    });
    persist(backend.saveHomework(next));
  };

  // ===== Чат =====

  const sendMessage = (fromUserId: string, toUserId: string, content: string): ChatMessage => {
    const msg: ChatMessage = { id: newId(), fromUserId, toUserId, content, createdAt: nowIso(), read: false };
    setData(d => ({ ...d, messages: [...d.messages, msg] }));
    persist(backend.sendMessage(msg));
    return msg;
  };

  const getChatMessages = useCallback((a: string, b: string) => chats[chatKey(a, b)] || [], [chats]);

  const getChatThreads = useCallback((userId: string): ChatThread[] => {
    const threads: ChatThread[] = [];
    for (const [key, messages] of Object.entries(chats)) {
      const [u1, u2] = key.split('|');
      if (u1 !== userId && u2 !== userId) continue;
      const otherId = u1 === userId ? u2 : u1;
      const other = usersById.get(otherId);
      threads.push({
        withUserId: otherId,
        withUserName: other?.name ?? '',
        withUserAvatar: other?.avatar,
        lastMessage: messages[messages.length - 1],
        unreadCount: messages.filter(m => m.toUserId === userId && !m.read).length,
      });
    }
    return threads.sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? ''));
  }, [chats, usersById]);

  const markChatRead = (userId: string, withUserId: string) => {
    const hasUnread = data.messages.some(m => m.toUserId === userId && m.fromUserId === withUserId && !m.read);
    if (!hasUnread) return;
    setData(d => ({
      ...d,
      messages: d.messages.map(m => (m.toUserId === userId && m.fromUserId === withUserId ? { ...m, read: true } : m)),
    }));
    persist(backend.markRead(userId, withUserId));
  };

  return (
    <DataStoreContext.Provider value={{
      loading, refresh,
      courses: data.courses, users: data.users, getUser,
      enrollmentRecords: data.enrollments, invites: data.invites,
      quizKeys: data.quizKeys, notifications: data.notifications, progressRows: data.progress,
      saveQuizKey, submitQuiz, markNotificationsRead, setAuthorStatus,
      enrollments, progress, homework: data.homework, chats,
      createCourse, updateCourse, deleteCourse, getCourse,
      addModule, updateModule, deleteModule, moveModule,
      addLesson, updateLesson, deleteLesson, moveLesson, getLesson,
      enrollStudent, unenrollStudent, isEnrolled, enrollFree, enrollByEmail,
      createInvite, setInviteActive, inviteInfo, redeemInvite,
      getProgress, markLessonComplete, unmarkLessonComplete, isLessonComplete,
      getCompletedLessonsCount, getCourseProgress,
      getHomeworkForStudent, getHomeworkForCourse, submitHomework, reviewHomework,
      sendMessage, getChatMessages, getChatThreads, markChatRead,
      uploadFile: (bucket, path, file) => backend.uploadFile(bucket, path, file),
      fileUrl: (bucket, path) => backend.fileUrl(bucket, path),
    }}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider');
  return ctx;
}
