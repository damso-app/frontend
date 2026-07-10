import type { OnboardingStatusResponse } from "@/lib/api/users";
import { getPendingInviteCode } from "@/lib/auth/pending-invite";

export function getInviteCodeRoute(inviteCode: string) {
  return `/onboarding/family-code/${encodeURIComponent(inviteCode)}`;
}

export function getNextOnboardingRoute(status: OnboardingStatusResponse) {
  const pendingInviteCode = getPendingInviteCode();

  if (!status.requiredAgreementsCompleted) return "/agreements";
  if (!status.role) return "/onboarding/role";
  if (status.familyConnected || status.onboardingCompleted) return "/";
  if (pendingInviteCode) return getInviteCodeRoute(pendingInviteCode);

  return "/onboarding/family-connect";
}
