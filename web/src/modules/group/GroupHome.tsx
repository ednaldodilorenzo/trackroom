import { Suspense } from "react";
import { Link, type LoaderFunctionArgs } from "react-router-dom";
import { Await, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { BiChevronRight, BiPlus } from "react-icons/bi";

import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import Button from "@/components/button/Button";
import TrackList from "@/modules/music/track/TraskList";
import type { Music, Playlist } from "@/model";
import type { Page } from "@/model/Page";
import { musicService } from "@/modules/music/music.service";
import groupService from "@/modules/group/group.service";
import {
  useAudioPlayerContext,
  type Track,
} from "@/components/player/AudioPlayerContext";
import { useGroupContext } from "../group/GroupContext";
import "@/modules/music/MusicList.css";

type GroupHomeLoaderData = {
  musics: Promise<Page<Music>>;
  playlists: Promise<Page<Playlist>>;
};

const PREVIEW_LIMIT = 5;

export default function GroupHome() {
  const { musics, playlists } = useLoaderData() as GroupHomeLoaderData;
  const { setCurrentTrack, setIsPlaying } = useAudioPlayerContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentGroup } = useGroupContext();

  const isAdmin = Boolean(currentGroup?.isAdmin);

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

  function goToCreatePlaylist() {
    navigate(`/groups/${id}/playlists/add`);
  }

  function goToAddMusic() {
    navigate(`/groups/${id}/musics/add`);
  }

  function goToPlaylist(playlistId: number | string | undefined) {
    if (!playlistId) return;
    navigate(`/groups/${id}/playlists/${playlistId}`);
  }

  return (
    <div className="space-y-8 pb-8">
      <section>
        <SectionHeader
          title="Playlists"
          description="Sequências organizadas para momentos do grupo"
        />

        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={playlists}>
            {(loadedPlaylists: Page<Playlist>) => {
              const hasPlaylists = loadedPlaylists.content.length > 0;
              const shouldShowViewAll =
                Number(loadedPlaylists.totalElements ?? 0) > PREVIEW_LIMIT;
              const shouldShowAddPlaylist = isAdmin && !shouldShowViewAll;

              if (!hasPlaylists) {
                return (
                  <EmptyState
                    icon="♬"
                    title="Nenhuma playlist criada"
                    description="Crie playlists para organizar músicas por louvor, vigília, missa ou encontro."
                    action={
                      isAdmin ? (
                        <Button onClick={goToCreatePlaylist}>
                          <span className="inline-flex items-center gap-1">
                            <BiPlus size={18} /> Criar playlist
                          </span>
                        </Button>
                      ) : null
                    }
                  />
                );
              }

              return (
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                  {loadedPlaylists.content.map((playlist: Playlist, index) => (
                    <PlaylistRow
                      key={playlist.id}
                      playlist={playlist}
                      isLast={
                        index === loadedPlaylists.content.length - 1 &&
                        !shouldShowViewAll &&
                        !shouldShowAddPlaylist
                      }
                      onClick={() => goToPlaylist(playlist.id)}
                    />
                  ))}

                  {shouldShowAddPlaylist && (
                    <InlineAddAction
                      label="Criar nova playlist"
                      onClick={goToCreatePlaylist}
                    />
                  )}

                  {shouldShowViewAll && (
                    <ViewAllLink
                      to={`/groups/${id}/playlists`}
                      label="Ver todas as playlists"
                    />
                  )}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </section>

      <section>
        <SectionHeader
          title="Músicas"
          description="Prévia das músicas disponíveis neste grupo"
        />

        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={musics}>
            {(loadedMusics: Page<Music>) => {
              const hasMusics = loadedMusics.content.length > 0;
              const shouldShowViewAll =
                Number(loadedMusics.totalElements ?? 0) > PREVIEW_LIMIT;
              const shouldShowAddMusic = isAdmin && !shouldShowViewAll;

              if (!hasMusics) {
                return (
                  <EmptyState
                    icon="♪"
                    title="Nenhuma música adicionada"
                    description="Adicione músicas ao grupo para que os membros possam solicitar ou visualizar cifras."
                    action={
                      isAdmin ? (
                        <Button onClick={goToAddMusic}>
                          <span className="inline-flex items-center gap-1">
                            <BiPlus size={18} /> Adicionar música
                          </span>
                        </Button>
                      ) : null
                    }
                  />
                );
              }

              return (
                <div className="bg-white pb-4 px-2 rounded-3xl shadow-sm overflow-hidden">
                  <TrackList>
                    {loadedMusics.content.map((music: Music) => (
                      <TrackList.Item
                        key={music.id}
                        music={music}
                        handlePlay={handlePlay}
                      />
                    ))}
                  </TrackList>

                  {shouldShowAddMusic && (
                    <InlineAddAction
                      label="Adicionar nova música"
                      onClick={goToAddMusic}
                    />
                  )}

                  {shouldShowViewAll && (
                    <ViewAllLink
                      to={`/groups/${id}/musics`}
                      label="Ver todas as músicas"
                    />
                  )}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="section-title mb-0">{title}</h2>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}

function PlaylistRow({
  playlist,
  isLast,
  onClick,
}: {
  playlist: Playlist;
  isLast: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-xl shrink-0">
        ♫
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-900 truncate">{playlist.title}</p>
        </div>

        <p className="text-sm text-gray-500">
          {playlist.musicCount ?? 0} música{playlist.musicCount !== 1 ? "s" : ""}
        </p>
      </div>

      <BiChevronRight size={24} className="text-gray-400 shrink-0" />
    </button>
  );
}

function InlineAddAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-4 border-t border-gray-100 text-violet-700 font-semibold flex items-center justify-center gap-2 hover:bg-violet-50 transition"
    >
      <span className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
        <BiPlus size={22} />
      </span>
      {label}
    </button>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm px-4 py-4 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 mx-auto flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>

      <h3 className="font-bold text-lg text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 mb-2">{description}</p>

      {action}
    </div>
  );
}

function ViewAllLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="w-full px-4 py-3 text-sm text-violet-700 font-semibold flex items-center justify-center gap-1 hover:bg-violet-50 border-t border-gray-100"
    >
      {label}
      <BiChevronRight size={20} />
    </Link>
  );
}

export const loader = ({
  params,
}: LoaderFunctionArgs): GroupHomeLoaderData => {
  const id = Number(params.id);

  return {
    musics: groupService.getMusics(id, { page: 0, size: PREVIEW_LIMIT }),
    playlists: groupService.getPlaylists(id, { page: 0, size: PREVIEW_LIMIT }),
  };
};
