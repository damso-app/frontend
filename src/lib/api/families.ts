import { apiFetch } from "./client";

export interface FamilyInvitation {
  familyId?: number;
  familyName?: string;
  inviteCode: string;
  inviteUrl?: string;
  shareText?: string;
  expiresAt?: string | null;
}

export interface FamilyInvitationValidation {
  familyId?: number;
  familyName?: string;
  inviteCode: string;
  available?: boolean;
  expiresAt?: string | null;
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

  if (!response) return null;

  try {
    return normalizeInvitationResponse(response);
  } catch {
    return null;
  }
}

export async function getMyFamilyInvitation() {
  const response = await apiFetch<unknown>("/v1/families/me/invitation");

  return normalizeInvitationResponse(response);
}

export async function getFamilyInvitation(inviteCode: string) {
  const response = await apiFetch<unknown>(`/v1/families/invitations/${encodeURIComponent(inviteCode)}`);

  return normalizeInvitationValidationResponse(response, inviteCode);
}

export async function joinFamily(input: JoinFamilyRequest) {
  const response = await apiFetch<unknown>("/v1/families/join", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return normalizeJoinFamilyResponse(response);
}
