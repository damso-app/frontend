"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, Button, Card } from "@/components/ui";
import { getAnswerClip } from "@/lib/api/answers";
import type { AnswerClip } from "@/lib/api/answers";
import { getClipGrid } from "@/lib/api/clips";
import type { ClipGridItem } from "@/lib/api/clips";

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

function AccentDot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: "8px",
        height: "8px",
        marginTop: "8px",
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

export default function CutDetailPage({
  params,
}: {
  params: Promise<{ date: string; answerId: string }>;
}) {
  const { date, answerId } = use(params);
  const router = useRouter();

  const [siblingClips, setSiblingClips] = useState<ClipGridItem[] | null>(null);
  const [clip, setClip] = useState<AnswerClip | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getClipGrid().then((groups) => groups.find((g) => g.date === date)?.clips ?? null),
      getAnswerClip(answerId),
    ])
      .then(([clips, clipData]) => {
        if (cancelled) return;
        setSiblingClips(clips);
        setClip(clipData);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [date, answerId]);

  const index = siblingClips?.findIndex((c) => String(c.answerId) === answerId) ?? -1;
  const prevClip = index > 0 ? siblingClips?.[index - 1] : undefined;
  const nextClip = siblingClips && index >= 0 && index < siblingClips.length - 1 ? siblingClips[index + 1] : undefined;
  const questionNumber = index >= 0 ? index + 1 : undefined;

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
      <button
        type="button"
        onClick={() => router.push(`/diary/${date}`)}
        className="flex items-center gap-1 self-start"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          fontWeight: "var(--weight-medium)",
          color: "var(--text-3)",
        }}
      >
        ← 뒤로가기
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
          회고록 상세 보기
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
          {questionNumber ? `Q${questionNumber}. ` : ""}
          {clip?.title ?? "답변"}
        </h1>
      </div>

      {error && (
        <p className="text-body-sm text-center" style={{ color: "var(--color-error)" }}>
          답변을 불러오지 못했어요.
        </p>
      )}

      {!error && !clip && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          불러오는 중...
        </p>
      )}

      {clip && (
        <>
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: "342 / 220",
              background: "var(--text-1)",
              borderRadius: "var(--radius-xxxl)",
              boxShadow: "var(--elevation-card)",
            }}
          >
            {clip.videoUrl && (
              <video
                src={clip.videoUrl}
                poster={clip.thumbnailUrl ?? undefined}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* 원본 질문 텍스트를 반환하는 API가 없어(docs/route-map.md 참고) "질문" 카드는 생략하고
              실제 데이터가 있는 AI 요약/한마디만 표시한다. */}
          <Card variant="sage" elevation="subtle" padding="var(--space-md)">
            <div className="flex items-start gap-2">
              <AccentDot color="var(--color-sage-400)" />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
                  AI 요약
                </p>
                <p className="text-caption" style={{ marginTop: "4px" }}>
                  {clip.oneLineSummary ?? "-"}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="quote" elevation="subtle" padding="var(--space-md)">
            <div className="flex items-start gap-2">
              <AccentDot color="var(--primary)" />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
                  한마디
                </p>
                <p className="text-caption" style={{ marginTop: "4px" }}>
                  {clip.quote ? `“${clip.quote}”` : "-"}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              fullWidth
              disabled={!prevClip}
              onClick={() => prevClip && router.push(`/diary/${date}/${prevClip.answerId}`)}
            >
              이전 질문
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={!nextClip}
              onClick={() => nextClip && router.push(`/diary/${date}/${nextClip.answerId}`)}
            >
              다음 질문
            </Button>
          </div>
        </>
      )}

      <BottomNav items={NAV_ITEMS} activeId="diary" style={{ marginTop: "auto" }} />
    </div>
  );
}
