import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AppNotification, ChatMessage, Course, Enrollment, Homework, Invite, Lesson, LessonProgressRow, QuizKey, QuizResult, User,
} from '../../types';
import { assembleCourses, stripQuizAnswers, type Backend, type CourseMeta, type FileBucket, type ModuleMeta } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const toCourse = (r: Row): CourseMeta => ({
  id: r.id, schoolId: r.school_id, title: r.title, description: r.description ?? '',
  cover: r.cover ?? undefined, status: r.status, accessType: r.access_type,
  price: r.price ?? undefined, sequential: r.sequential, createdAt: r.created_at, updatedAt: r.updated_at,
});
const fromCourse = (c: CourseMeta | Course): Row => ({
  id: c.id, school_id: c.schoolId, title: c.title, description: c.description, cover: c.cover ?? null,
  status: c.status, access_type: c.accessType, price: c.price ?? null, sequential: c.sequential,
});
const toModule = (r: Row): ModuleMeta => ({
  id: r.id, courseId: r.course_id, title: r.title, description: r.description ?? undefined, order: r.position,
});
const toLesson = (r: Row): Lesson & { courseId: string } => ({
  id: r.id, moduleId: r.module_id, courseId: r.course_id, title: r.title, description: r.description ?? undefined,
  order: r.position, type: r.type, content: { type: r.type, data: r.content ?? {} }, isLocked: r.is_locked,
});
const toEnrollment = (r: Row): Enrollment => ({
  id: r.id, courseId: r.course_id, userId: r.user_id, status: r.status, source: r.source,
  inviteId: r.invite_id ?? undefined, createdAt: r.created_at,
});
const toInvite = (r: Row): Invite => ({
  id: r.id, courseId: r.course_id, code: r.code, label: r.label ?? undefined, maxUses: r.max_uses ?? undefined,
  uses: r.uses, expiresAt: r.expires_at ?? undefined, active: r.active, createdAt: r.created_at,
});
const toHomework = (r: Row): Homework => ({
  id: r.id, lessonId: r.lesson_id, courseId: r.course_id, studentId: r.student_id, title: r.title,
  description: r.description, status: r.status, submittedAt: r.submitted_at, reviewedAt: r.reviewed_at ?? undefined,
  reviewerId: r.reviewer_id ?? undefined, feedback: r.feedback ?? undefined, deadline: r.deadline ?? undefined,
  submission: { type: 'text', content: r.content ?? '' }, files: r.files ?? [],
});
const toMessage = (r: Row): ChatMessage => ({
  id: r.id, fromUserId: r.from_id, toUserId: r.to_id, content: r.content, createdAt: r.created_at, read: r.read,
});
const toQuizKey = (r: Row): QuizKey => ({
  lessonId: r.lesson_id, courseId: r.course_id, answers: r.answers ?? {}, passPercent: r.pass_percent,
});
const toNotification = (r: Row): AppNotification => ({
  id: r.id, userId: r.user_id, type: r.type, title: r.title, body: r.body ?? undefined, link: r.link ?? undefined,
  read: r.read, createdAt: r.created_at,
});
export const toUser = (r: Row): User => ({
  id: r.id, name: r.name, email: r.email, role: r.role, avatar: r.avatar ?? undefined, schoolId: r.school_id ?? undefined,
  authorStatus: r.author_status ?? undefined,
});

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export function createSupabaseBackend(sb: SupabaseClient): Backend {
  return {
    async load() {
      const [courses, modules, lessons, enrollments, progress, homework, messages, profiles, invites, quizKeys, notifications] = await Promise.all([
        sb.from('courses').select('*').order('created_at'),
        sb.from('modules').select('*'),
        sb.from('lessons').select('*'),
        sb.from('enrollments').select('*'),
        sb.from('lesson_progress').select('*'),
        sb.from('homework').select('*'),
        sb.from('messages').select('*').order('created_at'),
        sb.from('profiles').select('*'),
        sb.from('invites').select('*').order('created_at'),
        sb.from('quiz_keys').select('*'),
        sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      return {
        courses: assembleCourses(
          check(courses).map(toCourse), check(modules).map(toModule), check(lessons).map(toLesson),
        ),
        enrollments: check(enrollments).map(toEnrollment),
        progress: check(progress).map((r: Row): LessonProgressRow => ({
          userId: r.user_id, courseId: r.course_id, lessonId: r.lesson_id, completedAt: r.completed_at,
        })),
        homework: check(homework).map(toHomework),
        messages: check(messages).map(toMessage),
        users: check(profiles).map(toUser),
        invites: check(invites).map(toInvite),
        quizKeys: check(quizKeys).map(toQuizKey),
        notifications: check(notifications).map(toNotification),
      };
    },

    async saveCourse(c) { check(await sb.from('courses').upsert(fromCourse(c))); },
    async deleteCourse(id) { check(await sb.from('courses').delete().eq('id', id)); },
    async saveModule(m) {
      check(await sb.from('modules').upsert({
        id: m.id, course_id: m.courseId, title: m.title, description: m.description ?? null, position: m.order,
      }));
    },
    async deleteModule(id) { check(await sb.from('modules').delete().eq('id', id)); },
    async saveLesson(lesson, courseId) {
      const l = stripQuizAnswers(lesson);
      check(await sb.from('lessons').upsert({
        id: l.id, module_id: l.moduleId, course_id: courseId, title: l.title, description: l.description ?? null,
        position: l.order, type: l.type, content: l.content?.data ?? {}, is_locked: l.isLocked,
      }));
    },
    async deleteLesson(id) { check(await sb.from('lessons').delete().eq('id', id)); },

    async saveEnrollment(e) {
      check(await sb.from('enrollments').upsert({
        id: e.id, course_id: e.courseId, user_id: e.userId, status: e.status, source: e.source,
      }, { onConflict: 'course_id,user_id' }));
    },
    async deleteEnrollment(courseId, userId) {
      check(await sb.from('enrollments').delete().eq('course_id', courseId).eq('user_id', userId));
    },
    async enrollFree(courseId) { check(await sb.rpc('enroll_free', { p_course: courseId })); },
    async enrollByEmail(courseId, email) { check(await sb.rpc('enroll_by_email', { p_course: courseId, p_email: email })); },

    async saveInvite(i) {
      check(await sb.from('invites').upsert({
        id: i.id, course_id: i.courseId, code: i.code, label: i.label ?? null, max_uses: i.maxUses ?? null,
        expires_at: i.expiresAt ?? null, active: i.active,
      }));
    },
    async inviteInfo(code) {
      const rows = check(await sb.rpc('invite_info', { p_code: code })) as Row[] | null;
      const r = rows?.[0];
      if (!r) return null;
      return {
        courseId: r.course_id, title: r.title, description: r.description, cover: r.cover ?? undefined,
        schoolName: r.school_name, lessonsCount: Number(r.lessons_count), valid: r.valid,
      };
    },
    async redeemInvite(code) { return check(await sb.rpc('redeem_invite', { p_code: code })) as string; },

    async setLessonComplete(row, done) {
      if (done) {
        check(await sb.from('lesson_progress').upsert({
          user_id: row.userId, course_id: row.courseId, lesson_id: row.lessonId, completed_at: row.completedAt,
        }, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }));
      } else {
        check(await sb.from('lesson_progress').delete().eq('user_id', row.userId).eq('lesson_id', row.lessonId));
      }
    },
    async saveQuizKey(k) {
      check(await sb.from('quiz_keys').upsert({
        lesson_id: k.lessonId, course_id: k.courseId, answers: k.answers, pass_percent: k.passPercent,
      }));
    },
    async submitQuiz(lessonId, answers) {
      return check(await sb.rpc('submit_quiz', { p_lesson: lessonId, p_answers: answers })) as QuizResult;
    },
    async setAuthorStatus(userId, status) {
      check(await sb.rpc('set_author_status', { p_user: userId, p_status: status }));
    },
    async markNotificationsRead(ids) {
      if (!ids.length) return;
      check(await sb.from('notifications').update({ read: true }).in('id', ids));
    },

    async saveHomework(h) {
      check(await sb.from('homework').upsert({
        id: h.id, lesson_id: h.lessonId, course_id: h.courseId, student_id: h.studentId, title: h.title,
        description: h.description, status: h.status, content: h.submission?.content ?? '', files: h.files ?? [],
        feedback: h.feedback ?? null, reviewer_id: h.reviewerId ?? null, deadline: h.deadline ?? null,
        reviewed_at: h.reviewedAt ?? null,
      }, { onConflict: 'lesson_id,student_id' }));
    },

    async sendMessage(m) {
      check(await sb.from('messages').insert({ id: m.id, from_id: m.fromUserId, to_id: m.toUserId, content: m.content }));
    },
    async markRead(userId, withUserId) {
      check(await sb.from('messages').update({ read: true }).eq('to_id', userId).eq('from_id', withUserId).eq('read', false));
    },

    async uploadFile(bucket: FileBucket, path: string, file: File) {
      check(await sb.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type || undefined }));
      if (bucket === 'covers') return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      return path;
    },
    async fileUrl(bucket: FileBucket, path: string) {
      if (/^https?:\/\//.test(path)) return path;
      const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, 60 * 60);
      if (error) throw new Error(error.message);
      return data.signedUrl;
    },
  };
}
