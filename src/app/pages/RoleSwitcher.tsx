import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  UserCog,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router';
import logo from '@/assets/d1f4fdcdf2cbedfd13a90150fb918f6e78560c92.png';

export function RoleSwitcher() {
  const roles = [
    {
      title: 'Автор / Школа',
      description: 'Создавайте курсы, управляйте учениками, анализируйте данные',
      icon: BookOpen,
      color: 'from-[#7C6AF7] to-[#9B8AF9]',
      link: '/author',
      features: [
        'Конструктор курсов',
        'AI-аналитика',
        'Управление командой',
        'Продажи и платежи'
      ]
    },
    {
      title: 'Ученик',
      description: 'Проходите курсы, выполняйте задания, отслеживайте прогресс',
      icon: GraduationCap,
      color: 'from-[#C5E8A0] to-[#A5D880]',
      link: '/student',
      features: [
        'Учебные материалы',
        'Домашние задания',
        'Прогресс и достижения',
        'Чаты с кураторами'
      ]
    },
    {
      title: 'Куратор',
      description: 'Проверяйте домашки, помогайте ученикам, модерируйте чаты',
      icon: Users,
      color: 'from-[#F5E642] to-[#E5D632]',
      link: '/curator',
      features: [
        'Очередь проверки',
        'Работа с учениками',
        'Чаты и поддержка',
        'Операционная аналитика'
      ]
    },
    {
      title: 'Администратор',
      description: 'Управляйте школой, командой, настройками и доступами',
      icon: UserCog,
      color: 'from-[#F9D0E8] to-[#E9C0D8]',
      link: '/admin',
      features: [
        'Управление командой',
        'Мониторинг активности',
        'Модерация',
        'Настройки школы'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <img src={logo} alt="Unick" className="w-16 h-16" />
          </div>
          <h1 className="text-[48px] font-bold text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Платформа Unick
          </h1>
          <p className="text-[16px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
            Выберите роль для изучения функционала
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card key={role.title} className="border-0 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all overflow-hidden">
              <div className={`bg-gradient-to-br ${role.color} p-6 text-white`}>
                <role.icon className="w-12 h-12 mb-4" strokeWidth={1.5} />
                <h2 className="text-[24px] font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {role.title}
                </h2>
                <p className="text-[13px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>
                  {role.description}
                </p>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-sm text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  Основные функции:
                </h3>
                <ul className="space-y-2 mb-6">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#8A8A9A]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7C6AF7]"></div>
                      <span style={{ fontFamily: 'var(--font-body)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={role.link} className="block">
                  <Button className="w-full" size="lg">
                    Открыть панель
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card className="bg-gradient-to-r from-[#EDE9FF] to-[#F9D0E8] border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#7C6AF7]" />
                <h3 className="font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Демо-версия MVP
                </h3>
              </div>
              <p className="text-sm text-[#8A8A9A] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                Это прототип платформы с тестовыми данными. 
                Реализованы основные экраны для автора и ученика.
              </p>
              <div className="flex gap-3 justify-center text-xs text-[#8A8A9A] flex-wrap">
                <Badge variant="secondary">Мультитенантная архитектура</Badge>
                <Badge variant="secondary">Система ролей RBAC</Badge>
                <Badge variant="secondary">AI-инсайты</Badge>
                <Badge variant="secondary">Конструктор курсов</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-[#8A8A9A] hover:text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
