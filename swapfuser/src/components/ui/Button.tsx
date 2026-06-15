"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "icon";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 font-username-sm text-username-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary rounded-full hover:bg-surface-tint shadow-sm hover:shadow",
  secondary:
    "border border-secondary text-secondary bg-transparent rounded-full hover:bg-secondary/10",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-primary-container/10 hover:text-primary rounded-lg",
  icon:
    "bg-transparent text-on-surface-variant hover:bg-surface-container rounded-full p-2",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-1.5 text-body-sm",
  md: "px-6 py-2.5",
  lg: "px-8 py-3 w-full",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button };

