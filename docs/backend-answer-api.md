# Answer API

> 2026-07-07 기준 실제 코드(`app/api/v1/answers.py`, `app/api/v1/clips.py`)를 바탕으로 정리. 상세 요청/응답 스키마는 백엔드 `docs/API_DRAFT.md` 참고, 여긴 개요만.
>
> 출처: 백엔드 팀 Notion 문서.

## 인증

모든 엔드포인트는 `Authorization: Bearer {access_token}` 필요 (ai-callback 제외).

## 1. 영상 업로드 URL 발급

`POST /api/v1/answers/upload-url`

질문에 답변할 영상을 올리기 전, GCS presigned PUT URL을 먼저 발급받는다. 클라이언트는 이 URL로 영상을 GCS에 직접 업로드하고(백엔드 경유 안 함), 완료 후 2번 API로 메타데이터만 제출한다.

- 요청: `questionSendId`, `videoMimeType`
- 응답: `uploadUrl`, `expiresAt`

## 2. 답변 제출

`POST /api/v1/answers`

영상 업로드가 끝난 뒤 메타데이터를 제출해 답변을 확정한다. 저장과 동시에 AI 서버로 처리 요청을 비동기로 던진다(fire-and-forget).

- 요청: `questionSendId`, `videoMimeType`, `videoDurationSeconds`, `videoSizeBytes`
- 응답: `answerId`, `questionSendId`, `status`(`submitted`), `submittedAt`
- 같은 `questionSendId`로 중복 제출 불가, 수신자 본인만 제출 가능

## 3. 받은 질문 목록 / 상세 / 읽음 처리

- `GET /api/v1/answers/questions` — 받은 질문 목록
- `GET /api/v1/answers/questions/{question_send_id}` — 질문 상세
- `PATCH /api/v1/answers/questions/{question_send_id}/read` — 읽음 처리

## 4. 네컷 그리드

`GET /api/v1/clips`

가족의 답변을 날짜별로 그룹핑해 그리드로 반환한다. 별도 그리드/클립 테이블 없이 `answers`를 `family_id` + 날짜로 그룹핑한 결과.

- 응답: 날짜별 그룹 목록, 각 그룹은 `answerId` / `status` / `thumbnailUrl` 배열

## 5. 클립(답변 처리 결과) 상세

`GET /api/v1/answers/{answer_id}/clip`

AI 처리가 끝난 답변의 상세(영상, 전사, 요약, 명대사 등)를 조회한다. `status`가 `completed`가 아니면 아직 클립이 없다는 뜻.

- 응답: `videoUrl`, `thumbnailUrl`, `transcript`, `transcriptSegments`, `title`, `quote`, `oneLineSummary`, `emotionTags`, `fourcutTitle`

## 6. AI 콜백 (내부 전용)

`POST /api/v1/answers/{answer_id}/ai-callback`

AI 서버가 처리 완료/실패 시 호출. 프론트/클라이언트는 호출하지 않는다. `callbackToken`(백엔드 발급 JWT)으로 인증.

- 성공 시: `video_clips` insert + `answers.status = completed`를 같은 트랜잭션으로 처리 후 Supabase Realtime Broadcast(`family:{family_id}` 채널, `answer_status_updated` 이벤트)로 알림
- 실패 시: `answers.status = failed`, `retryable`/`fallbackUsed` 기록
- 이미 처리된 answer에 대한 재호출은 idempotent하게 무시

## 상태 흐름

`submitted → processing → completed / failed`

진행률 세부 조회, 콜백 유실 시 자동 복구는 아직 미구현 (추후 실제 AI 연동 검증 시점에 처리 예정).

## 프론트 연동 메모

- 영상 답변 기록 화면(`src/app/record`)의 제출 흐름은 **1번(업로드 URL 발급) → GCS PUT 업로드 → 2번(메타데이터 제출)** 순서로 구현해야 한다. 지금은 `handleSubmit`이 콘솔 로그만 찍는 스텁 상태.
- `completed` 여부는 폴링이 아니라 Supabase Realtime(`family:{family_id}` 채널, `answer_status_updated`)으로 받는다 — 네컷 그리드/상세 화면에서 상태 갱신 시 폴링 로직을 넣지 않는다.
- 질문을 "보내는" 쪽(자녀 → 부모) API는 이 문서에 없음 — 별도 Question API 문서 확인 필요.
