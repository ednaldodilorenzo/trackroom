// src/modules/music/MusicCipher.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MusicCipher, { action, cipherLoader } from "./MusicCipher";
import { musicService } from "./music.service";

// -------------------- mocks / controls --------------------
const navigateMock = vi.fn();
const submitMock = vi.fn();
const setPrincipalMock = vi.fn();
const upMock = vi.fn();
const downMock = vi.fn();
const resetMock = vi.fn();

let routeId = "10";

// loader meta used by Await mock
let loaderMeta: any = {
  name: "Song A",
  cipherUrl: "https://example.com/cipher.txt",
  cipher: "C Dm Em",
};

// hook state used by component
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
    useLoaderData: () => ({ musicMetaData: loaderMeta }),

    // Unit-test friendly Await: immediately render children with loaderMeta
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderMeta);
    },
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

// -------------------- component tests --------------------
describe("<MusicCipher />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cipherContentSpy.mockClear();

    routeId = "10";
    loaderMeta = {
      name: "Song A",
      cipherUrl: "https://example.com/cipher.txt",
      cipher: "C Dm Em",
    };
    transposedCipherValue = "C Dm Em";
  });

  it("renders header title and shows CipherContent by default (view mode)", () => {
    render(<MusicCipher />);

    expect(screen.getByText("Song A")).toBeInTheDocument();
    expect(screen.getByTestId("cipher-content")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    // CipherContent receives important props
    expect(cipherContentSpy).toHaveBeenCalledTimes(1);
    const props = cipherContentSpy.mock.calls[0][0];
    expect(props.loadedMeta).toEqual(loaderMeta);
    expect(props.transposedCipher).toBe("C Dm Em");
    expect(props.setPrincipal).toBe(setPrincipalMock);
    expect(props.up).toBe(upMock);
    expect(props.down).toBe(downMock);
    expect(props.reset).toBe(resetMock);
  });

  it("navigates back when clicking the close (✕) button", async () => {
    render(<MusicCipher />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Close Icon" }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/10/musics");
  });

  it("first click toggles to edit mode and does NOT submit", async () => {
    render(<MusicCipher />);

    const user = userEvent.setup();
    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons[0]; // first header button (edit/check)

    await user.click(toggleBtn);

    expect(screen.queryByTestId("cipher-content")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("second click (leaving edit mode) submits cipher with POST", async () => {
    render(<MusicCipher />);

    const user = userEvent.setup();
    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons[0];

    // enter edit mode
    await user.click(toggleBtn);
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    // click again => should submit
    await user.click(toggleBtn);

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledWith(
      { cipher: "C Dm Em" },
      { method: "post" }
    );
  });

  it("typing in textarea calls setPrincipal", async () => {
    render(<MusicCipher />);

    const user = userEvent.setup();
    const toggleBtn = screen.getAllByRole("button")[0];

    await user.click(toggleBtn); // edit mode
    const textarea = screen.getByRole("textbox");

    await user.type(textarea, " NEW");

    expect(setPrincipalMock).toHaveBeenCalled();
  });
});

// -------------------- loader tests --------------------
describe("cipherLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches metadata, then cipher, then returns metadata with data.cipher set", async () => {
    const meta = { name: "X", cipherUrl: "https://x/c.txt" };
    (musicService.getMusicMetaData as any).mockResolvedValueOnce(meta);
    (musicService.getMusicCipher as any).mockResolvedValueOnce("RAW_CIPHER");

    const result = cipherLoader({ params: { musicId: "7" } } as any);

    expect(musicService.getMusicMetaData).toHaveBeenCalledTimes(1);
    expect(musicService.getMusicMetaData).toHaveBeenCalledWith(7);

    const resolved = await result.musicMetaData;

    expect(musicService.getMusicCipher).toHaveBeenCalledTimes(1);
    expect(musicService.getMusicCipher).toHaveBeenCalledWith("https://x/c.txt");

    // cipherLoader mutates and returns meta with cipher property set
    expect(resolved).toEqual({ name: "X", cipherUrl: "https://x/c.txt", cipher: "RAW_CIPHER" });
  });
});

// -------------------- action tests --------------------
describe("action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads cipher with params.musicId and cipher from formData", async () => {
    const form = new FormData();
    form.set("cipher", "UPDATED CIPHER");

    const request = { formData: async () => form } as any;

    const result = await action({
      request,
      params: { musicId: "9" },
    } as any);

    expect(musicService.uploadCipher).toHaveBeenCalledTimes(1);
    expect(musicService.uploadCipher).toHaveBeenCalledWith(9, "UPDATED CIPHER");
    expect(result).toBeNull();
  });
});
