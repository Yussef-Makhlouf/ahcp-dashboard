# AHCP Dashboard Design System

## Overview

This is a comprehensive, professional design system for the AHCP Admin Dashboard built with TailwindCSS. The system emphasizes clean, static design with no animations, gradients, or motion effects - perfect for professional business applications.

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#2C3E50` - Main brand color
- **Primary Light**: `#34495E` - Hover states
- **Primary Dark**: `#1A252F` - Active states

### Status Colors
- **Success**: `#27AE60` - Positive actions
- **Warning**: `#F39C12` - Caution indicators
- **Info**: `#3498DB` - Information states
- **Danger**: `#E74C3C` - Error states

### Background Colors
- **Main**: `#F8F9FA` - Page background
- **Card**: `#FFFFFF` - Component backgrounds
- **Secondary**: `#F1F3F4` - Secondary sections
- **Light**: `#FAFBFC` - Subtle backgrounds

## 📝 Typography

### Font Family
- **Primary**: Cairo (Arabic support)
- **Fallback**: system-ui, sans-serif

### Font Sizes
- **H1**: 1.875rem (30px)
- **H2**: 1.5rem (24px)
- **H3**: 1.25rem (20px)
- **Body**: 0.875rem (14px)
- **Small**: 0.75rem (12px)

## 🧩 Components

### 1. Navigation

#### Top Navigation Bar
```tsx
<nav className="bg-card border-b border-border px-6 py-4">
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-bold text-primary">AHCP Dashboard</h1>
    <div className="flex items-center space-x-4">
      <button className="btn btn-ghost btn-sm">Profile</button>
      <button className="btn btn-ghost btn-sm">Logout</button>
    </div>
  </div>
</nav>
```

#### Sidebar Navigation
```tsx
<aside className="sidebar w-64 h-screen">
  <div className="sidebar-header">
    <h2 className="text-lg font-semibold">Navigation</h2>
  </div>
  <nav className="sidebar-nav">
    <ul className="space-y-2">
      <li>
        <a href="/dashboard" className="nav-link active">
          <Home className="w-5 h-5" />
          Dashboard
        </a>
      </li>
    </ul>
  </nav>
</aside>
```

### 2. Cards

#### Statistics Card
```tsx
<div className="stats-card">
  <div className="flex items-center justify-between">
    <div>
      <p className="stats-label">Total Clients</p>
      <p className="stats-value">1,234</p>
      <div className="stats-change positive">
        <TrendingUp className="w-4 h-4" />
        +12.5%
      </div>
    </div>
    <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
      <Users className="w-6 h-6 text-primary" />
    </div>
  </div>
</div>
```

#### Data Card
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Recent Activities</h3>
  </div>
  <div className="card-content">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">New client registered</span>
        <span className="text-xs text-muted">2 hours ago</span>
      </div>
    </div>
  </div>
  <div className="card-footer">
    <button className="btn btn-primary btn-sm">View All</button>
  </div>
</div>
```

### 3. Tables

#### Professional Data Table
```tsx
<div className="table-container">
  <table className="table">
    <thead>
      <tr>
        <th className="table-col-id">ID</th>
        <th className="table-col-name">Name</th>
        <th className="table-col-status">Status</th>
        <th className="table-col-actions">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>001</td>
        <td>Ahmed Hassan</td>
        <td>
          <span className="table-status active">Active</span>
        </td>
        <td>
          <div className="table-actions">
            <button className="btn btn-ghost btn-sm">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4. Forms

#### Professional Form
```tsx
<form className="space-y-6">
  <div className="form-group">
    <label className="form-label">Full Name</label>
    <input 
      type="text" 
      className="form-input" 
      placeholder="Enter full name"
    />
  </div>
  
  <div className="form-group">
    <label className="form-label">Email Address</label>
    <input 
      type="email" 
      className="form-input" 
      placeholder="Enter email address"
    />
  </div>
  
  <div className="flex space-x-4">
    <button type="submit" className="btn btn-primary">
      Save Changes
    </button>
    <button type="button" className="btn btn-secondary">
      Cancel
    </button>
  </div>
</form>
```

#### Form with Validation
```tsx
<div className="form-group">
  <label className="form-label">Email Address</label>
  <input 
    type="email" 
    className="form-input success" 
    placeholder="Enter email address"
  />
  <div className="form-success">
    <CheckCircle className="w-4 h-4" />
    Email is valid
  </div>
</div>

<div className="form-group">
  <label className="form-label">Password</label>
  <input 
    type="password" 
    className="form-input error" 
    placeholder="Enter password"
  />
  <div className="form-error">
    <AlertCircle className="w-4 h-4" />
    Password must be at least 8 characters
  </div>
</div>
```

### 5. Buttons

#### Button Variants
```tsx
<div className="flex space-x-4">
  <button className="btn btn-primary">Primary</button>
  <button className="btn btn-secondary">Secondary</button>
  <button className="btn btn-success">Success</button>
  <button className="btn btn-warning">Warning</button>
  <button className="btn btn-danger">Danger</button>
  <button className="btn btn-info">Info</button>
</div>

<div className="flex space-x-4">
  <button className="btn btn-outline">Outline</button>
  <button className="btn btn-ghost">Ghost</button>
</div>

<div className="flex space-x-4">
  <button className="btn btn-primary btn-sm">Small</button>
  <button className="btn btn-primary">Default</button>
  <button className="btn btn-primary btn-lg">Large</button>
</div>
```

