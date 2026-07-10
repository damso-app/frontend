# Prompt Log

사용자가 지시한 프롬프트 기준으로 작업을 기록한다. 최신 항목이 위로 오도록 역순으로 쌓는다.

---

## 2026-07-10

- **프롬프트 요약**: 질문→목록→영상답변→제출→AI처리→다이어리→상세 전체 플로우 라우팅 연결 검토
- **작업 구현 요약**: 전체 화면(F-05~F-11)의 라우팅/API 시그니처를 코드로 추적해 연결 자체는 정상임을 확인. 그 과정에서 `next.config.ts`/`src/lib/api/client.ts`가 `NEXT_PUBLIC_API_BASE_URL`을 요구하는데 `.env`엔 옛 이름 `NEXT_PUBLIC_API_URL`만 있어 `next build`가 config 로드 단계에서 즉시 실패하는 치명적 문제 발견(실제 빌드로 재현 확인) — `.env` 이름 수정, Vercel 프로젝트 환경변수도 동일하게 바꿔야 함을 안내. 그 외 자잘한 문제 3건 수정: (1) `/questions/new` BottomNav가 `activeId="home"`으로 잘못 강조되던 것 `"qna"`로 수정 (2) `/questions/{id}` 상세에서 이미 답변/취소/만료된 질문일 때 버튼만 비활성화되고 이유가 안 보이던 것에 안내 문구 추가 (3) `getAnswerClip`이 응답을 무검증 캐스팅만 하던 것을 다른 정규화 함수들과 같은 패턴(`normalizeAnswerClip`)으로 방어적 파싱하도록 변경
- **변경점**: `.env`(gitignore, 로컬만), `src/app/questions/new/page.tsx`, `src/app/questions/[questionSendId]/page.tsx`, `src/lib/api/answers.ts` 수정

## 2026-07-10

- **프롬프트 요약**: 라이브 백엔드에 `videoDurationSeconds` 응답 필드가 실제로 추가됐는지 재확인 후 F-10에 반영
- **작업 구현 요약**: 배포된 백엔드 `/openapi.json`을 재조회해 `ClipDetailResponse`에 `videoDurationSeconds`가 추가된 것 확인(직전 확인 시점엔 없었음 — 배포 반영 타이밍 차이였음). `AnswerClip` 타입에 `videoDurationSeconds: number | null` 추가하고, F-10 미니컷 카드에 제목 아래 "MM:SS" 형식으로 영상 길이 표시
- **변경점**: `src/lib/api/answers.ts`, `src/app/diary/[date]/page.tsx`, `docs/route-map.md` 수정

## 2026-07-10

- **프롬프트 요약**: `video_duration_seconds` 응답 노출 여부 확인 + `/questions` 목록 빈 상태에 "가족에게 질문 만들기" CTA 추가
- **작업 구현 요약**: `video_duration_seconds`는 `POST /api/v1/answers` 제출 시 입력으로만 쓰이고 `GET /api/v1/clips`/`GET /api/v1/answers/{id}/clip` 어디에도 응답 필드로 없음을 확인 — 필요한 스펙(`GET .../clip`에 `videoDurationSeconds` 추가)을 `docs/route-map.md`에 이미 기록해둔 항목과 함께 정리. `/questions` 받은 질문 목록의 빈 상태 카드("아직 받은 질문이 없어요")에 `/questions/new`로 이동하는 "가족에게 질문 만들기" 버튼 추가
- **변경점**: `src/app/questions/page.tsx` 수정

---

## 2026-07-10

- **프롬프트 요약**: F-10(Figma node-id 68:42) 화면과 실제 구현 차이 확인 후 수정
- **작업 구현 요약**: Figma 대비 차이 2건 확인 — (1) 상단 칩이 Figma는 "답변자 role"+"연월", 코드는 "답변 N개"+"전체 날짜"였음. role 칩은 `GET /api/v1/clips`/`GET /api/v1/answers/{id}/clip` 어디에도 답변자 role 필드가 없어 프론트만으로 불가 → 날짜 칩만 연월(`2026.07`) 포맷으로 수정하고 role 칩은 보류. (2) 미니컷 카드에 Figma는 제목 아래 영상 길이("00:42")도 표시하는데 `AnswerClip`에 duration 필드가 없어 표시 불가 — 보류. 두 누락 필드는 `docs/route-map.md`에 백엔드 요청 필요 항목으로 기록
- **변경점**: `src/app/diary/[date]/page.tsx`(날짜 칩 포맷 변경), `docs/route-map.md` 수정

