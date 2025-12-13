import type { Story } from '@/types/game';
import { DEFAULT_STATS } from '@/types/game';

export const sampleStory: Story = {
  id: 'the-forgotten-village',
  title: '잊혀진 마을의 비밀',
  description: '폐허가 된 마을에서 벌어지는 미스터리 어드벤처. 당신의 선택이 운명을 바꿉니다.',
  startSceneId: 'intro',
  initialStats: { ...DEFAULT_STATS },
  initialItems: [
    {
      id: 'old-map',
      name: '낡은 지도',
      description: '마을로 가는 길이 표시된 오래된 지도',
      quantity: 1,
    },
  ],
  scenes: [
    {
      id: 'intro',
      title: '여정의 시작',
      text: `안개가 자욱한 새벽, 당신은 오래된 지도를 손에 쥐고 있다.

지도에는 '잊혀진 마을'이라 적힌 곳이 표시되어 있다. 소문에 의하면 그곳에 엄청난 보물이 숨겨져 있다고 한다.

하지만 동시에, 그곳을 다녀온 사람은 아무도 없다는 이야기도 들린다.

마을 입구에 도착했다. 낡은 팻말에는 희미하게 글씨가 남아있다.

"돌아가라... 여긴 죽음의 땅이다."

어떻게 하겠는가?`,
      choices: [
        {
          id: 'enter-village',
          text: '경고를 무시하고 마을로 들어간다',
          targetSceneId: 'village-entrance',
          effects: [
            { type: 'stat', target: 'stress', action: 'add', value: 10 },
          ],
        },
        {
          id: 'investigate-sign',
          text: '팻말을 자세히 조사한다',
          targetSceneId: 'investigate-sign',
          effects: [
            { type: 'stat', target: 'intelligence', action: 'add', value: 1 },
          ],
        },
        {
          id: 'turn-back',
          text: '위험을 감수할 필요 없다. 돌아간다',
          targetSceneId: 'ending-coward',
        },
      ],
    },
    {
      id: 'investigate-sign',
      title: '숨겨진 메시지',
      text: `팻말을 자세히 살펴보니, 뒷면에 작은 글씨가 새겨져 있다.

"진실을 원한다면, 우물을 찾아라. 하지만 조심해라, 그림자가 지켜보고 있다."

팻말 아래에서 녹슨 열쇠 하나를 발견했다.

이제 어떻게 하겠는가?`,
      effects: [
        { type: 'item', target: 'rusty-key', action: 'add', value: 1 },
        { type: 'flag', target: 'found-clue', action: 'set', value: true },
      ],
      choices: [
        {
          id: 'enter-with-key',
          text: '열쇠를 챙기고 마을로 들어간다',
          targetSceneId: 'village-entrance',
        },
        {
          id: 'still-turn-back',
          text: '뭔가 이상하다... 돌아가자',
          targetSceneId: 'ending-coward',
        },
      ],
    },
    {
      id: 'village-entrance',
      title: '폐허의 마을',
      text: `마을에 들어서자 섬뜩한 정적이 감싼다.

버려진 집들이 줄지어 서 있고, 바람에 삐걱거리는 문 소리만이 들린다.

마을 중앙에는 오래된 우물이 있고, 왼쪽으로는 큰 저택이 보인다.
오른쪽 골목에서는 희미한 불빛이 새어나오고 있다.

어디로 가겠는가?`,
      choices: [
        {
          id: 'go-well',
          text: '우물로 간다',
          targetSceneId: 'the-well',
          condition: { type: 'flag', target: 'found-clue', operator: 'eq', value: true },
        },
        {
          id: 'go-mansion',
          text: '저택을 조사한다',
          targetSceneId: 'mansion',
          effects: [
            { type: 'stat', target: 'stress', action: 'add', value: 5 },
          ],
        },
        {
          id: 'follow-light',
          text: '불빛을 따라간다',
          targetSceneId: 'mysterious-light',
        },
      ],
    },
    {
      id: 'the-well',
      title: '진실의 우물',
      text: `우물가에 도착했다. 녹슨 열쇠가 우물 옆 자물쇠와 딱 맞는다.

자물쇠를 열자, 우물 안에서 비밀 통로가 나타났다!

사다리를 타고 내려가니 지하 공간이 펼쳐진다.
그곳에는 황금으로 가득 찬 상자들과... 해골들이 놓여있다.

"드디어 왔군..."

뒤에서 목소리가 들린다. 돌아보니 반투명한 노인의 형체가 서 있다.

"나는 이 마을의 마지막 촌장이다. 이 보물은... 저주받은 것이야."`,
      effects: [
        { type: 'stat', target: 'gold', action: 'add', value: 500 },
        { type: 'flag', target: 'met-ghost', action: 'set', value: true },
      ],
      choices: [
        {
          id: 'take-treasure',
          text: '보물을 가져간다',
          targetSceneId: 'ending-cursed',
          effects: [
            { type: 'stat', target: 'gold', action: 'add', value: 1000 },
          ],
        },
        {
          id: 'listen-ghost',
          text: '유령의 이야기를 듣는다',
          targetSceneId: 'ghost-story',
          effects: [
            { type: 'stat', target: 'reputation', action: 'add', value: 20 },
          ],
        },
      ],
    },
    {
      id: 'mansion',
      title: '버려진 저택',
      text: `저택 문을 열자 먼지가 휘날린다.

한때 화려했을 홀에는 초상화들이 걸려있다.
마지막 초상화의 인물이 당신을 빤히 쳐다보는 것 같다.

2층으로 올라가는 계단이 있고, 지하실로 내려가는 문도 보인다.

갑자기 등 뒤에서 차가운 기운이 느껴진다...`,
      effects: [
        { type: 'stat', target: 'stress', action: 'add', value: 15 },
      ],
      choices: [
        {
          id: 'go-upstairs',
          text: '2층으로 올라간다',
          targetSceneId: 'mansion-upstairs',
          condition: { type: 'stat', target: 'agility', operator: 'gte', value: 8 },
        },
        {
          id: 'go-basement',
          text: '지하실로 내려간다',
          targetSceneId: 'mansion-basement',
          condition: { type: 'stat', target: 'strength', operator: 'gte', value: 8 },
        },
        {
          id: 'run-away',
          text: '뭔가 이상하다, 빨리 나간다',
          targetSceneId: 'village-entrance',
          effects: [
            { type: 'stat', target: 'stress', action: 'remove', value: 10 },
          ],
        },
      ],
    },
    {
      id: 'mansion-upstairs',
      title: '비밀의 서재',
      text: `재빠르게 삐걱거리는 계단을 올라 2층에 도착했다.

서재에서 오래된 일기장을 발견했다.

"1892년 3월 15일 - 우물 아래에서 금을 발견했다. 하지만 이상한 일이 일어나기 시작했다. 마을 사람들이 하나둘 사라지고 있다..."

일기장 사이에서 오래된 부적이 떨어졌다.`,
      effects: [
        { type: 'item', target: 'ancient-amulet', action: 'add', value: 1 },
        { type: 'flag', target: 'read-diary', action: 'set', value: true },
      ],
      choices: [
        {
          id: 'return-to-village',
          text: '마을 중앙으로 돌아간다',
          targetSceneId: 'village-entrance',
        },
      ],
    },
    {
      id: 'mansion-basement',
      title: '어둠의 지하실',
      text: `힘을 써서 무거운 문을 열고 지하실로 내려갔다.

지하실은 캄캄했지만, 구석에서 희미한 빛이 반짝인다.

다가가 보니 작은 보석함이 있다. 하지만 그 옆에는
무언가에 의해 찢겨진 듯한 옷 조각들이 널려있다.

보석함을 열겠는가?`,
      effects: [
        { type: 'stat', target: 'hp', action: 'remove', value: 10 },
      ],
      choices: [
        {
          id: 'open-box',
          text: '보석함을 연다',
          targetSceneId: 'found-treasure-basement',
          effects: [
            { type: 'stat', target: 'gold', action: 'add', value: 200 },
            { type: 'stat', target: 'stress', action: 'add', value: 20 },
          ],
        },
        {
          id: 'leave-box',
          text: '손대지 않고 나간다',
          targetSceneId: 'village-entrance',
        },
      ],
    },
    {
      id: 'found-treasure-basement',
      title: '저주받은 보석',
      text: `보석함을 열자 아름다운 루비 목걸이가 있다.

하지만 목걸이를 집는 순간, 손에서 피가 흐르기 시작한다.
목걸이에 박힌 보석이 마치 살아있는 것처럼 당신의 피를 빨아들인다!

서둘러 목걸이를 떨어뜨리고 지하실을 빠져나왔다.

손에는 작은 상처가 남았지만, 금화 몇 개는 챙길 수 있었다.`,
      effects: [
        { type: 'stat', target: 'hp', action: 'remove', value: 15 },
        { type: 'flag', target: 'cursed-wound', action: 'set', value: true },
      ],
      choices: [
        {
          id: 'back-to-village',
          text: '마을 중앙으로 돌아간다',
          targetSceneId: 'village-entrance',
        },
      ],
    },
    {
      id: 'mysterious-light',
      title: '생존자?',
      text: `불빛을 따라가니 작은 오두막이 있다.

문을 두드리자, 놀랍게도 한 노인이 문을 열었다!

"여행자인가? 어서 들어오게, 여기 오래 있으면 위험해."

노인은 따뜻한 스프를 건네며 말했다.

"이 마을은 100년 전에 저주받았네. 욕심에 눈이 먼 촌장이
우물 아래 금을 발견했고, 그것이 모든 것의 시작이었지."`,
      effects: [
        { type: 'stat', target: 'hp', action: 'add', value: 20 },
        { type: 'stat', target: 'stress', action: 'remove', value: 15 },
        { type: 'stat', target: 'relationship', action: 'add', value: 15 },
        { type: 'flag', target: 'met-survivor', action: 'set', value: true },
      ],
      choices: [
        {
          id: 'ask-more',
          text: '저주에 대해 더 물어본다',
          targetSceneId: 'curse-story',
        },
        {
          id: 'ask-escape',
          text: '여기서 나가는 방법을 묻는다',
          targetSceneId: 'escape-route',
        },
      ],
    },
    {
      id: 'curse-story',
      title: '저주의 진실',
      text: `노인이 깊은 한숨을 쉬며 말했다.

"금 속에 악령이 봉인되어 있었네. 촌장이 그것을 풀어버린 거야.
마을 사람들은 하나둘 괴물로 변해갔고, 결국 서로를 죽이게 됐지."

"저주를 풀 방법이 있긴 해. 촌장의 영혼이 우물 아래에 갇혀있는데,
그에게 용서를 구하면 저주가 풀린다더군."

노인이 손에 작은 부적을 쥐여주었다.

"이걸 가져가게. 악령으로부터 자네를 지켜줄 거야."`,
      effects: [
        { type: 'item', target: 'protection-charm', action: 'add', value: 1 },
        { type: 'flag', target: 'knows-curse', action: 'set', value: true },
      ],
      choices: [
        {
          id: 'go-break-curse',
          text: '저주를 풀러 우물로 간다',
          targetSceneId: 'the-well',
        },
        {
          id: 'leave-village-now',
          text: '이 마을을 떠난다',
          targetSceneId: 'escape-route',
        },
      ],
    },
    {
      id: 'escape-route',
      title: '탈출',
      text: `노인이 뒷문을 열며 말했다.

"이 길을 따라가면 마을 밖으로 나갈 수 있네.
하지만 해가 지면 그림자들이 깨어나니, 서둘러야 해."

당신은 결정을 내려야 한다.

보물 없이 떠날 것인가, 아니면 위험을 감수하고 더 탐험할 것인가?`,
      choices: [
        {
          id: 'escape-now',
          text: '지금 당장 마을을 떠난다',
          targetSceneId: 'ending-escape',
        },
        {
          id: 'stay-explore',
          text: '아직 해가 남았다, 더 탐험한다',
          targetSceneId: 'village-entrance',
        },
      ],
    },
    {
      id: 'ghost-story',
      title: '촌장의 참회',
      text: `유령이 천천히 말을 이어갔다.

"100년 전, 나는 이 금을 발견하고 기뻐했지. 하지만 금에는
악령이 봉인되어 있었어. 내 욕심이 마을 전체를 파멸시켰다."

"제발... 이 저주를 풀어주게. 금을 가져가지 말고,
대신 내 죄를 용서해주게. 그러면 악령은 다시 봉인될 거야."

유령의 눈에서 형체 없는 눈물이 흘러내렸다.`,
      choices: [
        {
          id: 'forgive-ghost',
          text: '"당신을 용서합니다"',
          targetSceneId: 'ending-hero',
          condition: { type: 'stat', target: 'reputation', operator: 'gte', value: 50 },
        },
        {
          id: 'refuse-forgive',
          text: '"당신 죄는 용서받을 수 없어"',
          targetSceneId: 'ending-bitter',
        },
        {
          id: 'take-gold-anyway',
          text: '금을 가져가고 떠난다',
          targetSceneId: 'ending-cursed',
        },
      ],
    },
    // 엔딩들
    {
      id: 'ending-coward',
      title: '엔딩: 겁쟁이의 선택',
      text: `당신은 결국 마을에 들어가지 않기로 했다.

안전한 선택이었지만, 평생 "그때 갔으면 어땠을까?"라는
생각이 머릿속을 떠나지 않았다.

보물은 여전히 그곳에 잠들어 있고,
진실은 영원히 묻혀버렸다.

[게임 종료 - 겁쟁이의 선택]`,
      isEnding: true,
      choices: [],
    },
    {
      id: 'ending-cursed',
      title: '엔딩: 저주받은 부자',
      text: `금을 가득 챙긴 당신은 마을을 빠져나왔다.

하지만 그날 밤부터 악몽이 시작됐다.
잠들 때마다 해골들이 당신을 쫓아오고,
귓가에는 원한에 찬 속삭임이 끊이지 않았다.

부자가 됐지만, 다시는 편히 잠들 수 없게 됐다.
금은 있지만 행복은 사라진 삶...

[게임 종료 - 저주받은 부자]

획득한 골드: +1500`,
      isEnding: true,
      choices: [],
      effects: [
        { type: 'stat', target: 'stress', action: 'set', value: 100 },
      ],
    },
    {
      id: 'ending-hero',
      title: '엔딩: 진정한 영웅',
      text: `"당신을 용서합니다."

그 말이 떨어지자마자, 우물 전체가 밝은 빛으로 가득 찼다.
촌장의 영혼은 미소를 지으며 서서히 사라졌고,
금 속에 봉인되어 있던 악령도 함께 소멸했다.

당신은 보물 없이 마을을 떠났지만,
가슴 속에는 진정한 보물이 채워졌다.

그 후로 잊혀진 마을의 이야기는 전설이 되었고,
당신은 저주를 풀어준 영웅으로 기억되었다.

[게임 종료 - 진정한 영웅]

평판 +50, 관계 +30`,
      isEnding: true,
      choices: [],
      effects: [
        { type: 'stat', target: 'reputation', action: 'add', value: 50 },
        { type: 'stat', target: 'relationship', action: 'add', value: 30 },
        { type: 'stat', target: 'stress', action: 'set', value: 0 },
      ],
    },
    {
      id: 'ending-bitter',
      title: '엔딩: 씁쓸한 결말',
      text: `"당신 죄는 용서받을 수 없어."

촌장의 영혼이 비통하게 울부짖었다.
악령의 힘이 더욱 강해지며 당신을 위협했고,
겨우 목숨만 건져 마을을 탈출했다.

보물도, 진실도 얻지 못한 채
빈손으로 돌아온 당신.

하지만 살아있다는 것만으로도 다행이라 생각해야 할 것이다.

[게임 종료 - 씁쓸한 결말]`,
      isEnding: true,
      choices: [],
      effects: [
        { type: 'stat', target: 'hp', action: 'remove', value: 30 },
      ],
    },
    {
      id: 'ending-escape',
      title: '엔딩: 현명한 후퇴',
      text: `당신은 노인의 조언을 따라 마을을 빠져나왔다.

엄청난 보물을 놓쳤지만, 목숨과 정신건강은 지켰다.

마을을 벗어나며 뒤를 돌아보니,
안개 속으로 사라지는 마을이 마치 처음부터
존재하지 않았던 것처럼 느껴졌다.

때로는 물러나는 것도 용기다.

[게임 종료 - 현명한 후퇴]`,
      isEnding: true,
      choices: [],
    },
  ],
};

// 스토리 목록 (추후 확장용)
export const storyList: Story[] = [sampleStory];
