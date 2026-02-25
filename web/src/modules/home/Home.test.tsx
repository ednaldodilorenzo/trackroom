// src/modules/home/Home.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

// --------- shared mocks ----------
const navigateMock = vi.fn();
const setHeaderConfigMock = vi.fn();
const useHeaderConfigMock = vi.fn();

// swap per-test
let loaderGroupsValue: any[] = [];

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,

    // Home expects: const { groups } = useLoaderData();
    useLoaderData: () => ({ groups: Promise.resolve(loaderGroupsValue) }),

    // Unit-test friendly Await: render immediately with loaderGroupsValue
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderGroupsValue);
    },
  };
});

// Mock header hooks used by Home
vi.mock("@/hooks/useHeader", () => ({
  useHeader: () => ({ setHeaderConfig: setHeaderConfigMock }),
}));

vi.mock("@/hooks/useHeaderConfig", () => ({
  useHeaderConfig: (cfg: any) => useHeaderConfigMock(cfg),
}));

// Mock UI components so tests don’t depend on internal markup
vi.mock("@/components", () => ({
  TrackCard: (props: any) => (
    <div data-testid="track-card">{props.name ?? props.title ?? "card"}</div>
  ),
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
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(useHeaderConfigMock).toHaveBeenCalledTimes(1);
    expect(useHeaderConfigMock).toHaveBeenCalledWith({
      title: "Minha Biblioteca",
      enableBackButton: false,
    });
  });

  it("renders groups when loader returns non-empty list", async () => {
    loaderGroupsValue = [
      { id: 1, name: "Grupo 1", description: "Desc 1" },
      { id: 2, name: "Grupo 2", description: "Desc 2" },
    ];

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("Meus Grupos")).toBeInTheDocument();

    const cards = await screen.findAllByTestId("track-card");
    expect(cards).toHaveLength(2);

    expect(screen.queryByText("Nenhum grupo cadastrado...")).not.toBeInTheDocument();
  });

  it("renders empty-state message when loader returns empty list", () => {
    loaderGroupsValue = [];

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("Meus Grupos")).toBeInTheDocument();
    expect(screen.getByText("Nenhum grupo cadastrado...")).toBeInTheDocument();
    expect(screen.queryAllByTestId("track-card")).toHaveLength(0);
  });

  it("navigates to /groups/add when clicking '+ Novo Grupo'", async () => {
    loaderGroupsValue = [];

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+ Novo Grupo" }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/add");
  });
});