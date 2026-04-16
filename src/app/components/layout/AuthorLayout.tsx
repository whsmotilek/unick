import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Globe,
  Zap,
  CreditCard,
  FileText,
  LogOut,
  Palette,
  UserCog,
  Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import logo from '@/assets/d1f4fdcdf2cbedfd13a90150fb918f6e78560c92.png';

const navigation = [
  { name: 'Главная', href: '/author', icon: LayoutDashboard },
  { name: 'Курсы', href: '/author/courses', icon: BookOpen },
  { name: 'Вселенная', href: '/author/course-universe', icon: Palette },
  { name: 'Ученики', href: '/author/students', icon: Users },
  { name: 'CRM', href: '/author/crm', icon: UserCog },
  { name: 'Аналитика', href: '/author/analytics', icon: BarChart3 },
  { name: 'Страницы', href: '/author/pages', icon: Globe },
  { name: 'Команда', href: '/author/team', icon: Users },
  { name: 'Потоки', href: '/author/flows', icon: Zap },
  { name: 'Платежи', href: '/author/payments', icon: CreditCard },
  { name: 'Контент', href: '/author/content', icon: FileText },
  { name: 'Календарь', href: '/author/calendar', icon: Calendar },
];

export function AuthorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#F5F4F2]">
      <aside className="w-[200px] bg-[#1A1A2E] flex flex-col">
        <div className="p-6">
          <Link to="/author" className="flex items-center gap-2">
            <img src={logo} alt="Unick" className="w-8 h-8" />
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
              unick
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>
                {user?.name || 'Пользователь'}
              </p>
              <p className="text-white/50 text-[11px] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                {user?.email}
              </p>
            </div>
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
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
