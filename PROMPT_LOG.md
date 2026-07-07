# Prompt Log

사용자가 지시한 프롬프트 기준으로 작업을 기록한다. 최신 항목이 위로 오도록 역순으로 쌓는다.

---

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
