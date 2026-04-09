import { BsFillPencilFill } from "react-icons/bs";
import { useGroupContext } from "./GroupContext";
import { Button, FallbackOverlay } from "@/components";
import { Await, Link, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router-dom";
import groupService from "./group.service";
import type { User } from "@/model/User";
import { Suspense, useState } from "react";
import ListItem from "@/components/listitem/ListItem";
import { BsArrowLeftSquare } from "react-icons/bs";
import toast from "react-hot-toast";
import { useLoading } from "@/hooks/useLoading";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";
import SuspendedMenu from "@/components/suspendedmenu/SuspendedMenu";


export default function GroupInfo() {
    const { currentGroup } = useGroupContext();
    const { users } = useLoaderData<{ users: Promise<User[]> }>();
    const navigate = useNavigate();
    const { show, hide } = useLoading();

    useHeaderConfig({
        title: currentGroup?.name ?? "Group",
        hidden: true, // hide header on this page since group name and description are already displayed here. Adjust as needed.
        // add other header props you support, e.g. leftAction/rightAction
    });

    return (
        <>
            <div className="flex flex-col items-center justify-between mb-8">
                <div className="flex justify-between w-full">
                    <Link
                        className="text-on-surface hover:text-primary transition"
                        to={`/groups/${currentGroup?.id}/musics`}
                    >
                        <BsArrowLeftSquare size="1.7em" />
                    </Link>
                    <Button><BsFillPencilFill /></Button>
                </div>
                <div className="w-full text-center">
                    <p className="font-bold page-title">{currentGroup?.name}</p>
                    <p className="text-sm text-gray-400">{currentGroup?.description}</p>
                </div>

            </div>
            <div>
                <h2 className="section-title">Membros</h2>
                {currentGroup.isAdmin && (
                    <div className="my-6">
                        <Button className="me-2" onClick={() => navigate(`/groups/${currentGroup.id}/members/add`)}>+</Button> Adicionar novo membro
                    </div>
                )}
                <Suspense fallback={<FallbackOverlay />}>
                    <Await resolve={users}>
                        {(loadedUsers) => {
                            const [groupUsers, setGroupUsers] = useState<User[]>(loadedUsers);

                            function updateUserRole(userId: number, isAdmin: boolean) {
                                setGroupUsers((prevUsers) =>
                                    prevUsers.map((user) =>
                                        user.id === userId ? { ...user, isAdmin } : user
                                    )
                                );
                            }

                            return <>
                                {groupUsers && groupUsers.length > 0 ? (
                                    groupUsers.map((loadedUser) => <ListItem key={loadedUser.id} title={loadedUser.name} description={loadedUser.userName} detail={loadedUser.isAdmin ? "Administrador" : "Membro"}>
                                        {currentGroup.isAdmin && (loadedUser.isAdmin ? (<SuspendedMenu>
                                            <SuspendedMenu.Item label="Tornar membro" onClick={() => {
                                                show();
                                                groupService.demoteFromAdmin(parseInt(currentGroup.id!!), loadedUser.id!!).then(() => {
                                                    updateUserRole(loadedUser.id!!, false);
                                                    toast.success("Usuário removido dos administradores com sucesso!")
                                                }).catch((error) => {
                                                    toast.error(error.response.data.detail);
                                                }).finally(() => hide());
                                            }} />
                                            <SuspendedMenu.Item label="Remover do grupo" onClick={() => {
                                                show();
                                                groupService.removeMemberFromGroup(parseInt(currentGroup.id!!), loadedUser.id!!).then(() => {
                                                    setGroupUsers((prevUsers) =>
                                                        prevUsers.filter((user) => user.id !== loadedUser.id)
                                                    );
                                                    toast.success("Usuário removido do grupo com sucesso!")
                                                }).catch((error) => {
                                                    toast.error(error.response.data.detail);
                                                }).finally(() => hide());
                                            }} />
                                        </SuspendedMenu>) : (<SuspendedMenu>
                                            <SuspendedMenu.Item label="Promover a administrador" onClick={() => {
                                                show();
                                                groupService.promoteToAdmin(parseInt(currentGroup.id!!), loadedUser.id!!).then(() => {
                                                    updateUserRole(loadedUser.id!!, true);
                                                    toast.success("Usuário promovido a administrador com sucesso!")
                                                }).catch((error) => {
                                                    toast.error(error.response.data.detail);
                                                }).finally(() => hide());
                                            }} />
                                            <SuspendedMenu.Item label="Remover do grupo" onClick={() => {
                                                show();
                                                groupService.removeMemberFromGroup(parseInt(currentGroup.id!!), loadedUser.id!!).then(() => {
                                                    setGroupUsers((prevUsers) =>
                                                        prevUsers.filter((user) => user.id !== loadedUser.id)
                                                    );
                                                    toast.success("Usuário removido do grupo com sucesso!")
                                                }).catch((error) => {
                                                    toast.error(error.response.data.detail);
                                                }).finally(() => hide());
                                            }} />
                                        </SuspendedMenu>))}
                                    </ListItem>)) : (
                                    <p className="text-center text-gray-500">Nenhum membro encontrado.</p>
                                )}
                            </>
                        }}
                    </Await>
                </Suspense>
            </div>
        </>
    );
}

export const loader = ({ params }: LoaderFunctionArgs) => {
    const id = params.id;
    return {
        users: groupService.findUsersByGroupId(id!!),
    };
};