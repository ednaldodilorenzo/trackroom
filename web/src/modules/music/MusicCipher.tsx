import { useCipher } from "@/hooks/useCipher";
import TransposeControls from "@/components/cipher/TransposeControls";
import {
  useLoaderData,
  useNavigate,
  useParams,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { BsCheckLg, BsFillPencilFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import { musicService } from "./music.service";

const CHORD_REGEX =
  /([A-G][#b]?m?(?:maj7|m7|7|sus4|sus2|dim|aug|°|º|add9|6|9|11|13)?(?:\/[A-G][#b]?)?)/g;

export default function MusicCipher() {
  const [toggleEditMode, setToggleEditMode] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const title = "Exemplo de Cifra";
  const { cipher } = useLoaderData<{ cipher: string }>();

  ("D Uma vela se acende Em Pra acesa ficar\n A7 Iluminando a  D escuridão");
  const { transposedCipher, up, down, reset, setPrincipal } = useCipher("");

  useEffect(() => {
    cipher.then((c) => {
      setPrincipal(c);
    });
  }, []);

  function parseCifraToHTML(cifra: string): string {
    return cifra.replace(/\n/g, "<br/>").replace(CHORD_REGEX, (_, chord) => {
      return `<span class="text-primary font-bold">${chord}</span>`;
    });
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-surface text-on-surface p-4 flex justify-between items-center shadow-medium border-b border-border">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={() => setToggleEditMode(!toggleEditMode)}>
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
        <>
          <TransposeControls up={up} down={down} reset={reset} />
          <div className="flex-1 overflow-y-auto bg-white text-on-surface p-4">
            <div
              className="font-mono whitespace-pre-wrap leading-relaxed text-[15px]"
              dangerouslySetInnerHTML={{
                __html: parseCifraToHTML(transposedCipher),
              }}
            />
          </div>
        </>
      )}
      {toggleEditMode && (
        <textarea
          onChange={(e) => setPrincipal(e.target.value)}
          className="min-h-full p-2"
        >
          {transposedCipher}
        </textarea>
      )}
    </div>
  );
}

export const cipherLoader = ({
  params,
}: LoaderFunctionArgs): { cipher: Promise<string> } => {
  const id = params.musicId;
  return {
    cipher: musicService.getMusicCipher(Number(id!)),
  };
};
