export const DAMSO_ACCESS_TOKEN_KEY = "damso_access_token";

export function saveAccessToken(accessToken: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DAMSO_ACCESS_TOKEN_KEY, accessToken);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DAMSO_ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DAMSO_ACCESS_TOKEN_KEY);
}
