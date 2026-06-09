interface Music {
  id?: number;
  name: string;
  description: string;
  file: string;
  groupId: number;
  selected?: boolean;
  uploaded?: boolean;
  category?: string;
  fileVersion?: number;
}

interface MusicMetaData {
  name: string;
  description: string;
  cipherUrl: string;
  uploadUrl: string;
  cipher?: string;
}

interface MusicLocalDBMetadata {
    id: number;
    version: number;
    downloadedAt: string;
    blob: Blob;
}

export type { Music, MusicMetaData, MusicLocalDBMetadata };
