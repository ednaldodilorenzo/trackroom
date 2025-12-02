import type { Music } from "./Music";

interface Group {
  id?: string;
  name: string;
  description: string;
  cover: string;
  active: boolean;
  musics?: Music[];
  isAdmin?: boolean;
}

export type { Group };
