import type { Group } from "@/model";
import homeService from "./home.service";

export const groupsLoader = () => ({
  groups: homeService.getGroups(),
});

export type HomeLoaderData = {
  groups: Promise<Group[]>;
};
