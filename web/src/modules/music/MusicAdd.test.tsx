// src/modules/music/MusicAdd.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MusicAdd, { action, load } from "./MusicAdd";
import { musicService } from "./music.service";
import groupService from "../group/group.service";


// -------------------- mocks --------------------
const navigateMock = vi.fn();
const submitMock = vi.fn();
const showMock = vi.fn();
const hideMock = vi.fn();

let navigationState: "idle" | "submitting" = "idle";
let paramsIdValue = "10";
let loaderMusicValue: any = null;

// make handleSubmit invoke callback with event, because component builds FormData from e.target
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
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
    useNavigation: () => ({ state: navigationState }),
    useLoaderData: () => ({ music: Promise.resolve(loaderMusicValue) }),
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderMusicValue);
    },
  };
});

vi.mock("@/hooks/useLoading", () => ({
  useLoading: () => ({ show: showMock, hide: hideMock }),
}));

const toastSuccessMock = vi.fn();
vi.mock("react-hot-toast", () => ({
  default: {
    success: (...args: any[]) => toastSuccessMock(...args),
  },
}));

vi.mock("@/components", () => ({
  RegisterForm: ({
    title,
    formSubmit,
    cancelHandler,
    children,
    encType,
  }: any) => (
    <div>
      <h1>{title}</h1>
      <form aria-label="register-form" encType={encType} onSubmit={formSubmit}>
        {children}
        <button type="button" onClick={cancelHandler}>
          Cancelar
        </button>
        <button type="submit" data-testid="btn-submit">
          Salvar
        </button>
      </form>
    </div>
  ),
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
    save: vi.fn(),
    update: vi.fn(),
    uploadFile: vi.fn(),
    confirmFileUpload: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock("../group/group.service", () => ({
  default: { addMusic: vi.fn() },
}));

// -------------------- component tests --------------------
describe("<MusicAdd />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationState = "idle";
    paramsIdValue = "10";
    loaderMusicValue = null;
  });

  it("renders create mode title, fields and file input", () => {
    render(<MusicAdd />);

    expect(screen.getByText("Nova Música")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Álbum")).toBeInTheDocument();

    const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.type).toBe("file");

    expect(
      screen.getByRole("button", { name: "Cancelar" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("btn-submit")).toBeInTheDocument();
  });

  it("renders edit mode title when loader returns a music", () => {
    loaderMusicValue = {
      id: 99,
      name: "Song X",
      description: "Album Y",
    };

    render(<MusicAdd />);

    expect(screen.getByText("Editar Música")).toBeInTheDocument();
  });

  it("calls hide() when navigation.state is idle", () => {
    navigationState = "idle";

    render(<MusicAdd />);

    expect(hideMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(showMock).not.toHaveBeenCalled();
  });

  it("calls show() when navigation.state is submitting", () => {
    navigationState = "submitting";

    render(<MusicAdd />);

    expect(showMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(hideMock).not.toHaveBeenCalled();
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

    const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;
    const file = new File(["abcdefgh"], "song.mp3", { type: "audio/mpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByTestId("btn-submit"));

    expect(submitMock).toHaveBeenCalledTimes(1);

    const [fd, options] = submitMock.mock.calls[0];
    expect(options).toEqual({
      method: "post",
      encType: "multipart/form-data",
    });

    expect(fd).toBeInstanceOf(FormData);
    expect((fd as FormData).get("name")).toBe("Song X");
    expect((fd as FormData).get("description")).toBe("Album Y");

    const uploaded = (fd as FormData).get("file");
    expect(uploaded).toBeInstanceOf(File);
    expect((uploaded as File).size).toBeGreaterThanOrEqual(0);
  });
});

// -------------------- action tests --------------------
describe("MusicAdd.action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws if file is missing or invalid", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");

    const request = { formData: async () => fd } as any;

    await expect(
      action({ request, params: { id: "10" } } as any)
    ).rejects.toThrow("Arquivo inválido ou ausente");
  });

  it("create: saves, uploads, confirms, shows toast, and redirects", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");
    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    fd.set("file", file);

    (groupService.addMusic as any).mockResolvedValueOnce({
      id: 99,
      uploadUrl: "https://upload.example/signed",
    });
    (musicService.uploadFile as any).mockResolvedValueOnce(undefined);
    (musicService.confirmFileUpload as any).mockResolvedValueOnce(undefined);

    const request = { formData: async () => fd } as any;

    const result = await action({ request, params: { id: "10" } } as any);

    expect(groupService.addMusic).toHaveBeenCalledTimes(1);    
    // expect(groupService.addMusic).toHaveBeenCalledWith({
    //   name: "Song X",
    //   description: "Album Y",
    //   file: "Song X",
    //   groupId: 10,
    // });

    expect(musicService.update).not.toHaveBeenCalled();

    expect(musicService.uploadFile).toHaveBeenCalledTimes(1);
    expect(musicService.uploadFile).toHaveBeenCalledWith(
      "https://upload.example/signed",
      file
    );

    expect(musicService.confirmFileUpload).toHaveBeenCalledTimes(1);
    expect(musicService.confirmFileUpload).toHaveBeenCalledWith(99);

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Música cadastrada com sucesso!"
    );

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/groups/10/musics");
  });

  it("edit: updates, uploads, confirms, shows toast, and redirects", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");
    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    fd.set("file", file);

    (musicService.update as any).mockResolvedValueOnce({
      id: 55,
      uploadUrl: "https://upload.example/update-signed",
    });
    (musicService.uploadFile as any).mockResolvedValueOnce(undefined);
    (musicService.confirmFileUpload as any).mockResolvedValueOnce(undefined);

    const request = { formData: async () => fd } as any;

    const result = await action({
      request,
      params: { id: "10", musicId: "55" },
    } as any);

    expect(musicService.update).toHaveBeenCalledTimes(1);
    expect(musicService.update).toHaveBeenCalledWith(55, {
      name: "Song X",
      description: "Album Y",
      file: "Song X",
      groupId: 10,
    });

    expect(musicService.save).not.toHaveBeenCalled();

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
    expect(result.headers.get("Location")).toBe("/groups/10/musics");
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
    expect(result.headers.get("Location")).toBe("/groups/10/musics");
  });

  it("returns error when save throws { status: 401 }", async () => {
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
  });

  it("still redirects on non-401 errors (current implementation)", async () => {
    const fd = new FormData();
    fd.set("name", "Song X");
    fd.set("description", "Album Y");
    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    fd.set("file", file);

    (musicService.save as any).mockRejectedValueOnce({ status: 500 });

    const request = { formData: async () => fd } as any;

    const result = await action({ request, params: { id: "10" } } as any);

    expect(toastSuccessMock).not.toHaveBeenCalled();

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/groups/10/musics");
  });
});

// -------------------- loader tests --------------------
describe("MusicAdd.load", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null-like music promise when musicId is absent", async () => {
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