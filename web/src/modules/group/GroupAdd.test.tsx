// src/modules/group/GroupAdd.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupAdd, { action } from "./GroupAdd";
import groupService from "./group.service";

// -------------------- mocks --------------------
const navigateMock = vi.fn();
const showMock = vi.fn();
const hideMock = vi.fn();

let navigationState: "idle" | "submitting" = "idle";
let paramsValue: any = {};
let currentGroupValue: any = {
  id: "123",
  name: "Grupo Atual",
  description: "Descrição Atual",
};

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
let isValidValue = true;

// Mock react-hook-form so handleSubmit calls component onSubmit directly
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    formState: {
      isValid: isValidValue,
    },
    handleSubmit:
      (cb: (data: any) => void) =>
        async (e?: any) => {
          e?.preventDefault?.();
          await cb({
            name: "Meu Grupo",
            description: "Descrição X",
          });
        },
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useNavigation: () => ({ state: navigationState }),
    useParams: () => paramsValue,
  };
});

vi.mock("@/hooks/useLoading", () => ({
  useLoading: () => ({ show: showMock, hide: hideMock }),
}));

vi.mock("./GroupContext", () => ({
  useGroupContext: () => ({ currentGroup: currentGroupValue }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}));

vi.mock("@/components", () => ({
  TextField: ({ label, "data-testid": testId }: any) => (
    <div>
      <label>{label}</label>
      <input data-testid={testId} />
    </div>
  ),
}));

vi.mock("./group.service", () => ({
  default: {
    save: vi.fn(),
    updateGroup: vi.fn(),
  },
}));

// -------------------- component tests --------------------
describe("<GroupAdd />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationState = "idle";
    paramsValue = {};
    isValidValue = true;
    currentGroupValue = {
      id: "123",
      name: "Grupo Atual",
      description: "Descrição Atual",
    };

    (groupService.save as any).mockResolvedValue(undefined);
    (groupService.updateGroup as any).mockResolvedValue(undefined);
  });

  it("renders create mode fields and create button", () => {
    render(<GroupAdd />);

    expect(screen.getByText("Informações do grupo")).toBeInTheDocument();
    expect(
      screen.getByText("Defina um nome e uma descrição para identificar o grupo.")
    ).toBeInTheDocument();

    expect(screen.getByTestId("field-name")).toBeInTheDocument();
    expect(screen.getByTestId("field-description")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar grupo" })).toBeInTheDocument();

    expect(
      screen.getByText(
        "Depois de criar o grupo, você poderá adicionar músicas e organizar playlists."
      )
    ).toBeInTheDocument();
  });

  it("renders edit mode submit button and hides create hint", () => {
    paramsValue = { id: "123" };

    render(<GroupAdd />);

    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();
    expect(screen.queryByText(/Depois de criar o grupo/)).not.toBeInTheDocument();
  });

  it("calls hide() when navigation.state is idle", () => {
    navigationState = "idle";

    render(<GroupAdd />);

    expect(hideMock).toHaveBeenCalled();
    expect(showMock).not.toHaveBeenCalled();
  });

  it("calls show() and disables submit button when navigation.state is submitting", () => {
    navigationState = "submitting";

    render(<GroupAdd />);

    expect(showMock).toHaveBeenCalled();
    expect(hideMock).not.toHaveBeenCalled();

    const button = screen.getByRole("button", { name: "Salvando..." });
    expect(button).toBeDisabled();
  });

  it("disables submit button when form is invalid", () => {
    isValidValue = false;

    render(<GroupAdd />);

    expect(screen.getByRole("button", { name: "Criar grupo" })).toBeDisabled();
  });

  it("navigates to '/' on cancel in create mode", async () => {
    render(<GroupAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("navigates to '/groups/:id/home' on cancel in edit mode", async () => {
    paramsValue = { id: "123" };

    render(<GroupAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/groups/123/home");
  });

  it("create submit: calls groupService.save, shows success toast and navigates to '/'", async () => {
    render(<GroupAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Criar grupo" }));

    expect(groupService.save).toHaveBeenCalledTimes(1);
    expect(groupService.save).toHaveBeenCalledWith({
      id: undefined,
      name: "Meu Grupo",
      description: "Descrição X",
      cover: "teste",
      active: true,
    });

    expect(groupService.updateGroup).not.toHaveBeenCalled();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Grupo cadastrado com sucesso!"
    );
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("edit submit: calls groupService.updateGroup, shows success toast and navigates to '/groups/:id/home'", async () => {
    paramsValue = { id: "123" };

    render(<GroupAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(groupService.updateGroup).toHaveBeenCalledTimes(1);
    expect(groupService.updateGroup).toHaveBeenCalledWith(123, {
      id: "123",
      name: "Meu Grupo",
      description: "Descrição X",
      cover: "teste",
      active: true,
    });

    expect(groupService.save).not.toHaveBeenCalled();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Grupo atualizado com sucesso!"
    );
    expect(navigateMock).toHaveBeenCalledWith("/groups/123/home");
  });

  it("submit 401 error: returns error and does not show error toast", async () => {
    (groupService.save as any).mockRejectedValueOnce({ status: 401 });

    render(<GroupAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Criar grupo" }));

    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("submit non-401 error: shows generic error toast", async () => {
    (groupService.save as any).mockRejectedValueOnce({ status: 500 });

    render(<GroupAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Criar grupo" }));

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Não foi possível salvar o grupo."
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });
});

// -------------------- action tests --------------------
describe("GroupAdd.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paramsValue = {};

    (groupService.save as any).mockResolvedValue(undefined);
    (groupService.updateGroup as any).mockResolvedValue(undefined);
  });

  it("create action: calls save, shows success toast, redirects to '/'", async () => {
    const form = new FormData();
    form.set("name", "G1");
    form.set("description", "D1");

    const request = { formData: async () => form } as any;

    const result = await action({ request } as any);

    expect(groupService.save).toHaveBeenCalledWith({
      id: undefined,
      name: "G1",
      description: "D1",
      cover: "teste",
      active: true,
    });

    expect(groupService.updateGroup).not.toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Grupo cadastrado com sucesso!"
    );

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/");
  });

  it("update action: calls updateGroup, shows success toast, redirects to '/groups/:id'", async () => {
    const form = new FormData();
    form.set("id", "123");
    form.set("name", "G1");
    form.set("description", "D1");

    const request = { formData: async () => form } as any;

    const result = await action({ request } as any);

    expect(groupService.updateGroup).toHaveBeenCalledWith(123, {
      id: "123",
      name: "G1",
      description: "D1",
      cover: "teste",
      active: true,
    });

    expect(groupService.save).not.toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Grupo atualizado com sucesso!"
    );

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/groups/123");
  });

  it("create action: returns error when save throws { status: 401 }", async () => {
    (groupService.save as any).mockRejectedValueOnce({ status: 401 });

    const form = new FormData();
    form.set("name", "G1");
    form.set("description", "D1");

    const request = { formData: async () => form } as any;

    const result = await action({ request } as any);

    expect(result).toEqual({ status: 401 });
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("update action: returns error when update throws { status: 401 }", async () => {
    (groupService.updateGroup as any).mockRejectedValueOnce({ status: 401 });

    const form = new FormData();
    form.set("id", "123");
    form.set("name", "G1");
    form.set("description", "D1");

    const request = { formData: async () => form } as any;

    const result = await action({ request } as any);

    expect(result).toEqual({ status: 401 });
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("action non-401 error: shows error toast and returns null", async () => {
    (groupService.save as any).mockRejectedValueOnce({ status: 500 });

    const form = new FormData();
    form.set("name", "G1");
    form.set("description", "D1");

    const request = { formData: async () => form } as any;

    const result = await action({ request } as any);

    expect(result).toBeNull();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Não foi possível salvar o grupo."
    );
  });
});