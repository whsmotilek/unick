import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import logo from '@/assets/d1f4fdcdf2cbedfd13a90150fb918f6e78560c92.png';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }
    if (!password.trim()) {
      toast.error('Введите пароль');
      return;
    }

    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 400));

    const result = login(email, password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Добро пожаловать!');
    } else {
      toast.error(result.error || 'Ошибка входа');
    }
  };

  const demoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo');
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src={logo} alt="Unick" className="w-10 h-10" />
            <span className="font-bold text-2xl text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
              unick
            </span>
          </Link>
          <p className="text-[#8A8A9A] text-[13px]" style={{ fontFamily: 'var(--font-body)' }}>
            Войдите в свой аккаунт
          </p>
        </div>

        <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F5F4F2] p-1 rounded-xl">
                <TabsTrigger
                  value="student"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Ученик
                </TabsTrigger>
                <TabsTrigger
                  value="author"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Автор
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="student-email" className="text-[#1A1A2E]">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-password" className="text-[#1A1A2E]">Пароль</Label>
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 transition-transform active:scale-[0.98]" size="lg" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти как ученик'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => demoLogin('petr@example.com')}
                    className="w-full text-center text-xs text-[#7C6AF7] hover:underline cursor-pointer"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Демо-вход (petr@example.com)
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="author">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="author-email" className="text-[#1A1A2E]">Email</Label>
                    <Input
                      id="author-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author-password" className="text-[#1A1A2E]">Пароль</Label>
                    <Input
                      id="author-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 transition-transform active:scale-[0.98]" size="lg" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти как автор'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => demoLogin('anna@example.com')}
                    className="w-full text-center text-xs text-[#7C6AF7] hover:underline cursor-pointer"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Демо-вход (anna@example.com)
                  </button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Нет аккаунта?{' '}
              <Link to="/register" className="text-[#7C6AF7] hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-[#8A8A9A] hover:text-[#1A1A2E] transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
            ← Вернуться на главную
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
