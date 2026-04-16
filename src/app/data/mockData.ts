import { User, School, Course, Module, Lesson, StudentProgress, Homework, Flow, AnalyticsMetric, AIInsight } from '../types';

// Моковые пользователи
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Анна Иванова',
    email: 'anna@example.com',
    role: 'author',
    schoolId: 'school-1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  {
    id: 'user-2',
    name: 'Петр Смирнов',
    email: 'petr@example.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  },
  {
    id: 'user-3',
    name: 'Мария Куратова',
    email: 'maria@example.com',
    role: 'curator',
    schoolId: 'school-1',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
  }
];

// Моковая школа
export const mockSchool: School = {
  id: 'school-1',
  name: 'Школа Дизайна',
  domain: 'design-school',
  logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
  ownerId: 'user-1',
  plan: 'pro'
};

// Моковые курсы
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    schoolId: 'school-1',
    title: 'Основы UI/UX дизайна',
    description: 'Полный курс по дизайну интерфейсов от основ до продвинутых техник',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    status: 'published',
    modules: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-20T15:30:00Z'
  },
  {
    id: 'course-2',
    schoolId: 'school-1',
    title: 'Figma для начинающих',
    description: 'Научитесь работать в Figma с нуля за 4 недели',
    cover: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=400&fit=crop',
    status: 'published',
    modules: [],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-22T12:00:00Z'
  },
  {
    id: 'course-3',
    schoolId: 'school-1',
    title: 'Дизайн-системы',
    description: 'Создание и управление дизайн-системами',
    cover: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop',
    status: 'draft',
    modules: [],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-25T09:00:00Z'
  }
];

// Моковые модули и уроки для первого курса
export const mockModules: Module[] = [
  {
    id: 'module-1',
    courseId: 'course-1',
    title: 'Введение в UI/UX',
    description: 'Основные понятия и принципы дизайна',
    order: 1,
    lessons: []
  },
  {
    id: 'module-2',
    courseId: 'course-1',
    title: 'Исследование пользователей',
    description: 'Методы изучения целевой аудитории',
    order: 2,
    lessons: []
  },
  {
    id: 'module-3',
    courseId: 'course-1',
    title: 'Проектирование интерфейсов',
    description: 'От wireframe до финального дизайна',
    order: 3,
    lessons: []
  }
];

export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    moduleId: 'module-1',
    title: 'Что такое UI и UX?',
    description: 'Разбираем основные понятия и различия',
    order: 1,
    type: 'video',
    content: {
      type: 'video',
      data: {
        url: 'https://example.com/video.mp4',
        duration: 720,
        thumbnail: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=450&fit=crop'
      }
    },
    isLocked: false
  },
  {
    id: 'lesson-2',
    moduleId: 'module-1',
    title: 'Принципы хорошего дизайна',
    description: 'Основные принципы, которые нужно знать',
    order: 2,
    type: 'text',
    content: {
      type: 'text',
      data: {
        html: '<p>Хороший дизайн строится на нескольких фундаментальных принципах...</p>'
      }
    },
    isLocked: false
  },
  {
    id: 'lesson-3',
    moduleId: 'module-1',
    title: 'Практическое задание: Анализ интерфейса',
    description: 'Проанализируйте популярное приложение',
    order: 3,
    type: 'homework',
    content: {
      type: 'homework',
      data: {
        instructions: 'Выберите популярное приложение и проанализируйте его интерфейс',
        deadline: '2024-03-05T23:59:00Z'
      }
    },
    isLocked: false
  },
  {
    id: 'lesson-4',
    moduleId: 'module-2',
    title: 'Методы исследования',
    description: 'Интервью, опросы, A/B тесты',
    order: 1,
    type: 'video',
    content: {
      type: 'video',
      data: {
        url: 'https://example.com/video2.mp4',
        duration: 900,
        thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop'
      }
    },
    isLocked: true,
    lockReason: 'prerequisite'
  }
];

// Связываем уроки с модулями
mockModules[0].lessons = mockLessons.filter(l => l.moduleId === 'module-1');
mockModules[1].lessons = mockLessons.filter(l => l.moduleId === 'module-2');
mockModules[2].lessons = [];

// Связываем модули с курсом
mockCourses[0].modules = mockModules;

