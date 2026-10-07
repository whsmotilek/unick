/**
 * Смоук боевого сервера ЧЕРЕЗ КОД ПРИЛОЖЕНИЯ (src/app/lib/backend/supabaseBackend.ts).
 * В отличие от scripts/smoke.mjs, здесь запросы идут так же, как из интерфейса, —
 * поэтому ловятся ошибки вида «интерфейс делает upsert, а права разрешают только update».
 *
 * Запуск:
 *   SUPABASE_URL=https://api.unick.online SUPABASE_ANON_KEY=<anon> SMOKE_SSH=unick npx vite-node scripts/smoke-app.ts
 * SMOKE_SSH — ssh-хост сервера: через него тестовые пользователи получают роли (модерация, админ)
 * и в конце запускается уборка (deploy/cleanup.sh).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { execSync } from 'node:child_process';
import { createSupabaseBackend } from '../src/app/lib/backend/supabaseBackend';
import type { Backend, CourseMeta, ModuleMeta } from '../src/app/lib/backend/types';
import type { Enrollment, Homework, Invite, Lesson } from '../src/app/types';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_ANON_KEY!;
const ssh = process.env.SMOKE_SSH;
if (!url || !key || !ssh) { console.error('Нужны SUPABASE_URL, SUPABASE_ANON_KEY и SMOKE_SSH'); process.exit(1); }

const run = Date.now().toString(36);
let failed = 0;
const ok = (cond: unknown, msg: string) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failed++; };
async function step<T>(msg: string, fn: () => Promise<T>): Promise<T> {
  try { const r = await fn(); ok(true, msg); return r; }
  catch (e) { ok(false, `${msg}: ${(e as Error).message}`); throw e; }
}
const sql = (q: string) => execSync(`ssh ${ssh} "docker exec supabase-db psql -U postgres -tAc \\"${q}\\""`).toString().trim();
const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

let seq = 0;
async function actor(role: 'author' | 'student', name: string) {
  const sb: SupabaseClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const email = `${role}${++seq}-${run}@smoke.unick.test`;
  const { data, error } = await sb.auth.signUp({ email, password: `Smoke-${run}-pass`, options: { data: { name, role } } });
  if (error || !data.user) throw new Error(`регистрация ${email}: ${error?.message}`);
  return { sb, id: data.user.id, email, backend: createSupabaseBackend(sb) as Backend };
}
async function relogin(a: { sb: SupabaseClient; email: string }) {
  // новая сессия после смены роли в базе
  await a.sb.auth.signInWithPassword({ email: a.email, password: `Smoke-${run}-pass` });
}

try {
  // ---------- Автор ----------
  const author = await step('регистрация автора', () => actor('author', 'Смоук Автор'));
  sql(`update profiles set author_status='approved' where id='${author.id}'`);
  const me = (await author.sb.from('profiles').select('*').eq('id', author.id).single()).data!;

  const course: CourseMeta = {
    id: newId(), schoolId: me.school_id, title: `Смоук ${run}`, description: 'Проверка через код приложения',
    status: 'draft', accessType: 'invite', sequential: true, createdAt: now(), updatedAt: now(),
  };
  await step('автор создаёт черновик (как интерфейс)', () => author.backend.saveCourse(course));
  await step('автор публикует курс', () => author.backend.saveCourse({ ...course, status: 'published' }));
  const mod: ModuleMeta = { id: newId(), courseId: course.id, title: 'Модуль', order: 1 };
  await step('модуль', () => author.backend.saveModule(mod));
  const L = (type: Lesson['type'], order: number, data: Record<string, unknown>): Lesson =>
    ({ id: newId(), moduleId: mod.id, title: `${type} ${order}`, order, type, content: { type, data }, isLocked: false });
  const video = L('video', 1, { url: 'https://youtu.be/EgYIBT-h6tw' });
  const hw = L('homework', 2, { html: '<p>Задание</p>', deadlineDays: 3 });
  const quiz = L('quiz', 3, { questions: [{ id: 'q1', text: '2+2', options: [{ id: 'a', text: '4' }, { id: 'b', text: '5' }], correct: ['a'] }], passPercent: 100 });
  const final = L('text', 4, { html: '<p>Итоги</p>' });
  for (const l of [video, hw, quiz, final]) await step(`урок ${l.type}`, () => author.backend.saveLesson(l, course.id));
  await step('ключ теста', () => author.backend.saveQuizKey({ lessonId: quiz.id, courseId: course.id, answers: { q1: ['a'] }, passPercent: 100 }));
  const pdf = new File(['%PDF-1.4 smoke'], 'smoke.pdf', { type: 'application/pdf' });
  const pdfPath = await step('загрузка материала урока', () => author.backend.uploadFile('lesson-files', `${course.id}/files/smoke.pdf`, pdf));
  await step('урок с материалом', () => author.backend.saveLesson({ ...final, content: { type: 'text', data: { html: '<p>Итоги</p>', files: [{ path: pdfPath, name: 'smoke.pdf' }] } } }, course.id));
  const invite: Invite = { id: newId(), courseId: course.id, code: `smoke${run}`, uses: 0, active: true, createdAt: now(), maxUses: 5 };
  await step('ссылка-приглашение', () => author.backend.saveInvite(invite));

  // ---------- Ученик ----------
  const student = await step('регистрация ученика', () => actor('student', 'Смоук Ученик'));
  const info = await step('страница приглашения без входа', () => createSupabaseBackend(createClient(url, key)).inviteInfo(invite.code));
  ok(info?.valid, 'приглашение действует');
  await step('вступление по приглашению', () => student.backend.redeemInvite(invite.code));
  const snapS = await step('загрузка данных ученика', () => student.backend.load({ id: student.id } as never));
  const sc = snapS.courses.find(c => c.id === course.id);
  ok(sc && sc.modules[0].lessons.length === 4, 'ученик видит 4 урока');
  const sq = sc?.modules[0].lessons.find(l => l.id === quiz.id);
  ok(sq && !JSON.stringify(sq.content).includes('"correct"'), 'правильные ответы не приходят ученику');
  ok(snapS.quizKeys.length === 0, 'ключи тестов не приходят ученику');
  const fileUrl = await step('ученик открывает материал', () => student.backend.fileUrl('lesson-files', pdfPath));
  ok((await fetch(fileUrl)).ok, 'материал скачивается');

  await step('урок 1 пройден', () => student.backend.setLessonComplete({ userId: student.id, courseId: course.id, lessonId: video.id, completedAt: now() }, true));
  const photo = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
  const photoPath = await step('ученик прикрепляет фото к ДЗ', () => student.backend.uploadFile('homework-files', `${course.id}/${student.id}/photo.jpg`, photo));
  const submission: Homework = {
    id: newId(), lessonId: hw.id, courseId: course.id, studentId: student.id, title: hw.title, description: 'Задание',
    status: 'submitted', submittedAt: now(), submission: { type: 'text', content: 'Мой ответ' }, files: [{ path: photoPath, name: 'photo.jpg' }],
  };
  await step('ученик сдаёт ДЗ (как интерфейс)', () => student.backend.saveHomework(submission));

  // ---------- Проверка ДЗ: тот самый сценарий из баг-репорта ----------
  const snapA = await step('загрузка данных автора', () => author.backend.load({ id: author.id } as never));
  const got = snapA.homework.find(h => h.lessonId === hw.id)!;
  ok(got?.files?.length === 1, 'автор видит фото в работе');
  ok((await fetch(await author.backend.fileUrl('homework-files', photoPath))).ok, 'автор открывает фото');
  await step('автор возвращает на доработку (как интерфейс)', () =>
    author.backend.reviewHomework({ ...got, status: 'returned', feedback: 'Доработайте', reviewerId: author.id, reviewedAt: now() }));
  let mine = (await student.backend.load({ id: student.id } as never)).homework.find(h => h.lessonId === hw.id)!;
  ok(mine.status === 'returned' && mine.feedback === 'Доработайте', 'ученик видит возврат и комментарий');
  await step('ученик пересдаёт (как интерфейс)', () => student.backend.saveHomework({ ...mine, status: 'submitted', submittedAt: now(), submission: { type: 'text', content: 'Исправила' } }));
  const again = (await author.backend.load({ id: author.id } as never)).homework.find(h => h.lessonId === hw.id)!;
  ok(again.status === 'submitted' && again.submission?.content === 'Исправила', 'автор видит пересдачу');
  await step('автор принимает (как интерфейс)', () =>
    author.backend.reviewHomework({ ...again, status: 'approved', feedback: 'Отлично', reviewerId: author.id, reviewedAt: now() }));
  const snapS2 = await student.backend.load({ id: student.id } as never);
  mine = snapS2.homework.find(h => h.lessonId === hw.id)!;
  ok(mine.status === 'approved', 'ученик видит «Принято»');
  ok(snapS2.progress.some(p => p.lessonId === hw.id), 'принятое ДЗ засчитано');
  ok(snapS2.notifications.some(n => n.type === 'homework_reviewed'), 'ученику пришли уведомления о проверке');

  // ---------- Тест ----------
  const r1 = await step('тест с ошибкой', () => student.backend.submitQuiz(quiz.id, { q1: ['b'] }));
  ok(!r1.passed && !r1.key, 'не пройден, ключ скрыт');
  const r2 = await step('тест верно', () => student.backend.submitQuiz(quiz.id, { q1: ['a'] }));
  ok(r2.passed, 'тест пройден');
  await step('последний урок', () => student.backend.setLessonComplete({ userId: student.id, courseId: course.id, lessonId: final.id, completedAt: now() }, true));
  ok((await student.backend.load({ id: student.id } as never)).progress.filter(p => p.courseId === course.id).length === 4, 'курс пройден на 100%');

  // ---------- Чат, в том числе с администратором ----------
  await step('ученик пишет автору', () => student.backend.sendMessage({ id: newId(), fromUserId: student.id, toUserId: author.id, content: 'Вопрос', createdAt: now(), read: false }));
  await step('автор отмечает прочитанным', () => author.backend.markRead(author.id, student.id));
  await step('автор отвечает', () => author.backend.sendMessage({ id: newId(), fromUserId: author.id, toUserId: student.id, content: 'Ответ', createdAt: now(), read: false }));
  const admin = await step('временный администратор', () => actor('student', 'Смоук Админ'));
  sql(`update profiles set role='admin' where id='${admin.id}'`);
  await relogin(admin);
  await step('администратор пишет автору', () => admin.backend.sendMessage({ id: newId(), fromUserId: admin.id, toUserId: author.id, content: 'Как дела?', createdAt: now(), read: false }));
  const snapA2 = await author.backend.load({ id: author.id } as never);
  ok(snapA2.users.some(u => u.id === admin.id), 'автор видит, кто написал (администратор)');
  await step('автор отвечает администратору', () => author.backend.sendMessage({ id: newId(), fromUserId: author.id, toUserId: admin.id, content: 'Всё хорошо', createdAt: now(), read: false }));
  await step('ученик пишет администратору', () => student.backend.sendMessage({ id: newId(), fromUserId: student.id, toUserId: admin.id, content: 'Помогите', createdAt: now(), read: false }));

  // ---------- Доступ ----------
  const s2 = await step('второй ученик', () => actor('student', 'Смоук Второй'));
  await step('автор добавляет ученика по email', () => author.backend.enrollByEmail(course.id, s2.email));
  await step('автор отключает приглашение', () => author.backend.saveInvite({ ...invite, active: false }));
  ok(!(await createSupabaseBackend(createClient(url, key)).inviteInfo(invite.code))?.valid, 'отключённое приглашение не действует');
  const enr = (await author.backend.load({ id: author.id } as never)).enrollments.find(e => e.userId === s2.id) as Enrollment;
  await step('автор закрывает доступ', () => author.backend.deleteEnrollment(course.id, enr.userId));
  ok((await s2.backend.load({ id: s2.id } as never)).courses.every(c => c.id !== course.id), 'после закрытия доступа курс не виден');
  const outsider = await step('посторонний', () => actor('student', 'Посторонний'));
  ok((await outsider.backend.load({ id: outsider.id } as never)).courses.every(c => c.id !== course.id), 'посторонний не видит курс по приглашению');
  await outsider.backend.fileUrl('lesson-files', pdfPath).then(() => ok(false, 'посторонний не получает файл'), () => ok(true, 'посторонний не получает файл'));

  await step('автор удаляет курс', () => author.backend.deleteCourse(course.id));
} catch (e) {
  console.log('Прервано:', (e as Error).message);
} finally {
  try { execSync(`ssh ${ssh} "bash /opt/unick/cleanup.sh"`, { stdio: 'ignore' }); console.log('уборка выполнена'); }
  catch { console.log('уборка не удалась — запустите deploy/cleanup.sh вручную'); }
}

console.log(failed ? `\nFAILED: ${failed}` : '\nAPP SMOKE PASSED');
process.exit(failed ? 1 : 0);
