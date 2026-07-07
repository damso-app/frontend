# Prompt Log

사용자가 지시한 프롬프트 기준으로 작업을 기록한다. 최신 항목이 위로 오도록 역순으로 쌓는다.

---

## 2026-07-08

- **프롬프트 요약**: `/agreements` 화면에 Swagger 기준 동의 상태 조회/저장 API 연동
- **작업 구현 요약**: 사용자 동의 타입과 API 함수(`GET/POST /api/v1/users/me/agreements`)를 추가하고, 페이지 진입 시 `damso_access_token`으로 기존 동의 상태를 조회해 체크박스를 초기화. 누락 항목은 미동의로 처리하며, 4개 모두 체크 시 저장 요청 후 `/onboarding/role`로 이동. 401은 토큰 제거 후 `/login` 이동, 400/기타 오류 메시지 표시
- **변경점**: `src/lib/api/users.ts` 추가, `src/app/agreements/page.tsx`, `src/components/onboarding/AgreementCheckbox.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

- **프롬프트 요약**: `/agreements` 화면을 최신 Figma 기준 약관 동의 UI로 수정
- **작업 구현 요약**: 상단 문구를 개인정보 약관 동의 흐름으로 교체하고, 4개 필수 동의 카드/오른쪽 약관 pill/코랄 체크박스 상태를 반영. 첫 3개 항목은 기본 체크, 데이터 활용 항목은 기본 미체크로 설정하고, 안내 카드와 하단 CTA/문구를 추가. API 연동 없이 CTA와 약관 pill은 TODO 로그만 남김
- **변경점**: `src/app/agreements/page.tsx`, `src/components/onboarding/AgreementCheckbox.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

- **프롬프트 요약**: `.env` 확인 후 환경변수 기준에 맞춰 필요한 코드 수정
- **작업 구현 요약**: `.env`와 `.env.example`의 `NEXT_PUBLIC_API_BASE_URL` 키가 배포 백엔드와 일치하는지 확인하고, `next.config.ts`의 예전 `NEXT_PUBLIC_API_URL`/localhost fallback을 제거해 새 API base URL이 없으면 명확히 실패하도록 정리
- **변경점**: `next.config.ts`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

- **프롬프트 요약**: Damso 프론트엔드에 백엔드 기반 카카오 로그인 연동 구현
- **작업 구현 요약**: `/login`의 임시 `/agreements` 이동을 제거하고 백엔드 `loginUrl` 발급 API 호출 후 카카오 OAuth로 이동하도록 연결. `/auth/kakao/callback`에서 query의 `loginCode`를 Damso access token으로 교환해 `localStorage(damso_access_token)`에 저장 후 `/agreements`로 이동. 토큰 유틸과 auth API 클라이언트 추가, 새 API base URL env 문서화
- **변경점**: `.env.example`, `next.config.ts`, `src/app/login/page.tsx`, `src/app/auth/kakao/callback/page.tsx`, `src/app/auth/kakao/callback/CallbackClient.tsx`, `src/lib/api/auth.ts`, `src/lib/api/client.ts`, `src/lib/auth/token.ts`, `docs/route-map.md`, `PROMPT_LOG.md` 수정/추가
- **검증 결과**: `npm run lint`, `npm run build` 통과

- **프롬프트 요약**: `/login` 카드의 두 제공 이미지 렌더 높이 통일
- **작업 구현 요약**: 투명 PNG 원본 비율 표시를 유지하되, 아바타 표시 기준을 폭 93px에서 높이 93px로 변경해 두 이미지의 렌더 높이가 같게 조정
- **변경점**: `src/app/login/page.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

- **프롬프트 요약**: `/login` 카드의 제공 이미지 하얀 테두리 제거 및 이미지 크기 1.5배 확대
- **작업 구현 요약**: `children`/`father`/`mother` PNG의 외곽 단색 배경을 투명 처리하고, 로그인 카드 아바타 렌더링을 고정 원형 크롭에서 투명 PNG 원본 비율 표시로 변경. 표시 폭은 기존 62px에서 93px로 확대하고 카드 높이/위치를 조정
- **변경점**: `public/children.png`, `public/father.png`, `public/mother.png`, `src/app/login/page.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

- **프롬프트 요약**: `/login` 카카오 연결 카드부터 안내 카드 2개까지 아래로 내리고 아바타 이미지 겹침/테두리 제거
- **작업 구현 요약**: 온보딩 콘텐츠 상단 여백을 늘려 카카오 연결 카드와 하단 안내 카드 묶음을 아래로 이동. 카드 내 실제 이미지 2개의 음수 마진과 흰색 테두리를 제거하고 토큰 기반 간격을 추가
- **변경점**: `src/app/login/page.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

- **프롬프트 요약**: `/login` 카카오 연결 카드의 CSS placeholder 아바타를 public 실제 이미지로 교체
- **작업 구현 요약**: `public/children.png`, `public/father.png` 실제 파일명을 확인하고 `next/image`로 원형 아바타 2개를 카드 오른쪽 하단에 겹쳐 배치. 안내 카드 2개와 `/agreements` CTA 이동은 유지
- **변경점**: `src/app/login/page.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

- **프롬프트 요약**: `/login` 화면을 Figma 기준 "01 가입 · 카카오 로그인" 구조로 정정
- **작업 구현 요약**: 상단 문구를 간편 가입 기준으로 바꾸고, 민트 톤 카카오 연결 메인 카드에 여성/남성 CSS 캐릭터 아바타 2개를 배치. 안내 카드는 코랄 dot이 있는 2개 카드로 정리하고 CTA는 `/agreements` 임시 이동을 유지
- **변경점**: `src/app/login/page.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

## 2026-07-07

- **프롬프트 요약**: `/login` 화면을 모바일 앱형 카카오 로그인 목표 디자인으로 수정
- **작업 구현 요약**: 로그인 헤더/메인 카카오 카드/하단 CTA 문구와 여백을 목표 화면 기준으로 조정하고 모바일 최대 폭 컨테이너를 적용
- **변경점**: `src/app/login/page.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

