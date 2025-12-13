import { StoryMapping, defaultMappings } from '@/data/storyMapping';

const STORAGE_KEY = 'story-mappings';

// 모든 맵핑 조회
export function getMappings(): StoryMapping[] {
  if (typeof window === 'undefined') return defaultMappings;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // 초기 데이터 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMappings));
    return defaultMappings;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return defaultMappings;
  }
}

// 코드로 맵핑 조회
export function getMappingByCode(code: string): StoryMapping | null {
  const mappings = getMappings();
  return mappings.find((m) => m.code === code) || null;
}

// 스토리 ID로 맵핑 조회
export function getMappingsByStoryId(storyId: string): StoryMapping[] {
  const mappings = getMappings();
  return mappings.filter((m) => m.storyId === storyId);
}

// 맵핑 추가
export function addMapping(mapping: StoryMapping): boolean {
  const mappings = getMappings();

  // 코드 중복 체크
  if (mappings.some((m) => m.code === mapping.code)) {
    return false;
  }

  mappings.push(mapping);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  return true;
}

// 맵핑 수정
export function updateMapping(code: string, updates: Partial<StoryMapping>): boolean {
  const mappings = getMappings();
  const index = mappings.findIndex((m) => m.code === code);

  if (index === -1) return false;

  mappings[index] = { ...mappings[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  return true;
}

// 맵핑 삭제
export function deleteMapping(code: string): boolean {
  const mappings = getMappings();
  const filtered = mappings.filter((m) => m.code !== code);

  if (filtered.length === mappings.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// 맵핑 활성화/비활성화 토글
export function toggleMappingActive(code: string): boolean {
  const mappings = getMappings();
  const mapping = mappings.find((m) => m.code === code);

  if (!mapping) return false;

  return updateMapping(code, { isActive: !mapping.isActive });
}

// 코드 중복 체크
export function isCodeExists(code: string): boolean {
  const mappings = getMappings();
  return mappings.some((m) => m.code === code);
}
