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

/**
 * GET /api/v1/clips — 가족의 답변을 날짜별로 그룹핑한 네컷 그리드.
 * 그룹 내 clips는 백엔드가 최신 제출 순(내림차순)으로 내려줘서, 그날 첫 질문이 Q1이 되도록
 * answerId 오름차순(≈제출 순서)으로 다시 정렬해서 내려준다.
 */
export function getClipGrid() {
  return apiFetch<{ groups: ClipGridGroup[] }>("/v1/clips").then((res) =>
    res.groups.map((group) => ({
      ...group,
      clips: [...group.clips].sort((a, b) => a.answerId - b.answerId),
    }))
  );
}
