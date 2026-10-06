import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useDataStore } from '../store/DataStore';
import { AuthShell } from './auth/AuthShell';
import type { InviteInfo } from '../types';

/** Страница по ссылке-приглашению: показывает курс, после входа/регистрации выдаёт доступ. */
export function JoinCourse() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const { inviteInfo, redeemInvite } = useDataStore();
  const [info, setInfo] = useState<InviteInfo | null | undefined>(undefined);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    inviteInfo(code).then(r => { if (!cancelled) setInfo(r); }).catch(() => { if (!cancelled) setInfo(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const join = async () => {
    setJoining(true);
    try {
      const courseId = await redeemInvite(code);
      toast.success('Доступ к курсу открыт');
      navigate(`/student/courses/${courseId}`, { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось вступить в курс');
      setJoining(false);
    }
  };

  // Ученик вошёл и приглашение действительно — вступаем автоматически
  useEffect(() => {
    if (user?.role === 'student' && info?.valid && !joining) join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, info?.valid]);

  const next = encodeURIComponent(`/join/${code}`);

  if (info === undefined || authLoading) {
    return <AuthShell subtitle="Приглашение в курс"><div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#7C6AF7]" /></div></AuthShell>;
  }

  return (
    <AuthShell subtitle="Приглашение в курс">
      <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
        {!info ? (
          <CardContent className="p-8 text-center">
            <p className="font-semibold text-[#1A1A2E] mb-2">Приглашение не найдено</p>
            <p className="text-sm text-[#8A8A9A]">Проверьте ссылку или попросите автора курса прислать новую.</p>
          </CardContent>
        ) : (
          <>
            {info.cover ? <img src={info.cover} alt="" className="w-full h-40 object-cover" /> : (
              <div className="h-24 bg-[#EDE9FF] flex items-center justify-center"><BookOpen className="w-10 h-10 text-[#7C6AF7]" strokeWidth={1.5} /></div>
            )}
            <CardContent className="p-6">
              <p className="text-xs text-[#8A8A9A] mb-1">{info.schoolName}</p>
              <h1 className="text-[20px] font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{info.title}</h1>
              {info.description && <p className="text-sm text-[#1A1A2E]/70 mb-3 line-clamp-4 whitespace-pre-line">{info.description}</p>}
              <p className="text-xs text-[#8A8A9A] mb-5">{info.lessonsCount} уроков</p>

              {!info.valid ? (
                <p className="text-sm text-[#8B2F2F] bg-[#FFE5E5] rounded-xl px-4 py-3">
                  Приглашение больше не действует: закончились места, истёк срок или курс снят с публикации. Напишите автору.
                </p>
              ) : !user ? (
                <div className="space-y-2">
                  <Button asChild className="w-full h-11"><Link to={`/register?next=${next}`}>Зарегистрироваться и начать</Link></Button>
                  <Button asChild variant="outline" className="w-full h-11"><Link to={`/login?next=${next}`}>У меня уже есть аккаунт</Link></Button>
                </div>
              ) : user.role !== 'student' ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#8A8A9A]">Вы вошли как {user.role === 'author' ? 'автор' : 'сотрудник школы'} ({user.email}). Чтобы пройти курс, войдите под аккаунтом ученика.</p>
                  <Button variant="outline" className="w-full" onClick={() => logout()}>Выйти и войти как ученик</Button>
                </div>
              ) : (
                <Button className="w-full h-11" onClick={join} disabled={joining}>
                  {joining ? 'Открываем доступ…' : 'Начать обучение'}
                </Button>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </AuthShell>
  );
}
