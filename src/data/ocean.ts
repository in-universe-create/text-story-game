import type { Story } from '@/types/game';
import { DEFAULT_STATS } from '@/types/game';

export const oceanStory: Story = {
  "id": "oceanStoryMistary",
  "title": "something",
  "description": "스토리 설명을 입력하세요",
  "startSceneId": "1765604441749-ms9suc4",
  "scenes": [
    {
      "id": "1765604441749-ms9suc4",
      "title": "런칭",
      "text": "오늘은 새로운 그룹의 런칭일이다.\n런칭. 어감에서 오는 불편함이 입 속을 맴돈다. \n\n이번 데뷔팀을 구성하는 조직에서 사용하는 단어 하나하나 수정하는 것이 이상해 가만히 두었던 게 문화로 자리 잡고 말았다. \n\n멤버들의 최종 프로필을 확인하며 이사실에 들어간다.\n\n그러다, \n문득\n이질감이 느껴진다.\n\n무엇이 이질감을 불러일으키는 걸까. \n",
      "choices": [
        {
          "id": "1765605311260-ddarx4o",
          "text": "이사실의 물리적인 상태를 살핀다",
          "targetSceneId": "1765604442384-d51i4vd"
        }
      ],
      "isEnding": false
    },
    {
      "id": "1765604442384-d51i4vd",
      "title": "이사실",
      "text": "이사실은 지나치게 깨끗하다. \n청소가 잘 된 수준이 아니라, 생활의 흔적 자체가 제거된 상태. \n\n책상 모서리에 손을 대는 순간, \n미세한 끈적임이 느껴진다.\n보이지 않을 만큼 얇은 층의 무언가. \n",
      "choices": [
        {
          "id": "1765605855114-we9x4s6",
          "text": "책상 서랍",
          "targetSceneId": "1765605283016-nffxewp"
        },
        {
          "id": "1765605932357-3lch3z0",
          "text": "청소 기록을 확인한다",
          "targetSceneId": "1765605290080-yozzmzd",
          "effects": [
            {
              "type": "stat",
              "target": "stress",
              "action": "add",
              "value": 10
            }
          ]
        },
        {
          "id": "1765605938685-kszabt2",
          "text": "새 선택지",
          "targetSceneId": "1765605289204-vjcp4te"
        }
      ],
      "isEnding": false
    },
    {
      "id": "1765605283016-nffxewp",
      "title": "새 씬",
      "text": "내용을 입력하세요...",
      "choices": []
    },
    {
      "id": "1765605289204-vjcp4te",
      "title": "새 씬",
      "text": "내용을 입력하세요...",
      "choices": []
    },
    {
      "id": "1765605290080-yozzmzd",
      "title": "새 씬",
      "text": "내용을 입력하세요...",
      "choices": [],
      "isEnding": false
    }
  ],
  "initialStats": {
    "hp": 100,
    "maxHp": 100,
    "strength": 10,
    "intelligence": 10,
    "agility": 10,
    "stress": 0,
    "reputation": 50,
    "relationship": 50,
    "gold": 100
  },
  "initialItems": []
}