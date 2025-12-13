'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadAllStories } from '@/lib/storyLoader';
import type { Story } from '@/types/game';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  // 스토리 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadAllStories().then((loadedStories) => {
        setStories(loadedStories);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  // 비밀번호 확인
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';

    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  // URL 복사
  const handleCopy = (code: string) => {
    const url = `${window.location.origin}/s/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  // 인증 전 화면
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-[#2d2d2d] mb-6 text-center">
            관리자 로그인
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-4 py-3 text-[#2d2d2d] focus:outline-none focus:border-[#808080]"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] font-bold transition-colors"
            >
              로그인
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[#6b6b6b] hover:text-[#2d2d2d] text-sm">
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 관리자 화면
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#2d2d2d]">스토리 관리</h1>
          <div className="flex gap-2">
            <Link
              href="/editor"
              className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] text-sm"
            >
              새 스토리 만들기
            </Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d] text-sm border border-[#b0b0a8]"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mb-6 p-4 bg-[#eaeae5] border border-[#c0c0b8] text-sm text-[#4d4d4d]">
          <p className="font-medium mb-2">스토리 추가 방법:</p>
          <ol className="list-decimal list-inside space-y-1 text-[#6b6b6b]">
            <li>에디터에서 스토리 작성 후 "내보내기"</li>
            <li>다운로드된 JSON 파일을 <code className="bg-[#d0d0c8] px-1">public/stories/</code> 폴더에 저장</li>
            <li><code className="bg-[#d0d0c8] px-1">index.json</code>에 파일명 추가</li>
            <li>서버 재시작 후 목록에 표시됨</li>
          </ol>
        </div>

        {/* 스토리 목록 */}
        <div className="bg-[#f5f5f0] border border-[#c0c0b8]">
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 p-4 border-b border-[#c0c0b8] bg-[#eaeae5] font-bold text-[#4d4d4d] text-sm">
            <div>제목</div>
            <div>파일명</div>
            <div>접근 코드</div>
            <div>관리</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#8b8b8b]">
              스토리 목록을 불러오는 중...
            </div>
          ) : stories.length === 0 ? (
            <div className="p-8 text-center text-[#8b8b8b]">
              등록된 스토리가 없습니다.
              <br />
              <span className="text-sm">public/stories/index.json에 스토리 파일명을 추가해주세요.</span>
            </div>
          ) : (
            stories.map((story) => (
              <div
                key={story.id}
                className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 p-4 border-b border-[#c0c0b8] last:border-b-0 items-center"
              >
                <div>
                  <span className="font-medium text-[#2d2d2d]">{story.title}</span>
                  <p className="text-xs text-[#8b8b8b] mt-1 line-clamp-1">
                    {story.description}
                  </p>
                </div>
                <div className="font-mono text-sm text-[#6b6b6b]">
                  {story.fileName || '-'}
                </div>
                <div className="font-mono text-[#2d2d2d]">
                  {story.code || <span className="text-[#8b8b8b]">없음</span>}
                </div>
                <div className="flex gap-2">
                  {story.code && (
                    <button
                      onClick={() => handleCopy(story.code!)}
                      className="px-2 py-1 text-xs bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d]"
                    >
                      {copied === story.code ? '복사됨!' : 'URL 복사'}
                    </button>
                  )}
                  <Link
                    href={story.code ? `/s/${story.code}` : `/play?story=${story.id}`}
                    className="px-2 py-1 text-xs bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0]"
                  >
                    플레이
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* index.json 구조 안내 */}
        <div className="mt-8 p-4 bg-[#eaeae5] border border-[#c0c0b8]">
          <h3 className="font-bold text-[#2d2d2d] mb-2">index.json 예시</h3>
          <pre className="bg-[#f5f5f0] p-3 text-sm font-mono text-[#4d4d4d] overflow-x-auto">
{`{
  "stories": [
    "my-story",
    "another-story"
  ]
}`}
          </pre>
        </div>
      </div>
    </main>
  );
}
