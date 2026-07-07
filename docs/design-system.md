# 담소 디자인 시스템

담소 디자인 시스템에 기반한 컴포넌트와 토큰 정리.

- 컴포넌트: `src/components/ui/` (barrel export: `@/components/ui`)
- 토큰: `src/styles/tokens/` (전역 `src/app/globals.css`에서 import)

## 컴포넌트

| 컴포넌트                   | 경로                  | 주요 props                                                                                                                          | 비고                                               |
| -------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `Button`                   | `actions/Button.tsx`  | `variant`: primary·secondary·ghost·soft·danger·sage / `size`: sm·md·lg / `loading` / `leftIcon` / `rightIcon` / `fullWidth` / `disabled` | 항상 pill 모양, `md` 44px·`lg` 52px 최소 터치 높이 |
| `Avatar`                   | `display/Avatar.tsx`  | `src` / `name` / `size`: xs·sm·md·lg·xl·2xl / `online`                                                                              | 이미지 없으면 이니셜, 이름 해시로 배경색 결정      |
| `Badge`                    | `display/Badge.tsx`   | `variant`: default·primary·sage·amber·success·error·warning·outline·dark / `size`: sm·md·lg / `dot`                                 | 항상 pill 모양, 상태·감정 태그용                   |
| `Card`                     | `display/Card.tsx`    | `variant`: base·feature·quote·video·diary·sage·amber / `elevation`: flat·subtle·card·modal / `padding` / `bg` / `onClick`           | `onClick` 지정 시 hover에서 위로 살짝 떠오름       |
| `Modal`                    | `feedback/Modal.tsx`  | `isOpen` / `onClose` / `title` / `footer` / `size`: sm·md·lg / `closeOnBackdrop`                                                    | 열려있는 동안 `body` 스크롤 잠금                   |
| `Toast` / `ToastContainer` | `feedback/Toast.tsx`  | `type`: default·success·error·warning·info / `title` / `message` / `onClose` / `visible`                                            | `ToastContainer`가 화면 하단 중앙에 스택 정렬      |
| `Input`                    | `forms/Input.tsx`     | `label` / `error` / `hint` / `leftElement` / `rightElement` / `disabled`                                                            | 최소 높이 44px, 포커스 시 코랄 링                  |
| `Textarea`                 | `forms/Textarea.tsx`  | `label` / `error` / `hint` / `rows` / `maxLength`                                                                                   | `maxLength` 지정 시 글자 수 카운터 표시            |
| `Tabs`                     | `navigation/Tabs.tsx` | `tabs`: `{id,label,icon?,disabled?}[]` / `activeTab` / `onChange` / `variant`: line·pill / `fullWidth`                              | line = 메인 내비게이션 밑줄, pill = 인페이지 토글  |
| `BottomNav`                | `navigation/BottomNav.tsx` | `items`: `{id,label,icon?}[]` / `activeId` / `onChange`                                                                        | 화면 하단 고정 4탭 내비게이션, 활성 탭은 필 하이라이트 |

## 토큰

### Colors (`tokens/colors.css`)

| 그룹                   | 변수                                                                                                             | 값                                                    | 용도                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Coral (primary)        | `--color-coral-50` ~ `-600`                                                                                      | `#FEF3EF` → `#A84030`                                 | `-400`이 메인 CTA, `-500` hover, `-600` pressed                            |
| Cream (canvas/surface) | `--color-cream-50` ~ `-600`                                                                                      | `#FDFAF6` → `#9E8060`                                 | `-50` 캔버스, `-100/-200` 서피스, `-300~-600` 헤어라인                     |
| Ink (text)             | `--color-ink-900` ~ `-200`                                                                                       | `#1E1009` → `#C4A892`                                 | `-900` 본문, `-700` 보조, `-500` 라벨, `-300` placeholder, `-200` disabled |
| Sage (secondary)       | `--color-sage-50` ~ `-600`                                                                                       | `#EEF6F1` → `#245C3A`                                 | 보조 강조색                                                                |
| Amber (tertiary)       | `--color-amber-50` ~ `-500`                                                                                      | `#F7EEE3` → `#6A4018`                                 | 3차 강조색                                                                 |
| Semantic               | `--color-success` / `-error` / `-warning` (+ `-bg`)                                                              | success `#4A9A6C`, error `#D05840`, warning `#C47830` | 상태 표시                                                                  |
| Alias                  | `--canvas` `--surface` `--surface-soft` `--hairline*` `--primary*` `--text-1~3` `--text-muted` `--text-disabled` | Coral/Cream/Ink 값 재사용                             | 컴포넌트가 실제로 참조하는 시맨틱 변수                                     |

