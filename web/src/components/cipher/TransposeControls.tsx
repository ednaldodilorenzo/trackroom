interface TransposeControlsProps {
  up: () => void;
  down: () => void;
  reset: () => void;
}

export default function TransposeControls({
  up,
  down,
  reset,
}: TransposeControlsProps) {
  return (
    <div className="flex gap-2 mb-3">
      <button
        className="bg-primary text-on-primary px-3 py-1 rounded-md"
        onClick={up}
      >
        + Tom
      </button>
      <button
        className="bg-primary text-on-primary px-3 py-1 rounded-md"
        onClick={down}
      >
        – Tom
      </button>
      <button
        className="bg-secondary text-on-secondary px-3 py-1 rounded-md"
        onClick={reset}
      >
        Reset
      </button>
    </div>
  );
}
