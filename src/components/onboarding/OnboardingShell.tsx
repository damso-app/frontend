import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

interface OnboardingShellProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  contentJustify?: CSSProperties["justifyContent"];
  contentPadding?: CSSProperties["padding"];
  style?: CSSProperties;
}

export function OnboardingShell({
  eyebrow = "DAMSO",
  title,
  description,
  children,
  footer,
  contentJustify = "center",
  contentPadding = "var(--space-xxl) 0",
  style,
}: OnboardingShellProps) {
  return (
    <main
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        maxWidth: "var(--page-max-width)",
        minHeight: "100svh",
        background: "var(--canvas)",
        padding: "var(--space-xl) var(--page-padding-mobile) max(var(--space-xl), env(safe-area-inset-bottom))",
        ...style,
      }}
    >
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-md)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: "var(--weight-semibold)",
              letterSpacing: "0",
              color: "var(--primary)",
            }}
          >
            {eyebrow}
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: "32px",
              fontWeight: "var(--weight-bold)",
              lineHeight: 1.22,
              letterSpacing: "0",
              color: "var(--text-1)",
            }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-body-sm" style={{ margin: 0, color: "var(--text-2)" }}>
              {description}
            </p>
          )}
        </div>
        <Image
          src="/logo.svg"
          alt="담소"
          width={84}
          height={38}
          style={{ flexShrink: 0, width: "84px", height: "38px", objectFit: "contain" }}
        />
      </header>

      <section
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: contentJustify,
          gap: "var(--space-lg)",
          padding: contentPadding,
        }}
      >
        {children}
      </section>

      {footer && (
        <footer style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>{footer}</footer>
      )}
    </main>
  );
}
