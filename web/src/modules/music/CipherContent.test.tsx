import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CipherContent from "./CipherContent";

const upMock = vi.fn();
const downMock = vi.fn();
const resetMock = vi.fn();

vi.mock("@/components/cipher/TransposeControls", () => ({
  default: ({ up, down, reset }: any) => (
    <div data-testid="transpose-controls">
      <button onClick={up}>Up</button>
      <button onClick={down}>Down</button>
      <button onClick={reset}>Reset</button>
    </div>
  ),
}));

describe("<CipherContent />", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders transpose controls", () => {
    render(
      <CipherContent
        transposedCipher="C"
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    expect(screen.getByTestId("transpose-controls")).toBeInTheDocument();
  });

  it("shows empty state when cipher is empty", () => {
    render(
      <CipherContent
        transposedCipher=""
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    expect(screen.getByText("Nenhuma cifra cadastrada")).toBeInTheDocument();
  });

  it("highlights chords", () => {
    render(
      <CipherContent
        transposedCipher={"C\nDm7\nLyrics"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    expect(screen.getByText("C")).toHaveClass("text-violet-700", "font-bold");
    expect(screen.getByText("Dm7")).toHaveClass("text-violet-700", "font-bold");
  });

  it("removes brackets from sections", () => {
    render(
      <CipherContent
        transposedCipher={"[Intro]\nC Dm"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    expect(screen.getByText("Intro")).toBeInTheDocument();
    expect(screen.queryByText("[Intro]")).not.toBeInTheDocument();
  });

  it("calls transpose actions", () => {
    render(
      <CipherContent
        transposedCipher="C"
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    screen.getByRole("button", { name: "Up" }).click();
    screen.getByRole("button", { name: "Down" }).click();
    screen.getByRole("button", { name: "Reset" }).click();

    expect(upMock).toHaveBeenCalled();
    expect(downMock).toHaveBeenCalled();
    expect(resetMock).toHaveBeenCalled();
  });
});