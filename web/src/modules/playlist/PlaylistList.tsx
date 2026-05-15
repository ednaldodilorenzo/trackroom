import { Suspense, useMemo, useState } from "react";
import { Await, useLoaderData, useNavigate, useParams, type ActionFunctionArgs } from "react-router-dom";
import groupService from "../group/group.service";
import type { Playlist } from "@/model/Playlist";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Page } from "@/model/Page";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";

export default function PlaylistList() {
  const [query, setQuery] = useState("");

  const navigate = useNavigate();
  const { id: groupId } = useParams();
  const { playlists } = useLoaderData<{ playlists: Page<Playlist> }>();

  useHeaderConfig({
    backButtonLink: `/groups/${groupId}/home`,
  }, false);

  function handleCreatePlaylist() {
    // React Router example:
    navigate(`/groups/${groupId}/playlists/add`, {
      state: {
        returnTo: `/groups/${groupId}/playlists`,
      },
    });
  }

  function handleOpenPlaylist(playlistId: number) {
    // React Router example:
    navigate(`/groups/${groupId}/playlists/${playlistId}`);
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <main className="space-y-5">
        <section className="bg-white rounded-3xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-xl">
              ♬
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg">Playlists do grupo</h2>
              <p className="text-sm text-gray-500">
                Crie sequências para louvor, vigília, missa ou encontros.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreatePlaylist}
            className="w-full h-12 rounded-2xl bg-violet-700 text-white font-bold shadow-md hover:bg-violet-800 transition"
          >
            + Nova playlist
          </button>
        </section>
        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={playlists}>
            {(resolvedPlaylists) => {
              const filteredPlaylists = useMemo(() => {
                const normalizedQuery = query.trim().toLowerCase();

                if (!normalizedQuery) return resolvedPlaylists.content;

                return resolvedPlaylists.content.filter((playlist) =>
                  playlist.title.toLowerCase().includes(normalizedQuery)
                );
              }, [query]);

              return (
                <>
                  {resolvedPlaylists.content.length > 0 && (
                    <div className="relative">
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar playlist"
                        className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 pr-11 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                      <span className="absolute right-4 top-3 text-gray-600 text-lg">⌕</span>
                    </div>
                  )}

                  {resolvedPlaylists.content.length === 0 ? (
                    <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
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
                    </section>
                  ) : filteredPlaylists.length === 0 ? (
                    <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center text-3xl mb-4">
                        ⌕
                      </div>

                      <h2 className="font-bold text-lg text-gray-900">Nenhuma playlist encontrada</h2>
                      <p className="text-sm text-gray-500 mt-2">
                        Tente buscar por outro nome.
                      </p>
                    </section>
                  ) : (
                    <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
                      {filteredPlaylists.map((playlist, index) => (
                        <button
                          key={playlist.id}
                          type="button"
                          onClick={() => handleOpenPlaylist(playlist.id!!)}
                          className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition ${index !== filteredPlaylists.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                        >
                          <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-xl shrink-0">
                            ♫
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 truncate">{playlist.title}</p>
                              {true && (
                                <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
                                  Fixada
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-500">
                              {playlist.musicCount} música{playlist.musicCount !== 1 ? "s" : ""}
                            </p>
                          </div>

                          <span className="text-gray-400 text-2xl leading-none">›</span>
                        </button>
                      ))}
                    </section>
                  )}
                </>)
            }}
          </Await>
        </Suspense>
      </main>
    </div>
  );
}

export async function loader({ params }: ActionFunctionArgs) {
  const { id } = params;
  const playlists = await groupService.getPlaylists(parseInt(id!!));
  return {
    playlists
  }
}


