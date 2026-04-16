import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Plus,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Video,
  FileText,
  CheckSquare,
  Music,
  FileQuestion,
  MoreVertical,
  Save,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react';
import { mockCourses } from '../../data/mockData';
import { useParams } from 'react-router';

const contentTypes = [
  { icon: Video, label: 'Видео', type: 'video' },
  { icon: FileText, label: 'Текст', type: 'text' },
  { icon: CheckSquare, label: 'Домашка', type: 'homework' },
  { icon: FileQuestion, label: 'Тест', type: 'quiz' },
  { icon: Music, label: 'Аудио', type: 'audio' },
];

export function CourseBuilder() {
  const { id } = useParams();
  const course = mockCourses.find(c => c.id === id) || mockCourses[0];
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['module-1']));

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getContentIcon = (type: string) => {
    const contentType = contentTypes.find(t => t.type === type);
    return contentType?.icon || FileText;
  };

  return (
    <div className="h-full flex">
      {/* Left: Course Structure */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-sm mb-3">{course.title}</h2>
          <Button size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить модуль
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {course.modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            return (
              <div key={module.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center gap-2 p-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
                  onClick={() => toggleModule(module.id)}
                >
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="flex-1 text-sm font-medium">{module.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {module.lessons.length}
                  </Badge>
                </div>

                {isExpanded && (
                  <div className="p-2 space-y-1">
                    {module.lessons.map((lesson) => {
                      const Icon = getContentIcon(lesson.type);
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          <GripVertical className="w-3 h-3 text-slate-400" />
                          <Icon className="w-4 h-4 text-slate-600" />
                          <span className="flex-1 text-sm">{lesson.title}</span>
                          {lesson.isLocked && (
                            <Badge variant="outline" className="text-xs">🔒</Badge>
                          )}
                        </div>
                      );
                    })}
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Добавить урок
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: Content Editor */}
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{course.status === 'published' ? 'Опубликован' : 'Черновик'}</Badge>
            <span className="text-sm text-slate-500">
              Последнее изменение: {new Date(course.updatedAt).toLocaleString('ru-RU')}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Предпросмотр
            </Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList>
              <TabsTrigger value="content">Контент</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="access">Доступы</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Редактор урока</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название урока</label>
                    <Input placeholder="Введите название..." defaultValue="Что такое UI и UX?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Textarea 
                      placeholder="Краткое описание урока..." 
                      rows={3}
                      defaultValue="Разбираем основные понятия и различия"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Блоки контента</label>
                    <div className="space-y-2">
                      <Card className="border-2 border-indigo-200 bg-indigo-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Video className="w-5 h-5 text-indigo-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Видео: Введение в UI/UX</p>
                              <p className="text-xs text-slate-500">12:00 мин</p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex gap-2 flex-wrap">
                        {contentTypes.map((type) => (
                          <Button 
                            key={type.type} 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                          >
                            <type.icon className="w-3 h-3 mr-1" />
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Настройки курса</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название курса</label>
                    <Input defaultValue={course.title} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Textarea rows={4} defaultValue={course.description} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Правила доступа</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Drip-контент</p>
                        <p className="text-xs text-slate-500">Уроки открываются по расписанию</p>
                      </div>
                      <Button variant="outline" size="sm">Настроить</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Пререквизиты</p>
                        <p className="text-xs text-slate-500">Условия для доступа к урокам</p>
                      </div>
                      <Button variant="outline" size="sm">Настроить</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Дедлайны</p>
                        <p className="text-xs text-slate-500">Сроки выполнения заданий</p>
                      </div>
                      <Button variant="outline" size="sm">Настроить</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: Properties Panel */}
      <div className="w-80 border-l border-slate-200 bg-white p-4 overflow-y-auto">
        <h3 className="font-semibold text-sm mb-4">Свойства</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Тип урока</label>
            <Badge>Видео-урок</Badge>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Длительность</label>
            <Input type="number" placeholder="12" className="text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Порядок</label>
            <Input type="number" placeholder="1" className="text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-2">
              <input type="checkbox" />
              <span>Обязательный для прохождения</span>
            </label>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-2">
              <input type="checkbox" />
              <span>Заблокирован</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
