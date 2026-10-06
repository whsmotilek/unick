import { useAuth } from '../context/AuthContext';

/** Предупреждение, что бэкенд не подключён и данные живут только в браузере. */
export function DemoBanner() {
  const { isDemoMode } = useAuth();
  if (!isDemoMode) return null;
  return (
    <div className="bg-[#FFF4D6] text-[#5A4500] text-[12px] text-center px-4 py-1.5" style={{ fontFamily: 'var(--font-body)' }}>
      Демо-режим: данные сохраняются только в этом браузере и не видны другим пользователям
    </div>
  );
}
