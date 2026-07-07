const API_BASE = "/api";

// TODO: 실제 로그인 플로우가 생기면 토큰 저장/조회 방식을 auth 모듈로 옮긴다 (docs/route-map.md 확인 필요 항목).
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("damso_access_token");
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
