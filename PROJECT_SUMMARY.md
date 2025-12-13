여# 텍스트 선택 기반 스토리 게임 프로젝트

## 프로젝트 개요

**목표**: 텍스트 선택 기반 인터랙티브 스토리 웹 게임 + 비주얼 스토리 에디터 개발

**개발 기간**: 2024년 12월 13일

**프로젝트 위치**: `/Users/mumyeong/IT.STUDY/something/story-game`

---

## 요구사항 정의

### 사용자 요청
1. 텍스트 선택 기반 스토리형 웹/앱 게임
2. 플랫폼: **웹 (React/Next.js)**
3. 기능 수준: **고급** (스탯/인벤토리 시스템 포함)
4. 콘텐츠 관리: **비주얼 에디터** (GUI로 스토리 플로우 편집)
5. 스탯 시스템: **RPG + 심리/사회 혼합**

### 확정된 스탯 구성
| 카테고리 | 스탯 | 설명 |
|---------|------|------|
| RPG | HP | 체력 |
| RPG | 힘 (Strength) | 물리적 능력 |
| RPG | 지능 (Intelligence) | 지적 능력 |
| RPG | 민첩 (Agility) | 빠르기/반응속도 |
| 심리/사회 | 스트레스 (Stress) | 정신적 부담 (높을수록 나쁨) |
| 심리/사회 | 평판 (Reputation) | 사회적 인식 |
| 심리/사회 | 관계 (Relationship) | 타인과의 관계도 |
| 심리/사회 | 골드 (Gold) | 재화 |

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.0.10 |
| 언어 | TypeScript | - |
| 스타일링 | Tailwind CSS | - |
| 상태관리 | Zustand | - |
| 비주얼 에디터 | @xyflow/react (React Flow) | - |
| 데이터 저장 | localStorage | - |

---

## 프로젝트 구조

```
story-game/
├── src/
│   ├── app/                          # Next.js App Router 페이지
│   │   ├── page.tsx                  # 메인 메뉴
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── globals.css               # 전역 스타일
│   │   ├── play/
│   │   │   └── page.tsx              # 게임 플레이 화면
│   │   └── editor/
│   │       └── page.tsx              # 비주얼 스토리 에디터
│   │
│   ├── components/                   # UI 컴포넌트
│   │   ├── game/                     # 게임 플레이 관련
│   │   │   ├── StoryDisplay.tsx      # 스토리 텍스트 표시 (타이핑 효과)
│   │   │   ├── ChoicePanel.tsx       # 선택지 버튼
│   │   │   ├── StatsPanel.tsx        # 캐릭터 스탯 UI
│   │   │   ├── InventoryPanel.tsx    # 인벤토리 UI
│   │   │   └── SaveLoadMenu.tsx      # 저장/불러오기 모달
│   │   └── editor/                   # 에디터 관련
│   │       ├── SceneNode.tsx         # 씬 노드 컴포넌트
│   │       ├── ChoiceEdge.tsx        # 선택지 연결선
│   │       ├── NodeEditor.tsx        # 노드 속성 편집 패널
│   │       └── Toolbar.tsx           # 에디터 상단 도구모음
│   │
│   ├── stores/                       # Zustand 상태 관리
│   │   ├── gameStore.ts              # 게임 상태 (씬, 스탯, 인벤토리)
│   │   └── editorStore.ts            # 에디터 상태 (노드, 엣지)
│   │
│   ├── types/
│   │   └── game.ts                   # TypeScript 타입 정의
│   │
│   ├── data/
│   │   └── sampleStory.ts            # 샘플 스토리 데이터
│   │
│   └── lib/
│       └── saveManager.ts            # 세이브/로드 유틸리티
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 핵심 데이터 모델

### Scene (씬)
```typescript
interface Scene {
  id: string;
  title: string;           // 씬 제목
  text: string;            // 스토리 텍스트
  image?: string;          // 배경 이미지 (선택)
  choices: Choice[];       // 선택지 목록
  effects?: Effect[];      // 씬 진입 시 효과
  isEnding?: boolean;      // 엔딩 씬 여부
}
```

### Choice (선택지)
```typescript
interface Choice {
  id: string;
  text: string;            // 선택지 텍스트
  targetSceneId: string;   // 이동할 씬 ID
  condition?: Condition;   // 표시 조건 (스탯/아이템 체크)
  effects?: Effect[];      // 선택 시 효과
}
```

### Effect (효과)
```typescript
interface Effect {
  type: 'stat' | 'item' | 'flag';
  target: string;          // 스탯명 또는 아이템ID
  action: 'add' | 'remove' | 'set';
  value: number | string | boolean;
}
```

### Condition (조건)
```typescript
interface Condition {
  type: 'stat' | 'item' | 'flag';
  target: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'has';
  value: number | string | boolean;
}
```

### GameState (게임 상태)
```typescript
interface GameState {
  currentSceneId: string;
  stats: Stats;
  inventory: Item[];
  flags: Record<string, boolean>;
  history: string[];       // 방문한 씬 기록
  playTime: number;
}
```

---

## 주요 기능 구현

### 1. 게임 플레이어 (`/play`)

#### 스토리 표시
- 타이핑 애니메이션 효과로 텍스트 출력
- 클릭 시 애니메이션 스킵
- 엔딩 씬 특별 표시

#### 선택지 시스템
- 조건에 따른 선택지 필터링
- 선택 시 효과(스탯/아이템 변경) 적용
- 효과 미리보기 표시

#### 스탯 패널
- HP/스트레스는 바 형태로 표시
- 색상으로 상태 표시 (위험: 빨강, 주의: 노랑, 양호: 초록)

#### 인벤토리
- 아이템 목록 표시
- 클릭 시 설명 펼치기
- 수량 표시

#### 세이브/로드
- localStorage 기반 저장
- 최대 10개 슬롯
- 자동 저장 (씬 변경 시)
- 저장 시간, 스탯 미리보기

### 2. 비주얼 에디터 (`/editor`)

#### 노드 에디터
- React Flow 기반 드래그&드롭 인터페이스
- 더블클릭으로 새 씬 추가
- 노드 하단 핸들 드래그로 연결

#### 씬 편집
- 제목, 스토리 텍스트 편집
- 엔딩 씬 설정
- 시작 씬 지정

#### 선택지 편집
- 연결선 클릭으로 선택지 텍스트 편집
- Delete 키로 삭제

#### 내보내기/가져오기
- JSON 형식으로 스토리 저장
- 파일에서 스토리 불러오기
- 샘플 스토리 로드

---

## 샘플 스토리: "잊혀진 마을의 비밀"

### 개요
폐허가 된 마을에서 벌어지는 미스터리 어드벤처. 플레이어의 선택이 운명을 결정합니다.

### 씬 구성
- **intro**: 마을 입구 (시작)
- **investigate-sign**: 팻말 조사
- **village-entrance**: 마을 중앙
- **the-well**: 우물 (진실 발견)
- **mansion**: 저택 탐험
- **mansion-upstairs**: 2층 서재
- **mansion-basement**: 지하실
- **mysterious-light**: 생존자 오두막
- **curse-story**: 저주의 진실
- **escape-route**: 탈출 경로
- **ghost-story**: 촌장의 참회

### 엔딩 (5개)
1. **겁쟁이의 선택**: 마을에 들어가지 않음
2. **저주받은 부자**: 금을 가져가고 저주받음
3. **진정한 영웅**: 촌장을 용서하고 저주를 풂
4. **씁쓸한 결말**: 용서를 거부
5. **현명한 후퇴**: 안전하게 탈출

### 특징
- 스탯에 따른 선택지 분기 (힘, 민첩 체크)
- 아이템 획득 (낡은 열쇠, 부적)
- 플래그 시스템 (단서 발견 여부)

---

## 실행 방법

### 개발 서버 실행
```bash
cd story-game
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드
```bash
npm run build
npm start
```

