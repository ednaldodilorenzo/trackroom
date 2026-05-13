// src/modules/group/GroupInfo.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupInfo, { loader } from "./GroupInfo";
import groupService from "./group.service";

const navigateMock = vi.fn();
const showMock = vi.fn();
const hideMock = vi.fn();

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

let currentGroupValue: any = {
  id: "7",
  name: "Grupo X",
  description: "Desc",
  isAdmin: false,
};

let loaderUsersValue: any[] = [];

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

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
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderUsersValue);
    },
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

vi.mock("@/components", () => ({
  FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/listitem/ListItem", () => ({
  default: ({ title, description, detail, children }: any) => (
    <div data-testid="list-item">
      <div data-testid="li-title">{title}</div>
      <div data-testid="li-description">{description}</div>
      <div data-testid="li-detail">{detail}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/components/suspendedmenu/SuspendedMenu", () => {
  const SuspendedMenu = ({ children }: any) => (
    <div data-testid="suspended-menu">{children}</div>
  );

  SuspendedMenu.Item = ({ label, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );

  return { default: SuspendedMenu };
});

vi.mock("./group.service", () => ({
  default: {
    findUsersByGroupId: vi.fn(),
    promoteToAdmin: vi.fn(),
    demoteFromAdmin: vi.fn(),
    removeMemberFromGroup: vi.fn(),
  },
}));

describe("<GroupInfo />", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    currentGroupValue = {
      id: "7",
      name: "Grupo X",
      description: "Desc",
      isAdmin: false,
    };

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

  it("renders group name/description and back link points to /groups/:id/musics", () => {
    render(<GroupInfo />);

    expect(screen.getByText("Grupo X")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();

    expect(screen.getByTestId("link")).toHaveAttribute(
      "href",
      "/groups/7/musics"
    );
  });

  it("does not show add member section when currentGroup.isAdmin=false", () => {
    render(<GroupInfo />);

    expect(screen.queryByText("Adicionar novo membro")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+" })).not.toBeInTheDocument();
  });

  it("shows add member section when currentGroup.isAdmin=true and navigates on click", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };

    render(<GroupInfo />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+" }));

    expect(screen.getByText("Adicionar novo membro")).toBeInTheDocument();
    expect(navigateMock).toHaveBeenCalledWith("/groups/7/members/add");
  });

  it("renders empty message when users list is empty", () => {
    render(<GroupInfo />);

    expect(screen.getByText("Nenhum membro encontrado.")).toBeInTheDocument();
    expect(screen.queryAllByTestId("list-item")).toHaveLength(0);
  });

  it("renders members list with correct detail labels", () => {
    loaderUsersValue = [
      { id: 1, name: "Ana", userName: "ana", isAdmin: true },
      { id: 2, name: "Bruno", userName: "bru", isAdmin: false },
    ];

    render(<GroupInfo />);

    expect(screen.getAllByTestId("list-item")).toHaveLength(2);

    expect(screen.getAllByTestId("li-title")[0]).toHaveTextContent("Ana");
    expect(screen.getAllByTestId("li-detail")[0]).toHaveTextContent(
      "Administrador"
    );

    expect(screen.getAllByTestId("li-title")[1]).toHaveTextContent("Bruno");
    expect(screen.getAllByTestId("li-detail")[1]).toHaveTextContent("Membro");
  });

  it("does not render SuspendedMenu when currentGroup.isAdmin=false", () => {
    loaderUsersValue = [{ id: 1, name: "Ana", userName: "ana", isAdmin: true }];

    render(<GroupInfo />);

    expect(screen.queryByTestId("suspended-menu")).not.toBeInTheDocument();
    expect(screen.queryByText("Tornar membro")).not.toBeInTheDocument();
    expect(screen.queryByText("Remover do grupo")).not.toBeInTheDocument();
  });

  it("renders admin-user actions when currentGroup.isAdmin=true", () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [{ id: 1, name: "Ana", userName: "ana", isAdmin: true }];

    render(<GroupInfo />);

    expect(screen.getByTestId("suspended-menu")).toBeInTheDocument();
    expect(screen.getByText("Tornar membro")).toBeInTheDocument();
    expect(screen.getByText("Remover do grupo")).toBeInTheDocument();
  });

  it("renders member-user actions when currentGroup.isAdmin=true", () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [
      { id: 2, name: "Bruno", userName: "bru", isAdmin: false },
    ];

    render(<GroupInfo />);

    expect(screen.getByTestId("suspended-menu")).toBeInTheDocument();
    expect(screen.getByText("Promover a administrador")).toBeInTheDocument();
    expect(screen.getByText("Remover do grupo")).toBeInTheDocument();
  });

  it("promote flow updates UI, shows success toast and hides loader", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [
      { id: 2, name: "Bruno", userName: "bru", isAdmin: false },
    ];

    render(<GroupInfo />);

    const user = userEvent.setup();
    await user.click(screen.getByText("Promover a administrador"));

    expect(showMock).toHaveBeenCalledTimes(1);
    expect(groupService.promoteToAdmin).toHaveBeenCalledWith(7, 2);

    await flush();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Usuário promovido a administrador com sucesso!"
    );
    expect(hideMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("li-detail")).toHaveTextContent("Administrador");
  });

  it("demote flow updates UI, shows success toast and hides loader", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [{ id: 1, name: "Ana", userName: "ana", isAdmin: true }];

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

  it("remove member flow removes user, shows success toast and hides loader", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [
      { id: 1, name: "Ana", userName: "ana", isAdmin: true },
      { id: 2, name: "Bruno", userName: "bru", isAdmin: false },
    ];

    render(<GroupInfo />);

    const user = userEvent.setup();
    await user.click(screen.getAllByText("Remover do grupo")[0]);

    expect(showMock).toHaveBeenCalledTimes(1);
    expect(groupService.removeMemberFromGroup).toHaveBeenCalledWith(7, 1);

    await flush();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Usuário removido do grupo com sucesso!"
    );
    expect(hideMock).toHaveBeenCalledTimes(1);

    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });

  it("service error path shows toast.error and hides loader", async () => {
    currentGroupValue = { ...currentGroupValue, isAdmin: true };
    loaderUsersValue = [
      { id: 2, name: "Bruno", userName: "bru", isAdmin: false },
    ];

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