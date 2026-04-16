import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  Trophy,
  Award,
  Target,
  Zap,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function StudentProgress() {
  const progressData = [
    { week: 'Нед 1', progress: 15 },
    { week: 'Нед 2', progress: 28 },
    { week: 'Нед 3', progress: 42 },
    { week: 'Нед 4', progress: 58 },
    { week: 'Нед 5', progress: 64 },
    { week: 'Нед 6', progress: 75 }
  ];

  const stats = [
    {
      label: 'Текущий уровень',
      value: '3',
      subtitle: '750 / 1000 XP',
      color: 'bg-[#EDE9FF]',
      textColor: 'text-[#7C6AF7]',
      icon: Award
    },
    {
      label: 'Стрик',
      value: '12',
      subtitle: 'дней подряд',
      color: 'bg-[#F5E642]',
      textColor: 'text-[#5A5000]',
      icon: Zap
    },
    {
      label: 'Завершено',
      value: '34',
      subtitle: 'урока',
      color: 'bg-[#C5E8A0]',
      textColor: 'text-[#2D5016]',
      icon: CheckCircle2
    },
    {
      label: 'Достижений',
      value: '8',
      subtitle: 'из 25',
      color: 'bg-[#F9D0E8]',
      textColor: 'text-[#8B2F5C]',
      icon: Trophy
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Первый шаг',
      description: 'Завершите первый урок',
      icon: '🎯',
      unlocked: true,
      date: '15 апр 2026'
    },
    {
      id: 2,
      title: 'Неделя обучения',
      description: '7 дней стрика',
      icon: '🔥',
      unlocked: true,
      date: '22 апр 2026'
    },
    {
      id: 3,
      title: 'Исследователь',
      description: 'Завершите 3 курса',
      icon: '🔍',
      unlocked: true,
      date: '28 апр 2026'
    },
    {
      id: 4,
      title: 'Мастер UI/UX',
      description: 'Завершите курс "Основы UI/UX"',
      icon: '🎨',
      unlocked: true,
      date: '2 мая 2026'
    },
    {
      id: 5,
      title: 'Идеальная сдача',
      description: 'Сдайте домашку на 100%',
      icon: '💯',
      unlocked: true,
      date: '5 мая 2026'
    },
    {
      id: 6,
      title: 'Активный участник',
      description: 'Задайте 10 вопросов',
      icon: '💬',
      unlocked: true,
      date: '7 мая 2026'
    },
    {
      id: 7,
      title: 'Марафонец',
      description: '30 дней стрика',
      icon: '🏃',
      unlocked: true,
      date: '7 мая 2026'
    },
    {
      id: 8,
      title: 'Ранняя пташка',
      description: 'Завершите урок до 9:00',
      icon: '🌅',
      unlocked: true,
      date: '8 мая 2026'
    },
    {
      id: 9,
      title: 'Профессионал',
      description: 'Достигните 4 уровня',
      icon: '⭐',
      unlocked: false
    },
    {
      id: 10,
      title: 'Год обучения',
      description: '365 дней стрика',
      icon: '🎊',
      unlocked: false
    }
  ];

  const levels = [
    { level: 1, title: 'Новичок', minXp: 0, maxXp: 100, unlocked: true },
    { level: 2, title: 'Ученик', minXp: 100, maxXp: 300, unlocked: true },
    { level: 3, title: 'Практикант', minXp: 300, maxXp: 1000, unlocked: true, current: true },
    { level: 4, title: 'Специалист', minXp: 1000, maxXp: 2500, unlocked: false },
    { level: 5, title: 'Эксперт', minXp: 2500, maxXp: 5000, unlocked: false },
    { level: 6, title: 'Мастер', minXp: 5000, maxXp: 10000, unlocked: false }
  ];

  const courseProgress = [
    { course: 'UI/UX Дизайн', progress: 75, lessons: '12/16', color: '#7C6AF7' },
    { course: 'Figma', progress: 45, lessons: '5/11', color: '#FF6B6B' },
    { course: 'Веб-дизайн Pro', progress: 30, lessons: '3/10', color: '#F5E642' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Мой прогресс
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Отслеживайте свои достижения и развитие
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.color} border-0`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <stat.icon className={`w-6 h-6 ${stat.textColor} opacity-70`} strokeWidth={1.5} />
                </div>
                <p className={`text-[28px] font-bold ${stat.textColor} mb-1`} style={{ fontFamily: 'var(--font-heading)' }}>
                  {stat.value}
                </p>
                <p className={`text-[11px] font-medium uppercase tracking-wide ${stat.textColor} opacity-70 mb-1`} style={{ fontFamily: 'var(--font-body)' }}>
                  {stat.label}
                </p>
                <p className={`text-[10px] ${stat.textColor} opacity-60`} style={{ fontFamily: 'var(--font-body)' }}>
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-[18px] font-semibold text-[#1A1A2E] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                  Динамика обучения
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#8A8A9A"
                      style={{ fontSize: '11px', fontFamily: 'var(--font-body)' }}
                    />
                    <YAxis 
                      stroke="#8A8A9A"
                      style={{ fontSize: '11px', fontFamily: 'var(--font-body)' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-body)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="progress" 
                      stroke="#7C6AF7" 
                      strokeWidth={3}
                      dot={{ fill: '#7C6AF7', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-[18px] font-semibold text-[#1A1A2E] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                  Прогресс по курсам
                </h2>
                <div className="space-y-4">
                  {courseProgress.map((course, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: course.color }}
                          />
                          <span className="text-[13px] font-medium text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                            {course.course}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                            {course.lessons}
                          </span>
                          <span className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                            {course.progress}%
                          </span>
                        </div>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                    Достижения
                  </h2>
                  <Badge variant="secondary">8/25</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-xl text-center transition-all ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-br from-[#EDE9FF] to-[#F9D0E8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]' 
                          : 'bg-[#F5F4F2] opacity-50'
                      }`}
                    >
                      <div className="relative mb-3">
                        <div className="text-[36px]">
                          {achievement.unlocked ? achievement.icon : '🔒'}
                        </div>
                        {!achievement.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-[#8A8A9A]" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-[11px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                        {achievement.title}
                      </h3>
                      <p className="text-[9px] text-[#8A8A9A] leading-tight" style={{ fontFamily: 'var(--font-body)' }}>
                        {achievement.description}
                      </p>
                      {achievement.unlocked && achievement.date && (
                        <p className="text-[9px] text-[#7C6AF7] mt-2" style={{ fontFamily: 'var(--font-body)' }}>
                          {achievement.date}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Progress */}
            <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                    Уровень 3
                  </h3>
                  <Award className="w-6 h-6" />
                </div>
                <p className="text-[11px] opacity-90 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                  Практикант
                </p>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>До уровня 4</span>
                    <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-body)' }}>250 XP</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <p className="text-[10px] opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                  750 / 1000 XP
                </p>
              </CardContent>
            </Card>

            {/* Levels */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-[16px] font-semibold text-[#1A1A2E] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Уровни
                </h3>
                <div className="space-y-3">
                  {levels.map((level) => (
                    <div 
                      key={level.level}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        level.current 
                          ? 'bg-gradient-to-r from-[#EDE9FF] to-[#F9D0E8]' 
                          : level.unlocked 
                          ? 'bg-[#F5F4F2]' 
                          : 'bg-white border border-[#1A1A2E]/10 opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        level.current 
                          ? 'bg-white' 
                          : level.unlocked 
                          ? 'bg-white' 
                          : 'bg-[#F5F4F2]'
                      }`}>
                        {level.unlocked ? (
                          <Star className={`w-5 h-5 ${level.current ? 'text-[#7C6AF7]' : 'text-[#8A8A9A]'}`} fill={level.current ? '#7C6AF7' : 'none'} />
                        ) : (
                          <Lock className="w-5 h-5 text-[#8A8A9A]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[13px] font-medium ${level.current ? 'text-[#7C6AF7]' : 'text-[#1A1A2E]'}`} style={{ fontFamily: 'var(--font-body)' }}>
                          Уровень {level.level}: {level.title}
                        </p>
                        <p className="text-[10px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                          {level.minXp} - {level.maxXp} XP
                        </p>
                      </div>
                      {level.current && (
                        <Badge variant="default" className="text-[10px]">Текущий</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Streak Calendar */}
            <Card className="bg-[#FFF4DC] border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#F5E642]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                      Стрик 12 дней!
                    </h3>
                    <p className="text-[11px] text-[#1A1A2E]/70" style={{ fontFamily: 'var(--font-body)' }}>
                      Продолжайте в том же духе
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[#1A1A2E]/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  Не пропустите обучение сегодня, чтобы сохранить стрик и получить бонусные XP!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
