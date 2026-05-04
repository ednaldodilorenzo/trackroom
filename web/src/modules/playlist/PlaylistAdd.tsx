import { useForm } from "react-hook-form";
import { redirect, useSubmit, type ActionFunctionArgs } from "react-router-dom";
import groupService from "../group/group.service";
import type { Playlist } from "@/model/Playlist";
import toast from "react-hot-toast";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField } from "@/components";

const schema = yup.object().shape({
  title: yup.string().required("Informe o nome da playlist").min(3, "Mínimo de 3 caracteres"),  
});

export default function PlaylistAdd() {
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",    
  });

  const submit = useSubmit();

  return (
    <form onSubmit={handleSubmit((data) => submit(data, { method: "post" }))} className="min-h-screen bg-gray-100 pb-20">
      <main className="space-y-6">
        <section className="bg-white rounded-3xl shadow-sm p-5">
          <h2 className="font-bold text-lg mb-4">Informações</h2>

          <div className="mb-4">
            <TextField data-testid="field-title" name="title" label="Nome da playlist" control={control} />            
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição (opcional)
            </label>

            <textarea
              rows={3}
              placeholder="Ex: Músicas para momento de adoração"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"              
            />
          </div>
        </section>

        <section className="bg-violet-50 border border-violet-100 rounded-2xl p-4 text-sm text-violet-800">
          Após criar a playlist, você poderá adicionar músicas a ela.
        </section>
      </main>

      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-2xl">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full h-12 rounded-2xl font-bold transition ${isValid
              ? "bg-violet-700 text-white shadow-md hover:bg-violet-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            Criar playlist
          </button>
        </div>
      </div>
    </form>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const data = await request.formData();
  const groupId = params.id;
  const payload: Playlist = {
    title: data.get("title") as string,
  }

  try {
    await groupService.addPlaylist(parseInt(groupId!!), payload);
    toast.success("Playlist criada com sucesso!");
  } catch(err: any) {
    if (err.status === 401) {
      return err;
    }
    toast.error("Erro ao criar playlist. Tente novamente.");
  }

  return redirect(`/groups/${groupId}/playlists`);
}