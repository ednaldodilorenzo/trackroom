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
        <div className="auth-container">
            <Form
                className="auth-form"
                onSubmit={handleSubmit((data: FormData) => submit(data, { method: "post" }))}

            >
                <h2 style={{ marginBottom: "20px" }}>Novo Usuário</h2>

                <TextField label="Nome" name="name" type="text" control={control} />
                <TextField label="CPF" name="cpf" type="text" control={control} />
                <TextField label="Usuário" name="username" type="text" control={control} />
                <TextField label="Telefone" name="phone" type="text" control={control} />
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
                    <Button type="submit">Enviar</Button>
                </div>

                <div
                    style={{
                        marginTop: "16px",
                        fontSize: "14px",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Link to="/login">Já possui cadastro?</Link>
                </div>
            </Form>
        </div>
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