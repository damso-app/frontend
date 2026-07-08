"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, BottomNav, Button, Card } from "@/components/ui";
import { getAnswerClip } from "@/lib/api/answers";
import type { AnswerClip } from "@/lib/api/answers";
import { getClipGrid } from "@/lib/api/clips";
import type { ClipGridGroup } from "@/lib/api/clips";

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

function formatDateLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${year}.${month}.${day}`;
}

export default function FourCutGroupPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const router = useRouter();

  const [group, setGroup] = useState<ClipGridGroup | null | undefined>(undefined);
  const [clipDetails, setClipDetails] = useState<Record<number, AnswerClip>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getClipGrid()
      .then(async (groups) => {
        if (cancelled) return;
        const found = groups.find((g) => g.date === date) ?? null;
        setGroup(found);

        const completedIds = found?.clips.filter((c) => c.status === "completed").map((c) => c.answerId) ?? [];
        const details = await Promise.all(
          completedIds.map((id) =>
            getAnswerClip(String(id))
              .then((clip) => [id, clip] as const)
              .catch(() => null)
          )
        );
        if (cancelled) return;
        setClipDetails(Object.fromEntries(details.filter((d): d is [number, AnswerClip] => d !== null)));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  // video_clips.fourcut_title은 같은 그룹의 클립끼리 공유하는 값이라, 완료된 컷 중 하나에서 가져오면 된다.
  const groupTitle = Object.values(clipDetails).find((c) => c.fourcutTitle)?.fourcutTitle;

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
      <button
        type="button"
        onClick={() => router.push("/diary")}
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
          회고록 보기
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
          {groupTitle ?? "가족 회고록"}
        </h1>
        <p className="text-body-sm" style={{ marginTop: "8px" }}>
          저장된 회고록입니다. 누르면 답변을 확인할 수 있어요.
        </p>
      </div>

      {error && (
        <p className="text-body-sm text-center" style={{ color: "var(--color-error)" }}>
          회고록을 불러오지 못했어요.
        </p>
      )}

      {group === undefined && !error && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          불러오는 중...
        </p>
      )}

      {group === null && !error && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          해당 회고록을 찾을 수 없어요.
        </p>
      )}

      {group && (
        <>
          <div className="flex gap-2">
            <Badge variant="default" size="lg">답변 {group.clips.length}개</Badge>
            <Badge variant="outline" size="lg">{formatDateLabel(group.date)}</Badge>
          </div>

          <Card variant="feature" elevation="card">
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "17px",
                fontWeight: "var(--weight-medium)",
                color: "var(--text-1)",
              }}
            >
              {groupTitle ?? "네컷 묶음"}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              {group.clips.map((clip) => {
                const detail = clipDetails[clip.answerId];
                const isCompleted = clip.status === "completed";
                return (
                  <button
                    key={clip.answerId}
                    type="button"
                    disabled={!isCompleted}
                    onClick={() => isCompleted && router.push(`/diary/${date}/${clip.answerId}`)}
                    className="relative overflow-hidden text-left"
                    style={{
                      height: "124px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--text-1)",
                      border: "none",
                      padding: 0,
                      cursor: isCompleted ? "pointer" : "not-allowed",
                      opacity: isCompleted ? 1 : 0.6,
                    }}
                  >
                    <div
                      className="absolute"
                      style={{
                        left: "12px",
                        right: "12px",
                        top: "12px",
                        height: "64px",
                        borderRadius: "var(--radius-md)",
                        background: detail?.thumbnailUrl ? undefined : "var(--color-sage-100)",
                        backgroundImage: detail?.thumbnailUrl ? `url(${detail.thumbnailUrl})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    {isCompleted && (
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          left: "50%",
                          top: "44px",
                          transform: "translateX(-50%)",
                          width: "28px",
                          height: "28px",
                          borderRadius: "var(--radius-full)",
                          background: "var(--primary)",
                          color: "#fff",
                          fontSize: "13px",
                        }}
                      >
                        ▶
                      </div>
                    )}
                    <div className="absolute text-center" style={{ left: 0, right: 0, bottom: "10px" }}>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--weight-medium)", color: "#fff" }}>
                        {isCompleted ? detail?.title ?? "답변" : "처리 중"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card variant="sage" elevation="subtle" padding="var(--space-md)">
            <div className="flex items-start gap-2">
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  marginTop: "8px",
                  borderRadius: "50%",
                  background: "var(--color-sage-400)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
                  가족 다이어리에 저장됨
                </p>
                <p className="text-caption" style={{ marginTop: "4px" }}>
                  연결된 가족만 앱 안에서 볼 수 있어요.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => router.push("/questions/new")}>
              새 질문 만들기
            </Button>
            <Button variant="secondary" onClick={() => router.push("/diary")}>
              목록으로
            </Button>
          </div>
        </>
      )}

      <BottomNav items={NAV_ITEMS} activeId="diary" style={{ marginTop: "auto" }} />
    </div>
  );
}
