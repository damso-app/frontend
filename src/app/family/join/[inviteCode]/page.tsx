import { FamilyCodeScreen } from "@/components/onboarding/FamilyCodeScreen";
import type { UserRole } from "@/lib/api/users";

function normalizeRole(value: unknown): UserRole | null {
  return value === "child" || value === "mother" || value === "father" ? value : null;
}

export default async function FamilyJoinInviteCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ inviteCode: string }>;
  searchParams: Promise<{ inviterRole?: string; recommendedRole?: string }>;
}) {
  const { inviteCode } = await params;
  const { inviterRole, recommendedRole } = await searchParams;

  return (
    <FamilyCodeScreen
      initialInviteCode={inviteCode}
      initialInviterRole={normalizeRole(inviterRole)}
      initialRecommendedRole={normalizeRole(recommendedRole)}
    />
  );
}
