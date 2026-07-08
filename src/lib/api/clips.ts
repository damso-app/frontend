import { apiFetch } from "./client";
import type { AnswerStatus } from "./answers";

export interface ClipGridItem {
  answerId: number;
  status: AnswerStatus;
  thumbnailUrl: string | null;
}

export interface ClipGridGroup {
  date: string;
  clips: ClipGridItem[];
}

/** GET /api/v1/clips — 가족의 답변을 날짜별로 그룹핑한 네컷 그리드 */
export function getClipGrid() {
  return apiFetch<{ groups: ClipGridGroup[] }>("/v1/clips").then((res) => res.groups);
}
