import type { Group } from "@/model";
import { Requester, request } from "@/utils/requester";
import { type AxiosInstance } from "axios";

class GroupService extends Requester {
  constructor(instance: AxiosInstance) {
    super(instance, "/v1/groups");
  }

  save = (data: Group) => this.post<Group, Group>(data);

  findByIdWithDependencies = (id: string) =>
    this.get<Group>(`/${id}`, { withDependencies: true }).then(
      (resp) => resp.data
    );

  findById = (id: string) =>
    this.get<Group>(`/${id}`).then((resp) => resp.data);
}

export const groupService = new GroupService(request);
