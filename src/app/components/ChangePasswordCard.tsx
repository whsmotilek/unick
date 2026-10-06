import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';

/** Смена пароля из профиля (работает без почты: пользователь уже вошёл). */
export function ChangePasswordCard() {
  const { updatePassword, isDemoMode } = useAuth();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);

  if (isDemoMode) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Пароль — минимум 8 символов'); return; }
    if (password !== repeat) { toast.error('Пароли не совпадают'); return; }
    setBusy(true);
    const r = await updatePassword(password);
    setBusy(false);
    if (!r.success) { toast.error(r.error || 'Не удалось сменить пароль'); return; }
    setPassword(''); setRepeat('');
    toast.success('Пароль изменён');
  };

  return (
    <Card className="border-0 mt-6">
      <CardContent className="p-6">
        <h2 className="text-[16px] font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
          <KeyRound className="w-4 h-4 text-[#7C6AF7]" />Сменить пароль
        </h2>
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
          <div>
            <Label htmlFor="new-password">Новый пароль</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Минимум 8 символов" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="repeat-password">Ещё раз</Label>
            <Input id="repeat-password" type="password" autoComplete="new-password" value={repeat}
              onChange={e => setRepeat(e.target.value)} className="mt-1.5" />
          </div>
          <Button type="submit" disabled={busy || !password}>{busy ? 'Сохранение…' : 'Сменить'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
