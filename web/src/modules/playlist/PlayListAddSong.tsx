import { Suspense, useEffect, useMemo, useState } from "react";
import { Await, useLoaderData, useNavigate, useParams, type LoaderFunctionArgs } from "react-router-dom";
import groupService from "../group/group.service";
import type { Music } from "@/model/Music";
import toast from "react-hot-toast";
import { useLoading } from "@/hooks/useLoading";
import { FallbackOverlay } from "@/components";

export default function AddSongsToPlaylistScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const { musics } = useLoaderData<{ musics: Promise<Music[]> }>();
  const { id, playlistId } = useParams();
  const navigate = useNavigate();
  const { show, hide } = useLoading();

  function toggleSong(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleSave() {
    show();
    groupService.putGroupPlaylistMusics(
      Number(id),
      Number(playlistId),
      selected
    ).then(() => {
      toast.success("Músicas adicionadas à playlist!");
      setSelected([]);
      navigate(-1);
    }).catch(() => {
      toast.error("Erro ao adicionar músicas. Tente novamente.");
    }).finally(() => {
      hide();
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <main className="space-y-5">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar música"
            className="w-full h-12 rounded-xl border border-gray-300 px-4 pr-10 focus:ring-2 focus:ring-violet-500 outline-none"
          />
          <span className="absolute right-3 top-3">⌕</span>
        </div>

        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={musics}>
            {(resolvedMusics) => {

              const filteredSongs = useMemo(() => {
                const q = query.toLowerCase();
                return resolvedMusics.filter((s: Music) => s.name.toLowerCase().includes(q));
              }, [query]);

              useEffect(() => {
                setSelected((_) => [...resolvedMusics.filter((s) => s.selected).map((s) => s.id!!)]);
              }, []);

              return (<>
                {selected.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-sm font-semibold mb-2">
                      {selected.length} selecionada{selected.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.map((id) => {
                        const song = resolvedMusics.find((s) => s.id === id);
                        return (
                          <span
                            key={id}
                            data-testid={`list-music-name-${song?.id}`}
                            className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm"
                          >
                            {song?.name ?? "Música #" + id}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-2xl shadow-sm divide-y">
                  {filteredSongs.map((song: Music) => {
                    const isSelected = selected.includes(song.id!!);

                    return (
                      <button
                        key={song.id}
                        onClick={() => toggleSong(song.id!!)}
                        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50"
                      >
                        <div
                          className={`w-6 h-6 rounded-md border flex items-center justify-center ${isSelected
                            ? "bg-violet-700 text-white"
                            : "border-gray-300"
                            }`}
                        >
                          {isSelected && "✓"}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold">{song.name}</p>
                          <p className="text-sm text-gray-500">{song.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
              );
            }}
          </Await>
        </Suspense>

      </main>

      <div className="bg-white border-t p-4">
        <button
          onClick={handleSave}
          disabled={selected.length === 0}
          className={`w-full h-12 rounded-2xl font-bold ${selected.length > 0
            ? "bg-violet-700 text-white"
            : "bg-gray-200 text-gray-400"
            }`}
        >
          Adicionar ({selected.length})
        </button>
      </div>
    </div>
  );
}

export function loader({ params }: LoaderFunctionArgs) {
  const { id, playlistId } = params;
  // API: fetch playlist songs and available songs to add
  return {
    musics: groupService.getGroupPlaylistMusicOptions(Number(id), Number(playlistId)),
  };
}
