"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { BottomNav, Button, Card } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { getHomeQuestionSummary } from "@/lib/api/home";
import type { HomeSummary, LatestSentQuestionSummary } from "@/lib/api/home";
import { clearAccessToken } from "@/lib/auth/token";

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

const ROLE_LABEL = {
  child: "자녀",
  mother: "엄마",
  father: "아빠",
} as const;

function formatTime(iso: string) {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return "오늘 23:41분";
  return `오늘 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}분`;
}

function getQuestionTopic(questionText: string) {
  if (!questionText) return "보낸 질문";
  return questionText.replace(/[?？]/g, "").slice(0, 18);
}

function getSentQuestionForFather(summary: HomeSummary) {
  return (
    summary.latestSentQuestions.find((question) => question.recipient.role === "father") ??
    (summary.latestSentQuestion?.recipient.role === "father" ? summary.latestSentQuestion : null) ??
    summary.latestSentQuestion
  );
}

function getMemberChips(summary: HomeSummary) {
  const activeRoleSet = new Set(summary.connectedMembers.filter((member) => member.active).map((member) => member.role));
  const pendingResponseRoleSet = new Set(
    [summary.latestSentQuestion, ...summary.latestSentQuestions]
      .filter((question): question is LatestSentQuestionSummary => Boolean(question))
      .filter((question) => question.status === "sent" && !question.answered)
      .map((question) => question.recipient.role),
  );

  if (summary.role === "child") {
    return (["mother", "father"] as const).map((role) => {
      const connected = activeRoleSet.has(role);
      const statusLabel = connected && pendingResponseRoleSet.has(role) ? "답변 대기" : `연결${connected ? "됨" : " 대기"}`;
      return {
        label: `${ROLE_LABEL[role]} ${statusLabel}`,
        connected,
      };
    });
  }

  if (summary.role === "mother" || summary.role === "father") {
    const connected = summary.connectedMembers.length > 0 ? activeRoleSet.has("child") : summary.connectedToChild;
    const statusLabel = connected && pendingResponseRoleSet.has("child") ? "답변 대기" : `연결${connected ? "됨" : " 대기"}`;
    return [{ label: `자녀 ${statusLabel}`, connected }];
  }

  const chips = summary.connectedMembers.map((member) => ({
    label: `${member.roleLabel} ${
      member.active && pendingResponseRoleSet.has(member.role) ? "답변 대기" : `연결${member.active ? "됨" : " 대기"}`
    }`,
    connected: member.active,
  }));
  if (chips.length > 0) return chips;

  return [
    { label: summary.connectedToParent ? "부모 연결됨" : "부모 연결 대기", connected: summary.connectedToParent },
    { label: summary.connectedToChild ? "자녀 연결됨" : "자녀 연결 대기", connected: summary.connectedToChild },
  ];
}

function getFamilyChipStyle(label: string): CSSProperties {
  if (label.includes("답변 대기")) {
    return {
      background: "var(--color-coral-50)",
      border: "1px solid var(--color-coral-300)",
      color: "var(--color-coral-500)",
    };
  }

  if (label.includes("연결됨")) {
    return {
      background: "var(--color-sage-500)",
      border: "1px solid var(--color-sage-500)",
      color: "var(--color-cream-50)",
    };
  }

  return {
    background: "var(--surface)",
    border: "1px solid var(--hairline-soft)",
    color: "var(--text-2)",
  };
}

function SentQuestionCard({ question }: { question: LatestSentQuestionSummary | null }) {
  const recipientLabel = question ? ROLE_LABEL[question.recipient.role] : "가족";

  return (
    <Card
      variant="base"
      elevation="subtle"
      padding="18px"
      bg="var(--color-cream-100)"
      style={{ border: "1px solid var(--color-cream-300)", borderRadius: "24px" }}
    >
      <div className="flex items-start gap-3">
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-coral-400)",
            flexShrink: 0,
            marginTop: "8px",
          }}
        />
        <div className="flex flex-1 items-start justify-between gap-4">
          <div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "16px",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-ink-900)",
              }}
            >
              {question ? `${recipientLabel}에게 보낸 질문` : "보낸 질문 없음"}
            </p>
            <p className="text-body-sm" style={{ marginTop: "8px", color: "var(--color-ink-500)" }}>
              {question
                ? `${question.answered ? "답변 완료" : "답변 준비 중"} · ${getQuestionTopic(question.questionText)}`
                : "아직 가족에게 보낸 질문이 없어요."}
            </p>
          </div>
          <ChevronRight size={18} color="var(--color-ink-300)" style={{ flexShrink: 0, marginTop: "2px" }} />
        </div>
      </div>
    </Card>
  );
}

