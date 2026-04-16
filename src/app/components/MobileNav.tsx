import { useState } from 'react';
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
}

export function MobileNav({ navigation, rootHref, footer }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-[#1A1A2E] px-4 py-3 sticky top-0 z-40">
        <Link to={rootHref} className="flex items-center">
          <img src={logoWhiteFull} alt="Unick" className="h-5" />
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
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
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-[260px] bg-[#1A1A2E] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4">
                <Link to={rootHref} onClick={() => setOpen(false)} className="flex items-center">
                  <img src={logoWhiteFull} alt="Unick" className="h-6" />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {navigation.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg
                        transition-all duration-200 text-sm font-medium
                        ${active ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}
                      `}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      <item.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {footer && <div className="p-4 border-t border-white/10">{footer}</div>}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
