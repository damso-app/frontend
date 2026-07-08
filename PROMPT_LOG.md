# Prompt Log

사용자가 지시한 프롬프트 기준으로 작업을 기록한다. 최신 항목이 위로 오도록 역순으로 쌓는다.

---

## 2026-07-08

- **프롬프트 요약**: (시딩 데이터로 F-06~F-11 실동작 검증 후) 테스트 데이터 지워줘 + 업로드(프론트→GCS) 플로우도 실제로 되는지 확인해줘
- **작업 구현 요약**: 로컬 DB에 시딩했던 테스트 유저/질문/답변/클립을 전부 삭제해 원복. 이어서 F-07 답변 제출(업로드 URL 발급→GCS PUT→제출)을 fake camera로 실제 구동해 GCS 서명 URL의 Content-Type 서명 검증에서 실패 원인이 될 뻔한 버그 2건 발견 및 수정: (1) `MediaRecorder`의 `video/webm;codecs=vp9,opus`를 그대로 보내 백엔드가 415 반환 → 코덱 파라미터 제거 후 전송, (2) GCS PUT의 `Content-Type` 헤더가 서명값과 다를 수 있는 위험 → 업로드 URL 발급 때 쓴 값을 그대로 PUT에도 사용하도록 수정. 실제 GCS 오브젝트 생성까지 확인 후 다시 삭제
- **변경점**: `src/app/questions/[questionSendId]/record/page.tsx`, `src/lib/api/answers.ts`(`uploadAnswerVideo` 시그니처 변경) 수정, `docs/route-map.md`에 버그 내용 기록

## 2026-07-08

- **프롬프트 요약**: 백엔드 로컬 서버 띄웠으니 F-06~F-11 연동 동작하는지 체크해줘
- **작업 구현 요약**: 로컬 백엔드(`/openapi.json` + 실제 호출)로 실제 응답 스키마를 확인한 결과, `GET /clips`가 flat 배열이 아니라 `{groups:[{date,clips}]}`, `GET /answers/questions/{id}`가 `sender.displayName`/`questionText`/`read` 등 이전 추정과 다른 필드명을 쓰는 등 여러 불일치를 발견. `src/lib/api/questions.ts`, `clips.ts`, `answers.ts`와 F-06/F-09/F-10/F-11 페이지를 실측 스키마에 맞게 전면 수정. F-10/F-11 라우트를 `/diary/[answerId]`→`/diary/[date]`, `/diary/[answerId]/[cutAnswerId]`→`/diary/[date]/[answerId]`로 변경(실제 그룹 키가 answerId가 아니라 date였음). F-11의 "질문" 카드는 원본 질문 텍스트를 반환하는 API가 없어 제거
- **변경점**: `src/lib/api/{questions,clips,answers}.ts` 스키마 수정, `src/app/diary/page.tsx` 재작성, `src/app/diary/[answerId]` → `src/app/diary/[date]`로 라우트 이동+재작성, `src/app/questions/[questionSendId]/page.tsx` 필드명 수정, `docs/route-map.md`에 실측 스키마 섹션 추가

## 2026-07-08

- **프롬프트 요약**: F-10/F-11 회고록 네컷 묶음·컷 상세 화면 구현 (Figma node-id 68:42, 68:74 기준)
- **작업 구현 요약**: F-10(네컷 묶음 보기: 2x2 미니 컷 그리드, "새 질문 만들기"/"목록으로") 및 F-11(컷 상세: 자동 반복 영상, 질문/AI 요약/한마디 카드, 이전·다음 질문 이동) 구현. 백엔드에 그룹-내 컷 배열 API가 없어 `DiaryEntry.cuts`를 추정 필드로 추가하고, 없으면 entry 1개를 컷 1개짜리 그룹으로 취급하는 폴백(`getFourCutClips`) 적용
- **변경점**: `src/app/diary/[answerId]/page.tsx`, `src/app/diary/[answerId]/[cutAnswerId]/page.tsx` 추가, `src/lib/api/clips.ts`에 `FourCutClip`/`getFourCutClips` 추가, `src/lib/api/answers.ts`의 `AnswerClip`에 `question` 추정 필드 추가, `docs/route-map.md` 갱신

## 2026-07-08

- **프롬프트 요약**: (다른 브랜치에 F-06 작업 없는지 확인 후) F-06 받은 질문 · 답변 준비 화면 구현 (Figma node-id 65:80 기준)
- **작업 구현 요약**: F-06 화면 구현. 받은 질문 상세(보낸 사람·질문 텍스트), 답변 팁/프라이버시 안내 카드, "질문에 답변하기" 버튼(F-07로 이동). F-15의 뒤로가기 TODO를 이 라우트로 연결
- **변경점**: `src/app/questions/[questionSendId]/page.tsx`, `src/lib/api/questions.ts` 추가, `src/app/questions/[questionSendId]/record/permission/page.tsx` 뒤로가기 수정, `docs/route-map.md` 갱신

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
