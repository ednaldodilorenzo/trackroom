// src/modules/group/GroupMember.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GroupMember from "./GroupMember";

// Optional: mock the icon so tests don't depend on SVG internals
vi.mock("react-icons/bs", () => ({
  BsPerson: () => <span data-testid="bs-person-icon" />,
}));

describe("<GroupMember />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o nome e os textos fixos", () => {
    render(<GroupMember id={1} name="Maria" admin={false} />);

    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.getByText("Teste")).toBeInTheDocument();
  });

  it("mostra 'Admin' quando admin=true", () => {
    render(<GroupMember id={1} name="João" admin />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("não mostra 'Admin' quando admin=false", () => {
    render(<GroupMember id={1} name="João" admin={false} />);

    // o componente renderiza string vazia, então "Admin" não deve existir
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("renderiza o botão (com ícone) quando id é truthy", () => {
    render(<GroupMember id={123} name="Ana" admin={false} />);

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByTestId("bs-person-icon")).toBeInTheDocument();
  });

  it("não renderiza o botão quando id é 0 (falsy)", () => {
    render(<GroupMember id={0} name="Ana" admin={false} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bs-person-icon")).not.toBeInTheDocument();
  });

  it("aplica a classe CSS principal e os blocos internos", () => {
    const { container } = render(
      <GroupMember id={1} name="Carlos" admin={true} />
    );

    // classe raiz
    expect(container.querySelector(".group-member")).toBeTruthy();

    // blocos internos
    expect(container.querySelector(".group-member-meta")).toBeTruthy();
    expect(container.querySelector(".group-member-title")?.textContent).toBe(
      "Carlos"
    );
    expect(container.querySelector(".group-member-sub")?.textContent).toBe(
      "Teste"
    );
    expect(container.querySelector(".group-member-detail")?.textContent).toBe(
      "Admin"
    );
  });
});
