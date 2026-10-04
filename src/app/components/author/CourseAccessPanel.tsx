import { useMemo, useState } from 'react';
import { Copy, Link2, UserPlus, Ban, RotateCcw, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useDataStore } from '../../store/DataStore';
import { appUrl } from '../../lib/supabase';
import type { Course, EnrollmentSource } from '../../types';

const SOURCE_LABELS: Record<EnrollmentSource, string> = {
  invite: 'По приглашению',
  manual: 'Добавлен вручную',
  free: 'Самозапись',
  network: 'Из каталога Unick',
  payment: 'Оплата',
};

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Ссылка скопирована');
  } catch {
    // Буфер обмена недоступен (нет фокуса или разрешения) — показываем ссылку, чтобы скопировать вручную
    toast.info(text, { description: 'Скопируйте ссылку вручную', duration: 15000 });
  }
}

export function CourseAccessPanel({ course }: { course: Course }) {
  const { invites, enrollmentRecords, getUser, createInvite, setInviteActive, enrollByEmail, unenrollStudent, getCourseProgress } = useDataStore();
  const [label, setLabel] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const courseInvites = useMemo(() => invites.filter(i => i.courseId === course.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [invites, course.id]);
  const students = useMemo(
    () => enrollmentRecords.filter(e => e.courseId === course.id && e.status !== 'revoked').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [enrollmentRecords, course.id],
  );

  const handleCreate = () => {
    const limit = maxUses ? Number(maxUses) : undefined;
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) { toast.error('Лимит — целое число больше нуля'); return; }
    const inv = createInvite(course.id, { label: label.trim() || undefined, maxUses: limit });
    setLabel(''); setMaxUses('');
    copy(appUrl(`/join/${inv.code}`));
  };

  const handleEnroll = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      await enrollByEmail(course.id, email);
      toast.success('Ученик добавлен');
      setEmail('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось добавить');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {course.status !== 'published' && (
        <div className="rounded-xl bg-[#FFF4D6] text-[#5A4500] text-sm px-4 py-3">
          Курс в черновике: ученики не смогут вступить по ссылке, пока вы его не опубликуете (вкладка «Настройки»).
        </div>
      )}

      <Card className="border-0">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Ссылки-приглашения</h3>
            <p className="text-[13px] text-[#8A8A9A]">Отправьте ссылку ученикам. Перейдя по ней, ученик зарегистрируется и сразу получит доступ к курсу.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1">
              <Label htmlFor="inv-label" className="text-xs">Название (для себя)</Label>
              <Input id="inv-label" value={label} onChange={e => setLabel(e.target.value)} placeholder="Например: поток октябрь, чат в Telegram" className="mt-1 h-9" />
            </div>
            <div className="sm:w-40">
              <Label htmlFor="inv-max" className="text-xs">Лимит мест</Label>
              <Input id="inv-max" type="number" min={1} value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="без лимита" className="mt-1 h-9" />
            </div>
            <Button onClick={handleCreate}><Link2 className="w-4 h-4 mr-2" />Создать ссылку</Button>
          </div>

          {courseInvites.length > 0 && (
            <ul className="divide-y divide-[#1A1A2E]/5">
              {courseInvites.map(inv => {
                const url = appUrl(`/join/${inv.code}`);
                const exhausted = inv.maxUses != null && inv.uses >= inv.maxUses;
                return (
                  <li key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A2E] truncate">{inv.label || 'Приглашение'}</p>
                      <p className="text-xs text-[#8A8A9A] truncate">{url}</p>
                    </div>
                    <span className="text-xs text-[#8A8A9A] whitespace-nowrap">
                      {inv.uses}{inv.maxUses != null ? ` / ${inv.maxUses}` : ''} вступили
                    </span>
                    {!inv.active ? <Badge variant="secondary">Отключена</Badge> : exhausted ? <Badge variant="secondary">Мест нет</Badge> : <Badge variant="success">Активна</Badge>}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Скопировать ссылку" onClick={() => copy(url)}><Copy className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label={inv.active ? 'Отключить ссылку' : 'Включить ссылку'}
                        onClick={() => setInviteActive(inv.id, !inv.active)}>
                        {inv.active ? <Ban className="w-4 h-4 text-[#FF6B6B]" /> : <RotateCcw className="w-4 h-4" />}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                Ученики курса <span className="text-[#8A8A9A] font-normal">· {students.length}</span>
              </h3>
              <p className="text-[13px] text-[#8A8A9A]">Можно добавить уже зарегистрированного пользователя по email.</p>
            </div>
            <div className="flex gap-2">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email ученика" className="h-9 sm:w-56"
                onKeyDown={e => { if (e.key === 'Enter') handleEnroll(); }} />
              <Button variant="outline" size="sm" onClick={handleEnroll} disabled={busy}><UserPlus className="w-4 h-4 mr-1" />Добавить</Button>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-sm text-[#8A8A9A] py-4 text-center">Пока никого. Создайте ссылку-приглашение и отправьте её ученикам.</p>
          ) : (
            <ul className="divide-y divide-[#1A1A2E]/5">
              {students.map(e => {
                const u = getUser(e.userId);
                const pct = getCourseProgress(e.userId, course.id);
                return (
                  <li key={e.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A2E] truncate">{u?.name || 'Ученик'}</p>
                      <p className="text-xs text-[#8A8A9A] truncate">{u?.email} · {SOURCE_LABELS[e.source]} · {new Date(e.createdAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div className="w-28 hidden sm:block">
                      <Progress value={pct} className="h-1.5" />
                      <p className="text-[11px] text-[#8A8A9A] mt-1 text-right">{pct}%</p>
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Закрыть доступ"
                      onClick={() => { if (window.confirm(`Закрыть доступ к курсу для ${u?.name || 'ученика'}?`)) unenrollStudent(e.userId, course.id); }}>
                      <UserMinus className="w-4 h-4 text-[#FF6B6B]" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
