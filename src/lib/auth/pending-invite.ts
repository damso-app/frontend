import { normalizeInviteCodeForApi } from "@/lib/api/families";
import type { UserRole } from "@/lib/api/users";

const DAMSO_PENDING_INVITE_CODE_KEY = "damso_pending_invite_code";
const DAMSO_PENDING_INVITER_ROLE_KEY = "damso_pending_inviter_role";
const DAMSO_PENDING_RECOMMENDED_ROLE_KEY = "damso_pending_recommended_role";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeRole(value: unknown): UserRole | null {
  return value === "child" || value === "mother" || value === "father" ? value : null;
}

export function getRecommendedRoleFromInviterRole(inviterRole: UserRole | null): UserRole | null {
  if (!inviterRole) return null;
  if (inviterRole === "mother" || inviterRole === "father") return "child";

  return "mother";
}

export function savePendingInviteCode(
  inviteCode: string,
  options: {
    inviterRole?: UserRole | null;
    recommendedRole?: UserRole | null;
  } = {},
) {
  if (!canUseStorage()) return;

  const normalizedInviteCode = normalizeInviteCodeForApi(inviteCode);
  if (!normalizedInviteCode) return;

  window.localStorage.setItem(DAMSO_PENDING_INVITE_CODE_KEY, normalizedInviteCode);

  const inviterRole = normalizeRole(options.inviterRole);
  const recommendedRole = normalizeRole(options.recommendedRole) ?? getRecommendedRoleFromInviterRole(inviterRole);

  if (inviterRole) {
    window.localStorage.setItem(DAMSO_PENDING_INVITER_ROLE_KEY, inviterRole);
  }

  if (recommendedRole) {
    window.localStorage.setItem(DAMSO_PENDING_RECOMMENDED_ROLE_KEY, recommendedRole);
  }
}

export function getPendingInviteCode() {
  if (!canUseStorage()) return null;

  return window.localStorage.getItem(DAMSO_PENDING_INVITE_CODE_KEY);
}

export function getPendingInviterRole() {
  if (!canUseStorage()) return null;

  return normalizeRole(window.localStorage.getItem(DAMSO_PENDING_INVITER_ROLE_KEY));
}

export function getPendingRecommendedRole() {
  if (!canUseStorage()) return null;

  return (
    normalizeRole(window.localStorage.getItem(DAMSO_PENDING_RECOMMENDED_ROLE_KEY)) ??
    getRecommendedRoleFromInviterRole(getPendingInviterRole())
  );
}

export function clearPendingInviteCode() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(DAMSO_PENDING_INVITE_CODE_KEY);
  window.localStorage.removeItem(DAMSO_PENDING_INVITER_ROLE_KEY);
  window.localStorage.removeItem(DAMSO_PENDING_RECOMMENDED_ROLE_KEY);
}
