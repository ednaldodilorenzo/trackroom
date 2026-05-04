import React, { useMemo, useState } from "react";

const allSongs = [
  { id: 1, title: "Aprendiz", artist: "Banda" },
  { id: 2, title: "Em tua Presença", artist: "Banda" },
  { id: 3, title: "Sonda-me", artist: "Banda" },
  { id: 4, title: "Consagração", artist: "Banda" },
  { id: 5, title: "Noites Traiçoeiras", artist: "Banda" },
  { id: 6, title: "Alfa e Ômega", artist: "Banda" },
];

export default function AddSongsToPlaylistScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const filteredSongs = useMemo(() => {
    const q = query.toLowerCase();
    return allSongs.filter((s) => s.title.toLowerCase().includes(q));
  }, [query]);

  function toggleSong(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleSave() {
    console.log("Adicionar músicas", selected);
    // API: add songs to playlist
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

        {selected.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold mb-2">
              {selected.length} selecionada{selected.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.map((id) => {
                const song = allSongs.find((s) => s.id === id);
                return (
                  <span
                    key={id}
                    className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm"
                  >
                    Test
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {filteredSongs.map((song) => {
            const isSelected = selected.includes(song.id);

            return (
              <button
                key={song.id}
                onClick={() => toggleSong(song.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50"
              >
                <div
                  className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                    isSelected
                      ? "bg-violet-700 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && "✓"}
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{song.title}</p>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleSave}
          disabled={selected.length === 0}
          className={`w-full h-12 rounded-2xl font-bold ${
            selected.length > 0
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
