import { Suspense } from "react";
import { TrackCard, TrackItem, Button, FallbackOverlay } from "@/components";
import type { Group, Music } from "@/model";
import "./Home.css";
import { useNavigate, Await, useLoaderData } from "react-router-dom"; // useLoaderData not used in this snippet
import homeService from "./home.service";

export default function Home() {
  const allTracks: Music[] = [
    {
      name: "02 - What's My Name (Feat. Drake)",
      artist: "Rihanna",
      album: "Loud [2010]",
      duration: "4:56",
      avatar: "/img/rihanna1.jpg",
      active: true,
    },
    {
      name: "Fading",
      artist: "Rihanna",
      album: "Loud [2010]",
      duration: "4:56",
      avatar: "/img/rihanna2.jpg",
      active: true,
    },
    {
      name: "Hold My Hand (Duet With Akon)",
      artist: "Michael Jackson",
      album: "Michael [2010]",
      duration: "4:56",
      avatar: "/img/mj.jpg",
      active: true,
    },
    {
      name: "On the Floor (Feat. Pitbull)",
      artist: "Jennifer Lopez",
      album: "Love? [2011]",
      duration: "4:56",
      avatar: "/img/jlo.jpg",
      active: true,
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
          <TrackItem key={idx} {...track} />
        ))}
      </div>

      <Button
        className="suspended-button"
        onClick={() => navigate("/home/groups/add")}
      >
        + Novo Grupo
      </Button>
    </>
  );
}

export const groupsLoader = (): { groups: Promise<Group[]> } => ({
  groups: homeService.getGroups(),
});
