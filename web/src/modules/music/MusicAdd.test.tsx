// src/modules/music/MusicAdd.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MusicAdd, { action, load } from "./MusicAdd";
import { musicService } from "./music.service";
import groupService from "../group/group.service";

const navigateMock = vi.fn();
const submitMock = vi.fn();

let paramsIdValue = "10";
let loaderMusicValue: any = null;
let isValidValue = true;
let isSubmittingValue = false;

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    formState: {
      isValid: isValidValue,
      isSubmitting: isSubmittingValue,
    },
    handleSubmit:
      (cb: any) =>
        async (e?: any) => {
          e?.preventDefault?.();
          await cb({}, e);
        },
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useParams: () => ({ id: paramsIdValue }),
    useNavigate: () => navigateMock,
    useSubmit: () => submitMock,
    useLoaderData: () => ({ music: Promise.resolve(loaderMusicValue) }),
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderMusicValue);
    },
  };
});

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("react-hot-toast", () => ({
  default: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}));

vi.mock("@/components", () => ({
  TextField: ({ label, name }: any) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} />
    </div>
  ),
  FallbackOverlay: () => <div data-testid="fallback">Loading...</div>,
}));

vi.mock("./music.service", () => ({
  musicService: {
    update: vi.fn(),
    uploadFile: vi.fn(),
    confirmFileUpload: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock("../group/group.service", () => ({
  default: {
    addMusic: vi.fn(),
  },
}));

describe("<MusicAdd />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paramsIdValue = "10";
    loaderMusicValue = null;
    isValidValue = true;
    isSubmittingValue = false;
  });

  it("renders create mode fields and submit button", () => {
    render(<MusicAdd />);

    expect(screen.getByText("Informações")).toBeInTheDocument();
    expect(screen.getByText("Arquivo de áudio")).toBeInTheDocument();

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Álbum")).toBeInTheDocument();

    expect(screen.getByText("Escolher arquivo")).toBeInTheDocument();

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cadastrar música" })
    ).toBeInTheDocument();
  });

  it("renders edit mode submit button and edit file hint", () => {
    loaderMusicValue = {
      id: 99,
      name: "Song X",
      description: "Album Y",
    };

    render(<MusicAdd />);

    expect(
      screen.getByRole("button", { name: "Salvar alterações" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Ao editar, envie um novo arquivo somente se desejar substituir o áudio atual."
      )
    ).toBeInTheDocument();
  });

  it("disables submit button when form is invalid", () => {
    isValidValue = false;

    render(<MusicAdd />);

    expect(screen.getByRole("button", { name: "Cadastrar música" })).toBeDisabled();
  });

  it("disables submit button when form is submitting", () => {
    isSubmittingValue = true;

    render(<MusicAdd />);

    expect(screen.getByRole("button", { name: "Cadastrar música" })).toBeDisabled();
  });

  it("navigates back to musics list on cancel", async () => {
    paramsIdValue = "77";

    render(<MusicAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/groups/77/musics");
  });

  it("submits FormData via useSubmit with multipart options", async () => {
    render(<MusicAdd />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Nome"), "Song X");
    await user.type(screen.getByLabelText("Álbum"), "Album Y");

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: "Cadastrar música" }));

    expect(submitMock).toHaveBeenCalledTimes(1);

    const [fd, options] = submitMock.mock.calls[0];

    expect(options).toEqual({
      method: "post",
      encType: "multipart/form-data",
    });

    expect(fd).toBeInstanceOf(FormData);
    expect((fd as FormData).get("name")).toBe("Song X");
    expect((fd as FormData).get("description")).toBe("Album Y");
    expect((fd as FormData).has("file")).toBe(true);
  });
});

