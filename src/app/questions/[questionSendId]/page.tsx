"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Home, MessageCircleQuestion, Settings } from "lucide-react";
import { BottomNav, Button, Card } from "@/components/ui";
import {
  getReceivedQuestionDetail,
  markReceivedQuestionRead,
} from "@/lib/api/answers";
import type { ReceivedQuestionDetail } from "@/lib/api/answers";
import type { UserRole } from "@/lib/api/users";

const NAV_ITEMS = [
  { id: "home", label: "홈", icon: <Home size={14} /> },
  { id: "qna", label: "질문&답변", icon: <MessageCircleQuestion size={14} /> },
  { id: "diary", label: "다이어리", icon: <BookOpen size={14} /> },
  { id: "settings", label: "설정", icon: <Settings size={14} /> },
];


const ROLE_LABEL: Record<UserRole, string> = {
  child: "자녀",
  mother: "엄마",
  father: "아빠",
};

function formatSender(question: ReceivedQuestionDetail) {
  const role = ROLE_LABEL[question.sender.role];
  const name = question.sender.displayName;

  return name && name !== role ? `${role} · ${name}` : role;
}

function getRelationshipLabel(question: ReceivedQuestionDetail | null) {
  if (!question) return "가족";

  return ROLE_LABEL[question.sender.role];
}

function RedDot() {
  return (
    <span
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "var(--color-error)",
        flexShrink: 0,
        marginTop: "7px",
      }}
    />
  );
}

export default function ReceivedQuestionDetailPage({
  params,
}: {
  params: Promise<{ questionSendId: string }>;
}) {
  const { questionSendId } = use(params);
  const router = useRouter();

  const [question, setQuestion] = useState<ReceivedQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getReceivedQuestionDetail(questionSendId)
      .then((data) => {
        if (cancelled) return;

        setQuestion(data);

        if (!data.read) {
          markReceivedQuestionRead(questionSendId).catch((err) => {
            console.error("[Questions] Failed to mark question as read", err);
          });
        }
      })
      .catch((err) => {
        console.error("[Questions] Failed to load received question detail", err);

        if (!cancelled) {
          setError("질문을 찾을 수 없거나 접근 권한이 없어요.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [questionSendId]);

  const relationshipLabel = getRelationshipLabel(question);

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
      <header className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => router.push("/questions")}
          aria-label="받은 질문 목록으로 이동"
          style={{
            width: "36px",
            height: "36px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--hairline-soft)",
            borderRadius: "50%",
            background: "var(--canvas)",
            color: "var(--text-2)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: "var(--weight-medium)",
              color: "var(--primary)",
            }}
          >
            받은 질문
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
            {relationshipLabel}에게 온
            <br />
            질문이에요
          </h1>

          <p className="text-body-sm" style={{ marginTop: "10px" }}>
            질문에 대해 답변 팁을 참고해도 돼요.
          </p>
        </div>
      </header>

      {loading && (
        <p
          className="text-body-sm text-center"
          style={{ color: "var(--text-3)" }}
        >
          질문을 불러오는 중...
        </p>
      )}

      {!loading && error && (
        <Card
          variant="base"
          elevation="flat"
          padding="16px"
          bg="var(--color-error-bg)"
        >
          <p className="text-body-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push("/questions")}
            style={{ marginTop: "14px" }}
          >
            목록으로 돌아가기
          </Button>
        </Card>
      )}

      {question && (
        <>
          <Card
            variant="feature"
            elevation="card"
            padding="20px"
            bg="var(--color-coral-50)"
          >
            <div className="flex items-start gap-3">
              <RedDot />

              <div>
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

                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "20px",
                    fontWeight: "var(--weight-semibold)",
                    lineHeight: "30px",
                    color: "var(--text-1)",
                    marginTop: "12px",
                  }}
                >
                  “{question.questionText}”
                </p>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Card
              variant="base"
              elevation="subtle"
              padding="16px"
              bg="var(--color-cream-200)"
            >
              <div className="flex items-start gap-3">
                <RedDot />

                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "15px",
                      fontWeight: "var(--weight-semibold)",
                      color: "var(--text-1)",
                    }}
                  >
                    답변 팁
                  </p>

                  <p className="text-body-sm" style={{ marginTop: "6px" }}>
                    짧아도 괜찮아요. 떠오르는 장면 하나부터 말해보세요.
                  </p>
                </div>
              </div>
            </Card>

        <Card variant="base" elevation="subtle" padding="var(--space-md)" bg="var(--surface)">
          <div className="flex items-start gap-2">
            <RedDot />
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "18px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
                프라이버시
              </p>
              <p className="text-caption" style={{ marginTop: "4px" }}>
                촬영 후 저장 여부를 직접 선택할 수 있습니다.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => router.push(`/questions/${questionSendId}/record`)}
      >
        질문에 답변하기
      </Button>
        </>
      )}

      <BottomNav
        items={NAV_ITEMS}
        activeId="qna"
        onChange={(id) => {
          if (id === "home") router.push("/");
          if (id === "qna") router.push("/questions");
          if (id === "diary") router.push("/diary");
          if (id === "settings") router.push("/settings");
        }}
      />
    </div>
  );
}
