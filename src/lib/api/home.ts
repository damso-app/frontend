import { ApiError, apiFetch } from "./client";
import { getReceivedQuestions } from "./answers";
import { sortReceivedQuestionsForAnswering } from "@/lib/questions/sort";
import { getCurrentUserFamilyMembers } from "./questions";
import type { QuestionDepth } from "./questions";
import type { FamilyMemberRole, UserRole } from "./users";

export interface HomeUserSummary {
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  role: UserRole;
}

export interface HomeFamilyMemberSummary extends HomeUserSummary {
  familyMemberId: number | null;
  familyId: number | null;
  roleLabel: string;
  active: boolean;
}

export interface PendingReceivedQuestionSummary {
  questionSendId: number;
  sender: HomeUserSummary;
  questionText: string;
  receivedAt: string;
  read: boolean;
  readAt: string | null;
  status: "sent" | "answered" | "cancelled" | "expired";
}

export interface LatestSentQuestionSummary {
  questionSendId: number;
  recipient: HomeUserSummary;
  questionText: string;
  depth: QuestionDepth;
  sentAt: string;
  read: boolean;
  readAt: string | null;
  answered: boolean;
  answeredAt: string | null;
  status: "sent" | "answered" | "cancelled" | "expired";
  aiStatus: string | null;
}

export interface HomeSummary {
  familyConnected: boolean;
  familyId: number | null;
  role: FamilyMemberRole | null;
  connectedToChild: boolean;
  connectedToParent: boolean;
  connectedMembers: HomeFamilyMemberSummary[];
  todayCompletedCount: number;
  pendingReceivedQuestion: PendingReceivedQuestionSummary | null;
  latestSentQuestion: LatestSentQuestionSummary | null;
  latestSentQuestions: LatestSentQuestionSummary[];
  aiStatus: string | null;
}

type ApiRecord = Record<string, unknown>;

const ROLE_LABEL: Record<FamilyMemberRole, string> = {
  child: "자녀",
  mother: "엄마",
  father: "아빠",
};

function asRecord(input: unknown): ApiRecord {
  return input && typeof input === "object" ? (input as ApiRecord) : {};
}

function asNullableRecord(input: unknown): ApiRecord | null {
  return input && typeof input === "object" ? (input as ApiRecord) : null;
}

function getArray(input: unknown, keys: string[]) {
  if (Array.isArray(input)) return input;

  const source = asRecord(input);
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function getString(source: ApiRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }

  return fallback;
}

function getNumber(source: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }

  return null;
}

function getBoolean(source: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
  }

  return false;
}

function getMemberActive(source: ApiRecord) {
  const status = getString(source, ["status", "memberStatus", "member_status", "state"], "active").toLowerCase();
  if (status === "inactive" || status === "pending" || status === "invited" || status === "deleted") return false;

  for (const key of ["active", "isActive", "is_active"]) {
    const value = source[key];
    if (typeof value === "boolean") return value;
  }

  return true;
}

function getNullableString(source: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") return value;
  }

  return null;
}

function normalizeRole(input: string): UserRole {
  if (input === "child" || input === "mother" || input === "father") return input;
  return "child";
}

function normalizeFamilyMemberRole(input: string): FamilyMemberRole | null {
  if (input === "child" || input === "mother" || input === "father") return input;
  return null;
}

function normalizeDepth(input: string): QuestionDepth {
  if (input === "tiny" || input === "medium" || input === "deep") return input;
  return "tiny";
}

function normalizeStatus(input: string): "sent" | "answered" | "cancelled" | "expired" {
  if (input === "answered" || input === "cancelled" || input === "expired") return input;
  return "sent";
}

function normalizeUser(input: unknown): HomeUserSummary {
  const source = asRecord(input);
  const role = normalizeRole(getString(source, ["role", "memberRole", "member_role"]));

  return {
    userId: getNumber(source, ["userId", "user_id", "id"]) ?? 0,
    displayName: getString(source, ["displayName", "display_name", "name"], ROLE_LABEL[role]),
    profileImageUrl: getNullableString(source, ["profileImageUrl", "profile_image_url"]),
    role,
  };
}

function normalizeFamilyMember(input: unknown): HomeFamilyMemberSummary {
  const source = asRecord(input);
  const role = normalizeRole(getString(source, ["role", "memberRole", "member_role"]));
  const displayName = getString(source, ["displayName", "display_name", "name"], ROLE_LABEL[role]);

  return {
    userId: getNumber(source, ["userId", "user_id", "id"]) ?? 0,
    familyMemberId: getNumber(source, ["familyMemberId", "family_member_id"]),
    familyId: getNumber(source, ["familyId", "family_id"]),
    displayName,
    profileImageUrl: getNullableString(source, ["profileImageUrl", "profile_image_url"]),
    role,
    roleLabel: role === "child" ? displayName || ROLE_LABEL.child : ROLE_LABEL[role],
    active: getMemberActive(source),
  };
}

