import { Suspense } from "react";
import {
  Await,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import toast from "react-hot-toast";

import { FallbackOverlay, TextField } from "@/components";
import type { Music } from "@/model";
import { musicService } from "./music.service";
import groupService from "../group/group.service";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";

const schema = yup
  .object({
    name: yup.string().trim().required("Nome é obrigatório"),
    description: yup.string().trim().required("Álbum é obrigatório"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

type MusicAddLoaderData = {
  music: Promise<Music | null>;
};

function MusicForm({ loadedMusic, handleCancel, onSubmit }: { loadedMusic: Music | null, handleCancel: () => void, onSubmit: (formPayload: FormData, event?: React.BaseSyntheticEvent) => void }) {
  // const submit = useSubmit();

  const isEditing = Boolean(loadedMusic?.id);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    values: loadedMusic
      ? {
        name: loadedMusic.name,
        description: loadedMusic.description,
      }
      : {
        name: "",
        description: "",
      },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      encType="multipart/form-data"
      className="min-h-screen bg-gray-100 pb-24"
    >
      <main className="mb-4 pt-2 space-y-6">
        <section className="bg-white rounded-3xl shadow-sm p-5">
          <h2 className="font-bold text-lg mb-4">Informações</h2>

          <div className="space-y-4">
            <TextField label="Nome" name="name" control={control} />
            <TextField label="Álbum" name="description" control={control} />
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-5">
          <h2 className="font-bold text-lg mb-2">Arquivo de áudio</h2>
          <p className="text-sm text-gray-500 mb-4">
            Selecione um arquivo de áudio para esta música.
          </p>

          <label
            htmlFor="file-music"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 px-4 py-8 text-center cursor-pointer hover:bg-violet-100 transition"
          >
            <span className="w-14 h-14 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-3xl">
              ♪
            </span>
            <span className="font-bold text-violet-700">Escolher arquivo</span>
            <span className="text-xs text-gray-500">MP3, WAV ou outro formato de áudio</span>
          </label>

          <input
            id="file-music"
            name="file"
            accept="audio/*"
            type="file"
            data-testid="file-input"
            className="sr-only"
          />

          {isEditing && (
            <p className="text-xs text-gray-500 mt-3">
              Ao editar, envie um novo arquivo somente se desejar substituir o áudio atual.
            </p>
          )}
        </section>
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
            className={`flex-1 h-12 rounded-2xl font-bold cursor-pointer transition ${isValid && !isSubmitting
              ? "bg-violet-700 text-white shadow-md hover:bg-violet-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {isEditing ? "Salvar alterações" : "Cadastrar música"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function MusicAdd() {
  const { music } = useLoaderData() as MusicAddLoaderData;

  const location = useLocation();
  const navigate = useNavigate();
  const { id, musicId } = useParams();

  const returnTo = location.state?.returnTo ?? "";

  function handleCancel() {
    navigate(returnTo);
  }

  async function handleSubmit(formPayload: FormData, event?: React.BaseSyntheticEvent) {
    const form = event?.target as HTMLFormElement | undefined;
    if (!form) return;
    const formData = new FormData(form);

    const payload: Music = {
      name: formPayload.name,
      description: formPayload.description,
      file: formData.get("file") instanceof File ? (formData.get("file") as File).name : "",
      groupId: Number(id),
    };

    const fileEntry = formData.get("file");
    const hasValidFile = fileEntry instanceof File && fileEntry.size > 0;

    try {
      const musicResp = musicId
        ? await musicService.update(Number(musicId), payload)
        : await groupService.addMusic(Number(id), payload);

      if (hasValidFile) {
        await musicService.uploadFile(musicResp.uploadUrl, fileEntry);
        await musicService.confirmFileUpload(musicResp.id);
      }

      toast.success(
        musicId ? "Música atualizada com sucesso!" : "Música cadastrada com sucesso!"
      );
      navigate(returnTo);
    } catch (err: any) {
      if (err?.status === 401) {
        return err;
      }

      toast.error("Não foi possível salvar a música.");
    }
  }

  useHeaderConfig({
    backButtonLink: returnTo,
  }, false);

  return (
    <Suspense fallback={<FallbackOverlay />}>
      <Await resolve={music}>{(loadedMusic) => <MusicForm onSubmit={handleSubmit} handleCancel={handleCancel} loadedMusic={loadedMusic} />}</Await>
    </Suspense>
  );
}

// export async function action({ request, params }: ActionFunctionArgs) {
//   const data = await request.formData();
//   const groupId = Number(params.id);
//   const musicId = params.musicId ? Number(params.musicId) : null;

//   const payload: Music = {
//     name: data.get("name")?.toString() ?? "",
//     description: data.get("description")?.toString() ?? "",
//     file: data.get("file") instanceof File ? (data.get("file") as File).name : "",
//     groupId,
//   };

//   const fileEntry = data.get("file");
//   const hasValidFile = fileEntry instanceof File && fileEntry.size > 0;

//   try {
//     const musicResp = musicId
//       ? await musicService.update(musicId, payload)
//       : await groupService.addMusic(groupId, payload);

//     if (hasValidFile) {
//       await musicService.uploadFile(musicResp.uploadUrl, fileEntry);
//       await musicService.confirmFileUpload(musicResp.id);
//     }

//     toast.success(
//       musicId ? "Música atualizada com sucesso!" : "Música cadastrada com sucesso!"
//     );

//     return redirect("/groups/1/musics");
//   } catch (err: any) {
//     if (err?.status === 401) {
//       return err;
//     }

//     toast.error("Não foi possível salvar a música.");
//     return null;
//   }
// }

export async function load({ params }: LoaderFunctionArgs): Promise<MusicAddLoaderData> {
  const musicId = params.musicId;

  if (!musicId) {
    return {
      music: Promise.resolve(null),
    };
  }

  return {
    music: musicService.getById(Number(musicId)),
  };
}