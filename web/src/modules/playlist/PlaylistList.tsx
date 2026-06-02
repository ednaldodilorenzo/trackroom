import { Suspense, useState } from "react";
import { Await, useLoaderData, useNavigate, useParams, type ActionFunctionArgs } from "react-router-dom";
import groupService from "../group/group.service";
import type { Playlist } from "@/model/Playlist";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Page } from "@/model/Page";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";
import PlaylistListContent from "./PlaylistListContext";

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
            {(resolvedPlaylists) => (
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
                <PlaylistListContent
                  playlists={resolvedPlaylists}
                  query={query}
                  groupId={groupId!}
                  handleCreatePlaylist={handleCreatePlaylist}
                  handleOpenPlaylist={handleOpenPlaylist}
                />
              </>
            )}
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


