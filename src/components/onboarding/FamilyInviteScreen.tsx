"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { createFamily, getMyFamilyInvitation } from "@/lib/api/families";
import type { FamilyInvitation } from "@/lib/api/families";
import { getMyOnboardingStatus } from "@/lib/api/users";
import type { UserRole } from "@/lib/api/users";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";

const INVITE_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 6;

function generateInviteCode() {
  const randomValues = new Uint32Array(INVITE_CODE_LENGTH);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(randomValues);
  } else {
    randomValues.forEach((_, index) => {
      randomValues[index] = Math.floor(Math.random() * INVITE_CODE_CHARACTERS.length);
    });
  }

  const rawCode = Array.from(randomValues, (value) => INVITE_CODE_CHARACTERS[value % INVITE_CODE_CHARACTERS.length]).join("");

  return `${rawCode.slice(0, 3)}-${rawCode.slice(3)}`;
}

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

function getShareableInviteUrl(invitation: FamilyInvitation | null, inviterRole: UserRole | null) {
  if (typeof window === "undefined" || !invitation?.inviteCode) return invitation?.inviteUrl;

  const inviteUrl = new URL(`/onboarding/family-code/${encodeURIComponent(invitation.inviteCode)}`, window.location.origin);
  const role = invitation.inviterRole ?? inviterRole;

  if (role) {
    inviteUrl.searchParams.set("inviterRole", role);
  }

  if (invitation.recommendedRole) {
    inviteUrl.searchParams.set("recommendedRole", invitation.recommendedRole);
  }

  return inviteUrl.toString();
}

type FamilyStatus = "checking" | "no-family" | "ready";

