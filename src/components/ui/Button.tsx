import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "success" | "danger" | "outline-primary" | "outline-secondary" | "link" | "light" | "dark";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  success: "btn-success",
  danger: "btn-danger",
  "outline-primary": "btn-outline-primary",
  "outline-secondary": "btn-outline-secondary",
  link: "btn-link",
  light: "btn-light",
  dark: "btn-dark",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("btn", variantClass[variant], size && `btn-${size}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
