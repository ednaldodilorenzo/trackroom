import { useCipher } from "@/hooks/useCipher";
import TransposeControls from "@/components/cipher/TransposeControls";
import { useNavigate, useParams } from "react-router-dom";

const CHORD_REGEX =
  /([A-G][#b]?m?(?:maj7|m7|7|sus4|sus2|dim|aug|°|º|add9|6|9|11|13)?(?:\/[A-G][#b]?)?)/g;

export default function MusicCipher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const title = "Exemplo de Cifra";
  const cipher =
    "D Uma vela se acende Em Pra acesa ficar\n A7 Iluminando a  D escuridão";
  const { transposedCipher, up, down, reset } = useCipher(cipher);

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

        <button
          className="text-on-surface hover:text-primary transition"
          onClick={() => navigate(`/home/groups/${id}/musics`)}
        >
          ✕
        </button>
      </div>

      <TransposeControls up={up} down={down} reset={reset} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white text-on-surface p-4">
        <div
          className="font-mono whitespace-pre-wrap leading-relaxed text-[15px]"
          dangerouslySetInnerHTML={{
            __html: parseCifraToHTML(transposedCipher),
          }}
        />
      </div>
    </div>
  );
}
