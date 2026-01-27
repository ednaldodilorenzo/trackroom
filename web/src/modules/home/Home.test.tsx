import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, expect, it, describe } from "vitest";
import Home from "./Home";

// --- mock before importing other modules if needed ---
const navigateMock = vi.fn();

// Mock router-related hooks (defined before import usage)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLoaderData: () => ({ groups: Promise.resolve([{ title: "Group 1" }, { title: "Group 2" }]) }),
    Await: ({ resolve, children }: any) => {
      // Immediately render with resolved value
      resolve.then((data: any) => data);
      return children([{ title: "Group 1" }, { title: "Group 2" }]);
    },
  };
});


// Mock components and services
vi.mock("@/components", () => ({
  TrackCard: ({ title }: any) => <div data-testid="track-card">{title}</div>,
  TrackItem: ({ title }: any) => <div data-testid="track-item">{title}</div>,
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
}));

vi.mock("./home.service", () => ({
  default: {
    getGroups: vi.fn(() =>
      Promise.resolve([{ title: "Group 1" }, { title: "Group 2" }])
    ),
  },
}));

describe("<Home />", () => {
  it("renders all tracks and groups", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Assert static tracks
    expect(screen.getByText("All Tracks")).toBeInTheDocument();
    expect(await screen.findAllByTestId("track-item")).toHaveLength(4);

    // Assert async groups
    await waitFor(async () => {
      const cards = await screen.findAllByTestId("track-card");
      expect(cards).toHaveLength(2);
    });
  });

  it("navigates when clicking '+ Novo Grupo'", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: "+ Novo Grupo" });
    button.click();

    expect(navigateMock).toHaveBeenCalledWith("/groups/add");
  });
});
