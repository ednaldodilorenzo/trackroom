import type { AxiosInstance } from "axios";
import { Requester, request } from "@/utils/requester";
import type { Group } from "@/model";

class HomeService extends Requester {
  constructor(instance: AxiosInstance) {
    super(instance, "/v1/groups");
  }

  getGroups = (): Promise<Group[]> =>
    this.get<Group[]>().then((resp) => resp.data);
}

const homeService = new HomeService(request);

export default homeService;
