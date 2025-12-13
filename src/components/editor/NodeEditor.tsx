'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import type { Choice, Condition, Effect, Stats } from '@/types/game';
import { STAT_META } from '@/types/game';

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
  } = useEditorStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // 씬 편집 상태
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isEnding, setIsEnding] = useState(false);

  // 선택지 편집 상태
  const [choiceText, setChoiceText] = useState('');

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
    }
  }, [selectedNode]);

  // 선택된 엣지가 변경되면 상태 업데이트
  useEffect(() => {
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
    updateNode(selectedNodeId, { title, text, isEnding });
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
              className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-3 py-2 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080] resize-none"
            />
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

          {/* 선택지 목록 */}
          <div>
            <label className="block text-sm text-[#6b6b6b] mb-2">
              연결된 선택지 ({selectedNode.data.scene.choices.length})
            </label>
            <div className="space-y-2">
              {selectedNode.data.scene.choices.map((choice, i) => (
                <div
                  key={choice.id}
                  className="p-2 bg-[#f5f5f0] text-sm text-[#4d4d4d] border border-[#c0c0b8]"
                >
                  <div>{i + 1}. {choice.text}</div>
                  {choice.condition && (
                    <div className="text-xs text-[#8b8b8b] mt-1">
                      조건: {choice.condition.target} {choice.condition.operator} {String(choice.condition.value)}
                    </div>
                  )}
                </div>
              ))}
              {selectedNode.data.scene.choices.length === 0 && (
                <p className="text-[#8b8b8b] text-xs">
                  다른 노드로 연결하면 선택지가 추가됩니다
                </p>
              )}
            </div>
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
          <div className="p-3 bg-[#f5f5f0] border border-[#c0c0b8]">
            <p className="text-sm text-[#6b6b6b]">
              <span className="text-[#8b8b8b]">출발:</span>{' '}
              {nodes.find((n) => n.id === selectedEdge.source)?.data.scene.title || selectedEdge.source}
            </p>
            <p className="text-sm text-[#6b6b6b] mt-1">
              <span className="text-[#8b8b8b]">도착:</span>{' '}
              {nodes.find((n) => n.id === selectedEdge.target)?.data.scene.title || selectedEdge.target}
            </p>
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
                    <input
                      type="text"
                      value={conditionFlagName}
                      onChange={(e) => setConditionFlagName(e.target.value)}
                      placeholder="예: gotSword, metKing"
                      className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                    />
                    <p className="text-xs text-[#8b8b8b] mt-1">
                      이 플래그가 true일 때만 선택 가능
                    </p>
                  </div>
                ) : conditionType === 'item' ? (
                  /* 아이템 소지 조건 */
                  <div>
                    <label className="block text-xs text-[#8b8b8b] mb-1">아이템 ID</label>
                    <input
                      type="text"
                      value={conditionItemId}
                      onChange={(e) => setConditionItemId(e.target.value)}
                      placeholder="예: rusty-key, magic-potion"
                      className="w-full bg-[#f5f5f0] border border-[#c0c0b8] px-2 py-1.5 text-[#2d2d2d] text-sm focus:outline-none focus:border-[#808080]"
                    />
                    <p className="text-xs text-[#8b8b8b] mt-1">
                      이 아이템을 소지할 때만 선택 가능
                    </p>
                  </div>
                ) : (
                  /* 캐릭터 호감도 조건 */
                  <>
                    <div>
                      <label className="block text-xs text-[#8b8b8b] mb-1">캐릭터 이름</label>
                      <input
                        type="text"
                        value={conditionCharacter}
                        onChange={(e) => setConditionCharacter(e.target.value)}
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
                        <input
                          type="text"
                          value={effect.target}
                          onChange={(e) => handleUpdateEffect(index, { target: e.target.value })}
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
                        <input
                          type="text"
                          value={effect.target}
                          onChange={(e) => handleUpdateEffect(index, { target: e.target.value })}
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
                        <input
                          type="text"
                          value={effect.target}
                          onChange={(e) => handleUpdateEffect(index, { target: e.target.value })}
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
