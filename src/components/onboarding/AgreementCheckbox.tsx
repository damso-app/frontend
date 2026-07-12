"use client";

import type { ChangeEventHandler, ReactNode } from "react";
import { Card } from "@/components/ui";

interface AgreementCheckboxProps {
  id: string;
  title: string;
  description?: ReactNode;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

export function AgreementCheckbox({
  id,
  title,
  description,
  checked,
  onChange,
  onAction,
  actionLabel = "약관",
  disabled = false,
}: AgreementCheckboxProps) {
  return (
    <Card
      variant="base"
      elevation="subtle"
      padding="15px 14px"
      bg="var(--canvas)"
      style={{
        border: "var(--border-soft)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
        <label
          htmlFor={id}
          style={{
            display: "flex",
            minWidth: 0,
            flex: 1,
            cursor: disabled ? "not-allowed" : "pointer",
            alignItems: "center",
            gap: "var(--space-sm)",
          }}
        >
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              width: "24px",
              height: "24px",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--primary)",
              background: checked ? "var(--primary)" : "var(--canvas)",
              color: "#fff",
              boxSizing: "border-box",
              fontSize: "15px",
              fontWeight: "var(--weight-bold)",
              lineHeight: 1,
            }}
          >
            {checked ? "✓" : ""}
          </span>
          <span style={{ display: "flex", minWidth: 0, flexDirection: "column", gap: "3px" }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "15px",
                fontWeight: "var(--weight-semibold)",
                lineHeight: 1.42,
                color: "var(--text-1)",
                wordBreak: "keep-all",
              }}
            >
              {title}
            </span>
            {description && (
              <span className="text-caption" style={{ color: "var(--text-3)", wordBreak: "keep-all" }}>
                {description}
              </span>
            )}
          </span>
        </label>

        <button
          type="button"
          aria-label={`${title} 보기`}
          onClick={onAction}
          disabled={disabled}
          style={{
            minWidth: "48px",
            height: "30px",
            flexShrink: 0,
            border: "none",
            borderRadius: "var(--radius-full)",
            background: "var(--color-coral-50)",
            color: "var(--color-coral-600)",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.65 : 1,
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: "var(--weight-semibold)",
            lineHeight: 1,
          }}
        >
          {actionLabel}
        </button>
      </div>
    </Card>
  );
}
