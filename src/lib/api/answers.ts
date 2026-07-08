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

/**
 * 발급받은 presigned URL로 영상을 GCS에 직접 업로드 (백엔드 경유 안 함).
 * GCS v4 서명 URL은 Content-Type을 서명에 포함하므로, upload-url 발급 때 보낸
 * videoMimeType과 정확히 같은 값을 여기서도 보내야 한다 (다르면 서명 불일치로 실패).
 */
export async function uploadAnswerVideo(uploadUrl: string, video: Blob, contentType: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
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
  answerId: number;
  questionSendId: number;
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
  answerId: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  transcript: string | null;
  transcriptSegments: unknown[] | null;
  title: string | null;
  quote: string | null;
  oneLineSummary: string | null;
  emotionTags: string[] | null;
  fourcutTitle: string | null;
}

/**
 * GET /api/v1/answers/{answer_id}/clip — AI 처리가 끝나지 않았으면 404("Clip was not found")를 반환한다.
 */
export function getAnswerClip(answerId: string) {
  return apiFetch<AnswerClip>(`/v1/answers/${answerId}/clip`);
}
