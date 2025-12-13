import { create } from 'zustand';
import type { Stats, Item, GameState, Story, Scene, Choice, Effect, Condition, DEFAULT_STATS } from '@/types/game';

interface GameStore {
  // 현재 로드된 스토리
  story: Story | null;
  // 게임 상태
  gameState: GameState | null;
  // 현재 씬
  currentScene: Scene | null;
  // 게임 진행 중 여부
  isPlaying: boolean;
  // 텍스트 애니메이션 진행 중
  isAnimating: boolean;

  // 액션
  loadStory: (story: Story) => void;
  startGame: () => void;
  makeChoice: (choice: Choice) => void;
  goToScene: (sceneId: string) => void;
  applyEffects: (effects: Effect[]) => void;
  checkCondition: (condition: Condition) => boolean;
  updateStats: (updates: Partial<Stats>) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  setFlag: (flag: string, value: boolean) => void;
  setCharacterRelation: (character: string, value: number) => void;
  updateCharacterRelation: (character: string, delta: number) => void;
  setAnimating: (isAnimating: boolean) => void;
  resetGame: () => void;
  setGameState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  story: null,
  gameState: null,
  currentScene: null,
  isPlaying: false,
  isAnimating: false,

  loadStory: (story) => {
    set({ story, isPlaying: false, gameState: null, currentScene: null });
  },

  startGame: () => {
    const { story } = get();
    if (!story) return;

    const startScene = story.scenes.find((s) => s.id === story.startSceneId);
    if (!startScene) return;

    const initialState: GameState = {
      currentSceneId: story.startSceneId,
      stats: { ...story.initialStats },
      inventory: [...story.initialItems],
      flags: {},
      characterRelations: {},
      history: [story.startSceneId],
      playTime: 0,
    };

    set({
      gameState: initialState,
      currentScene: startScene,
      isPlaying: true,
    });

    // 시작 씬의 효과 적용
    if (startScene.effects) {
      get().applyEffects(startScene.effects);
    }
  },

  makeChoice: (choice) => {
    const { story, gameState } = get();
    if (!story || !gameState) return;

    // 선택지 효과 적용
    if (choice.effects) {
      get().applyEffects(choice.effects);
    }

    // 다음 씬으로 이동
    get().goToScene(choice.targetSceneId);
  },

  goToScene: (sceneId) => {
    const { story, gameState } = get();
    if (!story || !gameState) return;

    const nextScene = story.scenes.find((s) => s.id === sceneId);
    if (!nextScene) return;

    const newHistory = [...gameState.history, sceneId];

    set({
      currentScene: nextScene,
      gameState: {
        ...gameState,
        currentSceneId: sceneId,
        history: newHistory,
      },
    });

    // 씬 진입 효과 적용
    if (nextScene.effects) {
      get().applyEffects(nextScene.effects);
    }
  },

  applyEffects: (effects) => {
    const { gameState } = get();
    if (!gameState) return;

    effects.forEach((effect) => {
      switch (effect.type) {
        case 'stat':
          const statKey = effect.target as keyof Stats;
          const currentValue = gameState.stats[statKey];
          let newValue: number;

          if (effect.action === 'add') {
            newValue = currentValue + (effect.value as number);
          } else if (effect.action === 'remove') {
            newValue = currentValue - (effect.value as number);
          } else {
            newValue = effect.value as number;
          }

          // HP는 0 ~ maxHp 범위로 제한
          if (statKey === 'hp') {
            newValue = Math.max(0, Math.min(newValue, gameState.stats.maxHp));
          }
          // 스트레스는 0 ~ 100 범위로 제한
          if (statKey === 'stress') {
            newValue = Math.max(0, Math.min(newValue, 100));
          }

          get().updateStats({ [statKey]: newValue });
          break;

        case 'item':
          if (effect.action === 'add') {
            get().addItem({
              id: effect.target,
              name: effect.itemName || effect.target,
              description: effect.itemDescription || '',
              quantity: effect.value as number,
            });
          } else if (effect.action === 'remove') {
            get().removeItem(effect.target, effect.value as number);
          }
          break;

        case 'flag':
          get().setFlag(effect.target, effect.value as boolean);
          break;

        case 'relation':
          const currentRelation = gameState.characterRelations[effect.target] || 0;
          let newRelation: number;
          if (effect.action === 'add') {
            newRelation = currentRelation + (effect.value as number);
          } else if (effect.action === 'remove') {
            newRelation = currentRelation - (effect.value as number);
          } else {
            newRelation = effect.value as number;
          }
          get().setCharacterRelation(effect.target, newRelation);
          break;
      }
    });
  },

