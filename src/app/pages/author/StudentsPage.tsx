import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Download,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Eye,
  Ban,
  UserX
} from 'lucide-react';

// Моковые данные студентов
const mockStudents = [
  {
    id: 'st-1',
    name: 'Петр Смирнов',
    email: 'petr@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    course: 'Основы UI/UX дизайна',
    flow: 'Поток Февраль 2024',
    progress: 35,
    lastActivity: '2 часа назад',
    status: 'active',
    risk: 'low',
    homeworkPending: 1
  },
  {
    id: 'st-2',
    name: 'Мария Петрова',
    email: 'maria@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    course: 'Основы UI/UX дизайна',
    flow: 'Поток Февраль 2024',
    progress: 78,
    lastActivity: '1 день назад',
    status: 'active',
    risk: 'low',
    homeworkPending: 0
  },
  {
    id: 'st-3',
    name: 'Алексей Волков',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    course: 'Figma для начинающих',
    flow: 'Поток Март 2024',
    progress: 12,
    lastActivity: '7 дней назад',
    status: 'inactive',
    risk: 'high',
    homeworkPending: 3
  },
  {
    id: 'st-4',
    name: 'Елена Соколова',
    email: 'elena@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    course: 'Основы UI/UX дизайна',
    flow: 'Поток Февраль 2024',
    progress: 56,
    lastActivity: '4 дня назад',
    status: 'active',
    risk: 'medium',
    homeworkPending: 2
  }
];

export function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);

  const getRiskBadge = (risk: string) => {
    if (risk === 'high') return <Badge variant="destructive">Высокий риск</Badge>;
    if (risk === 'medium') return <Badge className="bg-amber-100 text-amber-700">Средний риск</Badge>;
    return <Badge variant="secondary">Низкий риск</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <Badge className="bg-green-100 text-green-700">Активен</Badge>;
    if (status === 'inactive') return <Badge variant="secondary">Неактивен</Badge>;
    return <Badge variant="outline">Завершил</Badge>;
  };

  const handleViewStudent = (student: typeof mockStudents[0]) => {
    setSelectedStudent(student);
    setShowStudentDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ученики</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mockStudents.length} учеников в системе
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Добавить ученика
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Всего учеников</p>
            <p className="text-2xl font-bold mt-1">{mockStudents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Активных</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {mockStudents.filter(s => s.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">В зоне риска</p>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {mockStudents.filter(s => s.risk === 'high').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Средний прогресс</p>
            <p className="text-2xl font-bold mt-1">
              {Math.round(mockStudents.reduce((acc, s) => acc + s.progress, 0) / mockStudents.length)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Поиск по имени или email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ученик</TableHead>
                <TableHead>Курс / Поток</TableHead>
                <TableHead>Прогресс</TableHead>
                <TableHead>Последняя активность</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Риск</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{student.course}</p>
                    <p className="text-xs text-slate-500">{student.flow}</p>
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{student.progress}%</span>
                        {student.homeworkPending > 0 && (
                          <span className="text-amber-600">{student.homeworkPending} ДЗ</span>
                        )}
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {student.lastActivity}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(student.status)}
                  </TableCell>
                  <TableCell>
                    {getRiskBadge(student.risk)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Просмотр профиля
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Написать сообщение
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ban className="w-4 h-4 mr-2" />
                          Приостановить доступ
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <UserX className="w-4 h-4 mr-2" />
                          Удалить из потока
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Профиль ученика</DialogTitle>
            <DialogDescription>
              Полная информация об активности и прогрессе
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList>
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="progress">Прогресс</TabsTrigger>
                <TabsTrigger value="homework">Домашки</TabsTrigger>
                <TabsTrigger value="activity">Активность</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedStudent.avatar} />
                    <AvatarFallback>{selectedStudent.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                    <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(selectedStudent.status)}
                      {getRiskBadge(selectedStudent.risk)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-500">Прогресс</p>
                      <p className="text-2xl font-bold mt-1">{selectedStudent.progress}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-500">Домашек на проверке</p>
                      <p className="text-2xl font-bold mt-1">{selectedStudent.homeworkPending}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Курс</h4>
                  <p className="text-sm">{selectedStudent.course}</p>
                  <p className="text-xs text-slate-500">{selectedStudent.flow}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Последняя активность</h4>
                  <p className="text-sm text-slate-600">{selectedStudent.lastActivity}</p>
                </div>
              </TabsContent>

              <TabsContent value="progress">
                <p className="text-sm text-slate-500 text-center py-8">
                  Детальная информация о прогрессе
                </p>
              </TabsContent>

              <TabsContent value="homework">
                <p className="text-sm text-slate-500 text-center py-8">
                  История домашних заданий
                </p>
              </TabsContent>

              <TabsContent value="activity">
                <p className="text-sm text-slate-500 text-center py-8">
                  Журнал активности ученика
                </p>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
