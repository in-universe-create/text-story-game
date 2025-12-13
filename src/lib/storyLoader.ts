import type { Story } from '@/types/game';

interface StoryIndex {
  stories: string[];  // 파일명 목록 (예: ["my-story", "another-story"])
}

// 스토리 인덱스 로드
export async function loadStoryIndex(): Promise<string[]> {
  try {
    const response = await fetch('/stories/index.json');
    if (!response.ok) return [];
    const data: StoryIndex = await response.json();
    return data.stories || [];
  } catch {
    return [];
  }
}

// 단일 스토리 로드 (파일명으로)
export async function loadStoryByFileName(fileName: string): Promise<Story | null> {
  try {
    const response = await fetch(`/stories/${fileName}.json`);
    if (!response.ok) return null;
    const story: Story = await response.json();
    return story;
  } catch {
    return null;
  }
}

// 모든 스토리 로드
export async function loadAllStories(): Promise<Story[]> {
  const fileNames = await loadStoryIndex();
  const stories: Story[] = [];

  for (const fileName of fileNames) {
    const story = await loadStoryByFileName(fileName);
    if (story) {
      stories.push(story);
    }
  }

  return stories;
}

// 코드로 스토리 찾기
export async function findStoryByCode(code: string): Promise<Story | null> {
  const stories = await loadAllStories();
  return stories.find((s) => s.code === code) || null;
}

// 스토리 인덱스 업데이트 (새 파일 추가)
// 참고: public 폴더에 직접 쓰기는 클라이언트에서 불가능
// 이 함수는 다운로드할 index.json 내용을 생성
export function generateUpdatedIndex(
  currentStories: string[],
  newFileName: string
): StoryIndex {
  const stories = [...new Set([...currentStories, newFileName])];
  return { stories };
}
