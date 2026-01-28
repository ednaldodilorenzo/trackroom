// src/modules/group/GroupAdd.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupAdd, { action } from "./GroupAdd";
import { groupService } from "./group.service";

// -------------------- mocks --------------------
const navigateMock = vi.fn();
const submitMock = vi.fn();
const showMock = vi.fn();
const hideMock = vi.fn();

let navigationState: "idle" | "submitting" = "idle";

// IMPORTANT: mock react-hook-form so handleSubmit actually calls the callback with data
vi.mock("react-hook-form", () => {
  return {
    useForm: () => ({
      control: {},

      // handleSubmit(cb) returns a submit handler
      // that prevents default and calls cb with predictable data.
      handleSubmit:
        (cb: (data: any) => void) =>
        async (e?: any) => {
          e?.preventDefault?.();
          await cb({ name: "Meu Grupo", description: "Descrição X" });
        },
    }),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSubmit: () => submitMock,
    useNavigation: () => ({ state: navigationState }),
  };
});

vi.mock("@/hooks/useLoading", () => ({
  useLoading: () => ({ show: showMock, hide: hideMock }),
}));

const toastSuccessMock = vi.fn();
vi.mock("react-hot-toast", () => ({
  default: {
    success: (...args: any[]) => toastSuccessMock(...args),
  },
}));

// Mock UI components (simple + testable)
vi.mock("@/components", () => ({
  RegisterForm: ({ title, cancelHandler, formSubmit, children }: any) => (
    <div>
      <h1>{title}</h1>
      <form onSubmit={formSubmit} aria-label="register-form">
        {children}
        <button type="button" onClick={cancelHandler}>
          Cancelar
        </button>
        <button type="submit" data-testid="button-salvar">
          Salvar
        </button>
      </form>
    </div>
  ),
  TextField: ({ label, "data-testid": testId }: any) => (
    <div>
      <span>{label}</span>
      <input data-testid={testId} />
    </div>
  ),
}));

vi.mock("./group.service", () => ({
  groupService: { post: vi.fn() },
}));

// -------------------- component tests --------------------
describe("<GroupAdd />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationState = "idle";
  });

  it("renders title and fields", () => {
    render(<GroupAdd />);

    expect(screen.getByText("Novo Grupo")).toBeInTheDocument();
    expect(screen.getByTestId("field-name")).toBeInTheDocument();
    expect(screen.getByTestId("field-description")).toBeInTheDocument();
    expect(screen.getByTestId("button-salvar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("calls hide() when navigation.state is idle (may run more than once in dev)", () => {
    navigationState = "idle";

    render(<GroupAdd />);

    // because show/hide is called during render, it may be invoked twice
    expect(hideMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(showMock).not.toHaveBeenCalled();
  });

  it("calls show() when navigation.state is submitting (may run more than once in dev)", () => {
    navigationState = "submitting";

    render(<GroupAdd />);

    expect(showMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(hideMock).not.toHaveBeenCalled();
  });

  it("navigates to '/' on cancel", async () => {
    render(<GroupAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("submits via useSubmit with method=post", async () => {
    render(<GroupAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("button-salvar"));

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledWith(
      { name: "Meu Grupo", description: "Descrição X" },
      { method: "post" }
    );
  });
});

// -------------------- action tests --------------------
describe("GroupAdd.action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts payload, shows success toast, and redirects to '/'", async () => {
    (groupService.post as any).mockResolvedValueOnce(undefined);

    const form = new FormData();
    form.set("name", "G1");
    form.set("description", "D1");

    const request = { formData: async () => form } as any;

    const result = await action({ request } as any);

    expect(groupService.post).toHaveBeenCalledWith({
      name: "G1",
      description: "D1",
      cover: "teste",
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Grupo cadastrado com sucesso!"
    );

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/");
  });

  it("returns error when post throws { status: 401 }", async () => {
    (groupService.post as any).mockRejectedValueOnce({ status: 401 });

    const form = new FormData();
    form.set("name", "G1");
    form.set("description", "D1");

    const request = { formData: async () => form } as any;

    const result = await action({ request } as any);

    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 401 });
  });
});
