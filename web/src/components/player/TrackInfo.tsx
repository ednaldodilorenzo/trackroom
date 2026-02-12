import { useAudioPlayerContext } from "./AudioPlayerContext";

export default function TrackInfo() {
  const { currentTrack } = useAudioPlayerContext();
  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="font-bold lg:truncate lg:max-w-64">
          {currentTrack.title}
        </p>
        <p className="text-sm text-gray-400">{currentTrack.author}</p>
      </div>
    </div>
  );
}
