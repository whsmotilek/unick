/**
 * Импорт готового курса в платформу: видео загружаются частями (Tus) прямо в хранилище,
 * затем создаются курс, модули и уроки. Нужен, когда курс переносим за автора
 * (большие видео, много уроков), чтобы автору осталось только проверить и опубликовать.
 *
 * Запуск (сервисный ключ берётся с сервера и в консоль не выводится):
 *   SUPABASE_URL=https://api.unick.online \
 *   SUPABASE_SERVICE_KEY=$(ssh unick "grep '^SERVICE_ROLE_KEY=' /opt/unick/supabase/.env | cut -d= -f2-") \
 *   npx vite-node scripts/import-course.ts -- /путь/к/папке-курса [--dry-run]
 *
 * В папке курса: course.json (структура — см. CourseSpec ниже), видео, обложка, файлы материалов.
 * Курс создаётся в школе пользователя ownerEmail. Повторный запуск с тем же названием курса
 * в этой школе остановится, чтобы не создать дубль.
 */
import { createClient } from '@supabase/supabase-js';
import { Upload } from 'tus-js-client';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

interface LessonSpec {
  type: 'video' | 'text' | 'homework' | 'file';
  title: string;
  html?: string;
  video?: string;
  files?: string[];
  deadlineDays?: number;
}
interface CourseSpec {
  title: string;
  description: string;
  ownerEmail: string;
  cover?: string;
  accessType: 'invite' | 'free' | 'paid';
  sequential: boolean;
  status: 'draft' | 'published';
  modules: { title: string; lessons: LessonSpec[] }[];
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const args = process.argv.slice(2).filter(a => a !== '--');
const dir = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
if (!url || !serviceKey || !dir) {
  console.error('Нужны SUPABASE_URL, SUPABASE_SERVICE_KEY и путь к папке курса');
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
const spec: CourseSpec = JSON.parse(readFileSync(join(dir, 'course.json'), 'utf8'));
const MIME: Record<string, string> = { '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf' };
const mime = (f: string) => MIME[extname(f).toLowerCase()] ?? 'application/octet-stream';
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(0)} МБ`;

function uploadFile(bucket: string, objectName: string, file: string): Promise<void> {
  const size = statSync(file).size;
  return new Promise((resolve, reject) => {
    let last = -1;
    const upload = new Upload(createReadStream(file), {
      endpoint: `${url}/storage/v1/upload/resumable`,
      uploadSize: size,
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 2000, 5000, 10000, 20000, 40000],
      headers: { authorization: `Bearer ${serviceKey}`, apikey: serviceKey!, 'x-upsert': 'true' },
      metadata: { bucketName: bucket, objectName, contentType: mime(file), cacheControl: '3600' },
      onProgress: (sent, total) => {
        const pct = Math.floor((sent / total) * 100);
        if (pct >= last + 10) { last = pct; process.stdout.write(`\r  ${basename(file)}: ${pct}% из ${mb(total)}   `); }
      },
      onError: e => { process.stdout.write('\n'); reject(e); },
      onSuccess: () => { process.stdout.write(`\r  ${basename(file)}: 100% из ${mb(size)}   \n`); resolve(); },
    });
    upload.start();
  });
}

async function main() {
  // Проверяем, что все файлы на месте, до любых изменений
  const missing: string[] = [];
  const need = [spec.cover, ...spec.modules.flatMap(m => m.lessons.flatMap(l => [l.video, ...(l.files ?? [])]))].filter(Boolean) as string[];
  for (const f of need) { try { statSync(join(dir!, f)); } catch { missing.push(f); } }
  if (missing.length) throw new Error(`Нет файлов: ${missing.join(', ')}`);

  const { data: owner, error: ownerErr } = await sb.from('profiles').select('id, school_id, role').eq('email', spec.ownerEmail).single();
  if (ownerErr || !owner?.school_id) throw new Error(`У ${spec.ownerEmail} нет школы (${ownerErr?.message ?? 'school_id пуст'})`);
  const { data: dup } = await sb.from('courses').select('id').eq('school_id', owner.school_id).eq('title', spec.title);
  if (dup?.length) throw new Error(`В школе уже есть курс «${spec.title}» (${dup[0].id}) — удалите его или переименуйте`);

  const totalVideo = need.filter(f => f.endsWith('.mp4')).reduce((s, f) => s + statSync(join(dir!, f)).size, 0);
  console.log(`Курс «${spec.title}»: ${spec.modules.length} модулей, ${spec.modules.reduce((s, m) => s + m.lessons.length, 0)} уроков, видео ${mb(totalVideo)}`);
  console.log(`Школа владельца ${spec.ownerEmail}: ${owner.school_id}`);
  if (dryRun) { console.log('Пробный запуск — ничего не изменено'); return; }

  const courseId = crypto.randomUUID();
  let cover: string | null = null;
  if (spec.cover) {
    const object = `${courseId}/cover${extname(spec.cover)}`;
    await uploadFile('covers', object, join(dir!, spec.cover));
    cover = sb.storage.from('covers').getPublicUrl(object).data.publicUrl;
  }

  // Сначала все видео и материалы: если загрузка оборвётся, курс в базе не появится наполовину
  const prepared = [];
  for (const [mi, m] of spec.modules.entries()) {
    const lessons = [];
    for (const [li, l] of m.lessons.entries()) {
      const data: Record<string, unknown> = { html: l.html ?? '' };
      if (l.video) {
        const object = `${courseId}/video/${String(mi + 1).padStart(2, '0')}-${String(li + 1).padStart(2, '0')}${extname(l.video)}`;
        await uploadFile('lesson-files', object, join(dir!, l.video));
        data.url = object;
      }
      if (l.files?.length) {
        data.files = [];
        for (const f of l.files) {
          const object = `${courseId}/files/${crypto.randomUUID()}${extname(f).toLowerCase()}`;
          await uploadFile('lesson-files', object, join(dir!, f));
          (data.files as unknown[]).push({ path: object, name: basename(f), size: statSync(join(dir!, f)).size });
        }
      }
      if (l.deadlineDays) data.deadlineDays = l.deadlineDays;
      lessons.push({ id: crypto.randomUUID(), title: l.title, type: l.type, position: li + 1, content: data });
    }
    prepared.push({ id: crypto.randomUUID(), title: m.title, position: mi + 1, lessons });
  }

  const check = (r: { error: { message: string } | null }, what: string) => { if (r.error) throw new Error(`${what}: ${r.error.message}`); };
  check(await sb.from('courses').insert({
    id: courseId, school_id: owner.school_id, title: spec.title, description: spec.description, cover,
    status: spec.status, access_type: spec.accessType, sequential: spec.sequential,
  }), 'курс');
  for (const m of prepared) {
    check(await sb.from('modules').insert({ id: m.id, course_id: courseId, title: m.title, position: m.position }), `модуль «${m.title}»`);
    check(await sb.from('lessons').insert(m.lessons.map(l => ({ ...l, module_id: m.id, course_id: courseId }))), `уроки модуля «${m.title}»`);
  }
  console.log(`\nГотово. Курс: ${courseId}\nРедактор: https://unick.online/author/courses/${courseId}`);
}

main().catch(e => { console.error('\nОшибка:', e.message); process.exit(1); });
