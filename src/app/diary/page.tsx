"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, BottomNav, Card } from "@/components/ui";
import { getClipGrid } from "@/lib/api/clips";
import type { ClipGridGroup } from "@/lib/api/clips";

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

function formatRelativeDay(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (diffDays <= 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 14) return "지난주";
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function formatMonthLabel(dateStr: string) {
  const [year, month] = dateStr.split("-");
  return `${year}.${month}`;
}

export default function DiaryPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ClipGridGroup[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getClipGrid()
      .then((data) => {
        if (!cancelled) setGroups(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const monthSections = useMemo(() => {
    if (!groups) return [];
    const map = new Map<string, ClipGridGroup[]>();
    for (const group of groups) {
      const key = formatMonthLabel(group.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(group);
    }
    return Array.from(map.entries());
  }, [groups]);

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
          가족 다이어리
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
          우리 가족의
          <br />
          저장된 회고록
        </h1>
        <p className="text-body-sm" style={{ marginTop: "8px" }}>
          답변은 가족 다이어리에 저장되고, 확인할 수 있어요.
        </p>
      </div>

      {error && (
        <p className="text-body-sm text-center" style={{ color: "var(--color-error)" }}>
          다이어리를 불러오지 못했어요.
        </p>
      )}

      {!error && groups === null && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          불러오는 중...
        </p>
      )}

      {groups !== null && !error && monthSections.length === 0 && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          아직 저장된 회고록이 없어요.
        </p>
      )}

      {monthSections.map(([monthLabel, monthGroups]) => (
        <div key={monthLabel} className="flex flex-col gap-3">
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: "var(--weight-medium)",
              color: "var(--text-3)",
            }}
          >
            {monthLabel}
          </p>

          {monthGroups.map((group) => {
            const allCompleted = group.clips.every((clip) => clip.status === "completed");
            const hasFailed = group.clips.some((clip) => clip.status === "failed");
            return (
              <Card
                key={group.date}
                variant="base"
                elevation="card"
                padding="var(--space-md)"
                onClick={() => router.push(`/diary/${group.date}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        marginTop: "8px",
                        borderRadius: "50%",
                        background: "var(--color-coral-400)",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "18px",
                          fontWeight: "var(--weight-medium)",
                          color: "var(--text-1)",
                        }}
                      >
                        가족 회고록
                      </p>
                      <p className="text-caption" style={{ marginTop: "4px" }}>
                        {formatRelativeDay(group.date)} · 답변 {group.clips.length}개
                      </p>
                    </div>
                  </div>

                  <Badge variant={allCompleted ? "success" : hasFailed ? "error" : "default"} size="md">
                    {allCompleted ? "완료" : hasFailed ? "실패" : "처리 중"}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      ))}

      <BottomNav items={NAV_ITEMS} activeId="diary" style={{ marginTop: "auto" }} />
    </div>
  );
}
