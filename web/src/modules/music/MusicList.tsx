import { Suspense, useMemo, useState } from "react";
import { TextField, Button } from "@/components";
import { useLoaderData, Await, useNavigate, useParams, type LoaderFunctionArgs } from "react-router-dom";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Music } from "@/model";
import { musicService } from "./music.service";
import groupService from "@/modules/group/group.service";
import {
  useAudioPlayerContext,
  type Track,
} from "@/components/player/AudioPlayerContext";
import "./MusicList.css";
import { useGroupContext } from "../group/GroupContext";
import { BsSearch } from "react-icons/bs";
import type { Page } from "@/model/Page";
import TrackList from "./track/TraskList";


export default function MusicList() {
  const { musics } = useLoaderData<{ musics: Promise<Page<Music>> }>();
  const { setCurrentTrack, setIsPlaying } =
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
      <TextField endIcon={<BsSearch />} onChange={(e) => setSearch(e.target.value)} value={search} label="" name="searchMusic" />
      <h2 className="section-title">Músicas</h2>
      {currentGroup.isAdmin && (
        <div className="my-6">
          <Button className="me-2" onClick={() => navigate(`/groups/${id}/musics/add`)}>+</Button> Adicionar uma música
        </div>
      )}
      <TrackList>
        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={musics}>
            {loadedMusics => {
              const filteredMusics = useMemo(() => {
                if (!search.trim()) return loadedMusics.content;

                return loadedMusics.content.filter((music) =>
                  music.name.toLowerCase().includes(search.toLowerCase())
                );
              }, [loadedMusics, search]);

              return (
                <>
                  {filteredMusics.length > 0 ? (
                    filteredMusics.map((item: Music) => (
                      <TrackList.Item key={item.id} music={item} handlePlay={handlePlay} />
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
      </TrackList>
    </>
  );
}

export const musicsLoader = ({
  params,
}: LoaderFunctionArgs): { musics: Promise<Page<Music>> } => {
  const id = params.id;
  console.log("Loading musics for group id:", id);
  return {
    musics: groupService.getMusics(parseInt(id!!)),
  };
};
