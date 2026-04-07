import { useAudioPlayerContext } from "./AudioPlayerContext";

export default function TrackInfo() {
  function shortenText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength - 3) + "...";
  }

  const { currentTrack } = useAudioPlayerContext();
  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="font-bold lg:truncate lg:max-w-64">
          {shortenText(currentTrack.title, 12)}
        </p>
        <p className="text-sm text-gray-400">{currentTrack.author}</p>
      </div>
    </div>
  );
}
