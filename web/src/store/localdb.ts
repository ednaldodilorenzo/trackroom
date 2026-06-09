import type { MusicLocalDBMetadata } from "@/model";
import Dexie from "dexie";

class LocalDB extends Dexie {
    musics!: Dexie.Table<MusicLocalDBMetadata, number>;

    constructor() {
        super("TrackRoomLocalDB");
        this.version(1).stores({
            musics: "id"
        });
    }
}

export const localDB = new LocalDB();