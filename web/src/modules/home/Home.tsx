import { Suspense } from "react";
import { Await, useLoaderData, useNavigate } from "react-router-dom";
import { BiPlus, BiSearch } from "react-icons/bi";

import { Button, FallbackOverlay } from "@/components";
import type { Group } from "@/model";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";
import "./Home.css";
import { type HomeLoaderData } from "./home.loader";

export default function Home() {
  const navigate = useNavigate();
  const { groups } = useLoaderData() as HomeLoaderData;

  useHeaderConfig({
    title: "Minha Biblioteca",
    enableBackButton: false,
  });

  function goToCreateGroup() {
    navigate("/groups/add");
  }

  function goToSearchGroups() {
    navigate("/groups/search");
  }

  function goToGroup(groupId: number | string | undefined) {
    if (!groupId) return;
    navigate(`/groups/${groupId}/home`);
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="bg-white rounded-3xl shadow-sm p-5">
        <h2 className="section-title mb-0">Meus grupos</h2>

        <p className="text-sm text-gray-500 mt-1 mb-4">
          Acesse músicas, playlists e cifras organizadas por grupo.
        </p>

        <button
          type="button"
          onClick={goToSearchGroups}
          className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 flex items-center gap-3 text-left hover:border-violet-400 hover:bg-violet-50/30 transition"
        >
          <BiSearch size={22} className="text-gray-500 shrink-0" />

          <span className="text-gray-500 flex-1">
            Buscar ou encontrar grupos
          </span>

          <span className="text-gray-400 text-xl">›</span>
        </button>
      </section>

      <Suspense fallback={<FallbackOverlay />}>
        <Await resolve={groups}>
          {(loadedGroups: Group[]) => (
            <GroupsContent
              groups={loadedGroups}
              onCreateGroup={goToCreateGroup}
              onOpenGroup={goToGroup}
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}

function GroupsContent({
  groups,
  onCreateGroup,
  onOpenGroup,
}: {
  groups: Group[];
  onCreateGroup: () => void;
  onOpenGroup: (groupId: number | string | undefined) => void;
}) {
  if (groups.length === 0) {
    return (
      <section className="grid grid-cols-1 gap-4">
        <EmptyGroupsState onCreateGroup={onCreateGroup} />
        <CreateGroupCard onClick={onCreateGroup} />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 gap-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onClick={() => onOpenGroup(group.id)}
        />
      ))}

      <CreateGroupCard onClick={onCreateGroup} />
    </section>
  );
}

function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="track-card"
      className="group min-h-[154px] cursor-pointer rounded-3xl bg-white shadow-sm border border-gray-100 p-4 text-left flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold shrink-0">
          {getGroupInitial(group)}
        </div>

        <span className="text-xs font-semibold text-violet-700 bg-violet-50 rounded-full px-2 py-1">
          Grupo
        </span>
      </div>

      <div className="mt-5">
        <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">
          {group.name}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          Músicas, playlists e cifras
        </p>
      </div>
    </button>
  );
}

function CreateGroupCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[154px] rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50/70 p-4 text-center flex flex-col items-center justify-center hover:bg-violet-100 hover:border-violet-300 transition"
    >
      <div className="w-12 h-12 rounded-2xl bg-violet-700 text-white flex items-center justify-center text-2xl shadow-sm mb-3">
        <BiPlus size={26} />
      </div>

      <h3 className="font-bold text-violet-800">Novo grupo</h3>
      <p className="text-sm text-violet-700/75 mt-1">Criar biblioteca</p>
    </button>
  );
}

function EmptyGroupsState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 mx-auto flex items-center justify-center text-3xl mb-4">
        ♫
      </div>

      <h3 className="font-bold text-lg text-gray-900">
        Nenhum grupo cadastrado
      </h3>
      <p className="text-sm text-gray-500 mt-2 mb-5">
        Crie seu primeiro grupo para organizar músicas, playlists e cifras.
      </p>

      <Button onClick={onCreateGroup}>
        <span className="inline-flex items-center gap-1">
          <BiPlus size={18} /> Criar grupo
        </span>
      </Button>
    </section>
  );
}

function getGroupInitial(group: Group) {
  const name = group.name?.trim();

  if (!name) return "♫";

  return name.charAt(0).toUpperCase();
}
