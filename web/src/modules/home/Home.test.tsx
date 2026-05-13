// src/modules/home/Home.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

// --------- shared mocks ----------
const navigateMock = vi.fn();
const useHeaderConfigMock = vi.fn();

let loaderGroupsValue: any[] = [];

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLoaderData: () => ({ groups: Promise.resolve(loaderGroupsValue) }),
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderGroupsValue);
    },
  };
});

vi.mock("@/hooks/useHeaderConfig", () => ({
  useHeaderConfig: (cfg: any) => useHeaderConfigMock(cfg),
}));

vi.mock("@/components", () => ({
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
}));

describe("<Home />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderGroupsValue = [];
  });

  it("calls useHeaderConfig with the expected config", () => {
    render(<Home />);

    expect(useHeaderConfigMock).toHaveBeenCalledTimes(1);
    expect(useHeaderConfigMock).toHaveBeenCalledWith({
      title: "Minha Biblioteca",
      enableBackButton: false,
    });
  });

  it("renders empty state when there are no groups", () => {
    loaderGroupsValue = [];

    render(<Home />);

    expect(screen.getByText("Meus grupos")).toBeInTheDocument();
    expect(screen.getByText("Nenhum grupo cadastrado")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Crie seu primeiro grupo para organizar músicas, playlists e cifras."
      )
    ).toBeInTheDocument();

    expect(screen.queryAllByTestId("track-card")).toHaveLength(0);
  });

  it("navigates to /groups/add when clicking 'Criar grupo' in empty state", async () => {
    loaderGroupsValue = [];

    render(<Home />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Criar grupo/i }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/add");
  });

  it("renders groups when loader returns a non-empty list", () => {
    loaderGroupsValue = [
      { id: 1, name: "Grupo 1", description: "Desc 1" },
      { id: 2, name: "Banda Azul", description: "Desc 2" },
    ];

    render(<Home />);

    expect(screen.getByText("Meus grupos")).toBeInTheDocument();
    expect(screen.getByText("Grupo 1")).toBeInTheDocument();
    expect(screen.getByText("Banda Azul")).toBeInTheDocument();

    const cards = screen.getAllByTestId("track-card");
    expect(cards).toHaveLength(2);

    expect(screen.getByText("Novo grupo")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum grupo cadastrado")).not.toBeInTheDocument();
  });

  it("navigates to group home when clicking a group card", async () => {
    loaderGroupsValue = [
      { id: 1, name: "Grupo 1", description: "Desc 1" },
      { id: 2, name: "Banda Azul", description: "Desc 2" },
    ];

    render(<Home />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Grupo 1/i }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/1/home");
  });

  it("navigates to /groups/add when clicking 'Novo grupo' card", async () => {
    loaderGroupsValue = [
      { id: 1, name: "Grupo 1", description: "Desc 1" },
    ];

    render(<Home />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Novo grupo/i }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/add");
  });

  it("filters groups by search input", async () => {
    loaderGroupsValue = [
      { id: 1, name: "Grupo 1", description: "Desc 1" },
      { id: 2, name: "Banda Azul", description: "Desc 2" },
      { id: 3, name: "Coral Jovem", description: "Desc 3" },
    ];

    render(<Home />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Buscar grupo"), "banda");

    expect(screen.getByText("Banda Azul")).toBeInTheDocument();
    expect(screen.queryByText("Grupo 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Coral Jovem")).not.toBeInTheDocument();

    expect(screen.getAllByTestId("track-card")).toHaveLength(1);
  });

  it("renders empty search state when no group matches search", async () => {
    loaderGroupsValue = [
      { id: 1, name: "Grupo 1", description: "Desc 1" },
      { id: 2, name: "Banda Azul", description: "Desc 2" },
    ];

    render(<Home />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Buscar grupo"), "xyz");

    expect(screen.getByText("Nenhum grupo encontrado")).toBeInTheDocument();
    expect(screen.getByText(/Não encontramos grupos com o nome/i)).toBeInTheDocument();
    expect(screen.getByText("Novo grupo")).toBeInTheDocument();

    expect(screen.queryAllByTestId("track-card")).toHaveLength(0);
  });

  it("shows group initial using first letter of group name", () => {
    loaderGroupsValue = [
      { id: 1, name: "banda azul", description: "Desc" },
    ];

    render(<Home />);

    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows music symbol when group name is empty", () => {
    loaderGroupsValue = [
      { id: 1, name: "", description: "Desc" },
    ];

    render(<Home />);

    expect(screen.getByText("♫")).toBeInTheDocument();
  });
});