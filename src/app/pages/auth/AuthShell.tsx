import { ReactNode } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import logoBlackFull from '@/assets/logo/logo-full-black.png';

export function AuthShell({ subtitle, children, wide = false }: { subtitle: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`w-full ${wide ? 'max-w-5xl' : 'max-w-md'}`}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center mb-4">
            <img src={logoBlackFull} alt="Unick" className="h-8" />
          </Link>
          <p className="text-[#8A8A9A] text-[13px]" style={{ fontFamily: 'var(--font-body)' }}>{subtitle}</p>
        </div>
        {children}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-[#8A8A9A] hover:text-[#1A1A2E] transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
            ← Вернуться на главную
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export const inputClass = 'mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10';
