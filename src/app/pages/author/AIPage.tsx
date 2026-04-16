import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Target,
  Lightbulb,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { mockAIInsights } from '../../data/mockData';

export function AIPage() {
  const criticalInsights = mockAIInsights.filter(i => i.severity === 'critical');
  const warningInsights = mockAIInsights.filter(i => i.severity === 'warning');
  const infoInsights = mockAIInsights.filter(i => i.severity === 'info');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI Дашборд
          </h1>
          <p className="text-slate-600 mt-1">Умные рекомендации для роста вашей школы</p>
        </div>
        <Button variant="outline">
          <Target className="w-4 h-4 mr-2" />
          Настроить приоритеты
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-700">Критичных</p>
                <p className="text-2xl font-bold text-red-900">{criticalInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Предупреждений</p>
                <p className="text-2xl font-bold text-amber-900">{warningInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Рекомендаций</p>
                <p className="text-2xl font-bold text-blue-900">{infoInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            Все инсайты ({mockAIInsights.length})
          </TabsTrigger>
          <TabsTrigger value="content">
            Контент ({mockAIInsights.filter(i => i.type === 'content').length})
          </TabsTrigger>
          <TabsTrigger value="students">
            Ученики ({mockAIInsights.filter(i => i.type === 'student').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {mockAIInsights.map((insight) => (
            <Card key={insight.id} className={
              insight.severity === 'critical' ? 'border-red-200' :
              insight.severity === 'warning' ? 'border-amber-200' :
              'border-blue-200'
            }>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`
                    p-3 rounded-xl
                    ${insight.severity === 'critical' ? 'bg-red-100' : ''}
                    ${insight.severity === 'warning' ? 'bg-amber-100' : ''}
                    ${insight.severity === 'info' ? 'bg-blue-100' : ''}
                  `}>
                    {insight.severity === 'critical' && <AlertTriangle className="w-6 h-6 text-red-600" />}
                    {insight.severity === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                    {insight.severity === 'info' && <TrendingUp className="w-6 h-6 text-blue-600" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{insight.title}</h3>
                        <p className="text-slate-600">{insight.description}</p>
                      </div>
                      <Badge variant={
                        insight.severity === 'critical' ? 'destructive' :
                        insight.severity === 'warning' ? 'default' :
                        'secondary'
                      }>
                        {insight.type === 'content' ? 'Контент' : 'Ученики'}
                      </Badge>
                    </div>

                    {insight.evidence && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-slate-700 mb-1">📊 Данные:</p>
                        <p className="text-sm text-slate-600">{insight.evidence}</p>
                      </div>
                    )}

                    {insight.recommendation && (
                      <div className={`
                        rounded-lg p-3 mb-4
                        ${insight.severity === 'critical' ? 'bg-red-50 border border-red-200' : ''}
                        ${insight.severity === 'warning' ? 'bg-amber-50 border border-amber-200' : ''}
                        ${insight.severity === 'info' ? 'bg-blue-50 border border-blue-200' : ''}
                      `}>
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Рекомендация:
                        </p>
                        <p className="text-sm text-slate-700">{insight.recommendation}</p>
                      </div>
                    )}

                    {insight.actionable && (
                      <div className="flex gap-2">
                        <Button size="sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Применить автоматически
                        </Button>
                        <Button size="sm" variant="outline">
                          Просмотреть детали
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          Отложить
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="content">
          {mockAIInsights.filter(i => i.type === 'content').map((insight) => (
            <Card key={insight.id}>
              <CardContent className="p-6">
                <p className="font-medium">{insight.title}</p>
                <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="students">
          {mockAIInsights.filter(i => i.type === 'student').map((insight) => (
            <Card key={insight.id}>
              <CardContent className="p-6">
                <p className="font-medium">{insight.title}</p>
                <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* AI Features */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Возможности AI в Unick
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Автоматический анализ обучения</p>
                <p className="text-xs text-slate-600 mt-1">Система находит точки отвала и предлагает улучшения</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Прогноз оттока учеников</p>
                <p className="text-xs text-slate-600 mt-1">Определение рисков и автоматический прогрев</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Оптимизация контента</p>
                <p className="text-xs text-slate-600 mt-1">Подсказки как улучшить уроки на основе данных</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Увеличение доходимости</p>
                <p className="text-xs text-slate-600 mt-1">AI помогает довести больше учеников до конца</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
