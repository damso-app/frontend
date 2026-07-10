"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Button, Card } from "@/components/ui";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ApiError } from "@/lib/api/client";
import { joinFamily } from "@/lib/api/families";
import { getMyOnboardingStatus, updateMyRole } from "@/lib/api/users";
import type { UserRole } from "@/lib/api/users";
import { clearPendingInviteCode, getPendingInviteCode, getPendingRecommendedRole } from "@/lib/auth/pending-invite";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";
import { getInviteCodeRoute } from "@/lib/onboarding/next-route";

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  imageSrc: string;
  imageName: string;
}

const roleOptions: RoleOption[] = [
  {
    role: "child",
    title: "자녀로 시작",
    description: "부모님께 질문을 보내고\n부모님의 답변을 받을 수 있어요.",
    imageSrc: "/children.png",
    imageName: "자녀",
  },
  {
    role: "father",
    title: "아버지로 시작",
    description: "자녀에게 질문을 보내거나,\n받은 질문에 영상으로 답변할 수 있어요.",
    imageSrc: "/father.png",
    imageName: "아버지",
  },
  {
    role: "mother",
    title: "어머니로 시작",
    description: "자녀에게 질문을 보내거나,\n받은 질문에 영상으로 답변할 수 있어요.",
    imageSrc: "/mother.png",
    imageName: "어머니",
  },
];

function getRoleErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 필요합니다.";
    if (error.status === 422) return "역할 선택값을 확인해주세요.";
  }

  return "역할을 저장하지 못했습니다. 다시 시도해주세요.";
}

export default function RolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => getPendingRecommendedRole() ?? "child");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const pendingInviteCode = getPendingInviteCode();

  const handleComplete = async () => {
    if (isSaving) return;

    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await updateMyRole({ role: selectedRole });
      const onboardingStatus = await getMyOnboardingStatus();

      if (onboardingStatus.familyConnected) {
        clearPendingInviteCode();
        router.replace("/");
        return;
      }

      const inviteCode = getPendingInviteCode();
      if (inviteCode) {
        await joinFamily({ inviteCode });
        clearPendingInviteCode();
        router.replace("/");
        return;
      }

      router.push("/onboarding/family-connect");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      if (pendingInviteCode) {
        setErrorMessage("역할은 저장했지만 가족 연결에 실패했습니다. 연결 코드를 다시 확인해주세요.");
        router.push(getInviteCodeRoute(pendingInviteCode));
        return;
      }

      setErrorMessage(getRoleErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingShell
      eyebrow="처음 설정"
      title={
        <>
          어떤 역할로
          <br />
          시작할까요?
        </>
      }
      description={
        <>
          {pendingInviteCode ? "초대 링크에 맞춰 역할을 먼저 설정합니다." : "역할은 추천 질문과 홈 문구를 맞추기 위한 설정입니다."}
          <br />
          {pendingInviteCode ? "선택 완료 후 가족과 자동으로 연결됩니다." : "부모와 자녀 모두 질문하고 답변할 수 있습니다."}
        </>
      }
      contentJustify="flex-start"
      contentPadding="var(--space-xxl) 0 var(--space-xl)"
      style={{
        maxWidth: "430px",
        padding: "var(--space-xxxl) var(--page-padding-mobile) max(var(--space-lg), env(safe-area-inset-bottom))",
      }}
      footer={
        <>
          {errorMessage && (
            <p
              role="alert"
              className="text-caption"
              style={{ margin: 0, textAlign: "center", color: "var(--color-error)" }}
            >
              {errorMessage}
            </p>
          )}
          <Button size="lg" fullWidth loading={isSaving} disabled={isSaving} onClick={handleComplete}>
            선택 완료
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label="역할 선택" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {roleOptions.map((option) => (
          <RoleCard
            key={option.role}
            option={option}
            selected={selectedRole === option.role}
            disabled={isSaving}
            onSelect={() => setSelectedRole(option.role)}
          />
        ))}
      </div>
    </OnboardingShell>
  );
}

function RoleCard({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: RoleOption;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onSelect();
  };

  const handleSelect = () => {
    if (disabled) return;
    onSelect();
  };

  return (
    <Card
      variant="base"
      elevation="subtle"
      padding="var(--space-md)"
      bg={selected ? "var(--color-sage-50)" : "var(--color-cream-100)"}
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : handleSelect}
      onKeyDown={handleKeyDown}
      style={{
        minHeight: "116px",
        border: selected ? "1.5px solid var(--color-sage-300)" : "1px solid var(--hairline-soft)",
        borderRadius: "var(--radius-xl)",
        outline: "none",
        opacity: disabled ? 0.72 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        <Avatar src={option.imageSrc} name={option.imageName} size="xl" />

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-sans)",
                fontSize: "17px",
                fontWeight: "var(--weight-bold)",
                lineHeight: 1.45,
                color: "var(--text-1)",
              }}
            >
              {option.title}
            </p>
            {selected && (
              <Badge variant="success" size="sm" style={{ flexShrink: 0, marginTop: "2px" }}>
                선택됨
              </Badge>
            )}
          </div>

          <p
            className="text-caption"
            style={{
              margin: "6px 0 0",
              color: "var(--text-2)",
              lineHeight: 1.45,
              whiteSpace: "pre-line",
            }}
          >
            {option.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
