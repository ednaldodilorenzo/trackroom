// src/modules/music/MusicList.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MusicList from "./MusicList";
import { musicService } from "./music.service";

// -------------------- shared mocks --------------------
const navigateMock = vi.fn();
const setCurrentTrackMock = vi.fn();
const setIsPlayingMock = vi.fn();

// Control these per-test:
let loaderMusicsValue: any[] = [];
let paramsIdValue = "10";
let currentGroupValue: any = { isAdmin: false };
let currentTrackValue: any = { id: 999 }; // something not matching by default

// -------------------- react-router-dom mocks --------------------
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: paramsIdValue }),

    // component does: const { musics } = useLoaderData<{ musics: Promise<Music[]> }>();
    useLoaderData: () => ({ musics: Promise.resolve(loaderMusicsValue) }),

    // In unit tests we mock Await so it immediately renders children
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderMusicsValue);
    },
  };
});

// -------------------- context mocks --------------------
vi.mock("@/components/player/AudioPlayerContext", () => ({
  useAudioPlayerContext: () => ({
    setCurrentTrack: setCurrentTrackMock,
    setIsPlaying: setIsPlayingMock,
    currentTrack: currentTrackValue,
  }),
}));

vi.mock("../group/GroupContext", () => ({
  useGroupContext: () => ({ currentGroup: currentGroupValue }),
}));

// -------------------- UI/component mocks --------------------
vi.mock("@/components/fallbackoverlay/FallBackOverlay", () => ({
  default: () => <div data-testid="fallback">Loading...</div>,
}));

vi.mock("@/components/button/Button", () => ({
  default: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

// We mock TextField as a simple input so we can type in it
vi.mock("@/components", () => ({
  TextField: ({ value, onChange, name }: any) => (
    <input data-testid={name} value={value ?? ""} onChange={onChange} />
  ),
}));

// Mock TrackItem so we can click it and assert props like "active"
vi.mock("@/components/trackitem/TrackItem", () => ({
  default: ({ name, onClick, active, cipherLink }: any) => (
    <div>
      <button data-testid={`track-${name}`} onClick={onClick}>
        {name}
      </button>
      <span data-testid={`active-${name}`}>{String(Boolean(active))}</span>
      <span data-testid={`cipher-${name}`}>{cipherLink}</span>
    </div>
  ),
}));

// react-icons mock (avoid rendering SVG complexity)
vi.mock("react-icons/bs", () => ({
  BsSearch: () => <span data-testid="search-icon" />,
}));

// -------------------- service mocks --------------------
vi.mock("./music.service", () => ({
  musicService: {
    getFileUrl: vi.fn(),
    getAll: vi.fn(),
  },
}));

// -------------------- tests --------------------
describe("<MusicList />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderMusicsValue = [];
    paramsIdValue = "10";
    currentGroupValue = { isAdmin: false };
    currentTrackValue = { id: 999 };
  });

  it("renders title and search field", () => {
    render(<MusicList />);

    expect(screen.getByText("Músicas")).toBeInTheDocument();
    expect(screen.getByTestId("searchMusic")).toBeInTheDocument();
  });

  it("renders empty-state when no musics", () => {
    loaderMusicsValue = [];

    render(<MusicList />);

    expect(screen.getByText("Nenhuma música encontrada...")).toBeInTheDocument();
  });

  it("renders list of musics and builds cipherLink with group id param", async () => {
    loaderMusicsValue = [
      { id: 1, name: "Song A", description: "Artist A" },
      { id: 2, name: "Song B", description: "Artist B" },
    ];
    paramsIdValue = "77";

    render(<MusicList />);

    // Track buttons exist
    expect(screen.getByTestId("track-Song A")).toBeInTheDocument();
    expect(screen.getByTestId("track-Song B")).toBeInTheDocument();

    // cipher links constructed from params id
    expect(screen.getByTestId("cipher-Song A")).toHaveTextContent(
      "/groups/77/musics/1/cipher"
    );
    expect(screen.getByTestId("cipher-Song B")).toHaveTextContent(
      "/groups/77/musics/2/cipher"
    );
  });

  it("filters musics by search (case-insensitive)", async () => {
    loaderMusicsValue = [
      { id: 1, name: "Hello World", description: "A" },
      { id: 2, name: "Bye Now", description: "B" },
    ];

    render(<MusicList />);

    const user = userEvent.setup();
    await user.type(screen.getByTestId("searchMusic"), "hello");

    expect(screen.getByTestId("track-Hello World")).toBeInTheDocument();
    expect(screen.queryByTestId("track-Bye Now")).not.toBeInTheDocument();
  });

  it("marks TrackItem as active when currentTrack.id matches item.id", () => {
    loaderMusicsValue = [
      { id: 1, name: "Song Active", description: "A" },
      { id: 2, name: "Song Inactive", description: "B" },
    ];
    currentTrackValue = { id: 1 };

    render(<MusicList />);

    expect(screen.getByTestId("active-Song Active")).toHaveTextContent("true");
    expect(screen.getByTestId("active-Song Inactive")).toHaveTextContent("false");
  });

  it("plays a track on click: fetches file url, sets current track and starts playing", async () => {
    loaderMusicsValue = [{ id: 5, name: "Play Me", description: "Singer" }];
    (musicService.getFileUrl as any).mockResolvedValueOnce("https://file.url/x.mp3");

    render(<MusicList />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("track-Play Me"));

    expect(musicService.getFileUrl).toHaveBeenCalledTimes(1);
    expect(musicService.getFileUrl).toHaveBeenCalledWith(5);

    expect(setCurrentTrackMock).toHaveBeenCalledTimes(1);
    expect(setCurrentTrackMock).toHaveBeenCalledWith({
      id: 5,
      title: "Play Me",
      src: "https://file.url/x.mp3",
      author: "Singer",
    });

    expect(setIsPlayingMock).toHaveBeenCalledTimes(1);
    expect(setIsPlayingMock).toHaveBeenCalledWith(true);
  });

  it("shows '+ Nova Música' button only for admin and navigates on click", async () => {
    loaderMusicsValue = [{ id: 1, name: "Song A", description: "A" }];
    currentGroupValue = { isAdmin: true };
    paramsIdValue = "123";

    render(<MusicList />);

    const btn = screen.getByRole("button", { name: "+ Nova Música" });
    expect(btn).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(btn);

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/123/musics/add");
  });

  it("does not show '+ Nova Música' button for non-admin", () => {
    loaderMusicsValue = [{ id: 1, name: "Song A", description: "A" }];
    currentGroupValue = { isAdmin: false };

    render(<MusicList />);

    expect(
      screen.queryByRole("button", { name: "+ Nova Música" })
    ).not.toBeInTheDocument();
  });
});
