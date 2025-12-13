'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useEditorStore, type UsedElements } from '@/stores/editorStore';
import { sampleStory } from '@/data/sampleStory';
import { loadStoryIndex, loadAllStories } from '@/lib/storyLoader';
import type { Story } from '@/types/game';

export default function Toolbar() {
  const {
    storyTitle,
    storyDescription,
    storyCode,
    storyFileName,
    updateStoryMeta,
    exportStory,
    importStory,
    resetEditor,
    nodes,
    startSceneId,
    getUsedElements,
  } = useEditorStore();

  const [showMeta, setShowMeta] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [showStoryList, setShowStoryList] = useState(false);
  const [usedElements, setUsedElements] = useState<UsedElements | null>(null);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [title, setTitle] = useState(storyTitle);
  const [description, setDescription] = useState(storyDescription);
  const [code, setCode] = useState(storyCode);
  const [fileName, setFileName] = useState(storyFileName);
  const [existingStories, setExistingStories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 스토어 값 변경 시 로컬 상태 동기화
  useEffect(() => {
    setTitle(storyTitle);
    setDescription(storyDescription);
    setCode(storyCode);
    setFileName(storyFileName);
  }, [storyTitle, storyDescription, storyCode, storyFileName]);

  // 기존 스토리 목록 로드
  useEffect(() => {
    loadStoryIndex().then(setExistingStories);
  }, []);

  // 저장된 스토리 목록 불러오기
  const handleOpenStoryList = async () => {
    setShowStoryList(true);
    setLoadingStories(true);
    try {
      const stories = await loadAllStories();
      setSavedStories(stories);
    } catch {
      setSavedStories([]);
    }
    setLoadingStories(false);
  };

  // 스토리 선택해서 불러오기
  const handleLoadStory = (story: Story) => {
    if (nodes.length > 0) {
      if (!confirm('현재 작업 중인 내용이 사라집니다. 계속하시겠습니까?')) {
        return;
      }
    }
    importStory(story);
    setTitle(story.title);
    setDescription(story.description);
    setCode(story.code || '');
    setFileName(story.fileName || '');
    setShowStoryList(false);
  };

  // 스토리 메타데이터 저장
  const handleSaveMeta = () => {
    // 파일명에서 특수문자 제거
    const sanitizedFileName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'story';

    updateStoryMeta({
      title,
      description,
      code,
      fileName: sanitizedFileName,
    });
    setFileName(sanitizedFileName);
    setShowMeta(false);
  };

  // 스토리 내보내기
  const handleExport = async () => {
    if (nodes.length === 0) {
      alert('내보낼 씬이 없습니다.');
      return;
    }
    if (!startSceneId) {
      alert('시작 씬을 지정해주세요.');
      return;
    }

    const story = exportStory();
    const storyBlob = new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' });
    const storyUrl = URL.createObjectURL(storyBlob);

    // 스토리 파일 다운로드
    const storyLink = document.createElement('a');
    storyLink.href = storyUrl;
    storyLink.download = `${story.fileName || 'story'}.json`;
    storyLink.click();
    URL.revokeObjectURL(storyUrl);

    // index.json 업데이트 안내
    const newFileName = story.fileName || 'story';
    if (!existingStories.includes(newFileName)) {
      const updatedIndex = { stories: [...existingStories, newFileName] };
      const indexBlob = new Blob([JSON.stringify(updatedIndex, null, 2)], { type: 'application/json' });
      const indexUrl = URL.createObjectURL(indexBlob);

      setTimeout(() => {
        if (confirm(`index.json도 업데이트하시겠습니까?\n\n파일을 public/stories/ 폴더에 저장 후,\nindex.json을 다운로드하여 덮어쓰기 해주세요.`)) {
          const indexLink = document.createElement('a');
          indexLink.href = indexUrl;
          indexLink.download = 'index.json';
          indexLink.click();
        }
        URL.revokeObjectURL(indexUrl);
      }, 500);
    }
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
        setCode(story.code || '');
        setFileName(story.fileName || '');
        alert('스토리를 불러왔습니다!');
      } catch {
        alert('파일을 읽을 수 없습니다. 올바른 JSON 파일인지 확인해주세요.');
      }
    };
    reader.readAsText(file);

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
    setCode(sampleStory.code || '');
    setFileName(sampleStory.fileName || 'sample');
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
    setCode(storyCode);
    setFileName('new-story');
  };

  // 코드 자동 생성
  const handleGenerateCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
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

          {storyCode && (
            <span className="text-xs text-[#6b6b6b] bg-[#d0d0c8] px-2 py-0.5 rounded">
              코드: {storyCode}
            </span>
          )}

          <button
            onClick={() => {
              setUsedElements(getUsedElements());
              setShowElements(true);
            }}
            className="px-2 py-1 bg-[#e0e0d8] hover:bg-[#d0d0c8] text-[#4d4d4d] text-xs border border-[#b0b0a8]"
          >
            플래그/아이템/캐릭터 목록
          </button>
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

          <button
            onClick={handleOpenStoryList}
            className="px-3 py-1.5 bg-[#4d6d4d] hover:bg-[#3d5d3d] text-[#f5f5f0] text-sm border border-[#3d5d3d]"
          >
            저장된 스토리
          </button>

          <label className="px-3 py-1.5 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d] text-sm cursor-pointer border border-[#b0b0a8]">
            파일 불러오기
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
              {/* 파일명 */}
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">
                  파일명 <span className="text-xs text-[#8b8b8b]">(영문, 숫자, 한글, -만 가능)</span>
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="예: my-story"
                  className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] focus:outline-none focus:border-[#808080] font-mono"
                />
                <p className="text-xs text-[#8b8b8b] mt-1">
                  저장 위치: public/stories/{fileName || 'story'}.json
                </p>
              </div>

              {/* 접근 코드 */}
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">접근 코드</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="예: abc123"
                    className="flex-1 bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] focus:outline-none focus:border-[#808080] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-3 py-2 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d] text-sm"
                  >
                    자동생성
                  </button>
                </div>
                <p className="text-xs text-[#8b8b8b] mt-1">
                  접근 URL: /s/{code || '코드'}
                </p>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] focus:outline-none focus:border-[#808080]"
                />
              </div>

              {/* 설명 */}
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

      {/* 사용 중인 요소 목록 모달 */}
      {showElements && usedElements && (
        <div className="fixed inset-0 bg-[#f5f5f0]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f5f0] w-full max-w-2xl max-h-[80vh] border border-[#a0a098] flex flex-col">
            <div className="p-4 border-b border-[#c0c0b8] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#2d2d2d]">사용 중인 요소 목록</h3>
              <button
                onClick={() => setShowElements(false)}
                className="text-[#6b6b6b] hover:text-[#2d2d2d] text-xl"
              >
                &times;
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              {/* 플래그 목록 */}
              <div>
                <h4 className="text-sm font-bold text-[#3d3d3d] mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  플래그 ({usedElements.flags.length})
                </h4>
                {usedElements.flags.length === 0 ? (
                  <p className="text-sm text-[#8b8b8b] ml-5">사용 중인 플래그가 없습니다</p>
                ) : (
                  <div className="space-y-2 ml-5">
                    {usedElements.flags.map((flag) => (
                      <div key={flag.name} className="bg-[#eaeae5] border border-[#c0c0b8] p-2">
                        <div className="font-mono text-sm text-[#2d2d2d] font-medium">{flag.name}</div>
                        <div className="text-xs text-[#6b6b6b] mt-1">
                          {flag.usedIn.map((usage, i) => (
                            <div key={i}>• {usage}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 아이템 목록 */}
              <div>
                <h4 className="text-sm font-bold text-[#3d3d3d] mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  아이템 ({usedElements.items.length})
                </h4>
                {usedElements.items.length === 0 ? (
                  <p className="text-sm text-[#8b8b8b] ml-5">사용 중인 아이템이 없습니다</p>
                ) : (
                  <div className="space-y-2 ml-5">
                    {usedElements.items.map((item) => (
                      <div key={item.id} className="bg-[#eaeae5] border border-[#c0c0b8] p-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-[#2d2d2d] font-medium">{item.id}</span>
                          {item.name && <span className="text-sm text-[#6b6b6b]">({item.name})</span>}
                        </div>
                        <div className="text-xs text-[#6b6b6b] mt-1">
                          {item.usedIn.map((usage, i) => (
                            <div key={i}>• {usage}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 캐릭터 목록 */}
              <div>
                <h4 className="text-sm font-bold text-[#3d3d3d] mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                  캐릭터 (호감도) ({usedElements.characters.length})
                </h4>
                {usedElements.characters.length === 0 ? (
                  <p className="text-sm text-[#8b8b8b] ml-5">사용 중인 캐릭터가 없습니다</p>
                ) : (
                  <div className="space-y-2 ml-5">
                    {usedElements.characters.map((char) => (
                      <div key={char.name} className="bg-[#eaeae5] border border-[#c0c0b8] p-2">
                        <div className="font-mono text-sm text-[#2d2d2d] font-medium">{char.name}</div>
                        <div className="text-xs text-[#6b6b6b] mt-1">
                          {char.usedIn.map((usage, i) => (
                            <div key={i}>• {usage}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {usedElements.flags.length === 0 && usedElements.items.length === 0 && usedElements.characters.length === 0 && (
                <div className="text-center py-8 text-[#8b8b8b]">
                  <p>아직 설정된 플래그, 아이템, 캐릭터가 없습니다.</p>
                  <p className="text-sm mt-2">선택지의 효과나 조건을 추가하면 여기에 표시됩니다.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#c0c0b8] flex justify-end">
              <button
                onClick={() => setShowElements(false)}
                className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 저장된 스토리 목록 모달 */}
      {showStoryList && (
        <div className="fixed inset-0 bg-[#f5f5f0]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f5f0] w-full max-w-2xl max-h-[80vh] border border-[#a0a098] flex flex-col">
            <div className="p-4 border-b border-[#c0c0b8] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#2d2d2d]">저장된 스토리 목록</h3>
              <button
                onClick={() => setShowStoryList(false)}
                className="text-[#6b6b6b] hover:text-[#2d2d2d] text-xl"
              >
                &times;
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {loadingStories ? (
                <div className="text-center py-8 text-[#6b6b6b]">
                  스토리 목록을 불러오는 중...
                </div>
              ) : savedStories.length === 0 ? (
                <div className="text-center py-8 text-[#8b8b8b]">
                  <p>저장된 스토리가 없습니다.</p>
                  <p className="text-sm mt-2">
                    public/stories/ 폴더에 JSON 파일을 저장하고<br />
                    index.json에 파일명을 추가해주세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedStories.map((story) => (
                    <button
                      key={story.id}
                      onClick={() => handleLoadStory(story)}
                      className="w-full p-4 bg-[#eaeae5] hover:bg-[#e0e0d8] border border-[#c0c0b8] hover:border-[#a0a098] text-left transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#2d2d2d]">{story.title}</h4>
                          <p className="text-sm text-[#6b6b6b] mt-1 line-clamp-2">
                            {story.description}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs text-[#8b8b8b]">
                            <span>{story.scenes?.length || 0}개 씬</span>
                            {story.code && (
                              <span className="bg-[#d0d0c8] px-1.5 py-0.5">
                                코드: {story.code}
                              </span>
                            )}
                            {story.fileName && (
                              <span className="font-mono">{story.fileName}.json</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[#8b8b8b] ml-2">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#c0c0b8] flex justify-end">
              <button
                onClick={() => setShowStoryList(false)}
                className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
