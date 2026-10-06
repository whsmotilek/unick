import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useDataStore } from '../store/DataStore';
import type { AppNotification } from '../types';

const LIMIT = 20;

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/** «только что», «5 минут назад», «вчера», «3 дня назад», дальше — дата */
export function relativeTimeRu(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} ${plural(min, 'минуту', 'минуты', 'минут')} назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ${plural(h, 'час', 'часа', 'часов')} назад`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'вчера';
  if (d < 7) return `${d} ${plural(d, 'день', 'дня', 'дней')} назад`;
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export function NotificationBell({ variant = 'light', side = 'bottom', align = 'end' }: {
  /** dark — на тёмном фоне (сайдбар #1A1A2E), light — на светлом */
  variant?: 'dark' | 'light';
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}) {
  const { notifications, markNotificationsRead } = useDataStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const unread = notifications.filter(n => !n.read);
  const list = notifications.slice(0, LIMIT);
  const badge = unread.length > 99 ? '99+' : String(unread.length);

  const openNotification = (n: AppNotification) => {
    if (!n.read) markNotificationsRead([n.id]);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const triggerCls = variant === 'dark'
    ? 'text-white/60 hover:text-white hover:bg-white/10 focus-visible:ring-white/40'
    : 'text-[#1A1A2E]/60 hover:text-[#1A1A2E] hover:bg-[#1A1A2E]/5 focus-visible:ring-[#7C6AF7]/40';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`relative p-2 rounded-lg transition-colors outline-none focus-visible:ring-2 ${triggerCls}`}
          aria-label={unread.length ? `Уведомления: ${unread.length} непрочитанных` : 'Уведомления'}
        >
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          {unread.length > 0 && (
            <span
              className={`absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#7C6AF7] text-white text-[10px] font-semibold leading-4 text-center border ${variant === 'dark' ? 'border-[#1A1A2E]' : 'border-white'}`}
            >
              {badge}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} sideOffset={8} className="w-[340px] max-w-[calc(100vw-32px)] p-0 overflow-hidden rounded-2xl bg-white text-[#1A1A2E] border-[#1A1A2E]/10">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#1A1A2E]/5">
          <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Уведомления</p>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={() => markNotificationsRead(unread.map(n => n.id))}
              className="text-[12px] text-[#7C6AF7] hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />Отметить все прочитанными
            </button>
          )}
        </div>
        {list.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="w-8 h-8 mx-auto mb-2 text-[#8A8A9A]/60" strokeWidth={1.5} />
            <p className="text-sm text-[#8A8A9A]">Уведомлений пока нет</p>
          </div>
        ) : (
          <ul className="max-h-[min(420px,60vh)] overflow-y-auto divide-y divide-[#1A1A2E]/5">
            {list.map(n => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openNotification(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${n.read ? 'hover:bg-[#F5F4F2]' : 'bg-[#EDE9FF]/60 hover:bg-[#EDE9FF]'}`}
                >
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-[#7C6AF7]'}`} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13px] ${n.read ? 'text-[#1A1A2E]/80' : 'font-semibold text-[#1A1A2E]'}`}>{n.title}</span>
                    {n.body && <span className="block text-[12px] text-[#8A8A9A] line-clamp-2 mt-0.5">{n.body}</span>}
                    <span className="block text-[11px] text-[#8A8A9A] mt-1">{relativeTimeRu(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
