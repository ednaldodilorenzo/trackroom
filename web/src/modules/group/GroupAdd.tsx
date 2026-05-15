import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import {
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  type ActionFunctionArgs,
}
  from "react-router-dom";
import toast from "react-hot-toast";

import { TextField } from "@/components";
import { useLoading } from "@/hooks/useLoading";
import groupService from "./group.service";
import type { Group } from "@/model/Group";
import { useGroupContext } from "./GroupContext";

const schema = yup.object({
  name: yup.string().trim().required("Nome obrigatório"),
  description: yup.string().trim().required("Descrição obrigatória"),
});

type FormData = yup.InferType<typeof schema>;

export default function GroupAdd() {
  const { id } = useParams();
  let groupContext = undefined;
  if (id) {
    groupContext = useGroupContext();
  }
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { show, hide } = useLoading();

  const isEditing = Boolean(id);
  const isSubmitting = navigation.state === "submitting";

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData, any, FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    values: id ? {
      name: groupContext?.currentGroup?.name || "",
      description: groupContext?.currentGroup?.description || "",
    } : undefined,
  });

  useEffect(() => {
    if (isSubmitting) {
      show();
    } else {
      hide();
    }
  }, [isSubmitting, show, hide]);

  function handleCancel() {
    if (isEditing && id) {
      navigate(`/groups/${id}/home`);
      return;
    }

    navigate("/");
  }

  async function onSubmit(data: FormData) {
    const payload: Group = {
      id: id,
      name: data.name,
      description: data.description,
      cover: "teste",
      active: true,
    };

    try {
      if (payload.id) {
        await groupService.updateGroup(Number(payload.id), payload);
        toast.success("Grupo atualizado com sucesso!");
        return navigate(`/groups/${payload.id}/home`);
      }

      await groupService.save(payload);
      toast.success("Grupo cadastrado com sucesso!");
      navigate("/");
    } catch (err: any) {
      if (err?.status === 401) {
        return err;
      }

      toast.error("Não foi possível salvar o grupo.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-gray-100 pb-24">      
      <main className="px-4 pt-6 space-y-6">
        <section className="bg-white rounded-3xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-2xl font-bold">
              ♫
            </div>

            <div>
              <h2 className="font-bold text-lg text-gray-900">Informações do grupo</h2>
              <p className="text-sm text-gray-500">
                Defina um nome e uma descrição para identificar o grupo.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <TextField
              data-testid="field-name"
              name="name"
              label="Nome"
              control={control}
            />

            <TextField
              data-testid="field-description"
              name="description"
              label="Descrição"
              control={control}
            />
          </div>
        </section>

        {!isEditing && (
          <section className="bg-violet-50 border border-violet-100 rounded-2xl p-4 text-sm text-violet-800">
            Depois de criar o grupo, você poderá adicionar músicas e organizar playlists.
          </section>
        )}
      </main>

      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-2xl">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="h-12 px-5 rounded-2xl cursor-pointer font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`flex-1 h-12 rounded-2xl font-bold transition ${isValid && !isSubmitting
              ? "bg-violet-700 cursor-pointer text-white shadow-md hover:bg-violet-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Criar grupo"}
          </button>
        </div>
      </div>
    </form>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const groupId = data.get("id")?.toString() || null;  

  const payload: Group = {
    id: groupId ?? undefined,
    name: data.get("name")?.toString() ?? "",
    description: data.get("description")?.toString() ?? "",
    cover: "teste",
    active: true,
  };

  try {
    if (payload.id) {
      await groupService.updateGroup(Number(payload.id), payload);
      toast.success("Grupo atualizado com sucesso!");
      return redirect(`/groups/${payload.id}`);
    }

    await groupService.save(payload);
    toast.success("Grupo cadastrado com sucesso!");
    return redirect("/");
  } catch (err: any) {
    if (err?.status === 401) {
      return err;
    }

    toast.error("Não foi possível salvar o grupo.");
    return null;
  }
}
