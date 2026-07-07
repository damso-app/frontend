<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 담소(DAMSO) 제품 플로우

전체 사용자 플로우는 아래 10단계로 구성된다. 화면/기능을 구현할 때 이 흐름 속에서 해당 화면이 어떤 단계인지 파악하고 앞뒤 단계와의 데이터·상태 연결을 고려한다.

1. 온보딩한다.
2. 카카오 로그인으로 진입한다.
3. 자식/엄마/아빠 중 역할을 선택한다.
4. 가족을 만들고 초대 코드를 공유하거나, 초대 코드로 가족에 합류한다.
5. 질문 목록을 확인한다.
6. 자녀가 부모님에게 질문을 보낸다.
7. 부모님이 영상으로 답변을 기록한다.
8. AI가 답변 영상을 처리한다 (`submitted` → `processing` → `completed`/`failed`).
9. 처리 완료된 답변을 날짜+가족 단위로 묶은 네컷 그리드에서 확인한다.
10. 그리드의 컷을 탭해 영상, 명대사, 요약 등 상세를 확인한다.

# 백엔드 연동 참고

- `answers`/`video_clips`/`video_clip_ai_results` 테이블 구조와 상태값(`submitted`/`processing`/`completed`/`failed`), AI 파이프라인 필드 매핑은 `docs/backend-db-schema.md` 참고.
- 답변 상태, 네컷 카드 필드(title/quote/one_line_summary/emotion_tags 등) 관련 화면을 만들 때는 이 문서의 컬럼명을 프론트 타입/목업 데이터에 그대로 반영한다.
- 답변 업로드/조회 API 스펙은 `docs/backend-answer-api.md` 참고 (업로드 URL 발급 → GCS 직접 업로드 → 메타데이터 제출 순서, Realtime 상태 알림 등).
- 화면별 라우트 계획과 어떤 API가 아직 미확인인지는 `docs/route-map.md` 참고. 새 화면을 만들 때 라우트 경로를 여기 기준에 맞춘다.

# UI 구현 원칙

- UI는 Figma 디자인(`get_design_context` 등으로 조회한 노드)을 기준으로 구현한다.
- 새 UI를 만들 때는 항상 `src/components/ui`의 기존 디자인 시스템 컴포넌트(`Button`, `Avatar`, `Badge`, `Card`, `Modal`, `Toast`, `Input`, `Textarea`, `Tabs`)를 우선 사용한다. 목록은 `docs/design-system.md` 참고.
- Figma에서 생성된 코드는 원본 그대로 쓰지 않고, 반드시 위 컴포넌트와 `src/styles/tokens`의 디자인 토큰(색상/타이포/스페이싱/이펙트)에 맞게 변환한다. 임의로 새 색상값·간격값을 하드코딩하지 않는다.
- 디자인 시스템에 없는 패턴이 필요하면, 기존 컴포넌트를 확장하거나 같은 컨벤션(`variant`/`size` prop 패턴 등)으로 새 컴포넌트를 추가한다.

