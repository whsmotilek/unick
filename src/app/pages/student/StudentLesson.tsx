import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  PlayCircle,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Link, useParams } from 'react-router';

export function StudentLesson() {
  const { id, lessonId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedModule, setExpandedModule] = useState<number | null>(1);

  const course = {
    id: id || '1',
    title: 'Основы UI/UX Дизайна',
    progress: 75
  };

  const currentLesson = {
    id: parseInt(lessonId || '1'),
    title: 'Что такое UX дизайн?',
    type: 'video',
    duration: '15 мин',
    content: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'В этом уроке мы познакомимся с основами UX дизайна, узнаем что это такое и почему это важно для создания успешных продуктов.'
    }
  };

  const modules = [
    {
      id: 1,
      title: 'Введение в UI/UX',
      lessons: [
        { id: 1, title: 'Что такое UX дизайн?', type: 'video', duration: '15 мин', completed: true },
        { id: 2, title: 'Основные принципы', type: 'text', duration: '10 мин', completed: true },
        { id: 3, title: 'Тест: Основы UX', type: 'quiz', duration: '5 мин', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Исследование пользователей',
      lessons: [
        { id: 4, title: 'Методы исследования', type: 'video', duration: '20 мин', completed: false },
        { id: 5, title: 'Создание персон', type: 'text', duration: '15 мин', completed: false },
        { id: 6, title: 'Домашка: Интервью', type: 'homework', duration: '30 мин', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Проектирование интерфейсов',
      lessons: [
        { id: 7, title: 'Вайрфреймы', type: 'video', duration: '25 мин', completed: false },
        { id: 8, title: 'Прототипирование', type: 'video', duration: '30 мин', completed: false }
      ]
    }
  ];

  const allLessons = modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-[#1A1A2E]/10 transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="p-6 border-b border-[#1A1A2E]/10">
          <Link to="/student/courses" className="flex items-center gap-2 text-[#8A8A9A] hover:text-[#1A1A2E] mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[13px]" style={{ fontFamily: 'var(--font-body)' }}>Все курсы</span>
          </Link>
          <h2 className="text-[16px] font-semibold text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            {course.title}
          </h2>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>Прогресс курса</span>
              <span className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {modules.map((module) => (
            <div key={module.id} className="border-b border-[#1A1A2E]/5">
              <button
                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#F5F4F2] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedModule === module.id ? (
                    <ChevronDown className="w-4 h-4 text-[#8A8A9A]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#8A8A9A]" />
                  )}
                  <span className="text-[13px] font-medium text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                    {module.title}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {module.lessons.filter(l => l.completed).length}/{module.lessons.length}
                </Badge>
              </button>

              {expandedModule === module.id && (
                <div className="bg-[#F5F4F2]/50">
                  {module.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/student/courses/${course.id}/lesson/${lesson.id}`}
                      className={`flex items-center gap-3 p-3 px-6 hover:bg-white transition-colors ${
                        lesson.id === currentLesson.id ? 'bg-white border-l-4 border-l-[#7C6AF7]' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        lesson.completed ? 'bg-[#C5E8A0]' : 'bg-white border-2 border-[#1A1A2E]/10'
                      }`}>
                        {lesson.completed && <CheckCircle2 className="w-4 h-4 text-[#2D5016]" strokeWidth={2} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-medium truncate ${
                          lesson.id === currentLesson.id ? 'text-[#7C6AF7]' : 'text-[#1A1A2E]'
                        }`} style={{ fontFamily: 'var(--font-body)' }}>
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          {lesson.duration}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-[20px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                {currentLesson.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="text-[10px]">
                  {currentLesson.type === 'video' ? 'Видео' : currentLesson.type === 'text' ? 'Текст' : currentLesson.type === 'quiz' ? 'Тест' : 'Домашка'}
                </Badge>
                <span className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  {currentLesson.duration}
                </span>
              </div>
            </div>
          </div>

          <Button size="sm" variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Задать вопрос
          </Button>
        </header>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Player */}
            {currentLesson.type === 'video' && (
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-black">
                  <iframe
                    className="w-full h-full"
                    src={currentLesson.content.videoUrl}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE9FF] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#7C6AF7]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      О чем этот урок
                    </h3>
                    <p className="text-[13px] text-[#1A1A2E]/80 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      {currentLesson.content.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Материалы урока
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <FileText className="w-4 h-4" />
                    Презентация урока.pdf
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <FileText className="w-4 h-4" />
                    Дополнительные материалы.pdf
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mark as Complete */}
            <Card className="bg-gradient-to-br from-[#C5E8A0] to-[#B5D890] border-0">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    Завершите урок
                  </h3>
                  <p className="text-[13px] text-[#1A1A2E]/70" style={{ fontFamily: 'var(--font-body)' }}>
                    Отметьте урок как пройденный, чтобы продолжить
                  </p>
                </div>
                <Button className="bg-white text-[#2D5016] hover:bg-white/90">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Завершить
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <footer className="bg-white border-t border-[#1A1A2E]/10 px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {prevLesson ? (
              <Link to={`/student/courses/${course.id}/lesson/${prevLesson.id}`}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Предыдущий урок
                </Button>
              </Link>
            ) : (
              <div></div>
            )}

            {nextLesson ? (
              <Link to={`/student/courses/${course.id}/lesson/${nextLesson.id}`}>
                <Button className="gap-2">
                  Следующий урок
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button className="gap-2">
                Завершить курс
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
