// src/modules/music/CipherContent.test.tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CipherContent from "./CipherContent";

const upMock = vi.fn();
const downMock = vi.fn();
const resetMock = vi.fn();
const setPrincipalMock = vi.fn();

vi.mock("@/components/cipher/TransposeControls", () => ({
  default: ({ up, down, reset }: any) => (
    <div data-testid="transpose-controls">
      <button onClick={up}>Up</button>
      <button onClick={down}>Down</button>
      <button onClick={reset}>Reset</button>
    </div>
  ),
}));

describe("<CipherContent /> (no effect version)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders transpose controls", () => {
    render(
      <CipherContent
        loadedMeta={{ name: "Song", cipher: "C" } as any}
        setPrincipal={setPrincipalMock}
        transposedCipher={"C"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    expect(screen.getByTestId("transpose-controls")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Down" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("calls setPrincipal with loadedMeta.cipher on render (or empty string)", () => {
    render(
      <CipherContent
        loadedMeta={{ name: "Song", cipher: "RAW_CIPHER" } as any}
        setPrincipal={setPrincipalMock}
        transposedCipher={"RAW_CIPHER"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    expect(setPrincipalMock).toHaveBeenCalledTimes(1);
    expect(setPrincipalMock).toHaveBeenCalledWith("RAW_CIPHER");
  });

  it("calls setPrincipal with empty string when loadedMeta.cipher is missing", () => {
    render(
      <CipherContent
        loadedMeta={{ name: "Song" } as any}
        setPrincipal={setPrincipalMock}
        transposedCipher={"C"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    expect(setPrincipalMock).toHaveBeenCalledTimes(1);
    expect(setPrincipalMock).toHaveBeenCalledWith("");
  });

  it("converts newlines to <br/> and highlights chords outside brackets", () => {
    render(
      <CipherContent
        loadedMeta={{ name: "Song", cipher: "" } as any}
        setPrincipal={setPrincipalMock}
        transposedCipher={"C\nDm7\nLyrics"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    // chords become <span class="text-primary font-bold">...</span>
    const chordC = screen.getByText("C");
    const chordDm7 = screen.getByText("Dm7");

    expect(chordC.tagName.toLowerCase()).toBe("span");
    expect(chordDm7.tagName.toLowerCase()).toBe("span");
    expect(chordC).toHaveClass("text-primary", "font-bold");
    expect(chordDm7).toHaveClass("text-primary", "font-bold");

    // verify <br/> exists in injected HTML
    const inner = chordC.closest("div")!; // injected HTML container
    expect(inner.innerHTML).toContain("<span class=\"text-primary font-bold\">C</span><br><span class=\"text-primary font-bold\">Dm7</span><br>Lyrics");
  });

  it("removes brackets around bracketed sections (e.g. [Intro])", () => {
    render(
      <CipherContent
        loadedMeta={{ name: "Song", cipher: "" } as any}
        setPrincipal={setPrincipalMock}
        transposedCipher={"[Intro]\nC Dm"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    // Brackets should be removed, so "Intro" appears
    expect(screen.getByText("Intro")).toBeInTheDocument();

    // The actual bracketed string "[Intro]" should NOT appear as-is
    expect(screen.queryByText("[Intro]")).not.toBeInTheDocument();
  });

  it("does not wrap chords that are inside brackets (negative lookbehind/lookahead)", () => {
    render(
      <CipherContent
        loadedMeta={{ name: "Song", cipher: "" } as any}
        setPrincipal={setPrincipalMock}
        // chord C is inside brackets; Dm is outside
        transposedCipher={"[C]\nDm"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    // after bracket removal, "C" should exist as plain text (not wrapped in span)
    const cEl = screen.getByText("C");
    expect(cEl.tagName.toLowerCase()).not.toBe("span");

    // Dm should be highlighted
    const dmEl = screen.getByText("Dm");
    expect(dmEl.tagName.toLowerCase()).toBe("span");
    expect(dmEl).toHaveClass("text-primary", "font-bold");
  });

  it("highlights complex chords (slash, extensions, symbols)", () => {
    render(
      <CipherContent
        loadedMeta={{ name: "Song", cipher: "" } as any}
        setPrincipal={setPrincipalMock}
        transposedCipher={"F#M7\nC/E\nA°\nGm7"}
        up={upMock}
        down={downMock}
        reset={resetMock}
      />
    );

    for (const chord of ["F#M7", "C/E", "A°", "Gm7"]) {
      const el = screen.getByText(chord);
      expect(el.tagName.toLowerCase()).toBe("span");
      expect(el).toHaveClass("text-primary", "font-bold");
    }
  });
});
