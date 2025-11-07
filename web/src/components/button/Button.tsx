import "./Button.css";
import "../../styles/material.css";
import type { PropsWithChildren, ButtonHTMLAttributes, MouseEventHandler } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  variant?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function Button({
  children,
  onClick,
  type = "button",
  disabled,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className="md-button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant ?? undefined}
      {...props}
    >
      {children}
    </button>
  );
}
