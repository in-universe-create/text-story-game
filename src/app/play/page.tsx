'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { storyList } from '@/data/sampleStory';
import { autoSave, getAutoSave } from '@/lib/saveManager';
import StoryDisplay from '@/components/game/StoryDisplay';
import ChoicePanel from '@/components/game/ChoicePanel';
import StatsPanel from '@/components/game/StatsPanel';
import InventoryPanel from '@/components/game/InventoryPanel';
import SaveLoadMenu from '@/components/game/SaveLoadMenu';
import ThemeToggle from '@/components/ThemeToggle';

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = searchParams.get('story');
  const shouldLoad = searchParams.get('load') === 'true';

  const { story, loadStory, startGame, gameState, currentScene, resetGame, setGameState } =
    useGameStore();

  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // 스토리 로드
  useEffect(() => {
    if (shouldLoad) {
      // 저장된 게임 불러오기
      const autoSaveData = getAutoSave();
      if (autoSaveData) {
        const savedStory = storyList.find((s) => s.id === autoSaveData.storyId);
        if (savedStory) {
          loadStory(savedStory);
          setTimeout(() => {
            setGameState(autoSaveData.gameState);
          }, 100);
        }
      }
    } else if (storyId) {
      const selectedStory = storyList.find((s) => s.id === storyId);
      if (selectedStory) {
        loadStory(selectedStory);
      }
    }
  }, [storyId, shouldLoad, loadStory, setGameState]);

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

  // 메인으로 돌아가기
  const handleGoMain = () => {
    if (confirm('메인 화면으로 돌아가시겠습니까? (진행상황은 자동 저장됩니다)')) {
      router.push('/');
    }
  };

  // 스토리가 로드되지 않은 경우
  if (!story) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl text-[#2d2d2d] mb-4">스토리를 불러오는 중...</h1>
        <Link href="/" className="text-[#6b6b6b] hover:text-[#2d2d2d]">
          메인으로 돌아가기
        </Link>
      </main>
    );
  }

  // 게임 시작 전 화면
  if (!gameState) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-[#2d2d2d] mb-4">{story.title}</h1>
          <p className="text-[#6b6b6b] text-lg mb-8">{story.description}</p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleStartGame}
              className="px-8 py-3 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] font-bold transition-colors"
            >
              게임 시작
            </button>
            <Link
              href="/"
              className="px-8 py-3 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] transition-colors"
            >
              돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex">
      {/* 메인 게임 영역 */}
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{story.title}</h1>
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-3 py-1 bg-[var(--bg-tertiary)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-secondary)] text-sm border border-[var(--border-primary)]"
            >
              {showSidebar ? '스탯 숨기기' : '스탯 보기'}
            </button>
            <button
              onClick={() => setIsSaveMenuOpen(true)}
              className="px-3 py-1 bg-[var(--bg-tertiary)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-secondary)] text-sm border border-[var(--border-primary)]"
            >
              저장/불러오기
            </button>
            <button
              onClick={handleRestart}
              className="px-3 py-1 bg-[var(--bg-tertiary)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-secondary)] text-sm border border-[var(--border-primary)]"
            >
              처음부터
            </button>
            <button
              onClick={handleGoMain}
              className="px-3 py-1 bg-[var(--bg-tertiary)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-secondary)] text-sm border border-[var(--border-primary)]"
            >
              메인으로
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
            <Link
              href="/"
              className="px-6 py-3 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] transition-colors"
            >
              메인으로
            </Link>
          </div>
        )}
      </div>

      {/* 사이드바 (스탯 & 인벤토리) */}
      {showSidebar && (
        <aside className="w-80 bg-[var(--bg-secondary)] border-l border-[var(--border-primary)] p-4 space-y-4 overflow-y-auto">
          <StatsPanel />
          <InventoryPanel />

          {/* 진행 정보 */}
          <div className="bg-[var(--bg-card)] p-4 border border-[var(--border-primary)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border-primary)] pb-2">
              진행 정보
            </h3>
            <div className="text-sm text-[var(--text-tertiary)] space-y-1">
              <p>방문한 씬: {gameState.history.length}개</p>
              <p>획득한 플래그: {Object.keys(gameState.flags).length}개</p>
            </div>
          </div>
        </aside>
      )}

      {/* 저장/불러오기 메뉴 */}
      <SaveLoadMenu isOpen={isSaveMenuOpen} onClose={() => setIsSaveMenuOpen(false)} />
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-[#3d3d3d]">로딩 중...</p>
        </main>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
