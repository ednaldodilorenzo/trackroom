import "../Auth.css";
import { useForm } from "react-hook-form";
import { Button, Form, TextField } from "@/components";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useNavigation,
  redirect,
  useSubmit,
  useActionData,
  type ActionFunctionArgs,
} from "react-router-dom";
import { useLoading } from "@/hooks/useLoading";
import { store } from "@/store";
import { authService } from "../authSevice";
import { Link } from "react-router-dom";

const schema = yup.object({
  email: yup.string().required("Email obrigatório").email("Email inválido"),
  password: yup
    .string()
    .required("Senha obrigatória")
    .min(6, "Mínimo de 6 caracteres"),
});

type FormData = yup.InferType<typeof schema>;

export default function Login() {
  const actionData = useActionData();
  const submit = useSubmit();
  const { show, hide } = useLoading();

  const navigation = useNavigation();

  navigation.state === "submitting" ? show() : hide();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  return (
    <div className="auth-container">
      <Form
        className="auth-form"
        onSubmit={handleSubmit((data: FormData) =>
          submit(data, { method: "post" })
        )}
      >
        {actionData && (
          <ul>
            <li>Login ou senha inválida!</li>
          </ul>
        )}
        <h2 style={{ marginBottom: "20px" }}>Login</h2>

        <TextField label="Email" name="email" type="email" control={control} />

        <TextField
          label="Senha"
          name="password"
          type="password"
          control={control}
        />

        <div style={{ marginTop: "32px" }}>
          <Button type="submit">Entrar</Button>
        </div>

        <div
          style={{
            marginTop: "16px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <a href="#">Esqueceu a senha?</a>
          <Link to="/signup">Criar conta</Link>
        </div>
      </Form>
    </div>
  );
}

export async function loginLoader() {
  // already authed? skip login
  const { user } = store.getState().auth || {};
  if (user) return redirect("/main");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());
  const result = await authService.login(payload.email.toString(), payload.password.toString());

  if (result) {
    const url = new URL(request.url);
    const from = url.searchParams.get("from") || "/home";
    return redirect(from); // go back where the user tried to go
  }

  return { error: "Login failed", status: 400 };
}
