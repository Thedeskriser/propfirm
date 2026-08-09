import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1440px' },
    },
    extend: {
      colors: {
        // ── Design tokens ─────────────────────────────────────────────
        bg:        { DEFAULT: 'hsl(var(--bg))', subtle: 'hsl(var(--bg-subtle))', raised: 'hsl(var(--bg-raised))' },
        surface:   { DEFAULT: 'hsl(var(--surface))', muted: 'hsl(var(--surface-muted))', strong: 'hsl(var(--surface-strong))' },
        border:    { DEFAULT: 'hsl(var(--border-color))', strong: 'hsl(var(--border-strong))', subtle: 'hsl(var(--border-subtle))' },
        text:      { DEFAULT: 'hsl(var(--text-color))', muted: 'hsl(var(--text-muted))', subtle: 'hsl(var(--text-subtle))', faint: 'hsl(var(--text-faint))' },
        accent:    { DEFAULT: 'hsl(var(--accent))', hover: 'hsl(var(--accent-hover))', muted: 'var(--accent-muted)' },
        success:   { DEFAULT: 'hsl(var(--success))', hover: 'hsl(var(--success-hover))', muted: 'var(--success-muted)' },
        danger:    { DEFAULT: 'hsl(var(--danger))', hover: 'hsl(var(--danger-hover))', muted: 'var(--danger-muted)' },
        warn:      { DEFAULT: 'hsl(var(--warn))', hover: 'hsl(var(--warn-hover))', muted: 'var(--warn-muted)' },
        info:      { DEFAULT: 'hsl(var(--info))', hover: 'hsl(var(--info-hover))', muted: 'var(--info-muted)' },
        // shadcn aliases
        background:  'hsl(var(--bg))',
        foreground:  'hsl(var(--text-color))',
        primary:     { DEFAULT: 'hsl(var(--accent))', foreground: '#ffffff' },
        secondary:   { DEFAULT: 'hsl(var(--surface-muted))', foreground: 'hsl(var(--text-color))' },
        destructive: { DEFAULT: 'hsl(var(--danger))', foreground: '#ffffff' },
        muted:       { DEFAULT: 'hsl(var(--surface-muted))', foreground: 'hsl(var(--text-muted))' },
        popover:     { DEFAULT: 'hsl(var(--surface))', foreground: 'hsl(var(--text-color))' },
        card:        { DEFAULT: 'hsl(var(--surface))', foreground: 'hsl(var(--text-color))' },
        input:       'hsl(var(--border-color))',
        ring:        'hsl(var(--accent))',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // tighter institutional scale
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
        xl: '16px',
      },
      boxShadow: {
        'card':      'var(--shadow-card)',
        'card-lg':   'var(--shadow-card-lg)',
        'glow':      '0 0 0 1px rgba(124,110,245,.4), 0 0 24px rgba(124,110,245,.25)',
        'glow-success': '0 0 0 1px rgba(16,185,129,.4), 0 0 24px rgba(16,185,129,.25)',
      },
      backgroundImage: {
        'grid':      'linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)',
        'noise':     'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'.9\'/></filter><rect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.4\'/></svg>")',
        'aurora':    'radial-gradient(circle at 20% 0%, rgba(124,110,245,.18) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(16,185,129,.12) 0%, transparent 50%)',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(16,185,129,.4)' },
          '50%':     { boxShadow: '0 0 0 8px rgba(16,185,129,0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'slide-up':   'slideUp .4s cubic-bezier(.16,1,.3,1) both',
        'shimmer':    'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [animate],
}
export default config
