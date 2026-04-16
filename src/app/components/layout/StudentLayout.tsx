import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  MessageSquare,
  TrendingUp,
  CreditCard,
  User,
  LogOut,
  Trophy,
  Calendar,
  Compass,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../store/DataStore';
import { MobileNav } from '../MobileNav';
import { motion } from 'motion/react';
import logoWhiteFull from '@/assets/logo/logo-full-white.png';

const navigation = [
  { name: 'Главная', href: '/student', icon: LayoutDashboard },
  { name: 'Каталог', href: '/student/catalog', icon: Compass },
  { name: 'Мои курсы', href: '/student/courses', icon: BookOpen },
  { name: 'Домашки', href: '/student/homework', icon: FileCheck },
  { name: 'Прогресс', href: '/student/progress', icon: TrendingUp },
  { name: 'Чаты', href: '/student/chat', icon: MessageSquare },
  { name: 'Календарь', href: '/student/calendar', icon: Calendar },
  { name: 'Платежи', href: '/student/payments', icon: CreditCard },
  { name: 'Профиль', href: '/student/profile', icon: User },
];

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCompletedLessonsCount } = useDataStore();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const completedCount = user ? getCompletedLessonsCount(user.id) : 0;
  const level = Math.floor(completedCount / 5) + 1;
  const lessonsToNext = 5 - (completedCount % 5);
  const levelProgress = ((5 - lessonsToNext) / 5) * 100;

  const userFooter = (
    <>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-[#7C6AF7] text-white text-sm">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#F5E642] rounded-full flex items-center justify-center border-2 border-[#1A1A2E]">
            <Trophy className="w-2.5 h-2.5 text-[#1A1A2E]" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>
            {user?.name || 'Ученик'}
          </p>
          <Badge variant="secondary" className="text-[10px] mt-1 h-4 px-1.5 bg-white/15 text-white border-0">
            Level {level}
          </Badge>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] rounded-lg p-3 text-white mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-body)' }}>До Lvl {level + 1}</span>
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{Math.round(levelProgress)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <motion.div
            className="bg-white rounded-full h-1.5"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] mt-1.5 opacity-90" style={{ fontFamily: 'var(--font-body)' }}>
          {lessonsToNext} {lessonsToNext === 1 ? 'урок' : 'уроков'} до уровня
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="w-full justify-start gap-2 text-white/50 hover:text-white hover:bg-white/10 h-8"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-xs">Выйти</span>
      </Button>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F4F2]">
      <MobileNav navigation={navigation} rootHref="/student" footer={userFooter} />

      <aside className="hidden md:flex w-[220px] bg-[#1A1A2E] flex-col">
        <div className="p-6">
          <Link to="/student" className="flex items-center gap-2">
            <img src={logoWhiteFull} alt="Unick" className="h-6" />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-200 text-sm font-medium
                  ${active
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                  }
                `}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <item.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">{userFooter}</div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
