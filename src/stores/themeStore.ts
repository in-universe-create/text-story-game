'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'cde';

const THEMES: Theme[] = ['light', 'dark', 'cde'];

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme) => {
        set({ theme });
        // HTML 클래스 업데이트
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark', 'cde');
          document.documentElement.classList.add(theme);
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      cycleTheme: () => {
        const currentIndex = THEMES.indexOf(get().theme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        get().setTheme(THEMES[nextIndex]);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 스토어 복원 후 HTML 클래스 동기화
        if (state && typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark', 'cde');
          document.documentElement.classList.add(state.theme);
        }
      },
    }
  )
);
