"use client";

import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { getFamilyInvitation, joinFamily, normalizeInviteCodeForApi } from "@/lib/api/families";
import type { FamilyInvitationValidation } from "@/lib/api/families";
import { getMyOnboardingStatus } from "@/lib/api/users";
import type { UserRole } from "@/lib/api/users";
import { clearPendingInviteCode, savePendingInviteCode } from "@/lib/auth/pending-invite";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";
import { getNextOnboardingRoute } from "@/lib/onboarding/next-route";
import { FamilyConnectionPanel, FamilyOnboardingFrame, InfoBox, PhoneCard } from "./FamilyInviteScreen";

const CODE_LENGTH = 6;

function formatInviteCode(codeValues: string[]) {
  const rawCode = codeValues.join("");
  return rawCode.length === CODE_LENGTH ? `${rawCode.slice(0, 3)}-${rawCode.slice(3)}` : rawCode;
}

function sanitizeCodeInput(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function getCodeValuesFromRaw(rawValue?: string) {
  const sanitized = sanitizeCodeInput(rawValue ?? "").slice(0, CODE_LENGTH);

  return Array.from({ length: CODE_LENGTH }, (_, index) => sanitized[index] ?? "");
}

function getValidateErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 필요합니다.";
    if (error.status === 404) return "초대 코드를 찾을 수 없습니다.";
    if (error.status === 410) return "만료된 초대 코드입니다.";
  }

  return "초대 코드를 확인하지 못했습니다.";
}

function getJoinErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 필요합니다.";
    if (error.status === 404) return "초대 코드를 찾을 수 없습니다.";
    if (error.status === 409) return "이미 가족에 연결되어 있습니다.";
    if (error.status === 410) return "만료된 초대 코드입니다.";
  }

  return "가족에 합류하지 못했습니다. 다시 시도해주세요.";
}