  checkCondition: (condition) => {
    const { gameState } = get();
    if (!gameState) return false;

    let currentValue: number | string | boolean;

    switch (condition.type) {
      case 'stat':
        currentValue = gameState.stats[condition.target as keyof Stats];
        break;
      case 'item':
        const item = gameState.inventory.find((i) => i.id === condition.target);
        if (condition.operator === 'has') {
          return item !== undefined && item.quantity > 0;
        }
        currentValue = item?.quantity ?? 0;
        break;
      case 'flag':
        currentValue = gameState.flags[condition.target] ?? false;
        break;
      case 'relation':
        currentValue = gameState.characterRelations[condition.target] ?? 0;
        break;
      default:
        return false;
    }

    const targetValue = condition.value;

    switch (condition.operator) {
      case 'gt':
        return (currentValue as number) > (targetValue as number);
      case 'gte':
        return (currentValue as number) >= (targetValue as number);
      case 'lt':
        return (currentValue as number) < (targetValue as number);
      case 'lte':
        return (currentValue as number) <= (targetValue as number);
      case 'eq':
        return currentValue === targetValue;
      case 'neq':
        return currentValue !== targetValue;
      case 'has':
        return !!currentValue;
      default:
        return false;
    }
  },

  updateStats: (updates) => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        stats: { ...gameState.stats, ...updates },
      },
    });
  },

  addItem: (item) => {
    const { gameState } = get();
    if (!gameState) return;

    const existingItem = gameState.inventory.find((i) => i.id === item.id);
    let newInventory: Item[];

    if (existingItem) {
      newInventory = gameState.inventory.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      newInventory = [...gameState.inventory, item];
    }

    set({
      gameState: {
        ...gameState,
        inventory: newInventory,
      },
    });
  },

  removeItem: (itemId, quantity = 1) => {
    const { gameState } = get();
    if (!gameState) return;

    const newInventory = gameState.inventory
      .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i))
      .filter((i) => i.quantity > 0);

    set({
      gameState: {
        ...gameState,
        inventory: newInventory,
      },
    });
  },

  setFlag: (flag, value) => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        flags: { ...gameState.flags, [flag]: value },
      },
    });
  },

  setCharacterRelation: (character, value) => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        characterRelations: { ...gameState.characterRelations, [character]: value },
      },
    });
  },

  updateCharacterRelation: (character, delta) => {
    const { gameState } = get();
    if (!gameState) return;

    const currentValue = gameState.characterRelations[character] || 0;
    set({
      gameState: {
        ...gameState,
        characterRelations: { ...gameState.characterRelations, [character]: currentValue + delta },
      },
    });
  },

  setAnimating: (isAnimating) => {
    set({ isAnimating });
  },

  resetGame: () => {
    set({
      gameState: null,
      currentScene: null,
      isPlaying: false,
      isAnimating: false,
    });
  },

  setGameState: (state) => {
    const { story } = get();
    if (!story) return;

    const scene = story.scenes.find((s) => s.id === state.currentSceneId);
    set({
      gameState: state,
      currentScene: scene || null,
      isPlaying: true,
    });
  },
}));
