'use client';

import { useState, useEffect, useMemo } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import type { Choice, Condition, Effect, Stats } from '@/types/game';
import { STAT_META } from '@/types/game';

// 자동완성 드롭다운 컴포넌트
function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 bg-[#f5f5f0] border border-[#c0c0b8] max-h-32 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={() => {
                onChange(suggestion);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-2 py-1 text-xs hover:bg-[#e0e0d8] text-[#2d2d2d]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {suggestions.length > 0 && !showSuggestions && (
        <div className="text-xs text-[#8b8b8b] mt-0.5">
          기존: {suggestions.slice(0, 3).join(', ')}{suggestions.length > 3 ? '...' : ''}
        </div>
      )}
    </div>
  );
}

interface EdgeData {
  choice?: Choice;
}

// 스탯 키 목록
const STAT_KEYS: (keyof Stats)[] = [
  'hp', 'strength', 'intelligence', 'agility', 'stress', 'reputation', 'relationship', 'gold'
];

// 연산자 옵션
const OPERATORS = [
  { value: 'gte', label: '>= (이상)' },
  { value: 'gt', label: '> (초과)' },
  { value: 'lte', label: '<= (이하)' },
  { value: 'lt', label: '< (미만)' },
  { value: 'eq', label: '== (같음)' },
  { value: 'neq', label: '!= (다름)' },
];

// 효과 액션 옵션
const EFFECT_ACTIONS = [
  { value: 'add', label: '증가 (+)' },
  { value: 'remove', label: '감소 (-)' },
  { value: 'set', label: '설정 (=)' },
];

