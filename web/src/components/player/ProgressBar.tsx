import { useAudioPlayerContext } from "./AudioPlayerContext";
import { formatTime } from "@/utils/format";
import "./ProgressBar.css";

export const ProgressBar = () => {
    const { progressBarRef, audioRef, timeProgress, duration, setTimeProgress } = useAudioPlayerContext();
    const handleProgressChange = () => {
        if (audioRef.current && progressBarRef.current) {
            const newTime = Number(progressBarRef.current.value);
            audioRef.current.currentTime = newTime;
            setTimeProgress(newTime);
            // if progress bar changes while audio is on pause
            progressBarRef.current.style.setProperty(
                '--range-progress',
                `${(newTime / duration) * 100}%`
            );
        }
    };

    return (
        <div className="flex items-center justify-center gap-5 w-full">
            <span>{formatTime(timeProgress)}</span>
            <input ref={progressBarRef} onChange={handleProgressChange} className="max-w-[80%] bg-gray-300" type="range" />
            <span>{formatTime(duration)}</span>
        </div>
    );
};