import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

const SUBMITTED_KEY = 'unick_waitlist_submitted';
const ENTRIES_KEY = 'unick_waitlist_entries';
const SESSION_SHOWN_KEY = 'unick_waitlist_shown_session';
const POPUP_DELAY_MS = 60_000;

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  projectDescription: string;
  submittedAt: string;
}

function loadEntries(): WaitlistEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function WaitlistPopup() {
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(() => localStorage.getItem(SUBMITTED_KEY) === '1');
  const [shownThisSession, setShownThisSession] = useState(
    () => sessionStorage.getItem(SESSION_SHOWN_KEY) === '1'
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; project?: string }>({});
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Авто-открытие через минуту, если ещё не показывали в этой сессии
  useEffect(() => {
    if (isAuthenticated || submitted || shownThisSession) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
      setShownThisSession(true);
      setOpen(true);
    }, POPUP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, submitted, shownThisSession]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const nextErrors: typeof errors = {};
      if (!name.trim()) nextErrors.name = 'Укажите имя';
      if (!email.trim()) nextErrors.email = 'Укажите email';
      else if (!isValidEmail(email)) nextErrors.email = 'Похоже на ошибку в email';
      if (!project.trim()) nextErrors.project = 'Расскажите коротко о проекте';
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;

      const entry: WaitlistEntry = {
        id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        projectDescription: project.trim(),
        submittedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(ENTRIES_KEY, JSON.stringify([...loadEntries(), entry]));
        localStorage.setItem(SUBMITTED_KEY, '1');
      } catch {
        toast.error('Не удалось сохранить заявку, попробуйте ещё раз');
        return;
      }
      setJustSubmitted(true);
      toast.success('Готово! Мы свяжемся с вами, как только откроем доступ');
      window.setTimeout(() => {
        setSubmitted(true);
        setOpen(false);
      }, 1800);
    },
    [name, email, project]
  );

  if (isAuthenticated || submitted) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md p-0 overflow-hidden border-0 rounded-[24px] bg-[#F5F4F2] sm:max-w-md"
        >
          <div className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] p-6 text-white relative overflow-hidden">
            <div
              className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mb-3"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Закрытый бета-доступ</span>
            </div>
            <DialogTitle
              className="text-[24px] font-bold leading-tight mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Запишитесь в waitlist
            </DialogTitle>
            <DialogDescription
              className="text-white/85 text-[13px] leading-relaxed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Получите ранний доступ к Unick и расскажите про свой проект — поможем
              стартовать в первой волне.
            </DialogDescription>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {justSubmitted ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#C5E8A0] flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#2D5016]" strokeWidth={2.5} />
              </div>
              <p
                className="text-[16px] font-semibold text-[#1A1A2E] mb-1"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Вы в списке!
              </p>
              <p
                className="text-[13px] text-[#8A8A9A]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Напишем на {email}, как только откроем доступ.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label
                  htmlFor="wl-name"
                  className="text-[12px] font-medium text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Имя
                </Label>
                <Input
                  id="wl-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="h-11 bg-white border-[#E5E5E0]"
                  aria-invalid={!!errors.name || undefined}
                />
                {errors.name && (
                  <p
                    className="text-[11px] text-[#E65A5A]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="wl-email"
                  className="text-[12px] font-medium text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Email
                </Label>
                <Input
                  id="wl-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.com"
                  className="h-11 bg-white border-[#E5E5E0]"
                  aria-invalid={!!errors.email || undefined}
                />
                {errors.email && (
                  <p
                    className="text-[11px] text-[#E65A5A]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="wl-project"
                  className="text-[12px] font-medium text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Описание проекта
                </Label>
                <Textarea
                  id="wl-project"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Какие курсы планируете запускать? Аудитория, формат, цели..."
                  rows={4}
                  className="bg-white border-[#E5E5E0] rounded-xl text-sm"
                  aria-invalid={!!errors.project || undefined}
                />
                {errors.project && (
                  <p
                    className="text-[11px] text-[#E65A5A]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {errors.project}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#1A1A2E] hover:bg-[#2A2A3E] text-white font-medium transition-transform active:scale-[0.98]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Записаться
              </Button>
              <p
                className="text-[11px] text-[#8A8A9A] text-center"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Никакого спама. Только новости о запуске.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {shownThisSession && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-[16px] bg-[#1A1A2E] text-white shadow-[0_8px_30px_rgba(26,26,46,0.35)] hover:shadow-[0_12px_40px_rgba(26,26,46,0.45)] transition-shadow active:scale-[0.98]"
          style={{ fontFamily: 'var(--font-body)' }}
          aria-label="Записаться в waitlist"
        >
          <span className="w-8 h-8 rounded-full bg-[#7C6AF7] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-left">
            <span className="block text-[13px] font-semibold leading-tight">
              Запишитесь в waitlist
            </span>
            <span className="block text-[11px] text-white/70 leading-tight">
              Ранний доступ к Unick
            </span>
          </span>
        </button>
      )}
    </>
  );
}
