/**
 * Проверка курса глазами ученика на боевом сервере (через код приложения):
 * временный ученик записывается на курс, получает каждый урок и каждое видео,
 * видео проверяется на потоковую отдачу (Range → 206) и длительность (ffprobe по ссылке).
 * Посторонний пользователь не должен получить ни уроки, ни видео. В конце — уборка.
 *
 *   SUPABASE_URL=https://api.unick.online SUPABASE_ANON_KEY=<anon> SMOKE_SSH=unick \
 *   npx vite-node scripts/verify-course.ts -- <course_id>
 */
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'node:child_process';
import { createSupabaseBackend } from '../src/app/lib/backend/supabaseBackend';
import { lessonData } from '../src/app/lib/lessonContent';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_ANON_KEY!;
const ssh = process.env.SMOKE_SSH!;
const courseId = process.argv.slice(2).filter(a => a !== '--')[0];
if (!url || !key || !ssh || !courseId) { console.error('Нужны SUPABASE_URL, SUPABASE_ANON_KEY, SMOKE_SSH и id курса'); process.exit(1); }

const run = Date.now().toString(36);
let failed = 0;
const ok = (c: unknown, m: string) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) failed++; };
const sql = (q: string) => execSync(`ssh ${ssh} "docker exec supabase-db psql -U postgres -tAc \\"${q}\\""`).toString().trim();

async function signUp(name: string) {
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const email = `verify-${name}-${run}@smoke.unick.test`;
  const { data, error } = await sb.auth.signUp({ email, password: `Verify-${run}-pass`, options: { data: { name, role: 'student' } } });
  if (error || !data.user) throw new Error(error?.message);
  return { id: data.user.id, backend: createSupabaseBackend(sb, { url }) };
}

try {
  const student = await signUp('student');
  sql(`insert into enrollments (course_id, user_id, source) values ('${courseId}', '${student.id}', 'manual')`);
  const snap = await student.backend.load({ id: student.id } as never);
  const course = snap.courses.find(c => c.id === courseId);
  ok(course, `курс виден ученику: «${course?.title}»`);
  const lessons = course?.modules.flatMap(m => m.lessons.map(l => ({ l, m }))) ?? [];
  ok(lessons.length > 0, `уроков: ${lessons.length}, модулей: ${course?.modules.length}`);

  for (const { l, m } of lessons) {
    const d = lessonData(l);
    ok((d.html ?? '').length > 50, `${m.title} → «${l.title}» (${l.type}): текст ${(d.html ?? '').length} симв.`);
    if (l.type !== 'video' || !d.url) continue;
    const signed = await student.backend.fileUrl('lesson-files', d.url);
    const head = await fetch(signed, { headers: { Range: 'bytes=0-1048575' } });
    ok(head.status === 206 && head.headers.get('content-type')?.includes('video'), `  видео отдаётся потоком (Range → ${head.status}, ${head.headers.get('content-type')})`);
    await head.arrayBuffer();
    const tail = await fetch(signed, { headers: { Range: 'bytes=-1048576' } });
    ok(tail.status === 206, '  перемотка в конец работает');
    await tail.arrayBuffer();
    try {
      const probe = execSync(`ffprobe -v error -show_entries format=duration:stream=width,height,codec_name -of json "${signed}"`, { timeout: 60000 }).toString();
      const p = JSON.parse(probe);
      const v = p.streams.find((s: { width?: number }) => s.width);
      ok(Number(p.format.duration) > 60, `  ${(Number(p.format.duration) / 60).toFixed(1)} мин, ${v?.codec_name} ${v?.width}×${v?.height}`);
    } catch (e) { ok(false, `  ffprobe по ссылке: ${(e as Error).message.slice(0, 80)}`); }
  }

  const outsider = await signUp('outsider');
  const o = await outsider.backend.load({ id: outsider.id } as never);
  ok(!o.courses.some(c => c.id === courseId), 'посторонний не видит курс');
  const firstVideo = lessons.map(x => lessonData(x.l).url).find(Boolean);
  if (firstVideo) await outsider.backend.fileUrl('lesson-files', firstVideo).then(() => ok(false, 'посторонний не получает видео'), () => ok(true, 'посторонний не получает видео'));
} catch (e) {
  ok(false, `прервано: ${(e as Error).message}`);
} finally {
  try { execSync(`ssh ${ssh} "bash /opt/unick/cleanup.sh"`, { stdio: 'ignore' }); console.log('уборка выполнена'); } catch { console.log('уборка не удалась'); }
}
console.log(failed ? `\nFAILED: ${failed}` : '\nCOURSE OK');
process.exit(failed ? 1 : 0);
