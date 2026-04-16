import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, BookOpen, Check, Sparkles } from 'lucide-react';
import logo from 'figma:asset/d1f4fdcdf2cbedfd13a90150fb918f6e78560c92.png';

export function Register() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/student');
  };

  const handleAuthorRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/author');
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
      <div className="w-full max-w-5xl">
        {/* Logo */}
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
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <CardContent className="p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F5F4F2] p-1 rounded-xl">
                    <TabsTrigger 
                      value="student"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Я ученик
                    </TabsTrigger>
                    <TabsTrigger 
                      value="author"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
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
                          <Input 
                            id="student-name" 
                            placeholder="Иван" 
                            required 
                            className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="student-surname">Фамилия</Label>
                          <Input 
                            id="student-surname" 
                            placeholder="Иванов" 
                            required 
                            className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="student-email">Email</Label>
                        <Input 
                          id="student-email" 
                          type="email" 
                          placeholder="your@email.com" 
                          required 
                          className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-password">Пароль</Label>
                        <Input 
                          id="student-password" 
                          type="password" 
                          placeholder="Минимум 8 символов" 
                          required 
                          className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                        />
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="student-terms" className="mt-1 w-4 h-4" required />
                        <label htmlFor="student-terms" className="text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          Я согласен с{' '}
                          <a href="#" className="text-[#7C6AF7] hover:underline">
                            Условиями использования
                          </a>{' '}
                          и{' '}
                          <a href="#" className="text-[#7C6AF7] hover:underline">
                            Политикой конфиденциальности
                          </a>
                        </label>
                      </div>
                      <Button type="submit" className="w-full h-11" size="lg">
                        Создать аккаунт ученика
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="author">
                    <form onSubmit={handleAuthorRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="author-name">Ваше имя</Label>
                        <Input 
                          id="author-name" 
                          placeholder="Анна Иванова" 
                          required 
                          className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-name">Название школы</Label>
                        <Input 
                          id="school-name" 
                          placeholder="Школа дизайна" 
                          required 
                          className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="author-email">Email</Label>
                        <Input 
                          id="author-email" 
                          type="email" 
                          placeholder="your@email.com" 
                          required 
                          className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="author-password">Пароль</Label>
                        <Input 
                          id="author-password" 
                          type="password" 
                          placeholder="Минимум 8 символов" 
                          required 
                          className="mt-1.5 h-11 rounded-xl border-[#1A1A2E]/10"
                        />
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
                          <a href="#" className="text-[#7C6AF7] hover:underline">
                            Условиями использования
                          </a>{' '}
                          и{' '}
                          <a href="#" className="text-[#7C6AF7] hover:underline">
                            Политикой конфиденциальности
                          </a>
                        </label>
                      </div>
                      <Button type="submit" className="w-full h-11" size="lg">
                        Создать школу бесплатно
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-sm text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  Уже есть аккаунт?{' '}
                  <Link to="/login" className="text-[#7C6AF7] hover:underline font-medium">
                    Войти
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-[16px]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {activeTab === 'student' ? 'Преимущества для ученика' : 'Преимущества для автора'}
                </h3>
                <ul className="space-y-3">
                  {benefits[activeTab as keyof typeof benefits].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span style={{ fontFamily: 'var(--font-body)' }}>{benefit}</span>
                    </li>
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
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-[#8A8A9A] hover:text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
