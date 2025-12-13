'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useEditorStore, type SceneNodeData } from '@/stores/editorStore';
import SceneNode from '@/components/editor/SceneNode';
import ChoiceEdge from '@/components/editor/ChoiceEdge';
import NodeEditor from '@/components/editor/NodeEditor';
import Toolbar from '@/components/editor/Toolbar';
import type { Scene, Choice } from '@/types/game';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes = {
  sceneNode: SceneNode,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes = {
  choiceEdge: ChoiceEdge,
} as const;

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default function EditorPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    addNode,
    addEdge: addStoreEdge,
    setSelectedNode,
    setSelectedEdge,
    deleteNode,
    deleteEdge,
  } = useEditorStore();

  // React Flow 상태와 스토어 연동
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // 스토어 변경 시 로컬 상태 업데이트
  const syncWithStore = useCallback(() => {
    setNodes(useEditorStore.getState().nodes);
    setEdges(useEditorStore.getState().edges);
  }, [setNodes, setEdges]);

  // 노드 변경 핸들러
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      // 위치 변경은 스토어에 저장
      const positionChanges = changes.filter(
        (c) => c.type === 'position' && c.position
      );
      if (positionChanges.length > 0) {
        setStoreNodes(useEditorStore.getState().nodes.map((node) => {
          const change = positionChanges.find((c) => 'id' in c && c.id === node.id);
          if (change && 'position' in change && change.position) {
            return { ...node, position: change.position };
          }
          return node;
        }));
      }
    },
    [onNodesChange, setStoreNodes]
  );

  // 연결 핸들러
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const choiceId = generateId();
      const choice: Choice = {
        id: choiceId,
        text: '새 선택지',
        targetSceneId: connection.target,
      };

      addStoreEdge(connection.source, connection.target, choice);
      syncWithStore();
    },
    [addStoreEdge, syncWithStore]
  );

  // 더블클릭으로 새 씬 추가
  const onDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 50,
      };

      const newScene: Scene = {
        id: generateId(),
        title: '새 씬',
        text: '내용을 입력하세요...',
        choices: [],
      };

      addNode(newScene, position);
      syncWithStore();
    },
    [addNode, syncWithStore]
  );

  // 노드 선택
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  // 엣지 선택
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
    },
    [setSelectedEdge]
  );

  // 빈 공간 클릭
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  // 키보드 이벤트 (삭제)
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const { selectedNodeId, selectedEdgeId } = useEditorStore.getState();
        if (selectedNodeId) {
          if (confirm('이 씬을 삭제하시겠습니까?')) {
            deleteNode(selectedNodeId);
            syncWithStore();
          }
        } else if (selectedEdgeId) {
          if (confirm('이 선택지를 삭제하시겠습니까?')) {
            deleteEdge(selectedEdgeId);
            syncWithStore();
          }
        }
      }
    },
    [deleteNode, deleteEdge, syncWithStore]
  );

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />

      <div className="flex-1 flex">
        {/* 에디터 영역 */}
        <div
          ref={reactFlowWrapper}
          className="flex-1"
          onKeyDown={onKeyDown}
          tabIndex={0}
        >
          <ReactFlow
            nodes={storeNodes}
            edges={storeEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onDoubleClick={onDoubleClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            className="bg-[#eaeae5]"
          >
            <Background color="#c0c0b8" gap={20} />
            <Controls className="!bg-[#f5f5f0] !border-[#c0c0b8]" />
            <MiniMap
              nodeColor={(node) => {
                const data = node.data as SceneNodeData | undefined;
                if (data?.isStart) return '#4d4d4d';
                if (data?.scene?.isEnding) return '#8b8b8b';
                return '#a0a0a0';
              }}
              className="!bg-[#f5f5f0] !border-[#c0c0b8]"
            />
          </ReactFlow>
        </div>

        {/* 속성 편집 패널 */}
        <NodeEditor />
      </div>

      {/* 하단 힌트 */}
      <div className="h-8 bg-[#eaeae5] border-t border-[#c0c0b8] flex items-center px-4 text-xs text-[#6b6b6b]">
        <span>더블클릭: 새 씬 추가</span>
        <span className="mx-3">|</span>
        <span>노드 연결: 하단 핸들 드래그</span>
        <span className="mx-3">|</span>
        <span>Delete: 선택 항목 삭제</span>
      </div>
    </div>
  );
}
