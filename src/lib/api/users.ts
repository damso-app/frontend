import { apiFetch } from "./client";

export type AgreementType = "service_terms" | "privacy_policy" | "camera_microphone" | "data_usage";
export type UserRole = "child" | "mother" | "father";
export type FamilyMemberRole = "child" | "mother" | "father";

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

export interface OnboardingStatusResponse {
  userId: number;
  role: UserRole | null;
  requiredAgreementsCompleted: boolean;
  familyId: number | null;
  familyMemberRole: FamilyMemberRole | null;
  familyConnected: boolean;
  onboardingCompleted: boolean;
}

export interface SaveUserAgreementItem {
  type: AgreementType;
  agreed: boolean;
}

export interface SaveUserAgreementsRequest {
  agreements: SaveUserAgreementItem[];
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserRoleResponse {
  userId: number;
  role: UserRole;
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

export function getMyOnboardingStatus() {
  return apiFetch<OnboardingStatusResponse>("/v1/users/me/onboarding");
}

export function updateMyRole(input: UpdateUserRoleRequest) {
  return apiFetch<UpdateUserRoleResponse>("/v1/users/me/role", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