export function FamilyCodeScreen({
  initialInviteCode,
  initialInviterRole = null,
  initialRecommendedRole = null,
}: {
  initialInviteCode?: string;
  initialInviterRole?: UserRole | null;
  initialRecommendedRole?: UserRole | null;
}) {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const didHandleInitialInviteRef = useRef(false);
  const [codeValues, setCodeValues] = useState(() => getCodeValuesFromRaw(initialInviteCode));
  const [validation, setValidation] = useState<FamilyInvitationValidation | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isPreparingInvite, setIsPreparingInvite] = useState(() => Boolean(normalizeInviteCodeForApi(initialInviteCode ?? "")));
  const [errorMessage, setErrorMessage] = useState("");

  const inviteCode = useMemo(() => formatInviteCode(codeValues), [codeValues]);
  const isComplete = codeValues.every(Boolean);
  const normalizedInviteCode = useMemo(() => normalizeInviteCodeForApi(inviteCode), [inviteCode]);
  const canSubmit = isComplete && !isJoining && !isPreparingInvite;

  const handleUnauthorized = useCallback(() => {
    clearAccessToken();
    router.replace("/login");
  }, [router]);

  const setCodeFromRaw = (rawValue: string, startIndex = 0) => {
    const sanitized = sanitizeCodeInput(rawValue);
    if (!sanitized) return;

    setCodeValues((current) => {
      const next = [...current];
      sanitized
        .slice(0, CODE_LENGTH - startIndex)
        .split("")
        .forEach((character, offset) => {
          next[startIndex + offset] = character;
        });
      return next;
    });

    setValidation(null);
    setErrorMessage("");

    const nextIndex = Math.min(startIndex + sanitized.length, CODE_LENGTH - 1);
    requestAnimationFrame(() => inputRefs.current[nextIndex]?.focus());
  };

  const handleChange = (index: number, value: string) => {
    const sanitized = sanitizeCodeInput(value);

    if (sanitized.length > 1) {
      setCodeFromRaw(sanitized, index);
      return;
    }

    setCodeValues((current) => {
      const next = [...current];
      next[index] = sanitized;
      return next;
    });
    setValidation(null);
    setErrorMessage("");

    if (sanitized && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace") return;

    if (codeValues[index]) {
      setCodeValues((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      setValidation(null);
      setErrorMessage("");
      event.preventDefault();
      return;
    }

    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
      setCodeValues((current) => {
        const next = [...current];
        next[index - 1] = "";
        return next;
      });
      setValidation(null);
      setErrorMessage("");
      event.preventDefault();
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setCodeFromRaw(event.clipboardData.getData("text"), index);
  };

  const validateInviteCode = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return null;
    }

    setErrorMessage("");
    setValidation(null);

    try {
      const result = await getFamilyInvitation(inviteCode);
      if (normalizedInviteCode) {
        savePendingInviteCode(normalizedInviteCode, {
          inviterRole: result.inviterRole,
          recommendedRole: result.recommendedRole,
        });
      }
      setValidation(result);
      return result;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        handleUnauthorized();
        return null;
      }

      setErrorMessage(getValidateErrorMessage(error));
      return null;
    }
  }, [handleUnauthorized, inviteCode, normalizedInviteCode, router]);

  const joinWithCurrentCode = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return false;
    }

    setIsJoining(true);
    setErrorMessage("");

    try {
      const validated = normalizeInviteCodeForApi(validation?.inviteCode ?? "") === normalizedInviteCode ? validation : await validateInviteCode();

      if (!validated) return;
      if (validated.available === false) {
        setErrorMessage("사용할 수 없는 초대 코드입니다.");
        return;
      }

      await joinFamily({ inviteCode: normalizedInviteCode });
      clearPendingInviteCode();
      router.replace("/");
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        handleUnauthorized();
        return false;
      }

      setErrorMessage(getJoinErrorMessage(error));
      return false;
    } finally {
      setIsJoining(false);
    }
  }, [handleUnauthorized, normalizedInviteCode, router, validateInviteCode, validation]);

  useEffect(() => {
    if (!initialInviteCode || didHandleInitialInviteRef.current) return;
    didHandleInitialInviteRef.current = true;

    const normalizedInitialInviteCode = normalizeInviteCodeForApi(initialInviteCode);
    if (!normalizedInitialInviteCode) {
      return;
    }

    savePendingInviteCode(normalizedInitialInviteCode, {
      inviterRole: initialInviterRole,
      recommendedRole: initialRecommendedRole,
    });

    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function continueInviteFlow() {
      try {
        const status = await getMyOnboardingStatus();
        if (!status.requiredAgreementsCompleted || !status.role) {
          router.replace(getNextOnboardingRoute(status));
          return;
        }

        if (status.familyConnected || status.onboardingCompleted) {
          clearPendingInviteCode();
          router.replace("/");
          return;
        }

        await joinWithCurrentCode();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          handleUnauthorized();
          return;
        }

        setErrorMessage(getJoinErrorMessage(error));
      } finally {
        setIsPreparingInvite(false);
      }
    }

    void continueInviteFlow();
  }, [handleUnauthorized, initialInviteCode, initialInviterRole, initialRecommendedRole, joinWithCurrentCode, router]);

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;
    await joinWithCurrentCode();
  };

  return (
    <FamilyOnboardingFrame>
      <div style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column", width: "100%" }}>
        <form
          id="family-code-form"
          onSubmit={handleJoin}
          style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column" }}
        >
          <PhoneCard
            eyebrow="가족 연결"
            title={
              <>
                가족과 직접
                <br />
                연결하세요
              </>
            }
            description="연결 코드로 부모님과 자녀 휴대폰을 직접 연결합니다."
            footer={
              <>
                {errorMessage && (
                  <p className="text-caption" role="alert" style={{ margin: 0, textAlign: "center", color: "var(--color-error)" }}>
                    {errorMessage}
                  </p>
                )}
                {validation && !errorMessage && (
                  <p className="text-caption" role="status" style={{ margin: 0, textAlign: "center", color: "var(--color-success)" }}>
                    {validation.familyName ?? "담소 가족"} 연결 코드가 확인됐습니다.
                  </p>
                )}
                <Button
                  size="md"
                  fullWidth
                  loading={isJoining || isPreparingInvite}
                  disabled={!canSubmit}
                  type="submit"
                  style={{
                    minHeight: "50px",
                    fontSize: "14px",
                    fontWeight: "var(--weight-bold)",
                  }}
                >
                  연결하기
                </Button>
                <p className="text-caption" style={{ margin: 0, textAlign: "center", color: "var(--text-2)" }}>
                  연결코드로 가족들을 <br />
                  직접 연결할 수 있어요.
                </p>
              </>
            }
          >
            <FamilyConnectionPanel connectorLabel="직접 연결" parentSrc="/mother.png" />
            <CodeInputPanel
              codeValues={codeValues}
              inputRefs={inputRefs}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              disabled={isJoining}
            />
            <InfoBox
              title="연결코드로 직접 연결하기"
              description="상대방 앱에서 연결 코드 번호를 입력하면 연결됩니다."
              background="var(--color-cream-100)"
            />
          </PhoneCard>
        </form>
      </div>
    </FamilyOnboardingFrame>
  );
}

