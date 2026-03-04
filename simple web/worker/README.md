# Cloudflare Worker로 CORS 해결하기

## 왜 필요한가?
브라우저에서 `https://api.openai.com/v1/chat/completions`를 직접 호출하면 **CORS 정책** 때문에 차단될 수 있습니다.
특히 파일로 열면(origin이 `null`) 차단 메시지가 더 자주 보입니다.

그래서 **Worker(서버)**가 OpenAI를 대신 호출하고, 응답에 CORS 헤더를 붙여 브라우저에 전달하는 구조가 필요합니다.

## 준비물
- Cloudflare 계정 (무료 가능)
- OpenAI API Key (Worker의 Secret으로 저장 — 브라우저에 노출하지 않기)

## 배포 방법(요약)
1. Cloudflare Dashboard → Workers & Pages → Worker 생성
2. `worker.js` 내용 붙여넣기
3. Settings → Variables → **Secrets**에 `OPENAI_API_KEY` 추가
4. Deploy

## 프론트 설정
게임 페이지(`game.html`) → AI 설정에서
- **API Endpoint**: `https://<your-worker>.workers.dev/chat`
- **Model**: 예: `gpt-4o-mini`
- **API Key**: (비워도 됨)  
  - 프록시가 키를 가지고 있으므로, 프론트에 키를 넣지 않는 방식이 더 안전합니다.

> 현재 프론트 구현은 Authorization 헤더에 키를 넣어 보내도록 되어 있어요.
> Worker를 쓰는 경우엔 프론트 키를 비워도 되게 개선할 수도 있습니다(원하면 바로 수정해드릴게요).