export function FamilyInviteScreen() {
  const router = useRouter();
  const didFetchRef = useRef(false);
  const [invitation, setInvitation] = useState<FamilyInvitation | null>(null);
  const [status, setStatus] = useState<FamilyStatus>("checking");
  const [isCreating, setIsCreating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [fallbackInviteCode, setFallbackInviteCode] = useState("");
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  const isLoading = status === "checking";

  const displayInviteCode = invitation?.inviteCode ?? fallbackInviteCode;
  const shareableInviteUrl = useMemo(() => getShareableInviteUrl(invitation, currentRole), [currentRole, invitation]);

  const inviteText = useMemo(() => {
    if (!invitation) {
      return fallbackInviteCode ? `담소 가족 초대 코드: ${fallbackInviteCode}` : "";
    }

    if (invitation.shareText) {
      return shareableInviteUrl && !invitation.shareText.includes(shareableInviteUrl)
        ? `${invitation.shareText}\n${shareableInviteUrl}`
        : invitation.shareText;
    }

    return `담소 가족 초대 코드: ${invitation.inviteCode}${shareableInviteUrl ? `\n${shareableInviteUrl}` : ""}`;
  }, [fallbackInviteCode, invitation, shareableInviteUrl]);

  const loadInvitation = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setStatus("checking");
    setErrorMessage("");
    setNoticeMessage("");

    try {
      const onboardingStatus = await getMyOnboardingStatus();
      setCurrentRole(onboardingStatus.role);

      const existingInvitation = await getMyFamilyInvitation();
      setInvitation(existingInvitation);
      setStatus("ready");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      // 404는 정상 상태(아직 가족이 없음) — 여기서 자동으로 가족을 만들면 안 된다.
      // 두 사용자가 각자 로그인하자마자 자동으로 별도 가족을 갖게 되면, 서로의 진짜
      // 초대 코드로 합류(POST /families/join)해도 "이미 가족에 속해 있음"(409)으로
      // 영원히 실패한다. 반드시 "가족 만들기"/"코드로 참여하기" 중 사용자가 선택하게 한다.
      if (!(error instanceof ApiError) || error.status !== 404) {
        setErrorMessage(getFamilyCreateErrorMessage(error));
      }

      setStatus("no-family");
    }
  }, [router]);

  const handleCreateFamily = useCallback(async () => {
    if (isCreating) return;

    setIsCreating(true);
    setErrorMessage("");
    setNoticeMessage("");

    try {
      const createdInvitation = await createFamily();
      setInvitation(createdInvitation);
      setStatus("ready");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setErrorMessage(getFamilyCreateErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, router]);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    setFallbackInviteCode(generateInviteCode());
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
    if (!inviteText || isSharing) return;

    setIsSharing(true);
    setErrorMessage("");
    setNoticeMessage("");

    try {
      if (navigator.share) {
        const shareData: ShareData = {
          title: "담소 가족 초대",
          text: inviteText,
        };

        if (shareableInviteUrl || invitation?.inviteUrl) {
          shareData.url = shareableInviteUrl ?? invitation?.inviteUrl;
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
    <FamilyOnboardingFrame>
      <div style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column", width: "100%" }}>
        <PhoneCard
          eyebrow="가족 연결"
          title={
            <>
              가족 대표와
              <br />
              연결하세요
            </>
          }
          description="카카오톡 초대 링크나 연결 코드로 부모님/자녀 휴대폰을 연결합니다."
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
                {status === "no-family" ? (
                  <Button
                    size="md"
                    fullWidth
                    loading={isCreating}
                    disabled={isCreating}
                    onClick={handleCreateFamily}
                    style={{
                      minHeight: "50px",
                      padding: "0 var(--space-xs)",
                      fontSize: "14px",
                      fontWeight: "var(--weight-bold)",
                    }}
                  >
                    가족 만들기
                  </Button>
                ) : (
                  <Button
                    size="md"
                    fullWidth
                    loading={isSharing}
                    disabled={isLoading || isSharing || !inviteText}
                    onClick={handleShare}
                    style={{
                      minHeight: "50px",
                      padding: "0 var(--space-xs)",
                      background: "var(--color-kakao-yellow)",
                      color: "var(--color-kakao-text)",
                      fontSize: "14px",
                      fontWeight: "var(--weight-bold)",
                    }}
                  >
                    카카오톡으로 초대
                  </Button>
                )}
                <Button
                  size="md"
                  variant="secondary"
                  fullWidth
                  disabled={isSharing || isCreating}
                  onClick={() => router.push("/onboarding/family-code")}
                  style={{
                    minHeight: "50px",
                    padding: "0 var(--space-xs)",
                    background: "var(--color-cream-100)",
                    border: "1.5px solid var(--color-cream-300)",
                    color: "var(--color-ink-700)",
                    fontSize: "14px",
                    fontWeight: "var(--weight-bold)",
                  }}
                >
                  코드로 참여하기
                </Button>
              </div>
              <p className="text-caption" style={{ margin: 0, textAlign: "center", color: "var(--text-2)" }}>
                {status === "no-family"
                  ? "가족을 처음 만드는 거라면 '가족 만들기', 상대방에게 코드를 받았다면 '코드로 참여하기'를 눌러주세요."
                  : "카카오톡으로 가족들을 연결할 수 있어요."}
              </p>
            </>
          }
        >
          <FamilyConnectionPanel connectorLabel="카카오톡 연결" parentSrc="/father.png" />
          {status === "no-family" ? (
            <InfoBox
              title="아직 만든 가족이 없어요"
              description="가족 대표라면 '가족 만들기'로 연결 코드를 발급받아 공유하고, 상대방에게 코드를 받았다면 '코드로 참여하기'를 눌러주세요. 두 사람이 동시에 '가족 만들기'를 누르면 서로 연결할 수 없으니 한 명만 먼저 만들어주세요."
              background="var(--color-cream-100)"
            />
          ) : (
            <>
              <InviteCodeCard inviteCode={displayInviteCode} isLoading={!displayInviteCode} />
              <InfoBox
                title="카카오톡 초대 보내기"
                description="카카오톡에서 링크를 누르면 알아서 초대 코드로 바로 연결됩니다."
                background="var(--color-cream-100)"
              />
            </>
          )}
        </PhoneCard>
      </div>
    </FamilyOnboardingFrame>
  );
}

export function FamilyOnboardingFrame({ children }: { children: ReactNode }) {
  return (
    <main
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        maxWidth: "430px",
        minHeight: "100svh",
        background: "var(--canvas)",
        padding: "var(--space-xxxl) var(--page-padding-mobile) max(var(--space-lg), env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </main>
  );
}

export function PhoneCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        minHeight: 0,
        flex: 1,
        flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        <p
          style={{
            margin: 0,
            color: "var(--color-coral-500)",
            fontSize: "13px",
            fontWeight: "var(--weight-semibold)",
            letterSpacing: "0",
          }}
        >
          {eyebrow}
        </p>
        <h1
          style={{
            margin: 0,
            color: "var(--text-1)",
            fontSize: "32px",
            fontWeight: "var(--weight-bold)",
            lineHeight: 1.16,
            letterSpacing: "0",
          }}
        >
          {title}
        </h1>
        <p className="text-body-sm" style={{ margin: 0, color: "var(--text-2)", lineHeight: 1.55 }}>
          {description}
        </p>
      </header>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", padding: "var(--space-lg) 0" }}>
        {children}
      </section>
      <footer style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginTop: "auto" }}>{footer}</footer>
    </div>
  );
}

