"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { BottomNav, Button, Card, Textarea, Toast, ToastContainer } from "@/components/ui";
import {
  getCurrentUserFamilyMembers,
  getQuestionRecommendations,
  getQuestionThemes,
  sendQuestion,
} from "@/lib/api/questions";
import type { QuestionReceiver, QuestionTheme, RecommendedQuestion } from "@/lib/api/questions";

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

function getReceiverLabel(receiver: QuestionReceiver | null) {
  if (!receiver) return "가족";
  return receiver.roleLabel || receiver.name;
}

function optionBlockStyle(active: boolean) {
  return {
    minWidth: "92px",
    minHeight: "48px",
    padding: "0 18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-xl)",
    border: active ? "1.5px solid var(--color-coral-300)" : "1px solid var(--hairline-soft)",
    background: active ? "var(--color-coral-50)" : "var(--color-cream-100)",
    color: active ? "var(--color-coral-600)" : "var(--text-2)",
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    fontWeight: "var(--weight-semibold)",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  };
}

export default function NewQuestionPage() {
  const router = useRouter();
  const [receivers, setReceivers] = useState<QuestionReceiver[]>([]);
  const [themes, setThemes] = useState<QuestionTheme[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedQuestion[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [receiversLoading, setReceiversLoading] = useState(true);
  const [themesLoading, setThemesLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [receiverError, setReceiverError] = useState("");
  const [recommendationError, setRecommendationError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCurrentUserFamilyMembers()
      .then((data) => {
        if (cancelled) return;
        setReceivers(data);
        setSelectedReceiverId(data.find((receiver) => receiver.role === "mother")?.id ?? data[0]?.id ?? "");
      })
      .catch((error) => {
        console.error("[Questions] Failed to load connected family receivers", error);
        if (!cancelled) setReceiverError("받는 사람을 불러오지 못했어요.");
      })
      .finally(() => {
        if (!cancelled) setReceiversLoading(false);
      });

    getQuestionThemes()
      .then((data) => {
        if (cancelled) return;
        setThemes(data);
        setSelectedThemeId(data.find((theme) => theme.category === "추억")?.id ?? data[0]?.id ?? "");
      })
      .catch((error) => {
        console.error("[Questions] Failed to prepare question theme depth mapping", error);
      })
      .finally(() => {
        if (!cancelled) setThemesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedReceiver = useMemo(
    () => receivers.find((receiver) => receiver.id === selectedReceiverId) ?? null,
    [receivers, selectedReceiverId],
  );
  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedThemeId) ?? null,
    [themes, selectedThemeId],
  );
  const selectedQuestion = useMemo(
    () => recommendations.find((question) => question.id === selectedQuestionId) ?? null,
    [recommendations, selectedQuestionId],
  );
  const questionText = customQuestion.trim() || selectedQuestion?.content.trim() || "";
  const sourceType = customQuestion.trim() ? "custom" : "recommendation";
  const canSubmit = !!selectedReceiver && !!selectedTheme && !!questionText && !submitting;

  useEffect(() => {
    if (!selectedReceiver || !selectedTheme) {
      return;
    }

    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return [];
        setRecommendationsLoading(true);
        setRecommendationError("");
        setSelectedQuestionId("");
        return getQuestionRecommendations(selectedTheme.category, selectedReceiver.role, 3);
      })
      .then((data) => {
        if (!cancelled) setRecommendations(data);
      })
      .catch((error) => {
        console.error("[Questions] Failed to load recommended questions", error);
        if (!cancelled) {
          setRecommendations([]);
          setRecommendationError("추천 질문을 불러오지 못했어요. 직접 질문을 작성해 주세요.");
        }
      })
      .finally(() => {
        if (!cancelled) setRecommendationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedReceiver, selectedTheme]);

  const handleSubmit = async () => {
    if (!selectedReceiver || !selectedTheme || !questionText) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const recipientUserId = Number(selectedReceiver.userId);
      if (Number.isNaN(recipientUserId)) {
        throw new Error("받는 사람 userId가 올바르지 않습니다.");
      }

      await sendQuestion({
        recipientUserId,
        familyId: selectedReceiver.familyId,
        depth: selectedTheme.depth,
        questionText,
        source: sourceType,
        recommendationId: sourceType === "recommendation" ? selectedQuestion?.recommendationId ?? null : null,
      });
      setSuccessToast(true);
      window.setTimeout(() => router.push("/"), 550);
    } catch (error) {
      console.error("[Questions] Failed to create question", error);
      setSubmitError("질문을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
      <header className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
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
            질문하기
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
            질문을 골라
            <br />
            보내세요
          </h1>
          <p className="text-body-sm" style={{ marginTop: "10px" }}>
            질문 대상과 깊이에 맞춰 AI가 질문을 추천합니다.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            fontWeight: "var(--weight-semibold)",
            color: "var(--text-1)",
          }}
        >
          받는 사람
        </h2>
        {receiversLoading && <p className="text-body-sm">연결된 가족을 불러오는 중...</p>}
        {!receiversLoading && receiverError && (
          <p className="text-body-sm" style={{ color: "var(--color-error)" }}>
            {receiverError}
          </p>
        )}
        {!receiversLoading && !receiverError && receivers.length === 0 && (
          <Card variant="base" elevation="flat" padding="16px" bg="var(--color-cream-100)">
            <p className="text-body-sm">연결된 가족이 없어요. 먼저 가족을 연결해 주세요.</p>
          </Card>
        )}
        <div className="flex gap-2 overflow-x-auto">
          {receivers.map((receiver) => {
            const active = receiver.id === selectedReceiverId;
            return (
              <button
                key={receiver.id}
                type="button"
                onClick={() => {
                  setSelectedReceiverId(receiver.id);
                  setRecommendations([]);
                  setSelectedQuestionId("");
                  setCustomQuestion("");
                }}
                style={optionBlockStyle(active)}
              >
                {receiver.roleLabel}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "16px",
              fontWeight: "var(--weight-semibold)",
              color: "var(--text-1)",
            }}
          >
            질문 테마
          </h2>
        </div>
        {themesLoading ? (
          <p className="text-body-sm">질문 테마를 불러오는 중...</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto">
            {themes.map((theme) => {
              const active = theme.id === selectedThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setSelectedThemeId(theme.id);
                    setRecommendations([]);
                    setSelectedQuestionId("");
                    setCustomQuestion("");
                  }}
                  style={optionBlockStyle(active)}
                >
                  {theme.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            fontWeight: "var(--weight-semibold)",
            color: "var(--text-1)",
          }}
        >
          {getReceiverLabel(selectedReceiver)}에게 보내는 추천AI 질문
        </h2>
        {recommendationsLoading && <p className="text-body-sm">추천 질문을 불러오는 중...</p>}
        {!recommendationsLoading && recommendationError && (
          <p className="text-body-sm" style={{ color: "var(--color-error)" }}>
            {recommendationError}
          </p>
        )}
        {!recommendationsLoading && !recommendationError && selectedReceiver && selectedTheme && recommendations.length === 0 && (
          <Card variant="base" elevation="flat" padding="16px" bg="var(--color-cream-100)">
            <p className="text-body-sm">추천 질문이 아직 없어요. 직접 질문을 작성해 보세요.</p>
          </Card>
        )}
        <div className="flex flex-col gap-2">
          {recommendations.slice(0, 3).map((question) => {
            const active = question.id === selectedQuestionId && !customQuestion.trim();
            return (
              <Card
                key={question.id}
                variant="base"
                elevation={active ? "card" : "subtle"}
                padding="17px"
                bg={active ? "var(--color-sage-50)" : "var(--canvas)"}
                onClick={() => {
                  setSelectedQuestionId(question.id);
                  setCustomQuestion("");
                }}
                style={{
                  border: active ? "1.5px solid var(--color-sage-300)" : "1px solid var(--hairline-soft)",
                  borderRadius: "24px",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      marginTop: "6px",
                      display: "inline-flex",
                      borderRadius: "50%",
                      background: active ? "var(--color-sage-500)" : "var(--color-coral-400)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "14px",
                        fontWeight: "var(--weight-semibold)",
                        color: active ? "var(--color-sage-600)" : "var(--text-1)",
                        lineHeight: 1.45,
                      }}
                    >
                      {question.title}
                    </p>
                    <p className="text-body-sm" style={{ marginTop: "6px" }}>
                      {question.content}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Textarea
          label="직접 질문 쓰기"
          placeholder="원하는 질문을 직접 입력할 수 있어요."
          value={customQuestion}
          rows={4}
          maxLength={1000}
          onChange={(event) => {
            setCustomQuestion(event.target.value);
            if (event.target.value.trim()) setSelectedQuestionId("");
          }}
          hint="직접 질문은 최대 1000자까지 보낼 수 있어요."
          textareaStyle={{ minHeight: "112px", resize: "none" }}
        />
      </section>

      {submitError && (
        <p className="text-body-sm" style={{ color: "var(--color-error)" }}>
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-3" style={{ marginTop: "auto" }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={!canSubmit}
          leftIcon={<Send size={18} />}
          onClick={handleSubmit}
        >
          선택한 질문 보내기
        </Button>
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

      {successToast && (
        <ToastContainer>
          <Toast type="success" title="질문을 보냈어요" message="가족이 답변할 수 있도록 홈으로 돌아갑니다." />
        </ToastContainer>
      )}
    </div>
  );
}
