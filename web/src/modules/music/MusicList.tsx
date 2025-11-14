import { Suspense, useState, useRef } from "react";
import { type LoaderFunctionArgs } from "react-router-dom";
import Button from "@/components/button/Button";
import TrackItem from "@/components/trackitem/TrackItem";
import { useLoaderData, Await, useNavigate, useParams } from "react-router-dom";
import { groupService } from "@/modules/group/group.service";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Group } from "@/model";
import { musicService } from "./music.service";

export default function MusicList() {
  const { group } = useLoaderData<{ group: Promise<Group> }>();
  const [activeId, setActiveId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  async function handlePlay(id: number) {
    setActiveId(id);
    const url = await musicService.getFileUrl(id);

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
    }
  }

  return (
    <>
      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={group}>
          {(loadedGroup) => (
            <>
              <h2>{loadedGroup.name}</h2>
              <ul>
                {loadedGroup.musics?.map((item) => (
                  <TrackItem
                    active={activeId == item.id}
                    key={item.id}
                    onClick={handlePlay}
                    {...item}
                  />
                ))}
              </ul>
            </>
          )}
        </Await>
      </Suspense>
      <Button
        className="suspended-button"
        onClick={() => navigate(`/home/groups/${id}/musics/add`)}
      >
        + Nova Música
      </Button>
      {/* global audio player */}
      <audio ref={audioRef} controls style={{ width: "100%" }} />
    </>
  );
}

export const musicsLoader = ({
  params,
}: LoaderFunctionArgs): { group: Promise<Group> } => {
  const id = params.id;
  return {
    group: groupService.findByIdWithDependencies(id!!),
  };
};
