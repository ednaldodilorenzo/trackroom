import {
  Await,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { groupService } from "./group.service";
import { type User } from "@/model";
import { Suspense } from "react";
import { FallbackOverlay } from "@/components";

export default function GroupMembers() {
  const { users } = useLoaderData<{ users: Promise<User[]> }>();
  return (
    <>
      <h2 className="section-title">Membros</h2>
      <ul>
        <Suspense fallback={<FallbackOverlay />}>
          <Await resolve={users}>
            {(loadedUsers) => (
              <>
                {loadedUsers && loadedUsers.length > 0 ? (
                  loadedUsers.map((loadedUser) => <li>{loadedUser.name}</li>)
                ) : (
                  <li>Nada</li>
                )}
              </>
            )}
          </Await>
        </Suspense>
      </ul>
    </>
  );
}

export const loader = ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  return {
    users: groupService.findUsersByGroupId(id!!),
  };
};
