import type { AttachedFile, Lesson } from '../types';

/** Вопрос теста */
export interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  /** id правильных вариантов; больше одного — вопрос с несколькими ответами */
  correct: string[];
}

/** Содержимое урока в едином формате для всех типов. Старые поля (url/html/instructions) остаются совместимыми. */
export interface LessonData {
  /** Видео: ссылка или путь к загруженному файлу */
  url?: string;
  /** Текст урока / описание к видео / задание (HTML) */
  html?: string;
  /** Устаревшее поле задания домашки, читается как html */
  instructions?: string;
  /** Срок сдачи ДЗ в днях от записи ученика на курс */
  deadlineDays?: number;
  /** Устаревший абсолютный срок */
  deadline?: string;
  files?: AttachedFile[];
  questions?: QuizQuestion[];
  /** Порог прохождения теста, % */
  passPercent?: number;
}

export function lessonData(lesson: Pick<Lesson, 'content'>): LessonData {
  const d = (lesson.content?.data ?? {}) as LessonData;
  return { ...d, html: d.html ?? d.instructions ?? '' };
}

export const LESSON_TYPE_LABELS: Record<Lesson['type'], string> = {
  video: 'Видео',
  text: 'Текст',
  homework: 'Домашнее задание',
  quiz: 'Тест',
  file: 'Материалы',
  audio: 'Аудио',
};

/** Срок сдачи ДЗ для конкретного ученика */
export function homeworkDeadline(data: LessonData, enrolledAt?: string): string | undefined {
  if (data.deadlineDays && enrolledAt) {
    return new Date(new Date(enrolledAt).getTime() + data.deadlineDays * 86_400_000).toISOString();
  }
  return data.deadline;
}

export function gradeQuiz(questions: QuizQuestion[], answers: Record<string, string[]>): { correct: number; total: number; percent: number } {
  let correct = 0;
  for (const q of questions) {
    const given = [...(answers[q.id] ?? [])].sort().join('|');
    if (given && given === [...q.correct].sort().join('|')) correct++;
  }
  const total = questions.length;
  return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
}
