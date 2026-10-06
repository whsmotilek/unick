import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { AuthShell, inputClass, tapLink } from './AuthShell';
import { homeFor, safeNext } from '../../lib/navigation';

export function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const { login, isAuthenticated, user, isDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) navigate(next || homeFor(user), { replace: true });
  }, [isAuthenticated, user, navigate, next]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Введите email и пароль');
      return;
    }
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) toast.error(result.error || 'Ошибка входа');
  };

  const demoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    const result = await login(demoEmail, 'demo');
    setIsLoading(false);
    if (!result.success) toast.error(result.error || 'Ошибка входа');
  };

  const registerLink = next ? `/register?next=${encodeURIComponent(next)}` : '/register';

  return (
    <AuthShell subtitle="Войдите в свой аккаунт">
      <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <CardContent className="p-5 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[#1A1A2E]">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#1A1A2E]">Пароль</Label>
                {!isDemoMode && (
                  <Link to="/forgot-password" className={`${tapLink} text-[13px] text-[#7C6AF7] hover:underline`}>Забыли пароль?</Link>
                )}
              </div>
              <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required className={inputClass} />
            </div>
            <Button type="submit" className="w-full h-11 transition-transform active:scale-[0.98]" size="lg" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          {isDemoMode && (
            <div className="mt-5 rounded-xl bg-[#F5F4F2] p-4 text-center">
              <p className="text-[13px] sm:text-xs text-[#8A8A9A] mb-3 sm:mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                Демо-режим: данные хранятся только в этом браузере
              </p>
              <div className="flex flex-col min-[380px]:flex-row gap-2 justify-center">
                <Button type="button" variant="outline" size="sm" className="h-10 text-sm min-[380px]:flex-1 sm:flex-none" onClick={() => demoLogin('anna@example.com')} disabled={isLoading}>
                  Демо: автор
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-10 text-sm min-[380px]:flex-1 sm:flex-none" onClick={() => demoLogin('petr@example.com')} disabled={isLoading}>
                  Демо: ученик
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
            Нет аккаунта?{' '}
            <Link to={registerLink} className={`${tapLink} text-[#7C6AF7] hover:underline font-medium`}>Зарегистрироваться</Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
