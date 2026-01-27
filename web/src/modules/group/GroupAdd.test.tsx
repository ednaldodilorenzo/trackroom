import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import GroupAdd from "./GroupAdd";

// --- mocks ---
const navigateMock = vi.fn();
const submitMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSubmit: () => submitMock,
  };
});

vi.mock("@/components", () => ({
  RegisterForm: ({ title, cancelHandler, formSubmit, children }: any) => (
    <form onSubmit={formSubmit}>
      <h1>{title}</h1>
      {children}
      <button type="button" onClick={cancelHandler}>
        Cancelar
      </button>
      <button type="submit">Salvar</button>
    </form>
  ),
  TextField: ({ name, label }: any) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} />
    </div>
  ),
}));

vi.mock("./group.service", () => ({
  groupService: { post: vi.fn() },
}));

// -------------------------------------------------------------------
describe("<GroupAdd />", () => {
  it("renders form fields and title", () => {
    render(
      <MemoryRouter>
        <GroupAdd />
      </MemoryRouter>
    );

    expect(screen.getByText("Novo Grupo")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("calls useSubmit with form data on submit", async () => {
    render(
      <MemoryRouter>
        <GroupAdd />
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Nome"), "My Group");
    await user.type(screen.getByLabelText("Descrição"), "A test group");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledWith(
      { name: "My Group", description: "A test group" },
      { method: "post" } 
    );
  });

  it("navigates back to /home on cancel", async () => {
    render(
      <MemoryRouter>
        <GroupAdd />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
