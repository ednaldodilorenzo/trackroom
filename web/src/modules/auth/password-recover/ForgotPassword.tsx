import { TextField, Button } from "@/components";
import { authService } from "../authSevice";
import { useActionState, useEffect } from "react";
import { type FormState } from "@/model";
import toast from "react-hot-toast";
import { useLoading } from "@/hooks/useLoading";


export default function ForgotPassword() {    
    const { show, hide } = useLoading();
    const [state, requestAction, isPending] = useActionState<FormState, FormData>(async (_, formData) => {
        const { email } = Object.fromEntries(formData.entries());
        const validationErrors = {
            success: false, message: "Erro na validação de campos.", errors: {
                email: [] as string[],
            }
        };
        if (email.toString().trim() === "") {
            validationErrors.errors.email.push("O campo de email não pode estar vazio");
            return validationErrors;
        }

        if (!email.toString().includes("@")) {
            validationErrors.errors.email.push("Formato de E-mail inválido");
            return validationErrors;
        }

        return authService.startPasswordRecovery(email.toString()).then(() => ({ success: true, message: "Se o email estiver cadastrado, um link de recuperação será enviado." }))
            .catch((err) => ({ success: false, message: err.response.data.detail || "Ocorreu um erro ao alterar a senha. Tente novamente mais tarde." }));
    }, { success: false, message: "" });

    useEffect(() => {
        if (isPending) {
            show();
        } else {
            hide();

            if (state.success) {
                toast.success(state.message);
            } else if (state.message) {
                toast.error(state.message);
            }
        }

        return hide();
    }, [isPending, show, state.success]);


    return <div className="app-layout-blank flex flex-auto flex-col h-[100vh]">
        <div className="flex min-w-0 w-full flex-1">
            <div className="h-full flex flex-auto flex-col justify-between">
                <main className="h-full">
                    <div className="page-container relative h-full flex flex-auto flex-col pb-0 sm:pb-0 md:pb-0">
                        <div className="h-full bg-white">
                            <div className="container mx-auto flex flex-col flex-auto items-center justify-center min-w-0 h-full">
                                <div className="min-w-[320px] md:min-w-[400px] max-w-[400px]">
                                    <div>
                                        <div>
                                            <div className="mb-6">
                                                <h3 className="mb-2">Esqueceu a Senha?</h3>
                                                <p className="font-semibold heading-text">Por favor, insira seu email para receber um link de atualização</p>
                                            </div>
                                            <div>
                                                <form action={requestAction} noValidate>
                                                    <div className="form-container vertical">
                                                        <div className="form-item vertical">
                                                            <TextField label="Email" name="email" type="email" />
                                                            {state.errors?.email && <span className="md-error">{state.errors.email[0]}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <Button type="submit" className="w-full">
                                                            Enviar Link
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
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