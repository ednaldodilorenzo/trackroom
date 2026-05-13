interface Music {
  id?: number;
  name: string;
  description: string;
  file: string;
  groupId: number;
  selected?: boolean;
  uploaded?: boolean;
}

interface MusicMetaData {
  name: string;
  description: string;
  cipherUrl: string;
  uploadUrl: string;
  cipher?: string;
}

export type { Music, MusicMetaData };
