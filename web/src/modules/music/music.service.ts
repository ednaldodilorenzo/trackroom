import { Requester, request } from "@/utils/requester";
import { type AxiosInstance } from "axios";
import type { Music, MusicMetaData } from "@/model";
import { localDB } from "@/store/localdb";

class MusicService extends Requester {
  constructor(instance: AxiosInstance) {
    super(instance, "/v1/musics");
  }

  getById = (id: number): Promise<Music> =>
    this.get<Music>(`/${id}`).then((resp) => resp.data);

  save = (data: Music): Promise<{ id: number; uploadUrl: string }> =>
    this.post<{ id: number; uploadUrl: string }, Music>(data).then(
      (resp) => resp.data
    );

  update = (id: number, data: Music): Promise<{ id: number; uploadUrl: string }> =>
    this.patch<{ id: number; uploadUrl: string }, Music>(data, `/${id}`).then((resp) => resp.data);

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

  getFileUrl = async (id: number, fileVersion?: number): Promise<string> => {
    const localMusic = await localDB.musics.get(id);    
    if (localMusic && localMusic.blob && localMusic.version === fileVersion) {
      const url = URL.createObjectURL(localMusic.blob);
      return url;
    }    
    const fileUrl = await this.get<string>(`/${id}/url`);
    const response = await fetch(fileUrl.data);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    await localDB.musics.put({
      id,
      version: fileVersion || 0,
      downloadedAt: new Date().toISOString(),
      blob,
    });
    return url;
  }

  getMusicCipher = (url: string): Promise<string> =>
    this.get<string>("", {}, url).then((resp) => resp.data);

  getMusicMetaData = (id: number): Promise<MusicMetaData> =>
    this.get<MusicMetaData>(`/${id}/cipher`).then((resp) => resp.data);

  uploadCipher = (id: number, file: string): Promise<void> =>
    this.put<void, string>(file, `${id}/cipher`, {
      headers: {
        "Content-Type": "text/plain",
      },
    }).then((resp) => resp.data);
}

export const musicService = new MusicService(request);
