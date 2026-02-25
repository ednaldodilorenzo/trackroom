// src/modules/group/GroupInfo.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupInfo, { loader } from "./GroupInfo";
import groupService from "./group.service";

// -------------------- controls --------------------
const navigateMock = vi.fn();
const showMock = vi.fn();
const hideMock = vi.fn();

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

// We’ll control these per-test
let currentGroupValue: any = { id: "7", name: "Grupo X", description: "Desc", isAdmin: false };
let loaderUsersValue: any[] = [];

// microtask helper
const flush = async () => {
  // flush queued promise callbacks (then/catch/finally)
  await Promise.resolve();
  await Promise.resolve();
};

// -------------------- mocks --------------------
vi.mock("./GroupContext", () => ({
  useGroupContext: () => ({ currentGroup: currentGroupValue }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLoaderData: () => ({ users: Promise.resolve(loaderUsersValue) }),

    // unit-test friendly Await: render immediately with loaderUsersValue
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderUsersValue);
    },

    // simple Link mock to avoid router context requirements
    Link: ({ to, children, ...rest }: any) => (
      <a href={to} data-testid="link" {...rest}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/hooks/useLoading", () => ({
  useLoading: () => ({ show: showMock, hide: hideMock }),
}));

const headerConfigSpy = vi.fn();
vi.mock("@/hooks/useHeaderConfig", () => ({
  useHeaderConfig: (cfg: any) => headerConfigSpy(cfg),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}));

