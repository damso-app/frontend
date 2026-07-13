"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Webcam from "react-webcam";

import { BottomNav, Button, Card } from "@/components/ui";
import {
  getReceivedQuestionDetail,
  requestAnswerUploadUrl,
  submitAnswer,
  uploadAnswerVideo,
} from "@/lib/api/answers";
import type { ReceivedQuestionDetail } from "@/lib/api/answers";
import { ApiError } from "@/lib/api/client";
import type { UserRole } from "@/lib/api/users";
import { NAV_ITEMS } from "@/lib/navigation";

type CaptureState = "idle" | "recording" | "recorded";

type SubmitState =
  | "idle"
  | "uploading"
  | "submitting"
  | "submitted"
  | "error";


const ROLE_LABEL: Record<UserRole, string> = {
  child: "자녀",
  mother: "엄마",
  father: "아빠",
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function pickMimeType() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];

  return candidates.find(
    (type) =>
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type),
  );
}

interface RecordAnswerPageProps {
  params: Promise<{
    questionSendId: string;
  }>;
}

export default function RecordAnswerPage({
  params,
}: RecordAnswerPageProps) {
  const { questionSendId } = use(params);
  const router = useRouter();

  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number | null>(null);

  const [captureState, setCaptureState] =
    useState<CaptureState>("idle");

  const [elapsedSec, setElapsedSec] = useState(0);

  const [recordedBlob, setRecordedBlob] =
    useState<Blob | null>(null);

  const [recordedUrl, setRecordedUrl] =
    useState<string | null>(null);

  const [cameraError, setCameraError] =
    useState<string | null>(null);

  const [cameraReady, setCameraReady] = useState(false);

  const [recordingError, setRecordingError] =
    useState<string | null>(null);

  const [submitState, setSubmitState] =
    useState<SubmitState>("idle");

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [submitFatal, setSubmitFatal] = useState(false);

  const [question, setQuestion] =
    useState<ReceivedQuestionDetail | null>(null);

  useEffect(() => {
    let cancelled = false;

    getReceivedQuestionDetail(questionSendId)
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (data.answered) {
          router.replace(`/questions/${questionSendId}`);
          return;
        }

        setQuestion(data);
      })
      .catch((error) => {
        console.error("질문 조회 실패", error);
      });

    return () => {
      cancelled = true;
    };
  }, [questionSendId, router]);

  useEffect(() => {
    if (captureState !== "recording") {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSec((seconds) => seconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [captureState]);

  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const handleStartRecording = useCallback(() => {
    const stream = webcamRef.current?.stream;

    if (!stream) {
      setRecordingError(
        "카메라가 아직 준비되지 않았어요. 잠시 후 다시 시도해주세요.",
      );
      return;
    }

    try {
      chunksRef.current = [];

      const mimeType = pickMimeType();

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setRecordingError(
          "녹화 중 문제가 발생했어요. 다시 촬영해주세요.",
        );
        setCaptureState("idle");
      };

      recorder.onstop = () => {
        const durationSec =
          recordStartRef.current !== null
            ? Math.round(
                (Date.now() - recordStartRef.current) / 1000,
              )
            : 0;

        recordStartRef.current = null;

        if (durationSec <= 0) {
          setRecordingError(
            "녹화 시간이 너무 짧아요. 1초 이상 녹화해주세요.",
          );
          setElapsedSec(0);
          setCaptureState("idle");
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: mimeType ?? "video/webm",
        });

        if (blob.size === 0) {
          setRecordingError(
            "영상이 정상적으로 저장되지 않았어요. 다시 촬영해주세요.",
          );
          setElapsedSec(0);
          setCaptureState("idle");
          return;
        }

        const nextRecordedUrl = URL.createObjectURL(blob);

        setElapsedSec(durationSec);
        setRecordedBlob(blob);
        setRecordedUrl(nextRecordedUrl);
        setCaptureState("recorded");
      };

      recorder.start();

      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();

      setElapsedSec(0);
      setRecordingError(null);
      setSubmitError(null);
      setCaptureState("recording");
    } catch (error) {
      console.error("녹화 시작 실패", error);

      setRecordingError(
        "녹화를 시작할 수 없어요. 브라우저 권한을 확인해주세요.",
      );
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      return;
    }

    recorder.stop();
  }, []);

  const handleToggleRecord = useCallback(() => {
    if (captureState === "idle") {
      handleStartRecording();
      return;
    }

    if (captureState === "recording") {
      handleStopRecording();
    }
  }, [
    captureState,
    handleStartRecording,
    handleStopRecording,
  ]);

  const handleRetake = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    setRecordedBlob(null);
    setRecordedUrl(null);
    setElapsedSec(0);
    setCaptureState("idle");
    setSubmitState("idle");
    setSubmitError(null);
    setSubmitFatal(false);
    setRecordingError(null);
  }, [recordedUrl]);

  const handleSubmit = useCallback(async () => {
    if (!recordedBlob || elapsedSec <= 0) {
      setSubmitError(
        "전달할 영상이 없어요. 먼저 영상을 촬영해주세요.",
      );
      return;
    }

    setSubmitError(null);
    setSubmitFatal(false);
    setSubmitState("uploading");

    try {
      const videoMimeType = (
        recordedBlob.type || "video/webm"
      )
        .split(";")[0]
        .trim();

      const { uploadUrl } = await requestAnswerUploadUrl({
        questionSendId,
        videoMimeType,
      });

      await uploadAnswerVideo(
        uploadUrl,
        recordedBlob,
        videoMimeType,
      );

      setSubmitState("submitting");

      const result = await submitAnswer({
        questionSendId,
        videoMimeType,
        videoDurationSeconds: elapsedSec,
        videoSizeBytes: recordedBlob.size,
      });

      setSubmitState("submitted");

      router.push(
        `/answers/${result.answerId}/processing`,
      );
    } catch (error) {
      console.error("answer submit failed", error);

      setSubmitState("error");

      if (error instanceof ApiError && error.status === 409) {
        setSubmitError(
          "이미 이 질문에 답변을 제출했어요.",
        );
        setSubmitFatal(true);
        return;
      }

      if (error instanceof ApiError && error.status === 415) {
        setSubmitError(
          "지원하지 않는 영상 형식이에요. 다시 촬영해주세요.",
        );
        return;
      }

      if (error instanceof ApiError && error.status === 422) {
        setSubmitError(
          "녹화 정보가 올바르지 않아요. 다시 촬영해주세요.",
        );
        return;
      }

      setSubmitError(
        "답변 전달에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  }, [
    recordedBlob,
    questionSendId,
    elapsedSec,
    router,
  ]);

  const isSubmitting =
    submitState === "uploading" ||
    submitState === "submitting";

  const isRecordButtonDisabled =
    captureState === "recorded" ||
    Boolean(cameraError) ||
    (captureState === "idle" && !cameraReady);

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col gap-6 px-5 pb-8 pt-6"
      style={{
        maxWidth: "var(--page-max-width)",
        background: "var(--canvas)",
      }}
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
        <Image
          src="/logo.svg"
          alt="담소"
          width={84}
          height={38}
          style={{ flexShrink: 0, width: "84px", height: "38px", objectFit: "contain" }}
        />
      </div>

      <Card
        variant="base"
        elevation="subtle"
        padding="var(--space-md)"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--space-sm)",
        }}
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
          <p
            className="text-body-md"
            style={{
              fontWeight: "var(--weight-medium)",
              color: "var(--text-1)",
            }}
          >
            {question
              ? `${
                  ROLE_LABEL[
                    question.sender.role ?? "child"
                  ]
                } · ${
                  question.sender.displayName ?? "가족"
                }에게 온 질문`
              : "질문을 불러오는 중..."}
          </p>

          <p
            className="text-body"
            style={{ marginTop: "4px" }}
          >
            {question?.questionText ?? ""}
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
          <video
            src={recordedUrl}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : cameraError ? (
          <div
            className="flex h-full w-full items-center justify-center p-6 text-center"
            style={{ color: "var(--text-3)" }}
          >
            카메라를 사용할 수 없어요. 브라우저 카메라
            권한을 확인해주세요.
          </div>
        ) : (
          <Webcam
            ref={webcamRef}
            audio
            muted
            mirrored
            playsInline
            className="h-full w-full object-cover"
            videoConstraints={{
              facingMode: "user",
            }}
            onUserMedia={() => {
              setCameraReady(true);
              setCameraError(null);
            }}
            onUserMediaError={() => {
              setCameraReady(false);
              setCameraError("camera-denied");

              router.push(
                `/questions/${questionSendId}/record/permission`,
              );
            }}
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
          className="flex items-center justify-center text-center"
          style={{
            minHeight: "52px",
            padding: "12px 20px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-sage-50)",
            color: "var(--color-sage-600)",
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            fontWeight: "var(--weight-medium)",
          }}
        >
          답변을 전달했어요. AI가 정리하는 대로
          다이어리에서 확인할 수 있어요.
        </div>
      ) : submitFatal ? (
        <div className="flex flex-col items-center gap-3">
          {submitError && (
            <p
              className="text-body-sm text-center"
              style={{ color: "var(--color-error)" }}
            >
              {submitError}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/questions")}
          >
            질문 목록으로
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleRetake}
              disabled={
                captureState === "recording" ||
                isSubmitting
              }
            >
              다시 촬영
            </Button>

            <button
              type="button"
              onClick={handleToggleRecord}
              disabled={isRecordButtonDisabled}
              aria-label={
                captureState === "recording"
                  ? "녹화 중지"
                  : "녹화 시작"
              }
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
                cursor: isRecordButtonDisabled
                  ? "not-allowed"
                  : "pointer",
                opacity: isRecordButtonDisabled
                  ? 0.4
                  : 1,
                transition: "opacity 150ms ease",
              }}
            >
              <span
                style={{
                  width:
                    captureState === "recording"
                      ? "22px"
                      : "30px",
                  height:
                    captureState === "recording"
                      ? "22px"
                      : "30px",
                  borderRadius:
                    captureState === "recording"
                      ? "6px"
                      : "50%",
                  background: "#FFFCF5",
                  transition:
                    "width 150ms ease, height 150ms ease, border-radius 150ms ease",
                }}
              />
            </button>

            <Button
              variant="sage"
              size="lg"
              onClick={handleSubmit}
              disabled={
                captureState !== "recorded" ||
                isSubmitting
              }
              loading={isSubmitting}
            >
              답변 전달
            </Button>
          </div>

          {recordingError && (
            <p
              className="text-body-sm text-center"
              style={{ color: "var(--color-error)" }}
            >
              {recordingError}
            </p>
          )}

          {submitError && (
            <p
              className="text-body-sm text-center"
              style={{ color: "var(--color-error)" }}
            >
              {submitError}
            </p>
          )}
        </>
      )}

      <BottomNav
        items={NAV_ITEMS}
        activeId="qna"
        onChange={(id) => {
          if (id === "home") {
            router.push("/");
          }

          if (id === "qna") {
            router.push("/questions");
          }

          if (id === "diary") {
            router.push("/diary");
          }

          if (id === "settings") {
            router.push("/settings");
          }
        }}
        style={{ marginTop: "auto" }}
      />
    </div>
  );
}