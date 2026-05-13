// src/modules/auth/login/Login.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login, { action, loginLoader } from "./Login";
import { authService } from "../authSevice";
import { store } from "@/store";

// -------------------- mocks --------------------
const submitMock = vi.fn();
const showMock = vi.fn();
const hideMock = vi.fn();

let navigationState: "idle" | "submitting" = "idle";
let actionDataValue: any = undefined;
let isValidValue = true;

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit:
      (cb: any) =>
      async (e?: any) => {
        e?.preventDefault?.();
        await cb({
          email: "john@email.com",
          password: "123456",
        });
      },
    formState: {
      isValid: isValidValue,
    },
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useSubmit: () => submitMock,
    useNavigation: () => ({ state: navigationState }),
    useActionData: () => actionDataValue,
    Link: ({ to, children, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/hooks/useLoading", () => ({
  useLoading: () => ({ show: showMock, hide: hideMock }),
}));

vi.mock("@/components", () => ({
  Form: ({ children, onSubmit }: any) => (
    <form onSubmit={onSubmit} aria-label="login-form">
      {children}
    </form>
  ),
  TextField: ({ label, name, type = "text" }: any) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} />
    </div>
  ),
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../authSevice", () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock("@/store", () => ({
  store: {
    getState: vi.fn(),
  },
}));

// -------------------- component tests --------------------
describe("<Login />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationState = "idle";
    actionDataValue = undefined;
    isValidValue = true;
  });

  it("renders login page content", () => {
    render(<Login />);

    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(
      screen.getByText("Entre para acessar suas músicas, grupos e playlists.")
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();

    expect(screen.getByLabelText("Lembrar-me")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Esqueceu a senha?" })).toHaveAttribute(
      "href",
      "/forgot-password"
    );

    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/signup"
    );

    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("does not show error message when actionData has no error", () => {
    actionDataValue = undefined;

    render(<Login />);

    expect(screen.queryByText("Email ou senha inválidos.")).not.toBeInTheDocument();
  });

  it("shows error message when actionData has error", () => {
    actionDataValue = {
      error: "Login failed",
      status: 400,
    };

    render(<Login />);

    expect(screen.getByText("Email ou senha inválidos.")).toBeInTheDocument();
  });

  it("calls hide() when navigation state is idle", () => {
    navigationState = "idle";

    render(<Login />);

    expect(hideMock).toHaveBeenCalled();
    expect(showMock).not.toHaveBeenCalled();
  });

  it("calls show() and disables submit button when navigation state is submitting", () => {
    navigationState = "submitting";

    render(<Login />);

    expect(showMock).toHaveBeenCalled();
    expect(hideMock).not.toHaveBeenCalled();

    const button = screen.getByRole("button", { name: "Entrando..." });
    expect(button).toBeDisabled();
  });

  it("disables submit button when form is invalid", () => {
    isValidValue = false;

    render(<Login />);

    expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
  });

  it("submits form data using useSubmit with method post", async () => {
    render(<Login />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledWith(
      {
        email: "john@email.com",
        password: "123456",
      },
      { method: "post" }
    );
  });
});

// -------------------- action tests --------------------
describe("Login.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to '/' when login succeeds and no from param exists", async () => {
    (authService.login as any).mockResolvedValueOnce(true);

    const form = new FormData();
    form.set("email", "john@email.com");
    form.set("password", "123456");

    const request = {
      url: "http://localhost/login",
      formData: async () => form,
    } as any;

    const result = await action({ request } as any);

    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(authService.login).toHaveBeenCalledWith("john@email.com", "123456");

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);    
  });

  it("redirects to from param when login succeeds", async () => {
    (authService.login as any).mockResolvedValueOnce(true);

    const form = new FormData();
    form.set("email", "john@email.com");
    form.set("password", "123456");

    const request = {
      url: "http://localhost/login?from=/main",
      formData: async () => form,
    } as any;

    const result = await action({ request } as any);

    expect(authService.login).toHaveBeenCalledWith("john@email.com", "123456");

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);    
  });

  it("returns error object when login fails", async () => {
    (authService.login as any).mockResolvedValueOnce(false);

    const form = new FormData();
    form.set("email", "wrong@email.com");
    form.set("password", "wrongpass");

    const request = {
      url: "http://localhost/login",
      formData: async () => form,
    } as any;

    const result = await action({ request } as any);

    expect(authService.login).toHaveBeenCalledWith(
      "wrong@email.com",
      "wrongpass"
    );

    expect(result).toEqual({
      error: "Login failed",
      status: 400,
    });
  });

  it("uses empty strings when email/password are missing", async () => {
    (authService.login as any).mockResolvedValueOnce(false);

    const form = new FormData();

    const request = {
      url: "http://localhost/login",
      formData: async () => form,
    } as any;

    await action({ request } as any);

    expect(authService.login).toHaveBeenCalledWith("", "");
  });
});

// -------------------- loader tests --------------------
describe("loginLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /main when user is already authenticated", async () => {
    (store.getState as any).mockReturnValueOnce({
      auth: {
        user: {
          id: 1,
          name: "John",
        },
      },
    });

    const result = await loginLoader();

    expect(result).toBeInstanceOf(Response);
    expect(result?.status).toBe(302);
    expect(result?.headers.get("Location")).toBe("/main");
  });

  it("returns null when user is not authenticated", async () => {
    (store.getState as any).mockReturnValueOnce({
      auth: {
        user: null,
      },
    });

    const result = await loginLoader();

    expect(result).toBeNull();
  });

  it("returns null when auth state is missing", async () => {
    (store.getState as any).mockReturnValueOnce({});

    const result = await loginLoader();

    expect(result).toBeNull();
  });
});