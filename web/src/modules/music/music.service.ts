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

  uploadFile = (url: string, file: File): Promise<string> =>
    this.putData<string, File>(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    }).then((resp) => resp.data);

  confirmFileUpload = (id: number): Promise<string> =>
    this.post<string, any>(null, {}, "/v1/musics", `/confirm/${id}`).then(
      (resp) => resp.data
    );

  getFileUrl = (id: number): Promise<string> =>
    this.get<string>(`/${id}/url`).then((resp) => resp.data);

  getMusicCipher = (id: number): Promise<string> =>
    this.get<string>(`/${id}/cipher`).then((resp) => resp.data);

  postMusicCipher = (id: number, cipher: string): Promise<void> =>
    this.post<void, string>(cipher, {}, "/v1/musics", `/${id}/cipher`).then(
      (resp) => resp.data
    );
}

export const musicService = new MusicService(request);
