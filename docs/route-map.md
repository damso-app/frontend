# 라우트 맵

`AGENTS.md`의 담소 제품 플로우 10단계를 기준으로 정리한 프론트 라우트 계획. 하단 내비게이션(`BottomNav`) 4개 탭 — 홈 / 질문&답변 / 다이어리 / 설정 — 을 최상위 기준으로 삼는다.

> 2026-07-08: 로컬 백엔드(`http://localhost:8000`)를 띄우고 `/openapi.json` + 실제 호출로 F-06/F-09/F-10/F-11 연동 API의 정확한 응답 스키마를 확인했다. 아래 표와 `src/lib/api/*.ts`는 이 실측 스키마 기준으로 갱신됨.

| # | 플로우 단계 | 라우트 | 연동 API | 상태 |
| --- | --- | --- | --- | --- |
| 1 | 온보딩 | `/onboarding` | – | 미구현 |
| 2 | 카카오 로그인 진입 | `/login` | 카카오 OAuth + 백엔드 콜백 (문서 확인 필요) | 미구현 |
| 3 | 역할 선택 (자식/엄마/아빠) | `/onboarding/role` | 문서 확인 필요 | 미구현 |
| 4 | 가족 생성 · 초대 코드 공유 | `/family/create` | 문서 확인 필요 | 미구현 |
| 4 | 초대 코드로 가족 합류 | `/family/join` | 문서 확인 필요 | 미구현 |
| 5 | 홈 | `/` | `GET /api/v1/home/summary` | **구현됨** (`src/app/page.tsx`). "질문 만들기" CTA는 `/questions/new`로 이동 |
| 5 | 질문 목록 확인 | `/questions` | `GET /api/v1/answers/questions` | **구현됨** (`src/app/questions/page.tsx`). BottomNav의 `qna` 탭 목적지이며 받은 질문 리스트만 표시 |
| 5 | 질문 상세 / 읽음 처리 | `/questions/[questionSendId]` | `GET /api/v1/answers/questions/{id}`, `PATCH .../read` | **구현됨** (`src/app/questions/[questionSendId]/page.tsx`). 받은 질문 선택 시 진입 |
| 6 | 자녀가 질문 보내기 | `/questions/new` | Question 발송 API | **구현됨** (`src/app/questions/new/page.tsx`). 홈 화면 "질문 만들기"에서 진입하는 작성 플로우 |
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

`/questions/new`는 하단 탭의 직접 목적지가 아니라 홈의 "질문 만들기" CTA에서 진입하는 질문 작성 화면이다. `qna` 탭은 항상 `/questions`의 받은 질문 리스트로 돌아간다.

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

- 카카오 로그인, 역할 선택, 가족 생성/합류 API 스펙 (아직 공유된 문서 없음)
- 질문을 자녀가 부모에게 "보내는" 쪽 API (Answer API 문서는 수신자 측만 다룸) — F-08의 "상대방에게 질문하기" 버튼도 같은 이유로 `/questions/new`(미구현) 스텁 이동만 함
- 로그인 토큰 발급/저장 방식 (`src/lib/api/client.ts`의 `getAccessToken`은 `localStorage` 하드코딩 임시 구현)
- Supabase Realtime 채널 접속 정보(URL/키) — 나오기 전까지 `/answers/[answerId]/processing`은 `GET .../clip`을 2초 간격으로 폴링해서 완료를 감지함
- `GET /api/v1/answers/{answer_id}/clip`이 미완료 상태일 때 정확히 어떤 응답(404 등)을 주는지 미확인 — 현재는 "실패하면 아직 처리 중"으로 취급
- `GET /api/v1/clips` 응답에 `title`/`familyMemberRole`/`familyMemberName`/`questionCount` 필드가 실제로 포함되는지 미확인 (`src/lib/api/clips.ts`의 `DiaryEntry`에 옵셔널로 추정 반영). 그룹 헤더(월)와 "오늘/어제/N일 전" 상대 날짜 표기도 백엔드가 별도 그룹 구조를 주는지, 프론트가 `submittedAt` 하나로 직접 계산해야 하는지 확인 필요 — 현재는 후자로 구현
- F-15의 "← 뒤로가기"는 F-06(받은 질문 · 답변 준비)이 아직 없어 임시로 `router.back()`만 호출함. F-06 라우트가 생기면 `questionSendId` 기준으로 그쪽으로 보내야 함
- F-15의 "권한 허용 방법" 버튼은 목적지/콘텐츠 미정으로 아직 no-op 상태
- `video_clips`의 `fourcut_title`이 같은 날짜 그룹 내 여러 컷에 공통으로 채워지는 것을 실제 시딩 데이터로 확인함 (`src/app/diary/[date]/page.tsx`의 `groupTitle` 로직 정상 동작)
- F-11에서 원본 질문 텍스트를 보여줄 수 있는 API가 없음 — 필요하면 백엔드에 `question_sends.question_text`를 clip 상세 응답에 조인해달라고 요청해야 함
- AI 콜백(`POST /answers/{id}/ai-callback`)까지는 검증 못함 — 실제 AI 서버 연동 없이는 `submitted`(백엔드 기준 제출 즉시 상태는 `processing`)에서 더 진행되지 않음
