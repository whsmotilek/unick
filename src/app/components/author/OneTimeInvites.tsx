import { useMemo, useState } from 'react';
import { Copy, Ticket, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useDataStore } from '../../store/DataStore';
import { appUrl } from '../../lib/supabase';
import { pluralize } from '../../lib/analytics';
import type { Course, Invite } from '../../types';

const MAX_BATCH = 200;

/** Разовые ссылки: одна ссылка — один ученик. Создаются пачкой, раздаются списком. */
export function OneTimeInvites({ course }: { course: Course }) {
  const { invites, enrollmentRecords, getUser, createInvite } = useDataStore();
  const [count, setCount] = useState('10');
  const [label, setLabel] = useState('');
  const [open, setOpen] = useState(false);

  const oneTime = useMemo(
    () => invites.filter(i => i.courseId === course.id && i.maxUses === 1).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [invites, course.id],
  );
  const free = oneTime.filter(i => i.active && i.uses < 1);
  const usedBy = (inv: Invite) => {
    const e = enrollmentRecords.find(x => x.inviteId === inv.id);
    return e ? getUser(e.userId) : undefined;
  };

  const copyList = async (list: Invite[]) => {
    const text = list.map(i => appUrl(`/join/${i.code}`)).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Скопировано: ${pluralize(list.length, ['ссылка', 'ссылки', 'ссылок'])}`);
    } catch {
      setOpen(true);
      toast.info('Буфер обмена недоступен — выделите ссылки в списке ниже и скопируйте вручную');
    }
  };

  const create = () => {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1 || n > MAX_BATCH) { toast.error(`Укажите число от 1 до ${MAX_BATCH}`); return; }
    const batch = label.trim() || `Разовая · ${new Date().toLocaleDateString('ru-RU')}`;
    const created = Array.from({ length: n }, () => createInvite(course.id, { label: batch, maxUses: 1 }));
    toast.success(`Создано ${pluralize(n, ['разовая ссылка', 'разовые ссылки', 'разовых ссылок'])}`);
    copyList(created);
    setLabel('');
  };

  return (
    <Card className="border-0">
      <CardContent className="p-4 sm:p-6 max-sm:[&:last-child]:pb-4 space-y-4">
        <div>
          <h3 className="text-[16px] font-semibold text-[#1A1A2E] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Ticket className="w-4 h-4 text-[#7C6AF7]" />Разовые ссылки
          </h3>
          <p className="text-[13px] text-[#8A8A9A]">Каждая ссылка пускает в курс одного ученика. Удобно раздавать купившим по одной.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="sm:w-32">
            <Label htmlFor="ot-count" className="text-xs">Сколько ссылок</Label>
            <Input id="ot-count" type="number" min={1} max={MAX_BATCH} inputMode="numeric" value={count}
              onChange={e => setCount(e.target.value)} className="mt-1 h-10 sm:h-9" />
          </div>
          <div className="flex-1">
            <Label htmlFor="ot-label" className="text-xs">Название пачки (для себя)</Label>
            <Input id="ot-label" value={label} onChange={e => setLabel(e.target.value)} placeholder="Например: первый поток" className="mt-1 h-10 sm:h-9" />
          </div>
          <Button onClick={create}><Ticket className="w-4 h-4 mr-2" />Создать и скопировать</Button>
        </div>

        {oneTime.length > 0 && (
          <div className="rounded-xl bg-[#F5F4F2] p-3 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span>Всего: <b>{oneTime.length}</b></span>
              <span>Использовано: <b>{oneTime.length - free.length}</b></span>
              <span>Свободно: <b className="text-[#2D7A4F]">{free.length}</b></span>
              <span className="flex-1" />
              <Button variant="outline" size="sm" disabled={!free.length} onClick={() => copyList(free)}>
                <Copy className="w-4 h-4 mr-1.5" />Скопировать свободные
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(o => !o)}>
                {open ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}{open ? 'Скрыть' : 'Показать все'}
              </Button>
            </div>
            {open && (
              <ul className="divide-y divide-[#1A1A2E]/5 bg-white rounded-lg max-h-[360px] overflow-y-auto">
                {oneTime.map(inv => {
                  const u = usedBy(inv);
                  const url = appUrl(`/join/${inv.code}`);
                  return (
                    <li key={inv.id} className="px-3 py-2 flex items-center gap-2 text-[13px]">
                      <span className="flex-1 min-w-0 truncate font-mono select-all" title={url}>{url}</span>
                      {inv.uses >= 1
                        ? <Badge variant="secondary" className="shrink-0 max-w-[45%] truncate">{u ? u.name : 'Использована'}</Badge>
                        : !inv.active ? <Badge variant="secondary" className="shrink-0">Отключена</Badge>
                        : <Badge variant="success" className="shrink-0">Свободна</Badge>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
