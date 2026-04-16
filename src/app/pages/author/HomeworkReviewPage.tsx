import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Link as LinkIcon,
  Download
} from 'lucide-react';

const mockHomeworkQueue = [
  {
    id: 'hw-1',
    student: {
      name: 'Петр Смирнов',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    course: 'Основы UI/UX дизайна',
    lesson: 'Анализ интерфейса',
    submittedAt: '2024-02-24T14:20:00Z',
    deadline: '2024-03-05T23:59:00Z',
    type: 'text',
    content: 'Я выбрал приложение Instagram. Основные находки:\n\n1. Упрощенная навигация - всего 5 основных разделов\n2. Акцент на визуальный контент\n3. Минималистичный интерфейс без лишних элементов...',
    status: 'review',
    assignedTo: 'Мария Куратова'
  },
  {
    id: 'hw-2',
    student: {
      name: 'Мария Петрова',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    },
    course: 'Figma для начинающих',
    lesson: 'Первый макет',
    submittedAt: '2024-02-25T10:15:00Z',
    deadline: '2024-03-06T23:59:00Z',
    type: 'link',
    content: 'https://www.figma.com/file/example-design',
    status: 'review',
    assignedTo: 'Не назначен'
  },
  {
    id: 'hw-3',
    student: {
      name: 'Алексей Волков',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
    },
    course: 'Основы UI/UX дизайна',
    lesson: 'Создание персон',
    submittedAt: '2024-02-23T16:30:00Z',
    deadline: '2024-03-04T23:59:00Z',
    type: 'file',
    content: 'personas_analysis.pdf',
    status: 'review',
    assignedTo: 'Мария Куратова'
  }
];

export function HomeworkReviewPage() {
  const [selectedHomework, setSelectedHomework] = useState<typeof mockHomeworkQueue[0] | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'return' | null>(null);

  const handleReview = (homework: typeof mockHomeworkQueue[0]) => {
    setSelectedHomework(homework);
    setShowReviewDialog(true);
    setFeedback('');
    setReviewAction(null);
  };

  const handleApprove = () => {
    setReviewAction('approve');
    console.log('Approving homework:', selectedHomework?.id, feedback);
    setShowReviewDialog(false);
  };

  const handleReturn = () => {
    setReviewAction('return');
    console.log('Returning homework:', selectedHomework?.id, feedback);
    setShowReviewDialog(false);
  };

  const getTypeIcon = (type: string) => {
    if (type === 'text') return <FileText className="w-4 h-4" />;
    if (type === 'link') return <LinkIcon className="w-4 h-4" />;
    return <Download className="w-4 h-4" />;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <Badge variant="destructive">Просрочено</Badge>;
    if (days <= 2) return <Badge className="bg-amber-100 text-amber-700">{days} дн.</Badge>;
    return <Badge variant="secondary">{days} дн.</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Проверка домашних заданий</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mockHomeworkQueue.length} работ ожидают проверки
          </p>
        </div>
        <Button variant="outline">
          Распределить по кураторам
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">На проверке</p>
                <p className="text-2xl font-bold">{mockHomeworkQueue.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Принято сегодня</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Возвращено</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Просроченных</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Homework Queue */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ученик</TableHead>
                <TableHead>Курс / Урок</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Сдано</TableHead>
                <TableHead>Дедлайн</TableHead>
                <TableHead>Куратор</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHomeworkQueue.map((hw) => (
                <TableRow key={hw.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={hw.student.avatar} />
                        <AvatarFallback>{hw.student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{hw.student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{hw.course}</p>
                    <p className="text-xs text-slate-500">{hw.lesson}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(hw.type)}
                      <span className="text-sm capitalize">{hw.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(hw.submittedAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    {getDaysUntilDeadline(hw.deadline)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {hw.assignedTo}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleReview(hw)}>
                      Проверить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Проверка домашнего задания</DialogTitle>
            <DialogDescription>
              {selectedHomework?.course} / {selectedHomework?.lesson}
            </DialogDescription>
          </DialogHeader>

          {selectedHomework && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={selectedHomework.student.avatar} />
                  <AvatarFallback>{selectedHomework.student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedHomework.student.name}</p>
                  <p className="text-sm text-slate-500">
                    Сдано: {new Date(selectedHomework.submittedAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Homework Content */}
              <div>
                <h4 className="font-semibold mb-3">Работа ученика:</h4>
                {selectedHomework.type === 'text' && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{selectedHomework.content}</p>
                    </CardContent>
                  </Card>
                )}
                {selectedHomework.type === 'link' && (
                  <Card>
                    <CardContent className="p-4">
                      <a 
                        href={selectedHomework.content} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-2"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {selectedHomework.content}
                      </a>
                    </CardContent>
                  </Card>
                )}
                {selectedHomework.type === 'file' && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{selectedHomework.content}</p>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            <Download className="w-3 h-3 mr-1" />
                            Скачать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Feedback */}
              <div>
                <h4 className="font-semibold mb-3">Комментарий куратора:</h4>
                <Textarea
                  placeholder="Оставьте обратную связь для ученика..."
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              {/* Quick Responses */}
              <div>
                <p className="text-sm text-slate-600 mb-2">Быстрые ответы:</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFeedback('Отличная работа! Все критерии выполнены.')}
                  >
                    Отлично
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFeedback('Хорошо, но нужно доработать детали.')}
                  >
                    Хорошо
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFeedback('Нужны исправления. См. комментарии выше.')}
                  >
                    На доработку
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleReturn}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Вернуть на доработку
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleApprove}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Принять работу
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
