// 스토리 맵핑 타입 정의
export interface StoryMapping {
  code: string;        // 접근 코드 (예: "abc123")
  storyId: string;     // 연결된 스토리 ID
  name: string;        // 관리용 이름 (예: "테스트 그룹 A")
  createdAt: string;   // 생성 시간
  isActive: boolean;   // 활성화 여부
}

// 초기 맵핑 데이터 (예시)
export const defaultMappings: StoryMapping[] = [];

// 코드 생성 유틸리티
export function generateCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
