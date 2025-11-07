import { Suspense } from "react";
import { type LoaderFunctionArgs } from "react-router-dom";
import Button from "@/components/button/Button";
import TrackItem from "@/components/trackitem/TrackItem";
import { useLoaderData, Await, useNavigate, useParams } from "react-router-dom";
import { groupService } from "@/modules/group/group.service";
import FallbackOverlay from "@/components/fallbackoverlay/FallBackOverlay";
import type { Group } from "@/model";

export default function MusicList() {
  const { group } = useLoaderData<{ group: Promise<Group> }>();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <>
      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={group}>
          {(loadedGroup) => (
            <>
              <h2>{loadedGroup.name}</h2>
              <ul>
                {loadedGroup.musics?.map((item) => (
                  <TrackItem key={item.id} {...item} />
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
