import { useEffect, useRef, useState } from "react";
import { BiCheck, BiSearch, BiTimeFive } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components";
import type { Group } from "@/model";
import groupService from "@/modules/group/group.service";
import { useHeaderConfig } from "@/hooks/useHeaderConfig";

const PAGE_SIZE = 10;

export default function GroupSearch() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [groups, setGroups] = useState<Group[]>([]);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [requestingGroupId, setRequestingGroupId] = useState<
        number | string | null
    >(null);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const normalizedQuery = query.trim();

    const hasMore = page + 1 < totalPages;

    useHeaderConfig({
        title: "Buscar grupos",
        enableBackButton: true,
        backButtonLink: `/`,
    });

    /*
     * Nova pesquisa.
     *
     * O debounce evita uma request para cada tecla digitada.
     */
    useEffect(() => {
        if (normalizedQuery.length < 2) {
            setGroups([]);
            setPage(0);
            setTotalPages(0);
            return;
        }

        const timeout = window.setTimeout(() => {
            searchFirstPage(normalizedQuery);
        }, 400);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [normalizedQuery]);

    /*
     * Observa o final da lista.
     */
    useEffect(() => {
        const element = loadMoreRef.current;

        if (!element || !hasMore || isLoading || isLoadingMore) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    loadNextPage();
                }
            },
            {
                rootMargin: "200px",
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [
        page,
        totalPages,
        normalizedQuery,
        isLoading,
        isLoadingMore,
    ]);

    async function searchFirstPage(term: string) {
        try {
            setIsLoading(true);

            const result = await groupService.searchGroups(term, {
                page: 0,
                size: PAGE_SIZE,
            });

            setGroups(result.content);
            setPage(result.number ?? 0);
            setTotalPages(result.totalPages ?? 0);
        } catch {
            toast.error("Não foi possível buscar os grupos.");

            setGroups([]);
            setPage(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    }

    async function loadNextPage() {
        if (
            isLoading ||
            isLoadingMore ||
            !hasMore ||
            normalizedQuery.length < 2
        ) {
            return;
        }

        const nextPage = page + 1;

        try {
            setIsLoadingMore(true);

            const result = await groupService.searchGroups(
                normalizedQuery,
                {
                    page: nextPage,
                    size: PAGE_SIZE,
                }
            );

            setGroups((current) => {
                /*
                 * Evita duplicação caso uma página seja carregada
                 * mais de uma vez por algum motivo.
                 */
                const existingIds = new Set(
                    current.map((group) => group.id)
                );

                const newGroups = result.content.filter(
                    (group) => !existingIds.has(group.id)
                );

                return [...current, ...newGroups];
            });

            setPage(result.number ?? nextPage);
            setTotalPages(result.totalPages ?? 0);
        } catch {
            toast.error(
                "Não foi possível carregar mais grupos."
            );
        } finally {
            setIsLoadingMore(false);
        }
    }

    async function handleRequestMembership(
        group: Group
    ) {
        if (!group.id || requestingGroupId) {
            return;
        }

        try {
            setRequestingGroupId(group.id);

            await groupService.requestMembership(
                Number(group.id)
            );

            setGroups((current) =>
                current.map((item) =>
                    item.id === group.id
                        ? {
                            ...item,
                            membershipStatus: "PENDING",
                        }
                        : item
                )
            );

            toast.success("Solicitação enviada!");
        } catch {
            toast.error(
                "Não foi possível enviar a solicitação."
            );
        } finally {
            setRequestingGroupId(null);
        }
    }

    function handleOpenGroup(
        group: Group
    ) {
        if (
            !group.id ||
            group.membershipStatus !== "MEMBER"
        ) {
            return;
        }

        navigate(`/groups/${group.id}/home`);
    }

    const myGroups = groups.filter(
        (group) =>
            group.membershipStatus === "MEMBER"
    );

    const otherGroups = groups.filter(
        (group) =>
            group.membershipStatus !== "MEMBER"
    );

    return (
        <div className="space-y-6 pb-8">
            <section className="bg-white rounded-3xl shadow-sm p-5">
                <h2 className="section-title mb-0">
                    Encontrar grupos
                </h2>

                <p className="text-sm text-gray-500 mt-1 mb-4">
                    Encontre um grupo pelo nome e solicite sua
                    participação.
                </p>

                <div className="relative">
                    <input
                        type="search"
                        value={query}
                        onChange={(event) =>
                            setQuery(event.target.value)
                        }
                        placeholder="Digite o nome do grupo"
                        autoFocus
                        className="
              w-full h-12 rounded-xl
              border border-gray-300
              bg-white px-4 pr-11
              outline-none
              focus:ring-2
              focus:ring-violet-500
              focus:border-violet-500
            "
                    />

                    <BiSearch
                        size={22}
                        className="
              absolute right-3 top-1/2
              -translate-y-1/2
              text-gray-500
              pointer-events-none
            "
                    />
                </div>
            </section>

            {normalizedQuery.length < 2 && (
                <InitialState />
            )}

            {normalizedQuery.length >= 2 &&
                isLoading && (
                    <LoadingState />
                )}

            {normalizedQuery.length >= 2 &&
                !isLoading &&
                groups.length === 0 && (
                    <EmptyState query={query} />
                )}

            {!isLoading && myGroups.length > 0 && (
                <GroupResultSection title="Seus grupos">
                    {myGroups.map((group) => (
                        <MemberGroupCard
                            key={group.id}
                            group={group}                            
                            onClick={() =>
                                handleOpenGroup(group)
                            }
                        />
                    ))}
                </GroupResultSection>
            )}

            {!isLoading &&
                otherGroups.length > 0 && (
                    <GroupResultSection title="Outros grupos">
                        {otherGroups.map((group) => (
                            <AvailableGroupCard
                                key={group.id}
                                group={group}
                                isRequesting={
                                    requestingGroupId === group.id
                                }
                                onRequest={() =>
                                    handleRequestMembership(group)
                                }
                            />
                        ))}
                    </GroupResultSection>
                )}

            {groups.length > 0 && (
                <div
                    ref={loadMoreRef}
                    className="min-h-16 flex items-center justify-center py-4"
                >
                    {isLoadingMore && (
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span
                                className="
                  w-5 h-5 rounded-full
                  border-2 border-violet-200
                  border-t-violet-700
                  animate-spin
                "
                            />

                            Carregando mais grupos...
                        </div>
                    )}

                    {!hasMore &&
                        !isLoadingMore && (
                            <p className="text-xs text-gray-400">
                                Todos os grupos encontrados foram
                                carregados.
                            </p>
                        )}
                </div>
            )}
        </div>
    );
}

function GroupResultSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <h2 className="font-bold text-gray-900 mb-3 px-1">
                {title}
            </h2>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-100">
                {children}
            </div>
        </section>
    );
}

