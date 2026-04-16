import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../store/DataStore';
import { Save, Trophy, BookOpen, Users, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { courses, enrollments, getCompletedLessonsCount, homework } = useDataStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  if (!user) return null;

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Имя и email обязательны');
      return;
    }
    try {
      const stored = localStorage.getItem('unick_users');
      const users = stored ? JSON.parse(stored) : [];
      const updated = users.map((u: any) =>
        u.id === user.id ? { ...u, name: name.trim(), email: email.trim(), avatar: avatar.trim() } : u
      );
      localStorage.setItem('unick_users', JSON.stringify(updated));
      // Update current user in localStorage
      const updatedUser = { ...user, name: name.trim(), email: email.trim(), avatar: avatar.trim() };
      localStorage.setItem('unick_auth_user', JSON.stringify(updatedUser));
      toast.success('Профиль обновлён! Перезагрузите страницу для применения');
      setTimeout(() => window.location.reload(), 600);
    } catch {
      toast.error('Не удалось сохранить');
    }
  };

  // Stats
  const completedLessons = getCompletedLessonsCount(user.id);
  const enrolledCount = (enrollments[user.id] || []).length;
  const myCoursesCount = user.role === 'author' ? courses.filter(c => c.schoolId === user.schoolId).length : 0;
  const submittedHwCount = user.role === 'student'
    ? homework.filter(h => h.studentId === user.id).length
    : homework.filter(h => h.status === 'submitted' || h.status === 'review').length;

  const stats = user.role === 'author'
    ? [
        { label: 'Курсов', value: myCoursesCount, icon: BookOpen, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
        { label: 'ДЗ на проверке', value: submittedHwCount, icon: FileCheck, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
      ]
    : [
        { label: 'Уроков пройдено', value: completedLessons, icon: BookOpen, color: 'bg-[#C5E8A0]', text: 'text-[#2D5016]' },
        { label: 'Курсов', value: enrolledCount, icon: Users, color: 'bg-[#EDE9FF]', text: 'text-[#7C6AF7]' },
        { label: 'ДЗ сдано', value: submittedHwCount, icon: FileCheck, color: 'bg-[#FFE5D9]', text: 'text-[#FF6B6B]' },
        { label: 'Уровень', value: Math.floor(completedLessons / 5) + 1, icon: Trophy, color: 'bg-[#F5E642]', text: 'text-[#5A5000]' },
      ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Профиль</h1>
        <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Управляйте своими данными</p>
      </div>

      <div className={`grid grid-cols-2 ${stats.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4 mb-6`}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`${s.color} border-0`}>
              <CardContent className="p-5">
                <s.icon className={`w-5 h-5 ${s.text} mb-3`} strokeWidth={1.5} />
                <p className={`text-[28px] font-bold ${s.text}`} style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
                <p className="text-[11px] text-[#1A1A2E]/60 mt-1" style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-[#7C6AF7] text-white text-2xl">{name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-[18px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>{name || 'Без имени'}</h3>
              <Badge variant="secondary" className="mt-1">
                {user.role === 'author' ? 'Автор' : user.role === 'student' ? 'Ученик' : user.role === 'curator' ? 'Куратор' : user.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="avatar">Аватар (URL)</Label>
              <Input id="avatar" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." className="mt-1.5" />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={logout} className="text-[#FF6B6B] border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10">
                Выйти из аккаунта
              </Button>
              <Button onClick={handleSave} className="transition-transform active:scale-[0.98]">
                <Save className="w-4 h-4 mr-2" />Сохранить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
