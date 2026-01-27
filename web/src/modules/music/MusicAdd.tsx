import { RegisterForm, TextField } from "@/components";
import { musicService } from "./music.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import type { Music } from "@/model";
import {
  useParams,
  redirect,
  useSubmit,
  useNavigate,
  useNavigation,
  type ActionFunctionArgs,
} from "react-router-dom";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useLoading } from "@/hooks/useLoading";

const schema = yup
  .object({
    name: yup.string().required("Nome é obrigatório"),
    description: yup.string().required("Álbum é requerido"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export default function MusicAdd() {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const submit = useSubmit();
  const { id } = useParams();
  const navigate = useNavigate();

  const { show, hide } = useLoading();

  const navigation = useNavigation();

  navigation.state === "submitting" ? show() : hide();

  return (
    <>
      <RegisterForm
        encType="multipart/form-data"
        title="Nova Música"
        formSubmit={handleSubmit((_, e) => {
          const form = e?.target as HTMLFormElement;
          const formData = new FormData(form);
          submit(formData, { method: "post", encType: "multipart/form-data" });
        })}
        cancelHandler={() => navigate(`/groups/${id}/musics`)}
      >
        <TextField label="Nome" name="name" control={control} />
        <TextField label="Álbum" name="description" control={control} />
        <label>Arquivo</label>
        <input name="file" accept="audio/*" type="file" />
      </RegisterForm>
    </>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const data = await request.formData();
  const id = params.id;
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
    const musicResp = await musicService.save(payload);
    await musicService.uploadFile(musicResp.uploadUrl, fileEntry);
    await musicService.confirmFileUpload(musicResp.id);
    toast.success("Música cadastrada com sucesso!");
  } catch (err: any) {
    if (err.status === 401) {
      return err;
    }
  }

  return redirect(`/groups/${id}/musics`);
}