// Mock UI components
vi.mock("@/components", () => ({
  FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

// Capture ListItem props so we can trigger actionItems callbacks deterministically
const listItemSpy: any[] = [];
vi.mock("@/components/listitem/ListItem", () => ({
  default: (props: any) => {
    listItemSpy.push(props);
    return (
      <div data-testid="list-item">
        <div data-testid="li-title">{props.title}</div>
        <div data-testid="li-detail">{props.detail}</div>

        {/* expose actions as buttons so we can click them */}
        {props.actionItems?.items?.map((it: any, idx: number) => (
          <button
            type="button"
            key={idx}
            onClick={it.onClick}
            aria-label={`action-${props.title}-${idx}`}
          >
            {it.label}
          </button>
        ))}
      </div>
    );
  },
}));

vi.mock("./group.service", () => ({
  default: {
    findUsersByGroupId: vi.fn(),
    promoteToAdmin: vi.fn(),
    demoteFromAdmin: vi.fn(),
    removeMemberFromGroup: vi.fn(),
  },
}));

// -------------------- tests --------------------
describe("<GroupInfo />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listItemSpy.length = 0;

    currentGroupValue = { id: "7", name: "Grupo X", description: "Desc", isAdmin: false };
    loaderUsersValue = [];

    (groupService.promoteToAdmin as any).mockResolvedValue(undefined);
    (groupService.demoteFromAdmin as any).mockResolvedValue(undefined);
    (groupService.removeMemberFromGroup as any).mockResolvedValue(undefined);
  });

  it("calls useHeaderConfig with group name and hidden=true", () => {
    render(<GroupInfo />);

    expect(headerConfigSpy).toHaveBeenCalledTimes(1);
    expect(headerConfigSpy).toHaveBeenCalledWith({
      title: "Grupo X",
      hidden: true,
    });
  });

  it("renders group name/description and back Link points to /groups/:id/musics", () => {
    render(<GroupInfo />);

    expect(screen.getByText("Grupo X")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();

    const link = screen.getByTestId("link") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/groups/7/musics");
  });

  it("does NOT show '+ Adicionar novo membro' section when currentGroup.isAdmin=false", () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: false };
    render(<GroupInfo />);

    expect(screen.queryByText("Adicionar novo membro")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+" })).not.toBeInTheDocument();
  });

  it("shows '+ Adicionar novo membro' section when currentGroup.isAdmin=true and navigates on click", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };

    render(<GroupInfo />);

    expect(screen.getByText("Adicionar novo membro")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+" }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/7/members/add");
  });

  it("renders 'Nenhum membro encontrado...' when users list is empty", () => {
    loaderUsersValue = [];
    render(<GroupInfo />);

    expect(screen.getByText("Nenhum membro encontrado...")).toBeInTheDocument();
    expect(screen.queryAllByTestId("list-item")).toHaveLength(0);
  });

  it("renders members list with correct detail labels", () => {
    loaderUsersValue = [
      { id: 1, name: "Ana", userName: "ana", isAdmin: true },
      { id: 2, name: "Bruno", userName: "bru", isAdmin: false },
    ];

    render(<GroupInfo />);

    const items = screen.getAllByTestId("list-item");
    expect(items).toHaveLength(2);

    // Ana admin
    expect(screen.getAllByTestId("li-title")[0]).toHaveTextContent("Ana");
    expect(screen.getAllByTestId("li-detail")[0]).toHaveTextContent("Administrador");

    // Bruno member
    expect(screen.getAllByTestId("li-title")[1]).toHaveTextContent("Bruno");
    expect(screen.getAllByTestId("li-detail")[1]).toHaveTextContent("Membro");
  });

  it("when group is admin: shows actions for admin user -> 'Tornar membro' and 'Remover do grupo'", () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [{ id: 1, name: "Ana", userName: "ana", isAdmin: true }];

    render(<GroupInfo />);

    expect(screen.getByText("Tornar membro")).toBeInTheDocument();
    expect(screen.getByText("Remover do grupo")).toBeInTheDocument();
  });

  it("when group is admin: shows actions for non-admin user -> 'Promover a administrador' and 'Remover do grupo'", () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [{ id: 2, name: "Bruno", userName: "bru", isAdmin: false }];

    render(<GroupInfo />);

    expect(screen.getByText("Promover a administrador")).toBeInTheDocument();
    expect(screen.getByText("Remover do grupo")).toBeInTheDocument();
  });

  it("promote flow: calls show(), promoteToAdmin(), updates UI to 'Administrador', shows toast, hides loader", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [{ id: 2, name: "Bruno", userName: "bru", isAdmin: false }];

    (groupService.promoteToAdmin as any).mockResolvedValueOnce(undefined);

    render(<GroupInfo />);

    // click "Promover a administrador"
    const user = userEvent.setup();
    await user.click(screen.getByText("Promover a administrador"));

    expect(showMock).toHaveBeenCalledTimes(1);
    expect(groupService.promoteToAdmin).toHaveBeenCalledWith(7, 2);

    await flush();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Usuário promovido a administrador com sucesso!"
    );
    expect(hideMock).toHaveBeenCalledTimes(1);

    // UI should update role label
    expect(screen.getByTestId("li-detail")).toHaveTextContent("Administrador");
  });

  it("demote flow: calls show(), demoteFromAdmin(), updates UI to 'Membro', shows toast, hides loader", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [{ id: 1, name: "Ana", userName: "ana", isAdmin: true }];

    (groupService.demoteFromAdmin as any).mockResolvedValueOnce(undefined);

    render(<GroupInfo />);

    const user = userEvent.setup();
    await user.click(screen.getByText("Tornar membro"));

    expect(showMock).toHaveBeenCalledTimes(1);
    expect(groupService.demoteFromAdmin).toHaveBeenCalledWith(7, 1);

    await flush();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Usuário removido dos administradores com sucesso!"
    );
    expect(hideMock).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId("li-detail")).toHaveTextContent("Membro");
  });

  it("remove member flow: calls show(), removeMemberFromGroup(), removes user from list, shows toast, hides loader", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [
      { id: 1, name: "Ana", userName: "ana", isAdmin: true },
      { id: 2, name: "Bruno", userName: "bru", isAdmin: false },
    ];

    (groupService.removeMemberFromGroup as any).mockResolvedValueOnce(undefined);

    render(<GroupInfo />);

    // remove Ana (first item's "Remover do grupo")
    const user = userEvent.setup();
    await user.click(screen.getAllByText("Remover do grupo")[0]);

    expect(showMock).toHaveBeenCalledTimes(1);
    expect(groupService.removeMemberFromGroup).toHaveBeenCalledWith(7, 1);

    await flush();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Usuário removido do grupo com sucesso!"
    );
    expect(hideMock).toHaveBeenCalledTimes(1);

    // Ana should be gone; Bruno remains
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });

  it("service error path: shows toast.error with error.response.data.detail and hides loader", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [{ id: 2, name: "Bruno", userName: "bru", isAdmin: false }];

    (groupService.promoteToAdmin as any).mockRejectedValueOnce({
      response: { data: { detail: "Falhou!" } },
    });

    render(<GroupInfo />);

    const user = userEvent.setup();
    await user.click(screen.getByText("Promover a administrador"));

    expect(showMock).toHaveBeenCalledTimes(1);

    await flush();

    expect(toastErrorMock).toHaveBeenCalledWith("Falhou!");
    expect(hideMock).toHaveBeenCalledTimes(1);
  });
});

// -------------------- loader test --------------------
describe("GroupInfo.loader", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls groupService.findUsersByGroupId with params.id and returns users promise", () => {
    const fakePromise = Promise.resolve([{ id: 1, name: "X" }]);
    (groupService.findUsersByGroupId as any).mockReturnValueOnce(fakePromise);

    const result = loader({ params: { id: "123" } } as any);

    expect(groupService.findUsersByGroupId).toHaveBeenCalledTimes(1);
    expect(groupService.findUsersByGroupId).toHaveBeenCalledWith("123");
    expect(result.users).toBe(fakePromise);
  });
});