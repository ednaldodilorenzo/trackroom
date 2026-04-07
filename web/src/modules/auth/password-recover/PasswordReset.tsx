import { Button, TextField } from "@/components";
import { Link, useParams, useNavigate } from "react-router-dom";
import { authService } from "../authSevice";
import { useActionState, useEffect } from "react";
import { useLoading } from "@/hooks/useLoading";
import toast from "react-hot-toast";

interface FormState {
    success: boolean;
    message: string;
    errors?: {
        password?: string[];
        confirmPassword?: string[];
    };
}

export default function PasswordReset() {
    const { token } = useParams();
    const { show, hide } = useLoading();
    const navigate = useNavigate();

    async function requestAction(_: FormState, formData: FormData): Promise<FormState> {
        const { password, confirmPassword } = Object.fromEntries(formData.entries());
        const validationErrors = {
            success: false, message: "Erro na validação de campos.", errors: {
                password: [] as string[],
                confirmPassword: [] as string[],
            }
        };

        if (password.toString().trim() === "") {
            validationErrors.errors.password.push("O campo de senha não pode estar vazio");
        }
        if (confirmPassword.toString().trim() === "") {
            validationErrors.errors.confirmPassword.push("O campo de confirmação de senha não pode estar vazio");
        }

        if (validationErrors.errors.password.length > 0 || validationErrors.errors.confirmPassword.length > 0) {
            return validationErrors;
        }

        if (password.toString() !== confirmPassword.toString()) {
            validationErrors.errors.confirmPassword.push("As senhas não coincidem");
            return validationErrors;
        }

        return authService.resetPassword(token!!, password.toString(), confirmPassword.toString())
            .then(() => ({ success: true, message: "Senha alterada com sucesso!" }))
            .catch((err) => ({ success: false, message: err.response.data.detail || "Ocorreu um erro ao alterar a senha. Tente novamente mais tarde." }));
    }

    const [state, formAction, isPending] = useActionState(requestAction, { success: false, message: "", errors: undefined });

    useEffect(() => {
        if (isPending) {
            show();
        } else {
            hide();

            if (state.success) {
                toast.success(state.message);
                navigate("/login");
            } else if (state.message) {
                toast.error(state.message);
            }
        }

        return hide();
    }, [show, hide, isPending, state.success]);


    return <div className="app-layout-blank flex flex-auto flex-col h-[100vh]">
        <div className="flex min-w-0 w-full flex-1">
            <div className="h-full flex flex-auto flex-col justify-between">
                <main className="h-full">
                    <div className="page-container relative h-full flex flex-auto flex-col pb-0 sm:pb-0 md:pb-0">
                        <div className="h-full bg-white">
                            <div className="container mx-auto flex flex-col flex-auto items-center justify-center min-w-0 h-full">
                                <div className="min-w-[320px] md:min-w-[400px] max-w-[400px]">
                                    <div>
                                        <div className="mb-6">
                                            <h3 className="mb-1">Alteração de Senha</h3>
                                            <p className="font-semibold heading-text">Sua nova senha deve ser diferente da senha anterior</p>
                                        </div>
                                        <div>
                                            <form action={formAction}>
                                                <div className="form-container vertical">
                                                    <div className="form-item vertical">
                                                        <TextField label="Senha" name="password" type="password" />
                                                        {state.errors?.password && (
                                                            <span className="md-error">{state.errors.password[0]}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="form-container vertical">
                                                    <div className="form-item vertical">
                                                        <TextField label="Confirmação da Senha" name="confirmPassword" type="password" />
                                                        {state.errors?.confirmPassword && (
                                                            <span className="md-error">{state.errors.confirmPassword[0]}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-6">
                                                    <Button type="submit" className="w-full">
                                                        Enviar
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <span>Voltar para o </span><Link to="/login" className="hover:underline heading-text font-bold" data-discover="true">
                                                Login
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>;
}