import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Sparkles,
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  Award,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { homeFor } from '../../lib/navigation';
import { useWaitlist } from '../../context/WaitlistContext';
import logoWhiteFull from '@/assets/logo/logo-full-white.png';
import logoWhiteShort from '@/assets/logo/logo-short-white.png';
import logoBlackFull from '@/assets/logo/logo-full-black.png';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
};

export function Landing() {
  const { isAuthenticated, user, isDemoMode } = useAuth();
  const { open: openWaitlist } = useWaitlist();

  const features = [
    { icon: BookOpen, title: 'Конструктор курса', description: 'Модули и уроки: видео с YouTube, VK, Rutube, Kinescope или своим файлом, тексты, материалы для скачивания', color: 'bg-[#FFE5D9]', iconColor: 'text-[#FF6B6B]' },
    { icon: Award, title: 'Тесты и домашние задания', description: 'Автопроверка тестов, сдача ДЗ с файлами, проверка с комментарием и возвратом на доработку', color: 'bg-[#F5E642]', iconColor: 'text-[#5A4500]' },
    { icon: Users, title: 'Ученики по ссылке', description: 'Ссылка-приглашение с лимитом мест, добавление по email, свободная запись — доступ только у тех, кого вы пустили', color: 'bg-[#C5E8A0]', iconColor: 'text-[#2D5016]' },
    { icon: BarChart3, title: 'Прогресс учеников', description: 'Кто на каком уроке, где отваливаются, какие задания ждут проверки', color: 'bg-[#B8D8F8]', iconColor: 'text-[#0D3B66]' },
    { icon: MessageSquare, title: 'Связь с учениками', description: 'Переписка с учениками внутри платформы, ответы на домашние задания', color: 'bg-[#F9D0E8]', iconColor: 'text-[#8B2F5C]' },
    { icon: Sparkles, title: 'Уроки по порядку', description: 'Можно открывать уроки последовательно: следующий — после прохождения предыдущего и принятого задания', color: 'bg-[#EDE9FF]', iconColor: 'text-[#7C6AF7]' },
  ];

  const steps = [
    { title: 'Соберите курс', text: 'Добавьте модули и уроки: видео, текст, тест или задание. Без программиста и дизайнера.' },
    { title: 'Пригласите учеников', text: 'Отправьте ссылку в чат или рассылку. Ученик регистрируется и сразу попадает в курс.' },
    { title: 'Ведите обучение', text: 'Проверяйте домашние задания, отвечайте на вопросы и смотрите прогресс каждого.' },
  ];

  const dashboardLink = user ? homeFor(user) : '/register';

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Navigation */}
      <nav className="bg-[#1A1A2E] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={logoWhiteFull} alt="Unick" className="h-6" />
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to={dashboardLink}>
                  <Button className="bg-white text-[#1A1A2E] hover:bg-white/90 transition-transform active:scale-[0.98]">
                    Личный кабинет
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-white hover:bg-white/10 transition-colors">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-white text-[#1A1A2E] hover:bg-white/90 transition-transform active:scale-[0.98]">
                      Создать курс
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
              <Badge variant="default" className="mb-6 px-4 py-2">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Пилотный запуск
              </Badge>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[48px] md:text-[56px] font-bold text-[#1A1A2E] mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Создайте курс и ведите учеников
              <br />
              <span className="text-[#7C6AF7]">в одном месте</span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[16px] md:text-[18px] text-[#8A8A9A] mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Соберите курс из видео, текстов, тестов и домашних заданий, пригласите учеников по ссылке
              и проверяйте их работы — без технического специалиста.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link to="/register">
                <Button size="lg" className="text-base px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Создать курс
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {isDemoMode && (
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    Демо-вход
                  </Button>
                </Link>
              )}
              <Button
                size="lg"
                onClick={openWaitlist}
                className="text-base px-8 bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white hover:from-[#6B59E5] hover:to-[#8A79E7] shadow-[0_8px_24px_rgba(124,106,247,0.35)] hover:shadow-[0_12px_30px_rgba(124,106,247,0.45)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Предзапись
              </Button>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-[#8A8A9A]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {['Курс собирается за час', 'Работает с телефона', 'Помогаем запустить первый курс'].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C5E8A0]" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-[#F9D0E8] rounded-[32px] opacity-40 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#B8D8F8] rounded-[40px] opacity-40 blur-3xl pointer-events-none"></div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Что уже умеет Unick
            </h2>
            <p className="text-[16px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Всё, чтобы провести курс: от первого урока до проверки последнего задания
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                {...fadeUp}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className={`${feature.color} border-0 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-default`}>
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center mb-4">
                      <feature.icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[18px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-[#1A1A2E]/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-[#F5F4F2]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Как это работает
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div key={step.title} {...fadeUp} transition={{ duration: 0.4, delay: index * 0.1 }}>
                <Card className="border-0 h-full">
                  <CardContent className="p-6">
                    <span className="w-10 h-10 rounded-xl bg-[#7C6AF7] text-white font-bold flex items-center justify-center mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{index + 1}</span>
                    <h3 className="text-[18px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{step.title}</h3>
                    <p className="text-[13px] text-[#1A1A2E]/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{step.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#F5F4F2]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <Card className="bg-gradient-to-br from-[#1A1A2E] to-[#2A2A3E] border-0 text-white overflow-hidden relative">
              <CardContent className="p-12 relative z-10">
                <h2 className="text-[32px] md:text-[40px] font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Запустим ваш первый курс вместе
                </h2>
                <p className="text-[16px] text-white/80 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
                  Мы в пилотном режиме и лично помогаем первым авторам: переносим материалы, настраиваем курс, собираем обратную связь
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/register?role=author">
                    <Button size="lg" className="bg-white text-[#1A1A2E] hover:bg-white/90 text-base px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      Создать курс
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" onClick={openWaitlist} className="bg-transparent text-white border-white/30 hover:bg-white/10 text-base px-8">
                    Оставить заявку на пилот
                  </Button>
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C6AF7] rounded-full opacity-10 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#9B8AF9] rounded-full opacity-10 blur-3xl pointer-events-none"></div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A2E] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={logoWhiteFull} alt="Unick" className="h-5" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-white/50 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              <Link to="/legal/privacy" className="hover:text-white">Политика обработки персональных данных</Link>
              <Link to="/legal/terms" className="hover:text-white">Условия использования</Link>
              <span>© 2026 Unick</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
