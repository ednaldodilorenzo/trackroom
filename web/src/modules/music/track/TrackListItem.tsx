import { useAudioPlayerContext } from "@/components/player/AudioPlayerContext";
import SuspendedMenu from "@/components/suspendedmenu/SuspendedMenu";
import TrackItem from "@/components/trackitem/TrackItem";
import { useLoading } from "@/hooks/useLoading";
import type { Music } from "@/model";
import groupService from "@/modules/group/group.service";
import { useGroupContext } from "@/modules/group/GroupContext";
import toast from "react-hot-toast";
import { useRevalidator } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface TrackListItemProps {
    music: Music;
    handlePlay: (music: Music) => void;
}


export default function TrackListItem({ music, handlePlay }: TrackListItemProps) {

    const { currentTrack } = useAudioPlayerContext();
    const { revalidate } = useRevalidator();
    const navigate = useNavigate();
    const { currentGroup } = useGroupContext();
    const { show, hide } = useLoading();

    return (
        <div className="track-list" key={music.id}>
            <TrackItem
                active={currentTrack.id === music.id}
                onClick={() => handlePlay(music)}
                canPlay={music.fileVersion !== null && music.fileVersion !== undefined}
                cipherLink={`/groups/${currentGroup.id}/musics/${music.id}/cipher`}
                {...music}
            >
                {currentGroup.isAdmin && (<SuspendedMenu>
                    <SuspendedMenu.Item
                        label="Editar"
                        onClick={() => navigate(`/groups/${currentGroup.id}/musics/${music.id}`, {
                            state: {
                                returnTo: `/groups/${currentGroup.id}/musics`,
                            },
                        })}
                    />
                    <SuspendedMenu.Item
                        label="Excluir"
                        onClick={() => {
                            if (confirm("Tem certeza que deseja excluir esta música?")) {
                                show();
                                groupService.deleteGroupMusic(parseInt(currentGroup.id!), music.id!).then(() => {
                                    toast.success("Música excluída com sucesso!");
                                    revalidate();
                                }).finally(() => {
                                    hide();
                                });
                            }
                        }}
                    />
                </SuspendedMenu>)}
            </TrackItem>
        </div>
    );
}