function normalizePending(input: unknown): PendingReceivedQuestionSummary | null {
  const source = asNullableRecord(input);
  if (!source) return null;

  return {
    questionSendId: getNumber(source, ["questionSendId", "question_send_id", "id"]) ?? 0,
    sender: normalizeUser(source.sender ?? source.sender_user ?? source.senderUser),
    questionText: getString(source, ["questionText", "question_text"]),
    receivedAt: getString(source, ["receivedAt", "received_at", "sentAt", "sent_at"]),
    read: getBoolean(source, ["read"]),
    readAt: getNullableString(source, ["readAt", "read_at"]),
    status: normalizeStatus(getString(source, ["status"], "sent")),
  };
}

function normalizePendingQuestions(source: ApiRecord) {
  return getArray(source, [
    "pendingReceivedQuestions",
    "pending_received_questions",
    "receivedQuestions",
    "received_questions",
    "questions",
  ])
    .map(normalizePending)
    .filter((question): question is PendingReceivedQuestionSummary => question !== null)
    .filter((question) => question.status === "sent");
}

function normalizeLatestSent(input: unknown): LatestSentQuestionSummary | null {
  const source = asNullableRecord(input);
  if (!source) return null;

  return {
    questionSendId: getNumber(source, ["questionSendId", "question_send_id", "id"]) ?? 0,
    recipient: normalizeUser(source.recipient ?? source.recipient_user ?? source.recipientUser),
    questionText: getString(source, ["questionText", "question_text"]),
    depth: normalizeDepth(getString(source, ["depth"], "tiny")),
    sentAt: getString(source, ["sentAt", "sent_at"]),
    read: getBoolean(source, ["read"]),
    readAt: getNullableString(source, ["readAt", "read_at"]),
    answered: getBoolean(source, ["answered"]),
    answeredAt: getNullableString(source, ["answeredAt", "answered_at"]),
    status: normalizeStatus(getString(source, ["status"], "sent")),
    aiStatus: getNullableString(source, ["aiStatus", "ai_status", "answerStatus", "answer_status"]),
  };
}

function normalizeHomeSummary(
  input: unknown,
  connectedMembers: HomeFamilyMemberSummary[],
  receivedQuestions: PendingReceivedQuestionSummary[] = [],
): HomeSummary {
  const source = asRecord(input);
  const role = normalizeFamilyMemberRole(getNullableString(source, ["role", "memberRole", "member_role"]) ?? "");
  const responseMembers = getArray(source, ["connectedMembers", "connected_members", "familyMembers", "family_members"]).map(
    normalizeFamilyMember,
  );
  const members = responseMembers.length > 0 ? responseMembers : connectedMembers;
  const latestSentQuestions = getArray(source, ["latestSentQuestions", "latest_sent_questions", "sentQuestions", "sent_questions"])
    .map(normalizeLatestSent)
    .filter((question): question is LatestSentQuestionSummary => question !== null);
  const latestSentQuestion = normalizeLatestSent(source.latestSentQuestion ?? source.latest_sent_question);
  const pendingReceivedQuestions = normalizePendingQuestions(source);
  const pendingReceivedQuestion =
    sortReceivedQuestionsForAnswering(receivedQuestions)[0] ??
    sortReceivedQuestionsForAnswering(pendingReceivedQuestions)[0] ??
    normalizePending(source.pendingReceivedQuestion ?? source.pending_received_question);

  return {
    familyConnected: getBoolean(source, ["familyConnected", "family_connected"]) || members.length > 0,
    familyId: getNumber(source, ["familyId", "family_id"]) ?? members[0]?.familyId ?? null,
    role,
    connectedToChild:
      getBoolean(source, ["connectedToChild", "connected_to_child"]) ||
      members.some((member) => member.active && member.role === "child"),
    connectedToParent:
      getBoolean(source, ["connectedToParent", "connected_to_parent"]) ||
      members.some((member) => member.active && (member.role === "mother" || member.role === "father")),
    connectedMembers: members,
    todayCompletedCount: getNumber(source, ["todayCompletedCount", "today_completed_count"]) ?? 0,
    pendingReceivedQuestion,
    latestSentQuestion: latestSentQuestion ?? latestSentQuestions[0] ?? null,
    latestSentQuestions,
    aiStatus: getNullableString(source, ["aiStatus", "ai_status"]),
  };
}

export async function getHomeQuestionSummary(_currentUserId?: number | string) {
  void _currentUserId;
  try {
    const [homeResponse, familyMembers, receivedQuestions] = await Promise.all([
      apiFetch<unknown>("/v1/home/summary"),
      getCurrentUserFamilyMembers().catch(() => []),
      getReceivedQuestions({ unansweredOnly: true, sort: "unanswered_first" }).catch(() => []),
    ]);

    const connectedMembers = familyMembers.map((member) =>
      normalizeFamilyMember({
        familyMemberId: member.familyMemberId,
        familyId: member.familyId,
        userId: member.userId,
        displayName: member.name,
        profileImageUrl: member.profileImageUrl,
        role: member.role,
        active: true,
      }),
    );

    return normalizeHomeSummary(homeResponse, connectedMembers, receivedQuestions);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) throw error;
    throw error;
  }
}

export const getHomeSummary = getHomeQuestionSummary;
