"use client";

import { use, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BottomNav, Button, Card } from "@/components/ui";
import { NAV_ITEMS } from "@/lib/navigation";

type RequestState = "idle" | "requesting" | "denied";


export default function RecordPermissionPage({ params }: { params: Promise<{ questionSendId: string }> }) {
  const { questionSendId } = use(params);
  const router = useRouter();
  const [requestState, setRequestState] = useState<RequestState>("idle");

  const handleRequestPermission = useCallback(async () => {
    setRequestState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => track.stop());
      router.push(`/questions/${questionSendId}/record`);
    } catch {
      setRequestState("denied");
    }
  }, [questionSendId, router]);

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{ maxWidth: "var(--page-max-width)", background: "var(--canvas)" }}
    >
      <button
        type="button"
        onClick={() => router.push(`/questions/${questionSendId}`)}
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
              color: "var(--color-sage-400)",
            }}
          >
            권한 안내
          </p>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "28px",
              fontWeight: "var(--weight-bold)",
              lineHeight: "29px",
              color: "var(--text-1)",
              marginTop: "8px",
            }}
          >
            카메라를
            <br />
            열 수 없어요
          </h1>
          <p className="text-body-sm" style={{ marginTop: "12px" }}>
            현재 카메라와 마이크 권한이 설정되어 있지 않아요.
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

      <div
        style={{
          background: "var(--color-coral-100)",
          border: "var(--border-soft)",
          borderRadius: "var(--radius-xxxl)",
          padding: "var(--space-xl)",
          boxShadow: "var(--elevation-card)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "22px",
            fontWeight: "var(--weight-medium)",
            color: "var(--text-1)",
          }}
        >
          권한 요청 실패
        </p>
        <p className="text-body" style={{ marginTop: "12px" }}>
          설정에서 카메라와 마이크 접근을 허용한 뒤 다시 시도해주세요.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Card variant="base" elevation="subtle" padding="var(--space-md)">
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
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
                카메라 권한 확인
              </p>
              <p className="text-caption" style={{ marginTop: "4px" }}>
                브라우저 설정에 들어가 카메라 권한을 허용해주세요.
              </p>
            </div>
          </div>
        </Card>

        <Card variant="base" elevation="subtle" padding="var(--space-md)" bg="var(--color-amber-50)">
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
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
                마이크 권한 확인
              </p>
              <p className="text-caption" style={{ marginTop: "4px" }}>
                브라우저 설정에 들어가 마이크 권한을 허용해주세요.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {requestState === "denied" && (
        <p className="text-body-sm text-center" style={{ color: "var(--color-error)" }}>
          아직 권한이 허용되지 않았어요. 브라우저 설정에서 직접 허용해주세요.
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleRequestPermission} loading={requestState === "requesting"}>
          권한 다시 요청
        </Button>
        {/* TODO: 권한 허용 방법 가이드 콘텐츠/링크가 아직 없음 */}
        <Button variant="secondary" onClick={() => {}}>
          권한 허용 방법
        </Button>
      </div>

      <BottomNav
        items={NAV_ITEMS}
        activeId="qna"
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
