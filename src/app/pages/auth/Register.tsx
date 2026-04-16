import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, BookOpen, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import logo from '@/assets/d1f4fdcdf2cbedfd13a90150fb918f6e78560c92.png';

export function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [studentSurname, setStudentSurname] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPassword, setAuthorPassword] = useState('');

  if (isAuthenticated && user) {
    const redirectMap: Record<string, string> = {
      author: '/author',
      student: '/student',
      curator: '/curator',
      admin: '/admin',
    };
    navigate(redirectMap[user.role] || '/');
    return null;
  }

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${studentName.trim()} ${studentSurname.trim()}`.trim();
    if (!name) { toast.error('Введите имя'); return; }
    if (!studentEmail.trim()) { toast.error('Введите email'); return; }
    if (studentPassword.length < 6) { toast.error('Пароль минимум 6 символов'); return; }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = register(name, studentEmail, studentPassword, 'student');
    setIsLoading(false);

    if (result.success) {
      toast.success('Аккаунт создан!');
    } else {
      toast.error(result.error || 'Ошибка регистрации');
    }
  };

  const handleAuthorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) { toast.error('Введите имя'); return; }
    if (!authorEmail.trim()) { toast.error('Введите email'); return; }
    if (authorPassword.length < 6) { toast.error('Пароль минимум 6 символов'); return; }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = register(authorName, authorEmail, authorPassword, 'author');
    setIsLoading(false);

    if (result.success) {
      toast.success('Школа создана!');
    } else {
      toast.error(result.error || 'Ошибка регистрации');
    }
  };

  const benefits = {
    student: [
      'Удобный интерфейс обучения',
      'Отслеживание прогресса',
      'Система достижений',
      'Чаты с кураторами',
      'Сертификаты об окончании'
    ],
    author: [
      '14 дней бесплатно',
      'AI-аналитика',
      'Конструктор курсов',
      'Управление командой',
      'Белый лейбл',
      'Прием платежей'
    ]
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-5xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src={logo} alt="Unick" className="w-10 h-10" />
            <span className="font-bold text-2xl text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
              unick
            </span>
          </Link>
          <p className="text-[#8A8A9A] text-[13px]" style={{ fontFamily: 'var(--font-body)' }}>
            Создайте аккаунт за 2 минуты
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <CardContent className="p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F5F4F2] p-1 rounded-xl">
                    <TabsTrigger
                      value="student"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Я ученик
                    </TabsTrigger>
                    <TabsTrigger
                      value="author"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Я автор
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="student">
                    <form onSubmit={handleStudentRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="student-name">Имя</Label>
                          <Input id="student-name" placeholder="Иван" required value={studentName} onChange={e => setStudentName(e.target.value)} className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10" />
                        </div>
                        <div>
                          <Label htmlFor="student-surname">Фамилия</Label>
                          <Input id="student-surname" placeholder="Иванов" required value={studentSurname} onChange={e => setStudentSurname(e.target.value)} className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="student-email">Email</Label>
                        <Input id="student-email" type="email" placeholder="your@email.com" required value={studentEmail} onChange={e => setStudentEmail(e.target.value)} className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10" />
                      </div>
                      <div>
                        <Label htmlFor="student-password">Пароль</Label>
                        <Input id="student-password" type="password" placeholder="Минимум 6 символов" required value={studentPassword} onChange={e => setStudentPassword(e.target.value)} className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10" />
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="student-terms" className="mt-1 w-4 h-4" required />
                        <label htmlFor="student-terms" className="text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          Я согласен с{' '}
                          <a href="#" className="text-[#7C6AF7] hover:underline">Условиями использования</a>{' '}и{' '}
                          <a href="#" className="text-[#7C6AF7] hover:underline">Политикой конфиденциальности</a>
                        </label>
                      </div>
                      <Button type="submit" className="w-full h-11 transition-transform active:scale-[0.98]" size="lg" disabled={isLoading}>
                        {isLoading ? 'Создание...' : 'Создать аккаунт ученика'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="author">
                    <form onSubmit={handleAuthorRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="author-name">Ваше имя</Label>
                        <Input id="author-name" placeholder="Анна Иванова" required value={authorName} onChange={e => setAuthorName(e.target.value)} className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10" />
                      </div>
                      <div>
                        <Label htmlFor="author-email">Email</Label>
                        <Input id="author-email" type="email" placeholder="your@email.com" required value={authorEmail} onChange={e => setAuthorEmail(e.target.value)} className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10" />
                      </div>
                      <div>
                        <Label htmlFor="author-password">Пароль</Label>
                        <Input id="author-password" type="password" placeholder="Минимум 6 символов" required value={authorPassword} onChange={e => setAuthorPassword(e.target.value)} className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10" />
                      </div>
                      <div className="bg-[#EDE9FF] border border-[#7C6AF7]/20 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#1A1A2E] mb-1 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#7C6AF7]" />
                          Бесплатный пробный период
                        </p>
                        <p className="text-xs text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          14 дней бесплатного доступа ко всем функциям. Кредитная карта не требуется.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="author-terms" className="mt-1 w-4 h-4" required />
                        <label htmlFor="author-terms" className="text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          Я согласен с{' '}
                          <a href="#" className="text-[#7C6AF7] hover:underline">Условиями использования</a>{' '}и{' '}
                          <a href="#" className="text-[#7C6AF7] hover:underline">Политикой конфиденциальности</a>
                        </label>
                      </div>
                      <Button type="submit" className="w-full h-11 transition-transform active:scale-[0.98]" size="lg" disabled={isLoading}>
                        {isLoading ? 'Создание...' : 'Создать школу бесплатно'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  Уже есть аккаунт?{' '}
                  <Link to="/login" className="text-[#7C6AF7] hover:underline font-medium">Войти</Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-[16px]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {activeTab === 'student' ? 'Преимущества для ученика' : 'Преимущества для автора'}
                </h3>
                <ul className="space-y-3">
                  {benefits[activeTab as keyof typeof benefits].map((benefit, index) => (
                    <motion.li
                      key={`${activeTab}-${index}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span style={{ fontFamily: 'var(--font-body)' }}>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0">
              <CardContent className="p-6">
                <h4 className="font-semibold text-sm mb-3 text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Защита данных
                </h4>
                <p className="text-xs text-[#8A8A9A] mb-3 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  Мы используем современные технологии шифрования для защиты ваших данных.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#8A8A9A]">
                  <div className="w-2 h-2 bg-[#C5E8A0] rounded-full"></div>
                  <span style={{ fontFamily: 'var(--font-body)' }}>SSL Шифрование</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-[#8A8A9A] hover:text-[#1A1A2E] transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
            ← Вернуться на главную
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
