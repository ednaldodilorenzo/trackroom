import { type AxiosInstance } from "axios";
import { request, Requester, type Params } from "@/utils/requester";
import type { Page } from "@/model/Page";
import type { Playlist } from "@/model";

class PlaylistService extends Requester {
    constructor(instance: AxiosInstance) {
        super(instance, "/v1/playlists");
    }

    getPlaylists = (groupId: number, params?: Params) => this.get<Page<Playlist>>(`/${groupId}`, params).then((resp) => resp.data);
}

export default new PlaylistService(request);