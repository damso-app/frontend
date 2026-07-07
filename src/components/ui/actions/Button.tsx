"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger" | "sage";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "type"> {
  /** Visual style */
  variant?: ButtonVariant;
  /** Size — all meet 44px min height except sm (36px) */
  size?: ButtonSize;
  /** Show spinner and disable — use during async actions */
  loading?: boolean;
  /** Element rendered before label (e.g. Lucide icon) */
  leftIcon?: ReactNode;
  /** Element rendered after label */
  rightIcon?: ReactNode;
  /** Stretch to container width */
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  style?: CSSProperties;
}

interface SizeSpec {
  fontSize: string;
  padding: string;
  height: string;
  gap: string;
  iconSize: string;
}

interface VariantStateSpec {
  base: CSSProperties;
  hover: CSSProperties;
  pressed: CSSProperties;
  disabled: CSSProperties;
}

const sizes: Record<ButtonSize, SizeSpec> = {
  sm: { fontSize: "13px", padding: "0 16px", height: "36px", gap: "6px", iconSize: "16px" },
  md: { fontSize: "15px", padding: "0 24px", height: "44px", gap: "8px", iconSize: "18px" },
  lg: { fontSize: "17px", padding: "0 32px", height: "52px", gap: "10px", iconSize: "20px" },
};

const variants: Record<ButtonVariant, VariantStateSpec> = {
  primary: {
    base: { background: "var(--color-coral-400)", color: "#fff", border: "none" },
    hover: { background: "var(--color-coral-500)" },
    pressed: { background: "var(--color-coral-600)" },
    disabled: { background: "var(--color-cream-400)", color: "var(--color-ink-200)" },
  },
  secondary: {
    base: { background: "transparent", color: "var(--color-ink-700)", border: "1.5px solid var(--color-cream-500)" },
    hover: { background: "var(--color-cream-100)", borderColor: "var(--color-ink-500)" },
    pressed: { background: "var(--color-cream-200)" },
    disabled: { background: "transparent", color: "var(--color-ink-200)", borderColor: "var(--color-cream-400)" },
  },
  ghost: {
    base: { background: "transparent", color: "var(--color-coral-400)", border: "none" },
    hover: { background: "var(--color-coral-50)" },
    pressed: { background: "var(--color-coral-100)" },
    disabled: { background: "transparent", color: "var(--color-ink-200)" },
  },
  soft: {
    base: { background: "var(--color-coral-100)", color: "var(--color-coral-600)", border: "none" },
    hover: { background: "var(--color-coral-200)" },
    pressed: { background: "var(--color-coral-200)" },
    disabled: { background: "var(--color-cream-200)", color: "var(--color-ink-200)" },
  },
  danger: {
    base: { background: "var(--color-error)", color: "#fff", border: "none" },
    hover: { background: "#B84030" },
    pressed: { background: "#9A3428" },
    disabled: { background: "var(--color-cream-400)", color: "var(--color-ink-200)" },
  },
  sage: {
    base: { background: "var(--color-sage-400)", color: "#fff", border: "none" },
    hover: { background: "var(--color-sage-500)" },
    pressed: { background: "var(--color-sage-600)" },
    disabled: { background: "var(--color-cream-400)", color: "var(--color-ink-200)" },
  },
};

/**
 * Button — primary interactive control.
 * Always pill-shaped (border-radius: full).
 * Minimum height 44px for senior accessibility.
 */
export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  onClick,
  type = "button",
  children,
  style,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const v = variants[variant] ?? variants.primary;
  const s = sizes[size] ?? sizes.md;
  const isDisabled = disabled || loading;

  const stateStyle = isDisabled
    ? v.disabled
    : pressed
    ? { ...v.base, ...v.pressed }
    : hovered
    ? { ...v.base, ...v.hover }
    : v.base;

  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-medium)",
    fontSize: s.fontSize,
    lineHeight: "var(--text-button-lh)",
    height: s.height,
    padding: s.padding,
    cursor: isDisabled ? "not-allowed" : "pointer",
    outline: "none",
    userSelect: "none",
    transition: "background-color 120ms ease, box-shadow 120ms ease, transform 100ms ease",
    transform: pressed && !isDisabled ? "scale(0.97)" : "none",
    whiteSpace: "nowrap",
    width: fullWidth ? "100%" : undefined,
    boxSizing: "border-box",
    ...stateStyle,
    ...style,
  };

  const spinnerStyle: CSSProperties = {
    width: s.iconSize,
    height: s.iconSize,
    border: "2px solid currentColor",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "memoir-spin 0.6s linear infinite",
    flexShrink: 0,
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={baseStyle}
      {...rest}
    >
      {loading ? (
        <span style={spinnerStyle} />
      ) : leftIcon ? (
        <span style={{ display: "flex", alignItems: "center", fontSize: s.iconSize, lineHeight: 1 }}>{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon ? (
        <span style={{ display: "flex", alignItems: "center", fontSize: s.iconSize, lineHeight: 1 }}>{rightIcon}</span>
      ) : null}
    </button>
  );
}
