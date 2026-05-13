// src/modules/playlist/PlaylistAdd.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlaylistAdd, { action } from "./PlaylistAdd";
import groupService from "../group/group.service";

// -------------------- mocks --------------------
const submitMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

let isValidValue = true;

vi.mock("react-hook-form", () => ({
    useForm: () => ({
        control: {},
        formState: {
            isValid: isValidValue,
        },
        handleSubmit:
            (cb: any) =>
                async (e?: any) => {
                    e?.preventDefault?.();
                    await cb({
                        title: "Minha Playlist",
                    });
                },
    }),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
    );

    return {
        ...actual,
        useSubmit: () => submitMock,
    };
});

vi.mock("react-hot-toast", () => ({
    default: {
        success: (...args: any[]) => toastSuccessMock(...args),
        error: (...args: any[]) => toastErrorMock(...args),
    },
}));

vi.mock("@/components", () => ({
    TextField: ({ label, name, "data-testid": testId }: any) => (
        <div>
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} data-testid={testId} />
        </div>
    ),
}));

vi.mock("../group/group.service", () => ({
    default: {
        addPlaylist: vi.fn(),
    },
}));

// -------------------- component tests --------------------
describe("<PlaylistAdd />", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isValidValue = true;
    });

    it("renders form fields and submit button", () => {
        render(<PlaylistAdd />);

        expect(screen.getByText("Informações")).toBeInTheDocument();
        expect(screen.getByLabelText("Nome da playlist")).toBeInTheDocument();
        expect(screen.getByTestId("field-title")).toBeInTheDocument();

        expect(screen.getByText("Descrição (opcional)")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Ex: Músicas para momento de adoração")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Após criar a playlist, você poderá adicionar músicas a ela."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Criar playlist" })
        ).toBeInTheDocument();
    });

    it("disables submit button when form is invalid", () => {
        isValidValue = false;

        render(<PlaylistAdd />);

        expect(
            screen.getByRole("button", { name: "Criar playlist" })
        ).toBeDisabled();
    });

    it("enables submit button when form is valid", () => {
        isValidValue = true;

        render(<PlaylistAdd />);

        expect(
            screen.getByRole("button", { name: "Criar playlist" })
        ).not.toBeDisabled();
    });

    it("submits form data using useSubmit with method post", async () => {
        render(<PlaylistAdd />);

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Criar playlist" }));

        expect(submitMock).toHaveBeenCalledTimes(1);
        expect(submitMock).toHaveBeenCalledWith(
            {
                title: "Minha Playlist",
            },
            { method: "post" }
        );
    });
});

// -------------------- action tests --------------------
describe("PlaylistAdd.action", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls groupService.addPlaylist, shows success toast, and redirects", async () => {
        (groupService.addPlaylist as any).mockResolvedValueOnce(undefined);

        const form = new FormData();
        form.set("title", "Playlist 1");

        const request = { formData: async () => form } as any;

        const result = await action({
            request,
            params: { id: "10" },
        } as any);

        expect(groupService.addPlaylist).toHaveBeenCalledTimes(1);
        expect(groupService.addPlaylist).toHaveBeenCalledWith(10, {
            title: "Playlist 1",
        });

        expect(toastSuccessMock).toHaveBeenCalledWith(
            "Playlist criada com sucesso!"
        );
        expect(toastErrorMock).not.toHaveBeenCalled();

        expect(result).toBeInstanceOf(Response);
        expect(result.status).toBe(302);
        expect(result.headers.get("Location")).toBe("/groups/10/playlists");
    });

    it("returns error when service throws { status: 401 }", async () => {
        (groupService.addPlaylist as any).mockRejectedValueOnce({ status: 401 });

        const form = new FormData();
        form.set("title", "Playlist 1");

        const request = { formData: async () => form } as any;

        const result = await action({
            request,
            params: { id: "10" },
        } as any);

        expect(groupService.addPlaylist).toHaveBeenCalledWith(10, {
            title: "Playlist 1",
        });

        expect(result).toEqual({ status: 401 });
        expect(toastSuccessMock).not.toHaveBeenCalled();
        expect(toastErrorMock).not.toHaveBeenCalled();
    });

    it("shows error toast and still redirects on non-401 error", async () => {
        (groupService.addPlaylist as any).mockRejectedValueOnce({ status: 500 });

        const form = new FormData();
        form.set("title", "Playlist 1");

        const request = { formData: async () => form } as any;

        const result = await action({
            request,
            params: { id: "10" },
        } as any);

        expect(groupService.addPlaylist).toHaveBeenCalledWith(10, {
            title: "Playlist 1",
        });

        expect(toastSuccessMock).not.toHaveBeenCalled();
        expect(toastErrorMock).toHaveBeenCalledWith(
            "Erro ao criar playlist. Tente novamente."
        );

        // current implementation redirects even after non-401 error
        expect(result).toBeInstanceOf(Response);
        expect(result.status).toBe(302);
        expect(result.headers.get("Location")).toBe("/groups/10/playlists");
    });
});