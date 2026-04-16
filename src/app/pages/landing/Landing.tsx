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
  Star,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import logoWhiteFull from '@/assets/logo/logo-full-white.png';
import logoWhiteShort from '@/assets/logo/logo-short-white.png';
import logoBlackFull from '@/assets/logo/logo-full-black.png';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
};

export function Landing() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    { icon: Sparkles, title: 'AI-Аналитика', description: 'Умная система анализирует обучение и подсказывает, как улучшить курсы', color: 'bg-[#EDE9FF]', iconColor: 'text-[#7C6AF7]' },
    { icon: BookOpen, title: 'Конструктор курсов', description: 'Создавайте курсы любой сложности с видео, тестами и домашками', color: 'bg-[#FFE5D9]', iconColor: 'text-[#FF6B6B]' },
    { icon: Users, title: 'Управление потоками', description: 'Запускайте потоки, группы, назначайте кураторов', color: 'bg-[#C5E8A0]', iconColor: 'text-[#2D5016]' },
    { icon: BarChart3, title: 'Глубокая аналитика', description: 'Отслеживайте прогресс, точки отвала, риски оттока', color: 'bg-[#B8D8F8]', iconColor: 'text-[#0D3B66]' },
    { icon: MessageSquare, title: 'Коммуникации', description: 'Чаты, рассылки, триггерные цепочки, интеграция с Telegram', color: 'bg-[#F9D0E8]', iconColor: 'text-[#8B2F5C]' },
    { icon: Award, title: 'Геймификация', description: 'Уровни, достижения, сертификаты для мотивации учеников', color: 'bg-[#F5E642]', iconColor: 'text-[#5A5000]' },
  ];

  const plans = [
    { name: 'Starter', price: '2,990', period: '/мес', description: 'Для начинающих авторов', features: ['До 100 активных учеников', '3 курса', '10 ГБ хранилища', 'Базовая аналитика', '1 куратор', 'Email поддержка'], popular: false, color: 'bg-white' },
    { name: 'Pro', price: '7,990', period: '/мес', description: 'Для растущих школ', features: ['До 500 учеников', 'Неограниченно курсов', '50 ГБ хранилища', 'AI-инсайты', '5 кураторов', 'Приоритетная поддержка', 'Свой брендинг', 'API доступ'], popular: true, color: 'bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9]' },
    { name: 'Enterprise', price: 'Договорная', period: '', description: 'Для крупных организаций', features: ['Неограниченно учеников', 'Неограниченно курсов', 'Неограниченное хранилище', 'Кастомные AI-модели', 'Неограниченная команда', 'Выделенная поддержка', 'White-label', 'SLA и безопасность'], popular: false, color: 'bg-white' },
  ];

  const testimonials = [
    { name: 'Анна Иванова', role: 'Основатель школы дизайна', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', content: 'Unick помог нам вырасти с 50 до 500+ учеников. AI-инсайты просто волшебные!', rating: 5 },
    { name: 'Петр Смирнов', role: 'Создатель курсов', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', content: 'Лучшая LMS, которой я пользовался. Интуитивно, мощно и красиво!', rating: 5 },
    { name: 'Мария К.', role: 'Директор по образованию', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', content: 'Управление потоками и командные роли экономят нам часы каждую неделю!', rating: 5 },
  ];

  const dashboardLink = user
    ? { author: '/author', student: '/student', curator: '/curator', admin: '/admin' }[user.role] || '/'
    : '/register';

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
                      Начать бесплатно
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
                Платформа с AI-аналитикой
              </Badge>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[48px] md:text-[56px] font-bold text-[#1A1A2E] mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Создайте свою онлайн-школу
              <br />
              <span className="text-[#7C6AF7]">с AI-инсайтами</span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[16px] md:text-[18px] text-[#8A8A9A] mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Создавайте курсы, управляйте учениками, отслеживайте прогресс и развивайте образовательный
              бизнес с умной аналитикой и автоматизацией.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link to="/register">
                <Button size="lg" className="text-base px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Попробовать бесплатно
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-base px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Демо-вход
                </Button>
              </Link>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-[#8A8A9A]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {['14 дней бесплатно', 'Без кредитной карты', 'Отмена в любой момент'].map((text) => (
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
              Всё что вам нужно
            </h2>
            <p className="text-[16px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Мощные функции для создания, управления и масштабирования вашей онлайн-школы
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

      {/* Testimonials */}
      <section className="py-20 bg-[#F5F4F2]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Нам доверяют педагоги
            </h2>
            <p className="text-[16px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Присоединяйтесь к тысячам школ, которые уже используют Unick
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div key={index} {...fadeUp} transition={{ duration: 0.4, delay: index * 0.1 }}>
                <Card className="border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#F5E642] fill-[#F5E642]" />
                      ))}
                    </div>
                    <p className="text-[13px] text-[#1A1A2E] mb-6 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      "{t.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>{t.name}</p>
                        <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Простые и понятные цены
            </h2>
            <p className="text-[16px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Выберите идеальный план для вашей школы
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, index) => (
              <motion.div key={index} {...fadeUp} transition={{ duration: 0.4, delay: index * 0.1 }}>
                <Card className={`${plan.color} ${plan.popular ? 'text-white border-0 shadow-[0_8px_30px_rgba(124,106,247,0.3)] md:scale-105' : 'border-0'} transition-all duration-300 hover:shadow-lg`}>
                  <CardContent className="p-8">
                    {plan.popular && (
                      <Badge className="mb-4 bg-white/20 text-white border-0">Популярный</Badge>
                    )}
                    <h3 className={`text-[24px] font-bold mb-2 ${plan.popular ? 'text-white' : 'text-[#1A1A2E]'}`} style={{ fontFamily: 'var(--font-heading)' }}>{plan.name}</h3>
                    <p className={`text-[13px] mb-6 ${plan.popular ? 'text-white/80' : 'text-[#8A8A9A]'}`} style={{ fontFamily: 'var(--font-body)' }}>{plan.description}</p>
                    <div className="mb-6">
                      <span className={`text-[48px] font-bold ${plan.popular ? 'text-white' : 'text-[#1A1A2E]'}`} style={{ fontFamily: 'var(--font-heading)' }}>{plan.price}</span>
                      {plan.period && <span className={`text-[16px] ${plan.popular ? 'text-white/70' : 'text-[#8A8A9A]'}`} style={{ fontFamily: 'var(--font-body)' }}>{plan.period}</span>}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-[#C5E8A0]'}`} strokeWidth={2} />
                          <span className={`text-[13px] ${plan.popular ? 'text-white/90' : 'text-[#1A1A2E]'}`} style={{ fontFamily: 'var(--font-body)' }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register">
                      <Button className={`w-full transition-transform active:scale-[0.98] ${plan.popular ? 'bg-white text-[#7C6AF7] hover:bg-white/90' : 'bg-[#1A1A2E] text-white'}`} size="lg">
                        Начать
                      </Button>
                    </Link>
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
                  Готовы преобразить свою школу?
                </h2>
                <p className="text-[16px] text-white/80 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
                  Присоединяйтесь к тысячам педагогов, которые уже создают потрясающий образовательный опыт с Unick
                </p>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-[#1A1A2E] hover:bg-white/90 text-base px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    Начать бесплатный пробный период
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-[13px] text-white/60 mt-4" style={{ fontFamily: 'var(--font-body)' }}>
                  Без кредитной карты · 14 дней бесплатно · Отмена в любой момент
                </p>
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
            <p className="text-white/50 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              © 2026 Unick. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
