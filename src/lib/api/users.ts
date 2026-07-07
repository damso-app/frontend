import { apiFetch } from "./client";

export type AgreementType = "service_terms" | "privacy_policy" | "camera_microphone" | "data_usage";

export interface AgreementItem {
  type: AgreementType;
  displayName: string;
  description: string;
  agreed: boolean;
  agreedAt: string | null;
}

export interface UserAgreementsResponse {
  requiredAgreementsCompleted: boolean;
  agreements: AgreementItem[];
}

export interface SaveUserAgreementItem {
  type: AgreementType;
  agreed: boolean;
}

export interface SaveUserAgreementsRequest {
  agreements: SaveUserAgreementItem[];
}

export function getUserAgreements() {
  return apiFetch<UserAgreementsResponse>("/v1/users/me/agreements");
}

export function saveUserAgreements(input: SaveUserAgreementsRequest) {
  return apiFetch<UserAgreementsResponse>("/v1/users/me/agreements", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
