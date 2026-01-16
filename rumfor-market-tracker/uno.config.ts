import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'
import transformerDirective from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  shortcuts: {
    // Brand Layout & Typography
    'container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    'section-spacing': 'py-12 space-y-8',
    'card-spacing': 'p-6 space-y-4',
    
    // Buttons - Professional & Minimal
    'btn': 'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent',
    'btn-primary': 'btn bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-3 text-sm font-medium',
    'btn-secondary': 'btn bg-surface text-foreground hover:bg-surface/80 px-6 py-3 text-sm font-medium border border-border',
    'btn-ghost': 'btn bg-transparent hover:bg-surface/50 text-foreground px-6 py-3 text-sm font-medium',
    'btn-sm': 'btn px-4 py-2 text-xs',
    'btn-lg': 'btn px-8 py-4 text-base',
    
    // Inputs & Forms - Flat Dark Surfaces
    'input': 'w-full px-3 py-2 bg-surface border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors',
    'textarea': 'input min-h-[80px] resize-none',
    'select': 'input appearance-none bg-no-repeat bg-right pr-10 bg-[length:16px_16px]',
    'label': 'text-sm font-medium text-foreground',
    'field-error': 'text-xs text-destructive mt-1',
    
    // Cards & Panels - Subtle Elevation
    'card': 'bg-surface border border-border rounded-lg p-6 space-y-4',
    'card-header': 'flex flex-col space-y-1.5 pb-4',
    'card-title': 'text-lg font-semibold text-foreground',
    'card-description': 'text-sm text-muted-foreground',
    'card-content': 'pt-0',
    'card-footer': 'flex items-center pt-4',
    
    // Navigation - Clean & Minimal
    'nav': 'bg-background border-b border-border',
    'nav-item': 'inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface/50 rounded-md transition-colors',
    'nav-item-active': 'nav-item text-foreground bg-surface/80',
    
    // Status & Feedback
    'badge': 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    'badge-success': 'badge bg-success/20 text-success border border-success/30',
    'badge-warning': 'badge bg-warning/20 text-warning border border-warning/30',
    'badge-error': 'badge bg-destructive/20 text-destructive border border-destructive/30',
    'badge-muted': 'badge bg-muted text-muted-foreground',
    
    // Progress & Loading
    'progress': 'w-full bg-muted rounded-full h-2',
    'progress-bar': 'bg-accent h-2 rounded-full transition-all duration-300',
    'spinner': 'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',

    // Vendor Planning Dashboard
    'planning-card': 'card hover:shadow-md transition-all duration-200',
    'planning-section': 'space-y-6',
    'planning-header': 'flex items-center justify-between pb-4 border-b border-border',
    'planning-progress': 'flex items-center space-x-2 text-sm',
    'touch-target': 'min-h-[44px] min-w-[44px]',

    // Mobile Optimizations
    'mobile-stack': 'flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4',
    'mobile-padding': 'px-4 py-6 sm:px-6 lg:px-8',
    'mobile-text': 'text-sm sm:text-base',
    'hide-scrollbar': 'scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
    
    // Shadows & Effects - Minimal & Subtle
    'surface-shadow': 'shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]',
    'hover-lift': 'transition-transform duration-150 hover:translate-y-[-1px]',
  },
  theme: {
    colors: {
      // Brand Color System - Dark Professional Theme
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      surface: 'hsl(var(--surface))',
      surface2: 'hsl(var(--surface-2))',
      
      // Primary Accent - Calm Blue (used sparingly)
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      
      // Text Hierarchy
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      
      // Status Colors - Muted, not fluorescent
      success: {
        DEFAULT: 'hsl(var(--success))',
        foreground: 'hsl(var(--success-foreground))',
      },
      warning: {
        DEFAULT: 'hsl(var(--warning))',
        foreground: 'hsl(var(--warning-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      
      // Border System
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      
      // Extended Gray Scale for Dark Theme
      dark: {
        50: 'hsl(220 14% 96%)',
        100: 'hsl(220 14% 90%)',
        200: 'hsl(220 13% 82%)',
        300: 'hsl(220 13% 72%)',
        400: 'hsl(220 13% 60%)',
        500: 'hsl(220 13% 48%)',
        600: 'hsl(220 13% 38%)',
        700: 'hsl(220 13% 28%)',
        800: 'hsl(220 13% 18%)',
        900: 'hsl(220 13% 10%)',
        950: 'hsl(220 13% 6%)',
      },
    },
    
    fontFamily: {
      // Clean, modern sans-serif
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
    },
    
    fontSize: {
      // Professional Typography Scale
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    
    borderRadius: {
      // Gently rounded corners
      none: '0',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
    
    spacing: {
      // Consistent spacing scale
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
    },
    
    // Enhanced animations with accessibility support
    animation: {
      'fade-in': 'fadeIn 0.2s ease-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'scale-in': 'scaleIn 0.2s ease-out',
      'bounce-in': 'bounceIn 0.5s ease-out',
      'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      'shimmer': 'shimmer 1.5s linear infinite',
    },

    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      bounceIn: {
        '0%': { transform: 'scale(0.3)', opacity: '0' },
        '50%': { transform: 'scale(1.05)' },
        '70%': { transform: 'scale(0.9)' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      pulseSubtle: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.8' },
      },
      shimmer: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
    },
    
    boxShadow: {
      // Subtle, professional shadows
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      none: '0 0 #0000',
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [
    transformerDirective(),
    transformerVariantGroup(),
  ],
})

