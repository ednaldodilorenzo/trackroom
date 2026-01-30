import TransposeControls from "@/components/cipher/TransposeControls";
import type { MusicMetaData } from "@/model";

type CipherContentProps = {
  loadedMeta: MusicMetaData;
  setPrincipal: (cipher: string) => void;
  transposedCipher: string;
  up: () => void;
  down: () => void;
  reset: () => void;
};

const CHORD_REGEX =
  /(?<!\[)([A-G][#b]?m?(?:maj7|m7|7|sus4|sus2|dim|aug|°|º|add9|6|9|11|13|M7|7M)?(?:\/[A-G][#b]?)?(?:\([^)]+\))?)(?!\])/g;

const INSIDE_BRACKETS_REGEX = /\[[^\]]*\]/g;

export default function CipherContent({
  loadedMeta,
  setPrincipal,
  transposedCipher,
  up,
  down,
  reset,
}: CipherContentProps) {
  setPrincipal(loadedMeta.cipher || "");

  function parseCifraToHTML(cifra: string): string {
    return cifra.replace(/\n/g, "<br/>").replace(CHORD_REGEX, (_, chord) => {
      return `<span class="text-primary font-bold">${chord}</span>`;
    }).replace(INSIDE_BRACKETS_REGEX, (match) => {
      return match.slice(1, -1);
    });
  }

  return (
    <>
      <TransposeControls up={up} down={down} reset={reset} />

      <div className="flex-1 overflow-y-auto bg-white text-on-surface p-4">

        <div
          className="font-mono whitespace-pre-wrap leading-relaxed text-[15px]"
          dangerouslySetInnerHTML={{
            __html: "<pre>" + parseCifraToHTML(transposedCipher) + "</pre>",
          }}
        />

      </div>
    </>
  );
}
