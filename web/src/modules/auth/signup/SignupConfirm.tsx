import { Link, useLocation } from "react-router-dom";
import { BsEnvelopeCheck } from "react-icons/bs";

export default function SignupConfirm() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <main className="min-h-screen bg-gray-100 grid place-items-center px-4 py-8">
      <section className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-violet-100 text-violet-700 mx-auto flex items-center justify-center text-4xl mb-5">
          <BsEnvelopeCheck />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Confirme seu email
        </h1>

        <p className="text-sm text-gray-500 mt-3">
          Enviamos um email de confirmação
          {email ? (
            <>
              {" "}para <strong className="text-gray-700">{email}</strong>
            </>
          ) : null}
          . Acesse sua caixa de entrada e clique no link para ativar sua conta.
        </p>

        <div className="mt-6 rounded-2xl bg-violet-50 border border-violet-100 p-4 text-sm text-violet-800">
          Caso não encontre o email, verifique também a caixa de spam ou lixo eletrônico.
        </div>

        <Link
          to="/login"
          className="mt-6 h-12 rounded-2xl bg-violet-700 text-white font-bold flex items-center justify-center hover:bg-violet-800 transition"
        >
          Ir para login
        </Link>
      </section>
    </main>
  );
}