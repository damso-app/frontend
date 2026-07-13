# Prompt Log

사용자가 지시한 프롬프트 기준으로 작업을 기록한다. 최신 항목이 위로 오도록 역순으로 쌓는다.

---

## 2026-07-13

- **프롬프트 요약**: 새로 추가한 favicon(`damso_favicon.svg`)과 로고(`logo.svg`) 적용 — favicon 우선 적용 후, 로고를 헤더 우측에 배치
- **작업 구현 요약**: Next.js 기본 `favicon.ico`(스톡 로고)를 삭제하고 `damso_favicon.svg`를 `src/app/icon.svg`로 등록해 앱 라우터가 자동으로 favicon 태그를 생성하도록 함. 로고는 온보딩/로그인 플로우 5개 화면(`OnboardingShell`), 메인 탭 4개 화면(홈/다이어리/질문&답변/설정), 다이어리·질문 상세, 질문 작성/녹화/권한 안내, 설정 데이터 관리, AI 처리중 화면, 가족 생성/참여 관련 화면(공용 `PhoneCard`)까지 전체 페이지 헤더에 반영. 뒤로가기 버튼이 있는 화면은 버튼 줄은 그대로 두고 eyebrow+타이틀 블록만 `flex` 행으로 감싸 로고를 eyebrow 줄 높이에 맞춰 우측 정렬. 크기는 사용자와 1배/1.2배/1.5배 비교 후 1.2배(84x38px)로 확정. Playwright 스크린샷으로 여러 화면 검증
- **변경점**: `src/app/icon.svg` 추가, `src/app/favicon.ico` 삭제, `public/damso_favicon.svg`·`public/logo.svg` 추가, `src/components/onboarding/OnboardingShell.tsx`·`src/components/onboarding/FamilyInviteScreen.tsx` 및 `page.tsx`(홈)/`diary/page.tsx`/`diary/[date]/page.tsx`/`diary/[date]/[answerId]/page.tsx`/`questions/page.tsx`/`questions/[questionSendId]/page.tsx`/`questions/[questionSendId]/record/page.tsx`/`questions/[questionSendId]/record/permission/page.tsx`/`questions/new/page.tsx`/`settings/page.tsx`/`settings/data/page.tsx`/`answers/[answerId]/processing/page.tsx` 수정

## 2026-07-12

- **프롬프트 요약**: 배포된 사이트에서 약관 버튼을 눌러도 약관 내용이 뜨지 않는 문제 수정
- **작업 구현 요약**: 약관 동의 화면에서 체크박스 로딩/저장 비활성 상태가 오른쪽 "약관" 버튼까지 같이 막아, 약관 조회 API가 늦거나 실패하면 내용을 열람할 수 없던 구조를 수정. `AgreementCheckbox`에 `actionDisabled` prop을 추가해 체크박스 비활성화와 약관 보기 버튼 비활성화를 분리하고, `/agreements`에서는 로딩 중에도 약관 모달을 열 수 있도록 연결
- **변경점**: `src/components/onboarding/AgreementCheckbox.tsx`, `src/app/agreements/page.tsx`, `PROMPT_LOG.md` 수정

- **프롬프트 요약**: 약관 동의 화면의 오른쪽 약관 버튼을 누르면 서비스에 맞게 작성된 약관 내용을 볼 수 있도록 연결
- **작업 구현 요약**: `AgreementCheckbox`에 오른쪽 버튼 클릭 핸들러(`onAction`)를 받을 수 있게 추가하고, `/agreements` 화면에 각 필수 동의 항목별 상세 약관 데이터를 작성. 담소의 카카오 로그인, 가족 초대·합류, 질문 발송, 영상 답변, AI 처리(`submitted`/`processing`/`completed`/`failed`), 네컷 다이어리·상세 기록 흐름을 반영해 서비스 이용약관, 개인정보 처리 동의, 카메라·마이크 권한 안내, 데이터 활용 동의 전문을 구성. 오른쪽 "약관" 버튼을 누르면 디자인 시스템 `Modal`로 해당 약관을 스크롤 가능한 형태로 표시하고 확인 버튼으로 닫히도록 구현
- **변경점**: `src/app/agreements/page.tsx`, `src/components/onboarding/AgreementCheckbox.tsx`, `PROMPT_LOG.md` 수정