// Прогресс студента
export const mockProgress: StudentProgress[] = [
  {
    userId: 'user-2',
    courseId: 'course-1',
    progress: 35,
    completedLessons: ['lesson-1', 'lesson-2'],
    lastActivity: '2024-02-24T18:30:00Z',
    totalTimeSpent: 3600
  }
];

// Домашние задания
export const mockHomework: Homework[] = [
  {
    id: 'hw-1',
    lessonId: 'lesson-3',
    studentId: 'user-2',
    courseId: 'course-1',
    title: 'Анализ интерфейса',
    description: 'Выберите популярное приложение и проанализируйте его интерфейс',
    status: 'submitted',
    submittedAt: '2024-02-23T14:20:00Z',
    deadline: '2024-03-05T23:59:00Z',
    submission: {
      type: 'text',
      content: 'Я выбрал приложение Instagram. Основные находки: упрощенная навигация...'
    }
  },
  {
    id: 'hw-2',
    lessonId: 'lesson-3',
    studentId: 'user-4',
    courseId: 'course-1',
    title: 'Анализ интерфейса',
    description: 'Выберите популярное приложение и проанализируйте его интерфейс',
    status: 'review',
    submittedAt: '2024-02-24T10:15:00Z',
    deadline: '2024-03-05T23:59:00Z',
    submission: {
      type: 'link',
      content: 'https://docs.google.com/document/d/example'
    }
  },
  {
    id: 'hw-3',
    lessonId: 'lesson-3',
    studentId: 'user-5',
    courseId: 'course-1',
    title: 'Анализ интерфейса',
    description: 'Выберите популярное приложение и проанализируйте его интерфейс',
    status: 'pending',
    deadline: '2024-03-05T23:59:00Z'
  }
];

// Потоки
export const mockFlows: Flow[] = [
  {
    id: 'flow-1',
    courseId: 'course-1',
    schoolId: 'school-1',
    name: 'Поток Февраль 2024',
    startDate: '2024-02-15T00:00:00Z',
    endDate: '2024-03-30T23:59:00Z',
    status: 'active',
    curatorIds: ['user-3'],
    studentIds: ['user-2', 'user-4', 'user-5']
  },
  {
    id: 'flow-2',
    courseId: 'course-2',
    schoolId: 'school-1',
    name: 'Поток Март 2024',
    startDate: '2024-03-01T00:00:00Z',
    status: 'upcoming',
    curatorIds: ['user-3'],
    studentIds: ['user-2']
  }
];

// Метрики для дашборда автора
export const mockMetrics: AnalyticsMetric[] = [
  {
    label: 'Выручка за месяц',
    value: '₽485,320',
    change: 12.5,
    trend: 'up'
  },
  {
    label: 'Активных учеников',
    value: 342,
    change: 8.2,
    trend: 'up'
  },
  {
    label: 'Доходимость',
    value: '68%',
    change: -3.1,
    trend: 'down'
  },
  {
    label: 'Средний прогресс',
    value: '42%',
    change: 5.4,
    trend: 'up'
  }
];

// AI-инсайты
export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight-1',
    type: 'content',
    severity: 'critical',
    title: 'Высокий отток на уроке "Методы исследования"',
    description: '62% учеников прекращают просмотр на 3:10 минуте',
    evidence: 'Среднее время просмотра: 3:12 из 15:00. Drop-off rate: 62%',
    recommendation: 'Сократите вступление, добавьте практический пример в начале урока',
    actionable: true
  },
  {
    id: 'insight-2',
    type: 'student',
    severity: 'warning',
    title: '23 ученика в зоне риска',
    description: 'Не заходили в платформу более 5 дней',
    evidence: 'Последняя активность: 5-7 дней назад. Прогресс: менее 20%',
    recommendation: 'Отправить персонализированное напоминание и предложить помощь куратора',
    actionable: true
  },
  {
    id: 'insight-3',
    type: 'content',
    severity: 'info',
    title: 'Урок "Принципы дизайна" показывает высокую эффективность',
    description: 'Досматриваемость 94%, высокие оценки в тестах',
    evidence: 'Средний балл теста: 4.7/5. Повторные просмотры: 28%',
    recommendation: 'Используйте формат этого урока как шаблон для других модулей',
    actionable: false
  }
];
