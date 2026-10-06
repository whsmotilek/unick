import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  ArrowLeft, Save, Plus, Video, FileText, CheckSquare, BookOpen, Trash2, Edit, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown, Paperclip, Eye, Users,
} from 'lucide-react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Course, CourseAccessType, Lesson } from '../../types';
import { LessonEditorDialog, type LessonDraft } from '../../components/author/LessonEditorDialog';
import { CourseAccessPanel } from '../../components/author/CourseAccessPanel';
import { FileUpload } from '../../components/lesson/FileUpload';
import { LESSON_TYPE_LABELS } from '../../lib/lessonContent';
import { PageSkeleton } from '../../components/skeletons/PageSkeleton';

const lessonIcons: Record<Lesson['type'], typeof Video> = {
  video: Video,
  text: FileText,
  quiz: CheckSquare,
  homework: BookOpen,
  audio: FileText,
  file: Paperclip,
};

const ACCESS_LABELS: Record<CourseAccessType, { title: string; hint: string }> = {
  invite: { title: 'По приглашению', hint: 'Ученики попадают в курс по вашей ссылке или вы добавляете их вручную.' },
  free: { title: 'Свободная запись', hint: 'Любой зарегистрированный пользователь может записаться бесплатно из каталога.' },
  paid: { title: 'Платный', hint: 'Приём оплаты на платформе появится позже. Пока выдавайте доступ ссылкой после оплаты.' },
};

