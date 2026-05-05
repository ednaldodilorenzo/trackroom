import type { Music } from "./Music";

interface Playlist {
    id?: number;
    title: string;
    musicCount?: number;
    musics?: Music[];
}

export type { Playlist };