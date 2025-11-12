import { Requester, request, type Params } from "@/utils/requester";
import { type AxiosInstance } from "axios";
import type { Music } from "@/model";

class MusicService extends Requester {
  constructor(instance: AxiosInstance) {
    super(instance, "/v1/musics");
  }

  getByGroup = (params: Params): Promise<Music[]> =>
    this.get<Music[]>("", params).then((resp) => resp.data);

  save = (data: Music): Promise<{ id: number; uploadUrl: string }> =>
    this.post<{ id: number; uploadUrl: string }, Music>(data).then(
      (resp) => resp.data
    );

  uploadFile = (url: string, file: File): Promise<String> =>
    this.putData<String, File>(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    }).then((resp) => resp.data);

  confirmFileUpload = (id: number): Promise<String> =>
    this.post<String, any>(null, {}, `/confirm/${id}`).then(
      (resp) => resp.data
    );
}

export const musicService = new MusicService(request);
