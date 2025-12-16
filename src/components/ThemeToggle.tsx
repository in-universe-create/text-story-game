'use client';

import { useThemeStore } from '@/stores/themeStore';

const THEME_INFO = {
  light: { icon: '☀️', label: '라이트', next: '다크 모드로 전환' },
  dark: { icon: '🌙', label: '다크', next: 'CDE 모드로 전환' },
  cde: { icon: '🖥️', label: 'CDE', next: '라이트 모드로 전환' },
} as const;

export default function ThemeToggle() {
  const { theme, cycleTheme } = useThemeStore();
  const info = THEME_INFO[theme];

  return (
    <button
      onClick={cycleTheme}
      className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm border border-[var(--border-primary)] transition-colors flex items-center gap-1.5"
      title={info.next}
    >
      <span>{info.icon}</span>
      <span className="hidden sm:inline text-xs">{info.label}</span>
    </button>
  );
}
