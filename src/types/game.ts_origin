// 조건 (선택지 표시 조건)
export interface Condition {
  type: 'stat' | 'item' | 'flag' | 'relation';
  target: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'has';
  value: number | string | boolean;
}

// 효과 (스탯/아이템 변경)
export interface Effect {
  type: 'stat' | 'item' | 'flag' | 'relation';
  target: string;
  action: 'add' | 'remove' | 'set';
  value: number | string | boolean;
  // 아이템 효과용 추가 필드
  itemName?: string;
  itemDescription?: string;
}

// 선택지
export interface Choice {
  id: string;
  text: string;
  targetSceneId: string;
  condition?: Condition;
  conditionMode?: 'enable' | 'disable';  // enable: 조건 충족 시 선택 가능, disable: 조건 충족 시 선택 불가
  effects?: Effect[];
}

// 씬 (스토리의 한 장면)
export interface Scene {
  id: string;
  title: string;
  text: string;
  image?: string;
  choices: Choice[];
  effects?: Effect[];
  isEnding?: boolean;
}

// 스토리 데이터 전체
export interface Story {
  id: string;
  title: string;
  description: string;
  code?: string;           // 접근 코드 (예: abc123)
  fileName?: string;       // 파일명 (예: my-story)
  startSceneId: string;
  scenes: Scene[];
  initialStats: Stats;
  initialItems: Item[];
}

// 캐릭터 스탯 (RPG + 심리/사회 혼합)
export interface Stats {
  // RPG 스탯
  hp: number;
  maxHp: number;
  strength: number;
  intelligence: number;
  agility: number;
  // 심리/사회 스탯
  stress: number;
  reputation: number;
  relationship: number;
  gold: number;
}

// 인벤토리 아이템
export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  icon?: string;
}

// 게임 상태
export interface GameState {
  currentSceneId: string;
  stats: Stats;
  inventory: Item[];
  flags: Record<string, boolean>;
  characterRelations: Record<string, number>;  // 캐릭터별 호감도
  history: string[];
  playTime: number;
}

// 세이브 슬롯
export interface SaveSlot {
  id: string;
  name: string;
  storyId: string;
  storyTitle: string;
  gameState: GameState;
  savedAt: string;
  thumbnail?: string;
}

// 기본 스탯 값
export const DEFAULT_STATS: Stats = {
  hp: 100,
  maxHp: 100,
  strength: 10,
  intelligence: 10,
  agility: 10,
  stress: 0,
  reputation: 50,
  relationship: 50,
  gold: 100,
};

// 스탯 메타데이터 (UI 표시용)
export const STAT_META: Record<keyof Stats, { label: string; icon: string; color: string }> = {
  hp: { label: '체력', icon: '❤️', color: 'text-red-500' },
  maxHp: { label: '최대 체력', icon: '💖', color: 'text-red-400' },
  strength: { label: '힘', icon: '💪', color: 'text-orange-500' },
  intelligence: { label: '지능', icon: '🧠', color: 'text-blue-500' },
  agility: { label: '민첩', icon: '⚡', color: 'text-yellow-500' },
  stress: { label: '스트레스', icon: '😰', color: 'text-purple-500' },
  reputation: { label: '평판', icon: '⭐', color: 'text-amber-500' },
  relationship: { label: '관계', icon: '💕', color: 'text-pink-500' },
  gold: { label: '골드', icon: '💰', color: 'text-yellow-600' },
};
