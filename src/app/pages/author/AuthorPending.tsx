import { useEffect, useState } from 'react';
import { Clock, XCircle, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { AuthShell } from '../auth/AuthShell';

/** Экран автора, чья заявка ещё не одобрена администратором. */
export function AuthorPending() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const rejected = user?.authorStatus === 'rejected';

  // Проверяем статус раз в 30 секунд — после одобрения кабинет откроется сам
  useEffect(() => {
    if (rejected) return;
    const t = window.setInterval(() => { refreshProfile(); }, 30_000);
    return () => window.clearInterval(t);
  }, [rejected, refreshProfile]);

  const check = async () => {
    setChecking(true);
    await refreshProfile();
    setChecking(false);
  };

  return (
    <AuthShell subtitle={rejected ? 'Заявка автора' : 'Заявка автора на рассмотрении'}>
      <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <CardContent className="p-5 sm:p-8 text-center space-y-4">
          {rejected
            ? <XCircle className="w-12 h-12 mx-auto text-[#FF6B6B]" strokeWidth={1.5} />
            : <Clock className="w-12 h-12 mx-auto text-[#7C6AF7]" strokeWidth={1.5} />}
          <h1 className="text-[20px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
            {rejected ? 'Заявка отклонена' : 'Спасибо за регистрацию!'}
          </h1>
          <p className="text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
            {rejected
              ? 'Сейчас мы не можем открыть вам кабинет автора. Если это ошибка — напишите нам, и мы разберёмся.'
              : <>Unick работает в режиме пилота, и мы подключаем авторов вручную. Мы проверим заявку
                  {user?.email ? <> для <b className="text-[#1A1A2E] [overflow-wrap:anywhere]">{user.email}</b></> : null} и откроем доступ
                  к созданию курсов — эта страница обновится сама.</>}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            {!rejected && (
              <Button variant="outline" onClick={check} disabled={checking} className="w-full sm:w-auto h-11 sm:h-10">
                <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />Проверить статус
              </Button>
            )}
            <Button variant="ghost" onClick={async () => { await logout(); navigate('/'); }} className="w-full sm:w-auto h-11 sm:h-10">
              <LogOut className="w-4 h-4 mr-2" />Выйти
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
