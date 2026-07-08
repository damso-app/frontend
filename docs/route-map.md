# 라우트 맵

`AGENTS.md`의 담소 제품 플로우 10단계를 기준으로 정리한 프론트 라우트 계획. 하단 내비게이션(`BottomNav`) 4개 탭 — 홈 / 질문&답변 / 다이어리 / 설정 — 을 최상위 기준으로 삼는다.

> 2026-07-08: 로컬 백엔드(`http://localhost:8000`)를 띄우고 `/openapi.json` + 실제 호출로 F-06/F-09/F-10/F-11 연동 API의 정확한 응답 스키마를 확인했다. 아래 표와 `src/lib/api/*.ts`는 이 실측 스키마 기준으로 갱신됨.

| # | 플로우 단계 | 라우트 | 연동 API | 상태 |
| --- | --- | --- | --- | --- |
| 1 | 온보딩 | `/onboarding` | `GET /api/v1/users/me/onboarding` 등 (이승주 담당, `origin/feat/onboardingAndFamilyConnect-#5` 브랜치) | 다른 브랜치에서 구현 중 |
| 2 | 카카오 로그인 진입 | `/login` | `GET /api/v1/auth/kakao/login-url`, `GET /api/v1/auth/kakao/callback`, `POST /api/v1/auth/login-code/exchange` | 다른 브랜치에서 구현 중 |
| 3 | 역할 선택 (자식/엄마/아빠) | `/onboarding/role` | `PATCH /api/v1/users/me/role` | 다른 브랜치에서 구현 중 |
| 4 | 가족 생성 · 초대 코드 공유 | `/family/create` | `POST /api/v1/families`, `GET /api/v1/families/me/invitation` | 미구현 |
| 4 | 초대 코드로 가족 합류 | `/family/join` | `GET /api/v1/families/invitations/{code}`, `POST /api/v1/families/join` | 미구현 |
| 5 | 홈 | `/` | `GET /api/v1/home/summary` | 미구현 (현재 CNA 기본 템플릿) |
| 5 | 질문 목록 확인 | `/questions` | `GET /api/v1/answers/questions` | 미구현 |
| 5 | 질문 상세 / 읽음 처리 (F-06 받은 질문 · 답변 준비) | `/questions/[questionSendId]` | `GET /api/v1/answers/questions/{id}`, `PATCH .../read` | **구현됨** (`src/app/questions/[questionSendId]`). API 클라이언트는 `src/lib/api/questions.ts`. F-15 뒤로가기가 이 라우트로 연결됨 |
| 6 | 자녀가 질문 보내기 | `/questions/new` (가칭) | `GET /api/v1/questions/recipients`, `GET /api/v1/questions/recommendations`, `POST /api/v1/questions` (실제 존재 확인함) | 미구현 — API는 있지만 화면 미작업 |
| 7 | 영상 답변 기록 | `/questions/[questionSendId]/record` | `POST /api/v1/answers/upload-url` → GCS PUT → `POST /api/v1/answers` | **구현됨** (`src/app/questions/[questionSendId]/record`). API 클라이언트는 `src/lib/api/answers.ts` |
| 8 | AI 처리 상태 (submit 시 바로 processing→completed/failed) | `/answers/[answerId]/processing` | `GET /api/v1/answers/{answer_id}/clip` (임시 폴링), 추후 Supabase Realtime `family:{family_id}` 채널 `answer_status_updated`로 교체 예정 | **구현됨** (`src/app/answers/[answerId]/processing`). F-07 제출 성공 시 이 라우트로 이동 |
| 9 | 네컷 그리드 (날짜별 그룹) | `/diary` | `GET /api/v1/clips` → `{ groups: [{ date, clips: [{answerId,status,thumbnailUrl}] }] }` | **구현됨** (`src/app/diary`). API 클라이언트는 `src/lib/api/clips.ts` |
| 10 | 네컷 묶음 보기 (F-10 회고록 · 저장된 GIF 네컷) | `/diary/[date]` | `GET /api/v1/clips`로 그룹 조회 후 날짜로 필터, 각 완료 컷은 `GET /api/v1/answers/{id}/clip`으로 제목/썸네일 보강 | **구현됨** (`src/app/diary/[date]`) |
| 10 | 컷 상세 (F-11 영상/AI 요약/명대사, 자동 반복 재생) | `/diary/[date]/[answerId]` | `GET /api/v1/answers/{answer_id}/clip` | **구현됨** (`src/app/diary/[date]/[answerId]`). 같은 날짜 그룹 내 이전/다음 질문 이동 포함 |
| – | 설정 | `/settings` | 문서 확인 필요 | 미구현 |
| – | 카메라/마이크 권한 복구 안내 (F-15) | `/questions/[questionSendId]/record/permission` | – (`navigator.mediaDevices.getUserMedia`로 재요청) | **구현됨** (`src/app/questions/[questionSendId]/record/permission`). F-07에서 카메라 접근 실패 시 자동 이동, 성공하면 F-07로 복귀 |

## BottomNav ↔ 라우트 매핑

`src/components/ui/navigation/BottomNav.tsx`의 기본 탭 id는 아래 라우트에 대응한다.

| BottomNav id | 라벨 | 라우트 |
| --- | --- | --- |
| `home` | 홈 | `/` |
| `qna` | 질문&답변 | `/questions` |
| `diary` | 다이어리 | `/diary` |
| `settings` | 설정 | `/settings` |

