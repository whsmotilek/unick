import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  MessageSquare,
  TrendingUp,

  User,
  LogOut,
  Calendar,
  Compass,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../store/DataStore';
import { MobileNav } from '../MobileNav';
import { NotificationBell } from '../NotificationBell';
import { DemoBanner } from '../DemoBanner';
import { motion } from 'motion/react';
import logoWhiteFull from '@/assets/logo/logo-full-white.png';
import { plural } from '../../lib/analytics';

const navigation = [
  { name: 'Главная', href: '/student', icon: LayoutDashboard },
  { name: 'Каталог', href: '/student/catalog', icon: Compass },
  { name: 'Мои курсы', href: '/student/courses', icon: BookOpen },
  { name: 'Домашки', href: '/student/homework', icon: FileCheck },
  { name: 'Прогресс', href: '/student/progress', icon: TrendingUp },
  { name: 'Чаты', href: '/student/chat', icon: MessageSquare },
  { name: 'Календарь', href: '/student/calendar', icon: Calendar },
  { name: 'Профиль', href: '/student/profile', icon: User },
];

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCompletedLessonsCount, getCourseProgress, enrollments } = useDataStore();
  const isActive = (path: string) => location.pathname === path || (path !== '/student' && location.pathname.startsWith(path + '/'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const completedCount = user ? getCompletedLessonsCount(user.id) : 0;
  const myCourseIds = user ? enrollments[user.id] ?? [] : [];
  const activeCourses = user ? myCourseIds.filter(cid => getCourseProgress(user.id, cid) < 100).length : 0;

  const userFooter = (
    <>
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-[#7C6AF7] text-white text-sm">
            {user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>
            {user?.name || 'Ученик'}
          </p>
          <p className="text-[12px] text-white/50 truncate" style={{ fontFamily: 'var(--font-body)' }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Простая сводка по учёбе: без уровней и прочей геймификации */}
      <div className="grid grid-cols-2 gap-2 mb-3 rounded-lg bg-white/10 p-3 text-white">
        <div>
          <p className="text-[16px] font-bold leading-none" style={{ fontFamily: 'var(--font-heading)' }}>{completedCount}</p>
          <p className="text-[12px] leading-tight text-white/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
            {plural(completedCount, ['урок пройден', 'урока пройдено', 'уроков пройдено'])}
          </p>
        </div>
        <div>
          <p className="text-[16px] font-bold leading-none" style={{ fontFamily: 'var(--font-heading)' }}>{activeCourses}</p>
          <p className="text-[12px] leading-tight text-white/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
            {plural(activeCourses, ['курс в процессе', 'курса в процессе', 'курсов в процессе'])}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="w-full justify-start gap-2 text-white/60 hover:text-white hover:bg-white/10 h-10"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-[13px]">Выйти</span>
      </Button>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F4F2]">
      <MobileNav navigation={navigation} rootHref="/student" footer={userFooter} actions={<NotificationBell variant="dark" />} />

      <aside className="hidden md:flex w-[220px] bg-[#1A1A2E] flex-col">
        <div className="p-6 pr-3 flex items-center justify-between gap-2">
          <Link to="/student" className="flex items-center gap-2">
            <img src={logoWhiteFull} alt="Unick" className="h-6" />
          </Link>
          <NotificationBell variant="dark" side="right" align="start" />
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
          <DemoBanner />
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
