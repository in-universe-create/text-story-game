'use client';

import { useGameStore } from '@/stores/gameStore';
import { STAT_META, type Choice, type Stats } from '@/types/game';

// 연산자를 한글로 변환
const operatorToKorean = (operator: string): string => {
  switch (operator) {
    case 'gt': return '초과';
    case 'gte': return '이상';
    case 'lt': return '미만';
    case 'lte': return '이하';
    case 'eq': return '일치';
    case 'neq': return '불일치';
    default: return operator;
  }
};

export default function ChoicePanel() {
  const { currentScene, isAnimating, makeChoice, checkCondition, gameState } = useGameStore();

  if (!currentScene || currentScene.choices.length === 0) {
    return null;
  }

  const handleChoice = (choice: Choice, isAvailable: boolean) => {
    if (isAnimating || !isAvailable) return;
    makeChoice(choice);
  };

  // 각 선택지의 조건 충족 여부 확인
  const choicesWithAvailability = currentScene.choices.map((choice) => {
    if (!choice.condition) {
      // 조건이 없으면 항상 선택 가능
      return { choice, isAvailable: true };
    }

    const conditionMet = checkCondition(choice.condition);
    const mode = choice.conditionMode || 'enable';

    // enable: 조건 충족 시 선택 가능
    // disable: 조건 충족 시 선택 불가
    const isAvailable = mode === 'enable' ? conditionMet : !conditionMet;

    return { choice, isAvailable };
  });

  return (
    <div className="space-y-3">
      {choicesWithAvailability.map(({ choice, isAvailable }, index) => {
        const condition = choice.condition;
        const mode = choice.conditionMode || 'enable';
        let conditionText = '';

        if (condition && !isAvailable) {
          if (mode === 'enable') {
            // 조건 충족이 필요한데 미충족
            if (condition.type === 'stat') {
              const statLabel = STAT_META[condition.target as keyof Stats]?.label || condition.target;
              const currentValue = gameState?.stats[condition.target as keyof Stats] ?? 0;
              conditionText = `${statLabel} ${condition.value} ${operatorToKorean(condition.operator)} 필요 (현재: ${currentValue})`;
            } else if (condition.type === 'flag') {
              conditionText = `조건 미충족`;
            } else if (condition.type === 'item') {
              conditionText = `아이템 필요: ${condition.target}`;
            } else if (condition.type === 'relation') {
              conditionText = `${condition.target} 호감도 ${condition.value} ${operatorToKorean(condition.operator)} 필요`;
            }
          } else {
            // 조건 충족 시 선택 불가인데 조건 충족됨
            if (condition.type === 'stat') {
              const statLabel = STAT_META[condition.target as keyof Stats]?.label || condition.target;
              conditionText = `${statLabel}가 조건을 충족하여 선택 불가`;
            } else if (condition.type === 'flag') {
              conditionText = `조건 충족으로 선택 불가`;
            } else if (condition.type === 'item') {
              conditionText = `${condition.target} 소지 중이라 선택 불가`;
            } else if (condition.type === 'relation') {
              conditionText = `${condition.target} 호감도 조건 충족으로 선택 불가`;
            }
          }
        }

        return (
          <button
            key={choice.id}
            onClick={() => handleChoice(choice, isAvailable)}
            disabled={isAnimating || !isAvailable}
            className={`
              w-full p-4 text-left transition-all duration-200
              ${
                !isAvailable
                  ? 'bg-[#e8e8e3] text-[#a0a0a0] cursor-not-allowed opacity-60'
                  : isAnimating
                  ? 'bg-[#e8e8e3] text-[#a0a0a0] cursor-not-allowed'
                  : 'bg-[#eaeae5] hover:bg-[#e0e0d8] text-[#3d3d3d] hover:text-[#2d2d2d] hover:translate-x-2'
              }
              border border-[#c0c0b8] hover:border-[#a0a098]
            `}
          >
            <span className="inline-flex items-center gap-3">
              <span className={`
                flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-bold
                ${isAvailable ? 'bg-[#d0d0c8] text-[#3d3d3d]' : 'bg-[#d8d8d3] text-[#a0a0a0]'}
              `}>
                {index + 1}
              </span>
              <span className="flex flex-col">
                <span>{choice.text}</span>
                {!isAvailable && conditionText && (
                  <span className="text-xs text-[#a0a0a0] mt-1">
                    {conditionText}
                  </span>
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
