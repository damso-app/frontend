"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, Button, Card } from "@/components/ui";
import { getClipGrid } from "@/lib/api/clips";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

export default function AnswerProcessingPage({ params }: { params: Promise<{ answerId: string }> }) {
  const { answerId } = use(params);
  const router = useRouter();

  const [elapsedMs, setElapsedMs] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (completed || failed || timedOut) return;
    const id = setInterval(() => {
      if (startRef.current != null) setElapsedMs(Date.now() - startRef.current);
    }, 100);
    return () => clearInterval(id);
  }, [completed, failed, timedOut]);

  // TODO: Supabase Realtime(family:{family_id} 채널, answer_status_updated)이 연동되면
  // 폴링 대신 그쪽 이벤트로 완료/실패를 감지한다. 아직 채널 접속 정보가 없어 임시로 폴링한다.
  // /v1/answers/{id}/clip은 완료 전엔 항상 404라 실패 여부를 구분할 수 없어서,
  // status를 그대로 내려주는 /v1/clips에서 이 answerId 항목을 찾아 확인한다.
  useEffect(() => {
    if (completed || failed) return;
    let cancelled = false;
    const answerIdNum = Number(answerId);

    const poll = async () => {
      try {
        const groups = await getClipGrid();
        if (cancelled) return;
        const entry = groups.flatMap((g) => g.clips).find((c) => c.answerId === answerIdNum);
        if (entry?.status === "completed") setCompleted(true);
        else if (entry?.status === "failed") setFailed(true);
      } catch (err) {
        // 네트워크 오류 등 일시적인 문제 — 상태를 단정 짓지 않고 다음 폴링에서 재시도
        console.error("answer status poll failed", err);
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [answerId, completed, failed]);

  useEffect(() => {
    if (completed || failed) return;
    const id = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [completed, failed]);

  const elapsedSec = elapsedMs / 1000;

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
            color: "var(--color-sage-400)",
          }}
        >
          처리 중
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
          영상 회고록을
          <br />
          정리하고 있어요
        </h1>
        <p className="text-body-sm" style={{ marginTop: "8px" }}>
          AI가 답변을 정리하는 동안 잠시만 기다려주세요.
        </p>
      </div>

      <Card variant="base" elevation="card" padding="var(--space-lg)">
        <div className="flex items-center justify-between">
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              fontWeight: "var(--weight-bold)",
              color: "var(--text-1)",
            }}
          >
            AI 정리 소요시간
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: "var(--weight-bold)",
              color: completed ? "var(--color-sage-400)" : failed ? "var(--color-error)" : "var(--text-3)",
            }}
          >
            {completed ? "완료" : failed ? "실패" : "처리 중"}
          </p>
        </div>

        <div
          className="relative mt-4 w-full overflow-hidden"
          style={{ height: "10px", background: "var(--color-cream-200)", borderRadius: "var(--radius-full)" }}
        >
          {completed || failed ? (
            <div
              className="absolute left-0 top-0 h-full"
              style={{
                width: "100%",
                background: completed ? "var(--color-sage-400)" : "var(--color-error)",
                borderRadius: "var(--radius-full)",
                transition: "width 200ms linear",
              }}
            />
          ) : (
            <div
              className="absolute top-0 h-full"
              style={{
                background: "var(--color-sage-400)",
                borderRadius: "var(--radius-full)",
                animation: "memoir-progress-indeterminate 1.4s ease-in-out infinite",
              }}
            />
          )}
        </div>

        <div className="mt-2">
          <span className="text-caption">{elapsedSec.toFixed(1)}초 경과</span>
        </div>

        {completed && (
          <p
            className="text-center"
            style={{
              marginTop: "24px",
              fontFamily: "var(--font-sans)",
              fontSize: "20px",
              fontWeight: "var(--weight-bold)",
              color: "var(--text-1)",
            }}
          >
            영상 회고록이 완성되었어요.
          </p>
        )}

        {failed && (
          <p className="text-body-sm text-center" style={{ marginTop: "24px", color: "var(--color-error)" }}>
            AI가 답변 영상을 처리하지 못했어요. 다시 촬영해서 제출해주세요.
          </p>
        )}

        {timedOut && !completed && !failed && (
          <p className="text-body-sm text-center" style={{ marginTop: "24px", color: "var(--color-error)" }}>
            생각보다 오래 걸리고 있어요. 잠시 후 다이어리에서 다시 확인해주세요.
          </p>
        )}
      </Card>

      <div className="flex items-center justify-center gap-4">
        <Button variant="secondary" size="lg" disabled={!completed} onClick={() => router.push(`/diary/${answerId}`)}>
          답변 영상 보기
        </Button>
        <Button variant="sage" size="lg" onClick={() => router.push("/questions")}>
          다음 질문 보기
        </Button>
      </div>

      {/* 상대방에게 질문 보내기 — 발송 API 미확인, 목적지 화면도 아직 없음 (docs/route-map.md 참고) */}
      <button
        type="button"
        onClick={() => router.push("/questions/new")}
        className="flex w-full items-center justify-between gap-4 text-left"
        style={{
          background: "var(--surface)",
          border: "var(--border-base)",
          borderRadius: "var(--radius-xl)",
          padding: "12px 16px",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: "var(--weight-medium)",
            color: "var(--text-2)",
            whiteSpace: "nowrap",
          }}
        >
          상대방에게 질문하기
        </span>
        <span className="text-caption" style={{ color: "var(--text-muted)", textAlign: "right" }}>
          원하는 질문을 직접 입력할 수 있어요.
        </span>
      </button>

      <Button variant="primary" size="lg" fullWidth onClick={() => router.push("/questions/new")}>
        상대방에게 질문하기
      </Button>

      <BottomNav items={NAV_ITEMS} activeId="qna" style={{ marginTop: "auto" }} />
    </div>
  );
}
