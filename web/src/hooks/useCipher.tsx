import { useState } from "react";

/**
 * Regex that matches:
 *  - [D], [Em7], [A/G], [F#m7(b5)]
 *  - D, Em7, A/G, F#m7(b5)
 * 
 * Group 1 = the chord without brackets
 * Group 2 = the bracket including original brackets
 */
const CHORD_REGEX =
  /(?<!\[)([A-G][#b]?m?(?:maj7|m7|7|sus4|sus2|dim|aug|°|º|add9|6|9|11|13|M7|7M)?(?:\/[A-G][#b]?)?(?:\([^)]+\))?)(?!\])/g;


function transposeChord(chord: string, steps: number): string {
  const parts = chord.split("/");

  const transposedParts = parts.map((part) => {
    const note = part.match(/[A-G][#b]?/);
    if (!note) return part;

    const NOTES_SHARP = [
      "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
    ];
    const NOTES_FLAT = [
      "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"
    ];

    const useFlat = note[0].includes("b");
    const NOTES = useFlat ? NOTES_FLAT : NOTES_SHARP;

    const index = NOTES.indexOf(note[0]);
    if (index === -1) return part;

    const transposedIndex = (index + steps + 12) % 12;
    return part.replace(note[0], NOTES[transposedIndex]);
  });

  return transposedParts.join("/");
}

function transposeCipher(cipher: string, steps: number): string {
  return cipher.replace(CHORD_REGEX, (match, chordInBrackets, chordPlain) => {
    const chord = chordInBrackets//; || chordPlain;

    if (!chord) return match;

    const transposed = transposeChord(chord, steps);

    // Restore brackets if they existed
    return transposed;
  });
}

export function useCipher(original: string) {
  const [steps, setSteps] = useState<number>(0);

  const [principal, setPrincipal] = useState<string>(original);

  const up = () => setSteps((prev) => prev + 1);
  const down = () => setSteps((prev) => prev - 1);
  const reset = () => setSteps(0);

  const transposedCipher = transposeCipher(principal.toString(), steps);

  return { transposedCipher, up, down, reset, setPrincipal, steps };
}
