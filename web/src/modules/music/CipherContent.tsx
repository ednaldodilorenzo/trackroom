import TransposeControls from "@/components/cipher/TransposeControls";
import type { MusicMetaData } from "@/model";
import { useEffect } from "react";
import { musicService } from "./music.service";

type CipherContentProps = {
  loadedMeta: MusicMetaData;
  setPrincipal: (cipher: string) => void;
  transposedCipher: string;
  up: () => void;
  down: () => void;
  reset: () => void;
};

const CHORD_REGEX =
  /(?:\[([A-G][#b]?m?(?:maj7|m7|7|sus4|sus2|dim|aug|°|º|add9|6|9|11|13|M7|7M)?(?:\/[A-G][#b]?)?(?:\([^)]+\))?)\])/g;

export default function CipherContent({
  loadedMeta,
  setPrincipal,
  transposedCipher,
  up,
  down,
  reset,
}: CipherContentProps) {
  useEffect(() => {
    if (!loadedMeta?.cipherUrl) return;

    async function loadCipher() {
      try {
        const response = await musicService.getMusicCipher(
          loadedMeta.cipherUrl
        );
        //const text = await response.text();
        setPrincipal(response);
      } catch (err) {
        console.error("Failed to load cipher:", err);
      }
    }

    loadCipher();
  }, [loadedMeta, setPrincipal]);

  function parseCifraToHTML(cifra: string): string {
    return cifra.replace(/\n/g, "<br/>").replace(CHORD_REGEX, (_, chord) => {
      return `<span class="text-primary font-bold">${chord}</span>`;
    });
  }

  return (
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
  );
}
