import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, TrendingDown, Users, Eye, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const engagementData = [
  { name: 'Урок 1', completion: 95 },
  { name: 'Урок 2', completion: 87 },
  { name: 'Урок 3', completion: 76 },
  { name: 'Урок 4', completion: 62 },
  { name: 'Урок 5', completion: 48 },
  { name: 'Урок 6', completion: 35 },
];

const revenueData = [
  { month: 'Янв', revenue: 245000 },
  { month: 'Фев', revenue: 312000 },
  { month: 'Мар', revenue: 485000 },
];

export function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Аналитика</h1>
        <p className="text-slate-600 mt-1">Глубокий анализ вашей школы</p>
      </div>

      <Tabs defaultValue="learning">
        <TabsList>
          <TabsTrigger value="learning">Обучение</TabsTrigger>
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="engagement">Вовлеченность</TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Средняя доходимость</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">68%</p>
                <p className="text-xs text-green-600 mt-1">+5% за месяц</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Активных учеников</span>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold">342</p>
                <p className="text-xs text-green-600 mt-1">+28 за неделю</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Ср. время обучения</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold">4.2ч</p>
                <p className="text-xs text-slate-500 mt-1">в неделю</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Доходимость по урокам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completion" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Точки отвала</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="destructive">!</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Урок 4: Методы исследования</p>
                    <p className="text-sm text-slate-600">Падение доходимости на 14%</p>
                    <Progress value={38} className="h-2 mt-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Выручка за месяц</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">₽485,320</p>
                <p className="text-xs text-green-600 mt-1">+12.5% за месяц</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Конверсия</span>
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold">3.2%</p>
                <p className="text-xs text-red-600 mt-1">-0.3% за месяц</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">ARPPU</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">₽12,450</p>
                <p className="text-xs text-green-600 mt-1">+8% за месяц</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Динамика выручки</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 text-center">Детальная аналитика вовлеченности</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
