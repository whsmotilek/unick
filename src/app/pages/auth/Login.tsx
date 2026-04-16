import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, BookOpen } from 'lucide-react';
import logo from 'figma:asset/d1f4fdcdf2cbedfd13a90150fb918f6e78560c92.png';

export function Login() {
  const navigate = useNavigate();
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPassword, setAuthorPassword] = useState('');

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/student');
  };

  const handleAuthorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/author');
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
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
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F5F4F2] p-1 rounded-xl">
                <TabsTrigger 
                  value="student"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Ученик
                </TabsTrigger>
                <TabsTrigger 
                  value="author"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Автор
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="student-email" className="text-[#1A1A2E]">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="your@email.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
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
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      required
                      className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded w-4 h-4" />
                      <span className="text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                        Запомнить меня
                      </span>
                    </label>
                    <a href="#" className="text-[#7C6AF7] hover:underline" style={{ fontFamily: 'var(--font-body)' }}>
                      Забыли пароль?
                    </a>
                  </div>
                  <Button type="submit" className="w-full h-11" size="lg">
                    Войти как ученик
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="author">
                <form onSubmit={handleAuthorLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="author-email" className="text-[#1A1A2E]">Email</Label>
                    <Input
                      id="author-email"
                      type="email"
                      placeholder="your@email.com"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
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
                      value={authorPassword}
                      onChange={(e) => setAuthorPassword(e.target.value)}
                      required
                      className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded w-4 h-4" />
                      <span className="text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                        Запомнить меня
                      </span>
                    </label>
                    <a href="#" className="text-[#7C6AF7] hover:underline" style={{ fontFamily: 'var(--font-body)' }}>
                      Забыли пароль?
                    </a>
                  </div>
                  <Button type="submit" className="w-full h-11" size="lg">
                    Войти как автор
                  </Button>
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
          <Link to="/" className="text-sm text-[#8A8A9A] hover:text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
