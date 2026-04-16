import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { useState } from 'react';
import { UserPlus, MoreVertical, Shield, Activity, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const teamMembers = [
  {
    id: '1',
    name: 'Анна Иванова',
    email: 'anna@example.com',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    status: 'active',
    lastActive: '5 мин назад',
    permissions: ['all']
  },
  {
    id: '2',
    name: 'Мария Куратова',
    email: 'maria@example.com',
    role: 'curator',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    status: 'active',
    lastActive: '2 часа назад',
    permissions: ['homework', 'students', 'chat']
  },
  {
    id: '3',
    name: 'Петр Админов',
    email: 'petr@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    status: 'active',
    lastActive: '1 день назад',
    permissions: ['team', 'content', 'analytics']
  },
  {
    id: '4',
    name: 'Елена Методолог',
    email: 'elena@example.com',
    role: 'methodologist',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    status: 'invited',
    lastActive: 'Приглашена',
    permissions: ['content']
  }
];

export function TeamPage() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('curator');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-purple-100 text-purple-700"><Crown className="w-3 h-3 mr-1" />Владелец</Badge>;
      case 'admin':
        return <Badge className="bg-indigo-100 text-indigo-700"><Shield className="w-3 h-3 mr-1" />Админ</Badge>;
      case 'curator':
        return <Badge className="bg-green-100 text-green-700">Куратор</Badge>;
      case 'methodologist':
        return <Badge className="bg-blue-100 text-blue-700">Методолог</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const handleInvite = () => {
    console.log('Inviting:', inviteEmail, inviteRole);
    setShowInviteDialog(false);
    setInviteEmail('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Команда и роли</h1>
          <p className="text-slate-600 mt-1">Управление доступами и правами</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Пригласить участника
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Всего участников</p>
            <p className="text-2xl font-bold mt-1">{teamMembers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Активных</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {teamMembers.filter(m => m.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Кураторов</p>
            <p className="text-2xl font-bold mt-1">
              {teamMembers.filter(m => m.role === 'curator').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Лимит по тарифу</p>
            <p className="text-2xl font-bold mt-1">5 / 10</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Участник</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Доступы</TableHead>
                <TableHead>Последняя активность</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(member.role)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.slice(0, 2).map((perm, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {perm === 'all' ? 'Все' : perm}
                        </Badge>
                      ))}
                      {member.permissions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.permissions.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-green-500" />
                      {member.lastActive}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.status === 'active' ? (
                      <Badge className="bg-green-100 text-green-700">Активен</Badge>
                    ) : (
                      <Badge variant="secondary">Приглашен</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Изменить роль</DropdownMenuItem>
                          <DropdownMenuItem>Настроить доступы</DropdownMenuItem>
                          <DropdownMenuItem>Просмотреть активность</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Удалить из команды
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Roles Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">Владелец</h3>
            </div>
            <p className="text-xs text-slate-600">
              Полный доступ ко всем функциям школы. Управление тарифом и оплатой.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Администратор</h3>
            </div>
            <p className="text-xs text-slate-600">
              Управление командой, контентом, аналитикой. Нет доступа к платежам.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                <span className="text-xs text-green-600">👨‍🏫</span>
              </div>
              <h3 className="font-semibold">Куратор</h3>
            </div>
            <p className="text-xs text-slate-600">
              Проверка домашек, работа с учениками, модерация чатов.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-xs text-blue-600">📚</span>
              </div>
              <h3 className="font-semibold">Методолог</h3>
            </div>
            <p className="text-xs text-slate-600">
              Просмотр контента, аналитика качества, рекомендации по улучшению.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Пригласить участника</DialogTitle>
            <DialogDescription>
              Отправьте приглашение новому члену команды
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="role">Роль</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curator">Куратор</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="methodologist">Методолог</SelectItem>
                  <SelectItem value="support">Менеджер поддержки</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600">
                Пользователь получит приглашение на email и сможет присоединиться к команде.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleInvite} className="flex-1">
                Отправить приглашение
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
