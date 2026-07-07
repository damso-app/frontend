import { apiFetch } from "./client";
import type { AnswerStatus } from "./answers";

export type FamilyRole = "mom" | "dad" | "child";

export interface DiaryEntry {
  answerId: string;
  status: AnswerStatus;
  thumbnailUrl: string | null;
  submittedAt: string;
  // 아래 필드는 Answer API 개요 문서(docs/backend-answer-api.md)에 없는 추정 필드.
  // 카드에 필요해서 넣어뒀지만 실제 응답 스키마 확인 전까지는 옵셔널로 다룬다 (docs/route-map.md 확인 필요 항목 참고).
  title?: string;
  familyMemberName?: string;
  familyMemberRole?: FamilyRole;
  questionCount?: number;
}

/** GET /api/v1/clips — 가족의 답변을 그룹핑해 다이어리 목록으로 반환 */
export function getDiaryEntries() {
  return apiFetch<DiaryEntry[]>("/v1/clips");
}
