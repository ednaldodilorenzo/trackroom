import { Suspense, useEffect, useState } from "react";
import {
  Await,
  useLoaderData,
  useNavigate,
  useParams,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { BsCheckLg, BsFillPencilFill, BsXLg } from "react-icons/bs";

import { FallbackOverlay } from "@/components";
import { useCipher } from "@/hooks/useCipher";
import { useWakeLock } from "@/hooks/useWakeLock";
import { musicService } from "./music.service";
import type { MusicMetaData } from "@/model";
import CipherContent from "./CipherContent";

export default function MusicCipher() {
  const [editMode, setEditMode] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const submit = useSubmit();

  useWakeLock(true);

  const { musicMetaData } = useLoaderData() as {
    musicMetaData: Promise<MusicMetaData>;
  };

  const { transposedCipher, up, down, reset, setPrincipal } = useCipher("");

  function handleClose() {
    navigate(`/groups/${id}/musics`);
  }

  function handleEdit() {
    setEditMode(true);
  }

  function handleSave() {
    submit({ cipher: transposedCipher }, { method: "post" });
    setEditMode(false);
  }

  return (
    <Suspense fallback={<FallbackOverlay />}>
      <Await resolve={musicMetaData}>
        {(loadedMeta: MusicMetaData) => (
          <div className="fixed inset-0 z-50 flex flex-col bg-white">
            <header className="h-16 bg-violet-700 text-white flex items-center gap-3 px-4 shadow-md">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">
                  {loadedMeta.name}
                </h1>
                <p className="text-xs text-white/75">
                  {editMode ? "Editando cifra" : "Visualizando cifra"}
                </p>
              </div>

              <button
                type="button"
                onClick={editMode ? handleSave : handleEdit}
                aria-label={editMode ? "salvar cifra" : "editar cifra"}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                {editMode ? <BsCheckLg /> : <BsFillPencilFill />}
              </button>

              <button
                type="button"
                onClick={handleClose}
                aria-label="fechar cifra"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <BsXLg />
              </button>
            </header>

            <CipherBody
              loadedMeta={loadedMeta}
              editMode={editMode}
              transposedCipher={transposedCipher}
              setPrincipal={setPrincipal}
              up={up}
              down={down}
              reset={reset}
            />
          </div>
        )}
      </Await>
    </Suspense>
  );
}

function CipherBody({
  loadedMeta,
  editMode,
  transposedCipher,
  setPrincipal,
  up,
  down,
  reset,
}: {
  loadedMeta: MusicMetaData;
  editMode: boolean;
  transposedCipher: string;
  setPrincipal: (cipher: string) => void;
  up: () => void;
  down: () => void;
  reset: () => void;
}) {
  useEffect(() => {
    setPrincipal(loadedMeta.cipher || "");
  }, [loadedMeta.cipher, setPrincipal]);

  if (editMode) {
    return (
      <textarea
        name="cipher"
        value={transposedCipher}
        onChange={(event) => setPrincipal(event.target.value)}
        className="flex-1 w-full resize-none overflow-y-auto bg-white p-4 font-mono text-[15px] leading-relaxed outline-none"
        placeholder="Digite a cifra da música..."
      />
    );
  }

  return (
    <CipherContent
      transposedCipher={transposedCipher}
      up={up}
      down={down}
      reset={reset}
    />
  );
}

export const cipherLoader = ({
  params,
}: LoaderFunctionArgs): { musicMetaData: Promise<MusicMetaData> } => {
  const id = params.musicId;

  return {
    musicMetaData: musicService.getMusicMetaData(Number(id!)).then((data) =>
      musicService
        .getMusicCipher(data.cipherUrl)
        .then((cipher) => {
          data.cipher = cipher;
          return data;
        })
        .catch(() => {
          data.cipher = "";
          return data;
        })
    ),
  };
};

export async function action({ request, params }: ActionFunctionArgs) {
  const data = await request.formData();
  const id = params.musicId;
  const payload = data.get("cipher")?.toString() ?? "";

  await musicService.uploadCipher(Number(id), payload);

  return null;
}