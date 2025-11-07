import { RegisterForm, TextField } from "@/components";
import { musicService } from "./music.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  useParams,
  redirect,
  useSubmit,
  useNavigate,
  type ActionFunctionArgs,
} from "react-router-dom";
import * as yup from "yup";

const schema = yup
  .object({
    name: yup.string().required("Nome é obrigatório"),
    album: yup.string().required("Álbum é requerido"),
    author: yup.string().required("Autor é obrigatório"),
    cipher: yup.string().required(),
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

  return (
    <RegisterForm
      title="Nova Música"
      formSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
      cancelHandler={() => navigate(`/home/groups/${id}/musics`)}
    >
      <TextField label="Nome" name="name" control={control} />
      <TextField label="Álbum" name="album" control={control} />
      <TextField label="Autor" name="author" control={control} />
      <TextField label="Cifra" name="cipher" control={control} />
    </RegisterForm>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const data = await request.formData();
  const id = params.id;
  const payload = {
    name: data.get("name")?.toString(),
    description: data.get("album")?.toString(),
    file: data.get("cipher")?.toString(),
    groupId: id,
  };

  try {
    await musicService.post(payload);
  } catch (err: any) {
    if (err.status === 401) {
      return err;
    }
  }

  return redirect(`/home/groups/${id}/musics`);
}
