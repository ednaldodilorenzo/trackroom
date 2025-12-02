import { Suspense, useEffect, useState } from "react";
import { useOutletContext, type LoaderFunctionArgs } from "react-router-dom";
import Button from "@/components/button/Button";
import TrackItem from "@/components/trackitem/TrackItem";
import { useLoaderData, Await, useNavigate, useParams } from "react-router-dom";
import { groupService } from "@/modules/group/group.service";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Group, Music } from "@/model";
import { musicService } from "./music.service";
import {
  useAudioPlayerContext,
  type Track,
} from "@/components/player/AudioPlayerContext";
import "./MusicList.css";
import type { HeaderConfig } from "@/components/main/Header";

export default function MusicList() {
  const { group } = useLoaderData<{ group: Promise<Group> }>();
  const { setCurrentTrack, setIsPlaying, currentTrack } =
    useAudioPlayerContext();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const { id } = useParams();

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

  const { setHeaderConfig } = useOutletContext<{
    setHeaderConfig: (config: HeaderConfig) => void;
  }>();

  useEffect(() => {
    group.then((g) => {
      setHeaderConfig({
        title: g.name,
        enableBackButton: true,
        backButtonLink: "/home",
      });
      setIsAdmin(g.isAdmin ?? false);
    });
  }, []);

  return (
    <>
      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={group}>
          {(loadedGroup) => (
            <>
              {loadedGroup.musics && loadedGroup.musics.length > 0 ? (
                loadedGroup.musics?.map((item) => (
                  <div className="track-list">
                    <TrackItem
                      active={currentTrack.id === item.id}
                      key={item.id}
                      onClick={() => handlePlay(item)}
                      cipherLink={`/home/groups/${id}/musics/${item.id}/cipher`}
                      {...item}
                    />
                  </div>
                ))
              ) : (
                <div className="track-list">
                  <h2>Nenhuma música adicionada...</h2>
                </div>
              )}
            </>
          )}
        </Await>
      </Suspense>
      {isAdmin && (
        <Button
          className="suspended-button"
          onClick={() => navigate(`/home/groups/${id}/musics/add`)}
        >
          + Nova Música
        </Button>
      )}
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
