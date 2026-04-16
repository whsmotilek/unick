import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Course, Module, Lesson, StudentProgress, Homework, ChatMessage, ChatThread } from '../types';
import { seedCourses, seedEnrollments, seedProgress, seedHomework, seedChats } from './seed';
import { useAuth } from '../context/AuthContext';

const KEYS = {
  courses: 'unick_v1_courses',
  enrollments: 'unick_v1_enrollments',
  progress: 'unick_v1_progress',
  homework: 'unick_v1_homework',
  chats: 'unick_v1_chats',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

interface DataStoreContextType {
  // Entities
  courses: Course[];
  enrollments: Record<string, string[]>;
  progress: Record<string, Record<string, StudentProgress>>;
  homework: Homework[];
  chats: Record<string, ChatMessage[]>;

  // Course CRUD
  createCourse(data: Partial<Course>): Course;
  updateCourse(id: string, patch: Partial<Course>): void;
  deleteCourse(id: string): void;
  getCourse(id: string): Course | undefined;

  // Module CRUD
  addModule(courseId: string, title: string, description?: string): Module;
  updateModule(courseId: string, moduleId: string, patch: Partial<Module>): void;
  deleteModule(courseId: string, moduleId: string): void;

  // Lesson CRUD
  addLesson(courseId: string, moduleId: string, data: Partial<Lesson>): Lesson;
  updateLesson(courseId: string, moduleId: string, lessonId: string, patch: Partial<Lesson>): void;
  deleteLesson(courseId: string, moduleId: string, lessonId: string): void;
  getLesson(courseId: string, lessonId: string): { lesson: Lesson; module: Module } | undefined;

  // Enrollment
  enrollStudent(userId: string, courseId: string): void;
  unenrollStudent(userId: string, courseId: string): void;
  isEnrolled(userId: string, courseId: string): boolean;

  // Progress
  getProgress(userId: string, courseId: string): StudentProgress | undefined;
  markLessonComplete(userId: string, courseId: string, lessonId: string): void;
  unmarkLessonComplete(userId: string, courseId: string, lessonId: string): void;
  isLessonComplete(userId: string, courseId: string, lessonId: string): boolean;
  getCompletedLessonsCount(userId: string): number;
  getCourseProgress(userId: string, courseId: string): number;

  // Homework
  getHomeworkForStudent(userId: string): Homework[];
  getHomeworkForCourse(courseId: string): Homework[];
  submitHomework(data: Omit<Homework, 'id' | 'submittedAt' | 'status'> & { content: string }): Homework;
  reviewHomework(id: string, status: 'approved' | 'returned', feedback: string, reviewerId: string): void;

  // Chat
  sendMessage(fromUserId: string, toUserId: string, content: string): ChatMessage;
  getChatMessages(userIdA: string, userIdB: string): ChatMessage[];
  getChatThreads(userId: string): ChatThread[];
  markChatRead(userId: string, withUserId: string): void;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

function chatKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>(() => load(KEYS.courses, seedCourses));
  const [enrollments, setEnrollments] = useState<Record<string, string[]>>(() => load(KEYS.enrollments, seedEnrollments));
  const [progress, setProgress] = useState<Record<string, Record<string, StudentProgress>>>(() => load(KEYS.progress, seedProgress));
  const [homework, setHomework] = useState<Homework[]>(() => load(KEYS.homework, seedHomework));
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => load(KEYS.chats, seedChats));

  // Persist on every change
  useEffect(() => save(KEYS.courses, courses), [courses]);
  useEffect(() => save(KEYS.enrollments, enrollments), [enrollments]);
  useEffect(() => save(KEYS.progress, progress), [progress]);
  useEffect(() => save(KEYS.homework, homework), [homework]);
  useEffect(() => save(KEYS.chats, chats), [chats]);

  // ===== Courses =====
  const createCourse = useCallback((data: Partial<Course>): Course => {
    const newCourse: Course = {
      id: generateId('course'),
      schoolId: data.schoolId || user?.schoolId || 'school-1',
      title: data.title || 'Новый курс',
      description: data.description || '',
      cover: data.cover,
      status: data.status || 'draft',
      modules: data.modules || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, [user]);

  const updateCourse = useCallback((id: string, patch: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setEnrollments(prev => {
      const next: Record<string, string[]> = {};
      for (const [userId, courseIds] of Object.entries(prev)) {
        next[userId] = courseIds.filter(cid => cid !== id);
      }
      return next;
    });
  }, []);

  const getCourse = useCallback((id: string) => courses.find(c => c.id === id), [courses]);

  // ===== Modules =====
  const addModule = useCallback((courseId: string, title: string, description?: string): Module => {
    const newModule: Module = {
      id: generateId('module'),
      courseId,
      title,
      description,
      order: 0,
      lessons: [],
    };
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const order = c.modules.length + 1;
      return { ...c, modules: [...c.modules, { ...newModule, order }], updatedAt: new Date().toISOString() };
    }));
    return newModule;
  }, []);

  const updateModule = useCallback((courseId: string, moduleId: string, patch: Partial<Module>) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return { ...c, modules: c.modules.map(m => m.id === moduleId ? { ...m, ...patch } : m), updatedAt: new Date().toISOString() };
    }));
  }, []);

  const deleteModule = useCallback((courseId: string, moduleId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return { ...c, modules: c.modules.filter(m => m.id !== moduleId), updatedAt: new Date().toISOString() };
    }));
  }, []);

  // ===== Lessons =====
  const addLesson = useCallback((courseId: string, moduleId: string, data: Partial<Lesson>): Lesson => {
    const newLesson: Lesson = {
      id: generateId('lesson'),
      moduleId,
      title: data.title || 'Новый урок',
      description: data.description,
      order: 0,
      type: data.type || 'text',
      content: data.content || { type: data.type || 'text', data: {} },
      isLocked: false,
    };
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        modules: c.modules.map(m => {
          if (m.id !== moduleId) return m;
          const order = m.lessons.length + 1;
          return { ...m, lessons: [...m.lessons, { ...newLesson, order }] };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
    return newLesson;
  }, []);

  const updateLesson = useCallback((courseId: string, moduleId: string, lessonId: string, patch: Partial<Lesson>) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        modules: c.modules.map(m => {
          if (m.id !== moduleId) return m;
          return { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...patch } : l) };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const deleteLesson = useCallback((courseId: string, moduleId: string, lessonId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        modules: c.modules.map(m => {
          if (m.id !== moduleId) return m;
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const getLesson = useCallback((courseId: string, lessonId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return undefined;
    for (const m of course.modules) {
      const lesson = m.lessons.find(l => l.id === lessonId);
      if (lesson) return { lesson, module: m };
    }
    return undefined;
  }, [courses]);

  // ===== Enrollments =====
  const enrollStudent = useCallback((userId: string, courseId: string) => {
    setEnrollments(prev => {
      const userCourses = prev[userId] || [];
      if (userCourses.includes(courseId)) return prev;
      return { ...prev, [userId]: [...userCourses, courseId] };
    });
    // Init progress
    setProgress(prev => {
      const userProgress = prev[userId] || {};
      if (userProgress[courseId]) return prev;
      return {
        ...prev,
        [userId]: {
          ...userProgress,
          [courseId]: {
            userId,
            courseId,
            progress: 0,
            completedLessons: [],
            lastActivity: new Date().toISOString(),
            totalTimeSpent: 0,
          }
        }
      };
    });
  }, []);

  const unenrollStudent = useCallback((userId: string, courseId: string) => {
    setEnrollments(prev => ({ ...prev, [userId]: (prev[userId] || []).filter(id => id !== courseId) }));
  }, []);

  const isEnrolled = useCallback((userId: string, courseId: string) => {
    return (enrollments[userId] || []).includes(courseId);
  }, [enrollments]);

  // ===== Progress =====
  const getCourseProgressFn = (userId: string, courseId: string, courseList: Course[], progressMap: Record<string, Record<string, StudentProgress>>) => {
    const course = courseList.find(c => c.id === courseId);
    if (!course) return 0;
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    if (totalLessons === 0) return 0;
    const userProgress = progressMap[userId]?.[courseId];
    const completed = userProgress?.completedLessons.length || 0;
    return Math.round((completed / totalLessons) * 100);
  };

  const getProgress = useCallback((userId: string, courseId: string) => {
    return progress[userId]?.[courseId];
  }, [progress]);

  const markLessonComplete = useCallback((userId: string, courseId: string, lessonId: string) => {
    setProgress(prev => {
      const userProgress = prev[userId] || {};
      const courseProgress = userProgress[courseId] || {
        userId, courseId, progress: 0, completedLessons: [], lastActivity: new Date().toISOString(), totalTimeSpent: 0
      };
      if (courseProgress.completedLessons.includes(lessonId)) return prev;
      const newCompletedLessons = [...courseProgress.completedLessons, lessonId];
      const newProgress = getCourseProgressFn(userId, courseId, courses, {
        ...prev,
        [userId]: { ...userProgress, [courseId]: { ...courseProgress, completedLessons: newCompletedLessons } }
      });
      return {
        ...prev,
        [userId]: {
          ...userProgress,
          [courseId]: {
            ...courseProgress,
            completedLessons: newCompletedLessons,
            progress: newProgress,
            lastActivity: new Date().toISOString(),
            totalTimeSpent: courseProgress.totalTimeSpent + 600,
          }
        }
      };
    });
  }, [courses]);

  const unmarkLessonComplete = useCallback((userId: string, courseId: string, lessonId: string) => {
    setProgress(prev => {
      const userProgress = prev[userId] || {};
      const courseProgress = userProgress[courseId];
      if (!courseProgress) return prev;
      const newCompletedLessons = courseProgress.completedLessons.filter(id => id !== lessonId);
      return {
        ...prev,
        [userId]: {
          ...userProgress,
          [courseId]: {
            ...courseProgress,
            completedLessons: newCompletedLessons,
            progress: getCourseProgressFn(userId, courseId, courses, {
              ...prev,
              [userId]: { ...userProgress, [courseId]: { ...courseProgress, completedLessons: newCompletedLessons } }
            }),
          }
        }
      };
    });
  }, [courses]);

  const isLessonComplete = useCallback((userId: string, courseId: string, lessonId: string) => {
    return progress[userId]?.[courseId]?.completedLessons.includes(lessonId) || false;
  }, [progress]);

  const getCompletedLessonsCount = useCallback((userId: string) => {
    const userProgress = progress[userId] || {};
    return Object.values(userProgress).reduce((sum, p) => sum + p.completedLessons.length, 0);
  }, [progress]);

  const getCourseProgress = useCallback((userId: string, courseId: string) => {
    return getCourseProgressFn(userId, courseId, courses, progress);
  }, [courses, progress]);

  // ===== Homework =====
  const getHomeworkForStudent = useCallback((userId: string) => {
    return homework.filter(h => h.studentId === userId);
  }, [homework]);

  const getHomeworkForCourse = useCallback((courseId: string) => {
    return homework.filter(h => h.courseId === courseId);
  }, [homework]);

  const submitHomework = useCallback((data: Omit<Homework, 'id' | 'submittedAt' | 'status'> & { content: string }): Homework => {
    const newHw: Homework = {
      id: generateId('hw'),
      lessonId: data.lessonId,
      studentId: data.studentId,
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      deadline: data.deadline,
      submission: { type: 'text', content: data.content },
    };
    setHomework(prev => {
      // Replace existing if any (by lesson + student)
      const existing = prev.findIndex(h => h.lessonId === data.lessonId && h.studentId === data.studentId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], ...newHw, id: next[existing].id };
        return next;
      }
      return [...prev, newHw];
    });
    return newHw;
  }, []);

  const reviewHomework = useCallback((id: string, status: 'approved' | 'returned', feedback: string, reviewerId: string) => {
    setHomework(prev => prev.map(h => h.id === id ? {
      ...h,
      status,
      feedback,
      reviewerId,
      reviewedAt: new Date().toISOString(),
    } : h));
  }, []);

  // ===== Chat =====
  const sendMessage = useCallback((fromUserId: string, toUserId: string, content: string): ChatMessage => {
    const msg: ChatMessage = {
      id: generateId('msg'),
      fromUserId,
      toUserId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const key = chatKey(fromUserId, toUserId);
    setChats(prev => ({ ...prev, [key]: [...(prev[key] || []), msg] }));
    return msg;
  }, []);

  const getChatMessages = useCallback((a: string, b: string) => {
    return chats[chatKey(a, b)] || [];
  }, [chats]);

  const getChatThreads = useCallback((userId: string): ChatThread[] => {
    const threads: ChatThread[] = [];
    for (const [key, messages] of Object.entries(chats)) {
      const [u1, u2] = key.split('|');
      if (u1 !== userId && u2 !== userId) continue;
      const otherId = u1 === userId ? u2 : u1;
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(m => m.toUserId === userId && !m.read).length;
      threads.push({
        withUserId: otherId,
        withUserName: '',
        lastMessage,
        unreadCount,
      });
    }
    return threads.sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [chats]);

  const markChatRead = useCallback((userId: string, withUserId: string) => {
    const key = chatKey(userId, withUserId);
    setChats(prev => {
      const messages = prev[key] || [];
      return { ...prev, [key]: messages.map(m => m.toUserId === userId ? { ...m, read: true } : m) };
    });
  }, []);

  return (
    <DataStoreContext.Provider value={{
      courses, enrollments, progress, homework, chats,
      createCourse, updateCourse, deleteCourse, getCourse,
      addModule, updateModule, deleteModule,
      addLesson, updateLesson, deleteLesson, getLesson,
      enrollStudent, unenrollStudent, isEnrolled,
      getProgress, markLessonComplete, unmarkLessonComplete, isLessonComplete,
      getCompletedLessonsCount, getCourseProgress,
      getHomeworkForStudent, getHomeworkForCourse, submitHomework, reviewHomework,
      sendMessage, getChatMessages, getChatThreads, markChatRead,
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
