import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import GroupAddMember from "./GroupAddMember";
import groupService from "./group.service";
import { userService } from "@/modules/user/user.service";
import toast from "react-hot-toast";

const navigateMock = vi.fn();

const currentGroupMock = {
  id: "10",
  name: "Banda XLI ECC Neves",
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("./GroupContext", () => ({
  useGroupContext: () => ({
    currentGroup: currentGroupMock,
  }),
}));

vi.mock("./group.service", () => ({
  default: {
    addGroupMembers: vi.fn(),
  },
}));

vi.mock("@/modules/user/user.service", () => ({
  userService: {
    findAllNotInGroupByTerm: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  AsyncMultiCheckSelect: ({
    label,
    value,
    onChange,
    fetchOptions,
  }: {
    label: string;
    value: Array<{ id: number | string; label: string }>;
    onChange: (items: Array<{ id: number | string; label: string }>) => void;
    fetchOptions: (query: string) => Promise<Array<{ id: number | string; label: string }>>;
  }) => (
    <div>
      <label>{label}</label>
      <button
        type="button"
        onClick={async () => {
          const options = await fetchOptions("ana");
          onChange([...value, options[0]]);
        }}
      >
        Selecionar Ana
      </button>
      <button
        type="button"
        onClick={async () => {
          const options = await fetchOptions("joao");
          onChange([...value, options[1]]);
        }}
      >
        Selecionar João
      </button>
    </div>
  ),
}));

describe("GroupAddMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(userService.findAllNotInGroupByTerm).mockResolvedValue([
      { id: 1, name: "Ana" },
      { id: 2, name: "João" },
    ] as any);

    vi.mocked(groupService.addGroupMembers).mockResolvedValue(undefined as any);
  });

  it("deve renderizar a tela de adicionar membros", () => {
    render(<GroupAddMember />);

    expect(screen.getByText("Selecionar membros")).toBeInTheDocument();
    expect(screen.getByText(/nenhum membro selecionado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /adicionar \(0\)/i })).toBeDisabled();
  });

  it("deve buscar e selecionar membros", async () => {
    const user = userEvent.setup();

    render(<GroupAddMember />);

    await user.click(screen.getByRole("button", { name: /selecionar ana/i }));

    expect(userService.findAllNotInGroupByTerm).toHaveBeenCalledWith("10", "ana");
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText(/1 membro selecionado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /adicionar \(1\)/i })).toBeEnabled();
  });

  it("deve remover membro selecionado", async () => {
    const user = userEvent.setup();

    render(<GroupAddMember />);

    await user.click(screen.getByRole("button", { name: /selecionar ana/i }));
    expect(await screen.findByText("Ana")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remover ana/i }));

    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getByText(/nenhum membro selecionado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /adicionar \(0\)/i })).toBeDisabled();
  });

  it("deve adicionar membros selecionados e navegar para informações do grupo", async () => {
    const user = userEvent.setup();

    render(<GroupAddMember />);

    await user.click(screen.getByRole("button", { name: /selecionar ana/i }));
    await user.click(screen.getByRole("button", { name: /selecionar joão/i }));

    await user.click(screen.getByRole("button", { name: /adicionar \(2\)/i }));

    await waitFor(() => {
      expect(groupService.addGroupMembers).toHaveBeenCalledWith(10, [
        { id: 1, name: "Ana" },
        { id: 2, name: "João" },
      ]);
    });

    expect(toast.success).toHaveBeenCalledWith("Membros adicionados com sucesso!");
    expect(navigateMock).toHaveBeenCalledWith("/groups/10/info");
  });

  it("deve exibir erro quando falhar ao adicionar membros", async () => {
    const user = userEvent.setup();

    vi.mocked(groupService.addGroupMembers).mockRejectedValueOnce(new Error("Erro"));

    render(<GroupAddMember />);

    await user.click(screen.getByRole("button", { name: /selecionar ana/i }));
    await user.click(screen.getByRole("button", { name: /adicionar \(1\)/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao adicionar membros.");
    });

    expect(navigateMock).not.toHaveBeenCalledWith("/groups/10/info");
  });

  it("deve cancelar e voltar para a tela de informações do grupo", async () => {
    const user = userEvent.setup();

    render(<GroupAddMember />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(navigateMock).toHaveBeenCalledWith("/groups/10/info");
  });
});