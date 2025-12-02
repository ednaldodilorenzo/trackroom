import type { Group } from "@/model";
import {
  Outlet,
  useLoaderData,
  useOutletContext,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { groupService } from "./group.service";
import { GroupProvider, useGroupContext } from "./GroupContext";
import type { HeaderConfig } from "@/components/main/Header";
import { useEffect } from "react";

export default function GroupData() {
  const { group } = useLoaderData<{ group: Promise<Group> }>();
  const { setHeaderConfig } = useOutletContext<{
    setHeaderConfig: (config: HeaderConfig) => void;
  }>();
  const { setCurrentGroup } = useGroupContext();

  useEffect(() => {
    group.then((g) => {
      setHeaderConfig({
        title: g.name,
        enableBackButton: true,
        backButtonLink: "/home",
      });
      setCurrentGroup(g);
    });
  }, []);

  return (
    <GroupProvider>
      <Outlet />
    </GroupProvider>
  );
}

export const groupLoader = ({
  params,
}: LoaderFunctionArgs): { group: Promise<Group> } => {
  const id = params.id;
  return {
    group: groupService.findById(id!!),
  };
};
