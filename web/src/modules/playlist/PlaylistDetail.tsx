import { Suspense, useMemo, useState } from "react";
import {
  Await,
  useLoaderData,
  useNavigate,
  useParams,
  type LoaderFunctionArgs,
} from "react-router-dom";
import TrackList from "../music/track/TraskList";
import { useAudioPlayerContext } from "@/components/player/AudioPlayerContext";
import groupService from "../group/group.service";
import type { Playlist } from "@/model/Playlist";
import { FallbackOverlay } from "@/components";
import { useGroupContext } from "../group/GroupContext";
import type { Group, Music } from "@/model";
import { BsCheck2, BsPencilFill } from "react-icons/bs";

// ─── Types ───────────────────────────────────────────────────────────────────

type LoaderData = {
  data: Promise<[PromiseSettledResult<Playlist>, PromiseSettledResult<Music[]>]>;
};

// ─── Loader ──────────────────────────────────────────────────────────────────

export function loader({ params }: LoaderFunctionArgs) {
  const { id, playlistId } = params;

  return {
    data: Promise.allSettled([
      groupService.getGroupPlaylist(parseInt(id!), parseInt(playlistId!)),
      groupService.getGroupPlaylistMusics(parseInt(id!), parseInt(playlistId!)),
    ]),
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PlaylistHeader({
  playlist,
  musics,
  group,
  onPlayAll,
  onAddSongs,
}: {
  playlist: Playlist;
  musics: Music[];
  group?: Group;
  onPlayAll: () => void;
  onAddSongs: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(playlist.title);
  const { currentGroup } = useGroupContext();

  function handleSaveTitle() {
    groupService.patchGroupPlaylist(Number(currentGroup.id!), Number(playlist.id!), { title: editedTitle }).catch(() => {
      alert("Erro ao atualizar o título da playlist. Tente novamente.");
      setEditedTitle(playlist.title);
    }).finally(() => {
      setIsEditing(false);
    });  
  }

  return (
    <section className="rounded-3xl bg-violet-700 text-white p-5 shadow-md">
      <p className="text-sm text-white/75">Playlist</p>
      {isEditing ? (
        <div className="flex items-center gap-3 mt-1">
          <input className="text-2xl font-bold mt-1 border border-gray-300 px-4 pr-11 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
          <button className="cursor-pointer" onClick={handleSaveTitle}>
            <BsCheck2 />
          </button>
        </div>) : (<div className="flex items-center gap-3 mt-1">
          <h2 className="text-2xl font-bold mt-1">{editedTitle}</h2>
          <button className="cursor-pointer" onClick={() => setIsEditing(true)}>
            <BsPencilFill />
          </button>
        </div>)}
      <p className="text-sm text-white/80 mt-2">Playlist selecionada</p>

      <div className="flex items-center gap-2 mt-4 text-sm text-white/80">
        <span>
          {musics.length} música{musics.length !== 1 ? "s" : ""}
        </span>
        <span>•</span>
        <span>Grupo {group?.name}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          disabled={musics.length === 0}
          onClick={onPlayAll}
          className="h-11 rounded-2xl bg-white text-violet-700 font-bold shadow-sm hover:bg-violet-50 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          ▶ Tocar tudo
        </button>

        <button
          type="button"
          onClick={onAddSongs}
          className="h-11 rounded-2xl bg-violet-600 border border-white/25 text-white cursor-pointer font-bold hover:bg-violet-500 transition"
        >
          + Adicionar
        </button>
      </div>
    </section>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar nesta playlist"
        className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 pr-11 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
      />
      <span className="absolute right-4 top-3 text-gray-600 text-lg">⌕</span>
    </div>
  );
}

function EmptyPlaylist({ onAddSongs }: { onAddSongs: () => void }) {
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
        onClick={onAddSongs}
        className="h-12 px-5 rounded-2xl bg-violet-700 cursor-pointer text-white font-bold shadow-md hover:bg-violet-800 transition"
      >
        + Adicionar músicas
      </button>
    </section>
  );
}

function EmptySearchResult() {
  return (
    <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center text-3xl mb-4">
        ⌕
      </div>
      <h2 className="font-bold text-lg text-gray-900">
        Nenhuma música encontrada
      </h2>
      <p className="text-sm text-gray-500 mt-2">Tente buscar por outro nome.</p>
    </section>
  );
}

function PlaylistMusicsList({
  musics,
  onPlay,
  onAddSongs,
}: {
  musics: Music[];
  onPlay: (music: Music) => void;
  onAddSongs: () => void;
}) {
  return (
    <section className="bg-white rounded-3xl shadow-sm overflow-hidden pb-4">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-900">Músicas</h2>
        <button
          type="button"
          onClick={onAddSongs}
          className="text-sm font-bold text-violet-700 cursor-pointer hover:text-violet-500 transition"
        >
          + Adicionar
        </button>
      </div>
      <TrackList>
        <div className="px-4">
          {musics.map((song) => (
            <TrackList.Item
              key={song.id}
              music={{
                id: song.id,
                name: song.name,
                description: song.description,
                file: song.file,
                groupId: song.groupId,
              }}
              handlePlay={onPlay}
            />
          ))}
        </div>
      </TrackList>
    </section>
  );
}

// ─── Inner content component (hooks live here, after data is resolved) ────────

function PlaylistDetailContent({
  playlist,
  musics,
}: {
  playlist: Playlist | null;
  musics: Music[];
}) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { id: groupId, playlistId } = useParams();
  const { currentGroup } = useGroupContext();
  const { handlePlay } = useAudioPlayerContext();

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return musics;
    return musics.filter((song) =>
      song.name.toLowerCase().includes(normalizedQuery)
    );
  }, [query, musics]);

  function handleAddSongs() {
    navigate(`/groups/${groupId}/playlists/${playlistId}/add-songs`);
  }

  function handlePlayAll() {
    console.log("Tocar todas as músicas da playlist");
  }

  if (!playlist) {
    return (
      <p className="text-center text-gray-500 py-10">
        Erro ao carregar a playlist.
      </p>
    );
  }

  return (
    <>
      <PlaylistHeader
        playlist={playlist}
        musics={musics}
        group={currentGroup}
        onPlayAll={handlePlayAll}
        onAddSongs={handleAddSongs}
      />

      {musics.length > 0 && (
        <SearchInput value={query} onChange={setQuery} />
      )}

      {musics.length === 0 ? (
        <EmptyPlaylist onAddSongs={handleAddSongs} />
      ) : filteredSongs.length === 0 ? (
        <EmptySearchResult />
      ) : (
        <PlaylistMusicsList
          musics={filteredSongs}
          onPlay={handlePlay}
          onAddSongs={handleAddSongs}
        />
      )}
    </>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function PlaylistDetailScreen() {
  const { data } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <main className="space-y-5">
        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={data}>
            {(
              results: [
                PromiseSettledResult<Playlist>,
                PromiseSettledResult<Music[]>
              ]
            ) => {
              const playlist =
                results[0].status === "fulfilled" ? results[0].value : null;
              const musics =
                results[1].status === "fulfilled" ? results[1].value : [];

              return (
                <PlaylistDetailContent playlist={playlist} musics={musics} />
              );
            }}
          </Await>
        </Suspense>
      </main>
    </div>
  );
}