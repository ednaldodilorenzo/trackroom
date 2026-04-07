import { TextField, Button } from "@/components";
import { authService } from "../authSevice";
import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    function handleSubmit() {
        authService.startPasswordRecovery(email).then((success) => {
            if (success) {
                alert("Se o email estiver cadastrado, um link de recuperação será enviado.");                
            } else {
                alert("Ocorreu um erro ao iniciar a recuperação de senha. Tente novamente mais tarde.");
            }
            setEmail("");
        });
    }

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
                                                <form>
                                                    <div className="form-container vertical">
                                                        <div className="form-item vertical">
                                                            <TextField onChange={(e) => setEmail(e.target.value)} value={email} label="Email" name="email" type="email" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <Button onClick={handleSubmit} className="w-full">
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