import { useCipher } from "@/hooks/useCipher";
import {
  Await,
  useLoaderData,
  useNavigate,
  useParams,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { BsCheckLg, BsFillPencilFill } from "react-icons/bs";
import { Suspense, useEffect, useState } from "react";
import { musicService } from "./music.service";
import { FallbackOverlay } from "@/components";
import type { MusicMetaData } from "@/model";
import CipherContent from "./CipherContent";

export default function MusicCipher() {
  const [toggleEditMode, setToggleEditMode] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { musicMetaData } = useLoaderData<{ musicMetaData: MusicMetaData }>();

  ("D Uma vela se acende Em Pra acesa ficar\n A7 Iluminando a  D escuridão");
  const { transposedCipher, up, down, reset, setPrincipal } = useCipher("");

  useEffect(() => {
    async function loadCipher() {
      try {
        const data = await musicMetaData;
        const response = await musicService.getMusicCipher(data.cipherUrl);
        setPrincipal(response); // ⬅️ Load into hook
      } catch (err) {
        console.error("Failed to load cipher:", err);
      }
    }

    loadCipher();
  }, [musicMetaData, setPrincipal]);

  const submit = useSubmit();

  function handleSaveCipher() {
    setToggleEditMode(!toggleEditMode);

    if (!toggleEditMode) {
      return;
    }

    submit({ cipher: transposedCipher }, { method: "post" });
  }

  return (
    <Suspense fallback={<FallbackOverlay />}>
      <Await resolve={musicMetaData}>
        {(loadedMeta) => (
          <div className="fixed inset-0 w-full h-full bg-white z-50 flex flex-col">
            {/* Header */}
            <div className="bg-surface text-on-surface p-4 flex justify-between items-center shadow-medium border-b border-border">
              <h2 className="text-xl font-bold">{loadedMeta.name}</h2>
              <button onClick={handleSaveCipher}>
                {toggleEditMode ? <BsCheckLg /> : <BsFillPencilFill />}
              </button>
              <button
                className="text-on-surface hover:text-primary transition"
                onClick={() => navigate(`/home/groups/${id}/musics`)}
              >
                ✕
              </button>
            </div>

            {!toggleEditMode && (
              <CipherContent
                loadedMeta={loadedMeta}
                setPrincipal={setPrincipal}
                transposedCipher={transposedCipher}
                up={up}
                down={down}
                reset={reset}
              />
            )}
            {toggleEditMode && (
              <>
                <textarea
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="min-h-full p-2"
                >
                  {transposedCipher}
                </textarea>
              </>
            )}
          </div>
        )}
      </Await>
    </Suspense>
  );
}

export const cipherLoader = ({
  params,
}: LoaderFunctionArgs): { musicMetaData: Promise<MusicMetaData> } => {
  const id = params.musicId;
  return {
    musicMetaData: musicService.getMusicMetaData(Number(id!)),
  };
};

export async function action({ request, params }: ActionFunctionArgs) {
  const data = await request.formData();
  const id = params.musicId;
  const payload = data.get("cipher")?.toString();
  await musicService.uploadCipher(Number(id), payload!!);
  return null;
}
