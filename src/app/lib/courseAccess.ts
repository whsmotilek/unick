import type { Course, Lesson, Module } from '../types';

export interface FlatLesson {
  lesson: Lesson;
  module: Module;
  index: number;
  completed: boolean;
  /** Доступен ли урок ученику (с учётом последовательного прохождения) */
  unlocked: boolean;
}

/**
 * Плоский список уроков курса в порядке прохождения.
 * В последовательном курсе урок открыт, только если все предыдущие завершены.
 * Домашнее задание считается завершённым, когда автор его принял (это делает сервер).
 */
export function flattenCourse(course: Course, completedIds: Set<string> | string[]): FlatLesson[] {
  const done = completedIds instanceof Set ? completedIds : new Set(completedIds);
  const list: FlatLesson[] = [];
  let allPreviousDone = true;
  const modules = [...course.modules].sort((a, b) => a.order - b.order);
  for (const module of modules) {
    for (const lesson of [...module.lessons].sort((a, b) => a.order - b.order)) {
      const completed = done.has(lesson.id);
      list.push({ lesson, module, index: list.length, completed, unlocked: !course.sequential || allPreviousDone });
      if (!completed) allPreviousDone = false;
    }
  }
  return list;
}

/** Урок, с которого ученику стоит продолжить: первый открытый незавершённый, иначе первый. */
export function nextLessonToStudy(flat: FlatLesson[]): FlatLesson | undefined {
  return flat.find(l => l.unlocked && !l.completed) ?? flat[0];
}
