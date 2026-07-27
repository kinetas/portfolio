# 포트폴리오 소개 페이지

취업활동용 이력/포트폴리오 소개 페이지입니다. 메인화면에서 네비게이터를 통해 각 페이지로 이동할 수 있습니다.

## 사용 방법

### 1. 네비게이션
- 상단 메뉴: **프로필** | **경력** | **역량** | **포트폴리오**
- 클릭 시 해당 페이지로 이동

### 2. 코드로만 수정하는 부분 (index.html)

**프로필 페이지**
- 프로필 사진: `<img src="">`에 이미지 경로
- 생년월일: `<span id="birthdate">`
- 전화번호: `<span id="phone">`
- 자기소개: `<p id="introText">`

**경력 페이지**
- 학력: `<div id="educationList">` 내부

### 3. 프로젝트 카드 (PROJECT 섹션)
- `index.html`의 `#project` 섹션 안 `.project-grid`에 `.project-card` 마크업을 직접 추가/수정합니다.
- 카드 이미지는 `assets/` 폴더에 넣고 `<img class="project-thumb" src="assets/...">`로 참조하세요.

## 파일 구조
- `index.html` - 메인 페이지
- `styles.css` - 스타일
- `app.js` - 네비게이션/GitHub 연동 로직
- `assets/` - 배경·프로젝트 이미지
