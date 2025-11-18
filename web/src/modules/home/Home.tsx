import { Suspense } from "react";
import { TrackCard, TrackItem, Button, FallbackOverlay } from "@/components";
import type { Group, Music } from "@/model";
import "./Home.css";
import { useNavigate, Await, useLoaderData } from "react-router-dom"; // useLoaderData not used in this snippet
import homeService from "./home.service";
import AudioPlayer from "@/components/player/AudioPlayer";

export default function Home() {
  const allTracks: Music[] = [
    {
      name: "02 - What's My Name (Feat. Drake)",
      description: "Rihanna",
      file: "Loud [2010]",
      groupId: 1,
    },
  ];

  const navigate = useNavigate();

  const { groups } = useLoaderData();

  return (
    <>
      <h2 className="section-title">Meus Grupos</h2>

      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={groups}>
          {(loadedGroups) => (
            <div className="track-card-list">
              {loadedGroups.map((item: Group) => (
                <TrackCard data-testid="track-card" key={item.id} {...item} />
              ))}
            </div>
          )}
        </Await>
      </Suspense>

      <h2 className="section-title">All Tracks</h2>
      <div className="track-list">
        {allTracks.map((track, idx) => (
          <TrackItem
            active={false}
            onClick={function (id: number): void {
              throw new Error("Function not implemented.");
            }}
            key={idx}
            {...track}
          />
        ))}
      </div>

      <Button
        className="suspended-button"
        onClick={() => navigate("/home/groups/add")}
      >
        + Novo Grupo
      </Button>
      <AudioPlayer />
    </>
  );
}

export const groupsLoader = (): { groups: Promise<Group[]> } => ({
  groups: homeService.getGroups(),
});
