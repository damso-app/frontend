"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import { BottomNav, Button, Card } from "@/components/ui";
import { requestAnswerUploadUrl, submitAnswer, uploadAnswerVideo } from "@/lib/api/answers";

type CaptureState = "idle" | "recording" | "recorded";
type SubmitState = "idle" | "uploading" | "submitting" | "submitted" | "error";

const NAV_ITEMS = [
  { id: "home", label: "홈" },
  { id: "qna", label: "질문&답변" },
  { id: "diary", label: "다이어리" },
  { id: "settings", label: "설정" },
];

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function pickMimeType() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return candidates.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type));
}

export default function RecordAnswerPage({ params }: { params: Promise<{ questionSendId: string }> }) {
  const { questionSendId } = use(params);
  const router = useRouter();

  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (captureState !== "recording") return;
    const id = setInterval(() => setElapsedSec((sec) => sec + 1), 1000);
    return () => clearInterval(id);
  }, [captureState]);

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const handleStartRecording = useCallback(() => {
    const stream = webcamRef.current?.stream;
    if (!stream) return;

    chunksRef.current = [];
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType ?? "video/webm" });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      setCaptureState("recorded");
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setElapsedSec(0);
    setCaptureState("recording");
  }, []);

  const handleStopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const handleToggleRecord = useCallback(() => {
    if (captureState === "idle") handleStartRecording();
    else if (captureState === "recording") handleStopRecording();
  }, [captureState, handleStartRecording, handleStopRecording]);

  const handleRetake = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setElapsedSec(0);
    setCaptureState("idle");
    setSubmitState("idle");
    setSubmitError(null);
  }, [recordedUrl]);

  const handleSubmit = useCallback(async () => {
    if (!recordedBlob) return;

    setSubmitError(null);
    setSubmitState("uploading");

    try {
      const videoMimeType = recordedBlob.type || "video/webm";
      const { uploadUrl } = await requestAnswerUploadUrl({ questionSendId, videoMimeType });
      await uploadAnswerVideo(uploadUrl, recordedBlob);

      setSubmitState("submitting");
      const result = await submitAnswer({
        questionSendId,
        videoMimeType,
        videoDurationSeconds: elapsedSec,
        videoSizeBytes: recordedBlob.size,
      });

      setSubmitState("submitted");
      router.push(`/answers/${result.answerId}/processing`);
    } catch (err) {
      console.error("answer submit failed", err);
      setSubmitState("error");
      setSubmitError("답변 전달에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  }, [recordedBlob, questionSendId, elapsedSec, router]);

  const isSubmitting = submitState === "uploading" || submitState === "submitting";

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
          영상 답변
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
          질문을 보며
          <br />
          편하게 말해주세요
        </h1>
      </div>

      <Card
        variant="base"
        elevation="subtle"
        padding="var(--space-md)"
        style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-sm)" }}
      >
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
          <p className="text-body-md" style={{ fontWeight: "var(--weight-medium)", color: "var(--text-1)" }}>
            엄마 · 김영희에게 온 질문
          </p>
          <p className="text-body" style={{ marginTop: "4px" }}>
            나에게 오늘 하고 싶은 말이 있어?
          </p>
        </div>
      </Card>

      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "342 / 392",
          background: "var(--surface)",
          border: "var(--border-soft)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--elevation-subtle)",
        }}
      >
        {captureState === "recorded" && recordedUrl ? (
          <video src={recordedUrl} controls className="h-full w-full object-cover" />
        ) : cameraError ? (
          <div className="flex h-full w-full items-center justify-center p-6 text-center" style={{ color: "var(--text-3)" }}>
            카메라를 사용할 수 없어요. 브라우저 카메라 권한을 확인해주세요.
          </div>
        ) : (
          <Webcam
            ref={webcamRef}
            audio
            muted
            mirrored
            playsInline
            className="h-full w-full object-cover"
            videoConstraints={{ facingMode: "user" }}
            onUserMedia={() => setCameraReady(true)}
            onUserMediaError={() => setCameraError("camera-denied")}
          />
        )}

        {captureState === "recording" && (
          <span
            className="absolute left-1/2 top-6 -translate-x-1/2"
            style={{
              background: "var(--primary)",
              color: "#fff",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: "var(--weight-bold)",
              padding: "3px 16px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {formatDuration(elapsedSec)}
          </span>
        )}
      </div>

      {submitState === "submitted" ? (
        <div
          className="flex items-center justify-center"
          style={{
            height: "52px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-sage-50)",
            color: "var(--color-sage-600)",
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            fontWeight: "var(--weight-medium)",
          }}
        >
          답변을 전달했어요. AI가 정리하는 대로 다이어리에서 확인할 수 있어요.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleRetake}
              disabled={captureState === "recording" || isSubmitting}
            >
              다시 촬영
            </Button>

            <button
              type="button"
              onClick={handleToggleRecord}
              disabled={captureState === "recorded" || !!cameraError}
              aria-label={captureState === "recording" ? "녹화 중지" : "녹화 시작"}
              style={{
                width: "62px",
                height: "62px",
                flexShrink: 0,
                borderRadius: "50%",
                border: "none",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  captureState === "recorded" || cameraError || (captureState === "idle" && !cameraReady)
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  captureState === "recorded" || cameraError || (captureState === "idle" && !cameraReady) ? 0.4 : 1,
                transition: "opacity 150ms ease",
              }}
            >
              <span
                style={{
                  width: captureState === "recording" ? "22px" : "30px",
                  height: captureState === "recording" ? "22px" : "30px",
                  borderRadius: captureState === "recording" ? "6px" : "50%",
                  background: "#FFFCF5",
                  transition: "width 150ms ease, height 150ms ease, border-radius 150ms ease",
                }}
              />
            </button>

            <Button
              variant="sage"
              size="lg"
              onClick={handleSubmit}
              disabled={captureState !== "recorded"}
              loading={isSubmitting}
            >
              답변 전달
            </Button>
          </div>

          {submitError && (
            <p className="text-body-sm text-center" style={{ color: "var(--color-error)" }}>
              {submitError}
            </p>
          )}
        </>
      )}

      <BottomNav items={NAV_ITEMS} activeId="qna" style={{ marginTop: "auto" }} />
    </div>
  );
}
