import type { Page } from "@/model/Page";
import type { Playlist } from "@/model/Playlist";
import { startTransition, useOptimistic, useState } from "react";
import groupService from "@/modules/group/group.service";
import toast from "react-hot-toast";
import { BsStar, BsStarFill, BsTrash3Fill } from "react-icons/bs";

const MAX_STARRED_PLAYLISTS = 5;

export default function PlaylistListContent({
    playlists,
    query,
    groupId,
    handleOpenPlaylist,
    handleCreatePlaylist,
}: {
    playlists: Page<Playlist>;
    query: string;
    groupId: string;
    handleOpenPlaylist: (id: number) => void;
    handleCreatePlaylist: () => void;
}) {
    const [playlistState, setPlaylistState] = useState(playlists.content);
    const [starredCount, setStarredCount] = useState(
        playlists.content.filter((playlist) => playlist.starred).length
    );

    const [optimisticPlaylists, toggleOptimisticPlaylist] = useOptimistic(
        playlistState,
        (currentList: Playlist[], playlistId: number) => {
            return currentList.map((playlist) =>
                playlist.id === playlistId
                    ? { ...playlist, starred: !playlist.starred }
                    : playlist
            );
        }
    );

    function handleToggleStar(playlist: Playlist) {
        const playlistId = playlist.id!;
        const isCurrentlyStarred = Boolean(playlist.starred);

        if (!isCurrentlyStarred && starredCount >= MAX_STARRED_PLAYLISTS) {
            toast.error("Você pode destacar no máximo 5 playlists na tela inicial.");
            return;
        }
        const nextStarred = !isCurrentlyStarred;

        startTransition(() => {
            toggleOptimisticPlaylist(playlistId);
        });

        groupService.patchGroupPlaylist(Number(groupId), playlistId, { starred: nextStarred })
            .then(() => {
                setPlaylistState((current) =>
                    current.map((item) =>
                        item.id === playlistId
                            ? { ...item, starred: nextStarred }
                            : item
                    )
                );
                setStarredCount((current) =>
                    current + (nextStarred ? 1 : -1)
                );
            })
            .catch(() => {
                // Revert the optimistic update in case of an error
                toast.error("Não foi possível atualizar o status da playlist. Tente novamente.");
            });
    }

    function handleDeletePlaylist(playlist: Playlist) {
        if (confirm("Tem certeza que deseja excluir esta playlist?")) {
            groupService.deleteGroupPlaylist(Number(groupId), playlist.id!)
                .then(() => {
                    setPlaylistState((current) =>
                        current.filter((item) => item.id !== playlist.id!)
                    );
                    playlist.starred && setStarredCount((current) => current - 1);
                    toast.success("Playlist apagada com sucesso.");
                })
                .catch(() => {
                    toast.error("Não foi possível deletar a playlist. Tente novamente.");
                });
        }
    }

    const normalizedQuery = query.trim().toLowerCase();

    const filteredPlaylists = normalizedQuery
        ? optimisticPlaylists.filter((playlist) =>
            playlist.title.toLowerCase().includes(normalizedQuery)
        )
        : optimisticPlaylists;

    return (
        <>
            <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <span className="text-xs text-violet-700 font-semibold px-4">
                    {starredCount}/5 destacadas
                </span>
                {optimisticPlaylists.length === 0 ? (<section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 mx-auto flex items-center justify-center text-3xl mb-4">
                        ♬
                    </div>

                    <h2 className="font-bold text-lg text-gray-900">Nenhuma playlist criada</h2>
                    <p className="text-sm text-gray-500 mt-2 mb-5">
                        Crie a primeira playlist para organizar as músicas que serão tocadas pelo grupo.
                    </p>

                    <button
                        type="button"
                        onClick={handleCreatePlaylist}
                        className="h-12 px-5 rounded-2xl bg-violet-700 text-white font-bold shadow-md hover:bg-violet-800 transition"
                    >
                        + Criar primeira playlist
                    </button>
                </section>) : filteredPlaylists.length !== 0 ? filteredPlaylists.map((playlist) => (
                    <div key={playlist.id} className="w-full flex items-center gap-3 px-4 py-4">
                        <button
                            type="button"
                            onClick={() => handleToggleStar(playlist)}
                            className="text-yellow-500 cursor-pointer"
                        >
                            {playlist.starred ? <BsStarFill size={20} /> : <BsStar size={20} />}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleOpenPlaylist(playlist.id!)}
                            className="flex-1 min-w-0 text-left"
                        >
                            <p className="font-bold text-gray-900 truncate">{playlist.title}</p>
                            <p className="text-sm text-gray-500">
                                {playlist.musicCount} música{playlist.musicCount !== 1 ? "s" : ""}
                            </p>
                        </button>

                        <button type="button" className="text-gray-400 cursor-pointer" onClick={() => handleDeletePlaylist(playlist)}>
                            <BsTrash3Fill size={18} />
                        </button>
                    </div>
                )) : (<section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center text-3xl mb-4">
                        ⌕
                    </div>

                    <h2 className="font-bold text-lg text-gray-900">Nenhuma playlist encontrada</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Tente buscar por outro nome.
                    </p>
                </section>)}
            </section>
        </>
    );
}