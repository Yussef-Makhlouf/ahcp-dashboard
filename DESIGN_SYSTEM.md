# AHCP Dashboard Design System

## Overview
A professional, clean, and well-organized design system for the AHCP Admin Dashboard built with TailwindCSS. This system emphasizes consistency, readability, and professional aesthetics without animations or gradients.

## Color Palette

### Primary Colors
- **Primary Blue**: `#2C3E50` - Main brand color for primary actions
- **Primary Light**: `#34495E` - Hover states for primary elements
- **Primary Dark**: `#1A252F` - Active/pressed states

### Status Colors
- **Success**: `#27AE60` - Success states, positive indicators
- **Success Light**: `#2ECC71` - Success hover states
- **Warning**: `#F39C12` - Warning states, caution indicators
- **Warning Light**: `#F1C40F` - Warning hover states
- **Info**: `#3498DB` - Information states, neutral actions
- **Info Light**: `#5DADE2` - Info hover states
- **Danger**: `#E74C3C` - Error states, destructive actions
- **Danger Light**: `#EC7063` - Danger hover states

### Background Colors
- **Main Background**: `#F8F9FA` - Primary page background
- **Card Background**: `#FFFFFF` - Card and component backgrounds
- **Secondary Background**: `#F1F3F4` - Secondary sections, table headers
- **Light Background**: `#FAFBFC` - Subtle backgrounds, alternating rows
- **Hover Background**: `#E8F4FD` - Interactive element hover states
- **Active Background**: `#D1ECF1` - Active/selected states

### Text Colors
- **Primary Text**: `#2C3E50` - Main text content
- **Secondary Text**: `#6C757D` - Secondary text, labels
- **Muted Text**: `#ADB5BD` - Disabled text, placeholders
- **Link Text**: `#3498DB` - Interactive links
- **Disabled Text**: `#CED4DA` - Disabled elements

### Border Colors
- **Default Border**: `#E5E7EB` - Standard borders
- **Light Border**: `#F1F3F4` - Subtle borders
- **Dark Border**: `#D1D5DB` - Stronger borders

## Typography

### Font Family
- **Primary**: Cairo (Arabic support)
- **Fallback**: system-ui, sans-serif

### Font Sizes
- **H1**: 1.875rem (30px) - Page titles
- **H2**: 1.5rem (24px) - Section headers
- **H3**: 1.25rem (20px) - Subsection headers
- **Body**: 0.875rem (14px) - Main content
- **Small**: 0.75rem (12px) - Metadata, captions

### Font Weights
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing System

### Base Spacing (rem)
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 0.75rem (12px)
- **lg**: 1rem (16px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 2rem (32px)
- **4xl**: 2.5rem (40px)

## Border Radius

### Radius Values
- **sm**: 0.375rem (6px) - Small elements
- **md**: 0.5rem (8px) - Standard elements
- **lg**: 0.75rem (12px) - Cards, containers
- **xl**: 1rem (16px) - Large cards
- **2xl**: 1.5rem (24px) - Special containers

## Shadows

### Shadow System
- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` - Subtle shadows
- **md**: `0 1px 3px 0 rgba(0, 0, 0, 0.1)` - Standard shadows
- **lg**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` - Card shadows
- **xl**: `0 10px 15px -3px rgba(0, 0, 0, 0.1)` - Elevated shadows

## Component Guidelines

### Buttons
- **Primary**: Solid background with primary color
- **Secondary**: Outline style with primary color border
- **Success**: Green background for positive actions
- **Warning**: Orange background for caution actions
- **Danger**: Red background for destructive actions
- **Ghost**: Transparent background with hover states

### Cards
- **Background**: White with subtle shadow
- **Border**: Light gray border
- **Radius**: 0.75rem (12px)
- **Padding**: 1.5rem (24px)

### Tables
- **Header**: Secondary background with primary color accent
- **Rows**: Alternating light backgrounds
- **Hover**: Light blue hover state
- **Borders**: Light gray borders between cells

### Forms
- **Inputs**: White background with gray border
- **Focus**: Primary color border with subtle shadow
- **Error**: Red border and text
- **Success**: Green border and text

### Navigation
- **Sidebar**: White background with right border
- **Active**: Primary color background
- **Hover**: Light background hover state
- **Links**: Medium weight with proper spacing

## Usage Examples

### Color Classes
```css
/* Text Colors */
.text-primary { color: #2C3E50; }
.text-secondary { color: #6C757D; }
.text-success { color: #27AE60; }
.text-warning { color: #F39C12; }
.text-danger { color: #E74C3C; }

/* Background Colors */
.bg-primary { background-color: #2C3E50; }
.bg-card { background-color: #FFFFFF; }
.bg-secondary { background-color: #F1F3F4; }
```

### Component Classes
```css
/* Cards */
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

/* Buttons */
.btn-primary {
  background: #2C3E50;
  color: #FFFFFF;
  border: 1px solid #2C3E50;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
}

/* Tables */
.table-header {
  background: #F1F3F4;
  border-bottom: 2px solid #2C3E50;
  font-weight: 600;
  text-transform: uppercase;
}
```

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements have clear focus states
- Color is not the only indicator of state

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Clear focus indicators
- Logical tab order

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- Reduced padding and margins
- Simplified navigation
- Touch-friendly button sizes
- Optimized table layouts

## Dark Mode Support

### Dark Theme Colors
- **Background**: `#1a1a1a`
- **Card**: `#2a2a2a`
- **Text**: `#e0e0e0`
- **Borders**: `rgba(255, 255, 255, 0.1)`

## Implementation Notes

1. **No Animations**: All transitions are disabled for clean, static design
2. **Fixed Colors**: No gradients or color variations
3. **Consistent Spacing**: Use the defined spacing system
4. **Professional Aesthetics**: Clean, business-appropriate design
5. **Accessibility First**: Ensure all components meet accessibility standards
