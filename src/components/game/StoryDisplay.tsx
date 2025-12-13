'use client';

import { useGameStore } from '@/stores/gameStore';

export default function StoryDisplay() {
  const { currentScene } = useGameStore();

  if (!currentScene) {
    return null;
  }

  return (
    <div className="bg-[#f5f5f0] p-6 mb-4 min-h-[200px] border border-[#c0c0b8]">
      {/* 씬 제목 */}
      <h2 className="text-xl font-bold text-[#2d2d2d] mb-4 border-b border-[#c0c0b8] pb-2">
        {currentScene.title}
      </h2>

      {/* 스토리 텍스트 */}
      <div className="text-[#3d3d3d] leading-relaxed whitespace-pre-line text-lg">
        {currentScene.text}
      </div>

      {/* 엔딩 표시 */}
      {currentScene.isEnding && (
        <div className="mt-6 p-4 bg-[#eaeae5] border border-[#c0c0b8]">
          <p className="text-[#4d4d4d] text-center font-bold">
            이야기가 끝났습니다
          </p>
        </div>
      )}
    </div>
  );
}
