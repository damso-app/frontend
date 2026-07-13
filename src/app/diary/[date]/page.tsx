"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge, BottomNav, Button, Card } from "@/components/ui";
import { getAnswerClip } from "@/lib/api/answers";
import type { AnswerClip } from "@/lib/api/answers";
import { getClipGrid } from "@/lib/api/clips";
import type { ClipGridGroup } from "@/lib/api/clips";
import type { UserRole } from "@/lib/api/users";
import { NAV_ITEMS, NAV_ROUTES } from "@/lib/navigation";

const ROLE_LABEL: Record<UserRole, string> = {
  child: "자녀",
  mother: "엄마",
  father: "아빠",
};

function formatDateLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${year}.${month}.${day}`;
}

function formatClipDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
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

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-md)" }}>
        <div style={{ minWidth: 0 }}>
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
        <Image
          src="/logo.svg"
          alt="담소"
          width={84}
          height={38}
          style={{ flexShrink: 0, width: "84px", height: "38px", objectFit: "contain" }}
        />
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
                const isFailed = clip.status === "failed";
                return (
                  <button
                    key={clip.answerId}
                    type="button"
                    disabled={!isCompleted}
                    onClick={() => isCompleted && router.push(`/diary/${date}/${clip.answerId}`)}
                    className="relative overflow-hidden text-left"
                    style={{
                      aspectRatio: "1 / 1",
                      borderRadius: "var(--radius-lg)",
                      background: detail?.thumbnailUrl
                        ? undefined
                        : isFailed
                          ? "var(--color-error-bg)"
                          : "var(--color-sage-100)",
                      backgroundImage: detail?.thumbnailUrl ? `url(${detail.thumbnailUrl})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "none",
                      padding: 0,
                      cursor: isCompleted ? "pointer" : "not-allowed",
                      opacity: isCompleted ? 1 : 0.6,
                    }}
                  >
                    {detail?.thumbnailUrl && (
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(20,18,14,0.65), rgba(20,18,14,0) 55%)" }}
                      />
                    )}
                    <span
                      className="absolute"
                      style={{
                        left: "8px",
                        top: "8px",
                        padding: "3px 8px",
                        borderRadius: "var(--radius-full)",
                        background: "rgba(20,18,14,0.55)",
                        color: "#fff",
                        fontFamily: "var(--font-sans)",
                        fontSize: "11px",
                        fontWeight: "var(--weight-medium)",
                      }}
                    >
                      {ROLE_LABEL[clip.answererRole]} 답변
                    </span>
                    {isCompleted && (
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "34px",
                          height: "34px",
                          borderRadius: "var(--radius-full)",
                          background: "var(--primary)",
                          color: "#fff",
                          fontSize: "14px",
                        }}
                      >
                        ▶
                      </div>
                    )}
                    <div className="absolute text-center" style={{ left: 0, right: 0, bottom: "10px" }}>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "13px",
                          fontWeight: "var(--weight-medium)",
                          color: detail?.thumbnailUrl ? "#fff" : isFailed ? "var(--color-error)" : "var(--color-sage-600)",
                        }}
                      >
                        {isCompleted ? detail?.title ?? "답변" : isFailed ? "처리 실패" : "처리 중"}
                      </p>
                      {isCompleted && typeof detail?.videoDurationSeconds === "number" && (
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "14px",
                            fontWeight: "var(--weight-regular)",
                            color: detail?.thumbnailUrl ? "#fff" : "var(--text-3)",
                          }}
                        >
                          {formatClipDuration(detail.videoDurationSeconds)}
                        </p>
                      )}
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

      <BottomNav
        items={NAV_ITEMS}
        activeId="diary"
        onChange={(id) => router.push(NAV_ROUTES[id] ?? "/")}
        style={{ marginTop: "auto" }}
      />
    </div>
  );
}
