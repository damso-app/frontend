import { apiFetch } from "./client";
import type { QuestionDepth } from "./questions";
import type { UserRole } from "./users";

export type AnswerStatus = "submitted" | "processing" | "completed" | "failed";
export type QuestionStatus = "sent" | "answered" | "cancelled" | "expired";

export interface QuestionSender {
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  role: UserRole;
}

export interface ReceivedQuestion {
  questionSendId: number;
  sender: QuestionSender;
  questionText: string;
  depth: QuestionDepth;
  receivedAt: string;
  read: boolean;
  readAt: string | null;
  answered: boolean;
  answeredAt: string | null;
  status: QuestionStatus;
}

export interface ReceivedQuestionDetail extends ReceivedQuestion {
  source: "recommendation" | "custom";
  recommendationId: number | null;
}

export interface GetReceivedQuestionsOptions {
  unansweredOnly?: boolean;
  sort?: "latest" | "unanswered_first";
}

export interface MarkQuestionReadResponse {
  questionSendId: number;
  read: boolean;
  readAt: string;
}

type ApiRecord = Record<string, unknown>;

function asRecord(input: unknown): ApiRecord {
  return input && typeof input === "object" ? (input as ApiRecord) : {};
}

function getArray(input: unknown, key: string): unknown[] {
  const source = asRecord(input);
  const value = source[key];
  return Array.isArray(value) ? value : [];
}

function getString(source: ApiRecord, key: string) {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function getNullableString(source: ApiRecord, key: string) {
  const value = source[key];
  return typeof value === "string" ? value : null;
}

function getNumber(source: ApiRecord, key: string) {
  const value = source[key];
  return typeof value === "number" ? value : 0;
}

function getNullableNumber(source: ApiRecord, key: string) {
  const value = source[key];
  return typeof value === "number" ? value : null;
}

function getNullableArray(source: ApiRecord, key: string): unknown[] | null {
  const value = source[key];
  return Array.isArray(value) ? value : null;
}

function getNullableStringArray(source: ApiRecord, key: string): string[] | null {
  const value = source[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : null;
}

function getBoolean(source: ApiRecord, key: string) {
  const value = source[key];
  return typeof value === "boolean" ? value : false;
}

function normalizeRole(input: string): UserRole {
  if (input === "child" || input === "mother" || input === "father") return input;
  return "child";
}

function normalizeDepth(input: string): QuestionDepth {
  if (input === "tiny" || input === "medium" || input === "deep") return input;
  return "tiny";
}

function normalizeQuestionStatus(input: string): QuestionStatus {
  if (input === "sent" || input === "answered" || input === "cancelled" || input === "expired") return input;
  return "sent";
}

function normalizeSender(input: unknown): QuestionSender {
  const source = asRecord(input);

  return {
    userId: getNumber(source, "userId"),
    displayName: getString(source, "displayName"),
    profileImageUrl: getNullableString(source, "profileImageUrl"),
    role: normalizeRole(getString(source, "role")),
  };
}

function normalizeReceivedQuestion(input: unknown): ReceivedQuestion {
  const source = asRecord(input);

  return {
    questionSendId: getNumber(source, "questionSendId"),
    sender: normalizeSender(source.sender),
    questionText: getString(source, "questionText"),
    depth: normalizeDepth(getString(source, "depth")),
    receivedAt: getString(source, "receivedAt"),
    read: getBoolean(source, "read"),
    readAt: getNullableString(source, "readAt"),
    answered: getBoolean(source, "answered"),
    answeredAt: getNullableString(source, "answeredAt"),
    status: normalizeQuestionStatus(getString(source, "status")),
  };
}

function normalizeReceivedQuestionDetail(input: unknown): ReceivedQuestionDetail {
  const source = asRecord(input);
  const base = normalizeReceivedQuestion(input);
  const sourceType = getString(source, "source");

  return {
    ...base,
    source: sourceType === "recommendation" ? "recommendation" : "custom",
    recommendationId: getNullableNumber(source, "recommendationId"),
  };
}

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
  questionText: string;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  thumbnailUrl: string | null;
  transcript: string | null;
  transcriptSegments: unknown[] | null;
  title: string | null;
  quote: string | null;
  oneLineSummary: string | null;
  emotionTags: string[] | null;
  fourcutTitle: string | null;
}

function normalizeAnswerClip(input: unknown): AnswerClip {
  const source = asRecord(input);

  return {
    answerId: getNumber(source, "answerId"),
    questionText: getString(source, "questionText"),
    videoUrl: getNullableString(source, "videoUrl"),
    videoDurationSeconds: getNullableNumber(source, "videoDurationSeconds"),
    thumbnailUrl: getNullableString(source, "thumbnailUrl"),
    transcript: getNullableString(source, "transcript"),
    transcriptSegments: getNullableArray(source, "transcriptSegments"),
    title: getNullableString(source, "title"),
    quote: getNullableString(source, "quote"),
    oneLineSummary: getNullableString(source, "oneLineSummary"),
    emotionTags: getNullableStringArray(source, "emotionTags"),
    fourcutTitle: getNullableString(source, "fourcutTitle"),
  };
}

/**
 * GET /api/v1/answers/{answer_id}/clip — AI 처리가 끝나지 않았으면 404("Clip was not found")를 반환한다.
 */
export async function getAnswerClip(answerId: string) {
  const response = await apiFetch<unknown>(`/v1/answers/${answerId}/clip`);
  return normalizeAnswerClip(response);
}

export async function getReceivedQuestions(options: GetReceivedQuestionsOptions = {}) {
  const params = new URLSearchParams({
    unansweredOnly: String(options.unansweredOnly ?? false),
    sort: options.sort ?? "unanswered_first",
  });
  const response = await apiFetch<unknown>(`/v1/answers/questions?${params.toString()}`);

  return getArray(response, "questions").map(normalizeReceivedQuestion);
}

export async function getReceivedQuestionDetail(questionSendId: string) {
  const response = await apiFetch<unknown>(`/v1/answers/questions/${encodeURIComponent(questionSendId)}`);

  return normalizeReceivedQuestionDetail(response);
}

export function markReceivedQuestionRead(questionSendId: string) {
  return apiFetch<MarkQuestionReadResponse>(`/v1/answers/questions/${encodeURIComponent(questionSendId)}/read`, {
    method: "PATCH",
  });
}
