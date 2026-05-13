// src/modules/playlist/PlaylistAddSong.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddSongsToPlaylistScreen, { loader } from "./PlayListAddSong";
import groupService from "../group/group.service";

const navigateMock = vi.fn();
const showMock = vi.fn();
const hideMock = vi.fn();

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

let paramsValue: any = { id: "10", playlistId: "20" };
let loaderMusicsValue: any[] = [];

const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
    );

    return {
        ...actual,
        useParams: () => paramsValue,
        useNavigate: () => navigateMock,
        useLoaderData: () => ({
            musics: Promise.resolve(loaderMusicsValue),
        }),
        Await: ({ resolve, children }: any) => {
            void resolve;
            return children(loaderMusicsValue);
        },
    };
});

vi.mock("@/hooks/useLoading", () => ({
    useLoading: () => ({
        show: showMock,
        hide: hideMock,
    }),
}));

vi.mock("react-hot-toast", () => ({
    default: {
        success: (...args: any[]) => toastSuccessMock(...args),
        error: (...args: any[]) => toastErrorMock(...args),
    },
}));

vi.mock("@/components", () => ({
    FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
}));

vi.mock("../group/group.service", () => ({
    default: {
        getGroupPlaylistMusicOptions: vi.fn(),
        putGroupPlaylistMusics: vi.fn(),
    },
}));

describe("<AddSongsToPlaylistScreen />", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        paramsValue = { id: "10", playlistId: "20" };
        loaderMusicsValue = [];

        (groupService.putGroupPlaylistMusics as any).mockResolvedValue(undefined);
    });

    it("renders search input and disabled save button initially when no songs are selected", () => {
        loaderMusicsValue = [
            { id: 1, name: "Song A", description: "Artist A", selected: false },
        ];

        render(<AddSongsToPlaylistScreen />);

        expect(screen.getByPlaceholderText("Buscar música")).toBeInTheDocument();

        const button = screen.getByRole("button", { name: "Adicionar (0)" });
        expect(button).toBeDisabled();

        expect(screen.getByText("Song A")).toBeInTheDocument();
        expect(screen.getByText("Artist A")).toBeInTheDocument();
    });

    it("renders songs and preselects songs with selected=true", async () => {
        loaderMusicsValue = [
            { id: 1, name: "Song A", description: "Artist A", selected: true },
            { id: 2, name: "Song B", description: "Artist B", selected: false },
        ];

        render(<AddSongsToPlaylistScreen />);

        await flush();

        expect(screen.getByText("1 selecionada")).toBeInTheDocument();
        expect(screen.getAllByTestId("list-music-name-1")[0]).toBeInTheDocument();

        const button = screen.getByRole("button", { name: "Adicionar (1)" });
        expect(button).not.toBeDisabled();
    });

    it("toggles song selection when clicking a song", async () => {
        loaderMusicsValue = [
            { id: 1, name: "Song A", description: "Artist A", selected: false },
            { id: 2, name: "Song B", description: "Artist B", selected: false },
        ];

        render(<AddSongsToPlaylistScreen />);

        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Song A/i }));

        expect(screen.getByText("1 selecionada")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Adicionar (1)" })).not.toBeDisabled();

        await user.click(screen.getByRole("button", { name: /Song A/i }));

        expect(screen.queryByText("1 selecionada")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Adicionar (0)" })).toBeDisabled();
    });

    it("shows plural selected label when more than one song is selected", async () => {
        loaderMusicsValue = [
            { id: 1, name: "Song A", description: "Artist A", selected: false },
            { id: 2, name: "Song B", description: "Artist B", selected: false },
        ];

        render(<AddSongsToPlaylistScreen />);

        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Song A/i }));
        await user.click(screen.getByRole("button", { name: /Song B/i }));

        expect(screen.getByText("2 selecionadas")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Adicionar (2)" })).not.toBeDisabled();
    });

    it("filters songs by search query", async () => {
        loaderMusicsValue = [
            { id: 1, name: "Amazing Grace", description: "Hymn", selected: false },
            { id: 2, name: "Blue Song", description: "Band", selected: false },
        ];

        render(<AddSongsToPlaylistScreen />);

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Buscar música"), "amazing");

        expect(screen.getByText("Amazing Grace")).toBeInTheDocument();
        expect(screen.queryByText("Blue Song")).not.toBeInTheDocument();
    });

    it("saves selected songs, shows success toast, clears selection, navigates back and hides loading", async () => {
        loaderMusicsValue = [
            { id: 1, name: "Song A", description: "Artist A", selected: false },
            { id: 2, name: "Song B", description: "Artist B", selected: false },
        ];

        (groupService.putGroupPlaylistMusics as any).mockResolvedValueOnce(undefined);

        render(<AddSongsToPlaylistScreen />);

        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Song A/i }));
        await user.click(screen.getByRole("button", { name: /Song B/i }));
        await user.click(screen.getByRole("button", { name: "Adicionar (2)" }));

        expect(showMock).toHaveBeenCalledTimes(1);
        expect(groupService.putGroupPlaylistMusics).toHaveBeenCalledTimes(1);
        expect(groupService.putGroupPlaylistMusics).toHaveBeenCalledWith(10, 20, [1, 2]);

        await flush();

        expect(toastSuccessMock).toHaveBeenCalledWith(
            "Músicas adicionadas à playlist!"
        );
        expect(navigateMock).toHaveBeenCalledWith(-1);
        expect(hideMock).toHaveBeenCalledTimes(1);

        expect(screen.getByRole("button", { name: "Adicionar (0)" })).toBeDisabled();
    });

    it("shows error toast and hides loading when save fails", async () => {
        loaderMusicsValue = [
            { id: 1, name: "Song A", description: "Artist A", selected: false },
        ];

        (groupService.putGroupPlaylistMusics as any).mockRejectedValueOnce(
            new Error("fail")
        );

        render(<AddSongsToPlaylistScreen />);

        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Song A/i }));
        await user.click(screen.getByRole("button", { name: "Adicionar (1)" }));

        expect(showMock).toHaveBeenCalledTimes(1);
        expect(groupService.putGroupPlaylistMusics).toHaveBeenCalledWith(10, 20, [1]);

        await flush();

        expect(toastErrorMock).toHaveBeenCalledWith(
            "Erro ao adicionar músicas. Tente novamente."
        );
        expect(navigateMock).not.toHaveBeenCalled();
        expect(hideMock).toHaveBeenCalledTimes(1);
    });
});

describe("PlaylistAddSong.loader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls groupService.getGroupPlaylistMusicOptions with group id and playlist id", () => {
        const fakePromise = Promise.resolve([]);
        (groupService.getGroupPlaylistMusicOptions as any).mockReturnValueOnce(
            fakePromise
        );

        const result = loader({
            params: { id: "10", playlistId: "20" },
        } as any);

        expect(groupService.getGroupPlaylistMusicOptions).toHaveBeenCalledTimes(1);
        expect(groupService.getGroupPlaylistMusicOptions).toHaveBeenCalledWith(10, 20);
        expect(result.musics).toBe(fakePromise);
    });
});