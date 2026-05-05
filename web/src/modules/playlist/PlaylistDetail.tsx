import { Suspense, useMemo, useState } from "react";
import { Await, useLoaderData, useNavigate, useParams, type LoaderFunctionArgs } from "react-router-dom";
import TrackList from "../music/track/TraskList";
import { useAudioPlayerContext } from "@/components/player/AudioPlayerContext";
import groupService from "../group/group.service";
import type { Playlist } from "@/model/Playlist";
import { FallbackOverlay } from "@/components";
import { useGroupContext } from "../group/GroupContext";
import type { Group, Music } from "@/model";

const playlistSongs = [
  { id: 1, title: "Aprendiz", artist: "Banda XLI ECC Neves" },
  { id: 2, title: "Em tua Presença", artist: "Banda XLI ECC Neves" },
  { id: 3, title: "Sonda-me", artist: "Banda" },
  { id: 4, title: "Consagração", artist: "Banda" },
];

function PlayListScreenTitle({ playlist, group, handlePlayAll, handleAddSongs }: { playlist: Playlist; group?: Group; handlePlayAll: () => void; handleAddSongs: () => void }) {
  return (
    <section className="rounded-3xl bg-violet-700 text-white p-5 shadow-md">
      <p className="text-sm text-white/75">Playlist</p>
      <h2 className="text-2xl font-bold mt-1">{playlist.title}</h2>
      <p className="text-sm text-white/80 mt-2">Playlist selecionada</p>

      <div className="flex items-center gap-2 mt-4 text-sm text-white/80">
        <span>{playlist.musics?.length} música{playlist.musics?.length !== 1 ? "s" : ""}</span>
        <span>•</span>
        <span>Grupo {group?.name}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          disabled={!playlist.musics || playlist.musics.length === 0}
          onClick={handlePlayAll}
          className="h-11 rounded-2xl bg-white text-violet-700 font-bold shadow-sm hover:bg-violet-50 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          ▶ Tocar tudo
        </button>

        <button
          type="button"
          onClick={handleAddSongs}
          className="h-11 rounded-2xl bg-violet-600 border border-white/25 text-white cursor-pointer font-bold hover:bg-violet-500 transition"
        >
          + Adicionar
        </button>
      </div>
    </section>
  );
}

function EmptyPlaylistList({ handleAddSongs }: { handleAddSongs: () => void }) {
  return (
    <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 mx-auto flex items-center justify-center text-3xl mb-4">
        ♫
      </div>

      <h2 className="font-bold text-lg text-gray-900">Playlist vazia</h2>
      <p className="text-sm text-gray-500 mt-2 mb-5">
        Adicione músicas para começar a montar a sequência desta playlist.
      </p>

      <button
        type="button"
        onClick={handleAddSongs}
        className="h-12 px-5 rounded-2xl bg-violet-700 cursor-pointer text-white font-bold shadow-md hover:bg-violet-800 transition"
      >
        + Adicionar músicas
      </button>
    </section>
  )
}

function EmptySearchResult() {
  return (
    <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center text-3xl mb-4">
        ⌕
      </div>

      <h2 className="font-bold text-lg text-gray-900">Nenhuma música encontrada</h2>
      <p className="text-sm text-gray-500 mt-2">Tente buscar por outro nome.</p>
    </section>
  )
}

function PlaylistMusicsList({ playlist, handlePlay, handleAddSongs }: { playlist: Playlist; handlePlay: (music: Music) => void; handleAddSongs: () => void }) {
  return (
    <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-900">Músicas</h2>
        <button
          type="button"
          onClick={handleAddSongs}
          className="text-sm font-bold text-violet-700"
        >
          + Adicionar
        </button>
      </div>
      <TrackList>
        <div className="px-4">
          {playlist.musics && playlist.musics.map((song) => (
            <TrackList.Item key={song.id} music={{ id: song.id, name: song.name, description: song.description, file: song.file, groupId: song.groupId }} handlePlay={handlePlay} />
          ))}
        </div>
      </TrackList>
    </section>
  );
}

export default function PlaylistDetailScreen() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { playlist } = useLoaderData<{ playlist: Playlist }>();
  const { currentGroup } = useGroupContext();
  const { id: groupId } = useParams();
  const { playlistId } = useParams();
  const { handlePlay } =
    useAudioPlayerContext();

  function handleAddSongs() {
    // React Router example:
    navigate(`/groups/${groupId}/playlists/${playlistId}/add-songs`);
    console.log("Adicionar músicas à playlist");
  }

  function handlePlayAll() {
    console.log("Tocar todas as músicas da playlist");
  }

  function handleOpenChord(songId: number) {
    console.log("Ver cifra", songId);
  }

  function handleRequestSong(songId: number) {
    console.log("Solicitar música", songId);
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">

      <main className="space-y-5">
        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={playlist}>
            {resolvedPlaylist => {
              const filteredSongs = useMemo(() => {
                const normalizedQuery = query.trim().toLowerCase();

                if (!normalizedQuery) return playlistSongs;

                return resolvedPlaylist.musics?.filter((song) =>
                  song.name.toLowerCase().includes(normalizedQuery)
                );
              }, [query]);

              return (
                <>
                  <PlayListScreenTitle playlist={resolvedPlaylist} group={currentGroup} handlePlayAll={handlePlayAll} handleAddSongs={handleAddSongs} />

                  {resolvedPlaylist.musics && resolvedPlaylist.musics.length > 0 && (
                    <div className="relative">
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar nesta playlist"
                        className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 pr-11 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                      <span className="absolute right-4 top-3 text-gray-600 text-lg">⌕</span>
                    </div>
                  )}

                  {resolvedPlaylist.musics && resolvedPlaylist.musics.length === 0 ? (
                    <EmptyPlaylistList handleAddSongs={handleAddSongs} />
                  ) : filteredSongs!.length === 0 ? (
                    <EmptySearchResult />
                  ) : (
                    <PlaylistMusicsList playlist={resolvedPlaylist} handlePlay={handlePlay} handleAddSongs={handleAddSongs} />
                  )}
                </>)
            }}
          </Await>
        </Suspense>
      </main>
    </div>
  );
}

export function loader({ params }: LoaderFunctionArgs) {
  const { id, playlistId } = params;
  try {
    return { playlist: groupService.getGroupPlaylistWithMusics(parseInt(id!!), parseInt(playlistId!!)) };
  } catch (err) {
    console.error("Erro ao carregar playlist:", err);
    throw err;
  }

}