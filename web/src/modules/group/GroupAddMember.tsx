import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BiPlus, BiUserPlus, BiX } from "react-icons/bi";

import { AsyncMultiCheckSelect, Button } from "@/components";
import type { AsyncSelectItem } from "@/components/asyncmultiselect/AsyncMultiSelect";
import { userService } from "@/modules/user/user.service";
import { useGroupContext } from "./GroupContext";
import groupService from "./group.service";

export default function GroupAddMember() {
  const [selectedMembers, setSelectedMembers] = useState<AsyncSelectItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentGroup } = useGroupContext();
  const navigate = useNavigate();

  const hasSelectedMembers = selectedMembers.length > 0;

  async function handleConfirm() {
    if (!currentGroup?.id || !hasSelectedMembers || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await groupService.addGroupMembers(
        Number(currentGroup.id),
        selectedMembers.map((item) => ({
          id: Number(item.id),
          name: item.label,
        }))
      );

      toast.success("Membros adicionados com sucesso!");
      setSelectedMembers([]);
      navigate(`/groups/${currentGroup.id}/info`);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;

      if (status === 401) {
        return err;
      }

      toast.error("Erro ao adicionar membros.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate(`/groups/${currentGroup?.id}/info`);
  }

  function removeSelectedMember(memberId: AsyncSelectItem["id"]) {
    setSelectedMembers((current) =>
      current.filter((member) => String(member.id) !== String(memberId))
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <main className="mb-4 pt-2 space-y-6">
        <section className="bg-white rounded-3xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-2xl">
              <BiUserPlus size={26} />
            </div>

            <div>
              <h2 className="font-bold text-lg text-gray-900">Selecionar membros</h2>
              <p className="text-sm text-gray-500">
                Busque usuários e selecione quem será adicionado ao grupo.
              </p>
            </div>
          </div>

          <AsyncMultiCheckSelect
            label="Membros"
            value={selectedMembers}
            onChange={setSelectedMembers}
            fetchOptions={(q) =>
              userService
                .findAllNotInGroupByTerm(currentGroup.id!!, q)
                .then((data) =>
                  data.map((value) => ({
                    id: value.id!!,
                    label: value.name,
                  }))
                )
            }
          />
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-lg text-gray-900">Selecionados</h2>
              <p className="text-sm text-gray-500">
                {selectedMembers.length} membro{selectedMembers.length !== 1 ? "s" : ""} selecionado{selectedMembers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {hasSelectedMembers ? (
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-full bg-violet-100 text-violet-800 pl-3 pr-2 py-2 text-sm font-medium"
                >
                  <span className="max-w-[190px] truncate">{member.label}</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedMember(member.id)}
                    className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center hover:bg-violet-300 transition"
                    aria-label={`Remover ${member.label}`}
                  >
                    <BiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-700 mx-auto flex items-center justify-center mb-3">
                <BiPlus size={24} />
              </div>
              <p className="font-semibold text-gray-800">Nenhum membro selecionado</p>
              <p className="text-sm text-gray-500 mt-1">
                Use o campo acima para buscar e selecionar membros.
              </p>
            </div>
          )}
        </section>
      </main>

      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-2xl">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="h-12 px-5 rounded-2xl font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Cancelar
          </button>

          <Button
            className="flex-1 h-12"
            onClick={handleConfirm}
            disabled={!hasSelectedMembers || isSubmitting}
          >
            {isSubmitting
              ? "Adicionando..."
              : `Adicionar (${selectedMembers.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}