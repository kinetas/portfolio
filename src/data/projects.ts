import missionShareThumb from '../assets/project-mission-share.png'
import harnessEngineeringThumb from '../assets/project-harness-engineering.png'
import valuepickThumb from '../assets/project-valuepick.png'

export interface Project {
  title: string
  href: string
  thumb: string
  role: string
  desc: string
  date: string
}

export const projects: Project[] = [
  {
    title: '미션공유앱',
    href: 'https://github.com/kinetas/nodetest',
    thumb: missionShareThumb,
    role: '백엔드,DevOps,아키텍처 설계,DB설계',
    desc: '자기개발,자기개선의 목적으로 혼자 하면 목표를 잃어버릴 가능성이 있지만 observer effect를 통해 지속적 동기를 부여해주는 앱을 제작',
    date: '2024.09 - 2025.06',
  },
  {
    title: 'harness_engineering',
    href: 'https://github.com/kinetas/harness_engineering',
    thumb: harnessEngineeringThumb,
    role: '기획,설계,개발',
    desc: 'Claude 기반 멀티 에이전트 개발 자동화 시스템으로, Boss AI가 요청을 DAG로 분석해 세그먼트로 분할하고 Manager AI와 Sub AI를 동적으로 생성해 병렬 개발을 진행. PRD 분석부터 코드 작성, 품질 검수, 보고서 생성까지 개발 사이클을 자동화하는 스킬 기반 아키텍처를 설계 및 구현',
    date: '2026.05 - 2026.06',
  },
  {
    title: 'valuepick',
    href: 'https://github.com/project-valuepick/valuepick',
    thumb: valuepickThumb,
    role: '백엔드,프론트엔드,배포,아키텍처 설계,DB설계',
    desc: 'DART 재무제표, 시세, KRX 지수, 환율 데이터를 매일 수집해 PER/PBR/ROE 및 Piotroski F-Score 기반 멀티팩터 스코어링으로 저평가 우량주를 추천하는 가치투자 스크리닝 서비스. 투자일지 기능, 실시간 시세 반영을 개발하고 Docker/Jenkins 기반 배포를 담당',
    date: '2026.06 - 2026.07',
  },
]
