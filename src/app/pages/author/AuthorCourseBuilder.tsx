import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  ArrowLeft, Save, Plus, Video, FileText, CheckSquare, BookOpen, Trash2, Edit, ChevronDown, ChevronUp
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { toast } from 'sonner';
import { Lesson } from '../../types';

const lessonIcons = {
  video: Video,
  text: FileText,
  quiz: CheckSquare,
  homework: BookOpen,
  audio: FileText,
  file: FileText,
};

const lessonLabels = {
  video: 'Видео',
  text: 'Текст',
  quiz: 'Тест',
  homework: 'Домашка',
  audio: 'Аудио',
  file: 'Файл',
};

export function AuthorCourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const { getCourse, createCourse, updateCourse, deleteCourse, addModule, updateModule, deleteModule, addLesson, updateLesson, deleteLesson } = useDataStore();

  const existingCourse = !isNew ? getCourse(id!) : undefined;
  const [courseId, setCourseId] = useState<string | undefined>(existingCourse?.id);
  const course = courseId ? getCourse(courseId) : undefined;

  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [cover, setCover] = useState(course?.cover || '');
  const [status, setStatus] = useState<'draft' | 'published'>(course?.status === 'archived' ? 'draft' : (course?.status || 'draft'));
  const [expandedModule, setExpandedModule] = useState<string | null>(course?.modules[0]?.id || null);

  // Sync local state when course changes
  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setCover(course.cover || '');
      setStatus(course.status === 'archived' ? 'draft' : course.status);
    }
  }, [course?.id]);

  // Module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [moduleEditId, setModuleEditId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');

  // Lesson dialog
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [lessonEditId, setLessonEditId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<Lesson['type']>('video');
  const [lessonContent, setLessonContent] = useState('');

  // Delete confirmations
  const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [deleteLessonInfo, setDeleteLessonInfo] = useState<{ moduleId: string; lessonId: string } | null>(null);

  const handleSaveCourse = () => {
    if (!title.trim()) {
      toast.error('Введите название курса');
      return;
    }
    if (isNew && !courseId) {
      const newCourse = createCourse({ title, description, cover, status });
      setCourseId(newCourse.id);
      toast.success('Курс создан!');
      navigate(`/author/courses/${newCourse.id}`, { replace: true });
    } else if (courseId) {
      updateCourse(courseId, { title, description, cover, status });
      toast.success('Курс сохранён!');
    }
  };

  const handleAddModule = () => {
    setModuleEditId(null);
    setModuleTitle('');
    setModuleDialogOpen(true);
  };

  const handleEditModule = (mid: string, currentTitle: string) => {
    setModuleEditId(mid);
    setModuleTitle(currentTitle);
    setModuleDialogOpen(true);
  };

  const submitModule = () => {
    if (!moduleTitle.trim() || !courseId) return;
    if (moduleEditId) {
      updateModule(courseId, moduleEditId, { title: moduleTitle });
      toast.success('Модуль обновлён');
    } else {
      const m = addModule(courseId, moduleTitle);
      setExpandedModule(m.id);
      toast.success('Модуль добавлен');
    }
    setModuleDialogOpen(false);
  };

  const handleAddLesson = (moduleId: string) => {
    setLessonModuleId(moduleId);
    setLessonEditId(null);
    setLessonTitle('');
    setLessonType('video');
    setLessonContent('');
    setLessonDialogOpen(true);
  };

  const handleEditLesson = (moduleId: string, lesson: Lesson) => {
    setLessonModuleId(moduleId);
    setLessonEditId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonType(lesson.type);
    setLessonContent(typeof lesson.content?.data === 'object' ? (lesson.content.data.url || lesson.content.data.html || lesson.content.data.instructions || '') : '');
    setLessonDialogOpen(true);
  };

  const submitLesson = () => {
    if (!lessonTitle.trim() || !lessonModuleId || !courseId) return;
    let content;
    if (lessonType === 'video') {
      content = { type: 'video' as const, data: { url: lessonContent } };
    } else if (lessonType === 'text') {
      content = { type: 'text' as const, data: { html: lessonContent } };
    } else if (lessonType === 'homework') {
      content = { type: 'homework' as const, data: { instructions: lessonContent, deadline: new Date(Date.now() + 7 * 86400000).toISOString() } };
    } else {
      content = { type: lessonType, data: { description: lessonContent } };
    }

    if (lessonEditId) {
      updateLesson(courseId, lessonModuleId, lessonEditId, { title: lessonTitle, type: lessonType, content });
      toast.success('Урок обновлён');
    } else {
      addLesson(courseId, lessonModuleId, { title: lessonTitle, type: lessonType, content });
      toast.success('Урок добавлен');
    }
    setLessonDialogOpen(false);
  };

  const handleDeleteCourse = () => {
    if (!courseId) return;
    deleteCourse(courseId);
    toast.success('Курс удалён');
    navigate('/author/courses');
  };

  if (!isNew && !course) {
    return (
      <div className="p-6">
        <Card className="border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-[24px] font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Курс не найден</h2>
            <Link to="/author/courses">
              <Button>← К списку курсов</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/author/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[24px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
              {isNew && !courseId ? 'Новый курс' : title || 'Без названия'}
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              {isNew && !courseId ? 'Создайте свой первый курс' : 'Редактирование курса'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'published' ? 'success' : 'secondary'}>
            {status === 'published' ? 'Опубликован' : 'Черновик'}
          </Badge>
          {courseId && (
            <Button variant="outline" size="sm" onClick={() => setDeleteCourseOpen(true)}>
              <Trash2 className="w-4 h-4 mr-1" />Удалить
            </Button>
          )}
          <Button onClick={handleSaveCourse} className="transition-transform active:scale-[0.98]">
            <Save className="w-4 h-4 mr-2" />Сохранить
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="bg-white border-0 p-1 rounded-xl">
          <TabsTrigger value="content" className="rounded-lg">Содержимое</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {!courseId ? (
            <Card className="border-0">
              <CardContent className="p-12 text-center">
                <p className="text-[13px] text-[#8A8A9A] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                  Сначала сохраните курс (введите название и нажмите "Сохранить")
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {course?.modules.length === 0 ? (
                <Card className="border-0">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-[#8A8A9A] mx-auto mb-4" strokeWidth={1.5} />
                    <h3 className="text-[18px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      Нет модулей
                    </h3>
                    <p className="text-[13px] text-[#8A8A9A] mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                      Добавьте первый модуль чтобы начать
                    </p>
                    <Button onClick={handleAddModule}>
                      <Plus className="w-4 h-4 mr-2" />Добавить модуль
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {course?.modules.map((module, mIndex) => {
                    const expanded = expandedModule === module.id;
                    return (
                      <Card key={module.id} className="border-0 overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-center gap-3 p-4 hover:bg-[#F5F4F2]/50 transition-colors">
                            <span className="w-8 h-8 rounded-lg bg-[#EDE9FF] text-[#7C6AF7] text-xs font-semibold flex items-center justify-center" style={{ fontFamily: 'var(--font-heading)' }}>
                              {mIndex + 1}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-[14px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                                {module.title}
                              </h3>
                              <p className="text-[12px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                                {module.lessons.length} {module.lessons.length === 1 ? 'урок' : 'уроков'}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleEditModule(module.id, module.title)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteModuleId(module.id)}>
                              <Trash2 className="w-4 h-4 text-[#FF6B6B]" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setExpandedModule(expanded ? null : module.id)}>
                              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </div>

                          {expanded && (
                            <div className="border-t border-[#1A1A2E]/5 bg-[#F5F4F2]/30">
                              {module.lessons.map((lesson, lIndex) => {
                                const Icon = lessonIcons[lesson.type] || FileText;
                                return (
                                  <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors border-b border-[#1A1A2E]/5 last:border-0">
                                    <span className="text-[12px] text-[#8A8A9A] w-6" style={{ fontFamily: 'var(--font-body)' }}>
                                      {mIndex + 1}.{lIndex + 1}
                                    </span>
                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                      <Icon className="w-4 h-4 text-[#7C6AF7]" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[13px] font-medium text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                                        {lesson.title}
                                      </p>
                                      <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                                        {lessonLabels[lesson.type]}
                                      </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditLesson(module.id, lesson)}>
                                      <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteLessonInfo({ moduleId: module.id, lessonId: lesson.id })}>
                                      <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
                                    </Button>
                                  </div>
                                );
                              })}
                              <div className="p-3">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddLesson(module.id)}>
                                  <Plus className="w-4 h-4 mr-2" />Добавить урок
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  <Button variant="outline" className="w-full" onClick={handleAddModule}>
                    <Plus className="w-4 h-4 mr-2" />Добавить модуль
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-0">
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="title">Название курса</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Основы UI/UX" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Кратко опишите ваш курс" rows={4} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="cover">Обложка (URL картинки)</Label>
                <Input id="cover" value={cover} onChange={e => setCover(e.target.value)} placeholder="https://..." className="mt-1.5" />
              </div>
              <div>
                <Label>Статус</Label>
                <Select value={status} onValueChange={(v: 'draft' | 'published') => setStatus(v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="published">Опубликован</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveCourse} className="w-full">
                <Save className="w-4 h-4 mr-2" />Сохранить настройки
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{moduleEditId ? 'Редактировать модуль' : 'Новый модуль'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="module-title">Название</Label>
              <Input id="module-title" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} placeholder="Например: Введение" autoFocus className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Отмена</Button>
            <Button onClick={submitModule}>{moduleEditId ? 'Сохранить' : 'Добавить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{lessonEditId ? 'Редактировать урок' : 'Новый урок'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="lesson-title">Название</Label>
              <Input id="lesson-title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="Название урока" autoFocus className="mt-1.5" />
            </div>
            <div>
              <Label>Тип урока</Label>
              <Select value={lessonType} onValueChange={(v: Lesson['type']) => setLessonType(v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="text">Текст</SelectItem>
                  <SelectItem value="homework">Домашка</SelectItem>
                  <SelectItem value="quiz">Тест</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lesson-content">
                {lessonType === 'video' ? 'YouTube embed URL' : lessonType === 'text' ? 'HTML контент' : 'Содержимое'}
              </Label>
              {lessonType === 'video' ? (
                <Input id="lesson-content" value={lessonContent} onChange={e => setLessonContent(e.target.value)} placeholder="https://www.youtube.com/embed/..." className="mt-1.5" />
              ) : (
                <Textarea id="lesson-content" value={lessonContent} onChange={e => setLessonContent(e.target.value)} rows={6} placeholder={lessonType === 'text' ? '<p>Ваш контент...</p>' : 'Инструкции к заданию'} className="mt-1.5" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>Отмена</Button>
            <Button onClick={submitLesson}>{lessonEditId ? 'Сохранить' : 'Добавить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <AlertDialog open={deleteCourseOpen} onOpenChange={setDeleteCourseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить курс?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить. Все модули, уроки и записи учеников будут удалены.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-[#FF6B6B] hover:bg-[#E55555]">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteModuleId} onOpenChange={(o) => !o && setDeleteModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить модуль?</AlertDialogTitle>
            <AlertDialogDescription>Все уроки модуля будут удалены.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (courseId && deleteModuleId) { deleteModule(courseId, deleteModuleId); toast.success('Модуль удалён'); setDeleteModuleId(null); } }}
              className="bg-[#FF6B6B] hover:bg-[#E55555]"
            >Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteLessonInfo} onOpenChange={(o) => !o && setDeleteLessonInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить урок?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (courseId && deleteLessonInfo) { deleteLesson(courseId, deleteLessonInfo.moduleId, deleteLessonInfo.lessonId); toast.success('Урок удалён'); setDeleteLessonInfo(null); } }}
              className="bg-[#FF6B6B] hover:bg-[#E55555]"
            >Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
