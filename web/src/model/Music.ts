interface Music {
  id?: number;
  name: string;
  description: string;
  file: string;
  groupId: number;
  selected?: boolean;
  uploaded?: boolean;
  category?: string;
}

interface MusicMetaData {
  name: string;
  description: string;
  cipherUrl: string;
  uploadUrl: string;
  cipher?: string;
}

export type { Music, MusicMetaData };
