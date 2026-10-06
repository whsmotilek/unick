// Смоук-тест боевого бэкенда: сквозной сценарий через публичный API (anon-ключ + RLS).
// Запуск: SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/smoke.mjs
// Создаёт пользователей *@smoke.unick.test — удалите их после проверки (см. вывод в конце).
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) { console.error('Нужны SUPABASE_URL и SUPABASE_ANON_KEY'); process.exit(1); }

const run = Date.now().toString(36);
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failed++; };
const must = (res, msg) => { if (res.error) { console.log(`FAIL ${msg}: ${res.error.message}`); failed++; throw new Error(msg); } ok(true, msg); return res.data; };

let seq = 0;
async function signUp(role, name) {
  const sb = client();
  const email = `${role}${++seq}-${run}@smoke.unick.test`;
  const res = await sb.auth.signUp({ email, password: `Smoke-${run}-pass`, options: { data: { name, role } } });
  must(res, `регистрация ${role}`);
  ok(!!res.data.session, `${role}: сессия сразу (автоподтверждение)`);
  return { sb, id: res.data.user.id, email };
}

try {
  const author = await signUp('author', 'Смоук Автор');
  const profile = must(await author.sb.from('profiles').select('*').eq('id', author.id).single(), 'профиль автора');
  ok(profile.role === 'author' && !!profile.school_id, 'у автора роль author и школа');

  const course = must(await author.sb.from('courses').insert({ school_id: profile.school_id, title: `Смоук-курс ${run}`, status: 'published', sequential: true }).select().single(), 'автор создаёт курс');
  const mod = must(await author.sb.from('modules').insert({ course_id: course.id, title: 'Модуль', position: 1 }).select().single(), 'модуль');
  const l1 = must(await author.sb.from('lessons').insert({ module_id: mod.id, course_id: course.id, title: 'Видео', type: 'video', position: 1, content: { url: 'https://youtu.be/EgYIBT-h6tw' } }).select().single(), 'урок 1');
  const hw = must(await author.sb.from('lessons').insert({ module_id: mod.id, course_id: course.id, title: 'ДЗ', type: 'homework', position: 2, content: { html: '<p>Задание</p>' } }).select().single(), 'урок ДЗ');
  const quiz = must(await author.sb.from('lessons').insert({ module_id: mod.id, course_id: course.id, title: 'Тест', type: 'quiz', position: 3,
    content: { questions: [{ id: 'q1', text: '2+2', options: [{ id: 'a', text: '4' }, { id: 'b', text: '5' }], correct: ['a'] }] } }).select().single(), 'урок-тест');
  ok(!('correct' in quiz.content.questions[0]), 'сервер вырезал правильные ответы из урока');
  must(await author.sb.from('quiz_keys').insert({ lesson_id: quiz.id, course_id: course.id, answers: { q1: ['a'] }, pass_percent: 100 }), 'ключ теста');
  const inv = must(await author.sb.from('invites').insert({ course_id: course.id, max_uses: 5 }).select().single(), 'приглашение');

  const student = await signUp('student', 'Смоук Ученик');
  const before = await student.sb.from('lessons').select('id').eq('course_id', course.id);
  ok((before.data ?? []).length === 0, 'до вступления ученик не видит уроки');
  const info = must(await client().rpc('invite_info', { p_code: inv.code }), 'invite_info без входа');
  ok(info?.[0]?.valid === true, 'приглашение валидно');
  must(await student.sb.rpc('redeem_invite', { p_code: inv.code }), 'ученик вступает по приглашению');
  const after = must(await student.sb.from('lessons').select('id').eq('course_id', course.id), 'ученик видит уроки');
  ok(after.length === 3, 'видны все 3 урока');
  const keys = await student.sb.from('quiz_keys').select('*');
  ok((keys.data ?? []).length === 0, 'ученик не видит ключи тестов');

  must(await student.sb.from('lesson_progress').insert({ user_id: student.id, course_id: course.id, lesson_id: l1.id }), 'урок 1 пройден');
  const skip = await student.sb.from('lesson_progress').insert({ user_id: student.id, course_id: course.id, lesson_id: quiz.id });
  ok(!!skip.error, 'нельзя засчитать тест в обход');
  must(await student.sb.from('homework').insert({ lesson_id: hw.id, course_id: course.id, student_id: student.id, title: 'ДЗ', content: 'Мой ответ', status: 'approved' }), 'ДЗ сдано');
  const myHw = must(await student.sb.from('homework').select('*').eq('lesson_id', hw.id).single(), 'ДЗ читается');
  ok(myHw.status === 'submitted', 'ученик не может сам принять ДЗ');

  const authorNotes = must(await author.sb.from('notifications').select('type'), 'уведомления автора');
  ok(authorNotes.some(n => n.type === 'student_enrolled') && authorNotes.some(n => n.type === 'homework_submitted'), 'автору пришли уведомления (ученик, ДЗ)');

  must(await author.sb.from('homework').update({ status: 'approved', feedback: 'Отлично', reviewer_id: author.id }).eq('id', myHw.id), 'автор принимает ДЗ');
  const prog = must(await student.sb.from('lesson_progress').select('lesson_id').eq('course_id', course.id), 'прогресс ученика');
  ok(prog.length === 2, 'принятое ДЗ засчитано');
  const r1 = must(await student.sb.rpc('submit_quiz', { p_lesson: quiz.id, p_answers: { q1: ['b'] } }), 'тест: неверный ответ');
  ok(r1.passed === false && r1.key === null, 'неверный ответ: не пройден, ключ скрыт');
  const r2 = must(await student.sb.rpc('submit_quiz', { p_lesson: quiz.id, p_answers: { q1: ['a'] } }), 'тест: верный ответ');
  ok(r2.passed === true, 'тест пройден');
  const prog2 = must(await student.sb.from('lesson_progress').select('lesson_id').eq('course_id', course.id), 'прогресс после теста');
  ok(prog2.length === 3, 'курс пройден на 100%');
  const studentNotes = must(await student.sb.from('notifications').select('type'), 'уведомления ученика');
  ok(studentNotes.some(n => n.type === 'homework_reviewed'), 'ученику пришло уведомление о проверке');

  // Файлы: обложка (публичная) и приватный материал урока
  const blob = new Blob(['hello'], { type: 'text/plain' });
  must(await author.sb.storage.from('lesson-files').upload(`${course.id}/files/smoke.txt`, blob), 'загрузка материала урока');
  const signed = must(await student.sb.storage.from('lesson-files').createSignedUrl(`${course.id}/files/smoke.txt`, 60), 'ученик получает ссылку на материал');
  const fileRes = await fetch(signed.signedUrl);
  ok(fileRes.ok && (await fileRes.text()) === 'hello', 'файл скачивается по подписанной ссылке');
  const outsider = await signUp('student', 'Посторонний');
  const denied = await outsider.sb.storage.from('lesson-files').createSignedUrl(`${course.id}/files/smoke.txt`, 60);
  ok(!!denied.error, 'посторонний не получает доступ к файлу');
} catch (e) {
  console.log('Прервано:', e.message);
}

console.log(`\nТестовые пользователи: *-${run}@smoke.unick.test`);
console.log(failed ? `FAILED: ${failed}` : 'SMOKE PASSED');
process.exit(failed ? 1 : 0);
