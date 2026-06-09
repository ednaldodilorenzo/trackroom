// src/modules/music/MusicList.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MusicList, { musicsLoader } from "./MusicList";
import { musicService } from "./music.service";
import groupService from "@/modules/group/group.service";

const navigateMock = vi.fn();
const setCurrentTrackMock = vi.fn();
const setIsPlayingMock = vi.fn();
const headerConfigMock = vi.fn();

let loaderMusicsValue: any = { content: [] };
let paramsIdValue = "10";
let currentGroupValue: any = { isAdmin: false };

vi.mock("@/hooks/useHeaderConfig", () => ({
  useHeaderConfig: (...args: any[]) => headerConfigMock(...args),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: paramsIdValue }),
    useLoaderData: () => ({ musics: Promise.resolve(loaderMusicsValue) }),
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderMusicsValue);
    },
  };
});

vi.mock("@/components/player/AudioPlayerContext", () => ({
  useAudioPlayerContext: () => ({
    setCurrentTrack: setCurrentTrackMock,
    setIsPlaying: setIsPlayingMock,
  }),
}));

vi.mock("../group/GroupContext", () => ({
  useGroupContext: () => ({ currentGroup: currentGroupValue }),
}));

vi.mock("@/components/fallbackoverlay/FallBackOverlay", () => ({
  default: () => <div data-testid="fallback">Loading...</div>,
}));

vi.mock("@/components", () => ({
  TextField: ({ value, onChange, name, placeholder }: any) => (
    <input
      data-testid={name}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
    />
  ),
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("./track/TraskList", () => {
  const TrackList = ({ children }: any) => (
    <div data-testid="track-list">{children}</div>
  );

  TrackList.Item = ({ music, handlePlay }: any) => (
    <button
      type="button"
      data-testid={`track-${music.name}`}
      onClick={() => handlePlay(music)}
    >
      {music.name}
    </button>
  );

  return { default: TrackList };
});

vi.mock("react-icons/bs", () => ({
  BsSearch: () => <span data-testid="search-icon" />,
}));

vi.mock("react-icons/bi", () => ({
  BiPlus: () => <span data-testid="plus-icon" />,
}));

vi.mock("./music.service", () => ({
  musicService: {
    getFileUrl: vi.fn(),
  },
}));

vi.mock("@/modules/group/group.service", () => ({
  default: {
    getMusics: vi.fn(),
  },
}));

describe("<MusicList />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderMusicsValue = { content: [] };
    paramsIdValue = "10";
    currentGroupValue = { isAdmin: false };
  });

  it("renders title, subtitle and search field", () => {
    render(<MusicList />);

    expect(screen.getByText("Músicas")).toBeInTheDocument();
    expect(
      screen.getByText("Todas as músicas disponíveis neste grupo")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar música")).toBeInTheDocument();
  });

  it("renders empty-state when no musics", () => {
    loaderMusicsValue = { content: [] };

    render(<MusicList />);

    expect(screen.getByText("Nenhuma música adicionada")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Adicione músicas ao grupo para que os membros possam solicitar ou visualizar cifras."
      )
    ).toBeInTheDocument();
  });

  it("renders empty-state action only for admin and navigates on click", async () => {
    loaderMusicsValue = { content: [] };
    currentGroupValue = { isAdmin: true };
    paramsIdValue = "123";

    render(<MusicList />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Adicionar música/i }));

    expect(navigateMock).toHaveBeenCalledWith("/groups/123/musics/add", {
      state: {
        returnTo: "/groups/123/musics",
      },
    });
  });

  it("does not render empty-state action for non-admin", () => {
    loaderMusicsValue = { content: [] };
    currentGroupValue = { isAdmin: false };

    render(<MusicList />);

    expect(
      screen.queryByRole("button", { name: /Adicionar música/i })
    ).not.toBeInTheDocument();
  });

  it("renders list of musics", () => {
    loaderMusicsValue = {
      content: [
        { id: 1, name: "Song A", description: "Artist A" },
        { id: 2, name: "Song B", description: "Artist B" },
      ],
    };

    render(<MusicList />);

    expect(screen.getByTestId("track-list")).toBeInTheDocument();
    expect(screen.getByTestId("track-Song A")).toBeInTheDocument();
    expect(screen.getByTestId("track-Song B")).toBeInTheDocument();
  });

  it("filters musics by search case-insensitively", async () => {
    loaderMusicsValue = {
      content: [
        { id: 1, name: "Hello World", description: "A" },
        { id: 2, name: "Bye Now", description: "B" },
      ],
    };

    render(<MusicList />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Buscar música"), "hello");

    expect(screen.getByTestId("track-Hello World")).toBeInTheDocument();
    expect(screen.queryByTestId("track-Bye Now")).not.toBeInTheDocument();
  });

  it("renders empty search state when filter matches no music", async () => {
    loaderMusicsValue = {
      content: [
        { id: 1, name: "Hello World", description: "A" },
        { id: 2, name: "Bye Now", description: "B" },
      ],
    };

    render(<MusicList />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Buscar música"), "xyz");

    expect(screen.getByText("Nenhuma música encontrada")).toBeInTheDocument();
    expect(
      screen.getByText("Tente buscar por outro nome ou limpe o campo de pesquisa.")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("track-Hello World")).not.toBeInTheDocument();
    expect(screen.queryByTestId("track-Bye Now")).not.toBeInTheDocument();
  });

  it("plays a track on click: fetches file url, sets current track and starts playing", async () => {
    loaderMusicsValue = {
      content: [{ id: 5, name: "Play Me", description: "Singer", fileVersion: 2 }],
    };

    (musicService.getFileUrl as any).mockResolvedValueOnce(
      "https://file.url/x.mp3"
    );

    render(<MusicList />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("track-Play Me"));

    expect(musicService.getFileUrl).toHaveBeenCalledTimes(1);
    expect(musicService.getFileUrl).toHaveBeenCalledWith(5, 2);

    expect(setCurrentTrackMock).toHaveBeenCalledWith({
      id: 5,
      title: "Play Me",
      src: "https://file.url/x.mp3",
      author: "Singer",
    });

    expect(setIsPlayingMock).toHaveBeenCalledWith(true);
  });

  it("shows header 'Adicionar' button only for admin and navigates on click", async () => {
    loaderMusicsValue = {
      content: [{ id: 1, name: "Song A", description: "A" }],
    };
    currentGroupValue = { isAdmin: true };
    paramsIdValue = "123";

    render(<MusicList />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Adicionar/i }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/groups/123/musics/add", {
      state: {
        returnTo: "/groups/123/musics",
      },
    });
  });

  it("does not show header 'Adicionar' button for non-admin", () => {
    loaderMusicsValue = {
      content: [{ id: 1, name: "Song A", description: "A" }],
    };
    currentGroupValue = { isAdmin: false };

    render(<MusicList />);

    expect(
      screen.queryByRole("button", { name: /Adicionar/i })
    ).not.toBeInTheDocument();
  });
});

describe("musicsLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls groupService.getMusics with params.id as number and returns musics promise", () => {
    const fakePromise = Promise.resolve({ content: [] });
    (groupService.getMusics as any).mockReturnValueOnce(fakePromise);

    const result = musicsLoader({ params: { id: "123" } } as any);

    expect(groupService.getMusics).toHaveBeenCalledTimes(1);
    expect(groupService.getMusics).toHaveBeenCalledWith(123, { unpaged: true });
    expect(result.musics).toBe(fakePromise);
  });
});