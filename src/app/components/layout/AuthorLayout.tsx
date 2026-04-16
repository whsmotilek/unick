import { Link, Outlet, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings,
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
import { mockUsers, mockSchool } from '../../data/mockData';
import logo from 'figma:asset/d1f4fdcdf2cbedfd13a90150fb918f6e78560c92.png';

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
  const currentUser = mockUsers.find(u => u.role === 'author');
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#F5F4F2]">
      {/* Dark Sidebar */}
      <aside className="w-[200px] bg-[#1A1A2E] flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link to="/author" className="flex items-center gap-2">
            <img src={logo} alt="Unick" className="w-8 h-8" />
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
              unick
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all text-sm font-medium
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

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">
                {currentUser?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>
                {currentUser?.name}
              </p>
              <p className="text-white/50 text-[11px] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                {mockSchool.name}
              </p>
            </div>
          </div>
          
          <Link to="/" className="w-full">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start gap-2 text-white/50 hover:text-white hover:bg-white/10 h-8"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Выйти</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}