export default function Home() {
  const router = useRouter();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getHomeQuestionSummary()
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        if (!data.familyConnected) setError("연결된 가족이 없어요.");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearAccessToken();
          router.replace("/login");
          return;
        }

        console.error("[Home] Failed to load home question summary", err);
        if (!cancelled) setError("홈 정보를 불러오지 못했어요.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const memberChips = useMemo(() => (summary ? getMemberChips(summary) : []), [summary]);
  const pendingQuestion = summary?.pendingReceivedQuestion ?? null;
  const fatherSentQuestion = summary ? getSentQuestionForFather(summary) : null;

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-5 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
      <header>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: "var(--weight-semibold)",
            color: "var(--primary)",
          }}
        >
          홈
        </p>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "31px",
            fontWeight: "var(--weight-bold)",
            lineHeight: "38px",
            color: "var(--text-1)",
            marginTop: "8px",
            letterSpacing: 0,
          }}
        >
          오늘 가족과
          <br />
          남길 기록
        </h1>
        <p
          className="text-body-sm"
          style={{
            marginTop: "10px",
            width: "100%",
            maxWidth: "none",
            fontSize: "13px",
            lineHeight: "20px",
            whiteSpace: "nowrap",
          }}
        >
          질문, 답변, 처리 중인 회고록을 한 화면에서 확인합니다.
        </p>
      </header>

      {loading && (
        <Card variant="base" elevation="flat" padding="16px" bg="var(--color-cream-100)">
          <div className="flex items-center gap-2">
            <Loader2 size={16} color="var(--color-coral-500)" className="animate-spin" />
            <p className="text-body-sm">가족 기록을 불러오는 중...</p>
          </div>
        </Card>
      )}

      {!loading && error && (
        <Card variant="base" elevation="flat" padding="16px" bg="var(--color-error-bg)">
          <p className="text-body-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        </Card>
      )}

      {!loading && summary && (
        <>
          <div className="flex gap-2 overflow-x-auto">
            {memberChips.map((chip, index) => {
              const colors = getFamilyChipStyle(chip.label);

              return (
                <span
                  key={`${chip.label}-${index}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "34px",
                    padding: "0 14px",
                    borderRadius: "var(--radius-full)",
                    border: colors.border,
                    background: colors.background,
                    color: colors.color,
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                    fontWeight: "var(--weight-medium)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {chip.label}
                </span>
              );
            })}
          </div>

          <Card
            variant="feature"
            elevation="card"
            padding="22px"
            bg="var(--color-sage-50)"
            style={{ borderRadius: "28px", border: "1px solid var(--color-sage-100)" }}
          >
            <div className="flex flex-col items-start">
              <div style={{ width: "100%" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "21px",
                    fontWeight: "var(--weight-bold)",
                    lineHeight: "28px",
                    color: "var(--text-1)",
                    letterSpacing: 0,
                  }}
                >
                  서로에게 남길 말
                </h2>
                <p className="text-body-sm" style={{ marginTop: "8px" }}>
                  {pendingQuestion
                    ? `${ROLE_LABEL[pendingQuestion.sender.role]}가 보낸 질문에 아직 답변하지 않았어요.`
                    : "아직 받은 질문이 없어요."}
                </p>
              </div>
              <div className="flex items-center justify-between" style={{ width: "100%", marginTop: "24px" }}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!pendingQuestion}
                  onClick={() => pendingQuestion && router.push(`/questions/${pendingQuestion.questionSendId}`)}
                >
                  답변 촬영
                </Button>
                <p className="text-caption" style={{ color: "var(--text-3)" }}>
                  {formatTime(pendingQuestion?.receivedAt ?? "")}
                </p>
              </div>
            </div>
          </Card>

          <section className="flex flex-col gap-3">
            <SentQuestionCard question={fatherSentQuestion} />
            <Card
              variant="base"
              elevation="subtle"
              padding="18px"
              bg="var(--color-cream-100)"
              style={{ border: "1px solid var(--color-cream-300)", borderRadius: "24px" }}
            >
              <div className="flex items-start gap-3">
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--color-coral-400)",
                    flexShrink: 0,
                    marginTop: "8px",
                  }}
                />
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "16px",
                      fontWeight: "var(--weight-semibold)",
                      color: "var(--color-ink-900)",
                    }}
                  >
                    AI 정리 중
                  </p>
                  <p className="text-body-sm" style={{ marginTop: "8px", color: "var(--color-ink-500)" }}>
                    영상 업로드 완료 · 명대사를 추출하고 있어요.
                  </p>
                  {/* TODO: answers/video_clips Realtime 상태가 홈 API에 연결되면 실제 AI 처리 상태로 교체한다. */}
                </div>
              </div>
            </Card>
          </section>
        </>
      )}

      <footer className="mt-auto flex flex-col gap-3">
        {!loading && summary && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/questions/new")}
              style={{ flex: 1, height: "52px", borderRadius: "var(--radius-full)" }}
            >
              질문 만들기
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push("/diary")}
              style={{
                flex: 1,
                height: "52px",
                borderRadius: "var(--radius-full)",
                background: "var(--color-cream-50)",
                border: "1.5px solid var(--color-cream-300)",
                color: "var(--color-ink-700)",
              }}
            >
              다이어리 보기
            </Button>
          </div>
        )}

        <BottomNav
          items={NAV_ITEMS}
          activeId="home"
          onChange={(id) => {
            if (id === "home") router.push("/");
            if (id === "qna") router.push("/questions");
            if (id === "diary") router.push("/diary");
            if (id === "settings") router.push("/settings");
          }}
        />
      </footer>
    </div>
  );
}
