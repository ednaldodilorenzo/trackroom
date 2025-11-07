import "./Form.css";
import type { PropsWithChildren, FormHTMLAttributes } from "react";

type FormProps = PropsWithChildren<FormHTMLAttributes<HTMLFormElement>>;

export default function Form({ children, ...props }: FormProps) {
  return (
    <form className="md-form" {...props}>
      {children}
    </form>
  );
}
