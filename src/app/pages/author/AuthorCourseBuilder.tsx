import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  ArrowLeft,
  Save,
  Eye,
  Plus,
  GripVertical,
  Video,
  FileText,
  CheckSquare,
  BookOpen,
  Settings,
  Users,
  BarChart3,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link, useParams } from 'react-router';

export function AuthorCourseBuilder() {
  const { id } = useParams();
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  const course = {
    id: id || 'new',
    title: 'Основы UI/UX Дизайна',
    description: 'Комплексный курс по основам пользовательского опыта и интерфейсов',
    status: 'published'
  };

  const modules = [
    {
      id: 1,
      title: 'Введение в UI/UX',
      lessons: [
        { id: 1, title: 'Что такое UX дизайн?', type: 'video', duration: '15 мин' },
        { id: 2, title: 'Основные принципы', type: 'text', duration: '10 мин' },
        { id: 3, title: 'Тест: Основы UX', type: 'quiz', duration: '5 мин' }
      ]
    },
    {
      id: 2,
      title: 'Исследование пользователей',
      lessons: [
        { id: 4, title: 'Методы исследования', type: 'video', duration: '20 мин' },
        { id: 5, title: 'Создание персон', type: 'text', duration: '15 мин' },
        { id: 6, title: 'Домашка: Интервью', type: 'homework', duration: '30 мин' }
      ]
    },
    {
      id: 3,
      title: 'Проектирование интерфейсов',
      lessons: [
        { id: 7, title: 'Вайрфреймы', type: 'video', duration: '25 мин' },
        { id: 8, title: 'Прототипирование', type: 'video', duration: '30 мин' }
      ]
    }
  ];

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'text': return FileText;
      case 'quiz': return CheckSquare;
      case 'homework': return BookOpen;
      default: return FileText;
    }
  };

  const getLessonColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-[#FFE5D9]';
      case 'text': return 'bg-[#EDE9FF]';
      case 'quiz': return 'bg-[#F5E642]';
      case 'homework': return 'bg-[#C5E8A0]';
      default: return 'bg-[#F5F4F2]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/author/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {course.title}
                </h1>
                <Badge variant={course.status === 'published' ? 'success' : 'secondary'}>
                  {course.status === 'published' ? 'Опубликован' : 'Черновик'}
                </Badge>
              </div>
              <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                Редактируйте контент курса и управляйте модулями
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Предпросмотр
            </Button>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Сохранить
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Structure */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="bg-white mb-6 p-1 rounded-xl border border-[#1A1A2E]/10">
                <TabsTrigger value="content" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Контент
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Настройки
                </TabsTrigger>
                <TabsTrigger value="students" className="gap-2">
                  <Users className="w-4 h-4" />
                  Ученики
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Аналитика
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                {/* Add Module Button */}
                <Button variant="outline" className="w-full gap-2 h-12 border-2 border-dashed border-[#1A1A2E]/20 hover:border-[#7C6AF7]/40">
                  <Plus className="w-5 h-5" />
                  Добавить модуль
                </Button>

                {/* Modules */}
                {modules.map((module) => (
                  <Card key={module.id} className="overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#7C6AF7] to-[#9B8AF9] p-5 cursor-pointer"
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-5 h-5 text-white/50" />
                          <div>
                            <h3 className="text-[16px] font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                              Модуль {module.id}: {module.title}
                            </h3>
                            <p className="text-[11px] text-white/80" style={{ fontFamily: 'var(--font-body)' }}>
                              {module.lessons.length} уроков
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {expandedModule === module.id ? (
                            <ChevronUp className="w-5 h-5 text-white" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedModule === module.id && (
                      <CardContent className="p-0">
                        <div className="divide-y divide-[#1A1A2E]/5">
                          {module.lessons.map((lesson) => {
                            const Icon = getLessonIcon(lesson.type);
                            return (
                              <div 
                                key={lesson.id} 
                                className="p-4 hover:bg-[#F5F4F2] transition-colors flex items-center gap-4"
                              >
                                <GripVertical className="w-4 h-4 text-[#8A8A9A]" />
                                <div className={`w-10 h-10 rounded-xl ${getLessonColor(lesson.type)} flex items-center justify-center`}>
                                  <Icon className="w-5 h-5 text-[#1A1A2E]" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[13px] font-medium text-[#1A1A2E] mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                                    {lesson.duration}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="p-4 border-t border-[#1A1A2E]/5">
                          <Button variant="outline" className="w-full gap-2" size="sm">
                            <Plus className="w-4 h-4" />
                            Добавить урок
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <Label htmlFor="course-title">Название курса</Label>
                      <Input 
                        id="course-title" 
                        defaultValue={course.title}
                        className="mt-2 h-11 rounded-xl border-[#1A1A2E]/10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="course-description">Описание</Label>
                      <textarea 
                        id="course-description"
                        defaultValue={course.description}
                        className="mt-2 w-full min-h-[120px] px-4 py-3 rounded-xl border border-[#1A1A2E]/10 focus:outline-none focus:ring-2 focus:ring-[#7C6AF7] resize-none"
                        style={{ fontFamily: 'var(--font-body)' }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="course-price">Цена (₽)</Label>
                        <Input 
                          id="course-price" 
                          type="number"
                          defaultValue="15000"
                          className="mt-2 h-11 rounded-xl border-[#1A1A2E]/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="course-duration">Длительность</Label>
                        <Input 
                          id="course-duration" 
                          defaultValue="8 недель"
                          className="mt-2 h-11 rounded-xl border-[#1A1A2E]/10"
                        />
                      </div>
                    </div>

                    <Button className="w-full">
                      Сохранить настройки
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-[#8A8A9A] mx-auto mb-3" />
                    <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                      Управление учениками доступно в разделе "Ученики"
                    </p>
                    <Link to="/author/students">
                      <Button variant="outline" className="mt-4">
                        Перейти к ученикам
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="w-12 h-12 text-[#8A8A9A] mx-auto mb-3" />
                    <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                      Детальная аналитика доступна в разделе "Аналитика"
                    </p>
                    <Link to="/author/analytics">
                      <Button variant="outline" className="mt-4">
                        Перейти к аналитике
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-[14px] font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Статистика курса
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>Модулей</span>
                    <span className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>Уроков</span>
                    <span className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>16</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>Учеников</span>
                    <span className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>342</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>Доходимость</span>
                    <span className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>68%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Content */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-[14px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Добавить контент
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-3" size="sm">
                    <div className="w-8 h-8 rounded-lg bg-[#FFE5D9] flex items-center justify-center">
                      <Video className="w-4 h-4 text-[#FF6B6B]" />
                    </div>
                    Видео урок
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" size="sm">
                    <div className="w-8 h-8 rounded-lg bg-[#EDE9FF] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#7C6AF7]" />
                    </div>
                    Текст
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" size="sm">
                    <div className="w-8 h-8 rounded-lg bg-[#F5E642] flex items-center justify-center">
                      <CheckSquare className="w-4 h-4 text-[#5A5000]" />
                    </div>
                    Тест
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" size="sm">
                    <div className="w-8 h-8 rounded-lg bg-[#C5E8A0] flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#2D5016]" />
                    </div>
                    Домашка
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-[#FFF4DC] border-0">
              <CardContent className="p-5">
                <h3 className="text-[13px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  💡 Совет
                </h3>
                <p className="text-[11px] text-[#1A1A2E]/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  Чередуйте типы контента для лучшего усвоения материала. Рекомендуем добавлять тест после каждых 2-3 уроков.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