## 실측 확인된 스키마 (2026-07-08, 로컬 백엔드 `/openapi.json` + 실제 호출 기준)

- `GET /api/v1/answers/questions` → `{ questions: ReceivedQuestionItem[] }` (flat 배열 아님)
- `GET /api/v1/answers/questions/{id}` → `ReceivedQuestionDetail`: `questionSendId`(number), `sender: {userId, displayName, profileImageUrl, role}`(role은 `child`/`mother`/`father`), `questionText`, `depth`(`tiny`/`medium`/`deep`), `receivedAt`, `read`, `readAt`, `answered`, `answeredAt`, `status`(`sent`/`answered`/`cancelled`/`expired`), `source`(`recommendation`/`custom`), `recommendationId`
- `GET /api/v1/clips` → `{ groups: [{ date: "YYYY-MM-DD", clips: [{ answerId, status, thumbnailUrl }] }] }` — 그룹 키는 날짜만이고 가족 role/이름/제목 필드는 없음
- `GET /api/v1/answers/{id}/clip` → `ClipDetailResponse`: `answerId`, `videoUrl`, `thumbnailUrl`, `transcript`, `transcriptSegments`, `title`, `quote`, `oneLineSummary`, `emotionTags`, `fourcutTitle` (전부 `answerId` 제외 nullable). **원본 질문 텍스트 필드는 없음** — F-11에서 "질문" 카드를 뺀 이유
- 미완료/존재하지 않는 clip·질문 조회 시 `404 {"detail": "..."}` (에러 바디 형식 확인됨)
- 인증은 `Authorization: Bearer {JWT}` (`sub`=`users.public_id`, `provider`, `role` 클레임), 카카오 로그인 콜백 → `login-code/exchange`로 토큰 발급
- `POST /api/v1/answers/upload-url`이 발급하는 GCS v4 서명 PUT URL은 요청한 `videoMimeType`을 서명에 포함한다 — 실제 PUT 요청의 `Content-Type` 헤더가 정확히 같은 값이어야 하며(다르면 서명 불일치로 실패), 백엔드는 `video/mp4`/`video/quicktime`/`video/webm`/`video/3gpp` 4종만 문자열 완전 일치로 허용한다(부분 문자열 매칭 안 함)

## 2026-07-08 로컬 백엔드 + 시딩 데이터로 F-06~F-11 실제 연동 검증 완료

받은 질문(F-06) → 답변 기록(F-07) → 업로드(GCS PUT 실제 도착 확인) → 다이어리 목록(F-09) → 네컷 묶음(F-10) → 컷 상세(F-11, 이전/다음 이동 포함)까지 실제 로컬 백엔드에 테스트 데이터를 시딩해 전부 정상 동작 확인함 (테스트 후 시딩 데이터·GCS 오브젝트는 모두 삭제해 원복함). 이 과정에서 실제 버그 2건 발견 후 수정:

1. **MIME 타입 불일치로 답변 제출 415 에러**: `MediaRecorder`가 만드는 `video.type`은 `"video/webm;codecs=vp9,opus"`처럼 코덱 파라미터가 붙어있는데, 백엔드는 `video/webm` 등 4종만 정확히 일치해야 허용. `src/app/questions/[questionSendId]/record/page.tsx`에서 `.split(";")[0]`로 코덱 파라미터를 잘라내고 보내도록 수정
2. **GCS 서명 URL의 Content-Type 불일치 위험**: 1번과 같은 이유로 실제 PUT 요청의 `Content-Type` 헤더도 서명에 쓰인 값과 달라질 뻔함. `src/lib/api/answers.ts`의 `uploadAnswerVideo`가 `video.type`(원본) 대신 호출자가 넘긴 `contentType`(서명에 쓴 것과 동일한 stripped 값)을 쓰도록 시그니처 변경

## 확인 필요 항목

- 가족 생성/합류, 홈 요약, 질문 발송(자녀→부모) 화면은 API가 이미 존재하지만 프론트 화면이 아직 없음 — `/questions/new`, `/family/*`, `/` 구현 시 위 실측 API를 바로 쓰면 됨
- 로그인 토큰 발급/저장 방식 (`src/lib/api/client.ts`의 `getAccessToken`은 `localStorage` 하드코딩 임시 구현) — 이승주 브랜치의 로그인 콜백과 연동 필요
- Supabase Realtime 채널 접속 정보(URL/키) — 나오기 전까지 `/answers/[answerId]/processing`은 `GET .../clip`을 2초 간격으로 폴링해서 완료를 감지함
- F-15의 "권한 허용 방법" 버튼은 목적지/콘텐츠 미정으로 아직 no-op 상태
- `video_clips`의 `fourcut_title`이 같은 날짜 그룹 내 여러 컷에 공통으로 채워지는 것을 실제 시딩 데이터로 확인함 (`src/app/diary/[date]/page.tsx`의 `groupTitle` 로직 정상 동작)
- F-11에서 원본 질문 텍스트를 보여줄 수 있는 API가 없음 — 필요하면 백엔드에 `question_sends.question_text`를 clip 상세 응답에 조인해달라고 요청해야 함
- AI 콜백(`POST /answers/{id}/ai-callback`)까지는 검증 못함 — 실제 AI 서버 연동 없이는 `submitted`(백엔드 기준 제출 즉시 상태는 `processing`)에서 더 진행되지 않음
