import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Palette,
  Type,
  Image,
  Layout,
  Sparkles,
  Eye,
  Save,
  Upload,
  Wand2,
  Download,
  Copy,
  RefreshCw,
  Moon,
  Sun,
  Zap,
  Heart,
  Star,
  Globe
} from 'lucide-react';

export function CourseUniverse() {
  const [selectedTheme, setSelectedTheme] = useState('marvel');
  const [customColors, setCustomColors] = useState({
    primary: '#7C6AF7',
    secondary: '#FF6B6B',
    background: '#F5F4F2',
    text: '#1A1A2E'
  });

  const universeThemes = [
    {
      id: 'marvel',
      name: 'Marvel Universe',
      description: 'Яркая вселенная супергероев для дизайна',
      category: 'Design',
      preview: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=400&h=300&fit=crop',
      colors: {
        primary: '#E23636',
        secondary: '#FFD700',
        accent: '#1E3A8A',
        background: '#0F172A',
        text: '#FFFFFF'
      },
      fonts: {
        heading: 'Bebas Neue, sans-serif',
        body: 'Roboto, sans-serif'
      },
      style: 'bold',
      icon: '⚡'
    },
    {
      id: 'oxford',
      name: 'Oxford Academia',
      description: 'Классический академический стиль для математики',
      category: 'Education',
      preview: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
      colors: {
        primary: '#002147',
        secondary: '#C4A04A',
        accent: '#8B0000',
        background: '#F9F7F4',
        text: '#1A1A1A'
      },
      fonts: {
        heading: 'Playfair Display, serif',
        body: 'Crimson Text, serif'
      },
      style: 'classic',
      icon: '📚'
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk 2077',
      description: 'Неоновый киберпанк для IT и программирования',
      category: 'Technology',
      preview: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
      colors: {
        primary: '#00F0FF',
        secondary: '#FF2A6D',
        accent: '#FFED4E',
        background: '#0A0E27',
        text: '#E0E0E0'
      },
      fonts: {
        heading: 'Orbitron, sans-serif',
        body: 'Share Tech Mono, monospace'
      },
      style: 'futuristic',
      icon: '🤖'
    },
    {
      id: 'nature',
      name: 'Nature & Wellness',
      description: 'Спокойные природные тона для wellness',
      category: 'Wellness',
      preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      colors: {
        primary: '#4A7C59',
        secondary: '#D4A373',
        accent: '#E9C46A',
        background: '#F7F4EF',
        text: '#2C3E50'
      },
      fonts: {
        heading: 'Libre Baskerville, serif',
        body: 'Lora, serif'
      },
      style: 'organic',
      icon: '🌿'
    },
    {
      id: 'minimalist',
      name: 'Minimal Swiss',
      description: 'Швейцарский минимализм для бизнеса',
      category: 'Business',
      preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#FF0000',
        background: '#FAFAFA',
        text: '#1A1A1A'
      },
      fonts: {
        heading: 'Helvetica Neue, sans-serif',
        body: 'Inter, sans-serif'
      },
      style: 'minimal',
      icon: '⬛'
    },
    {
      id: 'retro',
      name: 'Retro Arcade',
      description: 'Ретро-игровой стиль 80-х',
      category: 'Creative',
      preview: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
      colors: {
        primary: '#FF6B9D',
        secondary: '#C69DFF',
        accent: '#FFC759',
        background: '#2D1B69',
        text: '#FFFFFF'
      },
      fonts: {
        heading: 'Press Start 2P, cursive',
        body: 'VT323, monospace'
      },
      style: 'retro',
      icon: '🕹️'
    }
  ];

  const currentTheme = universeThemes.find(t => t.id === selectedTheme) || universeThemes[0];

  const componentStyles = [
    { id: 'cards', name: 'Карточки', options: ['Rounded', 'Sharp', 'Neumorphic', 'Glass'] },
    { id: 'buttons', name: 'Кнопки', options: ['Filled', 'Outlined', '3D', 'Gradient'] },
    { id: 'badges', name: 'Бейджи', options: ['Pill', 'Square', 'Minimal', 'Bold'] },
    { id: 'progress', name: 'Прогресс', options: ['Bar', 'Circle', 'Steps', 'Wave'] }
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#1A1A2E]/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Вселенная курсов
            </h1>
            <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
              Создайте уникальный дизайн и атмосферу для ваших курсов
            </p>
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
          {/* Theme Library */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Themes */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#1A1A2E] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                      Готовые вселенные
                    </h2>
                    <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                      Выберите готовый стиль или создайте свой
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Wand2 className="w-4 h-4" />
                    AI генератор
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {universeThemes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`group cursor-pointer rounded-xl overflow-hidden transition-all ${
                        selectedTheme === theme.id
                          ? 'ring-2 ring-[#7C6AF7] ring-offset-2'
                          : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
                      }`}
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={theme.preview}
                          alt={theme.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[24px]">{theme.icon}</span>
                            <Badge variant="secondary" className="text-[9px]">
                              {theme.category}
                            </Badge>
                          </div>
                          <h3 className="text-[14px] font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                            {theme.name}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white">
                        <p className="text-[11px] text-[#8A8A9A] mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                          {theme.description}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {Object.values(theme.colors).slice(0, 5).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customization */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="colors" className="w-full">
                  <TabsList className="bg-[#F5F4F2] mb-6 p-1 rounded-xl">
                    <TabsTrigger value="colors" className="gap-2">
                      <Palette className="w-4 h-4" />
                      Цвета
                    </TabsTrigger>
                    <TabsTrigger value="typography" className="gap-2">
                      <Type className="w-4 h-4" />
                      Типографика
                    </TabsTrigger>
                    <TabsTrigger value="components" className="gap-2">
                      <Layout className="w-4 h-4" />
                      Компоненты
                    </TabsTrigger>
                    <TabsTrigger value="assets" className="gap-2">
                      <Image className="w-4 h-4" />
                      Ассеты
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="colors" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary-color" className="text-[13px] mb-2 block">
                          Основной цвет
                        </Label>
                        <div className="flex gap-2">
                          <div
                            className="w-12 h-12 rounded-xl border-2 border-[#1A1A2E]/10 shadow-sm"
                            style={{ backgroundColor: currentTheme.colors.primary }}
                          />
                          <Input
                            id="primary-color"
                            type="text"
                            defaultValue={currentTheme.colors.primary}
                            className="flex-1 h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondary-color" className="text-[13px] mb-2 block">
                          Вторичный цвет
                        </Label>
                        <div className="flex gap-2">
                          <div
                            className="w-12 h-12 rounded-xl border-2 border-[#1A1A2E]/10 shadow-sm"
                            style={{ backgroundColor: currentTheme.colors.secondary }}
                          />
                          <Input
                            id="secondary-color"
                            type="text"
                            defaultValue={currentTheme.colors.secondary}
                            className="flex-1 h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="accent-color" className="text-[13px] mb-2 block">
                          Акцентный цвет
                        </Label>
                        <div className="flex gap-2">
                          <div
                            className="w-12 h-12 rounded-xl border-2 border-[#1A1A2E]/10 shadow-sm"
                            style={{ backgroundColor: currentTheme.colors.accent }}
                          />
                          <Input
                            id="accent-color"
                            type="text"
                            defaultValue={currentTheme.colors.accent}
                            className="flex-1 h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="background-color" className="text-[13px] mb-2 block">
                          Фон
                        </Label>
                        <div className="flex gap-2">
                          <div
                            className="w-12 h-12 rounded-xl border-2 border-[#1A1A2E]/10 shadow-sm"
                            style={{ backgroundColor: currentTheme.colors.background }}
                          />
                          <Input
                            id="background-color"
                            type="text"
                            defaultValue={currentTheme.colors.background}
                            className="flex-1 h-12 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#1A1A2E]/5">
                      <p className="text-[11px] text-[#8A8A9A] mb-3">Готовые палитры:</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm">Теплая</Button>
                        <Button variant="outline" size="sm">Холодная</Button>
                        <Button variant="outline" size="sm">Монохром</Button>
                        <Button variant="outline" size="sm">Пастель</Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Sparkles className="w-3 h-3" />
                          AI подбор
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="typography" className="space-y-4">
                    <div>
                      <Label className="text-[13px] mb-3 block">Шрифт для заголовков</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Bebas Neue', 'Playfair Display', 'Montserrat', 'Oswald'].map((font) => (
                          <button
                            key={font}
                            className="p-4 rounded-xl border-2 border-[#1A1A2E]/10 hover:border-[#7C6AF7] transition-all text-left"
                          >
                            <p className="text-[20px] font-bold mb-1" style={{ fontFamily: font }}>
                              Aa Бб Вв
                            </p>
                            <p className="text-[11px] text-[#8A8A9A]">{font}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-[13px] mb-3 block">Шрифт для текста</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Inter', 'Roboto', 'Open Sans', 'Lato'].map((font) => (
                          <button
                            key={font}
                            className="p-4 rounded-xl border-2 border-[#1A1A2E]/10 hover:border-[#7C6AF7] transition-all text-left"
                          >
                            <p className="text-[16px] mb-1" style={{ fontFamily: font }}>
                              Aa Бб Вв Гг
                            </p>
                            <p className="text-[11px] text-[#8A8A9A]">{font}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="components" className="space-y-4">
                    {componentStyles.map((component) => (
                      <div key={component.id}>
                        <Label className="text-[13px] mb-3 block">{component.name}</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {component.options.map((option) => (
                            <button
                              key={option}
                              className="p-3 rounded-lg border-2 border-[#1A1A2E]/10 hover:border-[#7C6AF7] transition-all"
                            >
                              <p className="text-[11px] text-[#1A1A2E] text-center">{option}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="assets" className="space-y-4">
                    <div>
                      <Label className="text-[13px] mb-3 block">Логотип курса</Label>
                      <div className="border-2 border-dashed border-[#1A1A2E]/20 rounded-xl p-8 text-center hover:border-[#7C6AF7]/40 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-[#8A8A9A] mx-auto mb-2" />
                        <p className="text-[13px] text-[#1A1A2E] mb-1">
                          Перетащите или нажмите для загрузки
                        </p>
                        <p className="text-[11px] text-[#8A8A9A]">
                          PNG, SVG до 2MB
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-[13px] mb-3 block">Фоновое изображение</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="aspect-video rounded-lg border-2 border-[#1A1A2E]/10 hover:border-[#7C6AF7] transition-all cursor-pointer overflow-hidden"
                          >
                            <img
                              src={`https://images.unsplash.com/photo-${1550745165 + i}?w=200&h=150&fit=crop`}
                              alt={`Background ${i}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-[13px] mb-3 block">Иконки и декор</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {['⭐', '🎨', '🚀', '💡', '🔥', '✨', '🎯', '💎', '🌟', '⚡', '🎪', '🎭'].map((icon) => (
                          <button
                            key={icon}
                            className="aspect-square rounded-lg border-2 border-[#1A1A2E]/10 hover:border-[#7C6AF7] transition-all flex items-center justify-center text-[24px]"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                    Предпросмотр
                  </h3>
                  <Button variant="ghost" size="icon">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Theme Preview */}
                <div
                  className="rounded-xl overflow-hidden mb-4 border-2 border-[#1A1A2E]/10"
                  style={{ backgroundColor: currentTheme.colors.background }}
                >
                  <div
                    className="p-6"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                  >
                    <h2
                      className="text-[20px] font-bold mb-2"
                      style={{
                        fontFamily: currentTheme.fonts.heading,
                        color: currentTheme.colors.text === '#FFFFFF' || currentTheme.colors.text === '#E0E0E0' ? '#FFFFFF' : currentTheme.colors.background
                      }}
                    >
                      {currentTheme.name}
                    </h2>
                    <p
                      className="text-[11px] opacity-90"
                      style={{
                        fontFamily: currentTheme.fonts.body,
                        color: currentTheme.colors.text === '#FFFFFF' || currentTheme.colors.text === '#E0E0E0' ? '#FFFFFF' : currentTheme.colors.background
                      }}
                    >
                      Пример курса в этом стиле
                    </p>
                  </div>

                  <div className="p-4 space-y-3">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: currentTheme.colors.secondary + '20' }}
                    >
                      <p
                        className="text-[12px]"
                        style={{
                          fontFamily: currentTheme.fonts.body,
                          color: currentTheme.colors.text
                        }}
                      >
                        Урок 1: Введение
                      </p>
                    </div>

                    <button
                      className="w-full py-2 px-4 rounded-lg font-medium text-[12px]"
                      style={{
                        backgroundColor: currentTheme.colors.accent,
                        color: currentTheme.colors.text === '#FFFFFF' ? '#000000' : '#FFFFFF'
                      }}
                    >
                      Начать обучение
                    </button>

                    <div className="flex gap-2">
                      <div
                        className="flex-1 h-2 rounded-full"
                        style={{ backgroundColor: currentTheme.colors.primary + '40' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: currentTheme.colors.primary,
                            width: '75%'
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px]"
                        style={{ color: currentTheme.colors.text }}
                      >
                        75%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    Полный предпросмотр
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Download className="w-3.5 h-3.5" />
                    Экспорт темы
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Copy className="w-3.5 h-3.5" />
                    Дублировать
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Theme Info */}
            <Card className="bg-gradient-to-br from-[#EDE9FF] to-[#F9D0E8] border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[24px]">
                    {currentTheme.icon}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                      {currentTheme.name}
                    </h3>
                    <p className="text-[10px] text-[#8A8A9A]">{currentTheme.category}</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#1A1A2E]/80 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {currentTheme.description}
                </p>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-[#FFF4DC] border-0">
              <CardContent className="p-5">
                <h3 className="text-[13px] font-semibold text-[#1A1A2E] mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Sparkles className="w-4 h-4 text-[#F5E642]" />
                  Советы по дизайну
                </h3>
                <ul className="space-y-2 text-[11px] text-[#1A1A2E]/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  <li>• Используйте контрастные цвета для важных элементов</li>
                  <li>• Выбирайте не более 3 основных цветов</li>
                  <li>• Шрифты должны быть читаемыми на всех устройствах</li>
                  <li>• Тестируйте дизайн на разных экранах</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}