- **프롬프트 요약**: 온보딩 슬라이드 전환 간격을 1초→5초로 변경, 두 슬라이드에 안내 문구(제목+설명) 톤으로 캡션 추가, 상단 eyebrow 문구를 "살아있는 회고록"에서 "담소"로 변경
- **작업 구현 요약**: `SLIDE_INTERVAL_MS`를 5000으로 변경. 슬라이드 2 제목 "영상으로 답하는 순간"을 "질문에 영상으로 답해요"로 바꾸고 그 아래 `text-caption` 스타일로 "카메라로 언제 어디서든 편하게 답할 수 있어요." 설명을 추가. 슬라이드 1("오늘의 가족 기록")에도 같은 톤으로 "가족과 나눈 질문과 답을 네컷으로 모아봐요." 설명을 추가해 두 슬라이드가 제목+설명의 동일한 안내 문구 패턴을 갖도록 통일. `OnboardingShell`의 `eyebrow` prop을 "담소"로 변경. Playwright 스크린샷으로 두 슬라이드 모두 최종 확인
- **변경점**: `src/app/onboarding/page.tsx` 수정
- **프롬프트 요약**: 온보딩 화면의 네컷 그리드 박스를 1초마다 슬라이드로 자동 순환시켜 두 번째 화면(`public/onboarding.png`)과 번갈아 보이도록 처리
- **작업 구현 요약**: `activeSlide` state를 `setInterval(1000ms)`로 0/1 토글하고, 두 카드를 폭 200%짜리 flex 트랙에 나란히 배치한 뒤 `transform: translateX(0%/-50%)`에 `transition: transform 500ms ease`를 걸어 가로 슬라이드 전환 구현. 처음엔 두 번째 화면을 기존 `OnboardingInfoCard`(질문마다 한 컷의 영상 안내 카드)로 잘못 넣었다가, 사용자가 실제로 원한 건 별도로 넣어둔 `public/onboarding.png`(영상 답변 녹화 화면 목업)라는 걸 확인 후 슬라이드 2를 이 이미지로 교체(네컷 셀과 동일하게 `aspectRatio: 1/1` + `backgroundSize: cover`). 기존 안내 카드는 캐러셀 밖으로 빼서 두 슬라이드 모두에서 항상 보이는 고정 요소로 유지. Playwright 스크린샷 2장(0.2s/1.3s 대기)으로 두 슬라이드가 정상 전환되는 것 확인
- **변경점**: `src/app/onboarding/page.tsx` 수정
- **프롬프트 요약**: 온보딩 네컷 미리보기 그리드에 `public`에 넣어둔 실제 가족 썸네일(son/mom/grandfather/daughter) 적용 — 엄마 좌상단, 아들 우상단, 할아버지 좌하단, 딸 우하단 배치
- **작업 구현 요약**: `public/mom (1).png` 등 공백·괄호가 섞인 원본 파일명은 `url()` 참조 시 문제될 수 있어 `mom.png`/`son.png`/`grandfather.png`/`daughter.png`로 정리(rename). `cuts` 배열(2x2 그리드, row-major 순서라 첫 번째가 좌상단)에 `image` 필드를 추가해 mom→son→grandfather→daughter 순으로 배치하고, 셀 배경을 기존 단색(`--color-ink-900`)에서 `backgroundImage: url(cut.image)` + `backgroundSize: cover`로 교체해 실제 썸네일이 정사각형 셀을 채우도록 함
- **변경점**: `src/app/onboarding/page.tsx` 수정, `public/mom.png`·`public/son.png`·`public/grandfather.png`·`public/daughter.png` 추가(원본 공백 포함 파일명에서 rename)
- **프롬프트 요약**: 온보딩 화면(`/onboarding`)의 네컷 미리보기 그리드를 실제 네컷 묶음 보기(`/diary/[date]`, 10번 페이지)처럼 화면 크기에 맞춰 크게 보이도록 수정
- **작업 구현 요약**: 기존 셀은 고정 `minHeight: 148px` + 썸네일 박스(1/0.76 비율) + 하단 텍스트를 별도 블록으로 쌓는 구조라, 그리드 폭이 넓어져도 세로 길이가 늘어나지 않고 정사각형도 아니었음. `/diary/[date]`의 실제 클립 셀과 동일하게 셀 전체를 `aspectRatio: 1 / 1`(그리드 폭에 따라 자동으로 커지는 정사각형)로 바꾸고, 재생 버튼은 셀 중앙에 절대 위치로 겹치고, 제목/길이 텍스트는 하단 그라데이션 오버레이 위에 흰 글씨로 얹는 방식으로 재구성해 실제 페이지와 같은 비주얼이 되도록 함
- **변경점**: `src/app/onboarding/page.tsx` 수정
- **프롬프트 요약**: 홈 화면 가족 연결 뱃지에서 "답변 대기" 상태 제거, "연결됨"/"연결 대기" 두 가지만 남기기
- **작업 구현 요약**: `getMemberChips`가 각 가족 구성원에게 보낸 질문 중 아직 답변 안 된 게 있으면 "답변 대기" 라벨(코랄 색상)을 붙이던 로직(`pendingResponseRoleSet` 계산 및 3개 분기 모두)을 제거하고, 연결 여부에 따라 "연결됨"/"연결 대기" 라벨만 반환하도록 단순화. `getFamilyChipStyle`의 "답변 대기" 전용 스타일 분기(코랄 배경)도 더 이상 쓰이지 않아 함께 제거
- **변경점**: `src/app/page.tsx` 수정

