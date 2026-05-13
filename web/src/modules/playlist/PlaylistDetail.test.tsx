// src/modules/playlist/PlaylistDetail.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlaylistDetailScreen, { loader } from "./PlaylistDetail";
import groupService from "../group/group.service";

const navigateMock = vi.fn();
const handlePlayMock = vi.fn();

let paramsValue: any = { id: "10", playlistId: "20" };

let loaderResultsValue: any = [
  {
    status: "fulfilled",
    value: { id: 20, title: "Playlist A" },
  },
  {
    status: "fulfilled",
    value: [],
  },
];

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => paramsValue,
    useLoaderData: () => ({
      data: Promise.resolve(loaderResultsValue),
    }),
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderResultsValue);
    },
  };
});

vi.mock("@/components/player/AudioPlayerContext", () => ({
  useAudioPlayerContext: () => ({
    handlePlay: handlePlayMock,
  }),
}));

vi.mock("../group/GroupContext", () => ({
  useGroupContext: () => ({
    currentGroup: {
      id: "10",
      name: "Grupo X",
      description: "Desc",
      isAdmin: true,
    },
  }),
}));

vi.mock("@/components", () => ({
  FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
}));

vi.mock("../music/track/TraskList", () => {
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

vi.mock("../group/group.service", () => ({
  default: {
    getGroupPlaylist: vi.fn(),
    getGroupPlaylistMusics: vi.fn(),
  },
}));

describe("<PlaylistDetailScreen />", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    paramsValue = { id: "10", playlistId: "20" };

    loaderResultsValue = [
      {
        status: "fulfilled",
        value: { id: 20, title: "Playlist A" },
      },
      {
        status: "fulfilled",
        value: [],
      },
    ];
  });

  it("renders playlist header with title, group name and music count", () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Song A", description: "Artist A", groupId: 10 },
          { id: 2, name: "Song B", description: "Artist B", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    expect(screen.getByText("Playlist A")).toBeInTheDocument();
    expect(screen.getByText("Playlist selecionada")).toBeInTheDocument();
    expect(screen.getByText("2 músicas")).toBeInTheDocument();
    expect(screen.getByText("Grupo Grupo X")).toBeInTheDocument();
  });

  it("renders singular music count when playlist has one song", () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Song A", description: "Artist A", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    expect(screen.getByText("1 música")).toBeInTheDocument();
  });

  it("renders empty playlist state when playlist has no songs", () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      { status: "fulfilled", value: [] },
    ];

    render(<PlaylistDetailScreen />);

    expect(screen.getByText("Playlist vazia")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Adicione músicas para começar a montar a sequência desta playlist."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "+ Adicionar músicas" })
    ).toBeInTheDocument();

    expect(screen.queryByPlaceholderText("Buscar nesta playlist")).not.toBeInTheDocument();
  });

  it("disables 'Tocar tudo' when playlist has no songs", () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      { status: "fulfilled", value: [] },
    ];

    render(<PlaylistDetailScreen />);

    expect(screen.getByRole("button", { name: "▶ Tocar tudo" })).toBeDisabled();
  });

  it("enables 'Tocar tudo' when playlist has songs", () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Song A", description: "Artist A", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    expect(screen.getByRole("button", { name: "▶ Tocar tudo" })).not.toBeDisabled();
  });

  it("renders search input and music list when playlist has songs", () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Song A", description: "Artist A", groupId: 10 },
          { id: 2, name: "Song B", description: "Artist B", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    expect(screen.getByPlaceholderText("Buscar nesta playlist")).toBeInTheDocument();
    expect(screen.getByTestId("track-list")).toBeInTheDocument();
    expect(screen.getByTestId("track-Song A")).toBeInTheDocument();
    expect(screen.getByTestId("track-Song B")).toBeInTheDocument();
  });

  it("filters songs by search query", async () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Amazing Grace", description: "Hymn", groupId: 10 },
          { id: 2, name: "Blue Song", description: "Band", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Buscar nesta playlist"), "amazing");

    expect(screen.getByTestId("track-Amazing Grace")).toBeInTheDocument();
    expect(screen.queryByTestId("track-Blue Song")).not.toBeInTheDocument();
  });

  it("renders empty search result when no songs match the search", async () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Amazing Grace", description: "Hymn", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Buscar nesta playlist"), "xyz");

    expect(screen.getByText("Nenhuma música encontrada")).toBeInTheDocument();
    expect(screen.getByText("Tente buscar por outro nome.")).toBeInTheDocument();
    expect(screen.queryByTestId("track-Amazing Grace")).not.toBeInTheDocument();
  });

  it("navigates to add songs screen from header '+ Adicionar' button", async () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Song A", description: "Artist A", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    const user = userEvent.setup();

    // header has "+ Adicionar", list header also has "+ Adicionar"; first one is header
    await user.click(screen.getAllByRole("button", { name: "+ Adicionar" })[0]);

    expect(navigateMock).toHaveBeenCalledWith(
      "/groups/10/playlists/20/add-songs"
    );
  });

  it("navigates to add songs screen from list '+ Adicionar' button", async () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Song A", description: "Artist A", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    const user = userEvent.setup();

    await user.click(screen.getAllByRole("button", { name: "+ Adicionar" })[1]);

    expect(navigateMock).toHaveBeenCalledWith(
      "/groups/10/playlists/20/add-songs"
    );
  });

  it("navigates to add songs screen from empty playlist button", async () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      { status: "fulfilled", value: [] },
    ];

    render(<PlaylistDetailScreen />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+ Adicionar músicas" }));

    expect(navigateMock).toHaveBeenCalledWith(
      "/groups/10/playlists/20/add-songs"
    );
  });

  it("calls audio player handlePlay when clicking a track", async () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      {
        status: "fulfilled",
        value: [
          {
            id: 1,
            name: "Song A",
            description: "Artist A",
            file: "song-a.mp3",
            groupId: 10,
          },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("track-Song A"));

    expect(handlePlayMock).toHaveBeenCalledTimes(1);
    expect(handlePlayMock).toHaveBeenCalledWith({
      id: 1,
      name: "Song A",
      description: "Artist A",
      file: "song-a.mp3",
      groupId: 10,
    });
  });

  it("renders playlist load error when playlist promise is rejected", () => {
    loaderResultsValue = [
      { status: "rejected", reason: new Error("playlist failed") },
      {
        status: "fulfilled",
        value: [
          { id: 1, name: "Song A", description: "Artist A", groupId: 10 },
        ],
      },
    ];

    render(<PlaylistDetailScreen />);

    expect(screen.getByText("Erro ao carregar a playlist.")).toBeInTheDocument();
  });

  it("uses empty music list when musics promise is rejected", () => {
    loaderResultsValue = [
      { status: "fulfilled", value: { id: 20, title: "Playlist A" } },
      { status: "rejected", reason: new Error("musics failed") },
    ];

    render(<PlaylistDetailScreen />);

    expect(screen.getByText("Playlist vazia")).toBeInTheDocument();
  });
});

describe("PlaylistDetail.loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls playlist and playlist musics services with group id and playlist id", async () => {
    const playlistPromise = Promise.resolve({ id: 20, title: "Playlist A" });
    const musicsPromise = Promise.resolve([
      { id: 1, name: "Song A", description: "Artist A" },
    ]);

    (groupService.getGroupPlaylist as any).mockReturnValueOnce(playlistPromise);
    (groupService.getGroupPlaylistMusics as any).mockReturnValueOnce(musicsPromise);

    const result = loader({
      params: { id: "10", playlistId: "20" },
    } as any);

    expect(groupService.getGroupPlaylist).toHaveBeenCalledWith(10, 20);
    expect(groupService.getGroupPlaylistMusics).toHaveBeenCalledWith(10, 20);

    const settled = await result.data;

    expect(settled[0].status).toBe("fulfilled");
    expect(settled[1].status).toBe("fulfilled");
  });
});