# 라우트 맵

`AGENTS.md`의 담소 제품 플로우 10단계를 기준으로 정리한 프론트 라우트 계획. 하단 내비게이션(`BottomNav`) 4개 탭 — 홈 / 질문&답변 / 다이어리 / 설정 — 을 최상위 기준으로 삼는다.

| # | 플로우 단계 | 라우트 | 연동 API | 상태 |
| --- | --- | --- | --- | --- |
| 1 | 온보딩 | `/onboarding` | – | 미구현 |
| 2 | 카카오 로그인 진입 | `/login` | 카카오 OAuth + 백엔드 콜백 (문서 확인 필요) | 미구현 |
| 3 | 역할 선택 (자식/엄마/아빠) | `/onboarding/role` | 문서 확인 필요 | 미구현 |
| 4 | 가족 생성 · 초대 코드 공유 | `/family/create` | 문서 확인 필요 | 미구현 |
| 4 | 초대 코드로 가족 합류 | `/family/join` | 문서 확인 필요 | 미구현 |
| 5 | 홈 | `/` | 문서 확인 필요 | 미구현 (현재 CNA 기본 템플릿) |
| 5 | 질문 목록 확인 | `/questions` | `GET /api/v1/answers/questions` | 미구현 |
| 5 | 질문 상세 / 읽음 처리 | `/questions/[questionSendId]` | `GET /api/v1/answers/questions/{id}`, `PATCH .../read` | 미구현 |
| 6 | 자녀가 질문 보내기 | `/questions/new` (가칭) | **Question 발송 API 미확인** — 이 문서(Answer API)에는 수신자 측 API만 있음 | 미구현 |
| 7 | 영상 답변 기록 | `/questions/[questionSendId]/record` | `POST /api/v1/answers/upload-url` → GCS PUT → `POST /api/v1/answers` | **구현됨** (`src/app/questions/[questionSendId]/record`). API 클라이언트는 `src/lib/api/answers.ts` |
| 8 | AI 처리 상태 (submitted→processing→completed/failed) | `/answers/[answerId]/processing` | `GET /api/v1/answers/{answer_id}/clip` (임시 폴링), 추후 Supabase Realtime `family:{family_id}` 채널 `answer_status_updated`로 교체 예정 | **구현됨** (`src/app/answers/[answerId]/processing`). F-07 제출 성공 시 이 라우트로 이동 |
| 9 | 네컷 그리드 (날짜+가족 단위) | `/diary` | `GET /api/v1/clips` | **구현됨** (`src/app/diary`). API 클라이언트는 `src/lib/api/clips.ts` |
| 10 | 컷 상세 (영상/명대사/요약) | `/diary/[answerId]` | `GET /api/v1/answers/{answer_id}/clip` | 미구현 |
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

## 확인 필요 항목

- 카카오 로그인, 역할 선택, 가족 생성/합류 API 스펙 (아직 공유된 문서 없음)
- 질문을 자녀가 부모에게 "보내는" 쪽 API (Answer API 문서는 수신자 측만 다룸) — F-08의 "상대방에게 질문하기" 버튼도 같은 이유로 `/questions/new`(미구현) 스텁 이동만 함
- 로그인 토큰 발급/저장 방식 (`src/lib/api/client.ts`의 `getAccessToken`은 `localStorage` 하드코딩 임시 구현)
- Supabase Realtime 채널 접속 정보(URL/키) — 나오기 전까지 `/answers/[answerId]/processing`은 `GET .../clip`을 2초 간격으로 폴링해서 완료를 감지함
- `GET /api/v1/answers/{answer_id}/clip`이 미완료 상태일 때 정확히 어떤 응답(404 등)을 주는지 미확인 — 현재는 "실패하면 아직 처리 중"으로 취급
- `GET /api/v1/clips` 응답에 `title`/`familyMemberRole`/`familyMemberName`/`questionCount` 필드가 실제로 포함되는지 미확인 (`src/lib/api/clips.ts`의 `DiaryEntry`에 옵셔널로 추정 반영). 그룹 헤더(월)와 "오늘/어제/N일 전" 상대 날짜 표기도 백엔드가 별도 그룹 구조를 주는지, 프론트가 `submittedAt` 하나로 직접 계산해야 하는지 확인 필요 — 현재는 후자로 구현
- F-15의 "← 뒤로가기"는 F-06(받은 질문 · 답변 준비)이 아직 없어 임시로 `router.back()`만 호출함. F-06 라우트가 생기면 `questionSendId` 기준으로 그쪽으로 보내야 함
- F-15의 "권한 허용 방법" 버튼은 목적지/콘텐츠 미정으로 아직 no-op 상태
