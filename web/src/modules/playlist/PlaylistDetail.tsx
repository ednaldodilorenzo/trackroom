import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const playlist = {
  id: 1,
  name: "Louvor",
  description: "Músicas separadas para o momento de louvor do grupo.",
};

const playlistSongs = [
  { id: 1, title: "Aprendiz", artist: "Banda XLI ECC Neves" },
  { id: 2, title: "Em tua Presença", artist: "Banda XLI ECC Neves" },
  { id: 3, title: "Sonda-me", artist: "Banda" },
  { id: 4, title: "Consagração", artist: "Banda" },
];

export default function PlaylistDetailScreen() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { id: groupId } = useParams();
  const { playlistId } = useParams();

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return playlistSongs;

    return playlistSongs.filter((song) =>
      song.title.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

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
        <section className="rounded-3xl bg-violet-700 text-white p-5 shadow-md">
          <p className="text-sm text-white/75">Playlist</p>
          <h2 className="text-2xl font-bold mt-1">{playlist.name}</h2>
          <p className="text-sm text-white/80 mt-2">{playlist.description}</p>

          <div className="flex items-center gap-2 mt-4 text-sm text-white/80">
            <span>{playlistSongs.length} música{playlistSongs.length !== 1 ? "s" : ""}</span>
            <span>•</span>
            <span>Grupo Banda XLI ECC Neves</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              type="button"
              onClick={handlePlayAll}
              className="h-11 rounded-2xl bg-white text-violet-700 font-bold shadow-sm hover:bg-violet-50 transition"
            >
              ▶ Tocar tudo
            </button>

            <button
              type="button"
              onClick={handleAddSongs}
              className="h-11 rounded-2xl bg-violet-600 border border-white/25 text-white font-bold hover:bg-violet-500 transition"
            >
              + Adicionar
            </button>
          </div>
        </section>

        {playlistSongs.length > 0 && (
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

        {playlistSongs.length === 0 ? (
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
              className="h-12 px-5 rounded-2xl bg-violet-700 text-white font-bold shadow-md hover:bg-violet-800 transition"
            >
              + Adicionar músicas
            </button>
          </section>
        ) : filteredSongs.length === 0 ? (
          <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center text-3xl mb-4">
              ⌕
            </div>

            <h2 className="font-bold text-lg text-gray-900">Nenhuma música encontrada</h2>
            <p className="text-sm text-gray-500 mt-2">Tente buscar por outro nome.</p>
          </section>
        ) : (
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

            {filteredSongs.map((song, index) => (
              <div
                key={song.id}
                className={`flex items-center gap-3 px-4 py-4 ${
                  index !== filteredSongs.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <button
                  type="button"
                  className="w-10 h-10 rounded-full border-2 border-violet-700 text-violet-700 flex items-center justify-center shrink-0 font-bold"
                  aria-label={`Tocar ${song.title}`}
                >
                  ▶
                </button>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{song.title}</p>
                  <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRequestSong(song.id)}
                    className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-1 rounded-full"
                  >
                    Solicitar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenChord(song.id)}
                    className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full"
                  >
                    Cifra
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-violet-700 text-white px-8 py-3 shadow-2xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-5 mb-2">
            <button type="button">◀◀</button>
            <button type="button" className="text-2xl">▶</button>
            <button type="button">▶▶</button>
            <button type="button">🔀</button>
            <button type="button">↻</button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span>00:00</span>
            <div className="h-1 bg-white/90 rounded-full flex-1" />
            <span>00:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}