"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, BottomNav, Card } from "@/components/ui";
import { getDiaryEntries } from "@/lib/api/clips";
import type { DiaryEntry, FamilyRole } from "@/lib/api/clips";

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "mom", label: "엄마" },
  { id: "dad", label: "아빠" },
  { id: "child", label: "자녀" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const ROLE_LABEL: Record<FamilyRole, string> = {
  mom: "엄마",
  dad: "아빠",
  child: "자녀",
};

const ROLE_ACCENT: Record<FamilyRole, string> = {
  mom: "var(--color-coral-400)",
  dad: "var(--color-amber-300)",
  child: "var(--color-sage-400)",
};

function formatRelativeDay(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (diffDays <= 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 14) return "지난주";
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function formatMonthLabel(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function DiaryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    let cancelled = false;
    getDiaryEntries()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!entries) return [];
    if (filter === "all") return entries;
    return entries.filter((entry) => entry.familyMemberRole === filter);
  }, [entries, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>();
    for (const entry of filtered) {
      const key = formatMonthLabel(entry.submittedAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries());
  }, [filtered]);

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

      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                flexShrink: 0,
                height: "30px",
                padding: "0 16px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--hairline-soft)",
                background: active ? "var(--color-cream-200)" : "var(--canvas)",
                color: active ? "var(--text-2)" : "var(--text-3)",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-body-sm text-center" style={{ color: "var(--color-error)" }}>
          다이어리를 불러오지 못했어요.
        </p>
      )}

      {!error && entries === null && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          불러오는 중...
        </p>
      )}

      {entries !== null && !error && groups.length === 0 && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          아직 저장된 회고록이 없어요.
        </p>
      )}

      {groups.map(([monthLabel, monthEntries]) => (
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

          {monthEntries.map((entry) => (
            <Card
              key={entry.answerId}
              variant="base"
              elevation="card"
              padding="var(--space-md)"
              onClick={() => router.push(`/diary/${entry.answerId}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      marginTop: "8px",
                      borderRadius: "50%",
                      background: entry.familyMemberRole ? ROLE_ACCENT[entry.familyMemberRole] : "var(--color-coral-400)",
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
                      {entry.title ?? "가족 회고록"}
                    </p>
                    <p className="text-caption" style={{ marginTop: "4px" }}>
                      {formatRelativeDay(entry.submittedAt)}
                      {entry.familyMemberRole && ` · ${ROLE_LABEL[entry.familyMemberRole]} 답변`}
                      {entry.questionCount != null && ` · 질문 ${entry.questionCount}개`}
                    </p>
                  </div>
                </div>

                <Badge variant={entry.status === "completed" ? "success" : "default"} size="md">
                  {entry.status === "completed" ? "완료" : "답변 대기"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ))}

      <BottomNav items={NAV_ITEMS} activeId="diary" style={{ marginTop: "auto" }} />
    </div>
  );
}