// 아이템 액션 옵션
const ITEM_ACTIONS = [
  { value: 'add', label: '획득' },
  { value: 'remove', label: '소모' },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default function NodeEditor() {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    updateNode,
    deleteNode,
    updateEdge,
    deleteEdge,
    setStartScene,
    startSceneId,
    getUsedElements,
    setSelectedNode,
    setSelectedEdge,
    addNode,
    addEdge,
  } = useEditorStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // 사용 중인 요소 목록 (자동완성용)
  const usedElements = useMemo(() => getUsedElements(), [nodes, edges, getUsedElements]);
  const existingFlags = useMemo(() => usedElements.flags.map((f) => f.name), [usedElements]);
  const existingItems = useMemo(() => usedElements.items.map((i) => i.id), [usedElements]);
  const existingCharacters = useMemo(() => usedElements.characters.map((c) => c.name), [usedElements]);

  // 씬 편집 상태
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // 선택지 추가 모달 상태
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [newChoiceText, setNewChoiceText] = useState('새 선택지');
  const [newChoiceTarget, setNewChoiceTarget] = useState<string>('new'); // 'new' 또는 기존 씬 id

  // 선택지 편집 상태
  const [choiceText, setChoiceText] = useState('');
  const [showChangeTarget, setShowChangeTarget] = useState(false);

  // 조건 편집 상태
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionMode, setConditionMode] = useState<'enable' | 'disable'>('enable');
  const [conditionType, setConditionType] = useState<'stat' | 'flag' | 'item' | 'relation'>('stat');
  const [conditionTarget, setConditionTarget] = useState<string>('hp');
  const [conditionOperator, setConditionOperator] = useState<string>('gte');
  const [conditionValue, setConditionValue] = useState<number>(0);
  const [conditionFlagName, setConditionFlagName] = useState('');
  const [conditionItemId, setConditionItemId] = useState('');
  const [conditionCharacter, setConditionCharacter] = useState('');

  // 효과 편집 상태
  const [effects, setEffects] = useState<Effect[]>([]);

  // 선택된 노드가 변경되면 상태 업데이트
  useEffect(() => {
    if (selectedNode) {
      setTitle(selectedNode.data.scene.title);
      setText(selectedNode.data.scene.text);
      setIsEnding(selectedNode.data.scene.isEnding || false);
      setMediaType(selectedNode.data.scene.mediaType || 'none');
      setImageUrl(selectedNode.data.scene.image || '');
      setVideoUrl(selectedNode.data.scene.video || '');
    }
  }, [selectedNode]);

  // 선택된 엣지가 변경되면 상태 업데이트
  useEffect(() => {
    // 엣지 선택 시 드롭다운 초기화
    setShowChangeTarget(false);

    const edgeData = selectedEdge?.data as EdgeData | undefined;
    if (edgeData?.choice) {
      setChoiceText(edgeData.choice.text);

      // 조건 로드
      const condition = edgeData.choice.condition;
      if (condition) {
        setHasCondition(true);
        setConditionMode(edgeData.choice.conditionMode || 'enable');
        setConditionType(condition.type as 'stat' | 'flag' | 'item' | 'relation');
        setConditionTarget(condition.target);
        setConditionOperator(condition.operator);
        setConditionValue(typeof condition.value === 'number' ? condition.value : 0);
        if (condition.type === 'flag') {
          setConditionFlagName(condition.target);
        } else if (condition.type === 'item') {
          setConditionItemId(condition.target);
        } else if (condition.type === 'relation') {
          setConditionCharacter(condition.target);
        }
      } else {
        setHasCondition(false);
        setConditionMode('enable');
        setConditionType('stat');
        setConditionTarget('hp');
        setConditionOperator('gte');
        setConditionValue(0);
        setConditionFlagName('');
        setConditionItemId('');
        setConditionCharacter('');
      }

      // 효과 로드
      setEffects(edgeData.choice.effects || []);
    }
  }, [selectedEdge]);

  // 씬 저장
  const handleSaveNode = () => {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, {
      title,
      text,
      isEnding,
      mediaType,
      image: mediaType === 'image' ? imageUrl : undefined,
      video: mediaType === 'video' ? videoUrl : undefined,
    });
  };

  // 선택지 저장
  const handleSaveEdge = () => {
    if (!selectedEdgeId) return;

    let condition: Condition | undefined = undefined;

    if (hasCondition) {
      if (conditionType === 'flag') {
        condition = {
          type: 'flag',
          target: conditionFlagName,
          operator: 'eq',
          value: true,
        };
      } else if (conditionType === 'item') {
        condition = {
          type: 'item',
          target: conditionItemId,
          operator: 'has',
          value: true,
        };
      } else if (conditionType === 'relation') {
        condition = {
          type: 'relation',
          target: conditionCharacter,
          operator: conditionOperator as Condition['operator'],
          value: conditionValue,
        };
      } else {
        condition = {
          type: 'stat',
          target: conditionTarget,
          operator: conditionOperator as Condition['operator'],
          value: conditionValue,
        };
      }
    }

    updateEdge(selectedEdgeId, {
      text: choiceText,
      condition,
      conditionMode: hasCondition ? conditionMode : undefined,
      effects: effects.length > 0 ? effects : undefined,
    });
  };

  // 효과 추가
  const handleAddEffect = () => {
    const newEffect: Effect = {
      type: 'stat',
      target: 'hp',
      action: 'add',
      value: 10,
    };
    setEffects([...effects, newEffect]);
  };

  // 효과 수정
  const handleUpdateEffect = (index: number, updates: Partial<Effect>) => {
    const newEffects = effects.map((effect, i) =>
      i === index ? { ...effect, ...updates } : effect
    );
    setEffects(newEffects);
  };

  // 효과 삭제
  const handleRemoveEffect = (index: number) => {
    setEffects(effects.filter((_, i) => i !== index));
  };

  // 시작 씬으로 설정
  const handleSetStart = () => {
    if (!selectedNodeId) return;
    setStartScene(selectedNodeId);
  };

  // 선택지 추가 (씬 편집에서)
  const handleAddChoice = () => {
    if (!selectedNodeId) return;

    let targetSceneId = newChoiceTarget;

    // 새 씬 생성이면 씬 먼저 생성
    if (newChoiceTarget === 'new') {
      const newSceneId = generateId();
      const currentNode = nodes.find((n) => n.id === selectedNodeId);
      const newPosition = {
        x: (currentNode?.position.x || 0) + 300,
        y: (currentNode?.position.y || 0) + 100,
      };

      addNode(
        {
          id: newSceneId,
          title: '새 씬',
          text: '',
          choices: [],
        },
        newPosition
      );

      targetSceneId = newSceneId;
    }

    // 선택지 추가
    const choiceId = generateId();
    addEdge(selectedNodeId, targetSceneId, {
      id: choiceId,
      text: newChoiceText,
      targetSceneId: targetSceneId,
    });

    // 모달 닫고 초기화
    setShowAddChoice(false);
    setNewChoiceText('새 선택지');
    setNewChoiceTarget('new');
  };

  // 선택지 도착 씬 변경
  const handleChangeTargetScene = (newTargetId: string) => {
    if (!selectedEdgeId || !selectedEdge) return;

    const currentChoice = selectedEdge.data?.choice;
    if (!currentChoice) return;

    // 새 씬 생성이면 씬 먼저 생성
    let targetSceneId = newTargetId;
    if (newTargetId === 'new') {
      const newSceneId = generateId();
      const sourceNode = nodes.find((n) => n.id === selectedEdge.source);
      const newPosition = {
        x: (sourceNode?.position.x || 0) + 300,
        y: (sourceNode?.position.y || 0) + 100,
      };

      addNode(
        {
          id: newSceneId,
          title: '새 씬',
          text: '',
          choices: [],
        },
        newPosition
      );

      targetSceneId = newSceneId;
    }

    // 기존 엣지 삭제하고 새로 생성 (target 변경)
    deleteEdge(selectedEdgeId);
    const newEdgeChoiceId = generateId();
    addEdge(selectedEdge.source, targetSceneId, {
      ...currentChoice,
      id: newEdgeChoiceId,
      targetSceneId: targetSceneId,
    });
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-80 bg-[#eaeae5] border-l border-[#c0c0b8] p-4">
        <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">속성 편집</h3>
        <p className="text-[#8b8b8b] text-sm">
          노드나 연결선을 선택하면 여기서 편집할 수 있습니다.
        </p>

        <div className="mt-6 p-4 bg-[#f5f5f0] border border-[#c0c0b8]">
          <h4 className="text-sm font-medium text-[#4d4d4d] mb-2">사용법</h4>
          <ul className="text-xs text-[#6b6b6b] space-y-1">
            <li>- 더블클릭: 새 씬 추가</li>
            <li>- 노드 연결: 핸들을 드래그</li>
            <li>- 삭제: 선택 후 Delete 키</li>
          </ul>
        </div>
      </div>
    );
  }

  // 씬 노드 편집
  if (selectedNode) {
    return (
      <div className="w-80 bg-[#eaeae5] border-l border-[#c0c0b8] p-4 overflow-y-auto">
        <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">씬 편집</h3>

        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm text-[#6b6b6b] mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveNode}
              className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm text-[#6b6b6b] mb-1">스토리 텍스트</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleSaveNode}
              rows={8}
              placeholder="스토리 내용을 입력하세요..."
              className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080] resize-none"
            />
          </div>

          {/* 배경 미디어 설정 */}
          <div className="border border-[#c0c0b8] bg-[#f5f5f0] p-3">
            <label className="block text-sm font-medium text-[#4d4d4d] mb-2">배경 미디어</label>

            {/* 미디어 타입 선택 */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setMediaType('none');
                  updateNode(selectedNodeId!, { mediaType: 'none', image: undefined, video: undefined });
                }}
                className={`flex-1 px-2 py-1.5 text-xs border ${
                  mediaType === 'none'
                    ? 'bg-[#3d3d3d] text-[#f5f5f0] border-[#3d3d3d]'
                    : 'bg-[#eaeae5] text-[#4d4d4d] border-[#c0c0b8] hover:bg-[#e0e0d8]'
                }`}
              >
                없음
              </button>
              <button
                onClick={() => {
                  setMediaType('image');
                }}
                className={`flex-1 px-2 py-1.5 text-xs border ${
                  mediaType === 'image'
                    ? 'bg-[#3d3d3d] text-[#f5f5f0] border-[#3d3d3d]'
                    : 'bg-[#eaeae5] text-[#4d4d4d] border-[#c0c0b8] hover:bg-[#e0e0d8]'
                }`}
              >
                이미지
              </button>
              <button
                onClick={() => {
                  setMediaType('video');
                }}
                className={`flex-1 px-2 py-1.5 text-xs border ${
                  mediaType === 'video'
                    ? 'bg-[#3d3d3d] text-[#f5f5f0] border-[#3d3d3d]'
                    : 'bg-[#eaeae5] text-[#4d4d4d] border-[#c0c0b8] hover:bg-[#e0e0d8]'
                }`}
              >
                비디오
              </button>
            </div>

            {/* 이미지 URL 입력 */}
            {mediaType === 'image' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onBlur={handleSaveNode}
                  placeholder="이미지 URL 입력 (https://...)"
                  className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-xs focus:outline-none focus:border-[#808080]"
                />
                {imageUrl && (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="미리보기"
                      className="w-full h-24 object-cover border border-[#c0c0b8]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-[#8b8b8b]">
                  외부 이미지 URL 또는 /images/ 폴더 내 이미지 경로
                </p>
              </div>
            )}

            {/* 비디오 URL 입력 */}
            {mediaType === 'video' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onBlur={handleSaveNode}
                  placeholder="비디오 URL 입력 (mp4, webm 등)"
                  className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-xs focus:outline-none focus:border-[#808080]"
                />
                {videoUrl && (
                  <video
                    src={videoUrl}
                    className="w-full h-24 object-cover border border-[#c0c0b8]"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                )}
                <p className="text-xs text-[#8b8b8b]">
                  mp4, webm 형식 지원. 자동 반복 재생됩니다.
                </p>
              </div>
            )}
          </div>

          {/* 옵션 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#4d4d4d]">
              <input
                type="checkbox"
                checked={isEnding}
                onChange={(e) => {
                  setIsEnding(e.target.checked);
                  updateNode(selectedNodeId!, { isEnding: e.target.checked });
                }}
                className="bg-[#f5f5f0] border-[#c0c0b8]"
              />
              엔딩 씬으로 설정
            </label>

            {startSceneId !== selectedNodeId && (
              <button
                onClick={handleSetStart}
                className="w-full px-3 py-2 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] text-sm border border-[#b0b0a8]"
              >
                시작 씬으로 설정
              </button>
            )}

            {startSceneId === selectedNodeId && (
              <p className="text-[#4d4d4d] text-sm text-center py-2 bg-[#d0d0c8] border border-[#b0b0a8]">
                현재 시작 씬입니다
              </p>
            )}
          </div>

          {/* 이 씬으로 들어오는 선택지 (Incoming) */}
          {(() => {
            const incomingEdges = edges.filter((e) => e.target === selectedNodeId);
            if (incomingEdges.length === 0) return null;
            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-[#6b6b6b]">
                    이 씬으로 들어오는 선택지 ({incomingEdges.length})
                  </label>
                </div>
                <div className="space-y-2 mb-4">
                  {incomingEdges.map((edge) => {
                    const sourceScene = nodes.find((n) => n.id === edge.source);
                    const choice = edge.data?.choice;
                    return (
                      <div
                        key={edge.id}
                        className="p-2 bg-[#e8f0e8] text-sm text-[#3d5d3d] border border-[#b8c8b8] hover:bg-[#dce8dc] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#6b8b6b]">← 들어오는 선택지</span>
                          <button
                            onClick={() => setSelectedEdge(edge.id)}
                            className="text-xs px-2 py-0.5 bg-[#b8c8b8] hover:bg-[#a8b8a8] text-[#3d5d3d]"
                          >
                            편집
                          </button>
                        </div>
                        <div className="mt-1 font-medium">{choice?.text || '선택지'}</div>
                        <button
                          onClick={() => setSelectedNode(edge.source)}
                          className="mt-1 w-full text-left text-xs text-[#4d6d4d] hover:text-[#2d4d2d] hover:underline flex items-center gap-1"
                        >
                          <span>←</span>
                          <span>출발 씬: {sourceScene?.data.scene.title || '알 수 없는 씬'}</span>
                        </button>
                        {choice?.condition && (
                          <div className="text-xs text-[#8b9b8b] mt-1">
                            [조건] {choice.condition.target} {choice.condition.operator} {String(choice.condition.value)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 선택지 목록 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-[#6b6b6b]">
                나가는 선택지 ({selectedNode.data.scene.choices.length})
              </label>
              <button
                onClick={() => setShowAddChoice(true)}
                className="text-xs px-2 py-1 bg-[#4d6d4d] hover:bg-[#3d5d3d] text-[#f5f5f0]"
              >
                + 선택지 추가
              </button>
            </div>
            <div className="space-y-2">
              {selectedNode.data.scene.choices.map((choice, i) => {
                // 해당 선택지의 엣지 ID 찾기
                const choiceEdge = edges.find(
                  (e) => e.source === selectedNodeId && e.data?.choice?.id === choice.id
                );
                const targetScene = nodes.find((n) => n.id === choice.targetSceneId);
                return (
                  <button
                    key={choice.id}
                    onClick={() => choiceEdge && setSelectedEdge(choiceEdge.id)}
                    className="w-full p-2 bg-[#f5f5f0] text-sm text-[#4d4d4d] border border-[#c0c0b8] text-left hover:bg-[#e8e8e3] hover:border-[#a0a098] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span>{i + 1}. {choice.text}</span>
                      <span className="text-xs text-[#8b8b8b]">→</span>
                    </div>
                    <div className="text-xs text-[#8b8b8b] mt-1">
                      → {targetScene?.data.scene.title || '알 수 없는 씬'}
                    </div>
                    {choice.condition && (
                      <div className="text-xs text-[#a08060] mt-1">
                        [조건] {choice.condition.target} {choice.condition.operator} {String(choice.condition.value)}
                      </div>
                    )}
                  </button>
                );
              })}
              {selectedNode.data.scene.choices.length === 0 && (
                <p className="text-[#8b8b8b] text-xs">
                  선택지 추가 버튼을 누르거나<br />
                  캔버스에서 노드를 연결하세요
                </p>
              )}
            </div>

            {/* 선택지 추가 모달 */}
            {showAddChoice && (
              <div className="fixed inset-0 bg-[#f5f5f0]/90 z-50 flex items-center justify-center p-4">
                <div className="bg-[#f5f5f0] w-full max-w-sm border border-[#a0a098]">
                  <div className="p-4 border-b border-[#c0c0b8]">
                    <h3 className="text-lg font-bold text-[#2d2d2d]">선택지 추가</h3>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm text-[#6b6b6b] mb-1">선택지 텍스트</label>
                      <input
                        type="text"
                        value={newChoiceText}
                        onChange={(e) => setNewChoiceText(e.target.value)}
                        className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#6b6b6b] mb-1">연결할 씬</label>
                      <select
                        value={newChoiceTarget}
                        onChange={(e) => setNewChoiceTarget(e.target.value)}
                        className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                      >
                        <option value="new">✨ 새 씬 만들기</option>
                        <optgroup label="기존 씬">
                          {nodes
                            .filter((n) => n.id !== selectedNodeId)
                            .map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.data.scene.title}
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 border-t border-[#c0c0b8] flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowAddChoice(false);
                        setNewChoiceText('새 선택지');
                        setNewChoiceTarget('new');
                      }}
                      className="px-4 py-2 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#3d3d3d] text-sm"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleAddChoice}
                      className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] text-sm"
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 삭제 버튼 */}
          <button
            onClick={() => {
              if (confirm('이 씬을 삭제하시겠습니까?')) {
                deleteNode(selectedNodeId!);
              }
            }}
            className="w-full px-3 py-2 bg-[#e0e0d8] hover:bg-[#d0d0c8] text-[#6b6b6b] text-sm border border-[#c0c0b8]"
          >
            씬 삭제
          </button>
        </div>
      </div>
    );
  }

  // 엣지(선택지) 편집
  if (selectedEdge) {
    return (
      <div className="w-80 bg-[#eaeae5] border-l border-[#c0c0b8] p-4 overflow-y-auto max-h-screen">
        <h3 className="text-lg font-bold text-[#2d2d2d] mb-4">선택지 편집</h3>

        <div className="space-y-4">
          {/* 선택지 텍스트 */}
          <div>
            <label className="block text-sm text-[#6b6b6b] mb-1">선택지 텍스트</label>
            <input
              type="text"
              value={choiceText}
              onChange={(e) => setChoiceText(e.target.value)}
              onBlur={handleSaveEdge}
              className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
            />
          </div>

          {/* 연결 정보 */}
          <div className="p-3 bg-[#f5f5f0] border border-[#c0c0b8] space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#8b8b8b] w-10">출발:</span>
              <button
                onClick={() => setSelectedNode(selectedEdge.source)}
                className="flex-1 text-left px-2 py-1 bg-[#eaeae5] hover:bg-[#e0e0d8] border border-[#c0c0b8] hover:border-[#a0a098] text-[#4d4d4d] transition-colors"
              >
                {nodes.find((n) => n.id === selectedEdge.source)?.data.scene.title || selectedEdge.source}
                <span className="text-xs text-[#8b8b8b] ml-2">→</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#8b8b8b] w-10">도착:</span>
              <div className="flex-1 flex items-center gap-1">
                <button
                  onClick={() => setSelectedNode(selectedEdge.target)}
                  className="flex-1 text-left px-2 py-1 bg-[#eaeae5] hover:bg-[#e0e0d8] border border-[#c0c0b8] hover:border-[#a0a098] text-[#4d4d4d] transition-colors truncate"
                >
                  {nodes.find((n) => n.id === selectedEdge.target)?.data.scene.title || selectedEdge.target}
                  <span className="text-xs text-[#8b8b8b] ml-2">→</span>
                </button>
                <button
                  onClick={() => setShowChangeTarget(!showChangeTarget)}
                  className="px-2 py-1 bg-[#d0d0c8] hover:bg-[#c0c0b8] border border-[#b0b0a8] text-[#4d4d4d] text-xs"
                  title="도착 씬 변경"
                >
                  변경
                </button>
              </div>
            </div>

            {/* 도착 씬 변경 드롭다운 */}
            {showChangeTarget && (
              <div className="mt-2 p-2 bg-[#eaeae5] border border-[#c0c0b8]">
                <label className="block text-xs text-[#8b8b8b] mb-1">새로운 도착 씬 선택</label>
                <select
                  defaultValue={selectedEdge.target}
                  onChange={(e) => {
                    handleChangeTargetScene(e.target.value);
                    setShowChangeTarget(false);
                  }}
                  className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                >
                  <option value="new">✨ 새 씬 만들기</option>
                  <optgroup label="기존 씬">
                    {nodes
                      .filter((n) => n.id !== selectedEdge.source)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.data.scene.title} {n.id === selectedEdge.target ? '(현재)' : ''}
                        </option>
                      ))}
                  </optgroup>
                </select>
                <button
                  onClick={() => setShowChangeTarget(false)}
                  className="mt-2 w-full px-2 py-1 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d] text-xs border border-[#b0b0a8]"
                >
                  취소
                </button>
              </div>
            )}
          </div>

          {/* 조건 설정 */}
          <div className="border border-[#c0c0b8] bg-[#f5f5f0] p-3">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#4d4d4d]">선택 조건</label>
              <label className="flex items-center gap-2 text-xs text-[#6b6b6b]">
                <input
                  type="checkbox"
                  checked={hasCondition}
                  onChange={(e) => {
                    setHasCondition(e.target.checked);
                    if (!e.target.checked) {
                      // 조건 제거 시 바로 저장
                      updateEdge(selectedEdgeId!, {
                        text: choiceText,
                        condition: undefined,
                        effects: effects.length > 0 ? effects : undefined,
                      });
                    }
                  }}
                  className="bg-[#f5f5f0] border-[#c0c0b8]"
                />
                조건 사용
              </label>
            </div>

            {hasCondition && (
              <div className="space-y-3">
                {/* 조건 모드 */}
                <div>
                  <label className="block text-xs text-[#8b8b8b] mb-1">조건 충족 시</label>
                  <select
                    value={conditionMode}
                    onChange={(e) => setConditionMode(e.target.value as 'enable' | 'disable')}
                    className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                  >
                    <option value="enable">선택 가능</option>
                    <option value="disable">선택 불가</option>
                  </select>
                </div>

                {/* 조건 타입 */}
                <div>
                  <label className="block text-xs text-[#8b8b8b] mb-1">조건 타입</label>
                  <select
                    value={conditionType}
                    onChange={(e) => setConditionType(e.target.value as 'stat' | 'flag' | 'item' | 'relation')}
                    className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                  >
                    <option value="stat">스탯 조건</option>
                    <option value="flag">플래그 조건</option>
                    <option value="item">아이템 소지 조건</option>
                    <option value="relation">캐릭터 호감도 조건</option>
                  </select>
                </div>

                {conditionType === 'stat' ? (
                  <>
                    {/* 스탯 선택 */}
                    <div>
                      <label className="block text-xs text-[#8b8b8b] mb-1">스탯</label>
                      <select
                        value={conditionTarget}
                        onChange={(e) => setConditionTarget(e.target.value)}
                        className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                      >
                        {STAT_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {STAT_META[key].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 연산자 */}
                    <div>
                      <label className="block text-xs text-[#8b8b8b] mb-1">조건</label>
                      <select
                        value={conditionOperator}
                        onChange={(e) => setConditionOperator(e.target.value)}
                        className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 값 */}
                    <div>
                      <label className="block text-xs text-[#8b8b8b] mb-1">값</label>
                      <input
                        type="number"
                        value={conditionValue}
                        onChange={(e) => setConditionValue(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                      />
                    </div>
                  </>
                ) : conditionType === 'flag' ? (
                  /* 플래그 조건 */
                  <div>
                    <label className="block text-xs text-[#8b8b8b] mb-1">플래그 이름</label>
                    <AutocompleteInput
                      value={conditionFlagName}
                      onChange={setConditionFlagName}
                      suggestions={existingFlags}
                      placeholder="예: gotSword, metKing"
                      className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                    />
                  </div>
                ) : conditionType === 'item' ? (
                  /* 아이템 소지 조건 */
                  <div>
                    <label className="block text-xs text-[#8b8b8b] mb-1">아이템 ID</label>
                    <AutocompleteInput
                      value={conditionItemId}
                      onChange={setConditionItemId}
                      suggestions={existingItems}
                      placeholder="예: rusty-key, magic-potion"
                      className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                    />
                  </div>
                ) : (
                  /* 캐릭터 호감도 조건 */
                  <>
                    <div>
                      <label className="block text-xs text-[#8b8b8b] mb-1">캐릭터 이름</label>
                      <AutocompleteInput
                        value={conditionCharacter}
                        onChange={setConditionCharacter}
                        suggestions={existingCharacters}
                        placeholder="예: 엘리스, 마왕"
                        className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8b8b8b] mb-1">조건</label>
                      <select
                        value={conditionOperator}
                        onChange={(e) => setConditionOperator(e.target.value)}
                        className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#8b8b8b] mb-1">호감도 값</label>
                      <input
                        type="number"
                        value={conditionValue}
                        onChange={(e) => setConditionValue(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                      />
                    </div>
                  </>
                )}

                {/* 조건 미리보기 */}
                <div className={`p-2 border text-xs ${conditionMode === 'enable' ? 'bg-[#eaeae5] border-[#d0d0c8] text-[#4d4d4d]' : 'bg-[#f0e0e0] border-[#d0b0b0] text-[#6d4d4d]'}`}>
                  {conditionType === 'stat' ? (
                    <>
                      <span className="font-medium">{STAT_META[conditionTarget as keyof Stats]?.label || conditionTarget}</span>
                      {' '}
                      {OPERATORS.find(op => op.value === conditionOperator)?.label}
                      {' '}
                      <span className="font-medium">{conditionValue}</span>
                      {' '}일 때 선택 {conditionMode === 'enable' ? '가능' : '불가'}
                    </>
                  ) : conditionType === 'flag' ? (
                    <>
                      플래그 <span className="font-medium">{conditionFlagName || '(미설정)'}</span>가 활성화되었을 때 선택 {conditionMode === 'enable' ? '가능' : '불가'}
                    </>
                  ) : conditionType === 'item' ? (
                    <>
                      아이템 <span className="font-medium">{conditionItemId || '(미설정)'}</span>을(를) 소지할 때 선택 {conditionMode === 'enable' ? '가능' : '불가'}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{conditionCharacter || '(미설정)'}</span> 호감도{' '}
                      {OPERATORS.find(op => op.value === conditionOperator)?.label}
                      {' '}
                      <span className="font-medium">{conditionValue}</span>
                      {' '}일 때 선택 {conditionMode === 'enable' ? '가능' : '불가'}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 효과 설정 */}
          <div className="border border-[#c0c0b8] bg-[#f5f5f0] p-3">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#4d4d4d]">선택 효과</label>
              <button
                onClick={handleAddEffect}
                className="text-xs px-2 py-1 bg-[#d0d0c8] hover:bg-[#c0c0b8] text-[#4d4d4d] border border-[#b0b0a8]"
              >
                + 추가
              </button>
            </div>

            {effects.length === 0 ? (
              <p className="text-xs text-[#8b8b8b]">
                선택 시 적용될 효과가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {effects.map((effect, index) => (
                  <div key={index} className="p-2 bg-[#eaeae5] border border-[#d0d0c8]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-[#6b6b6b]">효과 {index + 1}</span>
                      <button
                        onClick={() => handleRemoveEffect(index)}
                        className="text-xs text-[#8b8b8b] hover:text-[#4d4d4d]"
                      >
                        삭제
                      </button>
                    </div>

                    {/* 효과 타입 */}
                    <select
                      value={effect.type}
                      onChange={(e) => handleUpdateEffect(index, {
                        type: e.target.value as Effect['type'],
                        target: e.target.value === 'stat' ? 'hp' : '',
                        action: e.target.value === 'item' ? 'add' : effect.action,
                        value: e.target.value === 'flag' ? true : e.target.value === 'stat' || e.target.value === 'relation' ? 10 : 1,
                      })}
                      className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1 text-[#2d2d2d] text-xs mb-2 focus:outline-none"
                    >
                      <option value="stat">스탯 변경</option>
                      <option value="flag">플래그 설정</option>
                      <option value="item">아이템 추가/제거</option>
                      <option value="relation">캐릭터 호감도</option>
                    </select>

                    {effect.type === 'stat' && (
                      <div className="grid grid-cols-3 gap-1">
                        <select
                          value={effect.target}
                          onChange={(e) => handleUpdateEffect(index, { target: e.target.value })}
                          className="bg-[#f5f5f0] border border-[#c0c0b8] px-1 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        >
                          {STAT_KEYS.map((key) => (
                            <option key={key} value={key}>
                              {STAT_META[key].label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={effect.action}
                          onChange={(e) => handleUpdateEffect(index, { action: e.target.value as Effect['action'] })}
                          className="bg-[#f5f5f0] border border-[#c0c0b8] px-1 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        >
                          {EFFECT_ACTIONS.map((action) => (
                            <option key={action.value} value={action.value}>
                              {action.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={effect.value as number}
                          onChange={(e) => handleUpdateEffect(index, { value: parseInt(e.target.value) || 0 })}
                          className="bg-[#f5f5f0] border border-[#c0c0b8] px-1 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        />
                      </div>
                    )}

                    {effect.type === 'flag' && (
                      <div className="space-y-1">
                        <AutocompleteInput
                          value={effect.target}
                          onChange={(val) => handleUpdateEffect(index, { target: val })}
                          suggestions={existingFlags}
                          placeholder="플래그 이름"
                          className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        />
                        <select
                          value={effect.value === true ? 'true' : 'false'}
                          onChange={(e) => handleUpdateEffect(index, {
                            action: 'set',
                            value: e.target.value === 'true'
                          })}
                          className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        >
                          <option value="true">활성화 (true)</option>
                          <option value="false">비활성화 (false)</option>
                        </select>
                      </div>
                    )}

                    {effect.type === 'item' && (
                      <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-1">
                          <select
                            value={effect.action}
                            onChange={(e) => handleUpdateEffect(index, { action: e.target.value as Effect['action'] })}
                            className="bg-[#f5f5f0] border border-[#c0c0b8] px-1 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                          >
                            {ITEM_ACTIONS.map((action) => (
                              <option key={action.value} value={action.value}>
                                {action.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={effect.value as number}
                            onChange={(e) => handleUpdateEffect(index, { value: parseInt(e.target.value) || 1 })}
                            placeholder="수량"
                            min={1}
                            className="bg-[#f5f5f0] border border-[#c0c0b8] px-1 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                          />
                        </div>
                        <AutocompleteInput
                          value={effect.target}
                          onChange={(val) => handleUpdateEffect(index, { target: val })}
                          suggestions={existingItems}
                          placeholder="아이템 ID (예: magic-key)"
                          className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          value={effect.itemName || ''}
                          onChange={(e) => handleUpdateEffect(index, { itemName: e.target.value })}
                          placeholder="아이템 이름 (예: 마법 열쇠)"
                          className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          value={effect.itemDescription || ''}
                          onChange={(e) => handleUpdateEffect(index, { itemDescription: e.target.value })}
                          placeholder="아이템 설명 (선택)"
                          className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        />
                      </div>
                    )}

                    {effect.type === 'relation' && (
                      <div className="space-y-1">
                        <AutocompleteInput
                          value={effect.target}
                          onChange={(val) => handleUpdateEffect(index, { target: val })}
                          suggestions={existingCharacters}
                          placeholder="캐릭터 이름 (예: 엘리스)"
                          className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-1">
                          <select
                            value={effect.action}
                            onChange={(e) => handleUpdateEffect(index, { action: e.target.value as Effect['action'] })}
                            className="bg-[#f5f5f0] border border-[#c0c0b8] px-1 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                          >
                            {EFFECT_ACTIONS.map((action) => (
                              <option key={action.value} value={action.value}>
                                {action.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={effect.value as number}
                            onChange={(e) => handleUpdateEffect(index, { value: parseInt(e.target.value) || 0 })}
                            placeholder="호감도"
                            className="bg-[#f5f5f0] border border-[#c0c0b8] px-1 py-1 text-[#2d2d2d] text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSaveEdge}
            className="w-full px-3 py-2 bg-[#3d3d3d] hover:bg-[#2d2d2d] text-[#f5f5f0] text-sm"
          >
            선택지 저장
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={() => {
              if (confirm('이 선택지를 삭제하시겠습니까?')) {
                deleteEdge(selectedEdgeId!);
              }
            }}
            className="w-full px-3 py-2 bg-[#e0e0d8] hover:bg-[#d0d0c8] text-[#6b6b6b] text-sm border border-[#c0c0b8]"
          >
            선택지 삭제
          </button>
        </div>
      </div>
    );
  }

  return null;
}
