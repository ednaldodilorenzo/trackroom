interface Music {
  id?: number;
  name: string;
  description: string;
  file: string;
  groupId: number;
}

interface MusicMetaData {
  name: string;
  description: string;
  cipherUrl: string;
  uploadUrl: string;
}

export type { Music, MusicMetaData };