describe("MusicAdd.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create: calls groupService.addMusic, uploads file, confirms, shows toast and redirects", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");

    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    fd.set("file", file);

    (groupService.addMusic as any).mockResolvedValueOnce({
      id: 99,
      uploadUrl: "https://upload.example/signed",
    });

    const request = { formData: async () => fd } as any;

    const result = await action({ request, params: { id: "10" } } as any);

    expect(groupService.addMusic).toHaveBeenCalledTimes(1);
    expect(groupService.addMusic).toHaveBeenCalledWith(10, {
      name: "Song X",
      description: "Album Y",
      file: "song.mp3",
      groupId: 10,
    });

    expect(musicService.update).not.toHaveBeenCalled();

    expect(musicService.uploadFile).toHaveBeenCalledWith(
      "https://upload.example/signed",
      file
    );

    expect(musicService.confirmFileUpload).toHaveBeenCalledWith(99);

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Música cadastrada com sucesso!"
    );

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);

    // matches current implementation
    expect(result.headers.get("Location")).toBe("/groups/1/musics");
  });

  it("edit: calls musicService.update, uploads file, confirms, shows toast and redirects", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");

    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    fd.set("file", file);

    (musicService.update as any).mockResolvedValueOnce({
      id: 55,
      uploadUrl: "https://upload.example/update-signed",
    });

    const request = { formData: async () => fd } as any;

    const result = await action({
      request,
      params: { id: "10", musicId: "55" },
    } as any);

    expect(musicService.update).toHaveBeenCalledTimes(1);
    expect(musicService.update).toHaveBeenCalledWith(55, {
      name: "Song X",
      description: "Album Y",
      file: "song.mp3",
      groupId: 10,
    });

    expect(groupService.addMusic).not.toHaveBeenCalled();

    expect(musicService.uploadFile).toHaveBeenCalledWith(
      "https://upload.example/update-signed",
      file
    );

    expect(musicService.confirmFileUpload).toHaveBeenCalledWith(55);

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Música atualizada com sucesso!"
    );

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/groups/1/musics");
  });

  it("does not upload/confirm when file is empty", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");

    const emptyFile = new File([], "empty.mp3", { type: "audio/mpeg" });
    fd.set("file", emptyFile);

    (groupService.addMusic as any).mockResolvedValueOnce({
      id: 99,
      uploadUrl: "https://upload.example/signed",
    });

    const request = { formData: async () => fd } as any;

    const result = await action({ request, params: { id: "10" } } as any);

    expect(groupService.addMusic).toHaveBeenCalledTimes(1);
    expect(musicService.uploadFile).not.toHaveBeenCalled();
    expect(musicService.confirmFileUpload).not.toHaveBeenCalled();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Música cadastrada com sucesso!"
    );

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/groups/1/musics");
  });

  it("does not throw when file is missing; saves with empty file field", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");

    (groupService.addMusic as any).mockResolvedValueOnce({
      id: 99,
      uploadUrl: "https://upload.example/signed",
    });

    const request = { formData: async () => fd } as any;

    const result = await action({ request, params: { id: "10" } } as any);

    expect(groupService.addMusic).toHaveBeenCalledWith(10, {
      name: "Song X",
      description: "Album Y",
      file: "",
      groupId: 10,
    });

    expect(musicService.uploadFile).not.toHaveBeenCalled();
    expect(musicService.confirmFileUpload).not.toHaveBeenCalled();

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);
  });

  it("returns error when create throws { status: 401 }", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");

    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    fd.set("file", file);

    (groupService.addMusic as any).mockRejectedValueOnce({ status: 401 });

    const request = { formData: async () => fd } as any;

    const result = await action({ request, params: { id: "10" } } as any);

    expect(result).toEqual({ status: 401 });
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("returns error when update throws { status: 401 }", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");

    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    fd.set("file", file);

    (musicService.update as any).mockRejectedValueOnce({ status: 401 });

    const request = { formData: async () => fd } as any;

    const result = await action({
      request,
      params: { id: "10", musicId: "55" },
    } as any);

    expect(result).toEqual({ status: 401 });
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("non-401 error: shows error toast and returns null", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");

    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    fd.set("file", file);

    (groupService.addMusic as any).mockRejectedValueOnce({ status: 500 });

    const request = { formData: async () => fd } as any;

    const result = await action({ request, params: { id: "10" } } as any);

    expect(result).toBeNull();
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Não foi possível salvar a música."
    );
  });
});

describe("MusicAdd.load", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null music promise when musicId is absent", async () => {
    const result = await load({ params: { id: "10" } } as any);

    expect(result).toHaveProperty("music");
    await expect(result.music).resolves.toBeNull();
    expect(musicService.getById).not.toHaveBeenCalled();
  });

  it("returns musicService.getById when musicId exists", async () => {
    const fakePromise = Promise.resolve({
      id: 99,
      name: "Song X",
      description: "Album Y",
    });

    (musicService.getById as any).mockReturnValueOnce(fakePromise);

    const result = await load({
      params: { id: "10", musicId: "99" },
    } as any);

    expect(musicService.getById).toHaveBeenCalledTimes(1);
    expect(musicService.getById).toHaveBeenCalledWith(99);
    expect(result.music).toBe(fakePromise);
  });
});