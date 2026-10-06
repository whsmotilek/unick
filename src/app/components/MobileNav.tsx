import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import logoWhiteFull from '@/assets/logo/logo-full-white.png';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

interface MobileNavProps {
  navigation: NavItem[];
  rootHref: string;
  footer?: React.ReactNode;
  /** Доп. элементы в верхней панели (например, колокольчик уведомлений) */
  actions?: React.ReactNode;
}

export function MobileNav({ navigation, rootHref, footer, actions }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  // Активен сам раздел и его вложенные страницы (кроме корня кабинета — он подсвечивается только сам)
  const isActive = (path: string) =>
    location.pathname === path || (path !== rootHref && location.pathname.startsWith(path + '/'));

  // Закрываем меню при любой смене адреса (в том числе «назад» в браузере)
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Пока меню открыто: страница под ним не прокручивается, Esc закрывает
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-[#1A1A2E] pt-[env(safe-area-inset-top)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))]">
        <div className="flex items-center justify-between h-14">
          <Link to={rootHref} className="flex items-center py-2 pr-2" aria-label="На главную">
            <img src={logoWhiteFull} alt="Unick" className="h-5" />
          </Link>
          <div className="flex items-center gap-1">
            {actions}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-white w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Открыть меню"
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-50"
              aria-hidden="true"
            />
            <motion.div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Меню"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="md:hidden fixed inset-y-0 left-0 w-[min(280px,85vw)] bg-[#1A1A2E] z-50 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] overscroll-contain"
            >
              <div className="flex items-center justify-between pl-5 pr-3 h-14 shrink-0">
                <Link to={rootHref} onClick={() => setOpen(false)} className="flex items-center py-2">
                  <img src={logoWhiteFull} alt="Unick" className="h-6" />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-white w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label="Закрыть меню"
                  autoFocus
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overscroll-contain">
                {navigation.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`
                        relative flex items-center gap-3 px-4 min-h-11 rounded-xl
                        transition-colors duration-200 text-[15px] font-medium
                        ${active ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10 active:bg-white/10'}
                      `}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {active && <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-[#7C6AF7]" aria-hidden="true" />}
                      <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {footer && <div className="p-4 border-t border-white/10 shrink-0">{footer}</div>}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
