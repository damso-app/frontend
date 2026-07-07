import { apiFetch } from "./client";

export type AnswerStatus = "submitted" | "processing" | "completed" | "failed";

export interface RequestAnswerUploadUrlInput {
  questionSendId: string;
  videoMimeType: string;
}

export interface RequestAnswerUploadUrlResult {
  uploadUrl: string;
  expiresAt: string;
}

/** POST /api/v1/answers/upload-url — GCS presigned PUT URL 발급 */
export function requestAnswerUploadUrl(input: RequestAnswerUploadUrlInput) {
  return apiFetch<RequestAnswerUploadUrlResult>("/v1/answers/upload-url", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** 발급받은 presigned URL로 영상을 GCS에 직접 업로드 (백엔드 경유 안 함) */
export async function uploadAnswerVideo(uploadUrl: string, video: Blob) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": video.type },
    body: video,
  });

  if (!res.ok) {
    throw new Error(`영상 업로드에 실패했어요 (${res.status})`);
  }
}

export interface SubmitAnswerInput {
  questionSendId: string;
  videoMimeType: string;
  videoDurationSeconds: number;
  videoSizeBytes: number;
}

export interface SubmitAnswerResult {
  answerId: string;
  questionSendId: string;
  status: AnswerStatus;
  submittedAt: string;
}

/** POST /api/v1/answers — 업로드 완료 후 메타데이터 제출, AI 처리 비동기 시작 */
export function submitAnswer(input: SubmitAnswerInput) {
  return apiFetch<SubmitAnswerResult>("/v1/answers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface AnswerClip {
  videoUrl: string;
  thumbnailUrl: string;
  transcript: string;
  transcriptSegments: unknown[];
  title: string;
  quote: string;
  oneLineSummary: string;
  emotionTags: string[];
  fourcutTitle: string;
}

/**
 * GET /api/v1/answers/{answer_id}/clip — status가 completed일 때만 데이터 존재.
 * 미완료 상태일 때의 정확한 응답 형태(404 등)는 아직 미확인 — docs/route-map.md 참고.
 */
export function getAnswerClip(answerId: string) {
  return apiFetch<AnswerClip>(`/v1/answers/${answerId}/clip`);
}
