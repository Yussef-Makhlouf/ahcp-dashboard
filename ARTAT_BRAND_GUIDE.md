# 🎨 ARTAT Brand Identity Guide
# دليل الهوية البصرية لنظام أرطات

## 📋 Overview | نظرة عامة

**ARTAT - Artat Animal Health System (AAHS)**  
**أرطات - نظام أرطات لصحة الحيوان**

Modern, nature-inspired electronic platform combining technology with environmental care for animals. Flat design with no gradients.

---

## 🎨 Brand Colors | الألوان الأساسية

### Primary Brand Colors

#### 🟠 Orange - الطاقة والحيوية
- **Primary:** `#D97A1A` - Main brand color
- **Light:** `#E69647`
- **Dark:** `#C86B10` - Hover states
- **Usage:** Primary buttons, main CTAs, accent lines
- **Meaning:** Vitality, energy, warmth

#### 💙 Sky Blue - الثقة والوضوح
- **Primary:** `#6ECFF6`
- **Light:** `#9AE0F9`
- **Dark:** `#4ABEEF`
- **Usage:** Secondary buttons, links, info states
- **Meaning:** Trust, clarity, professionalism

#### 🟢 Grass Green - الطبيعة والصحة
- **Primary:** `#6CA75E`
- **Light:** `#8FBF84`
- **Dark:** `#578A4B`
- **Usage:** Table headers, success states, sidebar
- **Meaning:** Nature, animal health, growth

#### 🟡 Sand Yellow - الأصالة السعودية
- **Primary:** `#E4C46C`
- **Light:** `#EDD594`
- **Dark:** `#D4AD49`
- **Usage:** Highlights, warnings, hover effects
- **Meaning:** Desert heritage, warmth

### Neutral Colors | الألوان المحايدة

- **Main Background:** `#F7F7F7` - Neutral gray
- **Card Background:** `#FFFFFF` - Pure white
- **Light Accent:** `#FDFBF8` - Light beige
- **Hover State:** `rgba(228, 196, 108, 0.15)` - Sand with transparency

### Text Colors | ألوان النصوص

- **Primary Text:** `#2A2A2A` - Dark gray
- **Secondary Text:** `#6C6C6C` - Medium gray
- **Muted Text:** `#9E9E9E` - Light gray
- **Links:** `#6ECFF6` - Sky blue

### Borders | الحدود

- **Standard:** `#EAEAEA`
- **Light:** `#F5F5F5`
- **Dark:** `#D1D1D1`

---

## 📝 Typography | الطباعة

### Arabic Typography | الخطوط العربية
- **Primary:** **Tajawal** (Headings & Body)
- **Secondary:** **Cairo**
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### English Typography | الخطوط الإنجليزية
- **Primary:** **Poppins** (Headings & Body)
- **Secondary:** **Montserrat**
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Font Sizes | أحجام الخطوط
```
H1: 1.875rem (30px)
H2: 1.5rem (24px)
H3: 1.25rem (20px)
Body: 0.9375rem (15px)
Small: 0.875rem (14px)
```

---

## 🎯 Design Principles | مبادئ التصميم

### 1. Flat Design | التصميم المسطح
- ✅ **NO gradients** - Use solid colors only
- ✅ **NO deep shadows** - Use soft shadows: `0 2px 6px rgba(0,0,0,0.05)`
- ✅ **NO glass effects** - Keep it simple and flat

### 2. Rounded Corners | الزوايا الدائرية
- **Standard:** 12-16px for buttons and cards
- **Small:** 8px for inputs
- **Buttons:** 16px (`var(--radius-lg)`)
- **Cards:** 16px (`var(--radius-lg)`)

### 3. Spacing | المسافات
- **Minimum section padding:** 24px
- **Ample white space** between elements
- **Consistent margins** for visual rhythm

### 4. Colors Usage | استخدام الألوان
- **Primary Actions:** Orange buttons
- **Secondary Actions:** Sky blue outline buttons
- **Success/Nature:** Green
- **Warnings:** Sand yellow
- **Tables:** Green headers with white text

---

## 🔘 Buttons | الأزرار

### Primary Button | الزر الأساسي
```css
background: #D97A1A (Orange)
color: #FFFFFF
border: none
border-radius: 16px
padding: 10px 20px
box-shadow: none
```
**Hover:** `background: #C86B10`

### Secondary Button | الزر الثانوي
```css
background: transparent
color: #6ECFF6 (Sky Blue)
border: 1px solid #6ECFF6
border-radius: 16px
padding: 10px 20px
```
**Hover:** `background: #6ECFF6, color: #FFFFFF`

---

## 📦 Cards | البطاقات

### Card Design | تصميم البطاقة
```css
background: #FFFFFF
border: 1px solid #EAEAEA
border-radius: 16px
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
padding: 20-24px
```

