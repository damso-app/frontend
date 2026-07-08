"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, Button, Card } from "@/components/ui";
import { getQuestionDetail, markQuestionRead } from "@/lib/api/questions";
import type { ReceivedQuestionDetail, UserRole } from "@/lib/api/questions";

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

function AccentDot() {
  return (
    <span
      style={{
        width: "8px",
        height: "8px",
        marginTop: "8px",
        borderRadius: "50%",
        background: "var(--primary)",
        flexShrink: 0,
      }}
    />
  );
}

export default function QuestionDetailPage({ params }: { params: Promise<{ questionSendId: string }> }) {
  const { questionSendId } = use(params);
  const router = useRouter();

  const [question, setQuestion] = useState<ReceivedQuestionDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getQuestionDetail(questionSendId)
      .then((data) => {
        if (cancelled) return;
        setQuestion(data);
        if (!data.read) markQuestionRead(questionSendId).catch(() => {});
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [questionSendId]);

  const senderRoleLabel = question?.sender.role ? ROLE_LABEL[question.sender.role] : "가족";

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
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
            fontSize: "24px",
            fontWeight: "var(--weight-bold)",
            lineHeight: "29px",
            color: "var(--text-1)",
            marginTop: "8px",
          }}
        >
          {senderRoleLabel}에게 온
          <br />
          질문이에요
        </h1>
        <p className="text-body-sm" style={{ marginTop: "8px" }}>
          질문에 대해 답변 팁을 참고해도 되요.
        </p>
      </div>

      {error ? (
        <p className="text-body-sm text-center" style={{ color: "var(--color-error)" }}>
          질문을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : (
        <Card variant="base" elevation="flat" style={{ border: "1.5px solid var(--color-sage-400)" }}>
          <p className="text-body" style={{ color: "var(--text-2)" }}>
            {question ? `${senderRoleLabel} · ${question.sender.displayName ?? "가족"}` : "불러오는 중..."}
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "20px",
              fontWeight: "var(--weight-bold)",
              lineHeight: "32px",
              color: "var(--text-1)",
              marginTop: "8px",
            }}
          >
            {question ? `"${question.questionText}"` : ""}
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <Card variant="base" elevation="subtle" padding="var(--space-md)" bg="var(--surface)">
          <div className="flex items-start gap-2">
            <AccentDot />
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "18px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
                답변 팁
              </p>
              <p className="text-caption" style={{ marginTop: "4px" }}>
                짧아도 괜찮아요. 떠오르는 장면 하나부터 말해보세요.
              </p>
            </div>
          </div>
        </Card>

        <Card variant="base" elevation="subtle" padding="var(--space-md)" bg="var(--surface)">
          <div className="flex items-start gap-2">
            <AccentDot />
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

      <BottomNav items={NAV_ITEMS} activeId="qna" style={{ marginTop: "auto" }} />
    </div>
  );
}
