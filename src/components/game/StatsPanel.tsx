'use client';

import { useGameStore } from '@/stores/gameStore';
import { STAT_META, type Stats } from '@/types/game';

export default function StatsPanel() {
  const { gameState } = useGameStore();

  if (!gameState) {
    return null;
  }

  const { stats } = gameState;

  // 표시할 스탯 목록 (maxHp 제외)
  const displayStats: (keyof Stats)[] = [
    'hp',
    'strength',
    'intelligence',
    'agility',
    'stress',
    'reputation',
    'relationship',
    'gold',
  ];

  return (
    <div className="bg-[var(--bg-card)] p-4 border border-[var(--border-primary)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border-primary)] pb-2">
        캐릭터 스탯
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {displayStats.map((key) => {
          const meta = STAT_META[key];
          const value = stats[key];
          const maxValue = key === 'hp' ? stats.maxHp : key === 'stress' ? 100 : 100;

          // HP와 스트레스는 바 형태로 표시
          const showBar = key === 'hp' || key === 'stress';
          const percentage = showBar ? (value / maxValue) * 100 : 0;

          // 모노톤 바 색상
          const barColor = 'bg-[var(--text-tertiary)]';

          return (
            <div key={key} className="bg-[var(--bg-secondary)] p-2 border border-[var(--border-secondary)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--text-secondary)]">{meta.label}</span>
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  {key === 'gold' ? value.toLocaleString() : value}
                  {showBar && `/${maxValue}`}
                </span>
              </div>

              {showBar && (
                <div className="h-2 bg-[var(--btn-secondary-bg)] overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-300`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