### Typography (`tokens/typography.css`)

| 변수                                                     | 값                                             | 비고                                                                   |
| -------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| `--font-sans`                                            | Pretendard Variable → Noto Sans KR → system-ui | 본문/제목 공통, CDN 로드 (프로덕션은 `next/font/local` self-host 권장) |
| `--font-mono`                                            | JetBrains Mono → Fira Code → monospace         | 코드/트랜스크립트용                                                    |
| `--weight-regular/medium/semibold/bold`                  | 400 / 500 / 600 / 700                          |                                                                        |
| `--text-hero-*`                                          | 56px / weight 500 / lh 1.05                    | 랜딩 감성 헤더                                                         |
| `--text-h1-*` ~ `--text-h5-*`                            | 40px → 18px, weight 500                        | 헤딩 스케일, `.text-h1` ~ `.text-h5` 유틸 클래스 제공                  |
| `--text-subtitle-*`                                      | 17px / weight 400 / lh 1.55                    |                                                                        |
| `--text-body-lg/body/body-md/body-sm-*`                  | 17 / 16 / 15 / 14px                            | 본문 최소 16px 규칙                                                    |
| `--text-caption-*`, `--text-caption-bold-*`              | 13px                                           |                                                                        |
| `--text-button-lg/md/sm-size`, `--text-button-weight/lh` | 16 / 15 / 13px, weight 500                     | 버튼 텍스트                                                            |

### Spacing (`tokens/spacing.css`)

| 변수                                        | 값                                    |
| ------------------------------------------- | ------------------------------------- |
| `--space-xxs` ~ `--space-xxxl`              | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48px |
| `--section-xs` ~ `--section-xl`             | 32 / 48 / 64 / 96 / 128px             |
| `--touch-min`                               | 44px (시니어 접근성 최소 터치 영역)   |
| `--page-padding-mobile` / `-tablet`         | 20px / 32px                           |
| `--page-max-width`                          | 480px (모바일 웹앱 기준)              |
| `--card-padding` / `--card-padding-feature` | `--space-xl` / `--space-xxl`          |

### Effects (`tokens/effects.css`)

| 변수                                   | 값                                 |
| -------------------------------------- | ---------------------------------- |
| `--radius-xs` ~ `--radius-xxxl`        | 4 / 6 / 8 / 12 / 16 / 20 / 28px    |
| `--radius-full`                        | 9999px (버튼·배지·필)              |
| `--elevation-flat`                     | 테두리만, 그림자 없음              |
| `--elevation-subtle`                   | `0 1px 3px + 0 1px 8px` 옅은 umbra |
| `--elevation-card`                     | `0 4px 12px + 0 2px 4px`           |
| `--elevation-modal`                    | `0 12px 40px + 0 4px 12px`         |
| `--border-soft/base/strong`            | 헤어라인 두께 3단계                |
| `--ease-default/-out/-in-out/-spring`  | 이징 곡선                          |
| `--duration-fast/base/slow/enter/exit` | 120 / 180 / 280 / 260 / 200ms      |

### Animations (`tokens/animations.css`)

| 변수                     | 값                                 | 비고                                                                               |
| ------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------- |
| `@keyframes memoir-spin` | `to { transform: rotate(360deg) }` | 원본 토큰 번들에는 누락되어 있어 이관 시 추가 — `Button`의 `loading` 스피너가 사용 |
