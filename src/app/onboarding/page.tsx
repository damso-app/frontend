"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, Card } from "@/components/ui";
import { OnboardingInfoCard } from "@/components/onboarding/OnboardingInfoCard";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

const cuts = [
  { title: "처음 물어본 날", duration: "00:42" },
  { title: "요즘의 고민", duration: "00:42" },
  { title: "젊은 시절 꿈", duration: "00:42" },
  { title: "남기고 싶은 말", duration: "00:42" },
];

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    const loginRedirectTimer = window.setTimeout(() => {
      router.replace("/login");
    }, 30000);

    return () => window.clearTimeout(loginRedirectTimer);
  }, [router]);

  return (
    <OnboardingShell
      eyebrow="살아있는 회고록"
      title={
        <>
          지금 묻지 않으면
          <br />
          남지 않을 이야기
        </>
      }
      description="부모와 자녀가 서로 묻고 답한 순간을 영상 회고록으로 남겨요."
      footer={
        <>
          <Button size="lg" fullWidth onClick={() => router.push("/login")}>
            시작하기
          </Button>
          <p className="text-caption" style={{ margin: 0, textAlign: "center", color: "var(--text-3)" }}>
            카카오 로그인으로 30초 안에 시작
          </p>
        </>
      }
      contentJustify="flex-start"
      contentPadding="var(--space-lg) 0 var(--space-xl)"
    >
      <Card variant="feature" elevation="card" padding="var(--space-lg)">
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: "18px",
            fontWeight: "var(--weight-bold)",
            lineHeight: 1.4,
            color: "var(--text-1)",
          }}
        >
          오늘의 가족 기록
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-sm)",
            marginTop: "var(--space-md)",
          }}
        >
          {cuts.map((cut) => (
            <div
              key={cut.title}
              style={{
                minHeight: "148px",
                borderRadius: "var(--radius-xl)",
                background: "var(--color-ink-900)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-xs)",
                boxSizing: "border-box",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  aspectRatio: "1 / 0.76",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-sage-100)",
                  color: "var(--color-coral-500)",
                  flexShrink: 0,
                }}
              >
                <Play size={30} fill="currentColor" strokeWidth={0} />
              </span>
              <div style={{ display: "flex", minWidth: 0, flexDirection: "column", gap: "2px" }}>
                <p
                  style={{
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                    fontWeight: "var(--weight-semibold)",
                    lineHeight: 1.35,
                    color: "var(--on-primary)",
                  }}
                >
                  {cut.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    fontWeight: "var(--weight-medium)",
                    lineHeight: 1.35,
                    color: "var(--color-ink-200)",
                  }}
                >
                  {cut.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <OnboardingInfoCard
        title="질문마다 한 컷의 영상"
        description="AI가 답변을 요약하고, 명대사를 뽑아 가족 다이어리로 정리합니다."
        bg="var(--color-coral-50)"
        style={{ border: "1px solid var(--color-coral-100)" }}
      />
    </OnboardingShell>
  );
}
