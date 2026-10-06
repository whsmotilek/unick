import type {
  Course, Module, Lesson, Homework, ChatMessage, User, Enrollment, Invite,
  LessonProgressRow, InviteInfo, QuizKey, QuizResult, AppNotification,
} from '../../types';

export type CourseMeta = Omit<Course, 'modules'>;
export type ModuleMeta = Omit<Module, 'lessons'>;

/** Всё, что видит текущий пользователь. Права фильтрует бэкенд (RLS в Supabase). */
export interface Snapshot {
  courses: Course[];
  enrollments: Enrollment[];
  progress: LessonProgressRow[];
  homework: Homework[];
  messages: ChatMessage[];
  users: User[];
  invites: Invite[];
  /** Только для сотрудников школы */
  quizKeys: QuizKey[];
  notifications: AppNotification[];
}

export type FileBucket = 'covers' | 'lesson-files' | 'homework-files';

export interface Backend {
  load(user: User): Promise<Snapshot>;

  saveCourse(course: CourseMeta): Promise<void>;
  deleteCourse(id: string): Promise<void>;
  saveModule(module: ModuleMeta): Promise<void>;
  deleteModule(id: string): Promise<void>;
  saveLesson(lesson: Lesson, courseId: string): Promise<void>;
  deleteLesson(id: string): Promise<void>;

  saveEnrollment(enrollment: Enrollment): Promise<void>;
  deleteEnrollment(courseId: string, userId: string): Promise<void>;
  enrollFree(courseId: string): Promise<void>;
  enrollByEmail(courseId: string, email: string): Promise<void>;

  saveInvite(invite: Invite): Promise<void>;
  inviteInfo(code: string): Promise<InviteInfo | null>;
  redeemInvite(code: string): Promise<string>;

  setLessonComplete(row: LessonProgressRow, done: boolean): Promise<void>;
  saveQuizKey(key: QuizKey): Promise<void>;
  submitQuiz(lessonId: string, answers: Record<string, string[]>): Promise<QuizResult>;

  markNotificationsRead(ids: string[]): Promise<void>;
  /** Только администратор: решение по заявке автора */
  setAuthorStatus(userId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void>;
  saveHomework(hw: Homework): Promise<void>;

  sendMessage(msg: ChatMessage): Promise<void>;
  markRead(userId: string, withUserId: string): Promise<void>;

  /** Загружает файл, возвращает путь для хранения в данных (для covers — публичный URL). */
  uploadFile(bucket: FileBucket, path: string, file: File): Promise<string>;
  /** Ссылка для просмотра приватного файла. */
  fileUrl(bucket: FileBucket, path: string): Promise<string>;
}

export function assembleCourses(courses: CourseMeta[], modules: ModuleMeta[], lessons: (Lesson & { courseId: string })[]): Course[] {
  const lessonsByModule = new Map<string, Lesson[]>();
  for (const { courseId: _c, ...l } of lessons) {
    const arr = lessonsByModule.get(l.moduleId) ?? [];
    arr.push(l);
    lessonsByModule.set(l.moduleId, arr);
  }
  const modulesByCourse = new Map<string, Module[]>();
  for (const m of modules) {
    const arr = modulesByCourse.get(m.courseId) ?? [];
    arr.push({ ...m, lessons: (lessonsByModule.get(m.id) ?? []).sort((a, b) => a.order - b.order) });
    modulesByCourse.set(m.courseId, arr);
  }
  return courses.map(c => ({ ...c, modules: (modulesByCourse.get(c.id) ?? []).sort((a, b) => a.order - b.order) }));
}

export function errorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return String(e);
}

/** Убирает правильные ответы из содержимого урока-теста (их хранит QuizKey). */
export function stripQuizAnswers(lesson: Lesson): Lesson {
  if (lesson.type !== 'quiz') return lesson;
  const data = (lesson.content?.data ?? {}) as { questions?: { correct?: unknown }[] };
  if (!data.questions) return lesson;
  return {
    ...lesson,
    content: {
      ...lesson.content,
      data: { ...data, questions: data.questions.map(({ correct: _c, ...q }) => q) },
    },
  };
}
