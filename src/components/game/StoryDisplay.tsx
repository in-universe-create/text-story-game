'use client';

import { useGameStore } from '@/stores/gameStore';

export default function StoryDisplay() {
  const { currentScene } = useGameStore();

  if (!currentScene) {
    return null;
  }

  const hasMedia = currentScene.mediaType && currentScene.mediaType !== 'none';
  const isImage = currentScene.mediaType === 'image' && currentScene.image;
  const isVideo = currentScene.mediaType === 'video' && currentScene.video;

  return (
    <div className="relative bg-[var(--bg-card)] mb-4 min-h-[200px] border border-[var(--border-primary)] overflow-hidden">
      {/* 배경 미디어 */}
      {isImage && (
        <div className="absolute inset-0">
          <img
            src={currentScene.image}
            alt="배경"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      )}

      {isVideo && (
        <div className="absolute inset-0">
          <video
            src={currentScene.video}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className={`relative z-10 p-6 ${hasMedia ? 'min-h-[300px] flex flex-col justify-end' : ''}`}>
        {/* 씬 제목 */}
        <h2 className={`text-xl font-bold mb-4 border-b pb-2 ${
          hasMedia
            ? 'text-white border-white/30'
            : 'text-[var(--text-on-card,var(--text-primary))] border-[var(--border-primary)]'
        }`}>
          {currentScene.title}
        </h2>

        {/* 스토리 텍스트 */}
        <div className={`leading-relaxed whitespace-pre-line text-lg ${
          hasMedia
            ? 'text-white drop-shadow-lg'
            : 'text-[var(--text-on-card-secondary,var(--text-secondary))]'
        }`}>
          {currentScene.text}
        </div>

        {/* 엔딩 표시 */}
        {currentScene.isEnding && (
          <div className={`mt-6 p-4 border ${
            hasMedia
              ? 'bg-black/50 border-white/30'
              : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'
          }`}>
            <p className={`text-center font-bold ${
              hasMedia ? 'text-white' : 'text-[var(--text-on-card-secondary,var(--text-secondary))]'
            }`}>
              이야기가 끝났습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
