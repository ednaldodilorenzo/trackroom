// src/modules/playlist/PlaylistList.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlaylistList, { loader } from "./PlaylistList";
import groupService from "../group/group.service";

const navigateMock = vi.fn();

let paramsValue: any = { id: "10" };
let loaderPlaylistsValue: any = { content: [] };

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
    );

    return {
        ...actual,
        useNavigate: () => navigateMock,
        useParams: () => paramsValue,
        useLoaderData: () => ({ playlists: loaderPlaylistsValue }),
        Await: ({ resolve, children }: any) => {
            void resolve;
            return children(loaderPlaylistsValue);
        },
    };
});

vi.mock("@/components/fallbackoverlay/FallBackOverlay", () => ({
    default: () => <div data-testid="fallback">Loading...</div>,
}));

vi.mock("../group/group.service", () => ({
    default: {
        getPlaylists: vi.fn(),
    },
}));

describe("<PlaylistList />", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        paramsValue = { id: "10" };
        loaderPlaylistsValue = { content: [] };
    });

    it("renders header and create button", () => {
        render(<PlaylistList />);

        expect(screen.getByText("Playlists do grupo")).toBeInTheDocument();
        expect(
            screen.getByText("Crie sequências para louvor, vigília, missa ou encontros.")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "+ Nova playlist" })
        ).toBeInTheDocument();
    });

    it("navigates to create playlist page when clicking '+ Nova playlist'", async () => {
        paramsValue = { id: "77" };

        render(<PlaylistList />);

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "+ Nova playlist" }));

        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith("/groups/77/playlists/add");
    });

    it("renders empty state when there are no playlists", () => {
        loaderPlaylistsValue = { content: [] };

        render(<PlaylistList />);

        expect(screen.getByText("Nenhuma playlist criada")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Crie a primeira playlist para organizar as músicas que serão tocadas pelo grupo."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "+ Criar primeira playlist" })
        ).toBeInTheDocument();

        expect(screen.queryByPlaceholderText("Buscar playlist")).not.toBeInTheDocument();
    });

    it("navigates to create playlist page from empty state button", async () => {
        paramsValue = { id: "55" };
        loaderPlaylistsValue = { content: [] };

        render(<PlaylistList />);

        const user = userEvent.setup();
        await user.click(
            screen.getByRole("button", { name: "+ Criar primeira playlist" })
        );

        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith("/groups/55/playlists/add");
    });

    it("renders playlists list when content is not empty", () => {
        loaderPlaylistsValue = {
            content: [
                { id: 1, title: "Louvor Domingo", musicCount: 3 },
                { id: 2, title: "Vigília", musicCount: 1 },
            ],
        };

        render(<PlaylistList />);

        expect(screen.getByPlaceholderText("Buscar playlist")).toBeInTheDocument();

        expect(screen.getByText("Louvor Domingo")).toBeInTheDocument();
        expect(screen.getByText("3 músicas")).toBeInTheDocument();

        expect(screen.getByText("Vigília")).toBeInTheDocument();
        expect(screen.getByText("1 música")).toBeInTheDocument();

        expect(screen.getAllByText("Fixada")).toHaveLength(2);
    });

    it("navigates to playlist detail when clicking a playlist", async () => {
        paramsValue = { id: "10" };
        loaderPlaylistsValue = {
            content: [{ id: 22, title: "Louvor Domingo", musicCount: 3 }],
        };

        render(<PlaylistList />);

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /Louvor Domingo/i }));

        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith("/groups/10/playlists/22");
    });

    it("filters playlists by search query", async () => {
        loaderPlaylistsValue = {
            content: [
                { id: 1, title: "Louvor Domingo", musicCount: 3 },
                { id: 2, title: "Vigília", musicCount: 1 },
                { id: 3, title: "Missa Jovem", musicCount: 5 },
            ],
        };

        render(<PlaylistList />);

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Buscar playlist"), "vig");

        expect(screen.getByText("Vigília")).toBeInTheDocument();
        expect(screen.queryByText("Louvor Domingo")).not.toBeInTheDocument();
        expect(screen.queryByText("Missa Jovem")).not.toBeInTheDocument();
    });

    it("renders empty search state when no playlist matches", async () => {
        loaderPlaylistsValue = {
            content: [
                { id: 1, title: "Louvor Domingo", musicCount: 3 },
                { id: 2, title: "Vigília", musicCount: 1 },
            ],
        };

        render(<PlaylistList />);

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Buscar playlist"), "xyz");

        expect(screen.getByText("Nenhuma playlist encontrada")).toBeInTheDocument();
        expect(screen.getByText("Tente buscar por outro nome.")).toBeInTheDocument();

        expect(screen.queryByText("Louvor Domingo")).not.toBeInTheDocument();
        expect(screen.queryByText("Vigília")).not.toBeInTheDocument();
    });
});

describe("PlaylistList.loader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls groupService.getPlaylists with params.id as number and returns playlists", async () => {
        const fakePage = {
            content: [{ id: 1, title: "Louvor", musicCount: 2 }],
        };

        (groupService.getPlaylists as any).mockResolvedValueOnce(fakePage);

        const result = await loader({
            params: { id: "123" },
        } as any);

        expect(groupService.getPlaylists).toHaveBeenCalledTimes(1);
        expect(groupService.getPlaylists).toHaveBeenCalledWith(123);

        expect(result).toEqual({
            playlists: fakePage,
        });
    });
});