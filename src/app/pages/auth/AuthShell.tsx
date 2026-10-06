import { ReactNode } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import logoBlackFull from '@/assets/logo/logo-full-black.png';

export function AuthShell({ subtitle, children, wide = false }: { subtitle: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F5F4F2] flex items-center justify-center px-4 py-8 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`w-full ${wide ? 'max-w-5xl' : 'max-w-md'}`}
      >
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center mb-3 sm:mb-4">
            <img src={logoBlackFull} alt="Unick" className="h-7 sm:h-8" />
          </Link>
          <p className="text-[#8A8A9A] text-[14px] sm:text-[13px]" style={{ fontFamily: 'var(--font-body)' }}>{subtitle}</p>
        </div>
        {children}
        <div className="mt-4 sm:mt-6 text-center">
          <Link to="/" className="inline-flex items-center min-h-11 px-3 text-sm text-[#8A8A9A] hover:text-[#1A1A2E] transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
            ← Вернуться на главную
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// text-base на телефоне: при шрифте меньше 16px iOS увеличивает страницу при фокусе
export const inputClass = 'mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10 text-base sm:text-sm';

/** Текстовая ссылка с удобной зоной нажатия на телефоне (без сдвига вёрстки) */
export const tapLink = 'inline-flex items-center min-h-10 -my-2 px-1 -mx-1';
