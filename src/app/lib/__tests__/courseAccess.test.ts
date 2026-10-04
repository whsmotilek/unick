import { describe, expect, it } from 'vitest';
import { flattenCourse, nextLessonToStudy } from '../courseAccess';
import { gradeQuiz } from '../lessonContent';
import type { Course } from '../../types';

const lesson = (id: string, moduleId: string, order: number) => ({
  id, moduleId, order, title: id, type: 'text' as const, content: { type: 'text' as const, data: {} }, isLocked: false,
});

const course = (sequential: boolean): Course => ({
  id: 'c', schoolId: 's', title: 'C', description: '', status: 'published', accessType: 'invite', sequential,
  createdAt: '', updatedAt: '',
  modules: [
    { id: 'm2', courseId: 'c', title: 'M2', order: 2, lessons: [lesson('l3', 'm2', 1)] },
    { id: 'm1', courseId: 'c', title: 'M1', order: 1, lessons: [lesson('l2', 'm1', 2), lesson('l1', 'm1', 1)] },
  ],
});

describe('flattenCourse', () => {
  it('сортирует модули и уроки по порядку', () => {
    expect(flattenCourse(course(false), []).map(l => l.lesson.id)).toEqual(['l1', 'l2', 'l3']);
  });

  it('в свободном курсе всё открыто', () => {
    expect(flattenCourse(course(false), []).every(l => l.unlocked)).toBe(true);
  });

  it('в последовательном курсе открывает уроки по одному', () => {
    const flat = flattenCourse(course(true), ['l1']);
    expect(flat.map(l => l.unlocked)).toEqual([true, true, false]);
    expect(nextLessonToStudy(flat)?.lesson.id).toBe('l2');
  });

  it('незавершённый урок посередине закрывает всё после него', () => {
    const flat = flattenCourse(course(true), ['l1', 'l3']);
    expect(flat.map(l => l.unlocked)).toEqual([true, true, false]);
  });
});

describe('gradeQuiz', () => {
  const qs = [
    { id: 'q1', text: '', options: [], correct: ['a'] },
    { id: 'q2', text: '', options: [], correct: ['b', 'c'] },
  ];
  it('засчитывает только полностью верные ответы', () => {
    expect(gradeQuiz(qs, { q1: ['a'], q2: ['c', 'b'] })).toEqual({ correct: 2, total: 2, percent: 100 });
    expect(gradeQuiz(qs, { q1: ['a'], q2: ['b'] })).toEqual({ correct: 1, total: 2, percent: 50 });
    expect(gradeQuiz(qs, {})).toEqual({ correct: 0, total: 2, percent: 0 });
  });
});
