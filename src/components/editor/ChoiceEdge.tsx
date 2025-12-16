'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
} from '@xyflow/react';
import type { Choice } from '@/types/game';

interface ChoiceEdgeData {
  choice: Choice;
  sourceEdgeIndex?: number;
  totalSourceEdges?: number;
}

interface ChoiceEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: ChoiceEdgeData;
  selected?: boolean;
}

function ChoiceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: ChoiceEdgeProps) {
  // 같은 source에서 나가는 엣지들의 offset 계산
  const sourceEdgeIndex = data?.sourceEdgeIndex ?? 0;
  const totalSourceEdges = data?.totalSourceEdges ?? 1;

  // 여러 엣지가 있을 때 offset 적용 (-30, 0, 30 등으로 분산)
  const offsetStep = 25;
  const baseOffset = -((totalSourceEdges - 1) * offsetStep) / 2;
  const edgeOffset = baseOffset + sourceEdgeIndex * offsetStep;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: sourceX + edgeOffset,
    sourceY,
    sourcePosition,
    targetX: targetX + edgeOffset * 0.5,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const choice = data?.choice;
  const hasCondition = !!choice?.condition;
  const hasEffects = choice?.effects && choice.effects.length > 0;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#3d3d3d' : hasCondition ? '#7a6b5a' : '#8b8b8b',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: hasCondition ? '5,3' : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`
            px-2 py-1 text-xs max-w-[180px]
            ${selected ? 'bg-[#3d3d3d] text-[#f5f5f0]' : hasCondition ? 'bg-[#e8e0d0] text-[#5a4d3d]' : 'bg-[#d0d0c8] text-[#4d4d4d]'}
            border ${hasCondition ? 'border-[#b0a090]' : 'border-[#a0a098]'}
          `}
        >
          <div className={`truncate ${choice?.text ? '' : 'italic opacity-60'}`}>
            {choice?.text || '(선택지 입력)'}
          </div>
          {(hasCondition || hasEffects) && (
            <div className="flex gap-1 mt-0.5 text-[10px] opacity-70">
              {hasCondition && <span>[조건]</span>}
              {hasEffects && <span>[효과]</span>}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ChoiceEdge);
