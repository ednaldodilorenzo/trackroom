import type { Group, User } from "@/model";
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

  findUsersByGroupId = (id: string) =>
    this.get<User[]>(`/${id}/users`).then((resp) => resp.data);

  updateGroup = (id: number, data: Group) => this.put<Group, Group>(data, `${id}`).then((resp) => resp.data);

  addGroupMembers = (id: number, users: User[]) => this.post<void, User[]>(users, {}, "/v1/groups", `/${id}/members`);

  promoteToAdmin = (groupId: number, userId: number) => this.post<void, any>({}, {}, "/v1/groups", `/${groupId}/users/${userId}/admin`);

  demoteFromAdmin = (groupId: number, userId: number) => this.post<void, any>({}, {}, "/v1/groups", `/${groupId}/users/${userId}/member`);

  removeMemberFromGroup = (groupId: number, userId: number) => this.delete(`/${groupId}/members/${userId}`);
}

export default new GroupService(request);
