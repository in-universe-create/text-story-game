'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

export default function InventoryPanel() {
  const { gameState } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  if (!gameState) {
    return null;
  }

  const { inventory } = gameState;

  return (
    <div className="bg-[var(--bg-card)] p-4 border border-[var(--border-primary)]">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border-primary)] pb-2">
        인벤토리
      </h3>

      {inventory.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm text-center py-4">
          보유한 아이템이 없습니다
        </p>
      ) : (
        <div className="space-y-2">
          {inventory.map((item) => (
            <div
              key={item.id}
              className={`
                p-2 cursor-pointer transition-all
                ${
                  selectedItem === item.id
                    ? 'bg-[var(--btn-secondary-bg)] border border-[var(--border-hover)]'
                    : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-transparent'
                }
              `}
              onClick={() =>
                setSelectedItem(selectedItem === item.id ? null : item.id)
              }
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon || '📦'}</span>
                  <span className="text-[var(--text-secondary)]">{item.name}</span>
                </span>
                {item.quantity > 1 && (
                  <span className="text-[var(--text-secondary)] text-sm font-bold">
                    x{item.quantity}
                  </span>
                )}
              </div>

              {selectedItem === item.id && item.description && (
                <p className="text-[var(--text-tertiary)] text-sm mt-2 ml-7">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 아이템 개수 표시 */}
      <div className="mt-3 pt-2 border-t border-[var(--border-primary)] text-right">
        <span className="text-[var(--text-muted)] text-sm">
          {inventory.length} / 20 슬롯
        </span>
      </div>
    </div>
  );
}
