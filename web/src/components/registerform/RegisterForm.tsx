import type { PropsWithChildren, FormHTMLAttributes } from "react";
import Button from "@/components/button/Button";
import Form from "@/components/form/Form";
import "./RegisterForm.css";

type RegisterFormProps = PropsWithChildren<
  FormHTMLAttributes<HTMLFormElement>
> & { formSubmit: () => void; cancelHandler: () => void };

export default function RegisterForm({
  children,
  title,
  formSubmit,
  cancelHandler,
  ...rest
}: RegisterFormProps) {
  return (
    <>
      <h2>{title}</h2>
      <Form onSubmit={formSubmit} {...rest}>
        {children}
        <div className="bottom-controls">
          <Button onClick={cancelHandler} variant="secondary">
            Cancelar
          </Button>
          <Button data-testid="button-salvar" name="Salvar" type="submit">Salvar</Button>
        </div>
      </Form>
    </>
  );
}