## 2026-07-10

- **프롬프트 요약**: BottomNav에 작은 아이콘 추가 (이모지 대신 flaticon류 일반 SVG 스타일)
- **작업 구현 요약**: `BottomNav`가 이미 지원하던 `icon?: ReactNode` prop을 채워넣음. 새 아이콘 컴포넌트를 만들지 않고 이미 의존성에 있던 `lucide-react`(Button.tsx 주석의 "e.g. Lucide icon" 컨벤션과 일치)를 사용: 홈=`Home`, 질문&답변=`MessageCircleQuestion`, 다이어리=`BookOpen`, 설정=`Settings`, 전부 `size={14}`. 7개 화면의 중복된 `NAV_ITEMS` 배열 각각에 동일하게 적용
- **변경점**: `src/app/diary/page.tsx`, `src/app/diary/[date]/page.tsx`, `src/app/diary/[date]/[answerId]/page.tsx`, `src/app/answers/[answerId]/processing/page.tsx`, `src/app/questions/[questionSendId]/page.tsx`, `src/app/questions/[questionSendId]/record/page.tsx`, `src/app/questions/[questionSendId]/record/permission/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 질문→답변 플로우 라우팅 구조 전수 검토 후 발견한 문제 중 2건 수정 (①`/questions` 부재는 보류, ②처리완료 화면의 "답변 영상 보기" 잘못된 경로, ③전 화면 BottomNav `onChange` 미연결)
- **작업 구현 요약**: ② processing 페이지가 폴링하는 `getClipGrid()` 결과에서 완료된 answerId가 속한 `date`를 `completedDate` state로 저장해두고, "답변 영상 보기"가 `/diary/${answerId}`(존재하지 않는 라우트) 대신 실제 상세 라우트인 `/diary/${completedDate}/${answerId}`로 이동하도록 수정. ③ F-06/F-07/F-15/F-08/F-09/F-10/F-11 7개 화면 전부 `BottomNav`에 `onChange`가 연결 안 돼 하단 탭이 무반응이던 문제를, 각 파일에 `NAV_ROUTES`(home→`/`, qna→`/questions`, diary→`/diary`, settings→`/settings`) 매핑을 추가해 해결. `/questions`, `/settings`는 아직 라우트가 없어 그 두 탭은 여전히 404이지만(①로 보류), 나머지 탭 이동은 정상 동작
- **변경점**: `src/app/answers/[answerId]/processing/page.tsx`, `src/app/diary/page.tsx`, `src/app/diary/[date]/page.tsx`, `src/app/diary/[date]/[answerId]/page.tsx`, `src/app/questions/[questionSendId]/page.tsx`, `src/app/questions/[questionSendId]/record/page.tsx`, `src/app/questions/[questionSendId]/record/permission/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 코드리뷰 지적 3건 수정 — (3) failed 상태를 프론트에서 구분 못 함, (4) 0초 녹화가 검증 없이 제출됨, (5) 포괄적 catch가 409/415/422를 다 뭉갬
- **작업 구현 요약**: (3) `/v1/clips`가 이미 내려주는 `status`(failed 포함)를 다이어리 목록/그룹 화면에서 반영해 "실패" 배지·라벨 추가, processing 페이지는 완료 전 항상 404인 `getAnswerClip` 대신 `/v1/clips`에서 해당 answerId의 실제 status를 폴링해 완료/실패를 구분(네트워크 오류는 콘솔 로그만 남기고 상태는 단정하지 않음). (4) 녹화 시작~정지 타임스탬프로 실제 길이를 계산해 1초 미만이면 제출 화면으로 넘어가지 않고 재촬영 안내. (5) `ApiError.status`로 409(이미 제출·재시도 UI 자체 제거하고 질문 목록으로 유도)/415(형식 오류)/422(정보 오류)를 구분한 메시지로 분기
- **변경점**: `src/app/diary/page.tsx`, `src/app/diary/[date]/page.tsx`, `src/app/answers/[answerId]/processing/page.tsx`, `src/app/questions/[questionSendId]/record/page.tsx` 수정

