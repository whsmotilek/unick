import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  MessageSquare,
  FileDown,
  Send
} from 'lucide-react';
import { mockCourses, mockLessons, mockUsers } from '../../data/mockData';
import { useParams, Link } from 'react-router';
import { useState } from 'react';

export function LessonPlayer() {
  const { id, lessonId } = useParams();
  const course = mockCourses.find(c => c.id === id) || mockCourses[0];
  const lesson = mockLessons.find(l => l.id === lessonId) || mockLessons[0];
  const [comment, setComment] = useState('');

  // Находим следующий урок
  const allLessons = course.modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

  // Моковые комментарии
  const comments = [
    {
      id: '1',
      user: mockUsers[2],
      text: 'Отличное объяснение! Теперь всё понятно.',
      timestamp: '2024-02-24T10:30:00Z'
    },
    {
      id: '2',
      user: mockUsers[0],
      text: 'Спасибо за вопрос! Да, этот принцип можно применять и в мобильных приложениях.',
      timestamp: '2024-02-24T11:15:00Z',
      isAuthor: true
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Video/Content Area */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          {lesson.type === 'video' ? (
            <div className="aspect-video bg-slate-900 flex items-center justify-center">
              {lesson.content.data?.thumbnail ? (
                <img 
                  src={lesson.content.data.thumbnail} 
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-center">
                  <p className="text-lg mb-2">Видео-плеер</p>
                  <p className="text-sm opacity-70">
                    {Math.floor((lesson.content.data?.duration || 0) / 60)} мин
                  </p>
                </div>
              )}
            </div>
          ) : lesson.type === 'text' ? (
            <div className="bg-white p-8">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content.data?.html || '' }}
              />
            </div>
          ) : lesson.type === 'homework' ? (
            <div className="bg-white p-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Домашнее задание</h2>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-slate-700 mb-4">
                      {lesson.content.data?.instructions}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Ваш ответ</label>
                        <Textarea 
                          rows={6}
                          placeholder="Введите ваш ответ или вставьте ссылку на работу..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                          Дедлайн: {lesson.content.data?.deadline ? 
                            new Date(lesson.content.data.deadline).toLocaleDateString('ru-RU') : 
                            'не указан'
                          }
                        </div>
                        <Button>Отправить на проверку</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Lesson Info & Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link to={`/student/courses/${course.id}`}>
                  <Badge variant="secondary" className="text-xs">
                    {course.title}
                  </Badge>
                </Link>
                <Badge className="text-xs">
                  {lesson.type === 'video' ? 'Видео' : 
                   lesson.type === 'text' ? 'Текст' : 
                   lesson.type === 'homework' ? 'Домашка' : 
                   lesson.type}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-slate-600 mt-2">{lesson.description}</p>
              )}
            </div>
            <Button variant="outline">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Отметить пройденным
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {prevLesson && (
                <Link to={`/student/courses/${course.id}/lessons/${prevLesson.id}`}>
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Предыдущий
                  </Button>
                </Link>
              )}
              {nextLesson && (
                <Link to={`/student/courses/${course.id}/lessons/${nextLesson.id}`}>
                  <Button size="sm">
                    Следующий
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
            <Link to={`/student/courses/${course.id}`}>
              <Button variant="ghost" size="sm">
                К содержанию курса
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto h-full">
          <Tabs defaultValue="comments" className="h-full flex flex-col">
            <div className="border-b border-slate-200 bg-white px-6">
              <TabsList>
                <TabsTrigger value="comments">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Комментарии ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="materials">
                  <FileDown className="w-4 h-4 mr-2" />
                  Материалы
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="comments" className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Add Comment */}
                <Card>
                  <CardContent className="p-4">
                    <Textarea 
                      placeholder="Задайте вопрос или оставьте комментарий..."
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mb-3"
                    />
                    <div className="flex justify-end">
                      <Button size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Отправить
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((c) => (
                    <Card key={c.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={c.user.avatar} />
                            <AvatarFallback>{c.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{c.user.name}</span>
                              {c.isAuthor && (
                                <Badge variant="secondary" className="text-xs">Автор</Badge>
                              )}
                              <span className="text-xs text-slate-500">
                                {new Date(c.timestamp).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">{c.text}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-slate-500">
                      <FileDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Дополнительные материалы отсутствуют</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
