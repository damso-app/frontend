"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, Search } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ApiError } from "@/lib/api/client";
import { getFamilyInvitation, joinFamily } from "@/lib/api/families";
import type { FamilyInvitationValidation } from "@/lib/api/families";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";

function normalizeInviteCode(value: string) {
  return value.trim();
}

function getValidateErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 필요합니다.";
    if (error.status === 404) return "초대 코드를 찾을 수 없습니다.";
    if (error.status === 410) return "만료된 초대 코드입니다.";
  }

  return "초대 코드를 확인하지 못했습니다.";
}

function getJoinErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 필요합니다.";
    if (error.status === 404) return "초대 코드를 찾을 수 없습니다.";
    if (error.status === 409) return "이미 가족에 연결되어 있습니다.";
    if (error.status === 410) return "만료된 초대 코드입니다.";
  }

  return "가족에 합류하지 못했습니다. 다시 시도해주세요.";
}

export default function FamilyJoinPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [validation, setValidation] = useState<FamilyInvitationValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedInviteCode = normalizeInviteCode(inviteCode);
  const canSubmit = normalizedInviteCode.length > 0 && !isValidating && !isJoining;

  const handleUnauthorized = () => {
    clearAccessToken();
    router.replace("/login");
  };

  const validateInviteCode = async () => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return null;
    }

    setIsValidating(true);
    setErrorMessage("");
    setValidation(null);

    try {
      const result = await getFamilyInvitation(normalizedInviteCode);
      setValidation(result);
      return result;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        handleUnauthorized();
        return null;
      }

      setErrorMessage(getValidateErrorMessage(error));
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidate = async () => {
    if (!canSubmit) return;

    await validateInviteCode();
  };

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsJoining(true);
    setErrorMessage("");

    try {
      const validated = validation?.inviteCode === normalizedInviteCode ? validation : await validateInviteCode();

      if (!validated) return;
      if (validated.available === false) {
        setErrorMessage("사용할 수 없는 초대 코드입니다.");
        return;
      }

      await joinFamily({ inviteCode: normalizedInviteCode });
      router.replace("/");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        handleUnauthorized();
        return;
      }

      setErrorMessage(getJoinErrorMessage(error));
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <OnboardingShell
      eyebrow="가족 연결"
      title={
        <>
          초대 코드로
          <br />
          가족에 합류해요
        </>
      }
      description={
        <>
          가족에게 받은 코드를 입력하면
          <br />
          같은 담소 공간에 연결됩니다.
        </>
      }
      contentJustify="flex-start"
      contentPadding="var(--space-xxl) 0 var(--space-lg)"
      style={{
        maxWidth: "430px",
        padding: "var(--space-xxxl) var(--page-padding-mobile) max(var(--space-lg), env(safe-area-inset-bottom))",
      }}
      footer={
        <>
          {errorMessage && (
            <p className="text-caption" role="alert" style={{ margin: 0, textAlign: "center", color: "var(--color-error)" }}>
              {errorMessage}
            </p>
          )}
          <Button size="lg" fullWidth loading={isJoining} disabled={!canSubmit} type="submit" form="family-join-form">
            가족에 합류하기
          </Button>
          <Link href="/family/create" style={{ textDecoration: "none" }}>
            <Button size="lg" variant="secondary" fullWidth disabled={isJoining}>
              내 가족 초대하기
            </Button>
          </Link>
        </>
      }
    >
      <form id="family-join-form" onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <Input
          id="family-invite-code"
          label="초대 코드"
          value={inviteCode}
          placeholder="초대 코드를 입력해주세요"
          disabled={isJoining}
          leftElement={<KeyRound size={18} />}
          rightElement={
            <button
              type="button"
              aria-label="초대 코드 확인"
              disabled={!canSubmit}
              onClick={handleValidate}
              style={{
                display: "inline-flex",
                width: "32px",
                height: "32px",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                borderRadius: "var(--radius-full)",
                background: canSubmit ? "var(--color-coral-50)" : "var(--color-cream-200)",
                color: canSubmit ? "var(--primary)" : "var(--text-disabled)",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              <Search size={17} />
            </button>
          }
          onChange={(event) => {
            setInviteCode(event.target.value);
            setValidation(null);
            setErrorMessage("");
          }}
          inputStyle={{ textTransform: "uppercase", fontFamily: "var(--font-mono)", letterSpacing: "0" }}
        />

        {validation && (
          <Card
            variant="base"
            elevation="subtle"
            padding="var(--space-md)"
            bg="var(--color-sage-50)"
            style={{ border: "1px solid var(--color-sage-100)", borderRadius: "var(--radius-xl)" }}
          >
            <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "flex-start" }}>
              <CheckCircle2 size={20} color="var(--color-sage-500)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: "var(--weight-bold)", color: "var(--text-1)" }}>
                  {validation.familyName ?? "담소 가족"}
                </p>
                <p className="text-caption" style={{ margin: "4px 0 0", color: "var(--text-2)" }}>
                  확인된 초대 코드입니다. 아래 버튼을 눌러 합류해주세요.
                </p>
              </div>
            </div>
          </Card>
        )}
      </form>
    </OnboardingShell>
  );
}
