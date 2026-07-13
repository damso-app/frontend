"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BottomNav, Button, Card } from "@/components/ui";
import { NAV_ITEMS, NAV_ROUTES } from "@/lib/navigation";

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

export default function SettingsDataPage() {
  const router = useRouter();
  const [notice, setNotice] = useState("");

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
      <button
        type="button"
        onClick={() => router.push("/settings")}
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
            데이터 관리
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
            내 기록을
            <br />
            직접 관리해요
          </h1>
          <p className="text-body-sm" style={{ marginTop: "8px" }}>
            사용자가 가족 기록을 내려받고, 저장된 GIF와 데이터를 삭제할 수 있어야 합니다.
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

      <Card variant="sage" elevation="subtle" padding="var(--space-md)">
        <div className="flex items-start gap-2">
          <AccentDot color="var(--color-sage-400)" />
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
              데이터 내보내기
            </p>
            <p className="text-caption" style={{ marginTop: "4px" }}>
              질문, 영상 메타데이터, STT 텍스트, AI 요약을 JSON으로 내려받습니다.
            </p>
          </div>
        </div>
      </Card>

      <Card variant="amber" elevation="subtle" padding="var(--space-md)">
        <div className="flex items-start gap-2">
          <AccentDot color="var(--primary)" />
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
              저장된 GIF 관리
            </p>
            <p className="text-caption" style={{ marginTop: "4px" }}>
              MVP는 가족 앱 안에 저장하며, 운영 버전은 저장된 GIF 삭제/재생성 기능이 필요합니다.
            </p>
          </div>
        </div>
      </Card>

      <Card variant="base" elevation="subtle" padding="var(--space-md)" bg="var(--color-coral-50)">
        <div className="flex items-start gap-2">
          <AccentDot color="var(--primary)" />
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
              데이터 삭제
            </p>
            <p className="text-caption" style={{ marginTop: "4px" }}>
              데모 환경에서는 저장된 가족 기록과 생성 파일을 초기화합니다.
            </p>
          </div>
        </div>
      </Card>

      {notice && (
        <p className="text-body-sm text-center" style={{ color: "var(--text-3)" }}>
          {notice}
        </p>
      )}

      <div className="flex items-center gap-3">
        {/* TODO: 내보내기/삭제 백엔드 API 미확정 — 확정되면 실제 요청으로 교체 */}
        <Button variant="primary" fullWidth onClick={() => setNotice("아직 지원하지 않는 기능이에요.")}>
          내보내기
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setNotice("아직 지원하지 않는 기능이에요.")}>
          삭제 요청
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
