'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storyList } from '@/data/sampleStory';
import { getAutoSave, getSaveSlots } from '@/lib/saveManager';

export default function Home() {
  const [hasSaves, setHasSaves] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);

  useEffect(() => {
    setHasSaves(getSaveSlots().length > 0);
    setHasAutoSave(!!getAutoSave());
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* 타이틀 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#2d2d2d] mb-4">
          스토리 게임
        </h1>
        <p className="text-[#6b6b6b] text-lg">
          당신의 선택이 운명을 바꿉니다
        </p>
      </div>

      {/* 메뉴 버튼들 */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* 스토리 선택 */}
        <div className="bg-[#eaeae5] p-6 border border-[#c0c0b8]">
          <h2 className="text-xl font-bold text-[#2d2d2d] mb-4">스토리 선택</h2>
          <div className="space-y-3">
            {storyList.map((story) => (
              <Link
                key={story.id}
                href={`/play?story=${story.id}`}
                className="block p-4 bg-[#f5f5f0] hover:bg-[#e0e0d8] transition-all hover:translate-x-2 border border-[#c0c0b8] hover:border-[#a0a098]"
              >
                <h3 className="text-[#2d2d2d] font-medium">{story.title}</h3>
                <p className="text-[#6b6b6b] text-sm mt-1">{story.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* 이어하기 (세이브가 있을 때) */}
        {(hasSaves || hasAutoSave) && (
          <Link
            href="/play?load=true"
            className="p-4 bg-[#e0e0d8] hover:bg-[#d0d0c8] text-[#2d2d2d] text-center transition-all border border-[#c0c0b8] hover:border-[#a0a098]"
          >
            이어하기
          </Link>
        )}

        {/* 에디터 */}
        <Link
          href="/editor"
          className="p-4 bg-[#e0e0d8] hover:bg-[#d0d0c8] text-[#4d4d4d] text-center transition-all border border-[#c0c0b8] hover:border-[#a0a098]"
        >
          스토리 에디터
        </Link>
      </div>

      {/* 푸터 */}
      <footer className="mt-16 text-[#8b8b8b] text-sm">
        텍스트 선택 기반 스토리 게임 엔진
      </footer>
    </main>
  );
}
