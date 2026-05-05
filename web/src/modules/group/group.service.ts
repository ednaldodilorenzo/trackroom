import type { Group, Music, Playlist, User } from "@/model";
import type { Page } from "@/model/Page";
import { Requester, request, type Params } from "@/utils/requester";
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

  getMusics = (groupId: number, params?: Params): Promise<Page<Music>> => {
    return this.get<Page<Music>>(`/${groupId}/musics`, params).then((resp) => resp.data);
  }

  addMusic = (groupId: number, data: Music): Promise<{ id: number; uploadUrl: string }> =>
    this.post<{ id: number; uploadUrl: string }, Music>(data, {}, "/v1/groups", `/${groupId}/musics`).then(
      (resp) => resp.data
    );

  getPlaylists = (groupId: number, params?: Params): Promise<Page<Playlist>> => 
    this.get<Page<Playlist>>(`/${groupId}/playlists`, params).then((resp) => resp.data);

  addPlaylist = (groupId: number, data: Playlist): Promise<Playlist> =>
    this.post<Playlist, Playlist>(data, {}, "/v1/groups", `/${groupId}/playlists`).then(
      (resp) => resp.data
    );
  

  deleteGroupMusic = (groupId: number, musicId: number) => this.delete(`/${groupId}/musics/${musicId}`);

  getGroupPlaylistWithMusics = (groupId: number, playlistId: number): Promise<Playlist> =>
    this.get<Playlist>(`/${groupId}/playlists/${playlistId}`, { withMusics: true }).then((resp) => resp.data);
}

export default new GroupService(request);
