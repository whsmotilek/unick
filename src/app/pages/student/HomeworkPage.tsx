import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Upload,
  Link as LinkIcon,
  FileText,
  Send
} from 'lucide-react';

const mockHomework = [
  {
    id: '1',
    title: 'Анализ интерфейса приложения',
    course: 'Основы UI/UX дизайна',
    lesson: 'Модуль 1, Урок 3',
    description: 'Выберите популярное приложение и проведите детальный анализ его интерфейса. Опишите сильные и слабые стороны.',
    deadline: '2024-03-05T23:59:00Z',
    status: 'submitted',
    submittedAt: '2024-02-23T14:20:00Z',
    feedback: null,
    submission: {
      type: 'text',
      content: 'Я выбрал приложение Instagram. Основные находки...'
    }
  },
  {
    id: '2',
    title: 'Создание персон пользователей',
    course: 'Основы UI/UX дизайна',
    lesson: 'Модуль 2, Урок 2',
    description: 'Создайте 2-3 персоны для вашего учебного проекта. Используйте шаблон из материалов.',
    deadline: '2024-03-08T23:59:00Z',
    status: 'pending',
    submittedAt: null,
    feedback: null,
    submission: null
  },
  {
    id: '3',
    title: 'Wireframe главной страницы',
    course: 'Основы UI/UX дизайна',
    lesson: 'Модуль 3, Урок 1',
    description: 'Создайте low-fidelity wireframe главной страницы вашего проекта',
    deadline: '2024-03-12T23:59:00Z',
    status: 'returned',
    submittedAt: '2024-02-20T10:00:00Z',
    feedback: 'Хорошая работа, но нужно доработать навигацию. Добавьте breadcrumbs и улучшите видимость CTA-кнопок.',
    submission: {
      type: 'link',
      content: 'https://figma.com/file/example'
    }
  },
  {
    id: '4',
    title: 'Финальный проект',
    course: 'Основы UI/UX дизайна',
    lesson: 'Модуль 4, Урок 5',
    description: 'Завершите работу над финальным проектом курса',
    deadline: '2024-03-20T23:59:00Z',
    status: 'approved',
    submittedAt: '2024-02-18T16:30:00Z',
    feedback: 'Отличная работа! Все критерии выполнены на высоком уровне.',
    submission: {
      type: 'link',
      content: 'https://figma.com/file/final-project'
    }
  }
];

export function HomeworkPage() {
  const [selectedHomework, setSelectedHomework] = useState<typeof mockHomework[0] | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submissionType, setSubmissionType] = useState<'text' | 'link' | 'file'>('text');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  const handleSubmit = () => {
    console.log('Submitting homework:', selectedHomework?.id, { type: submissionType, text: submissionText, link: submissionLink });
    setShowSubmitDialog(false);
    setSubmissionText('');
    setSubmissionLink('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Нужно сдать</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-700">На проверке</Badge>;
      case 'returned':
        return <Badge variant="destructive">Возвращено</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Принято</Badge>;
      default:
        return null;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Просрочено', color: 'text-red-600' };
    if (days === 0) return { text: 'Сегодня', color: 'text-amber-600' };
    if (days === 1) return { text: 'Завтра', color: 'text-amber-600' };
    return { text: `Осталось ${days} дн.`, color: 'text-slate-600' };
  };

  const pendingHomework = mockHomework.filter(h => h.status === 'pending' || h.status === 'returned');
  const submittedHomework = mockHomework.filter(h => h.status === 'submitted');
  const completedHomework = mockHomework.filter(h => h.status === 'approved');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Домашние задания</h1>
        <p className="text-sm text-slate-500 mt-1">
          Отслеживайте прогресс выполнения заданий
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Нужно сдать</p>
                <p className="text-2xl font-bold">{pendingHomework.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">На проверке</p>
                <p className="text-2xl font-bold">{submittedHomework.length}</p>
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
                <p className="text-sm text-slate-500">Принято</p>
                <p className="text-2xl font-bold">{completedHomework.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Всего заданий</p>
                <p className="text-2xl font-bold">{mockHomework.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Homework List */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Нужно сдать ({pendingHomework.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            На проверке ({submittedHomework.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Принято ({completedHomework.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingHomework.map((hw) => {
            const deadline = getDaysUntilDeadline(hw.deadline);
            return (
              <Card key={hw.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(hw.status)}
                        <span className={`text-sm font-medium flex items-center gap-1 ${deadline.color}`}>
                          <Clock className="w-4 h-4" />
                          {deadline.text}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{hw.title}</h3>
                      <p className="text-sm text-slate-500 mb-2">{hw.course} • {hw.lesson}</p>
                      <p className="text-sm text-slate-700">{hw.description}</p>
                    </div>
                  </div>

                  {hw.status === 'returned' && hw.feedback && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-amber-900 mb-1">Комментарий куратора:</p>
                          <p className="text-sm text-amber-800">{hw.feedback}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setSelectedHomework(hw);
                        setShowSubmitDialog(true);
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {hw.status === 'returned' ? 'Отправить заново' : 'Сдать работу'}
                    </Button>
                    <Button variant="outline">
                      Открыть урок
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submittedHomework.map((hw) => (
            <Card key={hw.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(hw.status)}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{hw.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{hw.course} • {hw.lesson}</p>
                    <p className="text-sm text-slate-600">
                      Сдано: {hw.submittedAt && new Date(hw.submittedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {hw.submission && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-slate-500 mb-2">Ваша работа:</p>
                    {hw.submission.type === 'text' && (
                      <p className="text-sm text-slate-700 line-clamp-3">{hw.submission.content}</p>
                    )}
                    {hw.submission.type === 'link' && (
                      <a href={hw.submission.content} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        <LinkIcon className="w-4 h-4" />
                        {hw.submission.content}
                      </a>
                    )}
                  </div>
                )}

                <p className="text-sm text-slate-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Ожидает проверки куратором
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedHomework.map((hw) => (
            <Card key={hw.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(hw.status)}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{hw.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{hw.course} • {hw.lesson}</p>
                  </div>
                </div>

                {hw.feedback && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-green-900 mb-1">Комментарий куратора:</p>
                        <p className="text-sm text-green-800">{hw.feedback}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Сдать домашнее задание</DialogTitle>
            <DialogDescription>
              {selectedHomework?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedHomework && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Задание:</p>
                <p className="text-sm text-slate-700">{selectedHomework.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Формат ответа:</p>
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant={submissionType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubmissionType('text')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Текст
                  </Button>
                  <Button 
                    variant={submissionType === 'link' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubmissionType('link')}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Ссылка
                  </Button>
                  <Button 
                    variant={submissionType === 'file' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubmissionType('file')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Файл
                  </Button>
                </div>

                {submissionType === 'text' && (
                  <Textarea
                    placeholder="Введите ваш ответ..."
                    rows={8}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                  />
                )}

                {submissionType === 'link' && (
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                  />
                )}

                {submissionType === 'file' && (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Перетащите файл сюда или</p>
                    <Button variant="outline" size="sm">Выберите файл</Button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1">
                  Отмена
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Отправить на проверку
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
