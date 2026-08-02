# 포트폴리오 소개 페이지

취업활동용 이력/포트폴리오 소개 페이지입니다. 메인화면에서 네비게이터를 통해 각 섹션으로 이동할 수 있습니다.

Vite + React + TypeScript로 빌드되며, GitHub Actions를 통해 GitHub Pages(`https://kinetas.github.io/portfolio/`)에 자동 배포됩니다.

## 개발

```bash
npm install
npm run dev       # 로컬 개발 서버
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 로컬 미리보기
```

## 내용 수정

| 내용 | 위치 |
|---|---|
| 자기소개, 이름, 태그라인 | `src/components/About.tsx` |
| 학력 | `src/components/Work.tsx` |
| 자격증 | `src/data/certs.ts` |
| 스킬 배지 | `src/data/skills.ts` |
| 프로젝트 카드 | `src/data/projects.ts` (이미지는 `src/assets/`에 추가 후 import) |
| 연락처 | `src/data/contact.ts` |
| GitHub 위젯 대상 계정 | `src/hooks/useGithubData.ts`의 `GITHUB_DEFAULT_USERNAME` |
| 전역 스타일 | `src/index.css` |

수정 후 `npm run dev`로 로컬에서 확인하고, `main` 브랜치에 푸시하면 자동으로 빌드/배포됩니다.

## 파일 구조
- `src/App.tsx` - 전체 레이아웃 조립
- `src/components/` - 섹션별 컴포넌트 (Nav, About, Work, Skills, Project, Github, Contact)
- `src/hooks/` - 스크롤스파이/모바일 내비게이션(`useSectionNav`), GitHub API 연동(`useGithubData`)
- `src/data/` - 콘텐츠 데이터 (자격증, 스킬, 프로젝트, 연락처)
- `src/assets/` - 배경·프로젝트 이미지
- `.github/workflows/deploy.yml` - GitHub Pages 배포 워크플로우

## 배포 설정 (최초 1회)

GitHub 저장소 **Settings > Pages > Build and deployment > Source**를 **"GitHub Actions"**로 설정해야 배포 워크플로우가 동작합니다.
