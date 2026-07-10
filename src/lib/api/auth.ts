import { buildApiRequestUrl, parseApiJsonResponse, throwApiErrorFromResponse } from "./client";

const API_BASE = "/api";

export interface KakaoLoginUrlResult {
  loginUrl: string;
  state: string;
}

export interface LoginCodeExchangeResult {
  accessToken: string;
}

async function authFetch<T>(path: string, init: RequestInit = {}) {
  const requestUrl = buildApiRequestUrl(API_BASE, path);

  let res: Response;

  try {
    res = await fetch(requestUrl, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch (error) {
    console.error("[API] Fetch failed", {
      requestUrl,
      error,
    });
    throw error;
  }

  if (!res.ok) {
    await throwApiErrorFromResponse(res, requestUrl);
  }

  return parseApiJsonResponse<T>(res, requestUrl);
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
  const result = await authFetch<KakaoLoginUrlResult>("/v1/auth/kakao/login-url");

  if (!result.loginUrl) {
    throw new Error("카카오 로그인 URL 응답에 loginUrl이 없습니다.");
  }

  return result;
}

export async function exchangeLoginCode(loginCode: string): Promise<LoginCodeExchangeResult> {
  const result = await authFetch<unknown>("/v1/auth/login-code/exchange", {
    method: "POST",
    body: JSON.stringify({ loginCode }),
  });
  const accessToken = extractAccessToken(result);

  if (!accessToken) {
    throw new Error("로그인 코드 교환 응답에 Damso access token이 없습니다.");
  }

  return { accessToken };
}
