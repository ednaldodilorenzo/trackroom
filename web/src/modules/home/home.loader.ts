import homeService from "./home.service";

const groupsLoader = () => ({
  groups: homeService.getGroups(),
});

export default groupsLoader;
