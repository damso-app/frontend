import type { CSSProperties, ReactNode } from "react";
import { Card } from "@/components/ui";

interface OnboardingInfoCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  bg?: string;
  style?: CSSProperties;
}

export function OnboardingInfoCard({ icon, title, description, bg, style }: OnboardingInfoCardProps) {
  return (
    <Card variant="base" elevation="subtle" padding="var(--space-md)" bg={bg} style={style}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-sm)" }}>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              width: "36px",
              height: "36px",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-full)",
              background: "var(--primary-subtle)",
              color: "var(--primary)",
            }}
          >
            {icon}
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: "16px",
              fontWeight: "var(--weight-semibold)",
              lineHeight: 1.45,
              color: "var(--text-1)",
            }}
          >
            {title}
          </p>
          <p className="text-caption" style={{ margin: "4px 0 0" }}>
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
