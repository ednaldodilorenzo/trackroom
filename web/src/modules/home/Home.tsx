import { Suspense, useEffect } from "react";
import { TrackCard, /*TrackItem,*/ Button, FallbackOverlay } from "@/components";
import type { Group } from "@/model";
import "./Home.css";
import {
  useNavigate,
  Await,
  useLoaderData,
} from "react-router-dom"; // useLoaderData not used in this snippet
import homeService from "./home.service";
import { useHeader } from "@/hooks/useHeader";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";

export default function Home() {

  const navigate = useNavigate();

  const { groups } = useLoaderData();
  const { setHeaderConfig } = useHeader();
  console.log("Home useHeader got:", { setHeaderConfig });

  useHeaderConfig({
    title: "Minha Biblioteca",
    enableBackButton: false,
  });

  return (
    <>
      <h2 className="section-title">Meus Grupos</h2>

      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={groups}>
          {(loadedGroups) =>
            loadedGroups.length > 0 ? (
              <div className="track-card-list">
                {loadedGroups.map((item: Group) => (
                  <TrackCard data-testid="track-card" key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div>Nenhum grupo cadastrado...</div>
            )
          }
        </Await>
      </Suspense>

      <Button
        className="suspended-button"
        onClick={() => navigate("/groups/add")}
      >
        + Novo Grupo
      </Button>
    </>
  );
}

export const groupsLoader = (): { groups: Promise<Group[]> } => ({
  groups: homeService.getGroups(),
});
