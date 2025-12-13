'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { SceneNodeData } from '@/stores/editorStore';

interface SceneNodeProps {
  data: SceneNodeData;
  selected?: boolean;
}

function SceneNode({ data, selected }: SceneNodeProps) {
  const { scene, isStart } = data;

  return (
    <div
      className={`
        min-w-[200px] max-w-[280px] bg-[#f5f5f0] border-2 transition-colors
        ${selected ? 'border-[#3d3d3d]' : 'border-[#c0c0b8]'}
        ${isStart ? 'ring-2 ring-[#6b6b6b] ring-offset-2 ring-offset-[#eaeae5]' : ''}
      `}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-[#6b6b6b] border-2 border-[#f5f5f0]"
      />

      {/* 헤더 */}
      <div className="px-3 py-2 bg-[#e0e0d8] border-b border-[#c0c0b8]">
        <div className="flex items-center justify-between">
          <span className="text-[#2d2d2d] font-medium text-sm truncate">
            {scene.title || '제목 없음'}
          </span>
          {isStart && (
            <span className="text-xs bg-[#6b6b6b] text-[#f5f5f0] px-1.5 py-0.5 ml-2">
              시작
            </span>
          )}
          {scene.isEnding && (
            <span className="text-xs bg-[#8b8b8b] text-[#f5f5f0] px-1.5 py-0.5 ml-2">
              엔딩
            </span>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="px-3 py-2">
        <p className="text-[#4d4d4d] text-xs line-clamp-3">
          {scene.text || '내용을 입력하세요...'}
        </p>
      </div>

      {/* 선택지 개수 */}
      <div className="px-3 py-2 bg-[#eaeae5] border-t border-[#c0c0b8]">
        <span className="text-[#8b8b8b] text-xs">
          선택지: {scene.choices.length}개
        </span>
      </div>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-[#3d3d3d] border-2 border-[#f5f5f0]"
      />
    </div>
  );
}

export default memo(SceneNode);
