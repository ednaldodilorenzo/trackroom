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
  const logoPath = "/pwa-512x512.png";

  navigation.state === "submitting" ? show() : hide();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  return (
    <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center"><div className="w-full max-w-[26rem] p-4 sm:px-5">
      <div className="text-center">
        <img src={logoPath} alt="Logo" className="mx-auto h-12 w-12" />
        <div className="mt-4">
          <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">Bem Vindo de volta</h2>
          <p className="text-gray-400 dark:text-dark-300">Por favor entre para continuar</p>
        </div>
      </div>
      <div className="relative break-words print:border bg-white card rounded-lg border border-gray-200 dark:border-dark-600 print:border-0 mt-5 rounded-lg p-5 lg:p-7">
        <Form
          onSubmit={handleSubmit((data: FormData) =>
            submit(data, { method: "post" })
          )}
        >
          {actionData && (
            <ul>
              <li>Login ou senha inválida!</li>
            </ul>
          )}
          <TextField label="Email" name="email" type="email" control={control} />

          <TextField
            label="Senha"
            name="password"
            type="password"
            control={control}
          />

          <div className="mt-4 flex items-center justify-between space-x-2">
            <label className="input-label inline-flex items-center gap-2">
              <input className="form-checkbox this:primary border-gray-400/70 bg-origin-border before:bg-center before:bg-no-repeat before:[background-size:100%_100%] before:[background-image:var(--tw-thumb)] checked:border-this checked:bg-this indeterminate:border-this indeterminate:bg-this hover:border-this focus:border-this dark:border-dark-400 dark:checked:border-this-light dark:checked:bg-this-light dark:indeterminate:border-this-light dark:indeterminate:bg-this-light dark:hover:border-this-light dark:focus:border-this-light" type="checkbox" />
              <span className="label">Lembrar me</span>
            </label>
            <Link className="text-xs text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100" to="/forgot-password">Esqueceu a Senha?</Link>
          </div>

          <div style={{ marginTop: "32px" }}>
            <Button className="w-full" type="submit">Entrar</Button>
          </div>
        </Form>
        <div className="mt-2"></div>
        <div
          style={{
            marginTop: "16px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <a href="#">Ainda não possui uma conta?</a>
          <Link to="/signup">Criar conta</Link>
        </div>
      </div>
    </div></main>
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
    const from = url.searchParams.get("from") || "/";
    return redirect(from); // go back where the user tried to go
  }

  return { error: "Login failed", status: 400 };
}