export function FamilyConnectionPanel({ connectorLabel, parentSrc }: { connectorLabel: string; parentSrc: string }) {
  return (
    <div
      style={{
        minHeight: "162px",
        borderRadius: "var(--radius-xxxl)",
        background: "var(--color-sage-50)",
        border: "1px solid var(--color-sage-100)",
        padding: "var(--space-lg) var(--space-md)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "var(--space-xs)" }}>
        <FamilyAvatar src="/children.png" label="자녀" />
        <span
          style={{
            display: "inline-flex",
            width: "92px",
            minWidth: "92px",
            flex: "0 0 92px",
            minHeight: "34px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-full)",
            background: "var(--color-amber-100)",
            padding: "0 var(--space-sm)",
            color: "var(--color-amber-500)",
            fontSize: "13px",
            fontWeight: "var(--weight-bold)",
            whiteSpace: "nowrap",
            boxSizing: "border-box",
            boxShadow: "var(--elevation-subtle)",
          }}
        >
          {connectorLabel}
        </span>
        <FamilyAvatar src={parentSrc} label="부모" />
      </div>
    </div>
  );
}

function FamilyAvatar({ src, label }: { src: string; label: string }) {
  return (
    <div style={{ display: "flex", minWidth: 0, flexDirection: "column", alignItems: "center", gap: "var(--space-sm)" }}>
      <div
        style={{
          position: "relative",
          width: "78px",
          height: "78px",
          overflow: "hidden",
          borderRadius: "var(--radius-full)",
          background: "var(--color-cream-100)",
          boxShadow: "var(--elevation-subtle)",
        }}
      >
        <Image src={src} alt={label} fill sizes="78px" style={{ objectFit: "cover" }} priority />
      </div>
      <span style={{ color: "var(--text-2)", fontSize: "14px", fontWeight: "var(--weight-semibold)" }}>{label}</span>
    </div>
  );
}

function InviteCodeCard({ inviteCode, isLoading }: { inviteCode: string; isLoading: boolean }) {
  return (
    <div
      style={{
        minHeight: "72px",
        borderRadius: "var(--radius-xl)",
        background: "var(--color-cream-100)",
        border: "1px solid var(--hairline-soft)",
        padding: "var(--space-md) var(--space-lg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
        <div style={{ minWidth: 0 }}>
          <p className="text-caption" style={{ margin: 0, color: "var(--color-coral-500)", fontWeight: "var(--weight-semibold)" }}>
            연결 코드
          </p>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--text-1)",
              fontFamily: "var(--font-mono)",
              fontSize: "24px",
              fontWeight: "var(--weight-bold)",
              lineHeight: 1.1,
              letterSpacing: "0",
            }}
          >
            {isLoading ? "코드 생성 중" : inviteCode}
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
    </div>
  );
}

export function InfoBox({
  title,
  description,
  background = "var(--canvas)",
}: {
  title: string;
  description: string;
  background?: string;
}) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        background,
        border: "1px solid var(--hairline-soft)",
        padding: "var(--space-lg)",
        boxShadow: "var(--elevation-subtle)",
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
          <p style={{ margin: 0, color: "var(--text-1)", fontSize: "16px", fontWeight: "var(--weight-bold)" }}>{title}</p>
          <p className="text-body-sm" style={{ margin: "6px 0 0", color: "var(--text-2)", lineHeight: 1.55 }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
