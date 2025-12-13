import type { GameState, SaveSlot } from '@/types/game';

const SAVE_KEY = 'story-game-saves';
const MAX_SLOTS = 10;

export function getSaveSlots(): SaveSlot[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(SAVE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveGame(
  slotId: string,
  name: string,
  storyId: string,
  storyTitle: string,
  gameState: GameState
): SaveSlot {
  const slots = getSaveSlots();

  const newSlot: SaveSlot = {
    id: slotId,
    name,
    storyId,
    storyTitle,
    gameState,
    savedAt: new Date().toISOString(),
  };

  const existingIndex = slots.findIndex((s) => s.id === slotId);

  if (existingIndex >= 0) {
    slots[existingIndex] = newSlot;
  } else {
    if (slots.length >= MAX_SLOTS) {
      // 가장 오래된 슬롯 제거
      slots.sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());
      slots.shift();
    }
    slots.push(newSlot);
  }

  localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
  return newSlot;
}

export function loadGame(slotId: string): SaveSlot | null {
  const slots = getSaveSlots();
  return slots.find((s) => s.id === slotId) || null;
}

export function deleteSave(slotId: string): void {
  const slots = getSaveSlots();
  const filtered = slots.filter((s) => s.id !== slotId);
  localStorage.setItem(SAVE_KEY, JSON.stringify(filtered));
}

export function createNewSlotId(): string {
  return `save-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatSaveDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 자동 저장
const AUTO_SAVE_KEY = 'story-game-autosave';

export function autoSave(
  storyId: string,
  storyTitle: string,
  gameState: GameState
): void {
  const autoSaveData = {
    storyId,
    storyTitle,
    gameState,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));
}

export function getAutoSave(): { storyId: string; storyTitle: string; gameState: GameState; savedAt: string } | null {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(AUTO_SAVE_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearAutoSave(): void {
  localStorage.removeItem(AUTO_SAVE_KEY);
}
