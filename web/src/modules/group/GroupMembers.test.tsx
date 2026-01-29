// src/modules/group/GroupMembers.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupMembers, { loader } from "./GroupMembers";
import { groupService } from "./group.service";

// -------------------- controls --------------------
const navigateMock = vi.fn();
let loaderUsersValue: any[] = [];
let currentGroupValue: any = { id: 1, isAdmin: false };

// -------------------- mocks --------------------
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,

    // Component expects: const { users } = useLoaderData()
    useLoaderData: () => ({ users: Promise.resolve(loaderUsersValue) }),

    // Unit-test friendly Await: render immediately with loaderUsersValue
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderUsersValue);
    },
  };
});

vi.mock("./GroupContext", () => ({
  useGroupContext: () => ({ currentGroup: currentGroupValue }),
}));

vi.mock("@/components", () => ({
  FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("./group.service", () => ({
  groupService: {
    findUsersByGroupId: vi.fn(),
  },
}));

// -------------------- tests --------------------
describe("<GroupMembers />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderUsersValue = [];
    currentGroupValue = { id: 1, isAdmin: false };
  });

  it("renders title", () => {
    render(<GroupMembers />);
    expect(screen.getByText("Membros")).toBeInTheDocument();
  });

  it("renders list of users when loader returns users", async () => {
    loaderUsersValue = [{ name: "Ana" }, { name: "Bruno" }];

    render(<GroupMembers />);

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
    expect(screen.queryByText("Nada")).not.toBeInTheDocument();
  });

  it("renders 'Nada' when loader returns empty list", () => {
    loaderUsersValue = [];

    render(<GroupMembers />);

    expect(screen.getByText("Nada")).toBeInTheDocument();
  });

  it("does NOT show '+ Novo Membro' button when currentGroup.isAdmin is false", () => {
    currentGroupValue = { id: 7, isAdmin: false };
    render(<GroupMembers />);

    expect(
      screen.queryByRole("button", { name: "+ Novo Membro" })
    ).not.toBeInTheDocument();
  });

  it("shows '+ Novo Membro' button when currentGroup.isAdmin is true and navigates on click", async () => {
    currentGroupValue = { id: 7, isAdmin: true };
    loaderUsersValue = [{ name: "Ana" }];

    render(<GroupMembers />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+ Novo Membro" }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/7/members/add");
  });
});

describe("loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls groupService.findUsersByGroupId with params.id and returns users promise", () => {
    const fakePromise = Promise.resolve([{ name: "X" }]);
    (groupService.findUsersByGroupId as any).mockReturnValueOnce(fakePromise);

    const result = loader({ params: { id: "123" } } as any);

    expect(groupService.findUsersByGroupId).toHaveBeenCalledTimes(1);
    expect(groupService.findUsersByGroupId).toHaveBeenCalledWith("123");
    expect(result.users).toBe(fakePromise);
  });
});