---

## 구현 과정

### 1단계: 프로젝트 설정
- Next.js 14 프로젝트 생성 (TypeScript, Tailwind, App Router)
- Zustand, @xyflow/react 패키지 설치

### 2단계: 타입 정의
- 게임 데이터 모델 정의 (Scene, Choice, Effect, Stats 등)
- 세이브 슬롯 타입 정의

### 3단계: 상태 관리
- gameStore: 게임 플레이 상태 (현재 씬, 스탯, 인벤토리)
- editorStore: 에디터 상태 (노드, 엣지, 메타데이터)

### 4단계: 게임 엔진
- 씬 전환 로직
- 효과 적용 시스템
- 조건 체크 시스템
- 세이브/로드 유틸리티

### 5단계: UI 컴포넌트
- 스토리 표시 (타이핑 애니메이션)
- 선택지 패널
- 스탯/인벤토리 패널
- 세이브/로드 모달

### 6단계: 비주얼 에디터
- React Flow 기반 노드 에디터
- 커스텀 노드/엣지 컴포넌트
- 속성 편집 패널

### 7단계: 샘플 스토리
- 테스트용 스토리 데이터 작성
- 다양한 분기와 엔딩 구현

### 8단계: 빌드 및 테스트
- TypeScript 타입 오류 수정
- 빌드 검증

---

## 향후 확장 가능성

1. **다국어 지원**: i18n 적용
2. **사운드 효과**: BGM, 효과음 추가
3. **이미지 지원**: 씬별 배경 이미지
4. **클라우드 저장**: 서버 기반 세이브
5. **스토리 공유**: 커뮤니티 스토리 업로드/다운로드
6. **모바일 앱**: React Native 또는 PWA
7. **AI 스토리 생성**: LLM 기반 동적 스토리 생성

---

  ## 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Zustand 문서](https://docs.pmnd.rs/zustand)
- [React Flow 문서](https://reactflow.dev/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
