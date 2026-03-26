import { Requester, request, type Params } from "@/utils/requester";
import { type AxiosInstance } from "axios";
import type { Music, MusicMetaData } from "@/model";

class MusicService extends Requester {
  constructor(instance: AxiosInstance) {
    super(instance, "/v1/musics");
  }

  getAll = (params: Params): Promise<Music[]> =>
    this.get<Music[]>("", params).then((resp) => resp.data);

  save = (data: Music): Promise<{ id: number; uploadUrl: string }> =>
    this.post<{ id: number; uploadUrl: string }, Music>(data).then(
      (resp) => resp.data
    );

  uploadFile = (url: string, file: File): Promise<string> =>
    this.putData<string, File>(url, file, {
      headers: {
        "Content-Type": file.type,
        "x-ms-blob-type": "BlockBlob",
      },
    }).then((resp) => resp.data);

  confirmFileUpload = (id: number): Promise<string> =>
    this.post<string, any>(null, {}, "/v1/musics", `/confirm/${id}`).then(
      (resp) => resp.data
    );

  getFileUrl = (id: number): Promise<string> =>
    this.get<string>(`/${id}/url`).then((resp) => resp.data);

  getMusicCipher = (url: string): Promise<string> =>
    this.get<string>("", {}, url).then((resp) => resp.data);

  getMusicMetaData = (id: number): Promise<MusicMetaData> =>
    this.get<MusicMetaData>(`/${id}/cipher`).then((resp) => resp.data);

  uploadCipher = (id:number, file: string): Promise<void> =>
    this.put<void, string>(file, `${id}/cipher`, {
      headers: {
        "Content-Type": "text/plain",
      },
    }).then((resp) => resp.data);
}

export const musicService = new MusicService(request);