function CourseSettings({ course, onSaved }: { course: Course | undefined; onSaved: (c: Partial<Course>) => void }) {
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [cover, setCover] = useState(course?.cover || '');
  const [status, setStatus] = useState<'draft' | 'published'>(course?.status === 'published' ? 'published' : 'draft');
  const [accessType, setAccessType] = useState<CourseAccessType>(course?.accessType || 'invite');
  const [price, setPrice] = useState(course?.price ? String(course.price) : '');
  const [sequential, setSequential] = useState(course?.sequential ?? false);

  useEffect(() => {
    if (!course) return;
    setTitle(course.title);
    setDescription(course.description);
    setCover(course.cover || '');
    setStatus(course.status === 'published' ? 'published' : 'draft');
    setAccessType(course.accessType);
    setPrice(course.price ? String(course.price) : '');
    setSequential(course.sequential);
  }, [course?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    if (!title.trim()) { toast.error('Введите название курса'); return; }
    const priceNum = price ? Number(price) : undefined;
    if (accessType === 'paid' && (!priceNum || priceNum <= 0)) { toast.error('Укажите цену курса'); return; }
    onSaved({ title: title.trim(), description, cover: cover || undefined, status, accessType, price: priceNum, sequential });
  };

  return (
    <Card className="border-0">
      <CardContent className="p-6 space-y-5">
        <div>
          <Label htmlFor="title">Название курса</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Акварель с нуля" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Чему научится ученик, для кого курс, сколько длится" rows={4} className="mt-1.5" />
        </div>
        <div>
          <Label>Обложка</Label>
          <div className="mt-1.5 flex items-center gap-4">
            <div className="w-40 aspect-video rounded-xl bg-[#F5F4F2] overflow-hidden flex items-center justify-center">
              {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-8 h-8 text-[#8A8A9A]" strokeWidth={1.5} />}
            </div>
            {course ? (
              <div className="flex flex-col gap-2">
                <FileUpload bucket="covers" pathPrefix={course.id} accept="image/png,image/jpeg,image/webp" label="Загрузить картинку"
                  onUploaded={f => setCover(f.path)} />
                {cover && <Button variant="ghost" size="sm" onClick={() => setCover('')}>Убрать</Button>}
              </div>
            ) : (
              <p className="text-xs text-[#8A8A9A]">Загрузить обложку можно после создания курса</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="course-access">Доступ к курсу</Label>
            <Select value={accessType} onValueChange={(v: CourseAccessType) => setAccessType(v)}>
              <SelectTrigger id="course-access" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ACCESS_LABELS) as CourseAccessType[]).map(k => <SelectItem key={k} value={k}>{ACCESS_LABELS[k].title}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#8A8A9A] mt-1.5">{ACCESS_LABELS[accessType].hint}</p>
          </div>
          {accessType === 'paid' && (
            <div>
              <Label htmlFor="price">Цена, ₽</Label>
              <Input id="price" type="number" min={1} value={price} onChange={e => setPrice(e.target.value)} className="mt-1.5" />
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 rounded-xl bg-[#F5F4F2] p-4">
          <div>
            <p className="text-sm font-medium text-[#1A1A2E]">Уроки по порядку</p>
            <p className="text-xs text-[#8A8A9A]">Следующий урок открывается после завершения предыдущего; домашнее задание — после того как его примут.</p>
          </div>
          <Switch aria-label="Уроки по порядку" checked={sequential} onCheckedChange={setSequential} />
        </div>

        <div>
          <Label htmlFor="course-status">Статус</Label>
          <Select value={status} onValueChange={(v: 'draft' | 'published') => setStatus(v)}>
            <SelectTrigger id="course-status" className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Черновик — виден только вам</SelectItem>
              <SelectItem value="published">Опубликован — ученики могут вступить</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={save} className="w-full">
          <Save className="w-4 h-4 mr-2" />{course ? 'Сохранить настройки' : 'Создать курс'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AuthorCourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const isNew = !id || id === 'new';
  const { user } = useAuth();
  const {
    loading, getCourse, createCourse, updateCourse, deleteCourse, addModule, updateModule, deleteModule, moveModule,
    addLesson, updateLesson, deleteLesson, moveLesson, enrollmentRecords, saveQuizKey,
  } = useDataStore();

  const course = !isNew ? getCourse(id!) : undefined;
  const tab = params.get('tab') || (isNew ? 'settings' : 'content');
  const setTab = (t: string) => setParams(p => { p.set('tab', t); return p; }, { replace: true });

  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  useEffect(() => {
    if (course && expandedModule === null) setExpandedModule(course.modules[0]?.id ?? null);
  }, [course, expandedModule]);

  // Модуль
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [moduleEditId, setModuleEditId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');

  // Урок
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Удаление
  const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [deleteLessonInfo, setDeleteLessonInfo] = useState<{ moduleId: string; lessonId: string } | null>(null);

  if (loading) return <PageSkeleton />;

  const handleSettingsSaved = (patch: Partial<Course>) => {
    if (!course) {
      if (!user?.schoolId) { toast.error('У аккаунта нет школы. Курсы может создавать только автор.'); return; }
      const created = createCourse(patch);
      toast.success('Курс создан. Добавьте модули и уроки');
      navigate(`/author/courses/${created.id}?tab=content`, { replace: true });
      return;
    }
    updateCourse(course.id, patch);
    toast.success('Настройки сохранены');
  };

  const openModuleDialog = (mid: string | null, currentTitle = '') => {
    setModuleEditId(mid);
    setModuleTitle(currentTitle);
    setModuleDialogOpen(true);
  };

  const submitModule = () => {
    if (!moduleTitle.trim() || !course) return;
    if (moduleEditId) {
      updateModule(course.id, moduleEditId, { title: moduleTitle.trim() });
    } else {
      const m = addModule(course.id, moduleTitle.trim());
      setExpandedModule(m.id);
    }
    setModuleDialogOpen(false);
  };

  const openLessonDialog = (moduleId: string, lesson: Lesson | null) => {
    setLessonModuleId(moduleId);
    setEditingLesson(lesson);
    setLessonDialogOpen(true);
  };

  const saveLesson = (draft: LessonDraft) => {
    if (!course || !lessonModuleId) return;
    const content = { type: draft.type, data: draft.data };
    let lessonId: string;
    if (editingLesson) {
      updateLesson(course.id, lessonModuleId, editingLesson.id, { title: draft.title, type: draft.type, content });
      lessonId = editingLesson.id;
      toast.success('Урок сохранён');
    } else {
      lessonId = addLesson(course.id, lessonModuleId, { title: draft.title, type: draft.type, content }).id;
      toast.success('Урок добавлен');
    }
    // Правильные ответы теста живут отдельно от урока: ученикам они не отдаются
    if (draft.type === 'quiz' && draft.quizKey) {
      saveQuizKey({ lessonId, courseId: course.id, ...draft.quizKey });
    }
    setLessonDialogOpen(false);
  };

  const handleDeleteCourse = () => {
    if (!course) return;
    deleteCourse(course.id);
    toast.success('Курс удалён');
    navigate('/author/courses');
  };

  if (!isNew && !course) {
    return (
      <div className="p-6">
        <Card className="border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-[24px] font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Курс не найден</h2>
            <Button asChild><Link to="/author/courses">← К списку курсов</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentsCount = course ? enrollmentRecords.filter(e => e.courseId === course.id && e.status !== 'revoked').length : 0;
  const firstLesson = course?.modules.flatMap(m => m.lessons)[0];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="icon" aria-label="Назад"><Link to="/author/courses"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <div className="min-w-0">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-heading)' }}>
              {course?.title || 'Новый курс'}
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              {course ? `${course.modules.length} модулей · ${course.modules.reduce((s, m) => s + m.lessons.length, 0)} уроков · ${studentsCount} учеников` : 'Название, описание и доступ'}
            </p>
          </div>
        </div>
        {course && (
          <div className="flex items-center gap-2">
            <Badge variant={course.status === 'published' ? 'success' : 'secondary'}>
              {course.status === 'published' ? 'Опубликован' : 'Черновик'}
            </Badge>
            {firstLesson && (
              <Button asChild variant="outline" size="sm"><Link to={`/author/courses/${course.id}/preview/${firstLesson.id}`}><Eye className="w-4 h-4 mr-1" />Как видит ученик</Link></Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setDeleteCourseOpen(true)} aria-label="Удалить курс">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="bg-white border-0 p-1 rounded-xl">
          <TabsTrigger value="content" className="rounded-lg" disabled={!course}>Содержимое</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg">Настройки</TabsTrigger>
          <TabsTrigger value="access" className="rounded-lg" disabled={!course}>
            <Users className="w-3.5 h-3.5 mr-1.5" />Ученики и доступ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {course && course.modules.length === 0 ? (
            <Card className="border-0">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-[#8A8A9A] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-[18px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Добавьте первый модуль</h3>
                <p className="text-[13px] text-[#8A8A9A] mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                  Модуль — это раздел курса. Внутри него будут уроки: видео, тексты, задания и тесты.
                </p>
                <Button onClick={() => openModuleDialog(null)}><Plus className="w-4 h-4 mr-2" />Добавить модуль</Button>
              </CardContent>
            </Card>
          ) : course && (
            <div className="space-y-3">
              {course.modules.map((module, mIndex) => {
                const expanded = expandedModule === module.id;
                return (
                  <Card key={module.id} className="border-0 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                        <span className="w-8 h-8 shrink-0 rounded-lg bg-[#EDE9FF] text-[#7C6AF7] text-xs font-semibold flex items-center justify-center">{mIndex + 1}</span>
                        <button type="button" className="flex-1 min-w-0 text-left" onClick={() => setExpandedModule(expanded ? '' : module.id)}>
                          <h3 className="text-[14px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-heading)' }}>{module.title}</h3>
                          <p className="text-[12px] text-[#8A8A9A]">{module.lessons.length} уроков</p>
                        </button>
                        <Button variant="ghost" size="icon" aria-label="Выше" disabled={mIndex === 0} onClick={() => moveModule(course.id, module.id, -1)}><ArrowUp className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label="Ниже" disabled={mIndex === course.modules.length - 1} onClick={() => moveModule(course.id, module.id, 1)}><ArrowDown className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label="Переименовать" onClick={() => openModuleDialog(module.id, module.title)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label="Удалить модуль" onClick={() => setDeleteModuleId(module.id)}><Trash2 className="w-4 h-4 text-[#FF6B6B]" /></Button>
                        <Button variant="ghost" size="icon" aria-label="Развернуть" onClick={() => setExpandedModule(expanded ? '' : module.id)}>
                          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>

                      {expanded && (
                        <div className="border-t border-[#1A1A2E]/5 bg-[#F5F4F2]/30">
                          {module.lessons.map((lesson, lIndex) => {
                            const Icon = lessonIcons[lesson.type] || FileText;
                            return (
                              <div key={lesson.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-white transition-colors border-b border-[#1A1A2E]/5 last:border-0">
                                <span className="text-[12px] text-[#8A8A9A] w-8 shrink-0">{mIndex + 1}.{lIndex + 1}</span>
                                <div className="w-7 h-7 shrink-0 rounded-lg bg-white flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-[#7C6AF7]" strokeWidth={1.5} />
                                </div>
                                <button type="button" className="flex-1 min-w-0 text-left" onClick={() => openLessonDialog(module.id, lesson)}>
                                  <p className="text-[13px] font-medium text-[#1A1A2E] truncate">{lesson.title}</p>
                                  <p className="text-[11px] text-[#8A8A9A]">{LESSON_TYPE_LABELS[lesson.type]}</p>
                                </button>
                                <Button variant="ghost" size="icon" aria-label="Выше" disabled={lIndex === 0} onClick={() => moveLesson(course.id, module.id, lesson.id, -1)}><ArrowUp className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" aria-label="Ниже" disabled={lIndex === module.lessons.length - 1} onClick={() => moveLesson(course.id, module.id, lesson.id, 1)}><ArrowDown className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" aria-label="Удалить урок" onClick={() => setDeleteLessonInfo({ moduleId: module.id, lessonId: lesson.id })}>
                                  <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
                                </Button>
                              </div>
                            );
                          })}
                          <div className="p-3">
                            <Button variant="outline" size="sm" className="w-full" onClick={() => openLessonDialog(module.id, null)}>
                              <Plus className="w-4 h-4 mr-2" />Добавить урок
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              <Button variant="outline" className="w-full" onClick={() => openModuleDialog(null)}>
                <Plus className="w-4 h-4 mr-2" />Добавить модуль
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <CourseSettings course={course} onSaved={handleSettingsSaved} />
        </TabsContent>

        <TabsContent value="access">
          {course && <CourseAccessPanel course={course} />}
        </TabsContent>
      </Tabs>

      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{moduleEditId ? 'Переименовать модуль' : 'Новый модуль'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); submitModule(); }} className="space-y-4 py-2">
            <div>
              <Label htmlFor="module-title">Название</Label>
              <Input id="module-title" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} placeholder="Например: Введение" autoFocus className="mt-1.5" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModuleDialogOpen(false)}>Отмена</Button>
              <Button type="submit">{moduleEditId ? 'Сохранить' : 'Добавить'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {course && (
        <LessonEditorDialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen} courseId={course.id} initial={editingLesson} onSave={saveLesson} />
      )}

      <AlertDialog open={deleteCourseOpen} onOpenChange={setDeleteCourseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить курс?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить. Модули, уроки, записи учеников и их прогресс будут удалены.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-[#FF6B6B] hover:bg-[#E55555]">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteModuleId} onOpenChange={o => !o && setDeleteModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить модуль?</AlertDialogTitle>
            <AlertDialogDescription>Все уроки модуля и прогресс учеников по ним будут удалены.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (course && deleteModuleId) { deleteModule(course.id, deleteModuleId); setDeleteModuleId(null); } }}
              className="bg-[#FF6B6B] hover:bg-[#E55555]"
            >Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteLessonInfo} onOpenChange={o => !o && setDeleteLessonInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить урок?</AlertDialogTitle>
            <AlertDialogDescription>Прогресс и домашние задания учеников по этому уроку будут удалены.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (course && deleteLessonInfo) { deleteLesson(course.id, deleteLessonInfo.moduleId, deleteLessonInfo.lessonId); setDeleteLessonInfo(null); } }}
              className="bg-[#FF6B6B] hover:bg-[#E55555]"
            >Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
