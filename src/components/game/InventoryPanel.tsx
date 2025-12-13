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
    <div className="bg-[#f5f5f0] p-4 border border-[#c0c0b8]">
      <h3 className="text-lg font-bold text-[#2d2d2d] mb-3 border-b border-[#c0c0b8] pb-2">
        인벤토리
      </h3>

      {inventory.length === 0 ? (
        <p className="text-[#8b8b8b] text-sm text-center py-4">
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
                    ? 'bg-[#d0d0c8] border border-[#a0a098]'
                    : 'bg-[#eaeae5] hover:bg-[#e0e0d8] border border-transparent'
                }
              `}
              onClick={() =>
                setSelectedItem(selectedItem === item.id ? null : item.id)
              }
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon || '📦'}</span>
                  <span className="text-[#3d3d3d]">{item.name}</span>
                </span>
                {item.quantity > 1 && (
                  <span className="text-[#4d4d4d] text-sm font-bold">
                    x{item.quantity}
                  </span>
                )}
              </div>

              {selectedItem === item.id && item.description && (
                <p className="text-[#6b6b6b] text-sm mt-2 ml-7">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 아이템 개수 표시 */}
      <div className="mt-3 pt-2 border-t border-[#c0c0b8] text-right">
        <span className="text-[#8b8b8b] text-sm">
          {inventory.length} / 20 슬롯
        </span>
      </div>
    </div>
  );
}
