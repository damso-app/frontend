"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface BottomNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface BottomNavProps extends Omit<HTMLAttributes<HTMLElement>, "style" | "onChange"> {
  items: BottomNavItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  style?: CSSProperties;
}

/**
 * BottomNav — fixed-position primary navigation for the mobile web app.
 * Active item gets a pill highlight; label color stays the same for all items.
 */
export function BottomNav({ items, activeId, onChange, style, ...rest }: BottomNavProps) {
  const active = activeId ?? items[0]?.id;

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        height: "42px",
        background: "#fff",
        border: "var(--border-base)",
        borderRadius: "var(--radius-md)",
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange?.(item.id)}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                height: "32px",
                padding: "0 14px",
                borderRadius: "var(--radius-full)",
                background: isActive ? "var(--primary-subtle)" : "transparent",
                border: isActive ? "var(--border-soft)" : "1px solid transparent",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: "var(--weight-medium)",
                color: "var(--text-3)",
                whiteSpace: "nowrap",
                transition: "background-color 150ms ease, border-color 150ms ease",
              }}
            >
              {item.icon}
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
