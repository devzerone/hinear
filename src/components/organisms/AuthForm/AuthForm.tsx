import type * as React from "react";

import { cn } from "@/lib/utils";

type AuthFormVariant = "desktop" | "tablet" | "mobile";

const variantClassNames: Record<AuthFormVariant, string> = {
  desktop: "w-[420px] gap-6 p-7",
  tablet: "w-[420px] gap-6 p-7",
  mobile: "w-[345px] gap-5 p-5",
};

const titleClassNames: Record<AuthFormVariant, string> = {
  desktop: "text-[22px] leading-[22px]",
  tablet: "text-[24px] leading-[24px]",
  mobile: "text-[22px] leading-[22px]",
};

export interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onGoogleClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onSignUpClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  subtitle?: string;
  title?: string;
  variant?: AuthFormVariant;
}

export function AuthForm({
  className,
  onGoogleClick,
  onSignUpClick,
  subtitle = "Welcome back! Please enter your details.",
  title = "Sign in to your account",
  variant = "desktop",
  ...props
}: AuthFormProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-[20px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)]",
        variantClassNames[variant],
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <h2
          className={cn(
            "font-[var(--app-font-weight-600)] text-[var(--app-color-ink-900)]",
            titleClassNames[variant]
          )}
        >
          {title}
        </h2>
        <p className="text-[14px] leading-[1.45] font-normal text-[var(--app-color-gray-500)]">
          {subtitle}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--app-color-border-soft)]" />
          <span className="text-[12px] leading-[12px] font-normal text-[var(--app-color-gray-500)]">
            Continue with Google
          </span>
          <div className="h-px flex-1 bg-[var(--app-color-border-soft)]" />
        </div>

        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] px-4"
          onClick={onGoogleClick}
          type="button"
        >
          <span className="text-[16px] leading-none font-[var(--app-font-weight-700)] text-[var(--app-color-black)]">
            G
          </span>
          <span className="text-[14px] leading-[14px] font-[var(--app-font-weight-500)] text-[var(--app-color-black)]">
            Continue with Google
          </span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1">
        <span className="text-[13px] leading-[13px] font-normal text-[var(--color-neutral-500)]">
          Don&apos;t have an account?
        </span>
        <button
          className="text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-brand-500)]"
          onClick={onSignUpClick}
          type="button"
        >
          Sign up
        </button>
      </div>
    </section>
  );
}
