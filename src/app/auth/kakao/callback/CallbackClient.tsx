"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { exchangeLoginCode } from "@/lib/api/auth";
import { saveAccessToken } from "@/lib/auth/token";

interface CallbackClientProps {
  loginCode: string | null;
}

export function CallbackClient({ loginCode }: CallbackClientProps) {
  const router = useRouter();
  const didExchangeRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState(
    loginCode ? "" : "로그인 코드가 없습니다. 다시 로그인해주세요.",
  );

  useEffect(() => {
    if (!loginCode) return;
    const code = loginCode;

    if (didExchangeRef.current) return;
    didExchangeRef.current = true;

    async function exchange() {
      try {
        const { accessToken } = await exchangeLoginCode(code);
        saveAccessToken(accessToken);
        // TODO: 필수 동의 완료 여부 확인 API가 확정되면 여기서 다음 목적지를 분기한다.
        router.replace("/agreements");
      } catch {
        setErrorMessage("로그인 처리에 실패했어요. 다시 시도해주세요.");
      }
    }

    void exchange();
  }, [loginCode, router]);

  return (
    <OnboardingShell
      eyebrow="카카오 로그인"
      title={
        <>
          로그인을
          <br />
          처리하고 있어요
        </>
      }
      description="담소 계정으로 안전하게 연결하는 중입니다."
      contentJustify="center"
      footer={
        errorMessage ? (
          <Button size="lg" fullWidth onClick={() => router.replace("/login")}>
            다시 로그인하기
          </Button>
        ) : null
      }
    >
      <div
        role={errorMessage ? "alert" : "status"}
        style={{
          display: "flex",
          minHeight: "160px",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: errorMessage ? "var(--color-error)" : "var(--text-2)",
        }}
      >
        <p className="text-body-sm" style={{ margin: 0 }}>
          {errorMessage || "잠시만 기다려주세요."}
        </p>
      </div>
    </OnboardingShell>
  );
}
