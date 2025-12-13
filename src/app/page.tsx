'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError('코드를 입력해주세요.');
      return;
    }

    setError('');
    router.push(`/s/${trimmedCode}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* 메인 메시지 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#2d2d2d] mb-4">스토리 게임</h1>
        <p className="text-[#6b6b6b]">
          전달받은 코드를 입력하세요.
        </p>
      </div>

      {/* 코드 입력 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            placeholder="코드 입력"
            className="flex-1 bg-[#f5f5f0] border border-[#c0c0b8] px-4 py-3 text-[#2d2d2d] text-center text-lg tracking-widest focus:outline-none focus:border-[#808080]"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] font-bold transition-colors"
          >
            입장
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
        )}
      </form>

      {/* 하단 관리자 링크 */}
      <footer className="fixed bottom-4 text-center">
        <Link
          href="/admin"
          className="text-[#a0a098] hover:text-[#6b6b6b] text-xs"
        >
          관리자
        </Link>
      </footer>
    </main>
  );
}
