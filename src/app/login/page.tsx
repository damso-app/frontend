"use client";

import Image from "next/image";
import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getKakaoLoginUrl } from "@/lib/api/auth";

const loginHighlights = [
  {
    title: "가족만 보는 기록",
    description: "기본 열람 범위는 연결된 가족입니다.",
  },
  {
    title: "영상과 요약을 함께 저장",
    description: "질문·영상을 카카오톡에 공유할 수 있어요.",
  },
];

const heroAvatarHeight = 93;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleKakaoLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { loginUrl } = await getKakaoLoginUrl();
      window.location.href = loginUrl;
    } catch {
      setErrorMessage("카카오 로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <OnboardingShell
      eyebrow="간편 가입"
      title={
        <>
          가족 기록을
          <br />
          시작해볼까요?
        </>
      }
      description={
        <>
          별도 비밀번호 없이 카카오 계정으로 로그인하고,
          <br />
          가족 초대는 카카오톡으로 보냅니다.
        </>
      }
      contentJustify="flex-start"
      contentPadding="var(--space-xxxl) 0 var(--space-xl)"
      style={{
        maxWidth: "430px",
        padding: "var(--space-xxxl) var(--page-padding-mobile) max(var(--space-xl), env(safe-area-inset-bottom))",
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
          <Button size="lg" fullWidth onClick={handleKakaoLogin} loading={isLoading} disabled={isLoading}>
            {isLoading ? "카카오로 이동 중" : "카카오로 시작하기"}
          </Button>
        </>
      }
    >
      <Card
        variant="sage"
        elevation="subtle"
        padding="var(--space-xl)"
        bg="var(--color-sage-50)"
        style={{
          minHeight: "220px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "210px", position: "relative", zIndex: 1 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: "20px",
              fontWeight: "var(--weight-bold)",
              lineHeight: 1.35,
              color: "var(--text-1)",
            }}
          >
            카카오톡으로 빠르게 연결
          </p>
          <p className="text-body-sm" style={{ margin: "8px 0 0", color: "var(--text-2)" }}>
            링크만 눌러도 가족들과 연결 가능해요.
          </p>
        </div>

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "8px",
            bottom: "10px",
            display: "flex",
            alignItems: "flex-end",
            gap: "var(--space-xs)",
          }}
        >
          <AvatarImage src="/children.png" width={98} height={105} />
          <AvatarImage src="/father.png" width={104} height={116} />
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {loginHighlights.map((item) => (
          <Card
            key={item.title}
            variant="base"
            elevation="subtle"
            padding="var(--space-md)"
            bg="var(--color-cream-100)"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-sm)" }}>
              <span
                aria-hidden="true"
                style={{
                  width: "8px",
                  height: "8px",
                  flexShrink: 0,
                  marginTop: "9px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-coral-400)",
                }}
              />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontSize: "16px",
                    fontWeight: "var(--weight-semibold)",
                    lineHeight: 1.45,
                    color: "var(--text-1)",
                  }}
                >
                  {item.title}
                </p>
                <p className="text-caption" style={{ margin: "4px 0 0" }}>
                  {item.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </OnboardingShell>
  );
}

function AvatarImage({ src, width, height }: { src: string; width: number; height: number }) {
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      style={{
        width: "auto",
        height: `${heroAvatarHeight}px`,
        objectFit: "contain",
      }}
    />
  );
}