## 2026-07-12

- **프롬프트 요약**: AI 처리 화면 진행률이 실제 API `progress` 값을 반영하지 못하고 항상 시간 기반 추정치(1초마다 증가, 95%에서 정지)로만 표시되는 문제 수정, 콜백 대기 중(마무리 중) 상태 문구 변경
- **작업 구현 요약**: `getAnswerProgress` 폴링 응답의 `progress` 필드는 원래도 수신 즉시 `apiProgress`에 반영해 시간 기반 추정치(`fallbackProgress`, 최대 95%)를 덮어쓰도록 되어 있었음(실제 응답이 오기 전까지만 추정치 노출, 응답이 오면 바로 그 값으로 전환) — 코드 리뷰로 로직 자체는 정상 확인, `docs/route-map.md` 기준 `/v1/answers/{answer_id}/progress`가 실제 이 형식(`progress`/`currentStepLabel`/`estimatedRemainingSeconds`/`aiJobStatus`)으로 배포되어 있어 그대로 동작함. 추가로 AI 작업은 끝났지만 콜백(DB 반영)을 기다리는 "마무리 중" 상태일 때 진행바를 100%로 채우고, 안내 문구를 "AI가 완성해서 준비하고 있어요."에서 "AI가 답변을 정리해서 전달하고 있어요. 잠시만 기다려주세요."로 변경. 처리 중일 때 상단 고정 안내 문구("AI가 답변을 정리하는 동안 잠시만 기다려주세요. 30초 정도 소요됩니다.")는 요청대로 그대로 유지
- **변경점**: `src/app/answers/[answerId]/processing/page.tsx` 수정

## 2026-07-12

