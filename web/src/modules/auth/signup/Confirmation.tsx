import { Button, OtpInput } from "@/components";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../authSevice";
import toast from "react-hot-toast";


export default function Confirmation() {
    const [code, setCode] = useState("");

    const { token } = useParams();
    const navigate = useNavigate();

    function handleConfirm(code: string) {
        setCode(code);
        // Placeholder for confirmation logic
        authService.confirmSignup(code, token || "").then((success) => {
            if (success) {
                toast.success("Usuário confirmado com sucesso!");
                navigate("/login");
            } else {
                toast.error("Falha na confirmação do usuário. Verifique o código e tente novamente.");
            }

        })
    }

    return (<div className="max-w-sm space-y-4 p-6">
        <OtpInput
            label="Código de 6 dígitos"
            value={code}
            onChange={setCode}
            onComplete={handleConfirm}
            autoFocus            
        />

        <Button
            disabled={code.length !== 6}
            onClick={() => handleConfirm(code)}
            className="w-full"
        >
            Confirmar
        </Button>
    </div>
    );
}


//function action() {
// Placeholder for potential future loader logic
//}
