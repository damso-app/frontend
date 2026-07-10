"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, BottomNav, Button, Card } from "@/components/ui";
import { getReceivedQuestions } from "@/lib/api/answers";
import type { QuestionStatus, ReceivedQuestion } from "@/lib/api/answers";
import type { UserRole } from "@/lib/api/users";

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

const ROLE_LABEL: Record<UserRole, string> = {
  child: "자녀",
  mother: "엄마",
  father: "아빠",
};

const STATUS_LABEL: Record<QuestionStatus, string> = {
  sent: "답변 대기",
  answered: "답변 완료",
  cancelled: "취소됨",
  expired: "만료됨",
};

function formatSender(question: ReceivedQuestion) {
  const role = ROLE_LABEL[question.sender.role];
  const name = question.sender.displayName;
  return name && name !== role ? `${role} · ${name}` : role;
}

function formatDate(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}.${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function getStatus(question: ReceivedQuestion) {
  if (question.answered) return "answered";
  return question.status;
}

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<ReceivedQuestion[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getReceivedQuestions({ unansweredOnly: false, sort: "unanswered_first" })
      .then((data) => {
        if (!cancelled) setQuestions(data);
      })
      .catch((err) => {
        console.error("[Questions] Failed to load received questions", err);
        if (!cancelled) setError("받은 질문을 불러오지 못했어요.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = useMemo(() => questions?.filter((question) => !question.answered).length ?? 0, [questions]);

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
      <header>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: "var(--weight-medium)",
            color: "var(--primary)",
          }}
        >
          질문&답변
        </p>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "28px",
            fontWeight: "var(--weight-bold)",
            lineHeight: "34px",
            color: "var(--text-1)",
            marginTop: "8px",
            letterSpacing: 0,
          }}
        >
          받은 질문을
          <br />
          확인하세요
        </h1>
        <p className="text-body-sm" style={{ marginTop: "10px" }}>
          답변을 기다리는 질문 {pendingCount}개가 있어요.
        </p>
      </header>

      {error && (
        <Card variant="base" elevation="flat" padding="16px" bg="var(--color-error-bg)">
          <p className="text-body-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        </Card>
      )}

      {!error && questions === null && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          받은 질문을 불러오는 중...
        </p>
      )}

      {!error && questions !== null && questions.length === 0 && (
        <Card variant="base" elevation="flat" padding="18px" bg="var(--color-cream-100)">
          <p className="text-body-sm">아직 받은 질문이 없어요.</p>
          <p className="text-caption" style={{ marginTop: "8px", color: "var(--text-3)" }}>
            가족이 보낸 질문이 도착하면 여기에 표시돼요.
          </p>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => router.push("/questions/new")}
            style={{ marginTop: "14px" }}
          >
            가족에게 질문 만들기
          </Button>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        {questions?.map((question) => {
          const status = getStatus(question);
          return (
            <Card
              key={question.questionSendId}
              variant="base"
              elevation="card"
              padding="16px"
              onClick={() => router.push(`/questions/${question.questionSendId}`)}
              style={{
                border: question.read ? "1px solid var(--hairline-soft)" : "1.5px solid var(--color-coral-300)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "14px",
                      fontWeight: "var(--weight-semibold)",
                      color: "var(--text-1)",
                    }}
                  >
                    {formatSender(question)}
                  </p>
                  <p className="text-body-sm" style={{ marginTop: "8px" }}>
                    {question.questionText}
                  </p>
                  <p className="text-caption" style={{ marginTop: "8px" }}>
                    {formatDate(question.receivedAt)}
                  </p>
                </div>
                <Badge variant={status === "answered" ? "success" : "default"} size="md">
                  {STATUS_LABEL[status]}
                </Badge>
              </div>
            </Card>
          );
        })}
      </section>

      <BottomNav
        items={NAV_ITEMS}
        activeId="qna"
        onChange={(id) => {
          if (id === "home") router.push("/");
          if (id === "qna") router.push("/questions");
          if (id === "diary") router.push("/diary");
          if (id === "settings") router.push("/settings");
        }}
        style={{ marginTop: "auto" }}
      />
    </div>
  );
}
