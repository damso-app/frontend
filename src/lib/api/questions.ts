import { apiFetch } from "./client";

export type UserRole = "child" | "mother" | "father";
export type QuestionDepth = "tiny" | "medium" | "deep";
export type QuestionSendStatus = "sent" | "answered" | "cancelled" | "expired";
export type QuestionSendSource = "recommendation" | "custom";

export interface QuestionSender {
  userId: number;
  displayName: string | null;
  profileImageUrl: string | null;
  role: UserRole | null;
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
  status: QuestionSendStatus;
}

export interface ReceivedQuestionDetail extends ReceivedQuestion {
  source: QuestionSendSource;
  recommendationId: number | null;
}

/** GET /api/v1/answers/questions — 받은 질문 목록 */
export function listReceivedQuestions() {
  return apiFetch<{ questions: ReceivedQuestion[] }>("/v1/answers/questions").then((res) => res.questions);
}

/** GET /api/v1/answers/questions/{question_send_id} — 받은 질문 상세 */
export function getQuestionDetail(questionSendId: string) {
  return apiFetch<ReceivedQuestionDetail>(`/v1/answers/questions/${questionSendId}`);
}

/** PATCH /api/v1/answers/questions/{question_send_id}/read — 읽음 처리 */
export function markQuestionRead(questionSendId: string) {
  return apiFetch<void>(`/v1/answers/questions/${questionSendId}/read`, {
    method: "PATCH",
  });
}
