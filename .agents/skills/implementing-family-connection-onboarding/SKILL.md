---
name: implementing-family-connection-onboarding
description: Implements Damso frontend onboarding family connection flows, including role selection handoff, family invitation code display, Kakao invite button UI, direct invite code input, invite code validation, and family join API integration. Use when implementing or modifying onboarding screens after role selection and before entering the main app.
---

# Implementing Family Connection Onboarding

Use this skill when implementing or modifying Damso onboarding screens after role selection and before entering the main app.

## Required Context

Before editing code, read the current project guidance and route/API context:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/design-system.md`
- `docs/route-map.md`
- `docs/backend-answer-api.md`
- Relevant Next.js 16 docs under `node_modules/next/dist/docs/` before writing App Router or API-related code.

Check existing implementation first:

- `src/app/onboarding/role/page.tsx`
- `src/app/agreements/page.tsx`
- `src/components/onboarding/OnboardingShell.tsx`
- `src/components/ui/`
- `src/lib/api/client.ts`
- `src/lib/api/users.ts`
- `src/lib/auth/token.ts`

## Product Flow

This skill covers Damso product flow step 4:

1. User completes Kakao login.
2. User completes required agreements.
3. User selects one role: `child`, `mother`, or `father`.
4. User connects a family before entering the main app.

After role selection, route users into the family connection flow instead of directly entering the main app.

Recommended routes:

- `/onboarding/family-invite`: create or fetch an invite code, show invite UI, provide Kakao invite button UI.
- `/onboarding/family-code`: direct invite code input, validation, and join flow.

If existing route plans differ, follow `docs/route-map.md` unless the user explicitly asks to update it. Report any route mismatch.

## UX Requirements

Damso is a mobile web app.

- Base layout width: 375px to 430px.
- Desktop must still render like a mobile app: a single centered column container.
- Prefer `OnboardingShell` for onboarding screens.
- Prefer existing shared components: `Button`, `Card`, `Input`, `Badge`, `Avatar`, `Modal`, `Toast`.
- If a needed pattern already exists in shared components, reuse it as much as possible before creating new UI.
- Use design tokens from `src/styles/tokens`; avoid arbitrary hardcoded colors or spacing.
- Keep touch targets at least 44px.
- Do not add marketing/landing-page sections.
- Do not use nested cards.
- Keep copy concise and task-focused.

Use existing public assets:

- `public/children.png`
- `public/father.png`
- `public/mother.png`

Do not use external image URLs.
Do not add new images to `public` unless the user explicitly asks.

## Family Connection Paths

Implement two paths.

### 1. Create or Fetch Invite Code

Screen purpose:

- Let the user create or retrieve their family invitation.
- Display the invite code clearly.
- Show a Kakao invite button UI.
- Allow copying or sharing the invite text/link if supported by the browser.

Expected backend behavior:

- Backend provides invite code.
- Backend may provide `inviteUrl`.
- Backend may provide `shareText`.

Kakao sharing:

- MVP may leave actual KakaoTalk share integration as a TODO or stub.
- The UI can include a Kakao-style button, but do not modify Kakao OAuth login logic.
- If `navigator.share` or clipboard is used, handle unsupported browsers gracefully.

Recommended APIs:

- `POST /api/v1/families`
- `GET /api/v1/families/me/invitation`

### 2. Join by Invite Code

Screen purpose:

- Let the user type a family connection code directly.
- Validate the invite code before final join when possible.
- Show validation result: family name, availability, or error.
- Submit join request and enter the main app on success.

Recommended APIs:

- `GET /api/v1/families/invitations/{inviteCode}`
- `POST /api/v1/families/join`

Input handling:

- Trim whitespace.
- Normalize obvious formatting only if the backend accepts it.
- Do not silently change API semantics.
- Disable submit while validating or joining.
- Show clear error text for invalid, expired, already-used, or unavailable codes.

## API and Auth Rules

Use the existing API client patterns before adding new ones.

- API base URL comes from `NEXT_PUBLIC_API_BASE_URL`.
- Browser requests should go through the existing `/api` rewrite pattern when that is already used by the app.
- Access token is stored in `localStorage` under `damso_access_token`.
- Include `Authorization: Bearer <token>` on authenticated API requests.
- On `401`, remove the token and navigate to `/login`.
- Preserve `ApiError` handling conventions from `src/lib/api/client.ts`.

Recommended APIs:

- `PATCH /api/v1/users/me/role`
- `POST /api/v1/families`
- `GET /api/v1/families/me/invitation`
- `GET /api/v1/families/invitations/{inviteCode}`
- `POST /api/v1/families/join`

If API specs in OpenAPI, backend docs, or local docs differ, do not invent a compatibility layer silently. Implement against the clearest current source and report the mismatch in the final response and `PROMPT_LOG.md`.

## Role Selection Handoff

When modifying the existing role screen:

- Keep role values aligned with backend enum: `child`, `mother`, `father`.
- Keep `PATCH /api/v1/users/me/role` behavior intact.
- After successful role save, route to the family connection flow.
- Prefer `/onboarding/family-invite` as the default next route unless route-map or product instructions say otherwise.

Do not change:

- Kakao OAuth login flow.
- Required agreements logic.
- Questions, answers, diary, AI processing, or clip detail flows.

## Implementation Checklist

1. Read required docs and inspect current files.
2. Confirm current API shapes from local docs or OpenAPI if available.
3. Add or update API functions in the existing API module style.
4. Implement `/onboarding/family-invite`.
5. Implement `/onboarding/family-code`.
6. Update role selection handoff if needed.
7. Handle loading, empty, success, validation, and error states.
8. Handle `401` by clearing token and routing to `/login`.
9. Update `docs/route-map.md` if routes or API status changed.
10. Add a new top entry to `PROMPT_LOG.md` with prompt summary, judgment basis, changed files, and verification result.
11. Run `npm run lint`.
12. Run `npm run build`.

## Reporting

Final response should include:

- What routes/screens were implemented or modified.
- What APIs were connected.
- Any API spec mismatches or assumptions.
- Verification results for `npm run lint` and `npm run build`.

Do not claim KakaoTalk sharing is fully integrated if it is only a TODO, stub, clipboard action, or `navigator.share` fallback.
