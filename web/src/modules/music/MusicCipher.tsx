import { useCipher } from "@/hooks/useCipher";
import { BsXLg } from "react-icons/bs";
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
import { Suspense, useState } from "react";
import { musicService } from "./music.service";
import { FallbackOverlay } from "@/components";
import type { MusicMetaData } from "@/model";
import CipherContent from "./CipherContent";

export default function MusicCipher() {
  const [toggleEditMode, setToggleEditMode] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { musicMetaData } = useLoaderData<{ musicMetaData: MusicMetaData }>();

  const { transposedCipher, up, down, reset, setPrincipal } = useCipher("");

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
            <div className="header bg-surface text-on-surface p-4 flex justify-between items-center shadow-medium border-b border-border">
              <h2 className="text-xl font-bold">{loadedMeta.name}</h2>
              <button onClick={handleSaveCipher}>
                {toggleEditMode ? <BsCheckLg /> : <BsFillPencilFill />}
              </button>
              <button
                className="text-on-surface hover:text-primary transition"
                onClick={() => navigate(`/groups/${id}/musics`)}
              >
                <BsXLg title="Close Icon" />
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
                  name="cipher"
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="p-2 flex-1 overflow-y-auto bg-white text-on-surface p-4"
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
    musicMetaData: musicService.getMusicMetaData(Number(id!)).then(data =>
      musicService.getMusicCipher(data.cipherUrl).then((cipher) => {
        data.cipher = cipher;
        return data;
      }).catch(() => {
        data.cipher = "";
        return data;
      })
    ),
  };
};

export async function action({ request, params }: ActionFunctionArgs) {
  const data = await request.formData();
  const id = params.musicId;
  const payload = data.get("cipher")?.toString();
  await musicService.uploadCipher(Number(id), payload!!);
  return null;
}
