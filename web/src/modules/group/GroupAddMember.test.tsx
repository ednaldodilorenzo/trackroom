// src/modules/group/GroupAddMember.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupAddMember from "./GroupAddMember";


// -------------------- controls/mocks --------------------
let currentGroupValue: any = { id: "7" };
const findAllNotInGroupByTermMock = vi.fn();
const addGroupMembersMock = vi.fn();
const navigateMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

// capture props passed to AsyncMultiCheckSelect
let lastAsyncProps: any = null;

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
  };
});

vi.mock("@/modules/user/user.service", () => ({
  userService: {
    findAllNotInGroupByTerm: (...args: any[]) =>
      findAllNotInGroupByTermMock(...args),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}));

vi.mock("./group.service", () => ({
  default: {
    addGroupMembers: (...args: any[]) => addGroupMembersMock(...args),
  },
}));

vi.mock("@/components", () => ({
  AsyncMultiCheckSelect: (props: any) => {
    lastAsyncProps = props;

    // minimal UI to allow selection updates
    return (
      <div data-testid="async-multi-check-select">
        <div data-testid="label">{props.label}</div>
        <button
          type="button"
          onClick={() =>
            props.onChange([
              ...(props.value ?? []),
              { id: 1, label: "Ana" },
              { id: "2", label: "Bruno" },
            ])
          }
        >
          Simular seleção
        </button>
      </div>
    );
  },
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

// helper to flush promise callbacks
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

// -------------------- tests --------------------
describe("<GroupAddMember />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentGroupValue = { id: "7" };
    lastAsyncProps = null;

    addGroupMembersMock.mockResolvedValue(undefined);
  });

  it("renders title, AsyncMultiCheckSelect and Confirm button", () => {
    render(<GroupAddMember />);

    expect(screen.getByText("Adicionar Membros")).toBeInTheDocument();
    expect(screen.getByTestId("async-multi-check-select")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
  });

  it("passes correct props to AsyncMultiCheckSelect", () => {
    render(<GroupAddMember />);

    expect(lastAsyncProps).toBeTruthy();
    expect(lastAsyncProps.label).toBe("Membros");
    expect(Array.isArray(lastAsyncProps.value)).toBe(true);
    expect(typeof lastAsyncProps.onChange).toBe("function");
    expect(typeof lastAsyncProps.fetchOptions).toBe("function");
  });

  it("fetchOptions calls userService.findAllNotInGroupByTerm with currentGroup.id and query, mapping to {id,label}", async () => {
    findAllNotInGroupByTermMock.mockResolvedValueOnce([
      { id: 10, name: "Carla" },
      { id: 11, name: "Diego" },
    ]);

    render(<GroupAddMember />);

    const result = await lastAsyncProps.fetchOptions("ca");

    expect(findAllNotInGroupByTermMock).toHaveBeenCalledTimes(1);
    expect(findAllNotInGroupByTermMock).toHaveBeenCalledWith("7", "ca");
    expect(result).toEqual([
      { id: 10, label: "Carla" },
      { id: 11, label: "Diego" },
    ]);
  });

  it("renders selected members list after selection", async () => {
    render(<GroupAddMember />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Simular seleção" }));

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });

  it("on Confirm: calls groupService.addGroupMembers with mapped payload, shows success toast, clears selection, and navigates", async () => {
    render(<GroupAddMember />);

    const user = userEvent.setup();

    // select members
    await user.click(screen.getByRole("button", { name: "Simular seleção" }));
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();

    // confirm
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(addGroupMembersMock).toHaveBeenCalledTimes(1);
    expect(addGroupMembersMock).toHaveBeenCalledWith(7, [
      { id: 1, name: "Ana" },
      { id: 2, name: "Bruno" },
    ]);

    await flush();

    expect(toastSuccessMock).toHaveBeenCalledWith("Membros adicionados com sucesso!");
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/groups/7/info");

    // selection cleared -> list items should disappear
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.queryByText("Bruno")).not.toBeInTheDocument();
  });

  it("on Confirm error: shows error toast and does not navigate", async () => {
    addGroupMembersMock.mockRejectedValueOnce(new Error("fail"));

    render(<GroupAddMember />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Simular seleção" }));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await flush();

    expect(toastErrorMock).toHaveBeenCalledWith("Erro ao adicionar membros.");
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("uses currentGroup.id from context (different id)", async () => {
    currentGroupValue = { id: "99" };
    findAllNotInGroupByTermMock.mockResolvedValueOnce([{ id: 1, name: "X" }]);

    render(<GroupAddMember />);

    await lastAsyncProps.fetchOptions("x");

    expect(findAllNotInGroupByTermMock).toHaveBeenCalledWith("99", "x");
  });
});