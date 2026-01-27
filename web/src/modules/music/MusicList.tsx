import { Suspense, useMemo, useState } from "react";
import { type LoaderFunctionArgs } from "react-router-dom";
import Button from "@/components/button/Button";
import { TextField } from "@/components";
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
import { BsSearch } from "react-icons/bs";

export default function MusicList() {
  const { musics } = useLoaderData<{ musics: Promise<Music[]> }>();
  const { setCurrentTrack, setIsPlaying, currentTrack } =
    useAudioPlayerContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentGroup } = useGroupContext();
  const [search, setSearch] = useState("");

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
      <TextField endIcon={<BsSearch />} onChange={(e) => setSearch(e.target.value)} value={search} label="" name="searchMusic" />
      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={musics}>
          {(loadedMusics) => {
            const filteredMusics = useMemo(() => {
              if (!search.trim()) return loadedMusics;

              return loadedMusics.filter((music) =>
                music.name.toLowerCase().includes(search.toLowerCase())
              );
            }, [loadedMusics, search]);

            return (
              <>
                {filteredMusics.length > 0 ? (
                  filteredMusics.map((item: Music) => (
                    <div className="track-list" key={item.id}>
                      <TrackItem
                        active={currentTrack.id === item.id}
                        onClick={() => handlePlay(item)}
                        cipherLink={`/groups/${id}/musics/${item.id}/cipher`}
                        {...item}
                      />
                    </div>
                  ))
                ) : (
                  <div className="track-list">
                    <h2>Nenhuma música encontrada...</h2>
                  </div>
                )}
              </>
            );
          }}
        </Await>
      </Suspense>
      {currentGroup.isAdmin && (
        <Button
          className="suspended-button"
          onClick={() => navigate(`/groups/${id}/musics/add`)}
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
