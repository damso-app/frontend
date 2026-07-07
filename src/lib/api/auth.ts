export interface KakaoLoginUrlResult {
  loginUrl: string;
  state: string;
}

export interface LoginCodeExchangeResult {
  accessToken: string;
}

class AuthApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new AuthApiError("NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

async function authFetch<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AuthApiError(body || "인증 요청에 실패했습니다.", res.status);
  }

  return (await res.json()) as T;
}

function readStringField(value: unknown, fieldName: string) {
  if (!value || typeof value !== "object") return null;

  const fieldValue = (value as Record<string, unknown>)[fieldName];
  return typeof fieldValue === "string" && fieldValue.length > 0 ? fieldValue : null;
}

function readObjectField(value: unknown, fieldName: string) {
  if (!value || typeof value !== "object") return null;

  const fieldValue = (value as Record<string, unknown>)[fieldName];
  return fieldValue && typeof fieldValue === "object" ? fieldValue : null;
}

function extractAccessToken(response: unknown) {
  const data = readObjectField(response, "data");

  return (
    readStringField(response, "accessToken") ??
    readStringField(response, "access_token") ??
    readStringField(response, "token") ??
    readStringField(data, "accessToken") ??
    readStringField(data, "access_token")
  );
}

export async function getKakaoLoginUrl() {
  const result = await authFetch<KakaoLoginUrlResult>("/api/v1/auth/kakao/login-url");

  if (!result.loginUrl) {
    throw new AuthApiError("카카오 로그인 URL 응답에 loginUrl이 없습니다.");
  }

  return result;
}

export async function exchangeLoginCode(loginCode: string): Promise<LoginCodeExchangeResult> {
  const result = await authFetch<unknown>("/api/v1/auth/login-code/exchange", {
    method: "POST",
    body: JSON.stringify({ loginCode }),
  });
  const accessToken = extractAccessToken(result);

  if (!accessToken) {
    throw new AuthApiError("로그인 코드 교환 응답에 Damso access token이 없습니다.");
  }

  return { accessToken };
}
