import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Download,
  Calendar,
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AuthorAnalytics() {
  const revenueData = [
    { month: 'Янв', revenue: 120000, students: 85 },
    { month: 'Фев', revenue: 195000, students: 142 },
    { month: 'Мар', revenue: 287000, students: 218 },
    { month: 'Апр', revenue: 365000, students: 287 },
    { month: 'Май', revenue: 485000, students: 342 },
    { month: 'Июн', revenue: 520000, students: 398 }
  ];

  const completionData = [
    { lesson: 'Урок 1', completion: 95 },
    { lesson: 'Урок 2', completion: 89 },
    { lesson: 'Урок 3', completion: 84 },
    { lesson: 'Урок 4', completion: 68 },
    { lesson: 'Урок 5', completion: 72 },
    { lesson: 'Урок 6', completion: 65 },
    { lesson: 'Урок 7', completion: 58 },
    { lesson: 'Урок 8', completion: 55 }
  ];

  const courseDistribution = [
    { name: 'UI/UX Дизайн', value: 342, color: '#7C6AF7' },
    { name: 'Figma', value: 215, color: '#FF6B6B' },
    { name: 'Веб-дизайн', value: 128, color: '#F5E642' }
  ];

  const stats = [
    {
      label: 'Доход за месяц',
      value: '₽485K',
      change: '+12.5%',
      trend: 'up',
      color: 'bg-[#C5E8A0]',
      textColor: 'text-[#2D5016]',
      icon: DollarSign
    },
    {
      label: 'Новых учеников',
      value: '128',
      change: '+18%',
      trend: 'up',
      color: 'bg-[#B8D8F8]',
      textColor: 'text-[#0D3B66]',
      icon: Users
    },
    {
      label: 'Средняя доходимость',
      value: '68%',
      change: '+5%',
      trend: 'up',
      color: 'bg-[#EDE9FF]',
      textColor: 'text-[#7C6AF7]',
      icon: Target
    },
    {
      label: 'Активных курсов',
      value: '9',
      change: '+2',
      trend: 'up',
      color: 'bg-[#F5E642]',
      textColor: 'text-[#5A5000]',
      icon: BookOpen
    }
  ];

  const aiInsights = [
    {
      title: 'Урок 4 имеет критичное падение доходимости',
      description: 'Падение на 14% после этого урока. Рекомендуем упростить материал или добавить дополнительные примеры.',
      priority: 'high',
      action: 'Посмотреть урок',
      color: 'bg-[#FFE5D9]',
      icon: AlertTriangle,
      iconColor: 'text-[#FF6B6B]'
    },
    {
      title: 'Пик конверсии в марте',
      description: 'Конверсия выросла на 28% благодаря акции на курс "Figma для начинающих". Рекомендуем повторить.',
      priority: 'medium',
      action: 'Подробнее',
      color: 'bg-[#C5E8A0]',
      icon: TrendingUp,
      iconColor: 'text-[#2D5016]'
    },
    {
      title: 'Оптимальное время для запуска',
      description: 'AI выявил, что вторники и среды в 19:00 - лучшее время для старта новых потоков.',
      priority: 'low',
      action: 'Посмотреть расписание',
      color: 'bg-[#EDE9FF]',
      icon: Calendar,
      iconColor: 'text-[#7C6AF7]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Аналитика
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Детальные метрики и AI-инсайты для вашей школы
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Последние 6 месяцев
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Экспорт
            </Button>
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
                  <div className={`flex items-center gap-1 ${stat.trend === 'up' ? 'text-[#2D5016]' : 'text-[#FF6B6B]'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-medium">{stat.change}</span>
                  </div>
                </div>
                <p className={`text-[28px] font-bold ${stat.textColor} mb-1`} style={{ fontFamily: 'var(--font-heading)' }}>
                  {stat.value}
                </p>
                <p className={`text-[11px] font-medium uppercase tracking-wide ${stat.textColor} opacity-70`} style={{ fontFamily: 'var(--font-body)' }}>
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                      Доход и рост учеников
                    </h2>
                    <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                      Динамика за последние 6 месяцев
                    </p>
                  </div>
                  <Tabs defaultValue="revenue" className="w-auto">
                    <TabsList className="bg-[#F5F4F2] p-1 rounded-lg">
                      <TabsTrigger value="revenue" className="text-xs">Доход</TabsTrigger>
                      <TabsTrigger value="students" className="text-xs">Ученики</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis 
                      dataKey="month" 
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
                      dataKey="revenue" 
                      stroke="#7C6AF7" 
                      strokeWidth={3}
                      dot={{ fill: '#7C6AF7', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Completion Rate Chart */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-[18px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    Доходимость по урокам
                  </h2>
                  <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                    Курс "Основы UI/UX Дизайна"
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis 
                      dataKey="lesson" 
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
                    <Bar 
                      dataKey="completion" 
                      fill="#7C6AF7"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Distribution */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-[16px] font-semibold text-[#1A1A2E] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
                  Распределение учеников
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={courseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {courseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
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
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {courseDistribution.map((course, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: course.color }}
                        />
                        <span className="text-[12px] text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                          {course.name}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>
                        {course.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-[#7C6AF7] to-[#9B8AF9] text-white border-0">
              <CardContent className="p-6">
                <h3 className="text-[14px] font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Быстрая статистика
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>Всего курсов</span>
                    <span className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>Всего уроков</span>
                    <span className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>Всего учеников</span>
                    <span className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>685</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] opacity-90" style={{ fontFamily: 'var(--font-body)' }}>Рейтинг школы</span>
                    <span className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>4.8★</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#7C6AF7]" />
              <h2 className="text-[18px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                AI-Инсайты
              </h2>
              <Badge variant="secondary" className="text-[10px]">Новых: 3</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiInsights.map((insight, index) => (
                <Card 
                  key={index}
                  className={`${insight.color} border-0 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                        <insight.icon className={`w-5 h-5 ${insight.iconColor}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[13px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                          {insight.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#1A1A2E]/70 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                      {insight.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full bg-white hover:bg-white/80"
                    >
                      {insight.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