## 2026-07-07

- **프롬프트 요약**: `/onboarding` 상단 DAMSO 문구를 교체하고 30초 후 `/login`으로 자동 이동하도록 수정
- **작업 구현 요약**: 온보딩 eyebrow를 `살아있는 회고록`으로 설정하고, 페이지 진입 후 30초 타이머로 로그인 화면에 `replace` 이동하는 클라이언트 효과 추가
- **변경점**: `src/app/onboarding/page.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint`, `npm run build` 통과

## 2026-07-07

- **프롬프트 요약**: `/onboarding` 화면을 모바일 웹앱 기준 Figma 형태로 조정하고 오늘의 가족 기록을 영상 썸네일형 네컷 카드로 수정
- **작업 구현 요약**: 온보딩 본문을 헤더 바로 아래에서 시작하도록 배치하고, 2x2 CSS 영상 placeholder 그리드와 코랄 안내 카드, CTA 보조 문구를 반영
- **변경점**: `src/app/onboarding/page.tsx`, `src/components/onboarding/OnboardingShell.tsx`, `src/components/onboarding/OnboardingInfoCard.tsx`, `PROMPT_LOG.md` 수정
- **검증 결과**: `npm run lint` 통과. `npm run build`는 기본 샌드박스에서 Turbopack 포트 바인딩 권한 문제로 1차 실패 후, 권한 승인 실행으로 통과

## 2026-07-07

- **프롬프트 요약**: 온보딩 1차 화면 3개(`/onboarding`, `/login`, `/agreements`)를 API 연동 없이 Figma 톤 기준으로 구현
- **작업 구현 요약**: 브랜드 첫 화면, 카카오 로그인 안내 화면, 필수 동의 체크 화면 구현. 로그인/동의 저장은 실제 API 호출 없이 TODO stub으로 두고 임시 라우팅만 연결
- **변경점**: `src/app/onboarding/page.tsx`, `src/app/login/page.tsx`, `src/app/agreements/page.tsx`, `src/components/onboarding/OnboardingShell.tsx`, `src/components/onboarding/OnboardingInfoCard.tsx`, `src/components/onboarding/AgreementCheckbox.tsx` 추가, `docs/route-map.md` 갱신
- **검증 결과**: `npm run lint` 통과. `npm run build`는 기본 샌드박스에서 Turbopack 포트 바인딩 권한 문제로 1차 실패 후, 권한 승인 실행으로 통과

## 2026-07-07

- **프롬프트 요약**: F-15 권한 요청 안내 페이지 만들어줘 (뒤로가기는 F-06 미구현이라 TODO로 남김)
- **작업 구현 요약**: F-15 카메라/마이크 권한 복구 안내 화면 구현. "권한 다시 요청" 버튼은 실제 `getUserMedia`로 재요청해 성공 시 F-07로 복귀. F-07에서 카메라 접근 실패 시 이 화면으로 자동 이동하도록 연결
- **변경점**: `src/app/questions/[questionSendId]/record/permission/page.tsx` 추가, F-07의 `onUserMediaError`에서 이 라우트로 이동하도록 수정, `docs/route-map.md` 갱신

## 2026-07-07

- **프롬프트 요약**: 다음 화면 작업 시작하자 (F-09 다이어리 목록 선택)
- **작업 구현 요약**: F-09 다이어리 목록 화면 구현
- **변경점**: `src/app/diary/page.tsx`, `src/lib/api/clips.ts` 추가, `docs/route-map.md` 갱신

## 2026-07-07

- **프롬프트 요약**: F08 진행해줘
- **작업 구현 요약**: F-08 AI 처리 상태 화면 구현, F-07 제출 성공 시 이 화면으로 이동하도록 연결
- **변경점**: `src/app/answers/[answerId]/processing/page.tsx` 추가, `src/lib/api/answers.ts`에 `getAnswerClip` 추가, `docs/route-map.md` 갱신

## 2026-07-07

- **프롬프트 요약**: (Answer API 문서 공유 후) 진행해줘
- **작업 구현 요약**: 답변 업로드 API(업로드 URL 발급 → GCS 업로드 → 메타데이터 제출) 실연동, `/record`를 `/questions/[questionSendId]/record`로 이동
- **변경점**: `src/lib/api/client.ts`, `src/lib/api/answers.ts` 추가, `next.config.ts` rewrite 경로 수정, `src/app/record` → `src/app/questions/[questionSendId]/record` 이동

## 2026-07-07

- **프롬프트 요약**: Notion DB 스키마 / Answer API 내용을 docs에 정리하고 개발하면서 참조하게 해줘
- **작업 구현 요약**: 공유받은 내용을 프로젝트 문서로 정리
- **변경점**: `docs/backend-db-schema.md`, `docs/backend-answer-api.md`, `docs/route-map.md` 추가, `AGENTS.md`에 백엔드 연동 참고 섹션 추가

## 2026-07-07

- **프롬프트 요약**: 담소 전체 플로우 10단계 공유 + Figma F-07 노드 기준으로 구현해줘 (디자인 시스템 컴포넌트 사용 권장)
- **작업 구현 요약**: F-07 영상 답변 기록 화면 구현 (카메라 녹화 UI)
- **변경점**: `AGENTS.md`에 제품 플로우/UI 구현 원칙 추가, `src/app/record/page.tsx` 추가, `Button`에 `sage` variant 추가, `BottomNav` 컴포넌트 추가
