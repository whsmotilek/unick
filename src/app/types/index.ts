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

export interface Course {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  cover?: string;
  status: 'draft' | 'published' | 'archived';
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
