import {
  useController,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import "./TextField.css";
import "../../styles/material.css";

type TextFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  label: string;
  value?: string;
  name: Path<TFieldValues>;
  control?: Control<any>;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "defaultValue" | "onChange" | "value" | "ref" | "id"
>;

export default function TextField<
  TFieldValues extends FieldValues = FieldValues
>({
  label,
  name,
  control,
  type = "text",
  rules = {},
  startIcon,
  endIcon,
  ...rest
}: TextFieldProps<TFieldValues>) {
  let fieldValue = undefined;
  let errorValue = undefined;
  if (control) {
    const {
      field,
      fieldState: { error },
    } = useController<TFieldValues, Path<TFieldValues>>({
      name,
      control,
      rules,
      // If you use form-level defaultValues, you can drop this cast.
      defaultValue: "" as any,
    });

    fieldValue = field;
    errorValue = error;
  }


  return (
    <div className={`md-text-field ${startIcon ? "has-start-icon" : ""} ${endIcon ? "has-end-icon" : ""}`}>
      {startIcon && <span className="md-icon start">{startIcon}</span>}
      <input
        {...fieldValue}
        type={type}
        id={name}
        name={name}
        placeholder=" "
        className={errorValue ? "invalid" : ""}
        aria-invalid={!!errorValue}
        {...rest}
      />
      {label && <label htmlFor={name}>{label}</label>}
      {endIcon && <span className="md-icon end">{endIcon}</span>}
      {errorValue && <span className="md-error">{errorValue.message}</span>}
    </div>
  );
}
