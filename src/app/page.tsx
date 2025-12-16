'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

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
      {/* 우측 상단 테마 토글 */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      {/* 메인 메시지 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">스토리 게임</h1>
        <p className="text-[var(--text-tertiary)]">
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
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] px-4 py-3 text-[var(--text-primary)] text-center text-lg tracking-widest focus:outline-none focus:border-[var(--border-hover)]"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-bold transition-colors"
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
          className="text-[var(--text-muted)] hover:text-[var(--text-tertiary)] text-xs"
        >
          관리자
        </Link>
      </footer>
    </main>
  );
}
