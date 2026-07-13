"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, BottomNav, Button, Card } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { getHomeQuestionSummary } from "@/lib/api/home";
import type { HomeSummary } from "@/lib/api/home";
import { clearAccessToken } from "@/lib/auth/token";
import { NAV_ITEMS, NAV_ROUTES } from "@/lib/navigation";

const ROLE_LABEL = {
  child: "자녀",
  mother: "엄마",
  father: "아빠",
} as const;

function getConnectedFamilyLabel(summary: HomeSummary | null) {
  if (!summary) return "";

  const active = summary.connectedMembers.filter((member) => member.active);
  const pending = summary.connectedMembers.filter((member) => !member.active);

  if (active.length === 0) return "아직 연결된 가족이 없어요.";

  const activeLabel = `${active.map((member) => member.roleLabel).join(", ")} 연결됨`;
  if (pending.length === 0) return activeLabel;

  return `${activeLabel} · ${pending.map((member) => member.roleLabel).join(", ")} 초대 대기`;
}

export default function SettingsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getHomeQuestionSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearAccessToken();
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const roleLabel = summary?.role ? ROLE_LABEL[summary.role] : "가족";

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
            설정
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
            가족 기록의
            <br />
            보관 방식
          </h1>
          <p className="text-body-sm" style={{ marginTop: "8px" }}>
            연결된 가족, 알림, 저장된 데이터 보관 방식을 관리합니다.
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

      <Card variant="base" elevation="card" padding="17px">
        <div className="flex items-center gap-4">
          <Avatar name={roleLabel} size="lg" />
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "18px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
              {roleLabel}
            </p>
            <p className="text-body-sm" style={{ marginTop: "4px", color: "var(--text-3)" }}>
              {loading ? "불러오는 중..." : `${roleLabel} 역할 · 카카오 로그인`}
            </p>
          </div>
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
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "18px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
              연결된 가족
            </p>
            <p className="text-caption" style={{ marginTop: "4px" }}>
              {loading ? "불러오는 중..." : getConnectedFamilyLabel(summary)}
            </p>
          </div>
        </div>
      </Card>

      <Card
        variant="base"
        elevation="subtle"
        padding="var(--space-md)"
        bg="var(--color-coral-50)"
        onClick={() => router.push("/settings/data")}
        style={{ cursor: "pointer" }}
      >
        <div className="flex items-start gap-2">
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
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "18px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
              저장 기본값
            </p>
            <p className="text-caption" style={{ marginTop: "4px" }}>
              가족 앱 안에서만 보기 · 내부 보관 · 다운로드 제한
            </p>
          </div>
        </div>
      </Card>

      <Card variant="base" elevation="subtle" padding="var(--space-md)" bg="var(--color-coral-50)">
        <div className="flex items-start gap-2">
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
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "18px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
              알림
            </p>
            <p className="text-caption" style={{ marginTop: "4px" }}>
              질문 수신, 처리 완료, 저장 완료 알림 켜짐
            </p>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="secondary" fullWidth onClick={() => router.push("/onboarding/family-connect")}>
          가족 초대하기
        </Button>
        {/* TODO: 별도 권한 관리 화면 미정 — 목적지 확정되면 연결 */}
        <Button variant="secondary" fullWidth onClick={() => {}}>
          권한 관리
        </Button>
      </div>

      <BottomNav
        items={NAV_ITEMS}
        activeId="settings"
        onChange={(id) => router.push(NAV_ROUTES[id] ?? "/")}
        style={{ marginTop: "auto" }}
      />
    </div>
  );
}
