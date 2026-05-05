import { FallbackOverlay, RegisterForm, TextField } from "@/components";
import { musicService } from "./music.service";
import groupService from "../group/group.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import type { Music } from "@/model";
import {
  useParams,
  useSubmit,
  useNavigate,
  useLoaderData,
  Await,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router-dom";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Suspense } from "react";

const schema = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  description: yup.string().required("Álbum é requerido"),
}).required();

type FormData = yup.InferType<typeof schema>;

function MusicForm({ loadedMusic }: { loadedMusic: Music | null }) {
  const submit = useSubmit();
  const { id } = useParams();
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    values: loadedMusic
      ? { name: loadedMusic.name, description: loadedMusic.description }
      : undefined,
  });

  return (
    <RegisterForm
      encType="multipart/form-data"
      title={loadedMusic ? "Editar Música" : "Nova Música"}
      formSubmit={handleSubmit((_, e) => {        
        const formData = new FormData(e?.target as HTMLFormElement);
        submit(formData, { method: "post", encType: "multipart/form-data" });
        navigate(-1);
      })}
      cancelHandler={() => navigate(`/groups/${id}/musics`)}
    >
      <TextField label="Nome" name="name" control={control} />
      <TextField label="Álbum" name="description" control={control} />
      <label htmlFor="file-music">Arquivo</label>
      <input id="file-music" name="file" accept="audio/*" type="file" />
    </RegisterForm>
  );
}

export default function MusicAdd() {
  const { music } = useLoaderData<{ music: Promise<Music> }>();

  return (
    <Suspense fallback={<FallbackOverlay />}>
      <Await resolve={music}>
        {(loadedMusic) => <MusicForm loadedMusic={loadedMusic} />}
      </Await>
    </Suspense>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const data = await request.formData();
  const id = params.id;
  const musicId = params.musicId;

  const payload: Music = {
    name: data.get("name")?.toString()!!,
    description: data.get("description")?.toString()!!,
    file: data.get("name")?.toString()!!,
    groupId: parseInt(id!!),
  };

  // Aqui o retorno pode ser File | string | null
  const fileEntry = data.get("file") as File | null;

  if (!(fileEntry instanceof File)) {
    throw new Error("Arquivo inválido ou ausente");
  }
  
  try {
    const musicResp = musicId ? await musicService.update(parseInt(musicId), payload) : await groupService.addMusic(parseInt(id!!), payload);

    if (fileEntry.size > 0) {
      await musicService.uploadFile(musicResp.uploadUrl, fileEntry);
      await musicService.confirmFileUpload(musicResp.id);
    }
    toast.success(musicId ? "Música atualizada com sucesso!" : "Música cadastrada com sucesso!");
  } catch (err: any) {
    if (err.status === 401) {
      return err;
    }
  }

  return "success";
}

export async function load({ params }: LoaderFunctionArgs) {
  const musicId = params.musicId;
  if (!musicId) {
    return { music: new Promise<Music>((resolve) => resolve(null as unknown as Music)) };
  }

  return { music: musicService.getById(parseInt(musicId)) };

}
