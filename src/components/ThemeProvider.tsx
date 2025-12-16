'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // 클라이언트에서 테마 클래스 적용
    document.documentElement.classList.remove('light', 'dark', 'cde');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