function MemberGroupCard({
    group,
    onClick,
}: {
    group: Group;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
        w-full flex items-center gap-3
        px-4 py-4 text-left
        hover:bg-gray-50 transition cursor-pointer
      "
        >
            <GroupAvatar group={group} />

            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">
                    {group.name}
                </p>

                <div className="flex items-center gap-1 mt-1 text-sm text-green-700">
                    <BiCheck size={17} />
                    Você participa deste grupo
                </div>
            </div>

            <span className="text-2xl text-gray-400">
                ›
            </span>
        </button>
    );
}

function AvailableGroupCard({
    group,
    isRequesting,
    onRequest,
}: {
    group: Group;
    isRequesting: boolean;
    onRequest: () => void;
}) {
    const pending = group.membershipStatus === "PENDING";

    return (
        <div className="flex items-center gap-3 px-4 py-4">
            <GroupAvatar group={group} />

            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">
                    {group.name}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                    {pending
                        ? "Aguardando aprovação"
                        : "Você ainda não participa"}
                </p>
            </div>

            {pending ? (
                <div
                    className="
            shrink-0 inline-flex items-center gap-1
            rounded-xl bg-gray-100
            px-3 py-2
            text-xs font-semibold text-gray-600
          "
                >
                    <BiTimeFive size={16} />
                    Solicitado
                </div>
            ) : (
                <Button
                    type="button"
                    disabled={isRequesting}
                    onClick={onRequest}
                >
                    {isRequesting ? "Enviando..." : "Solicitar"}
                </Button>
            )}
        </div>
    );
}

function GroupAvatar({ group }: { group: Group }) {
    return (
        <div
            className="
        w-12 h-12 rounded-2xl
        bg-violet-100 text-violet-700
        flex items-center justify-center
        text-xl font-bold shrink-0
      "
        >
            {getGroupInitial(group)}
        </div>
    );
}

function InitialState() {
    return (
        <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
            <div
                className="
          w-16 h-16 rounded-full
          bg-violet-100 text-violet-700
          mx-auto flex items-center justify-center
          mb-4
        "
            >
                <BiSearch size={30} />
            </div>

            <h3 className="font-bold text-lg text-gray-900">
                Encontre um grupo
            </h3>

            <p className="text-sm text-gray-500 mt-2">
                Digite pelo menos 2 caracteres para começar a busca.
            </p>
        </section>
    );
}

function LoadingState() {
    return (
        <section className="bg-white rounded-3xl shadow-sm px-6 py-8 text-center">
            <div
                className="
          w-8 h-8 rounded-full
          border-2 border-violet-200
          border-t-violet-700
          animate-spin
          mx-auto
        "
            />

            <p className="text-sm text-gray-500 mt-4">
                Buscando grupos...
            </p>
        </section>
    );
}

function EmptyState({ query }: { query: string }) {
    return (
        <section className="bg-white rounded-3xl shadow-sm px-6 py-10 text-center">
            <div
                className="
          w-16 h-16 rounded-full
          bg-gray-100 text-gray-400
          mx-auto flex items-center justify-center
          mb-4
        "
            >
                <BiSearch size={30} />
            </div>

            <h3 className="font-bold text-lg text-gray-900">
                Nenhum grupo encontrado
            </h3>

            <p className="text-sm text-gray-500 mt-2">
                Não encontramos grupos com o nome “{query}”.
            </p>
        </section>
    );
}

function getGroupInitial(group: Group) {
    const name = group.name?.trim();

    if (!name) return "♫";

    return name.charAt(0).toUpperCase();
}