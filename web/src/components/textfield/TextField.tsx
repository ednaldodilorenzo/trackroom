import {
  useController,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import type { InputHTMLAttributes } from "react";
import "./TextField.css";
import "../../styles/material.css";

type TextFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  label: string;
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
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
  ...rest
}: TextFieldProps<TFieldValues>) {
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

  return (
    <div className="md-text-field">
      <input
        {...field}
        type={type}
        id={name}
        placeholder=" "
        className={error ? "invalid" : ""}
        aria-invalid={!!error}
        {...rest}
      />
      <label htmlFor={name}>{label}</label>
      {error && <span className="md-error">{error.message}</span>}
    </div>
  );
}
