'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useEditorStore } from '@/stores/editorStore';
import { sampleStory } from '@/data/sampleStory';

export default function Toolbar() {
  const {
    storyTitle,
    storyDescription,
    updateStoryMeta,
    exportStory,
    importStory,
    resetEditor,
    nodes,
    startSceneId,
  } = useEditorStore();

  const [showMeta, setShowMeta] = useState(false);
  const [title, setTitle] = useState(storyTitle);
  const [description, setDescription] = useState(storyDescription);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 스토리 메타데이터 저장
  const handleSaveMeta = () => {
    updateStoryMeta({ title, description });
    setShowMeta(false);
  };

  // 스토리 내보내기
  const handleExport = () => {
    if (nodes.length === 0) {
      alert('내보낼 씬이 없습니다.');
      return;
    }
    if (!startSceneId) {
      alert('시작 씬을 지정해주세요.');
      return;
    }

    const story = exportStory();
    const blob = new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 스토리 가져오기
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const story = JSON.parse(event.target?.result as string);
        if (!story.scenes || !story.title) {
          throw new Error('올바른 스토리 형식이 아닙니다.');
        }
        importStory(story);
        setTitle(story.title);
        setDescription(story.description);
        alert('스토리를 불러왔습니다!');
      } catch (err) {
        alert('파일을 읽을 수 없습니다. 올바른 JSON 파일인지 확인해주세요.');
      }
    };
    reader.readAsText(file);

    // 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 샘플 스토리 로드
  const handleLoadSample = () => {
    if (nodes.length > 0) {
      if (!confirm('현재 작업 중인 내용이 사라집니다. 계속하시겠습니까?')) {
        return;
      }
    }
    importStory(sampleStory);
    setTitle(sampleStory.title);
    setDescription(sampleStory.description);
  };

  // 새로 만들기
  const handleNew = () => {
    if (nodes.length > 0) {
      if (!confirm('현재 작업 중인 내용이 사라집니다. 계속하시겠습니까?')) {
        return;
      }
    }
    resetEditor();
    setTitle('새 스토리');
    setDescription('스토리 설명을 입력하세요');
  };

  return (
    <>
      <div className="h-14 bg-[#eaeae5] border-b border-[#c0c0b8] flex items-center justify-between px-4">
        {/* 좌측: 제목 & 기본 버튼 */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#6b6b6b] hover:text-[#2d2d2d]">
            &larr; 메인
          </Link>

          <div className="h-6 w-px bg-[#c0c0b8]" />

          <button
            onClick={() => setShowMeta(true)}
            className="text-[#2d2d2d] font-medium hover:text-[#4d4d4d]"
          >
            {storyTitle}
          </button>

          <span className="text-[#8b8b8b] text-sm">
            ({nodes.length}개 씬)
          </span>
        </div>

        {/* 우측: 액션 버튼들 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNew}
            className="px-3 py-1.5 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d] text-sm border border-[#b0b0a8]"
          >
            새로 만들기
          </button>

          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d] text-sm border border-[#b0b0a8]"
          >
            샘플 로드
          </button>

          <label className="px-3 py-1.5 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d] text-sm cursor-pointer border border-[#b0b0a8]">
            불러오기
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] text-sm"
          >
            내보내기
          </button>
        </div>
      </div>

      {/* 스토리 정보 모달 */}
      {showMeta && (
        <div className="fixed inset-0 bg-[#f5f5f0]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f5f0] w-full max-w-md border border-[#a0a098]">
            <div className="p-4 border-b border-[#c0c0b8]">
              <h3 className="text-lg font-bold text-[#2d2d2d]">스토리 정보</h3>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] focus:outline-none focus:border-[#808080]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] focus:outline-none focus:border-[#808080] resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#c0c0b8] flex justify-end gap-2">
              <button
                onClick={() => setShowMeta(false)}
                className="px-4 py-2 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d]"
              >
                취소
              </button>
              <button
                onClick={handleSaveMeta}
                className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0]"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
