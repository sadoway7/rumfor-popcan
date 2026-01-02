# Rumfor Market Tracker - Brand & Design Guidelines

## 📋 Table of Contents
- [Brand Identity](#brand-identity)
- [Color System](#color-system)
- [Typography](#typography)
- [Layout & Spacing](#layout--spacing)
- [Component Design](#component-design)
- [Design Tokens](#design-tokens)
- [Implementation Guide](#implementation-guide)
- [Do's and Don'ts](#dos-and-donts)

---

## 🎯 Brand Identity

### Overall Mood
**Dark, calm, and focused** - This is a professional tool, not a sci-fi toy.

### Personality Keywords
- Modern, minimal, tool-like
- Serious, calm, and focused
- Matte, flat, and understated
- No visual noise, no decoration without purpose

### Brand Positioning
Rumfor Market Tracker is a comprehensive platform for market discovery, vendor applications, and community engagement. The design should feel trustworthy, professional, and efficient - like a well-crafted business tool that users can rely on daily.

---

## 🎨 Color System

### Core Color Philosophy
- **Background**: Very dark gray, not pure black (think "dim room, matte surfaces")
- **Surfaces**: Slightly lighter dark grays layered on top
- **Text**: Soft off-white for main text, light gray for secondary text
- **Accent**: Exactly one color used sparingly (calm blue/teal)
- **Status Colors**: Muted, not fluorescent

### CSS Custom Properties

```css
:root {
  /* Brand Colors - Dark Professional Theme */
  --background: 220 13% 6%;          /* Very dark gray */
  --foreground: 220 14% 98%;         /* Soft off-white */
  --surface: 220 13% 10%;            /* Slightly lighter dark */
  --surface-2: 220 13% 12%;          /* Layered surface */
  
  /* Primary Accent - Calm Blue (used sparingly) */
  --accent: 215 84% 56%;             /* Professional blue */
  --accent-foreground: 0 0% 100%;
  
  /* Text Hierarchy */
  --muted: 220 9% 46%;               /* Light gray for secondary text */
  --muted-foreground: 220 9% 65%;    /* Muted gray for hints */
  
  /* Status Colors - Muted, not fluorescent */
  --success: 142 76% 36%;            /* Muted green */
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;             /* Muted amber */
  --warning-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;          /* Muted red */
  --destructive-foreground: 0 0% 100%;
  
  /* Border System */
  --border: 220 13% 18%;             /* Subtle borders */
  --input: 220 13% 18%;
  --ring: 215 84% 56%;
}
```

### Color Usage Guidelines

#### Primary Colors
- **Background**: Use for main app background
- **Surface**: Use for cards, panels, modals
- **Foreground**: Use for main text content
- **Accent**: Use sparingly for primary actions, links, highlights

#### Status Colors
- **Success**: For confirmations, success states, positive metrics
- **Warning**: For warnings, pending states, caution indicators
- **Destructive**: For errors, destructive actions, negative metrics

#### Text Hierarchy
- **Foreground**: Primary text, headings
- **Muted**: Secondary text, labels, descriptions
- **Muted-foreground**: Hints, placeholders, disabled text

---

## 📝 Typography

### Font Family
**Primary**: Inter (with system fallbacks)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Weights
- **Regular (400)**: Body text, general content
- **Medium (500)**: Labels, form elements
- **Semibold (600)**: Subheadings, important text
- **Bold (700)**: Page headings, emphasis

### Typography Scale
- **xs (0.75rem)**: Fine print, metadata
- **sm (0.875rem)**: Labels, small text
- **base (1rem)**: Body text, standard content
- **lg (1.125rem)**: Large body text
- **xl (1.25rem)**: Small headings
- **2xl (1.5rem)**: Medium headings
- **3xl (1.875rem)**: Large headings
- **4xl (2.25rem)**: Page titles

### Typography Rules
1. **Crisp and straightforward** - No decorative fonts
2. **Weight for hierarchy** - Use font-weight, not underlines or effects
3. **Clear contrast** - But not harsh (avoid pure white on pure black)
4. **Consistent line heights** - Maintain readability

---

## 📐 Layout & Spacing

### Spacing System
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
```

### Layout Principles
1. **Clean grid-like layout**
2. **Clear vertical stacking** of sections
3. **Consistent gaps** between elements
4. **Things line up** - no random offsets
5. **Plenty of breathing room** - nothing feels crowded

### Container System
- **Max width**: 7xl (80rem / 1280px)
- **Horizontal padding**: 4px, 6px, 8px (responsive)
- **Section spacing**: 3rem vertical spacing
- **Content spacing**: 1.5rem internal spacing

---

## 🧩 Component Design

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--accent);
  color: var(--accent-foreground);
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  transition: background-color 150ms;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--surface);
  color: var(--foreground);
  border: 1px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}
```

#### Button States
- **Hover**: Subtle background lightening
- **Focus**: Clear ring outline with accent color
- **Disabled**: Reduced opacity, cursor not-allowed
- **Active**: Slight darkening

### Cards & Panels
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### Form Elements
```css
.input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  color: var(--foreground);
  transition: border-color 150ms, box-shadow 150ms;
}
```

### Navigation
```css
.nav-item {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  color: var(--muted-foreground);
  transition: color 150ms, background-color 150ms;
}
```

---

## 🔧 Design Tokens

### UnoCSS Shortcuts
The design system provides these utility shortcuts for consistent implementation:

#### Layout
- `container`: Max-width container with responsive padding
- `section-spacing`: Consistent vertical spacing for sections
- `card-spacing`: Internal spacing for cards

#### Buttons
- `btn`: Base button styles
- `btn-primary`: Primary action button
- `btn-secondary`: Secondary action button
- `btn-ghost`: Subtle button style
- `btn-sm`, `btn-lg`: Size variants

#### Forms
- `input`: Base input styling
- `textarea`: Textarea with proper sizing
- `select`: Select dropdown styling
- `label`: Form label styling
- `field-error`: Error message styling

#### Cards
- `card`: Base card component
- `card-header`: Card header section
- `card-title`: Card title styling
- `card-content`: Card content area
- `card-footer`: Card footer section

#### Status
- `badge`: Base badge styling
- `badge-success`, `badge-warning`, `badge-error`: Status variants
- `progress`: Progress bar container
- `progress-bar`: Progress indicator

### Usage Examples

```html
<!-- Button Examples -->
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary">Secondary Action</button>
<button class="btn btn-ghost">Ghost Button</button>

<!-- Card Example -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-description">Card description text</p>
  </div>
  <div class="card-content">
    Card content goes here
  </div>
</div>

<!-- Form Example -->
<div class="space-y-2">
  <label class="label">Email Address</label>
  <input class="input" type="email" placeholder="Enter email">
  <p class="field-error">Error message if needed</p>
</div>

<!-- Badge Examples -->
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-muted">Muted</span>
```

---

## 🛠 Implementation Guide

### 1. Setting Up the Design System

#### Install Dependencies
```bash
npm install unocss @unocss/preset-uno @unocss/preset-attributify @unocss/preset-icons
```

#### Configure UnoCSS
The `uno.config.ts` file contains the complete design system configuration. Import it in your main entry:

```typescript
import 'uno.css'
import './styles/globals.css'
```

### 2. Global Styles
Update your `globals.css` to use CSS custom properties:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand Colors */
    --background: 220 13% 6%;
    --foreground: 220 14% 98%;
    /* ... rest of color variables */
  }
  
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### 3. Component Development

#### When Building New Components:
1. **Use the design tokens** and shortcuts provided
2. **Follow the color hierarchy** - don't invent new colors
3. **Maintain consistent spacing** using the spacing scale
4. **Keep interactions subtle** - no flashy animations
5. **Test accessibility** - ensure proper contrast ratios

#### Code Structure Example:
```tsx
import { defineProps } from 'vue'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const Button = defineProps<ButtonProps>()
</script>

<template>
  <button 
    class="btn"
    :class="{
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary', 
      'btn-ghost': variant === 'ghost',
      'btn-sm': size === 'sm',
      'btn-lg': size === 'lg'
    }"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
```

### 4. Responsive Design

#### Breakpoints
- **sm**: 640px and up
- **md**: 768px and up  
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

#### Responsive Patterns
```html
<!-- Responsive container -->
<div class="container px-4 sm:px-6 lg:px-8">
  <!-- Content scales naturally -->
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

---

## ✅ Do's and Don'ts

### ✅ Do's

#### Color Usage
- Use the defined color palette consistently
- Apply the accent color sparingly for emphasis
- Maintain proper contrast ratios
- Use status colors appropriately

#### Typography
- Use Inter font family consistently
- Apply font weights for hierarchy
- Maintain readable line heights
- Keep text crisp and straightforward

#### Layout
- Follow the grid system
- Use consistent spacing
- Maintain visual hierarchy
- Provide adequate breathing room

#### Components
- Use the provided shortcuts
- Maintain interaction patterns
- Keep designs minimal and functional
- Test accessibility

### ❌ Don'ts

#### Visual Effects
- **Never use gradients, glass, or reflections**
- **No neon colors or RGB gaming aesthetics**
- **Avoid overly rounded, bubbly elements**
- **No chaotic backgrounds or particles**

#### Color Misuse
- **Don't use more than one main accent color**
- **Avoid pure white on pure black**
- **No fluorescent status colors**
- **Don't create new color variations without approval**

#### Typography Issues
- **No decorative fonts**
- **Avoid tiny or cramped text**
- **Don't use underlines for emphasis**
- **No loud, shouty headings**

#### Layout Problems
- **No random offsets or misalignment**
- **Avoid crowded interfaces**
- **No card stacking chaos**
- **Don't ignore the spacing system**

#### Interaction Problems
- **No bouncy or playful animations**
- **Avoid bright hover effects**
- **No glowing outlines or shadows**
- **Don't make primary actions too prominent**

---

## 📚 Resources

### Design Tools
- **Figma**: Component library and design files
- **Storybook**: Component documentation and testing
- **Chrome DevTools**: Inspect and modify styles

### Code References
- **UnoCSS Configuration**: `/uno.config.ts`
- **Global Styles**: `/src/styles/globals.css`
- **Component Examples**: `/src/components/ui/`

### Developer Notes
1. **Always test in dark mode** - The entire app is designed for dark themes
2. **Check accessibility** - Ensure WCAG AA compliance
3. **Use semantic HTML** - Maintain proper HTML structure
4. **Follow Vue 3 composition patterns** - For new components
5. **Document complex components** - Add JSDoc comments

---

## 🚀 Getting Started

### For New Developers
1. Read this entire document
2. Review the `uno.config.ts` file
3. Examine existing components for patterns
4. Use the provided shortcuts and tokens
5. Test your designs in the running app

### For Design Changes
1. Propose changes in team discussion
2. Update this documentation
3. Modify `uno.config.ts` if needed
4. Test thoroughly across the application
5. Update component examples

---

*Last Updated: January 1, 2026*  
*Version: 1.0*  
*Maintained by: Rumfor Development Team*