function CodeInputPanel({
  codeValues,
  inputRefs,
  onChange,
  onKeyDown,
  onPaste,
  disabled,
}: {
  codeValues: string[];
  inputRefs: MutableRefObject<Array<HTMLInputElement | null>>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (index: number, event: ClipboardEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        background: "var(--color-cream-100)",
        border: "1px solid var(--hairline-soft)",
        padding: "var(--space-md) var(--space-lg) var(--space-lg)",
      }}
    >
      <label
        htmlFor="family-code-0"
        className="text-caption"
        style={{ display: "block", margin: "0 0 var(--space-sm)", color: "var(--color-coral-600)", fontWeight: "var(--weight-semibold)" }}
      >
        연결 코드 입력
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) auto repeat(3, 1fr)", gap: "7px", alignItems: "center" }}>
        {codeValues.map((value, index) => (
          <CodeInput
            key={index}
            id={`family-code-${index}`}
            value={value}
            disabled={disabled}
            inputRef={(node) => {
              inputRefs.current[index] = node;
            }}
            onChange={(nextValue) => onChange(index, nextValue)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={(event) => onPaste(index, event)}
            renderHyphenAfter={index === 2}
          />
        ))}
      </div>
    </div>
  );
}

function CodeInput({
  id,
  value,
  disabled,
  inputRef,
  onChange,
  onKeyDown,
  onPaste,
  renderHyphenAfter,
}: {
  id: string;
  value: string;
  disabled: boolean;
  inputRef: (node: HTMLInputElement | null) => void;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  renderHyphenAfter: boolean;
}) {
  const input = (
    <input
      id={id}
      ref={inputRef}
      value={value}
      disabled={disabled}
      inputMode="text"
      maxLength={1}
      autoCapitalize="characters"
      aria-label="연결 코드"
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      style={{
        width: "100%",
        aspectRatio: "1",
        border: "1.5px solid var(--color-coral-100)",
        borderRadius: "var(--radius-lg)",
        background: disabled ? "var(--color-coral-50)" : "#fff",
        color: "var(--text-1)",
        fontFamily: "var(--font-mono)",
        fontSize: "18px",
        fontWeight: "var(--weight-bold)",
        lineHeight: 1,
        textAlign: "center",
        textTransform: "uppercase",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );

  if (!renderHyphenAfter) return input;

  return (
    <>
      {input}
      <span style={{ color: "var(--text-3)", fontSize: "20px", fontWeight: "var(--weight-bold)", textAlign: "center" }}>-</span>
    </>
  );
}
