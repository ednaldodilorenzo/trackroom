import type { Group } from "@/model";
import {
  Await,
  Outlet,
  useLoaderData,
  useNavigate,
  //useNavigate,
  useOutletContext,
  type LoaderFunctionArgs,
} from "react-router-dom";
import groupService from "./group.service";
import { useGroupContext } from "./GroupContext";
import { Suspense } from "react";
import { Button } from "@/components";
import { BsFillPencilFill } from "react-icons/bs";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";

export default function GroupData() {
  const { group } = useLoaderData<{ group: Promise<Group> }>();
  const { setCurrentGroup } = useGroupContext();
  const navigate = useNavigate();
  const ctx = useOutletContext<any>();

  return  <Suspense>
    <Await resolve={group}>
      {loadedGroup => {
        useHeaderConfig({
          title: loadedGroup.name,
          titleLink: `/groups/${loadedGroup.id}/info`,
          enableBackButton: true,
          backButtonLink: "/",
          children: loadedGroup.isAdmin && (
            <Button onClick={() => navigate(`/groups/${loadedGroup.id}/edit`)}>
              <BsFillPencilFill />
            </Button>
          ),
          hidden: false,
        });

        setCurrentGroup(loadedGroup);

        return <Outlet context={ctx} />;
      }}
    </Await>
  </Suspense>
}

export const groupLoader = ({
  params,
}: LoaderFunctionArgs): { group: Promise<Group> } => {
  const id = params.id;
  return {
    group: groupService.findById(id!!),
  };
};
