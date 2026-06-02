import TransposeControls from "@/components/cipher/TransposeControls";

type CipherContentProps = {
  transposedCipher: string;
  up: () => void;
  down: () => void;
  reset: () => void;
};

const CHORD_REGEX =
  /(?<!\[)([A-G][#b]?m?(?:maj7|m7|7|sus4|sus2|dim|aug|°|º|add9|6|9|11|13|M7|7M)?(?:\/[A-G][#b]?)?(?:\([^)]+\))?)(?!\])/g;

const INSIDE_BRACKETS_REGEX = /\[[^\]]*\]/g;

export default function CipherContent({
  transposedCipher,
  up,
  down,
  reset,
}: CipherContentProps) {
  function parseCifraToHTML(cifra: string): string {
    return cifra
      .replace(/\n/g, "<br/>")
      .replace(CHORD_REGEX, (_, chord) => {
        return `<span class="text-violet-700 font-bold">${chord}</span>`;
      })
      .replace(INSIDE_BRACKETS_REGEX, (match) => {
        return match.slice(1, -1);
      });
  }

  return (
    <>
      <TransposeControls up={up} down={down} reset={reset} />

      <div className="flex-1 overflow-y-auto bg-white p-4">
        {transposedCipher.trim() ? (
          <div
            className="font-mono whitespace-pre-wrap leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{
              __html: `<pre>${parseCifraToHTML(transposedCipher)}</pre>`,
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-center px-6">
            <div>
              <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 mx-auto flex items-center justify-center text-3xl mb-4">
                ♫
              </div>
              <h2 className="font-bold text-lg text-gray-900">
                Nenhuma cifra cadastrada
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Toque no lápis para adicionar a cifra desta música.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}