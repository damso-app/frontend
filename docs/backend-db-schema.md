# 담소 DB 테이블 구조 (AI 연동 기준)

> 출처: 백엔드 팀 Notion 문서. 화면 개발 시 `answers`/`video_clips`의 상태값·필드명을 참고해 프론트 타입을 맞춘다.

## 1. 저장 원칙

- 원본 영상 파일 blob은 DB에 저장하지 않는다.
- `answers`는 제출된 답변 원본과 AI 처리 상태(coarse)를 저장한다.
- `video_clips`는 프론트에서 직접 사용하는 AI 가공 결과만 저장한다.
- `video_clip_ai_results`는 pipelineResults 전체를 snapshot으로 저장한다.
- `interviewContext`는 submit 시점에 한 번 조립해서 `answers.ai_input_context`에 저장한다.
- AI 세부 처리 상태(ai_status, ai_progress 등)는 저장하지 않는다. Supabase Realtime으로 완료 알림 처리.

---

## 2. answers

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT PK | N | 내부 PK |
| question_send_id | BIGINT FK | N | 질문 발송 추적. MVP는 발송당 답변 1개 |
| user_id | BIGINT FK | N | 답변자. MVP 이후 쿼리 최적화 시점 재검토 |
| family_id | BIGINT FK | N | 네컷 그리드 조회용 비정규화 복사 |
| video_origin_url | TEXT | Y | GCP Cloud Storage 원본 경로 |
| video_mime_type | VARCHAR(100) | Y | 예: video/mp4 |
| video_duration_seconds | INTEGER | Y | 영상 길이 (초) |
| video_size_bytes | INTEGER | Y | 파일 크기 |
| status | answer_status | N | submitted / processing / completed / failed |
| ai_job_id | VARCHAR(100) | Y | AI-008 jobId. 재처리 추적용 |
| ai_retryable | BOOLEAN | N | AI-010 retryable. 기본값 false |
| ai_fallback_used | BOOLEAN | N | AI-010 fallbackUsed. 기본값 false |
| ai_input_context | JSONB | Y | submit 시점 interviewContext snapshot |
| submitted_at | TIMESTAMPTZ | N | 제출 시각 |
| created_at | TIMESTAMPTZ | N | 생성 시각 |
| updated_at | TIMESTAMPTZ | N | 수정 시각 |
| deleted_at | TIMESTAMPTZ | Y | soft delete |

### ai_input_context 구조

```json
{
  "send_user": "최대현",
  "send_role": "둘째 아들",
  "question": "자녀에게 들었던 말 중 기억에 남는 순간은?",
  "receive_user": "최기섭",
  "receive_role": "아버지",
  "mediaPath": "gs://bucket/videos/ans_001.mp4"
}
```

---

## 3. video_clips

목적: 프론트에서 직접 사용하는 AI 가공 결과. AI 처리 완료된 것만 INSERT. status 컬럼 없음.

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT PK | N | 내부 PK |
| answer_id | BIGINT FK | N | 원본 답변. MVP는 답변당 클립 1개 |
| thumbnail_url | TEXT | Y | ffmpeg 썸네일 추출. 네컷 그리드 표시용 |
| hls_url | TEXT | Y | ffmpeg HLS 트랜스코딩. 스트리밍 재생용 |
| transcript | TEXT | Y | AI-002 전체 전사 텍스트 |
| transcript_segments | JSONB | Y | AI-002 segments. 영상 자막 싱크용 |
| title | VARCHAR(200) | Y | AI-003 diaryTitle. 네컷 카드 제목 |
| one_line_summary | TEXT | Y | AI-003 oneLineSummary. 컷 상세 AI 요약 |
| quote | TEXT | Y | AI-004 representativeQuote. 명대사 |
| emotion_tags | JSONB | Y | AI-005 emotionTags |
| fourcut_title | VARCHAR(200) | Y | AI-009 fourCutTitle. 네컷 묶음 제목 |
| created_at | TIMESTAMPTZ | N | 생성 시각 |
| updated_at | TIMESTAMPTZ | N | AI 결과 갱신 시각 |

---

## 4. video_clip_ai_results (신규)

목적: AI 서버 pipelineResults 전체 snapshot. 재처리/디버깅/추가 기능 구현용.

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | BIGINT PK | N | 내부 PK |
| video_clip_id | BIGINT FK | N | 원본 클립 |
| ai_raw_response | JSONB | N | pipelineResults 전체 snapshot |
| created_at | TIMESTAMPTZ | N | 생성 시각 |

---

## 5. API → answers 저장 매핑

| API field | answers column |
| --- | --- |
| interviewContext (submit 시점 조립) | ai_input_context |
| pipelineResults.AI-008.jobId | ai_job_id |
| pipelineResults.AI-008.status | status (completed/failed로 매핑) |
| pipelineResults.AI-010.retryable | ai_retryable |
| pipelineResults.AI-010.fallbackUsed | ai_fallback_used |

---

## 6. API → video_clips 저장 매핑

| API field | video_clips column |
| --- | --- |
| transcript | transcript |
| segments | transcript_segments |
| pipelineResults.AI-003.diaryTitle | title |
| pipelineResults.AI-003.oneLineSummary | one_line_summary |
| pipelineResults.AI-004.representativeQuote | quote |
| pipelineResults.AI-005.emotionTags | emotion_tags |
| pipelineResults.AI-009.fourCutTitle | fourcut_title |
| ffmpeg 썸네일 추출 (Leo 담당) | thumbnail_url |
| ffmpeg HLS 트랜스코딩 (Leo 담당) | hls_url |

---

## 7. 설계 메모

- `answers.status`는 coarse 상태만. AI-008 세부 상태 저장 안 함.
- AI 처리 완료 알림은 Supabase Realtime. polling 없음.
- AI 처리 방식: GCP Pub/Sub job 등록 → AI Worker consume → App Server callback → Supabase Realtime broadcast
- `video_clips`에 없는 나머지 pipelineResults는 `video_clip_ai_results.ai_raw_response`에 전부 저장.
- MVP 이후 공유 기능 추가 시 ai_raw_response에서 AI-009 shareTitle 등 꺼내 쓰면 됨.
- user_id 비정규화는 MVP 유지, 쿼리 최적화 시점에 재검토.