### 6. Alerts

#### Alert Components
```tsx
<div className="alert alert-success">
  <CheckCircle className="w-5 h-5" />
  <div>
    <h4 className="font-semibold">Success!</h4>
    <p>Your changes have been saved successfully.</p>
  </div>
</div>

<div className="alert alert-warning">
  <AlertTriangle className="w-5 h-5" />
  <div>
    <h4 className="font-semibold">Warning</h4>
    <p>Please review your information before proceeding.</p>
  </div>
</div>

<div className="alert alert-danger">
  <AlertCircle className="w-5 h-5" />
  <div>
    <h4 className="font-semibold">Error</h4>
    <p>Something went wrong. Please try again.</p>
  </div>
</div>

<div className="alert alert-info">
  <Info className="w-5 h-5" />
  <div>
    <h4 className="font-semibold">Information</h4>
    <p>This feature is currently in development.</p>
  </div>
</div>
```

## 🎯 Utility Classes

### Color Utilities
```tsx
// Text Colors
<div className="text-primary">Primary Text</div>
<div className="text-success">Success Text</div>
<div className="text-warning">Warning Text</div>
<div className="text-danger">Danger Text</div>
<div className="text-muted">Muted Text</div>

// Background Colors
<div className="bg-primary text-white">Primary Background</div>
<div className="bg-success text-white">Success Background</div>
<div className="bg-warning text-white">Warning Background</div>
<div className="bg-danger text-white">Danger Background</div>
```

### Spacing Utilities
```tsx
// Padding
<div className="p-xs">Extra Small Padding</div>
<div className="p-sm">Small Padding</div>
<div className="p-md">Medium Padding</div>
<div className="p-lg">Large Padding</div>
<div className="p-xl">Extra Large Padding</div>

// Margin
<div className="m-xs">Extra Small Margin</div>
<div className="m-sm">Small Margin</div>
<div className="m-md">Medium Margin</div>
<div className="m-lg">Large Margin</div>
<div className="m-xl">Extra Large Margin</div>
```

### Border and Shadow Utilities
```tsx
// Border Radius
<div className="rounded-sm">Small Border Radius</div>
<div className="rounded-md">Medium Border Radius</div>
<div className="rounded-lg">Large Border Radius</div>
<div className="rounded-xl">Extra Large Border Radius</div>

// Shadows
<div className="shadow-sm">Small Shadow</div>
<div className="shadow-md">Medium Shadow</div>
<div className="shadow-lg">Large Shadow</div>
<div className="shadow-xl">Extra Large Shadow</div>
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
```tsx
// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="stats-card">Card 1</div>
  <div className="stats-card">Card 2</div>
  <div className="stats-card">Card 3</div>
  <div className="stats-card">Card 4</div>
</div>

// Responsive Sidebar
<aside className="sidebar w-64 h-screen">
  {/* Sidebar content */}
</aside>
```

## 🌙 Dark Mode Support

### Dark Mode Classes
```tsx
// Dark mode is automatically handled by CSS variables
<div className="bg-card text-foreground">
  <h1 className="text-primary">Dark Mode Compatible</h1>
</div>
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
```

### 2. Import CSS
```tsx
// In your main CSS file
@import './app/globals-clean.css';
```

### 3. Use Components
```tsx
// Example dashboard layout
<div className="min-h-screen bg-bg-main">
  <nav className="bg-card border-b border-border px-6 py-4">
    <h1 className="text-xl font-bold text-primary">AHCP Dashboard</h1>
  </nav>
  
  <div className="flex">
    <aside className="sidebar w-64 h-screen">
      {/* Sidebar content */}
    </aside>
    
    <main className="flex-1 p-6">
      <div className="stats-card">
        <p className="stats-value">1,234</p>
        <p className="stats-label">Total Clients</p>
      </div>
    </main>
  </div>
</div>
```

## 📋 Best Practices

### 1. Color Usage
- Use primary colors for main actions
- Use status colors for feedback
- Maintain consistent color hierarchy

### 2. Typography
- Use proper heading hierarchy (H1 > H2 > H3)
- Maintain consistent font sizes
- Ensure proper contrast ratios

### 3. Spacing
- Use the defined spacing system
- Maintain consistent padding and margins
- Follow the 8px grid system

### 4. Components
- Use semantic HTML elements
- Maintain consistent component structure
- Follow accessibility guidelines

### 5. Responsive Design
- Design mobile-first
- Test on multiple screen sizes
- Use responsive utilities appropriately

## 🔧 Customization

### Custom Colors
```css
:root {
  --ahcp-primary: #2C3E50;
  --ahcp-success: #27AE60;
  /* Add your custom colors */
}
```

### Custom Components
```tsx
// Create custom components using the design system
const CustomCard = ({ title, children }) => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">{title}</h3>
    </div>
    <div className="card-content">
      {children}
    </div>
  </div>
);
```

## 📚 Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Component Examples](./COMPONENT_EXAMPLES.md)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

1. Follow the established design patterns
2. Maintain consistency with existing components
3. Test across different screen sizes
4. Ensure accessibility compliance
5. Update documentation as needed

## 📄 License

This design system is part of the AHCP Dashboard project and follows the same licensing terms.
