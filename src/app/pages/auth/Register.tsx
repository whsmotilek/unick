import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { GraduationCap, BookOpen, Check, MailCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { UserRole } from '../../types';
import { AuthShell, inputClass } from './AuthShell';
import { homeFor, safeNext } from '../../lib/navigation';

const benefits = {
  student: [
    'Уроки, задания и материалы курса в одном месте',
    'Обратная связь от автора по домашним заданиям',
    'Прогресс по каждому курсу',
    'Работает с телефона и компьютера',
  ],
  author: [
    'Курс собирается за час без технического специалиста',
    'Видео, тексты, файлы и домашние задания',
    'Ученики по ссылке-приглашению или бесплатной записи',
    'Проверка домашних заданий и прогресс учеников',
  ],
};

function Consent({ id }: { id: string }) {
  return (
    <div className="flex items-start gap-2">
      <input type="checkbox" id={id} className="mt-1 w-4 h-4" required />
      <label htmlFor={id} className="text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
        Принимаю{' '}
        <Link to="/legal/terms" target="_blank" className="text-[#7C6AF7] hover:underline">условия использования</Link>{' '}
        и даю{' '}
        <Link to="/legal/privacy" target="_blank" className="text-[#7C6AF7] hover:underline">согласие на обработку персональных данных</Link>
      </label>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  // Пришёл по приглашению в курс — регистрируем только ученика
  const studentOnly = !!next?.startsWith('/join/');
  const { register, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'author'>(params.get('role') === 'author' && !studentOnly ? 'author' : 'student');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) navigate(next || homeFor(user), { replace: true });
  }, [isAuthenticated, user, navigate, next]);

  const submit = async (role: UserRole) => {
    if (!name.trim()) { toast.error('Введите имя'); return; }
    if (!email.trim()) { toast.error('Введите email'); return; }
    if (password.length < 8) { toast.error('Пароль — минимум 8 символов'); return; }
    setIsLoading(true);
    const result = await register(name.trim(), email, password, role, {
      schoolName: role === 'author' ? schoolName.trim() : undefined,
      redirectPath: next || '/login',
    });
    setIsLoading(false);
    if (!result.success) { toast.error(result.error || 'Ошибка регистрации'); return; }
    if (result.needsConfirmation) { setConfirmEmail(email.trim()); return; }
    toast.success(role === 'author' ? 'Заявка автора отправлена' : 'Аккаунт создан');
  };

  if (confirmEmail) {
    return (
      <AuthShell subtitle="Остался один шаг">
        <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <CardContent className="p-8 text-center">
            <MailCheck className="w-12 h-12 mx-auto mb-4 text-[#7C6AF7]" strokeWidth={1.5} />
            <h2 className="text-[20px] font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Подтвердите email</h2>
            <p className="text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Мы отправили письмо на <b className="text-[#1A1A2E]">{confirmEmail}</b>. Перейдите по ссылке из письма — и вы окажетесь в аккаунте.
              Письмо может попасть в «Спам».
            </p>
          </CardContent>
        </Card>
      </AuthShell>
    );
  }

  const commonFields = (prefix: string) => (
    <>
      <div>
        <Label htmlFor={`${prefix}-name`}>Имя и фамилия</Label>
        <Input id={`${prefix}-name`} autoComplete="name" placeholder="Анна Иванова" required value={name} onChange={e => setName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <Label htmlFor={`${prefix}-email`}>Email</Label>
        <Input id={`${prefix}-email`} type="email" autoComplete="email" placeholder="your@email.com" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div>
        <Label htmlFor={`${prefix}-password`}>Пароль</Label>
        <Input id={`${prefix}-password`} type="password" autoComplete="new-password" placeholder="Минимум 8 символов" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
      </div>
    </>
  );

  const loginLink = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  return (
    <AuthShell subtitle={studentOnly ? 'Создайте аккаунт, чтобы получить доступ к курсу' : 'Создайте аккаунт за 2 минуты'} wide>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'student' | 'author')} className="w-full">
                {!studentOnly && (
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F5F4F2] p-1 rounded-xl">
                    <TabsTrigger value="student" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Я ученик
                    </TabsTrigger>
                    <TabsTrigger value="author" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Я автор
                    </TabsTrigger>
                  </TabsList>
                )}

                <TabsContent value="student">
                  <form onSubmit={e => { e.preventDefault(); submit('student'); }} className="space-y-4">
                    {commonFields('student')}
                    <Consent id="student-terms" />
                    <Button type="submit" className="w-full h-11 transition-transform active:scale-[0.98]" size="lg" disabled={isLoading}>
                      {isLoading ? 'Создание...' : 'Создать аккаунт'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="author">
                  <form onSubmit={e => { e.preventDefault(); submit('author'); }} className="space-y-4">
                    {commonFields('author')}
                    <div>
                      <Label htmlFor="author-school">Название проекта или школы <span className="text-[#8A8A9A]">(необязательно)</span></Label>
                      <Input id="author-school" placeholder="Школа акварели Анны" value={schoolName} onChange={e => setSchoolName(e.target.value)} className={inputClass} />
                    </div>
                    <Consent id="author-terms" />
                    <Button type="submit" className="w-full h-11 transition-transform active:scale-[0.98]" size="lg" disabled={isLoading}>
                      {isLoading ? 'Создание...' : 'Создать аккаунт автора'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                Уже есть аккаунт?{' '}
                <Link to={loginLink} className="text-[#7C6AF7] hover:underline font-medium">Войти</Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-[16px]" style={{ fontFamily: 'var(--font-heading)' }}>
                {activeTab === 'student' ? 'Для ученика' : 'Для автора'}
              </h3>
              <ul className="space-y-3">
                {benefits[activeTab].map((benefit, index) => (
                  <motion.li key={`${activeTab}-${index}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span style={{ fontFamily: 'var(--font-body)' }}>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthShell>
  );
}
