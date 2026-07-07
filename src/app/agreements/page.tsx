"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { AgreementCheckbox } from "@/components/onboarding/AgreementCheckbox";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ApiError } from "@/lib/api/client";
import { getUserAgreements, saveUserAgreements } from "@/lib/api/users";
import type { AgreementType } from "@/lib/api/users";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";

const AGREEMENTS = [
  {
    id: "service_terms",
    title: "(필수) 서비스 이용약관 동의",
    description: "질문, 영상 답변, 다이어리 저장 기능 이용",
  },
  {
    id: "privacy_policy",
    title: "(필수) 개인정보 처리 동의",
    description: "이름, 가족 정보, 질문, 영상 정보 처리",
  },
  {
    id: "camera_microphone",
    title: "(필수) 카메라·마이크 권한 안내",
    description: "카메라 및 마이크 권한 허용이 필수",
  },
  {
    id: "data_usage",
    title: "(필수) 데이터 활용 동의",
    description: "가족의 대화를 활용해 인공지능 처리",
  },
] as const satisfies readonly {
  id: AgreementType;
  title: string;
  description: string;
}[];

const initialChecked: Record<AgreementType, boolean> = {
  service_terms: true,
  privacy_policy: true,
  camera_microphone: true,
  data_usage: false,
};

const uncheckedAgreements: Record<AgreementType, boolean> = {
  service_terms: false,
  privacy_policy: false,
  camera_microphone: false,
  data_usage: false,
};

function getAgreementErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return "필수 동의 항목을 확인해주세요.";
    if (error.status === 401) return "로그인이 필요합니다.";
  }

  return "동의 정보를 처리하지 못했습니다. 다시 시도해주세요.";
}

export default function AgreementsPage() {
  const router = useRouter();
  const didFetchRef = useRef(false);
  const [checked, setChecked] = useState<Record<AgreementType, boolean>>(initialChecked);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingAgreements, setIsLoadingAgreements] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const allChecked = useMemo(() => AGREEMENTS.every((agreement) => checked[agreement.id]), [checked]);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    async function fetchAgreements() {
      try {
        const result = await getUserAgreements();
        const nextChecked = { ...uncheckedAgreements };

        for (const agreement of result.agreements) {
          if (agreement.type in nextChecked) {
            nextChecked[agreement.type] = agreement.agreed;
          }
        }

        setChecked(nextChecked);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearAccessToken();
          router.replace("/login");
          return;
        }

        setErrorMessage(getAgreementErrorMessage(error));
      } finally {
        setIsLoadingAgreements(false);
      }
    }

    void fetchAgreements();
  }, [router]);

  const handleSubmit = async () => {
    if (!allChecked || isLoadingAgreements || isSaving) return;

    setIsSaving(true);
    setErrorMessage("");

    try {
      await saveUserAgreements({
        agreements: AGREEMENTS.map((agreement) => ({
          type: agreement.id,
          agreed: true,
        })),
      });
      router.push("/onboarding/role");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setErrorMessage(getAgreementErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingShell
      eyebrow="개인정보 약관 동의"
      title={
        <>
          가족 기록을 위해
          <br />
          먼저 확인해주세요
        </>
      }
      description={
        <>
          영상과 음성에는 가족의 민감한 이야기가 담길 수 있어
          <br />
          아래 약관을 필수적으로 동의해주세요.
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
            <p
              role="alert"
              className="text-caption"
              style={{ margin: 0, textAlign: "center", color: "var(--color-error)" }}
            >
              {errorMessage}
            </p>
          )}
          <Button
            size="lg"
            fullWidth
            disabled={!allChecked || isLoadingAgreements || isSaving}
            loading={isSaving}
            onClick={handleSubmit}
          >
            모두 동의하고 시작하기
          </Button>
          <p
            className="text-caption"
            style={{
              margin: 0,
              textAlign: "center",
              color: "var(--text-3)",
              whiteSpace: "pre-line",
            }}
          >
            {"서비스 이용약관과\n개인정보 처리방침에 동의합니다."}
          </p>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {AGREEMENTS.map((agreement) => (
          <AgreementCheckbox
            key={agreement.id}
            id={`agreement-${agreement.id}`}
            title={agreement.title}
            description={agreement.description}
            checked={checked[agreement.id]}
            disabled={isLoadingAgreements || isSaving}
            onChange={(event) =>
              setChecked((current) => ({
                ...current,
                [agreement.id]: event.target.checked,
              }))
            }
          />
        ))}
      </div>

      <Card
        variant="base"
        elevation="subtle"
        padding="var(--space-md)"
        bg="var(--color-coral-50)"
        style={{
          border: "1px solid var(--color-coral-100)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-sm)" }}>
          <span
            aria-hidden="true"
            style={{
              width: "8px",
              height: "8px",
              flexShrink: 0,
              marginTop: "8px",
              borderRadius: "var(--radius-full)",
              background: "var(--primary)",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-sans)",
                fontSize: "15px",
                fontWeight: "var(--weight-semibold)",
                lineHeight: 1.45,
                color: "var(--text-1)",
              }}
            >
              데이터 활용
            </p>
            <p
              className="text-caption"
              style={{
                margin: "4px 0 0",
                color: "var(--text-2)",
                whiteSpace: "pre-line",
              }}
            >
              {"모든 기록은 가족에게만 제공되고,\n가족 다이어리에 보관됩니다."}
            </p>
          </div>
        </div>
      </Card>
    </OnboardingShell>
  );
}