- **프롬프트 요약**: 앱 진입 시 온보딩 화면을 거치지 않고 바로 로그인 화면으로 넘어가던 문제 수정 (온보딩부터 보이도록)
- **작업 구현 요약**: 루트 페이지(`/`, 홈 화면)가 인증 여부와 무관하게 항상 `getHomeQuestionSummary()`를 먼저 호출했고, 미로그인 상태면 401 응답을 받은 뒤에야 `/login`으로 리다이렉트되던 것이 원인 — 온보딩 화면이 아예 노출되지 않았음. `useEffect` 시작 지점에서 `getAccessToken()`으로 토큰 존재 여부를 먼저 확인해, 토큰이 없으면 API 호출 없이 곧바로 `/onboarding`으로 리다이렉트하도록 수정. 온보딩 화면의 "시작하기" 버튼은 이미 `/login`으로 이동하도록 구현되어 있어 별도 수정 불필요
- **변경점**: `src/app/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: `/questions`에서 답변 완료된 항목을 눌러도 재답변 화면으로 넘어가던 문제 수정, 다이어리 영상 재생 시 소리가 안 나오는 문제 수정
- **작업 구현 요약**: `src/app/questions/page.tsx`의 질문 목록 카드에서 `status === "answered"`일 때 `onClick`을 아예 넘기지 않도록 변경(Card는 `onClick` 유무로 클릭 가능 여부를 판단하므로 hover 효과도 함께 사라짐). 상세 페이지(`/questions/[questionSendId]`)에 URL 직접 접근으로 우회하는 경우까지 막기 위해 `question.answered`면 "질문에 답변하기" 버튼 대신 비활성화된 "이미 답변을 완료했어요" 버튼을 노출하도록 방어 코드 추가. 다이어리 상세(`/diary/[date]/[answerId]`)의 `<video>` 태그에 `muted` 속성이 박혀 있고 `controls`가 없어 소리를 켤 방법이 없었던 것이 원인 — `autoPlay`/`loop`/`muted`를 제거하고 `controls`를 추가해 녹화 미리보기 화면과 동일한 방식으로 재생·음량 조절이 가능하도록 수정
- **변경점**: `src/app/questions/page.tsx`, `src/app/questions/[questionSendId]/page.tsx`, `src/app/diary/[date]/[answerId]/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 홈 화면 가족 연결 상태 옆에 새로고침 버튼 추가, 질문 미수신 시 하드코딩된 시간 노출 제거, 다이어리에서만 보이던 하단 네비게이션 아이콘이 다른 화면에서도 보이도록 수정, 네비게이션 아이콘·라벨을 세로 중앙 정렬로 변경
- **작업 구현 요약**: 홈 화면(`src/app/page.tsx`) 가족 멤버 칩 영역 옆에 `lucide-react`의 `RefreshCw` 아이콘 버튼을 추가하고 클릭 시 `getHomeQuestionSummary()`를 재호출해 갱신(회전 스피너로 로딩 표시). `pendingReceivedQuestion`이 없을 때도 `formatTime`이 "오늘 23:41분"이라는 목업 문자열을 반환하던 하드코딩을 제거하고, 받은 질문이 있을 때만 시간 텍스트를 렌더링하도록 변경. 하단 네비게이션 아이콘 버그의 원인은 각 페이지가 `NAV_ITEMS` 배열을 중복 정의하면서 홈(`/`)·`/questions`·`/questions/new` 3개 화면만 `icon` 필드를 빠뜨렸던 것 — `src/lib/navigation.tsx`에 `NAV_ITEMS`/`NAV_ROUTES`를 단일화해 모든 페이지가 이를 import하도록 정리해 재발을 막음. `BottomNav` 컴포넌트는 아이콘이 라벨 위, 라벨이 아래에 오도록 세로 중앙 정렬로 레이아웃 변경(가로 정렬 → `flexDirection: column`)
- **변경점**: `src/app/page.tsx`, `src/components/ui/navigation/BottomNav.tsx`, `src/lib/navigation.tsx`(신규), `src/app/questions/page.tsx`, `src/app/questions/new/page.tsx`, `src/app/settings/page.tsx`, `src/app/settings/data/page.tsx`, `src/app/diary/page.tsx`, `src/app/diary/[date]/page.tsx`, `src/app/diary/[date]/[answerId]/page.tsx`, `src/app/answers/[answerId]/processing/page.tsx`, `src/app/questions/[questionSendId]/page.tsx`, `src/app/questions/[questionSendId]/record/page.tsx`, `src/app/questions/[questionSendId]/record/permission/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 가족 생성 완료 후에도 "코드로 참여하기" 버튼이 남아있는 문제, 로딩 중 카카오초대 화면이 먼저 보였다가 미생성 화면으로 바뀌는 깜빡임 수정
- **작업 구현 요약**: `FamilyInviteScreen`을 `isReady`(가족 있음/없음) 기준 2가지 모습만 갖도록 정리. 가족이 이미 있는 상태(`ready`)에서는 다른 가족에 join할 수 없으므로(백엔드가 409로 막음) "코드로 참여하기" 버튼을 제거하고 "카카오톡으로 초대" 1개만 노출(그리드도 1열로 축소). 로딩 중(`checking`) 상태는 더 이상 별도 화면으로 취급하지 않고 "가족 없음" 화면과 동일하게 렌더링한 뒤 버튼만 비활성화해, 완료 화면이 먼저 그려졌다가 바뀌는 깜빡임을 제거. 초대받은 사람의 로그인 게이트(`FamilyCodeScreen`의 pending invite code 저장 → 로그인 강제 → 콜백 후 자동 복귀·join)는 기존 구현을 그대로 확인, 변경 없음
- **변경점**: `src/components/onboarding/FamilyInviteScreen.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 초대받은 사람이 약관 동의 화면에서 실제로 체크하지 않았는데도 이미 동의된 것처럼 보이는 문제 확인 및 수정
- **작업 구현 요약**: `src/app/agreements/page.tsx`의 체크박스 초기 상태(`initialChecked`)가 4개 필수 항목 중 3개를 기본값 `true`로 미리 체크해두고 있었음 — 서버 조회(`getUserAgreements`)가 성공하면 실제 상태로 덮어써지지만, 로딩 중 잠깐이나 조회 실패 시엔 이 잘못된 pre-checked 상태가 그대로 노출/유지돼 사용자가 실제로 검토·동의하지 않은 항목까지 체크된 것처럼 보임. `initialChecked`를 제거하고 전부 `false`인 `uncheckedAgreements`를 유일한 기본값으로 사용하도록 수정
- **변경점**: `src/app/agreements/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 가족 생성자가 초대 코드 공유 후 상대방이 실제로 연결됐는지 확인할 방법이 없고, 연결돼도 자동으로 홈 이동이 안 되는 문제 수정
- **작업 구현 요약**: `FamilyInviteScreen`이 `status === "ready"`(초대 코드 발급 완료, 공유 대기)일 때 3초 간격으로 `getMyOnboardingStatus()`를 폴링해 `familyConnected`/`onboardingCompleted`가 true가 되면 즉시 `/`(홈)으로 리다이렉트하도록 추가. 대기 중임을 알 수 있게 "⏳ 가족 연결 대기 중이에요. 상대방이 코드를 입력하면 자동으로 홈으로 이동해요." 안내 문구도 함께 표시
- **변경점**: `src/components/onboarding/FamilyInviteScreen.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: 백엔드 버그 리포트 반영 — 카카오 로그인 후 두 사용자가 각자 별도 가족을 자동 생성해 서로 연결이 영원히 실패(`POST /families/join` 409)하는 문제 수정
- **작업 구현 요약**: 원인 2가지 확인 후 수정. (1) `FamilyInviteScreen`(`/onboarding/family-connect`)이 `GET /families/me/invitation` 404(정상적인 "가족 없음" 상태)를 받으면 곧바로 `POST /families`를 자동 호출해 가족을 만들어버리던 로직 제거 — 대신 `"no-family"` 상태로 전환해 "가족 만들기"/"코드로 참여하기" 중 사용자가 명시적으로 선택하게 변경, 동시에 두 사람이 "가족 만들기"를 누르면 안 된다는 안내 문구 추가. (2) `src/lib/api/families.ts`의 `createFamily`/`joinFamily`가 401 외 모든 에러(409 포함)를 목(mock) 성공 응답으로 바꿔치기하던 try/catch 제거 — 이 때문에 `FamilyCodeScreen`에 이미 있던 409("이미 가족에 연결되어 있습니다") 안내 문구가 실제로는 화면에 뜨지 못하던 문제도 같이 해결됨
- **변경점**: `src/components/onboarding/FamilyInviteScreen.tsx`, `src/lib/api/families.ts` 수정

