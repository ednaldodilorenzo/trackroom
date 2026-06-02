import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MusicCipher, { action, cipherLoader } from "./MusicCipher";
import { musicService } from "./music.service";

const navigateMock = vi.fn();
const submitMock = vi.fn();
const setPrincipalMock = vi.fn();
const upMock = vi.fn();
const downMock = vi.fn();
const resetMock = vi.fn();

let routeId = "10";
let loaderMeta: any = {
  name: "Song A",
  cipherUrl: "https://example.com/cipher.txt",
  cipher: "C Dm Em",
};

let transposedCipherValue = "C Dm Em";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSubmit: () => submitMock,
    useParams: () => ({ id: routeId }),
    useLoaderData: () => ({ musicMetaData: Promise.resolve(loaderMeta) }),
    Await: ({ children }: any) => children(loaderMeta),
  };
});

vi.mock("@/hooks/useCipher", () => ({
  useCipher: () => ({
    transposedCipher: transposedCipherValue,
    up: upMock,
    down: downMock,
    reset: resetMock,
    setPrincipal: setPrincipalMock,
  }),
}));

vi.mock("@/hooks/useWakeLock", () => ({
  useWakeLock: vi.fn(),
}));

vi.mock("@/components", () => ({
  FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
}));

const cipherContentSpy = vi.fn();

vi.mock("./CipherContent", () => ({
  default: (props: any) => {
    cipherContentSpy(props);
    return <div data-testid="cipher-content">CipherContent</div>;
  },
}));

vi.mock("./music.service", () => ({
  musicService: {
    getMusicMetaData: vi.fn(),
    getMusicCipher: vi.fn(),
    uploadCipher: vi.fn(),
  },
}));

describe("<MusicCipher />", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    routeId = "10";
    loaderMeta = {
      name: "Song A",
      cipherUrl: "https://example.com/cipher.txt",
      cipher: "C Dm Em",
    };

    transposedCipherValue = "C Dm Em";
  });

  it("renders title and CipherContent in view mode", async () => {
    render(<MusicCipher />);

    expect(screen.getByText("Song A")).toBeInTheDocument();
    expect(screen.getByText("Visualizando cifra")).toBeInTheDocument();
    expect(screen.getByTestId("cipher-content")).toBeInTheDocument();

    await waitFor(() => {
      expect(setPrincipalMock).toHaveBeenCalledWith("C Dm Em");
    });

    expect(cipherContentSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        transposedCipher: "C Dm Em",
        up: upMock,
        down: downMock,
        reset: resetMock,
      })
    );
  });

  it("navigates back when clicking close", async () => {
    const user = userEvent.setup();
    render(<MusicCipher />);

    await user.click(screen.getByRole("button", { name: /fechar cifra/i }));

    expect(navigateMock).toHaveBeenCalledWith("/groups/10/musics");
  });

  it("enters edit mode without submitting", async () => {
    const user = userEvent.setup();
    render(<MusicCipher />);

    await user.click(screen.getByRole("button", { name: /editar cifra/i }));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByTestId("cipher-content")).not.toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("submits cipher when saving", async () => {
    const user = userEvent.setup();
    render(<MusicCipher />);

    await user.click(screen.getByRole("button", { name: /editar cifra/i }));
    await user.click(screen.getByRole("button", { name: /salvar cifra/i }));

    expect(submitMock).toHaveBeenCalledWith(
      { cipher: "C Dm Em" },
      { method: "post" }
    );
  });

  it("typing in textarea calls setPrincipal", async () => {
    const user = userEvent.setup();
    render(<MusicCipher />);

    await user.click(screen.getByRole("button", { name: /editar cifra/i }));
    await user.type(screen.getByRole("textbox"), " NEW");

    expect(setPrincipalMock).toHaveBeenCalled();
  });
});

describe("cipherLoader", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads metadata and cipher", async () => {
    const meta = { name: "X", cipherUrl: "https://x/c.txt" };

    vi.mocked(musicService.getMusicMetaData).mockResolvedValueOnce(meta as any);
    vi.mocked(musicService.getMusicCipher).mockResolvedValueOnce("RAW_CIPHER");

    const result = cipherLoader({ params: { musicId: "7" } } as any);
    const resolved = await result.musicMetaData;

    expect(musicService.getMusicMetaData).toHaveBeenCalledWith(7);
    expect(musicService.getMusicCipher).toHaveBeenCalledWith("https://x/c.txt");
    expect(resolved).toEqual({
      name: "X",
      cipherUrl: "https://x/c.txt",
      cipher: "RAW_CIPHER",
    });
  });

  it("returns empty cipher when cipher fetch fails", async () => {
    const meta = { name: "X", cipherUrl: "https://x/c.txt" };

    vi.mocked(musicService.getMusicMetaData).mockResolvedValueOnce(meta as any);
    vi.mocked(musicService.getMusicCipher).mockRejectedValueOnce(new Error());

    const result = cipherLoader({ params: { musicId: "7" } } as any);
    const resolved = await result.musicMetaData;

    expect(resolved.cipher).toBe("");
  });
});

describe("action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uploads cipher", async () => {
    const form = new FormData();
    form.set("cipher", "UPDATED CIPHER");

    const result = await action({
      request: { formData: async () => form },
      params: { musicId: "9" },
    } as any);

    expect(musicService.uploadCipher).toHaveBeenCalledWith(
      9,
      "UPDATED CIPHER"
    );
    expect(result).toBeNull();
  });
});