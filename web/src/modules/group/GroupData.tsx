import type { Group } from "@/model";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  //useNavigate,
  useOutletContext,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { groupService } from "./group.service";
import { useGroupContext } from "./GroupContext";
import type { HeaderConfig } from "@/components/main/Header";
import { useEffect } from "react";
import { Button } from "@/components";
import { BsFillPencilFill } from "react-icons/bs";

export default function GroupData() {
  const { group } = useLoaderData<{ group: Promise<Group> }>();
  const { setHeaderConfig } = useOutletContext<{
    setHeaderConfig: (config: HeaderConfig) => void;
  }>();
  const { setCurrentGroup } = useGroupContext();
  const navigate = useNavigate();

  useEffect(() => {
    group.then((g) => {
      setHeaderConfig({
        title: g.name,
        enableBackButton: true,
        backButtonLink: "/",
        children: <Button onClick={() => navigate(`/groups/${g.id}/edit`)}><BsFillPencilFill /></Button>
        // suspendedMenuProps: {
        //   items: [
        // {
        //   label: "Members",
        //   onClick: () => navigate(`/groups/${g.id}/members`),
        // },
        // { label: "Teste2", onClick: () => null },
        //   ],
        // },
      });
      setCurrentGroup(g);
    });
  }, []);

  return <Outlet />;
}

export const groupLoader = ({
  params,
}: LoaderFunctionArgs): { group: Promise<Group> } => {
  const id = params.id;
  return {
    group: groupService.findById(id!!),
  };
};
