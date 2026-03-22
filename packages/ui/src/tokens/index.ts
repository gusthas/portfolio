/**
 * DESIGN TOKENS — Fonte da Verdade
 *
 * Todos os valores visuais do projeto (cores, fontes, espaçamentos) vivem aqui.
 * Nenhum componente usa valores mágicos como "color: #0ea5e9" diretamente.
 * Todos referenciam esses tokens.
 *
 * Por que? Se amanhã quiser mudar a cor primária, muda em UM lugar.
 * Esses tokens são mapeados para CSS Variables no tailwind.config.ts de cada app.
 */
export const tokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // cor base
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    neutral: {
      0: '#ffffff',
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    // Feedback visual
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    // Cores para gamificação de skills
    skill: {
      beginner: '#94a3b8',    // Cinza — iniciante
      intermediate: '#22c55e', // Verde — intermediário
      advanced: '#0ea5e9',    // Azul — avançado
      master: '#f59e0b',      // Dourado — mestre
    },
  },

  typography: {
    fonts: {
      display: '"Cal Sans", "Geist", sans-serif',        // Títulos grandes e impactantes
      body: '"Geist", system-ui, sans-serif',             // Corpo de texto
      mono: '"Geist Mono", "JetBrains Mono", monospace', // Código
    },
    sizes: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  spacing: {
    // Baseado em grid de 4px. Todos os valores são múltiplos de 4.
    // Isso cria consistência visual automática.
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    24: '6rem',    // 96px
    32: '8rem',    // 128px
  },

  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  // Tema escuro — valores que mudam entre light/dark
  dark: {
    background: {
      base: '#0f172a',      // Fundo principal
      surface: '#1e293b',   // Cards, painéis
      elevated: '#334155',  // Elementos elevados (dropdowns, modais)
      overlay: '#475569',   // Overlays leves
    },
    border: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#64748b',
    },
  },
} as const;

export type Tokens = typeof tokens;
