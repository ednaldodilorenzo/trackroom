// src/modules/music/MusicAdd.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MusicAdd, { load } from "./MusicAdd";
import { musicService } from "./music.service";
import groupService from "../group/group.service";

const navigateMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
const headerConfigMock = vi.fn();

let paramsValue: any = { id: "10" };
let locationValue: any = {
  state: { returnTo: "/groups/10/musics" },
};
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
          await cb(
            {
              name: "Song X",
              description: "Album Y",
            },
            e
          );
        },
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useParams: () => paramsValue,
    useLocation: () => locationValue,
    useNavigate: () => navigateMock,
    useLoaderData: () => ({ music: Promise.resolve(loaderMusicValue) }),
    Await: ({ resolve, children }: any) => {
      void resolve;
      return children(loaderMusicValue);
    },
  };
});

vi.mock("@/hooks/useHeaderConfig", () => ({
  useHeaderConfig: (...args: any[]) => headerConfigMock(...args),
}));

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

    paramsValue = { id: "10" };
    locationValue = {
      state: { returnTo: "/groups/10/musics" },
    };
    loaderMusicValue = null;
    isValidValue = true;
    isSubmittingValue = false;

    (groupService.addMusic as any).mockResolvedValue({
      id: 99,
      uploadUrl: "https://upload.example/signed",
    });

    (musicService.update as any).mockResolvedValue({
      id: 55,
      uploadUrl: "https://upload.example/update-signed",
    });

    (musicService.uploadFile as any).mockResolvedValue(undefined);
    (musicService.confirmFileUpload as any).mockResolvedValue(undefined);
  });

  it("calls useHeaderConfig with returnTo and resetOnUnmount=false", () => {
    render(<MusicAdd />);

    expect(headerConfigMock).toHaveBeenCalledTimes(1);
    expect(headerConfigMock).toHaveBeenCalledWith(
      {
        backButtonLink: "/groups/10/musics",
      },
      false
    );
  });

  it("renders create mode fields and submit button", () => {
    render(<MusicAdd />);

    expect(screen.getByText("Informações")).toBeInTheDocument();
    expect(screen.getByText("Arquivo de áudio")).toBeInTheDocument();

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Álbum")).toBeInTheDocument();
    expect(screen.getByText("Escolher arquivo")).toBeInTheDocument();

    expect(screen.getByTestId("file-input")).toBeInTheDocument();
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
    paramsValue = { id: "10", musicId: "99" };

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

    expect(
      screen.getByRole("button", { name: "Cadastrar música" })
    ).toBeDisabled();
  });

  it("disables submit button when form is submitting", () => {
    isSubmittingValue = true;

    render(<MusicAdd />);

    expect(
      screen.getByRole("button", { name: "Cadastrar música" })
    ).toBeDisabled();
  });

  it("navigates to returnTo on cancel", async () => {
    locationValue = {
      state: { returnTo: "/groups/77/musics" },
    };

    render(<MusicAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/groups/77/musics");
  });

  it("create submit: calls groupService.addMusic, uploads file, confirms upload, shows success and navigates to returnTo", async () => {
    render(<MusicAdd />);

    const user = userEvent.setup();

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: "Cadastrar música" }));

    expect(groupService.addMusic).toHaveBeenCalledTimes(1);
    expect(groupService.addMusic).toHaveBeenCalledWith(10, {
      name: "Song X",
      description: "Album Y",
      file: "",
      groupId: 10,
    });

    expect(musicService.update).not.toHaveBeenCalled();

    expect(musicService.uploadFile).not.toHaveBeenCalled();
    expect(musicService.confirmFileUpload).not.toHaveBeenCalled();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Música cadastrada com sucesso!"
    );
    expect(navigateMock).toHaveBeenCalledWith("/groups/10/musics");
  });

  it("edit submit: calls musicService.update, uploads file, confirms upload, shows success and navigates to returnTo", async () => {
    loaderMusicValue = {
      id: 55,
      name: "Old Song",
      description: "Old Album",
    };
    paramsValue = { id: "10", musicId: "55" };

    render(<MusicAdd />);

    const user = userEvent.setup();

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["abc"], "song.mp3", { type: "audio/mpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(musicService.update).toHaveBeenCalledTimes(1);
    expect(musicService.update).toHaveBeenCalledWith(55, {
      name: "Song X",
      description: "Album Y",
      file: "",
      groupId: 10,
    });

    expect(groupService.addMusic).not.toHaveBeenCalled();
    
    expect(musicService.uploadFile).not.toHaveBeenCalled();
    expect(musicService.confirmFileUpload).not.toHaveBeenCalled();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Música atualizada com sucesso!"
    );
    expect(navigateMock).toHaveBeenCalledWith("/groups/10/musics");
  });

  it("does not upload/confirm when file is empty", async () => {
    render(<MusicAdd />);

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Cadastrar música" }));

    expect(groupService.addMusic).toHaveBeenCalledTimes(1);
    expect(musicService.uploadFile).not.toHaveBeenCalled();
    expect(musicService.confirmFileUpload).not.toHaveBeenCalled();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Música cadastrada com sucesso!"
    );
    expect(navigateMock).toHaveBeenCalledWith("/groups/10/musics");
  });

  it("401 error: does not show generic error toast and does not navigate", async () => {
    (groupService.addMusic as any).mockRejectedValueOnce({ status: 401 });

    render(<MusicAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cadastrar música" }));

    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("non-401 error: shows generic error toast and does not navigate", async () => {
    (groupService.addMusic as any).mockRejectedValueOnce({ status: 500 });

    render(<MusicAdd />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cadastrar música" }));

    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Não foi possível salvar a música."
    );
    expect(navigateMock).not.toHaveBeenCalled();
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