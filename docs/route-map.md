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
| 8 | AI 처리 상태 (submitted→processing→completed/failed) | 별도 화면 없음. 네컷 그리드/상세에서 `status`로 표현 | Supabase Realtime `family:{family_id}` 채널의 `answer_status_updated` 이벤트 | 미구현 |
| 9 | 네컷 그리드 (날짜+가족 단위) | `/diary` | `GET /api/v1/clips` | 미구현 |
| 10 | 컷 상세 (영상/명대사/요약) | `/diary/[answerId]` | `GET /api/v1/answers/{answer_id}/clip` | 미구현 |
| – | 설정 | `/settings` | 문서 확인 필요 | 미구현 |

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
- 질문을 자녀가 부모에게 "보내는" 쪽 API (Answer API 문서는 수신자 측만 다룸)
- 로그인 토큰 발급/저장 방식 (`src/lib/api/client.ts`의 `getAccessToken`은 `localStorage` 하드코딩 임시 구현)
