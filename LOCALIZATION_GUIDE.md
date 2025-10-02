# Localization System Guide

This guide explains how to use the comprehensive localization system implemented in the AHCP Dashboard.

## Overview

The localization system supports:
- **English (en)** and **Arabic (ar)** languages
- **RTL (Right-to-Left)** and **LTR (Left-to-Right)** text direction
- **Dynamic language switching** without page reload
- **Persistent language preference** in localStorage
- **Automatic direction handling** for forms, layouts, and components

## System Architecture

### Core Files

1. **`lib/language-context.tsx`** - Language context provider
2. **`lib/use-translation.ts`** - Translation hook
3. **`messages/en.json`** - English translations
4. **`messages/ar.json`** - Arabic translations
5. **`components/ui/language-switcher.tsx`** - Language switcher component
6. **`app/globals-rtl.css`** - RTL/LTR styling

### How It Works

1. **Language Context**: Manages current language, RTL state, and direction
2. **Translation Hook**: Provides `t()` function for translations
3. **Dynamic Direction**: Automatically updates HTML `dir` and `lang` attributes
4. **CSS Classes**: Applies RTL/LTR specific styling

## Usage Examples

### Basic Translation

```tsx
import { useTranslation } from '@/lib/use-translation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
    </div>
  );
}
```

### With Parameters

```tsx
// In translation files
{
  "welcome": "Welcome {name}, you have {count} messages"
}

// In component
const message = t('welcome', { name: 'Ahmed', count: 5 });
// Result: "Welcome Ahmed, you have 5 messages"
```

### Language Switching

```tsx
import { useLanguage } from '@/lib/language-context';

function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  
  return (
    <select onChange={(e) => setLocale(e.target.value)}>
      <option value="ar">العربية</option>
      <option value="en">English</option>
    </select>
  );
}
```

## Translation File Structure

### English (`messages/en.json`)
```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "dashboard": {
    "title": "Dashboard",
    "subtitle": "Animal Health Care Program Management"
  },
  "settings": {
    "title": "Settings",
    "users": "Users",
    "roles": {
      "admin": "Administrator",
      "supervisor": "Supervisor"
    }
  }
}
```

### Arabic (`messages/ar.json`)
```json
{
  "common": {
    "loading": "جاري التحميل...",
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "dashboard": {
    "title": "لوحة التحكم",
    "subtitle": "إدارة برنامج الرعاية الصحية الحيوانية"
  },
  "settings": {
    "title": "الإعدادات",
    "users": "المستخدمين",
    "roles": {
      "admin": "مدير",
      "supervisor": "مشرف"
    }
  }
}
```

## RTL/LTR Support

### Automatic Direction Handling

The system automatically:
- Sets `dir="rtl"` for Arabic and `dir="ltr"` for English
- Updates `lang` attribute on HTML element
- Applies appropriate CSS classes

### CSS Classes

```css
/* RTL specific styles */
[dir="rtl"] .text-right { text-align: right; }
[dir="rtl"] .ml-2 { margin-left: 0; margin-right: 0.5rem; }

/* LTR specific styles */
[dir="ltr"] .text-left { text-align: left; }
[dir="ltr"] .mr-2 { margin-right: 0; margin-left: 0.5rem; }
```

### Form Handling

```tsx
// Forms automatically get RTL/LTR styling
<Input 
  className="text-right" // RTL: right-aligned, LTR: left-aligned
  placeholder={t('forms.enterValue')}
/>
```

## Component Integration

### Sidebar Navigation

```tsx
const getMenuItems = (t: (key: string) => string) => [
  {
    title: t('navigation.dashboard'),
    href: "/",
    icon: Home,
  },
  {
    title: t('navigation.settings'),
    href: "/settings",
    icon: Settings,
  },
];
```

### Tables

```tsx
const columns = [
  {
    header: t('tables.name'),
    accessorKey: 'name',
  },
  {
    header: t('tables.status'),
    accessorKey: 'status',
  },
];
```

### Forms

```tsx
<Label htmlFor="email">{t('forms.email')}</Label>
<Input 
  id="email"
  placeholder={t('forms.enterValue')}
  className="text-right"
/>
```

## Best Practices

### 1. Translation Keys
- Use descriptive, hierarchical keys: `settings.users.title`
- Keep keys consistent between languages
- Use camelCase for keys

### 2. Text Direction
- Always use `text-right` for Arabic content
- Use `text-left` for English content
- Let the system handle automatic direction

### 3. Form Layouts
```tsx
// Good: Responsive to language direction
<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-2">
    <Label className="text-right">{t('forms.name')}</Label>
    <Input className="text-right" />
  </div>
</div>
```

### 4. Icons and Layout
```tsx
// Icons should be direction-aware
<Icon className={cn("h-5 w-5", !isCollapsed && "ml-3")} />
```

## Adding New Translations

### 1. Add to Translation Files

**English (`messages/en.json`)**
```json
{
  "newSection": {
    "title": "New Section",
    "description": "This is a new section"
  }
}
```

**Arabic (`messages/ar.json`)**
```json
{
  "newSection": {
    "title": "قسم جديد",
    "description": "هذا قسم جديد"
  }
}
```

### 2. Use in Components

```tsx
function NewComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('newSection.title')}</h1>
      <p>{t('newSection.description')}</p>
    </div>
  );
}
```

## Language Switcher Component

The system includes a ready-to-use language switcher:

```tsx
import { LanguageSwitcher } from '@/components/ui/language-switcher';

function Navbar() {
  return (
    <div className="flex items-center gap-4">
      <LanguageSwitcher />
      {/* Other navbar content */}
    </div>
  );
}
```

## Mixing Languages

The system supports mixing Arabic and English content:

```tsx
// This works perfectly
<div>
  <h1>{t('dashboard.title')}</h1> {/* Arabic: لوحة التحكم */}
  <p>Welcome to AHCP Dashboard</p> {/* English content */}
  <span>مرحباً بك في النظام</span> {/* Arabic content */}
</div>
```

## Performance Considerations

- Translations are loaded once and cached
- Language switching is instant (no API calls)
- RTL/LTR changes are applied via CSS classes
- No impact on bundle size for unused languages

## Troubleshooting

### Common Issues

1. **Translation not found**: Check if key exists in both language files
2. **RTL not working**: Ensure `globals-rtl.css` is imported
3. **Direction not updating**: Check if `LanguageProvider` wraps your app

### Debug Mode

```tsx
const { t, locale } = useTranslation();
console.log('Current locale:', locale);
console.log('Translation result:', t('some.key'));
```

## Migration Guide

To migrate existing hardcoded text:

1. **Identify text**: Find all hardcoded strings
2. **Create keys**: Add to translation files
3. **Replace text**: Use `t('key')` instead of hardcoded strings
4. **Test both languages**: Verify Arabic and English work

### Example Migration

**Before:**
```tsx
<h1>لوحة التحكم</h1>
<p>مرحباً بك في النظام</p>
```

**After:**
```tsx
<h1>{t('dashboard.title')}</h1>
<p>{t('dashboard.welcome')}</p>
```

This localization system provides a robust, scalable solution for multilingual applications with proper RTL/LTR support and seamless language switching.
