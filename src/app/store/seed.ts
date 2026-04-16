import { Course, Homework, StudentProgress, ChatMessage } from '../types';

// Расширенный seed: 3 курса с реальными модулями и уроками
export const seedCourses: Course[] = [
  {
    id: 'course-1',
    schoolId: 'school-1',
    title: 'Основы UI/UX дизайна',
    description: 'Полный курс по дизайну интерфейсов от основ до продвинутых техник. Научитесь создавать удобные и красивые интерфейсы.',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-20T15:30:00Z',
    modules: [
      {
        id: 'module-1',
        courseId: 'course-1',
        title: 'Введение в UI/UX',
        description: 'Основные понятия и принципы дизайна',
        order: 1,
        lessons: [
          {
            id: 'lesson-1',
            moduleId: 'module-1',
            title: 'Что такое UI и UX?',
            description: 'Разбираем основные понятия и различия между UI и UX',
            order: 1,
            type: 'video',
            content: { type: 'video', data: { url: 'https://www.youtube.com/embed/EgYIBT-h6tw' } },
            isLocked: false
          },
          {
            id: 'lesson-2',
            moduleId: 'module-1',
            title: 'Принципы хорошего дизайна',
            description: 'Основные принципы, которые нужно знать каждому дизайнеру',
            order: 2,
            type: 'text',
            content: {
              type: 'text',
              data: {
                html: '<h2>10 принципов хорошего дизайна</h2><p>Дитер Рамс сформулировал 10 принципов хорошего дизайна, которые актуальны до сих пор:</p><ol><li><strong>Хороший дизайн инновационен</strong> — он развивается вместе с технологиями</li><li><strong>Хороший дизайн делает продукт полезным</strong> — он подчёркивает функциональность</li><li><strong>Хороший дизайн эстетичен</strong> — красота важна, потому что мы используем продукт каждый день</li><li><strong>Хороший дизайн делает продукт понятным</strong> — он объясняет себя сам</li><li><strong>Хороший дизайн ненавязчив</strong> — он не привлекает излишнего внимания</li><li><strong>Хороший дизайн честен</strong> — он не обманывает обещаниями</li><li><strong>Хороший дизайн долговечен</strong> — он не следует моде</li><li><strong>Хороший дизайн продуман до мелочей</strong> — детали важны</li><li><strong>Хороший дизайн экологичен</strong> — он минимизирует загрязнение окружающей среды</li><li><strong>Хороший дизайн минимален</strong> — меньше, но лучше</li></ol>'
              }
            },
            isLocked: false
          },
          {
            id: 'lesson-3',
            moduleId: 'module-1',
            title: 'Практическое задание: Анализ интерфейса',
            description: 'Проанализируйте популярное приложение и опишите его сильные и слабые стороны',
            order: 3,
            type: 'homework',
            content: {
              type: 'homework',
              data: {
                instructions: 'Выберите популярное приложение (Instagram, Telegram, Notion) и проанализируйте его интерфейс. Опишите 3 сильных стороны и 3 слабых. Объём: 300-500 слов.',
                deadline: '2026-05-15T23:59:00Z'
              }
            },
            isLocked: false
          }
        ]
      },
      {
        id: 'module-2',
        courseId: 'course-1',
        title: 'Исследование пользователей',
        description: 'Методы изучения целевой аудитории',
        order: 2,
        lessons: [
          {
            id: 'lesson-4',
            moduleId: 'module-2',
            title: 'Методы исследования',
            description: 'Интервью, опросы, A/B тесты — что когда использовать',
            order: 1,
            type: 'video',
            content: { type: 'video', data: { url: 'https://www.youtube.com/embed/9o7nhaR5K_o' } },
            isLocked: false
          },
          {
            id: 'lesson-5',
            moduleId: 'module-2',
            title: 'Создание персон',
            description: 'Как описать вашу целевую аудиторию',
            order: 2,
            type: 'text',
            content: {
              type: 'text',
              data: {
                html: '<h2>Что такое персона</h2><p>Персона — это собирательный образ вашего пользователя, основанный на исследовании. Хорошо проработанная персона помогает команде принимать решения с учётом реальных потребностей пользователей.</p><h3>Структура персоны:</h3><ul><li>Имя и фото</li><li>Демография: возраст, профессия, доход</li><li>Цели и боли</li><li>Поведение и привычки</li><li>Цитата, которая описывает мотивацию</li></ul>'
              }
            },
            isLocked: false
          }
        ]
      },
      {
        id: 'module-3',
        courseId: 'course-1',
        title: 'Проектирование интерфейсов',
        description: 'От wireframe до финального дизайна',
        order: 3,
        lessons: [
          {
            id: 'lesson-6',
            moduleId: 'module-3',
            title: 'Wireframe и прототип',
            description: 'Различия и когда использовать каждый формат',
            order: 1,
            type: 'video',
            content: { type: 'video', data: { url: 'https://www.youtube.com/embed/qpH7-KFWZRI' } },
            isLocked: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-2',
    schoolId: 'school-1',
    title: 'Figma для начинающих',
    description: 'Научитесь работать в Figma с нуля за 4 недели',
    cover: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=400&fit=crop',
    status: 'published',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-22T12:00:00Z',
    modules: [
      {
        id: 'module-4',
        courseId: 'course-2',
        title: 'Знакомство с Figma',
        description: 'Установка и базовый интерфейс',
        order: 1,
        lessons: [
          {
            id: 'lesson-7',
            moduleId: 'module-4',
            title: 'Установка и первые шаги',
            description: 'Скачивание Figma и настройка рабочего пространства',
            order: 1,
            type: 'video',
            content: { type: 'video', data: { url: 'https://www.youtube.com/embed/jwCmIBJ8Jtc' } },
            isLocked: false
          },
          {
            id: 'lesson-8',
            moduleId: 'module-4',
            title: 'Основные инструменты',
            description: 'Frame, Shape, Text, Layers',
            order: 2,
            type: 'video',
            content: { type: 'video', data: { url: 'https://www.youtube.com/embed/FTFaQWZBqQ8' } },
            isLocked: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-3',
    schoolId: 'school-1',
    title: 'Дизайн-системы',
    description: 'Создание и управление дизайн-системами для крупных продуктов',
    cover: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop',
    status: 'draft',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-25T09:00:00Z',
    modules: []
  }
];

export const seedEnrollments: Record<string, string[]> = {
  'user-2': ['course-1', 'course-2']
};

export const seedProgress: Record<string, Record<string, StudentProgress>> = {
  'user-2': {
    'course-1': {
      userId: 'user-2',
      courseId: 'course-1',
      progress: 35,
      completedLessons: ['lesson-1', 'lesson-2'],
      lastActivity: new Date(Date.now() - 1 * 86400000).toISOString(),
      totalTimeSpent: 3600
    }
  }
};

export const seedHomework: Homework[] = [
  {
    id: 'hw-1',
    lessonId: 'lesson-3',
    studentId: 'user-2',
    courseId: 'course-1',
    title: 'Анализ интерфейса',
    description: 'Проанализируйте популярное приложение',
    status: 'submitted',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    deadline: '2026-05-15T23:59:00Z',
    submission: {
      type: 'text',
      content: 'Я выбрал приложение Instagram. Сильные стороны: 1) Простая навигация через нижний таб-бар. 2) Минималистичный интерфейс не отвлекает от контента. 3) Жесты swipe ускоряют работу. Слабые стороны: 1) Перегруженная иконка профиля. 2) Сложный поиск настроек уведомлений. 3) Некоторые жесты не очевидны для новых пользователей.'
    }
  }
];

export const seedChats: Record<string, ChatMessage[]> = {};
