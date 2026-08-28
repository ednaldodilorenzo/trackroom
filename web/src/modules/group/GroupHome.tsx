import { Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Await, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { BiChevronRight, BiPlus } from "react-icons/bi";

import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import Button from "@/components/button/Button";
import TrackList from "@/modules/music/track/TraskList";
import type { Music, Playlist, JoinGroupRequest } from "@/model";
import type { Page } from "@/model/Page";
import groupService from "@/modules/group/group.service";
import {
  useAudioPlayerContext,
} from "@/components/player/AudioPlayerContext";
import { useGroupContext } from "../group/GroupContext";
import "@/modules/music/MusicList.css";
import toast from "react-hot-toast";
import { PREVIEW_LIMIT, type GroupHomeLoaderData } from "./GroupHome.loader";


const ACCESS_REQUEST_PREVIEW_LIMIT = 5;

export default function GroupHome() {
  const { musics, playlists } = useLoaderData() as GroupHomeLoaderData;
  const { handlePlay } = useAudioPlayerContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentGroup } = useGroupContext();

  const isAdmin = Boolean(currentGroup?.isAdmin);


  function goToAddMusic() {
    navigate(`/groups/${id}/musics/add`, {
      state: {
        returnTo: `/groups/${id}/home`,
      },
    });
  }

  function goToPlaylist(playlistId: number | string | undefined) {
    if (!playlistId) return;
    navigate(`/groups/${id}/playlists/${playlistId}`);
  }

  return (
    <div className="space-y-8 pb-8">
      <section>
        <SectionHeader
          title="Playlists em Destaque"
          description="Sequências organizadas para momentos do grupo"
        />

        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={playlists}>
            {(loadedPlaylists: Page<Playlist>) => {

              const shouldShowViewAll =
                Number(loadedPlaylists.totalElements ?? 0) > PREVIEW_LIMIT;
              const shouldShowAddPlaylist = isAdmin && !shouldShowViewAll;

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

                  {(
                    <ViewAllLink
                      to={`/groups/${id}/playlists`}
                      label="Gerenciar Playlists"
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
      {isAdmin && id && (
        <AccessRequestsPreview groupId={Number(id)} />
      )}
    </div>
  );
}

function AccessRequestsPreview({
  groupId,
}: {
  groupId: number;
}) {
  const [requests, setRequests] = useState<JoinGroupRequest[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      try {
        setLoading(true);

        const response =
          await groupService.getGroupAccessRequests(
            groupId,
            {
              page: 0,
              size: ACCESS_REQUEST_PREVIEW_LIMIT,
            }
          );

        if (!active) return;

        setRequests(response.content);
        setTotalElements(
          Number(response.totalElements ?? 0)
        );
      } catch (error) {
        if (!active) return;

        console.error(
          "Erro ao carregar solicitações:",
          error
        );

        toast.error(
          "Não foi possível carregar as solicitações."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      active = false;
    };
  }, [groupId]);

  async function handleAccept(
    request: JoinGroupRequest
  ) {
    if (!request.id) return;

    try {
      await groupService.grantGroupAccessRequest(
        groupId,
        Number(request.id)
      );

      setRequests((current) =>
        current.filter(
          (item) => item.id !== request.id
        )
      );

      setTotalElements((current) =>
        Math.max(0, current - 1)
      );

      toast.success(
        `Acesso concedido para ${request.user.name}`
      );
    } catch {
      toast.error(
        "Erro ao conceder acesso. Tente novamente."
      );
    }
  }

  async function handleReject(
    request: JoinGroupRequest
  ) {
    if (!request.id) return;

    try {
      await groupService.rejectGroupAccessRequest(
        groupId,
        Number(request.id)
      );

      setRequests((current) =>
        current.filter(
          (item) => item.id !== request.id
        )
      );

      setTotalElements((current) =>
        Math.max(0, current - 1)
      );

      toast.success(
        `Solicitação de ${request.user.name} recusada`
      );
    } catch {
      toast.error(
        "Erro ao recusar acesso. Tente novamente."
      );
    }
  }

  if (loading) {
    return <FallbackOverlay />;
  }

  return (
    <section>
      <SectionHeader
        title="Solicitações de acesso"
        description="Pessoas aguardando aprovação para entrar no grupo"
      />

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm px-4 py-5">
          <p className="text-sm text-gray-500 text-center">
            Nenhuma solicitação pendente.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {requests.map((request, index) => (
            <AccessRequestRow
              key={request.id}
              request={request}
              isLast={
                index === requests.length - 1 &&
                totalElements <=
                ACCESS_REQUEST_PREVIEW_LIMIT
              }
              onAccept={() =>
                handleAccept(request)
              }
              onReject={() =>
                handleReject(request)
              }
            />
          ))}

          {totalElements >
            ACCESS_REQUEST_PREVIEW_LIMIT && (
              <ViewAllLink
                to={`/groups/${groupId}/access-requests`}
                label={`Ver todas (${totalElements})`}
              />
            )}
        </div>
      )}
    </section>
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
      className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition ${!isLast ? "border-b border-gray-100" : ""
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
      className="w-full cursor-pointer px-4 py-4 border-t border-gray-100 text-violet-700 font-semibold flex items-center justify-center gap-2 hover:bg-violet-50 transition"
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

function AccessRequestRow({
  request,
  isLast,
  onAccept,
  onReject
}: {
  request: JoinGroupRequest;
  isLast: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className={`px-4 py-4 ${!isLast ? "border-b border-gray-100" : ""
        }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold shrink-0">
          {request.user.name
            ?.trim()
            .charAt(0)
            .toUpperCase() || "?"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">
            {request.user.name}
          </p>

          <p className="text-sm text-gray-500">
            Solicitou entrada no grupo
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={onReject}
            className="h-9 px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Recusar
          </button>

          <button
            type="button"
            onClick={onAccept}
            className="h-9 px-4 rounded-xl bg-violet-700 text-white text-sm font-semibold hover:bg-violet-800 cursor-pointer"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