## 2026-07-10

- **프롬프트 요약**: 카카오톡 가족 초대 링크 수신자가 로그인·약관·역할 선택을 거쳐 자동으로 가족 연결 후 홈으로 이동하는 온보딩 플로우 구현
- **작업 구현 요약**: 초대 공유 URL을 `/onboarding/family-code/{inviteCode}` 형태로 생성하고 초대자 역할 힌트(`inviterRole`, 필요 시 `recommendedRole`)를 query로 포함. 링크 수신 시 초대 코드를 localStorage에 보관해 로그인/약관 이동 중에도 유지하고, 카카오 콜백과 약관 완료 후 `GET /users/me/onboarding` 기준으로 다음 온보딩 단계 분기. 역할 화면은 pending invite가 있으면 추천 역할을 기본 선택하고, 역할 저장 후 `POST /families/join`을 자동 호출해 홈으로 이동. 기존 동적 초대 라우트(`/family/invite/[inviteCode]`, `/family/join/[inviteCode]`, `/onboarding/family-code/[inviteCode]`)도 같은 자동 연결 플로우로 통일. 초대 코드 API 정규화와 역할 힌트 응답 필드 파싱을 추가하고, 빌드를 막던 질문 상세 JSX 닫힘/아이콘 import 오류도 함께 복구
- **변경점**: `src/components/onboarding/FamilyInviteScreen.tsx`, `src/components/onboarding/FamilyCodeScreen.tsx`, `src/app/auth/kakao/callback/CallbackClient.tsx`, `src/app/agreements/page.tsx`, `src/app/onboarding/role/page.tsx`, `src/app/onboarding/family-code/[inviteCode]/page.tsx`, `src/app/family/invite/[inviteCode]/page.tsx`, `src/app/family/join/[inviteCode]/page.tsx`, `src/lib/api/families.ts`, `src/lib/auth/pending-invite.ts`, `src/lib/onboarding/next-route.ts`, `src/lib/api/auth.ts`, `src/app/questions/[questionSendId]/page.tsx`, `docs/route-map.md`, `PROMPT_LOG.md` 수정
- **검증**: `npm run lint`, `npm run build` 통과

