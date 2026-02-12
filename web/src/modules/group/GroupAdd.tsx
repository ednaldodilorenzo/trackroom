import { RegisterForm, TextField } from "@/components";
import { groupService } from "./group.service";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  useNavigate,
  useNavigation,
  redirect,
  useSubmit,
  useParams,
  type ActionFunctionArgs,
} from "react-router-dom";
import toast from "react-hot-toast";
import { useLoading } from "@/hooks/useLoading";
import { useGroupContext } from "./GroupContext";
import type { Group } from "@/model/Group";

const schema = yup.object({
  id: yup.string().nullable(),
  name: yup.string().required("Nome obrigatório"),
  description: yup.string().required("Descrição obrigatória"),
});

export default function GroupAdd() {
  const { id } = useParams();
  let groupContext = undefined;
  if (id) {
    groupContext = useGroupContext();
  }

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    values: id ? {
      id: groupContext?.currentGroup?.id,
      name: groupContext?.currentGroup?.name || "",
      description: groupContext?.currentGroup?.description || "",
    } : undefined,
  });

  const submit = useSubmit();
  const navigate = useNavigate();

  const { show, hide } = useLoading();
  const navigation = useNavigation();

  navigation.state === "submitting" ? show() : hide();

  return (
    <RegisterForm
      title={id ? "Editar Grupo" : "Novo Grupo"}
      cancelHandler={() => id ? navigate(`/groups/${id}/musics`) : navigate("/")}
      formSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
    >
      <input type="hidden" name="id" />
      <TextField data-testid="field-name" name="name" label="Nome" control={control} />
      <TextField data-testid="field-description" name="description" label="Descrição" control={control} />
    </RegisterForm>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const payload: Group = {
    id: data.get("id")?.toString(),
    name: data.get("name")?.toString()!!,
    description: data.get("description")?.toString()!!,
    cover: "teste",
    active: true,
  };
  try {
    payload.id ? await groupService.updateGroup(parseInt(payload.id), payload) : await groupService.save(payload);
    toast.success(payload.id ? "Grupo atualizado com sucesso!" : "Grupo cadastrado com sucesso!");
  } catch (err: any) {
    if (err.status === 401) {
      return err;
    }
  }

  return payload.id ? redirect(`/groups/${payload.id}/musics`) : redirect("/");
}

export async function loader({ params }: ActionFunctionArgs) {
  const id = params.id;
  if (id) {
    try {
      const group = await groupService.findById(id);
      return { group };
    } catch (err: any) {
      if (err.status === 401) {
        return err;
      }
    }
  }
}
