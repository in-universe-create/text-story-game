import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { Story, Scene, Choice, Stats, Item, Effect, DEFAULT_STATS } from '@/types/game';

export interface SceneNodeData extends Record<string, unknown> {
  scene: Scene;
  isStart?: boolean;
}

export interface ChoiceEdgeData extends Record<string, unknown> {
  choice?: Choice;
}

interface EditorStore {
  // React Flow 상태
  nodes: Node<SceneNodeData>[];
  edges: Edge<ChoiceEdgeData>[];

  // 스토리 메타데이터
  storyId: string;
  storyTitle: string;
  storyDescription: string;
  initialStats: Stats;
  initialItems: Item[];
  startSceneId: string;

  // 선택된 노드/엣지
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // 액션
  setNodes: (nodes: Node<SceneNodeData>[]) => void;
  setEdges: (edges: Edge<ChoiceEdgeData>[]) => void;
  addNode: (scene: Scene, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, scene: Partial<Scene>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (sourceId: string, targetId: string, choice: Choice) => void;
  updateEdge: (edgeId: string, choice: Partial<Choice>) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;
  setStartScene: (sceneId: string) => void;
  updateStoryMeta: (meta: Partial<{ title: string; description: string; initialStats: Stats; initialItems: Item[] }>) => void;

  // 스토리 내보내기/가져오기
  exportStory: () => Story;
  importStory: (story: Story) => void;
  resetEditor: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const DEFAULT_INITIAL_STATS: Stats = {
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

export const useEditorStore = create<EditorStore>((set, get) => ({
  nodes: [],
  edges: [],
  storyId: generateId(),
  storyTitle: '새 스토리',
  storyDescription: '스토리 설명을 입력하세요',
  initialStats: { ...DEFAULT_INITIAL_STATS },
  initialItems: [],
  startSceneId: '',
  selectedNodeId: null,
  selectedEdgeId: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (scene, position) => {
    const newNode: Node<SceneNodeData> = {
      id: scene.id,
      type: 'sceneNode',
      position,
      data: { scene, isStart: get().nodes.length === 0 },
    };

    set((state) => {
      const newNodes = [...state.nodes, newNode];
      // 첫 번째 노드면 시작 씬으로 설정
      if (newNodes.length === 1) {
        return { nodes: newNodes, startSceneId: scene.id };
      }
      return { nodes: newNodes };
    });
  },

  updateNode: (nodeId, sceneUpdate) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                scene: { ...node.data.scene, ...sceneUpdate },
              },
            }
          : node
      ),
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      startSceneId: state.startSceneId === nodeId ? '' : state.startSceneId,
    }));
  },

  addEdge: (sourceId, targetId, choice) => {
    const edgeId = `edge-${generateId()}`;
    const newEdge: Edge<ChoiceEdgeData> = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: 'choiceEdge',
      data: { choice },
    };

    // 소스 노드의 choices에도 추가
    set((state) => ({
      edges: [...state.edges, newEdge],
      nodes: state.nodes.map((node) =>
        node.id === sourceId
          ? {
              ...node,
              data: {
                ...node.data,
                scene: {
                  ...node.data.scene,
                  choices: [...node.data.scene.choices, choice],
                },
              },
            }
          : node
      ),
    }));
  },

  updateEdge: (edgeId, choiceUpdate) => {
    const state = get();
    const edge = state.edges.find((e) => e.id === edgeId);
    if (!edge || !edge.data?.choice) return;

    const existingChoice = edge.data.choice;
    const updatedChoice: Choice = {
      id: choiceUpdate.id ?? existingChoice.id,
      text: choiceUpdate.text ?? existingChoice.text,
      targetSceneId: choiceUpdate.targetSceneId ?? existingChoice.targetSceneId,
      condition: choiceUpdate.condition ?? existingChoice.condition,
      effects: choiceUpdate.effects ?? existingChoice.effects,
    };

    set({
      edges: state.edges.map((e) =>
        e.id === edgeId
          ? { ...e, data: { choice: updatedChoice } }
          : e
      ),
      nodes: state.nodes.map((node) =>
        node.id === edge.source
          ? {
              ...node,
              data: {
                ...node.data,
                scene: {
                  ...node.data.scene,
                  choices: node.data.scene.choices.map((c) =>
                    c.id === existingChoice.id ? updatedChoice : c
                  ),
                },
              },
            }
          : node
      ),
    });
  },

  deleteEdge: (edgeId) => {
    set((state) => {
      const edge = state.edges.find((e) => e.id === edgeId);
      if (!edge) return state;

      return {
        edges: state.edges.filter((e) => e.id !== edgeId),
        nodes: state.nodes.map((node) =>
          node.id === edge.source
            ? {
                ...node,
                data: {
                  ...node.data,
                  scene: {
                    ...node.data.scene,
                    choices: node.data.scene.choices.filter(
                      (c) => c.id !== edge.data?.choice?.id
                    ),
                  },
                },
              }
            : node
        ),
        selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
      };
    });
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: null }),
  setSelectedEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNodeId: null }),

  setStartScene: (sceneId) => {
    set((state) => ({
      startSceneId: sceneId,
      nodes: state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isStart: node.id === sceneId,
        },
      })),
    }));
  },

  updateStoryMeta: (meta) => {
    set((state) => ({
      storyTitle: meta.title ?? state.storyTitle,
      storyDescription: meta.description ?? state.storyDescription,
      initialStats: meta.initialStats ?? state.initialStats,
      initialItems: meta.initialItems ?? state.initialItems,
    }));
  },

  exportStory: () => {
    const state = get();
    const scenes: Scene[] = state.nodes.map((node) => node.data.scene);

    return {
      id: state.storyId,
      title: state.storyTitle,
      description: state.storyDescription,
      startSceneId: state.startSceneId,
      scenes,
      initialStats: state.initialStats,
      initialItems: state.initialItems,
    };
  },

  importStory: (story) => {
    const nodes: Node<SceneNodeData>[] = story.scenes.map((scene, index) => ({
      id: scene.id,
      type: 'sceneNode',
      position: { x: (index % 4) * 300, y: Math.floor(index / 4) * 200 },
      data: { scene, isStart: scene.id === story.startSceneId },
    }));

    const edges: Edge<ChoiceEdgeData>[] = [];
    story.scenes.forEach((scene) => {
      scene.choices.forEach((choice) => {
        edges.push({
          id: `edge-${choice.id}`,
          source: scene.id,
          target: choice.targetSceneId,
          type: 'choiceEdge',
          data: { choice },
        });
      });
    });

    set({
      storyId: story.id,
      storyTitle: story.title,
      storyDescription: story.description,
      startSceneId: story.startSceneId,
      initialStats: story.initialStats,
      initialItems: story.initialItems,
      nodes,
      edges,
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  },

  resetEditor: () => {
    set({
      nodes: [],
      edges: [],
      storyId: generateId(),
      storyTitle: '새 스토리',
      storyDescription: '스토리 설명을 입력하세요',
      initialStats: { ...DEFAULT_INITIAL_STATS },
      initialItems: [],
      startSceneId: '',
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  },
}));
