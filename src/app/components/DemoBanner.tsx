import { useAuth } from '../context/AuthContext';

/** Предупреждение, что бэкенд не подключён и данные живут только в браузере. */
export function DemoBanner() {
  const { isDemoMode } = useAuth();
  if (!isDemoMode) return null;
  return (
    <div className="bg-[#FFF4D6] text-[#5A4500] text-[12px] leading-snug text-center px-4 py-1.5 text-balance" style={{ fontFamily: 'var(--font-body)' }}>
      <span className="sm:hidden">Демо-режим: данные хранятся только в этом браузере</span>
      <span className="hidden sm:inline">Демо-режим: данные сохраняются только в этом браузере и не видны другим пользователям</span>
    </div>
  );
}
