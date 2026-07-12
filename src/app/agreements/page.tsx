"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Modal } from "@/components/ui";
import { AgreementCheckbox } from "@/components/onboarding/AgreementCheckbox";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ApiError } from "@/lib/api/client";
import { getMyOnboardingStatus, getUserAgreements, saveUserAgreements } from "@/lib/api/users";
import type { AgreementType } from "@/lib/api/users";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";
import { getNextOnboardingRoute } from "@/lib/onboarding/next-route";

const AGREEMENTS = [
  {
    id: "service_terms",
    title: "(필수) 서비스 이용약관 동의",
    description: "질문, 영상 답변, 다이어리 저장 기능 이용",
    detailTitle: "서비스 이용약관",
    sections: [
      {
        heading: "1. 서비스 목적",
        body: "담소는 가족 구성원이 서로 질문을 보내고, 영상으로 답변을 남기며, AI가 답변을 정리한 네컷 다이어리와 상세 기록을 가족 안에서 확인할 수 있도록 돕는 가족 기록 서비스입니다.",
      },
      {
        heading: "2. 계정과 가족 연결",
        body: "회원은 카카오 로그인을 통해 서비스에 진입하고 자식, 엄마, 아빠 등 본인의 역할을 선택합니다. 가족 생성자는 초대 코드를 공유할 수 있으며, 초대받은 회원은 해당 코드로 같은 가족 공간에 합류합니다. 회원은 본인의 계정과 초대 코드를 안전하게 관리해야 합니다.",
      },
      {
        heading: "3. 주요 기능",
        body: "회원은 질문 목록 확인, 가족에게 질문 보내기, 영상 답변 기록, AI 처리 상태 확인, 처리 완료된 답변의 네컷 그리드 및 상세 화면 확인 기능을 이용할 수 있습니다. 서비스 기능은 안정성, 법령, 운영 정책, 외부 API 상황에 따라 변경되거나 일시 중단될 수 있습니다.",
      },
      {
        heading: "4. 회원 콘텐츠",
        body: "회원이 등록한 질문, 영상, 음성, 답변 내용, AI 처리 결과는 가족 기록 제공을 위해 저장되고 표시됩니다. 회원은 자신이 업로드하거나 입력하는 콘텐츠가 타인의 권리, 명예, 개인정보를 침해하지 않도록 주의해야 합니다.",
      },
      {
        heading: "5. 이용 제한",
        body: "불법 촬영물, 타인의 동의 없는 민감정보, 욕설·비방·차별 표현, 서비스 장애를 유발하는 행위, 초대 코드의 무단 공유나 타인 계정 이용은 제한될 수 있습니다. 회사는 필요한 경우 콘텐츠 노출 제한, 이용 정지, 관계 기관 신고 등 필요한 조치를 할 수 있습니다.",
      },
      {
        heading: "6. AI 처리 결과",
        body: "AI가 생성하는 제목, 명대사, 요약, 감정 태그 등은 영상 답변을 더 쉽게 돌아보기 위한 보조 정보입니다. 자동 처리 특성상 일부 내용이 부정확하거나 맥락을 완전히 반영하지 못할 수 있습니다.",
      },
      {
        heading: "7. 책임 범위",
        body: "담소는 안정적인 서비스 제공을 위해 노력하지만, 네트워크 장애, 외부 플랫폼 장애, 회원 기기 환경, 불가항력으로 인한 이용 지연이나 데이터 처리 실패가 발생할 수 있습니다. 회원은 중요한 원본 기록을 별도로 보관하는 것을 권장합니다.",
      },
    ],
  },
  {
    id: "privacy_policy",
    title: "(필수) 개인정보 처리 동의",
    description: "이름, 가족 정보, 질문, 영상 정보 처리",
    detailTitle: "개인정보 처리 동의",
    sections: [
      {
        heading: "1. 수집하는 개인정보",
        body: "담소는 카카오 로그인 식별 정보, 이름 또는 프로필 정보, 선택한 가족 역할, 가족 초대 코드 및 가족 연결 정보, 질문과 답변 기록, 영상 파일 정보, 서비스 이용 기록, 기기·브라우저 정보, 오류 로그를 처리할 수 있습니다.",
      },
      {
        heading: "2. 민감할 수 있는 가족 기록",
        body: "영상과 음성 답변에는 가족관계, 생활사, 감정, 건강, 경제 상황 등 민감한 이야기가 포함될 수 있습니다. 담소는 이러한 기록을 가족 다이어리 제공, 영상 재생, AI 요약 및 명대사 생성, 서비스 안정성 확보 목적에 한해 처리합니다.",
      },
      {
        heading: "3. 이용 목적",
        body: "개인정보는 회원 식별과 로그인 유지, 온보딩 상태 관리, 가족 생성·초대·합류, 질문 발송과 답변 제출, 영상 업로드와 재생, AI 처리 상태 안내, 네컷 다이어리 구성, 고객 문의 대응, 보안과 장애 대응에 사용됩니다.",
      },
      {
        heading: "4. 보관 기간",
        body: "개인정보와 가족 기록은 회원이 서비스를 이용하는 동안 보관되며, 회원 탈퇴, 가족 기록 삭제 요청, 법령상 보관 의무 종료 등 보관 목적이 사라지면 지체 없이 파기합니다. 단, 분쟁 대응, 부정 이용 방지, 관계 법령 준수를 위해 필요한 정보는 정해진 기간 동안 보관될 수 있습니다.",
      },
      {
        heading: "5. 제3자 제공 및 처리 위탁",
        body: "담소는 서비스 제공에 필요한 범위에서 카카오 로그인, 클라우드 저장소, AI 처리 인프라, 데이터베이스 및 호스팅 제공자에게 개인정보 처리를 위탁할 수 있습니다. 법령상 요구가 있거나 회원이 별도 동의한 경우를 제외하고 개인정보를 목적 외로 제3자에게 판매하거나 제공하지 않습니다.",
      },
      {
        heading: "6. 회원의 권리",
        body: "회원은 본인의 개인정보에 대해 열람, 정정, 삭제, 처리 정지, 동의 철회를 요청할 수 있습니다. 가족 구성원의 기록에는 다른 가족의 개인정보와 초상, 음성이 함께 포함될 수 있으므로 삭제나 제공 범위는 가족 기록의 성격과 법령에 따라 조정될 수 있습니다.",
      },
    ],
  },
  {
    id: "camera_microphone",
    title: "(필수) 카메라·마이크 권한 안내",
    description: "카메라 및 마이크 권한 허용이 필수",
    detailTitle: "카메라·마이크 권한 안내",
    sections: [
      {
        heading: "1. 권한 사용 목적",
        body: "담소는 부모님 또는 가족 구성원이 질문에 영상으로 답변할 수 있도록 카메라와 마이크 접근 권한을 요청합니다. 해당 권한은 영상 촬영, 음성 녹음, 녹화 미리보기, 답변 업로드에 사용됩니다.",
      },
      {
        heading: "2. 권한이 필요한 시점",
        body: "카메라와 마이크 권한은 영상 답변 기록 화면에서만 필요합니다. 권한을 허용하지 않으면 영상 답변 녹화와 제출 기능을 정상적으로 이용할 수 없습니다.",
      },
      {
        heading: "3. 녹화와 업로드",
        body: "담소는 회원이 녹화 시작과 제출을 직접 선택한 경우에만 영상 답변을 업로드합니다. 녹화 중인 영상과 음성에는 주변 사람의 얼굴, 목소리, 생활공간이 포함될 수 있으므로 촬영 전 주변의 동의를 확인해주세요.",
      },
      {
        heading: "4. 권한 관리",
        body: "회원은 브라우저 또는 기기 설정에서 언제든 카메라·마이크 권한을 변경할 수 있습니다. 권한을 철회하면 이후 영상 답변 기능 이용 시 다시 권한 허용이 필요할 수 있습니다.",
      },
    ],
  },
  {
    id: "data_usage",
    title: "(필수) 데이터 활용 동의",
    description: "가족의 대화를 활용해 인공지능 처리",
    detailTitle: "데이터 활용 동의",
    sections: [
      {
        heading: "1. 활용 대상 데이터",
        body: "담소는 질문 내용, 답변 영상과 음성, 영상 길이와 파일 정보, 전사 텍스트, AI 처리 상태, 가족 역할과 질문·답변 맥락을 AI 처리와 다이어리 구성에 활용합니다.",
      },
      {
        heading: "2. AI 처리 목적",
        body: "AI는 답변 영상을 전사하고, 다이어리 제목, 한 줄 요약, 대표 명대사, 감정 태그, 네컷 묶음 제목을 생성하는 데 사용됩니다. 처리 결과는 가족이 기록을 더 쉽게 찾고 회상할 수 있도록 서비스 화면에 표시됩니다.",
      },
      {
        heading: "3. 처리 흐름",
        body: "회원이 영상을 제출하면 답변은 submitted, processing, completed 또는 failed 상태로 관리됩니다. 처리 완료 시 영상 재생용 경로, 썸네일, 전사, 요약, 명대사, 감정 태그가 가족 다이어리와 상세 화면에 표시될 수 있습니다.",
      },
      {
        heading: "4. 가족 안에서의 이용",
        body: "처리된 기록은 기본적으로 연결된 가족 구성원에게 제공됩니다. 가족 초대와 합류가 완료된 구성원은 같은 가족 공간의 질문, 답변, 네컷 다이어리, 상세 기록을 확인할 수 있습니다.",
      },
      {
        heading: "5. 품질과 한계",
        body: "AI 전사와 요약은 녹음 환경, 발음, 배경 소음, 방언, 영상 품질에 따라 부정확할 수 있습니다. 담소는 가족 기록을 돕기 위한 보조 결과를 제공하며, 중요한 판단이나 법적·의료적·재정적 결정의 근거로 사용하지 않는 것을 권장합니다.",
      },
      {
        heading: "6. 동의 철회",
        body: "회원은 데이터 활용 동의를 철회하거나 기록 삭제를 요청할 수 있습니다. 다만 이미 가족에게 표시된 기록, 백업, 보안 로그, 법령상 보관이 필요한 정보는 처리 완료까지 시간이 걸리거나 일부 제한될 수 있습니다.",
      },
    ],
  },
] as const satisfies readonly {
  id: AgreementType;
  title: string;
  description: string;
  detailTitle: string;
  sections: readonly {
    heading: string;
    body: string;
  }[];
}[];

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
  const [checked, setChecked] = useState<Record<AgreementType, boolean>>(uncheckedAgreements);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingAgreements, setIsLoadingAgreements] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAgreementId, setSelectedAgreementId] = useState<AgreementType | null>(null);

  const allChecked = useMemo(() => AGREEMENTS.every((agreement) => checked[agreement.id]), [checked]);
  const selectedAgreement = AGREEMENTS.find((agreement) => agreement.id === selectedAgreementId);

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
      const onboardingStatus = await getMyOnboardingStatus();
      router.push(getNextOnboardingRoute(onboardingStatus));
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
            actionDisabled={false}
            onAction={() => setSelectedAgreementId(agreement.id)}
            onChange={(event) =>
              setChecked((current) => ({
                ...current,
                [agreement.id]: event.target.checked,
              }))
            }
          />
        ))}
      </div>

      <Modal
        isOpen={Boolean(selectedAgreement)}
        title={selectedAgreement?.detailTitle}
        size="lg"
        onClose={() => setSelectedAgreementId(null)}
        footer={
          <Button size="md" variant="soft" onClick={() => setSelectedAgreementId(null)}>
            확인
          </Button>
        }
        style={{
          maxHeight: "min(720px, calc(100dvh - 40px))",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedAgreement && (
          <div
            style={{
              maxHeight: "min(560px, calc(100dvh - 190px))",
              overflowY: "auto",
              paddingRight: "2px",
            }}
          >
            <p
              className="text-caption"
              style={{
                margin: "0 0 var(--space-md)",
                color: "var(--text-3)",
                lineHeight: 1.6,
                wordBreak: "keep-all",
              }}
            >
              시행일: 2026년 7월 12일
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {selectedAgreement.sections.map((section) => (
                <section key={section.heading}>
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "15px",
                      fontWeight: "var(--weight-semibold)",
                      lineHeight: 1.45,
                      color: "var(--text-1)",
                    }}
                  >
                    {section.heading}
                  </h3>
                  <p
                    className="text-body-sm"
                    style={{
                      margin: 0,
                      color: "var(--text-2)",
                      lineHeight: 1.7,
                      wordBreak: "keep-all",
                    }}
                  >
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </div>
        )}
      </Modal>

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
