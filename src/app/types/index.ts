// Типы для платформы Unick

export type UserRole = 'student' | 'author' | 'curator' | 'admin' | 'methodologist' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  schoolId?: string;
}

export interface School {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  ownerId: string;
  plan: 'starter' | 'pro' | 'enterprise';
}

export type CourseAccessType = 'invite' | 'free' | 'paid';

export interface Course {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  cover?: string;
  status: 'draft' | 'published' | 'archived';
  /** invite — только по приглашению/вручную, free — самозапись, paid — после оплаты */
  accessType: CourseAccessType;
  price?: number;
  /** Уроки открываются строго по порядку */
  sequential: boolean;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  type: 'video' | 'text' | 'audio' | 'quiz' | 'homework' | 'file';
  content: LessonContent;
  isLocked: boolean;
  lockReason?: 'time' | 'prerequisite' | 'flow';
}

export interface LessonContent {
  type: 'video' | 'text' | 'audio' | 'quiz' | 'homework' | 'file';
  data: any;
}

export interface StudentProgress {
  userId: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  progress: number; // 0-100
  completedLessons: string[];
  lastActivity: string;
  totalTimeSpent: number;
}

export interface Homework {
  id: string;
  lessonId: string;
  studentId: string;
  courseId: string;
  title: string;
  description: string;
  status: 'pending' | 'submitted' | 'review' | 'returned' | 'approved';
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  feedback?: string;
  deadline?: string;
  submission?: {
    type: 'text' | 'file' | 'link';
    content: string;
  };
  files?: AttachedFile[];
}

export interface AttachedFile {
  name: string;
  /** Путь в хранилище (bucket/path) или внешний URL */
  path: string;
  size?: number;
}

export type EnrollmentSource = 'invite' | 'manual' | 'free' | 'network' | 'payment';

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  status: 'active' | 'revoked' | 'completed';
  source: EnrollmentSource;
  inviteId?: string;
  createdAt: string;
}

export interface Invite {
  id: string;
  courseId: string;
  code: string;
  label?: string;
  maxUses?: number;
  uses: number;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
}

export interface LessonProgressRow {
  userId: string;
  courseId: string;
  lessonId: string;
  completedAt: string;
}

export interface InviteInfo {
  courseId: string;
  title: string;
  description: string;
  cover?: string;
  schoolName: string;
  lessonsCount: number;
  valid: boolean;
}

export interface Flow {
  id: string;
  courseId: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'upcoming' | 'active' | 'completed';
  curatorIds: string[];
  studentIds: string[];
}

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface ChatThread {
  withUserId: string;
  withUserName: string;
  withUserAvatar?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface AIInsight {
  id: string;
  type: 'content' | 'student' | 'revenue';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  evidence?: string;
  recommendation?: string;
  actionable: boolean;
}

/** Ключ теста: правильные ответы, видны только сотрудникам школы */
export interface QuizKey {
  lessonId: string;
  courseId: string;
  /** questionId -> optionId[] */
  answers: Record<string, string[]>;
  passPercent: number;
}

export interface QuizResult {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  passPercent: number;
  /** id вопросов с ошибкой */
  wrong: string[];
  /** Правильные ответы — только если тест пройден */
  key: Record<string, string[]> | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'homework_submitted' | 'homework_reviewed' | 'student_enrolled' | 'message' | string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
