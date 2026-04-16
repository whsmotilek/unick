import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import {
  Plus,
  Calendar,
  Users,
  Play,
  Pause,
  Settings,
  MoreVertical,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const mockFlows = [
  {
    id: '1',
    name: 'Поток Февраль 2024',
    course: 'Основы UI/UX дизайна',
    startDate: '15 февраля 2024',
    endDate: '30 марта 2024',
    status: 'active',
    students: 45,
    maxStudents: 50,
    progress: 42,
    curators: [
      { name: 'Мария К.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' }
    ],
    completion: 68
  },
  {
    id: '2',
    name: 'Поток Март 2024',
    course: 'Figma для начинающих',
    startDate: '1 марта 2024',
    endDate: '15 апреля 2024',
    status: 'upcoming',
    students: 28,
    maxStudents: 40,
    progress: 0,
    curators: [
      { name: 'Мария К.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' }
    ],
    completion: 0
  },
  {
    id: '3',
    name: 'Поток Январь 2024',
    course: 'Основы UI/UX дизайна',
    startDate: '10 января 2024',
    endDate: '28 февраля 2024',
    status: 'completed',
    students: 38,
    maxStudents: 40,
    progress: 100,
    curators: [
      { name: 'Мария К.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' }
    ],
    completion: 87
  }
];

export function FlowsPage() {
  const getStatusBadge = (status: string) => {
    if (status === 'active') return <Badge className="bg-green-100 text-green-700">Активен</Badge>;
    if (status === 'upcoming') return <Badge className="bg-blue-100 text-blue-700">Предстоящий</Badge>;
    return <Badge variant="secondary">Завершен</Badge>;
  };

  const activeFlows = mockFlows.filter(f => f.status === 'active').length;
  const totalStudents = mockFlows.reduce((acc, f) => acc + f.students, 0);
  const avgCompletion = Math.round(
    mockFlows.filter(f => f.status !== 'upcoming').reduce((acc, f) => acc + f.completion, 0) /
    mockFlows.filter(f => f.status !== 'upcoming').length
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Потоки и группы</h1>
          <p className="text-sm text-slate-500 mt-1">
            Управление потоками обучения
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать поток
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Всего потоков</p>
            <p className="text-2xl font-bold mt-1">{mockFlows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Активных</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{activeFlows}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Всего учеников</p>
            <p className="text-2xl font-bold mt-1">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Средняя доходимость</p>
            <p className="text-2xl font-bold mt-1">{avgCompletion}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Все ({mockFlows.length})</Button>
        <Button variant="ghost" size="sm">
          Активные ({mockFlows.filter(f => f.status === 'active').length})
        </Button>
        <Button variant="ghost" size="sm">
          Предстоящие ({mockFlows.filter(f => f.status === 'upcoming').length})
        </Button>
        <Button variant="ghost" size="sm">
          Завершенные ({mockFlows.filter(f => f.status === 'completed').length})
        </Button>
      </div>

      {/* Flows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockFlows.map((flow) => (
          <Card key={flow.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{flow.name}</h3>
                  <p className="text-sm text-slate-600">{flow.course}</p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(flow.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Настройки
                      </DropdownMenuItem>
                      {flow.status === 'active' && (
                        <DropdownMenuItem>
                          <Pause className="w-4 h-4 mr-2" />
                          Приостановить
                        </DropdownMenuItem>
                      )}
                      {flow.status === 'upcoming' && (
                        <DropdownMenuItem>
                          <Play className="w-4 h-4 mr-2" />
                          Начать досрочно
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="text-xs text-slate-500">Старт</p>
                      <p className="font-medium">{flow.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="text-xs text-slate-500">Завершение</p>
                      <p className="font-medium">{flow.endDate}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Заполнение</span>
                    <span className="font-medium">{flow.students}/{flow.maxStudents}</span>
                  </div>
                  <Progress value={(flow.students / flow.maxStudents) * 100} className="h-2" />
                </div>

                {flow.status !== 'upcoming' && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Прогресс обучения</span>
                      <span className="font-medium">{flow.progress}%</span>
                    </div>
                    <Progress value={flow.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Кураторы:</span>
                    <div className="flex -space-x-2">
                      {flow.curators.map((curator, i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-white">
                          <AvatarImage src={curator.avatar} />
                          <AvatarFallback>{curator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  {flow.status !== 'upcoming' && (
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-slate-600">{flow.completion}% доходимость</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Участники
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Аналитика
                  </Button>
                  <Button size="sm" className="flex-1">
                    Открыть
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
