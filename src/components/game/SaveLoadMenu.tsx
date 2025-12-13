'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import {
  getSaveSlots,
  saveGame,
  loadGame,
  deleteSave,
  createNewSlotId,
  formatSaveDate,
} from '@/lib/saveManager';
import type { SaveSlot } from '@/types/game';

interface SaveLoadMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveLoadMenu({ isOpen, onClose }: SaveLoadMenuProps) {
  const { story, gameState, setGameState, loadStory } = useGameStore();
  const [mode, setMode] = useState<'save' | 'load'>('save');
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [saveName, setSaveName] = useState('');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  // 슬롯 목록 로드
  useEffect(() => {
    if (isOpen) {
      setSlots(getSaveSlots());
    }
  }, [isOpen]);

  const handleSave = (existingSlotId?: string) => {
    if (!story || !gameState) return;

    const slotId = existingSlotId || createNewSlotId();
    const name = saveName || `${story.title} - ${new Date().toLocaleString('ko-KR')}`;

    saveGame(slotId, name, story.id, story.title, gameState);
    setSlots(getSaveSlots());
    setSaveName('');
    setShowConfirm(null);

    // 저장 완료 알림
    alert('저장되었습니다!');
  };

  const handleLoad = (slot: SaveSlot) => {
    // 현재 스토리와 다른 스토리의 세이브인 경우
    if (story && story.id !== slot.storyId) {
      alert('다른 스토리의 세이브 데이터입니다.');
      return;
    }

    setGameState(slot.gameState);
    onClose();
  };

  const handleDelete = (slotId: string) => {
    deleteSave(slotId);
    setSlots(getSaveSlots());
    setShowConfirm(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f5f5f0]/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#f5f5f0] w-full max-w-2xl max-h-[80vh] overflow-hidden border border-[#a0a098]">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-[#c0c0b8]">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('save')}
              className={`px-4 py-2 transition-colors ${
                mode === 'save'
                  ? 'bg-[#3d3d3d] text-[#f5f5f0]'
                  : 'bg-[#e0e0d8] text-[#6b6b6b] hover:text-[#3d3d3d]'
              }`}
              disabled={!gameState}
            >
              저장하기
            </button>
            <button
              onClick={() => setMode('load')}
              className={`px-4 py-2 transition-colors ${
                mode === 'load'
                  ? 'bg-[#3d3d3d] text-[#f5f5f0]'
                  : 'bg-[#e0e0d8] text-[#6b6b6b] hover:text-[#3d3d3d]'
              }`}
            >
              불러오기
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b6b] hover:text-[#2d2d2d] text-2xl"
          >
            &times;
          </button>
        </div>

        {/* 새 저장 슬롯 (저장 모드일 때만) */}
        {mode === 'save' && gameState && (
          <div className="p-4 border-b border-[#c0c0b8] bg-[#eaeae5]">
            <h4 className="text-sm text-[#6b6b6b] mb-2">새 슬롯에 저장</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="저장 이름 (선택)"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="flex-1 bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#3d3d3d] placeholder-[#a0a0a0] focus:outline-none focus:border-[#808080]"
              />
              <button
                onClick={() => handleSave()}
                className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        )}

        {/* 슬롯 목록 */}
        <div className="overflow-y-auto max-h-[50vh] p-4">
          {slots.length === 0 ? (
            <p className="text-[#8b8b8b] text-center py-8">
              저장된 데이터가 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {slots
                .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-[#eaeae5] p-4 border border-[#c0c0b8] hover:border-[#a0a098] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-[#2d2d2d] font-medium">{slot.name}</h4>
                        <p className="text-[#6b6b6b] text-sm mt-1">
                          {slot.storyTitle}
                        </p>
                        <p className="text-[#8b8b8b] text-xs mt-1">
                          {formatSaveDate(slot.savedAt)}
                        </p>

                        {/* 간단한 스탯 미리보기 */}
                        <div className="flex gap-3 mt-2 text-xs text-[#8b8b8b]">
                          <span>HP: {slot.gameState.stats.hp}</span>
                          <span>Gold: {slot.gameState.stats.gold}</span>
                          <span>진행: {slot.gameState.history.length}씬</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {mode === 'save' ? (
                          <>
                            {showConfirm === slot.id ? (
                              <>
                                <button
                                  onClick={() => handleSave(slot.id)}
                                  className="px-3 py-1 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] text-sm"
                                >
                                  덮어쓰기
                                </button>
                                <button
                                  onClick={() => setShowConfirm(null)}
                                  className="px-3 py-1 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] text-sm"
                                >
                                  취소
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setShowConfirm(slot.id)}
                                className="px-3 py-1 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] text-sm"
                              >
                                저장
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handleLoad(slot)}
                            className="px-3 py-1 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] text-sm"
                          >
                            불러오기
                          </button>
                        )}

                        {showConfirm === `delete-${slot.id}` ? (
                          <>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="px-3 py-1 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] text-sm"
                            >
                              삭제
                            </button>
                            <button
                              onClick={() => setShowConfirm(null)}
                              className="px-3 py-1 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] text-sm"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowConfirm(`delete-${slot.id}`)}
                            className="px-3 py-1 bg-[#e0e0d8] hover:bg-[#d0d0c8] text-[#6b6b6b] text-sm"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