## 2026-07-08

- **프롬프트 요약**: 질문 답변 화면의 답변 팁과 프라이버시 블록을 베이지색으로 변경
- **작업 구현 요약**: 받은 질문 상세 화면의 답변 팁/프라이버시 카드 배경을 cream 계열 베이지 토큰으로 지정
- **변경점**: `src/app/questions/[questionSendId]/page.tsx`, `PROMPT_LOG.md` 수정

---

## 2026-07-10

- **프롬프트 요약**: 질문&답변 상세 화면의 블록 아이콘과 답변 대기 표시 제거
- **작업 구현 요약**: 받은 질문 상세의 질문/답변 팁/프라이버시 블록 좌측 표시를 빨간 점으로 통일하고, 질문 카드 우측 상태 배지를 제거
- **변경점**: `src/app/questions/[questionSendId]/page.tsx`, `PROMPT_LOG.md` 수정

---

## 2026-07-10

- **프롬프트 요약**: 질문 만들기와 질문&답변 탭의 진입 플로우 분리
- **작업 구현 요약**: 질문&답변 탭(`/questions`)은 받은 질문 리스트 전용으로 정리하고, 질문 작성 화면(`/questions/new`)은 홈 화면 "질문 만들기"에서 들어오는 플로우로 하단 탭 활성 상태와 라우트 문서를 갱신
- **변경점**: `src/app/questions/page.tsx`, `src/app/questions/new/page.tsx`, `docs/route-map.md`, `PROMPT_LOG.md` 수정

---

## 2026-07-10

- **프롬프트 요약**: 홈 화면 가족 상태 chip 색상에서 답변 대기/연결됨 색상 교체 및 연결됨 글씨 흰색 적용
- **작업 구현 요약**: 답변 대기는 coral 계열 빨간색으로, 연결됨은 sage 계열 초록색 배경과 흰색 글씨로 표시되도록 색상 매핑 수정
- **변경점**: `src/app/page.tsx`, `PROMPT_LOG.md` 수정

---

## 2026-07-10

- **프롬프트 요약**: questions/new 화면에서 받는 사람 UI 통일, AI 추천 질문 3개 표시, 추천 질문 선택 표시 변경
- **작업 구현 요약**: 받는 사람/질문 테마 선택 UI를 같은 블록형 버튼으로 통일하고, 추천 질문 요청 개수를 3개로 명시, 추천 질문 좌측 아이콘을 빨간 점으로 교체 및 선택 시 sage 계열 초록색으로 표시
- **변경점**: `src/app/questions/new/page.tsx`, `PROMPT_LOG.md` 수정

---

## 2026-07-10

- **프롬프트 요약**: 홈 화면의 서로에게 남길 말 카드에서 답변 촬영 버튼과 시간 텍스트 정렬 조정
- **작업 구현 요약**: 답변 촬영 버튼과 수신 시간을 같은 하단 행에 배치하고 간격을 조정
- **변경점**: `src/app/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 빌드 오류 원인 확인 및 질문 녹화 화면의 누락 API import 문제 해결
- **작업 구현 요약**: 이미 구현되어 있던 받은 질문 상세 API(`getReceivedQuestionDetail`)를 녹화 화면에서 사용하도록 import 경로와 타입 import를 정리
- **변경점**: `src/app/questions/[questionSendId]/record/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 홈 화면 상단 설명 한 줄 표시, 가족 상태 chip 색상 조건, 하단 CTA 버튼 동일 크기 수정
- **작업 구현 요약**: 홈 화면의 설명 문구 nowrap 스타일 적용, 가족 chip 라벨 기반 색상 유틸 추가 및 답변 대기 표시 조건 보강, 질문 만들기/다이어리 보기 버튼을 동일한 flex row 크기로 조정
- **변경점**: `src/app/page.tsx` 수정

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