## 2026-07-10

- **프롬프트 요약**: F-10 네컷 그리드 썸네일이 잘려서 얼굴이 안 보이는 문제 수정 — 정사각형으로 확대, 여백 최소화
- **작업 구현 요약**: 미니컷 카드가 `height: 124px` 고정 박스 안에 썸네일을 `12px` 마진을 두고 `64px` 높이로만 작게 배치하던 구조였음(가로로 넓고 세로로 아주 짧은 비율이라 `cover` 크롭이 심하게 상하를 잘라 얼굴이 잘림). 카드를 `aspectRatio: 1/1` 정사각형으로 바꾸고 썸네일이 카드 전체(`inset-0`, 마진 없음)를 채우도록 변경. 텍스트 가독성을 위해 썸네일 위에 하단 그라디언트 스크림 추가, 이미지 없는 처리중/실패 상태는 배경이 밝은 톤(sage-100/error-bg)이라 텍스트 색을 흰색 대신 `sage-600`/`error`로 조정
- **변경점**: `src/app/diary/[date]/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: `/questions/new` 상단 받는 사람/질문 테마 선택 버튼을 더 작은 pill 형태로 조정
- **작업 구현 요약**: 전체 레이아웃과 추천 질문 영역은 유지하고, 받는 사람/질문 테마에 공통 적용되는 선택 버튼 스타일만 34px 높이·작은 좌우 패딩·13px 텍스트·full pill radius로 축소. 두 섹션의 제목-버튼 그룹 간격도 compact하게 조정
- **변경점**: `src/app/questions/new/page.tsx`, `PROMPT_LOG.md` 수정

## 2026-07-10

- **프롬프트 요약**: AI 처리 화면(F-08) 진행률 바를 실제 폴링 기반으로 재구현. status=processing인데 AI 작업 자체는 끝나서 콜백만 기다리는 상태를 구분해서 보여주기
- **작업 구현 요약**: 실제 배포된 `GET /api/v1/answers/{answer_id}/progress`(`status`/`progress`/`currentStepLabel`/`aiJobStatus`) 확인 후 `src/lib/api/answers.ts`에 `getAnswerProgress` 추가. 기존 `/v1/clips` 우회 폴링을 이걸로 교체하고, 완료 시에만 date 조회용으로 `/v1/clips` 한 번 더 호출. 진행바를 인디터미닛 애니메이션에서 실제 `progress`(0~100) 기반 폭으로 변경, API가 progress를 안 줄 때는 경과시간/30초 비율로 대체(최대 95%). `status=processing && aiJobStatus=completed`(AI 작업은 끝났지만 콜백 대기 중)일 때 카드 상태를 "마무리 중"으로, 문구를 "AI가 완성해서 준비하고 있어요."로 구분 표시. 전체 소요시간 안내는 "30초 정도 소요됩니다."로 유지
- **변경점**: `src/lib/api/answers.ts`, `src/app/answers/[answerId]/processing/page.tsx`, `docs/route-map.md` 수정

## 2026-07-10

- **프롬프트 요약**: AI 처리 화면에 예상 소요시간(30초) 안내 문구 추가
- **작업 구현 요약**: F-08 처리 화면 설명 문구를 "AI가 답변을 정리하는 동안 잠시만 기다려주세요."에서 "... 30초 정도 소요됩니다."로 수정
- **변경점**: `src/app/answers/[answerId]/processing/page.tsx` 수정

## 2026-07-10

- **프롬프트 요약**: F-13(설정, Figma node-id 68:177)/F-17(데이터 관리, node-id 84:106) 기준 `/settings` 구현
- **작업 구현 요약**: `/settings`(F-13) — 프로필 카드(역할 기반 아바타/초기화 텍스트), "연결된 가족"은 `getHomeQuestionSummary()`의 `connectedMembers`로 실제 연결 상태 표시, "저장 기본값"/"알림"은 대응 API가 없어 Figma 고정 문구, "저장 기본값" 카드를 탭하면 `/settings/data`로 이동, "가족 초대하기" 버튼은 기존 `FamilyInviteScreen`(`/onboarding/family-connect`) 재사용, "권한 관리"는 목적지 미정 TODO. `/settings/data`(F-17) — 데이터 내보내기/GIF 관리/삭제 안내 카드, "내보내기"/"삭제 요청" 버튼은 백엔드 API 없어 안내 문구만 표시. 이걸로 전 화면 BottomNav의 "설정" 탭이 더 이상 404 안 남
- **변경점**: `src/app/settings/page.tsx`, `src/app/settings/data/page.tsx` 추가, `docs/route-map.md` 갱신

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

- **프롬프트 요약**: 배포 프론트/백엔드 URL 기준 CORS preflight 오류 확인 및 설정 보강
- **작업 구현 요약**: Cloud Run 백엔드가 `https://damso-eight.vercel.app` origin의 OPTIONS 요청에 `400 Disallowed CORS origin`을 반환하는 것을 확인하고, 브라우저가 백엔드 절대 URL을 직접 호출하던 카카오 auth API를 Next rewrite(`/api`) 경유 호출로 통일
- **변경점**: `src/lib/api/auth.ts`, `PROMPT_LOG.md` 수정

---

=======

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