### Optional Colored Top Bar | شريط علوي ملون (اختياري)
- Height: 4px
- Colors: Green `#6CA75E` or Sky Blue `#6ECFF6`
- Position: Top of card

**Classes:**
- `.card-accent-green` - Green top bar
- `.card-accent-blue` - Sky blue top bar

---

## 📊 Tables | الجداول

### Table Header | رأس الجدول
```css
background: #6CA75E (Green)
color: #FFFFFF (White text)
font-size: 14px
text-transform: uppercase
font-weight: 600
padding: 12px 16px
```

### Table Rows | صفوف الجدول
```css
/* White rows */
background: #FFFFFF

/* Alternate rows */
background: #F7F7F7

/* Hover effect */
background: rgba(228, 196, 108, 0.15) /* Sand highlight */
```

### Table Features
- ✅ Green header with white text
- ✅ Alternating row colors (#FFFFFF / #F7F7F7)
- ✅ Sand hover effect for interactivity
- ✅ Clean borders `1px solid #EAEAEA`

---

## 🎯 Navigation | التنقل

### Navbar | الشريط العلوي
```css
background: #FFFFFF (White)
border-bottom: 2px solid #D97A1A (Orange accent line)
height: 75px
padding: 0 24px
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05)
```

**Content:**
- **Arabic:** "أرطات لصحة الحيوان"
- **English:** "Artat Animal Health System (AAHS)"
- **Text Color:** Dark gray (#2A2A2A)

### Sidebar | القائمة الجانبية
```css
background: #6CA75E (Solid green - NO gradient)
color: #FFFFFF
width: 260px
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05)
```

**Features:**
- ✅ Solid green background (nature theme)
- ✅ White icons and text
- ✅ Active item: `rgba(255, 255, 255, 0.15)`
- ✅ Hover highlight: Sand color `#E4C46C`

---

## 🎨 Icons | الأيقونات

### Icon Style | نمط الأيقونات
- **Style:** Outline / Line icons
- **Size:** 20-24px (consistent)
- **Colors:** 
  - Green `#6CA75E` for nature/health
  - Orange `#D97A1A` for actions
  - Sky Blue `#6ECFF6` for info

---

## 🌐 Bilingual Support | الدعم ثنائي اللغة

### Arabic (Primary)
- **Font:** Tajawal, Cairo
- **Direction:** RTL (Right-to-Left)
- **Alignment:** Right-aligned

### English (Secondary)
- **Font:** Poppins, Montserrat
- **Direction:** LTR (Left-to-Right)
- **Alignment:** Left-aligned

### Display Format
```
Arabic Title: أرطات لصحة الحيوان
English Subtitle: Artat Animal Health System (AAHS)
```

---

## ✨ Implementation Checklist | قائمة التنفيذ

### CSS Variables ✅
- [x] ARTAT brand colors defined
- [x] Typography variables (Tajawal, Poppins)
- [x] Spacing system (24px minimum)
- [x] Border radius (12-16px)
- [x] Soft shadows (no deep shadows)

### Components ✅
- [x] Buttons (Orange primary, Sky blue secondary)
- [x] Cards (White with optional colored top bar)
- [x] Tables (Green header, sand hover)
- [x] Navbar (White with orange accent)
- [x] Sidebar (Solid green)

### Branding ✅
- [x] Bilingual titles (Arabic + English)
- [x] ARTAT logo integration
- [x] System name display
- [x] Footer copyright

### Tailwind Config ✅
- [x] ARTAT colors added
- [x] Font families configured
- [x] Legacy ahcp mapped to ARTAT

---

## 🚀 Quick Reference | مرجع سريع

### Color Usage at a Glance

| Element | Color | Hex |
|---------|-------|-----|
| Primary Button | Orange | #D97A1A |
| Secondary Button | Sky Blue | #6ECFF6 |
| Table Header | Green | #6CA75E |
| Hover Effect | Sand | #E4C46C |
| Sidebar | Green | #6CA75E |
| Navbar Accent | Orange | #D97A1A |
| Background | Neutral Gray | #F7F7F7 |
| Cards | White | #FFFFFF |

### Shadows

| Use Case | Shadow |
|----------|--------|
| None | `none` |
| Soft | `0 2px 6px rgba(0,0,0,0.05)` |
| Card | `0 2px 8px rgba(0,0,0,0.08)` |

### Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 16px |
| Cards | 16px |
| Inputs | 8-12px |

---

## 📌 Brand Philosophy | فلسفة العلامة

**ARTAT represents:**
- 🌿 **Nature** - Green for animal health and environment
- 💻 **Technology** - Sky blue for modern digital platform
- 🔥 **Energy** - Orange for vitality and care
- 🏜️ **Heritage** - Sand for Saudi authenticity

**Design Goal:**  
Create a calm, professional, trustworthy interface that blends modern technology with nature-inspired elements, maintaining clarity and Saudi cultural authenticity.

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Team:** ARTAT Development Team
