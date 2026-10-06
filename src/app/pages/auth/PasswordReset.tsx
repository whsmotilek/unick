import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { AuthShell, inputClass, tapLink } from './AuthShell';
import { homeFor } from '../../lib/navigation';

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await requestPasswordReset(email);
    setBusy(false);
    if (!r.success) { toast.error(r.error); return; }
    setSent(true);
  };

  return (
    <AuthShell subtitle="Восстановление пароля">
      <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <CardContent className="p-5 sm:p-8">
          {sent ? (
            <p className="text-sm text-[#1A1A2E] text-center" style={{ fontFamily: 'var(--font-body)' }}>
              Если аккаунт с адресом <b>{email}</b> существует, мы отправили на него ссылку для смены пароля.
              <span className="block mt-3 text-[#8A8A9A]">Письмо не пришло за 10 минут? Проверьте «Спам» или напишите автору курса — он поможет восстановить доступ.</span>
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email аккаунта</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </div>
              <Button type="submit" className="w-full h-11" disabled={busy}>{busy ? 'Отправка...' : 'Отправить ссылку'}</Button>
            </form>
          )}
          <div className="mt-6 text-center text-sm">
            <Link to="/login" className={`${tapLink} text-[#7C6AF7] hover:underline`}>Вернуться ко входу</Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

/** Сюда ведёт ссылка из письма: Supabase создаёт сессию восстановления, и пользователь задаёт новый пароль. */
export function ResetPassword() {
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Пароль — минимум 8 символов'); return; }
    setBusy(true);
    const r = await updatePassword(password);
    setBusy(false);
    if (!r.success) { toast.error(r.error); return; }
    toast.success('Пароль изменён');
    navigate(homeFor(user), { replace: true });
  };

  return (
    <AuthShell subtitle="Новый пароль">
      <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <CardContent className="p-5 sm:p-8">
          {!ready ? (
            <p className="text-sm text-[#8A8A9A] text-center">
              Ссылка недействительна или устарела. <Link to="/forgot-password" className={`${tapLink} text-[#7C6AF7] hover:underline`}>Запросить новую</Link>
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="password">Новый пароль</Label>
                <Input id="password" type="password" autoComplete="new-password" required value={password}
                  onChange={e => setPassword(e.target.value)} className={inputClass} />
              </div>
              <Button type="submit" className="w-full h-11" disabled={busy}>{busy ? 'Сохранение...' : 'Сохранить пароль'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
