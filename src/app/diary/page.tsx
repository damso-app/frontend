"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge, BottomNav, Card } from "@/components/ui";
import { getClipGrid } from "@/lib/api/clips";
import type { ClipGridGroup } from "@/lib/api/clips";
import type { UserRole } from "@/lib/api/users";
import { NAV_ITEMS } from "@/lib/navigation";

const ROLE_LABEL: Record<UserRole, string> = {
  child: "자녀",
  mother: "엄마",
  father: "아빠",
};

function getGroupAnswererLabel(group: ClipGridGroup) {
  const [first, ...rest] = group.clips;
  if (!first) return "가족";
  return rest.every((clip) => clip.answererRole === first.answererRole) ? ROLE_LABEL[first.answererRole] : "가족";
}

function getDiffDays(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
}

function formatRelativeDay(diffDays: number) {
  if (diffDays <= 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 14) return "지난주";
  return "예전";
}

function formatCardTitle(diffDays: number, answererLabel: string) {
  return `${formatRelativeDay(diffDays)} ${answererLabel}의 회고록`;
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
            매일 가족 다이어리에 저장되고, 가족들과 나눈 이야기를 확인할 수 있어요.
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
            const diffDays = getDiffDays(group.date);
            const answererLabel = getGroupAnswererLabel(group);
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
                        {formatCardTitle(diffDays, answererLabel)}
                      </p>
                      <p className="text-caption" style={{ marginTop: "4px" }}>
                        답변 {group.clips.length}개
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

      <BottomNav
        items={NAV_ITEMS}
        activeId="diary"
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
