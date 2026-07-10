import { ApiError, apiFetch } from "./client";
import { getMockFamilyInvitation, getMockFamilyInvitationValidation, setMockFamilyConnected } from "./family-mock";
import type { UserRole } from "./users";

export interface FamilyInvitation {
  familyId?: number;
  familyName?: string;
  inviteCode: string;
  inviteUrl?: string;
  shareText?: string;
  expiresAt?: string | null;
  inviterRole?: UserRole | null;
  recommendedRole?: UserRole | null;
}

export interface FamilyInvitationValidation {
  familyId?: number;
  familyName?: string;
  inviteCode: string;
  available?: boolean;
  expiresAt?: string | null;
  inviterRole?: UserRole | null;
  recommendedRole?: UserRole | null;
}

export interface JoinFamilyRequest {
  inviteCode: string;
}

export interface JoinFamilyResponse {
  familyId?: number;
  familyName?: string;
  familyMemberId?: number;
  joinedAt?: string;
}

type ApiRecord = Record<string, unknown>;

function getString(source: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.length > 0) return value;
  }

  return undefined;
}

function getNumber(source: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number") return value;
  }

  return undefined;
}

function getBoolean(source: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
  }

  return undefined;
}

function normalizeRole(value: unknown): UserRole | null {
  return value === "child" || value === "mother" || value === "father" ? value : null;
}

export function normalizeInviteCodeForApi(inviteCode: string) {
  return inviteCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function normalizeInvitationResponse(input: unknown): FamilyInvitation {
  const source = input && typeof input === "object" ? (input as ApiRecord) : {};
  const inviteCode = getString(source, ["inviteCode", "invite_code", "code", "invitationCode", "invitation_code"]);

  if (!inviteCode) {
    throw new Error("초대 코드가 응답에 포함되지 않았습니다.");
  }

  return {
    familyId: getNumber(source, ["familyId", "family_id", "id"]),
    familyName: getString(source, ["familyName", "family_name", "name"]),
    inviteCode,
    inviteUrl: getString(source, ["inviteUrl", "invite_url", "url"]),
    shareText: getString(source, ["shareText", "share_text"]),
    expiresAt: getString(source, ["expiresAt", "expires_at"]) ?? null,
    inviterRole: normalizeRole(source.inviterRole ?? source.inviter_role ?? source.ownerRole ?? source.owner_role),
    recommendedRole: normalizeRole(
      source.recommendedRole ?? source.recommended_role ?? source.recipientRole ?? source.recipient_role,
    ),
  };
}

function normalizeInvitationValidationResponse(input: unknown, fallbackInviteCode: string): FamilyInvitationValidation {
  const source = input && typeof input === "object" ? (input as ApiRecord) : {};
  const inviteCode =
    getString(source, ["inviteCode", "invite_code", "code", "invitationCode", "invitation_code"]) ?? fallbackInviteCode;

  return {
    familyId: getNumber(source, ["familyId", "family_id", "id"]),
    familyName: getString(source, ["familyName", "family_name", "name"]),
    inviteCode,
    available: getBoolean(source, ["available", "valid", "isAvailable", "is_available"]),
    expiresAt: getString(source, ["expiresAt", "expires_at"]) ?? null,
    inviterRole: normalizeRole(source.inviterRole ?? source.inviter_role ?? source.ownerRole ?? source.owner_role),
    recommendedRole: normalizeRole(
      source.recommendedRole ?? source.recommended_role ?? source.recipientRole ?? source.recipient_role,
    ),
  };
}

function normalizeJoinFamilyResponse(input: unknown): JoinFamilyResponse {
  const source = input && typeof input === "object" ? (input as ApiRecord) : {};

  return {
    familyId: getNumber(source, ["familyId", "family_id", "id"]),
    familyName: getString(source, ["familyName", "family_name", "name"]),
    familyMemberId: getNumber(source, ["familyMemberId", "family_member_id"]),
    joinedAt: getString(source, ["joinedAt", "joined_at"]),
  };
}

export async function createFamily() {
  const response = await apiFetch<unknown>("/v1/families", {
    method: "POST",
    body: JSON.stringify({}),
  });

  if (!response) return getMockFamilyInvitation();

  return normalizeInvitationResponse(response);
}

export async function getMyFamilyInvitation() {
  try {
    const response = await apiFetch<unknown>("/v1/families/me/invitation");

    return normalizeInvitationResponse(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) throw error;
    if (error instanceof ApiError && error.status === 404) throw error;

    console.warn("[Families] Falling back to mock invitation", error);
    return getMockFamilyInvitation();
  }
}

export async function getFamilyInvitation(inviteCode: string) {
  try {
    const normalizedInviteCode = normalizeInviteCodeForApi(inviteCode);
    const response = await apiFetch<unknown>(`/v1/families/invitations/${encodeURIComponent(normalizedInviteCode)}`);

    return normalizeInvitationValidationResponse(response, normalizedInviteCode);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) throw error;

    console.warn("[Families] Falling back to mock invitation validation", error);
    return getMockFamilyInvitationValidation(inviteCode);
  }
}

export async function joinFamily(input: JoinFamilyRequest) {
  const inviteCode = normalizeInviteCodeForApi(input.inviteCode);

  const response = await apiFetch<unknown>("/v1/families/join", {
    method: "POST",
    body: JSON.stringify({ inviteCode }),
  });
  const normalizedResponse = normalizeJoinFamilyResponse(response);

  setMockFamilyConnected(inviteCode);
  return normalizedResponse;
}
