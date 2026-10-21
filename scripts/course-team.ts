/**
 * Команда курса на боевом сервере (сервисный ключ берётся с сервера и в консоль не выводится).
 *
 *   SUPABASE_URL=https://api.unick.online \
 *   SUPABASE_SERVICE_KEY=$(ssh unick "grep '^SERVICE_ROLE_KEY=' /opt/unick/supabase/.env | cut -d= -f2-") \
 *   npx vite-node scripts/course-team.ts -- <команда>
 *
 * add <course_id> <email>
 *   Даёт зарегистрированному пользователю права автора в школе, где сейчас лежит курс
 *   (редактор, предпросмотр, ученики, домашки, ссылки). Его собственная пустая школа, если была, удаляется.
 *
 * transfer <course_id> <owner_email> [<email> ...]
 *   Одобряет автора-владельца, переносит курс в его школу и переводит туда же перечисленных
 *   членов команды с правами автора. Вопросы учеников уходят владельцу школы.
 */
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, { auth: { persistSession: false } });
const [cmd, courseId, ...emails] = process.argv.slice(2).filter(a => a !== '--');
const chk = <T>(r: { data: T; error: { message: string } | null }, what: string): T => {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return r.data;
};

async function profile(email: string) {
  const p = chk(await sb.from('profiles').select('id, email, name, role, school_id, author_status').ilike('email', email.trim()).maybeSingle(), email);
  if (!p) throw new Error(`${email} ещё не зарегистрирован(а) на unick.online`);
  return p;
}

/** Перевести пользователя в школу с правами автора; его пустую школу без курсов — удалить */
async function joinSchool(email: string, schoolId: string) {
  const p = await profile(email);
  if (p.role === 'admin') throw new Error(`${email} — администратор платформы, его не трогаем`);
  const own = p.school_id && p.school_id !== schoolId
    ? chk(await sb.from('schools').select('id, owner_id').eq('id', p.school_id).maybeSingle(), 'школа')
    : null;
  chk(await sb.from('profiles').update({ role: 'author', author_status: 'approved', school_id: schoolId }).eq('id', p.id), `профиль ${email}`);
  if (own && own.owner_id === p.id) {
    const courses = chk(await sb.from('courses').select('id').eq('school_id', own.id), 'курсы');
    if (!courses.length) chk(await sb.from('schools').delete().eq('id', own.id), 'пустая школа');
  }
  console.log(`ok  ${p.name} <${p.email}> — автор в школе ${schoolId}`);
}

async function main() {
  if (!courseId || !emails.length || !['add', 'transfer'].includes(cmd)) throw new Error('Команда: add <course> <email> | transfer <course> <owner_email> [email ...]');
  const course = chk(await sb.from('courses').select('id, title, school_id, status').eq('id', courseId).single(), 'курс');
  console.log(`Курс «${course.title}» (${course.status})`);

  if (cmd === 'add') {
    for (const e of emails) await joinSchool(e, course.school_id);
    return;
  }

  const [ownerEmail, ...team] = emails;
  const owner = await profile(ownerEmail);
  if (owner.role !== 'author' || !owner.school_id) throw new Error(`${ownerEmail} должен зарегистрироваться как автор («Я автор»)`);
  const school = chk(await sb.from('schools').select('id, name, owner_id').eq('id', owner.school_id).single(), 'школа автора');
  if (school.owner_id !== owner.id) throw new Error(`${ownerEmail} не владелец школы ${school.id}`);
  if (owner.author_status !== 'approved') {
    chk(await sb.from('profiles').update({ author_status: 'approved' }).eq('id', owner.id), 'одобрение');
  }
  console.log(`ok  ${owner.name} <${owner.email}> — одобрен(а), школа «${school.name}»`);
  chk(await sb.from('courses').update({ school_id: school.id }).eq('id', courseId), 'перенос курса');
  console.log(`ok  курс перенесён в школу «${school.name}»`);
  for (const e of team) await joinSchool(e, school.id);
}

main().catch(e => { console.error('Ошибка:', e.message); process.exit(1); });
