СТИЛЬ: Soft Medical Neobrutalism
Сочетание мягкой пастельной палитры, чётких карточек и игривой геометрии. Медицинский интерфейс без стерильности — живой, человечный, информативный.

🎨 Цветовая палитра (Color Styles)
Background:     #F5F4F2  — тёплый офф-вайт
Sidebar BG:     #1A1A2E  — глубокий тёмно-синий/чёрный
Card Yellow:    #F5E642  — яркий лимонный (Patients)
Card Pink:      #F9D0E8  — нежно-розовый (Visits Summary)
Card Green:     #C5E8A0  — мятно-зелёный (By Condition)
Card Blue:      #B8D8F8  — голубой (Sessions)
Card Cream:     #FFF4DC  — кремовый (Visit Details)
Accent Purple:  #7C6AF7  — фиолетовый (кнопки, теги)
Text Primary:   #1A1A2E
Text Muted:     #8A8A9A
White:          #FFFFFF

🔤 Типографика (Text Styles)
Font Family: "Manrope" — основной
Font Family: "DM Sans" — вспомогательный

H1 — Greeting:       Manrope, 32px, Bold, #1A1A2E
H2 — Card Title:     Manrope, 16px, SemiBold, #1A1A2E
Body:                DM Sans, 13px, Regular, #1A1A2E
Caption/Label:       DM Sans, 11px, Medium, #8A8A9A
Sidebar Nav:         Manrope, 13px, Medium, #FFFFFF / #FFFFFF80
Stat Number:         Manrope, 24px, Bold

📐 Сетка и отступы (Grid & Spacing)
Layout:           12-col grid, Gutter 20px, Margin 24px
Card Radius:      16px
Card Padding:     20px
Card Gap:         16px
Sidebar Width:    200px
Top Bar Height:   60px
Spacing Scale:    4 / 8 / 12 / 16 / 20 / 24 / 32 / 48px

🧩 Компоненты (Components)
Sidebar

Фон: #1A1A2E
Логотип: белый, 18px Bold
Nav Item: иконка 18px + текст, padding: 10px 16px, radius: 8px
Active state: белый фон с opacity 15%, текст белый
Inactive: текст #FFFFFF80

Cards (Stats)

Фон: одна из пастельных (Yellow / Pink / Green / Blue)
Radius: 16px
Shadow: 0 2px 12px rgba(0,0,0,0.06)
Title: Manrope 14px SemiBold
Numbers: Manrope 24–28px Bold
Внутренние мини-графики: простые bar или line в тёмном/тёмно-зелёном

Patient List Row

Аватар: круг 36px, цветная обводка по типу пациента
Имя: DM Sans 13px SemiBold
Тип визита: DM Sans 11px, цвет #8A8A9A
Время: pill-тег #F0F0F5, radius 20px, padding 4px 10px

Tag / Pill

Фон: #EDE9FF (лавандовый) или цветные по категории
Текст: 11px Medium, цвет акцент
Radius: 20px
Padding: 4px 12px

Calendar Widget

Фон: белый
Сегодня: круг #1A1A2E, белый текст
Другие дни: DM Sans 12px, #1A1A2E
Заголовок месяца: Manrope 13px SemiBold

Кнопка "Add Event"

Фон: #1A1A2E
Текст: белый, 13px Medium
Radius: 10px
Padding: 10px 20px


💡 Визуальные принципы

Карточки — главный элемент — каждая с уникальным пастельным цветом
Sidebar всегда тёмный — контраст к светлому контенту
Иконки — линейные, 18–20px, stroke-width: 1.5
Нет теней-монстров — только лёгкое box-shadow для глубины
Данные читаются первыми — числа крупно, подписи мелко
Education screen — те же карточки + превью видео + теги категорий


📋 Figma Make Prompt (готовый)
Design a medical SaaS dashboard called "Intelly".
Style: soft pastel neobrutalism, clean and friendly.

Colors: dark sidebar (#1A1A2E), warm off-white background (#F5F4F2),
pastel cards (yellow #F5E642, pink #F9D0E8, green #C5E8A0, blue #B8D8F8).

Fonts: Manrope (headings/numbers), DM Sans (body/captions).

Layout: 200px dark sidebar with nav icons + labels, main content area
with 16px-radius cards in a responsive grid, calendar widget on the right.

Components: stat cards with mini charts, patient list rows with avatars
and visit type tags, visit detail card, timeline, pill tags, calendar.

Tone: warm, human, data-rich but not overwhelming. Like a friendly
doctor's assistant app — not clinical, not corporate.