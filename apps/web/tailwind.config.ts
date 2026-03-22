import type { Config } from 'tailwindcss';
import { tokens } from '@portfolio/ui';

/**
 * TAILWIND CONFIG
 *
 * Aqui conectamos os Design Tokens ao Tailwind.
 * Os tokens viram classes utilitárias: bg-primary-500, text-neutral-900, etc.
 *
 * O "content" diz ao Tailwind quais arquivos escanear para saber quais classes
 * estão sendo usadas. Só as classes encontradas vão pro bundle final (tree-shaking de CSS).
 */
const config: Config = {
  darkMode: 'class', // Tema escuro ativado via classe .dark no <html>
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}', // Escaneia o Design System também
  ],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        neutral: tokens.colors.neutral,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
        info: tokens.colors.info,
        skill: tokens.colors.skill,
        dark: tokens.dark.background,
      },
      fontFamily: {
        display: tokens.typography.fonts.display.split(','),
        body: tokens.typography.fonts.body.split(','),
        mono: tokens.typography.fonts.mono.split(','),
      },
      borderRadius: {
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        xl: tokens.radius.xl,
        '2xl': tokens.radius['2xl'],
      },
      transitionDuration: {
        fast: tokens.animation.duration.fast,
        normal: tokens.animation.duration.normal,
        slow: tokens.animation.duration.slow,
      },
      // Animações customizadas para o dashboard
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'count-up': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': `fade-in ${tokens.animation.duration.normal} ${tokens.animation.easing.out} forwards`,
        'slide-in': `slide-in ${tokens.animation.duration.normal} ${tokens.animation.easing.out} forwards`,
      },
    },
  },
  plugins: [],
};

export default config;
