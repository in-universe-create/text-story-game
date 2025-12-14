'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { findStoryByCode } from '@/lib/storyLoader';
import { autoSave } from '@/lib/saveManager';
import StoryDisplay from '@/components/game/StoryDisplay';
import ChoicePanel from '@/components/game/ChoicePanel';
import StatsPanel from '@/components/game/StatsPanel';
import InventoryPanel from '@/components/game/InventoryPanel';
import type { Story } from '@/types/game';

type Status = 'loading' | 'not-found' | 'ready';

export default function CodePlayPage() {
  const params = useParams();
  const code = params.code as string;

  const [status, setStatus] = useState<Status>('loading');
  const [loadedStory, setLoadedStory] = useState<Story | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const { story, loadStory, startGame, gameState, currentScene, resetGame } =
    useGameStore();

  // 코드로 스토리 로드 (JSON 파일 기반)
  useEffect(() => {
    const loadStoryByCode = async () => {
      const foundStory = await findStoryByCode(code);

      if (!foundStory) {
        setStatus('not-found');
        return;
      }

      setLoadedStory(foundStory);
      loadStory(foundStory);
      setStatus('ready');
    };

    loadStoryByCode();
  }, [code, loadStory]);

  // 자동 저장 (씬 변경 시)
  useEffect(() => {
    if (story && gameState && currentScene) {
      autoSave(story.id, story.title, gameState);
    }
  }, [story, gameState, currentScene]);

  // 게임 시작
  const handleStartGame = () => {
    startGame();
  };

  // 게임 리셋
  const handleRestart = () => {
    if (confirm('처음부터 다시 시작하시겠습니까?')) {
      resetGame();
      startGame();
    }
  };

  // 로딩 중
  if (status === 'loading') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-[#6b6b6b]">로딩 중...</p>
      </main>
    );
  }

  // 코드를 찾을 수 없음
  if (status === 'not-found') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2d2d2d] mb-4">
            접근할 수 없습니다
          </h1>
          <p className="text-[#6b6b6b] mb-6">
            유효하지 않은 코드입니다.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] inline-block"
          >
            메인으로
          </Link>
        </div>
      </main>
    );
  }

  // 게임 시작 전 화면
  if (!gameState && loadedStory) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-[#2d2d2d] mb-4">
            {loadedStory.title}
          </h1>
          <p className="text-[#6b6b6b] text-lg mb-8">{loadedStory.description}</p>

          <button
            onClick={handleStartGame}
            className="px-8 py-3 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] font-bold transition-colors"
          >
            게임 시작
          </button>
        </div>
      </main>
    );
  }

  // 게임 플레이 화면
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* 모바일: 상단 사이드바 / 데스크톱: 우측 사이드바 (order로 위치 조정) */}
      {showSidebar && gameState && (
        <aside className="
          w-full md:w-80
          bg-[#eaeae5]
          border-b md:border-b-0 md:border-l border-[#c0c0b8]
          p-4
          space-y-4
          overflow-y-auto
          order-first md:order-last
          max-h-[50vh] md:max-h-none
        ">
          {/* 모바일에서 접기 버튼 */}
          <div className="flex justify-between items-center md:hidden mb-2">
            <span className="text-sm font-medium text-[#4d4d4d]">캐릭터 정보</span>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-[#6b6b6b] hover:text-[#2d2d2d] text-xl leading-none"
            >
              &times;
            </button>
          </div>

          <StatsPanel />
          <InventoryPanel />

          {/* 진행 정보 */}
          <div className="bg-[#f5f5f0] p-4 border border-[#c0c0b8]">
            <h3 className="text-lg font-bold text-[#2d2d2d] mb-3 border-b border-[#c0c0b8] pb-2">
              진행 정보
            </h3>
            <div className="text-sm text-[#6b6b6b] space-y-1">
              <p>방문한 씬: {gameState.history.length}개</p>
              <p>획득한 플래그: {Object.keys(gameState.flags).length}개</p>
            </div>
          </div>
        </aside>
      )}

      {/* 메인 게임 영역 */}
      <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg md:text-xl font-bold text-[#2d2d2d] truncate">{story?.title}</h1>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-3 py-1 bg-[#e0e0d8] hover:bg-[#d0d0c8] text-[#4d4d4d] text-sm border border-[#c0c0b8]"
            >
              {showSidebar ? '스탯 숨기기' : '스탯 보기'}
            </button>
            <button
              onClick={handleRestart}
              className="px-3 py-1 bg-[#e0e0d8] hover:bg-[#d0d0c8] text-[#4d4d4d] text-sm border border-[#c0c0b8] hidden sm:block"
            >
              처음부터
            </button>
          </div>
        </div>

        {/* 스토리 표시 */}
        <StoryDisplay />

        {/* 선택지 (엔딩이 아닐 때) */}
        {currentScene && !currentScene.isEnding && <ChoicePanel />}

        {/* 엔딩일 때 버튼들 */}
        {currentScene?.isEnding && (
          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] font-bold transition-colors"
            >
              다시 시작
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
