import { useEffect, useState } from 'react';
import markUrl from '@/assets/logo/logo-short-black.png';

/**
 * Загрузка внутри приложения в стиле стартового экрана (классы boot__* описаны в index.html).
 * Появляется с задержкой, чтобы быстрые загрузки не мигали.
 */
export function AppLoader({ fullscreen = false, delay = 180 }: { fullscreen?: boolean; delay?: number }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const t = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  return (
    <div
      role="status"
      aria-label="Загрузка"
      className={`flex items-center justify-center transition-opacity duration-300 ${fullscreen ? 'fixed inset-0 z-50 bg-[#F5F4F2]' : 'min-h-[60vh] w-full'} ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="boot__card">
        <div className="boot__ring" style={{ width: 72, height: 72, borderRadius: 22 }}>
          <div className="boot__tile" style={{ width: 72, height: 72, borderRadius: 22 }}>
            <img src={markUrl} alt="" style={{ width: 34 }} />
          </div>
        </div>
        <div className="boot__dots"><i /><i /><i /></div>
      </div>
    </div>
  );
}
