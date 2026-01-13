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
  type ActionFunctionArgs,
} from "react-router-dom";
import toast from "react-hot-toast";
import { useLoading } from "@/hooks/useLoading";

const schema = yup.object({
  name: yup.string().required("Nome obrigatório"),
  description: yup.string().required("Descrição obrigatória"),
});

export default function GroupAdd() {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });
  const submit = useSubmit();
  const navigate = useNavigate();

  const { show, hide } = useLoading();

  const navigation = useNavigation();

  navigation.state === "submitting" ? show() : hide();

  return (
    <RegisterForm
      title="Novo Grupo"
      cancelHandler={() => navigate("/home")}
      formSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
    >
      <TextField data-testid="field-name" name="name" label="Nome" control={control} />
      <TextField data-testid="field-description" name="description" label="Descrição" control={control} />
    </RegisterForm>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const payload = {
    name: data.get("name")?.toString(),
    description: data.get("description")?.toString(),
    cover: "teste",
  };
  try {
    await groupService.post(payload);
    toast.success("Grupo cadastrado com sucesso!");
  } catch (err: any) {
    if (err.status === 401) {
      return err;
    }
  }

  return redirect("/home");
}
