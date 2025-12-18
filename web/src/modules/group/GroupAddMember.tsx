import { AsyncMultiSelect } from "@/components";
import type { AsyncSelectItem } from "@/components/asyncmultiselect/AsyncMultiSelect";
import { useState } from "react";
import { userService } from "@/modules/user/user.service";

export default function GroupAddMember() {
    const [selectedMusics, setSelectedMusics] = useState<AsyncSelectItem[]>([]);

    return <>
        <h2 className="section-title">Novo Membro</h2>
        <AsyncMultiSelect
            label=""
            value={selectedMusics}
            onChange={setSelectedMusics}
            fetchOptions={
                (q) => userService.findAllByUsername(q).then((data) => data.map(value => ({ id: value.id!!, label: value.name })))
            }
        />
    </>
}