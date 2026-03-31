import "../Auth.css";
import * as yup from "yup";
import { validateCPF } from "@/utils/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Form, TextField } from "@/components";
import { useForm } from "react-hook-form";
import { Link, redirect, useSubmit, useNavigation, type ActionFunctionArgs } from "react-router-dom";
import { authService, type SignupRequest } from "../authSevice";
import toast from "react-hot-toast";
import { useLoading } from "@/hooks/useLoading";

const schema = yup.object({
    name: yup.string().required("Nome obrigatório"),
    cpf: yup.string().required("CPF obrigatório").test("cpf", "CPF inválido", (value) => validateCPF(value || "")).test("cpf-availability", "CPF já cadastrado", async (value) => {
        if (!value) return false;
        const isAvailable = await authService.cpfAvailable(value);
        return isAvailable;
    }),
    username: yup.string().required("Usuário obrigatório").test("username-availability", "Usuário já cadastrado", async (value) => {
        if (!value) return false;
        const isAvailable = await authService.usernameAvailable(value);
        return isAvailable;
    }),
    phone: yup.string().required("Telefone obrigatório"),
    email: yup.string().required("Email obrigatório").email("Email inválido").test("email-availability", "Email já cadastrado", async (value) => {
        if (!value) return false;
        const isAvailable = await authService.emailAvailable(value);
        return isAvailable;
    }),
    password: yup
        .string()
        .required("Senha obrigatória")
        .min(6, "Mínimo de 6 caracteres"),
    confirmPassword: yup
        .string().required("Confirmação de senha obrigatória").oneOf([yup.ref("password")], "As senhas não coincidem"),
});

type FormData = yup.InferType<typeof schema>;

export default function Signup() {
    const { control, handleSubmit } = useForm<FormData>({
        resolver: yupResolver(schema),
        mode: "onBlur",
    });

    const { show, hide } = useLoading();

    const navigation = useNavigation();

    navigation.state === "submitting" ? show() : hide();

    const submit = useSubmit();

    return (
        <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center"><div className="w-full max-w-[26rem] p-4 sm:px-5">
            <div className="text-center">                
                <div className="mt-4">
                    <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">Bem Vindo ao Trackroom</h2>
                    <p className="text-gray-400 dark:text-dark-300">Por favor registre-se para continuar</p>
                </div>
            </div>
            <div className="relative break-words print:border bg-white card rounded-lg border border-gray-200 dark:border-dark-600 print:border-0 mt-5 rounded-lg p-5 lg:p-7">
                <Form
                    onSubmit={handleSubmit((data: FormData) => submit(data, { method: "post" }))}

                >
                    <h2 style={{ marginBottom: "20px" }}>Novo Usuário</h2>

                    <TextField label="Nome" name="name" type="text" control={control} />
                    <TextField maxLength={11} label="CPF" name="cpf" type="text" control={control} />
                    <TextField label="Usuário" name="username" type="text" control={control} />
                    <TextField maxLength={11} label="Telefone" name="phone" type="text" control={control} />
                    <TextField label="Email" name="email" type="email" control={control} />
                    <TextField
                        label="Senha"
                        name="password"
                        type="password"
                        control={control}
                    />

                    <TextField
                        label="Confirme a Senha"
                        name="confirmPassword"
                        type="password"
                        control={control}
                    />

                    <div style={{ marginTop: "32px" }}>
                        <Button className="w-full" type="submit">Enviar</Button>
                    </div>

                    <div
                        style={{
                            marginTop: "16px",
                            fontSize: "14px",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        Já possui cadastro? <Link to="/login">Entrar</Link>
                    </div>
                </Form>
            </div>
        </div>
        </main>
    );
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const payload: SignupRequest = {
        name: formData.get("name")?.toString() || "",
        cpf: formData.get("cpf")?.toString() || "",
        username: formData.get("username")?.toString() || "",
        phoneNumber: formData.get("phone")?.toString() || "",
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
        confirmPassword: formData.get("confirmPassword")?.toString() || "",
    };
    const result = await authService.signup(payload);
    if (result) {
        toast.success("Cadastro realizado com sucesso!");
        return redirect("/login");
    }

    return { error: "Signup failed", status: 400 };
}