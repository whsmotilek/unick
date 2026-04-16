import { Link, Outlet, useLocation } from 'react-router';
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
  Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mockUsers } from '../../data/mockData';
import logo from 'figma:asset/d1f4fdcdf2cbedfd13a90150fb918f6e78560c92.png';

const navigation = [
  { name: 'Главная', href: '/student', icon: LayoutDashboard },
  { name: 'Мои курсы', href: '/student/courses', icon: BookOpen },
  { name: 'Домашки', href: '/student/homework', icon: FileCheck },
  { name: 'Календарь', href: '/student/calendar', icon: Calendar },
  { name: 'Чаты', href: '/student/chat', icon: MessageSquare },
  { name: 'Прогресс', href: '/student/progress', icon: TrendingUp },
  { name: 'Платежи', href: '/student/payments', icon: CreditCard },
  { name: 'Профиль', href: '/student/profile', icon: User },
];

export function StudentLayout() {
  const location = useLocation();
  const currentUser = mockUsers.find(u => u.role === 'student');
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#F5F4F2]">
      {/* Dark Sidebar */}
      <aside className="w-[200px] bg-[#1A1A2E] flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link to="/student" className="flex items-center gap-2">
            <img src={logo} alt="Unick" className="w-8 h-8" />
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
              unick
            </span>
          </Link>
        </div>

        {/* User Profile with Level */}
        <div className="px-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-[#7C6AF7] text-white text-sm">
                  {currentUser?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#F5E642] rounded-full flex items-center justify-center border-2 border-[#1A1A2E]">
                <Trophy className="w-2.5 h-2.5 text-[#1A1A2E]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>
                {currentUser?.name}
              </p>
              <Badge 
                variant="secondary" 
                className="text-[10px] mt-1 h-4 px-1.5 bg-white/15 text-white border-0"
              >
                Level 3
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
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

        {/* Progress Card */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] rounded-lg p-3 text-white mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-body)' }}>Прогресс</span>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>35%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div className="bg-white rounded-full h-1.5" style={{ width: '35%' }}></div>
            </div>
            <p className="text-[10px] mt-1.5 opacity-90" style={{ fontFamily: 'var(--font-body)' }}>
              До уровня: 65%
            </p>
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