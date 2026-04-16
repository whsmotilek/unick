import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  Play,
  FileText,
  Video,
  CheckSquare,
  Music,
  FileQuestion,
  Clock,
  Calendar
} from 'lucide-react';
import { mockCourses, mockProgress } from '../../data/mockData';
import { useParams, Link } from 'react-router';

export function CourseView() {
  const { id } = useParams();
  const course = mockCourses.find(c => c.id === id) || mockCourses[0];
  const progress = mockProgress.find(p => p.courseId === course.id);
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'text': return FileText;
      case 'homework': return CheckSquare;
      case 'quiz': return FileQuestion;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Course Header */}
      <div className="relative h-64 rounded-xl overflow-hidden">
        <img 
          src={course.cover} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-sm opacity-90 mb-4">{course.description}</p>
            <div className="flex items-center gap-4">
              <Badge className="bg-white/20 text-white">
                {course.modules.length} модулей
              </Badge>
              <Badge className="bg-white/20 text-white">
                {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} уроков
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold mb-1">Ваш прогресс</h3>
              <p className="text-sm text-slate-500">
                Пройдено {progress?.completedLessons.length || 0} из {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} уроков
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-600">{progress?.progress || 0}%</p>
              <p className="text-xs text-slate-500">завершено</p>
            </div>
          </div>
          <Progress value={progress?.progress || 0} className="h-2" />
        </CardContent>
      </Card>

      {/* Course Content */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Содержание</TabsTrigger>
          <TabsTrigger value="discussions">Обсуждения</TabsTrigger>
          <TabsTrigger value="resources">Материалы</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="space-y-4">
            {course.modules.map((module) => {
              const isExpanded = expandedModules.has(module.id);
              const completedInModule = module.lessons.filter(l => 
                progress?.completedLessons.includes(l.id)
              ).length;
              const moduleProgress = (completedInModule / module.lessons.length) * 100;

              return (
                <Card key={module.id}>
                  <CardContent className="p-0">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{module.title}</h3>
                          {module.description && (
                            <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{completedInModule}/{module.lessons.length}</p>
                          <p className="text-xs text-slate-500">уроков</p>
                        </div>
                        <div className="w-16">
                          <Progress value={moduleProgress} className="h-2" />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-200">
                        {module.lessons.map((lesson) => {
                          const Icon = getIcon(lesson.type);
                          const isCompleted = progress?.completedLessons.includes(lesson.id);
                          
                          return (
                            <Link 
                              key={lesson.id}
                              to={lesson.isLocked ? '#' : `/student/courses/${course.id}/lessons/${lesson.id}`}
                              className={`flex items-center gap-4 p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 ${
                                lesson.isLocked ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-100' : 'bg-slate-100'
                              }`}>
                                {lesson.isLocked ? (
                                  <Lock className="w-5 h-5 text-slate-400" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Icon className="w-5 h-5 text-slate-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{lesson.title}</h4>
                                {lesson.description && (
                                  <p className="text-xs text-slate-500 mt-1">{lesson.description}</p>
                                )}
                              </div>
                              {lesson.type === 'video' && lesson.content.data?.duration && (
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {Math.floor(lesson.content.data.duration / 60)} мин
                                </Badge>
                              )}
                              {!lesson.isLocked && !isCompleted && (
                                <Button size="sm" variant="ghost">
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="discussions">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-slate-500">Обсуждения появятся здесь</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-slate-500">Дополнительные материалы появятся здесь</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
