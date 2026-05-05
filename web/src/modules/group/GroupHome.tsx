import { Suspense } from "react";
import { Link, type LoaderFunctionArgs } from "react-router-dom";
import { useLoaderData, Await, useNavigate, useParams } from "react-router-dom";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Music, Playlist } from "@/model";
import { musicService } from "@/modules/music/music.service";
import groupService from "@/modules/group/group.service";
import {
  useAudioPlayerContext,
  type Track,
} from "@/components/player/AudioPlayerContext";
import "@/modules/music/MusicList.css";
import { useGroupContext } from "../group/GroupContext";
import type { Page } from "@/model/Page";
import { BiChevronRight } from "react-icons/bi";
import Button from "@/components/button/Button";
import TrackList from "@/modules/music/track/TraskList";

export default function GroupHome() {
  const { musics, playlists } = useLoaderData<{ musics: Promise<Page<Music>>; playlists: Promise<Page<Playlist>> }>();
  const { setCurrentTrack, setIsPlaying } =
    useAudioPlayerContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentGroup } = useGroupContext();

  async function handlePlay(music: Music) {
    const url = await musicService.getFileUrl(music.id!!);
    const track: Track = {
      id: music.id,
      title: music.name,
      src: url,
      author: music.description,
    };
    setCurrentTrack(track);
    setIsPlaying(true);
  }

  return (
    <>
      <section>
        <h2 className="section-title">Playlists</h2>
        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={playlists}>
            {(loadedPlaylists) => {
              return (
                <>
                  {(loadedPlaylists.totalElements!! <= 5 && currentGroup.isAdmin) && (<div className="my-6">
                    <Button className="me-2" onClick={() => navigate(`/groups/${id}/playlists/add`)}>+</Button> Criar Playlist
                  </div>)}
                  {
                    loadedPlaylists.content.length > 0 ?
                      (
                        <>
                          {loadedPlaylists.content.map((item: Playlist) => (
                            <button
                              key={item.id}
                              onClick={() => navigate(`/groups/${id}/playlists/${item.id}`)}
                              type="button"
                              className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition`}
                            >
                              <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-xl shrink-0">
                                ♫
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900 truncate">{item.title}</p>
                                  {true && (
                                    <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
                                      Fixada
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-gray-500">
                                  {item.musicCount} música{item.musicCount !== 1 ? "s" : ""}
                                </p>
                              </div>

                              <span className="text-gray-400 text-2xl leading-none">›</span>
                            </button>
                          ))}

                          {loadedPlaylists.totalElements!! > 5 && <Link to={`/groups/${id}/playlists`} className="p-2 cursor-pointer text-sm text-violet-700 font-semibold flex items-center">
                            Ver todas <BiChevronRight size={20} className="ml-1" />
                          </Link>}
                        </>
                      ) : (
                        <div>Nenhuma Playlist Criada</div>
                      )
                  }
                </>)
            }}
          </Await>
        </Suspense>
      </section>
      <section className="mt-8">
        <h2 className="section-title">Músicas</h2>
        <TrackList>
          <Suspense fallback={<FallbackOverlay />}>
            <Await resolve={musics}>
              {(loadedMusics) => {
                return (
                  <>
                    {loadedMusics.totalElements!! <= 5 && currentGroup.isAdmin && (
                      <div className="my-6">
                        <Button className="me-2" onClick={() => navigate(`/groups/${id}/musics/add`)}>+</Button> Adicionar Música
                      </div>
                    )}

                    {loadedMusics.content.length > 0 ? (
                      <>
                        {loadedMusics.content.map((item: Music) => (
                          <TrackList.Item
                            key={item.id}
                            music={item}
                            handlePlay={handlePlay}
                          />
                        ))}

                        {loadedMusics.totalElements!! > 5 && (
                          <Link to={`/groups/${id}/musics`} className="p-2 cursor-pointer text-sm text-violet-700 font-semibold flex items-center">
                            Ver todas <BiChevronRight size={20} className="ml-1" />
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <div>Nenhuma Música</div>
                      </>
                    )}
                  </>)
              }}
            </Await>
          </Suspense>
        </TrackList>
      </section>
    </>
  );
}

export const loader = ({
  params,
}: LoaderFunctionArgs): { musics: Promise<Page<Music>>; playlists: Promise<Page<Playlist>> } => {
  const id = params.id;

  return {
    musics: groupService.getMusics(parseInt(id!!), { page: 0, size: 5 }),
    playlists: groupService.getPlaylists(parseInt(id!!), { page: 0, size: 5 }),
  };
};
