import { Suspense } from "react";
import { type LoaderFunctionArgs } from "react-router-dom";
import Button from "@/components/button/Button";
import TrackItem from "@/components/trackitem/TrackItem";
import { useLoaderData, Await, useNavigate, useParams } from "react-router-dom";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Music } from "@/model";
import { musicService } from "./music.service";
import {
  useAudioPlayerContext,
  type Track,
} from "@/components/player/AudioPlayerContext";
import "./MusicList.css";
import { useGroupContext } from "../group/GroupContext";

export default function MusicList() {
  const { musics } = useLoaderData<{ musics: Promise<Music[]> }>();
  const { setCurrentTrack, setIsPlaying, currentTrack } =
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
      <h2 className="section-title">Músicas</h2>
      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={musics}>
          {(loadedMusics) => (
            <>
              {loadedMusics && loadedMusics.length > 0 ? (
                loadedMusics.map((item) => (
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
      {currentGroup.isAdmin && (
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
}: LoaderFunctionArgs): { musics: Promise<Music[]> } => {
  const id = params.id;
  return {
    musics: musicService.getAll({ groupId: id }),
  };
};
