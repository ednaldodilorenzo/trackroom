import { Requester, request, type Params } from "@/utils/requester";
import { type AxiosInstance } from "axios";
import type { Music } from "@/model";

class MusicService extends Requester {
  constructor(instance: AxiosInstance) {
    super(instance, "/v1/musics");
  }

  getByGroup = (params: Params): Promise<Music[]> =>
    this.get<Music[]>("", params).then((resp) => resp.data);

  save = (data: Music): Promise<Music> =>
    this.post<Music, Music>(data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then((resp) => resp.data);
}

export const musicService = new MusicService(request);
