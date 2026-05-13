import "../Auth.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  redirect,
  useActionData,
  useNavigation,
  useSubmit,
  type ActionFunctionArgs,
} from "react-router-dom";

import { Button, Form, TextField } from "@/components";
import { useLoading } from "@/hooks/useLoading";
import { store } from "@/store";
import { authService } from "../authSevice";

const schema = yup.object({
  email: yup.string().required("Email obrigatório").email("Email inválido"),
  password: yup
    .string()
    .required("Senha obrigatória")
    .min(6, "Mínimo de 6 caracteres"),
});

type FormData = yup.InferType<typeof schema>;

type LoginActionData = {
  error?: string;
  status?: number;
};

export default function Login() {
  const actionData = useActionData() as LoginActionData | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();
  const { show, hide } = useLoading();
  const logoPath = "/pwa-512x512.png";

  const isSubmitting = navigation.state === "submitting";

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isSubmitting) {
      show();
    } else {
      hide();
    }
  }, [isSubmitting, show, hide]);

  function onSubmit(data: FormData) {
    submit(data, { method: "post" });
  }

  return (
    <main className="min-h-screen bg-gray-100 grid place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <section className="text-center mb-6">
          <img
            src={logoPath}
            alt="Logo"
            className="mx-auto h-16 w-16 rounded-2xl shadow-sm"
          />

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Entre para acessar suas músicas, grupos e playlists.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <Form onSubmit={handleSubmit(onSubmit)}>
            {actionData?.error && (
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                Email ou senha inválidos.
              </div>
            )}

            <div className="space-y-4">
              <TextField
                label="Email"
                name="email"
                type="email"
                control={control}
              />

              <TextField
                label="Senha"
                name="password"
                type="password"
                control={control}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-gray-300 text-violet-700 focus:ring-violet-500"
                />
                <span>Lembrar-me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-violet-700 hover:text-violet-800"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              className="w-full mt-8"
              type="submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </Form>

          <div className="mt-6 border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <span className="text-gray-500">Ainda não possui uma conta?</span>
            <Link
              to="/signup"
              className="font-semibold text-violet-700 hover:text-violet-800"
            >
              Criar conta
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export async function loginLoader() {
  const { user } = store.getState().auth || {};

  if (user) return redirect("/main");

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const result = await authService.login(email, password);

  if (result) {
    const url = new URL(request.url);
    const from = url.searchParams.get("from") || "/";

    return redirect(from);
  }

  return {
    error: "Login failed",
    status: 400,
  };
}