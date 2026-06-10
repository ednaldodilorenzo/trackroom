import { Suspense, useState } from "react";
import {
  Await,
  useLoaderData,
  useNavigate,
  useParams,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { BiPlus } from "react-icons/bi";

import { TextField, Button } from "@/components";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Music } from "@/model";
import type { Page } from "@/model/Page";
import groupService from "@/modules/group/group.service";
import {
  useAudioPlayerContext,
} from "@/components/player/AudioPlayerContext";
import { useGroupContext } from "../group/GroupContext";
import TrackList from "./track/TraskList";
import "./MusicList.css";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";

type MusicListLoaderData = {
  musics: Promise<Page<Music>>;
};

export default function MusicList() {
  const { musics } = useLoaderData() as MusicListLoaderData;
  const { handlePlay } = useAudioPlayerContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentGroup } = useGroupContext();
  const [search, setSearch] = useState("");

  const isAdmin = Boolean(currentGroup?.isAdmin);

  useHeaderConfig({
    backButtonLink: `/groups/${id}/home`,
  }, false);

  function goToAddMusic() {
    navigate(`/groups/${id}/musics/add`, {
      state: {
        returnTo: `/groups/${id}/musics`,
      },
    });
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="bg-white rounded-3xl shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="section-title mb-0">Músicas</h2>
            <p className="text-sm text-gray-500 mt-1">
              Todas as músicas disponíveis neste grupo
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={goToAddMusic}
              className="text-sm cursor-pointer hover:text-violet-800 text-violet-700 font-semibold flex items-center gap-1 shrink-0"
            >
              <BiPlus size={20} /> Adicionar
            </button>
          )}
        </div>

        <TextField
          endIcon={<BsSearch />}
          onChange={(event) => setSearch(event.target.value)}
          value={search}
          label=""
          name="searchMusic"
          placeholder="Buscar música"
        />
      </section>

      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={musics}>
          {(loadedMusics: Page<Music>) => {
            const normalizedSearch = search.trim().toLowerCase();
            const filteredMusics = normalizedSearch
              ? loadedMusics.content.filter((music) =>
                music.name.toLowerCase().includes(normalizedSearch) ||
                (music.category?.toLowerCase().includes(normalizedSearch) ?? false)
              )
              : loadedMusics.content;

            if (loadedMusics.content.length === 0) {
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

            if (filteredMusics.length === 0) {
              return (
                <EmptyState
                  icon="⌕"
                  title="Nenhuma música encontrada"
                  description="Tente buscar por outro nome ou limpe o campo de pesquisa."
                />
              );
            }

            return (
              <div className="bg-white px-2 pb-4 rounded-3xl shadow-sm overflow-hidden">
                <TrackList>
                  {filteredMusics.map((music: Music) => (
                    <TrackList.Item
                      key={music.id}
                      music={music}
                      handlePlay={handlePlay}
                    />
                  ))}
                </TrackList>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
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
    <div className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 mx-auto flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>

      <h3 className="font-bold text-lg text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 mb-5">{description}</p>

      {action}
    </div>
  );
}

export const musicsLoader = ({
  params,
}: LoaderFunctionArgs): MusicListLoaderData => {
  const id = Number(params.id);

  return {
    musics: groupService.getMusics(id, { unpaged: true }),
  };
};