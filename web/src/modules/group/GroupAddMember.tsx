import { AsyncMultiCheckSelect, Button } from "@/components";
import type { AsyncSelectItem } from "@/components/asyncmultiselect/AsyncMultiSelect";
import { useState } from "react";
import { userService } from "@/modules/user/user.service";
import { useGroupContext } from "./GroupContext";
import groupService from "./group.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function GroupAddMember() {
    const [selectedMembers, setSelectedMembers] = useState<AsyncSelectItem[]>([]);
    const { currentGroup } = useGroupContext();
    const navigate = useNavigate();

    function handleConfirm() {
        groupService.addGroupMembers(parseInt(currentGroup.id!!), selectedMembers.map((item) => ({ id: parseInt(String(item.id)), name: item.label }))).then(() => {
            toast.success("Membros adicionados com sucesso!");
            setSelectedMembers([]);
            navigate(`/groups/${currentGroup.id}/info`); // Redirect to group info page after adding members
        }).catch(() => {
            toast.error("Erro ao adicionar membros.");
        });
    }

    return <>
        <h2 className="section-title">Adicionar Membros</h2>
        <AsyncMultiCheckSelect
            label="Membros"
            value={selectedMembers}
            onChange={setSelectedMembers}
            fetchOptions={
                (q) => userService.findAllNotInGroupByTerm(currentGroup.id!!, q).then((data) => data.map(value => ({ id: value.id!!, label: value.name })))
            }
        />
        <ul>
            {selectedMembers && selectedMembers.map(member => (<li>{member.label}</li>))}
        </ul>
        <Button
            className="suspended-button"
            onClick={handleConfirm}
        >
            Confirmar
        </Button>
    </>
}