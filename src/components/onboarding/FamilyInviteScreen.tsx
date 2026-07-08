"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ApiError } from "@/lib/api/client";
import { createFamily, getMyFamilyInvitation } from "@/lib/api/families";
import type { FamilyInvitation } from "@/lib/api/families";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";

function getFamilyCreateErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 필요합니다.";
    if (error.status === 409) return "이미 연결된 가족이 있습니다.";
  }

  if (error instanceof Error) return error.message;

  return "가족 초대 코드를 불러오지 못했습니다.";
}

function isShareCanceled(error: unknown) {
  if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  return name.includes("abort") || message.includes("cancel") || message.includes("abort");
}

export function FamilyInviteScreen() {
  const router = useRouter();
  const didFetchRef = useRef(false);
  const [invitation, setInvitation] = useState<FamilyInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  const inviteText = useMemo(() => {
    if (!invitation) return "";

    return (
      invitation.shareText ??
      `담소 가족 초대 코드: ${invitation.inviteCode}${invitation.inviteUrl ? `\n${invitation.inviteUrl}` : ""}`
    );
  }, [invitation]);

  const loadInvitation = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setNoticeMessage("");

    try {
      try {
        const existingInvitation = await getMyFamilyInvitation();
        setInvitation(existingInvitation);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
          throw error;
        }

        const createdInvitation = await createFamily();
        setInvitation(createdInvitation ?? (await getMyFamilyInvitation()));
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setErrorMessage(getFamilyCreateErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    void loadInvitation();
  }, [loadInvitation]);

  const copyInviteText = async () => {
    if (!inviteText) return false;

    if (!navigator.clipboard) {
      throw new Error("이 브라우저에서는 복사를 지원하지 않습니다.");
    }

    await navigator.clipboard.writeText(inviteText);
    setNoticeMessage("초대 코드를 복사했습니다.");
    return true;
  };

  const handleShare = async () => {
    if (!invitation || !inviteText || isSharing) return;

    setIsSharing(true);
    setErrorMessage("");
    setNoticeMessage("");

    try {
      if (navigator.share) {
        const shareData: ShareData = {
          title: "담소 가족 초대",
          text: inviteText,
        };

        if (invitation.inviteUrl) {
          shareData.url = invitation.inviteUrl;
        }

        await navigator.share(shareData);
        return;
      }

      await copyInviteText();
    } catch (error) {
      if (isShareCanceled(error)) return;

      setErrorMessage(error instanceof Error ? error.message : "초대 메시지를 공유하지 못했습니다.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <OnboardingShell
      eyebrow="가족 연결"
      title={
        <>
          가족 휴대폰과
          <br />
          연결하세요
        </>
      }
      description="카카오톡 초대 링크나 연결 코드로 부모님과 자녀 휴대폰을 연결합니다."
      contentJustify="flex-start"
      contentPadding="var(--space-lg) 0 var(--space-sm)"
      style={{
        maxWidth: "430px",
        padding: "var(--space-xxl) var(--page-padding-mobile) max(var(--space-lg), env(safe-area-inset-bottom))",
      }}
      footer={
        <>
          {noticeMessage && (
            <p className="text-caption" role="status" style={{ margin: 0, textAlign: "center", color: "var(--color-success)" }}>
              {noticeMessage}
            </p>
          )}
          {errorMessage && (
            <p className="text-caption" role="alert" style={{ margin: 0, textAlign: "center", color: "var(--color-error)" }}>
              {errorMessage}
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "var(--space-sm)" }}>
            <Button
              size="md"
              fullWidth
              loading={isSharing}
              disabled={!invitation || isLoading || isSharing}
              onClick={handleShare}
              style={{
                minHeight: "52px",
                padding: "0 var(--space-xs)",
                background: "var(--color-amber-100)",
                color: "var(--color-amber-500)",
                fontSize: "14px",
              }}
            >
              카카오톡으로 초대
            </Button>
            <Button
              size="md"
              variant="secondary"
              fullWidth
              disabled={isSharing}
              onClick={() => router.push("/onboarding/family-code")}
              style={{
                minHeight: "52px",
                padding: "0 var(--space-xs)",
                background: "var(--canvas)",
                border: "1.5px solid var(--color-coral-100)",
                color: "var(--color-coral-500)",
                fontSize: "14px",
              }}
            >
              코드로 연결하기
            </Button>
          </div>
          <p className="text-caption" style={{ margin: "var(--space-xxs) 0 0", textAlign: "center", color: "var(--text-2)" }}>
            카카오톡으로 가족들을 연결할 수 있어요.
          </p>
        </>
      }
    >
      <FamilyConnectionCard />
      <InviteCodeCard inviteCode={invitation?.inviteCode} isLoading={isLoading} />
      <KakaoInviteInfoCard />
    </OnboardingShell>
  );
}

function FamilyConnectionCard() {
  return (
    <Card
      variant="sage"
      elevation="subtle"
      padding="var(--space-xl) var(--space-lg)"
      bg="var(--color-sage-50)"
      style={{
        minHeight: "168px",
        border: "1px solid var(--color-sage-100)",
        borderRadius: "var(--radius-xxxl)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "var(--space-sm)" }}>
        <FamilyAvatar src="/children.png" label="자녀" />
        <span
          style={{
            alignSelf: "center",
            display: "inline-flex",
            minHeight: "34px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-full)",
            background: "var(--canvas)",
            padding: "0 var(--space-sm)",
            boxShadow: "var(--elevation-subtle)",
            color: "var(--color-sage-600)",
            fontSize: "13px",
            fontWeight: "var(--weight-semibold)",
            whiteSpace: "nowrap",
          }}
        >
          카카오톡 연결
        </span>
        <FamilyAvatar src="/father.png" label="부모" />
      </div>
    </Card>
  );
}

function FamilyAvatar({ src, label }: { src: string; label: string }) {
  return (
    <div style={{ display: "flex", minWidth: 0, flexDirection: "column", alignItems: "center", gap: "var(--space-sm)" }}>
      <div
        style={{
          position: "relative",
          width: "80px",
          height: "80px",
          overflow: "hidden",
          borderRadius: "var(--radius-full)",
          background: "var(--color-cream-100)",
          boxShadow: "var(--elevation-subtle)",
        }}
      >
        <Image src={src} alt={label} fill sizes="80px" style={{ objectFit: "cover" }} priority />
      </div>
      <span style={{ color: "var(--text-2)", fontSize: "14px", fontWeight: "var(--weight-semibold)" }}>{label}</span>
    </div>
  );
}

function InviteCodeCard({ inviteCode, isLoading }: { inviteCode?: string; isLoading: boolean }) {
  return (
    <Card
      variant="base"
      elevation="subtle"
      padding="var(--space-md) var(--space-lg)"
      bg="var(--canvas)"
      style={{
        minHeight: "76px",
        border: "1px solid var(--hairline-soft)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
        <div style={{ minWidth: 0 }}>
          <p
            className="text-caption"
            style={{ margin: 0, color: "var(--color-coral-500)", fontWeight: "var(--weight-semibold)" }}
          >
            연결 코드
          </p>
          <p
            style={{
              margin: "4px 0 0",
              color: inviteCode ? "var(--text-1)" : "var(--text-3)",
              fontFamily: inviteCode ? "var(--font-mono)" : "var(--font-sans)",
              fontSize: inviteCode ? "25px" : "15px",
              fontWeight: "var(--weight-bold)",
              lineHeight: 1.1,
              letterSpacing: "0",
            }}
          >
            {isLoading ? "불러오는 중..." : inviteCode || "코드 없음"}
          </p>
        </div>
        <span
          style={{
            flexShrink: 0,
            borderRadius: "var(--radius-full)",
            background: "var(--color-cream-100)",
            padding: "7px 10px",
            color: "var(--text-2)",
            fontSize: "12px",
            fontWeight: "var(--weight-semibold)",
            whiteSpace: "nowrap",
          }}
        >
          직접 입력용
        </span>
      </div>
    </Card>
  );
}

function KakaoInviteInfoCard() {
  return (
    <Card
      variant="base"
      elevation="card"
      padding="var(--space-lg)"
      bg="var(--canvas)"
      style={{
        border: "1px solid var(--hairline-soft)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "flex-start" }}>
        <span
          aria-hidden="true"
          style={{
            width: "9px",
            height: "9px",
            flexShrink: 0,
            borderRadius: "var(--radius-full)",
            background: "var(--color-coral-400)",
            marginTop: "7px",
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, color: "var(--text-1)", fontSize: "16px", fontWeight: "var(--weight-bold)" }}>
            카카오톡 초대 보내기
          </p>
          <p className="text-body-sm" style={{ margin: "6px 0 0", color: "var(--text-2)", whiteSpace: "pre-line" }}>
            {"카카오톡에서 링크를 누르면\n살아있는 회고록 앱으로 바로 연결됩니다."}
          </p>
        </div>
      </div>
    </Card>
  );
}
